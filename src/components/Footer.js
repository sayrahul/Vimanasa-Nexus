"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const FOOTER_LINKS = {
  company: [
    { label: "About Us", href: "https://vimanasa.com/about" },
    { label: "Services", href: "https://vimanasa.com/services" },
    { label: "Portfolio", href: "https://vimanasa.com/portfolio" },
    { label: "Careers", href: "/jobs" },
    { label: "Contact", href: "https://vimanasa.com/contact" },
  ],
  resources: [
    { label: "Blog", href: "https://vimanasa.com/blog" },
    { label: "Pricing", href: "https://vimanasa.com/pricing" },
    { label: "Tenders", href: "https://vimanasa.com/tenders" },
    { label: "Privacy Policy", href: "https://vimanasa.com/privacy-policy" },
    { label: "Terms & Conditions", href: "https://vimanasa.com/terms-and-conditions" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card/40 mt-auto">
      <div className="container mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-3 shadow-sm">
              <Image 
                src="/vimanasa-logo.png" 
                alt="Vimanasa Services" 
                width={150} 
                height={48} 
                className="h-10 w-auto object-contain" 
              />
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground font-medium">
              Vimanasa Services helps organizations scale with reliable manpower outsourcing, telecom execution, and digital technology services.
            </p>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground font-medium">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-primary" /> 
                Corporate: Chhatrapati Sambhajinagar, MH
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="shrink-0 text-primary" /> 
                +91 9921713207
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="shrink-0 text-primary" /> 
                vimanasaservices@gmail.com
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Resources</h3>
            <ul className="mt-4 space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <p>© {currentYear} Vimanasa Services LLP. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
