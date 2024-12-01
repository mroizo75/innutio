import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.id !== params.userId) {
      return new NextResponse("Uautorisert", { status: 401 })
    }

    const body = await req.json()
    
    const utdanning = await db.utdanning.create({
      data: {
        ...body,
        userId: params.userId
      }
    })

    return NextResponse.json(utdanning)
  } catch (error) {
    console.error("[UTDANNING_POST]", error)
    return new NextResponse("Intern Feil", { status: 500 })
  }
}