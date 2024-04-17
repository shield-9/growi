import type { ReactNode } from 'react';
import React, {
  useCallback, useState, useEffect,
  useMemo,
} from 'react';

import {
  CodeMirrorEditorComment, GlobalCodeMirrorEditorKey, useCodeMirrorEditorIsolated, useResolvedThemeForEditor,
} from '@growi/editor';
import { UserPicture } from '@growi/ui/dist/components';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import {
  TabContent, TabPane,
} from 'reactstrap';

import { uploadAttachments } from '~/client/services/upload-attachments';
import { toastError } from '~/client/util/toastr';
import { useSWRxPageComment } from '~/stores/comment';
import {
  useCurrentUser, useIsSlackConfigured, useAcceptedUploadFileType,
} from '~/stores/context';
import {
  useSWRxSlackChannels, useIsSlackEnabled, useIsEnabledUnsavedWarning, useEditorSettings,
} from '~/stores/editor';
import { useCurrentPagePath } from '~/stores/page';
import { useEditingCommentsNum } from '~/stores/ui';
import { useNextThemes } from '~/stores/use-next-themes';
import loggerFactory from '~/utils/logger';

import { NotAvailableForGuest } from '../NotAvailableForGuest';
import { NotAvailableForReadOnlyUser } from '../NotAvailableForReadOnlyUser';

import { CommentPreview } from './CommentPreview';
import { SwitchingButtonGroup } from './SwitchingButtonGroup';


import '@growi/editor/dist/style.css';
import styles from './CommentEditor.module.scss';


const logger = loggerFactory('growi:components:CommentEditor');


const SlackNotification = dynamic(() => import('../SlackNotification').then(mod => mod.SlackNotification), { ssr: false });


const CommentEditorLayout = ({ children }: { children: ReactNode }): JSX.Element => {
  return (
    <div className={`${styles['comment-editor-styles']} form`}>
      <div className="comment-form">
        <div className="bg-comment rounded">
          {children}
        </div>
      </div>
    </div>
  );
};


export type CommentEditorProps = {
  pageId: string,
  replyTo?: string,
  revisionId: string,
  currentCommentId?: string,
  commentBody?: string,
  onCancelButtonClicked?: () => void,
  onCommentButtonClicked?: () => void,
}

export const CommentEditor = (props: CommentEditorProps): JSX.Element => {

  const {
    pageId, replyTo, revisionId,
    currentCommentId, commentBody, onCancelButtonClicked, onCommentButtonClicked,
  } = props;

  const { data: currentUser } = useCurrentUser();
  const { data: currentPagePath } = useCurrentPagePath();
  const { update: updateComment, post: postComment } = useSWRxPageComment(pageId);
  const { data: isSlackEnabled, mutate: mutateIsSlackEnabled } = useIsSlackEnabled();
  const { data: acceptedUploadFileType } = useAcceptedUploadFileType();
  const { data: slackChannelsData } = useSWRxSlackChannels(currentPagePath);
  const { data: isSlackConfigured } = useIsSlackConfigured();
  const { data: editorSettings } = useEditorSettings();
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();
  const {
    increment: incrementEditingCommentsNum,
    decrement: decrementEditingCommentsNum,
  } = useEditingCommentsNum();
  const { mutate: mutateResolvedTheme } = useResolvedThemeForEditor();
  const { resolvedTheme } = useNextThemes();
  mutateResolvedTheme({ themeData: resolvedTheme });

  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(currentCommentId ?? GlobalCodeMirrorEditorKey.COMMENT_NEW);

  const [isInitialized, setInitialized] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState();
  const [slackChannels, setSlackChannels] = useState<string>('');

  const { t } = useTranslation('');

  const handleSelect = useCallback((showPreview: boolean) => {
    setShowPreview(showPreview);
  }, []);

  // DO NOT dependent on slackChannelsData directly: https://github.com/weseek/growi/pull/7332
  const slackChannelsDataString = slackChannelsData?.toString();
  const initializeSlackEnabled = useCallback(() => {
    setSlackChannels(slackChannelsDataString ?? '');
    mutateIsSlackEnabled(false);
  }, [mutateIsSlackEnabled, slackChannelsDataString]);

  useEffect(() => {
    initializeSlackEnabled();
  }, [initializeSlackEnabled]);

  const isSlackEnabledToggleHandler = (isSlackEnabled: boolean) => {
    mutateIsSlackEnabled(isSlackEnabled, false);
  };

  const slackChannelsChangedHandler = useCallback((slackChannels: string) => {
    setSlackChannels(slackChannels);
  }, []);

  const initializeEditor = useCallback(async() => {
    if (!isInitialized) {
      const editingCommentsNum = await decrementEditingCommentsNum();
      if (editingCommentsNum != null && editingCommentsNum === 0) {
        mutateIsEnabledUnsavedWarning(false); // must be after clearing comment or else onChange will override bool
      }
    }

    setInitialized(true);
    setShowPreview(false);
    setError(undefined);

    initializeSlackEnabled();

  }, [isInitialized, initializeSlackEnabled, decrementEditingCommentsNum, mutateIsEnabledUnsavedWarning]);

  const cancelButtonClickedHandler = useCallback(() => {
    initializeEditor();
    onCancelButtonClicked?.();
  }, [onCancelButtonClicked, initializeEditor]);

  const postCommentHandler = useCallback(async() => {
    const commentBody = codeMirrorEditor?.getDoc();

    try {
      if (currentCommentId != null) {
        // update current comment
        await updateComment(commentBody, revisionId, currentCommentId);
      }
      else {
        // post new comment
        const postCommentArgs = {
          commentForm: {
            comment: commentBody,
            revisionId,
            replyTo,
          },
          slackNotificationForm: {
            isSlackEnabled,
            slackChannels,
          },
        };
        await postComment(postCommentArgs);
      }

      initializeEditor();

      if (onCommentButtonClicked != null) {
        onCommentButtonClicked();
      }

      // Insert empty string as new comment editor is opened after comment
      codeMirrorEditor?.initDoc('');
    }
    catch (err) {
      const errorMessage = err.message || 'An unknown error occured when posting comment';
      setError(errorMessage);
    }
  // eslint-disable-next-line max-len
  }, [currentCommentId, initializeEditor, onCommentButtonClicked, codeMirrorEditor, updateComment, revisionId, replyTo, isSlackEnabled, slackChannels, postComment]);

  // the upload event handler
  const uploadHandler = useCallback((files: File[]) => {
    uploadAttachments(pageId, files, {
      onUploaded: (attachment) => {
        const fileName = attachment.originalName;

        const prefix = attachment.fileFormat.startsWith('image/')
          ? '!' // use "![fileName](url)" syntax when image
          : '';
        const insertText = `${prefix}[${fileName}](${attachment.filePathProxied})\n`;

        codeMirrorEditor?.insertText(insertText);
      },
      onError: (error) => {
        toastError(error);
      },
    });
  }, [codeMirrorEditor, pageId]);

  const onChangeHandler = useCallback(() => {
    incrementEditingCommentsNum();
    setInitialized(false);
  }, [incrementEditingCommentsNum]);

  // initialize CodeMirrorEditor
  useEffect(() => {
    if (commentBody == null) {
      return;
    }
    codeMirrorEditor?.initDoc(commentBody);
  }, [codeMirrorEditor, commentBody]);


  const errorMessage = useMemo(() => <span className="text-danger text-end me-2">{error}</span>, [error]);
  const cancelButton = useMemo(() => (
    <button
      type="button"
      className="btn btn-outline-neutral-secondary"
      onClick={cancelButtonClickedHandler}
    >
      {t('Cancel')}
    </button>
  ), [cancelButtonClickedHandler, t]);
  const submitButton = useMemo(() => (
    <button
      type="button"
      data-testid="comment-submit-button"
      className="btn btn-primary"
      onClick={postCommentHandler}
    >
      {t('page_comment.comment')}
    </button>
  ), [postCommentHandler, t]);

  return (
    <CommentEditorLayout>
      <div className="px-4 pt-3 pb-1">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex">
            <UserPicture user={currentUser} noLink noTooltip />
            <p className="ms-2 mb-0">{t('page_comment.add_a_comment')}</p>
          </div>
          <SwitchingButtonGroup showPreview={showPreview} onSelected={handleSelect} />
        </div>
        <TabContent activeTab={showPreview ? 'comment_preview' : 'comment_editor'}>
          <TabPane tabId="comment_editor">
            <CodeMirrorEditorComment
              commentId={currentCommentId}
              acceptedUploadFileType={acceptedUploadFileType}
              onChange={onChangeHandler}
              onSave={postCommentHandler}
              onUpload={uploadHandler}
              editorSettings={editorSettings}
            />
          </TabPane>
          <TabPane tabId="comment_preview">
            <div className="comment-preview-container">
              <CommentPreview markdown={codeMirrorEditor?.getDoc()} />
            </div>
          </TabPane>
        </TabContent>
      </div>

      <div className="comment-submit px-4 pb-3 mb-2">
        <div className="d-flex">
          <span className="flex-grow-1" />
          <span className="d-none d-sm-inline">{errorMessage && errorMessage}</span>

          {isSlackConfigured && isSlackEnabled != null
            && (
              <div className="align-self-center me-md-3">
                <SlackNotification
                  isSlackEnabled={isSlackEnabled}
                  slackChannels={slackChannels}
                  onEnabledFlagChange={isSlackEnabledToggleHandler}
                  onChannelChange={slackChannelsChangedHandler}
                  id="idForComment"
                />
              </div>
            )
          }
          <div className="d-none d-sm-block">
            <span className="me-2">{cancelButton}</span><span>{submitButton}</span>
          </div>
        </div>
        <div className="d-block d-sm-none mt-2">
          <div className="d-flex justify-content-end">
            {error && errorMessage}
            <span className="me-2">{cancelButton}</span><span>{submitButton}</span>
          </div>
        </div>
      </div>
    </CommentEditorLayout>
  );

};


export const CommentEditorPre = (props: CommentEditorProps): JSX.Element => {

  const { data: currentUser } = useCurrentUser();
  const { mutate: mutateResolvedTheme } = useResolvedThemeForEditor();
  const { resolvedTheme } = useNextThemes();
  mutateResolvedTheme({ themeData: resolvedTheme });

  const [isReadyToUse, setIsReadyToUse] = useState(false);

  const { t } = useTranslation('');

  const render = useCallback((): JSX.Element => {
    return (
      <CommentEditorLayout>
        <NotAvailableForGuest>
          <NotAvailableForReadOnlyUser>
            <button
              type="button"
              className="btn btn-outline-primary w-100 text-start py-3"
              onClick={() => setIsReadyToUse(true)}
              data-testid="open-comment-editor-button"
            >
              <UserPicture user={currentUser} noLink noTooltip additionalClassName="me-3" />
              <span className="material-symbols-outlined me-1 fs-5">add_comment</span>
              <small>{t('page_comment.add_a_comment')}...</small>
            </button>
          </NotAvailableForReadOnlyUser>
        </NotAvailableForGuest>
      </CommentEditorLayout>
    );
  }, [currentUser, t]);

  return isReadyToUse
    ? <CommentEditor {...props} onCancelButtonClicked={() => setIsReadyToUse(false)} />
    : render();
};
