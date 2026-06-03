# Synapse ACE Agent

An autonomous TypeScript agent prototype for composing Synapse Agent Protocol discovery, Ace Data Cloud services, x402 payments, and Solana-oriented workflow orchestration.

The repository is public as a portfolio project: it shows typed service boundaries, payment-aware agent design, workflow execution, and a small command-line control surface for experiments.

## What It Demonstrates

- Multi-service AI agent orchestration in TypeScript.
- Synapse Agent Protocol discovery and registration flows.
- Ace Data Cloud service integration with x402 payment concepts.
- Solana SDK usage for payment and agent workflows.
- Typed configuration, logging, and command scripts for repeatable demos.

## Stack

- **Runtime:** Node.js 20+, TypeScript
- **Execution:** `tsx`, `esbuild`
- **Agent services:** Synapse SDKs, Ace Data Cloud SDK, x402 client
- **Blockchain:** Solana Web3.js, Anchor
- **Validation:** TypeScript compiler, ESLint

## Project Structure

```text
src/
├── agent/                 # Agent registry and autonomous agent entry points
├── attestation/           # Attestation service
├── ecosystem/             # Project registry and ecosystem metadata
├── scripts/               # CLI helpers and demos
├── services/              # SAP, Ace Data Cloud, payment, tool discovery services
├── types/                 # Shared TypeScript types
├── utils/                 # Config and logging helpers
└── workflow/              # Workflow engine
```

## Local Development

```bash
npm install
cp .env.example .env
npm run typecheck
npm run build
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the agent entry point with `tsx` |
| `npm run build` | Compile and bundle to `dist/index.js` |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run lint` | Run ESLint over TypeScript sources |
| `npm run demo:sim` | Run the simulation mode demo |
| `npm run register` | Register the agent when live credentials are configured |
| `npm run ecosystem` | Print the local ecosystem registry |

## Environment

Create `.env` from `.env.example` and provide only the credentials needed for the mode you are running. Keep private keys and API tokens out of git.

Typical live-mode values include:

| Variable | Purpose |
| --- | --- |
| `ACE_API_KEY` | Ace Data Cloud API access |
| `SYNAPSE_RPC_URL` | Synapse/Solana RPC endpoint |
| `SOLANA_KEYPAIR_PATH` | Local path to the agent wallet keypair |
| `SIMULATION` | Set to `true` for non-funded demo execution |

## Validation

Run before merging changes:

```bash
npm run typecheck
npm run build
```

Run simulation mode before any live payment or registration workflow:

```bash
npm run demo:sim
```

## Status

Portfolio agent prototype. Live registration and payment execution require configured credentials and funded wallets; the public repository intentionally excludes secrets and private operational data.
