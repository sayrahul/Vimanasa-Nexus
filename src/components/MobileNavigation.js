/**
 * Mobile Navigation Component
 * Bottom navigation bar for mobile devices
 */

import React from 'react';
import { Home, Users, DollarSign, FileText, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNavigation({ activeTab, setActiveTab, onMenuOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'workforce', label: 'Staff', icon: Users },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-2xl z-50 lg:hidden"
    >
      <div className="flex items-center justify-around px-2 py-3 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[60px] px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={20} className={isActive ? 'mb-1' : 'mb-1'} />
              <span className="text-[10px] font-bold">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-t-full"
                />
              )}
            </button>
          );
        })}

        {/* Menu Button */}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center justify-center min-w-[60px] px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all"
        >
          <Menu size={20} className="mb-1" />
          <span className="text-[10px] font-bold">More</span>
        </button>
      </div>
    </motion.nav>
  );
}
