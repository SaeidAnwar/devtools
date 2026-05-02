import { useCallback, useEffect, useState } from 'react';
import * as Diff from 'diff';
import { useLocalStorage } from '../../lib/useLocalStorage';

const EMPTY_DIFF = null;

function computeLineDifferences(oldText, newText) {
  if (!oldText && !newText) return EMPTY_DIFF;

  return Diff.diffLines(oldText, newText);
}

export function useDiffTool() {
  const [oldText, setOldText] = useLocalStorage('diff-tool-old-text', '');
  const [newText, setNewText] = useLocalStorage('diff-tool-new-text', '');
  const [diffResult, setDiffResult] = useState(EMPTY_DIFF);

  const handleCompare = useCallback(() => {
    setDiffResult(computeLineDifferences(oldText, newText));
  }, [oldText, newText]);

  useEffect(() => {
    handleCompare();
  }, [handleCompare]);

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
    setOldText,
    setNewText,
    handleCompare,
    handleClearAll,
    clearDiff,
  };
}
