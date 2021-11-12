import { GetQuery, Humanize, GetMultilineQueries } from '@openshift-console/dynamic-plugin-sdk';

export const getPowerUsageUtilizationQuery: GetQuery = () => 'sum(DCGM_FI_DEV_POWER_USAGE)';

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
}

export const getUtilizationQueries: GetMultilineQueries = () => [
  {
    query: 'sum(DCGM_FI_DEV_ENC_UTIL)',
    desc: 'encoder'
  },
  {
    query: 'sum(DCGM_FI_DEV_DEC_UTIL)',
    desc: 'decoder'
  },
]