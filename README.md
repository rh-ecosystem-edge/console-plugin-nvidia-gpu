# OpenShift Console GPU Plugin

Dynamic plugin for OpenShift Container Platform console which adds GPU capabilities.

# Local development
OpenShift Console GPU Plugin works as a remote bundle for OCP console. To run OpenShift Console GPU Plugin there should be a instance of OCP console up and running. Follow these steps to run OCP Console in development mode:

 - Follow everything as mentioned in the console [README.md](https://github.com/openshift/console) to build the application.
 - Run the console bridge as follows `./bin/bridge -plugins console-plugin-gpu=http://127.0.0.1:9001/`
 - Run developemnt mode of console by going into `console/frontend` and running `yarn run dev`

After the OCP console is set as required by ODF Console. Performs the following steps to make it run.

 - Install & setup GPU Operator
 - Clone this repo.
 - Pull all required dependencies by running `yarn install`.
 - Run the development mode by running `yarn start`.

