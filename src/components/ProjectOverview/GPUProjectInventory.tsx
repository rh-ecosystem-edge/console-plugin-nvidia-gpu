import {
  InventoryItem,
  InventoryItemLoading,
  InventoryItemTitle,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import * as React from 'react';
import { useTranslation } from '../../i18n';
import { Pod } from '../../resources';

type GPUProjectInventoryProps = {
  projectName: string;
};

const GPUProjectInventory = ({ projectName }: GPUProjectInventoryProps) => {
  const { t } = useTranslation();
  const [pods, loaded, loadError] = useK8sWatchResource<Pod[]>({
    groupVersionKind: {
      kind: 'Pod',
      version: 'v1',
    },
    isList: true,
    namespace: projectName,
  });

  const gpuPods = pods.filter((p) =>
    p.spec?.containers?.some(
      (c) => c.resources?.requests?.['nvidia.com/gpu'] || c.resources?.limits?.['nvidia.com/gpu'],
    ),
  );

  let title: React.ReactNode = t('{{count}} GPU pod', { count: gpuPods.length });
  if (loadError) {
    title = t('GPU pods');
  } else if (!loaded) {
    title = (
      <>
        <InventoryItemLoading />
        {t('GPU pods')}
      </>
    );
  }

  return (
    <InventoryItem>
      <InventoryItemTitle>{title}</InventoryItemTitle>
    </InventoryItem>
  );
};

export default GPUProjectInventory;
