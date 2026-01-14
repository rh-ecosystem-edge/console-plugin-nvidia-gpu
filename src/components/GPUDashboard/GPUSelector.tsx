import * as React from 'react';
import {
  SelectOption,
  SelectList,
  SelectOptionProps,
  Select,
  Spinner,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import { GPUDashboardContext } from './GPUDashboardContext';
import { useTranslation } from '../../i18n';

const GPUSelector: React.FC = () => {
  const { t } = useTranslation();
  const { selectedGPU, gpus, setSelectedGPU, gpusLoaded, gpusError } =
    React.useContext(GPUDashboardContext);
  const [isOpen, setOpen] = React.useState(false);

  const isDisabled = !gpus?.length || !!gpusError || !gpusLoaded;

  let items: React.ReactElement<SelectOptionProps>[];

  if (!gpusLoaded) {
    items = [
      <SelectOption key="disabled" value={t('Loading GPUs')} isDisabled>
        <Spinner size="md" /> {t('Loading GPUs')}
      </SelectOption>,
    ];
  } else if (!gpus?.length || gpusError) {
    items = [
      <SelectOption key="disabled" value={t('No GPU found')} isDisabled>
        {t('No GPU found')}
      </SelectOption>,
    ];
  } else {
    items = gpus.map((gpu) => (
      <SelectOption key={gpu.uuid} value={gpu.uuid} description={`Model: ${gpu.modelName}`}>
        {gpu.uuid}
      </SelectOption>
    ));
  }

  return (
    <Select
      isOpen={isOpen}
      selected={selectedGPU?.uuid}
      onSelect={(_event, selection) => {
        setSelectedGPU(selection as string);
        setOpen(false);
      }}
      onOpenChange={(isOpen) => setOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setOpen(!isOpen)}
          isExpanded={isOpen}
          isDisabled={isDisabled}
        >
          {selectedGPU?.uuid || t('Select GPU')}
        </MenuToggle>
      )}
    >
      <SelectList>{items}</SelectList>
    </Select>
  );
};

export default GPUSelector;
