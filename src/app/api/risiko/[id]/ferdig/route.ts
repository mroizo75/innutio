import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { status, kommentar } = body

    const risikoVurdering = await db.risikoVurdering.update({
      where: { id: params.id },
      data: {
        status,
        kommentar
      }
    })

    return NextResponse.json(risikoVurdering)
  } catch (_error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
}