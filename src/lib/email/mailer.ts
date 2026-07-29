import nodemailer from "nodemailer";

// Brevo SMTP relay. SMTP_USER is the Brevo SMTP login (e.g. 8xxxxx@smtp-brevo.com),
// not the account email, and SMTP_PASSWORD is an SMTP key, not the API key.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false, // port 587 upgrades to TLS via STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: {
      name: process.env.SMTP_FROM_NAME ?? "Examklaar",
      address: process.env.SMTP_FROM_EMAIL ?? "",
    },
    to,
    subject,
    html,
  });
}
