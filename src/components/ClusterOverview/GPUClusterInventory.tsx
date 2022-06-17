import * as React from 'react';
import {
  useK8sWatchResource,
  InventoryItem,
  InventoryItemTitle,
  InventoryItemLoading,
} from '@openshift-console/dynamic-plugin-sdk';
import { Node } from '../../resources';
import { getMIGStrategy, getMixedMIGTypes } from '../../utils/mig';
import { useTranslation } from '../../i18n';

const GPUClusterInventory = () => {
  const { t } = useTranslation();
  const [nodes, loaded, loadError] = useK8sWatchResource<Node[]>({
    groupVersionKind: {
      kind: 'Node',
      version: 'v1',
    },
    isList: true,
  });

  let gpuCount = 0;

  nodes.forEach((node) => {
    const migStrategy = getMIGStrategy(node);
    if (migStrategy === 'mixed') {
      const migTypes = getMixedMIGTypes(node);
      Object.values(migTypes).forEach(({ count }) => (gpuCount += count));
    } else {
      const gpus = node.status?.capacity?.['nvidia.com/gpu'];
      if (gpus) {
        gpuCount += Number.parseInt(gpus);
      }
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
