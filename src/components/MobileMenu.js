/**
 * Mobile Menu Component
 * Full-screen menu for mobile devices
 */

import React from 'react';
import { X, Shield, Users, DollarSign, FileText, Calendar, AlertTriangle, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu({ isOpen, onClose, activeTab, setActiveTab, onLogout, user }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield, color: 'blue' },
    { id: 'workforce', label: 'Workforce', icon: Users, color: 'purple' },
    { id: 'clients', label: 'Clients', icon: Shield, color: 'green' },
    { id: 'partners', label: 'Partners', icon: Shield, color: 'orange' },
    { id: 'attendance', label: 'Attendance', icon: Calendar, color: 'cyan' },
    { id: 'leave', label: 'Leave Requests', icon: Calendar, color: 'pink' },
    { id: 'expenses', label: 'Expenses', icon: DollarSign, color: 'yellow' },
    { id: 'payroll', label: 'Payroll', icon: DollarSign, color: 'green' },
    { id: 'finance', label: 'Finance', icon: DollarSign, color: 'emerald' },
    { id: 'compliance', label: 'Compliance', icon: AlertTriangle, color: 'red' },
    { id: 'invoices', label: 'Invoices', icon: FileText, color: 'indigo' },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    pink: 'bg-pink-50 text-pink-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  const handleItemClick = (id) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Menu</h2>
                  <p className="text-blue-100 text-sm">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    {user?.role?.replace('_', ' ').toUpperCase() || 'ADMIN'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${colorClasses[item.color]}`}>
                      <Icon size={20} />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 space-y-2">
              <button
                onClick={() => {
                  handleItemClick('settings');
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Settings size={20} />
                </div>
                <span className="flex-1 text-left">Settings</span>
              </button>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
              >
                <div className="p-2 rounded-lg bg-red-50">
                  <LogOut size={20} />
                </div>
                <span className="flex-1 text-left font-bold">Logout</span>
              </button>
            </div>

            {/* Version */}
            <div className="p-4 text-center text-xs text-slate-400">
              Vimanasa Nexus v2.0.0
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
