import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import RaidDamagePage from './pages/RaidDamagePage';

function navClass({ isActive }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-guild-accent text-black shadow-glow'
      : 'text-guild-muted hover:bg-violet-950/50 hover:text-guild-text',
  ].join(' ');
}

function Header() {
  return (
    <header className="z-10 flex flex-col gap-4 border-b border-guild-border/60 bg-black/40 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      {/* Brand mark — plain Link, no active/inactive state needed */}
      <Link to="/" className="text-xl font-bold tracking-wide text-guild-accentbright transition-colors hover:text-violet-300">
        Freemasons
      </Link>
      <nav className="flex flex-wrap gap-1" aria-label="Main">
        <NavLink to="/" className={navClass} end>Home</NavLink>
        <NavLink to="/players" className={navClass}>Players</NavLink>
        <NavLink to="/raid-damage" className={navClass}>Raid damage</NavLink>
      </nav>
    </header>
  );
}

// Two layout variants so the layout component doesn't need to inspect the current URL.
function FullBleedLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-guild-gradient text-guild-text">
      <Header />
      <main className="flex min-h-0 w-full max-w-none flex-1 flex-col p-0">
        <Outlet />
      </main>
    </div>
  );
}

function PaddedLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-guild-gradient text-guild-text">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 min-h-0 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-guild-border/40 px-4 py-4 text-center text-xs text-guild-muted sm:px-6">
        Lucky Defence · Freemasons guild website
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<FullBleedLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      <Route element={<PaddedLayout />}>
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/raid-damage" element={<RaidDamagePage />} />
      </Route>
    </Routes>
  );
}
