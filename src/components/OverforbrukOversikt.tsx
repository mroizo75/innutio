import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface Oppgave {
  id: string;
  tittel: string;
  estimertTid: number;
  status: string;
}

interface TimeEntry {
  oppgaveId: string;
  hours: number;
}

interface OverforbrukOversiktProps {
  oppgaver: Oppgave[];
  timeEntries: TimeEntry[];
}

export function OverforbrukOversikt({ oppgaver, timeEntries }: OverforbrukOversiktProps) {
  const oppgaverMedOverforbruk = oppgaver.map(oppgave => {
    const brukteTimer = timeEntries
      .filter(entry => entry.oppgaveId === oppgave.id)
      .reduce((sum, entry) => sum + entry.hours, 0);
    
    const overforbruk = brukteTimer - oppgave.estimertTid;
    
    return {
      ...oppgave,
      brukteTimer,
      overforbruk
    };
  }).filter(oppgave => oppgave.overforbruk > 0);

  if (oppgaverMedOverforbruk.length === 0) return null;

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Oppgaver med overforbruk</h3>
      {oppgaverMedOverforbruk.map(oppgave => (
        <Alert key={oppgave.id} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{oppgave.tittel}</AlertTitle>
          <AlertDescription>
            <div>Estimert tid: {oppgave.estimertTid} timer</div>
            <div>Faktisk brukt: {oppgave.brukteTimer} timer</div>
            <div className="font-semibold">
              Overforbruk: {oppgave.overforbruk.toFixed(1)} timer
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}