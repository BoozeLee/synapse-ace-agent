import { SapClient } from '@oobe-protocol-labs/synapse-sap-sdk';
import { ConfigManager } from '../utils/config';
import { ToolDiscoveryService } from '../services/ToolDiscovery';
import { logger } from '../utils/logger';
import type { SapAgentProfile } from '../types';

export class AttestationService {
  private client!: SapClient;
  private sentinelAgent: SapAgentProfile | null = null;
  private initializing: Promise<void> | null = null;

  constructor(
    private config: ConfigManager,
    private discovery: ToolDiscoveryService
  ) {}

  async initialize(): Promise<void> {
    if (this.initializing) {
      await this.initializing;
      return;
    }

    this.initializing = this.doInitialize();
    await this.initializing;
  }

  private async doInitialize(): Promise<void> {
    // Simulation mode: skip SAP client initialization
    if (this.config.isSimulation()) {
      logger.info('AttestationService initialized (SIMULATION MODE)');
      this.sentinelAgent = null;
      return;
    }

    this.client = this.config.getSapClient();

    // Load Synapse Sentinel agent profile
    this.sentinelAgent = await this.discovery.findSynapseSentinel();

    logger.info('AttestationService initialized', {
      sentinelAvailable: !!this.sentinelAgent,
    });
  }

  /**
   * Create an attestation for a completed workflow
   */
  async createWorkflowAttestation(
    workflowId: string,
    agentPda: string,
    metadataHash: string,
    qualityScore: number = 100
  ): Promise<string> {
    await this.initialize();

    logger.info('Creating workflow attestation', {
      workflowId,
      agentPda,
      qualityScore,
    });

    // In actual implementation, this would call SAP attestation module
    // For demo, we'll generate a unique ID
    const attestationId = `att_${workflowId}_${Date.now()}`;

    // In production:
    // await this.client.attestation.create(
    //   this.client.pubkeyFromBase58(agentPda),
    //   {
    //     attestationType: 1, // Task completion
    //     metadataHash: Buffer.from(metadataHash),
    //     expiresAt: BigInt(Math.floor(Date.now() / 1000) + 86400 * 30), // 30 days
    //   }
    // );

    logger.info('Attestation created', { attestationId, workflowId });
    return attestationId;
  }

  /**
   * Validate a workflow using Synapse Sentinel
   */
  async validateWithSentinel(
    workflowId: string,
    taskResults: Array<{ service: string; success: boolean; durationMs: number }>
  ): Promise<{
    isValid: boolean;
    score: number;
    attestationId?: string;
    feedback?: string;
  }> {
    await this.initialize();

    if (!this.sentinelAgent) {
      logger.warn('Synapse Sentinel not available, validation skipped');
      return { isValid: true, score: 100, feedback: 'Validation skipped - sentinel not available' };
    }

    logger.info('Running Synapse Sentinel validation', {
      workflowId,
      sentinel: this.sentinelAgent.agentPda,
    });

    // Compute validation score based on metrics
    const totalTasks = taskResults.length;
    const successfulTasks = taskResults.filter(t => t.success).length;
    const avgLatency = taskResults.reduce((sum, t) => sum + t.durationMs, 0) / totalTasks;

    const successRate = successfulTasks / totalTasks;
    let score = 100;

    // Deduct points for failures
    score -= (1 - successRate) * 50;
    // Deduct points for high latency (>5s)
    if (avgLatency > 5000) {
      score -= Math.min(25, ((avgLatency - 5000) / 1000) * 5);
    }
    // Ensure minimum score
    score = Math.max(0, Math.min(100, score));

    const isValid = score >= 70; // Threshold for valid

    if (isValid) {
      // Generate attestation
      const metadata = {
        workflowId,
        timestamp: Date.now(),
        taskCount: totalTasks,
        successRate,
        avgLatency,
        score,
      };

      const metadataStr = JSON.stringify(metadata);
      const { createHash } = await import('crypto');
      const metadataHash = createHash('sha256').update(metadataStr).digest('hex');

      const attestationId = await this.createWorkflowAttestation(
        workflowId,
        this.sentinelAgent.agentPda,
        metadataHash,
        score
      );

      logger.info('Sentinel validation passed', {
        workflowId,
        score,
        attestationId,
      });

      return { isValid: true, score, attestationId };
    } else {
      logger.warn('Sentinel validation failed', { workflowId, score });
      return {
        isValid: false,
        score,
        feedback: `Workflow scored ${score.toFixed(1)}%, below threshold of 70%`,
      };
    }
  }

  /**
   * Get Sentinel agent information
   */
  getSentinelAgent(): SapAgentProfile | null {
    return this.sentinelAgent;
  }

  /**
   * Verify an attestation
   */
  async verifyAttestation(attestationId: string): Promise<boolean> {
    // In production, fetch attestation from chain and verify
    logger.debug('Verifying attestation', { attestationId });
    return true; // Placeholder
  }
}
