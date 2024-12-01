import { NextResponse } from "next/server"
import { resetPassword } from "@/actions/reset-password"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token og passord er påkrevd" }, { status: 400 })
    }

    const result = await resetPassword(token, password)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.success })
  } catch (error) {
    console.error("Feil ved oppdatering av passord:", error)
    return NextResponse.json({ error: "Kunne ikke sette opp passord" }, { status: 500 })
  }
}