import * as React from 'react';
import { StackItem, Stack } from '@patternfly/react-core';
import { CheckCircleIcon, InProgressIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { HealthState, StatusPopupItem, StatusPopupSection } from '@openshift-console/dynamic-plugin-sdk';
import { PrometheusHealthPopupProps, PrometheusHealthHandler, SubsystemHealth } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboard-types';
// import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk/lib/api/prometheus-types';
import { Link } from 'react-router-dom';
import { global_palette_green_500 as okColor } from '@patternfly/react-tokens/dist/js/global_palette_green_500';

//DCGM_FI_DEV_GPU_TEMP GPU temperature
//DCGM_FI_DEV_MEMORY_TEMP Memory temperature - does not have any data

//gpu_operator_node_cuda_ready ?


const GPUStatus: React.FC<PrometheusHealthPopupProps> = ({ responses }) => {
  const { t } = useTranslation("plugin__console-plugin-gpu");
  const operatorHealth = getOperatorHealth(responses);
  const temperatureHealth = getTemperatureHealth(responses);
  return (
    <Stack hasGutter>
      <StackItem>
        {t('Designed for parallel processing, the GPUs are used in a wide range of applications, including graphics and video rendering.')}
      </StackItem>
      <StackItem>
        <StatusPopupSection firstColumn="Resource" secondColumn="Status">
          <StatusPopupItem value={operatorHealth.message} icon={operatorHealth.icon}>
            <Link to="/monitoring/query-browser?query0=gpu_operator_reconciliation_status">{t('Operator')}</Link>
          </StatusPopupItem>
          <StatusPopupItem value={temperatureHealth.message} icon={temperatureHealth.icon}>
            <Link to="/monitoring/query-browser?query0=DCGM_FI_DEV_GPU_TEMP">{t('Temperature sensors')}</Link>
          </StatusPopupItem>
        </StatusPopupSection>
      </StackItem>
    </Stack>
  );
}

export default GPUStatus;

export const healthHandler: PrometheusHealthHandler = (responses) => {
  const operatorHealth = getOperatorHealth(responses);
  const temperatureHealth = getTemperatureHealth(responses);
  const healthStates = [operatorHealth.state, temperatureHealth.state];
  if (healthStates.includes(HealthState.LOADING)) {
    return { state: HealthState.LOADING }
  }
  if (healthStates.includes(HealthState.ERROR)) {
    return { state: HealthState.ERROR }
  }
  if (healthStates.includes(HealthState.WARNING)) {
    return { state: HealthState.WARNING }
  }
  if (healthStates.includes(HealthState.NOT_AVAILABLE)) {
    return { state: HealthState.NOT_AVAILABLE }
  }
  if (healthStates.includes(HealthState.PROGRESS)) {
    return { state: HealthState.PROGRESS }
  }
  if (healthStates.includes(HealthState.UNKNOWN)) {
    return { state: HealthState.UNKNOWN }
  }
  return { state: HealthState.OK };
}

type SubsystemHealthHandler = (responses: {response: any, error: any}[]) => SubsystemHealth & { icon?: React.ReactNode }

const getTemperatureHealth: SubsystemHealthHandler = (responses) => {
  const { response, error } = responses[1];
  if (!response) {
    return {
      state: HealthState.LOADING,
    }
  } else if (error) {
    return {
      state: HealthState.NOT_AVAILABLE,
      message: 'Not available'
    }
  }

  const temperatures = response.data.result?.map((r) => Number.parseInt(r.value?.[1])); // TODO remove false-y values ?

  temperatures.sort((a, b) => b -a);

  if (temperatures[0] > 70) {
    return {
      state: HealthState.ERROR,
      message: 'Danger'
    };
  } else if (temperatures[0] > 60) {
    return {
      state: HealthState.WARNING,
      message: 'Warning'
    };
  }

  return {
    state: HealthState.OK,
    message: 'Good',
    icon: <CheckCircleIcon color={okColor.value} />
  };
}

const getOperatorHealth: SubsystemHealthHandler = (responses) => {
  const { response, error } = responses[0];
  if (!response) {
    return {
      state: HealthState.LOADING,
    }
  } else if (error) {
    return {
      state: HealthState.NOT_AVAILABLE,
      message: 'Not available'
    }
  }
  
  const result = response.data.result?.[0]?.value?.[1];

  if (!result) {
    return { state: HealthState.NOT_AVAILABLE, message: 'Not available' };
  }

  let state: HealthState;
  let message: string;
  let icon: React.ReactNode;
  switch (result) {
    case '0':
      state = HealthState.PROGRESS
      message = 'Pending'
      icon = <InProgressIcon />
      break;
    case '1':
      state = HealthState.OK
      message = 'Healthy'
      icon =  <CheckCircleIcon color={okColor.value} />
      break;
    case '-1':
      state = HealthState.NOT_AVAILABLE
      message = 'Cluster policy not available'
      break;
    case '-2':
      state = HealthState.ERROR
      message = 'Degraded'
      break;
    default:
      state = HealthState.UNKNOWN
      message = 'Unknown'
  }

  return { state, message, icon };
}