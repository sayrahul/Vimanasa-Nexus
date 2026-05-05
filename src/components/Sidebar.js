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
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
          <Shield size={24} />
        </div>
        <span className="font-bold text-xl text-slate-800">Vimanasa</span>
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
