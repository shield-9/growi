import React, { useState, type FC, useCallback } from 'react';

import { Origin } from '@growi/core';

import { createPage } from '~/client/services/create-page';
import { mutatePageTree } from '~/stores/page-listing';
import { usePageTreeDescCountMap } from '~/stores/ui';

import { shouldCreateWipPage } from '../../../utils/should-create-wip-page';
import type { TreeItemToolProps } from '../interfaces';

import { NewPageCreateButton } from './NewPageCreateButton';
import { NewPageInput } from './NewPageInput';


type UseNewPageInput = {
  Input: FC<TreeItemToolProps>,
  CreateButton: FC<TreeItemToolProps>,
  isProcessingSubmission: boolean,
}

export const useNewPageInput = (): UseNewPageInput => {

  const [showInput, setShowInput] = useState(false);
  const [isProcessingSubmission, setProcessingSubmission] = useState(false);

  const { getDescCount } = usePageTreeDescCountMap();

  const CreateButton: FC<TreeItemToolProps> = (props) => {

    const { itemNode, stateHandlers } = props;
    const { page, children } = itemNode;

    // descendantCount
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const onClick = useCallback(() => {
      setShowInput(true);

      if (hasDescendants) {
        stateHandlers?.setIsOpen(true);
      }
    }, [hasDescendants, stateHandlers]);

    return (
      <NewPageCreateButton
        page={page}
        onClick={onClick}
      />
    );
  };

  const Input: FC<TreeItemToolProps> = (props) => {

    const { itemNode, stateHandlers } = props;
    const { page, children } = itemNode;

    const { getDescCount } = usePageTreeDescCountMap();
    const descendantCount = getDescCount(page._id) || page.descendantCount || 0;

    const isChildrenLoaded = children?.length > 0;
    const hasDescendants = descendantCount > 0 || isChildrenLoaded;

    const submitHandler = useCallback(async(newPagePath: string) => {
      setProcessingSubmission(true);

      setShowInput(false);

      await createPage({
        path: newPagePath,
        body: undefined,
        // keep grant info undefined to inherit from parent
        grant: undefined,
        grantUserGroupIds: undefined,
        origin: Origin.View,
        wip: shouldCreateWipPage(newPagePath),
      });

      mutatePageTree();

      if (!hasDescendants) {
        stateHandlers?.setIsOpen(true);
      }
    }, [hasDescendants, stateHandlers]);

    const submittionFailedHandler = useCallback(() => {
      setProcessingSubmission(false);
    }, []);

    return showInput
      ? (
        <NewPageInput
          page={page}
          isEnableActions={props.isEnableActions}
          onSubmit={submitHandler}
          onSubmittionFailed={submittionFailedHandler}
          onCanceled={() => setShowInput(false)}
        />
      )
      : <></>;
  };

  return {
    Input,
    CreateButton,
    isProcessingSubmission,
  };
};
