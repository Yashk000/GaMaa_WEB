import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarIcon, Phone } from "lucide-react";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitConsultationSubmission } from "@/lib/consultation-submission";

const countryCodes = [
  { code: "+1", label: "US/CA" },
  { code: "+44", label: "UK" },
  { code: "+91", label: "IN" },
  { code: "+61", label: "AU" },
  { code: "+49", label: "DE" },
  { code: "+33", label: "FR" },
  { code: "+81", label: "JP" },
  { code: "+86", label: "CN" },
  { code: "+971", label: "UAE" },
  { code: "+65", label: "SG" },
  { code: "+55", label: "BR" },
  { code: "+27", label: "ZA" },
  { code: "+82", label: "KR" },
  { code: "+39", label: "IT" },
  { code: "+34", label: "ES" },
];

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  countryCode: z.string().min(1, "Select country code"),
  phone: z.string().trim().regex(/^\d{6,15}$/, "Enter a valid phone number (6-15 digits)"),
  meetingDate: z.date({ required_error: "Please select a meeting date" }),
  enquiry: z.string().trim().min(10, "Enquiry must be at least 10 characters").max(1000),
});

type FormData = z.infer<typeof formSchema>;

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConsultationModal({ isOpen, onClose }: ConsultationModalProps) {
  const [form, setForm] = useState<Partial<FormData>>({ countryCode: "+91" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const saveConsultationSubmission = useServerFn(submitConsultationSubmission);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const submissionResult = await saveConsultationSubmission({
        data: {
          name: result.data.name,
          email: result.data.email,
          countryCode: result.data.countryCode,
          phone: result.data.phone,
          meetingDate: result.data.meetingDate.toISOString(),
          enquiry: result.data.enquiry,
        },
      });

      if (submissionResult.deliveryStatus === "delivered") {
        toast.success("Consultation request submitted. Email notification sent.");
        setForm({ countryCode: "+91" });
        onClose();
      } else {
        toast.error("Request saved, but email could not be sent right now.");
      }
    } catch {
      toast.error("Unable to submit consultation request right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Free Consultation</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-foreground">Email Address *</label>
                <input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Phone with country code */}
              <div>
                <label className="text-sm font-medium text-foreground">Contact Number *</label>
                <div className="mt-1 flex gap-2">
                  <select
                    value={form.countryCode || "+91"}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className="w-28 rounded-lg border border-border bg-background px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder="9876543210"
                    className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                {(errors.countryCode || errors.phone) && (
                  <p className="mt-1 text-xs text-destructive">{errors.countryCode || errors.phone}</p>
                )}
              </div>

              {/* Meeting Date */}
              <div>
                <label className="text-sm font-medium text-foreground">Preferred Meeting Date *</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "mt-1 w-full flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary/50",
                        !form.meetingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon size={16} />
                      {form.meetingDate ? format(form.meetingDate, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[110]" align="start">
                    <Calendar
                      mode="single"
                      selected={form.meetingDate}
                      onSelect={(date) => setForm({ ...form, meetingDate: date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {errors.meetingDate && <p className="mt-1 text-xs text-destructive">{errors.meetingDate}</p>}
              </div>

              {/* Enquiry */}
              <div>
                <label className="text-sm font-medium text-foreground">Your Enquiry *</label>
                <textarea
                  value={form.enquiry || ""}
                  onChange={(e) => setForm({ ...form, enquiry: e.target.value })}
                  placeholder="Tell us about your project or requirement..."
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {errors.enquiry && <p className="mt-1 text-xs text-destructive">{errors.enquiry}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Book Free Consultation"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
