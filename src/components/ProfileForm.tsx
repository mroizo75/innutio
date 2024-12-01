"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { User } from "@prisma/client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useDropzone } from "react-dropzone"
import Image from "next/image"

const profileSchema = z.object({
  navn: z.string().min(2, { message: "Navn må være minst 2 tegn." }),
  etternavn: z.string().min(2, { message: "Etternavn må være minst 2 tegn." }),
  email: z.string().email({ message: "Ugyldig e-postadresse." }),
  position: z.string().optional(),
  bildeUrl: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileForm({ user }: { user: Partial<User> }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.bildeUrl || "")

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Opplasting feilet')

        const data = await response.json()
        setAvatarUrl(data.url)
        form.setValue('bildeUrl', data.url)
        
        toast({
          title: "Bilde lastet opp",
          description: "Profilbildet ditt har blitt oppdatert.",
        })
      } catch (error) {
        toast({
          title: "Feil ved opplasting",
          description: "Kunne ikke laste opp bildet. Prøv igjen senere.",
          variant: "destructive",
        })
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1
  })

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      navn: user.navn || "",
      etternavn: user.etternavn || "",
      email: user.email || "",
      position: user.position || "",
      bildeUrl: user.bildeUrl || "",
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/update-profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          bildeUrl: avatarUrl
        }),
      })

      if (!response.ok) throw new Error('Oppdatering feilet')
      
      toast({
        title: "Profil oppdatert",
        description: "Profilinformasjonen din har blitt oppdatert.",
      })
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Noe gikk galt",
        description: "Kunne ikke oppdatere profilen. Prøv igjen senere.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Min Profil</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4 mb-6">
          <div {...getRootProps()} className="cursor-pointer">
            <input {...getInputProps()} />
            <Avatar className="h-20 w-20 hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarUrl || ""} />
              <AvatarFallback>{user.navn?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Klikk for å endre bilde
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.navn} {user.etternavn}</h2>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{user.role}</Badge>
              <Badge variant="secondary">{user.position}</Badge>
            </div>
          </div>
        </div>
        <Separator className="mb-6" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="navn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornavn</FormLabel>
                    <FormControl>
                      <Input placeholder="Fornavn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="etternavn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etternavn</FormLabel>
                    <FormControl>
                      <Input placeholder="Etternavn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-post</FormLabel>
                    <FormControl>
                      <Input placeholder="E-post" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stilling</FormLabel>
                    <FormControl>
                      <Input placeholder="Stilling" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Oppdaterer..." : "Lagre endringer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}