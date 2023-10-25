import { memo } from 'react';

import { AttachmentsDropup } from './AttachmentsDropup';
import { DiagramButton } from './DiagramButton';
import { EmojiButton } from './EmojiButton';
import { TableButton } from './TableButton';
import { TemplateButton } from './TemplateButton';
import { TextFormatTools } from './TextFormatTools';

import styles from './Toolbar.module.scss';

type Props = {
  editorKey: string,
  onFileOpen: () => void,
}

export const Toolbar = memo((props: Props): JSX.Element => {

  const { editorKey, onFileOpen } = props;

  return (
    <div className={`d-flex gap-2 p-2 codemirror-editor-toolbar ${styles['codemirror-editor-toolbar']}`}>
      <AttachmentsDropup onFileOpen={onFileOpen} />
      <TextFormatTools />
      <EmojiButton
        editorKey={editorKey}
      />
      <TableButton />
      <DiagramButton />
      <TemplateButton />
    </div>
  );
});
