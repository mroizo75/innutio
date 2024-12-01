import QRCode from 'qrcode';

export async function generateQRCode(): Promise<string> {
  try {
    const randomCode = Math.random().toString(36).substring(2, 15);
    const qrCodeDataUrl = await QRCode.toDataURL(randomCode);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Feil ved generering av QR-kode:', error);
    throw new Error('Kunne ikke generere QR-kode');
  }
}