import { useState, useCallback } from 'react';
import { encodeUtf8ToBase64, decodeBase64ToUtf8 } from '../../lib/base64';
import { STATUS_TYPE } from '../../lib/json-formatter/constants';

const emptyStatus = { message: '', type: STATUS_TYPE.NONE };

export function useBase64Split() {
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [status, setStatus] = useState(emptyStatus);

  const clearStatus = useCallback(() => setStatus(emptyStatus), []);

  const handlePlainChange = useCallback((value) => {
    setPlainText(value);
    clearStatus();
  }, [clearStatus]);

  const handleBase64Change = useCallback((value) => {
    setBase64Text(value);
    clearStatus();
  }, [clearStatus]);

  const handleEncode = useCallback(() => {
    clearStatus();
    try {
      setBase64Text(encodeUtf8ToBase64(plainText));
      setStatus({ message: 'Encoded to Base64', type: STATUS_TYPE.SUCCESS });
      setTimeout(() => setStatus(emptyStatus), 2000);
    } catch {
      setStatus({ message: 'Could not encode to Base64', type: STATUS_TYPE.ERROR });
    }
  }, [plainText, clearStatus]);

  const handleDecode = useCallback(() => {
    clearStatus();
    const cleaned = base64Text.replace(/\s+/g, '');
    if (!cleaned) {
      setStatus({ message: 'Nothing to decode', type: STATUS_TYPE.ERROR });
      return;
    }
    try {
      setPlainText(decodeBase64ToUtf8(base64Text));
      setStatus({ message: 'Decoded to UTF-8', type: STATUS_TYPE.SUCCESS });
      setTimeout(() => setStatus(emptyStatus), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Decode failed';
      setStatus({ message: msg, type: STATUS_TYPE.ERROR });
    }
  }, [base64Text, clearStatus]);

  const handleCopyPlain = useCallback(() => {
    if (!plainText) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    void navigator.clipboard.writeText(plainText);
    setStatus({ message: 'Copied decoded text', type: STATUS_TYPE.SUCCESS });
    setTimeout(() => setStatus(emptyStatus), 2000);
  }, [plainText]);

  const handleCopyBase64 = useCallback(() => {
    if (!base64Text) {
      setStatus({ message: 'Nothing to copy', type: STATUS_TYPE.ERROR });
      return;
    }
    void navigator.clipboard.writeText(base64Text);
    setStatus({ message: 'Copied Base64', type: STATUS_TYPE.SUCCESS });
    setTimeout(() => setStatus(emptyStatus), 2000);
  }, [base64Text]);

  const handleClearPlain = useCallback(() => {
    setPlainText('');
    clearStatus();
  }, [clearStatus]);

  const handleClearBase64 = useCallback(() => {
    setBase64Text('');
    clearStatus();
  }, [clearStatus]);

  return {
    plainText,
    base64Text,
    status,
    handlePlainChange,
    handleBase64Change,
    handleEncode,
    handleDecode,
    handleCopyPlain,
    handleCopyBase64,
    handleClearPlain,
    handleClearBase64,
  };
}
