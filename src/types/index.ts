/**
 * Common type definitions for the Synapse-Ace Autonomous Agent
 */

// ============================================
// SAP (Synapse Agent Protocol) Types
// ============================================

export interface SapCapability {
  id: string;
  protocolId: string;
  version: string;
  description?: string | null;
}

export interface SapPricingTier {
  tierId: string;
  pricePerCall: number; // in lamports
  rateLimit?: number;
  tokenType?: 'sol' | 'usdc' | 'spl';
  settlementMode?: 'instant' | 'escrow' | 'batched' | 'x402';
}

export interface SapAgentMetadata {
  name: string;
  description: string;
  capabilities: SapCapability[];
  pricing: SapPricingTier[];
  protocols: string[];
  metadata?: Record<string, unknown>;
}

export interface SapAgentProfile {
  agentPda: string;
  authority: string;
  metadata: SapAgentMetadata;
  stats: {
    totalCalls: bigint;
    totalVolume: bigint;
    reputationScore: number;
    isActive: boolean;
  };
}

export interface SapAgentDiscoveryResult {
  agentPda: string;
  authority: string;
  name: string;
  capabilities: string[];
  reputationScore: number;
  totalCalls: bigint;
  isActive: boolean;
}

// ============================================
// AceDataCloud Service Types
// ============================================

export interface AcedataChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AcedataChatCompletionParams {
  model: string;
  messages: AcedataChatMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AcedataImageParams {
  prompt: string;
  provider?: 'nano-banana' | 'midjourney' | 'flux' | 'seedream';
  width?: number;
  height?: number;
  steps?: number;
}

export interface AcedataSearchParams {
  query: string;
  numResults?: number;
}

export interface AcedataTaskHandle<T = unknown> {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: T;
  error?: string;
  progress?: number;
}

// Service categories for bounty tracking
export type AcedataServiceCategory =
  | 'openai_chat'
  | 'flux_image'
  | 'midjourney_image'
  | 'serp_search'
  | 'suno_audio'
  | 'sora_video'
  | 'luma_video'
  | 'claude_chat'
  | 'gemini_chat';

// ============================================
// Payment & x402 Types
// ============================================

export type PaymentMethod = 'sap_escrow' | 'x402_solana' | 'x402_base' | 'x402_skale';

export interface PaymentInvoice {
  amount: bigint; // in lamports or smallest token unit
  serviceHash: string;
  tierId: string;
  tokenType: 'sol' | 'usdc' | 'spl';
  expiresAt: number;
  nonce: number;
}

export interface PaymentReceipt {
  paymentId: string;
  invoice: PaymentInvoice;
  txHash: string;
  settlementTime: number;
  amountPaid: bigint;
  feePaid: bigint;
}

export interface X402PaymentHeader {
  'X-402-Token': string;
  'X-402-Agent': string;
  'X-402-Index': string;
}

export interface X402PaymentEnvelope {
  version: string;
  payload: string; // base64 encoded
}

// ============================================
// Workflow Types
// ============================================

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowTask {
  id: string;
  type: 'service_call' | 'discovery' | 'payment' | 'attestation';
  description: string;
  service?: string;
  params?: Record<string, unknown>;
  status: TaskStatus;
  result?: unknown;
  error?: string;
  cost?: bigint;
  startedAt?: number;
  completedAt?: number;
  txHash?: string;
}

export interface Workflow {
  id: string;
  userId?: string;
  description: string;
  tasks: WorkflowTask[];
  status: TaskStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  totalCost: bigint;
  currency: 'SOL' | 'USDC' | 'credits';
  paymentMethod: PaymentMethod;
}

// ============================================
// Synapse Sentinel Types
// ============================================

export interface SentinelValidationRequest {
  agentPda: string;
  taskId: string;
  dataHash: string;
  timestamp: number;
}

export interface SentinelValidationResult {
  isValid: boolean;
  score: number; // 0-100
  issues?: string[];
  attestationId?: string;
}

// ============================================
// Agent Configuration Types
// ============================================

export interface AgentConfig {
  agentName: string;
  agentDescription: string;
  capabilities: SapCapability[];
  pricingTiers: SapPricingTier[];
  supportedServices: AcedataServiceCategory[];
  maxConcurrentWorkflows: number;
  autoSettleBatchSize: number;
  sentinelValidationEnabled: boolean;
  vaultEncryptionEnabled: boolean;
}

// Default configuration
export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  agentName: 'AceAutoAgent',
  agentDescription: 'Autonomous AI agent powered by Synapse Protocol and AceDataCloud',
  capabilities: [
    { id: 'openai:chat', protocolId: 'openai', version: '1.0', description: 'OpenAI chat completions' },
    { id: 'flux:image', protocolId: 'flux', version: '1.0', description: 'Flux image generation' },
    { id: 'serp:search', protocolId: 'serp', version: '1.0', description: 'Google SERP search' },
    { id: 'sentinel:validate', protocolId: 'sentinel', version: '1.0', description: 'Synapse Sentinel validation' },
  ],
  pricingTiers: [
    { tierId: 'standard', pricePerCall: 1000, rateLimit: 60, tokenType: 'sol', settlementMode: 'x402' },
  ],
  supportedServices: ['openai_chat', 'flux_image', 'serp_search'],
  maxConcurrentWorkflows: 5,
  autoSettleBatchSize: 10,
  sentinelValidationEnabled: true,
  vaultEncryptionEnabled: true,
};

// ============================================
// Error Types
// ============================================

export class AgentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class PaymentError extends AgentError {
  constructor(message: string, public txHash?: string) {
    super('PAYMENT_ERROR', message, { txHash });
    this.name = 'PaymentError';
  }
}

export class DiscoveryError extends AgentError {
  constructor(message: string, public agentPda?: string) {
    super('DISCOVERY_ERROR', message, { agentPda });
    this.name = 'DiscoveryError';
  }
}

export class WorkflowError extends AgentError {
  constructor(message: string, public taskId?: string, public step?: number) {
    super('WORKFLOW_ERROR', message, { taskId, step });
    this.name = 'WorkflowError';
  }
}

// ============================================
// Utility Types
// ============================================

export type PubkeyString = string;
export type SignatureString = string;
export type UnixTimestamp = number;

export interface CostEstimate {
  estimatedLamports: bigint;
  estimatedUsd: number;
  breakdown: {
    service: string;
    cost: bigint;
  }[];
}

export interface WorkflowResult<T = unknown> {
  success: boolean;
  workflowId: string;
  result?: T;
  error?: string;
  totalCost: bigint;
  txHashes: string[];
  attestationIds: string[];
  durationMs: number;
}
