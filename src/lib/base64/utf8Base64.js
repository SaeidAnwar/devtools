export function encodeUtf8ToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64ToUtf8(base64) {
  const cleaned = base64.replace(/\s+/g, '');
  if (!cleaned) return '';

  let binary;
  try {
    binary = atob(cleaned);
  } catch {
    throw new Error('Invalid Base64');
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error('Invalid UTF-8 after decoding');
  }
}
