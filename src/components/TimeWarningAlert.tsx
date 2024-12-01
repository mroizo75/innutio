import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface TimeWarningAlertProps {
  oppgave: {
    tittel: string;
    estimertTid: number;
    faktiskTid: number;
    gjenværendeTid: number;
    advarsler: string[];
  };
}

export function TimeWarningAlert({ oppgave }: TimeWarningAlertProps) {
  if (oppgave.faktiskTid <= oppgave.estimertTid) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Tidsadvarsel for {oppgave.tittel}</AlertTitle>
      <AlertDescription>
        {oppgave.advarsler.map((advarsel, index) => (
          <div key={index}>{advarsel}</div>
        ))}
        <div className="mt-2">
          Estimert tid: {oppgave.estimertTid} timer
          <br />
          Faktisk brukt: {oppgave.faktiskTid} timer
        </div>
      </AlertDescription>
    </Alert>
  );
}