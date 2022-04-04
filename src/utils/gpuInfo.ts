import * as React from 'react';
import {
  PrometheusEndpoint,
  useK8sWatchResource,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { Node, Pod } from '../resources';

export type GPUInfo = {
  // From metric
  uuid: string;
  podname: string;
  namespace: string;
  device: string;
  modelName: string;

  // Following are so far taken from Node (TODO: link issue requesting change)
  // More will come. One day...
  driver?: string;
  count?: number;
};

/**
 * Get a list of all GPUs in the cluster and their details.
 *
 * Since the details are not sufficiently exported atm (TODO: Add Jira link to track),
 * we hack it to get list of UUIDs at least.
 */ export const useAllGPUsInfo = (): [GPUInfo[], /* loading */ boolean, /* error */ any] => {
  const [result, loading, error] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'DCGM_FI_DEV_GPU_UTIL',
  });

  const gpus = React.useMemo(
    () =>
      result?.data?.result?.map((res) => ({
        uuid: res.metric?.UUID,
        podname: res.metric?.pod,
        namespace: res.metric?.namespace,
        device: res.metric?.device,
        modelName: res.metric?.modelName,
      })),
    [result],
  );

  return [gpus, loading, error];
};

/**
 * Load additional data on top of thjose received from a metric.
 * Recently taken from Node's labels. This is expected to be changed in the future (either different labels or a new metric)
 * @param gpu podname and namespace are recently used to locate Node
 * @returns A copy of the "gpu" param enriched for additional details
 */
export const useEnrichedGPUInfo = (gpu?: GPUInfo): GPUInfo => {
  const [enriched, setEnriched] = React.useState<GPUInfo>();

  const [pod] = useK8sWatchResource<Pod>(
    gpu
      ? {
          kind: 'Pod',
          name: gpu.podname,
          namespace: gpu.namespace,
          isList: false,
        }
      : undefined,
  );

  const [node] = useK8sWatchResource<Node>(
    pod?.spec?.nodeName
      ? {
          kind: 'Node',
          name: pod.spec.nodeName,
          isList: false,
        }
      : undefined,
  );

  React.useEffect(() => {
    if (!gpu || !node?.metadata) {
      setEnriched(undefined);
      return;
    }

    const enriched: GPUInfo = { ...gpu };

    const driverMajor = node.metadata.labels?.['nvidia.com/cuda.driver.major'];
    const driverMinor = node.metadata.labels?.['nvidia.com/cuda.driver.minor'];
    const driverRev = node.metadata.labels?.['nvidia.com/cuda.driver.rev'];
    const count = node.metadata.labels?.['nvidia.com/gpu.count'];

    if (driverMajor) {
      enriched.driver = `${driverMajor}${driverMinor ? '.' + driverMinor : ''}${
        driverRev ? '-' + driverRev : ''
      }`;
    }

    if (count) {
      enriched.count = parseInt(count);
    }

    setEnriched(enriched);
  }, [gpu, node]);

  return enriched;
};
