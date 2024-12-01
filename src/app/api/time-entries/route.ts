import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth-utils'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const prosjektId = formData.get('prosjektId') as string
    const date = new Date(formData.get('date') as string)
    const hours = Number(formData.get('hours'))
    const description = formData.get('description') as string

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (currentUser?.role !== "ADMIN" && currentUser?.role !== "LEDER") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const timeEntry = await db.timeEntry.create({
      data: {
        bruker: { connect: { id: userId } },
        prosjekt: { connect: { id: prosjektId } },
        date,
        hours,
        description,
      },
    })

    return NextResponse.json(timeEntry)
  } catch (error) {
    console.error('Feil ved registrering av timer:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}