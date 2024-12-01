"use client"

import * as z from "zod"
import { useTransition } from "react"
import { useState } from "react"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { signIn, signOut } from "next-auth/react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const SuperAdminLoginSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
  password: z.string().min(1, "Passord er påkrevd"),
})

export const SuperAdminLoginForm = () => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()
  const router = useRouter()
  
  const form = useForm<z.infer<typeof SuperAdminLoginSchema>>({
    resolver: zodResolver(SuperAdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (values: z.infer<typeof SuperAdminLoginSchema>) => {
    setError(undefined)
    setSuccess(undefined)

    startTransition(async () => {
      try {
        const result = await signIn("superadmin", {
          email: values.email,
          password: values.password,
          redirect: false,
        })

        if (result?.error) {
          setError("Ugyldig e-post eller passord")
          return
        }

        // Vent litt for å la sesjonen oppdateres
        await new Promise(resolve => setTimeout(resolve, 500))

        // Hent brukerdata for å sjekke rolle
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (!session?.user || session.user.role !== "SUPERADMIN") {
          setError("Ingen tilgang - kun for superadministratorer")
          // Logger ut brukeren siden de ikke har riktig tilgang
          await signOut({ redirect: false })
          return
        }

        setSuccess("Innlogget som superadmin!")
        router.push("/superadmin")
      } catch (error) {
        console.error("Login error:", error)
        setError("Noe gikk galt under innlogging")
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-[90%] max-w-[350px] space-y-6 sm:w-[80%] sm:max-w-[400px] md:max-w-[450px]">
        <Link 
          href="/" 
          className="group inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Tilbake til forsiden
        </Link>
        
        <CardWrapper 
          headerLabel="Superadmin Innlogging" 
          backButtonLabel="" 
          backButtonHref="" 
          showSocial={false}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-post
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isPending} 
                          placeholder="superadmin@bedrift.no" 
                          type="email"
                          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Passord
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isPending} 
                          type="password" 
                          placeholder="********"
                          className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
                        />
                      </FormControl>
                      <FormMessage className="text-sm text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isPending}
              >
                Logg inn
              </Button>
            </form>
          </Form>
        </CardWrapper>
      </div>
    </div>
  )
}