import { TAB } from '../../lib/json-formatter';

const btn = (active) =>
  `rounded px-2 py-1 text-sm transition-colors ${
    active
      ? 'bg-zinc-800 text-zinc-300'
      : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400'
  }`;

export default function JsonFormatterTabs({ activeTab, onTabChange }) {
  return (
    <nav className="flex gap-0.5" aria-label="View mode">
      <button type="button" onClick={() => onTabChange(TAB.TEXT)} className={btn(activeTab === TAB.TEXT)}>
        Text
      </button>
      <button type="button" onClick={() => onTabChange(TAB.VIEWER)} className={btn(activeTab === TAB.VIEWER)}>
        Tree
      </button>
    </nav>
  );
}
