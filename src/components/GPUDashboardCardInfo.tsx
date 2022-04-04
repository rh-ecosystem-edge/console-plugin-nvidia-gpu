import * as React from 'react';
import { Popover, Stack, StackItem } from '@patternfly/react-core';
import { BlueInfoCircleIcon } from '@openshift-console/dynamic-plugin-sdk';

import './GPUDashboardCardInfo.css';

type GPUDashboardCardInfoProps = {
  header: string;
  actualInfo: string;
  timeInfo?: string;
};

export const GPUDashboardCardInfo: React.FC<GPUDashboardCardInfoProps> = ({
  header,
  actualInfo,
  timeInfo,
}) => (
  <Popover
    aria-label="Dashboard card description"
    maxWidth="20rem"
    minWidth="15rem"
    headerContent={<div>{header}</div>}
    bodyContent={
      <Stack hasGutter>
        <StackItem>{actualInfo}</StackItem>
        {timeInfo && <StackItem>{timeInfo}</StackItem>}
      </Stack>
    }
  >
    <a>
      <BlueInfoCircleIcon className="gpu-dashboard-card-info__icon" />
    </a>
  </Popover>
);
