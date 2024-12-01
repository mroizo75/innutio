import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth-utils'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const risikoVurderinger = await db.risikoVurdering.findMany({
      where: {
        bedriftId: session.user.bedriftId
      },
      include: {
        prosjekt: true,
        opprettetAv: true,
        behandler: true
      },
      orderBy: {
        opprettetDato: 'desc'
      }
    })

    return NextResponse.json(risikoVurderinger)
  } catch (_error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}