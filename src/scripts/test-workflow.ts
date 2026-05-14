#!/usr/bin/env tsx
/**
 * Workflow Test Script
 *
 * Tests different workflow scenarios without full demo.
 * Useful for debugging and validation.
 *
 * Usage: npm run test-workflow -- "your request here"
 */

import { AceAutoAgent } from '../agent/AceAutoAgent';
import { ConfigManager } from '../utils/config';
import { logger } from '../utils/logger';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: npm run test-workflow -- "your workflow request"

Examples:
  npm run test-workflow -- "Research Solana DeFi and create an image"
  npm run test-workflow -- "Generate a futuristic cityscape"
  npm run test-workflow -- "Write a haiku about blockchain"

Optional flags:
  --budget <lamports>   Set max budget (e.g. 1000000 = 0.001 SOL)
  --no-sentinel        Disable Synapse Sentinel validation
    `.trim());
    process.exit(0);
  }

  // Parse args
  const request = args[0];
  let budget: bigint | undefined;
  let requireSentinel = true;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--budget' && args[i + 1]) {
      budget = BigInt(args[i + 1]);
      i++;
    } else if (args[i] === '--no-sentinel') {
      requireSentinel = false;
    }
  }

  logger.info('Workflow test', {
    request: request.substring(0, 60),
    budget: budget?.toString(),
    sentinel: requireSentinel,
  });

  // Initialize
  const config = new ConfigManager();
  const agent = new AceAutoAgent(config);
  await agent.initialize();

  // Get initial balance
  const initialBalance = agent.getEscrowBalance();
  logger.info('Initial escrow balance', { balance: initialBalance.toString() });

  // Execute
  const start = Date.now();
  try {
    const result = await agent.runWorkflow(request, {
      estimatedBudget: budget,
      requireSentinelValidation: requireSentinel,
    });

    const duration = Date.now() - start;

    logger.info('Workflow result', {
      workflowId: result.workflowId,
      success: result.success,
      durationMs: result.durationMs,
      actualDurationMs: duration,
      cost: result.totalCost.toString(),
      txCount: result.txHashes.length,
      attestations: result.attestationIds.length,
    });

    // Show balance change
    const finalBalance = agent.getEscrowBalance();
    const spent = initialBalance - finalBalance;
    logger.info('Payment summary', {
      initial: initialBalance.toString(),
      final: finalBalance.toString(),
      spent: spent.toString(),
      'spentUsd': (Number(spent) / 1e9 * 150).toFixed(4),
    });

    // Show tx hashes (for verification)
    if (result.txHashes.length > 0) {
      logger.info('Transaction hashes:', {
        txs: result.txHashes,
      });
    }

  } catch (error) {
    logger.error('Workflow execution failed', { error });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Fatal error', { error });
  process.exit(1);
});
