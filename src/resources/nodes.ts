import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export type NodeKind = K8sResourceCommon & {
  status?: {
    capacity?: {
      'nvidia.com/gpu'?: string;
      'amd.com/gpu'?: string;
    };
  };
};

export const useAllNodes = () =>
  useK8sWatchResource<NodeKind[]>({
    groupVersionKind: {
      kind: 'Node',
      version: 'v1',
    },
    isList: true,
  });

export const useAllGpuCount = () => {
  const [providers, loaded, loadError] = useAllGpuProviders();
  let gpuCount = 0;
  Object.keys(providers).forEach((provider) => {
    gpuCount += providers[provider];
  });

  return [gpuCount, loaded, loadError];
};

export const useAllGpuProviders = () => {
  const [nodes, loaded, loadError] = useAllNodes();

  const providers = {
    nvidia: 0,
    amd: 0,
    other: 0,
  };

  nodes.forEach((node) => {
    // TODO: Make it generic once backend settles down
    const nvidia = node.status?.capacity?.['nvidia.com/gpu'];
    if (nvidia) {
      providers.nvidia += Number.parseInt(nvidia);
    }

    const amd = node.status?.capacity?.['amd.com/gpu'];
    if (amd) {
      providers.amd += Number.parseInt(amd);
    }
  });

  return [providers, loaded, loadError];
};
