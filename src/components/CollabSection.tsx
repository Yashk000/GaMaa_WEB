import { motion, useInView, useReducedMotion } from "framer-motion";
import { Building2, Users, Trophy, Globe } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const stats = [
  { icon: Building2, value: 10, suffix: "+", label: "Companies Served" },
  { icon: Users, value: 80, suffix: "+", label: "Happy Clients" },
  { icon: Trophy, value: 103, suffix: "+", label: "Projects Delivered" },
  { icon: Globe, value: 3, suffix: "+", label: "Countries Reached" },
];

const defaultPartners = [
  { name: 'ATJVP Foundation', url: '' },
  { name: 'SRG Enterprises', url: '' },
  { name: 'Everantra', url: '' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const duration = 1200;
    const startTime = performance.now();
    let frameId: number | undefined;

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.round(target * progress));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animate);
      }
    };

    frameId = window.requestAnimationFrame(animate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isInView, prefersReducedMotion, target]);

  return (
    <div ref={ref} className="text-3xl font-bold text-foreground">
      {count}{suffix}
    </div>
  );
}

export default function CollabSection() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !isMobile && !prefersReducedMotion;
  const [partners, setPartners] = useState<any[]>(defaultPartners);

  const visiblePartners = shouldAnimate ? [...partners, ...partners, ...partners] : partners;

  return (
    <section className="section-padding bg-surface">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Trusted Partners</span>
          <h2 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Who We <span className="text-gradient">Collaborate</span> With
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Partnering with industry leaders to deliver exceptional results worldwide.
          </p>
        </motion.div>

        {/* Stats with animated counters */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, delay: i * 0.08, ease: "easeOut" }}
              className="rounded-2xl bg-gradient-card glow-border p-6 text-center"
            >
              <stat.icon className="mx-auto mb-3 text-primary" size={28} />
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Partner logos marquee */}
        <div className="overflow-hidden">
          <motion.div
            animate={shouldAnimate ? { x: [0, -900] } : { x: 0 }}
            transition={shouldAnimate ? { duration: 32, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            className="flex gap-12"
          >
            {visiblePartners.map((p, i) => (
              <a
                key={i}
                href={p?.url || '#'}
                target={p?.url ? '_blank' : '_self'}
                rel={p?.url ? 'noreferrer noopener' : undefined}
                className="flex-shrink-0 rounded-xl border border-border/50 bg-card/50 px-10 py-4 text-center transition-colors hover:border-primary/30"
              >
                <div className="text-lg font-semibold text-muted-foreground/60 transition-colors hover:text-primary">
                  {p.name}
                </div>
                {p?.url ? (
                  <div className="mt-1 text-xs text-primary/70 underline decoration-primary/40 underline-offset-4 break-all">
                    {p.url}
                  </div>
                ) : null}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
