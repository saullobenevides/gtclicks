
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST() {
  try {
    // Rely on server-side session (Stack Auth) via getAuthenticatedUser
    // This helper already performs the Prisma upsert/sync logic.
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}

