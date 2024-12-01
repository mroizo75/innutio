import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface PDFGeneratorConfig {
  marginLeft: number;
  marginRight: number;
  fontSize: {
    title: number;
    heading: number;
    normal: number;
  };
  spacing: {
    afterTitle: number;
    afterHeading: number;
    afterParagraph: number;
  };
}

const defaultConfig: PDFGeneratorConfig = {
  marginLeft: 50,
  marginRight: 50,
  fontSize: {
    title: 20,
    heading: 16,
    normal: 12,
  },
  spacing: {
    afterTitle: 30,
    afterHeading: 20,
    afterParagraph: 15,
  },
};

export class PDFGenerator {
  private pdfDoc: PDFDocument;
  private page: any;
  private font: any;
  private yPosition: number;
  private config: PDFGeneratorConfig;
  private width: number;
  private height: number;

  constructor(config: Partial<PDFGeneratorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async initialize() {
    this.pdfDoc = await PDFDocument.create();
    this.page = this.pdfDoc.addPage();
    this.font = await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = this.page.getSize();
    this.width = width;
    this.height = height;
    this.yPosition = height - this.config.marginLeft;
  }

  private checkPageSpace(requiredSpace: number) {
    if (this.yPosition < requiredSpace) {
      this.page = this.pdfDoc.addPage();
      this.yPosition = this.height - this.config.marginLeft;
      return true;
    }
    return false;
  }

  private drawWrappedText(text: string, size: number, color = rgb(0, 0, 0)) {
    const maxWidth = this.width - (this.config.marginLeft + this.config.marginRight);
    const words = text.split(' ');
    let line = '';

    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      const width = this.font.widthOfTextAtSize(testLine, size);

      if (width > maxWidth) {
        this.checkPageSpace(50);
        this.page.drawText(line, {
          x: this.config.marginLeft,
          y: this.yPosition,
          size,
          font: this.font,
          color,
        });
        this.yPosition -= size + 5;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      this.checkPageSpace(50);
      this.page.drawText(line, {
        x: this.config.marginLeft,
        y: this.yPosition,
        size,
        font: this.font,
        color,
      });
      this.yPosition -= size + 5;
    }
  }

  addTitle(text: string) {
    this.drawWrappedText(text, this.config.fontSize.title);
    this.yPosition -= this.config.spacing.afterTitle;
  }

  addHeading(text: string) {
    this.drawWrappedText(text, this.config.fontSize.heading);
    this.yPosition -= this.config.spacing.afterHeading;
  }

  addParagraph(text: string) {
    this.drawWrappedText(text, this.config.fontSize.normal);
    this.yPosition -= this.config.spacing.afterParagraph;
  }

  addDivider() {
    this.page.drawLine({
      start: { x: this.config.marginLeft, y: this.yPosition },
      end: { x: this.width - this.config.marginRight, y: this.yPosition },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    this.yPosition -= 20;
  }

  async generatePDF(): Promise<Uint8Array> {
    return await this.pdfDoc.save();
  }
}