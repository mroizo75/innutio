"use client"

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns"
import { useQuery, useQueryClient } from "@tanstack/react-query"


interface Prosjekt {
  id: string;
  navn: string;
  status: string;
  oppgaver: Oppgave[];
}

interface Oppgave {
  id: string;
  tittel: string;
  prosjektId: string;
  prosjekt: Prosjekt;
  bruker: User;
}

interface User {
  id: string;
  navn: string;
  etternavn: string;
}

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description?: string;
  prosjektId: string;
  oppgaveId?: string;
  prosjekt?: Prosjekt;
  oppgave?: Oppgave;
}

interface TimeTrackingCardProps {
  currentUser: User;
}

const TimeTrackingCard: React.FC<TimeTrackingCardProps> = ({ currentUser }) => {
  const queryClient = useQueryClient();
  const [prosjekter, setProsjekter] = useState<Prosjekt[]>([]);
  const [valgtProsjektId, setValgtProsjektId] = useState<string>('');
  const [valgtOppgaveId, setValgtOppgaveId] = useState<string>('');
  const [oppgaver, setOppgaver] = useState<Oppgave[]>([]);
  const [description, setDescription] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);
  const [totalThisMonth, setTotalThisMonth] = useState<number>(0);
  const [totalLastMonth, setTotalLastMonth] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const res = await fetch('/api/timeregistrering');
      if (!res.ok) throw new Error("Kunne ikke hente timeregistreringer");
      return res.json();
    },
    initialData: [],
  });

  useEffect(() => {
    fetchProsjekter();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [timeEntries]);

  const fetchProsjekter = async () => {
    try {
      const res = await fetch('/api/prosjekter');
      if (!res.ok) throw new Error("Kunne ikke hente prosjekter");
      const data: Prosjekt[] = await res.json();
      setProsjekter(data);
    } catch (error) {
      console.error("Feil ved henting av prosjekter:", error);
    }
  };

  const calculateTotals = () => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    let totalThis = 0;
    let totalLast = 0;

    timeEntries?.forEach((entry: TimeEntry) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === thisYear && entryDate.getMonth() === thisMonth) {
        totalThis += entry.hours;
      } else if (entryDate.getFullYear() === lastMonthYear && entryDate.getMonth() === lastMonth) {
        totalLast += entry.hours;
      }
    });

    setTotalThisMonth(totalThis);
    setTotalLastMonth(totalLast);
  };

  const resetForm = () => {
    setValgtProsjektId('');
    setValgtOppgaveId('');
    setDescription('');
    setHours('');
    setSelectedDate(new Date());
    setEditEntry(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const entryData = {
        date: selectedDate?.toISOString() || '',
        hours: parseFloat(hours),
        description,
        prosjektId: valgtProsjektId,
        oppgaveId: valgtOppgaveId || null,
      };

      if (editEntry) {
        const res = await fetch(`/api/timeregistrering/${editEntry.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("Kunne ikke oppdatere timeregistrering");
        
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      } else {
        const res = await fetch('/api/timeregistrering', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryData),
        });
        if (!res.ok) throw new Error("Kunne ikke registrere timeregistrering");
        
        queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      }
      
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Feil ved registrering eller oppdatering av timeregistrering:", error);
      alert("Kunne ikke registrere eller oppdatere timeregistreringen. Prøv igjen.");
    }
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  return (
    <Card className="shadow-lg dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-gray-100">Time Tracking</CardTitle>
        <CardDescription className="dark:text-gray-400">Registrer dine timer på prosjekter og oppgaver.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-6">
          <Card className="w-1/2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent>
              <h3 className="text-lg font-semibold dark:text-gray-200">Totale Timer Denne Måneden</h3>
              <p className="text-2xl mt-2 dark:text-gray-100">{totalThisMonth} timer</p>
            </CardContent>
          </Card>
          <Card className="w-1/2 dark:bg-gray-800 dark:border-gray-700">
            <CardContent>
              <h3 className="text-lg font-semibold dark:text-gray-200">Totale Timer Forrige Måned</h3>
              <p className="text-2xl mt-2 dark:text-gray-100">{totalLastMonth} timer</p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => { setEditEntry(null); setIsOpen(true); resetForm(); }}>
          Registrer Timer
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="dark:bg-gray-900 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">{editEntry ? "Oppdater Timer" : "Registrer Timer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prosjekt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prosjekt:</label>
                <select
                  id="prosjekt"
                  value={valgtProsjektId}
                  onChange={(e) => setValgtProsjektId(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">Velg et prosjekt</option>
                  {prosjekter.map(prosjekt => (
                    <option key={prosjekt.id} value={prosjekt.id}>{prosjekt.navn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="oppgave" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Oppgave:</label>
                <select
                  id="oppgave"
                  value={valgtOppgaveId}
                  onChange={(e) => setValgtOppgaveId(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                >
                  <option value="">Velg en oppgave (valgfritt)</option>
                  {oppgaver?.map(oppgave => (
                    <option key={oppgave.id} value={oppgave.id}>{oppgave.tittel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Dato:</label>
                <Input 
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (!isNaN(date.getTime())) {
                      setSelectedDate(date);
                    }
                  }}
                  className="w-full mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Timer:</label>
                <Input
                  id="hours"
                  type="number"
                  step="0.1"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                  className="mt-1 block w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Beskrivelse:</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                />
              </div>

              <Button type="submit" className="mt-2">
                {editEntry ? "Oppdater Timer" : "Registrer Timer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <div className="mt-6">
          <h3 className="text-lg font-semibold dark:text-gray-100">Dine Timeregistreringer</h3>
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dato</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prosjekt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Oppgave</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Beskrivelse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Handlinger</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {timeEntries?.map((entry: TimeEntry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{entry.hours}</td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{entry.prosjekt?.navn}</td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{entry.oppgave?.tittel || "Ingen oppgave"}</td>
                    <td className="px-6 py-4 whitespace-nowrap dark:text-gray-300">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditEntry(entry);
                          setIsOpen(true);
                          setValgtProsjektId(entry.prosjektId);
                          setValgtOppgaveId(entry.oppgaveId || '');
                          setDescription(entry.description || '');
                          setHours(entry.hours.toString());
                          setSelectedDate(new Date(entry.date));
                        }}
                        className="dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Edit2 size={16} className="mr-1" />
                        Rediger
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                          if (!confirm("Er du sikker på at du vil slette denne timeregistreringen?")) return;
                          try {
                            const res = await fetch(`/api/timeregistrering/${entry.id}`, {
                              method: 'DELETE',
                            });
                            if (!res.ok) throw new Error("Kunne ikke slette timeregistrering");
                            
                            queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
                          } catch (error) {
                            console.error("Feil ved sletting av timeregistrering:", error);
                            alert("Kunne ikke slette timeregistrering.");
                          }
                        }}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Slett
                      </Button>
                    </td>
                  </tr>
                ))}
                {timeEntries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Ingen timeregistreringer funnet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrackingCard;