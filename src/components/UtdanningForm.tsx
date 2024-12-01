"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar as CalendarIcon } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { useState } from "react"

export function UtdanningForm({ onSubmit, utdanninger }) {
    const [date, setDate] = useState<Date>()
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
                  </FormItem>
                )}
              />
              {/* Lignende FormFields for andre felt */}
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
              <div key={utdanning.id} className="border p-4 rounded-lg">
                <h3 className="font-semibold">{utdanning.grad}</h3>
                <p>{utdanning.institusjon}</p>
                <p className="text-sm text-gray-600">
                  {new Date(utdanning.startDato).getFullYear()} - 
                  {utdanning.sluttDato ? new Date(utdanning.sluttDato).getFullYear() : 'Nå'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}