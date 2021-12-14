import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  InventoryItem,
  InventoryItemTitle,
  InventoryItemBody,
  InventoryItemStatus,
  InventoryItemLoading,
} from '@openshift-console/dynamic-plugin-sdk';

const GPUClusterInventory = () => {
  const { t } = useTranslation("plugin__console-plugin-gpu");
  const [nodes, loaded, loadError] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: {
      kind: 'Node',
      version: 'v1',
      group: 'core',
    },
    isList: true,
  });

  const statuses = nodes.reduce((acc, node) => {
    if(node.metadata?.labels?.['node-role.kubernetes.io/worker']){
      acc.worker.count++;
    } else {
      acc.master.count++;
    }
    return acc;
  }, {worker: {count: 0, icon: <>ic2</>, linkTo: 'abc'}, master: {count: 0, icon: <>ic1</>}});

  let title = <Link  to="">{t('Graphics Cards')}</Link>;
  if (loadError) {
    title = <Link to="">{t('Graphics Cards')}</Link>;
  } else if (!loaded) {
    title = <><InventoryItemLoading /><Link to="">{t('Graphics Cards')}</Link></>;
  }

  return (
    <InventoryItem>
      <InventoryItemTitle>{title}</InventoryItemTitle>
      <InventoryItemBody error={loadError}>
        {Object.keys(statuses)
          .filter((k) => statuses[k].count !== 0)
          .map((k) => (
            <InventoryItemStatus
              key={k}
              count={statuses[k].count}
              icon={statuses[k].icon}
              linkTo={statuses[k].linkTo}
            />
        ))}
      </InventoryItemBody>
    </InventoryItem>
  )
};

export default GPUClusterInventory;