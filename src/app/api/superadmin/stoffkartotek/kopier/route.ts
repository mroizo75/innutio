import { db } from "@/lib/db"
import { auth } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { fraBedriftId, tilBedrifter, stoffkartotekIds } = await req.json()

    const originalStoffkartotek = await db.stoffkartotek.findMany({
      where: {
        id: { in: stoffkartotekIds },
        bedriftId: fraBedriftId,
      },
      include: {
        FareSymbolMapping: true,
      },
    })

    for (const bedriftId of tilBedrifter) {
      for (const stoff of originalStoffkartotek) {
        await db.stoffkartotek.create({
          data: {
            produktnavn: stoff.produktnavn,
            produsent: stoff.produsent,
            databladUrl: stoff.databladUrl,
            beskrivelse: stoff.beskrivelse,
            bruksomrade: stoff.bruksomrade,
            bedriftId: bedriftId,
            opprettetAvSuperAdminId: session.user.id || undefined,
            FareSymbolMapping: {
              create: stoff.FareSymbolMapping.map((mapping) => ({
                symbol: mapping.symbol,
              })),
            },
          },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}