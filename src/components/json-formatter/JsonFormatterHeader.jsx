export default function JsonFormatterHeader({ status }) {
  if (!status.message) return null;

  return (
    <p
      className={`max-w-[min(28rem,45vw)] shrink-0 truncate text-xs ${
        status.type === 'error' ? 'text-zinc-300' : 'text-zinc-400'
      }`}
      title={status.message}
    >
      {status.message}
    </p>
  );
}
