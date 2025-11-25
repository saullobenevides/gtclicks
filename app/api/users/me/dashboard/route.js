import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Check for Admin role first
  if (user.serverMetadata?.role === 'ADMIN') {
    return NextResponse.json({ url: '/admin/saques' });
  }

  // Check for Photographer role
  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true },
  });

  if (fotografo) {
    return NextResponse.json({ 
      url: '/dashboard/fotografo',
      username: fotografo.username 
    });
  }

  // Default for regular users (customers)
  // We can create a customer dashboard later if needed. For now, no specific dashboard.
  return NextResponse.json({ url: null });
}
