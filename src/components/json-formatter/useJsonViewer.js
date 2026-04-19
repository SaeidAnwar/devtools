import { useState, useEffect, useCallback } from 'react';
import {
  TAB,
  STATUS_TYPE,
  minifyStripWhitespace,
  roughFormatInvalidJson,
  newlineWithSmartIndent,
  insertTabAtSelection,
} from '../../lib/json-formatter';

const emptyStatus = { message: '', type: STATUS_TYPE.NONE };

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

      const { selectionStart, selectionEnd, value } = el;

      if (e.key === 'Enter') {
        e.preventDefault();
        const { nextValue, nextCursor } = newlineWithSmartIndent(value, selectionStart, selectionEnd);
        setJsonInput(nextValue);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = nextCursor;
        }, 0);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        const { nextValue, nextCursor } = insertTabAtSelection(value, selectionStart, selectionEnd);
        setJsonInput(nextValue);
        setTimeout(() => {
          el.selectionStart = el.selectionEnd = nextCursor;
        }, 0);
      }
    },
    [setJsonInput],
  );

  const handleFormat = useCallback(() => {
    let input = jsonInput.trim();
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setStatus({ message: 'Formatted Successfully!', type: STATUS_TYPE.SUCCESS });
    } catch {
      try {
        let fixed = input;
        const oB = (input.match(/\{/g) || []).length;
        const cB = (input.match(/\}/g) || []).length;
        const oSq = (input.match(/\[/g) || []).length;
        const cSq = (input.match(/\]/g) || []).length;
        if (oB > cB) fixed += '}'.repeat(oB - cB);
        if (oSq > cSq) fixed += ']'.repeat(oSq - cSq);
        setJsonInput(JSON.stringify(JSON.parse(fixed), null, 2));
        setStatus({ message: 'Auto-fixed & Formatted!', type: STATUS_TYPE.SUCCESS });
      } catch {
        setJsonInput(roughFormatInvalidJson(input));
        setStatus({ message: 'Rough Format (Invalid JSON)', type: STATUS_TYPE.ERROR });
      }
    }
  }, [jsonInput, setJsonInput]);

  const handleMinify = useCallback(() => {
    if (!jsonInput.trim()) return;

    try {
      setJsonInput(JSON.stringify(JSON.parse(jsonInput)));
      setStatus({ message: 'Minified!', type: STATUS_TYPE.SUCCESS });
    } catch {
      setJsonInput(minifyStripWhitespace(jsonInput));
      setStatus({ message: 'Minified (Still Invalid)', type: STATUS_TYPE.ERROR });
    }
  }, [jsonInput, setJsonInput]);

  const handleCopy = useCallback(() => {
    if (!jsonInput) return;
    void navigator.clipboard.writeText(jsonInput);
    flashStatus('Copied to Clipboard!', STATUS_TYPE.SUCCESS);
  }, [jsonInput, flashStatus]);

  const handleClear = useCallback(() => {
    setJsonInput('');
    flashStatus('Cleared', STATUS_TYPE.SUCCESS);
  }, [setJsonInput, flashStatus]);

  return {
    jsonInput,
    setJsonInput,
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
