import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query"
import { Oppgave } from "@prisma/client";

export function UploadFileModal({ isOpen, onClose, oppgave, onUpload }: { isOpen: boolean, onClose: () => void, oppgave: Oppgave, onUpload: (formData: FormData) => Promise<void> }) {
  const queryClient = useQueryClient()
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('filer', file);
    });
    formData.append('oppgaveId', oppgave.id);

    await onUpload(formData);
    queryClient.invalidateQueries({ queryKey: ['oppgaver'] })
    queryClient.invalidateQueries({ queryKey: ['prosjekt'] })
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Last opp filer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            required
          />
          <Button type="submit">Last opp</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}