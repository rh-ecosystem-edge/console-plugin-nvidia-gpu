import * as React from 'react';
import {
  VirtualizedTable,
  TableColumn,
  RowProps,
  TableData,
  ResourceLink,
  useK8sWatchResource,
  usePrometheusPoll,
  PrometheusEndpoint,
  PrometheusResponse,
  HumanizeResult,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  EmptyStateBody,
} from '@patternfly/react-core';
import { sortable } from '@patternfly/react-table';
import { CubesIcon } from '@patternfly/react-icons';
import { Pod } from '../../../resources';
import { useTranslation } from '../../../i18n';
import { GPUDashboardContext } from '../GPUDashboardContext';
import { formatCores, humanizeBinaryBytes, humanizeRatio } from '../../../utils/units';
import { podPhase, PodStatus } from '../../PodStatus/PodStatus';
import { ONE_DAY } from '../../../utils/time';
import { sortResourceByValue } from '../../../utils/utils';

import './WorkloadsCard.css';

type PodWithMetrics = Pod & {
  gpuUsage: HumanizeResult;
  cpuUsage: HumanizeResult | undefined;
  memoryUsage: HumanizeResult | undefined;
};

const NoDataEmptyMsg = () => {
  const { t } = useTranslation();
  return (
    <EmptyState icon={CubesIcon}>
      <EmptyStateBody>{t('No workloads found')}</EmptyStateBody>
    </EmptyState>
  );
};

const tableColumnInfo = [
  { className: 'ng-break-word', id: 'name' },
  { className: 'ng-break-word', id: 'namespace' },
  { className: 'ng-break-word', id: 'status' },
  { className: 'ng-break-word', id: 'cpu' },
  { className: 'ng-break-word', id: 'memory' },
  { className: 'ng-break-word', id: 'gpu' },
];

const getPodMetricValue = (metrics: PrometheusResponse | undefined, pod: Pod) =>
  metrics?.data.result.find(
    (m) => m.metric.namespace === pod.metadata?.namespace && m.metric.pod === pod.metadata.name,
  );

const PodTableRow: React.FC<RowProps<PodWithMetrics>> = ({ obj, activeColumnIDs }) => (
  <>
    <TableData {...tableColumnInfo[0]} activeColumnIDs={activeColumnIDs}>
      <ResourceLink
        groupVersionKind={{
          kind: 'Pod',
          version: 'v1',
        }}
        name={obj.metadata?.name}
        namespace={obj.metadata?.namespace}
      />
    </TableData>
    <TableData {...tableColumnInfo[1]} activeColumnIDs={activeColumnIDs}>
      <ResourceLink
        groupVersionKind={{
          kind: 'Project',
          version: 'v1',
          group: 'project.openshift.io',
        }}
        name={obj.metadata?.namespace}
      />
    </TableData>
    <TableData {...tableColumnInfo[2]} activeColumnIDs={activeColumnIDs}>
      <PodStatus pod={obj} />
    </TableData>
    <TableData {...tableColumnInfo[3]} activeColumnIDs={activeColumnIDs}>
      {obj.cpuUsage?.string || '-'}
    </TableData>
    <TableData {...tableColumnInfo[4]} activeColumnIDs={activeColumnIDs}>
      {obj.memoryUsage?.string || '-'}
    </TableData>
    <TableData {...tableColumnInfo[5]} activeColumnIDs={activeColumnIDs}>
      {obj.gpuUsage.string}
    </TableData>
  </>
);

const WorkloadsCard: React.FC = () => {
  const { t } = useTranslation();
  const { gpusLoaded, selectedGPU, gpusError } = React.useContext(GPUDashboardContext);

  const [pods, podsLoaded, podsLoadError] = useK8sWatchResource<Pod[]>({
    groupVersionKind: {
      kind: 'Pod',
      version: 'v1',
    },
    namespaced: true,
    isList: true,
  });

  const loaded = gpusLoaded && podsLoaded;
  const loadError = podsLoadError || gpusError;

  const [cpuMetrics] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'pod:container_cpu_usage:sum',
  });

  const [memoryMetrics] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: 'sum(container_memory_working_set_bytes{container=""}) BY (pod, namespace)',
  });

  const [gpuMemoryMetrics, gpuMetricsLoaded, gpuMetricsError] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    query:
      'sum (DCGM_FI_PROF_GR_ENGINE_ACTIVE{exported_pod=~".+"}) by (exported_namespace, exported_pod, UUID)',
    timespan: ONE_DAY,
  });

  const columns = React.useMemo<TableColumn<PodWithMetrics>[]>(
    () => [
      {
        title: t('Name'),
        sort: 'metadata.name',
        transforms: [sortable],
        props: { className: tableColumnInfo[0].className },
        id: tableColumnInfo[0].id,
      },
      {
        title: t('Namespace'),
        sort: 'metadata.namespace',
        transforms: [sortable],
        props: { className: tableColumnInfo[1].className },
        id: tableColumnInfo[1].id,
      },
      {
        title: t('Status'),
        sort: (data, direction) => data.sort(sortResourceByValue<Pod>(direction, podPhase)),
        transforms: [sortable],
        props: { className: tableColumnInfo[2].className },
        id: tableColumnInfo[2].id,
      },
      {
        title: t('CPU'),
        sort: 'cpuUsage.value',
        transforms: [sortable],
        props: { className: tableColumnInfo[3].className },
        id: tableColumnInfo[3].id,
      },
      {
        title: t('Memory'),
        sort: 'memoryUsage.value',
        transforms: [sortable],
        props: { className: tableColumnInfo[4].className },
        id: tableColumnInfo[4].id,
      },
      {
        title: t('GPU'),
        sort: 'gpuUsage.value',
        transforms: [sortable],
        props: { className: tableColumnInfo[5].className },
        id: tableColumnInfo[5].id,
      },
    ],
    [t],
  );

  const workloads = pods.reduce((acc, pod) => {
    const gpuMetrics = gpuMemoryMetrics?.data?.result.find(
      (m) =>
        m.metric['exported_namespace'] === pod.metadata?.namespace &&
        m.metric['exported_pod'] === pod.metadata.name &&
        selectedGPU?.uuid === m.metric['UUID'],
    );
    const currentValue = gpuMetrics?.values?.[0]?.[1];
    const gpuUsage =
      currentValue !== undefined ? humanizeRatio(parseFloat(currentValue)) : undefined;
    if (gpuUsage) {
      const podCPUMetric = getPodMetricValue(cpuMetrics, pod);
      const podMemoryMetric = getPodMetricValue(memoryMetrics, pod);

      let cpuUsage = undefined;
      if (podCPUMetric?.value?.[1]) {
        const value = parseFloat(podCPUMetric?.value?.[1]);
        cpuUsage = {
          string: formatCores(value),
          value,
          unit: '',
        };
      }

      const memoryUsage = podMemoryMetric?.value?.[1]
        ? humanizeBinaryBytes(parseFloat(podMemoryMetric?.value?.[1]), undefined, 'MiB')
        : undefined;

      acc.push({
        ...pod,
        gpuUsage,
        cpuUsage,
        memoryUsage,
      });
    }
    return acc;
  }, [] as PodWithMetrics[]);

  return (
    <Card>
      <CardTitle>{t('Workloads')}</CardTitle>
      <div className="ng-workloads-card">
        <CardBody>
          <VirtualizedTable<PodWithMetrics>
            data={workloads}
            unfilteredData={workloads}
            loaded={loaded && gpuMetricsLoaded && !!gpuMemoryMetrics}
            loadError={loadError || gpuMetricsError}
            aria-label={t('Workloads')}
            columns={columns}
            Row={PodTableRow}
            NoDataEmptyMsg={NoDataEmptyMsg}
          />
        </CardBody>
      </div>
    </Card>
  );
};

export default WorkloadsCard;
