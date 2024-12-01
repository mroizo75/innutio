"use client"

import { useState } from "react"
import { type UseFormReturn, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { FareSymbol } from "@prisma/client"
import { toast } from "sonner"
import { Upload } from "lucide-react"

// Definer skjemavalidering med Zod
const formSchema = z.object({
  produktnavn: z.string().min(1, "Produktnavn er påkrevd"),
  produsent: z.string().optional(),
  beskrivelse: z.string().optional(),
  bruksomrade: z.string().optional(),
  faresymboler: z.array(z.nativeEnum(FareSymbol)),
  datablad: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface OpprettStoffkartotekProps {
  bedriftId: string
  onClose: () => void
}

export function OpprettStoffkartotek({ bedriftId, onClose }: OpprettStoffkartotekProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      produktnavn: "",
      produsent: "",
      beskrivelse: "",
      bruksomrade: "",
      faresymboler: [],
    },
  })

  const fareSymboler = Object.values(FareSymbol)

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true)
      let databladUrl = ""

      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadResponse.ok) throw new Error("Kunne ikke laste opp datablad")
        const { url } = await uploadResponse.json()
        databladUrl = url
      }

      const response = await fetch("/api/superadmin/stoffkartotek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          bedriftId,
          databladUrl,
        }),
      })
      
      if (!response.ok) {
        throw new Error("Kunne ikke opprette stoffkartotek")
      }
      
      toast.success("Stoffkartotek opprettet")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Kunne ikke opprette stoffkartotek")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="produktnavn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produktnavn</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="produsent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produsent</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="beskrivelse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bruksomrade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bruksområde</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Faresymboler</FormLabel>
          <div className="grid grid-cols-2 gap-2">
            {fareSymboler.map((symbol) => (
              <div key={symbol} className="flex items-center space-x-2">
                <Checkbox
                  id={symbol}
                  checked={form.watch("faresymboler").includes(symbol)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues("faresymboler")
                    if (checked) {
                      form.setValue("faresymboler", [...current, symbol])
                    } else {
                      form.setValue(
                        "faresymboler",
                        current.filter((s) => s !== symbol)
                      )
                    }
                  }}
                />
                <label htmlFor={symbol} className="text-sm">
                  {symbol}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Datablad</FormLabel>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                {selectedFile.name}
              </div>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Oppretter..." : "Opprett stoffkartotek"}
        </Button>
      </form>
    </Form>
  )
}