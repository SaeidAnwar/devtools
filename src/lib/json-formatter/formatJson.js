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

export function roughFormatInvalidJson(input) {
  return input
    .replace(/([\{\[])/g, '$1\n  ')
    .replace(/([\}\]])/g, '\n$1')
    .replace(/,/g, ',\n  ')
    .replace(/\n\s*\n/g, '\n');
}

export function minifyStripWhitespace(input) {
  return input.replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, '').replace(/[\n\r]/g, '');
}
