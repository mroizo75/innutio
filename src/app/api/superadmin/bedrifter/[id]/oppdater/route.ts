import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await request.json()
  
  const oppdatertBedrift = await db.bedrift.update({
    where: { id: params.id },
    data: {
      status: body.status,
      abonnementType: body.abonnementType,
      abonnementStart: body.abonnementStart,
      abonnementSlutt: body.abonnementSlutt
    }
  })

  return NextResponse.json(oppdatertBedrift)
}