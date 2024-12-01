import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { generateRisikoPDF } from '@/lib/generateRisikoPDF'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await req.json()
    
    const risikoVurdering = await db.risikoVurdering.findUnique({
      where: { id },
      include: {
        prosjekt: true,
        opprettetAv: true,
        behandler: true
      }
    })

    if (!risikoVurdering) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const pdfBytes = await generateRisikoPDF(risikoVurdering)
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="risikovurdering-${id}.pdf"`
      }
    })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}