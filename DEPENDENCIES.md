# Dependency Version Constraints

This document explains why certain dependencies are pinned to specific versions.

## Pinned Dependencies

### `@patternfly/react-charts` → `^7.4.2`

**Reason**: Version 8.x is incompatible with webpack module federation in `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`.

**Impact**: PatternFly 6 targets charts v8, but we must stay on v7 until the SDK is upgraded.

**Resolution**: Requires upgrading `@openshift-console/dynamic-plugin-sdk-webpack` to a version that supports PF6 charts (when available).

### `webpack` → `5.75.0`

**Reason**: Required by `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`. Version 5.76.0+ causes build failure:
```
TypeError: The 'compilation' argument must be an instance of Compilation
```

**Impact**: Cannot use webpack 5.76.0+ security fixes.

**Resolution**: Requires upgrading `@openshift-console/dynamic-plugin-sdk-webpack` to a version compatible with webpack 5.76.0+.

### `i18next` → Peer Dependency Only

**Reason**: OpenShift Console provides `i18next` as a shared module via webpack module federation.

**Impact**: Plugin must not bundle its own `i18next` to avoid duplicate instances and version conflicts.

**Pattern**: Declared in `peerDependencies` only, following the official [console-plugin-template](https://github.com/openshift/console-plugin-template).

## SDK Version Status

**Current**: `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`

**Latest**: 1.1.1 (as of Jan 2026)

**Template Reference**: [console-plugin-template](https://github.com/openshift/console-plugin-template) also uses 1.1.1, confirming this is the recommended stable version.
