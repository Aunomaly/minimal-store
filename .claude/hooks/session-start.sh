#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "Installing dependencies..."
pnpm install

echo "Starting Next.js dev server..."
nohup pnpm dev > /tmp/next-dev.log 2>&1 &
disown $!

echo "Dev server started on http://localhost:3000 (logs: /tmp/next-dev.log)"
