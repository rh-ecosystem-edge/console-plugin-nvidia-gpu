import * as React from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import {
  VirtualizedTable,
  TableColumn,
  RowProps,
  TableData,
  ResourceLink,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';
import { Pod, podReference } from '../resources';

const tableColumnInfo = [
  { className: '', id: 'name' },
  { className: '', id: 'namespace' },
];

const PodTableRow: React.FC<RowProps<Pod>> = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData
        {...tableColumnInfo[0]}
        className={classNames(tableColumnInfo[0].className, 'co-break-word')}
        activeColumnIDs={activeColumnIDs}
      >
        <ResourceLink
          kind={podReference}
          name={obj.metadata.name}
          namespace={obj.metadata.namespace}
        />
      </TableData>
      <TableData
        {...tableColumnInfo[1]}
        className={classNames(tableColumnInfo[1].className, 'co-break-word')}
        activeColumnIDs={activeColumnIDs}
      >
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
    </>
  );
};

export const GPUPods: React.FC<{
  gpuUuid?: string;
}> = ({ gpuUuid }) => {
  const { t } = useTranslation('plugin__console-plugin-nvidia-gpu');
  const [pods, loaded, loadError] = useK8sWatchResource<Pod[]>({
    groupVersionKind: {
      kind: 'Pod',
      version: 'v1',
    },
    namespaced: true,
    isList: true,
  });
  const loading = !gpuUuid;

  const columns = React.useMemo<TableColumn<Pod>[]>(
    () => [
      {
        title: t('Name'),
        sort: 'metadata.name',
        // transforms: [sortable],
        props: { className: tableColumnInfo[0].className },
        id: tableColumnInfo[0].id,
      },
      {
        title: t('Namespace'),
        sort: 'metadata.namespace',
        // transforms: [sortable],
        props: { className: tableColumnInfo[1].className },
        id: tableColumnInfo[1].id,
      },
    ],
    [t],
  );

  return (
    <>
      <VirtualizedTable<Pod>
        data={pods}
        unfilteredData={pods}
        loaded={!loading && loaded}
        loadError={loadError}
        aria-label={t('Pods requesting GPU')}
        columns={columns}
        Row={PodTableRow}
      />
    </>
  );
};
