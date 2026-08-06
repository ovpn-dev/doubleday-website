import { prisma } from '@doubleday/database/client';
import { verifyPassword } from '@doubleday/auth/password';
import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from '../../../lib/session';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = typeof body === 'object' && body !== null && 'email' in body ? String((body as { email: unknown }).email).trim().toLowerCase() : '';
  const password = typeof body === 'object' && body !== null && 'password' in body ? String((body as { password: unknown }).password) : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Generic error message for every failure mode below (user not found, no
  // password set, wrong password, no organization membership) — so a
  // caller can't use response differences to discover which emails exist.
  const genericError = NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Login is not configured. Contact Doubleday Expressions.' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { organizationId: true },
      },
    },
  });

  if (!user || !user.passwordHash) {
    return genericError;
  }

  const isCorrect = await verifyPassword(password, user.passwordHash);
  if (!isCorrect) {
    return genericError;
  }

  const membership = user.memberships[0];
  if (!membership) {
    // A user record with no organization membership can't use this portal
    // — there's nothing to scope their session to.
    return genericError;
  }

  const token = await createSessionToken(user.id, membership.organizationId);
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
