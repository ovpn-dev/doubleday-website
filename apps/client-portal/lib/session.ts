const COOKIE_NAME = 'doubleday_client_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.CLIENT_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'CLIENT_SESSION_SECRET is missing or too short. Set a random 32+ character value in apps/client-portal/.env.local. ' +
        'This must be a DIFFERENT value from apps/admin\'s SESSION_SECRET — reusing it would let the two session ' +
        'systems forge each other\'s cookies.',
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

// Deliberately avoid Node's Buffer here — this module runs in both the
// Node runtime (API routes) and Next's Edge runtime (middleware), and
// Buffer's Edge-runtime support has changed across Next.js versions.
// btoa/atob + TextEncoder/TextDecoder are unambiguously available in both.
function utf8ToBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUtf8(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(input.length + ((4 - (input.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
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

export type SessionPayload = {
  userId: string;
  organizationId: string;
  expiresAt: number;
};

/**
 * Builds a signed session token carrying WHO is signed in (userId) and
 * WHICH organization's data they may see (organizationId) — unlike admin's
 * session, which only needs to say "is a valid session," the client
 * portal's every query must be scoped to one organization, so that scoping
 * has to travel with the session itself, not be looked up separately in a
 * way that could be tampered with.
 */
export async function createSessionToken(userId: string, organizationId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = JSON.stringify({ userId, organizationId, expiresAt });
  const payloadB64 = utf8ToBase64Url(payload);
  const signature = await hmacSign(payloadB64);
  return `${payloadB64}.${signature}`;
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expected = await hmacSign(payloadB64);
  if (!timingSafeEqualHex(signature, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlToUtf8(payloadB64));
  } catch {
    return null;
  }

  if (!payload.userId || !payload.organizationId || !Number.isFinite(payload.expiresAt)) return null;
  if (Date.now() > payload.expiresAt) return null;

  return payload;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
