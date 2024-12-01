"use client"

import { useState } from "react"
import { forgotPassword } from "@/actions/forgot-password"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/hooks/use-toast"

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await forgotPassword(email)

      if (response.success) {
        toast({
          title: "E-post sendt",
          description: response.success,
        })
        setEmail("")
      } else {
        toast({
          variant: "destructive",
          title: "Feil",
          description: response.error,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Feil",
        description: "Noe gikk galt. Prøv igjen senere.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="E-post"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Sender..." : "Send tilbakestillingslenke"}
      </Button>
    </form>
  )
} 