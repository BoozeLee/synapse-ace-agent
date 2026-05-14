# Test Command
#
# Tests workflow execution with custom requests.
# Use this to validate different agent capabilities.
#
# Usage:
#   kilo test "Research Solana DeFi and create an image"
#   kilo test "Generate a logo for a crypto startup"
#   kilo test --budget 1000000 "Research quantum computing"
#   kilo test --no-sentinel "Quick image generation"
#
# Options:
#   --budget <lamports>  Maximum budget (in lamports)
#   --no-sentinel        Skip Sentinel validation
#
# Examples:
#   - With image: Test content+image workflow
#   - Research only: Test search+chat only
#   - Low budget: Test cost limit enforcement
#
# Output includes:
#   - Workflow ID
#   - Task statuses
#   - Transaction hashes
#   - Payment details
#   - Duration and cost
