const TOOLS = [
  { id: 'json', label: 'JSON' },
  { id: 'base64', label: 'Base64' },
  { id: 'jwt', label: 'JWT' },
];

const navBtn = (active) =>
  `rounded px-3 py-1.5 text-xs transition-colors ${
    active
      ? 'bg-zinc-800 text-zinc-300'
      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400'
  }`;

export default function AppNavbar({ activeTool, onToolChange }) {
  return (
    <header className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-1 gap-y-1 border-b border-zinc-800/90 bg-zinc-950 px-2 py-2 sm:flex-nowrap sm:px-3">
      <span className="mr-1 shrink-0 select-none text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:mr-2">
        Tools
      </span>
      <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5 sm:flex-initial" aria-label="Dev tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-current={activeTool === t.id ? 'page' : undefined}
            onClick={() => onToolChange(t.id)}
            className={navBtn(activeTool === t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
