import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Banknote, 
  Wallet, 
  ShieldCheck, 
  LogOut,
  RefreshCcw,
  Shield,
  Calendar,
  Clock,
  Receipt,
  Menu,
  X
} from 'lucide-react';
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Workforce', id: 'workforce' },
  { icon: Building2, label: 'Clients', id: 'clients' },
  { icon: Building2, label: 'Partners', id: 'partners' },
  { icon: Calendar, label: 'Attendance', id: 'attendance' },
  { icon: Clock, label: 'Leave', id: 'leave' },
  { icon: Receipt, label: 'Expenses', id: 'expenses' },
  { icon: Banknote, label: 'Payroll', id: 'payroll' },
  { icon: Wallet, label: 'Finance', id: 'finance' },
  { icon: ShieldCheck, label: 'Compliance', id: 'compliance' },
  { icon: Receipt, label: 'Invoices', id: 'invoices' },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout, onSync }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/vimanasa-logo.png" 
            alt="Vimanasa Services LLP" 
            className="h-8 w-auto"
          />
          <span className="font-bold text-slate-800 text-sm">Vimanasa Nexus</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo - Desktop Only */}
        <div className="hidden lg:block p-6 border-b border-slate-200">
          <div className="flex items-center justify-center">
            <div className="bg-white p-3 rounded-xl shadow-sm">
              <img 
                src="/vimanasa-logo.png" 
                alt="Vimanasa Services LLP" 
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>

        {/* Mobile Header Inside Sidebar */}
        <div className="lg:hidden p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/vimanasa-logo.png" 
              alt="Vimanasa Services LLP" 
              className="h-8 w-auto"
            />
            <span className="font-bold text-slate-800">Vimanasa Nexus</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                activeTab === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => {
              onSync();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <RefreshCcw size={18} />
            Sync Cloud
          </button>
          <button 
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
