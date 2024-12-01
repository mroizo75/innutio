"use client"

import * as z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useSearchParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"

const SetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Passordet må være minst 8 tegn")
    .regex(/[A-Z]/, "Passordet må inneholde minst én stor bokstav")
    .regex(/[a-z]/, "Passordet må inneholde minst én liten bokstav")
    .regex(/[0-9]/, "Passordet må inneholde minst ett tall"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passordene stemmer ikke overens",
  path: ["confirmPassword"]
})

export const SetPasswordForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  const form = useForm<z.infer<typeof SetPasswordSchema>>({
    resolver: zodResolver(SetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof SetPasswordSchema>) => {
    if (!token) {
      setError("Manglende token");
      return;
    }

    try {
      setIsPending(true);
      setError(undefined);
      setSuccess(undefined);
      
      const response = await fetch('/api/sett-passord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Noe gikk galt");
        return;
      }

      setSuccess(data.message);
      
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      setError("Det oppstod en feil ved oppdatering av passord");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
      <div className="relative w-full max-w-[500px] mx-auto p-4 md:p-0">
        <Card className="shadow-lg">
          <CardHeader className="space-y-3 text-center pb-8">
            <div className="flex justify-center">
              <div className="relative h-24 w-24">
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Velkommen som ny bruker
              </h1>
              <p className="text-sm text-muted-foreground">
                Sett ditt passord for å fullføre registreringen
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nytt passord</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            type="password"
                            placeholder="********"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bekreft passord</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isPending}
                            type="password"
                            placeholder="********"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {error && <FormError message={error} />}
                {success && <FormSuccess message={success} />}
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isPending}
                  >
                    {isPending ? "Oppdaterer..." : "Fullfør registrering"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth/login")}
                  >
                    Tilbake til innlogging
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}