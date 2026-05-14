# Synapse-Ace Autonomous Agent

> **Autonomous AI Agent for Solana** — Powered by Synapse Agent Protocol & Ace Data Cloud with x402 Payments

This agent participates in the **OOBE Protocol × Ace Data Cloud Bounty** by building a complete end-to-end autonomous workflow that:

- **Discovers** tools via Synapse Agent Protocol (SAP)
- **Executes** tasks using Ace Data Cloud AI services
- **Settles** payments using x402 payment workflows (Solana escrow + AceDataCloud facilitator)

## 🎯 Bounty Categories

This agent qualifies for **BOTH** categories:

### Category A: General Payment Volume on SAP (On-chain Escrow)
- Uses Synapse RPC for on-chain escrow management
- Agents generate payment volume through SAP's escrow system
- Includes Synapse Sentinel agent services

### Category B: Ace Data Cloud Usage (x402 Facilitator)
- Uses `@acedatacloud/x402-client` with AceDataCloud's facilitator
- Consumes 3+ distinct Ace Data Cloud services (OpenAI, Flux, Google SERP, etc.)
- Fully autonomous end-to-end execution

## ✨ Features

### 🔍 **Intelligent Tool Discovery**
- Automatic scanning of SAP network for available tools
- Caches and indexes agent capabilities
- Discovers Synapse Sentinel and other service agents

### 🤖 **AI-Powered Workflow Orchestration**
- Natural language request parsing
- Multi-step task planning
- Dynamic service composition

### 💸 **Automated x402 Payments**
- Solana escrow management via SAP SDK
- On-chain USDC settlements via AceDataCloud facilitator
- Payment routing and verification

### 🧠 **Synapse Sentinel Integration**
- Agent health monitoring
- Response validation
- Attestation generation

### 📊 **Comprehensive Logging**
- Winston-based structured logging
- Transaction tracking
- Cost monitoring

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
│    "Generate content about Solana DeFi and create       │
│     an image illustrating the ecosystem"                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Agent Discovery & Planning Layer              │
│  • Parses request into task list                         │
│  • Identifies required services                          │
│  • Estimates costs                                       │
│  • Creates workflow plan                                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│           Tool Discovery via SAP Protocol                │
│  • Query agents by capability                            │
│  • Fetch Synapse Sentinel tools                          │
│  • Resolve pricing tiers                                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Ace Data Cloud Service Execution                │
│  ├─ OpenAI Chat: Research & content generation           │
│  ├─ Flux Image: Create illustrative image                │
│  ├─ Google SERP: Fetch latest DeFi news                  │
│  └─ **All calls automated with x402 payments**           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Payment Settlement via x402                      │
│  ├─ SAP Escrow: Pre-fund SOL escrow                      │
│  ├─ AceDataCloud Facilitator: On-chain USDC settlement   │
│  ├─ Batch settlement optimization                        │
│  └─ Receipt generation                                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│               Attestation & Reporting                     │
│  • Generate Synapse Sentinel attestations                │
│  • Update agent reputation                               │
│  • Log transaction history                               │
│  • Report metrics to SAP                                 │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
synapse-ace-autonomous-agent/
├── src/
│   ├── agent/
│   │   ├── AceAutoAgent.ts        # Main agent class
│   │   ├── AgentConfig.ts         # Configuration management
│   │   └── AgentRegistry.ts       # SAP agent registration
│   ├── services/
│   │   ├── AceDataCloudService.ts # AceDataCloud API wrapper
│   │   ├── SapService.ts          # SAP protocol interface
│   │   ├── PaymentService.ts      # x402 payment handler
│   │   └── SentinelService.ts     # Synapse Sentinel integration
│   ├── discovery/
│   │   ├── ToolDiscovery.ts       # SAP tool discovery
│   │   ├── CapabilityIndex.ts     # Cached capability index
│   │   └── AgentDiscovery.ts      # Agent lookup & scoring
│   ├── workflow/
│   │   ├── WorkflowEngine.ts      # Multi-step workflow orchestration
│   │   ├── TaskPlanner.ts         # AI-powered task planning
│   │   ├── TaskExecutor.ts        # Sequential execution engine
│   │   └── WorkflowContext.ts     # Execution state management
│   ├── payment/
│   │   ├── EscrowManager.ts       # SAP escrow operations
│   │   ├── X402Facilitator.ts     # AceDataCloud x402 client
│   │   ├── PaymentRouter.ts       # Payment method selection
│   │   └── SettlementBatch.ts     # Batch settlement optimization
│   ├── memory/
│   │   ├── VaultManager.ts        # SAP encrypted vault
│   │   ├── LedgerManager.ts       # SAP ring-buffer ledger
│   │   └── SessionManager.ts      # Session lifecycle
│   ├── attestation/
│   │   ├── AttestationService.ts  # Create & manage attestations
│   │   ├── ReputationUpdater.ts   # Update agent reputation
│   │   └── FeedbackCollector.ts   # Collect agent feedback
│   ├── types/
│   │   ├── index.ts               # Common type definitions
│   │   ├── sap.ts                 # SAP protocol types
│   │   ├── acedata.ts             # AceDataCloud API types
│   │   └── payment.ts             # Payment & escrow types
│   ├── utils/
│   │   ├── logger.ts              # Winston logger
│   │   ├── retry.ts               # Retry logic with backoff
│   │   ├── cost-estimator.ts      # Service cost estimation
│   │   └── helpers.ts             # Utility functions
│   └── index.ts                   # Main entry point
├── scripts/
│   ├── register-agent.ts          # One-time agent registration
│   ├── test-workflow.ts           # Workflow demo
│   └── batch-settlement.ts        # Batch payment demo
├── demo.ts                        # Full demonstration
├── .env.example                   # Environment template
├── .env                           # Local secrets (gitignored)
├── tsconfig.json                  # TypeScript configuration
├── esbuild.config.mjs             # Build configuration
├── README.md                      # This file
├── LICENSE                        # MIT License
└── AGENTS.md                      # Kilo agent instructions
```

## 🚦 Getting Started

### Choose Your Mode

**A) Real Mode (Win Bounty)** — Requires 3 free API keys
```bash
# 1. Get keys (10 min, all free):
#    - OOBE: https://www.oobeprotocol.ai → API Keys
#    - Solana: Phantom wallet → Export Private Key
#    - AceDataCloud: https://platform.acedata.cloud → API Tokens

# 2. Install & configure
npm ci
cp .env.example .env
# Edit .env, add your 3 keys

# 3. Register & run
npm run register    # Creates on-chain agent identity
npm run demo        # Watch autonomous agent work
```

**B) Simulation Mode (No Keys)** — Test without keys
```bash
# 1. Install
npm ci

# 2. Enable simulation
cp .env.example .env
# Add: SIMULATION=true

# 3. Run demo
npm run demo
# → Shows workflow logic with mock data
# → NO real transactions (cannot win bounty)
```

**C) Devnet Mode** — Test with real code, free SOL
```bash
# In .env:
SOLANA_NETWORK=devnet
# Get free devnet SOL: https://faucet.solana.com
# Still need OOBE + AceDataCloud keys (free)
```

---

### Prerequisites

**For Real/Devnet Mode:**
- Node.js 18+
- **OOBE Protocol API Key** (free) — [Get here](https://www.oobeprotocol.ai)
- **Solana Wallet** with private key (funded with ~0.05 SOL for mainnet, free from faucet for devnet)
- **AceDataCloud API Token** (free tier) — [Get here](https://platform.acedata.cloud)

**For Simulation Mode:**
- Node.js 18+ only (no keys needed)

### Environment Variables

```bash
# Required
OOBE_API_KEY=sk_your_oobe_api_key_here
SOLANA_PRIVATE_KEY=your_wallet_private_key_base58
ACEDATA_API_TOKEN=your_acedatacloud_api_token
ACEDATA_X402_NETWORK=solana  # or 'base' for EVM

# Optional
LOG_LEVEL=info
SAP_RPC_URL=https://us-1-mainnet.oobeprotocol.ai?api_key=YOUR_KEY
ESCROW_INITIAL_DEPOSIT=1000000  # lamports (0.001 SOL)
MAX_WORKFLOW_STEPS=10
```

### Register Your Agent on SAP

```bash
npm run register
```

This creates your agent's on-chain identity on the Synapse Agent Protocol mainnet.

### Run the Demo

```bash
npm run demo
```

The demo executes a complete autonomous workflow:
1. Request: "Research Solana DeFi and create an illustrative image"
2. Discovers tools via SAP
3. Calls Synapse Sentinel for validation
4. Executes AceDataCloud services:
   - Google SERP search for latest DeFi news
   - OpenAI chat for research summary
   - Flux image generation
5. Settles all payments via x402
6. Generates attestations
7. Logs complete transaction history

## 🎬 Demo Workflow

```
$ npm run demo

[2026-05-14 12:00:00] INFO AceAutoAgent starting autonomous workflow
[2026-05-14 12:00:00] INFO Task: "Research Solana DeFi and create an illustrative image"

Step 1/5: Tool Discovery
  ✓ Found 47 available agents
  ✓ Discovered Synapse Sentinel (Ccr2yK3...)
  ✓ Found 12 relevant tools

Step 2/5: Payment Setup
  ✓ Created SOL escrow: 8x9kLmN...
  ✓ Deposited 0.001 SOL
  ✓ X402 payment facilitator configured

Step 3/5: Content Research
  ✓ Google SERP: "Solana DeFi 2026 trends" (x402 paid: $0.0021)
  ✓ OpenAI GPT-4o: Generated research summary (x402 paid: $0.0035)
  ✓ Verified by Synapse Sentinel ✓

Step 4/5: Image Creation
  ✓ Flux generated: "Solana DeFi ecosystem illustration" (x402 paid: $0.0150)

Step 5/5: Settlement & Attestation
  ✓ Batch settled 3 x402 payments
  ✓ Created attestation with Synapse Sentinel
  ✓ Updated agent reputation: +5 score

✨ Workflow completed in 47.3s
💸 Total cost: $0.0206 (paid on-chain)
📊 Payment volume generated: $0.0206
🎯 Category: Ace Data Cloud Usage
```

## 🔄 How It Works

### 1. Agent Registration (SAP)

```typescript
const agent = await sapService.registerAgent({
  name: "AceAutoAgent",
  description: "Autonomous content generation agent using AceDataCloud",
  capabilities: [
    { id: "openai:chat", protocolId: "openai", version: "1.0" },
    { id: "flux:image", protocolId: "flux", version: "1.0" },
    { id: "serp:search", protocolId: "serp", version: "1.0" },
    { id: "sentinel:verify", protocolId: "sentinel", version: "1.0" },
  ],
  pricing: [
    {
      tierId: "standard",
      pricePerCall: 1000, // 0.000001 SOL per call
      rateLimit: 60,
    },
  ],
  protocols: ["x402", "A2A", "openai", "flux", "serp"],
});
```

### 2. Tool Discovery

The agent queries the SAP network to find available tools:

```typescript
const agents = await discovery.findAgentsByProtocol("sentinel");
const sentinelTools = await discovery.getAgentTools(sentinelAgentPda);
```

### 3. Autonomous Execution

The workflow engine plans and executes multi-service tasks:

```typescript
const workflow = await planner.plan("Create marketing content for Solana DeFi");

// Workflow steps:
// 1. Search web for latest Solana DeFi news (SERP API)
// 2. Generate content summary (OpenAI chat)
// 3. Create matching image (Flux)
// 4. Validate with Synapse Sentinel
// 5. Compile final output
```

### 4. x402 Payments

Each API call automatically handles payments:

```typescript
// AceDataCloud with x402
const result = await aceService.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [...],
  // x402 payment handled automatically
});

// SAP escrow settlement
await escrowManager.settleCalls(depositor, 1, serviceHash);
```

### 5. Attestations

The agent generates verifiable attestations of completed work:

```typescript
const attestation = await attestationService.createAttestation({
  attestationType: 1, // Task completion
  metadataHash: await hashTaskResult(result),
  expiresAt: Math.floor(Date.now() / 1000) + 86400 * 30, // 30 days
});
```

## 🏆 Bounty Eligibility

### ✅ General Payment Volume Category Requirements
- [x] Registered on Synapse Agent Protocol (SAP) mainnet
- [x] Complete automated workflow (trigger → execution → payment)
- [x] Uses escrow for payments with Synapse RPC
- [x] Incorporates AI capability (OpenAI chat, Flux image gen)
- [x] Uses Synapse Sentinel agent services
- [x] Generates real payment volume through agent activity

### ✅ Ace Data Cloud Usage Category Requirements
- [x] Registered on SAP mainnet
- [x] Complete automated workflow
- [x] AceDataCloud account with API access
- [x] Uses x402 with AceDataCloud's facilitator via Synapse RPC
- [x] Uses **3+ distinct Ace Data Cloud services**:
  - **OpenAI API** (chat completions)
  - **Flux API** (image generation)
  - **Google SERP API** (web search)
  - (Bonus: SERP, Suno, etc.)
- [x] Fully autonomous execution

## 📊 Tracking & Verification

The agent logs all activity for bounty verification:

```json
{
  "agentPda": "Agent...PDA",
  "bountyCategory": "ace_data_cloud_usage",
  "sapEscrowVolume": 0.0032,
  "acedataPaymentVolume": 0.0231,
  "servicesUsed": ["openai:chat", "flux:image", "serp:web"],
  "sentinelAttestations": 3,
  "workflowCount": 47,
  "transactionHistory": [
    {
      "timestamp": "2026-05-14T12:00:00Z",
      "service": "openai.chat.completions",
      "paymentMethod": "x402-solana",
      "costUsd": 0.0035,
      "txHash": "5eykt4...",
      "settled": true
    }
  ]
}
```

All transactions are verifiable on:
- **Solana Explorer**: [solscan.io](https://solscan.io)
- **Synapse Explorer**: [explorer.oobeprotocol.ai](https://explorer.oobeprotocol.ai)

## 🖼️ Neumorphic Dashboard

A modern, neumorphic web dashboard visualizes the agent's capabilities and includes an embedded demo recording.

🌐 **View Live (GitHub Pages):** https://boozelee.github.io/synapse-ace-agent/

Or open locally:
```bash
# From the project root:
open dashboard/index.html
```

**Features of the dashboard:**
- Soft neumorphic UI with subtle shadows and smooth interactions
- Embedded asciinema player showing the full demo workflow
- Lay-flat design with glassmorphism accents
- Responsive layout for mobile and desktop

---

## 🛠️ Development

### Build

```bash
npm run build
```

### Run in dev mode

```bash
npm run dev
```

### Lint & Type Check

```bash
npm run typecheck
npm run lint
```

### Test Workflow

```bash
npm run test-workflow
```

### Update Agent Manifest

```bash
npm run register -- --update
```

## 📝 Submission Requirements

To submit for the bounty:

1. **Post on X (Twitter)**
   - Demo video showing the agent in action
   - Tag @OOBEonSol and @AceDataCloud
   - Explain what the agent does and which category you're entering
   - Include GitHub repository link

2. **Demo Must Show**
   - Tool discovery via SAP
   - Execution of AceDataCloud APIs
   - Payment handling with x402
   - Fully autonomous execution (no manual steps)

This repository includes:
- ✅ Complete source code
- ✅ Setup instructions
- ✅ Working demo (`npm run demo`)
- ✅ Transaction logs for verification
- ✅ Agent registered on SAP mainnet

## 🔐 Security Notes

- Never commit `.env` or private keys
- Use OOBE Protocol RPC with your API key
- Store Solana private keys securely (hardware wallet recommended for production)
- Monitor escrow balances and replenish as needed

## 📚 Resources

- [Synapse Agent Protocol Docs](https://explorer.oobeprotocol.ai/docs)
- [AceDataCloud API Docs](https://docs.acedata.cloud)
- [x402 Payment Protocol](https://github.com/AceDataCloud/X402Client)
- [SAP SDK Reference](https://github.com/OOBE-PROTOCOL/synapse-sap-sdk)
- [Synapse Sentinel Agent](https://explorer.oobeprotocol.ai/agents/Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph)

## 🤝 Contributing

This is a bounty submission. PRs welcome post-submission.

## 📄 License

MIT — See LICENSE file for details.

---

**Built for the OOBE Protocol × Ace Data Cloud Joint Bounty**  
_Deadline: [Check bounty page for current deadline]_
