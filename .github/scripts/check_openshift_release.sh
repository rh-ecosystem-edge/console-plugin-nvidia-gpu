#!/bin/bash
set -euo pipefail

RELEASE_URL_API='https://amd64.ocp.releases.ci.openshift.org/api/v1/releasestreams/accepted'
VERSION_FILE='.github/data/latest-openshift-version.txt'

# Fetch all versions from API (fails if API is down)
versions=$(curl -fsS "$RELEASE_URL_API" | jq -r '.["4-stable"][]')

# Get only x.y.0 releases and find the latest
latest=$(echo "$versions" | grep -E '^[0-9]+\.[0-9]+\.0$' | sort -V | tail -1)

# Get currently tracked version (fails if file doesn't exist)
tracked=$(cat "$VERSION_FILE")

echo "Latest x.y.0 release: $latest"
echo "Tracked version: $tracked"

# Compare versions - if latest > tracked, we have a new version
if [ "$(printf '%s\n' "$tracked" "$latest" | sort -V | tail -1)" != "$tracked" ]; then
  echo "New version detected!"
  echo "new_version=$latest" >> "$GITHUB_OUTPUT"
else
  echo "No new version"
  echo "new_version=" >> "$GITHUB_OUTPUT"
fi
