export default function JsonFormatterHeader({ status }) {
  return (
    <div className="flex min-h-5 w-full min-w-0 max-w-md items-center justify-end">
      {status.message ? (
        <p
          className={`truncate text-right text-xs ${
            status.type === 'error' ? 'text-zinc-300' : 'text-zinc-400'
          }`}
          title={status.message}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
