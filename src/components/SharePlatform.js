"use client";
import React, { useState } from 'react';
import { Share2, Linkedin, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SharePlatform() {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = "https://nexus.vimanasa.com";
  const shareText = "Check out Vimanasa Nexus - The Advanced Workforce & Payroll Management Platform!";

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: 'LinkedIn',
      icon: <Linkedin size={18} className="text-[#0A66C2]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Twitter',
      icon: <Twitter size={18} className="text-[#1DA1F2]" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={18} className="text-[#25D366]" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
      >
        <Share2 size={18} className="text-blue-600" />
        <span className="hidden sm:inline">Share Platform</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
            <div className="p-3 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Share with others</p>
            </div>
            <div className="p-2 space-y-1">
              {shareLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    {link.icon}
                  </div>
                  {link.name}
                </a>
              ))}
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} className="text-slate-600" />}
                </div>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
