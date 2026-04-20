import { useCallback, useRef, useState } from 'react';
import { STATUS_TYPE } from '../../lib/json-formatter/constants';
import { decodeJwt, encodeJwtHs } from '../../lib/jwt/jwtCodec';
import { kvRowsToObject, objectToKvRows } from './jwtPayloadKv';

const DEFAULT_HEADER = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

const emptyStatus = { message: '', type: STATUS_TYPE.NONE };

export const PAYLOAD_MODE = { JSON: 'json', KV: 'kv' };

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

export function useJwtTool() {
  const rowIdRef = useRef(0);
  const makeRowId = useCallback(() => {
    rowIdRef.current += 1;
    return `kv-${rowIdRef.current}`;
  }, []);

  const [headerText, setHeaderText] = useState(DEFAULT_HEADER);
  const [payloadText, setPayloadText] = useState('{}');
  const [payloadEditMode, setPayloadEditMode] = useState(PAYLOAD_MODE.JSON);
  const [kvRows, setKvRows] = useState(() => [{ id: 'kv-0', key: '', value: '' }]);
  const [secret, setSecret] = useState('');
  const [jwtText, setJwtText] = useState('');
  const [status, setStatus] = useState(emptyStatus);

  const clearStatus = useCallback(() => setStatus(emptyStatus), []);

  const flashSuccess = useCallback((message) => {
    setStatus({ message, type: STATUS_TYPE.SUCCESS });
    setTimeout(() => setStatus(emptyStatus), 2000);
  }, []);

  const setErr = useCallback((message) => {
    setStatus({ message, type: STATUS_TYPE.ERROR });
  }, []);

  const resetKvRows = useCallback(() => {
    setKvRows([{ id: makeRowId(), key: '', value: '' }]);
  }, [makeRowId]);

  const handleParse = useCallback(() => {
    clearStatus();
    try {
      const r = decodeJwt(jwtText);
      setHeaderText(r.headerText);
      setPayloadText(r.payloadText);
      setPayloadEditMode(PAYLOAD_MODE.JSON);
      flashSuccess(
        r.segmentCount === 3 ? 'Parsed JWT' : `Parsed token (${r.segmentCount} parts)`,
      );
    } catch (e) {
      setHeaderText('');
      setPayloadText('');
      setPayloadEditMode(PAYLOAD_MODE.JSON);
      resetKvRows();
      setErr(e.message ?? 'Invalid JWT');
    }
  }, [jwtText, clearStatus, flashSuccess, resetKvRows, setErr]);

  const handleSign = useCallback(async () => {
    clearStatus();
    try {
      const headerObj = JSON.parse(headerText);
      if (typeof headerObj !== 'object' || headerObj === null || Array.isArray(headerObj)) {
        throw new Error('Header must be a JSON object');
      }
      const payloadObj =
        payloadEditMode === PAYLOAD_MODE.KV ? kvRowsToObject(kvRows) : JSON.parse(payloadText);
      const jwt = await encodeJwtHs(headerObj, payloadObj, secret);
      setJwtText(jwt);
      flashSuccess('Signed JWT');
    } catch (e) {
      setErr(e.message ?? 'Could not build JWT');
    }
  }, [headerText, payloadText, payloadEditMode, kvRows, secret, clearStatus, flashSuccess, setErr]);

  const handleCopyJwt = useCallback(async () => {
    const t = jwtText.trim();
    if (!t) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    try {
      await copyText(t);
      flashSuccess('Copied JWT');
    } catch {
      setErr('Copy failed');
    }
  }, [jwtText, flashSuccess, setErr]);

  const handleCopyHeader = useCallback(async () => {
    if (!headerText.trim()) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    try {
      await copyText(headerText);
      flashSuccess('Copied header');
    } catch {
      setErr('Copy failed');
    }
  }, [headerText, flashSuccess, setErr]);

  const handleClearHeader = useCallback(() => {
    setHeaderText(DEFAULT_HEADER);
    clearStatus();
  }, [clearStatus]);

  const handleCopyPayload = useCallback(async () => {
    const text =
      payloadEditMode === PAYLOAD_MODE.KV
        ? JSON.stringify(kvRowsToObject(kvRows), null, 2)
        : payloadText;
    if (!text.trim()) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    try {
      await copyText(text);
      flashSuccess('Copied payload');
    } catch {
      setErr('Copy failed');
    }
  }, [payloadText, payloadEditMode, kvRows, flashSuccess, setErr]);

  const handleClearPayload = useCallback(() => {
    setPayloadText('{}');
    setPayloadEditMode(PAYLOAD_MODE.JSON);
    resetKvRows();
    clearStatus();
  }, [resetKvRows, clearStatus]);

  const handlePayloadModeJson = useCallback(() => {
    if (payloadEditMode === PAYLOAD_MODE.JSON) return;
    const obj = kvRowsToObject(kvRows);
    setPayloadText(JSON.stringify(obj, null, 2));
    setPayloadEditMode(PAYLOAD_MODE.JSON);
    clearStatus();
  }, [payloadEditMode, kvRows, clearStatus]);

  const handlePayloadModeKv = useCallback(() => {
    if (payloadEditMode === PAYLOAD_MODE.KV) return;
    try {
      const parsed = JSON.parse(payloadText);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Payload must be a JSON object to use Key/Value');
      }
      setKvRows(objectToKvRows(parsed, makeRowId));
      setPayloadEditMode(PAYLOAD_MODE.KV);
      clearStatus();
    } catch (e) {
      setErr(e.message ?? 'Invalid JSON');
    }
  }, [payloadEditMode, payloadText, makeRowId, clearStatus, setErr]);

  const addKvRow = useCallback(() => {
    setKvRows((rows) => [...rows, { id: makeRowId(), key: '', value: '' }]);
  }, [makeRowId]);

  const removeKvRow = useCallback(
    (id) => {
      setKvRows((rows) => {
        if (rows.length <= 1) {
          return [{ id: makeRowId(), key: '', value: '' }];
        }
        return rows.filter((r) => r.id !== id);
      });
    },
    [makeRowId],
  );

  const updateKvRow = useCallback((id, field, value) => {
    setKvRows((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const handleCopySecret = useCallback(async () => {
    if (!secret) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    try {
      await copyText(secret);
      flashSuccess('Copied secret');
    } catch {
      setErr('Copy failed');
    }
  }, [secret, flashSuccess, setErr]);

  const handleClearSecret = useCallback(() => {
    setSecret('');
    clearStatus();
  }, [clearStatus]);

  const handleClearJwt = useCallback(() => {
    setJwtText('');
    clearStatus();
  }, [clearStatus]);

  const handleClearAll = useCallback(() => {
    setHeaderText(DEFAULT_HEADER);
    setPayloadText('{}');
    setPayloadEditMode(PAYLOAD_MODE.JSON);
    setKvRows([{ id: makeRowId(), key: '', value: '' }]);
    setSecret('');
    setJwtText('');
    clearStatus();
  }, [makeRowId, clearStatus]);

  const payloadCopyEmpty =
    payloadEditMode === PAYLOAD_MODE.KV
      ? Object.keys(kvRowsToObject(kvRows)).length === 0
      : !payloadText.trim();

  return {
    headerText,
    setHeaderText,
    payloadText,
    setPayloadText,
    payloadEditMode,
    kvRows,
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
    handlePayloadModeJson,
    handlePayloadModeKv,
    addKvRow,
    removeKvRow,
    updateKvRow,
    handleCopySecret,
    handleClearSecret,
    handleClearJwt,
    handleClearAll,
    payloadCopyEmpty,
  };
}
