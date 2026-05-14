import { ConfigManager } from '../utils/config';
import { SapService } from '../services/SapService';
import { AceDataCloudService } from '../services/AceDataCloudService';
import { PaymentService } from '../services/PaymentService';
import { ToolDiscoveryService } from '../services/ToolDiscovery';
import { WorkflowEngine } from '../workflow/WorkflowEngine';
import { AttestationService } from '../attestation/AttestationService';
import { AgentRegistry } from './AgentRegistry';
import { logger, logWorkflowStart, logWorkflowComplete, logTaskStart, logTaskComplete } from '../utils/logger';
import type { WorkflowResult, SapAgentProfile } from '../types';

export class AceAutoAgent {
  private initializing: Promise<void> | null = null;
  private initialized = false;

  public readonly registry: AgentRegistry;
  public readonly sap: SapService;
  public readonly ace: AceDataCloudService;
  public readonly payment: PaymentService;
  public readonly discovery: ToolDiscoveryService;
  public readonly workflow: WorkflowEngine;
  public readonly attestation: AttestationService;

  constructor(private config: ConfigManager) {
    this.registry = new AgentRegistry(config);
    this.sap = new SapService(config);
    this.ace = new AceDataCloudService(config);
    this.discovery = new ToolDiscoveryService(config);
    this.payment = new PaymentService(config, this.sap);
    this.workflow = new WorkflowEngine(this.sap, this.ace, this.payment, this.discovery);
    this.attestation = new AttestationService(config, this.discovery);
  }

  /**
   * Initialize the agent (connect to all services)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!this.initializing) {
      this.initializing = this.doInitialize();
    }

    await this.initializing;
    this.initialized = true;
    logger.info('AceAutoAgent initialized and ready');
  }

  private async doInitialize(): Promise<void> {
    // Initialize services in order
    await this.sap.initialize();
    await this.ace.initialize();
    await this.discovery.initialize();
    await this.payment.initialize();
    await this.attestation.initialize();

    logger.info('All services initialized');
  }

  /**
   * Register agent on SAP (one-time setup)
   */
  async registerAgent(force = false): Promise<SapAgentProfile> {
    await this.initialize();
    return await this.registry.register(force);
  }

  /**
   * Execute a fully autonomous workflow
   */
  async runWorkflow(
    request: string,
    options?: {
      userId?: string;
      estimatedBudget?: bigint;
      requireSentinelValidation?: boolean;
      maxTasks?: number;
    }
  ): Promise<WorkflowResult> {
    await this.initialize();

    logger.info('Starting autonomous workflow', {
      request: request.substring(0, 80),
      options,
    });

    // Check available balance
    const escrowBalance = this.payment.getEscrowBalance();
    if (escrowBalance < BigInt(10000)) {
      logger.warn('Low escrow balance, topping up', { balance: escrowBalance.toString() });
      await this.payment.topUpEscrow(BigInt(1000000)); // Add 0.001 SOL
    }

    // Execute via workflow engine
    const result = await this.workflow.executeWorkflow(request, {
      userId: options?.userId,
      estimatedBudget: options?.estimatedBudget,
      requireSentinelValidation: options?.requireSentinelValidation,
    });

    // Report metrics
    const durationMs = result.durationMs;
    this.registry.reportMetrics(1, durationMs, result.success ? 0 : 1);

    return result;
  }

  /**
   * Quick content generation (convenience method)
   */
  async generateContent(
    prompt: string,
    includeImage = true,
    doResearch = true
  ): Promise<{
    text: string;
    imageUrl?: string;
    research?: Array<{ title: string; link: string; snippet: string }>;
    attestationId?: string;
  }> {
    const request = doResearch
      ? `Research: ${prompt}. Also create a summary and ${includeImage ? 'an image' : ''}.`
      : `Create content about ${prompt}. ${includeImage ? 'Include an image.' : ''}`;

    const result = await this.runWorkflow(request, {
      requireSentinelValidation: true,
    });

    // In production, you'd parse the actual output from workflow results
    // For demo purposes, return placeholder
    return {
      text: `Generated content based on: ${prompt}. (Full implementation would extract from workflow results)`,
      imageUrl: includeImage ? 'https://placeholder.image/generated.png' : undefined,
      research: doResearch ? [] : undefined,
      attestationId: result.attestationIds[0],
    };
  }

  /**
   * Get agent PDA (on-chain identity)
   */
  getAgentPda(): string {
    return this.sap.getAgentPda();
  }

  /**
   * Get agent profile from SAP
   */
  async getProfile(): Promise<SapAgentProfile> {
    await this.initialize();
    return await this.sap.getAgentProfile(this.sap.getAgentPda());
  }

  /**
   * Get current escrow balance
   */
  getEscrowBalance(): bigint {
    return this.payment.getEscrowBalance();
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    return this.payment.getPaymentStats();
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows() {
    return this.workflow.getActiveWorkflows();
  }

  /**
   * Top up escrow
   */
  async topUpEscrow(amountLamports: bigint = BigInt(1000000)): Promise<void> {
    await this.payment.topUpEscrow(amountLamports);
  }

  /**
   * Discover available tools (for demo purposes)
   */
  async discoverTools(): Promise<Array<{
    agentName: string;
    tools: Array<{ name: string; description: string; category: string }>;
  }>> {
    await this.initialize();
    return await this.discovery.discoverAllTools();
  }

  /**
   * Get sentinel info
   */
  async getSentinelInfo(): Promise<{ available: boolean; reputationScore?: number }> {
    await this.attestation.initialize();
    const agent = this.attestation.getSentinelAgent();
    return {
      available: !!agent,
      reputationScore: agent?.stats.reputationScore,
    };
  }
}
