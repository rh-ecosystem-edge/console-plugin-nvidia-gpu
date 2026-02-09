#!/bin/bash
set -eo pipefail

# Generates Helm README from root README and updates compatibility table
# Root README is the single source of truth
# Usage: generate-readme.sh <index.yaml> <root-readme> <output-helm-readme>

INDEX_FILE="${1:?index.yaml path required}"
ROOT_README="${2:?Root README path required}"
HELM_README="${3:?Helm README output path required}"

if [[ ! -f "$INDEX_FILE" ]]; then
  echo "Error: File not found: $INDEX_FILE"
  exit 1
fi

if [[ ! -f "$ROOT_README" ]]; then
  echo "Error: File not found: $ROOT_README"
  exit 1
fi

# Escape special regex characters for use in sed/grep patterns
escape_regex() {
  printf '%s' "$1" | sed 's/[.[\]\\*^$()+?{|]/\\&/g'
}

# Extract a marked section from a file
extract_section() {
  local file="$1"
  local section="$2"
  local begin_marker="<!-- BEGIN:$section -->"
  local end_marker="<!-- END:$section -->"
  local begin_pattern end_pattern content
  begin_pattern=$(escape_regex "$begin_marker")
  end_pattern=$(escape_regex "$end_marker")
  content=$(sed -n "/$begin_pattern/,/$end_pattern/p" "$file" | sed '1d;$d')

  if [[ -z "$content" ]]; then
    echo "Error: $section section not found in $file" >&2
    echo "Expected markers: $begin_marker and $end_marker" >&2
    exit 1
  fi

  echo "$content"
}

# Replace a marked section in a file with new content
replace_section() {
  local file="$1"
  local section="$2"
  local content="$3"
  local begin_marker="<!-- BEGIN:$section -->"
  local end_marker="<!-- END:$section -->"
  local begin_pattern end_pattern
  begin_pattern=$(escape_regex "$begin_marker")
  end_pattern=$(escape_regex "$end_marker")

  if ! grep -qF "$begin_marker" "$file"; then
    echo "Error: Missing $section begin marker in $file" >&2
    echo "Expected: $begin_marker" >&2
    exit 1
  fi

  if ! grep -qF "$end_marker" "$file"; then
    echo "Error: Missing $section end marker in $file" >&2
    echo "Expected: $end_marker" >&2
    exit 1
  fi

  local before after
  before=$(sed -n "1,/$begin_pattern/p" "$file")
  after=$(sed -n "/$end_pattern/,\$p" "$file")

  # Strip leading newline from content if present, then add blank lines
  # This ensures consistent formatting regardless of content structure
  content="${content#$'\n'}"

  # Add blank lines after BEGIN and before END markers for consistency
  # (trailing newlines are stripped by command substitution)
  {
    printf '%s\n' "$before"
    printf '\n%s\n\n' "$content"
    printf '%s' "$after"
  } > "$file"
}

# Convert Kubernetes version to OpenShift version
# OpenShift 4.x uses Kubernetes 1.(x+13), so: OCP minor = K8s minor - 13
kube_to_openshift() {
  local kube_version="$1"
  local k8s_minor
  k8s_minor=$(echo "$kube_version" | grep -oE '1\.[0-9]+' | head -1 | cut -d. -f2)
  if [[ -n "$k8s_minor" ]]; then
    local ocp_minor=$((k8s_minor - 13))
    echo "4.${ocp_minor}+"
  fi
}

# Generate compatibility table from index.yaml (released versions only)
generate_compat_table() {
  local table_header table_rows

  table_header="| Plugin version | OpenShift version |
| -------------- | ----------------- |"

  table_rows=$(yq eval '.entries.console-plugin-nvidia-gpu[] | select(.deprecated != true) | [.version, .kubeVersion // "", .description] | join("|")' "$INDEX_FILE" | \
  sort -t'|' -k1 -Vr | \
  while IFS='|' read -r version kube_version description; do
    ocp_version=""

    # Try kubeVersion first
    if [[ -n "$kube_version" ]]; then
      ocp_version=$(kube_to_openshift "$kube_version")
    fi

    # Fall back to parsing description for older releases
    if [[ -z "$ocp_version" ]]; then
      ocp_version=$(echo "$description" | grep -oE 'OpenShift version [0-9]+\.[0-9]+[-0-9.+]*' | head -1 | sed 's/OpenShift version //; s/[. ]*$//')
    fi

    if [[ -n "$ocp_version" ]]; then
      printf "| %-14s | %-17s |\n" "$version" "$ocp_version"
    fi
  done)

  if [[ -z "$table_rows" ]]; then
    echo "Error: No valid entries found in $INDEX_FILE" >&2
    echo "Check that index.yaml contains non-deprecated entries with version information" >&2
    exit 1
  fi

  local output
  output=$(printf '%s\n%s\n\n' "$table_header" "$table_rows")

  echo "$output"
}

# Extract content from root README
HELM_CONTENT=$(extract_section "$ROOT_README" "HELM-CONTENT")
COMPAT_TABLE=$(generate_compat_table)
DESCRIPTION=$(extract_section "$ROOT_README" "DESCRIPTION")

# Update compatibility table in root README
replace_section "$ROOT_README" "COMPAT-TABLE" "$COMPAT_TABLE"
echo "Updated $ROOT_README compatibility table from $INDEX_FILE"

# Update Helm README sections
if [[ ! -f "$HELM_README" ]]; then
  echo "Error: Helm README not found: $HELM_README" >&2
  exit 1
fi

replace_section "$HELM_README" "DESCRIPTION" "$DESCRIPTION"
replace_section "$HELM_README" "HELM-CONTENT" "$HELM_CONTENT"

echo "Updated $HELM_README from $ROOT_README"
