import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type Node = K8sResourceCommon & {
  status?: {
    capacity?: {
      'nvidia.com/gpu': string;
      'amd.com/gpu'?: string;
    };
    addresses?: { type: string; address: string }[];
  };
};
