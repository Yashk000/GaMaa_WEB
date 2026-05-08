import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Send, Star, X, AlertCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getStoredTestimonials, submitTestimonialForVerification } from "@/lib/testimonial-feedback";
import { useIsMobile } from "@/hooks/use-mobile";

type Testimonial = {
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    name: "ATJVP Foundation",
    role: "Director, Rabindra Gupta",
    content:
      "Their website development service is top-notch. Our conversion rate increased by 65% after the redesign. Highly recommend their expertise",
    rating: 5,
    image: "RG",
  },
  {
    name: "SRG Enterprises",
    role: "Founder",
    content:
      "GaMaa Tech Setup my end to end to end ecommerce store and it was a game changer for my business. The team was responsive, knowledgeable, and delivered a seamless shopping experience for my customers.",
    rating: 5,
    image: "SR",
  },
  {
    name: "Everantra",
    role: "Founder",
    content:
      "Working with GaMaa Tech felt like having an in-house team. Their attention to detail and proactive communication made the entire process seamless.",
    rating: 5,
    image: "EV",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

function RatingSelector({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const value = i + 1;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            className="rounded-md p-1 transition-transform hover:scale-110"
            aria-label={`${value} star${value > 1 ? "s" : ""}`}
          >
            <Star
              size={20}
              className={value <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function TestimonialsSection() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !isMobile && !prefersReducedMotion;

  const floatingVariants = shouldAnimate
    ? {
        float1: {
          y: [0, -12, 0],
          rotate: [-1, 1, -1],
          transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const },
        },
        float2: {
          y: [0, -8, 0],
          rotate: [1, -1, 1],
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay: 1 },
        },
        float3: {
          y: [0, -15, 0],
          rotate: [-0.5, 0.5, -0.5],
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" as const, delay: 2 },
        },
      }
    : {
        float1: { y: 0, rotate: 0 },
        float2: { y: 0, rotate: 0 },
        float3: { y: 0, rotate: 0 },
      };

  const [savedTestimonials, setSavedTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [formError, setFormError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [loadingSaved, setLoadingSaved] = useState(true);
  const successTimerRef = useRef<number | null>(null);

  const loadStoredTestimonials = useServerFn(getStoredTestimonials);
  const submitForVerification = useServerFn(submitTestimonialForVerification);

  const allTestimonials = [...savedTestimonials, ...testimonials];

  useEffect(() => {
    let mounted = true;

    const loadTestimonials = async () => {
      try {
        const stored = await loadStoredTestimonials();
        if (mounted) {
          setSavedTestimonials(stored);
        }
      } finally {
        if (mounted) {
          setLoadingSaved(false);
        }
      }
    };

    loadTestimonials();

    return () => {
      mounted = false;
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, [loadStoredTestimonials]);

  const getByOffset = (offset: number) => {
    const length = allTestimonials.length;
    return allTestimonials[(activeIndex + offset + length) % length];
  };

  const next = () => setActiveIndex((prev) => (prev + 1) % allTestimonials.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + allTestimonials.length) % allTestimonials.length);

  const closeForm = () => {
    setShowForm(false);
    setFormSubmitted(false);
    setFormError("");
    setSubmitMessage("");
    setName("");
    setEmail("");
    setRole("");
    setContent("");
    setRating(5);
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    setSubmitMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedRole = role.trim();
    const trimmedContent = content.trim();

    if (!trimmedName || !trimmedEmail || !trimmedRole || trimmedContent.length < 5) {
      setFormError("Please fill all fields. Testimonial must be at least 5 characters.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      await submitForVerification({
        data: {
          name: trimmedName,
          email: trimmedEmail,
          role: trimmedRole,
          content: trimmedContent,
          rating,
        },
      });

      setFormSubmitted(true);
      setSubmitMessage(
        "Thank you! A verification email has been sent to your email address. Please verify to publish your testimonial."
      );

      successTimerRef.current = window.setTimeout(() => {
        closeForm();
      }, 5000);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to submit testimonial. Please try again."
      );
    }
  };

  return (
    <section className="section-padding bg-surface relative overflow-hidden">
      <motion.div
        animate="float1"
        variants={floatingVariants}
        className="absolute top-20 -left-10 h-48 w-72 rounded-2xl bg-primary/5 border border-primary/10 blur-[1px] opacity-40 hidden lg:block"
      />
      <motion.div
        animate="float2"
        variants={floatingVariants}
        className="absolute bottom-32 -right-8 h-40 w-64 rounded-2xl bg-accent/5 border border-accent/10 blur-[1px] opacity-40 hidden lg:block"
      />
      <motion.div
        animate="float3"
        variants={floatingVariants}
        className="absolute top-1/2 right-20 h-32 w-52 rounded-2xl bg-glow/5 border border-glow/10 blur-[1px] opacity-30 hidden lg:block"
      />

      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Testimonials</span>
          <h2 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            What Our <span className="text-gradient">Clients</span> Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Don't just take our word for it — hear from the businesses we've helped transform.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-5 items-center mb-12">
          <div className="hidden lg:flex flex-col gap-4">
            {[getByOffset(3), getByOffset(4)].map((t, i) => (
              <motion.div
                key={`${t.name}-${i}`}
                animate={i === 0 ? "float1" : "float2"}
                variants={floatingVariants}
                className="rounded-xl bg-gradient-card glow-border p-4 opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => setActiveIndex(allTestimonials.indexOf(t))}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {t.image}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="rounded-2xl bg-gradient-card glow-border p-8 md:p-10 relative"
              >
                <Quote className="absolute top-6 right-6 text-primary/15" size={48} />
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                    {allTestimonials[activeIndex].image}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-lg">{allTestimonials[activeIndex].name}</h4>
                    <p className="text-sm text-muted-foreground">{allTestimonials[activeIndex].role}</p>
                  </div>
                </div>
                <StarRating rating={allTestimonials[activeIndex].rating} />
                <p className="mt-4 text-surface-foreground leading-relaxed text-base md:text-lg">
                  "{allTestimonials[activeIndex].content}"
                </p>
                {loadingSaved ? <p className="mt-3 text-xs text-muted-foreground">Loading saved feedback...</p> : null}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prev}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-2">
                {allTestimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="hidden lg:flex flex-col gap-4">
            {[getByOffset(1), getByOffset(2)].map((t, i) => (
              <motion.div
                key={`${t.name}-${i}`}
                animate={i === 0 ? "float2" : "float3"}
                variants={floatingVariants}
                className="rounded-xl bg-gradient-card glow-border p-4 opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
                onClick={() => setActiveIndex(allTestimonials.indexOf(t))}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {t.image}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <button
            onClick={() => {
              setShowForm(true);
              setFormSubmitted(false);
              setFormError("");
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25"
          >
            <Star size={16} />
            Share Your Experience
          </button>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
            onClick={closeForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-gradient-card glow-border p-8 relative"
            >
              <button
                onClick={closeForm}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>

              {formSubmitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Star size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Thank you!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {submitMessage}
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-1">Share Your Experience</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tell us how GaMaa Tech helped your business.</p>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="text"
                      placeholder="Your Role & Company"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div>
                      <p className="mb-2 text-sm font-semibold text-foreground">Your Rating</p>
                      <RatingSelector rating={rating} onChange={setRating} />
                    </div>
                    <textarea
                      placeholder="Your testimonial..."
                      rows={4}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      className="resize-none rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    {formError ? (
                      <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/30 p-3">
                        <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-destructive">{formError}</p>
                      </div>
                    ) : null}
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/30"
                    >
                      <Send size={16} />
                      Submit Testimonial
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
