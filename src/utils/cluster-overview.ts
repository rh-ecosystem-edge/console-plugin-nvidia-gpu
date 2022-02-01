import { GetQuery, Humanize, GetMultilineQueries } from '@openshift-console/dynamic-plugin-sdk';

export const getGPUUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"})) or vector(0)';
export const getGPUTotalUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE)) or vector(0)';

export const getPowerUsageUtilizationQuery: GetQuery = () => 'sum(DCGM_FI_DEV_POWER_USAGE)';

export const getUtilizationQueries: GetMultilineQueries = () => [
  {
    query: 'sum(DCGM_FI_DEV_ENC_UTIL) / count(DCGM_FI_DEV_ENC_UTIL)',
    desc: 'encoder',
  },
  {
    query: 'sum(DCGM_FI_DEV_DEC_UTIL) / count(DCGM_FI_DEV_ENC_UTIL)',
    desc: 'decoder',
  },
];

export const humanizePercentage: Humanize = (value) => ({
  string: `${value}%`,
  value: Number.parseFloat(`${value}`),
  unit: '%',
});

export const humanizeWatts: Humanize = (value) => {
  const humanized = Number.parseFloat(`${value}`).toFixed(2);
  return {
    string: `${humanized}W`,
    value: Number.parseFloat(humanized),
    unit: 'W',
  };
};

export const humanizeGPU: Humanize = (value) => ({
  string: `${value}`,
  value: Number.parseInt(`${value}`),
  unit: '',
});
