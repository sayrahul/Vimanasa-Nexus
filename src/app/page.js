"use client";
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Mock for now

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsAuthenticated(false)}
        onSync={() => console.log('Syncing...')}
      />
      
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'workforce' && <WorkforceView />}
            {/* Add other views here */}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Operational Insights</h1>
        <p className="text-slate-500 mt-1">Welcome back, Administrator</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Staff" value="124" trend="+5%" />
        <StatsCard label="Deployed" value="98" trend="82%" />
        <StatsCard label="Active Clients" value="12" />
        <StatsCard label="Monthly Payroll" value="₹1.2M" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Site Distribution</h3>
          <div className="h-64 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
            [Chart Placeholder]
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-800">New Onboarding: Rahul Sharma</p>
                  <p className="text-xs text-slate-400">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, trend }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-2 flex items-baseline justify-between">
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        {trend && (
          <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function WorkforceView() {
  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workforce Management</h1>
          <p className="text-slate-500 mt-1">Manage your employees and site assignments</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
          Onboard Employee
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600 font-mono">EMP00{i}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">John Doe</td>
                <td className="px-6 py-4 text-sm text-slate-600">Technical Staff</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-100">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-semibold text-sm">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-100">
          <Shield size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Nexus Portal</h2>
          <p className="text-slate-500 mt-2">Sign in to manage Vimanasa Operations</p>
        </div>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="User ID" 
            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
          />
          <input 
            type="password" 
            placeholder="Access Key" 
            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none"
          />
        </div>
        <button 
          onClick={onLogin}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
        >
          Enter Command Center
        </button>
        <p className="text-xs text-slate-400">© 2026 Vimanasa Services LLP. Secure Access Only.</p>
      </div>
    </div>
  );
}
