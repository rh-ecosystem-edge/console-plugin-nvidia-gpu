import * as React from 'react';
import { Spinner } from '@patternfly/react-core';

import './OverviewDetailItem.css';

export type OverviewDetailItemProps = {
  title: string;
  isLoading?: boolean;
  error?: string;
  children?: React.ReactNode;
  valueClassName?: string;
};

export const OverviewDetailItem: React.FC<OverviewDetailItemProps> = ({
  title,
  isLoading,
  error,
  children,
  valueClassName,
}) => {
  let value: React.ReactNode;
  if (isLoading) {
    value = <Spinner size="md" />;
  } else if (error) {
    value = <span className="ng-overview-detail-item__error">{error}</span>;
  } else {
    value = children;
  }

  return (
    <dl className="ng-overview-detail-item">
      <dt className="ng-overview-detail-item__title">{title}</dt>
      <dd className={valueClassName ? `ng-overview-detail-item__value ${valueClassName}` : 'ng-overview-detail-item__value'}>{value}</dd>
    </dl>
  );
};

