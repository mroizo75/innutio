import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      role: string
      bedriftId: string
      navn?: string
      etternavn?: string
    }
  }

  interface User {
    id: string
    email: string
    role: string
    bedriftId: string
    navn?: string
    etternavn?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
  }
}