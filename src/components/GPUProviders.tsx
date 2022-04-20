import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OverviewDetailItem } from '@openshift-console/console-plugin-shared';
import { useAllGpuProviders } from '../resources/nodes';

const GPUProviders: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [providers, loaded, loadError] = useAllGpuProviders();

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

  return (
    <OverviewDetailItem
      textNotAvailable={t('Not available')}
      title={t('GPU providers')}
      isLoading={!loaded}
      error={!!loadError}
      // valueClassName="co-select-to-copy"
    >
      {result}
    </OverviewDetailItem>
  );
};

export default GPUProviders;
