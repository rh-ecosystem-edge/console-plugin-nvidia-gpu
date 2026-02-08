# Development Guide

## Local Development

This plugin extends the OpenShift console at runtime using [webpack module federation](https://webpack.js.org/concepts/module-federation/). To run it locally, you need a running OpenShift console instance.

### Setting Up the OpenShift Console

Follow these steps to run the OpenShift console in development mode:

1. Follow the instructions in the [OpenShift console README](https://github.com/openshift/console) to build the application.
2. Run the console bridge:
   ```console
   ./bin/bridge -plugins console-plugin-nvidia-gpu=http://127.0.0.1:9001/
   ```
3. Start the console in development mode: navigate to `console/frontend` and run `yarn run dev`

### Running the Plugin

After the OpenShift console is set up, perform the following steps:

1. Install and configure the NVIDIA GPU Operator
2. Clone this repository
3. Install dependencies: `yarn install`
4. Start the plugin in development mode: `yarn start`

## Dependency Version Constraints

Some dependencies are pinned to specific versions due to compatibility requirements.

### `@patternfly/react-charts` → `^7.4.2`

**Reason**: Version 8.x is incompatible with webpack module federation in `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`.

**Impact**: PatternFly 6 targets charts v8, but we must stay on v7 until the SDK is upgraded.

**Resolution**: Requires upgrading `@openshift-console/dynamic-plugin-sdk-webpack` to a version that supports PF6 charts (when available).

### `webpack` → `5.75.0`

**Reason**: Required by `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`. Version 5.76.0+ causes build failure:

```console
TypeError: The 'compilation' argument must be an instance of Compilation
```

**Impact**: Cannot use webpack 5.76.0+ security fixes.

**Resolution**: Requires upgrading `@openshift-console/dynamic-plugin-sdk-webpack` to a version compatible with webpack 5.76.0+.

### `i18next` → Peer Dependency Only

**Reason**: OpenShift console provides `i18next` as a shared module via webpack module federation.

**Impact**: Plugin must not bundle its own `i18next` to avoid duplicate instances and version conflicts.

**Pattern**: Declared in `peerDependencies` only, following the official [console-plugin-template](https://github.com/openshift/console-plugin-template).

## SDK Version Status

**Current**: `@openshift-console/dynamic-plugin-sdk-webpack@1.1.1`

**Latest**: 1.1.1 (as of Jan 2026)

**Template Reference**: [console-plugin-template](https://github.com/openshift/console-plugin-template) also uses 1.1.1, confirming this is the recommended stable version.
