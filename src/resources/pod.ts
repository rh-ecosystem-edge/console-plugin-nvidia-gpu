import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Pod = K8sResourceCommon & {
  spec?: {
    nodeName?: string;
    nodeSelector?: string;
    containers?: {
      resources?: {
        limits?: { [key: string]: string };
        requests?: { [key: string]: string };
      };
    }[];
  };
};
