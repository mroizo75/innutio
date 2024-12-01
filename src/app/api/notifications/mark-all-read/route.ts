import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  await db.notification.updateMany({
    where: { 
      userId: session.user.id,
      read: false 
    },
    data: { read: true },
  });

  return NextResponse.json({ message: 'Alle varsler er markert som lest' });
}