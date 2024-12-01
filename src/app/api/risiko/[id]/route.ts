import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth-utils'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { 
        id: session.user.id 
      }
    })

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const risikoVurdering = await db.risikoVurdering.findUnique({
      where: { id: params.id },
      include: {
        prosjekt: true,
        opprettetAv: true,
        behandler: true,
      }
    })

    if (!risikoVurdering) {
      return new NextResponse("Ikke funnet", { status: 404 })
    }

    return NextResponse.json(risikoVurdering)
  } catch (error) {
    console.error('API Error:', error)
    return new NextResponse("Intern feil", { status: 500 })
  }
}