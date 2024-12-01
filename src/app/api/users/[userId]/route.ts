import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { revalidatePath } from "next/cache"

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { navn, etternavn, email, position, role } = body

    const updatedUser = await db.user.update({
      where: { id: params.userId },
      data: {
        navn,
        etternavn,
        email,
        position,
        role,
      },
    })

    revalidatePath("/admin")
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("[USER_PATCH]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}