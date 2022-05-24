export const ONE_SECOND = 1000;
export const ONE_MINUTE = 60 * ONE_SECOND;
export const ONE_HOUR = 60 * ONE_MINUTE;
export const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

export const LAST_LANGUAGE_LOCAL_STORAGE_KEY = 'bridge/last-language';

export const getLastLanguage = () => localStorage.getItem(LAST_LANGUAGE_LOCAL_STORAGE_KEY);

export const timeFormatter = new Intl.DateTimeFormat(getLastLanguage() || undefined, {
  hour: 'numeric',
  minute: 'numeric',
});
