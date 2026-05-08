import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().min(2).max(160),
  message: z.string().trim().min(5).max(2000),
});

export const submitContactSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSubmissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveContactSubmission } = await import("@/server/contact-submission-store");
    return saveContactSubmission(data);
  });
