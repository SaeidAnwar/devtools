import { useState, useEffect, useCallback, useRef } from 'react';
import {
  TAB,
  STATUS_TYPE,
  autoCloseBrackets,
  roughFormatInvalidJson,
  minifyStripWhitespace,
  newlineWithSmartIndent,
  insertTabAtSelection,
} from '../../lib/json-formatter';

const emptyStatus = { message: '', type: STATUS_TYPE.NONE };
const MAX_HISTORY = 100;

function useParsedJson(jsonInput) {
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    try {
      if (jsonInput.trim()) setParsedData(JSON.parse(jsonInput));
      else setParsedData(null);
    } catch {
      setParsedData(null);
    }
  }, [jsonInput]);

  return parsedData;
}

export function useJsonViewer() {
  const [jsonInput, setJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState(TAB.TEXT);
  const [status, setStatus] = useState(emptyStatus);
  const parsedData = useParsedJson(jsonInput);

  const historyRef = useRef(['']);
  const historyIndexRef = useRef(0);

  const pushCommit = useCallback((nextValue) => {
    const h = historyRef.current;
    let idx = historyIndexRef.current;
    if (nextValue === h[idx]) return;
    h.splice(idx + 1);
    h.push(nextValue);
    idx = h.length - 1;
    while (h.length > MAX_HISTORY) {
      h.shift();
      idx = Math.max(0, idx - 1);
    }
    historyIndexRef.current = idx;
    setJsonInput(nextValue);
  }, []);

  const flashStatus = useCallback((message, type, clearAfterMs = 2000) => {
    setStatus({ message, type });
    if (clearAfterMs > 0) {
      setTimeout(() => setStatus(emptyStatus), clearAfterMs);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e) => {
      const el = e.target;
      if (!(el instanceof HTMLTextAreaElement)) return;

      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        const h = historyRef.current;
        let idx = historyIndexRef.current;

        if (e.shiftKey) {
          if (idx >= h.length - 1) return;
          e.preventDefault();
          idx += 1;
          historyIndexRef.current = idx;
          setJsonInput(h[idx]);
          return;
        }

        if (idx <= 0) return;
        e.preventDefault();
        idx -= 1;
        historyIndexRef.current = idx;
        setJsonInput(h[idx]);
        return;
      }

      if (mod && key === 'y') {
        const h = historyRef.current;
        let idx = historyIndexRef.current;
        if (idx >= h.length - 1) return;
        e.preventDefault();
        idx += 1;
        historyIndexRef.current = idx;
        setJsonInput(h[idx]);
        return;
      }

      const { selectionStart, selectionEnd, value } = el;

      if (e.key === 'Enter') {
        e.preventDefault();
        const { nextValue, nextCursor } = newlineWithSmartIndent(value, selectionStart, selectionEnd);
        pushCommit(nextValue);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = nextCursor;
        }, 0);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const { nextValue, nextCursor } = insertTabAtSelection(value, selectionStart, selectionEnd);
        pushCommit(nextValue);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = nextCursor;
        }, 0);
      }
    },
    [pushCommit],
  );

  const handleFormat = useCallback(() => {
    const input = jsonInput.trim();
    if (!input) return;

    try {
      const parsed = JSON.parse(input);
      pushCommit(JSON.stringify(parsed, null, 2));
      setStatus({ message: 'Formatted Successfully!', type: STATUS_TYPE.SUCCESS });
      return;
    } catch {
      // try auto-close brackets
    }

    try {
      const fixed = autoCloseBrackets(input);
      pushCommit(JSON.stringify(JSON.parse(fixed), null, 2));
      setStatus({ message: 'Auto-fixed & Formatted!', type: STATUS_TYPE.SUCCESS });
      return;
    } catch {
      // rough visual format
    }

    pushCommit(roughFormatInvalidJson(input));
    setStatus({ message: 'Rough Format (Invalid JSON)', type: STATUS_TYPE.ERROR });
  }, [jsonInput, pushCommit]);

  const handleMinify = useCallback(() => {
    if (!jsonInput.trim()) return;

    try {
      pushCommit(JSON.stringify(JSON.parse(jsonInput)));
      setStatus({ message: 'Minified!', type: STATUS_TYPE.SUCCESS });
    } catch {
      pushCommit(minifyStripWhitespace(jsonInput));
      setStatus({ message: 'Minified (Still Invalid)', type: STATUS_TYPE.ERROR });
    }
  }, [jsonInput, pushCommit]);

  const handleCopy = useCallback(() => {
    if (!jsonInput) return;
    void navigator.clipboard.writeText(jsonInput);
    flashStatus('Copied to Clipboard!', STATUS_TYPE.SUCCESS);
  }, [jsonInput, flashStatus]);

  const handleClear = useCallback(() => {
    pushCommit('');
    flashStatus('Cleared', STATUS_TYPE.SUCCESS);
  }, [pushCommit, flashStatus]);

  return {
    jsonInput,
    setJsonInput: pushCommit,
    activeTab,
    setActiveTab,
    status,
    parsedData,
    handleKeyDown,
    handleFormat,
    handleMinify,
    handleCopy,
    handleClear,
  };
}
