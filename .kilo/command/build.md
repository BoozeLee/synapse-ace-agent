# Build Command
#
# Builds the Synapse-Ace Autonomous Agent for production.
#
# Usage:
#   kilo build
#   kilo build --watch
#
# Environment:
#   NODE_ENV - Set to 'production' for optimized build
#
# Outputs:
#   dist/ - Compiled JavaScript output
#   .tsbuildinfo - TypeScript build cache

## Build Steps

1. Run type checking:
   ```bash
   npm run typecheck
   ```

2. Lint code:
   ```bash
   npm run lint
   ```

3. Build with esbuild:
   ```bash
   npm run build
   ```

## Watch Mode

For development, use:
```bash
npm run dev
```
This uses tsx for hot-reloading.

## Output

- `dist/index.js` - Main entry point
- Source maps in production build (for debugging)

## Dependencies

All dependencies must be installed:
```bash
npm ci
```
