'use server';

import { updateGapClientStatus } from '@doubleday/database/client-portal';
import type { GapClientStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { readSessionToken, SESSION_COOKIE_NAME } from '../lib/session';

export type UpdateStatusResult = { ok: true } | { ok: false; error: string };

export async function setGapClientStatus(answerId: string, status: GapClientStatus): Promise<UpdateStatusResult> {
  // Deliberately re-derive organizationId from the session here rather
  // than accept it as a parameter from the client component — a server
  // action's arguments are still client-supplied input. The only
  // trustworthy source for "which organization is this user allowed to
  // write to" is the signed session, checked server-side, same as the
  // dashboard page itself does for reads.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = await readSessionToken(token);

  if (!session) {
    return { ok: false, error: 'Your session has expired. Please sign in again.' };
  }

  try {
    await updateGapClientStatus(session.organizationId, answerId, status);
  } catch {
    return { ok: false, error: 'Could not update that item. Please refresh and try again.' };
  }

  revalidatePath('/');
  return { ok: true };
}
