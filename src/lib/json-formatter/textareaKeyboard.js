import { INDENT } from './constants';

export function newlineWithSmartIndent(value, selectionStart, selectionEnd) {
  const lastNewLine = value.lastIndexOf('\n', selectionStart - 1);
  const currentLine = value.slice(lastNewLine + 1, selectionStart);
  const leadingWhitespace = currentLine.match(/^\s*/)?.[0] || '';
  const lastChar = currentLine.trim().slice(-1);
  const extraIndent = lastChar === '{' || lastChar === '[' ? INDENT : '';

  const insert = `\n${leadingWhitespace}${extraIndent}`;
  const nextValue = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  const nextCursor = selectionStart + insert.length;

  return { nextValue, nextCursor };
}

export function insertTabAtSelection(value, selectionStart, selectionEnd) {
  const nextValue = value.slice(0, selectionStart) + INDENT + value.slice(selectionEnd);
  const nextCursor = selectionStart + INDENT.length;

  return { nextValue, nextCursor };
}
