"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DownloadIcon } from "lucide-react";
import axios from "axios";

interface ExportTimeTrackingCardProps {
  currentUser: {
    id: string;
    navn: string;
    etternavn: string;
    role: string;
    bedriftId: string;
  };
}

const ExportTimeTrackingCard: React.FC<ExportTimeTrackingCardProps> = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = [
    { value: "1", label: "Januar" },
    { value: "2", label: "Februar" },
    { value: "3", label: "Mars" },
    { value: "4", label: "April" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const handleExport = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Vennligst velg både måned og år.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/api/timeregistrering/export/excel', {
        month: parseInt(selectedMonth),
        year: parseInt(selectedYear),
      }, {
        responseType: 'blob', // Viktig for filnedlasting
      });

      // Opprett en lenke for nedlasting
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Timer_${selectedMonth}_${selectedYear}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error: any) {
      console.error("Feil ved eksport av timer:", error);
      alert("Kunne ikke eksportere timer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md mt-4">
      <CardHeader>
        <CardTitle>Eksporter Timeregistreringer</CardTitle>
        <CardDescription>Velg måned og år for å eksportere timeregistreringer til Excel.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-end md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex flex-col">
            <label htmlFor="month" className="text-sm font-medium text-gray-700">
              Måned
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Velg måned" />
              </SelectTrigger>
              <SelectContent>
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label htmlFor="year" className="text-sm font-medium text-gray-700">
              År
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Velg år" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleExport} disabled={isLoading} className="flex items-center justify-center">
            <DownloadIcon className="mr-2 h-4 w-4" />
            {isLoading ? "Eksporterer..." : "Eksporter til Excel"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportTimeTrackingCard;