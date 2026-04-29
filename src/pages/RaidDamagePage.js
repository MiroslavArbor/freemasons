import { useMemo, useRef, useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { rowsToObjects } from '../lib/parseCsv';
import { useCsv } from '../hooks/useCsv';

// null means "not present in data" (player didn't participate), shown as —.
// 0 would mean they participated and dealt zero damage.
function formatDamage(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}

function formatAxisTick(n) {
  if (Number.isNaN(n)) return '';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
}

/** Column keys like week1, week2 from a parsed CSV row (headers lowercased). */
function weekColumnKeys(row) {
  if (!row || typeof row !== 'object') return [];
  return Object.keys(row)
    .filter((k) => /^week\d+$/i.test(k))
    .sort((a, b) => {
      const na = parseInt(String(a).replace(/\D/g, ''), 10) || 0;
      const nb = parseInt(String(b).replace(/\D/g, ''), 10) || 0;
      return na - nb;
    });
}

/**
 * matrix is Map<name, Map<week, number>>.
 * Weeks where the player has no entry are treated as 0 in the cumulative total.
 */
function buildPlayerSeries(matrix, name, weeks) {
  const playerMap = matrix.get(name) ?? new Map();
  let cumulative = 0;
  return weeks.map((week) => {
    const weekly = playerMap.get(week) ?? 0;
    cumulative += weekly;
    return { week, weekly, cumulative };
  });
}

function DamageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-lg border border-violet-500/30 bg-zinc-950 px-3 py-2 text-xs leading-snug text-zinc-200 shadow-lg">
      <div className="mb-1 font-semibold text-guild-accentbright">{row.week}</div>
      <div>This week: {formatDamage(row.weekly)}</div>
      <div>Cumulative: {formatDamage(row.cumulative)}</div>
    </div>
  );
}

// Target ~8 x-axis labels regardless of week count.
const TARGET_X_LABELS = 8;

export default function RaidDamagePage() {
  const playersRes = useCsv(`${process.env.PUBLIC_URL || ''}/data/players.csv`);
  const damageRes = useCsv(`${process.env.PUBLIC_URL || ''}/data/raid_damage.csv`);
  const [chartPlayer, setChartPlayer] = useState(null);
  const chartRef = useRef(null);

  const loading = playersRes.loading || damageRes.loading;
  // Only the damage CSV is critical; the roster CSV is used for ordering only.
  const error = damageRes.error;

  const { rowOrder, weeks, matrix } = useMemo(() => {
    // Roster is optional — used only to order guild members first.
    const roster = playersRes.rows?.length ? rowsToObjects(playersRes.rows) : [];
    const rosterNames = roster.map((r) => r.name).filter(Boolean);

    const damageObjs = damageRes.rows?.length ? rowsToObjects(damageRes.rows) : [];
    const weekCols = damageObjs.length ? weekColumnKeys(damageObjs[0]) : [];

    // matrix: Map<playerName, Map<weekKey, number>>
    const matrixMap = new Map();
    const nameFromDamage = new Set();

    for (const r of damageObjs) {
      const name = (r.player_name || r.name || '').trim();
      if (!name) continue;
      nameFromDamage.add(name);

      if (!matrixMap.has(name)) matrixMap.set(name, new Map());
      const playerMap = matrixMap.get(name);

      for (const col of weekCols) {
        const raw = r[col] ?? '';
        const dmg = Number(String(raw).replace(/,/g, ''));
        if (Number.isNaN(dmg)) continue;
        playerMap.set(col, (playerMap.get(col) ?? 0) + dmg);
      }
    }

    // Row order: roster members first (in roster order), then any extras alphabetically.
    const seen = new Set();
    const rowOrderList = [];
    for (const n of rosterNames) {
      if (n && !seen.has(n)) {
        seen.add(n);
        rowOrderList.push(n);
      }
    }
    const extras = [...nameFromDamage].filter((n) => !seen.has(n)).sort((a, b) => a.localeCompare(b));
    for (const n of extras) rowOrderList.push(n);

    return { rowOrder: rowOrderList, weeks: weekCols, matrix: matrixMap };
  }, [playersRes.rows, damageRes.rows]);

  const chartData = useMemo(() => {
    if (!chartPlayer || !weeks.length) return [];
    return buildPlayerSeries(matrix, chartPlayer, weeks);
  }, [chartPlayer, matrix, weeks]);

  const xAxisInterval =
    weeks.length <= TARGET_X_LABELS
      ? 0
      : Math.max(1, Math.round(weeks.length / TARGET_X_LABELS) - 1);

  useEffect(() => {
    if (chartPlayer && chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [chartPlayer]);

  function onPlayerClick(name) {
    setChartPlayer((current) => (current === name ? null : name));
  }

  if (loading) {
    return <p className="text-guild-muted">Loading raid data…</p>;
  }
  if (error) {
    return <p className="text-red-400">Failed to load raid data. Please try again later.</p>;
  }

  if (!weeks.length) {
    return (
      <div>
        <h1 className="mb-2 text-3xl font-bold text-white">Raid damage</h1>
        <p className="text-sm text-guild-muted">
          No week columns found. Use <code>public/data/raid_damage.csv</code> with{' '}
          <code>player_name</code> and <code>week1</code>, <code>week2</code>, … columns.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Raid damage</h1>
      <p className="mb-6 text-sm leading-relaxed text-guild-muted">
        Our raid damage data by week. Click a player for cumulative damage over time. See our progress.
      </p>
      <div
        className="max-h-[min(70vh,560px)] max-w-full overflow-auto rounded-xl border border-guild-border/60 bg-guild-raised/40 outline-none focus-visible:ring-2 focus-visible:ring-guild-accent/70"
        tabIndex={0}
        role="region"
        aria-label="Raid damage by week"
      >
        <table className="w-max min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-guild-border/50 bg-black/50">
              <th className="sticky left-0 z-10 whitespace-nowrap bg-zinc-950 px-4 py-3 text-left font-semibold text-guild-accentbright shadow-[4px_0_12px_-4px_rgba(0,0,0,0.9)]">
                Player
              </th>
              {weeks.map((w) => (
                <th
                  key={w}
                  title={w}
                  className="max-w-[8rem] truncate whitespace-nowrap px-3 py-3 text-left font-semibold text-guild-accentbright"
                >
                  {w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowOrder.map((name) => {
              const playerMap = matrix.get(name);
              return (
                <tr
                  key={name}
                  className={
                    chartPlayer === name
                      ? 'bg-violet-950/40 hover:bg-violet-950/50'
                      : 'border-b border-guild-border/20 hover:bg-violet-950/20'
                  }
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 whitespace-nowrap px-4 py-3 text-left font-semibold shadow-[4px_0_12px_-4px_rgba(0,0,0,0.85)] ${
                      chartPlayer === name ? 'bg-guild-raised' : 'bg-zinc-950'
                    }`}
                  >
                    <button
                      type="button"
                      className="cursor-pointer border-none bg-transparent p-0 text-left font-semibold text-violet-400 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-guild-accent"
                      onClick={() => onPlayerClick(name)}
                      aria-expanded={chartPlayer === name}
                      aria-controls="player-damage-chart"
                    >
                      {name}
                    </button>
                  </th>
                  {weeks.map((w) => (
                    <td key={w} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-guild-muted">
                      {formatDamage(playerMap?.get(w) ?? null)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {chartPlayer && (
        <section
          ref={chartRef}
          id="player-damage-chart"
          className="mt-8 rounded-xl border border-guild-accent/35 bg-black/35 p-5 shadow-glow backdrop-blur-sm"
          aria-label={`Damage trend for ${chartPlayer}`}
        >
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="mb-1 text-xl font-bold text-white">{chartPlayer}</h2>
              <p className="max-w-xl text-xs leading-relaxed text-guild-muted sm:text-sm">
                Cumulative damage by week (running total). Tooltip shows that week&apos;s contribution.
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-guild-border/80 bg-violet-950/40 px-4 py-2 text-sm text-guild-text transition-colors hover:bg-violet-900/50"
              onClick={() => setChartPlayer(null)}
            >
              Close
            </button>
          </div>
          <div className="h-[320px] w-full" role="img" aria-label="Line chart of cumulative damage per week">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 12, right: 20, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.12)" />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#a78bfa', fontSize: 10 }}
                  interval={xAxisInterval}
                  angle={-35}
                  textAnchor="end"
                  height={64}
                />
                <YAxis
                  tick={{ fill: '#a78bfa', fontSize: 11 }}
                  tickFormatter={formatAxisTick}
                  width={52}
                />
                <Tooltip
                  content={<DamageTooltip />}
                  cursor={{ stroke: 'rgba(168, 85, 247, 0.45)' }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={{ fill: '#a855f7', r: 3 }}
                  activeDot={{ r: 6, fill: '#e9d5ff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
