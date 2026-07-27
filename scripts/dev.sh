#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="${HOME}/Projects/flutter/bin:${PATH}"

echo "==> Starting MongoDB (if installed via brew)"
brew services start mongodb/brew/mongodb-community@7.0 >/dev/null 2>&1 || true

echo "==> Backend"
cd "$ROOT/backend"
npm install
npm run seed || true
npm run seed:cars || true
npm run dev &
BACKEND_PID=$!

echo "==> Admin"
cd "$ROOT/admin"
npm install
npm run dev &
ADMIN_PID=$!

cleanup() {
  kill "$BACKEND_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "API:   http://localhost:5050"
echo "Admin: http://localhost:5173"
echo "Press Ctrl+C to stop"
wait
