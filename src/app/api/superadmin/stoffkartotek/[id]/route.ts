import { db } from "@/lib/db"
import { auth } from "@/lib/auth-utils"
import { NextResponse } from "next/server"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const data = await req.json()
    
    const stoffkartotek = await db.stoffkartotek.update({
      where: { id: params.id },
      data: {
        databladUrl: data.databladUrl,
      }
    })

    return NextResponse.json(stoffkartotek)
  } catch (error) {
    console.error("Feil ved oppdatering av stoffkartotek:", error)
    return new NextResponse(
      JSON.stringify({ message: "Kunne ikke oppdatere stoffkartotek" }), 
      { status: 500 }
    )
  }
}