import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { NextResponse } from "next/server"

export const GET = async (
  req: Request,
  { params }: { params: { id: string } }
) => {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const sjaSkjema = await db.sJASkjema.findUnique({
      where: { id: params.id },
      include: {
        opprettetAv: true,
        behandler: true,
        prosjekt: true,
        SJAProdukt: true,
        bilder: true,
        bedrift: true,
      },
    })

    if (!sjaSkjema) {
      return new NextResponse("SJA ikke funnet", { status: 404 })
    }

    const pdfDoc = await PDFDocument.create()
    let page = pdfDoc.addPage()
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const { width, height } = page.getSize()
    const margin = 50
    let yPosition = height - margin

    const checkPageSpace = (requiredSpace: number) => {
      if (yPosition < requiredSpace + margin) {
        page = pdfDoc.addPage()
        yPosition = height - margin
        return true
      }
      return false
    }

    const addText = (text: string, isBold = false, size = 12, color = rgb(0, 0, 0)) => {
      checkPageSpace(size + 10)
      page.drawText(text, {
        x: margin,
        y: yPosition,
        size,
        font: isBold ? font : normalFont,
        color,
      })
      yPosition -= size + 10
    }

    // Header
    addText("SIKKER JOBB ANALYSE (SJA)", true, 18)
    yPosition -= 20

    // Utvidet hovedinformasjon
    addText(`Jobbtittel: ${sjaSkjema.jobTitle}`, true)
    addText(`Lokasjon: ${sjaSkjema.jobLocation}`)
    addText(`Dato: ${sjaSkjema.jobDate}`)
    addText(`Deltakere: ${sjaSkjema.participants}`)
    addText(`Prosjekt: ${sjaSkjema.prosjekt.navn}`)
    
    // Fargekode for status
    const statusColor = sjaSkjema.status === 'Godkjent' ? rgb(0, 1, 0) : sjaSkjema.status === 'Ubehandlet' ? rgb(1, 0.65, 0) : rgb(1, 0, 0)
    addText(`Status: ${sjaSkjema.status}`, false, 12, statusColor)

    addText(`Opprettet av: ${sjaSkjema.opprettetAv.navn} ${sjaSkjema.opprettetAv.etternavn}`)
    if (sjaSkjema.behandler) {
      addText(`Behandlet av: ${sjaSkjema.behandler.navn} ${sjaSkjema.behandler.etternavn}`)
    }
    yPosition -= 20

    // Jobbeskrivelse og risikovurdering
    addText("Jobbeskrivelse:", true)
    addText(sjaSkjema.jobDescription)
    yPosition -= 20

    addText("Identifiserte risikoer:", true)
    addText(sjaSkjema.identifiedRisks)
    yPosition -= 20

    addText("Risikoreduserende tiltak:", true)
    addText(sjaSkjema.riskMitigation)
    yPosition -= 20

    addText("Ansvarlig person:", true)
    addText(sjaSkjema.responsiblePerson)
    yPosition -= 20

    if (sjaSkjema.comments) {
      addText("Kommentarer:", true)
      addText(sjaSkjema.comments)
      yPosition -= 20
    }

    // Produkter
    if (sjaSkjema.SJAProdukt && sjaSkjema.SJAProdukt.length > 0) {
      addText("Produkter i bruk:", true)
      sjaSkjema.SJAProdukt.forEach(produkt => {
        checkPageSpace(40)
        addText(`- ${produkt.navn} (Mengde: ${produkt.mengde})`)
        if (produkt.databladUrl) {
          addText(`  Datablad: ${produkt.databladUrl}`)
        }
      })
      yPosition -= 20
    }

    // Bilder
    if (sjaSkjema.bilder && sjaSkjema.bilder.length > 0) {
      addText("Vedlagte bilder:", true)
      yPosition -= 20

      for (const bilde of sjaSkjema.bilder) {
        try {
          const imageResponse = await fetch(bilde.url)
          const imageArrayBuffer = await imageResponse.arrayBuffer()
          
          let pdfImage
          if (bilde.url.toLowerCase().endsWith('.png')) {
            pdfImage = await pdfDoc.embedPng(imageArrayBuffer)
          } else {
            pdfImage = await pdfDoc.embedJpg(imageArrayBuffer)
          }

          const maxWidth = width * 0.7
          const imgDims = pdfImage.scale(1.0)
          let scale = 1.0
          if (imgDims.width > maxWidth) {
            scale = maxWidth / imgDims.width
          }
          const finalDims = pdfImage.scale(scale)

          checkPageSpace(finalDims.height + 40)
          const xPos = (width - finalDims.width) / 2

          page.drawImage(pdfImage, {
            x: xPos,
            y: yPosition - finalDims.height,
            width: finalDims.width,
            height: finalDims.height,
          })
          
          yPosition -= finalDims.height + 40
        } catch (error) {
          console.error(`Feil ved lasting av bilde: ${bilde.url}`, error)
          addText(`Kunne ikke laste bilde: ${bilde.navn || 'Ukjent'}`)
        }
      }
    }

    const pdfBytes = await pdfDoc.save()

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sja_${sjaSkjema.id}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Feil ved generering av PDF:', error)
    return new NextResponse("Feil ved generering av PDF", { status: 500 })
  }
}