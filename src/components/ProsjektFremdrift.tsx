import { Oppgave, TimeEntry } from "@prisma/client";
import { formatDistance } from "date-fns";
import { nb } from "date-fns/locale";

interface ProsjektFremdriftProps {
  totalFremdrift: number;
  kritiskeSti: Oppgave[];
  timeEntries: TimeEntry[];
}

const ProsjektFremdrift: React.FC<ProsjektFremdriftProps> = ({
  totalFremdrift,
  kritiskeSti,
  timeEntries
}) => {
  return (
    <div className="prosjekt-fremdrift">
      <h3>Prosjektfremdrift</h3>
      <div className="fremdrift-meter">
        <div 
          className="fremdrift-bar"
          style={{ width: `${totalFremdrift}%` }}
        />
        <span>{totalFremdrift.toFixed(1)}% fullført</span>
      </div>
      
      <div className="kritisk-sti-info">
        <h4>Kritiske oppgaver</h4>
        <ul>
          {kritiskeSti.map(oppgave => (
            <li key={oppgave.id}>
              {oppgave.tittel} - {formatDistance(
                new Date(oppgave.sluttDato),
                new Date(),
                { locale: nb, addSuffix: true }
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}; 