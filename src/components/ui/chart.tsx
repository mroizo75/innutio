"use client"

import { Bar } from "recharts"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ChartProps {
  data: { prosjektNavn: string, timer: number }[]
}

export const Chart = ({ data }: ChartProps) => {
  const chartData = {
    labels: data.map(d => d.prosjektNavn),
    datasets: [
      {
        label: 'Timer',
        data: data.map(d => d.timer),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Tidsbruk per Prosjekt',

      },
    },
  }

  return <Bar data={chartData} options={options} />
}
