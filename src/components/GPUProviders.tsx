import * as React from 'react';
import { InventoryItemLoading } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';

import { useAllGpuProviders } from '../resources/nodes';
import { Dash } from './Dash';

const GPUProviders: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [providers, loaded, loadError] = useAllGpuProviders();

  if (loadError) {
    return <Dash />;
  }

  if (!loaded) {
    return <InventoryItemLoading />;
  }

  let result = '';
  if (providers.nvidia) {
    result = t('NVIDIA');
  }
  if (providers.amd) {
    if (result && providers.other) {
      result += ', ';
    } else if (result) {
      result += t(' and ');
    }
    result += t('AMD');
  }
  if (providers.other) {
    if (result) {
      result += t(' and ');
    }
    result += t('other');
  }

  if (!result) {
    result = t('No GPUs currently detected');
  }

  return <>{result}</>;
};

export default GPUProviders;
