#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "This script will stop LocalScribe, remove the installed app, and delete caches, databases, and preferences."
read -r -p "Continue with the full uninstall? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

remove_target() {
  local target="$1"
  if [[ -e "$target" ]]; then
    echo "Removing $target"
    rm -rf "$target" 2>/dev/null || sudo rm -rf "$target"
  fi
}

echo "Stopping running LocalScribe/Electron processes..."
pkill -f "LocalScribe" 2>/dev/null || true
pkill -f "Electron Helper.*LocalScribe" 2>/dev/null || true

echo "Removing /Applications/LocalScribe.app (requires admin)..."
remove_target "/Applications/LocalScribe.app"

echo "Purging Application Support data..."
remove_target "$HOME/Library/Application Support/LocalScribe"
remove_target "$HOME/Library/Application Support/LocalScribe-development"
remove_target "$HOME/Library/Application Support/LocalScribe-staging"

echo "Removing caches, logs, and saved state..."
remove_target "$HOME/.cache/localscribe"
remove_target "$HOME/Library/Caches/app.localscribe.desktop"
remove_target "$HOME/Library/Preferences/app.localscribe.desktop.plist"
remove_target "$HOME/Library/Logs/LocalScribe"
remove_target "$HOME/Library/Saved Application State/app.localscribe.desktop.savedState"

echo "Removing LocalScribe Keychain entry..."
security delete-generic-password -s "LocalScribe" -a "secrets-master-key" >/dev/null 2>&1 || true

echo "Cleaning temporary files..."
shopt -s nullglob
for tmp in /tmp/localscribe*; do
  remove_target "$tmp"
done
for crash in "$HOME/Library/Application Support/CrashReporter"/LocalScribe_*; do
  remove_target "$crash"
done
shopt -u nullglob

ENV_FILE="$PROJECT_ROOT/.env"
if [[ -f "$ENV_FILE" ]]; then
  read -r -p "Remove the local environment file at $ENV_FILE? [y/N]: " wipe_env
  if [[ "$wipe_env" =~ ^[Yy]$ ]]; then
    echo "Removing $ENV_FILE"
    rm -f "$ENV_FILE"
  fi
fi

cat <<'EOF'
macOS keeps microphone, screen recording, and accessibility approvals even after files are removed.
Reset them if you want a truly fresh start:
  tccutil reset Microphone app.localscribe.desktop
  tccutil reset Accessibility app.localscribe.desktop
  tccutil reset ScreenCapture app.localscribe.desktop

Full uninstall complete. Reboot if you removed permissions, then reinstall or run npm scripts on a clean tree.
EOF
