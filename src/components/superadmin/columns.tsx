"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "navn",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bedriftsnavn
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    }
  },
  {
    accessorKey: "orgnr",
    header: "Org.nr"
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status")
      return (
        <Badge
          variant={
            status === "AKTIV" 
              ? "success" 
              : status === "UTLOPT" 
              ? "destructive" 
              : "default"
          }
        >
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: "abonnementType",
    header: "Abonnement"
  },
  {
    accessorKey: "abonnementSlutt",
    header: "Utløper",
    cell: ({ row }) => {
      const date = row.getValue("abonnementSlutt")
      return date ? new Date(date as string).toLocaleDateString() : "Ikke satt"
    }
  },
  {
    accessorKey: "users",
    header: "Antall brukere",
    cell: ({ row }) => {
      const users = row.getValue("users") as any[]
      return users?.length || 0
    }
  }
]