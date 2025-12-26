import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get email from header
    const email = request.headers.get('x-stack-auth-email');
    
    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({
        id: 'temp',
        name: 'User',
        email,
        role: 'CLIENTE',
        createdAt: new Date()
      });
    }
    
    return NextResponse.json(user);
    
  } catch (error) {
    console.error('[API /users/me] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

