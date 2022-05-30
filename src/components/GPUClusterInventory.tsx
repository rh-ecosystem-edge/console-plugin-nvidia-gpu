import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  InventoryItem,
  InventoryItemTitle,
  InventoryItemLoading,
} from '@openshift-console/dynamic-plugin-sdk';
import { useAllGpuCount } from '../resources/nodes';

const GPUClusterInventory = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [gpuCount, loaded, loadError] = useAllGpuCount();

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
