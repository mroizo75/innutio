import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import ExcelJS from "exceljs";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "LEDER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json({ error: "Måned og år er påkrevd" }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const timeEntries = await db.timeEntry.findMany({
      where: {
        prosjekt: {
          bedriftId: currentUser.bedriftId,
        },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        prosjekt: true,
        oppgave: true,
        bruker: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Timer_${month}_${year}`);

    worksheet.columns = [
      { header: 'Dato', key: 'date', width: 15 },
      { header: 'Timer', key: 'hours', width: 10 },
      { header: 'Prosjekt', key: 'prosjekt', width: 25 },
      { header: 'Oppgave', key: 'oppgave', width: 25 },
      { header: 'Beskrivelse', key: 'description', width: 30 },
      { header: 'Bruker', key: 'bruker', width: 25 },
    ];

    timeEntries.forEach(entry => {
      worksheet.addRow({
        date: new Date(entry.date).toLocaleDateString(),
        hours: entry.hours,
        prosjekt: entry.prosjekt?.navn || 'Ukjent prosjekt',
        oppgave: entry.oppgave?.tittel || 'Ingen oppgave',
        description: entry.description || '',
        bruker: `${entry.bruker?.navn} ${entry.bruker?.etternavn}`,
      });
    });

    // Style header
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCCCCC' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Generer buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename=Timer_${month}_${year}.xlsx`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error("Feil ved eksport av timer til Excel:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Valgfritt: Legg til GET for testing
export async function GET() {
  return NextResponse.json({ message: "API-ruten fungerer!" });
}