#!/usr/bin/env tsx
/**
 * Agent Registration Script
 *
 * One-time setup: Registers the agent on Synapse Agent Protocol mainnet.
 *
 * Usage: npm run register
 *        npm run register -- --force  (re-register existing)
 */

import { AgentRegistry } from '../agent/AgentRegistry';
import { ConfigManager } from '../utils/config';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');

  logger.info('Synapse-Ace Agent Registration');
  logger.info('='.repeat(50));

  // Load configuration
  const config = new ConfigManager();

  // Create registry
  const registry = new AgentRegistry(config);

  try {
    logger.info('Checking configuration...');
    const oobeKey = config.getOobeApiKey();
    logger.info('OOBE API Key loaded', { length: oobeKey.length });

    const privateKeyExists = process.env.SOLANA_PRIVATE_KEY ? 'Yes' : 'No';
    logger.info('Solana private key', { exists: privateKeyExists });

    if (!process.env.SOLANA_PRIVATE_KEY && process.env.SIMULATION !== 'true') {
      logger.error('Missing required: SOLANA_PRIVATE_KEY');
      process.exit(1);
    }
  } catch (error) {
    logger.error('Configuration error', { 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error
    });
    process.exit(1);
  }

  // Perform registration
  try {
    logger.info(`\n${force ? 'Force-' : ''}Registering agent on SAP mainnet...`);

    const result = await registry.register(force);

    logger.info('Registration successful!', {
      agentPda: result.agentPda,
      name: result.metadata.name,
      tx: result.txSignature || 'pending',
    });

    // Save registration info to .env for future use
    const envPath = path.resolve(process.cwd(), '.env');

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // Add AGENT_PDA if not present
    if (!envContent.includes('AGENT_PDA=')) {
      fs.appendFileSync(envPath, `\nAGENT_PDA=${result.agentPda}\n`);
      logger.info('Saved AGENT_PDA to .env');
    }

    logger.info('\n✓ Agent ready for autonomous operation');
    logger.info('Run: npm run demo');

  } catch (error) {
    logger.error('Registration failed', { 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error
    });

    // Provide troubleshooting tips
    logger.info('\n🔧 Troubleshooting:');
    logger.info('1. Ensure OOBE_API_KEY is valid (get at https://us-1-mainnet.oobeprotocol.ai)');
    logger.info('2. Ensure SOLANA_PRIVATE_KEY is valid base58 key');
    logger.info('3. Fund wallet with ~0.01 SOL for registration + escrow');
    logger.info('4. Check RPC connectivity to mainnet');
    logger.info('5. Review logs above for specific errors');

    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unexpected error', { error });
  process.exit(1);
});
