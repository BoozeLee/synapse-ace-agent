import dotenv from 'dotenv';
import { AgentConfig, DEFAULT_AGENT_CONFIG } from '../types';

dotenv.config();

export class ConfigManager {
  private readonly config: AgentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AgentConfig {
    const capabilities: string[] = (process.env.AGENT_CAPABILITIES || '').split(',').filter(Boolean);

    const supportedServices = (process.env.SUPPORTED_SERVICES || '')
      .split(',')
      .filter(Boolean) as Array<keyof typeof DEFAULT_AGENT_CONFIG.supportedServices>;

    return {
      ...DEFAULT_AGENT_CONFIG,
      agentName: process.env.AGENT_NAME || DEFAULT_AGENT_CONFIG.agentName,
      agentDescription: process.env.AGENT_DESCRIPTION || DEFAULT_AGENT_CONFIG.agentDescription,
      capabilities: capabilities.length > 0
        ? capabilities.map(cap => ({ id: cap, protocolId: cap.split(':')[0], version: '1.0' }))
        : DEFAULT_AGENT_CONFIG.capabilities,
      supportedServices: supportedServices.length > 0 ? supportedServices : DEFAULT_AGENT_CONFIG.supportedServices,
      maxConcurrentWorkflows: parseInt(process.env.MAX_CONCURRENT_WORKFLOWS || '') || DEFAULT_AGENT_CONFIG.maxConcurrentWorkflows,
      autoSettleBatchSize: parseInt(process.env.AUTO_SETTLE_BATCH_SIZE || '') || DEFAULT_AGENT_CONFIG.autoSettleBatchSize,
    };
  }

  getAgentConfig(): AgentConfig {
    return { ...this.config };
  }

  getOobeApiKey(): string {
    // In simulation mode, return a dummy key
    if (process.env.SIMULATION === 'true') {
      return 'simulation_api_key';
    }
    const key = process.env.OOBE_API_KEY;
    if (!key) {
      throw new Error('OOBE_API_KEY environment variable is required');
    }
    return key;
  }

  getSapRpcUrl(): string {
    // In simulation mode, return a dummy URL
    if (process.env.SIMULATION === 'true') {
      return 'https://simulation.oobeprotocol.ai/rpc?api_key=simulation';
    }
    const key = process.env.SAP_RPC_URL;
    if (!key) {
      throw new Error('SAP_RPC_URL environment variable is required');
    }
    return key;
  }

  getSolanaPrivateKey(): Uint8Array {
    // In simulation mode, return a dummy keypair
    if (process.env.SIMULATION === 'true') {
      // Return a dummy 64-byte array (not a real key, won't sign anything)
      return new Uint8Array(64);
    }
    const key = process.env.SOLANA_PRIVATE_KEY;
    if (!key) {
      throw new Error('SOLANA_PRIVATE_KEY environment variable is required');
    }
    return this.decodePrivateKey(key);
  }

  getAcedataApiToken(): string {
    // In simulation mode, return a dummy token
    if (process.env.SIMULATION === 'true') {
      return 'simulation_token';
    }
    const token = process.env.ACEDATA_API_TOKEN;
    if (!token) {
      throw new Error('ACEDATA_API_TOKEN environment variable is required');
    }
    return token;
  }

  getAcedataX402Network(): 'solana' | 'base' | 'skale' {
    const network = process.env.ACEDATA_X402_NETWORK as 'solana' | 'base' | 'skale';
    if (!network) {
      throw new Error('ACEDATA_X402_NETWORK environment variable is required (solana/base/skale)');
    }
    return network;
  }

  getSolanaNetwork(): 'mainnet-beta' | 'devnet' | 'localnet' {
    const network = process.env.SOLANA_NETWORK as 'mainnet-beta' | 'devnet' | 'localnet';
    return network || 'mainnet-beta';
  }

  getEscrowInitialDeposit(): bigint {
    return BigInt(process.env.ESCROW_INITIAL_DEPOSIT || '1000000');
  }

  getMaxWorkflowSteps(): number {
    return parseInt(process.env.MAX_WORKFLOW_STEPS || '') || 10;
  }

  getPaymentPriorityMultiplier(): number {
    return parseFloat(process.env.PAYMENT_PRIORITY_MULTIPLIER || '') || 1.5;
  }

  getFacilitatorUrl(): string {
    return process.env.FACILITATOR_URL || 'https://facilitator.acedata.cloud';
  }

  private async decodePrivateKey(key: string): Promise<Uint8Array> {
    try {
      // Try base58 decoding
      const bs58 = (await import('bs58')).default;
      return bs58.decode(key);
    } catch {
      // Try raw bytes
      const bytes = key.split(',').map(Number);
      return new Uint8Array(bytes);
    }
  }

  // Get Solana private key as Uint8Array
  async getSolanaPrivateKey(): Promise<Uint8Array> {
    // In simulation mode, return a dummy keypair
    if (process.env.SIMULATION === 'true') {
      return new Uint8Array(64);
    }
    const key = process.env.SOLANA_PRIVATE_KEY;
    if (!key) {
      throw new Error('SOLANA_PRIVATE_KEY environment variable is required');
    }
    return this.decodePrivateKey(key);
  }

  // Helper to create Keypair from private key
  async getKeypair() {
    const { Keypair } = await import('@solana/web3.js');
    
    // Simulation mode: return a dummy keypair that won't actually sign
    if (process.env.SIMULATION === 'true') {
      // Create a random keypair for simulation (won't be used for real txs)
      return Keypair.generate();
    }
    
    const secret = await this.getSolanaPrivateKey();
    return Keypair.fromSecretKey(secret);
  }
  
  // Check if running in simulation mode
  isSimulation(): boolean {
    return process.env.SIMULATION === 'true';
  }
}

// Singleton instance
export const config = new ConfigManager();
