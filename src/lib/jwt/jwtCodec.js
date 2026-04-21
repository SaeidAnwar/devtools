import { bytesToBase64Url, utf8ToBase64Url, base64UrlToUtf8 } from './base64Url';

/** Keys / patterns whose values we mask in decode output (JWTs must not be trusted as private). */
const REDACT_KEYS_EXACT = new Set([
  'password',
  'passwd',
  'pwd',
  'secret',
  'client_secret',
  'api_key',
  'apikey',
  'apisecret',
  'private_key',
  'privatekey',
  'access_token',
  'refresh_token',
  'id_token',
  'client_assertion',
  'authorization',
]);

/**
 * @param {string} key
 * @returns {boolean}
 */
function shouldRedactKey(key) {
  const k = key.toLowerCase();
  if (k === 'token_type' || k === 'typ' || k === 'kid') return false;
  if (REDACT_KEYS_EXACT.has(k)) return true;
  if (k.endsWith('_secret') || k.endsWith('_password')) return true;
  if (k.includes('password')) return true;
  return false;
}

/**
 * @param {unknown} value
 * @returns {unknown}
 */
function redactSensitiveInValue(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveInValue(item));
  }
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (shouldRedactKey(key)) {
      out[key] = '[redacted]';
    } else {
      out[key] = redactSensitiveInValue(v);
    }
  }
  return out;
}

/**
 * @param {string} text
 * @param {{ redact?: boolean }} [opts]
 * @returns {string}
 */
function formatJsonMaybe(text, opts = {}) {
  const { redact = false } = opts;
  try {
    const v = JSON.parse(text);
    const safe =
      redact && v !== null && typeof v === 'object' ? redactSensitiveInValue(v) : v;
    return JSON.stringify(safe, null, 2);
  } catch {
    return text;
  }
}

/**
 * @param {string} token
 * @returns {{ headerText: string, payloadText: string, signature: string, segmentCount: number }}
 */
export function decodeJwt(token) {
  const t = token.trim();
  const parts = t.split('.');
  if (parts.length < 2) {
    throw new Error('JWT needs at least two segments (header.payload)');
  }
  let headerText;
  let payloadText;
  try {
    headerText = formatJsonMaybe(base64UrlToUtf8(parts[0]), { redact: true });
  } catch {
    throw new Error('Could not decode header');
  }
  try {
    payloadText = formatJsonMaybe(base64UrlToUtf8(parts[1]), { redact: true });
  } catch {
    throw new Error('Could not decode payload');
  }
  return {
    headerText,
    payloadText,
    signature: parts[2] ?? '',
    segmentCount: parts.length,
  };
}

/** @param {'SHA-256' | 'SHA-384' | 'SHA-512'} hashName */
async function hmacSign(hashName, secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: hashName },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return new Uint8Array(sig);
}

/** @param {string} alg */
function algToHashName(alg) {
  if (alg === 'HS256') return 'SHA-256';
  if (alg === 'HS384') return 'SHA-384';
  if (alg === 'HS512') return 'SHA-512';
  return null;
}

/**
 * @param {Record<string, unknown>} headerObj
 * @param {unknown} payloadObj any JSON-serializable value
 * @param {string} secret
 * @returns {Promise<string>}
 */
export async function encodeJwtHs(headerObj, payloadObj, secret) {
  const header = { typ: 'JWT', ...headerObj };
  const alg = typeof header.alg === 'string' ? header.alg : 'HS256';
  const hashName = algToHashName(alg);
  if (!hashName) {
    throw new Error('Unsupported alg (use HS256, HS384, or HS512)');
  }
  header.alg = alg;

  const headerStr = JSON.stringify(header);
  const payloadStr = JSON.stringify(payloadObj);
  const p1 = utf8ToBase64Url(headerStr);
  const p2 = utf8ToBase64Url(payloadStr);
  const signingInput = `${p1}.${p2}`;
  const sigBytes = await hmacSign(hashName, secret, signingInput);
  const sig = bytesToBase64Url(sigBytes);
  return `${signingInput}.${sig}`;
}
