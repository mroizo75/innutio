import { db } from "@/lib/db"
import { sendEmail } from '@/lib/mail';

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export const saveVerificationCode = async (email: string, code: string) => {
    await db.verificationCode.create({
        data: {
            email,
            code,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutter
        }
    })
}

export const verifyCode = async (email: string, code: string) => {
    const storedCode = await db.verificationCode.findFirst({
        where: {
            email,
            code,
            expiresAt: { gt: new Date() }
        }
    })
    return !!storedCode
}

export const sendVerificationCode = async (email: string, token: string) => {
    const code = generateVerificationCode();
    await saveVerificationCode(email, code);
    
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${token}`;
    
    await sendEmail(
        email,
        "Verifiseringskode for registrering",
        `<p>Din verifiseringskode er: <strong>${code}</strong></p>
        <p>For å sette ditt passord, klikk på denne lenken:</p>
        <a href="${resetUrl}">Sett passord</a>`
    );
    return { success: true, message: "Verifiseringskode sendt" };
};
