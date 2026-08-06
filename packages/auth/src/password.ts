import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hashes a plaintext password for storage in User.passwordHash. Format:
 * `<hex salt>:<hex derived key>`. Uses scrypt (memory-hard, unlike a plain
 * HMAC or SHA hash) so a leaked database doesn't hand over crackable
 * passwords cheaply. Must run in the Node runtime — scrypt isn't available
 * in Next.js's Edge runtime (middleware), so this is only ever called from
 * API routes, never from middleware.ts.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored hash from hashPassword.
 * Returns false (rather than throwing) for a malformed/legacy hash so a
 * corrupt record can't crash a login attempt into a 500.
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  const [saltHex, keyHex] = storedHash.split(':');
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expectedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = (await scrypt(plainPassword, salt, expectedKey.length)) as Buffer;

  if (derivedKey.length !== expectedKey.length) return false;
  return timingSafeEqual(derivedKey, expectedKey);
}
