import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        bedrift: {
          include: {
            users: true,
            prosjekter: {
              include: {
                timeEntries: {
                  select: {
                    id: true,
                    hours: true,
                    date: true,
                    prosjektId: true
                  }
                },
                oppgaver: {
                  include: {
                    bruker: {
                      select: {
                        id: true,
                        navn: true,
                        etternavn: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log('API Response Data:', JSON.stringify(currentUser, null, 2)); // Debug logging

    if (!currentUser || currentUser.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    // Beregn statistikk og chartData
    const chartData = currentUser.bedrift.prosjekter.map(prosjekt => ({
      prosjektNavn: prosjekt.navn,
      timer: prosjekt.timeEntries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0)
    }));

    console.log('Chart Data being sent:', chartData); // Debug logging

    return NextResponse.json({
      bedrift: currentUser.bedrift,
      chartData // Legg til chartData direkte i responsen
    })
    
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 