import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { verifyStoredTestimonial } from "@/lib/testimonial-feedback";

export const Route = createFileRoute("/verify-testimonial")({
  validateSearch: z.object({
    id: z.string().trim().min(1),
    token: z.string().trim().min(1),
  }),
  component: VerifyTestimonialPage,
});

function VerifyTestimonialPage() {
  const { id, token } = Route.useSearch();
  const verifyServer = useServerFn(verifyStoredTestimonial);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function verify() {
      try {
        await verifyServer({ data: { submissionId: id, token } });
        setStatus("success");
        setMessage("Your testimonial has been verified and published! Thank you for your feedback.");
      } catch (error) {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed. Please try again.");
      }
    }

    verify();
  }, [id, token, verifyServer]);

  return (
    <div className="min-h-screen pt-24 bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-border/50 bg-card p-8 text-center">
        {status === "loading" && (
          <>
            <Loader className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Verifying Testimonial...</h1>
            <p className="mt-2 text-muted-foreground">Please wait while we verify your email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h1 className="text-2xl font-bold text-foreground">Verification Successful!</h1>
            <p className="mt-4 text-muted-foreground">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
            <p className="mt-4 text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
