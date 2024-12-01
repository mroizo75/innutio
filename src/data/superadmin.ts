import { db } from "@/lib/db"

export const getSuperAdminById = async (id: string) => {
    try {
        const superAdmin = await db.superAdmin.findUnique({
            where: { id }
        })

        return superAdmin
    } catch {
        return null
    }
}

export const getSuperAdminByEmail = async (email: string) => {
    try {
        const superAdmin = await db.superAdmin.findUnique({
            where: { email }
        })

        return superAdmin
    } catch {
        return null
    }
} 