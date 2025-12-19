import * as React from 'react';
import { Card, CardBody, CardTitle, Skeleton, CardFooter, Bullseye } from '@patternfly/react-core';
import {
  usePrometheusPoll,
  PrometheusEndpoint,
  HumanizeResult,
  Humanize,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { Link } from 'react-router-dom';
import {
  getPrometheusResultScalarNumber,
  getPrometheusResultTimeSerie,
} from '../../../utils/prometheus';
import { useTranslation } from '../../../i18n';
import { timeFormatter } from '../../../utils/time';
import { useRefWidth } from '../../../hooks/use-ref-width';

import './MetricsCard.css';
import { GPUDashboardContext } from '../GPUDashboardContext';

type MetricsCardProps = {
  query: string;
  humanize: Humanize;
  title: string;
  ariaTitle: string;
  ariaDesc: string;
  ariaRangeTitle: string;
  maxDomain?: number;
  maxQuery?: string;
  defaultUnit?: string;
};

const MetricsCard: React.FC<MetricsCardProps> = ({
  ariaTitle,
  title,
  maxDomain = 0,
  ariaDesc,
  ariaRangeTitle,
  humanize,
  defaultUnit,
  ...rest
}) => {
  const { t } = useTranslation();
  const [containerRef, width] = useRefWidth();

  const { selectedGPU, gpusLoaded, gpusError } = React.useContext(GPUDashboardContext);
  const gpusErr = gpusLoaded && (!!gpusError || !selectedGPU);

  // do not run the queries if there is an error
  const [query, maxQuery] =
    gpusErr || !gpusLoaded ? [undefined, undefined] : [`${rest.query}[60m:5m]`, rest.maxQuery];
  const [result, queryLoaded, queryError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query,
  });

  const [maxResult, maxLoaded, maxError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    // do not run the query if there is an error
    query: maxQuery,
  });

  const timeSerie = getPrometheusResultTimeSerie(result);
  const max = maxDomain || getPrometheusResultScalarNumber(maxResult);

  const loading =
    !gpusLoaded || !queryLoaded || !maxLoaded || !result || (!!maxQuery && !maxResult);

  const error =
    gpusErr ||
    !!queryError ||
    !!maxError ||
    (!loading && (timeSerie === undefined || max === undefined));
  const timeData = timeSerie?.map((pair) => ({
    x: pair.time,
    y: pair.value,
  }));

  let actualInPercents: number | undefined;
  const latestValue = timeData?.[timeData?.length - 1].y;
  let currentValue: HumanizeResult | undefined = undefined;
  if (!error && latestValue !== undefined) {
    currentValue = humanize(latestValue, defaultUnit);
    actualInPercents = max ? (latestValue / max) * 100 : 0;
  }

  return (
    <Card className="ng-metrics-card">
      <CardTitle className="pf-v6-u-text-align-center">{title}</CardTitle>
      <CardBody>
        {loading && !error ? (
          <Bullseye>
            <Skeleton shape="circle" width="70%" screenreaderText={t('Loading card content')} />
          </Bullseye>
        ) : (
          <div ref={containerRef} className="ng-metrics-card__graph">
            <ChartDonutUtilization
              ariaDesc={title}
              ariaTitle={ariaTitle}
              constrainToVisibleArea={true}
              data={error ? { x: 0 } : { x: title, y: actualInPercents }}
              labels={({ datum }) => (datum.x ? `${title}: ${currentValue?.string}` : null)}
              title={error ? t('Not available') : `${currentValue?.string}`}
              thresholds={[{ value: 60 }, { value: 80 }]}
              width={width}
            />
          </div>
        )}
      </CardBody>
      <CardFooter className="ng-metrics-card">
        {loading && !error ? (
          <div style={{ height: '70px' }}>
            <Skeleton width="100%" height="100%" screenreaderText={t('Loading card content')} />
          </div>
        ) : (
          !error && (
            <div className="ng-metrics-card__graph">
              <Link to={`/monitoring/query-browser?query0=${rest.query}`}>
                <ChartGroup
                  ariaDesc={ariaDesc}
                  ariaTitle={ariaRangeTitle}
                  containerComponent={
                    <ChartVoronoiContainer
                      activateData={false}
                      voronoiDimension="x"
                      labels={({ datum }) =>
                        `${
                          humanize(datum.y, defaultUnit, currentValue?.unit).string
                        } at ${timeFormatter.format(new Date(datum.x * 1000))}`
                      }
                    />
                  }
                  height={60}
                  width={width}
                  maxDomain={{ y: timeData ? Math.max(...timeData.map((td) => td.y)) * 1.2 : 0 }}
                  padding={0}
                >
                  <ChartArea data={timeData} scale={{ x: 'time', y: 'linear' }} height={90} />
                </ChartGroup>
              </Link>
            </div>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default MetricsCard;
