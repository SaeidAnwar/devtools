const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

export default function JsonFormatterToolbar({
  onFormat,
  onMinify,
  onCopy,
  onClear,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={onFormat} className={actionBtn}>
        Format
      </button>
      <button type="button" onClick={onMinify} className={actionBtn}>
        Minify
      </button>
      <button type="button" onClick={onCopy} className={actionBtn}>
        Copy
      </button>
      <button type="button" onClick={onClear} className={actionBtn}>
        Clear
      </button>
    </div>
  );
}
