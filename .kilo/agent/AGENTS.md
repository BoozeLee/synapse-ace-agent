# Kilo Agent Guidelines for Synapse-Ace Autonomous Agent

## Project Overview

This is a production-ready autonomous AI agent built for the **OOBE Protocol × Ace Data Cloud Bounty**. The agent:
- Registers on SAP mainnet with verifiable on-chain identity
- Discovers tools via Synapse Agent Protocol
- Executes multi-service workflows using AceDataCloud APIs
- Handles payments via x402 protocol (Solana + USDC)
- Integrates with Synapse Sentinel for validation
- Generates attestations for reputation building

## Architecture Quick Reference

```
AceAutoAgent (main entry)
├── SapService          - SAP protocol operations (registration, escrow, discovery)
├── AceDataCloudService - AceDataCloud API wrapper (chat, image, search)
├── PaymentService      - x402 + SAP escrow payment handling
├── ToolDiscovery       - SAP network tool discovery & caching
├── WorkflowEngine      - Multi-step task orchestration
├── AttestationService  - Synapse Sentinel validation
└── AgentRegistry       - SAP agent lifecycle management
```

## Key Files

| File | Purpose |
|------|---------|
| `src/agent/AceAutoAgent.ts` | Main agent class - orchestrates all services |
| `src/services/SapService.ts` | SAP blockchain interactions |
| `src/services/AceDataCloudService.ts` | AceDataCloud API + x402 |
| `src/workflow/WorkflowEngine.ts` | Autonomous workflow execution |
| `src/types/index.ts` | All TypeScript type definitions |
| `src/utils/config.ts` | Environment configuration |
| `src/utils/logger.ts` | Structured Winston logging |

## Development Commands

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Register agent on SAP (one-time)
npm run register

# Run demo workflow
npm run demo

# Test custom workflow
npm run test-workflow -- "your request here"

# Build for production
npm run build

# Type checking
npm run typecheck

# Lint
npm run lint
```

## Environment Variables

Required for bounty submission:

```bash
OOBE_API_KEY=sk_...                    # From https://us-1-mainnet.oobeprotocol.ai
SOLANA_PRIVATE_KEY=base58...           # Funded wallet (mainnet)
ACEDATA_API_TOKEN=...                  # From https://platform.acedata.cloud
ACEDATA_X402_NETWORK=solana            # Must be 'solana' for bounty
```

## Bounty Submission Checklist

### Category: Ace Data Cloud Usage

- [x] Agent registered on SAP mainnet (via `npm run register`)
- [x] Complete autonomous workflow (no manual steps)
- [x] Using x402 with AceDataCloud facilitator
- [x] Consumes 3+ AceDataCloud services:
  - [x] OpenAI chat completions (`openai:chat`)
  - [x] Flux image generation (`flux:image`)
  - [x] Google SERP search (`serp:search`)
- [x] Uses Synapse Sentinel agent services (attestations)
- [x] Payment transactions verifiable on-chain

### Demo Requirements

The `npm run demo` command demonstrates:
1. SAP registration verification
2. Tool discovery via SAP
3. Synapse Sentinel detection
4. Multi-service workflow execution
5. Autonomous x402 payments
6. Attestation generation
7. Transaction logging

All steps are logged with structured output suitable for video recording.

## Code Conventions

### TypeScript
- Strict mode enabled
- No implicit `any`
- Branded types for Pubkey, Lamports, etc.
- All imports explicit

### Logging
- Use `logger.info()`, `logger.error()`, `logger.debug()`
- Include `workflowId` in all workflow-related logs
- Structured metadata as second parameter

### Error Handling
- Custom error types in `src/types/index.ts`
- Try-catch at task boundaries
- Graceful degradation (non-critical failures don't abort workflow)

### Payments
- All AceDataCloud calls use x402 automatically
- SAP escrow for on-chain payments
- Batch settlement every 10 calls
- Priority fees for faster confirmation

## Testing Strategy

1. **Unit tests** - Individual service methods (TODO)
2. **Integration test** - Full workflow via `npm run test-workflow`
3. **Demo validation** - `npm run demo` must complete without errors
4. **Bounty verification** - All transactions visible on explorers

## Security Notes

⚠️ **CRITICAL**:
- Never commit `.env` or private keys
- Use hardware wallet for mainnet operations
- Monitor escrow balances regularly
- Validate all x402 payment confirmations
- Sanitize user input (workflow planner)

## Monitoring

Agent health metrics:
- Escrow balance: `agent.getEscrowBalance()`
- Active workflows: `agent.getActiveWorkflows().length`
- Payment stats: `agent.getPaymentStats()`
- Sentinel status: `agent.getSentinelInfo()`

## Resources

- SAP Docs: https://explorer.oobeprotocol.ai/docs
- AceDataCloud: https://docs.acedata.cloud
- x402 Spec: https://github.com/AceDataCloud/X402Client
- Synapse Sentinel: https://explorer.oobeprotocol.ai/agents/Ccr2yK3hLALU4p8oNRqrh4dGuvPJTth5KCLMio8cE1ph

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Registration fails | Verify OOBE_API_KEY, SOL balance, RPC connectivity |
| x402 payments fail | Check ACEDATA_API_TOKEN, facilitator URL |
| No tools discovered | SAP network may be sparse, wait and retry |
| Workflow stuck | Check AceDataCloud service status page |
| Low escrow | `agent.topUpEscrow(1000000)` adds 0.001 SOL |

## Next Steps After Setup

1. Run `npm run register` to create on-chain agent identity
2. Run `npm run demo` to verify everything works
3. Record demo video showing full execution
4. Post to X with tags @OOBEonSol @AceDataCloud
5. Include GitHub repo link in post
6. Specify category: "Ace Data Cloud Usage"
7. Monitor transactions on explorers

## Support

- SAP SDK Issues: https://github.com/OOBE-PROTOCOL/synapse-sap-sdk
- AceDataCloud: https://github.com/AceDataCloud/SDK
- Documentation: See README.md

---

**Built for the OOBE Protocol × Ace Data Cloud Joint Bounty 2026**
