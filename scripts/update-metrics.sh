#!/usr/bin/env bash

set -euo pipefail

# Merges required metrics with upstream DCGM exporter defaults.
# This ensures the plugin has all metrics it needs while staying current with upstream.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

UPSTREAM_URL="https://raw.githubusercontent.com/NVIDIA/dcgm-exporter/refs/heads/main/etc/dcp-metrics-included.csv"
REQUIRED_METRICS_FILE="${SCRIPT_DIR}/required-metrics.csv"
METRICS_FILE="${REPO_ROOT}/deployment/console-plugin-nvidia-gpu/files/dcgm-metrics.csv"
TEMP_DIR=$(mktemp -d)

cleanup() {
    rm -rf "${TEMP_DIR}"
}
trap cleanup EXIT

echo "Fetching upstream DCGM metrics..."
curl -fsSL "${UPSTREAM_URL}" -o "${TEMP_DIR}/upstream-metrics.csv"

echo "Merging ${REQUIRED_METRICS_FILE} with upstream metrics..."
grep -E '^DCGM_' "${TEMP_DIR}/upstream-metrics.csv" > "${TEMP_DIR}/upstream-parsed.csv" || true
grep -E '^DCGM_' "${REQUIRED_METRICS_FILE}" > "${TEMP_DIR}/required-parsed.csv" || true

cat > "${METRICS_FILE}" <<'EOF'
# This list is auto-generated
EOF

cat "${TEMP_DIR}/required-parsed.csv" "${TEMP_DIR}/upstream-parsed.csv" | \
    awk 'BEGIN {FS=","; OFS=","} {for(i=1; i<=NF; i++) gsub(/^[[:space:]]+|[[:space:]]+$/, "", $i); if (!seen[$1]++) print}' >> "${METRICS_FILE}"

echo "Updated: ${METRICS_FILE}"
