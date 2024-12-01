"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cookie } from 'lucide-react';
import { checkCookieConsent } from '@/lib/cookie-utils';

export function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasConsent = checkCookieConsent();
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  if (!mounted) return null;

  const handleAccept = () => {
    window.localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    window.localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
      >
        <Card className="border-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Informasjonskapsler</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Vi bruker informasjonskapsler for å forbedre din opplevelse på InnUt. 
                Dette hjelper oss å forstå hvordan du bruker nettstedet og gjør det 
                mulig å huske dine preferanser.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  className="sm:w-auto"
                >
                  Avslå
                </Button>
                <Button
                  onClick={handleAccept}
                  className="sm:w-auto"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Godta alle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default CookieConsent;