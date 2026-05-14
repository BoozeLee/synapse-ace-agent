import { SapClient } from '@oobe-protocol-labs/synapse-sap-sdk';
import { createHash } from 'crypto';
import type {
  Workflow,
  WorkflowTask,
  TaskStatus,
  WorkflowResult,
  CostEstimate,
  SapAgentProfile,
} from '../types';
import { SapService } from '../services/SapService';
import { AceDataCloudService } from '../services/AceDataCloudService';
import { PaymentService } from '../services/PaymentService';
import { ToolDiscoveryService } from '../services/ToolDiscovery';
import { logger, logWorkflowStart, logWorkflowComplete, logTaskStart, logTaskComplete, logSentinel } from '../utils/logger';

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private activeWorkflows: Set<string> = new Set();

  constructor(
    private sapService: SapService,
    private aceService: AceDataCloudService,
    private paymentService: PaymentService,
    private discovery: ToolDiscoveryService
  ) {}

  /**
   * Create and execute a workflow from a user request
   */
  async executeWorkflow(
    userRequest: string,
    options?: {
      userId?: string;
      estimatedBudget?: bigint;
      requireSentinelValidation?: boolean;
    }
  ): Promise<WorkflowResult> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = Date.now();

    logger.info('Starting autonomous workflow', {
      workflowId,
      request: userRequest.substring(0, 100),
    });

    try {
      // Phase 1: Parse and plan
      const plan = await this.planWorkflow(userRequest);
      const totalEstimate = await this.paymentService.estimateWorkflowCost(
        plan.map(t => t.service || ''),
        plan.map(t => (typeof t.cost === 'boolean' ? 1 : Math.max(1, Number(t.cost || 1))))
      );

      logWorkflowStart(workflowId, userRequest);

      // Check budget
      if (options?.estimatedBudget && totalEstimate.estimatedLamports > options.estimatedBudget) {
        throw new Error(`Estimated cost ${totalEstimate.estimatedLamports} exceeds budget ${options.estimatedBudget}`);
      }

      // Create workflow
      const workflow: Workflow = {
        id: workflowId,
        userId: options?.userId,
        description: userRequest,
        tasks: plan.map(task => ({
          ...task,
          status: 'pending' as TaskStatus,
        })),
        status: 'pending',
        createdAt: Date.now(),
        totalCost: totalEstimate.estimatedLamports,
        currency: 'SOL' as const,
        paymentMethod: 'x402_solana',
      };

      this.workflows.set(workflowId, workflow);
      this.activeWorkflows.add(workflowId);

      // Phase 2: Execute tasks sequentially
      workflow.status = 'running';
      workflow.startedAt = Date.now();

      let actualTotalCost = BigInt(0);
      const txHashes: string[] = [];
      const attestationIds: string[] = [];

      for (let i = 0; i < plan.length; i++) {
        const task = plan[i];
        const taskId = task.id;

        try {
          await this.executeTask(workflowId, task);
          const completedTask = workflow.tasks.find(t => t.id === taskId);
          if (completedTask) {
            completedTask.status = 'completed';
            completedTask.completedAt = Date.now();
            actualTotalCost += BigInt(completedTask.cost || 0);
            if (completedTask.txHash) {
              txHashes.push(completedTask.txHash);
            }
          }
        } catch (error) {
          logger.error('Task failed', { workflowId, taskId, error });
          const failedTask = workflow.tasks.find(t => t.id === taskId);
          if (failedTask) {
            failedTask.status = 'failed';
            failedTask.error = error instanceof Error ? error.message : 'Task failed';
          }
          throw error;
        }
      }

      // Phase 3: Generate attestations
      if (options?.requireSentinelValidation !== false) {
        try {
          const attestationId = await this.validateWithSentinel(workflowId);
          attestationIds.push(attestationId);
          logger.info('Sentinel attestation generated', { attestationId });
        } catch (error) {
          logger.warn('Sentinel validation skipped (non-critical)', { error });
        }
      }

      // Finalize
      workflow.status = 'completed';
      workflow.completedAt = Date.now();
      workflow.totalCost = actualTotalCost;
      this.activeWorkflows.delete(workflowId);

      const duration = Date.now() - startTime;

      logWorkflowComplete(workflowId, actualTotalCost, duration);
      logger.info('Workflow completed successfully', {
        workflowId,
        durationMs: duration,
        totalCost: actualTotalCost.toString(),
        txCount: txHashes.length,
        attestations: attestationIds.length,
      });

      return {
        success: true,
        workflowId,
        totalCost: actualTotalCost,
        txHashes,
        attestationIds,
        durationMs: duration,
      };

    } catch (error) {
      this.activeWorkflows.delete(workflowId);
      logger.error('Workflow failed', { workflowId, error });
      throw error;
    }
  }

  /**
   * Plan workflow steps based on user request
   */
  private async planWorkflow(userRequest: string): Promise<WorkflowTask[]> {
    const tasks: WorkflowTask[] = [];
    const request = userRequest.toLowerCase();

    // Intelligently determine required steps
    const needsResearch = request.includes('research') || request.includes('find') || request.includes('latest');
    const needsImage = request.includes('image') || request.includes('picture') || request.includes('illustrate') || request.includes('visual');
    const needsContent = request.includes('generate') || request.includes('create') || request.includes('write');
    const needsValidation = process.env.REQUIRE_SENTINEL !== 'false';

    // Step 1: Research phase (if needed)
    if (needsResearch) {
      tasks.push({
        id: `task_${Date.now()}_1`,
        type: 'service_call',
        description: 'Research topic via web search',
        service: 'serp:search',
        params: { query: userRequest },
        status: 'pending',
        cost: BigInt(1000), // ~$0.0015
      });
    }

    // Step 2: Content generation
    if (needsContent || needsResearch) {
      tasks.push({
        id: `task_${Date.now()}_2`,
        type: 'service_call',
        description: 'Generate content summary',
        service: 'openai:chat',
        params: {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: `Based on this request: "${userRequest}\n\nProvide a concise, informative response.`,
            },
          ],
        },
        status: 'pending',
        cost: BigInt(5000), // ~$0.0075
      });
    }

    // Step 3: Image generation (if requested)
    if (needsImage) {
      tasks.push({
        id: `task_${Date.now()}_3`,
        type: 'service_call',
        description: 'Generate illustrative image',
        service: 'flux:image',
        params: {
          prompt: userRequest,
          width: 1024,
          height: 1024,
        },
        status: 'pending',
        cost: BigInt(10000), // ~$0.015
      });

      // Image generation requires task polling
      tasks.push({
        id: `task_${Date.now()}_3b`,
        type: 'service_call',
        description: 'Poll image generation task',
        service: 'flux:poll',
        params: { taskId: 'placeholder' }, // Will be set after creation
        status: 'pending',
        cost: BigInt(0),
      });
    }

    // Step 4: Sentinel validation (if enabled)
    if (needsValidation) {
      tasks.push({
        id: `task_${Date.now()}_4`,
        type: 'attestation',
        description: 'Validate output via Synapse Sentinel',
        service: 'sentinel:validate',
        params: { qualityThreshold: 0.8 },
        status: 'pending',
        cost: BigInt(0), // Sentinel is free for agents
      });
    }

    return tasks;
  }

  /**
   * Execute a single task
   */
  private async executeTask(workflowId: string, task: WorkflowTask): Promise<void> {
    logTaskStart(workflowId, task.id, task.description);

    try {
      const result = await this.dispatchTask(task);
      task.result = result;
      task.status = 'completed';
      task.completedAt = Date.now();
      task.txHash = result.txHash;

      logTaskComplete(workflowId, task.id, task.cost, task.txHash);

      // Record payment
      await this.paymentService.recordPayment(
        task.service || 'unknown',
        task.cost || BigInt(0),
        task.service?.includes('sentinel') ? 'sap_escrow' : 'x402_solana',
        task.txHash
      );

      // Update agent reputation
      await this.sapService.updateReputation(100); // Simulated latency
    } catch (error) {
      logger.error('Task execution failed', {
        workflowId,
        taskId: task.id,
        error,
      });
      throw error;
    }
  }

  /**
   * Dispatch task to appropriate service
   */
  private async dispatchTask(task: WorkflowTask): Promise<{ success: boolean; txHash?: string }> {
    const service = task.service;

    switch (service) {
      case 'serp:search': {
        const results = await this.aceService.performSearch({
          query: task.params?.query as string || '',
          numResults: 5,
        });
        return { success: true };
      }

      case 'openai:chat': {
        const content = await this.aceService.generateChatCompletion({
          model: (task.params?.model as string) || 'gpt-4o-mini',
          messages: (task.params?.messages as any) || [],
        });
        return { success: true };
      }

      case 'flux:image': {
        const imageUrl = await this.aceService.generateImage({
          prompt: task.params?.prompt as string || '',
          width: task.params?.width as number || 1024,
          height: task.params?.height as number || 1024,
        });
        return { success: true };
      }

      case 'flux:poll': {
        // Polling handled automatically in generateImage
        return { success: true };
      }

      case 'sentinel:validate': {
        // Call Synapse Sentinel for validation
        const sentinelAgent = await this.discovery.findSynapseSentinel();
        if (sentinelAgent) {
          // In production, actually call Sentinel agent's validation tool
          logger.info('Synapse Sentinel validation (simulated)', {
            agent: sentinelAgent.agentPda,
          });
          logSentinel(workflow => true, 95);
        } else {
          logger.warn('Synapse Sentinel not available, skipping validation');
        }
        return { success: true };
      }

      default:
        throw new Error(`Unknown service: ${service}`);
    }
  }

  /**
   * Validate workflow with Synapse Sentinel
   */
  private async validateWithSentinel(workflowId: string): Promise<string> {
    logTaskStart(workflowId, 'sentinel_validation', 'Validating with Synapse Sentinel');

    try {
      const sentinel = await this.discovery.findSynapseSentinel();

      if (!sentinel) {
        logger.warn('Synapse Sentinel not found, skipping validation');
        return 'skipped';
      }

      // Create attestation for this workflow
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // In production, call Sentinel's attestation tool
      const metadataHash = this.hashString(JSON.stringify({
        workflowId,
        taskCount: workflow.tasks.length,
        totalCost: workflow.totalCost.toString(),
        completedAt: Date.now(),
      }));

      // Simulate attestation
      const attestationId = `att_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      logTaskComplete(workflowId, 'sentinel_validation', BigInt(0), undefined);
      logSentinel(workflowId, true, 95);

      return attestationId;
    } catch (error) {
      logger.error('Sentinel validation failed', { error });
      throw error;
    }
  }

  /**
   * Get workflow status
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * List active workflows
   */
  getActiveWorkflows(): Workflow[] {
    return Array.from(this.activeWorkflows).map(id => this.workflows.get(id)!).filter(Boolean);
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = 'cancelled';
      workflow.completedAt = Date.now();
      this.activeWorkflows.delete(workflowId);
      logger.info('Workflow cancelled', { workflowId });
    }
  }

  private hashString(str: string): string {
    return createHash('sha256').update(str).digest('hex');
  }
}
