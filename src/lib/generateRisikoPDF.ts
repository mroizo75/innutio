import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'

interface RisikoVurdering {
  id: string
  prosjekt: { navn: string }
  dato: Date
  utfortAv: string
  godkjentAv: string | null
  fareBeskrivelse: string
  arsaker: string
  konsekvenser: string
  sannsynlighet: number
  konsekvensGrad: number
  risikoVerdi: number
  eksisterendeTiltak: string
  nyeTiltak: string
  ansvarlig: string
  tidsfrist: Date
  restRisiko: string
  risikoAkseptabel: boolean
  oppfolging: string
  nesteGjennomgang: Date
  status: string
  opprettetDato: Date
  behandler?: { navn: string; etternavn: string } | null
  signature?: string | null
  kommentar?: string
  updatedAt?: Date
  opprettetAv: {
    navn: string
    etternavn: string
  }
}

export async function generateRisikoPDF(risikoVurdering: RisikoVurdering) {
  try {
    if (!risikoVurdering) {
      throw new Error('Ingen risikovurdering data tilgjengelig')
    }

    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    const { width, height } = page.getSize()
    let yPosition = height - 50
    const margin = 50

    // Hjelpefunksjoner
    const splitTextIntoLines = (text: string, size: number, maxWidth: number) => {
      // Håndter linjeskift i teksten
      const paragraphs = text.split('\n').filter(Boolean);
      let allLines: string[] = [];

      paragraphs.forEach(paragraph => {
        const words = paragraph.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testLineWidth = font.widthOfTextAtSize(testLine, size);

          if (testLineWidth < maxWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) allLines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) allLines.push(currentLine);
      });

      return allLines;
    };

    const drawWrappedText = (text: string, size = 12) => {
      const maxWidth = width - 100;
      const lines = splitTextIntoLines(text, size, maxWidth);

      lines.forEach(line => {
        if (yPosition < 50) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }

        page.drawText(line.trim(), {
          x: 50,
          y: yPosition,
          size,
          font,
        });
        yPosition -= size + 5;
      });
    };

    const checkPageSpace = (neededSpace: number) => {
      if (yPosition < neededSpace) {
        page = pdfDoc.addPage()
        yPosition = height - 50
      }
    }

    // Tittel
    drawWrappedText(`Risikovurdering - ${risikoVurdering.prosjekt.navn}`, 18, true)
    yPosition -= 20

    // Grunnleggende informasjon
    const sections = [
      {
        title: '1. Grunnleggende informasjon',
        fields: [
          { label: 'Prosjekt', value: risikoVurdering.prosjekt.navn },
          { label: 'Dato', value: format(new Date(risikoVurdering.dato), 'dd.MM.yyyy', { locale: nb }) },
          { label: 'Opprettet av', value: `${risikoVurdering.opprettetAv.navn} ${risikoVurdering.opprettetAv.etternavn}` },
          { label: 'Utført av', value: risikoVurdering.utfortAv },
          { label: 'Godkjent av', value: risikoVurdering.godkjentAv || 'Ikke godkjent' }
        ]
      },
      {
        title: '2. Fareidentifikasjon',
        fields: [
          { label: 'Farebeskrivelse', value: risikoVurdering.fareBeskrivelse },
          { label: 'Årsaker', value: risikoVurdering.arsaker },
          { label: 'Konsekvenser', value: risikoVurdering.konsekvenser }
        ]
      },
      {
        title: '3. Risikovurdering',
        fields: [
          { label: 'Sannsynlighet', value: risikoVurdering.sannsynlighet.toString() },
          { label: 'Konsekvensgrad', value: risikoVurdering.konsekvensGrad.toString() },
          { label: 'Risikoverdi', value: risikoVurdering.risikoVerdi.toString() }
        ]
      },
      {
        title: '4. Tiltak',
        fields: [
          { label: 'Eksisterende tiltak', value: risikoVurdering.eksisterendeTiltak },
          { label: 'Nye tiltak', value: risikoVurdering.nyeTiltak },
          { label: 'Ansvarlig', value: risikoVurdering.ansvarlig },
          { label: 'Tidsfrist', value: format(new Date(risikoVurdering.tidsfrist), 'dd.MM.yyyy', { locale: nb }) }
        ]
      },
      {
        title: '5. Restrisiko og aksept',
        fields: [
          { label: 'Restrisiko', value: risikoVurdering.restRisiko },
          { label: 'Risiko akseptabel', value: risikoVurdering.risikoAkseptabel ? 'Ja' : 'Nei' }
        ]
      },
      {
        title: '6. Oppfølging',
        fields: [
          { label: 'Oppfølgingsplan', value: risikoVurdering.oppfolging },
          { label: 'Neste gjennomgang', value: format(new Date(risikoVurdering.nesteGjennomgang), 'dd.MM.yyyy', { locale: nb }) }
        ]
      },
      {
        title: '7. Behandlingsstatus',
        fields: [
          { label: 'Status', value: risikoVurdering.status },
          { label: 'Behandlet av', value: risikoVurdering.behandler ? 
            `${risikoVurdering.behandler.navn} ${risikoVurdering.behandler.etternavn}` : 
            'Ikke behandlet' 
          },
          { label: 'Behandlingskommentar', value: risikoVurdering.kommentar || 'Ingen kommentar' },
          { label: 'Behandlet dato', value: risikoVurdering.updatedAt ? 
            format(new Date(risikoVurdering.updatedAt), 'dd.MM.yyyy', { locale: nb }) :
            'Ikke behandlet'
          }
        ]
      }
    ]

    // Tegn alle seksjoner
    for (const section of sections) {
      checkPageSpace(200)
      drawWrappedText(section.title, 14, true)
      yPosition -= 10

      for (const field of section.fields) {
        drawWrappedText(`${field.label}: ${field.value}`)
        yPosition -= 5
      }
      yPosition -= 15
    }

    // Legg til etter risikovurderingsseksjonen
    const risikoFarger = {
      lav: rgb(0.2, 0.8, 0.2),     // Grønn
      middels: rgb(1, 0.8, 0),     // Gul
      høy: rgb(1, 0, 0)            // Rød
    }

    const getRisikoFarge = (verdi: number) => {
      if (verdi <= 4) return risikoFarger.lav
      if (verdi <= 9) return risikoFarger.middels
      return risikoFarger.høy
    }

    // Tegn risikomatrise
    const tegnRisikomatrise = () => {
      checkPageSpace(300)
      drawWrappedText('Risikomatrise', 14, true)
      yPosition -= 20

      const cellSize = 40
      const startX = margin + 50
      const startY = yPosition - 20
      
      // Tegn rutenett med tall og farger
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
          const risikoVerdi = (5-i) * (j+1)
          const isCurrentRisk = risikoVurdering.sannsynlighet === (j+1) && 
                               risikoVurdering.konsekvensGrad === (5-i)
          
          page.drawRectangle({
            x: startX + (j * cellSize),
            y: startY - (i * cellSize),
            width: cellSize,
            height: cellSize,
            borderColor: rgb(0, 0, 0),
            borderWidth: isCurrentRisk ? 2 : 1,
            color: getRisikoFarge(risikoVerdi),
            opacity: isCurrentRisk ? 1 : 0.5
          })

          // Legg til risikoverdien i hver celle
          page.drawText(risikoVerdi.toString(), {
            x: startX + (j * cellSize) + 15,
            y: startY - (i * cellSize) + 15,
            size: 10,
            font: font,
            color: rgb(0, 0, 0)
          })
        }
      }

      // Legg til aksetitler
      page.drawText('Sannsynlighet ->', {
        x: startX + (5 * cellSize) / 2 - 40,
        y: startY - (5 * cellSize) - 20,
        size: 10,
        font: font
      })

      page.drawText('Konsekvens ^', {
        x: startX - 40,
        y: startY - (5 * cellSize) / 2,
        size: 10,
        font: font,
        rotate: {
          type: 'degrees',
          angle: 90
        }
      })

      // Legg til forklaringstekst
      yPosition = startY - (5 * cellSize) - 50
      drawWrappedText(`Aktuell risiko: ${risikoVurdering.risikoVerdi} (Sannsynlighet: ${risikoVurdering.sannsynlighet}, Konsekvens: ${risikoVurdering.konsekvensGrad})`, 12, true)
      
      yPosition -= 30
    }

    tegnRisikomatrise()

    return await pdfDoc.save()
  } catch (error) {
    console.error('Feil i PDF-generering:', error)
    throw new Error(`Feil ved generering av PDF: ${error instanceof Error ? error.message : 'Ukjent feil'}`)
  }
}
