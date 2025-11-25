import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, email, name } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert user in Prisma
    const user = await prisma.user.upsert({
      where: { id: id },
      update: {
        email: email,
        name: name || undefined,
      },
      create: {
        id: id,
        email: email,
        name: name,
        role: 'CLIENTE', // Default role
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
