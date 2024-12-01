"use client"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { newVerification } from "@/actions/new-verification"
import { CardWrapper } from "@/components/auth/card-wrapper"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"

export const NewVerificationForm = () => {
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()

    const verifyEmail = useCallback(async () => {
        if (!token) {
            setError("Verifiseringen er ugyldig")
            setSuccess(undefined)
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const data = await newVerification(token)
            if (data.error) {
                setError(data.error)
                setSuccess(undefined)
            } else {
                setSuccess(data.success)
                setError(undefined)
                setTimeout(() => {
                    router.push("/auth/login")
                }, 2000)
            }
        } catch (err) {
            setError("En feil oppstod under verifiseringen")
            setSuccess(undefined)
        } finally {
            setIsLoading(false)
        }
    }, [token, router])

    useEffect(() => {
        verifyEmail()
    }, [verifyEmail])

    return (
        <CardWrapper
            headerLabel="Verifiserer e-post..."
            backButtonLabel="Tilbake"
            backButtonHref="/auth/login"
        >
            <div className="flex flex-col gap-4 items-center justify-center">
                {!success && !error && (
                    <p>Vennligst vent mens vi verifiserer e-posten din.</p>
                )}
                {success && <FormSuccess message={success} />}
                {error && <FormError message={error} />}
            </div>
        </CardWrapper>
    )
}
