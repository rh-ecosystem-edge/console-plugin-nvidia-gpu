# OpenShift Console NVIDIA GPU Plugin

Dynamic plugin for the OpenShift console which adds GPU capabilities.

## QuickStart

### Prerequisites

- [Red Hat OpenShift](https://www.redhat.com/en/technologies/cloud-computing/openshift) 4.10+
- [NVIDIA GPU operator](https://github.com/NVIDIA/gpu-operator)
- [Helm](https://helm.sh/docs/intro/install/)

### Deployment

```
# add Helm repo
$ helm repo add rh-ecosystem-edge https://rh-ecosystem-edge.github.io/console-plugin-nvidia-gpu
$ helm repo update

# install the Helm chart in the default NVIDIA GPU operator namespace
$ helm install -n nvidia-gpu-operator console-plugin-nvidia-gpu rh-ecosystem-edge/console-plugin-nvidia-gpu

# view deployed resources
$ kubectl -n nvidia-gpu-operator get all -l app.kubernetes.io/name=console-plugin-nvidia-gpu

# enable the plugin
$ kubectl patch consoles.operator.openshift.io cluster --patch '[{"op": "add", "path": "/spec/plugins/-", "value": "console-plugin-nvidia-gpu" }]' --type=json
```

### Local development

OpenShift Console NVIDIA GPU Plugin works as a remote bundle for OCP console. To run OpenShift
Console NVIDIA GPU Plugin there should be a instance of the OCP console up and running. Follow these
steps to run the OCP Console in development mode:

 - Follow everything as mentioned in the console [README.md](https://github.com/openshift/console)
   to build the application.
 - Run the console bridge as follows `./bin/bridge -plugins console-plugin-nvidia-gpu=http://127.0.0.1:9001/`
 - Run developemnt mode of console by going into `console/frontend` and running `yarn run dev`

After the OCP console is set as required by the ODF Console. Perform the following steps to make it
run:

 - Install & setup the NVIDIA GPU Operator
 - Clone this repo
 - Pull all required dependencies by running `yarn install`
 - Run the development mode by running `yarn start`

