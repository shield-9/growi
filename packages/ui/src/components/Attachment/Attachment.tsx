import React from 'react';

import { HasObjectId, IAttachment } from '@growi/core';

import { UserPicture } from '../User/UserPicture';

type AttachmentProps = {
  attachment: IAttachment & HasObjectId,
  inUse: { [id: string]: boolean },
  onAttachmentDeleteClicked?: (attachment: IAttachment & HasObjectId) => void,
  isUserLoggedIn?: boolean,
};

export const Attachment = (props: AttachmentProps): JSX.Element => {

  const {
    attachment, inUse, isUserLoggedIn, onAttachmentDeleteClicked,
  } = props;

  const iconNameByFormat = (format: string) => {
    return (format.match(/image\/.+/i)) ? 'icon-picture' : 'icon-doc';
  };

  const _onAttachmentDeleteClicked = () => {
    if (onAttachmentDeleteClicked != null) {
      onAttachmentDeleteClicked(attachment);
    }
  };

  const formatIcon = iconNameByFormat(attachment.fileFormat);

  const fileInUse = (inUse) ? <span className="attachment-in-use badge badge-pill badge-info">In Use</span> : '';

  const fileType = <span className="attachment-filetype badge badge-pill badge-secondary">{attachment.fileFormat}</span>;

  const btnDownload = (isUserLoggedIn)
    ? (
      <a className="attachment-download" href={attachment.downloadPathProxied}>
        <i className="icon-cloud-download" />
      </a>
    )
    : '';

  const btnTrash = (isUserLoggedIn)
    ? (
      <a className="text-danger attachment-delete" onClick={() => _onAttachmentDeleteClicked()}>
        <i className="icon-trash" />
      </a>
    )
    : '';

  return (
    <div className="attachment mb-2">
      <span className="mr-1 attachment-userpicture">
        <UserPicture user={attachment.creator} size="sm"></UserPicture>
      </span>
      <a className="mr-2" href={attachment.filePathProxied} target="_blank" rel="noopener noreferrer">
        <i className={formatIcon}></i> {attachment.originalName}
      </a>
      <span className="mr-2">{fileType}</span>
      <span className="mr-2">{fileInUse}</span>
      <span className="mr-2">{btnDownload}</span>
      <span className="mr-2">{btnTrash}</span>
    </div>
  );
};
