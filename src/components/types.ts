import * as React from 'react';
import { PrometheusTimeSerie } from '../utils/prometheus';

export type GPUDashboardCardGenericProps = {
  title: string;
  ariaTitle: string;
  rangeDescription: string;
  rangeTitle: string;
  unit: string /* I.e. '%'*/;
  maxDomain?: number /* I.e. 100 (like 100%) */;
  thresholds?: any[];
};

export type GPUDashboardCardProps = GPUDashboardCardGenericProps & {
  actualQuery: string;
  timeQuery: string;
  maximumQuery?: string;
  loading: boolean;
  info?: React.ReactElement;
};

export type GPUDashboardCardGraphsProps = GPUDashboardCardGenericProps & {
  scalarValue: number;
  timeSerie: PrometheusTimeSerie;
};
