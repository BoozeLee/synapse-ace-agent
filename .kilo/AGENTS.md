# Kilo Agents Configuration

This directory contains Kilo agent configuration for the Synapse-Ace Autonomous Agent project.

## Agent Commands

Place command definition files in `.kilo/command/`:

- `.kilo/command/build.md` - Build the agent
- `.kilo/command/register.md` - Register on SAP
- `.kilo/command/demo.md` - Run demo workflow
- `.kilo/command/test.md` - Test workflow

## Agent Skills

Custom skill definitions go in `.kilo/agent/`:

- `.kilo/agent/sap-skill.md` - SAP integration patterns
- `.kilo/agent/acedata-skill.md` - AceDataCloud API patterns
- `.kilo/agent/payment-skill.md` - x402 payment patterns

## Project Configuration

The `kilo.json` file at the project root defines agent behavior:

```json
{
  "commands": {
    "path": ".kilo/command",
    "include": ["*.md"]
  },
  "agents": {
    "path": ".kilo/agent",
    "include": ["*.md"]
  }
}
```

## Usage

After placing command files, invoke them with:

```bash
kilo build
kilo register
kilo demo
kilo test
```

See each `.md` file for command-specific instructions and parameters.
