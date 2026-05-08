import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getMongoDb } from "./mongodb";

export type ConsultationSubmission = {
  id: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  meetingDate: string;
  enquiry: string;
  createdAt: Date;
};

type ConsultationInput = Omit<ConsultationSubmission, "id" | "createdAt">;

const storeFilePath = () => path.join(process.cwd(), ".data", "consultation-submissions.json");

async function ensureStoreDirectory() {
  await mkdir(path.dirname(storeFilePath()), { recursive: true });
}

async function readStoredConsultationSubmissions() {
  try {
    const raw = await readFile(storeFilePath(), "utf8");
    const parsed = JSON.parse(raw) as ConsultationSubmission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function saveConsultationSubmissionToLocalStore(submission: ConsultationSubmission) {
  await ensureStoreDirectory();
  const existing = await readStoredConsultationSubmissions();
  await writeFile(storeFilePath(), JSON.stringify([submission, ...existing], null, 2), "utf8");
}

export async function saveConsultationSubmission(input: ConsultationInput) {
  try {
    const db = await getMongoDb();
    
    const submission: Omit<ConsultationSubmission, "id"> = {
      ...input,
      createdAt: new Date(),
    };

    const result = await db.collection("consultation_submissions").insertOne(submission as any);

    try {
      await saveConsultationSubmissionToLocalStore({
        id: result.insertedId.toString(),
        ...submission,
      });
    } catch {
      // Local persistence is best-effort.
    }

    return {
      success: true,
      id: result.insertedId.toString(),
      submission: {
        id: result.insertedId.toString(),
        ...submission,
      },
    };
  } catch (error) {
    console.error("Error saving consultation submission:", error);

    try {
      const submission: ConsultationSubmission = {
        id: crypto.randomUUID(),
        ...input,
        createdAt: new Date(),
      };

      await saveConsultationSubmissionToLocalStore(submission);

      return {
        success: true,
        id: submission.id,
        submission,
        storage: "local",
      };
    } catch {
      return {
        success: false,
        error: "Failed to save consultation submission",
      };
    }
  }
}

export async function getConsultationSubmissions(page: number = 1, limit: number = 10) {
  try {
    const db = await getMongoDb();
    
    const skip = (page - 1) * limit;
    const total = await db.collection("consultation_submissions").countDocuments();
    
    const submissions = await db
      .collection("consultation_submissions")
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      success: true,
      submissions: submissions.map((s) => ({
        ...s,
        _id: s._id.toString(),
      })),
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching consultation submissions:", error);

    const stored = await readStoredConsultationSubmissions();
    const start = (page - 1) * limit;
    const paged = stored.slice(start, start + limit);

    return {
      success: true,
      submissions: paged.map((submission) => ({
        ...submission,
        _id: submission.id,
        createdAt: submission.createdAt.toISOString(),
      })),
      total: stored.length,
      pages: Math.ceil(stored.length / limit),
      storage: "local",
    };
  }
}

export { readStoredConsultationSubmissions };
