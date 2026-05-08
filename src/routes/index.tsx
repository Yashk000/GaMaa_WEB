import { createFileRoute } from "@tanstack/react-router";
import HeroSection from "@/components/HeroSection";
import CollabSection from "@/components/CollabSection";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GaMaa Tech — Building the Future of Digital Innovation" },
      { name: "description", content: "GaMaa Tech delivers cutting-edge IT solutions, web & app development, automation, and AI-powered services to transform your business." },
      { property: "og:title", content: "GaMaa Tech — Building the Future of Digital Innovation" },
      { property: "og:description", content: "IT solutions, web & app development, automation, and AI services." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <CollabSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
