const TOOLS = [
  { id: 'json', label: 'JSON' },
  { id: 'base64', label: 'Base64' },
  { id: 'jwt', label: 'JWT' },
  { id: 'diff', label: 'Diff' },
];

const navBtn = (active) =>
  `rounded px-3 py-1.5 text-xs transition-colors ${
    active
      ? 'bg-zinc-800 text-zinc-300'
      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400'
  }`;

export default function AppNavbar({ 
  activeTool, 
  onToolChange,
  activeToolTabs,
  activeTabId,
  onTabSelect,
  onTabAdd,
  onTabClose
}) {
  return (
    <header className="flex min-w-0 shrink-0 flex-wrap items-center gap-x-1 gap-y-1 border-b border-zinc-800/90 bg-zinc-950 px-2 py-2 sm:flex-nowrap sm:px-3">
      <span className="mr-1 shrink-0 select-none text-[10px] font-semibold uppercase tracking-widest text-zinc-500 sm:mr-2">
        Tools
      </span>
      <nav className="flex min-w-0 flex-initial flex-wrap items-center gap-0.5" aria-label="Dev tools">
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

      {activeToolTabs && (
        <div className="-my-2 ml-1 flex flex-1 items-center gap-1 border-l border-zinc-800/90 py-2 pl-3">
            {activeToolTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => onTabSelect(tab.id)}
                  className={`group relative flex h-7 items-center justify-center rounded border text-xs cursor-pointer select-none transition-colors ${
                    isActive
                      ? 'w-14 border-zinc-600 bg-zinc-800 text-zinc-200'
                      : 'w-7 border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300'
                  }`}
                >
                  <span className={isActive && activeToolTabs.length > 1 ? 'mr-3' : ''}>{tab.id}</span>
                  {isActive && activeToolTabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabClose(tab.id);
                      }}
                      className="absolute right-1 flex h-4 w-4 items-center justify-center rounded-sm text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  )}
                </div>
              );
            })}
            {activeToolTabs.length < 20 && (
              <button
                type="button"
                onClick={onTabAdd}
                className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 bg-zinc-900/50 text-zinc-500 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              </button>
            )}
          </div>
      )}
    </header>
  );
}
