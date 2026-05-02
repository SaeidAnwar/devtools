import React, { useState } from 'react';
import * as Diff from 'diff';
import { handleTextareaTabKeyDown } from '../../lib/textareaTab';
import EditorFieldBar from '../EditorFieldBar';
import FieldCopyClear from '../FieldCopyClear';

const editorShell =
  'min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words outline-none focus:outline-none';

const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

export default function DiffTool() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [diffResult, setDiffResult] = useState(null);

const handleCompare = () => {
  if (!oldText && !newText) return;

  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  const maxLen = Math.max(oldLines.length, newLines.length);
  
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    const diff = Diff.diffWordsWithSpace(oldLine, newLine);

    const hasChange = diff.some(part => part.added || part.removed);

    result.push({
      diff,
      hasChange,
    });
  }

  setDiffResult(result);
};

  const handleClearAll = () => {
    setOldText('');
    setNewText('');
    setDiffResult(null);
  };

  const renderDiffContent = (isNew) => {
  if (!diffResult) return null;

  return (
    <div className="min-h-full">
      {diffResult.map((line, lineIndex) => {
        const lineTint = line.hasChange
          ? isNew
            ? 'bg-emerald-500/5'
            : 'bg-red-500/5'
          : '';

        return (
          <div key={lineIndex} className={`${lineTint}`}>
            {line.diff.map((part, i) => {
              if (part.added && !isNew) return null;
              if (part.removed && isNew) return null;

              const isChanged = isNew ? part.added : part.removed;

              const highlightStyle = isChanged
                ? isNew
                  ? 'bg-emerald-500/30 text-emerald-300 border-b border-emerald-500/50'
                  : 'bg-red-500/30 text-red-300 border-b border-red-500/50'
                : isNew
                  ? 'text-emerald-100/70'
                  : 'text-red-100/70';

              return (
                <span
                  key={i}
                  className={`${highlightStyle} px-0.5`}
                >
                  {part.value}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      {/* Top Controls */}
      <div className="flex shrink-0 items-center justify-center gap-1.5 border-b border-zinc-800/90 px-2 py-2 sm:px-3">
        <button type="button" className={actionBtn} onClick={handleCompare}>
          Find Difference
        </button>
        <button type="button" className={actionBtn} onClick={handleClearAll}>
          Clear All
        </button>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-zinc-800 md:flex-row md:divide-x md:divide-y-0">
        
        {/* Left Panel: Original */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-950">
          <EditorFieldBar
            title="Original Text"
            right={
              <FieldCopyClear
                onCopy={() => navigator.clipboard.writeText(oldText)}
                onClear={() => { setOldText(''); setDiffResult(null); }}
                copyDisabled={!oldText}
              />
            }
          />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <textarea
              className={`${editorShell} absolute inset-0 z-10`}
              style={{
                color: diffResult ? 'transparent' : 'inherit',
                caretColor: 'white',
                padding: '12px',
              }}
              spellCheck={false}
              placeholder="Paste original text..."
              value={oldText}
              onChange={(e) => {
                setOldText(e.target.value);
                if (diffResult) setDiffResult(null);
              }}
              onKeyDown={(e) => handleTextareaTabKeyDown(e, setOldText)}
            />
            {diffResult && (
              <div 
                className="absolute inset-0 z-0 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed pointer-events-none"
                style={{ padding: '12px' }}
              >
                {renderDiffContent(false)}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Changed */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-950">
          <EditorFieldBar
            title="Changed Text"
            right={
              <FieldCopyClear
                onCopy={() => navigator.clipboard.writeText(newText)}
                onClear={() => { setNewText(''); setDiffResult(null); }}
                copyDisabled={!newText}
              />
            }
          />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <textarea
              className={`${editorShell} absolute inset-0 z-10`}
              style={{
                color: diffResult ? 'transparent' : 'inherit',
                caretColor: 'white',
                padding: '12px',
              }}
              spellCheck={false}
              placeholder="Paste changed text..."
              value={newText}
              onChange={(e) => {
                setNewText(e.target.value);
                if (diffResult) setDiffResult(null);
              }}
              onKeyDown={(e) => handleTextareaTabKeyDown(e, setNewText)}
            />
            {diffResult && (
              <div 
                className="absolute inset-0 z-0 overflow-auto whitespace-pre-wrap break-words font-mono text-sm leading-relaxed pointer-events-none"
                style={{ padding: '12px' }}
              >
                {renderDiffContent(true)}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}