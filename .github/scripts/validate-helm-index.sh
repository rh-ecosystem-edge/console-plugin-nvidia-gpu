#!/bin/bash
set -e

# Validates the Helm repository index.yaml for version consistency
# Usage: validate-helm-index.sh <path-to-index.yaml>

INDEX_FILE="${1:-index.yaml}"

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "❌ File not found: $INDEX_FILE"
  exit 1
fi

echo "Validating Helm index: $INDEX_FILE"

# Check for duplicate versions
DUPLICATES=$(yq eval '.entries.console-plugin-nvidia-gpu[].version' "$INDEX_FILE" | sort | uniq -d)
if [[ -n "$DUPLICATES" ]]; then
  echo "❌ Duplicate versions: $DUPLICATES"
  exit 1
fi

# Check if any appVersion doesn't match v{version} or release-{version}
# (skip 0.1.0 for backwards compatibility)
INVALID=$(yq eval '.entries.console-plugin-nvidia-gpu[] | select(.version != "0.1.0" and .appVersion != "v" + .version and .appVersion != "release-" + .version) | .version' "$INDEX_FILE")
if [[ -n "$INVALID" ]]; then
  echo "❌ Found entries with invalid appVersion:"
  while IFS= read -r VERSION; do
    APP_VERSION=$(yq eval ".entries.console-plugin-nvidia-gpu[] | select(.version == \"$VERSION\") | .appVersion" "$INDEX_FILE" | head -1)
    echo "   Version $VERSION has appVersion='$APP_VERSION', expected 'v$VERSION' or 'release-$VERSION'"
  done <<< "$INVALID"
  exit 1
fi

COUNT=$(yq eval '.entries.console-plugin-nvidia-gpu | length' "$INDEX_FILE")
echo "✓ All $COUNT versions valid"
