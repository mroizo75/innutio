import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { navn, bedrift, email, telefon, melding } = body;

    // Send bekreftelse til kunden
    await sendEmail({
      to: email,
      subject: "Takk for din henvendelse - InnUt.io",
      html: `
        <div style="
          font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif;
          max-width: 560px;
          margin: 0 auto;
          padding: 20px 0 48px;
          background-color: #ffffff;
        ">
          <h1 style="
            color: #1f2937;
            font-size: 24px;
            font-weight: 600;
            line-height: 24px;
            margin: 16px 0;
          ">Takk for din henvendelse</h1>
          
          <p style="
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin: 16px 0;
          ">Hei ${navn},</p>
          
          <p style="
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin: 16px 0;
          ">Vi har mottatt din henvendelse og vil ta kontakt med deg så snart som mulig.</p>
          
          <p style="
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin: 16px 0;
          ">Din melding:</p>
          
          <div style="
            background-color: #f3f4f6;
            border-radius: 4px;
            padding: 16px;
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin: 16px 0;
          ">${melding}</div>
          
          <p style="
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin: 16px 0;
          ">Med vennlig hilsen,<br>Teamet i InnUt.io</p>
        </div>
      `,
    });

    // Send varsling til bedriften
    await sendEmail({
      to: process.env.SMTP_USER!,
      subject: "Ny henvendelse fra kontaktskjema",
      html: `
        <div style="font-family: sans-serif;">
          <h2>Ny henvendelse fra ${navn}</h2>
          <p><strong>Bedrift:</strong> ${bedrift}</p>
          <p><strong>E-post:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${telefon}</p>
          <p><strong>Melding:</strong></p>
          <p>${melding}</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Henvendelse mottatt",
    });
  } catch (error) {
    console.error("[KONTAKT_ERROR]", error);
    return NextResponse.json(
      { error: "Kunne ikke sende melding" },
      { status: 500 }
    );
  }
}