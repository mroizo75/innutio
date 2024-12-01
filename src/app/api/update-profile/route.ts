import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Uautorisert", { status: 401 })
    }

    const body = await req.json()
    const { navn, etternavn, email, position, bildeUrl } = body

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        navn,
        etternavn,
        email,
        position,
        bildeUrl,
      },
    })

    // Oppdater session med ny data
    const newSession = await getServerSession(authOptions)
    if (newSession) {
      // Oppdater session manuelt
      await db.session.update({
        where: { 
          userId: session.user.id,
          id: newSession.id,
          // Finn den aktive sesjonen
          expires: {
            gt: new Date()
          }
        },
        data: {
          user: {
            update: {
              bildeUrl: updatedUser.bildeUrl,
            }
          }
        }
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[USER_UPDATE]", error)
    return new NextResponse("Intern Feil", { status: 500 })
  }
}