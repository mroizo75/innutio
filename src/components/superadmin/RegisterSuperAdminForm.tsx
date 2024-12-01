"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { registrerSuperAdmin } from "@/actions/superadmin-actions"

export function RegisterSuperAdminForm() {
  const [formData, setFormData] = useState({
    email: "",
    navn: "",
    etternavn: "",
    password: "",
    bekreftPassord: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.bekreftPassord) {
      alert("Passordene matcher ikke")
      return
    }

    try {
      await registrerSuperAdmin({
        email: formData.email,
        navn: formData.navn,
        etternavn: formData.etternavn,
        password: formData.password
      })
      alert("Superadmin opprettet")
      setFormData({ email: "", navn: "", etternavn: "", password: "", bekreftPassord: "" })
    } catch (error) {
      alert("Kunne ikke opprette superadmin")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrer ny superadmin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label>E-post</Label>
            <Input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Fornavn</Label>
            <Input 
              value={formData.navn}
              onChange={(e) => setFormData({...formData, navn: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Etternavn</Label>
            <Input 
              value={formData.etternavn}
              onChange={(e) => setFormData({...formData, etternavn: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Passord</Label>
            <Input 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Bekreft passord</Label>
            <Input 
              type="password"
              value={formData.bekreftPassord}
              onChange={(e) => setFormData({...formData, bekreftPassord: e.target.value})}
              required
            />
          </div>

          <Button type="submit">Registrer superadmin</Button>
        </form>
      </CardContent>
    </Card>
  )
}