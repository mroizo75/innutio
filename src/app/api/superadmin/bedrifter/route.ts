import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const superadmin = await db.superAdmin.findUnique({
    where: { id: session.user.id }
  })

  if (!superadmin) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const bedrifter = await db.bedrift.findMany({
    include: {
      users: true,
      prosjekter: true,
      Stoffkartotek: true,
      supportLogg: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  })

  return NextResponse.json(bedrifter)
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const superadmin = await db.superAdmin.findUnique({
    where: { id: session.user.id }
  })

  if (!superadmin) {
    return new NextResponse("Forbidden", { status: 403 })
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