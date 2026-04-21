const chipBtn =
  'rounded border border-zinc-800 bg-zinc-900/90 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-400 disabled:pointer-events-none disabled:opacity-40';

/**
 * Copy / Clear for a single editor field (sits in the field header row).
 */
export default function FieldCopyClear({ onCopy, onClear, copyDisabled = false }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1" role="group" aria-label="Field actions">
      <button type="button" className={chipBtn} disabled={copyDisabled} onClick={onCopy}>
        Copy
      </button>
      <button type="button" className={chipBtn} onClick={onClear}>
        Clear
      </button>
    </span>
  );
}
