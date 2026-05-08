import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const testimonialInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  role: z.string().trim().min(2).max(100),
  content: z.string().trim().min(5).max(500),
  rating: z.number().int().min(1).max(5),
});

const testimonialVerificationSchema = z.object({
  submissionId: z.string().trim().min(1),
  token: z.string().trim().min(1),
});

export const getStoredTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { readStoredTestimonials } = await import("@/server/testimonial-store");
  return readStoredTestimonials();
});

export const submitTestimonialForVerification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => testimonialInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { createPendingTestimonial } = await import("@/server/testimonial-store");
    const { sendVerificationEmail } = await import("@/server/email-service");

    const { submissionId, verificationToken } = await createPendingTestimonial(data);
    await sendVerificationEmail(data.email, data.name, submissionId, verificationToken);

    return { ok: true };
  });

export const verifyStoredTestimonial = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => testimonialVerificationSchema.parse(data))
  .handler(async ({ data }) => {
    const { verifyPendingTestimonial } = await import("@/server/testimonial-store");
    const { sendAdminNotificationEmail } = await import("@/server/email-service");

    const published = await verifyPendingTestimonial(data);

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      await sendAdminNotificationEmail(adminEmail, {
        name: published.name,
        email: published.email,
        role: published.role,
        content: published.content,
        rating: published.rating,
      });
    }

    return { ok: true };
  });
