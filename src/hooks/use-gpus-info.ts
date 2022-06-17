import {
  PrometheusEndpoint,
  useK8sWatchResource,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import * as _ from 'lodash';
import { Node } from '../resources';
import { useDeepCompareMemoize } from './use-deep-memoize';

export type GPUInfo = {
  uuid: string;
  modelName: string;
  nodeName: string;
};

/**
 * Get a list of all GPUs in the cluster and their details.
 *
 */
export const useGPUsInfo = (): [GPUInfo[], /* loaded */ boolean, /* error */ unknown] => {
  const [result, loaded, error] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'DCGM_FI_PROF_GR_ENGINE_ACTIVE',
  });

  const gpus = useDeepCompareMemoize(
    _.uniqBy(
      result?.data?.result?.map((res) => ({
        uuid: res.metric?.UUID,
        modelName: res.metric?.modelName,
        nodeName: res.metric?.Hostname,
      })),
      (g) => g.uuid,
    ),
  );

  return [gpus, loaded, error];
};

export const useGPUNode = (gpu?: GPUInfo): [Node | undefined, boolean, unknown] => {
  const [node, nodeLoaded, nodeError] = useK8sWatchResource<Node>(
    gpu?.nodeName
      ? {
          groupVersionKind: {
            kind: 'Node',
            version: 'v1',
          },
          name: gpu.nodeName,
          isList: false,
        }
      : null,
  );

  return [node, nodeLoaded, nodeError];
};
