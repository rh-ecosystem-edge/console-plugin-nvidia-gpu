import * as React from 'react';
import { Card, CardBody, DescriptionList, Level, LevelItem } from '@patternfly/react-core';
import { OverviewDetailItem } from '../../shared/OverviewDetailItem';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { useGPUNode } from '../../../hooks/use-gpus-info';
import { GPUDashboardContext } from '../GPUDashboardContext';
import { useTranslation } from '../../../i18n';

import './InfoCard.css';

/*
DCGM_FI_DEV_VBIOS_VERSION
DCGM_FI_DEV_SERIAL - Device Serial Number

*
*
*/
const InfoCard: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGPU, gpusLoaded, gpusError } = React.useContext(GPUDashboardContext);

  const [gpuNode, gpuNodeLoaded, gpuNodeError] = useGPUNode(selectedGPU);

  const loading = !gpusLoaded || !gpuNodeLoaded;
  const error =
    !loading && (gpusError || gpuNodeError || !selectedGPU) ? t('Not available') : undefined;

  const driverMajor = gpuNode?.metadata?.labels?.['nvidia.com/cuda.driver.major'];
  const driverMinor = gpuNode?.metadata?.labels?.['nvidia.com/cuda.driver.minor'];
  const driverRev = gpuNode?.metadata?.labels?.['nvidia.com/cuda.driver.rev'];

  let driver = '-';
  if (driverMajor) {
    driver = `${driverMajor}${driverMinor ? '.' + driverMinor : ''}${
      driverRev ? '-' + driverRev : ''
    }`;
  }

  return (
    <Card className="ng-info-card--full-height">
      <CardBody>
        <DescriptionList className="ng-info-card--full-height">
          <Level hasGutter className="ng-info-card--full-height">
            <LevelItem>
              <OverviewDetailItem
                title={t('Model')}
                isLoading={!gpusLoaded}
                error={gpusLoaded && (gpusError || !selectedGPU) ? t('Not available') : undefined}
              >
                {selectedGPU?.modelName}
              </OverviewDetailItem>
            </LevelItem>
            <LevelItem>
              <OverviewDetailItem title={t('Driver')} isLoading={loading} error={error}>
                {driver}
              </OverviewDetailItem>
            </LevelItem>
            <LevelItem>
              <OverviewDetailItem
                title={t('Node')}
                isLoading={loading}
                error={gpusLoaded && (gpusError || !selectedGPU) ? t('Not available') : undefined}
              >
                <ResourceLink
                  groupVersionKind={{
                    kind: 'Node',
                    version: 'v1',
                  }}
                  name={gpuNode?.metadata?.name}
                />
              </OverviewDetailItem>
            </LevelItem>
          </Level>
        </DescriptionList>
      </CardBody>
    </Card>
  );
};

export default InfoCard;
