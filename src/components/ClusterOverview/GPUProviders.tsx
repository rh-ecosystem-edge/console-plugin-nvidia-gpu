import * as React from 'react';
import { OverviewDetailItem } from '../shared/OverviewDetailItem';
import { useTranslation } from '../../i18n';
import { useGPUProviders } from '../../hooks/use-gpu-providers';

const GPUProviders: React.FC = () => {
  const { t } = useTranslation();
  const [providers, loaded, loadError] = useGPUProviders();

  let result = t('No GPUs detected');
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
      title={t('GPU providers')}
      isLoading={!loaded}
      error={loadError ? t('Not available') : undefined}
      // valueClassName="co-select-to-copy"
    >
      {result}
    </OverviewDetailItem>
  );
};

export default GPUProviders;
