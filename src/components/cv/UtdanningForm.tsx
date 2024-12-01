"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"

const utdanningSchema = z.object({
  institusjon: z.string().min(2, "Institusjon må være minst 2 tegn"),
  grad: z.string().min(2, "Grad må være minst 2 tegn"),
  fagfelt: z.string().min(2, "Fagfelt må være minst 2 tegn"),
  startDato: z.date(),
  sluttDato: z.date().optional(),
  beskrivelse: z.string().optional()
})

export function UtdanningForm({ userId, utdanninger: initialUtdanninger }) {
  const { toast } = useToast()
  const [utdanninger, setUtdanninger] = useState(initialUtdanninger)
  
  const form = useForm({
    resolver: zodResolver(utdanningSchema),
    defaultValues: {
      institusjon: "",
      grad: "",
      fagfelt: "",
      startDato: new Date(),
      sluttDato: undefined,
      beskrivelse: ""
    }
  })

  async function onSubmit(data) {
    try {
      const response = await fetch(`/api/users/${userId}/utdanning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Kunne ikke lagre utdanning")
      
      const nyUtdanning = await response.json()
      setUtdanninger([...utdanninger, nyUtdanning])
      form.reset()
      toast({ description: "Utdanning lagt til" })
    } catch (error) {
      toast({ 
        title: "Feil", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  }

  async function slettUtdanning(utdanningId) {
    try {
      const response = await fetch(`/api/users/${userId}/utdanning/${utdanningId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Kunne ikke slette utdanning")
      
      setUtdanninger(utdanninger.filter(u => u.id !== utdanningId))
      toast({ description: "Utdanning slettet" })
    } catch (error) {
      toast({ 
        title: "Feil", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legg til utdanning</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="institusjon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institusjon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grad</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fagfelt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fagfelt</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDato"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Startdato</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Velg dato</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sluttDato"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Sluttdato</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Velg dato</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <Button type="submit">Legg til utdanning</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mine utdanninger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utdanninger.map((utdanning) => (
              <div key={utdanning.id} className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h3 className="font-semibold">{utdanning.grad}</h3>
                  <p>{utdanning.institusjon}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(utdanning.startDato), "PPP")} - 
                    {utdanning.sluttDato ? format(new Date(utdanning.sluttDato), "PPP") : 'Nå'}
                  </p>
                  {utdanning.beskrivelse && (
                    <p className="text-sm mt-2">{utdanning.beskrivelse}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => slettUtdanning(utdanning.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
