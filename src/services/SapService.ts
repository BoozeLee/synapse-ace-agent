import { Keypair, PublicKey } from '@solana/web3.js';
import { SapClient, SapConnection } from '@oobe-protocol-labs/synapse-sap-sdk';
import type {
  AgentMetadata,
  AgentStats,
  SapAgentProfile,
  SapAgentDiscoveryResult,
  EscrowAccountData,
} from '../types';
import { ConfigManager } from '../utils/config';
import { logger, logPayment, logDiscovery } from '../utils/logger';

export class SapService {
  private client: SapClient;
  private agentPda: string;
  private agentWallet: Keypair;
  private initialized = false;

  constructor(private config: ConfigManager) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Simulation mode: skip actual SAP connection
    if (this.config.isSimulation()) {
      logger.info('SAP Service initialized (SIMULATION MODE)');
      this.agentWallet = await this.config.getKeypair();
      // Generate a deterministic fake PDA for simulation
      this.agentPda = 'AgentSimulatedPDA' + Math.random().toString(36).substring(7);
      this.initialized = true;
      return;
    }

    const rpcUrl = this.config.getSapRpcUrl();
    const keypair = await this.config.getKeypair();

    // Create SAP connection
    const connection = SapConnection.mainnet(rpcUrl);
    this.client = connection.fromKeypair(keypair);
    this.agentWallet = keypair;

    // Derive agent PDA
    const { deriveAgent } = await import('@synapse-sap/sdk/pda');
    const [pda] = deriveAgent(keypair.publicKey);
    this.agentPda = pda.toBase58();

    logger.info('SAP Service initialized', {
      agentPda: this.agentPda,
      wallet: keypair.publicKey.toBase58(),
    });

    this.initialized = true;
  }

  getClient(): SapClient {
    if (!this.initialized) {
      throw new Error('SapService not initialized. Call initialize() first.');
    }
    return this.client;
  }

  getAgentPda(): string {
    return this.agentPda;
  }

  getAgentWallet(): Keypair {
    return this.agentWallet;
  }

  /**
   * Register the agent on SAP mainnet
   */
  async registerAgent(force = false): Promise<SapAgentProfile> {
    await this.initialize();
    const agentConfig = this.config.getAgentConfig();

    // Simulation mode: return mock registration
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Registering agent (mock)');
      return {
        agentPda: this.agentPda,
        authority: this.agentWallet.publicKey.toBase58(),
        metadata: agentConfig,
        stats: {
          totalCalls: BigInt(0),
          totalVolume: BigInt(0),
          reputationScore: 100,
          isActive: true,
        },
      };
    }

    const client = this.client;

    try {
      // Check if already registered
      try {
        const existing = await client.agent.fetch(this.agentWallet.publicKey);
        if (!force && existing.isActive) {
          logger.info('Agent already registered on SAP', { agentPda: this.agentPda });
          return this.mapToAgentProfile(existing);
        }
      } catch (err) {
        // Not registered yet, continue with registration
      }

      // Register agent with capabilities
      const agentMetadata: AgentMetadata = {
        name: agentConfig.agentName,
        description: agentConfig.agentDescription,
        capabilities: agentConfig.capabilities,
        pricing: agentConfig.pricingTiers,
        protocols: ['x402', 'A2A', ...agentConfig.capabilities.map(c => c.protocolId)],
        metadata: {
          version: '1.0.0',
          registeredAt: Date.now(),
          bountyCategory: 'ace_data_cloud_usage',
          services: agentConfig.supportedServices,
          repository: 'https://github.com/your-repo/synapse-ace-agent',
        },
      };

      logger.info('Registering agent on SAP mainnet', {
        name: agentMetadata.name,
        capabilities: agentMetadata.capabilities.map(c => c.id),
      });

      // Use builder pattern for easy registration
      const result = await client.builder
        .agent(agentMetadata.name)
        .description(agentMetadata.description)
        .addCapability('openai:chat', { protocolId: 'openai', version: '1.0' })
        .addCapability('flux:image', { protocolId: 'flux', version: '1.0' })
        .addCapability('serp:search', { protocolId: 'serp', version: '1.0' })
        .addCapability('sentinel:validate', { protocolId: 'sentinel', version: '1.0' })
        .addPricingTier({
          tierId: 'standard',
          pricePerCall: 1000, // ~0.000001 SOL
          rateLimit: 60,
          tokenType: 'sol' as const,
          settlementMode: 'x402' as const,
        })
        .register();

      logger.info('Agent registered successfully', {
        txSignature: result.agentTx,
        agentPda: this.agentPda,
      });

      // Fetch full profile
      const agent = await client.agent.fetch(this.agentWallet.publicKey);
      return this.mapToAgentProfile(agent);

    } catch (error) {
      logger.error('Failed to register agent', { error });
      throw error;
    }
  }

  /**
   * Create an escrow for x402 payments
   */
  async createEscrow(depositLamports?: bigint): Promise<EscrowAccountData> {
    await this.initialize();

    // Simulation mode: return mock escrow
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Creating escrow (mock)');
      return {
        agentPda: this.agentPda,
        escrowPda: 'EscrowSimulatedPDA' + Math.random().toString(36).substring(7),
      } as EscrowAccountData;
    }

    const client = this.client;
    const agentPda = this.agentPda;
    const deposit = depositLamports || this.config.getEscrowInitialDeposit();

    logger.info('Creating escrow for payments', { deposit: deposit.toString() });

    try {
      const escrowPda = await client.escrow.create(
        this.agentWallet.publicKey,
        {
          pricePerCall: BigInt(1000), // Base price per call
          maxCalls: BigInt(1000),
          initialDeposit: deposit,
          expiresAt: BigInt(0), // No expiry
          volumeCurve: [],
          tokenMint: null, // Native SOL
          tokenDecimals: 9,
        }
      );

      logger.info('Escrow created', { escrowPda: escrowPda.toBase58() });
      // The escrow data is returned in the transaction
      // Fetch it for confirmation
      return { agentPda, escrowPda: escrowPda.toBase58() } as EscrowAccountData;
    } catch (error) {
      logger.error('Failed to create escrow', { error });
      throw error;
    }
  }

  /**
   * Deposit funds into escrow
   */
  async depositToEscrow(amountLamports: bigint): Promise<string> {
    await this.initialize();

    // Simulation mode
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Depositing to escrow (mock)', { amount: amountLamports.toString() });
      return 'simulation_tx_deposit_' + Date.now();
    }

    const client = this.client;
    const agentPda = this.agentWallet.publicKey;

    logger.info('Depositing to escrow', { amount: amountLamports.toString() });

    try {
      const tx = await client.escrow.deposit(agentPda, amountLamports);
      logPayment('deposit', 'sap_escrow', 'funding', amountLamports, tx);
      return tx;
    } catch (error) {
      logger.error('Escrow deposit failed', { error });
      throw error;
    }
  }

  /**
   * Settle completed calls via x402
   */
  async settleCalls(depositor: string, calls: number, serviceHash: string): Promise<string> {
    await this.initialize();

    // Simulation mode
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Settling calls (mock)', { depositor, calls, serviceHash });
      return 'simulation_tx_settle_' + Date.now();
    }

    const client = this.client;

    try {
      const tx = await client.escrow.settle(
        this.keypairFromBase58(depositor),
        BigInt(calls),
        this.bytesFromString(serviceHash)
      );

      logger.info('Settled payments', {
        depositor,
        calls,
        serviceHash,
        tx,
      });

      return tx;
    } catch (error) {
      logger.error('Settlement failed', { error });
      throw error;
    }
  }

  /**
   * Batch settle multiple services
   */
  async batchSettle(settlements: Array<{ depositor: string; calls: number; serviceHash: string }>): Promise<string[]> {
    await this.initialize();

    // Simulation mode
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Batch settling (mock)', { count: settlements.length });
      return ['simulation_tx_batch_' + Date.now()];
    }

    const client = this.client;

    const batch = settlements.map(s => ({
      callsToSettle: BigInt(s.calls),
      serviceHash: this.bytesFromString(s.serviceHash),
    }));

    try {
      const tx = await client.escrow.settleBatch(
        this.agentWallet.publicKey,
        batch
      );
      logger.info('Batch settlement complete', { tx, count: settlements.length });
      return [tx];
    } catch (error) {
      logger.error('Batch settlement failed', { error });
      throw error;
    }
  }

  /**
   * Discover agents by capability
   */
  async discoverAgentsByCapability(capability: string): Promise<SapAgentDiscoveryResult[]> {
    await this.initialize();

    // Simulation mode: return mock discovery data
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Discovering agents (mock)', { capability });
      // Return mock agents including Synapse Sentinel
      return [
        {
          agentPda: 'Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph',
          authority: 'SimulatedAuthority111111111111111111111111',
          name: 'Synapse Sentinel',
          capabilities: ['sentinel:validate', 'sentinel:attest'],
          reputationScore: 95,
          totalCalls: BigInt(1500),
          isActive: true,
        },
        {
          agentPda: 'AgentA1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0',
          authority: 'AgentAuthority1111111111111111111111111',
          name: 'OpenAI Chat Agent',
          capabilities: ['openai:chat', 'openai:completion'],
          reputationScore: 98,
          totalCalls: BigInt(5000),
          isActive: true,
        },
        {
          agentPda: 'AgentB2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1',
          authority: 'AgentAuthority2222222222222222222222222',
          name: 'Flux Image Generator',
          capabilities: ['flux:image', 'flux:edit'],
          reputationScore: 97,
          totalCalls: BigInt(3200),
          isActive: true,
        },
      ];
    }

    const client = this.client;

    try {
      const agents = await client.discovery.findAgentsByCapability(capability);

      logger.debug(`Discovered ${agents.length} agents with capability: ${capability}`);

      return agents.map(a => ({
        agentPda: a.agentPda.toBase58(),
        authority: a.authority.toBase58(),
        name: a.metadata?.name || 'Unknown',
        capabilities: a.metadata?.capabilities?.map(c => c.id) || [],
        reputationScore: a.stats?.reputationScore || 0,
        totalCalls: a.stats?.totalCalls || BigInt(0),
        isActive: a.isActive,
      }));
    } catch (error) {
      logger.error('Agent discovery failed', { capability, error });
      throw error;
    }
  }

  /**
   * Get agent profile including tools and stats
   */
  async getAgentProfile(agentPda: string): Promise<SapAgentProfile> {
    await this.initialize();

    // Simulation mode: return mock profile
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Getting agent profile (mock)', { agentPda });
      
      // Check if it's our own agent
      if (agentPda === this.agentPda) {
        const agentConfig = this.config.getAgentConfig();
        return {
          agentPda: this.agentPda,
          authority: this.agentWallet.publicKey.toBase58(),
          metadata: agentConfig,
          stats: {
            totalCalls: BigInt(0),
            totalVolume: BigInt(0),
            reputationScore: 100,
            isActive: true,
          },
        };
      }
      
      // Return mock profile for other agents
      return {
        agentPda,
        authority: 'SimulatedAuthority',
        metadata: {
          name: 'Simulated Agent',
          description: 'Mock agent for simulation',
          capabilities: [],
          pricing: [],
          protocols: [],
        },
        stats: {
          totalCalls: BigInt(100),
          totalVolume: BigInt(1000000),
          reputationScore: 90,
          isActive: true,
        },
      };
    }

    const client = this.client;
    const pubkey = this.pubkeyFromBase58(agentPda);

    try {
      const profile = await client.discovery.getAgentProfile(pubkey);
      return {
        agentPda: profile.agent.agentPda.toBase58(),
        authority: profile.agent.authority.toBase58(),
        metadata: profile.agent.metadata as AgentMetadata,
        stats: {
          totalCalls: profile.stats.totalCalls,
          totalVolume: profile.stats.totalVolume,
          reputationScore: profile.stats.reputationScore,
          isActive: profile.agent.isActive,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch agent profile', { agentPda, error });
      throw error;
    }
  }

  /**
   * Update agent reputation after successful operations
   */
  async updateReputation(latencyMs: number, uptimePercent?: number): Promise<void> {
    await this.initialize();

    // Simulation mode: just log
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Updating reputation (mock)', { latencyMs, uptimePercent });
      return;
    }

    const client = this.client;

    try {
      await client.agent.updateReputation(latencyMs, uptitudePercent ?? 100);
      logger.debug('Reputation updated', { latencyMs, uptimePercent });
    } catch (error) {
      logger.warn('Failed to update reputation', { error });
    }
  }

  /**
   * Report agent metrics
   */
  async reportCalls(callCount: number): Promise<void> {
    await this.initialize();

    // Simulation mode: just log
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Reporting calls (mock)', { callCount });
      return;
    }

    const client = this.client;

    try {
      await client.agent.reportCalls(BigInt(callCount));
      logger.debug('Calls reported', { callCount });
    } catch (error) {
      logger.warn('Failed to report calls', { error });
    }
  }

  private mapToAgentProfile(agent: unknown): SapAgentProfile {
    // Simplified mapping - in production use proper typing
    const a = agent as Record<string, unknown>;
    return {
      agentPda: this.agentPda,
      authority: (a.authority?.toBase?.() || '') as string,
      metadata: a.metadata as AgentMetadata,
      stats: {
        totalCalls: a.stats?.totalCalls as bigint || BigInt(0),
        totalVolume: a.stats?.totalVolume as bigint || BigInt(0),
        reputationScore: a.stats?.reputationScore as number || 0,
        isActive: a.isActive as boolean || false,
      },
    };
  }

  private keypairFromBase58(key: string): Keypair {
    return Keypair.fromSecretKey(Buffer.from(JSON.parse(`[${key}]`)));
  }

  private pubkeyFromBase58(pubkey: string) {
    return new PublicKey(pubkey);
  }

  private bytesFromString(str: string): Uint8Array {
    return Buffer.from(str);
  }
}
