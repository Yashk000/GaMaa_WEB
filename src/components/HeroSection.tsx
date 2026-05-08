import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  Code2,
  Globe,
  Handshake,
  Monitor,
  
  Workflow,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import heroBg from "@/assets/hero-bg.jpg";

const featureTags = [
  { label: "Enterprise IT Solutions", icon: Monitor },
  { label: "High Performance Development", icon: Globe },
  { label: "AI Powered Automation", icon: BrainCircuit },
  { label: "Contract Hire", icon: Handshake },
];

const heroSlides = [
  {
    kicker: "Automate • Optimize • Cut Costs",
    title: "Turning Vision Into",
    highlight: "Intelligent Digital Solutions",
    description:
      "Unlock growth with tailored IT services, seamless web & mobile development, and smart automation that drives efficiency.",
    media: [
      {
        src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
        alt: "Automation workflow",
      },
      {
        src: "https://images.pexels.com/photos/4974915/pexels-photo-4974915.jpeg",
        alt: "Streamlined engineering process",
      },
      {
        src: "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg",
        alt: "Cost reduction strategy",
      },
    ],
    accent: "Automation & IT",
    icon: Cloud,
  },
  {
    kicker: "Innovate • Engineer • Launch",
    title: "Next-Gen Web",
    highlight: "Development Platforms",
    description:
      "Build scalable, lightning-fast web experiences with clean design, modular architecture, and future-ready engineering.",
    media: [
      {
        src: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg",
        alt: "Developer coding in modern workspace",
      },
      {
        src: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg",
        alt: "Laptop showcasing web project",
      },
      {
        src: "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg",
        alt: "Team reviewing web systems",
      },
    ],
    accent: "Web Build",
    icon: Code2,
  },
  {
    kicker: "Plan • Execute • Scale",
    title: "Smart Software",
    highlight: "Management Simplified",
    description:
      "Streamline product lifecycles with agile planning, milestone tracking, and reliable release management for teams.",
    media: [
      {
        src: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg",
        alt: "Agile planning board",
      },
      {
        src: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
        alt: "Team reviewing delivery roadmap",
      },
      {
        src: "https://images.pexels.com/photos/3862394/pexels-photo-3862394.jpeg",
        alt: "Digital product roadmap",
      },
    ],
    accent: "Software Management",
    icon: Workflow,
  },
  {
    kicker: "Cloud • Secure • Scalable",
    title: "Smarter Cloud",
    highlight: "Operations at Scale",
    description:
      "Simplify infrastructure, hosting, and workflows with secure, connected, and cloud-native systems built for growth.",
    media: [
      {
        src: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
        alt: "Cloud architecture visualization",
      },
      {
        src: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg",
        alt: "Engineer managing cloud servers",
      },
      {
        src: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg",
        alt: "Data center operations",
      },
    ],
    accent: "Cloud Systems",
    icon: Cloud,
  },
  {
    kicker: "Design • Align • Deliver",
    title: "High-Performance",
    highlight: "Product Teams in Sync",
    description:
      "Accelerate digital product success with unified strategy, design, engineering, and launch support — all in one flow.",
    media: [
      {
        src: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
        alt: "Team discussing launch priorities",
      },
      {
        src: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg",
        alt: "Roadmap collaboration session",
      },
      {
        src: "https://images.pexels.com/photos/267507/pexels-photo-267507.jpeg",
        alt: "Product delivery presentation",
      },
    ],
    accent: "Product Delivery",
    icon: Workflow,
  },
] as const;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !isMobile && !prefersReducedMotion;

  // auto-advance with direction and reset when user interacts
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer() {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrent((previous) => (previous + 1) % heroSlides.length);
    }, 8000);
  }

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  const currentSlide = heroSlides[current];
  const SlideIcon = currentSlide.icon;
  const [primaryMedia, secondaryMedia, tertiaryMedia] = currentSlide.media;

  // helper to programmatically change slide and set direction
  function goTo(index: number) {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
    startTimer();
  }

  function next() {
    setDirection(1);
    setCurrent((c) => (c + 1) % heroSlides.length);
    startTimer();
  }

  function prev() {
    setDirection(-1);
    setCurrent((c) => (c - 1 + heroSlides.length) % heroSlides.length);
    startTimer();
  }

  return (
    <section className="relative overflow-hidden bg-gradient-hero pb-8 pt-24 md:pb-10 md:pt-28 lg:pt-36">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          animate={shouldAnimate ? { scale: [1, 1.01, 1] } : { scale: 1 }}
          transition={shouldAnimate ? { duration: 28, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
        <motion.div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.65 0.18 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.65 0.18 240) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
          animate={shouldAnimate ? { opacity: [0.05, 0.065, 0.05] } : { opacity: 0.05 }}
          transition={shouldAnimate ? { duration: 18, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
        <motion.div
          className="absolute left-[10%] top-[24%] h-96 w-96 rounded-full bg-primary/15 blur-[140px]"
          animate={shouldAnimate ? { x: [0, 8, 0], y: [0, -10, 0] } : { x: 0, y: 0 }}
          transition={shouldAnimate ? { duration: 22, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
        <motion.div
          className="absolute bottom-[12%] right-[12%] h-96 w-96 rounded-full bg-accent/10 blur-[150px]"
          animate={shouldAnimate ? { x: [0, -8, 0], y: [0, 10, 0] } : { x: 0, y: 0 }}
          transition={shouldAnimate ? { duration: 24, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* kicker removed to tighten layout */}

        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-${current}`}
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.995 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="grid items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-5xl font-extrabold leading-[0.98] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.2rem]">
                <span className="text-foreground">{currentSlide.title}</span>
                <br />
                <span className="text-gradient glow-text">{currentSlide.highlight}</span>
              </h1>

              <p className="mx-auto mt-7 max-w-2xl text-xl leading-relaxed text-muted-foreground lg:mx-0">
                {currentSlide.description}
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <a
                  href="#services"
                  className="group flex items-center gap-2 rounded-2xl bg-primary px-10 py-4 text-lg font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/35"
                >
                  Explore Services
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </a>
                <button
                  onClick={() => {
                    const target = document.getElementById('contact');
                    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="rounded-2xl border border-border bg-background/20 px-10 py-4 text-lg font-bold text-foreground transition-all hover:border-primary/50 hover:bg-primary/5"
                >
                  Contact Us
                </button>
              </div>
            </div>

            <div className="relative mx-auto h-[380px] w-full max-w-[540px] sm:h-[430px] md:h-[480px]">
              <div className="absolute inset-0">
                <div className="absolute right-1 top-0 h-[42%] w-[48%] overflow-hidden rounded-3xl border border-primary/45 shadow-[0_0_35px_oklch(0.65_0.18_240_/_0.35)] bg-muted-foreground/5">
                  <img loading="eager" decoding="async" src={primaryMedia.src} alt={primaryMedia.alt} className="h-full w-full object-cover" />
                </div>
                <div className="absolute bottom-[24%] left-0 h-[42%] w-[56%] overflow-hidden rounded-3xl border border-primary/45 shadow-[0_0_35px_oklch(0.65_0.18_240_/_0.35)] bg-muted-foreground/5">
                  <img loading="eager" decoding="async" src={secondaryMedia.src} alt={secondaryMedia.alt} className="h-full w-full object-cover" />
                </div>
                <div className="absolute bottom-0 right-8 h-[36%] w-[44%] overflow-hidden rounded-3xl border border-primary/45 shadow-[0_0_35px_oklch(0.65_0.18_240_/_0.35)] bg-muted-foreground/5">
                  <img loading="eager" decoding="async" src={tertiaryMedia.src} alt={tertiaryMedia.alt} className="h-full w-full object-cover" />
                </div>

                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
                  <SlideIcon size={14} />
                  {currentSlide.accent}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.22, ease: "easeOut" }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="h-8 w-8 rounded-full bg-background/10 text-primary/80 hover:bg-background/20"
          >
            ‹
          </button>
          {heroSlides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => goTo(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === current ? 'w-10 bg-primary shadow-[0_0_18px_oklch(0.65_0.18_240_/_0.5)]' : 'w-3 bg-primary/35 hover:bg-primary/60'
              }`}
            />
          ))}
          <button
            onClick={next}
            aria-label="Next slide"
            className="h-8 w-8 rounded-full bg-background/10 text-primary/80 hover:bg-background/20"
          >
            ›
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: "easeOut" }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-background/35 px-4 py-4 backdrop-blur-sm md:gap-6 md:px-8"
        >
          {featureTags.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                className="inline-flex items-center gap-3 rounded-xl px-2 py-1 text-lg text-foreground/95"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.span
                  className="rounded-md bg-primary/15 p-2 text-primary"
                  animate={shouldAnimate ? { rotate: [0, 4, 0] } : { rotate: 0 }}
                  transition={shouldAnimate ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
                >
                  <Icon size={16} />
                </motion.span>
                <span className="font-medium">{item.label}</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
