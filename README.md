# OpenShift Console Plugin for NVIDIA GPU

> **Warning:**
> This plugin is not actively maintained or supported. Use at your own risk.

<!-- BEGIN:DESCRIPTION -->
A [dynamic plugin](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk) for the [OpenShift console](https://github.com/openshift/console) that adds GPU monitoring dashboards and visualizations using metrics from the [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator).

Multi-architecture images (amd64, arm64) are available starting from version 0.2.6.
<!-- END:DESCRIPTION -->

## OpenShift Version Compatibility

<!-- Auto-generated from gh-pages:index.yaml - do not edit manually -->
<!-- BEGIN:COMPAT-TABLE -->

| Plugin version | OpenShift version |
| -------------- | ----------------- |
| 0.3.0          | 4.19+             |
| 0.2.6          | 4.12-4.18         |

<!-- END:COMPAT-TABLE -->

<!-- BEGIN:HELM-CONTENT -->
## Quick Start

### Prerequisites

- [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
- [NVIDIA GPU Operator](https://github.com/NVIDIA/gpu-operator)
- [Helm](https://helm.sh/docs/intro/install/)

### Deployment

```console
# add Helm repo
$ helm repo add rh-ecosystem-edge https://rh-ecosystem-edge.github.io/console-plugin-nvidia-gpu
$ helm repo update

# install Helm chart in the default NVIDIA GPU operator namespace
$ helm install -n nvidia-gpu-operator console-plugin-nvidia-gpu rh-ecosystem-edge/console-plugin-nvidia-gpu

# view deployed resources
$ oc -n nvidia-gpu-operator get all -l app.kubernetes.io/name=console-plugin-nvidia-gpu

# check if a plugins field is specified
$ oc get consoles.operator.openshift.io cluster --output=jsonpath="{.spec.plugins}"

# if not, then run the following to enable the plugin
$ oc patch consoles.operator.openshift.io cluster --patch '{ "spec": { "plugins": ["console-plugin-nvidia-gpu"] } }' --type=merge

# if yes, then run the following to enable the plugin
$ oc patch consoles.operator.openshift.io cluster --patch '[{"op": "add", "path": "/spec/plugins/-", "value": "console-plugin-nvidia-gpu" }]' --type=json

# add the required DCGM Exporter metrics ConfigMap to the existing NVIDIA operator ClusterPolicy CR
$ oc patch clusterpolicies.nvidia.com gpu-cluster-policy --patch '{ "spec": { "dcgmExporter": { "config": { "name": "console-plugin-nvidia-gpu" } } } }' --type=merge
```

### DCGM Metrics Configuration

**Important**: Configuring the plugin's metrics ConfigMap will **override** any default or custom DCGM metrics. To collect additional metrics beyond those required by the plugin, merge the plugin's required metrics with your custom list into a new ConfigMap before applying it to the ClusterPolicy.

### Helm Tests

The Helm chart includes tests to verify successful deployment. To run them:

```console
$ helm test -n nvidia-gpu-operator console-plugin-nvidia-gpu --timeout 2m
```
<!-- END:HELM-CONTENT -->

## Development

See [DEVELOPMENT.md](https://github.com/rh-ecosystem-edge/console-plugin-nvidia-gpu/blob/main/DEVELOPMENT.md) for local development setup and contributing guidelines.