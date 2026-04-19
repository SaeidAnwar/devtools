import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import JsonNode from '../JsonNode';
import { TAB, findEnclosingJsonRange } from '../../lib/json-formatter';

const editorShell =
  'min-h-0 w-full flex-1 overflow-auto p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words [tab-size:2]';

export default function JsonFormatterWorkspace({
  className = '',
  activeTab,
  jsonInput,
  onJsonChange,
  onKeyDown,
  parsedData,
}) {
  const taRef = useRef(null);
  const mirrorRef = useRef(null);
  const [caret, setCaret] = useState(0);

  const syncCaret = useCallback(() => {
    const el = taRef.current;
    if (!el) return;
    setCaret(el.selectionStart ?? 0);
  }, []);

  const range = useMemo(
    () => (activeTab === TAB.TEXT ? findEnclosingJsonRange(jsonInput, caret) : null),
    [activeTab, jsonInput, caret],
  );

  const onScroll = useCallback((e) => {
    const m = mirrorRef.current;
    if (m) {
      m.scrollTop = e.target.scrollTop;
      m.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      onKeyDown(e);
      requestAnimationFrame(syncCaret);
    },
    [onKeyDown, syncCaret],
  );

  const handleChange = useCallback(
    (e) => {
      onJsonChange(e.target.value);
      requestAnimationFrame(syncCaret);
    },
    [onJsonChange, syncCaret],
  );

  useEffect(() => {
    requestAnimationFrame(syncCaret);
  }, [jsonInput, syncCaret]);

  return (
    <div className={`relative flex min-h-0 flex-col bg-zinc-950 ${className}`}>
      {activeTab === TAB.TEXT ? (
        <div className="relative grid min-h-0 flex-1 grid-cols-1 grid-rows-1">
          <pre
            ref={mirrorRef}
            className={`${editorShell} col-start-1 row-start-1 pointer-events-none border border-transparent`}
            aria-hidden="true"
          >
            {range == null ? (
              <span className="text-zinc-300">{jsonInput}</span>
            ) : (
              <>
                <span className="text-zinc-500">{jsonInput.slice(0, range.start)}</span>
                <span className="text-zinc-300">{jsonInput.slice(range.start, range.end)}</span>
                <span className="text-zinc-500">{jsonInput.slice(range.end)}</span>
              </>
            )}
          </pre>
          <textarea
            ref={taRef}
            className={`${editorShell} col-start-1 row-start-1 resize-none bg-transparent text-transparent caret-zinc-400 selection:bg-zinc-700/50 placeholder:text-zinc-600 focus:outline-none`}
            placeholder="Paste JSON here…"
            spellCheck={false}
            value={jsonInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onClick={syncCaret}
            onSelect={syncCaret}
            onKeyUp={syncCaret}
            onScroll={onScroll}
          />
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-3 font-mono text-sm">
          {parsedData ? (
            <div className="text-zinc-300">
              <JsonNode label="JSON" value={parsedData} isLast={true} />
            </div>
          ) : (
            <div className="flex h-full min-h-[12rem] items-center justify-center text-center text-xs text-zinc-400">
              {jsonInput ? 'Invalid JSON — tree view unavailable' : 'No data'}
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute bottom-2 right-3 text-[10px] uppercase tracking-wide text-zinc-500">
        {activeTab}
      </div>
    </div>
  );
}
