"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/hooks/use-toast";
import { useRouter } from "next/navigation";

const kontaktSchema = z.object({
  navn: z.string().min(2, "Navn må være minst 2 tegn."),
  bedrift: z.string().min(2, "Bedriftsnavn må være minst 2 tegn."),
  email: z.string().email("Vennligst oppgi en gyldig e-postadresse."),
  telefon: z.string().min(8, "Vennligst oppgi et gyldig telefonnummer."),
  melding: z.string().min(10, "Meldingen må være minst 10 tegn."),
});

// Legg til rate limiting state
const SUBMISSION_LIMIT = 3;
const COOLDOWN_PERIOD = 3600000; // 1 time i millisekunder

export function KontaktSkjema({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Rate limiting state
  const [submissions, setSubmissions] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kontaktSubmissions');
      return stored ? JSON.parse(stored) : { count: 0, timestamp: Date.now() };
    }
    return { count: 0, timestamp: Date.now() };
  });

  const form = useForm<z.infer<typeof kontaktSchema>>({
    resolver: zodResolver(kontaktSchema),
  });

  async function onSubmit(data: z.infer<typeof kontaktSchema>) {
    // Sjekk rate limiting
    if (submissions.count >= SUBMISSION_LIMIT) {
      const timePassed = Date.now() - submissions.timestamp;
      if (timePassed < COOLDOWN_PERIOD) {
        toast({
          variant: "destructive",
          title: "For mange forsøk",
          description: "Vennligst vent en time før du prøver igjen.",
        });
        return;
      }
      // Reset hvis cooldown er over
      setSubmissions({ count: 0, timestamp: Date.now() });
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      // Oppdater submissions
      const newCount = submissions.count + 1;
      const newSubmissions = {
        count: newCount,
        timestamp: Date.now(),
      };
      setSubmissions(newSubmissions);
      localStorage.setItem('kontaktSubmissions', JSON.stringify(newSubmissions));

      // Først vis toast-melding
      toast({
        title: "Melding sendt!",
        description: "Vi tar kontakt med deg så snart som mulig.",
        duration: 5000, // Vis meldingen i 5 sekunder
      });
      
      // Vent litt før vi lukker modalen
      setTimeout(() => {
        form.reset();
        onClose(); // Lukk modalen
        router.refresh();
      }, 1000); // Vent 1 sekund før lukking

    } catch (_error) {
      toast({
        variant: "destructive",
        title: "Noe gikk galt",
        description: "Kunne ikke sende meldingen. Vennligst prøv igjen senere.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto px-4 py-6 sm:px-6">
      <div className="text-center mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold">Kontakt oss</h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Send oss en melding så tar vi kontakt med deg så snart som mulig.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="navn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Navn</FormLabel>
                  <FormControl>
                    <Input placeholder="Ditt navn" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bedrift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Bedrift</FormLabel>
                  <FormControl>
                    <Input placeholder="Din bedrift" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">E-post</FormLabel>
                  <FormControl>
                    <Input placeholder="din@epost.no" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Telefon</FormLabel>
                  <FormControl>
                    <Input placeholder="Ditt telefonnummer" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="melding"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Melding</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Skriv din melding her..."
                    className="min-h-[100px] sm:min-h-[120px] text-sm resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Sender..." : "Send melding"}
          </Button>
        </form>
      </Form>
    </div>
  );
}