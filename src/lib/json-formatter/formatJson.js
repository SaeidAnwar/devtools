export function autoCloseBrackets(input) {
  let fixed = input;
  const openBraces = (input.match(/\{/g) || []).length;
  const closeBraces = (input.match(/\}/g) || []).length;
  const openBrackets = (input.match(/\[/g) || []).length;
  const closeBrackets = (input.match(/\]/g) || []).length;

  if (openBraces > closeBraces) fixed += '}'.repeat(openBraces - closeBraces);
  if (openBrackets > closeBrackets) fixed += ']'.repeat(openBrackets - closeBrackets);

  return fixed;
}

/** First `{` or `[` index, or -1 */
function firstStructuralOpen(input) {
  const a = input.indexOf('{');
  const b = input.indexOf('[');
  if (a === -1) return b;
  if (b === -1) return a;
  return Math.min(a, b);
}

/**
 * If input contains a balanced outer `{...}` or `[...]` (string-aware), return [start, end] inclusive.
 */
export function extractBalancedBlock(input) {
  const start = firstStructuralOpen(input);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < input.length; i++) {
    const c = input[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === '\\') escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === '{' || c === '[') {
      depth++;
    } else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) {
        return { start, end: i };
      }
    }
  }
  return null;
}

/**
 * Pretty layout for invalid / pseudo-JSON: nesting depth + 2-space indent outside strings.
 * (The old regex-only rough format put every `{`/`[` on the same indent column.)
 */
export function roughFormatIndented(input, indentSize = 2) {
  const SP = ' '.repeat(indentSize);
  let out = '';
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (escape) {
      out += c;
      escape = false;
      continue;
    }
    if (inString) {
      out += c;
      if (c === '\\') escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      out += c;
      inString = true;
      continue;
    }

    if (/\s/.test(c)) {
      if (depth > 0) {
        continue;
      }
      if (c === '\n' || c === '\r') {
        if (!out.endsWith('\n')) out += '\n';
        continue;
      }
      if (c === ' ' || c === '\t') {
        if (out.length > 0 && !/[ \n]/.test(out[out.length - 1])) out += ' ';
      }
      continue;
    }

    if (c === '{' || c === '[') {
      out += c;
      depth++;
      out += '\n' + SP.repeat(depth);
      continue;
    }
    if (c === '}' || c === ']') {
      depth = Math.max(0, depth - 1);
      out += '\n' + SP.repeat(depth) + c;
      continue;
    }
    if (c === ',') {
      out += c;
      out += '\n' + SP.repeat(depth);
      continue;
    }

    out += c;
  }

  return out.replace(/\n{3,}/g, '\n\n').trimEnd();
}

/**
 * Rough format: indent by depth; if a balanced `{...}` / `[...]` block is found, format that
 * body and keep prefix/suffix (e.g. `message:` and `@timestamp...`) outside the structured pass.
 */
export function roughFormatInvalidJson(input) {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const ext = extractBalancedBlock(trimmed);
  if (ext && ext.end > ext.start) {
    const head = trimmed.slice(0, ext.start);
    const body = trimmed.slice(ext.start, ext.end + 1);
    const tail = trimmed.slice(ext.end + 1);
    const core = roughFormatIndented(body);
    let result = '';
    if (head.trim()) result += head.replace(/\s+$/g, '') + '\n';
    result += core;
    if (tail.trim()) result += '\n' + tail.replace(/^\s+/, '');
    return result;
  }

  return roughFormatIndented(trimmed);
}

export function minifyStripWhitespace(input) {
  return input.replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '').replace(/[\n\r]/g, '');
}
