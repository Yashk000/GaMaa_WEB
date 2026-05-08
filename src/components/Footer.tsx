import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src={logo}
                alt="GaMaaTech"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <span className="text-lg font-bold text-gradient">GaMaa Tech</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your Environment Our Solution Your Idea Our Build Your Success Our Priority.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              <a href="#services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Services</a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Info</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>contact@gamaatech.com</span>
              <span>+91 92350 55080</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GaMaa Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
