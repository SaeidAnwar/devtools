import React, { useMemo, useRef } from 'react';
import * as Diff from 'diff';
import { handleTextareaTabKeyDown } from '../../lib/textareaTab';
import { useLocalStorage } from '../../lib/useLocalStorage';
import EditorFieldBar from '../EditorFieldBar';
import FieldCopyClear from '../FieldCopyClear';
import JsonFormatterHeader from '../json-formatter/JsonFormatterHeader';
import { useDiffTool } from './useDiffTool';

const editorShell =
  'min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word outline-none focus:outline-none';

const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

export default function DiffTool({ instanceId }) {
  const [diffMode, setDiffMode] = useLocalStorage('diff-tool-mode', 'two-side');

  const {
    oldText,
    newText,
    diffResult,
    status,
    setOldText,
    setNewText,
    handleCompare,
    handleClearAll,
    clearDiff,
    flashSuccess,
    setErr,
  } = useDiffTool(instanceId);

  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  const handleLeftScroll = (e) => {
    if (!diffResult) return;
    if (isSyncingRight.current) {
      isSyncingRight.current = false;
      return;
    }
    if (rightScrollRef.current) {
      isSyncingLeft.current = true;
      rightScrollRef.current.scrollTop = e.target.scrollTop;
      rightScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleRightScroll = (e) => {
    if (!diffResult) return;
    if (isSyncingLeft.current) {
      isSyncingLeft.current = false;
      return;
    }
    if (leftScrollRef.current) {
      isSyncingRight.current = true;
      leftScrollRef.current.scrollTop = e.target.scrollTop;
      leftScrollRef.current.scrollLeft = e.target.scrollLeft;
    }
  };  const formattedOriginalJson = useMemo(() => {
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

  const renderJsonInvalidMessage = () => null;

  const renderWordDiff = (oldLine, newLine, type) => {
    const wordDiff = Diff.diffWordsWithSpace(oldLine, newLine);
    return wordDiff.map((word, i) => {
      if (type === 'removed') {
        if (word.added) return null;
        const removedClass = word.removed ? 'text-rose-400' : 'text-zinc-300';
        return (
          <span key={i} className={`${removedClass} px-0.5`}>
            {word.value}
          </span>
        );
      }

      if (type === 'added') {
        if (word.removed) return null;
        const addedClass = word.added ? 'text-emerald-400' : 'text-zinc-300';
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

  const renderTwoSideRows = (lines) => {
    const rows = [];
    let leftLineNumber = 0;
    let rightLineNumber = 0;

    const addRow = (left, right, key) => {
      rows.push({ left, right, key });
    };

    for (let index = 0; index < lines.length; index += 1) {
      const part = lines[index];
      const nextPart = lines[index + 1];

      if (part.removed && nextPart?.added) {
        let oldLines = part.value.split('\n');
        if (oldLines[oldLines.length - 1] === '') oldLines.pop();
        let newLines = nextPart.value.split('\n');
        if (newLines[newLines.length - 1] === '') newLines.pop();
        const maxLen = Math.max(oldLines.length, newLines.length);

        for (let lineIndex = 0; lineIndex < maxLen; lineIndex += 1) {
          const leftLine = oldLines[lineIndex];
          const rightLine = newLines[lineIndex];

          addRow(
            {
              type: leftLine !== undefined ? 'removed' : 'empty',
              value: leftLine ?? '',
              number: leftLine !== undefined ? ++leftLineNumber : null,
            },
            {
              type: rightLine !== undefined ? 'added' : 'empty',
              value: rightLine ?? '',
              number: rightLine !== undefined ? ++rightLineNumber : null,
            },
            `paired-${index}-${lineIndex}`,
          );
        }

        index += 1;
        continue;
      }

      if (part.removed) {
        const oldLines = part.value.split('\n');
        oldLines.forEach((line, lineIndex) => {
          if (lineIndex === oldLines.length - 1 && line === '') return;
          addRow(
            { type: 'removed', value: line, number: ++leftLineNumber },
            { type: 'empty', value: '', number: null },
            `removed-${index}-${lineIndex}`,
          );
        });
        continue;
      }

      if (part.added) {
        const newLines = part.value.split('\n');
        newLines.forEach((line, lineIndex) => {
          if (lineIndex === newLines.length - 1 && line === '') return;
          addRow(
            { type: 'empty', value: '', number: null },
            { type: 'added', value: line, number: ++rightLineNumber },
            `added-${index}-${lineIndex}`,
          );
        });
        continue;
      }

      const commonLines = part.value.split('\n');
      commonLines.forEach((line, lineIndex) => {
        if (lineIndex === commonLines.length - 1 && line === '') return;
        addRow(
          { type: 'common', value: line, number: ++leftLineNumber },
          { type: 'common', value: line, number: ++rightLineNumber },
          `common-${index}-${lineIndex}`,
        );
      });
    }

    return rows;
  };

  const renderLineBlock = (prefix, className, content, key, lineNumber = null) => (
    <div key={key} className={`flex items-start gap-2 ${className}`}>
      {lineNumber !== null && (
        <span className="inline-flex w-8 shrink-0 text-right text-xs font-semibold leading-5 text-zinc-500">
          {lineNumber}
        </span>
      )}
      {prefix !== '' && (
        <span className="inline-flex w-12 shrink-0 text-right text-xs font-semibold leading-5 text-zinc-500">
          {prefix}
        </span>
      )}
      <span className="flex-1 whitespace-pre-wrap text-sm">
        {content}
      </span>
    </div>
  );



  const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

  const formatJsonValue = (value) => {
    if (value === null) return 'null';
    return JSON.stringify(value);
  };

  const renderJsonDiff = (oldValue, newValue, baseLevel = 0) => {
    const rows = [];

    const renderLine = (content, level, className = 'text-zinc-300') => {
      const indentStr = '  '.repeat(level);
      return (
        <div key={`${level}-${rows.length}`} className="flex whitespace-pre">
          <span>{indentStr}</span>
          <span className={className}>{content}</span>
        </div>
      );
    };

    const renderStandaloneArrayItem = (item, level, comma, className = 'text-zinc-300') => {
      if (isObject(item)) {
        rows.push(renderLine('{', level, className));
        renderStandaloneObject(item, level + 1, className);
        rows.push(renderLine(`}${comma}`, level, className));
        return;
      }
      if (Array.isArray(item)) {
        rows.push(renderLine('[', level, className));
        renderStandaloneArray(item, level + 1, className);
        rows.push(renderLine(`]${comma}`, level, className));
        return;
      }
      rows.push(renderLine(`${formatJsonValue(item)}${comma}`, level, className));
    };

    const renderStandaloneEntry = (key, value, level, comma, className = 'text-zinc-300') => {
      if (isObject(value)) {
        rows.push(renderLine(`"${key}": {`, level, className));
        renderStandaloneObject(value, level + 1, className);
        rows.push(renderLine(`}${comma}`, level, className));
        return;
      }
      if (Array.isArray(value)) {
        rows.push(renderLine(`"${key}": [`, level, className));
        renderStandaloneArray(value, level + 1, className);
        rows.push(renderLine(`]${comma}`, level, className));
        return;
      }
      rows.push(renderLine(`"${key}": ${formatJsonValue(value)}${comma}`, level, className));
    };

    const renderStandaloneObject = (obj = {}, level, className = 'text-zinc-300') => {
      const keys = Object.keys(obj);
      keys.forEach((key, index) => {
        const comma = index === keys.length - 1 ? '' : ',';
        renderStandaloneEntry(key, obj[key], level, comma, className);
      });
    };

    const renderStandaloneArray = (arr = [], level, className = 'text-zinc-300') => {
      arr.forEach((item, index) => {
        const comma = index === arr.length - 1 ? '' : ',';
        renderStandaloneArrayItem(item, level, comma, className);
      });
    };

    const renderObjectInner = (oldObj = {}, newObj = {}, level) => {
      const keys = [];
      Object.keys(oldObj).forEach((key) => { if (!keys.includes(key)) keys.push(key); });
      Object.keys(newObj).forEach((key) => { if (!keys.includes(key)) keys.push(key); });

      keys.forEach((key, index) => {
        const oldHas = Object.prototype.hasOwnProperty.call(oldObj, key);
        const newHas = Object.prototype.hasOwnProperty.call(newObj, key);
        const oldVal = oldObj[key];
        const newVal = newObj[key];
        const comma = index === keys.length - 1 ? '' : ',';

        if (oldHas && !newHas) {
          renderStandaloneEntry(key, oldVal, level, comma, 'text-rose-400');
          return;
        }

        if (!oldHas && newHas) {
          renderStandaloneEntry(key, newVal, level, comma, 'text-emerald-400');
          return;
        }

        if (isObject(oldVal) && isObject(newVal)) {
          if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
            renderStandaloneEntry(key, newVal, level, comma);
            return;
          }
          rows.push(renderLine(`"${key}": {`, level));
          renderObjectInner(oldVal, newVal, level + 1);
          rows.push(renderLine(`}${comma}`, level));
          return;
        }

        if (Array.isArray(oldVal) && Array.isArray(newVal)) {
          if (JSON.stringify(oldVal) === JSON.stringify(newVal)) {
            renderStandaloneEntry(key, newVal, level, comma);
            return;
          }
          rows.push(renderLine(`"${key}": [`, level));
          renderArrayInner(oldVal, newVal, level + 1);
          rows.push(renderLine(`]${comma}`, level));
          return;
        }

        if (oldVal === newVal) {
          rows.push(renderLine(`"${key}": ${formatJsonValue(newVal)}${comma}`, level));
          return;
        }

        rows.push(
          renderLine(
            <>
              <span className="text-zinc-300">"{key}": </span>
              <span className="text-rose-400">{formatJsonValue(oldVal)}</span>
              <span className="text-zinc-300"> =&gt; </span>
              <span className="text-emerald-400">{formatJsonValue(newVal)}</span>
              <span className="text-zinc-300">{comma}</span>
            </>,
            level
          ),
        );
      });
    };

    const renderArrayInner = (oldArr = [], newArr = [], level) => {
      const maxLength = Math.max(oldArr.length, newArr.length);

      for (let idx = 0; idx < maxLength; idx += 1) {
        const oldItem = oldArr[idx];
        const newItem = newArr[idx];
        const comma = idx === maxLength - 1 ? '' : ',';

        if (idx >= oldArr.length) {
          renderStandaloneArrayItem(newItem, level, comma, 'text-emerald-400');
          continue;
        }

        if (idx >= newArr.length) {
          renderStandaloneArrayItem(oldItem, level, comma, 'text-rose-400');
          continue;
        }

        if (JSON.stringify(oldItem) === JSON.stringify(newItem)) {
          renderStandaloneArrayItem(newItem, level, comma);
          continue;
        }

        if (isObject(oldItem) && isObject(newItem)) {
          rows.push(renderLine('{', level));
          renderObjectInner(oldItem, newItem, level + 1);
          rows.push(renderLine(`}${comma}`, level));
          continue;
        }

        if (Array.isArray(oldItem) && Array.isArray(newItem)) {
          rows.push(renderLine('[', level));
          renderArrayInner(oldItem, newItem, level + 1);
          rows.push(renderLine(`]${comma}`, level));
          continue;
        }

        rows.push(
          renderLine(
            <>
              <span className="text-rose-400">{formatJsonValue(oldItem)}</span>
              <span className="text-zinc-300"> =&gt; </span>
              <span className="text-emerald-400">{formatJsonValue(newItem)}</span>
              <span className="text-zinc-300">{comma}</span>
            </>,
            level
          ),
        );
      }
    };

    if (isObject(oldValue) && isObject(newValue)) {
      rows.push(renderLine('{', baseLevel));
      renderObjectInner(oldValue, newValue, baseLevel + 1);
      rows.push(renderLine('}', baseLevel));
    } else if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      rows.push(renderLine('[', baseLevel));
      renderArrayInner(oldValue, newValue, baseLevel + 1);
      rows.push(renderLine(']', baseLevel));
    } else if (oldValue === newValue) {
      rows.push(renderLine(formatJsonValue(newValue), baseLevel));
    } else {
      rows.push(
        renderLine(
          <>
            <span className="text-rose-400">{formatJsonValue(oldValue)}</span>
            <span className="text-zinc-300"> =&gt; </span>
            <span className="text-emerald-400">{formatJsonValue(newValue)}</span>
          </>,
          baseLevel
        ),
      );
    }

    return rows;
  };

  const renderOriginalContent = () => {
    if (diffMode === 'json') {
      if (formattedOriginalJson === null || formattedNewJson === null) {
        return renderJsonInvalidMessage();
      }

      if (!diffResult) {
        return renderPlainTextContent(formattedOriginalJson ?? oldText);
      }

      return renderPlainTextContent(formattedOriginalJson);
    }

    if (!diffResult) return null;

    if (diffMode === 'two-side') {
      const rows = renderTwoSideRows(diffResult);
      return (
        <div className="min-h-full">
          {rows.map((row) => {
            if (row.left.type === 'empty') {
              return renderLineBlock(
                '',
                'text-zinc-600',
                <span>&nbsp;</span>,
                `${row.key}-left`,
                row.left.number,
              );
            }

            if (row.left.type === 'removed' && row.right?.type === 'added' && row.left.value && row.right.value) {
              return renderLineBlock(
                '',
                'bg-rose-500/10',
                <span>{renderWordDiff(row.left.value, row.right.value, 'removed')}</span>,
                `${row.key}-left`,
                row.left.number,
              );
            }

            if (row.left.type === 'removed') {
              return renderLineBlock(
                '',
                'bg-rose-500/10 text-rose-400',
                <span>{row.left.value || '\u00A0'}</span>,
                `${row.key}-left`,
                row.left.number,
              );
            }

            return renderLineBlock(
              '',
              'text-zinc-300',
              <span>{row.left.value}</span>,
              `${row.key}-left`,
              row.left.number,
            );
          })}
        </div>
      );
    }

    return null;
  };

  const renderChangedContent = () => {
    if (diffMode === 'two-side') {
      const rows = renderTwoSideRows(diffResult);
      return (
        <div className="min-h-full">
          {rows.map((row) => {
            if (row.right.type === 'empty') {
              return renderLineBlock(
                '',
                'text-zinc-600',
                <span>&nbsp;</span>,
                `${row.key}-right`,
                row.right.number,
              );
            }

            if (row.right.type === 'added' && row.left?.type === 'removed' && row.left.value && row.right.value) {
              return renderLineBlock(
                '',
                'bg-emerald-500/10',
                <span>{renderWordDiff(row.left.value, row.right.value, 'added')}</span>,
                `${row.key}-right`,
                row.right.number,
              );
            }

            if (row.right.type === 'added') {
              return renderLineBlock(
                '',
                'bg-emerald-500/10 text-emerald-400',
                <span>{row.right.value || '\u00A0'}</span>,
                `${row.key}-right`,
                row.right.number,
              );
            }

            return renderLineBlock(
              '',
              'text-zinc-300',
              <span>{row.right.value}</span>,
              `${row.key}-right`,
              row.right.number,
            );
          })}
        </div>
      );
    }

    if (diffMode === 'json') {
      if (formattedOriginalJson === null || formattedNewJson === null) {
        return renderJsonInvalidMessage();
      }

      if (!diffResult) return renderPlainTextContent(formattedNewJson ?? newText);
      const parsedOld = JSON.parse(oldText);
      const parsedNew = JSON.parse(newText);
      return <div className="min-h-full text-sm font-mono">{renderJsonDiff(parsedOld, parsedNew)}</div>;
    }

    return null;
  };



  const handleCopyField = async (textToCopy) => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      flashSuccess('Copied to clipboard');
    } catch {
      setErr('Copy failed');
    }
  };

  const handleClearField = (setText) => {
    setText('');
    clearDiff();
    flashSuccess('Cleared');
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      {/* Top Controls */}
      <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-zinc-800/90 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:px-3">
        <div className="hidden min-w-0 sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <nav className="flex items-center justify-center gap-0.5 rounded-md bg-zinc-900/50 p-0.5 ring-1 ring-zinc-700/50" aria-label="View mode">
            <button
              type="button"
              className={`rounded px-2 py-0.5 text-xs transition-colors ${diffMode === 'two-side' && diffResult ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => {
                setDiffMode('two-side');
                handleCompare();
                flashSuccess('Word diff computed');
              }}
            >
              Word Diff
            </button>

            <button
              type="button"
              className={`rounded px-2 py-0.5 text-xs transition-colors ${diffMode === 'json' && diffResult ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => {
                try {
                  const parsedOld = JSON.parse(oldText);
                  const parsedNew = JSON.parse(newText);
                  const formattedOld = JSON.stringify(parsedOld, null, 2);
                  const formattedNew = JSON.stringify(parsedNew, null, 2);
                  setOldText(formattedOld);
                  setNewText(formattedNew);
                  setDiffMode('json');
                  handleCompare(formattedOld, formattedNew);
                  flashSuccess('JSON diff computed');
                } catch {
                  clearDiff();
                  setErr('Invalid JSON');
                }
              }}
            >
              JSON Diff
            </button>
            <button
              type="button"
              className={`rounded px-2 py-0.5 text-xs transition-colors ${!diffResult ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:text-zinc-300'}`}
              onClick={() => { clearDiff(); flashSuccess('Diff cleared'); }}
            >
              Edit
            </button>
          </nav>
          
          <div className="ml-1 flex items-center">
            <button type="button" className={actionBtn} onClick={() => { handleClearAll(); flashSuccess('All cleared'); }}>
              Clear All
            </button>
          </div>
        </div>
        <div className="flex min-w-0 justify-end">
          <JsonFormatterHeader status={status} />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-zinc-800 md:flex-row md:divide-x md:divide-y-0">
        
        {/* Left Panel: Original */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-zinc-950">
          <EditorFieldBar
            title="Original Text"
            right={
              <FieldCopyClear
                onCopy={() => { void handleCopyField(oldText); }}
                onClear={() => { handleClearField(setOldText); }}
                copyDisabled={!oldText}
              />
            }
          />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <textarea
              className={`${editorShell} absolute inset-0 z-10`}
              style={{
                display: diffResult ? 'none' : 'block',
                caretColor: 'white',
                padding: '12px',
              }}
              spellCheck={false}
              readOnly={!!diffResult}
              placeholder="Paste original text..."
              value={oldText}
              onChange={(e) => {
                setOldText(e.target.value);
                clearDiff();
              }}
              onKeyDown={(e) => {
                if (!diffResult) {
                  handleTextareaTabKeyDown(e, setOldText);
                }
              }}
            />
            {diffResult && (
              <div 
                ref={leftScrollRef}
                onScroll={handleLeftScroll}
                className="absolute inset-0 z-10 overflow-auto whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed"
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
                onCopy={() => { void handleCopyField(newText); }}
                onClear={() => { handleClearField(setNewText); }}
                copyDisabled={!newText}
              />
            }
          />
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <textarea
              className={`${editorShell} absolute inset-0 z-10`}
              style={{
                display: diffResult ? 'none' : 'block',
                caretColor: 'white',
                padding: '12px',
              }}
              spellCheck={false}
              readOnly={!!diffResult}
              placeholder="Paste changed text..."
              value={newText}
              onChange={(e) => {
                setNewText(e.target.value);
                clearDiff();
              }}
              onKeyDown={(e) => {
                if (!diffResult) {
                  handleTextareaTabKeyDown(e, setNewText);
                }
              }}
            />
            {diffResult && (
              <div 
                ref={rightScrollRef}
                onScroll={handleRightScroll}
                className="absolute inset-0 z-10 overflow-auto whitespace-pre-wrap wrap-break-word font-mono text-sm leading-relaxed"
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