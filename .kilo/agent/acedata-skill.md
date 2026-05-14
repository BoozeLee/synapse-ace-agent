# AceDataCloud Integration Skill
#
# Guidelines for integrating Ace Data Cloud APIs with x402 payments.
# Covers chat, image, video, search, and task polling.
#
## SDK Installation

```bash
npm install @acedatacloud/sdk @acedatacloud/x402-client
```

## Client Setup with x402

```typescript
import { AceDataCloud } from '@acedatacloud/sdk';
import { createX402PaymentHandler } from '@acedatacloud/x402-client';

const client = new AceDataCloud({
  // No API token needed when using x402
  paymentHandler: createX402PaymentHandler({
    network: 'solana',      // or 'base' | 'skale'
    facilitator: 'https://facilitator.acedata.cloud',
    signer: yourWalletSigner,
  }),
});
```

## API Categories

### Chat (OpenAI-compatible)

```typescript
const response = await client.openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Image Generation

```typescript
const task = await client.images.generate({
  prompt: 'A sunset over mountains',
  provider: 'flux',  // nano-banana | midjourney | flux
});
const result = await task.wait(); // Polls until complete
```

### Web Search (SERP)

```typescript
const results = await client.search.google({
  query: 'Solana DeFi 2026',
  num: 5,
});
```

### Video Generation

```typescript
const task = await client.video.generate({
  prompt: 'A cat playing piano',
  provider: 'luma',  // luma | sora | veo | kling | etc.
});
const video = await task.wait();
```

### Music Generation

```typescript
const task = await client.audio.generate({
  prompt: 'Jazz tune with piano',
});
const audio = await task.wait();
```

## Task Polling Pattern

Image/video/audio APIs are async - they return TaskHandle:

```typescript
const task = await client.images.generate({ prompt });
// Immediate: task.status === 'pending'

// Poll until complete (built-in)
const result = await task.wait(); // Blocks until done

// Or manual polling
while (task.status !== 'completed') {
  await new Promise(r => setTimeout(r, 1000));
  await task.poll();
  console.log(`Progress: ${task.progress}%`);
}
```

## x402 Payment Flow

1. SDK makes unauthenticated call (no Bearer token)
2. Server returns 402 with `accepts[]` list (payment options)
3. Payment handler signs one option (on-chain)
4. SDK retries with `X-Payment` header
5. Server returns 200 + `x402_tx` hash

All handled automatically by the SDK.

## Service Providers

| Resource  | Providers |
| --------- | --------- |
| Images    | nano-banana (default), midjourney, flux, seedream |
| Video     | sora (default), luma, veo, kling, hailuo, seedance, wan, pika |
| Audio     | suno (default), producer, fish |

## Cost Guide (approximate)

| Service | Cost per call (USD) |
| ------- | ------------------- |
| Chat (GPT-4o-mini) | $0.003 - $0.015 |
| Image (Flux) | $0.015 - $0.03 |
| Image (Midjourney) | $0.05 - $0.10 |
| Search (SERP) | $0.001 - $0.003 |
| Video (Luma) | $0.10 - $0.50 |
| Music (Suno) | $0.05 - $0.20 |

## Error Handling

```typescript
try {
  await client.openai.chat.completions.create(params);
} catch (err) {
  if (err instanceof AuthenticationError) { }
  else if (err instanceof RateLimitError) { }
  else if (err instanceof InsufficientBalanceError) { }
}
```

## Bounty Requirements

For **Ace Data Cloud Usage** category:
- ✓ Use 3+ distinct services
- ✓ All via x402 (no Bearer token)
- ✓ Autonomous end-to-end

Our agent uses: openai:chat, flux:image, serp:search

## Resources

- Docs: https://docs.acedata.cloud
- SDK: https://github.com/AceDataCloud/SDK
- x402 Client: https://github.com/AceDataCloud/X402Client
- Platform: https://platform.acedata.cloud
