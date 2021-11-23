import { GetQuery, Humanize, GetMultilineQueries, HealthState, PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

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

export const healthHandler = (responses: {response: PrometheusResponse, error: any}[]) => {
  const { response, error } = responses[0];
  if (!response) {
    return {
      state: HealthState.LOADING,
    }
  } else if (error) {
    return {
      state: HealthState.NOT_AVAILABLE,
    }
  }
  
  const result = response.data.result[0].value?.[1];


  let state: HealthState;
  let message: string;
  switch (result) {
    case '1':
      state = HealthState.PROGRESS
      message = 'Updating'
      break;
    case '2':
      state = HealthState.OK
      break;
    case '-1':
      state = HealthState.NOT_AVAILABLE
      message = 'Cluster policy not available'
      break;
    case '-2':
      state = HealthState.ERROR
      break;
    default:
      state = HealthState.UNKNOWN
  }

  return { state, message }
}