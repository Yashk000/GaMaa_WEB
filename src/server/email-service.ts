import nodemailer from "nodemailer";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

let transporter: any = null;

if (SMTP_HOST && SMTP_PORT) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
} else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const emailsFile = () => path.join(process.cwd(), ".data", "emails.json");

async function ensureEmailsDir() {
  await mkdir(path.dirname(emailsFile()), { recursive: true });
}

async function appendToLocalEmails(record: { to: string; subject: string; html?: string; text?: string; sentAt: string }) {
  await ensureEmailsDir();
  try {
    const raw = await readFile(emailsFile(), "utf8");
    const arr = JSON.parse(raw) as any[];
    arr.unshift(record);
    await writeFile(emailsFile(), JSON.stringify(arr, null, 2), "utf8");
  } catch (err) {
    await writeFile(emailsFile(), JSON.stringify([record], null, 2), "utf8");
  }
}

async function sendEmail(opts: { to: string; subject: string; html?: string; text?: string }) {
  const admin = opts.to;
  const record = { to: admin, subject: opts.subject, html: opts.html, text: opts.text, sentAt: new Date().toISOString() };

  if (transporter) {
    try {
      await transporter.sendMail({ from: process.env.EMAIL_FROM || SMTP_USER || process.env.GMAIL_USER || "noreply@gamaatech.com", to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
      await appendToLocalEmails(record);
      return true;
    } catch (err) {
      console.error("Failed to send email via SMTP, falling back to local store:", err);
      await appendToLocalEmails(record);
      return false;
    }
  }

  // No transporter configured — save to local file so admin can review
  await appendToLocalEmails(record);
  console.warn("Email transporter not configured; saved email to .data/emails.json");
  return false;
}

export async function sendVerificationEmail(userEmail: string, userName: string, submissionId: string, verificationToken: string) {
  const verificationLink = `${process.env.APP_URL || "http://localhost:5173"}/verify-testimonial?id=${submissionId}&token=${verificationToken}`;
  const html = `
    <h2>Hi ${userName},</h2>
    <p>Thank you for submitting your testimonial! Please verify your email to publish it.</p>
    <p>
      <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;border-radius:4px;text-decoration:none;">Verify Your Testimonial</a>
    </p>
    <p>Or copy this link: ${verificationLink}</p>
    <p>This link expires in 24 hours.</p>
    <p>Thanks,<br/>GaMaa Tech Team</p>
  `;

  return sendEmail({ to: userEmail, subject: "Verify Your Testimonial - GaMaa Tech", html });
}

export async function sendAdminNotificationEmail(adminEmail: string, subject: string, html: string) {
  return sendEmail({ to: adminEmail, subject, html });
}

export async function testEmailConnection(): Promise<boolean> {
  if (!transporter) return false;
  try {
    await transporter.verify();
    return true;
  } catch (err) {
    console.error("Email provider verify failed:", err);
    return false;
  }
}
