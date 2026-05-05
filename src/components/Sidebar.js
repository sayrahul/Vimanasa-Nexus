import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Banknote, 
  Wallet, 
  ShieldCheck, 
  MessageSquare,
  LogOut,
  RefreshCcw,
  Shield
} from 'lucide-react';
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
  { icon: Users, label: 'Workforce', id: 'workforce' },
  { icon: Building2, label: 'Partners', id: 'partners' },
  { icon: Banknote, label: 'Payroll', id: 'payroll' },
  { icon: Wallet, label: 'Finance', id: 'finance' },
  { icon: ShieldCheck, label: 'Compliance', id: 'compliance' },
  { icon: MessageSquare, label: 'AI Assistant', id: 'ai' },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout, onSync }) {
  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          {/* Vimanasa Logo */}
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 100 100" className="flex-shrink-0">
              <path d="M 10 10 L 35 90 L 45 90 L 70 10 Z" fill="#2563eb"/>
              <path d="M 45 10 L 70 90 L 80 90 L 105 10 Z" fill="#06b6d4"/>
            </svg>
            <div>
              <span className="font-black text-lg text-slate-800 leading-none block">VIMANASA</span>
              <span className="text-[10px] text-slate-500 font-semibold leading-none">SERVICES LLP</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
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
          onClick={onSync}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <RefreshCcw size={18} />
          Sync Cloud
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
