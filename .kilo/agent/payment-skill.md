# Payment & x402 Integration Skill
#
# Payment handling for Synapse-Ace Agent.
# Covers SAP escrow, x402 payments, and batch settlement.
#
## Payment Methods

1. **SAP Escrow** - For SAP-based transactions (General Payment Volume category)
2. **x402 (AceDataCloud)** - For AceDataCloud APIs (Ace Data Cloud category)

## SAP Escrow Flow

```typescript
// 1. Create escrow (one-time)
const escrow = await sapClient.escrow.create(agentWallet, {
  pricePerCall: new BN(1000),      // lamports per call
  maxCalls: new BN(1000),
  initialDeposit: new BN(1000000),  // 0.001 SOL
  expiresAt: new BN(0),             // never expires
});

// 2. Top up when needed
await sapClient.escrow.deposit(agentWallet, amount);

// 3. Settle after service completion
await sapClient.escrow.settle(depositor, callsSettled, serviceHash);

// 4. Batch settle (more efficient)
await sapClient.escrow.settleBatch(depositor, [
  { callsToSettle: BN(5), serviceHash: hash1 },
  { callsToSettle: BN(3), serviceHash: hash2 },
]);
```

## x402 Payment Flow (AceDataCloud)

```typescript
import { createX402PaymentHandler } from '@acedatacloud/x402-client';

const handler = createX402PaymentHandler({
  network: 'solana',  // 'base' | 'skale' also supported
  facilitator: 'https://facilitator.acedata.cloud',
  signer: walletSigner,
});

const client = new AceDataCloud({
  paymentHandler: handler,
});

// Calls automatically:
// 1. Send request (no auth)
// 2. Receive 402 + accepts[]
// 3. Handler signs selected payment
// 4. Retry with X-Payment header
// 5. Get 200 + x402_tx hash
```

## Pricing Strategy

Set pricing tiers during agent registration:

```typescript
.addPricingTier({
  tierId: 'standard',
  pricePerCall: 1000,          // ~$0.0015 at $150/SOL
  rateLimit: 60,               // Max calls per minute
  tokenType: 'sol',
  settlementMode: 'x402',
})
```

## Cost Estimation

```typescript
const estimate = await paymentService.estimateWorkflowCost(
  ['openai:chat', 'flux:image', 'serp:search'],
  [2, 1, 1]  // calls per service
);

// Returns:
// {
//   estimatedLamports: 25000n,
//   estimatedUsd: 0.00375,
//   breakdown: [
//     { service: 'openai:chat', cost: 10000n },
//     { service: 'flux:image', cost: 10000n },
//     { service: 'serp:search', cost: 5000n },
//   ],
// }
```

## Batch Optimization

Batch multiple service calls to reduce fees:

```typescript
// Bad: One tx per call
for (const call of calls) {
  await settle(call);  // 5 separate tx
}

// Good: Batch all at once
await settleBatch(calls);  // 1 tx

// Our agent auto-batches every 10 calls
```

## Priority Fees

For faster settlement on Solana mainnet:

```typescript
import { FAST_SETTLE_OPTIONS } from '@oobe-protocol-labs/synapse-sap-sdk';

await sapClient.x402.settle(depositor, calls, data, FAST_SETTLE_OPTIONS);
```

## Payment Tracking

Track for bounty volume:

```typescript
const stats = paymentService.getPaymentStats();
logger.info('Payment stats', {
  totalVolume: stats.totalVolumeLamports.toString(),
  transactionCount: stats.totalTransactions,
  avgCost: stats.avgCostPerCall.toString(),
  remaining: stats.escrowRemaining.toString(),
});
```

## Verification

All payment txns are on-chain:

- **SAP Escrow**: https://explorer.oobeprotocol.ai/escrows
- **x402 tx**: https://solscan.io/tx/{x402_tx}

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| Escrow empty | Run: agent.topUpEscrow(1000000) |
| 402 errors | Check x402 facilitator reachable |
| Slow settlement | Use priority fees or batch |
| Low balance | Add SOL to wallet (~$0.15 per 1000 calls) |
