"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QRCodeScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: any) => void;
  width?: number;
  height?: number;
  fps?: number;
}

export function QRCodeScanner({ 
  onScan, 
  onError, 
  width = 250, 
  height = 250, 
  fps = 5 
}: QRCodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    scannerRef.current = new Html5QrcodeScanner("reader", {
      qrbox: {
        width,
        height,
      },
      fps,
    });

    scannerRef.current.render(
      (qrCode: string) => {
        if (scannerRef.current) {
          scannerRef.current.pause(true);
        }
        onScan(qrCode);
      },
      (error: any) => {
        if (onError) {
          onError(error);
        }
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [fps, height, onError, onScan, width]);

  return <div id="reader" className="w-full max-w-sm mx-auto" />;
}