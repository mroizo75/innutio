import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { status } = await req.json()

    const oppdatertSkjema = await db.sJASkjema.update({
      where: { id: params.id },
      data: { 
        status,
        behandler: {
          connect: {
            id: session.user.id
          }
        }
      },
      include: {
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        behandler: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        prosjekt: {
          select: {
            navn: true
          }
        },
        SJAProdukt: {
          select: {
            id: true,
            navn: true,
            mengde: true,
            produktId: true
          }
        },
        bilder: {
          select: {
            id: true,
            url: true,
            navn: true
          }
        }
      }
    })

    return NextResponse.json(oppdatertSkjema)
  } catch (error) {
    console.error("Feil ved oppdatering av status:", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}