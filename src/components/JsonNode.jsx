import React, { useState } from 'react';

const JsonNode = ({ label, value, isLast = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);

  return (
    <div className="text-left font-mono text-[13px] leading-6">
      <div className="flex items-start gap-2">
        {isObject ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="mt-1.5 flex h-4 w-4 shrink-0 select-none items-center justify-center border border-zinc-600 bg-zinc-900 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        <div className="flex flex-wrap items-center gap-1">
          {label !== undefined && <span className="font-medium text-zinc-400">"{label}":</span>}

          {isObject ? (
            <>
              <span className="text-zinc-500">{isArray ? '[' : '{'}</span>
              {!isOpen && (
                <span className="mx-1 rounded bg-zinc-900 px-1 text-[11px] italic text-zinc-500">
                  {isArray ? `${value.length} items` : '…'}
                </span>
              )}
              {!isOpen && (
                <span className="text-zinc-500">
                  {isArray ? ']' : '}'}
                  {!isLast ? ',' : ''}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center">
              <span className={typeof value === 'string' ? 'text-zinc-300' : 'text-zinc-400'}>
                {JSON.stringify(value)}
              </span>
              {!isLast && <span className="text-zinc-500">,</span>}
            </span>
          )}
        </div>
      </div>

      {isObject && isOpen && (
        <div className="my-1 ml-[7px] border-l border-zinc-700 pl-4">
          {Object.entries(value).map(([k, v], idx, arr) => (
            <JsonNode key={k} label={isArray ? undefined : k} value={v} isLast={idx === arr.length - 1} />
          ))}
        </div>
      )}

      {isObject && isOpen && (
        <div className="pl-4 text-zinc-500">
          {isArray ? ']' : '}'}
          {!isLast ? ',' : ''}
        </div>
      )}
    </div>
  );
};

export default JsonNode;
