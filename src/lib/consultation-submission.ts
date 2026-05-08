import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const consultationSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  countryCode: z.string().trim().min(1).max(8),
  phone: z.string().trim().regex(/^\d{6,15}$/),
  meetingDate: z.string().trim().min(4).max(64),
  enquiry: z.string().trim().min(10).max(1000),
});

export const submitConsultationSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => consultationSubmissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { saveConsultationSubmission } = await import("@/server/consultation-submission-store");

    return saveConsultationSubmission({
      name: data.name,
      email: data.email,
      countryCode: data.countryCode,
      phone: data.phone,
      meetingDate: data.meetingDate,
      enquiry: data.enquiry,
    });
  });
