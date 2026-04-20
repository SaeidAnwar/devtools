const titleCls =
  'shrink-0 select-none text-[10px] font-medium uppercase tracking-wider text-zinc-600';

/**
 * Field title on the left, actions on the right.
 * If `between` is set, uses a 3-column row: title | centered `between` | actions.
 */
export default function EditorFieldBar({ title, right, between, betweenAriaLabel }) {
  if (between != null) {
    return (
      <div className="grid min-h-8 min-w-0 grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1 px-3 pt-2 pb-0.5">
        <span className={titleCls}>{title}</span>
        <div
          role={betweenAriaLabel ? 'group' : undefined}
          aria-label={betweenAriaLabel}
          className="flex min-w-0 flex-wrap items-center justify-center gap-1"
        >
          {between}
        </div>
        <div className="flex shrink-0 justify-self-end">{right}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-8 min-w-0 items-center gap-2 px-3 pt-2 pb-0.5">
      <div className="min-w-0 flex-1">
        <span className={`${titleCls} inline-block max-w-full truncate`}>{title}</span>
      </div>
      <div className="flex shrink-0 items-center">{right}</div>
    </div>
  );
}
