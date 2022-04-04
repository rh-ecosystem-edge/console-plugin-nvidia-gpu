import * as React from 'react';
import {
  Card,
  CardBody,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListTerm,
  Flex,
  FlexItem,
  FlexItemProps,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { GPUInfo, useEnrichedGPUInfo } from '../utils/gpuInfo';

type GPUInfoCardProps = {
  selectedGpu?: GPUInfo;
};

export const GPUInfoCard: React.FC<GPUInfoCardProps> = ({ selectedGpu }) => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');

  // Additional data needs to be loaded
  const gpuInfo = useEnrichedGPUInfo(selectedGpu);

  const itemProps: FlexItemProps = { spacer: { default: 'spacerLg' } };

  return (
    <Card isFlat>
      <CardBody>
        {selectedGpu ? (
          <DescriptionList>
            <Flex>
              <FlexItem {...itemProps}>
                <DescriptionListTerm>{t('Model')}</DescriptionListTerm>
                <DescriptionListDescription>
                  {selectedGpu?.modelName || '-'}
                </DescriptionListDescription>
              </FlexItem>

              <FlexItem {...itemProps}>
                <DescriptionListTerm>{t('Driver')}</DescriptionListTerm>
                <DescriptionListDescription>{gpuInfo?.driver || '-'}</DescriptionListDescription>
              </FlexItem>

              <FlexItem {...itemProps}>
                <DescriptionListTerm>{t('One of')}</DescriptionListTerm>
                <DescriptionListDescription>{gpuInfo?.count || '-'}</DescriptionListDescription>
              </FlexItem>
            </Flex>
          </DescriptionList>
        ) : (
          t('No GPU can be found in the cluster.')
        )}
      </CardBody>
    </Card>
  );
};
