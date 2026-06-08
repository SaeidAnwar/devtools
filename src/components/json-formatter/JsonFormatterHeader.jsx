export default function JsonFormatterHeader({ status }) {
  return (
    <div className="flex min-h-5 w-full min-w-0 max-w-md items-center justify-end">
      {status.message ? (
        <p
          className={`truncate text-right text-xs ${
            status.type === 'error' ? 'text-red-400' : status.type === 'success' ? 'text-green-400' : 'text-zinc-400'
          }`}
          title={status.message}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
