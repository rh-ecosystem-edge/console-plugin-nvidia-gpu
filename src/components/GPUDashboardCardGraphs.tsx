import * as React from 'react';
import {
  ChartArea,
  ChartDonutUtilization,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import { CardBody, CardFooter } from '@patternfly/react-core';
// import { humanize } from '@openshift-console/dynamic-plugin-sdk';
import { GPUDashboardCardGraphsProps } from './types';

import './GPUDashboardCardGraphs.css';

export const GPUDashboardCardGraphs: React.FC<GPUDashboardCardGraphsProps> = ({
  title,
  ariaTitle,
  rangeTitle,
  rangeDescription,
  scalarValue,
  timeSerie,
  unit,
  maxDomain,
  thresholds,
}) => {
  // const now = new Date();
  // const getDatumLabel = ({ datum }) => {
  //   const dateTime = new Date(datum.x * 1000);
  //   return `${humanize.fromNow(dateTime, now)}: ${datum.y}`;
  // };

  const timeData = timeSerie.map((pair) => ({
    name: title,
    x: pair.time,
    y: pair.value,
  }));

  const actualInPercents = maxDomain ? (scalarValue / maxDomain) * 100 : 0;
  // maxDomain = maxDomain * 1.2; // Add 20% for the sparkline chart. Can we have minus values for something??

  return (
    <>
      <CardBody>
        <ChartDonutUtilization
          ariaDesc={title}
          ariaTitle={ariaTitle}
          constrainToVisibleArea={true}
          data={{ x: title, y: actualInPercents }}
          labels={({ datum }) => (datum.x ? `${title}: ${scalarValue}${unit}` : null)}
          // labels={({ datum }) => (datum.x ? `${datum.x}: ${datum.y}${unit}` : null)}
          // subTitle=""
          title={`${scalarValue}${unit}`}
          thresholds={thresholds}
        />
      </CardBody>
      <CardFooter className="gpu-dashboard-card-graphs-footer">
        <ChartGroup
          ariaDesc={rangeDescription}
          ariaTitle={rangeTitle}
          containerComponent={
            <ChartVoronoiContainer
              // width={50}
              // responsive={false}
              // labels={getDatumLabel}
              constrainToVisibleArea={true}
            />
          }
          height={90}
          maxDomain={{ y: maxDomain }}
          padding={0}
        >
          <ChartArea data={timeData} />
        </ChartGroup>
      </CardFooter>
    </>
  );
};
