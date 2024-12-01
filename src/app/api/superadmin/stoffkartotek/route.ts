import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const stoffkartotek = await db.stoffkartotek.findMany({
    include: {
      bedrift: true,
      FareSymbolMapping: true,
      opprettetAvSuperAdmin: {
        select: {
          navn: true,
          etternavn: true
        }
      }
    }
  })

  return NextResponse.json(stoffkartotek)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const { faresymboler, ...restData } = data
    
    const superadmin = await db.superAdmin.findUnique({
      where: { id: session.user.id }
    })

    if (!superadmin) {
      return NextResponse.json(
        { error: "Ikke autorisert som superadmin" },
        { status: 403 }
      )
    }

    const stoffkartotek = await db.stoffkartotek.create({
      data: {
        produktnavn: restData.produktnavn,
        produsent: restData.produsent,
        beskrivelse: restData.beskrivelse,
        bruksomrade: restData.bruksomrade,
        databladUrl: restData.databladUrl,
        bedriftId: restData.bedriftId,
        opprettetAvSuperAdminId: session.user.id,
        FareSymbolMapping: {
          create: faresymboler.map((symbol: string) => ({
            symbol
          }))
        }
      },
      include: {
        FareSymbolMapping: true,
        opprettetAvSuperAdmin: {
          select: {
            navn: true,
            etternavn: true
          }
        }
      }
    })

    return NextResponse.json(stoffkartotek)
  } catch (error) {
    console.error("Feil ved opprettelse av stoffkartotek:", error)
    return NextResponse.json(
      { error: "Kunne ikke opprette stoffkartotek" },
      { status: 500 }
    )
  }
}