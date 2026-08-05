import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE, verifyPassword } from '../../../lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const password = typeof body === 'object' && body !== null && 'password' in body ? String((body as { password: unknown }).password) : '';

  if (!password) {
    return NextResponse.json({ error: 'Password is required.' }, { status: 400 });
  }

  let isCorrect: boolean;
  try {
    isCorrect = await verifyPassword(password);
  } catch (error) {
    console.error('Admin auth misconfigured:', error);
    return NextResponse.json({ error: 'Login is not configured. Contact the site administrator.' }, { status: 500 });
  }

  if (!isCorrect) {
    // Deliberately generic message and no distinction between "wrong
    // password" and other failure modes, so a caller can't use response
    // differences to probe for valid state.
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
