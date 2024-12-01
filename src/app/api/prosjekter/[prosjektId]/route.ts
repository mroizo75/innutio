import { getCurrentUser } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { prosjektId: string } }
  ) {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 });
      }
  
      const prosjekt = await db.prosjekt.findUnique({
        where: { 
          id: params.prosjektId,
          bedriftId: currentUser.bedriftId
        },
        include: {
          oppgaver: {
            include: {
              bruker: true,
              filer: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        }
      });
  
      if (!prosjekt) {
        return NextResponse.json({ error: 'Prosjekt ikke funnet' }, { status: 404 });
      }
  
      // Beregn oppgavetelling
      const oppgaveTelling = {
        total: prosjekt.oppgaver.length,
        IKKE_STARTET: 0,
        I_GANG: 0,
        FULLFORT: 0,
      };
  
      // Definer en type for oppgave
      type Oppgave = {
        status: 'IKKE_STARTET' | 'I_GANG' | 'FULLFORT';
      };
  
      // Oppdater forEach med den nye typen
      prosjekt.oppgaver.forEach((oppgave: any) => {
        oppgaveTelling[oppgave.status as keyof typeof oppgaveTelling]++;
      });
  
      return NextResponse.json({
        ...prosjekt,
        oppgaveTelling
      });
    } catch (_error) {
      return NextResponse.json(
        { error: 'Kunne ikke hente prosjekt' },
        { status: 500 }
      );
    }
  }