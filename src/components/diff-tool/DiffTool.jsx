import React, { useMemo } from 'react';
import * as Diff from 'diff';
import { handleTextareaTabKeyDown } from '../../lib/textareaTab';
import { useLocalStorage } from '../../lib/useLocalStorage';
import EditorFieldBar from '../EditorFieldBar';
import FieldCopyClear from '../FieldCopyClear';
import { useDiffTool } from './useDiffTool';

const editorShell =
  'min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word outline-none focus:outline-none';

const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

export default function DiffTool() {
  const [diffMode, setDiffMode] = useLocalStorage('diff-tool-mode', 'two-side');

  const {
    oldText,
    newText,
    diffResult,
    setOldText,
    setNewText,
    handleCompare,
    handleClearAll,
    clearDiff,
  } = useDiffTool();

  const formattedOriginalJson = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(oldText), null, 2);
    } catch {
      return null;
    }
  }, [oldText]);

  const formattedNewJson = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(newText), null, 2);
    } catch {
      return null;
    }
  }, [newText]);

  const renderPlainTextContent = (content) => (
    <div className="min-h-full text-zinc-300 whitespace-pre-wrap">{content}</div>
  );

  const renderTwoSideRows = (lines) => {
    const rows = [];

    const addRow = (left, right, key) => {
      rows.push({ left, right, key });
    };

    for (let index = 0; index < lines.length; index += 1) {
      const part = lines[index];
      const nextPart = lines[index + 1];

      if (part.removed && nextPart?.added) {
        const oldLines = part.value.split('\n');
        const newLines = nextPart.value.split('\n');
        const maxLen = Math.max(oldLines.length, newLines.length);

        for (let lineIndex = 0; lineIndex < maxLen; lineIndex += 1) {
          addRow(
            { type: 'removed', value: oldLines[lineIndex] ?? '' },
            { type: 'added', value: newLines[lineIndex] ?? '' },
            `paired-${index}-${lineIndex}`,
          );
        }

        index += 1;
        continue;
      }

      if (part.removed) {
        part.value.split('\n').forEach((line, lineIndex) => {
          if (lineIndex === part.value.split('\n').length - 1 && line === '') return;
          addRow({ type: 'removed', value: line }, { type: 'empty', value: '' }, `removed-${index}-${lineIndex}`);
        });
        continue;
      }

      if (part.added) {
        part.value.split('\n').forEach((line, lineIndex) => {
          if (lineIndex === part.value.split('\n').length - 1 && line === '') return;
          addRow({ type: 'empty', value: '' }, { type: 'added', value: line }, `added-${index}-${lineIndex}`);
        });
        continue;
      }

      part.value.split('\n').forEach((line, lineIndex) => {
        if (lineIndex === part.value.split('\n').length - 1 && line === '') return;
        addRow({ type: 'common', value: line }, { type: 'common', value: line }, `common-${index}-${lineIndex}`);
      });
    }

    return rows;
  };

  const renderLineBlock = (prefix, className, content, key) => (
    <div key={key} className={`flex items-start gap-2 ${className}`}>
      <span className="inline-flex w-5 shrink-0 text-xs font-semibold leading-5 text-zinc-400">
        {prefix}
      </span>
      <span className="flex-1 whitespace-pre-wrap text-sm">
        {content}
      </span>
    </div>
  );

  const renderOriginalContent = () => {
    if (diffMode === 'json') {
      return renderPlainTextContent(formattedOriginalJson ?? oldText);
    }

    if (!diffResult) return null;

    if (diffMode === 'two-side') {
      const rows = renderTwoSideRows(diffResult);
      return (
        <div className="min-h-full">
          {rows.map((row) => {
            if (row.left.type === 'empty') {
              return renderLineBlock(' ', '', <span className="text-zinc-600">&nbsp;</span>, `${row.key}-left`);
            }

            if (row.left.type === 'removed') {
              return renderLineBlock(
                '-',
                'rounded px-1 py-0.5 bg-rose-400/10 text-rose-200 border-b border-rose-400/20',
                <span>{row.left.value}</span>,
                `${row.key}-left`,
              );
            }

            return renderLineBlock(
              ' ',
              'text-zinc-300',
              <span>{row.left.value}</span>,
              `${row.key}-left`,
            );
          })}
        </div>
      );
    }

    return renderPlainTextContent(oldText);
  };

  const renderChangedContent = () => {
    if (diffMode === 'two-side') {
      const rows = renderTwoSideRows(diffResult);
      return (
        <div className="min-h-full">
          {rows.map((row) => {
            if (row.right.type === 'empty') {
              return renderLineBlock(' ', '', <span className="text-zinc-600">&nbsp;</span>, `${row.key}-right`);
            }

            if (row.right.type === 'added') {
              return renderLineBlock(
                '+',
                'rounded px-1 py-0.5 bg-emerald-400/10 text-emerald-200 border-b border-emerald-400/20',
                <span>{row.right.value}</span>,
                `${row.key}-right`,
              );
            }

            return renderLineBlock(
              ' ',
              'text-zinc-300',
              <span>{row.right.value}</span>,
              `${row.key}-right`,
            );
          })}
        </div>
      );
    }

    if (diffMode === 'json') {
      const formattedOld = formattedOriginalJson ?? oldText;
      const formattedNew = formattedNewJson ?? newText;
      const jsonDiffResult = Diff.diffLines(formattedOld, formattedNew);
      return renderDiffLines(jsonDiffResult);
    }

    if (!diffResult) return null;
    return renderDiffLines(diffResult);
  };

  const renderDiffLines = (lines) => {
    const renderWordDiff = (oldLine, newLine, type) => {
      const wordDiff = Diff.diffWordsWithSpace(oldLine, newLine);
      return wordDiff.map((word, i) => {
        if (type === 'removed') {
          if (word.added) return null;
          const removedClass = word.removed
            ? 'bg-rose-500/20 text-rose-200 border-b border-rose-500/30'
            : 'text-zinc-300';
          return (
            <span key={i} className={`${removedClass} px-0.5`}>
              {word.value}
            </span>
          );
        }

        if (type === 'added') {
          if (word.removed) return null;
          const addedClass = word.added
            ? 'bg-emerald-500/20 text-emerald-200 border-b border-emerald-500/30'
            : 'text-zinc-300';
          return (
            <span key={i} className={`${addedClass} px-0.5`}>
              {word.value}
            </span>
          );
        }

        return (
          <span key={i} className="text-zinc-300 px-0.5">
            {word.value}
          </span>
        );
      });
    };

    const renderLineBlock = (key, prefix, lineClass, lineContent) => (
      <div key={key} className={`flex items-start gap-2 ${lineClass}`}>
        <span className="inline-flex w-5 shrink-0 text-xs font-semibold leading-5 text-zinc-400">
          {prefix}
        </span>
        <span className="flex-1 whitespace-pre-wrap text-sm">
          {lineContent}
        </span>
      </div>
    );

    const rows = [];

    for (let index = 0; index < lines.length; index += 1) {
      const part = lines[index];
      const nextPart = lines[index + 1];

      if (part.removed && nextPart?.added) {
        const oldLines = part.value.split('\n');
        const newLines = nextPart.value.split('\n');
        const maxLen = Math.max(oldLines.length, newLines.length);

        for (let lineIndex = 0; lineIndex < maxLen; lineIndex += 1) {
          const oldLine = oldLines[lineIndex] ?? '';
          const newLine = newLines[lineIndex] ?? '';

          if (oldLine || newLine) {
            if (oldLine && newLine) {
              rows.push(
                renderLineBlock(
                  `removed-${index}-${lineIndex}`,
                  '-',
                  'rounded px-1 py-0.5 bg-rose-400/10 text-rose-200 border-b border-rose-400/20',
                  renderWordDiff(oldLine, newLine, 'removed'),
                ),
              );
              rows.push(
                renderLineBlock(
                  `added-${index}-${lineIndex}`,
                  '+',
                  'rounded px-1 py-0.5 bg-emerald-400/10 text-emerald-200 border-b border-emerald-400/20',
                  renderWordDiff(oldLine, newLine, 'added'),
                ),
              );
            } else if (oldLine) {
              rows.push(
                renderLineBlock(
                  `removed-${index}-${lineIndex}`,
                  '-',
                  'rounded px-1 py-0.5 bg-rose-400/10 text-rose-200 border-b border-rose-400/20',
                  <span className="text-rose-200">{oldLine}</span>,
                ),
              );
            } else {
              rows.push(
                renderLineBlock(
                  `added-${index}-${lineIndex}`,
                  '+',
                  'rounded px-1 py-0.5 bg-emerald-400/10 text-emerald-200 border-b border-emerald-400/20',
                  <span className="text-emerald-200">{newLine}</span>,
                ),
              );
            }
          }
        }

        index += 1;
        continue;
      }

      const lineSegments = part.value.split('\n');
      const prefix = part.added ? '+' : part.removed ? '-' : ' ';
      const lineClass = part.added
        ? 'rounded px-1 py-0.5 bg-emerald-400/10 text-emerald-200 border-b border-emerald-400/20'
        : part.removed
          ? 'rounded px-1 py-0.5 bg-rose-400/10 text-rose-200 border-b border-rose-400/20'
          : '';

      lineSegments.forEach((line, lineIndex) => {
        if (lineIndex === lineSegments.length - 1 && line === '') {
          return;
        }

        rows.push(
          renderLineBlock(
            `line-${index}-${lineIndex}`,
            prefix,
            lineClass,
            <span className={part.added ? 'text-emerald-200' : part.removed ? 'text-rose-200' : 'text-zinc-300'}>
              {line}
            </span>,
          ),
        );
      });
    }

    return <div className="min-h-full">{rows}</div>;
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      {/* Top Controls */}
      <div className="flex shrink-0 justify-center gap-2 border-b border-zinc-800/90 px-2 py-2 sm:px-3">
        <button
          type="button"
          className={`${actionBtn} ${diffMode === 'two-side' ? 'bg-zinc-700 text-white' : ''}`}
          onClick={() => setDiffMode('two-side')}
        >
          Two Side Diff
        </button>
        <button
          type="button"
          className={`${actionBtn} ${diffMode === 'bitbucket' ? 'bg-zinc-700 text-white' : ''}`}
          onClick={() => setDiffMode('bitbucket')}
        >
          Bitbucket Diff
        </button>
        <button
          type="button"
          className={`${actionBtn} ${diffMode === 'json' ? 'bg-zinc-700 text-white' : ''}`}
          onClick={() => setDiffMode('json')}
        >
          JSON Diff
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
                onClear={() => { setOldText(''); clearDiff(); }}
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
                if (diffResult) clearDiff();
              }}
              onKeyDown={(e) => handleTextareaTabKeyDown(e, setOldText)}
            />
            {diffResult && (
              <div 
                className="absolute inset-0 z-0 overflow-auto whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed pointer-events-none"
                style={{ padding: '12px' }}
              >
                {renderOriginalContent()}
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
                onClear={() => { setNewText(''); clearDiff(); }}
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
                if (diffResult) clearDiff();
              }}
              onKeyDown={(e) => handleTextareaTabKeyDown(e, setNewText)}
            />
            {diffResult && (
              <div 
                className="absolute inset-0 z-0 overflow-auto whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed pointer-events-none"
                style={{ padding: '12px' }}
              >
                {renderChangedContent()}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}