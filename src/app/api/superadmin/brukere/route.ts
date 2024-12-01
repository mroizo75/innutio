import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const brukere = await db.user.findMany({
    include: {
      bedrift: true
    }
  })

  return NextResponse.json(brukere)
}