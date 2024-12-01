"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { updateUser } from "@/actions/user"
import { DialogTrigger } from "@/components/ui/dialog"

// Oppdatert type for brukerdata
type UserData = {
  id: string;
  navn: string;
  etternavn: string;
  email: string;
  position: string;
  role: string;
};

// Oppdatert props interface
interface EditUserModalProps {
  user: UserData;  // Endret fra defaultValues til user
  onEdit: () => Promise<void>;  // Lagt til onEdit prop
}

export function EditUserModal({ user, onEdit }: EditUserModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UserData>(user);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateUser(formData)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
        await onEdit()
        router.refresh()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Feil ved oppdatering:', error)
      toast.error('Kunne ikke oppdatere bruker')
    }
  }

  if (!user?.id) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Rediger</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rediger bruker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="hidden" 
            name="userId" 
            value={user.id} 
          />
          <Input 
            name="navn" 
            defaultValue={user.navn} 
            placeholder="Fornavn" 
          />
          <Input 
            name="etternavn" 
            defaultValue={user.etternavn} 
            placeholder="Etternavn" 
          />
          <Input 
            name="email" 
            defaultValue={user.email} 
            placeholder="E-post" 
          />
          <Input 
            name="position" 
            defaultValue={user.position} 
            placeholder="Stilling" 
          />
          <select
            name="role"
            defaultValue={user.role}
            className="w-full p-2 border rounded"
          >
            <option value="USER">Bruker</option>
            <option value="LEDER">Leder</option>
            <option value="PROSJEKTLEDER">Prosjektleder</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="submit">Lagre endringer</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}