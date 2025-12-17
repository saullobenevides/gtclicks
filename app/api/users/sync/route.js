
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, email, image } = body;

    if (!id || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name,
        email, 
        image,
      },
      create: {
        id,
        name,
        email,
        image,
        role: 'CLIENTE',
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
