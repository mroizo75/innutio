"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ChartData {
  prosjektNavn: string;
  timer: number;
  status?: string;
}

export function HoursPerProjectChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/prosjekter');
        const data = await response.json();
        // Anta at dataene inneholder timer og prosjektNavn
        const formattedData = data.map((project: any) => ({
          prosjektNavn: project.navn,
          timer: project.timer, // Sørg for at dette feltet eksisterer
          status: project.status
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Feil ved henting av prosjekter:", error);
      }
    }

    fetchData();
  }, []);

  const activeChartData = chartData.filter(project => project.status !== 'ARKIVERT');

  if (!activeChartData || activeChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timer per Prosjekt</CardTitle>
          <CardDescription>Ingen aktive prosjekter tilgjengelig</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            Ingen aktive prosjekter å vise
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timer per Prosjekt</CardTitle>
        <CardDescription>Totalt antall loggede timer per aktive prosjekt</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={activeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="prosjektNavn" 
              angle={-45}
              textAnchor="end" 
              height={100} 
              interval={0}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              allowDecimals={false}
              axisLine={true}
              tickLine={true}
              tickFormatter={(value) => `${value}t`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip formatter={(value) => `${value} timer`} />
            <Bar 
              dataKey="timer" 
              fill="#8884d8"
              name="Timer"
              minPointSize={5}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Timer per prosjekt <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Viser totale loggede timer for hvert aktive prosjekt
        </div>
      </CardFooter>
    </Card>
  );
}