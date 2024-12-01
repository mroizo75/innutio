import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const bedriftId = searchParams.get('bedriftId')

    if (!bedriftId) {
      return new NextResponse("Mangler bedriftId", { status: 400 })
    }

    if (bedriftId === 'all') {
      const allSupportLogs = await db.supportLogg.findMany({
        include: {
          bedrift: {
            select: {
              id: true,
              navn: true
            }
          },
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
          },
          resolvedBy: {
            select: {
              navn: true,
              etternavn: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      const serializedData = {
        id: "all",
        navn: "Alle bedrifter",
        supportLogg: allSupportLogs.map(logg => ({
          id: logg.id,
          type: logg.type,
          beskrivelse: logg.beskrivelse,
          opprettetAv: logg.opprettetAv,
          createdAt: logg.createdAt.toISOString(),
          status: logg.status || 'OPEN',
          bedrift: {
            id: logg.bedrift.id,
            navn: logg.bedrift.navn
          },
          superAdmin: logg.superAdmin,
          user: logg.user,
          resolvedBy: logg.resolvedBy,
          resolvedAt: logg.resolvedAt?.toISOString()
        }))
      }

      return NextResponse.json(serializedData)
    }

    const supportLogger = await db.bedrift.findUnique({
      where: { id: bedriftId },
      include: {
        supportLogg: {
          include: {
            bedrift: true,
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
            },
            resolvedBy: {
              select: {
                navn: true,
                etternavn: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!supportLogger) {
      return new NextResponse("Bedrift ikke funnet", { status: 404 })
    }

    const serializedData = {
      id: supportLogger.id,
      navn: supportLogger.navn,
      supportLogg: supportLogger.supportLogg.map(logg => ({
        id: logg.id,
        type: logg.type,
        beskrivelse: logg.beskrivelse,
        opprettetAv: logg.opprettetAv,
        createdAt: logg.createdAt.toISOString(),
        status: logg.status || 'OPEN',
        bedrift: {
          id: logg.bedrift.id,
          navn: logg.bedrift.navn
        },
        superAdmin: logg.superAdmin,
        user: logg.user,
        resolvedBy: logg.resolvedBy,
        resolvedAt: logg.resolvedAt?.toISOString()
      }))
    }

    return NextResponse.json(serializedData)
  } catch (error) {
    console.error("Feil ved henting av support-logger:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { bedriftId, type, beskrivelse } = await request.json()

    // Sjekk om brukeren er SuperAdmin
    const superadmin = await db.superAdmin.findUnique({
      where: { id: session.user.id }
    })

    const supportLogg = await db.supportLogg.create({
      data: {
        type,
        beskrivelse,
        bedriftId,
        status: 'OPEN',
        opprettetAv: session.user.email || "Ukjent",
        ...(superadmin 
          ? { superAdminId: session.user.id }
          : { userId: session.user.id }
        )
      }
    })

    return NextResponse.json(supportLogg)
  } catch (error) {
    console.error("Feil ved opprettelse av support-logg:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { loggId, status } = await request.json()
    
    const superadmin = await db.superAdmin.findUnique({
      where: { id: session.user.id }
    })

    if (!superadmin) {
      return new NextResponse("Kun superadmin kan endre status", { status: 403 })
    }

    const oppdatertLogg = await db.supportLogg.update({
      where: { id: loggId },
      data: {
        status,
        ...(status === 'RESOLVED' ? {
          resolvedById: session.user.id,
          resolvedAt: new Date()
        } : {})
      },
      include: {
        bedrift: true,
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
        },
        resolvedBy: {
          select: {
            navn: true,
            etternavn: true
          }
        }
      }
    })

    return NextResponse.json(oppdatertLogg)
  } catch (error) {
    console.error("Feil ved oppdatering av support-logg:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}