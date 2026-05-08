import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sendAdminNotificationEmail } from "./email-service";

export type StoredContactSubmission = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type ContactSubmissionInput = Omit<StoredContactSubmission, "id" | "createdAt">;
type DeliveryStatus = "delivered" | "queued";

type ContactSubmissionResult = {
  submission: StoredContactSubmission;
  deliveryStatus: DeliveryStatus;
};

const storeFilePath = () => path.join(process.cwd(), ".data", "contact-submissions.json");
const pendingStoreFilePath = () => path.join(process.cwd(), ".data", "contact-submissions-pending.json");

async function ensureStoreDirectory() {
  await mkdir(path.dirname(storeFilePath()), { recursive: true });
}

export async function readStoredContactSubmissions() {
  try {
    const raw = await readFile(storeFilePath(), "utf8");
    const parsed = JSON.parse(raw) as StoredContactSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function appendContactSubmissionToLocalStore(submission: StoredContactSubmission) {
  await ensureStoreDirectory();
  const existing = await readStoredContactSubmissions();
  const nextCollection = [submission, ...existing];
  await writeFile(storeFilePath(), JSON.stringify(nextCollection, null, 2), "utf8");
}

async function readPendingContactSubmissions() {
  try {
    const raw = await readFile(pendingStoreFilePath(), "utf8");
    const parsed = JSON.parse(raw) as StoredContactSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function writePendingContactSubmissions(submissions: StoredContactSubmission[]) {
  await ensureStoreDirectory();
  await writeFile(pendingStoreFilePath(), JSON.stringify(submissions, null, 2), "utf8");
}

async function queuePendingSubmission(submission: StoredContactSubmission) {
  const pending = await readPendingContactSubmissions();
  const alreadyQueued = pending.some((item) => item.id === submission.id);
  if (!alreadyQueued) {
    await writePendingContactSubmissions([submission, ...pending]);
  }
}

async function sendContactSubmissionToGoogleSheet(submission: StoredContactSubmission) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  // Spreadsheet URLs are not writable endpoints. We only accept Apps Script web app URLs.
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    return false;
  }

  const isAppsScriptWebhook =
    parsedUrl.hostname === "script.google.com" &&
    parsedUrl.pathname.includes("/macros/s/") &&
    parsedUrl.pathname.endsWith("/exec");

  if (!isAppsScriptWebhook) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function flushPendingSubmissions() {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const pending = await readPendingContactSubmissions();
  if (pending.length === 0) {
    return;
  }

  const stillPending: StoredContactSubmission[] = [];

  for (const submission of pending) {
    try {
      const delivered = await sendContactSubmissionToGoogleSheet(submission);
      if (!delivered) {
        stillPending.push(submission);
      }
    } catch {
      stillPending.push(submission);
    }
  }

  try {
    await writePendingContactSubmissions(stillPending);
  } catch {
    // Intentionally ignore to avoid blocking the form submission path.
  }
}

export async function saveContactSubmission(input: ContactSubmissionInput) {
  const submission: StoredContactSubmission = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };
  try {
    await appendContactSubmissionToLocalStore(submission);
  } catch {
    // Local filesystem can be read-only in some runtimes; continue with webhook path.
  }

  // Try Google Sheets webhook if configured
  let delivered = false;
  try {
    delivered = await sendContactSubmissionToGoogleSheet(submission);
  } catch {
    delivered = false;
  }

  if (!delivered) {
    try {
      await queuePendingSubmission(submission);
    } catch {
      // ignore
    }
  } else {
    try {
      await flushPendingSubmissions();
    } catch {}
  }

  // Send admin email notification (best-effort)
  try {
    const admin = process.env.ADMIN_EMAIL || "abhi.guptafr@gmail.com";
    const html = `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      <p><strong>Subject:</strong> ${submission.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${submission.message}</p>
    `;
    await sendAdminNotificationEmail(admin, `New Contact: ${submission.subject}`, html);
  } catch (err) {
    console.error("Failed to send admin email for contact submission:", err);
  }

  const result: ContactSubmissionResult = {
    submission,
    deliveryStatus: delivered ? "delivered" : "queued",
  };

  return result;
}
