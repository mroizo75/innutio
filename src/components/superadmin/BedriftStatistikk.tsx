"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function BedriftStatistikk({ bedrifter }: { bedrifter: any[] }) {
  const statusData = [
    {
      name: "Aktive",
      antall: bedrifter.filter(b => b.status === 'AKTIV').length
    },
    {
      name: "Utløpte",
      antall: bedrifter.filter(b => b.status === 'UTLOPT').length
    },
    {
      name: "Prøveperiode",
      antall: bedrifter.filter(b => b.status === 'PROVEPERIODE').length
    }
  ]

  const abonnementData = [
    {
      name: "Basic",
      antall: bedrifter.filter(b => b.abonnementType === 'BASIC').length
    },
    {
      name: "Premium",
      antall: bedrifter.filter(b => b.abonnementType === 'PREMIUM').length
    },
    {
      name: "Enterprise",
      antall: bedrifter.filter(b => b.abonnementType === 'ENTERPRISE').length
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bedrifter etter status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="antall" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abonnementsfordeling</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={abonnementData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="antall" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}