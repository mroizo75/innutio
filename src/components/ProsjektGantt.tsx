import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
import { OverforbrukOversikt } from './OverforbrukOversikt';

interface ProsjektGanttProps {
  prosjekt: any;
}

interface TimeEntry {
  oppgaveId: string;
  hours: number;
  brukerId: string;
}

interface OppgaveProgress {
  oppgaveId: string;
  totalTimer: number;
  prosentFullfort: number;
  gjenværendeTimer: number;
  estimertTid: number;
  totaltStemplet: number;
}

interface Milepael {
  id: string;
  tittel: string;
  dato: Date;
  oppgaveId?: string;
}

const ProsjektGantt: React.FC<ProsjektGanttProps> = ({ prosjekt }) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [oppgaveProgress, setOppgaveProgress] = useState<OppgaveProgress[]>([]);
  const ARBEIDSTIMER_PER_DAG = 12;
  const ARBEIDSDAGER_PER_UKE = 5;

  useEffect(() => {
    fetchTimeEntries();
  }, []);

  useEffect(() => {
    if (timeEntries.length > 0) {
      console.log('Oppdaterer med timeEntries:', timeEntries);
      beregnOppgaveProgress();
    }
  }, [timeEntries]);

  const fetchTimeEntries = async () => {
    try {
      const res = await fetch('/api/timeregistrering/prosjekt/' + prosjekt.id);
      if (!res.ok) throw new Error("Kunne ikke hente timeregistreringer");
      const data = await res.json();
      const formattedEntries = data.timeEntries.map((entry: any) => ({
        oppgaveId: entry.oppgaveId,
        hours: entry.hours,
        brukerId: entry.brukerId
      }));
      setTimeEntries(formattedEntries);
    } catch (error) {
      console.error("Feil ved henting av timeregistreringer:", error);
    }
  };

  const beregnOppgaveProgress = () => {
    const progress = prosjekt.oppgaver.map((oppgave: any) => {
      const oppgaveTimer = timeEntries
        .filter(entry => entry.oppgaveId === oppgave.id)
        .reduce((sum, entry) => sum + Number(entry.hours), 0);

      let prosentFullfort = 0;
      if (oppgave.status === 'FULLFORT') {
        prosentFullfort = 100;
      } else if (oppgave.status === 'I_GANG' && oppgave.estimertTid) {
        prosentFullfort = Math.min(100, (oppgaveTimer / oppgave.estimertTid) * 100);
      } else if (oppgave.status === 'IKKE_STARTET') {
        prosentFullfort = 0;
      }

      return {
        oppgaveId: oppgave.id,
        totalTimer: oppgaveTimer,
        gjenværendeTimer: Math.max(0, (oppgave.estimertTid || 0) - oppgaveTimer),
        prosentFullfort,
        estimertTid: oppgave.estimertTid || 0,
        totaltStemplet: oppgaveTimer
      };
    });

    setOppgaveProgress(progress);
  };

  const beregnVarighet = (startDato: Date, sluttDato: Date, estimertTid: number) => {
    const dagerMellom = Math.ceil((sluttDato.getTime() - startDato.getTime()) / (1000 * 60 * 60 * 24));
    const arbeidsUker = Math.floor(dagerMellom / 7);
    const restDager = dagerMellom % 7;
    
    let arbeidsdager = (arbeidsUker * ARBEIDSDAGER_PER_UKE) + 
      Math.min(restDager, ARBEIDSDAGER_PER_UKE);

    if (estimertTid) {
      const estimerteDager = Math.ceil(estimertTid / ARBEIDSTIMER_PER_DAG);
      arbeidsdager = Math.min(arbeidsdager, estimerteDager);
    }

    return arbeidsdager;
  };

  const data = [
    [
      { type: 'string', label: 'Oppgave ID' },
      { type: 'string', label: 'Oppgave Navn' },
      { type: 'date', label: 'Start Dato' },
      { type: 'date', label: 'Slutt Dato' },
      { type: 'number', label: 'Timer' },
      { type: 'number', label: 'Prosent Fullført' },
      { type: 'string', label: 'Avhengigheter' },
      { type: 'string', label: 'Tooltip' }
    ],
    [
      'ProsjektVarighet',
      'Prosjekt Varighet',
      new Date(prosjekt.startDato),
      new Date(prosjekt.sluttDato),
      null,
      0,
      null,
      ''
    ],
    ...prosjekt.oppgaver.map((oppgave: any) => {
      const progress = oppgaveProgress.find(p => p.oppgaveId === oppgave.id);
      const startDato = new Date(oppgave.startDato);
      const sluttDato = new Date(oppgave.sluttDato);
      
      const timer = progress?.totaltStemplet || 0;
      const estimertTid = oppgave.estimertTid || 0;
      
      const normalTid = Math.min(timer, estimertTid);
      const overforbruk = Math.max(0, timer - estimertTid);
      
      const prosentFullfort = Math.min(100, (normalTid / estimertTid) * 100);

      const tooltip = `<div style="padding: 10px;">
        Status: ${oppgave.status}<br/>
        Estimert: ${estimertTid}t<br/>
        Brukt: ${timer}t
        ${timer > estimertTid ? `<br/>Overforbruk: ${(timer - estimertTid).toFixed(1)}t` : ''}
      </div>`;

      return [
        oppgave.id,
        `${oppgave.tittel} (${timer}t av ${estimertTid}t)`,
        startDato,
        sluttDato,
        timer,
        prosentFullfort,
        null,
        tooltip
      ];
    })
  ];

  const options = {
    height: 400,
    gantt: {
      defaultStartDate: new Date(prosjekt.startDato),
      trackHeight: 30,
      durationUnit: 'hour',
      barHeight: 20,
      criticalPathEnabled: false,
      percentEnabled: true,
      barStyle: {
        stroke: '#2196F3',
        fill: (rowIndex: number) => {
          const oppgave = prosjekt.oppgaver[rowIndex - 2];
          if (!oppgave) return '#E8F0FE';
          
          // Finn faktisk timebruk for oppgaven
          const progress = oppgaveProgress.find(p => p.oppgaveId === oppgave.id);
          const faktiskTid = progress?.totaltStemplet || 0;
          const estimertTid = oppgave.estimertTid || 0;
          
          // Hvis faktisk tid er større enn estimert tid, vis rødt
          return faktiskTid > estimertTid ? '#FF6B6B' : '#BBDEFB';
        }
      },
      innerGridHorizLine: {
        stroke: '#e0e0e0'
      },
      innerGridTrack: { fill: '#f5f5f5' }
    },
    tooltip: {
      isHtml: true
    }
  };

  return (
    <div>
      <Chart
        chartType="Gantt"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
      <OverforbrukOversikt 
        oppgaver={prosjekt.oppgaver}
        timeEntries={timeEntries}
      />
    </div>
  );
};

export default ProsjektGantt;
