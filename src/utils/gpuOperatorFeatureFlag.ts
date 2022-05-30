import { k8sGet, K8sKind, SetFeatureFlag } from '@openshift-console/dynamic-plugin-sdk';

// Copy&pasted to avoid using React hooks
const DeploymentModel: K8sKind = {
  label: 'Deployment',
  labelKey: 'Deployment',
  apiVersion: 'v1',
  apiGroup: 'apps',
  plural: 'deployments',
  abbr: 'D',
  namespaced: true,
  propagationPolicy: 'Foreground',
  kind: 'Deployment',
  id: 'deployment',
  labelPlural: 'Deployments',
  labelPluralKey: 'Deployments',
};

export const handler = (setFeatureFlag: SetFeatureFlag) => {
  // const [deploymentModel] = useK8sModel(
  //   getGroupVersionKindForResource({ apiVersion: 'apps/v1', kind: 'Deployment' }),
  // );

  k8sGet({ model: DeploymentModel, name: 'gpu-operator', ns: 'nvidia-gpu-operator' })
    .then(() => {
      console.info('NVIDIA GPU operator detected.');
      setFeatureFlag('GPU_OPERATOR', true);
    })
    .catch(() => {
      console.info('Can not find NVIDIA GPU operator.');
    });
};
