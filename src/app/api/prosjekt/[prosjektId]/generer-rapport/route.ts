import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import ExcelJS from 'exceljs';

export async function GET(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  const { prosjektId } = params;

  const session = await auth();
  const currentUser = await db.user.findUnique({
    where: { id: session?.user?.id },
  });

  if (!currentUser) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }

  if (currentUser.role !== "ADMIN" && currentUser.role !== "LEDER") {
    return NextResponse.json({ error: "Ingen tilgang" }, { status: 403 });
  }

  try {
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: prosjektId },
      include: {
        timeEntries: true,
      },
    });

    if (!prosjekt) {
      return NextResponse.json({ error: "Prosjekt ikke funnet" }, { status: 404 });
    }

    // Hent brukerinformasjon
    const userIds = prosjekt.timeEntries.map(entry => entry.brukerId);
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, navn: true, etternavn: true },
    });

    const userMap = new Map<string, string>();
    users.forEach(user => {
      userMap.set(user.id, `${user.navn} ${user.etternavn}`);
    });

    // Opprett Excel-arbeidsbok
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Prosjektrapport");

    // Legg til kolonneoverskrifter
    worksheet.columns = [
      { header: 'Dato', key: 'dato', width: 15 },
      { header: 'Bruker', key: 'bruker', width: 25 },
      { header: 'Timer', key: 'timer', width: 10 },
      { header: 'Beskrivelse', key: 'beskrivelse', width: 30 },
    ];

    // Legg til timeEntries-data
    prosjekt.timeEntries.forEach((entry) => {
      worksheet.addRow({
        dato: entry.date.toISOString().split('T')[0],
        bruker: userMap.get(entry.brukerId) || 'Ukjent bruker',
        timer: entry.hours,
        beskrivelse: entry.description || '',
      });
    });

    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=prosjektrapport_${prosjektId}.xlsx`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av rapport:', error);
    return NextResponse.json({ error: 'Feil ved generering av rapport' }, { status: 500 });
  }
}