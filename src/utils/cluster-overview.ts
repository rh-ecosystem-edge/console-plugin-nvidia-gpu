import { GetQuery, GetMultilineQueries } from '@openshift-console/dynamic-plugin-sdk';

export const getGPUUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"})) or vector(0)';
export const getGPUTotalUtilizationQuery: GetQuery = () =>
  'count(count by (UUID,GPU_I_ID) (DCGM_FI_PROF_GR_ENGINE_ACTIVE)) or vector(0)';

export const getPowerUsageUtilizationQuery: GetQuery = () =>
  'sum(max by (UUID) (DCGM_FI_DEV_POWER_USAGE))';

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
