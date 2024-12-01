import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const shaPlan = await db.sHAPlan.findUnique({
      where: { id: params.id },
      include: {
        opprettetAv: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        behandler: {
          select: {
            navn: true,
            etternavn: true
          }
        },
        vedlegg: true,
        prosjekt: {
          select: {
            navn: true
          }
        }
      }
    });

    if (!shaPlan) {
      return NextResponse.json({ error: 'SHA-plan ikke funnet' }, { status: 404 });
    }

    return NextResponse.json(shaPlan);
    
  } catch (error) {
    console.error('Feil ved henting av SHA-plan:', error);
    return NextResponse.json(
      { error: 'Kunne ikke hente SHA-plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    const data = await req.json();

    const oppdatertShaPlan = await db.sHAPlan.update({
      where: { id: params.id },
      data: {
        ...data,
        sistOppdatert: new Date(),
        behandler: data.behandlerId ? {
          connect: { id: data.behandlerId }
        } : undefined
      }
    });

    revalidatePath('/sha');
    return NextResponse.json(oppdatertShaPlan);
    
  } catch (error) {
    console.error('Feil ved oppdatering av SHA-plan:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oppdatere SHA-plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
    }

    await db.sHAPlan.delete({
      where: { id: params.id }
    });

    revalidatePath('/sha');
    return NextResponse.json({ message: 'SHA-plan slettet' });
    
  } catch (error) {
    console.error('Feil ved sletting av SHA-plan:', error);
    return NextResponse.json(
      { error: 'Kunne ikke slette SHA-plan' },
      { status: 500 }
    );
  }
}