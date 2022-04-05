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

  let result = t('No GPUs currently detected');
  if (providers.nvidia) {
    if (providers.amd) {
      if (providers.other) {
        result = t('NVIDIA, AMD and others');
      } else {
        result = t('NVIDIA and AMD');
      }
    } else {
      if (providers.other) {
        result = t('NVIDIA and others');
      } else {
        result = t('NVIDIA');
      }
    }
  } else {
    if (providers.amd) {
      if (providers.other) {
        result = t('AMD and others');
      } else {
        result = t('AMD');
      }
    } else {
      if (providers.other) {
        result = t('others');
      }
      // else no GPU
    }
  }

  return <>{result}</>;
};

export default GPUProviders;
