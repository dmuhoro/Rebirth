#!/usr/bin/env bash
# verify-theological-guardrails.sh
# Runs the theological safety foundation verification: lint, tests, build.
# Exit non-zero on any failure (fail closed).
set -euo pipefail

echo "==> npm run lint (tsc --noEmit)"
npm run lint

echo "==> npm run test (vitest)"
npm run test

echo "==> npm run build (vite + esbuild)"
npm run build

echo "==> All theological-guardrails verification green."
