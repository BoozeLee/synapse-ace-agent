import { SapClient } from '@oobe-protocol-labs/synapse-sap-sdk';
import { ConfigManager } from '../utils/config';
import { logger, logDiscovery, logTaskStart, logTaskComplete, logWorkflowStart, logWorkflowComplete } from '../utils/logger';
import type { SapAgentDiscoveryResult, SapAgentProfile, CostEstimate } from '../types';

export class ToolDiscoveryService {
  private client!: SapClient;
  private initialized = false;
  private discoveryCache: Map<string, SapAgentDiscoveryResult[]> = new Map();
  private agentCache: Map<string, SapAgentProfile> = new Map();
  private sentinelPda: string | null = null;

  constructor(private config: ConfigManager) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Simulation mode: skip actual SAP client initialization
    if (this.config.isSimulation()) {
      logger.info('ToolDiscoveryService initialized (SIMULATION MODE)');
      this.initialized = true;
      return;
    }
    
    this.client = this.config.getSapClient();
    this.initialized = true;

    logger.info('ToolDiscoveryService initialized');
  }

  /**
   * Discover agents with specific capabilities
   */
  async discoverAgentsByCapability(capability: string): Promise<SapAgentDiscoveryResult[]> {
    await this.initialize();

    // Simulation mode: return mock data
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Returning mock discovery results', { capability });
      const mockResults: SapAgentDiscoveryResult[] = [
        {
          agentPda: 'SimOpenAI' + capability,
          authority: 'SimAuthOpenAI',
          name: `Mock ${capability} Provider`,
          capabilities: [capability],
          reputationScore: 95,
          totalCalls: BigInt(1000),
          isActive: true,
        },
      ];
      return mockResults;
    }

    // Check cache first (5 minute TTL)
    const cacheKey = `capability:${capability}`;
    if (this.discoveryCache.has(cacheKey)) {
      return this.discoveryCache.get(cacheKey)!;
    }

    logTaskStart('discovery', `discover_${capability}`, `Discovering agents with capability: ${capability}`);

    try {
      const agents = await this.client.discovery.findAgentsByCapability(capability);

      const results: SapAgentDiscoveryResult[] = agents.map(agent => ({
        agentPda: agent.agentPda.toBase58(),
        authority: agent.authority.toBase58(),
        name: agent.metadata?.name || 'Unknown',
        capabilities: agent.metadata?.capabilities?.map(c => c.id) || [],
        reputationScore: agent.stats?.reputationScore || 0,
        totalCalls: agent.stats?.totalCalls || BigInt(0),
        isActive: agent.isActive,
      }));

      // Cache for 5 minutes
      this.discoveryCache.set(cacheKey, results);

      logTaskComplete('discovery', `discover_${capability}`, undefined, undefined);
      logDiscovery('discovery', results.length, results.length * 5); // Estimate 5 tools per agent

      return results;
    } catch (error) {
      logger.error('Discovery failed', { capability, error });
      throw error;
    }
  }

  /**
   * Find Synapse Sentinel agent (required for bounty)
   */
  async findSynapseSentinel(): Promise<SapAgentProfile | null> {
    await this.initialize();

    if (this.sentinelPda) {
      return this.agentCache.get(this.sentinelPda) || null;
    }

    logger.info('Searching for Synapse Sentinel agent');

    // Simulation mode: return mock sentinel
    if (this.config.isSimulation()) {
      logger.info('SIMULATION: Synapse Sentinel (mock)');
      const mockSentinel: SapAgentProfile = {
        agentPda: 'Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph',
        authority: 'SimulatedSentinelAuthority',
        metadata: {
          name: 'Synapse Sentinel',
          description: 'Mock Sentinel for simulation',
          capabilities: [{ id: 'sentinel:validate', protocolId: 'sentinel', version: '1.0' }],
          pricing: [],
          protocols: ['sentinel'],
        },
        stats: {
          totalCalls: BigInt(1500),
          totalVolume: BigInt(1500000),
          reputationScore: 95,
          isActive: true,
        },
      };
      this.sentinelPda = 'Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph';
      this.agentCache.set(this.sentinelPda, mockSentinel);
      return mockSentinel;
    }

    try {
      // Known sentinel address from bounty
      const sentinelAddress = 'Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph';

      try {
        const profile = await this.client.discovery.getAgentProfile(
          this.client.pubkeyFromBase58(sentinelAddress)
        );

        this.sentinelPda = sentinelAddress;
        const agentProfile: SapAgentProfile = {
          agentPda: profile.agent.agentPda.toBase58(),
          authority: profile.agent.authority.toBase58(),
          metadata: profile.agent.metadata as any,
          stats: {
            totalCalls: profile.stats.totalCalls,
            totalVolume: profile.stats.totalVolume,
            reputationScore: profile.stats.reputationScore,
            isActive: profile.agent.isActive,
          },
        };

        this.agentCache.set(sentinelAddress, agentProfile);
        logger.info('Synapse Sentinel agent found', {
          pda: sentinelAddress,
          reputation: agentProfile.stats.reputationScore,
        });

        return agentProfile;
      } catch (err) {
        logger.warn('Synapse Sentinel not found via direct lookup');
        return null;
      }
    } catch (error) {
      logger.error('Failed to find Synapse Sentinel', { error });
      return null;
    }
  }

  /**
   * Get tools for a specific agent
   */
  async getAgentTools(agentPda: string): Promise<Array<{ name: string; description: string; category: string }>> {
    await this.initialize();

    // Simulation mode: return mock tools based on agent name
    if (this.config.isSimulation()) {
      if (agentPda.includes('Sentinel') || agentPda === 'Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph') {
        return [
          { name: 'validate', description: 'Validate agent responses', category: 'validation' },
          { name: 'attest', description: 'Create attestations', category: 'attestation' },
        ];
      }
      if (agentPda.includes('OpenAI') || agentPda.includes('A1b2')) {
        return [
          { name: 'chat', description: 'Generate chat completions', category: 'llm' },
          { name: 'completion', description: 'Text completion', category: 'llm' },
        ];
      }
      if (agentPda.includes('Flux') || agentPda.includes('B2c3')) {
        return [
          { name: 'generate', description: 'Generate images', category: 'image' },
          { name: 'edit', description: 'Edit images', category: 'image' },
        ];
      }
      return [];
    }

    try {
      const tools = await this.client.discovery.getAgentTools(
        this.client.pubkeyFromBase58(agentPda)
      );

      return tools.map(tool => ({
        name: tool.name || '',
        description: tool.description || '',
        category: tool.category || 'unknown',
      }));
    } catch (error) {
      logger.error('Failed to fetch agent tools', { agentPda, error });
      return [];
    }
  }

  /**
   * Get complete agent profile with all details
   */
  async getAgentProfile(agentPda: string): Promise<SapAgentProfile> {
    await this.initialize();

    // Check cache
    if (this.agentCache.has(agentPda)) {
      return this.agentCache.get(agentPda)!;
    }

    // Simulation mode: return mock profile
    if (this.config.isSimulation()) {
      logger.debug('SIMULATION: Getting agent profile (mock)', { agentPda });
      const mockProfile: SapAgentProfile = {
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
      this.agentCache.set(agentPda, mockProfile);
      return mockProfile;
    }

    try {
      const profile = await this.client.discovery.getAgentProfile(
        this.client.pubkeyFromBase58(agentPda)
      );

      const result: SapAgentProfile = {
        agentPda: profile.agent.agentPda.toBase58(),
        authority: profile.agent.authority.toBase58(),
        metadata: profile.agent.metadata as any,
        stats: {
          totalCalls: profile.stats.totalCalls,
          totalVolume: profile.stats.totalVolume,
          reputationScore: profile.stats.reputationScore,
          isActive: profile.agent.isActive,
        },
      };

      this.agentCache.set(agentPda, result);
      return result;
    } catch (error) {
      logger.error('Failed to get agent profile', { agentPda, error });
      throw error;
    }
  }

  /**
   * Estimate cost for a workflow using discovered agent pricing
   */
  async estimateWorkflowCost(
    agentPdds: string[],
    callsPerAgent: number[]
  ): Promise<CostEstimate> {
    await this.initialize();

    const breakdown: CostEstimate['breakdown'] = [];
    let totalLamports = BigInt(0);

    for (let i = 0; i < agentPdds.length; i++) {
      const agentPda = agentPdds[i];
      const calls = callsPerAgent[i];

      try {
        const profile = await this.getAgentProfile(agentPda);
        const avgPrice = profile.metadata.pricing?.[0]?.pricePerCall || 1000n;
        const cost = avgPrice * BigInt(calls);
        totalLamports += cost;

        breakdown.push({
          service: profile.metadata.name,
          cost,
        });
      } catch (error) {
        logger.warn('Could not get pricing for agent', { agentPda });
        // Use default pricing
        totalLamports += BigInt(calls * 1000);
        breakdown.push({
          service: 'unknown',
          cost: BigInt(calls * 1000),
        });
      }
    }

    // Rough USD conversion: 1 SOL ≈ $150, 1 SOL = 1e9 lamports
    const solAmount = Number(totalLamports) / 1e9;
    const estimatedUsd = solAmount * 150;

    return {
      estimatedLamports: totalLamports,
      estimatedUsd,
      breakdown,
    };
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.discoveryCache.clear();
    this.agentCache.clear();
    logger.info('Discovery cache cleared');
  }

  /**
   * Get all discovered tools across all relevant capabilities
   */
  async discoverAllTools(): Promise<Array<{
    agentPda: string;
    agentName: string;
    tools: Array<{ name: string; description: string; category: string }>;
  }>> {
    await this.initialize();

    const capabilities = [
      'openai:chat',
      'flux:image',
      'serp:search',
      'sentinel:validate',
    ];

    const results: Array<{
      agentPda: string;
      agentName: string;
      tools: Array<{ name: string; description: string; category: string }>;
    }> = [];

    for (const capability of capabilities) {
      const agents = await this.discoverAgentsByCapability(capability);

      for (const agent of agents.slice(0, 3)) { // Top 3 per capability
        const tools = await this.getAgentTools(agent.agentPda);
        if (tools.length > 0) {
          results.push({
            agentPda: agent.agentPda,
            agentName: agent.name,
            tools,
          });
        }
      }
    }

    return results;
  }
}
