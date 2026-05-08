import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Globe, Smartphone, Cog, Brain, Wrench, ArrowRight } from "lucide-react";
import ConsultationModal from "@/components/ConsultationModal";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  {
    icon: Monitor,
    title: "IT Solutions",
    short: "Enterprise-grade infrastructure & support",
    description:
      "Complete IT infrastructure management, cloud migration, network security, and 24/7 technical support tailored for modern businesses.",
  },
  {
    icon: Globe,
    title: "Website Development",
    short: "Stunning, high-performance web experiences",
    description:
      "Custom websites built with cutting edge frameworks. From landing pages to complex web applications  responsive, fast, and SEO optimized.",
  },
  {
    icon: Smartphone,
    title: "App Development",
    short: "Native & cross-platform mobile apps",
    description:
      "iOS, Android, and cross platform applications designed for performance and user delight. From concept to App Store launch.",
  },
  {
    icon: Cog,
    title: "Automation",
    short: "Streamline operations & reduce costs",
    description:
      "Workflow automation, process optimization, and system integration to eliminate manual tasks and boost operational efficiency.",
  },
  {
    icon: Brain,
    title: "AI Automation",
    short: "Intelligent systems that learn & adapt",
    description:
      "Machine learning models, AI chatbots, predictive analytics, and intelligent process automation to give your business a competitive edge.",
  },
  {
    icon: Wrench,
    title: "Troubleshoot & Support",
    short: "On-demand expert issue resolution",
    description:
      "Facing technical issues? Hire our experts on a per issue basis. We diagnose and fix bugs, server issues, performance bottlenecks, and more fast.",
  },
];

export default function ServicesSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="services" className="relative overflow-hidden section-padding bg-gradient-hero">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(${heroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.65 0.18 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.65 0.18 240) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          <div className="absolute left-[8%] top-[18%] h-80 w-80 rounded-full bg-primary/12 blur-[140px]" />
          <div className="absolute bottom-[8%] right-[10%] h-96 w-96 rounded-full bg-accent/10 blur-[160px]" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">What We Do</span>
            <h2 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
              Our <span className="text-gradient">Services</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              End-to-end technology solutions designed to accelerate your digital transformation.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.04, y: -5 }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-card glow-border p-8 transition-all duration-300 hover:border-primary/50"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <service.icon size={28} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.short}</p>

                  <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">
                    <p className="text-sm leading-relaxed text-surface-foreground">{service.description}</p>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-glow"
                    >
                      Free Consultation <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
