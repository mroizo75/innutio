import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth-utils'
import { generateRisikoPDF } from '@/lib/generateRisikoPDF'
import { Prisma, RisikoVurdering } from '@prisma/client'

type RisikoVurderingWithRelations = Prisma.RisikoVurderingGetPayload<{
  include: {
    prosjekt: true;
    opprettetAv: true;
    behandler: true;
  }
}>;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const risikoVurdering = await db.risikoVurdering.findUnique({
      where: { id: params.id },
      include: {
        prosjekt: true,
        opprettetAv: true,
        behandler: true
      }
    })

    if (!risikoVurdering) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    const pdfBytes = await generateRisikoPDF(risikoVurdering as RisikoVurderingWithRelations & { kommentar: string | undefined })
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="risikovurdering-${params.id}.pdf"`
      }
    })
  } catch (error) {
    console.error('PDF generering feilet:', error)
    return NextResponse.json({ error: 'Kunne ikke generere PDF' }, { status: 500 })
  }
}