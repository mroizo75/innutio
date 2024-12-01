"use client"

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { User, Prosjekt } from '@prisma/client'

type TimeEntry = {
  id: string;
  date: Date;
  hours: number;
  description: string;
  bruker: {
    navn: string;
    etternavn: string;
  };
  prosjekt: {
    navn: string;
  };
};

type AdminTimeManagementProps = {
  timeEntries: TimeEntry[];
  currentUser: User;
  bedriftUsers: User[];
  prosjekter: Prosjekt[];
};

export function AdminTimeManagement({ 
  timeEntries, 
  currentUser,
  bedriftUsers,
  prosjekter
}: AdminTimeManagementProps) {
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedOppgave, setSelectedOppgave] = useState("")
  const [date, setDate] = useState<Date>()
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !date || !hours || !selectedProject) return

    try {
      const formData = new FormData()
      formData.append('userId', selectedUser)
      formData.append('prosjektId', selectedProject)
      if (selectedOppgave) {
        formData.append('oppgaveId', selectedOppgave)
      }
      formData.append('date', date.toISOString())
      formData.append('hours', hours)
      formData.append('description', description)

      const response = await fetch('/api/time-entries', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Kunne ikke legge til timer')

      // Reset form
      setSelectedUser("")
      setSelectedProject("")
      setSelectedOppgave("")
      setDate(undefined)
      setHours("")
      setDescription("")
    } catch (error) {
      console.error('Feil ved registrering av timer:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrer Timer for Ansatte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Velg ansatt" />
            </SelectTrigger>
            <SelectContent>
              {bedriftUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.navn} {user.etternavn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Velg prosjekt" />
            </SelectTrigger>
            <SelectContent>
              {prosjekter.map((prosjekt) => (
                <SelectItem key={prosjekt.id} value={prosjekt.id}>
                  {prosjekt.navn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedProject && (
            <Select onValueChange={setSelectedOppgave}>
              <SelectTrigger>
                <SelectValue placeholder="Velg oppgave (valgfritt)" />
              </SelectTrigger>
              <SelectContent>
                {prosjekter
                  .find(p => p.id === selectedProject)
                  ?.oppgaver?.map((oppgave) => (
                    <SelectItem key={oppgave.id} value={oppgave.id}>
                      {oppgave.tittel}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Velg dato</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Input
            type="number"
            placeholder="Antall timer"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />

          <Input
            placeholder="Beskrivelse"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button type="submit">Legg til timer</Button>
        </form>
      </CardContent>
    </Card>
  )
}