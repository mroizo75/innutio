import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';

export async function generatePDF(skjema: any, skjemaType: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4-størrelse i punkter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Definer fontstørrelser
  const headerFontSize = 12;
  const titleFontSize = 18; // Større font for tittelen
  const contentFontSize = 12;
  const footerFontSize = 10;

  // Hent sidestørrelse
  const { width, height } = page.getSize();

  // Definer marginer
  const marginLeft = 50;
  const marginRight = 50;

  // **Legg til bedriftsnavn øverst, sentrert**
  const companyName: string = skjema.bedrift?.navn || 'Bedriftsnavn';
  const companyNameWidth = font.widthOfTextAtSize(companyName, headerFontSize);
  const companyY = height - 50;
  page.drawText(companyName, {
    x: (width - companyNameWidth) / 2,
    y: companyY,
    size: headerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // **Plasser ID-feltet**
  const idY = companyY - headerFontSize - 20; // Bruker fontstørrelsen for nøyaktig mellomrom
  page.drawText(`ID: ${skjema.id}`, {
    x: marginLeft,
    y: idY,
    size: headerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Oppdater Y-posisjonen for videre innhold
  let currentY = idY - 20;

  // **Header-tabell**
  const headerHeight = 60;
  const headerY = currentY - 10; // Startposisjon for header (under ID-feltet)

  // Tegn rektangel rundt header
  page.drawRectangle({
    x: marginLeft,
    y: headerY - headerHeight,
    width: width - marginLeft - marginRight,
    height: headerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Del headeren i kolonner
  const numColumns = 3;
  const columnWidth = (width - marginLeft - marginRight) / numColumns;

  // Header-felt og verdier
  const headerFields = [
    { label: 'Skjematype', value: skjemaType },
    { label: 'Dato', value: formatDate(skjema.opprettetDato) },
    {
      label: 'Ansvarlig',
      value: `${skjema.opprettetAv?.navn || ''} ${skjema.opprettetAv?.etternavn || ''}`,
    },
  ];

  // Tegn vertikale linjer og legg til tekst i hver celle
  for (let i = 0; i <= numColumns; i++) {
    const x = marginLeft + i * columnWidth;
    // Vertikal linje
    page.drawLine({
      start: { x: x, y: headerY },
      end: { x: x, y: headerY - headerHeight },
      color: rgb(0, 0, 0),
      thickness: 1,
    });

    if (i < numColumns) {
      const field = headerFields[i];
      const cellX = marginLeft + i * columnWidth + 5;
      const cellY = headerY - 15;
      const cellWidth = columnWidth - 10;

      drawWrappedText(
        page,
        `${field.label}: ${field.value}`,
        cellX,
        cellY,
        cellWidth,
        headerFontSize,
        font
      );
    }
  }

  // Horisontal linje nederst i headeren
  page.drawLine({
    start: { x: marginLeft, y: headerY - headerHeight },
    end: { x: width - marginRight, y: headerY - headerHeight },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // **Tittel uten etikett**
  let contentY = headerY - headerHeight - 30;
  if (skjema.tittel || skjema.jobTitle || skjema.description) {
    const title: string = skjema.tittel || skjema.jobTitle || skjema.description;
    page.drawText(title, {
      x: marginLeft,
      y: contentY,
      size: titleFontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    contentY -= titleFontSize + 20; // Legg til mellomrom etter tittelen
  }

  // **Hovedinnhold basert på skjematype**
  if (skjemaType === 'Avvik') {
    // Legg til felter for Avvik
    const contentFields = [
      {
        label: 'Opprettet av',
        value: `${skjema.opprettetAv?.navn || ''} ${skjema.opprettetAv?.etternavn || ''}`,
      },
      {
        label: 'Behandlet av',
        value: `${skjema.behandler?.navn || ''} ${skjema.behandler?.etternavn || ''}`,
      },
      { label: 'Status', value: skjema.status },
      { label: 'Kortsiktig utbedring', value: skjema.solution },
      { label: 'Langsiktig utbedring', value: skjema.notes },
    ];

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );

  } else if (skjemaType === 'Endring') {
    const contentFields = [
      { label: 'Endringsnummer', value: skjema.changeNumber },
      { label: 'Prosjekt', value: skjema.prosjekt?.navn || 'Ikke angitt' },
      { label: 'Beskrivelse', value: skjema.description },
      { label: 'Status', value: skjema.status },
      { 
        label: 'Opprettet av', 
        value: `${skjema.opprettetAv?.navn || ''} ${skjema.opprettetAv?.etternavn || ''}` 
      },
      { 
        label: 'Behandlet av', 
        value: skjema.behandler ? `${skjema.behandler.navn} ${skjema.behandler.etternavn}` : 'Ikke behandlet' 
      },
      { 
        label: 'Implementeringsdato', 
        value: new Date(skjema.implementationDate).toLocaleDateString('nb-NO') 
      },
      skjema.followUpPerson && { label: 'Oppfølgingsansvarlig', value: skjema.followUpPerson },
      skjema.comments && { label: 'Kommentarer', value: skjema.comments },
      skjema.solution && { label: 'Løsning', value: skjema.solution },
      { 
        label: 'Opprettet dato', 
        value: new Date(skjema.opprettetDato).toLocaleDateString('nb-NO') 
      },
      { 
        label: 'Sist oppdatert', 
        value: new Date(skjema.updatedAt).toLocaleDateString('nb-NO') 
      },
      { label: 'Arkivert', value: skjema.isArchived ? 'Ja' : 'Nei' }
    ].filter(field => field !== undefined);

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );

  } else if (skjemaType === 'SJA') {
    const contentFields = [
      { label: 'Jobbtittel', value: sanitizeText(skjema.jobTitle) },
      { label: 'Sted', value: sanitizeText(skjema.jobLocation) },
      { label: 'Dato', value: formatDate(skjema.jobDate) },
      { label: 'Deltakere', value: sanitizeText(skjema.participants) },
      { label: 'Jobbeskrivelse', value: sanitizeText(skjema.jobDescription) },
      { label: 'Identifiserte risikoer', value: sanitizeText(skjema.identifiedRisks) },
      { label: 'Risikoreduserende tiltak', value: sanitizeText(skjema.riskMitigation) },
      { label: 'Ansvarlig person', value: sanitizeText(skjema.responsiblePerson) },
      { label: 'Status', value: sanitizeText(skjema.status) },
    ];

    if (skjema.SJAProdukt && skjema.SJAProdukt.length > 0) {
      contentFields.push({
        label: 'Produkter i bruk',
        value: skjema.SJAProdukt.map(p => 
          `${sanitizeText(p.navn)} - Mengde: ${sanitizeText(p.mengde)}`
        ).join('; ')
      });
    }

    contentY = addContentFields(
      page,
      contentFields,
      contentY,
      font,
      contentFontSize,
      width,
      marginLeft,
      marginRight
    );
  }

  // **Footer med signatur og dato**
  const footerY = 50;
  const footerHeight = 60;
  const footerColumnWidth = (width - marginLeft - marginRight) / 2;

  // Tegn rektangel rundt footeren
  page.drawRectangle({
    x: marginLeft,
    y: footerY,
    width: width - marginLeft - marginRight,
    height: footerHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1,
  });

  // Vertikal linje mellom kolonnene
  page.drawLine({
    start: { x: marginLeft + footerColumnWidth, y: footerY },
    end: { x: marginLeft + footerColumnWidth, y: footerY + footerHeight },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Dato-feltet
  const dateX = marginLeft + 5;
  const dateY = footerY + footerHeight - 20;
  page.drawText('Dato:', {
    x: dateX,
    y: dateY,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  page.drawText(formatDate(skjema.approvalDate || skjema.opprettetDato), {
    x: dateX,
    y: dateY - footerFontSize - 5,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });

  // Signatur-feltet
  const signatureX = marginLeft + footerColumnWidth + 5;
  const signatureY = footerY + footerHeight - 20;
  page.drawText('Signatur:', {
    x: signatureX,
    y: signatureY,
    size: footerFontSize,
    font: font,
    color: rgb(0, 0, 0),
  });
  // Tegn en linje for signaturen
  page.drawLine({
    start: { x: signatureX, y: signatureY - 15 },
    end: { x: signatureX + footerColumnWidth - 10, y: signatureY - 15 },
    color: rgb(0, 0, 0),
    thickness: 1,
  });

  // Legg til signaturbilde hvis tilgjengelig
  if (skjema.signature) {
    try {
      const signatureImage = await pdfDoc.embedPng(skjema.signature);
      const signatureDims = signatureImage.scale(0.5);
      page.drawImage(signatureImage, {
        x: signatureX,
        y: signatureY - 50,
        width: signatureDims.width,
        height: signatureDims.height,
      });
    } catch (err) {
      console.error('Feil ved innlasting av signatur:', err);
    }
  }

  // Generer og returner PDF
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Hjelpefunksjon for å legge til innholds-felter
function addContentFields(
  page: PDFPage,
  fields: { label: string; value: string | number | undefined }[],
  startY: number,
  font: PDFFont,
  fontSize: number,
  pageWidth: number,
  marginLeft: number,
  marginRight: number
): number {
  let y = startY;
  const maxWidth = pageWidth - marginLeft - marginRight;

  fields.forEach(field => {
    if (field.value !== undefined && field.value !== null) {
      y -= drawWrappedText(
        page,
        `${field.label}:`,
        marginLeft,
        y,
        maxWidth,
        fontSize,
        font
      ) + 5;

      y -= drawWrappedText(
        page,
        `${field.value}`,
        marginLeft + 20, // Indenter verdien
        y,
        maxWidth - 20,
        fontSize,
        font
      ) + 15; // Legg til mellomrom mellom feltene
    }
  });

  return y;
}

// Hjelpefunksjon for å formatere datoer
function formatDate(dateInput: Date | string | undefined): string {
  if (!dateInput) return 'Ikke angitt';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Ugyldig dato';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

// Hjelpefunksjon for tekstbryting
function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont
): number {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  for (const line of lines) {
    page.drawText(line, {
      x: x,
      y: y,
      size: fontSize,
      font: font,
      color: rgb(0, 0, 0),
    });
    y -= fontSize + 2;
  }

  return lines.length * (fontSize + 2);
}

const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.replace(/\n/g, ' ').replace(/\r/g, ' ').trim();
};

async function handleBilder(
  pdfDoc: PDFDocument,
  page: PDFPage,
  bilder: any[],
  yPosition: number,
  width: number,
  font: PDFFont
) {
  if (!bilder || bilder.length === 0) return yPosition;

  const margin = 50;
  const imagesPerRow = 2;
  let currentX = margin;
  let imageCount = 0;

  for (const bilde of bilder) {
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

      // Sjekk om vi trenger ny side
      if (yPosition < imgDims.height + 50) {
        page = pdfDoc.addPage([595.28, 841.89]);
        yPosition = page.getSize().height - 50;
        currentX = margin;
        imageCount = 0;
      }

      // Beregn x-posisjon basert på bildenummer
      if (imageCount > 0 && imageCount % imagesPerRow === 0) {
        yPosition = yPosition - imgDims.height - 30;
        currentX = margin;
      }

      page.drawImage(pdfImage, {
        x: currentX,
        y: yPosition - imgDims.height,
        width: imgDims.width,
        height: imgDims.height,
      });

      if (bilde.beskrivelse) {
        const beskrivelseTekst = `${bilde.beskrivelse}`;
        const tekstBredde = font.widthOfTextAtSize(beskrivelseTekst, 10);
        const xPosTekst = currentX + (imgDims.width - tekstBredde) / 2;
        
        page.drawText(beskrivelseTekst, {
          x: xPosTekst,
          y: yPosition - imgDims.height - 15,
          size: 10,
          font
        });
      }

      currentX += imgDims.width + 30;
      imageCount++;

      if (imageCount % imagesPerRow === 0) {
        yPosition = yPosition - imgDims.height - 40;
      }
    } catch (error) {
      console.error('Feil ved lasting av bilde:', error);
    }
  }

  return yPosition - 40;
}