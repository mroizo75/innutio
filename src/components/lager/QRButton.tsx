import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Dialog, DialogContent, IconButton, Button, Typography, Box } from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';

interface QRButtonProps {
  produkt: {
    id: number;
    produktnavn: string;
    plassering: string;
  };
}

export function QRButton({ produkt }: QRButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const uttaksUrl = `${window.location.origin}/lager/uttak/${produkt.id}`;
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Kode - ${produkt.produktnavn}</title>
            <style>
              body { 
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 20px;
              }
              .qr-container {
                margin: 20px auto;
                padding: 15px;
                border: 1px solid #ccc;
                display: inline-block;
              }
              .product-info {
                margin: 10px 0;
              }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="product-info">
                <h2>${produkt.produktnavn}</h2>
                <p>Plassering: ${produkt.plassering}</p>
              </div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uttaksUrl)}" />
            </div>
            <button onclick="window.print();window.close()">Skriv ut</button>
          </body>
        </html>
      `);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <QrCode2Icon />
      </IconButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {produkt.produktnavn}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Plassering: {produkt.plassering}
            </Typography>
            <Box sx={{ my: 2 }}>
              <QRCode value={uttaksUrl} />
            </Box>
            <Button 
              variant="contained" 
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Skriv ut QR-kode
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}