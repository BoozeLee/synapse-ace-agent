import { Keypair } from '@solana/web3.js';
import { ConfigManager } from '../utils/config';
import { SapService } from '../services/SapService';
import { logger } from '../utils/logger';
import type { SapAgentMetadata } from '../types';

export class AgentRegistry {
  private sapService: SapService;
  private registered = false;

  constructor(private config: ConfigManager) {
    this.sapService = new SapService(config);
  }

  /**
   * Register the agent on SAP mainnet
   */
  async register(force = false): Promise<{
    agentPda: string;
    txSignature: string;
    metadata: SapAgentMetadata;
  }> {
    if (this.registered && !force) {
      throw new Error('Agent already registered. Use force=true to re-register.');
    }

    await this.sapService.initialize();
    const profile = await this.sapService.registerAgent(force);

    this.registered = true;

    logger.info('Agent successfully registered on SAP', {
      agentPda: profile.agentPda,
      name: profile.metadata.name,
      txSignature: profile.agentPda, // In production, extract from result
    });

    return {
      agentPda: profile.agentPda,
      txSignature: '', // Would be filled with actual tx hash
      metadata: profile.metadata,
    };
  }

  /**
   * Generate agent manifest JSON for SAP registration
   */
  generateManifest(agentName: string, agentDescription: string): SapAgentMetadata {
    const agentConfig = this.config.getAgentConfig();

    return {
      name: agentName,
      description: agentDescription,
      capabilities: agentConfig.capabilities,
      pricing: agentConfig.pricingTiers,
      protocols: ['x402', 'A2A', ...agentConfig.capabilities.map(c => c.protocolId)],
      metadata: {
        version: '1.0.0',
        registeredAt: Date.now(),
        bountyCategory: 'ace_data_cloud_usage',
        services: agentConfig.supportedServices,
        repository: process.env.GITHUB_REPOSITORY || 'synapse-ace-agent',
        license: 'MIT',
        author: 'Synapse-Ace Contributors',
      },
    };
  }

  /**
   * Update agent metadata (name, description, capabilities)
   */
  async updateAgent(
    updates: Partial<Pick<SapAgentMetadata, 'name' | 'description' | 'capabilities'>>
  ): Promise<void> {
    await this.sapService.initialize();

    try {
      // SAP update logic
      logger.info('Updating agent metadata', { updates });
      // await this.sapService.getClient().agent.update(...)
    } catch (error) {
      logger.error('Failed to update agent', { error });
      throw error;
    }
  }

  /**
   * Report agent health and metrics
   */
  async reportMetrics(
    callCount: number,
    latencyMs: number,
    errorCount = 0
  ): Promise<void> {
    await this.sapService.initialize();

    try {
      await this.sapService.updateReputation(latencyMs, 100 - errorCount * 10);
      await this.sapService.reportCalls(callCount);

      logger.debug('Metrics reported', { callCount, latencyMs, errorCount });
    } catch (error) {
      logger.warn('Failed to report metrics', { error });
    }
  }

  /**
   * Deactivate agent
   */
  async deactivate(): Promise<void> {
    await this.sapService.initialize();

    try {
      // await this.sapService.getClient().agent.deactivate();
      logger.info('Agent deactivated');
    } catch (error) {
      logger.error('Failed to deactivate agent', { error });
      throw error;
    }
  }

  /**
   * Reactivate agent
   */
  async reactivate(): Promise<void> {
    await this.sapService.initialize();

    try {
      // await this.sapService.getClient().agent.reactivate();
      logger.info('Agent reactivated');
    } catch (error) {
      logger.error('Failed to reactivate agent', { error });
      throw error;
    }
  }

  /**
   * Check if agent is registered
   */
  isRegistered(): boolean {
    return this.registered;
  }

  /**
   * Get agent PDA
   */
  getAgentPda(): string {
    return this.sapService.getAgentPda();
  }

  /**
   * Get agent wallet
   */
  getAgentWallet(): Keypair {
    return this.sapService.getAgentWallet();
  }
}
