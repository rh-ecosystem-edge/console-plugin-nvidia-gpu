import * as fuzzy from 'fuzzysearch';

export const fuzzyCaseInsensitive = (a: string, b: string): boolean =>
  fuzzy(a?.toLocaleLowerCase(), b?.toLocaleLowerCase());
