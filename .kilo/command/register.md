# Register Command
#
# Registers the agent on Synapse Agent Protocol (SAP) mainnet.
# This is a one-time setup operation.
#
# Usage:
#   kilo register
#   kilo register --force   # Re-register if already registered
#
# Prerequisites:
#   - OOBE_API_KEY set in .env
#   - SOLANA_PRIVATE_KEY set in .env
#   - Sufficient SOL balance (~0.01 SOL for registration + initial escrow)
#
# Output:
#   - Agent PDA (on-chain identity)
#   - Registration transaction signature
#   - AGENT_PDA saved to .env

## What it does

1. Validates configuration
2. Initializes SAP client
3. Builds agent manifest with capabilities:
   - openai:chat
   - flux:image
   - serp:search
   - sentinel:validate
4. Submits registration transaction
5. Saves agent PDA for future use
6. Creates initial payment escrow (0.001 SOL)

## Verification

After registration, verify on:
- SAP Explorer: https://explorer.oobeprotocol.ai/agents/{AGENT_PDA}
- Solscan: https://solscan.io/account/{AGENT_PDA}

## Troubleshooting

If registration fails:
- Check API key validity
- Ensure wallet has SOL (devnet airdrop available)
- Verify RPC connectivity
- Review error logs in logs/
