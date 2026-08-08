# synapse-ace-agent

Autonomous TypeScript agent prototype with multi-service orchestration, x402 payments, and Solana workflow integration.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)
![Solana](https://img.shields.io/badge/Solana-Web3.js-9945ff?logo=solana)
![Anchor](https://img.shields.io/badge/Anchor-Framework-000?logo=anchor)

## Overview

synapse-ace-agent is an autonomous agent system built in TypeScript that orchestrates multi-service workflows. It combines the Synapse Agent Protocol for discovery, Ace Data Cloud for data services, x402 payments for transaction settlement, and Solana-oriented workflow orchestration.

## Key Features

- **Multi-Service Discovery**: Agent Protocol-compatible service discovery and routing
- **Payment-Aware Workflows**: x402 payment protocol integration for automated transactions
- **Solana Integration**: Wallet management, transaction signing, and on-chain operations
- **Typed Service Boundaries**: Full TypeScript type safety across agent boundaries
- **CLI Demos**: Reproducible command-line demonstrations of agent workflows

## Tech Stack

- **Language**: TypeScript 5, Node.js 20+
- **Agent Framework**: Custom orchestration with typed message passing
- **Blockchain**: Solana Web3.js, Anchor framework
- **Payments**: x402 payment protocol
- **Data**: Ace Data Cloud integration
- **Tooling**: ESLint, Prettier, ts-node for CLI demos

## Quick Start

```bash
# Clone the repository
git clone https://github.com/BoozeLee/synapse-ace-agent.git
cd synapse-ace-agent

# Install dependencies
pnpm install

# Run the demo CLI
pnpm demo
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Discovery      │────▶│  Orchestrator   │────▶│  Service        │
│  Agent          │     │  Agent          │     │  Agents         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Service        │     │  Payment        │     │  Solana         │
│  Registry       │     │  Handler        │     │  Wallet         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Use Cases

- Automated service composition and discovery
- Payment-gated API access and microtransactions
- Multi-chain workflow orchestration
- Agent-to-agent communication patterns

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.

## Contact

**Kiliaan Vanvoorden** — [bakerstreetbandit@zohomail.eu](mailto:bakerstreetbandit@zohomail.eu)