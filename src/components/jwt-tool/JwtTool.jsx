import { useState } from 'react';
import { handleTextareaTabKeyDown } from '../../lib/textareaTab';
import EditorFieldBar from '../EditorFieldBar';
import FieldCopyClear from '../FieldCopyClear';
import JsonFormatterHeader from '../json-formatter/JsonFormatterHeader';
import { PAYLOAD_MODE, useJwtTool } from './useJwtTool';

const editorShell =
  'min-h-0 w-full flex-1 resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words text-zinc-300 placeholder:text-zinc-600 focus:outline-none';

const actionBtn =
  'rounded border border-zinc-700 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

const presetBtn =
  'rounded border border-zinc-800 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-400';

const payloadModeBtn = (active) =>
  `rounded px-2 py-0.5 text-xs transition-colors ${
    active ? 'bg-zinc-800 text-zinc-300' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-400'
  }`;

const kvInputCls =
  'min-w-0 flex-1 rounded border border-zinc-700/90 bg-zinc-900/50 px-2 py-1.5 font-mono text-xs text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none';

const kvRemoveBtn =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-800 text-sm text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

const eyeBtn =
  'inline-flex shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-900/90 px-1.5 py-0.5 text-zinc-500 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-300';

const iconSvg = 'h-3.5 w-3.5 shrink-0';

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconSvg} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={iconSvg} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.006 5.794M6.228 6.228L3 3m3.228 3.228l18.452 18.452M21 21l-4.912-4.912M15 15l-1.773-1.773m-2.023-.023L9 9m3 3l3 3"
      />
    </svg>
  );
}

/** @param {string} alg @param {Record<string, string>} [extra] */
function formatJwtHeaderPreset(alg, extra = {}) {
  return JSON.stringify({ alg, typ: 'JWT', ...extra }, null, 2);
}

const JWT_HEADER_PRESETS = [
  { label: 'HS256', value: formatJwtHeaderPreset('HS256'), title: 'HS256 + typ JWT' },
  { label: 'HS384', value: formatJwtHeaderPreset('HS384'), title: 'HS384 + typ JWT' },
  { label: 'HS512', value: formatJwtHeaderPreset('HS512'), title: 'HS512 + typ JWT' },
  {
    label: '+ kid',
    value: formatJwtHeaderPreset('HS256', { kid: 'my-key-id' }),
    title: 'HS256 + typ JWT + kid',
  },
  {
    label: 'Minimal',
    value: JSON.stringify({ alg: 'HS256' }, null, 2),
    title: 'alg only (typ defaults on sign)',
  },
];

export default function JwtTool() {
  const [secretVisible, setSecretVisible] = useState(false);
  const {
    headerText,
    setHeaderText,
    payloadText,
    setPayloadText,
    payloadEditMode,
    kvRows,
    payloadCopyEmpty,
    handlePayloadModeJson,
    handlePayloadModeKv,
    addKvRow,
    removeKvRow,
    updateKvRow,
    secret,
    setSecret,
    jwtText,
    setJwtText,
    status,
    handleParse,
    handleSign,
    handleCopyJwt,
    handleCopyHeader,
    handleClearHeader,
    handleCopyPayload,
    handleClearPayload,
    handleCopySecret,
    handleClearSecret,
    handleClearJwt,
    handleClearAll,
  } = useJwtTool();

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-300 antialiased">
      <div className="grid shrink-0 grid-cols-1 gap-2 border-b border-zinc-800/90 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:px-3">
        <div className="hidden min-w-0 sm:block" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <button type="button" className={actionBtn} onClick={handleSign}>
            Sign &amp; build JWT
          </button>
          <button type="button" className={actionBtn} onClick={handleParse}>
            Parse JWT
          </button>
          <button type="button" className={actionBtn} onClick={handleClearAll}>
            Clear all
          </button>
        </div>
        <div className="flex min-w-0 justify-end">
          <JsonFormatterHeader status={status} />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-zinc-800 md:flex-row md:divide-x md:divide-y-0">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col divide-y divide-zinc-800 md:min-h-0">
          <div className="flex min-h-0 flex-1 basis-0 flex-col">
            <EditorFieldBar
              title="Header (JSON)"
              betweenAriaLabel="Common JWT headers"
              between={JWT_HEADER_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  title={p.title}
                  className={presetBtn}
                  onClick={() => setHeaderText(p.value)}
                >
                  {p.label}
                </button>
              ))}
              right={
                <FieldCopyClear
                  onCopy={handleCopyHeader}
                  onClear={handleClearHeader}
                  copyDisabled={!headerText.trim()}
                />
              }
            />
            <textarea
              className={editorShell}
              spellCheck={false}
              placeholder='{ "alg": "HS256", "typ": "JWT" }'
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              onKeyDown={(e) => handleTextareaTabKeyDown(e, setHeaderText)}
            />
          </div>
          <div className="flex min-h-0 flex-1 basis-0 flex-col">
            <EditorFieldBar
              title="Payload"
              betweenAriaLabel="Payload editor mode"
              between={
                <div className="flex flex-wrap items-center gap-1" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={payloadEditMode === PAYLOAD_MODE.JSON}
                    className={payloadModeBtn(payloadEditMode === PAYLOAD_MODE.JSON)}
                    onClick={handlePayloadModeJson}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={payloadEditMode === PAYLOAD_MODE.KV}
                    className={payloadModeBtn(payloadEditMode === PAYLOAD_MODE.KV)}
                    onClick={handlePayloadModeKv}
                  >
                    Key/Value
                  </button>
                </div>
              }
              right={
                <FieldCopyClear
                  onCopy={handleCopyPayload}
                  onClear={handleClearPayload}
                  copyDisabled={payloadCopyEmpty}
                />
              }
            />
            {payloadEditMode === PAYLOAD_MODE.JSON ? (
              <textarea
                className={editorShell}
                spellCheck={false}
                placeholder='{ "sub": "123" } — or Parse JWT to fill from token'
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                onKeyDown={(e) => handleTextareaTabKeyDown(e, setPayloadText)}
              />
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-3">
                {kvRows.map((row) => (
                  <div key={row.id} className="flex min-w-0 items-center gap-2">
                    <input
                      className={kvInputCls}
                      spellCheck={false}
                      placeholder="key"
                      value={row.key}
                      onChange={(e) => updateKvRow(row.id, 'key', e.target.value)}
                    />
                    <input
                      className={kvInputCls}
                      spellCheck={false}
                      placeholder='value or JSON (e.g. true, "x", 1)'
                      value={row.value}
                      onChange={(e) => updateKvRow(row.id, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      className={kvRemoveBtn}
                      aria-label="Remove row"
                      onClick={() => removeKvRow(row.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className={`${presetBtn} self-start`} onClick={addKvRow}>
                  Add pair
                </button>
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col border-t border-zinc-800/80">
            <EditorFieldBar
              title="Secret (HMAC key, UTF-8)"
              right={
                <span className="inline-flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    className={eyeBtn}
                    aria-label={secretVisible ? 'Hide secret' : 'Show secret'}
                    aria-pressed={secretVisible}
                    onClick={() => setSecretVisible((v) => !v)}
                  >
                    {secretVisible ? <EyeSlashIcon /> : <EyeIcon />}
                  </button>
                  <FieldCopyClear
                    onCopy={handleCopySecret}
                    onClear={handleClearSecret}
                    copyDisabled={!secret}
                  />
                </span>
              }
            />
            <input
              type={secretVisible ? 'text' : 'password'}
              autoComplete="off"
              className="border-0 bg-transparent px-3 py-2 font-mono text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none"
              placeholder="Shared secret for HS256 / HS384 / HS512"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:min-h-0">
          <EditorFieldBar
            title="JWT (header.payload.signature)"
            right={
              <FieldCopyClear
                onCopy={handleCopyJwt}
                onClear={handleClearJwt}
                copyDisabled={!jwtText.trim()}
              />
            }
          />
          <textarea
            className={editorShell}
            spellCheck={false}
            placeholder="Full token: three dot-separated parts. Parse splits header &amp; payload to the left; Sign writes the whole token here."
            value={jwtText}
            onChange={(e) => setJwtText(e.target.value)}
            onKeyDown={(e) => handleTextareaTabKeyDown(e, setJwtText)}
          />
        </div>
      </div>
    </div>
  );
}
