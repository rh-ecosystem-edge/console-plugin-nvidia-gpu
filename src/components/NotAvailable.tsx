import * as React from 'react';
import { useTranslation } from '../i18n';

import './NotAvailable.css';

const NotAvailable = () => {
  const { t } = useTranslation();
  return <div className="ng-not-available">{t('Not available')}</div>;
};

export default NotAvailable;
