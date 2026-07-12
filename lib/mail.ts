import nodemailer from "nodemailer";

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends an email using Gmail SMTP and credentials stored in environment variables.
 */
export async function sendEmail({ to, subject, text, html }: MailOptions): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;

  if (!user || !pass) {
    throw new Error("Missing GMAIL_USER or GMAIL_PASS environment variables.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: `"Boarding House Manager" <${user}>`,
    to,
    subject,
    text,
    html,
  });
}
