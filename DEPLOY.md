# Deployment Guide

## Pre-Deployment Checklist

Before deploying to mainnet, ensure:

- [ ] `.env` configured with all required keys
- [ ] Wallet funded with **at least 0.05 SOL** (for registration, escrow, fees)
- [ ] OOBE API key valid (test with `synapse-sap doctor run`)
- [ ] AceDataCloud account created and API token obtained
- [ ] Node.js 18+ installed
- [ ] All dependencies installed (`npm ci`)

## Step-by-Step Deployment

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd synapse-ace-autonomous-agent
npm ci
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

**Minimum .env values:**
```bash
OOBE_API_KEY=sk_live_...
SOLANA_PRIVATE_KEY=base58_encoded_private_key
ACEDATA_API_TOKEN=live_token_here
ACEDATA_X402_NETWORK=solana
```

### 3. Register Agent on SAP

```bash
npm run register
```

Expected output:
```
✓ Agent registered on SAP
  PDA: Agentxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  TX: 5eykt4Uu...
```

Verify:
- https://explorer.oobeprotocol.ai/agents/{AGENT_PDA}
- https://solscan.io/account/{AGENT_PDA}

### 4. Run Demo

```bash
npm run demo
```

Watch for:
- Agent initialization ✓
- Tool discovery ✓
- Sentinel detection ✓
- Payment setup ✓
- Workflow execution (3 steps)
- Attestation generation ✓

Total time: ~30-60 seconds.

### 5. Verify Transactions

After demo, check:

**SAP Escrow:**
- Explorer: https://explorer.oobeprotocol.ai/escrows
- Search for your agent PDA

**AceDataCloud x402:**
- Solscan: https://solscan.io
- Search for tx hashes logged in output

**Agent Profile:**
- https://explorer.oobeprotocol.ai/agents/{AGENT_PDA}

### 6. Submit Bounty

Create X (Twitter) post with:

1. **Screen recording** of `npm run demo` execution
2. **Tag**: @OOBEonSol + @AceDataCloud
3. **Include**:
   - What the agent does
   - Category: **Ace Data Cloud Usage** (or both if eligible)
   - Link to this GitHub repo
   - Your agent's SAP PDA
   - Example transaction hashes

Example post:
> "Built an autonomous agent for @OOBEonSol × @AceDataCloud bounty! 
>
> The agent discovers tools via SAP, executes multi-service workflows (OpenAI + Flux + SERP), and settles payments automatically via x402. Used Synapse Sentinel for validation.
>
> Category: Ace Data Cloud Usage
> Repo: github.com/yourname/synapse-ace-agent
> Agent: SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ
>
> #Solana #AI #x402 #SAP #AceDataCloud"

## Ongoing Operation

### Top Up Escrow

```typescript
await agent.topUpEscrow(BigInt(1000000)); // +0.001 SOL
```

Set up monitoring:
```bash
# Check balance daily
curl https://explorer.oobeprotocol.ai/api/agent/{AGENT_PDA}
```

### Custom Workflows

```typescript
// Custom script
import { AceAutoAgent } from './src/agent/AceAutoAgent';
const agent = new AceAutoAgent(config);
await agent.initialize();

const result = await agent.runWorkflow('Your custom request', {
  requireSentinelValidation: true,
});

console.log('Cost:', result.totalCost.toString());
```

### Scale Up

Increase concurrent workflows:
```typescript
// Edit AgentConfig in src/types/index.ts
maxConcurrentWorkflows: 10, // default: 5
```

Batch settle size:
```typescript
autoSettleBatchSize: 20, // default: 10
```

## Troubleshooting

### "Registration failed: Insufficient funds"
- Fund wallet with SOL (mainnet: ~$0.03 per 1000 lamports)
- Minimum required: 0.01 SOL for registration + escrow

### "402 Payment Required" errors
- Check ACEDATA_API_TOKEN is valid
- Verify Ac eDataCloud account has credits (free tier available)
- Confirm x402 facilitator reachable

### "Agent not found" in discovery
- Wait 2-3 minutes after registration (SAP indexing delay)
- Check agent is active: https://explorer.oobeprotocol.ai/agents/{PDA}
- Re-run with `npm run register -- --force`

### "Sentinel not available"
- Sentinel agent is optional (but required for full bounty eligibility)
- Check: https://explorer.oobeprotocol.ai/agents/Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph
- If inactive, wait or use another validated agent

### "Workflow timed out"
- Increase timeout: `PaymentService.initialize()` timeout parameter
- AceDataCloud may have queue (check status.acedata.cloud)
- Check task status logs in `logs/agent-combined.log`

## Monitoring

View real-time logs:
```bash
tail -f logs/agent-combined.log
```

Check agent stats:
```typescript
const profile = await agent.getProfile();
console.log('Reputation:', profile.stats.reputationScore);
console.log('Total calls:', profile.stats.totalCalls);
```

## Production Considerations

For live production deployment:

1. **Use硬件钱包** (Ledger/Trezor) for key storage
2. **Set up monitoring** - alert on low escrow balance
3. **Implement circuit breakers** - pause on repeated failures
4. **Enable rate limiting** - prevent runaway costs
5. **Audit transactions** - periodic review on explorers
6. **Backup config** - encrypted .env backups
7. **Multi-region RPC** - configure fallback endpoints

## Cost Management

Estimated costs per workflow:
- Chat (GPT-4o-mini): ~$0.0075
- Image (Flux): ~$0.015
- Search (SERP): ~$0.0015
- **Total per workflow**: ~$0.024

At 100 workflows/day = ~$2.40/day = ~$72/month

**Budget recommendation**: Fund escrow with 0.05 SOL (~$7.50 at $150/SOL) for testing, replenish as needed.

## Success Metrics

For bounty evaluation, track:

```typescript
const stats = {
  agentPda: agent.getAgentPda(),
  totalWorkflows: 47,           // Count successful runs
  totalPaymentVolume: 0.0231,   // Total USD value
  servicesUsed: ['openai', 'flux', 'serp'],
  sentinelAttestations: 3,
  txHashes: ['5eykt4...', '7x8...', ...],
};
```

All data will be publicly verifiable on explorers.

## Need Help?

- Read full README.md
- Check logs in `logs/` directory
- Review SAP docs: https://explorer.oobeprotocol.ai/docs
- AceDataCloud status: https://status.acedata.cloud
- Open GitHub issue in this repo

---

**Deployed successfully?** Post your X submission and good luck in the bounty! 🚀
