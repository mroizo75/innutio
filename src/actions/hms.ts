"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth-utils"
import { revalidatePath } from "next/cache"
import { uploadFile, deleteFile } from "@/lib/googleCloudStorage"

export async function uploadHMSHandbok(formData: FormData) {
    try {
        const session = await auth()
        const user = await db.user.findUnique({
            where: { id: session?.user?.id },
            include: { bedrift: true }
        })

        if (!user?.bedrift) {
            throw new Error("Ikke autorisert")
        }

        // Finn gjeldende versjon
        const currentDoc = await db.hMSDokument.findFirst({
            where: {
                bedriftId: user.bedrift.id,
                name: "HMS Håndbok"
            },
            orderBy: {
                version: 'desc'
            }
        })

        const newVersion = currentDoc ? currentDoc.version + 1 : 1
        
        // Last opp fil
        const file = formData.get('file') as File
        const { url } = await uploadFile(file)

        // Opprett nytt dokument med oppdatert versjon
        const newDoc = await db.hMSDokument.create({
            data: {
                name: "HMS Håndbok",
                url: url,
                version: newVersion,
                bedriftId: user.bedrift.id
            }
        })

        return {
            url: newDoc.url,
            version: newDoc.version
        }
    } catch (error) {
        console.error("Feil ved opplasting av HMS Håndbok:", error)
        throw error
    }
}

export async function uploadDocument(formData: FormData) {
    const session = await auth()
    const currentUser = await db.user.findUnique({
        where: { id: session?.user?.id },
        include: { bedrift: true },
    })

    if (!currentUser || !currentUser.bedrift) {
        throw new Error("Bruker eller bedrift ikke funnet")
    }

    const file = formData.get("file") as File
    const name = formData.get("name") as string

    if (!file || !name) {
        throw new Error("Manglende fil eller navn")
    }

    const { url } = await uploadFile(file)

    const document = await db.hMSDokument.create({
        data: {
            name,
            url,
            bedriftId: currentUser.bedrift.id,
        },
    })

    revalidatePath("/hms")

    return { id: document.id, url: document.url }
}

export async function deleteDocument(documentId: string) {
    const session = await auth()
    const currentUser = await db.user.findUnique({
        where: { id: session?.user?.id },
        include: { bedrift: true },
    })

    if (!currentUser || !currentUser.bedrift) {
        throw new Error("Bruker eller bedrift ikke funnet")
    }

    let document;
    if (documentId === 'hmsHandbok') {
        document = { url: currentUser.bedrift.hmsHandbokUrl, name: "HMS Håndbok" };
    } else {
        document = await db.hMSDokument.findUnique({
            where: { id: documentId },
        })
    }

    if (!document) {
        throw new Error("Dokument ikke funnet")
    }

    // Extract the filename from the URL
    const fileName = document.url?.split('/').pop() ?? null

    if (!fileName) {
        throw new Error("Kunne ikke finne filnavnet eller dokumentet mangler URL")
    }

    try {
        // Delete the file from Google Cloud Storage
        await deleteFile(fileName)
    } catch (error) {
        console.error('Feil ved sletting av fil fra Cloud Storage:', error)
        // Fortsett med å slette dokumentet fra databasen selv om filen ikke kunne slettes
    }

    if (documentId === 'hmsHandbok') {
        // Update bedrift to remove HMS Håndbok URL
        await db.bedrift.update({
            where: { id: currentUser.bedrift.id },
            data: { hmsHandbokUrl: null },
        })
    } else {
        // Delete the document from the database
        await db.hMSDokument.delete({
            where: { id: documentId },
        })
    }

    revalidatePath("/hms")

    return { success: true }
}

export async function deleteHMSHandbok() {
    try {
        const session = await auth()
        const currentUser = await db.user.findUnique({
            where: { id: session?.user?.id },
            include: { bedrift: true },
        })

        if (!currentUser || !currentUser.bedrift) {
            throw new Error("Ikke autorisert")
        }

        const bedrift = await db.bedrift.findUnique({
            where: { id: currentUser.bedrift.id }
        })

        if (!bedrift || !bedrift.hmsHandbokUrl) {
            return { success: true }
        }

        // Hent ut bare filnavnet fra URL-en
        // URL format: https://storage.googleapis.com/bucket-name/filename
        const fullPath = new URL(bedrift.hmsHandbokUrl).pathname
        const fileName = fullPath.split('/').pop()

        if (fileName) {
            try {
                console.log('Prøver å slette fil:', fileName)
                await deleteFile(fileName)
            } catch (error) {
                console.error("Feil ved sletting av fil fra storage:", error)
                // Fortsett selv om filen ikke kunne slettes fra storage
            }
        }

        // Oppdater databasen
        await db.bedrift.update({
            where: { id: bedrift.id },
            data: { 
                hmsHandbokUrl: null,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Feil ved sletting av HMS Håndbok:", error)
        throw error
    }
}

export async function getHMSDocuments() {
    const session = await auth()
    const user = await db.user.findUnique({
        where: { id: session?.user?.id },
        include: { bedrift: true }
    })

    if (!user?.bedrift) {
        throw new Error("Ikke autorisert")
    }

    // Hent siste versjon av HMS Håndbok
    const latestHMSHandbok = await db.hMSDokument.findFirst({
        where: { 
            bedriftId: user.bedrift.id 
        },
        orderBy: {
            version: 'desc'
        },
        select: {
            id: true,
            url: true,
            version: true,
            createdAt: true,
            updatedAt: true
        }
    })

    // Hvis vi fant en HMS Håndbok, returner den med navn
    if (latestHMSHandbok) {
        return [{
            id: latestHMSHandbok.id,
            name: "HMS Håndbok",
            url: latestHMSHandbok.url,
            version: latestHMSHandbok.version
        }]
    }

    return []
}
