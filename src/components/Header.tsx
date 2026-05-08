import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ConsultationModal from "@/components/ConsultationModal";
import logo from "@/assets/logo.png";

const navLinks = [
  { to: "/", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact Us" },
  { to: "/blog", label: "Blog" },
] as const;

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  const handleHashClick = (href: string) => {
    // If not on home page, navigate to home first then scroll
    if (location.pathname !== "/") {
      window.location.href = "/" + href;
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="h-11 w-11 overflow-hidden rounded-lg"
            >
              <img
                src={logo}
                alt="GaMaaTech"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <motion.span
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="text-2xl font-extrabold text-gradient"
            >
              GaMaaTech
            </motion.span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) =>
              "to" in link ? (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`text-base font-bold transition-colors hover:text-primary ${
                    location.pathname === link.to
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => handleHashClick(link.href)}
                  className="text-base font-bold text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </a>
              )
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-primary px-6 py-3 text-base font-bold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Get Started
            </button>
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-foreground md:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/50 bg-background/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                {navLinks.map((link) =>
                  "to" in link ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-bold text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => {
                        setMobileOpen(false);
                        handleHashClick(link.href);
                      }}
                      className="text-base font-bold text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  )
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setModalOpen(true);
                  }}
                  className="rounded-lg bg-primary px-6 py-3 text-center text-base font-bold text-primary-foreground"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ConsultationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
