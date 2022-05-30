import * as React from 'react';
import {
  Alert,
  AlertVariant,
  Page,
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useAllGPUsInfo } from '../utils/gpuInfo';
import { GPUInfoCard } from './GPUInfoCard';
import { GPUDropdown } from './GPUDropdown';
import { GPUDashboardGraphs } from './GPUDashboardGraphs';

import './GPUDashboard.css';
import { GPUPods } from './GPUPods';

/* Chaotic list of TODOs:
  - Add "New" badge in gpu-dashboard nav item - replace string by a component in console-extensions.json
  - tune polling interval
  - tune thresholds
  - card sizes on different displayes
  - fix errors when loading i18n translations
*/

// https://issues.redhat.com/browse/MGMT-9263
// https://miro.com/app/board/uXjVOeUB2B4=/?moveToWidget=3458764514332229879&cot=14

// https://gcsweb-ci.apps.ci.l2s4.p1.openshiftapps.com/gcs/origin-ci-test/logs/periodic-ci-rh-ecosystem-edge-ci-artifacts-master-4.10-nvidia-gpu-operator-e2e-master/1510754193349021696/artifacts/nvidia-gpu-operator-e2e-master/nightly/artifacts/010__gpu_operator__wait_deployment/metrics.dcgm.txt

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [gpus, gpusLoading, gpusError] = useAllGPUsInfo();
  const [gpuUuid, setGpuUuid] = React.useState<string>(); // GPU-43d4af7b-4cbb-1577-c1d4-e908416fda4a , GPU-a458dc79-5837-1cd9-120f-99a4c1e0cb66

  const selectedGpu = gpus?.find((gpuInfo) => gpuInfo.uuid === gpuUuid);

  React.useEffect(() => {
    if (!gpuUuid && gpus?.length) {
      setGpuUuid(gpus[0].uuid);
    }
  }, [gpus]);

  return (
    <Page>
      <PageSection isFilled>
        <Stack hasGutter>
          <StackItem>
            {gpusError && (
              <Alert
                variant={AlertVariant.danger}
                title={t('Failed to get info about GPUs')}
                isInline
              >
                {gpusError}
              </Alert>
            )}
            {!gpusLoading && gpus?.length === 0 && (
              <Alert variant={AlertVariant.info} title={t('No GPU detected')} isInline>
                {t('No GPU can be found in the cluster.')}
              </Alert>
            )}
          </StackItem>
          <StackItem>
            <Title headingLevel="h1">{t('GPUs')}</Title>
          </StackItem>
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <GPUInfoCard selectedGpu={selectedGpu} />
              </SplitItem>
              <SplitItem>
                <GPUDropdown
                  gpus={gpus}
                  onSelect={setGpuUuid}
                  selectedUuid={gpuUuid}
                  className="gpu-dashboard__dropdown-gpus"
                />
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <GPUDashboardGraphs gpuUuid={gpuUuid} />
          </StackItem>
          <StackItem>
            <GPUPods gpuUuid={gpuUuid} />
          </StackItem>
        </Stack>
      </PageSection>
    </Page>
  );
};

export default GPUDashboard;
