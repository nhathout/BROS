#!/usr/bin/env bash
set -euo pipefail

# -------------------------------
# BROS Bootstrap Script
# -------------------------------
# 1. Ensures NVM is installed
# 2. Uses Node 20.19.0
# 3. Ensures pnpm is installed
# 4. Installs dependencies (pnpm bootstrap)
# -------------------------------

NODE_VERSION="20.19.0"
PNPM_VERSION="10.17.1"

echo "🚀 Bootstrapping BROS development environment..."

# --- Install NVM if missing ---
if ! command -v nvm &> /dev/null; then
  echo "📦 Installing NVM..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# --- Install / Use Node ---
echo "🔧 Using Node $NODE_VERSION..."
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# --- Enable Corepack / Install pnpm ---
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm $PNPM_VERSION..."
  corepack enable
  corepack prepare pnpm@$PNPM_VERSION --activate
fi

# --- Install workspace deps ---
echo "📦 Installing dependencies with pnpm..."
pnpm install -r

echo "✅ Bootstrap complete!"
echo "👉 You can now run: pnpm dev (from apps/desktop-app)"
