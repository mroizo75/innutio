"use client";

import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getProjects } from "@/actions/endringsSkjema";
import { toast, Toaster } from 'react-hot-toast';

interface ChangeRequestForm {
  prosjektId: string;
  prosjektNavn: string;
  changeNumber: string;
  description: string;
  submittedBy: string;
  implementationDate: string;
  comments: string;
  bedriftId: string;  // Legg til disse
  opprettetAvId: string;  // Legg til disse
}

interface Project {
  id: string;
  navn: string;
}

export default function ChangeForm() {
  const [form, setForm] = useState<ChangeRequestForm>({
    prosjektId: "",
    prosjektNavn: "",
    changeNumber: "",
    description: "",
    submittedBy: "",
    implementationDate: "",
    comments: "",
    bedriftId: "", 
    opprettetAvId: "", 
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [_error, setError] = useState("");
  const [_success, setSuccess] = useState("");
  const [bilder, setBilder] = useState<{ url: string; navn: string }[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload-bilder', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Feil ved opplasting av bilde');
        }

        const result = await response.json();
        setBilder(prevBilder => [...prevBilder, { url: result.url, navn: result.navn }]);
      } catch (error) {
        console.error('Feil ved opplasting av bilde:', error);
        toast.error('Feil ved opplasting av bilde');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    onDrop
  });

  useEffect(() => {
    fetchProjects();
    fetchLatestChangeNumber();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error("Feil ved henting av prosjekter:", error);
      setError("Kunne ikke hente prosjekter");
    }
  };

  const fetchLatestChangeNumber = async () => {
    try {
      const response = await fetch("/api/change/generate-number");
      if (!response.ok) {
        throw new Error("Kunne ikke generere nytt endringsnummer");
      }
      const data = await response.json();
      setForm((prevForm) => ({ ...prevForm, changeNumber: data.changeNumber }));
    } catch (error) {
      console.error("Feil ved generering av endringsnummer:", error);
      setError("Kunne ikke generere endringsnummer");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
    name?: string
  ) => {
    if (typeof e === "string") {
      if (name === "prosjektId") {
        const selectedProsjekt = projects.find((p) => p.id === e);
        setForm((prevForm) => ({
          ...prevForm,
          prosjektId: e,
          prosjektNavn: selectedProsjekt?.navn || "Ukjent prosjekt",
        }));
      } else {
        setForm((prevForm) => ({
          ...prevForm,
          [name as string]: e,
        }));
      }
    } else {
      const { name, value } = e.target;
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.prosjektId || !form.description || !form.implementationDate) {
      setError("Vennligst fyll ut alle påkrevde felt");
      return;
    }

    try {
      const response = await fetch('/api/change/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          bilder
        }),
      });

      if (response.ok) {
        toast.success('Endringsskjema opprettet');
        // Reset form og bilder
        setForm({
          prosjektId: "",
          prosjektNavn: "",
          changeNumber: "",
          description: "",
          submittedBy: "",
          implementationDate: "",
          comments: "",
          bedriftId: "",
          opprettetAvId: "",
        });
        setBilder([]);
        await fetchLatestChangeNumber();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Kunne ikke opprette endringsskjema");
      }
    } catch (error) {
      console.error("Feil ved innsending:", error);
      toast.error("En feil oppstod ved innsending av skjemaet");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Endringsskjema</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="prosjektNavn">Prosjekt</Label>
            <Select onValueChange={(value) => handleChange(value, 'prosjektId')}>
              <SelectTrigger>
                <SelectValue placeholder="Velg prosjekt" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.navn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> 
          </div>
          <div>
            <Label htmlFor="changeNumber">Endringsnummer</Label>
            <Input
              id="changeNumber"
              name="changeNumber"
              value={form.changeNumber}
              readOnly
              disabled
              className="bg-gray-100"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Beskrivelse av endring</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="submittedBy">Initiert av</Label>
            <Input
              id="submittedBy"
              name="submittedBy"
              value={form.submittedBy}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="implementationDate">Dato for implementering av endring</Label>
            <Input
              id="implementationDate"
              name="implementationDate"
              type="date"
              value={form.implementationDate}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="comments">Kommentarer</Label>
            <Textarea
              id="comments"
              name="comments"
              value={form.comments}
              onChange={handleChange}
            />
          </div>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 p-2 mt-4 text-center cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
        <p>Slipp bildene her ...</p>
      ) : (
        <p>Dra og slipp bilder her, eller klikk for å velge filer</p>
      )}
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      {bilder.map((bilde, index) => (
        <div key={index} className="relative">
          <Image 
            src={bilde.url} 
            alt={`Bilde ${index + 1}`} 
            width={100} 
            height={100} 
            objectFit="cover"
            className="object-cover" 
          />
          <button
            onClick={() => setBilder(prevBilder => prevBilder.filter((_, i) => i !== index))}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            X
          </button>
        </div>
      ))}
    </div>
          <Button type="submit" className="md:col-span-2 bg-black text-white hover:bg-gray-800">
            Send skjema
          </Button>
        </form>
        <Toaster position="top-right" />
        {/* {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-500 mt-4">{success}</p>} */}
      </CardContent>
    </Card>
  );
}
