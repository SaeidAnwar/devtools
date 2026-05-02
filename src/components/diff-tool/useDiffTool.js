import { useCallback, useState } from 'react';
import * as Diff from 'diff';
import { STATUS_TYPE } from '../../lib/json-formatter/constants';
import { useLocalStorage } from '../../lib/useLocalStorage';

const EMPTY_DIFF = null;

const emptyStatus = { message: '', type: STATUS_TYPE.NONE };

function computeLineDifferences(oldText, newText) {
  if (!oldText && !newText) return EMPTY_DIFF;

  return Diff.diffLines(oldText, newText);
}

export function useDiffTool() {
  const [oldText, setOldText] = useLocalStorage('diff-tool-old-text', '');
  const [newText, setNewText] = useLocalStorage('diff-tool-new-text', '');
  const [diffResult, setDiffResult] = useState(() => computeLineDifferences(oldText, newText));
  const [status, setStatus] = useState(emptyStatus);

  const flashStatus = useCallback((message, type, clearAfterMs = 2000) => {
    setStatus({ message, type });
    if (clearAfterMs > 0) {
      setTimeout(() => setStatus(emptyStatus), clearAfterMs);
    }
  }, []);

  const clearStatus = useCallback(() => setStatus(emptyStatus), []);

  const flashSuccess = useCallback((message) => {
    setStatus({ message, type: STATUS_TYPE.SUCCESS });
    setTimeout(() => setStatus(emptyStatus), 2000);
  }, []);

  const setErr = useCallback((message) => {
    setStatus({ message, type: STATUS_TYPE.ERROR });
  }, []);

  const handleCompare = useCallback((customOld, customNew) => {
    setDiffResult(computeLineDifferences(
      typeof customOld === 'string' ? customOld : oldText,
      typeof customNew === 'string' ? customNew : newText
    ));
  }, [oldText, newText]);

  const handleClearAll = useCallback(() => {
    setOldText('');
    setNewText('');
    setDiffResult(EMPTY_DIFF);
  }, [setNewText, setOldText]);

  const clearDiff = useCallback(() => setDiffResult(EMPTY_DIFF), []);

  return {
    oldText,
    newText,
    diffResult,
    status,
    setOldText,
    setNewText,
    handleCompare,
    handleClearAll,
    clearDiff,
    flashStatus,
    clearStatus,
    flashSuccess,
    setErr,
  };
}
