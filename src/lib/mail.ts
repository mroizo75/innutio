import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.proisp.no',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
  },
  debug: true
});

export const sendVerificationEmail = async (
  email: string,
  token: string,
  subject: string = 'Verifiser e-posten din'
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/new-verification?token=${token}`;

  const mailOptions = {
    from: `"InnUt.io - HMS for din bedrift" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: `<p>Klikk <a href="${confirmLink}">her</a> for å ${subject.toLowerCase()}.</p>`,
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log('Verifikasjons-e-post sendt til:', email);
  } catch (error) {
    console.error('Feil ved sending av verifikasjons-e-post:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  subject: string = 'Tilbakestill passordet ditt'
) => {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/set-password?token=${token}`;

  const mailOptions = {
    from: `"KKS Timereg" <${process.env.SMTP_USER}>`,
    to: email,
    subject: subject,
    html: `<p>Klikk <a href="${resetLink}">her</a> for å ${subject.toLowerCase()}. Denne lenken er gyldig i 1 time.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Passord-reset e-post sendt til:', email);
  } catch (error) {
    console.error('Feil ved sending av passord-reset e-post:', error);
    throw error;
  }
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  const mailOptions = {
    from: `"InnUt.io - HMS for din bedrift" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('E-post sendt til:', to);
  } catch (error) {
    console.error('Feil ved sending av e-post:', error);
    throw error;
  }
};