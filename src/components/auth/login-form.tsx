"use client"

import * as z from "zod"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginSchema } from "@/schemas"
import { signIn } from "next-auth/react"
import { CardWrapper } from "./card-wrapper"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormError } from "@/components/form-error"
import { getRedirectPath } from "@/routes"

export const LoginForm = () => {
    const router = useRouter()
    const [error, setError] = useState<string | undefined>("")
    const [isPending, setPending] = useState<boolean>(false)

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setPending(true)
        setError(undefined)

        try {
            const result = await signIn("credentials", {
                email: values.email,
                password: values.password,
                redirect: false,
            })

            if (result?.error) {
                setError("Ugyldig e-post eller passord")
                return
            }

            // Vent på at sesjonen skal oppdateres
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Hent sesjonen direkte
            const response = await fetch("/api/auth/session")
            const session = await response.json()

            if (session?.user?.role) {
                const redirectPath = getRedirectPath(session.user.role)
                console.log("Redirecting to:", redirectPath) // Debug logging
                router.push(redirectPath)
            } else {
                setError("Kunne ikke hente brukerdata")
            }
        } catch (error) {
            console.error("Login error:", error)
            setError("Noe gikk galt under innlogging")
        } finally {
            setPending(false)
        }
    }

    return (
        <CardWrapper
            headerLabel="Velkommen tilbake"
            backButtonLabel="Har du ikke konto?"
            backButtonHref="/auth/register"
            showSocial={false}
        >
            <Form {...form}>
                <form 
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-post</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="din@epost.no"
                                            type="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Passord</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormError message={error} />
                    <Button
                        disabled={isPending}
                        type="submit"
                        className="w-full"
                    >
                        {isPending ? "Logger inn..." : "Logg inn"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}
