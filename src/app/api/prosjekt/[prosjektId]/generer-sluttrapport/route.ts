import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth-utils';
import { PDFDocument, StandardFonts, rgb, RotationTypes } from 'pdf-lib';
import { downloadFile } from '@/lib/googleCloudStorage';

type ProsjektBilde = {
  url: string;
  beskrivelse?: string;
};

interface SkjemaInnhold {
  beskrivelse: string;
  place?: string;
  discoveredBy?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { prosjektId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.redirect('/auth/login');
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.redirect('/auth/login');
    }

    if (
      currentUser.role !== 'ADMIN' &&
      currentUser.role !== 'LEDER' &&
      currentUser.role !== 'PROSJEKTLEDER'
    ) {
      return NextResponse.json({ error: 'Ingen tilgang' }, { status: 403 });
    }

    const prosjektId = params.prosjektId;

    // Hent prosjektet med all nødvendig informasjon
    const prosjekt = await db.prosjekt.findUnique({
      where: { id: prosjektId },
      include: {
        users: true,
        oppgaver: {
          include: {
            bilder: true,
          },
        },
        skjemaer: {
          include: {
            bilder: true,
            opprettetAv: true,
            behandler: true,
          },
        },
        endringsSkjemaer: {
          include: {
            bilder: true,
          },
        },
        sjaSkjemaer: true,
        bilder: true,
      },
    });

    if (!prosjekt) {
      return NextResponse.json({ error: 'Prosjekt ikke funnet' }, { status: 404 });
    }

    // Opprett en ny PDF med pdf-lib
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let yPosition = height - 50; // Startposisjon for tekst

    const splitTextIntoLines = (text: string, size: number, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLineWidth = font.widthOfTextAtSize(testLine, size);

        if (testLineWidth < maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
      return lines;
    };

    const drawWrappedText = (text: string, size = 12, color = rgb(0, 0, 0)) => {
      const maxWidth = width - 100;
      const lines = splitTextIntoLines(text, size, maxWidth);

      for (const line of lines) {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size,
          font,
          color,
        });
        yPosition -= size + 5;
      }
    };

    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition < requiredSpace) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
    };

    const handleBilder = async (bilder: ProsjektBilde[], tittel?: string) => {
      if (bilder && bilder.length > 0) {
        if (tittel) {
          drawWrappedText(tittel, 14);
          yPosition -= 10;
        }

        let currentX = 50; // Start fra venstre side med margin
        const imagesPerRow = 2; // Antall bilder per rad
        let imageCount = 0;
        let lastImgDims: { width: number; height: number } | null = null;

        for (const bilde of bilder) {
          try {
            const imageBuffer = await downloadFile(bilde.url);
            const image = await pdfDoc.embedJpg(imageBuffer);
            const imgDims = image.scale(0.3);
            lastImgDims = imgDims;
            
            // Sjekk om vi trenger ny side
            if (yPosition < imgDims.height + 50) {
              page = pdfDoc.addPage();
              yPosition = height - 50;
              currentX = 50; // Reset til venstre side
              imageCount = 0;
            }
            
            // Beregn x-posisjon basert på bildenummer
            if (imageCount > 0 && imageCount % imagesPerRow === 0) {
              yPosition = yPosition - imgDims.height - 30;
              currentX = 50; // Reset til venstre side
            }
            
            // For -90 graders rotasjon
            page.drawImage(image, {
              x: currentX,
              y: yPosition,
              width: imgDims.width,
              height: imgDims.height,
              rotate: { angle: 90, type: RotationTypes.Degrees }
            });
            
            // Legg til beskrivelse hvis den finnes
            if (bilde.beskrivelse) {
              const beskrivelseTekst = `Beskrivelse: ${bilde.beskrivelse}`;
              const tekstBredde = font.widthOfTextAtSize(beskrivelseTekst, 10);
              const xPosTekst = currentX - (tekstBredde / 2) + (imgDims.height / 2);
              
              page.drawText(beskrivelseTekst, {
                x: xPosTekst,
                y: yPosition - imgDims.width - 15,
                size: 10,
                font
              });
            }

            // Oppdater X-posisjon for neste bilde (flytt mot høyre)
            currentX += (imgDims.height + 30);
            imageCount++;

            // Hvis vi har nådd maks bilder per rad, oppdater Y-posisjon
            if (imageCount % imagesPerRow === 0) {
              yPosition = yPosition - imgDims.width - 40;
            }

          } catch (error) {
            console.error('Feil ved innlasting av bilde:', error);
          }
        }
        
        // Juster final Y-posisjon basert på siste rad
        if (imageCount > 0 && lastImgDims) {
          if (imageCount % imagesPerRow !== 0) {
            yPosition = yPosition - lastImgDims.width - 40;
          }
          yPosition -= 20;
        }
      }
    };

    // Hjelpefunksjon for å parse JSON-innhold
    const parseJsonInnhold = (innhold: any): string => {
      try {
        if (typeof innhold === 'string') {
          const parsed = JSON.parse(innhold) as SkjemaInnhold;
          return parsed.beskrivelse || 'Ingen beskrivelse';
        }
        
        if (typeof innhold === 'object' && innhold !== null) {
          return (innhold as SkjemaInnhold).beskrivelse || 'Ingen beskrivelse';
        }

        return 'Ingen beskrivelse';
      } catch (error) {
        console.error('Feil ved parsing av JSON:', error);
        return 'Ingen beskrivelse';
      }
    };

    const _håndterEndringsskjema = async (skjema: {
      bilder?: ProsjektBilde[];
      changeNumber: string;
      description: string;
      status: string;
      submittedBy: string;
      implementationDate: Date;
      followUpPerson?: string;
      comments?: string;
      solution?: string;
      isArchived: boolean;
      opprettetDato: Date;
      updatedAt: Date;
    }) => {
      // Start ny side for hvert endringsskjema
      page = pdfDoc.addPage();
      yPosition = height - 50;
      
      // Håndter bilder først hvis de finnes
      if (skjema.bilder && skjema.bilder.length > 0) {
        await handleBilder(skjema.bilder, `Dokumentasjon - Endringsmelding ${skjema.changeNumber}`);
      }
      
      // Sjekk om vi trenger ny side for skjemateksten
      if (yPosition < 200) {
        page = pdfDoc.addPage();
        yPosition = height - 50;
      }
      
      // Tegn overskrift med understrek
      drawWrappedText(`Endringsmelding ${skjema.changeNumber}`, 16, rgb(0, 0, 0));
      page.drawLine({
        start: { x: 50, y: yPosition - 5 },
        end: { x: width - 50, y: yPosition - 5 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.7),
      });
      yPosition -= 30;
      
      // Tegn informasjonsboks
      const boksStart = yPosition;
      
      // Skjemainformasjon med all relevant data fra modellen
      const infoLinjer = [
        [`Endringsnummer:`, skjema.changeNumber],
        [`Beskrivelse:`, skjema.description],
        [`Status:`, skjema.status],
        [`Innsendt av:`, skjema.submittedBy],
        [`Implementeringsdato:`, new Date(skjema.implementationDate).toLocaleDateString('nb-NO')],
        skjema.followUpPerson ? [`Oppfølgingsansvarlig:`, skjema.followUpPerson] : null,
        skjema.comments ? [`Kommentarer:`, skjema.comments] : null,
        skjema.solution ? [`Løsning:`, skjema.solution] : null,
        [`Arkivert:`, skjema.isArchived ? 'Ja' : 'Nei'],
        [`Opprettet:`, new Date(skjema.opprettetDato).toLocaleDateString('nb-NO')],
        [`Sist oppdatert:`, new Date(skjema.updatedAt).toLocaleDateString('nb-NO')]
      ].filter(linje => linje !== null);
      
      for (const [label, verdi] of infoLinjer) {
        drawWrappedText(`${label} ${verdi}`, 12);
        yPosition -= 20; // Konsistent avstand mellom linjer
      }
      
      // Tegn ramme rundt informasjonen
      page.drawRectangle({
        x: 40,
        y: yPosition - 10,
        width: width - 80,
        height: boksStart - yPosition + 20,
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      });
      
      yPosition -= 40; // Avstand til neste element
    };

    // Start å skrive til PDF-en
    drawWrappedText(`Sluttrapport for ${prosjekt.navn}`, 20);
    yPosition -= 10;

    // Prosjektinformasjon
    drawWrappedText(`Beskrivelse: ${prosjekt.beskrivelse || 'Ingen beskrivelse'}`, 14);
    drawWrappedText(`Startdato: ${prosjekt.startDato.toLocaleDateString('nb-NO')}`);
    drawWrappedText(`Sluttdato: ${prosjekt.sluttDato.toLocaleDateString('nb-NO')}`);
    drawWrappedText(`Status: ${prosjekt.status}`);
    yPosition -= 10;

    // Prosjektdeltakere
    checkPageSpace(100);
    drawWrappedText('Prosjektdeltakere:', 16);
    prosjekt.users.forEach((user) => {
      drawWrappedText(`- ${user.navn} ${user.etternavn} (${user.role})`);
    });
    yPosition -= 10;

    // Oppgaveoversikt
    checkPageSpace(150);
    drawWrappedText('Oppgaver:', 16);
    for (const oppgave of prosjekt.oppgaver) {
      drawWrappedText(`- ${oppgave.tittel} (${oppgave.status})`);
      await handleBilder(oppgave.bilder, 'Bilder for oppgave:');
    }
    yPosition -= 10;

// Skjemaoversikt (Avvik)
checkPageSpace(150);
drawWrappedText('Avviksskjemaer:', 16);
yPosition -= 10;

for (const skjema of prosjekt.skjemaer) {
  checkPageSpace(100);
  drawWrappedText(`- Avviksnummer: ${skjema.avviksnummer}`);
  drawWrappedText(`  Beskrivelse: ${skjema.innhold ? parseJsonInnhold(skjema.innhold) : 'Ingen beskrivelse'}`);
  drawWrappedText(`  Kortsiktig løsning: ${skjema.solution || 'Ingen'}`);
  drawWrappedText(`  Langsiktig løsning: ${skjema.notes || 'Ingen'}`);
  yPosition -= 5;
  
  await handleBilder(skjema.bilder, 'Bilder for avvik:');
  yPosition -= 20;
}

    // Endringsskjemaer
    checkPageSpace(150);
    drawWrappedText('Endringsskjemaer:', 16);
    yPosition -= 10;

    for (const skjema of prosjekt.endringsSkjemaer) {
      // Håndter bilder først
      await handleBilder(skjema.bilder, `Bilder for endringsmelding ${skjema.changeNumber}:`);
      
      // Deretter skriv ut skjemainformasjonen
      drawWrappedText(`- ${skjema.changeNumber}: ${prosjekt.navn} 
        (${skjema.status})`);
      drawWrappedText(`  Beskrivelse: ${skjema.description}`);
      if (skjema.comments) {
        drawWrappedText(`  Kommentarer: ${skjema.comments}`);
      }
      drawWrappedText(`  Innsendt av: ${skjema.submittedBy}`);
      yPosition -= 20;
    }

    // SJA-skjemaer
    checkPageSpace(150);
    drawWrappedText('SJA-skjemaer:', 16);
    yPosition -= 20;

    for (const skjema of prosjekt.sjaSkjemaer) {
      drawWrappedText(`- ${skjema.jobTitle} (${skjema.status})`);
      yPosition -= 40;
    }

    // Bilder knyttet til prosjektet
    await handleBilder(prosjekt.bilder, 'Prosjektbilder:');

    // Generer PDF-en
    const pdfBytes = await pdfDoc.save();

    // Returner PDF-filen som respons
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sluttrapport_${prosjekt.navn}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Feil ved generering av sluttrapport:', error);
    return NextResponse.json({ error: 'Kunne ikke generere sluttrapport' }, { status: 500 });
  }
}
