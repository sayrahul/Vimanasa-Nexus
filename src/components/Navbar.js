"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Home, User, Briefcase, LayoutGrid, Sparkles, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Home", href: "https://vimanasa.com/", icon: Home },
  { name: "About Us", href: "https://vimanasa.com/about", icon: User },
  { name: "Services", href: "https://vimanasa.com/services", icon: LayoutGrid },
  { name: "Portfolio", href: "https://vimanasa.com/portfolio", icon: Sparkles },
  { name: "Jobs", href: "https://vimanasa.com/jobs", icon: Briefcase },
  { name: "Contact", href: "https://vimanasa.com/contact", icon: PhoneCall },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 flex justify-center px-4 md:px-8 pointer-events-none",
          isScrolled ? "py-2 md:py-4" : "py-4 md:py-6"
        )}
      >
        <div
          className={cn(
            "w-full max-w-6xl transition-all duration-700 rounded-2xl md:rounded-full flex items-center justify-between px-6 py-3 pointer-events-auto",
            isOpen
              ? "bg-white shadow-xl border-border"
              : isScrolled
                ? "bg-background/80 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-border"
                : "bg-background shadow-lg border border-border/50"
          )}
        >
          <Link href="/" className="relative flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative z-10">
                <Image
                  src="/vimanasa-logo.png"
                  alt="Vimanasa Services"
                  width={180}
                  height={48}
                  className="h-10 w-auto object-contain md:h-12"
                />
              </motion.div>
            </div>
          </Link>

          <div className="flex md:hidden items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-muted border border-border text-foreground shadow-sm"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-full p-1.5 border border-border mr-4 shadow-inner">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "relative px-4 lg:px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 z-10 select-none whitespace-nowrap",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="relative z-20">{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-full bg-card shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-foreground/5 -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link href="/apply" className="relative group">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold shadow-xl overflow-hidden whitespace-nowrap"
                >
                  <span className="relative z-10">Join Us</span>
                </motion.div>
              </Link>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-24 z-[90] md:hidden bg-white rounded-3xl p-6 shadow-2xl border border-border"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-colors",
                    pathname === link.href ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  )}
                >
                  <link.icon size={20} />
                  <span className="font-bold">{link.name}</span>
                </Link>
              ))}
              <hr className="border-border" />
              <Link
                href="/apply"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 text-white font-bold"
              >
                Join Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
