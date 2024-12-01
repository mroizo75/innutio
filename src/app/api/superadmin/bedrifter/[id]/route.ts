import { db } from "@/lib/db"
import { auth } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const bedrift = await db.bedrift.findUnique({
      where: { id: params.id },
      include: {
        users: true,
        prosjekter: true,
        Stoffkartotek: true,
        supportLogg: {
          include: {
            superAdmin: {
              select: {
                navn: true,
                etternavn: true
              }
            },
            user: {
              select: {
                navn: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    return NextResponse.json(bedrift)
  } catch (_error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}