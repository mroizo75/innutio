"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function AddUserModal({ onAdd }: { onAdd: (formData: FormData) => Promise<void> }) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    await onAdd(formData)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Legg til ny bruker</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Legg til ny bruker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="navn" placeholder="Fornavn" required />
          <Input name="etternavn" placeholder="Etternavn" required />
          <Input name="email" placeholder="E-post" type="email" required />
          <Input name="position" placeholder="Stilling" required />
          <select name="role" className="w-full p-2 border rounded">
            <option value="USER">Bruker</option>
            <option value="LEDER">Leder</option>
            <option value="PROSJEKTLEDER">Prosjektleder</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit">Legg til bruker</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}