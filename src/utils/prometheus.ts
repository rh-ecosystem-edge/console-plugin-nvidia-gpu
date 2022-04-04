import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const getPrometheusResultScalarNumber = (
  result: PrometheusResponse | undefined,
): number | undefined => {
  if (result?.data?.resultType === 'vector') {
    const scalarValueStr = result?.data?.result?.[0]?.value?.[1];
    return !!scalarValueStr ? parseFloat(scalarValueStr) : undefined;
  }

  if (result?.data?.resultType === 'matrix') {
    // take the last value
    const values = result?.data?.result?.[0]?.values;
    const timeValuePair = values?.[values?.length - 1];
    return timeValuePair?.length === 2 ? parseFloat(timeValuePair[1]) : undefined;
  }

  return undefined;
};

export type PrometheusTimeSerie = { time: number; value: number }[];

export const getPrometheusResultTimeSerie = (
  result: PrometheusResponse | undefined,
): PrometheusTimeSerie | undefined => {
  if (result?.data?.resultType === 'matrix') {
    const values = result?.data?.result?.[0]?.values;
    return values?.map((timeValuePair) => ({
      time: timeValuePair[0], // numeric timestamp (in seconds)
      value: parseFloat(timeValuePair[1]),
    }));
  }

  return undefined;
};
