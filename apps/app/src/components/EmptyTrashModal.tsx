import type { FC } from 'react';
import React, {
  useState,
} from 'react';

import { useTranslation } from 'next-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { apiv3Delete } from '~/client/util/apiv3-client';
import { useEmptyTrashModal } from '~/stores/modal';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

const EmptyTrashModal: FC = () => {
  const { t } = useTranslation();

  const { data: emptyTrashModalData, close: closeEmptyTrashModal } = useEmptyTrashModal();

  const isOpened = emptyTrashModalData?.isOpened ?? false;

  const canDeleteAllpages = emptyTrashModalData?.opts?.canDeleteAllPages ?? false;

  const [errs, setErrs] = useState<Error[] | null>(null);

  async function emptyTrash() {
    if (emptyTrashModalData == null || emptyTrashModalData.pages == null) {
      return;
    }

    try {
      await apiv3Delete('/pages/empty-trash');
      const onEmptiedTrash = emptyTrashModalData.opts?.onEmptiedTrash;
      if (onEmptiedTrash != null) {
        onEmptiedTrash();
      }
      closeEmptyTrashModal();
    }
    catch (err) {
      setErrs([err]);
    }
  }

  async function emptyTrashButtonHandler() {
    await emptyTrash();
  }

  const renderPagePaths = () => {
    const pages = emptyTrashModalData?.pages;

    if (pages != null) {
      return pages.map(page => (
        <p key={page.data._id} className="mb-1">
          <code>{ page.data.path }</code>
        </p>
      ));
    }
    return <></>;
  };

  return (
    <Modal size="lg" isOpen={isOpened} toggle={closeEmptyTrashModal} data-testid="page-delete-modal">
      <ModalHeader tag="h4" toggle={closeEmptyTrashModal} className="text-danger">
        <span className="material-symbols-outlined">delete_forever</span>
        {t('modal_empty.empty_the_trash')}
      </ModalHeader>
      <ModalBody>
        <div className="grw-scrollable-modal-body pb-1">
          <label className="form-label">{ t('modal_delete.deleting_page') }:</label><br />
          {/* Todo: change the way to show path on modal when too many pages are selected */}
          {renderPagePaths()}
        </div>
        {!canDeleteAllpages && t('modal_empty.not_deletable_notice')}<br />
        {t('modal_empty.notice')}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button
          type="button"
          className="btn btn-danger"
          onClick={emptyTrashButtonHandler}
        >
          <span className="material-symbols-outlined" aria-hidden="true">delete_forever</span>
          {t('modal_empty.empty_the_trash_button')}
        </button>
      </ModalFooter>
    </Modal>

  );
};

export default EmptyTrashModal;
