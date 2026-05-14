# Simulation Mode Guide

## What is Simulation Mode?

Simulation mode lets you run the agent **without real API keys**. It uses mock data to demonstrate the workflow logic.

**Use simulation mode when:**
- You want to test the code structure before getting keys
- You're learning how the agent works
- You don't need real transactions (non-bounty testing)

**Do NOT use simulation mode when:**
- You want to win the bounty (requires real on-chain activity)
- You need actual AI-generated content
- You want real payment volume tracked

---

## Enabling Simulation Mode

### **Method 1: Via .env file**

Edit `.env` and add:
```bash
SIMULATION=true
```

Leave all other keys empty or with placeholder values.

### **Method 2: Via environment variable**

```bash
SIMULATION=true npm run demo
```

---

## What Happens in Simulation Mode?

| Component | Real Mode | Simulation Mode |
|-----------|-----------|-----------------|
| SAP Registration | Creates on-chain agent PDA | Returns mock PDA |
| Tool Discovery | Queries SAP network | Returns mock agents |
| AceDataCloud APIs | Makes real HTTP calls | Returns mock responses |
| x402 Payments | Real SOL/USDC transfers | Logs "would pay" messages |
| Sentinel Validation | Calls Sentinel agent | Mock validation (score=95) |
| Transaction Logs | Real tx hashes | Simulated tx IDs |

---

## Example Output

```
[2026-05-14 12:00:00] INFO ⚠️  RUNNING IN SIMULATION MODE (no real transactions)
[2026-05-14 12:00:00] INFO ============================================================
[2026-05-14 12:00:03] INFO SAP Service initialized (SIMULATION MODE)
[2026-05-14 12:00:03] INFO SIMULATION: Registering agent (mock)
[2026-05-14 12:00:04] INFO Agent registered on SAP
[2026-05-14 12:00:04] INFO   pda: AgentSimulatedPDAxyz123
[2026-05-14 12:00:05] INFO SIMULATION: Discovering agents (mock)
[2026-05-14 12:00:05] INFO Discovered 3 agent tool sets
[2026-05-14 12:00:06] INFO SIMULATION: Synapse Sentinel (mock)
[2026-05-14 12:00:06] INFO Synapse Sentinel available
[2026-05-14 12:00:07] INFO SIMULATION: Escrow skipped (SIMULATION MODE)
[2026-05-14 12:00:08] INFO SIMULATION: Chat completion (mock)
[2026-05-14 12:00:09] INFO SIMULATION: Image generation (mock)
[2026-05-14 12:00:10] INFO ✓ Workflow completed successfully!
[2026-05-14 12:00:10] INFO 🎯 Bounty Category: Ace Data Cloud Usage
[2026-05-14 12:00:10] INFO   simulation: YES - No real transactions
[2026-05-14 12:00:10] INFO ⚠️  SIMULATION MODE - Not eligible for bounty
```

---

## Simulation Mode Limitations

- ❌ **No real SAP registration** — agent PDA doesn't exist on-chain
- ❌ **No actual API calls** — returns canned responses
- ❌ **No real payments** — x402 transactions not created
- ❌ **Cannot win bounty** — judges need verifiable on-chain activity
- ❌ **No transaction history** — explorers show nothing

---

## Switching to Real Mode

1. Remove or set `SIMULATION=false` in `.env`
2. Add your 3 real keys:
   ```bash
   OOBE_API_KEY=sk_live_xxxxx
   SOLANA_PRIVATE_KEY=WnFCr3xxxxx
   ACEDATA_API_TOKEN=xxxxx
   ```
3. Run again:
   ```bash
   npm run demo
   ```

You'll now see real registration, real API calls, and real transaction hashes.

---

## What Simulation Mode is Good For

✅ Testing workflow logic  
✅ Understanding agent architecture  
✅ Demonstrating concept to teammates  
✅ Debugging without spending money  
✅ Code reviews and walkthroughs

---

## What Simulation Mode is NOT Good For

❌ Bounty submission (requires real transactions)  
❌ Production usage  
❌ Cost estimation (prices are fake)  
❌ Performance testing (latency mocked)  

---

## Need Help?

- Real mode setup: See `QUICKSTART.md`
- Full deployment: See `DEPLOY.md`
- Bounty requirements: See `BOUNTY.md`

---

**Remember:** Simulation is for testing. To win the bounty, **you must run in real mode with actual API keys.**
