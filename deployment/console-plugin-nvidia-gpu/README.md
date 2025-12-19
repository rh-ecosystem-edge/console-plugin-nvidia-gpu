# Console Plugin NVIDIA GPU Helm Chart

Console Plugin NVIDIA GPU is a [dynamic plugin](https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/README.md)
for the [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift)
[console UI](https://github.com/openshift/console). It leverages the metrics of the [NVIDIA GPU operator components](https://github.com/NVIDIA/gpu-operator)
in order to serve the respective [console-extensions](https://github.com/openshift/console/blob/master/frontend/packages/console-dynamic-plugin-sdk/README.md#console-extensionsjson).

## QuickStart

### Prerequisites

- [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift) 4.19+
- [NVIDIA GPU operator](https://github.com/NVIDIA/gpu-operator)
- [Helm](https://helm.sh/docs/intro/install/)

### Deployment

```
# add Helm repo
$ helm repo add rh-ecosystem-edge https://rh-ecosystem-edge.github.io/console-plugin-nvidia-gpu
$ helm repo update

# install Helm chart in the default NVIDIA GPU operator namespace
$ helm install -n nvidia-gpu-operator console-plugin-nvidia-gpu rh-ecosystem-edge/console-plugin-nvidia-gpu

# view deployed resources
$ kubectl -n nvidia-gpu-operator get all -l app.kubernetes.io/name=console-plugin-nvidia-gpu

# check if a plugins field is specified
$ oc get consoles.operator.openshift.io cluster --output=jsonpath="{.spec.plugins}"

# if not, then run the following to enable the plugin
$ oc patch consoles.operator.openshift.io cluster --patch '{ "spec": { "plugins": ["console-plugin-nvidia-gpu"] } }' --type=merge

# if yes, then run the following to enable the plugin
$ oc patch consoles.operator.openshift.io cluster --patch '[{"op": "add", "path": "/spec/plugins/-", "value": "console-plugin-nvidia-gpu" }]' --type=json

# add the required DCGM Exporter metrics ConfigMap to the existing NVIDIA operator ClusterPolicy CR
$ oc patch clusterpolicies.nvidia.com gpu-cluster-policy --patch '{ "spec": { "dcgmExporter": { "config": { "name": "console-plugin-nvidia-gpu" } } } }' --type=merge
```

### Helm Tests

The Console Plugin NVIDIA GPU Helm chart includes tests to verify the the console plugin's
deployment. To run the tests run the following commands:

```
# install Helm chart if you have not already done so
$ helm install -n nvidia-gpu-operator console-plugin-nvidia-gpu rh-ecosystem-edge/console-plugin-nvidia-gpu

# run the tests
$ helm test console-plugin-nvidia-gpu --timeout 2m
```
