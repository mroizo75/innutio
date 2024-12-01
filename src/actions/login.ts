"use server"

import { signIn } from 'next-auth/react'
import { LoginSchema } from '@/schemas'
import * as z from 'zod'

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Ugyldige felt!' }
  }

  const { email, password } = validatedFields.data

  const result = await signIn('credentials', {
    redirect: false,
    email,
    password,
  })

  if (result?.error) {
    return { error: 'Feil e-post eller passord!' }
  }

  return { success: true }
}