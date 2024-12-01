import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { writeFile } from 'fs/promises';
import path from 'path';

interface UploadRequestData {
  prosjektId: string
  skjemaId: string
  oppgaveId?: string
  userId?: string
  endringsSkjemaId?: string
  sjaSkjemaId?: string
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const beskrivelse = formData.get('beskrivelse') as string;
    const prosjektId = formData.get('prosjektId') as string;
    const skjemaId = formData.get('skjemaId') as string;
    const oppgaveId = formData.get('oppgaveId') as string | null;
    const userId = formData.get('userId') as string | null;
    const endringsSkjemaId = formData.get('endringsSkjemaId') as string | null;
    const sjaSkjemaId = formData.get('sjaSkjemaId') as string | null;

    if (!file || !prosjektId || !skjemaId) {
      return NextResponse.json(
        { error: 'Mangler påkrevde felt (fil, prosjektId eller skjemaId)' }, 
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + '_' + file.name.replaceAll(' ', '_');
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);

    const bilde = await db.bilde.create({
      data: {
        url: `/uploads/${filename}`,
        navn: beskrivelse,
        prosjektId,
        skjemaId,
        ...(oppgaveId && { oppgaveId }),
        ...(userId && { userId }),
        ...(endringsSkjemaId && { endringsSkjemaId }),
        ...(sjaSkjemaId && { sjaSkjemaId })
      },
    });

    return NextResponse.json(bilde);
  } catch (error) {
    console.error('Feil ved opplasting av bilde:', error);
    return NextResponse.json({ error: 'Feil ved opplasting av bilde' }, { status: 500 });
  }
}