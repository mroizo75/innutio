import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PDFDocument, StandardFonts, degrees, rgb } from 'pdf-lib';

interface SkjemaInnhold {
  beskrivelse?: string
  place?: string
  discoveredBy?: string
}

export async function GET(
  request: Request,
  { params }: { params: { skjemaType: string; id: string } }
) {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    
    const margin = 50;
    let yPosition = height - margin;
    
    const fontSize = {
      title: 18,
      header: 14,
      normal: 12
    };

    // Hjelpefunksjoner
    const checkPageSpace = (neededSpace: number) => {
      if (yPosition - neededSpace < margin) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = height - margin;
        return true;
      }
      return false;
    };

    const addText = (text: string, isHeader = false, size = fontSize.normal) => {
      const maxWidth = width - (margin * 2);
      const words = text.split(' ');
      let line = '';

      words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);

        if (testWidth > maxWidth) {
          checkPageSpace(size + 10);
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
        checkPageSpace(size + 10);
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= size + (isHeader ? 15 : 10);
      }
    };

    // Hent skjema basert på type
    let skjema;
    if (params.skjemaType.toLowerCase() === 'avvik') {
      skjema = await db.skjema.findUnique({
        where: { id: params.id },
        include: {
          opprettetAv: true,
          behandler: true,
          prosjekt: true,
          bilder: true,
        }
      });

      // Header
      addText('AVVIKSSKJEMA', true, fontSize.title);
      yPosition -= 20;

      // Metadata
      addText(`Prosjekt: ${skjema?.prosjekt?.navn || 'Ikke angitt'}`, false, fontSize.normal);
      addText(`Status: ${skjema?.status}`, false, fontSize.normal);
      addText(`Opprettet av: ${skjema?.opprettetAv?.navn} ${skjema?.opprettetAv?.etternavn}`, false, fontSize.normal);
      addText(`Dato: ${new Date(skjema?.opprettetDato || new Date()).toLocaleDateString('nb-NO')}`, false, fontSize.normal);
      
      if (skjema?.behandler) {
        addText(`Behandlet av: ${skjema.behandler.navn} ${skjema.behandler.etternavn}`, false, fontSize.normal);
      }
      yPosition -= 20;

      // Innhold
      const innhold = skjema?.innhold as SkjemaInnhold;
      addText('Beskrivelse:', true, fontSize.header);
      addText(innhold?.beskrivelse || 'Ingen beskrivelse', false, fontSize.normal);
      yPosition -= 20;

      if (skjema?.solution) {
        addText('Løsning:', true, fontSize.header);
        addText(skjema.solution, false, fontSize.normal);
        yPosition -= 20;
      }

      if (skjema?.notes) {
        addText('Noter:', true, fontSize.header);
        addText(skjema.notes, false, fontSize.normal);
        yPosition -= 20;
      }
    } else {
      // Endringsskjema
      skjema = await db.endringsSkjema.findUnique({
        where: { id: params.id },
        include: {
          opprettetAv: true,
          behandler: true,
          prosjekt: {
            select: { navn: true }
          },
          bilder: {
            select: {
              url: true,
              navn: true
            }
          }
        },
      });

      if (!skjema) {
        return NextResponse.json({ error: 'Endringsskjema ikke funnet' }, { status: 404 });
      }

      // Tittel
      addText('Endringsskjema', true, fontSize.title);
      yPosition -= 20;

      // Metadata
      const metadata = [
        `Endringsnummer: ${skjema.changeNumber}`,
        `Prosjekt: ${skjema.prosjekt?.navn || 'Ikke angitt'}`,
        `Status: ${skjema.status}`,
        `Opprettet av: ${skjema.opprettetAv.navn} ${skjema.opprettetAv.etternavn}`,
        `Implementeringsdato: ${new Date(skjema.implementationDate).toLocaleDateString('nb-NO')}`,
        skjema.followUpPerson && `Oppfølgingsansvarlig: ${skjema.followUpPerson}`,
        `Opprettet: ${new Date(skjema.opprettetDato).toLocaleDateString('nb-NO')}`,
        skjema.behandler && `Behandlet av: ${skjema.behandler.navn} ${skjema.behandler.etternavn}`,
        `Sist oppdatert: ${new Date(skjema.updatedAt).toLocaleDateString('nb-NO')}`,
        `Arkivert: ${skjema.isArchived ? 'Ja' : 'Nei'}`
      ].filter(Boolean);

      metadata.forEach(text => addText(text || '', false, fontSize.normal));

      // Beskrivelse
      yPosition -= 20;
      addText('Beskrivelse:', true, fontSize.header);
      addText(skjema.description || 'Ingen beskrivelse', false, fontSize.normal);

      // Løsning
      if (skjema.solution) {
        yPosition -= 10;
        addText('Løsning:', true, fontSize.header);
        addText(skjema.solution, false, fontSize.normal);
      }

      // Kommentarer
      if (skjema.comments) {
        yPosition -= 10;
        addText('Kommentarer:', true, fontSize.header);
        addText(skjema.comments, false, fontSize.normal);
      }
    }

    // Legg til bilder
    if (skjema?.bilder && skjema.bilder.length > 0) {
      addText('Vedlagte bilder:', true, fontSize.header);
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

          const scale = 0.3;
          const imgDims = pdfImage.scale(scale);
          
          // Beregn nye dimensjoner for rotert bilde
          const rotatedWidth = imgDims.height;
          const rotatedHeight = imgDims.width;
          
          checkPageSpace(rotatedHeight + 40);

          // Sentrer bildet på siden
          const xPos = (width - rotatedWidth) / 2;
          const yPos = yPosition;

          page.drawImage(pdfImage, {
            x: xPos + (rotatedWidth / 2),
            y: yPos,
            width: imgDims.width,
            height: imgDims.height,
            rotate: degrees(-90),
            xSkew: degrees(0),
            ySkew: degrees(0)
          });
          
          yPosition -= rotatedHeight + 20;
        } catch (error) {
          console.error(`Feil ved lasting av bilde: ${bilde.url}`, error);
          addText(`Kunne ikke laste bilde: ${bilde.navn || 'Ukjent'}`, false, fontSize.normal);
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${params.skjemaType}_${params.id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av PDF:', error);
    return NextResponse.json({ error: 'Kunne ikke generere PDF' }, { status: 500 });
  }
}