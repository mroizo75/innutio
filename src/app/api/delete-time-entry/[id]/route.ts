import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth-utils"
import { deleteTimeEntry } from "@/data/timeEntry"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Ikke autentisert" },
        { status: 401 }
      )
    }

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID mangler" },
        { status: 400 }
      )
    }

    await deleteTimeEntry(id)
    
    return NextResponse.json(
      { message: "Timeregistrering slettet" },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke slette timeregistrering" },
      { status: 500 }
    )
  }
}