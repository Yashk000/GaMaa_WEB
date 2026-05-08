import crypto from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { sendVerificationEmail, sendAdminNotificationEmail } from "./email-service";

export type StoredTestimonial = {
  id: string;
  name: string;
  email?: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  createdAt: string;
  verifiedAt?: string;
};

type LocalPendingTestimonialRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  verificationToken: string;
  verificationTokenExpiresAt: string;
  createdAt: string;
};

type LocalTestimonialRecord = {
  id: string;
  name: string;
  email?: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  createdAt: string;
  verifiedAt?: string;
};

const publishedFilePath = () => path.join(process.cwd(), ".data", "testimonials.json");
const pendingFilePath = () => path.join(process.cwd(), ".data", "testimonials-pending.json");

async function ensureStoreDirectory() {
  await mkdir(path.dirname(publishedFilePath()), { recursive: true });
}

export async function readLocalPublishedTestimonials() {
  try {
    const raw = await readFile(publishedFilePath(), "utf8");
    const parsed = JSON.parse(raw) as LocalTestimonialRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocalPublishedTestimonials(records: LocalTestimonialRecord[]) {
  await ensureStoreDirectory();
  await writeFile(publishedFilePath(), JSON.stringify(records, null, 2), "utf8");
}

export async function readLocalPendingTestimonials() {
  try {
    const raw = await readFile(pendingFilePath(), "utf8");
    const parsed = JSON.parse(raw) as LocalPendingTestimonialRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocalPendingTestimonials(records: LocalPendingTestimonialRecord[]) {
  await ensureStoreDirectory();
  await writeFile(pendingFilePath(), JSON.stringify(records, null, 2), "utf8");
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "U"
  );
}

export async function readStoredTestimonials() {
  const local = await readLocalPublishedTestimonials();
  return local.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    role: item.role,
    content: item.content,
    rating: item.rating,
    image: item.image,
    createdAt: item.createdAt,
    verifiedAt: item.verifiedAt,
  }));
}

export async function createPendingTestimonial(input: {
  name: string;
  email: string;
  role: string;
  content: string;
  rating: number;
}) {
  const now = new Date();
  const verificationToken = crypto.randomBytes(24).toString("hex");
  const verificationTokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const localDocument: LocalPendingTestimonialRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role,
    content: input.content,
    rating: input.rating,
    image: getInitials(input.name),
    verificationToken,
    verificationTokenExpiresAt: verificationTokenExpiresAt.toISOString(),
    createdAt: now.toISOString(),
  };

  await writeLocalPendingTestimonials([localDocument, ...(await readLocalPendingTestimonials())]);

  // send verification email to submitter (best-effort)
  try {
    await sendVerificationEmail(input.email, input.name, localDocument.id, verificationToken);
  } catch (err) {
    console.error("Failed to send verification email:", err);
  }

  // notify admin
  try {
    const admin = process.env.ADMIN_EMAIL || "abhi.guptafr@gmail.com";
    const html = `
      <h2>New Testimonial Submitted (Pending Verification)</h2>
      <p><strong>Name:</strong> ${input.name}</p>
      <p><strong>Email:</strong> ${input.email}</p>
      <p><strong>Role:</strong> ${input.role}</p>
      <p><strong>Rating:</strong> ${input.rating} / 5</p>
      <p><strong>Content:</strong></p>
      <p>${input.content}</p>
      <p>Verification token: ${verificationToken}</p>
    `;
    await sendAdminNotificationEmail(admin, `New Testimonial (pending) - ${input.name}`, html);
  } catch (err) {
    console.error("Failed to send admin notification for testimonial:", err);
  }

  return {
    submissionId: localDocument.id,
    verificationToken,
  };
}

export async function verifyPendingTestimonial(input: {
  submissionId: string;
  token: string;
}) {
  const pending = await readLocalPendingTestimonials();
  const idx = pending.findIndex((p) => p.id === input.submissionId && p.verificationToken === input.token && new Date(p.verificationTokenExpiresAt) > new Date());
  if (idx === -1) {
    throw new Error("Invalid or expired verification link.");
  }

  const pendingRecord = pending[idx];
  const verifiedAt = new Date().toISOString();

  const publishedRecords = await readLocalPublishedTestimonials();
  const nextPublished: LocalTestimonialRecord = {
    id: crypto.randomUUID(),
    name: pendingRecord.name,
    email: pendingRecord.email,
    role: pendingRecord.role,
    content: pendingRecord.content,
    rating: pendingRecord.rating,
    image: pendingRecord.image,
    createdAt: pendingRecord.createdAt,
    verifiedAt,
  };

  await writeLocalPublishedTestimonials([nextPublished, ...publishedRecords]);
  const remaining = pending.filter((p) => p.id !== input.submissionId);
  await writeLocalPendingTestimonials(remaining);

  // notify admin
  try {
    const admin = process.env.ADMIN_EMAIL || "abhi.guptafr@gmail.com";
    const html = `
      <h2>Testimonial Verified & Published</h2>
      <p><strong>Name:</strong> ${nextPublished.name}</p>
      <p><strong>Email:</strong> ${nextPublished.email}</p>
      <p><strong>Role:</strong> ${nextPublished.role}</p>
      <p><strong>Rating:</strong> ${nextPublished.rating} / 5</p>
      <p><strong>Content:</strong></p>
      <p>${nextPublished.content}</p>
    `;
    await sendAdminNotificationEmail(admin, `Testimonial Published - ${nextPublished.name}`, html);
  } catch (err) {
    console.error("Failed to send admin publish notification:", err);
  }

  return {
    id: nextPublished.id,
    name: nextPublished.name,
    email: nextPublished.email,
    role: nextPublished.role,
    content: nextPublished.content,
    rating: nextPublished.rating,
    image: nextPublished.image,
    createdAt: nextPublished.createdAt,
    verifiedAt: nextPublished.verifiedAt,
  };
}
