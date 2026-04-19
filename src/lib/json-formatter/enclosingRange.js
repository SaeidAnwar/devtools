/**
 * Finds the innermost `{ ... }` or `[ ... ]` that contains the caret, ignoring
 * brackets inside JSON strings. Returns half-open [start, end) indices into `source`.
 */
export function findEnclosingJsonRange(source, cursorIndex) {
  const n = source.length;
  if (n === 0) return null;

  const pos = Math.max(0, Math.min(cursorIndex, n - 1));
  let walkEnd = pos;
  const chAt = source[walkEnd];
  if (chAt === '}' || chAt === ']') {
    walkEnd -= 1;
  }
  if (walkEnd < 0) return null;

  const stack = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i <= walkEnd; i++) {
    const ch = source[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      stack.push(i);
    } else if (ch === '}' || ch === ']') {
      if (stack.length) stack.pop();
    }
  }

  if (stack.length === 0) return null;
  const openIdx = stack[stack.length - 1];

  let depth = 0;
  inString = false;
  escape = false;

  for (let i = openIdx; i < n; i++) {
    const ch = source[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === '{' || ch === '[') {
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (depth === 0) {
        return { start: openIdx, end: i + 1 };
      }
    }
  }

  return null;
}
