import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  InventoryItem,
  InventoryItemTitle,
  InventoryItemLoading,
} from '@openshift-console/dynamic-plugin-sdk';

type NodeKind = K8sResourceCommon & {
  status?: {
    capacity?: {
      'nvidia.com/gpu': string;
    };
  };
};

const GPUClusterInventory = () => {
  const { t } = useTranslation('plugin__console-plugin-gpu');
  const [nodes, loaded, loadError] = useK8sWatchResource<NodeKind[]>({
    groupVersionKind: {
      kind: 'Node',
      version: 'v1',
    },
    isList: true,
  });

  let gpuCount = 0;

  nodes.forEach((node) => {
    const gpus = node.status?.capacity?.['nvidia.com/gpu'];
    if (gpus) {
      gpuCount += Number.parseInt(gpus);
    }
  });

  let title: React.ReactNode = t('{{count}} Graphics Cards', { count: gpuCount });
  if (loadError) {
    title = t('Graphics Cards');
  } else if (!loaded) {
    title = (
      <>
        <InventoryItemLoading />
        {t('Graphics Cards')}
      </>
    );
  }

  return (
    <InventoryItem>
      <InventoryItemTitle>{title}</InventoryItemTitle>
    </InventoryItem>
  );
};

export default GPUClusterInventory;
