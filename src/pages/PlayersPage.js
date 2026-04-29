import { useMemo, useState } from 'react';
import { rowsToObjects } from '../lib/parseCsv';
import { useCsv } from '../hooks/useCsv';

const COLS = [
  { key: 'name', label: 'Name' },
  { key: 'level', label: 'Level' },
  { key: 'sb_lvl', label: 'SB lvl' },
  { key: 'mg_lvl', label: 'MG lvl' },
];

export default function PlayersPage() {
  const { rows, error, loading } = useCsv(`${process.env.PUBLIC_URL || ''}/data/players.csv`);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const players = useMemo(() => {
    if (!rows?.length) return [];
    return rowsToObjects(rows);
  }, [rows]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...players].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const na = Number(va);
      const nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb) && va !== '' && vb !== '') {
        return (na - nb) * dir;
      }
      return String(va).localeCompare(String(vb), undefined, { sensitivity: 'base' }) * dir;
    });
  }, [players, sortKey, sortDir]);

  function toggleSort(key) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  if (loading) {
    return <p className="text-guild-muted">Loading players…</p>;
  }
  if (error) {
    return <p className="text-red-400">Failed to load player data. Please try again later.</p>;
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Players</h1>
      <p className="mb-6 text-sm text-guild-muted">
        List of all our players and their levels.
      </p>
      <div className="overflow-x-auto rounded-xl border border-guild-border/60 bg-guild-raised/40">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-guild-border/50 bg-black/40">
              {COLS.map(({ key, label }) => (
                <th
                  key={key}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-guild-accentbright"
                  aria-sort={
                    sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                >
                  <button
                    type="button"
                    className="font-semibold text-guild-accentbright hover:underline"
                    onClick={() => toggleSort(key)}
                  >
                    {label}
                    {sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, idx) => (
              <tr
                key={`${p.name}-${idx}`}
                className="border-b border-guild-border/30 last:border-0 hover:bg-violet-950/25"
              >
                <td className="px-4 py-3 text-white">{p.name}</td>
                <td className="px-4 py-3 tabular-nums text-guild-muted">{p.level}</td>
                <td className="px-4 py-3 tabular-nums text-guild-muted">{p.sb_lvl}</td>
                <td className="px-4 py-3 tabular-nums text-guild-muted">{p.mg_lvl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
