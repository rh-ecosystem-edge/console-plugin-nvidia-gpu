/* eslint-disable */
import * as React from 'react';
import { Divider, Popover, Button, Content } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import Status from '@openshift-console/dynamic-plugin-sdk/lib/app/components/status/Status';
import * as _ from 'lodash';
import { useTranslation } from '../../i18n';

// This logic is replicated from k8s (at this writing, Kubernetes 1.17)
// (See https://github.com/kubernetes/kubernetes/blob/release-1.17/pkg/printers/internalversion/printers.go)
export const podPhase = (pod: any): any => {
  if (!pod || !pod.status) {
    return '';
  }

  if (pod.metadata.deletionTimestamp) {
    return 'Terminating';
  }

  if (pod.status.reason === 'NodeLost') {
    return 'Unknown';
  }

  if (pod.status.reason === 'Evicted') {
    return 'Evicted';
  }

  let initializing = false;
  let phase = pod.status.phase || pod.status.reason;

  _.each(pod.status.initContainerStatuses, (container: any, i: number) => {
    const { terminated, waiting } = container.state;
    if (terminated && terminated.exitCode === 0) {
      return true;
    }

    initializing = true;
    if (terminated && terminated.reason) {
      phase = `Init:${terminated.reason}`;
    } else if (terminated && !terminated.reason) {
      phase = terminated.signal
        ? `Init:Signal:${terminated.signal}`
        : `Init:ExitCode:${terminated.exitCode}`;
    } else if (waiting && waiting.reason && waiting.reason !== 'PodInitializing') {
      phase = `Init:${waiting.reason}`;
    } else {
      phase = `Init:${i}/${pod.status.initContainerStatuses.length}`;
    }
    return false;
  });

  if (!initializing) {
    let hasRunning = false;
    const containerStatuses = pod.status.containerStatuses || [];
    for (let i = containerStatuses.length - 1; i >= 0; i--) {
      const {
        state: { running, terminated, waiting },
        ready,
      } = containerStatuses[i];
      if (terminated && terminated.reason) {
        phase = terminated.reason;
      } else if (waiting && waiting.reason) {
        phase = waiting.reason;
      } else if (waiting && !waiting.reason) {
        phase = 'Waiting';
      } else if (terminated && !terminated.reason) {
        phase = terminated.signal
          ? `Signal:${terminated.signal}`
          : `ExitCode:${terminated.exitCode}`;
      } else if (running && ready) {
        hasRunning = true;
      }
    }

    // Change pod status back to "Running" if there is at least one container
    // still reporting as "Running" status.
    if (phase === 'Completed' && hasRunning) {
      phase = 'Running';
    }
  }

  return phase;
};

export type PodStatusProps = {
  pod: any;
};

export const PodStatus: React.FC<PodStatusProps> = ({ pod }) => {
  const status = podPhase(pod);
  const unschedulableCondition = pod.status?.conditions?.find(
    (condition: any) => condition.reason === 'Unschedulable' && condition.status === 'False',
  );
  const containerStatusStateWaiting = pod.status?.containerStatuses?.find(
    (cs: any) => cs.state?.waiting,
  );
  const { t } = useTranslation();

  if (status === 'Pending' && unschedulableCondition) {
    return (
      <PodStatusPopover
        bodyContent={unschedulableCondition.message}
        headerContent={t('Pod unschedulable')}
        status={status}
      />
    );
  }
  if (
    (status === 'CrashLoopBackOff' || status === 'ErrImagePull' || status === 'ImagePullBackOff') &&
    containerStatusStateWaiting
  ) {
    let footerLinks: React.ReactNode;
    let headerTitle = '';
    if (status === 'CrashLoopBackOff') {
      headerTitle = t('Pod crash loop back-off');
      const containers: any[] = pod.spec.containers;
      footerLinks = (
        <>
          <Content component="p">
            {t(
              'CrashLoopBackOff indicates that the application within the container is failing to start properly.',
            )}
          </Content>
          <Content component="p">
            {t('To troubleshoot, view logs and events, then debug in terminal.')}
          </Content>
          <Content component="p">
            <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/logs`}>
              {t('View logs')}
            </Link>
            &emsp;
            <Link to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/events`}>
              {t('View events')}
            </Link>
          </Content>
          <Divider />
          {containers.map((container) => {
            if (isContainerCrashLoopBackOff(pod, container.name) && !isWindowsPod(pod)) {
              return (
                <div key={container.name}>
                  <Link
                    to={`/k8s/ns/${pod.metadata.namespace}/pods/${pod.metadata.name}/containers/${container.name}/debug`}
                    data-test={`popup-debug-container-link-${container.name}`}
                  >
                    {t('Debug container {{name}}', { name: container.name })}
                  </Link>
                </div>
              );
            }
          })}
        </>
      );
    }

    return (
      <PodStatusPopover
        headerContent={headerTitle}
        bodyContent={containerStatusStateWaiting.state.waiting.message}
        footerContent={footerLinks}
        status={status}
      />
    );
  }

  return <Status status={status} />;
};

const PodStatusPopover: React.FC<any> = ({ bodyContent, headerContent, footerContent, status }) => {
  return (
    <Popover headerContent={headerContent} bodyContent={bodyContent} footerContent={footerContent}>
      <Button variant="link" isInline data-test="popover-status-button">
        <Status status={status} />
      </Button>
    </Popover>
  );
};

export const isContainerCrashLoopBackOff = (pod: any, containerName: string): boolean => {
  const containerStatus = pod?.status?.containerStatuses?.find(
    (c: any) => c.name === containerName,
  );
  const waitingReason = containerStatus?.state?.waiting?.reason;
  return waitingReason === 'CrashLoopBackOff';
};

export const isWindowsPod = (pod: any): boolean => {
  return pod?.spec?.tolerations?.some((t: any) => t.key === 'os' && t.value === 'Windows');
};
