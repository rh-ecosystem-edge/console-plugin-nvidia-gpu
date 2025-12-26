import * as React from 'react';
import {
  PageSection,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import InfoCard from './Cards/InfoCard';
import GPUSelector from './GPUSelector';
import { GPUDashboardGraphs } from './Cards/GPUDashboardGraphs';
import WorkloadsCard from './Cards/WorkloadsCard';
import { useGPUDashboardContextValues, GPUDashboardContext } from './GPUDashboardContext';
import MIGCard from './Cards/MIGCard';
import { useTranslation } from '../../i18n';

const GPUDashboard: React.FC = () => {
  const { t } = useTranslation();
  const gpuContextValues = useGPUDashboardContextValues();

  return (
    <GPUDashboardContext.Provider value={gpuContextValues}>
      <PageSection>
        <Stack hasGutter>
          <StackItem>
            <Split hasGutter>
              <SplitItem isFilled>
                <Title headingLevel="h1">{t('GPUs')}</Title>
              </SplitItem>
              <SplitItem>
                <GPUSelector />
              </SplitItem>
            </Split>
          </StackItem>
          <StackItem>
            <Grid hasGutter>
              <GridItem span={6}>
                <MIGCard />
              </GridItem>
              <GridItem span={6}>
                <InfoCard />
              </GridItem>
            </Grid>
          </StackItem>
          <StackItem>
            <GPUDashboardGraphs />
          </StackItem>
          <StackItem>
            <WorkloadsCard />
          </StackItem>
        </Stack>
      </PageSection>
    </GPUDashboardContext.Provider>
  );
};

export default GPUDashboard;
