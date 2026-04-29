import Papa from 'papaparse';

/**
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
  const { data } = Papa.parse(text, { skipEmptyLines: true });
  return data;
}

/**
 * @param {string[][]} rows
 * @returns {Record<string, string>[]}
 */
export function rowsToObjects(rows) {
  if (!rows.length) return [];

  // Two-pass deduplication: headers that appear more than once get _1, _2, ... suffixes.
  const raw = rows[0].map((h) => String(h).trim().toLowerCase());
  const counts = {};
  raw.forEach((h) => { counts[h] = (counts[h] || 0) + 1; });
  const seen = {};
  const headers = raw.map((h) => {
    if (counts[h] === 1) return h;
    seen[h] = (seen[h] || 0) + 1;
    return `${h}_${seen[h]}`;
  });

  return rows.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((key, idx) => {
      obj[key] = cells[idx] != null ? String(cells[idx]).trim() : '';
    });
    return obj;
  });
}
