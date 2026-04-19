import React, { useState } from 'react';

const JsonNode = ({ label, value, isLast = true }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);

  return (
    <div className="font-mono text-[14px] leading-6 text-left">
      <div className="flex items-start gap-2">
        {isObject ? (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="mt-1.5 w-4 h-4 flex items-center justify-center border border-slate-600 bg-slate-800 text-[10px] text-slate-300 hover:bg-slate-700 select-none transition-colors"
          >
            {isOpen ? '−' : '+'}
          </button>
        ) : (
          <span className="w-4"></span> 
        )}

        <div className="flex flex-wrap items-center gap-1">
          {label !== undefined && (
            <span className="text-purple-400 font-medium">"{label}":</span>
          )}

          {isObject ? (
            <>
              <span className="text-slate-500">{isArray ? '[' : '{'}</span>
              {!isOpen && (
                <span className="text-slate-600 text-[11px] italic bg-slate-800/50 px-1 rounded mx-1">
                  {isArray ? `${value.length} items` : '...'}
                </span>
              )}
              {!isOpen && <span className="text-slate-500">{isArray ? ']' : '}'}{!isLast ? ',' : ''}</span>}
            </>
          ) : (
            <span className="flex items-center">
              <span className={`${typeof value === 'string' ? 'text-green-400' : 'text-blue-300'}`}>
                {JSON.stringify(value)}
              </span>
              {!isLast && <span className="text-slate-500">,</span>}
            </span>
          )}
        </div>
      </div>

      {isObject && isOpen && (
        <div className="pl-6 border-l border-slate-700/50 ml-[7px] my-1">
          {Object.entries(value).map(([k, v], idx, arr) => (
            <JsonNode 
              key={k} 
              label={isArray ? undefined : k} 
              value={v} 
              isLast={idx === arr.length - 1} 
            />
          ))}
        </div>
      )}

      {isObject && isOpen && (
        <div className="pl-6 text-slate-500">
          {isArray ? ']' : '}'}{!isLast ? ',' : ''}
        </div>
      )}
    </div>
  );
};

export default JsonNode;