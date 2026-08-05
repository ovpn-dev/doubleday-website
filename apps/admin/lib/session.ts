const COOKIE_NAME = 'doubleday_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set a random 32+ character value in apps/admin/.env.local.',
    );
  }
  return secret;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function hmacSign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toHex(signature);
}

/**
 * Builds a signed session token: `<expiryTimestamp>.<hmacSignature>`.
 * The signature covers the expiry so a token can't be re-used past its
 * lifetime by tampering with the timestamp, and can't be forged without
 * SESSION_SECRET. Uses Web Crypto (globalThis.crypto.subtle) rather than
 * Node's crypto module so this works in both the Node runtime (API routes)
 * and the Edge runtime (middleware) without divergent implementations.
 */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = await hmacSign(payload);
  if (!timingSafeEqualHex(signature, expected)) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error('ADMIN_PASSWORD is not set in apps/admin/.env.local.');
  }
  // Compare via HMAC digest of both values rather than comparing raw
  // strings directly, so the comparison is constant-time regardless of
  // where the two strings first differ (and sidesteps needing Buffer,
  // which isn't guaranteed in the Edge runtime).
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('password-compare'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const [candidateDigest, expectedDigest] = await Promise.all([
    crypto.subtle.sign('HMAC', key, new TextEncoder().encode(candidate)),
    crypto.subtle.sign('HMAC', key, new TextEncoder().encode(expected)),
  ]);
  return timingSafeEqualHex(toHex(candidateDigest), toHex(expectedDigest));
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
