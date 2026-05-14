# SAP Integration Skill
#
# Guidelines for Synapse Agent Protocol integration.
# Covers agent registration, tool discovery, escrow, and attestations.
#
## Core SDK Usage

Import SAP SDK:
```typescript
import { SapClient, SapConnection } from '@synapse-sap/sdk';
import { AgentBuilder } from '@synapse-sap/sdk/registries/builder';
```

## Agent Registration

Use fluent builder pattern:

```typescript
const result = await client.builder
  .agent('AceAutoAgent')
  .description('Autonomous AI agent using AceDataCloud')
  .x402Endpoint('https://api.agent.com/x402')
  .addCapability('openai:chat', {
    protocolId: 'openai',
    version: '1.0',
    description: 'OpenAI chat completions',
  })
  .addPricingTier({
    tierId: 'standard',
    pricePerCall: 1000,
    rateLimit: 60,
    tokenType: 'sol',
    settlementMode: 'x402',
  })
  .register();
```

## Tool Discovery

Find agents by capability:

```typescript
const agents = await client.discovery.findAgentsByCapability('flux:image');
const sentinel = await client.discovery.findAgentsByProtocol('sentinel');
```

## Escrow Management

Create escrow for payments:
```typescript
await client.escrow.create(agentWallet, {
  pricePerCall: new BN(1000),
  maxCalls: new BN(1000),
  initialDeposit: new BN(1000000000), // 0.001 SOL
});
```

Batch settlement (more efficient):
```typescript
await client.escrow.settleBatch(depositor, [
  { callsToSettle: new BN(5), serviceHash: hash1 },
  { callsToSettle: new BN(3), serviceHash: hash2 },
]);
```

## Attestations

Create proof of task completion:
```typescript
await client.attestation.create(agentPda, {
  attestationType: 1, // Task completion
  metadataHash: hashBytes,
  expiresAt: new BN(Math.floor(Date.now() / 1000) + 86400 * 30)),
});
```

## Best Practices

1. **Use Builder pattern** - Clean agent registration
2. **Batch payments** - Reduce transaction fees
3. **Cache discovery** - Avoid repeated network calls
4. **Monitor reputation** - Update stats regularly
5. **Handle errors** - Check for SapError subtypes
6. **Verify tx** - Use confirm() with commitment

## Resources

- SAP Docs: https://explorer.oobeprotocol.ai/docs
- SDK: https://github.com/OOBE-PROTOCOL/synapse-sap-sdk
- Explorer: https://explorer.oobeprotocol.ai
