import { handleTextareaTabKeyDown } from '../../lib/textareaTab';
import EditorFieldBar from '../EditorFieldBar';
import FieldCopyClear from '../FieldCopyClear';
import JsonFormatterHeader from '../json-formatter/JsonFormatterHeader';
import { useBase64Split } from './useBase64Split';

const editorShell =
  'min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-zinc-300 placeholder:text-zinc-600 focus:outline-none';

const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

export default function Base64Tool() {
  const {
    plainText,
    base64Text,
    status,
    handlePlainChange,
    handleBase64Change,
    handleEncode,
    handleDecode,
    handleCopyPlain,
    handleCopyBase64,
    handleClearPlain,
    handleClearBase64,
  } = useBase64Split();

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-zinc-800/90 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:px-3">
        <div className="hidden min-w-0 sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button type="button" className={actionBtn} onClick={handleEncode}>
            Encode
          </button>
          <button type="button" className={actionBtn} onClick={handleDecode}>
            Decode
          </button>
        </div>
        <div className="flex min-w-0 justify-end">
          <JsonFormatterHeader status={status} />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-zinc-800 md:flex-row md:divide-x md:divide-y-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-0">
          <EditorFieldBar
            title="Decoded (UTF-8)"
            right={
              <FieldCopyClear
                onCopy={handleCopyPlain}
                onClear={handleClearPlain}
                copyDisabled={!plainText}
              />
            }
          />
          <textarea
            className={editorShell}
            spellCheck={false}
            placeholder="Plain text… use Encode to fill Base64."
            value={plainText}
            onChange={(e) => handlePlainChange(e.target.value)}
            onKeyDown={(e) => handleTextareaTabKeyDown(e, handlePlainChange)}
          />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorFieldBar
            title="Base64 (encoded)"
            right={
              <FieldCopyClear
                onCopy={handleCopyBase64}
                onClear={handleClearBase64}
                copyDisabled={!base64Text}
              />
            }
          />
          <textarea
            className={editorShell}
            spellCheck={false}
            placeholder="Base64… use Decode to fill plain text."
            value={base64Text}
            onChange={(e) => handleBase64Change(e.target.value)}
            onKeyDown={(e) => handleTextareaTabKeyDown(e, handleBase64Change)}
          />
        </div>
      </div>
    </div>
  );
}
