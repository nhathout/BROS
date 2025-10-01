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
NVM_INSTALL_URL="https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh"
AUTO_NVM_CONFIGURED=0

echo "🚀 Bootstrapping BROS development environment..."

# --- Install / Load NVM ---
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "📦 Installing NVM..."
  curl -o- "$NVM_INSTALL_URL" | bash
fi

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "❌ Unable to locate nvm installation at $NVM_DIR" >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

# --- Install / Use Node ---
echo "🔧 Using Node $NODE_VERSION..."
nvm install $NODE_VERSION
nvm use $NODE_VERSION

DEFAULT_ALIAS="$(nvm alias default 2>/dev/null || true)"
if [[ "$DEFAULT_ALIAS" != *"$NODE_VERSION"* ]]; then
  echo "ℹ️ Setting default Node version to $NODE_VERSION via nvm"
  nvm alias default "$NODE_VERSION" >/dev/null
fi

ZSHRC_PATH="$HOME/.zshrc"
AUTO_NVM_SNIPPET="nvm use $NODE_VERSION"
if [ -w "$ZSHRC_PATH" ] && ! grep -Fq "$AUTO_NVM_SNIPPET" "$ZSHRC_PATH"; then
  echo "ℹ️ Enabling automatic 'nvm use $NODE_VERSION' in $ZSHRC_PATH"
  {
    echo "\n# BROS bootstrap: ensure Node $NODE_VERSION via nvm"
    echo "if [ -s \"$NVM_DIR/nvm.sh\" ]; then"
    echo "  . \"$NVM_DIR/nvm.sh\""
    echo "  nvm use $NODE_VERSION >/dev/null"
    echo "fi"
  } >> "$ZSHRC_PATH"
  AUTO_NVM_CONFIGURED=1
fi

# --- Enable Corepack / Install pnpm ---
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm $PNPM_VERSION..."
  if command -v corepack &> /dev/null; then
    corepack enable
    corepack prepare pnpm@$PNPM_VERSION --activate
  else
    echo "⚠️ corepack not found; installing pnpm globally via npm..."
    npm install -g pnpm@$PNPM_VERSION
  fi
fi

hash -r

if ! command -v pnpm &> /dev/null; then
  echo "❌ pnpm installation failed. Please install pnpm manually." >&2
  exit 1
fi

# --- Install workspace deps ---
echo "📦 Installing dependencies with pnpm..."
pnpm install -r

echo "✅ Bootstrap complete!"
echo "👉 You can now run: pnpm dev (from apps/desktop-app)"
if [ "$AUTO_NVM_CONFIGURED" -eq 1 ]; then
  echo "ℹ️ Reload your shell (e.g. run 'source $ZSHRC_PATH') so pnpm is on PATH."
else
  echo "ℹ️ If pnpm is unavailable, run: source \"$NVM_DIR/nvm.sh\" && nvm use $NODE_VERSION"
fi

# --- Ensure Electron dist exists ---
if [ -d "node_modules/electron/dist" ]; then
  echo "✅ Electron binary already present in node_modules/electron/dist"
elif [ -f "node_modules/electron/install.js" ]; then
  echo "⚡ Running Electron install.js to fetch binary..."
  node node_modules/electron/install.js || {
    echo "❌ Electron install.js failed. Try re-running manually." >&2
    exit 1
  }
  if [ -d "node_modules/electron/dist" ]; then
    echo "✅ Electron binary successfully installed"
  else
    echo "❌ Electron binary missing even after install.js" >&2
    exit 1
  fi
else
  echo "ℹ️ Skipping Electron setup (no electron dependency yet)."
fi
