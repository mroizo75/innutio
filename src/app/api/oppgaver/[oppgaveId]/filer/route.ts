import { NextResponse } from 'next/server'
import formidable from 'formidable'
import { auth } from "@/lib/auth-utils"
import { db } from '@/lib/db'
import { uploadFile } from '@/lib/googleCloudStorage'
import { IncomingMessage } from 'http'

// Legg til denne istedenfor
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { oppgaveId: string } }) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ message: 'Ikke autentisert' }, { status: 401 })
  }

  const oppgaveId = params.oppgaveId

  const oppgave = await db.oppgave.findUnique({
    where: { id: oppgaveId },
  })

  if (oppgave?.brukerId !== session.user.id) {
    return NextResponse.json({ message: 'Ingen tilgang' }, { status: 403 })
  }

  const form = new formidable.IncomingForm()
  const [_fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) reject(err)
      else resolve([fields, files])
    })
  })

  const fileArray = Array.isArray(files.files) ? files.files : [files.files]

  const nyeFiler = await Promise.all(
    fileArray.map(async (file) => {
      if (!file) return null
      const result = await uploadFile(file as unknown as File)
      const fil = await db.fil.create({
        data: {
          url: result.url,
          navn: result.navn,
          oppgaveId,
          type: 'fil',
        },
      })
      return fil
    })
  )

  return NextResponse.json(nyeFiler)
}