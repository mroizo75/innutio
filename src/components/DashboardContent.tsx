"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { HoursPerProjectChart } from './HoursPerProjectChart'
import TimeTrackingCard from './TimeTrackingCard'

export default function DashboardContent({ data, currentUser }: { data: any, currentUser: any }) {
  const chartData = useMemo(() => 
    data.bedrift.prosjekter.map((prosjekt: any) => ({
      prosjektNavn: prosjekt.navn,
      timer: prosjekt.timeEntries.reduce((sum: number, entry: any) => 
        sum + (entry.hours || 0), 0)
      })), [data.bedrift.prosjekter]
  )

  return (
    <main className="flex-1 p-4 md:p-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Statistikk-kort */}
        {/* <StatisticsCards stats={stats} /> */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Timefordeling per Prosjekt</CardTitle>
        </CardHeader>
        <CardContent>
          <HoursPerProjectChart data={chartData} />
        </CardContent>
      </Card>

      <TimeTrackingCard currentUser={currentUser} />
    </main>
  )
}