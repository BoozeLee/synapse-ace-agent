import * as esbuild from 'esbuild';

const isProd = process.env.NODE_ENV === 'production';

const context = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: 'dist',
  sourcemap: isProd ? false : true,
  minify: isProd,
  splitting: false,
  format: 'esm',
  external: [
    // External dependencies should not be bundled
    '@solana/web3.js',
    '@coral-xyz/anchor',
    '@oobe-protocol-labs/synapse-client-sdk',
    '@oobe-protocol-labs/synapse-sap-sdk',
    '@acedatacloud/sdk',
    '@acedatacloud/x402-client',
    'big-integer',
    'winston',
    'dotenv',
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});

if (isProd) {
  await context.rebuild();
  await context.dispose();
  console.log('✓ Build complete (production)');
} else {
  await context.watch();
  console.log('✓ Watch mode started');
}
