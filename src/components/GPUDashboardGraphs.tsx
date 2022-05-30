import * as React from 'react';
import { Gallery } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

import { GPUDashboardCard } from './GPUDashboardCard';
import { GPUDashboardCardInfo } from './GPUDashboardCardInfo';

export const GPUDashboardGraphs: React.FC<{
  gpuUuid?: string;
}> = ({ gpuUuid }) => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const loading = !gpuUuid;

  return (
    <Gallery hasGutter>
      <GPUDashboardCard
        title={t('GPU utilization')}
        ariaTitle={t('Donut GPU utilization')}
        rangeTitle={t('GPU utilization over time')}
        rangeDescription={t('Sparkline GPU utilization')}
        actualQuery={`DCGM_FI_DEV_GPU_UTIL{UUID="${gpuUuid}"}`}
        timeQuery={`avg_over_time(DCGM_FI_DEV_GPU_UTIL{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maxDomain={100}
        unit="%"
        info={
          <GPUDashboardCardInfo
            header={t('GPU utilization')}
            actualInfo={t('Shows actual utilization of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />

      <GPUDashboardCard
        title={t('GPU temperature')}
        ariaTitle={t('Donut GPU temperature')}
        rangeTitle={t('GPU temperature over time')}
        rangeDescription={t('Sparkline GPU temperature')}
        actualQuery={`DCGM_FI_DEV_GPU_TEMP{UUID="${gpuUuid}"}`}
        timeQuery={`max_over_time(DCGM_FI_DEV_GPU_TEMP{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maximumQuery={
          // maximum per maxs of all GPUs
          'max(max_over_time(DCGM_FI_DEV_GPU_TEMP[1y]))'
        }
        // TODO: What about Fahrenheits?
        unit="°C"
        thresholds={
          // TODO: Fine-tune that
          [{ value: 60 }, { value: 80 }]
        }
        info={
          <GPUDashboardCardInfo
            header={t('GPU temperature')}
            actualInfo={t('Shows actual temperature of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute maximum for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />

      <GPUDashboardCard
        title={t('GPU power consumption')}
        ariaTitle={t('Donut GPU power consumption')}
        rangeTitle={t('GPU power consumption over time')}
        rangeDescription={t('Sparkline GPU power consumption')}
        actualQuery={`DCGM_FI_DEV_POWER_USAGE{UUID="${gpuUuid}"}`}
        timeQuery={`max_over_time(DCGM_FI_DEV_POWER_USAGE{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maximumQuery="max(max_over_time(DCGM_FI_DEV_POWER_USAGE[1y]))"
        unit="W"
        info={
          <GPUDashboardCardInfo
            header={t('GPU power consumption')}
            actualInfo={t('Shows actual power consumption of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute maximum for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />

      <GPUDashboardCard
        title={t('GPU clock speed')}
        ariaTitle={t('Donut GPU clock speed')}
        rangeTitle={t('GPU clock speed over time')}
        rangeDescription={t('Sparkline GPU clock speed')}
        actualQuery={`DCGM_FI_DEV_SM_CLOCK{UUID="${gpuUuid}"}`}
        timeQuery={`avg_over_time(DCGM_FI_DEV_SM_CLOCK{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maximumQuery="max(max_over_time(DCGM_FI_DEV_SM_CLOCK[1y]))"
        unit="MHz"
        info={
          <GPUDashboardCardInfo
            header={t('GPU clock speed')}
            actualInfo={t('Shows actual clock speed of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />

      <GPUDashboardCard
        title={t('GPU memory clock speed')}
        ariaTitle={t('Donut GPU memory clock speed')}
        rangeTitle={t('GPU memory clock speed over time')}
        rangeDescription={t('Sparkline GPU memory clock speed')}
        actualQuery={`DCGM_FI_DEV_MEM_CLOCK{UUID="${gpuUuid}"}`}
        timeQuery={`avg_over_time(DCGM_FI_DEV_MEM_CLOCK{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maximumQuery="max(max_over_time(DCGM_FI_DEV_MEM_CLOCK[1y]))"
        unit="MHz"
        info={
          <GPUDashboardCardInfo
            header={t('GPU memory clock speed')}
            actualInfo={t('Shows actual memory clock speed of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />

      <GPUDashboardCard
        title={t('GPU memory utilization')}
        ariaTitle={t('Donut GPU memory utilization')}
        rangeTitle={t('GPU memory utilization over time')}
        rangeDescription={t('Sparkline GPU memory utilization')}
        actualQuery={`DCGM_FI_DEV_MEM_COPY_UTIL{UUID="${gpuUuid}"}`}
        timeQuery={`avg_over_time(DCGM_FI_DEV_MEM_COPY_UTIL{UUID="${gpuUuid}"}[5m])[60m:5m]`}
        maxDomain={100}
        unit="%"
        info={
          <GPUDashboardCardInfo
            header={t('GPU memory utilization')}
            actualInfo={t('Shows actual memory utilization of the GPU.')}
            timeInfo={t(
              'The sparkling chart bellow shows 5-minute average for the last one hour with 5-minute step.',
            )}
          />
        }
        loading={loading}
      />
    </Gallery>
  );
};
