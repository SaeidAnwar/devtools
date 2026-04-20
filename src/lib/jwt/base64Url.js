/** @param {Uint8Array} bytes */
export function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(binary);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** @param {string} b64url */
export function base64UrlToBytes(b64url) {
  const padded = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padLen);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** @param {string} str */
export function utf8ToBase64Url(str) {
  return bytesToBase64Url(new TextEncoder().encode(str));
}

/** @param {string} b64url */
export function base64UrlToUtf8(b64url) {
  return new TextDecoder().decode(base64UrlToBytes(b64url));
}
