import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Pod = K8sResourceCommon & {
  spec?: {
    nodeName?: string;
    nodeSelector?: string;
  };
};

export const podReference = ['core', 'v1', 'Pod'].join('~');
