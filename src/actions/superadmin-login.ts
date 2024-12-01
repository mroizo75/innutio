"use server"

import * as z from "zod"
import { signIn } from "@/auth"
import { LoginSchema } from "@/schemas"
import { AuthError } from "next-auth"

export const loginSuperAdmin = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values)
    
    if (!validatedFields.success) {
        return { error: "Ugyldig input" }
    }

    const { email, password } = validatedFields.data

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/superadmin",
            callbackUrl: "/superadmin"
        })

        return { success: "Innlogget!" }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Ugyldig e-post eller passord" }
                default:
                    return { error: "Noe gikk galt" }
            }
        }

        throw error
    }
}