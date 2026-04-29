import { parseCsv, rowsToObjects } from './parseCsv';

describe('parseCsv', () => {
  it('parses basic CSV', () => {
    const result = parseCsv('name,level\nAlice,10\nBob,20');
    expect(result).toEqual([
      ['name', 'level'],
      ['Alice', '10'],
      ['Bob', '20'],
    ]);
  });

  it('handles quoted fields containing commas', () => {
    const result = parseCsv('"Doe, Jane",5');
    expect(result[0][0]).toBe('Doe, Jane');
    expect(result[0][1]).toBe('5');
  });

  it('skips empty lines', () => {
    const result = parseCsv('a,b\n\nc,d');
    expect(result).toHaveLength(2);
  });

  it('handles Windows line endings', () => {
    const result = parseCsv('a,b\r\nc,d');
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(['c', 'd']);
  });
});

describe('rowsToObjects', () => {
  it('returns empty array for empty input', () => {
    expect(rowsToObjects([])).toEqual([]);
  });

  it('maps headers to values', () => {
    const rows = [['name', 'level'], ['Alice', '10']];
    expect(rowsToObjects(rows)).toEqual([{ name: 'Alice', level: '10' }]);
  });

  it('lowercases and trims headers', () => {
    const rows = [['  Name  ', ' LEVEL '], ['Alice', '10']];
    const [obj] = rowsToObjects(rows);
    expect(obj).toHaveProperty('name', 'Alice');
    expect(obj).toHaveProperty('level', '10');
  });

  it('trims cell values', () => {
    const rows = [['name'], ['  Alice  ']];
    expect(rowsToObjects(rows)[0].name).toBe('Alice');
  });

  it('deduplicates headers with _1, _2 suffixes', () => {
    const rows = [['week1', 'week1', 'week1'], ['10', '20', '30']];
    const [obj] = rowsToObjects(rows);
    expect(obj).toHaveProperty('week1_1', '10');
    expect(obj).toHaveProperty('week1_2', '20');
    expect(obj).toHaveProperty('week1_3', '30');
  });

  it('leaves non-duplicate headers unchanged', () => {
    const rows = [['name', 'level', 'level'], ['Alice', '10', '99']];
    const [obj] = rowsToObjects(rows);
    expect(obj).toHaveProperty('name', 'Alice');
    expect(obj).toHaveProperty('level_1', '10');
    expect(obj).toHaveProperty('level_2', '99');
  });

  it('fills missing cells with empty string', () => {
    const rows = [['a', 'b', 'c'], ['1', '2']];
    const [obj] = rowsToObjects(rows);
    expect(obj.c).toBe('');
  });
});
