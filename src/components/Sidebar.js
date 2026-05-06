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

export default function Sidebar({ activeTab, setActiveTab, onLogout, onSync, lastSyncTime, isSyncing, autoSyncEnabled, onToggleAutoSync }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatSyncTime = (time) => {
    if (!time) return 'Never';
    const now = new Date();
    const diff = Math.floor((now - time) / 1000); // seconds
    
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return time.toLocaleTimeString();
  };

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

        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Sync Status */}
          <div className="px-4 py-2 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-600">Sync Status</span>
              {isSyncing && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-600">Syncing...</span>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Last: {formatSyncTime(lastSyncTime)}
            </div>
          </div>

          {/* Auto-Sync Toggle */}
          <button
            onClick={() => {
              onToggleAutoSync();
              setIsMobileMenuOpen(false);
            }}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              autoSyncEnabled
                ? "bg-green-50 text-green-600 hover:bg-green-100"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                autoSyncEnabled ? "bg-green-500" : "bg-slate-300"
              )}>
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                  autoSyncEnabled ? "right-1" : "left-1"
                )} />
              </div>
              <span>Auto-Sync</span>
            </div>
            <span className="text-xs">
              {autoSyncEnabled ? '10s' : 'Off'}
            </span>
          </button>

          {/* Manual Sync Button */}
          <button 
            onClick={() => {
              onSync();
              setIsMobileMenuOpen(false);
            }}
            disabled={isSyncing}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              isSyncing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
            )}
          >
            <RefreshCcw size={18} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>

          {/* Logout Button */}
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
