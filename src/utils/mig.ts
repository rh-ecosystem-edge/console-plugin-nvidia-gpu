import * as _ from 'lodash';
import { Node } from '../resources';

export const getMIGStrategy = (gpuNode?: Node) =>
  gpuNode?.metadata?.labels?.['nvidia.com/mig.strategy'] || 'single';

export const getMixedMIGTypes = (gpuNode: Node) => {
  const migTypeKeys = _.uniq(
    Object.keys(gpuNode?.metadata?.labels || {})
      .filter((key) => key.startsWith('nvidia.com/mig-'))
      .map((key) => {
        const splittedKey = key.split('.', 4);
        return `${splittedKey.slice(0, splittedKey.length - 1).join('.')}`;
      }),
  );

  return migTypeKeys.reduce(
    (migs, migTypeKey) => {
      const count = gpuNode?.metadata?.labels?.[`${migTypeKey}.count`];
      const memory = gpuNode?.metadata?.labels?.[`${migTypeKey}.memory`];
      migs[migTypeKey] = {
        count: count !== undefined ? parseInt(count) : 0,
        memory: memory !== undefined ? parseInt(memory) : 0,
      };
      return migs;
    },
    {} as {
      [key: string]: {
        count: number;
        memory: number;
      };
    },
  );
};
