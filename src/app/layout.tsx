
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Providers } from "./providers"
import { NotificationProvider } from "@/components/NotificationProvider";
import { CookieConsent } from "@/components/CookieConsent";

export const metadata: Metadata = {
  title: "InnUt.io",
  description: "InnUt.io er en plattform for å hjelpe bedrifter med å samle inn innspill fra medarbeidere om hva som går bra og hva som kan forbedres i arbeidsmiljøet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <body suppressHydrationWarning>
          <Providers>
            <NotificationProvider>
              {children}
              <CookieConsent />
              <Toaster position="top-right" reverseOrder={false} />
            </NotificationProvider>
          </Providers>
      </body>
    </html>
  );
}
