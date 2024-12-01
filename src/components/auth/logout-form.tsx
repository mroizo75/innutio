"use client"

import { useTransition } from "react"
import { logout } from "@/actions/logout"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FormError } from "@/components/form-error"
import { useRouter } from "next/navigation"

export const LogoutForm = () => {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | undefined>()
    const router = useRouter()

    const onSubmit = () => {
        setError(undefined)
        startTransition(() => {
            logout().catch((err) => {
                console.error("Logout error:", err)
                setError("Det oppstod en feil under utlogging")
            })
        })
    }

    return (
        <CardWrapper
            headerLabel="Logger ut"
            backButtonHref="/dashboard"
            backButtonLabel=""
            showSocial={false}
        >
            <div className="flex flex-col gap-4">
                <p className="text-center text-muted-foreground">
                    Er du sikker på at du vil logge ut?
                </p>
                {error && <FormError message={error} />}
                <div className="flex gap-4">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="w-full"
                    >
                        Avbryt
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={isPending}
                        className="w-full"
                    >
                        Logg ut
                    </Button>
                </div>
            </div>
        </CardWrapper>
    )
}