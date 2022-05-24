import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { Node } from '../resources/node';

export const useGPUProviders = (): [
  { nvidia: boolean; amd: boolean; other: boolean },
  boolean,
  unknown,
] => {
  const [nodes, loaded, loadError] = useK8sWatchResource<Node[]>({
    groupVersionKind: {
      kind: 'Node',
      version: 'v1',
    },
    isList: true,
  });

  const providers = {
    nvidia: false,
    amd: false,
    other: false,
  };

  nodes.forEach((node) => {
    // TODO: Make it generic once backend settles down
    const nvidia = node.status?.capacity?.['nvidia.com/gpu'];
    if (nvidia) {
      providers.nvidia = true;
    }

    const amd = node.status?.capacity?.['amd.com/gpu'];
    if (amd) {
      providers.amd = true;
    }
  });

  return [providers, loaded, loadError];
};
