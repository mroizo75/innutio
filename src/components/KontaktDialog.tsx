"use client"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { KontaktSkjema } from "@/components/KontaktSkjema"
import { Button } from "@/components/ui/button"

interface KontaktDialogProps {
  children: React.ReactNode
  variant?: "default" | "secondary" | "ghost" | "link"
  className?: string
}

export function KontaktDialog({ children, variant = "default", className }: KontaktDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>{children}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <KontaktSkjema onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}