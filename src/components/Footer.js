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
    <footer className="bg-white border-t border-slate-100 antialiased">
      <div className="container mx-auto max-w-7xl px-12 py-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
                <img src="/vimanasa-logo.png" alt="Vimanasa" className="h-6 w-auto invert" />
              </div>
              <h2 className="text-xl font-black tracking-[-0.05em] text-black uppercase">Vimanasa.</h2>
            </div>
            
            <p className="max-w-md text-slate-400 font-medium text-sm leading-relaxed tracking-tight">
              A global enterprise infrastructure partner specializing in manpower outsourcing, telecom execution, and high-performance digital technology services.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { icon: MapPin, text: 'Chhatrapati Sambhajinagar, MH' },
                { icon: Phone, text: '+91 9921713207' },
                { icon: Mail, text: 'systems@vimanasa.com' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-400 group cursor-pointer hover:text-black transition-colors">
                  <item.icon size={16} strokeWidth={2.5} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:col-span-2 gap-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-8">Corporate</h3>
              <ul className="space-y-4">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors uppercase tracking-widest">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black mb-8">Resources</h3>
              <ul className="space-y-4">
                {FOOTER_LINKS.resources.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[11px] font-bold text-slate-400 hover:text-black transition-colors uppercase tracking-widest">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                © {currentYear} Vimanasa Global Nexus Registry
              </p>
           </div>
           <div className="flex gap-10">
             {['Privacy', 'Terms', 'Security'].map(label => (
               <Link key={label} href={`/${label.toLowerCase()}`} className="text-[9px] font-black text-slate-300 hover:text-black uppercase tracking-[0.5em] transition-colors">
                 {label}
               </Link>
             ))}
           </div>
        </div>
      </div>
    </footer>
  );
}
