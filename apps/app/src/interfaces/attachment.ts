import type { IAttachmentHasId } from '@growi/core';

import type { PaginateResult } from './mongoose-utils';


export type IResAttachmentList = {
  paginateResult: PaginateResult<IAttachmentHasId>
};

export type ICheckLimitResult = {
  isUploadable: boolean,
  errorMessage?: string,
}
