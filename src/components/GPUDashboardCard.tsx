import * as React from 'react';
import { Card, CardBody, CardTitle, Skeleton } from '@patternfly/react-core';
import { usePrometheusPoll, PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { getPrometheusResultScalarNumber, getPrometheusResultTimeSerie } from '../utils/prometheus';
import { GPUDashboardCardProps } from './types';
import { GPUDashboardCardGraphs } from './GPUDashboardCardGraphs';

const GPUDashboardCardError: React.FC<{ error: any }> = ({ error }) => {
  console.error('Prometheus error: ', error);
  // TODO: add icon
  return <CardBody>N/A</CardBody>;
};

const GPUDashboardCardLoading: React.FC = () => {
  return <Skeleton shape="square" width="100%" screenreaderText="Loading card content" />;
};

export const GPUDashboardCard: React.FC<GPUDashboardCardProps> = ({
  actualQuery,
  timeQuery,
  maximumQuery,
  loading,
  info,
  ...props
}) => {
  const { title, maxDomain } = props;

  //   {
  //   /** Delay between polling requests */
  //   delay?: number;
  //   /** One of the well-defined Prometheus API endpoints */
  //   endpoint: PrometheusEndpoint;
  //   namespace?: string;
  //   /** Prometheus query */
  //   query: string;
  //   /** A search parameter */
  //   timeout?: string;
  //   /** A vector-query search parameter */
  //   endTime?: number;
  //   /** A vector-query search parameter */
  //   samples?: number;
  //   /** A vector-query search parameter */
  //   timespan?: number;
  // };

  const [resultActual, loadingActual, errorActual] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: actualQuery,
  });

  const [resultTime, loadingTime, errorTime] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: timeQuery,
  });

  const [max] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    // Does nothing if query is falsy
    query: maximumQuery,
  });

  const scalarValue = getPrometheusResultScalarNumber(resultActual);
  const timeSerie = getPrometheusResultTimeSerie(resultTime);
  const maxValue = getPrometheusResultScalarNumber(max);

  // Only if maxDomain is not provided.
  // Find maximum from both historical- and time- series. Avoids timing issue with polling.
  const maximum =
    maxDomain ||
    Math.max(...(timeSerie || []).map((pair) => pair.value), scalarValue, maxValue) ||
    0;

  const error = errorActual && errorTime;
  loading = loading || (loadingActual && loadingTime) || scalarValue === undefined || !timeSerie;

  return (
    <Card height={'25rem'}>
      <CardTitle className="pf-u-text-align-center">
        {title}
        {info}
      </CardTitle>
      {error && <GPUDashboardCardError error={error} />}
      {!error && loading && <GPUDashboardCardLoading />}
      {!error && !loading && (
        <GPUDashboardCardGraphs
          {...props}
          scalarValue={scalarValue}
          timeSerie={timeSerie}
          maxDomain={maximum}
        />
      )}
    </Card>
  );
};
