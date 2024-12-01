import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { JsonValue } from '@prisma/client/runtime/library';

interface SkjemaInnhold {
  beskrivelse: string
  place?: string
  discoveredBy?: string
}

interface BaseSkjema {
  id: string
  status: string
  type: string
  tittel: string
  solution: string | null
  notes: string | null
  opprettetDato: Date
  bedriftId: string
  behandlerId: string | null
  opprettetAvId: string
  prosjektId: string
  updatedAt: Date
  bilder: {
    url: string
    navn: string
  }[]
  prosjekt?: {
    navn: string
  }
  opprettetAv: {
    navn: string
    etternavn: string
  }
  behandler?: {
    navn: string
    etternavn: string
  }
}

interface AvvikSkjema extends BaseSkjema {
  innhold: JsonValue
  avviksnummer: string
  isArchived: boolean
  submittedBy: string
  beskrivelse: string
}

interface EndringsSkjema extends BaseSkjema {
  changeNumber: string
  description: string
  implementationDate: Date
  followUpPerson?: string
  comments?: string | null
  isArchived: boolean
  submittedBy: string
}

type Skjema = AvvikSkjema | EndringsSkjema

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skjemaId = searchParams.get('id');
  const skjemaType = searchParams.get('type');

  if (!skjemaId || !skjemaType) {
    return NextResponse.json(
      { error: 'Skjema ID og type er påkrevd' },
      { status: 400 }
    );
  }

  try {
    let skjema: Skjema;
    
    if (skjemaType === 'avvik') {
      const avvikSkjema = await db.skjema.findUnique({
        where: { id: skjemaId },
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
          prosjekt: {
            select: { 
              navn: true 
            }
          },
          bilder: {
            select: {
              url: true,
              navn: true
            }
          }
        },
      });

      if (!avvikSkjema) {
        return NextResponse.json({ error: 'Skjema ikke funnet' }, { status: 404 });
      }

      skjema = avvikSkjema as AvvikSkjema;
    } else {
      skjema = await db.endringsSkjema.findUnique({
        where: { id: skjemaId },
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
          bilder: {
            select: {
              url: true,
              navn: true
            }
          }
        },
      }) as EndringsSkjema;
    }

    if (!skjema) {
      return NextResponse.json(
        { error: 'Skjema ikke funnet' },
        { status: 404 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    
    const margin = 50;
    const fontSize = {
      title: 18,
      header: 14,
      normal: 12
    };
    let yPosition = height - margin;

    // Hjelpefunksjoner
    const checkNewPage = (neededSpace: number) => {
      if (yPosition - neededSpace < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
        return true;
      }
      return false;
    };

    const addText = (text: string, size: number) => {
      const maxWidth = width - (margin * 2);
      const words = text.split(' ');
      let line = '';

      words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          checkNewPage(size + 10);
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= size + 5;
          line = word;
        } else {
          line = testLine;
        }
      });

      if (line) {
        checkNewPage(size + 10);
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= size + 10;
      }
    };

    // Legg til bilder
    const handleBilder = async () => {
      if (skjema.bilder && skjema.bilder.length > 0) {
        addText("Vedlagte bilder:", fontSize.header);
        yPosition -= 20;

        for (const bilde of skjema.bilder) {
          try {
            const imageResponse = await fetch(bilde.url);
            const imageArrayBuffer = await imageResponse.arrayBuffer();
            
            let pdfImage;
            if (bilde.url.toLowerCase().endsWith('.png')) {
              pdfImage = await pdfDoc.embedPng(imageArrayBuffer);
            } else {
              pdfImage = await pdfDoc.embedJpg(imageArrayBuffer);
            }

            const imgDims = pdfImage.scale(0.3);
            checkNewPage(imgDims.height + 40);

            const xPos = (width - imgDims.width) / 2;

            page.drawImage(pdfImage, {
              x: xPos,
              y: yPosition - imgDims.height,
              width: imgDims.width,
              height: imgDims.height,
            });
            
            yPosition -= imgDims.height + 40;
          } catch (error) {
            console.error(`Feil ved lasting av bilde: ${bilde.url}`, error);
            addText(`Kunne ikke laste bilde: ${bilde.navn || 'Ukjent'}`, fontSize.normal);
          }
        }
      }
    };

    // Generer PDF-innhold
    const tittel = skjemaType === 'avvik' ? 'Avviksskjema' : 'Endringsskjema';
    addText(tittel, fontSize.title);
    yPosition -= 20;

    // Metadata og innhold basert på skjematype
    if (skjemaType === 'avvik') {
      const avvikSkjema = skjema as AvvikSkjema;
      // Avviksskjema innhold
      const metadata = [
        `ID: ${avvikSkjema.id}`,
        `Prosjekt: ${avvikSkjema.prosjekt?.navn || 'Ikke angitt'}`,
        `Status: ${avvikSkjema.status}`,
        `Opprettet av: ${avvikSkjema.opprettetAv.navn} ${avvikSkjema.opprettetAv.etternavn}`,
        `Dato: ${new Date(avvikSkjema.opprettetDato).toLocaleDateString('nb-NO')}`,
        avvikSkjema.behandler && `Behandlet av: ${avvikSkjema.behandler.navn} ${avvikSkjema.behandler.etternavn}`,
      ].filter(Boolean);

      metadata.forEach(text => addText(text || '', fontSize.normal));

      yPosition -= 20;
      addText('Beskrivelse:', fontSize.header);
      addText(avvikSkjema.beskrivelse || 'Ingen beskrivelse', fontSize.normal);

      if (avvikSkjema.solution) {
        yPosition -= 10;
        addText('Løsning:', fontSize.header);
        addText(avvikSkjema.solution, fontSize.normal);
      }

      if (avvikSkjema.notes) {
        yPosition -= 10;
        addText('Noter:', fontSize.header);
        addText(avvikSkjema.notes, fontSize.normal);
      }
    } else {
      const endringsSkjema = skjema as EndringsSkjema;
      // Endringsskjema innhold
      const metadata = [
        `Endringsnummer: ${endringsSkjema.changeNumber}`,
        `Prosjekt: ${endringsSkjema.prosjekt?.navn || 'Ikke angitt'}`,
        `Status: ${endringsSkjema.status}`,
        `Opprettet av: ${endringsSkjema.opprettetAv.navn} ${endringsSkjema.opprettetAv.etternavn}`,
        `Implementeringsdato: ${new Date(endringsSkjema.implementationDate).toLocaleDateString('nb-NO')}`,
        endringsSkjema.followUpPerson && `Oppfølgingsansvarlig: ${endringsSkjema.followUpPerson}`,
        `Opprettet: ${new Date(endringsSkjema.opprettetDato).toLocaleDateString('nb-NO')}`,
        endringsSkjema.behandler && `Behandlet av: ${endringsSkjema.behandler.navn} ${endringsSkjema.behandler.etternavn}`,
      ].filter(Boolean);

      metadata.forEach(text => addText(text || '', fontSize.normal));

      yPosition -= 20;
      addText('Beskrivelse:', fontSize.header);
      addText(endringsSkjema.description || 'Ingen beskrivelse', fontSize.normal);

      if (endringsSkjema.solution) {
        yPosition -= 10;
        addText('Løsning:', fontSize.header);
        addText(endringsSkjema.solution, fontSize.normal);
      }

      if (endringsSkjema.comments) {
        yPosition -= 10;
        addText('Kommentarer:', fontSize.header);
        addText(endringsSkjema.comments, fontSize.normal);
      }
    }

    // Legg til bilder etter innholdet
    await handleBilder();

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${skjemaType}_${skjema.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av PDF:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF' },
      { status: 500 }
    );
  }
}