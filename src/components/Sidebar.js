import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wallet,
  ShieldCheck,
  LogOut,
  Receipt,
  Menu,
  X,
  UserPlus,
  Settings as SettingsIcon,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Home', id: 'dashboard' },
  { icon: Building2, label: 'Clients', id: 'clients' },
  { icon: Users, label: 'Placements', id: 'placements' },
  { icon: UserPlus, label: 'Recruitment', id: 'recruitment' },
  { icon: Wallet, label: 'Finance', id: 'finance' },
  { icon: ShieldCheck, label: 'Compliance', id: 'compliance' },
  { icon: Receipt, label: 'Reports', id: 'reports' },
  { icon: UserCog, label: 'Users', id: 'users' },
  { icon: SettingsIcon, label: 'Settings', id: 'settings' },
];

const primaryMobileItems = menuItems.slice(0, 4);

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  const renderNavButton = (item, compact = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleTabChange(item.id)}
        className={cn(
          compact
            ? 'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black'
            : 'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium',
          isActive
            ? 'bg-blue-50 text-blue-600 shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        )}
      >
        <Icon size={compact ? 19 : 20} />
        <span className={compact ? 'truncate' : ''}>{item.label}</span>
        {compact && isActive && <span className="absolute bottom-0 h-1 w-8 rounded-t-full bg-blue-600" />}
      </button>
    );
  };

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <img src="/vimanasa-logo.png" alt="Vimanasa Services LLP" className="h-8 w-auto shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">Vimanasa Nexus</p>
            <p className="truncate text-[11px] font-semibold text-slate-500">
              {menuItems.find((item) => item.id === activeTab)?.label || 'Dashboard'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[70] bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-[80] flex h-screen w-72 flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:z-[60] lg:w-64 lg:translate-x-0 lg:shadow-none',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center justify-between gap-4">
            <img src="/vimanasa-logo.png" alt="Vimanasa Services LLP" className="h-9 w-auto" />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {menuItems.map((item) => renderNavButton(item))}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur lg:hidden">
        <div className="flex items-center gap-1 py-2">
          {primaryMobileItems.map((item) => renderNavButton(item, true))}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] font-black text-slate-500"
          >
            <Menu size={19} />
            More
          </button>
        </div>
      </nav>
    </>
  );
}
