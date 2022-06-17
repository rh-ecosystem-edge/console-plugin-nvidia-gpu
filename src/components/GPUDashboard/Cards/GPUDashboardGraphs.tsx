import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';

import MetricsCard from './MetricsCard';
import { GPUDashboardContext } from '../GPUDashboardContext';
import {
  humanizeDegrees,
  humanizeHertz,
  humanizePercentage,
  humanizeRatio,
  humanizeWatts,
} from '../../../utils/units';
import { useTranslation } from '../../../i18n';

// DCGM_FI_DEV_GPU_MAX_OP_TEMP missing in https://github.com/NVIDIA/dcgm-exporter
// DCGM_FI_DEV_MEM_MAX_OP_TEMP missing in https://github.com/NVIDIA/dcgm-exporter
//

/*
 these are ok: 
    DCGM_FI_DEV_GPU_UTIL, gauge, gpu utilization.
    DCGM_FI_DEV_POWER_USAGE, gauge, power usage.
    DCGM_FI_DEV_GPU_TEMP, gauge, gpu temp.
    DCGM_FI_DEV_MEMORY_TEMP, gauge, memory temp. // no data
    DCGM_FI_DEV_SM_CLOCK,  gauge, SM clock frequency (in MHz).
    DCGM_FI_DEV_MAX_SM_CLOCK, gauge, GPU max.
    DCGM_FI_DEV_MEM_CLOCK, gauge, mem clock.
    DCGM_FI_DEV_MAX_MEM_CLOCK, gauge, Mem max.
    DCGM_FI_DEV_MEM_COPY_UTIL, gauge, Mem utilization.
    DCGM_FI_DEV_FAN_SPEED, gauge, Fan speed. //no data
    DCGM_FI_DEV_POWER_MGMT_LIMIT_MAX, gauge, max power mgmt limit
*/

/* Used metrics
    DCGM_FI_PROF_GR_ENGINE_ACTIVE, gauge, gpu utilization.
    DCGM_FI_DEV_MEM_COPY_UTIL, gauge, mem utilization.
    DCGM_FI_DEV_ENC_UTIL, gauge, enc utilization.
    DCGM_FI_DEV_DEC_UTIL, gauge, dec utilization.
    DCGM_FI_DEV_POWER_USAGE, gauge, power usage.
    DCGM_FI_DEV_POWER_MGMT_LIMIT_MAX, gauge, power mgmt limit.
    DCGM_FI_DEV_GPU_TEMP, gauge, gpu temp.
    DCGM_FI_DEV_SM_CLOCK, gauge, sm clock.
    DCGM_FI_DEV_MAX_SM_CLOCK, gauge, max sm clock.
    DCGM_FI_DEV_MEM_CLOCK, gauge, mem clock.
    DCGM_FI_DEV_MAX_MEM_CLOCK, gauge, max mem clock.
*/

export const GPUDashboardGraphs: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGPU } = React.useContext(GPUDashboardContext);

  return (
    <Grid hasGutter>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('GPU utilization')}
          ariaTitle={t('Donut GPU utilization')}
          ariaRangeTitle={t('GPU utilization over time')}
          ariaDesc={t('Sparkline GPU utilization')}
          query={`sum(DCGM_FI_PROF_GR_ENGINE_ACTIVE{UUID="${selectedGPU?.uuid}"})`}
          maxDomain={100}
          humanize={humanizeRatio}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('Memory utilization')}
          ariaTitle={t('Donut GPU memory utilization')}
          ariaRangeTitle={t('GPU memory utilization over time')}
          ariaDesc={t('Sparkline GPU memory utilization')}
          query={`sum(DCGM_FI_DEV_MEM_COPY_UTIL{UUID="${selectedGPU?.uuid}"})`}
          maxDomain={100}
          humanize={humanizePercentage}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('Encoder utilization')}
          ariaTitle={t('Donut Encoder utilization')}
          ariaRangeTitle={t('Encoder utilization over time')}
          ariaDesc={t('Sparkline Encoder utilization')}
          query={`sum(DCGM_FI_DEV_ENC_UTIL{UUID="${selectedGPU?.uuid}"})`}
          maxDomain={100}
          humanize={humanizePercentage}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('Decoder utilization')}
          ariaTitle={t('Donut Decoder utilization')}
          ariaRangeTitle={t('Decoder utilization over time')}
          ariaDesc={t('Sparkline Decoder utilization')}
          query={`sum(DCGM_FI_DEV_DEC_UTIL{UUID="${selectedGPU?.uuid}"})`}
          maxDomain={100}
          humanize={humanizePercentage}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('Power consumption')}
          ariaTitle={t('Donut GPU power consumption')}
          ariaRangeTitle={t('GPU power consumption over time')}
          ariaDesc={t('Sparkline GPU power consumption')}
          query={`avg(DCGM_FI_DEV_POWER_USAGE{UUID="${selectedGPU?.uuid}"})`}
          maxQuery={`DCGM_FI_DEV_POWER_MGMT_LIMIT_MAX{UUID="${selectedGPU?.uuid}"}`}
          humanize={humanizeWatts}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('GPU temperature')}
          ariaTitle={t('Donut GPU temperature')}
          ariaRangeTitle={t('GPU temperature over time')}
          ariaDesc={t('Sparkline GPU temperature')}
          query={`avg(DCGM_FI_DEV_GPU_TEMP{UUID="${selectedGPU?.uuid}"})`}
          maxDomain={110}
          humanize={humanizeDegrees}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('GPU clock speed')}
          ariaTitle={t('Donut GPU clock speed')}
          ariaRangeTitle={t('GPU clock speed over time')}
          ariaDesc={t('Sparkline GPU clock speed')}
          query={`avg(DCGM_FI_DEV_SM_CLOCK{UUID="${selectedGPU?.uuid}"})`}
          maxQuery={`DCGM_FI_DEV_MAX_SM_CLOCK{UUID="${selectedGPU?.uuid}"}`}
          defaultUnit="MHz"
          humanize={humanizeHertz}
        />
      </GridItem>
      <GridItem span={6} lg={3}>
        <MetricsCard
          title={t('Memory clock speed')}
          ariaTitle={t('Donut GPU memory clock speed')}
          ariaRangeTitle={t('GPU memory clock speed over time')}
          ariaDesc={t('Sparkline GPU memory clock speed')}
          query={`DCGM_FI_DEV_MEM_CLOCK{UUID="${selectedGPU?.uuid}"}`}
          maxQuery={`DCGM_FI_DEV_MAX_MEM_CLOCK{UUID="${selectedGPU?.uuid}"}`}
          defaultUnit="MHz"
          humanize={humanizeHertz}
        />
      </GridItem>
    </Grid>
  );
};
