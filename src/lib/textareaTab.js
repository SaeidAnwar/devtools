import { insertTabAtSelection } from './json-formatter/textareaKeyboard';

/**
 * Inserts an indent on Tab inside a textarea instead of moving focus.
 * Shift+Tab is left to the browser (move focus to previous control).
 *
 * @param {React.KeyboardEvent<HTMLTextAreaElement>} e
 * @param {(next: string) => void} setValue
 * @returns {boolean} true if Tab was handled
 */
export function handleTextareaTabKeyDown(e, setValue) {
  if (e.key !== 'Tab' || e.shiftKey) return false;
  const el = e.target;
  if (!(el instanceof HTMLTextAreaElement)) return false;

  e.preventDefault();
  const { selectionStart, selectionEnd, value } = el;
  const { nextValue, nextCursor } = insertTabAtSelection(value, selectionStart, selectionEnd);
  setValue(nextValue);
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = nextCursor;
  }, 0);
  return true;
}
