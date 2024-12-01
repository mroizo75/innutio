"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteStoffkartotek } from "@/actions/stoffkartotek"
import { toast } from "sonner"
import { EditStoffkartotekDialog } from "@/components/EditStoffkartotekDialog"
import { Stoffkartotek } from "@prisma/client"

interface StoffkartotekActionsProps {
  stoffkartotek: Stoffkartotek
  onEdit: () => void
  onDelete: () => void
}

export function StoffkartotekActions({ 
  stoffkartotek, 
  onEdit,
  onDelete 
}: StoffkartotekActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const result = await deleteStoffkartotek(stoffkartotek.id)
      if (result.success) {
        onDelete()
        toast.success("Stoffkartotek slettet")
        router.refresh()
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Kunne ikke slette stoffkartotek"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditComplete = async () => {
    try {
      setShowEditDialog(false)
      await onEdit()
      router.refresh()
    } catch (error) {
      toast.error("Kunne ikke oppdatere visningen")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rediger
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleDelete}
            disabled={isLoading}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Slett
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditStoffkartotekDialog
        stoffkartotek={stoffkartotek}
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) handleEditComplete()
        }}
      />
    </>
  )
}