# Quick Start Guide

Get your autonomous agent running in **5 minutes**.

---

## 🎮 Option 1: Simulation Mode (No Keys - Instant)

Test the agent without any API keys:

```bash
npm ci
cp .env.example .env
# Add this line to .env:
SIMULATION=true
npm run demo
```

**Result:** Shows full workflow with mock data. Cannot win bounty.

**Use this to:** Understand how the agent works before getting keys.

---

## 🔑 Option 2: Real Mode (Win Bounty) — Get Keys

For actual bounty submission, you need 3 free keys (10 min setup):

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- **Solana wallet** with private key (funded with ~0.05 SOL) — [Phantom](https://phantom.app)
- **OOBE Protocol API Key** (free) — [Get here](https://www.oobeprotocol.ai)
- **AceDataCloud API Token** (free tier) — [Get here](https://platform.acedata.cloud)

---

## Installation

```bash
# Clone repo (or download ZIP)
git clone <your-repo-url>
cd synapse-ace-autonomous-agent

# Install dependencies
npm ci
```

## Configuration

```bash
# Copy template
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
OOBE_API_KEY=sk_your_key_here               # From OOBE Protocol dashboard
SOLANA_PRIVATE_KEY=base58_encoded_key      # Export from Phantom/Solflare
ACEDATA_API_TOKEN=your_acedata_token       # From AceDataCloud platform
ACEDATA_X402_NETWORK=solana                 # Must be 'solana' for bounty
```

⚠️ **Never commit `.env` to git!**

## One-Time Setup

```bash
# Register agent on SAP mainnet
npm run register
```

This creates your agent's on-chain identity (PDA). Takes 30-60 seconds.

Verify registration:
- Open https://explorer.oobeprotocol.ai/agents/{AGENT_PDA}
- Should see agent name "AceAutoAgent"

## Run Demo

```bash
npm run demo
```

Expected output:
```
[2026-05-14 12:00:00] INFO Step 1/6: Initializing agent...
[2026-05-14 12:00:01] INFO Step 2/6: SAP registration: Agent already registered
[2026-05-14 12:00:02] INFO Step 3/6: Discovered 47 agents, 12 tools
[2026-05-14 12:00:03] INFO Step 4/6: Synapse Sentinel: available
[2026-05-14 12:00:04] INFO Step 5/6: Escrow balance: 1000000 lamports
[2026-05-14 12:00:05] INFO Step 6/6: Executing workflow...
[2026-05-14 12:00:10] INFO ✓ Workflow completed
[2026-05-14 12:00:10] INFO Total cost: 0.000024 SOL (~$0.0036)
```

**Full demo runtime**: 30-60 seconds

## What Just Happened?

1. **Tool Discovery** - Queried SAP network for agents with required capabilities
2. **Sentinel Check** - Verified Synapse Sentinel agent availability
3. **Payment Setup** - Created/verified SOL escrow for payments
4. **Research** - Called Google SERP API for latest Solana DeFi news
5. **Content Gen** - Used OpenAI chat to generate summary
6. **Image Gen** - Created image with Flux
7. **Validation** - Submitted attestation via Synapse Sentinel
8. **Settlement** - Batch-paid all services via x402

All **fully autonomous** — zero manual intervention.

## Testing Custom Requests

```bash
# Test your own prompt
npm run test-workflow -- "Explain quantum computing in simple terms"

# With budget limit
npm run test-workflow -- --budget 5000000 "Create a detailed analysis of DeFi"

# Skip sentinel validation (faster)
npm run test-workflow -- --no-sentinel "Quick image of a robot"
```

## Monitoring

View live logs:
```bash
tail -f logs/agent-combined.log
```

Check agent on SAP Explorer:
```
https://explorer.oobeprotocol.ai/agents/{YOUR_AGENT_PDA}
```

Check transactions on Solscan:
```
https://solscan.io/account/{YOUR_AGENT_PDA}
```

## Next Steps

### If using Real Mode (bounty eligible):
1. **Record demo video** of `npm run demo`
2. **Post to X** tagging @OOBEonSol @AceDataCloud
3. Include repo link, agent PDA, tx hashes
4. Category: **Ace Data Cloud Usage**
5. See `BOUNTY.md` for full checklist

### If using Simulation Mode (testing only):
- Switch to real mode to actually win
- Use simulation to understand workflow first
- No need to post to X (won't qualify)

---

## Troubleshooting

### "OOBE_API_KEY invalid"
→ Get new key at https://us-1-mainnet.oobeprotocol.ai

### "SOLANA_PRIVATE_KEY format error"
→ Export as base58 from wallet (not JSON)

### "Insufficient funds"
→ Wallet needs ~0.01 SOL for registration + escrow
→ Fund via [ faucet ](https://faucet.solana.com) on devnet first

### "Registration stuck"
→ Check RPC connectivity
→ Try devnet first: set `SOLANA_NETWORK=devnet` in .env
→ Airdrop devnet SOL: `solana airdrop 2`

### "Workflow fails at image generation"
→ AceDataCloud may have queue (check status.acedata.cloud)
→ Image APIs are async — waiting is normal (10-30s)

### "No tools discovered"
→ SAP network can be sparse — retry in 2 minutes
→ Sentinel agent might be temporarily offline

## Support

- Documentation: See README.md
- Full deployment: See DEPLOY.md
- SAP issues: https://github.com/OOBE-PROTOCOL/synapse-sap-sdk
- AceDataCloud: https://github.com/AceDataCloud/SDK

---

**That's it!** Your agent is ready to earn rewards. 🚀
