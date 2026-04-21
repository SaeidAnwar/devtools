/** @typedef {{ id: string, key: string, value: string }} KvRow */

/**
 * @param {unknown} obj
 * @param {() => string} makeId
 * @returns {KvRow[]}
 */
export function objectToKvRows(obj, makeId) {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return [{ id: makeId(), key: '', value: '' }];
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return [{ id: makeId(), key: '', value: '' }];
  }
  return entries.map(([key, value]) => ({
    id: makeId(),
    key,
    value: typeof value === 'string' ? value : JSON.stringify(value),
  }));
}

/**
 * @param {KvRow[]} rows
 * @returns {Record<string, unknown>}
 */
export function kvRowsToObject(rows) {
  const out = {};
  for (const row of rows) {
    const k = row.key.trim();
    if (!k) continue;
    const raw = row.value.trim();
    if (raw === '') {
      out[k] = '';
      continue;
    }
    try {
      out[k] = JSON.parse(raw);
    } catch {
      out[k] = raw;
    }
  }
  return out;
}
