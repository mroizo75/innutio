import { auth } from "@/lib/auth-utils"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft,  AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { nb } from "date-fns/locale"
import DashboardHeader from "@/components/DashboardHeader"
import RisikoBehandling from "@/components/RisikoBehandling"

export default async function RisikoDetaljer({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) {
    redirect("/auth/login")
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    include: { bedrift: true },
  })

  if (!currentUser) {
    redirect("/auth/login")
  }

  const risikoVurdering = await db.risikoVurdering.findUnique({
    where: { id: params.id },
    include: {
      prosjekt: true,
      opprettetAv: true,
      behandler: true,
    },
  })

  if (!risikoVurdering) {
    redirect("/risiko")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader currentUser={currentUser} />
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/risiko">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tilbake til oversikt
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risikovurdering for {risikoVurdering.prosjekt.navn}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p>{risikoVurdering.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Opprettet dato</h3>
                  <p>{format(risikoVurdering.opprettetDato, 'dd.MM.yyyy', { locale: nb })}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Farebeskrivelse</h3>
                <p>{risikoVurdering.fareBeskrivelse}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Sannsynlighet</h3>
                  <p>{risikoVurdering.sannsynlighet}</p>
                </div>
                <div>
                  <h3 className="font-medium">Konsekvensgrad</h3>
                  <p>{risikoVurdering.konsekvensGrad}</p>
                </div>
              </div>

              {risikoVurdering.risikoVerdi >= 15 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Høy risiko</h4>
                    <p className="text-sm text-yellow-700">
                      Denne risikovurderingen har høy risikoverdi og krever umiddelbar oppmerksomhet.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <RisikoBehandling 
            risikoVurdering={risikoVurdering} 
            currentUser={currentUser as any}
            open={true}
            onClose={() => {}}
          />
        </div>
      </div>
    </div>
  )
}