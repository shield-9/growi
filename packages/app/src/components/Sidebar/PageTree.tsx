import React, { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';

import ItemsTree from './PageTree/ItemsTree';
import PrivateLegacyPages from './PageTree/PrivateLegacyPages';


const PageTree: FC = memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <div className="grw-sidebar-content-header p-3">
        <h3 className="mb-0">{t('Page Tree')}</h3>
      </div>

      <div className="grw-sidebar-content-body">
        <ItemsTree />
        <PrivateLegacyPages />
      </div>
    </>
  );
});

export default PageTree;
