// src/types.ts

export interface Prosjekt {
    id: string;
    navn: string;
    beskrivelse: string;
    startDato: string;
    sluttDato: string;
  }

interface Oppgave {
  id: string;
  tittel: string;
  status: string;
  // ... andre felt
}

interface User {
  id: string;
  navn: string;
  etternavn: string;
  // ... andre felt
}