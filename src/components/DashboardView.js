"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Building2, DollarSign, TrendingUp, 
  UserPlus, ShieldCheck, Receipt, CheckSquare, UserCog 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className={cn("h-1 w-full transition-all duration-500", color === 'indigo' ? 'bg-indigo-600' : 'bg-slate-200 group-hover:bg-indigo-400')} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
            <Icon size={20} />
          </div>
          <div className="text-[9px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">LIVE SYNC</div>
        </div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function DashboardView({ data, allData }) {
  // Calculate real-time stats from actual data
  const stats = {
    staff: allData?.workforce?.length || 0,
    deployed: allData?.workforce?.filter(e => e['Deployment Status'] === 'Deployed' || (!e['Deployment Status'] && e['Assigned Client'])).length || 0,
    onLeave: allData?.workforce?.filter(e => e['Deployment Status'] === 'On Leave').length || 0,
    clients: allData?.clients?.length || 0,
    payroll: allData?.payroll?.length > 0 ? `₹${(allData.payroll.reduce((acc, curr) => acc + (parseFloat(curr['Net Salary']) || 0), 0) / 100000).toFixed(2)}L` : '₹0.00L',
    pendingLeave: allData?.leave?.filter(r => r.Status === 'Pending' || r.Status === 'Applied').length || 0,
    complianceDue: allData?.compliance?.filter(c => c.Status === 'Pending' || c.Status === 'Upcoming').length || 0,
    newApplications: allData?.candidates?.filter(c => c.Status === 'Pending' || !c.Status).length || 0,
  };

  // Financial summaries
  const financialSummary = {
    totalIncome: allData?.invoices?.reduce((acc, curr) => acc + (parseFloat(curr['Total Amount']) || 0), 0) || 0,
    totalExpense: (allData?.payroll?.reduce((acc, curr) => acc + (parseFloat(curr['Total Bill Rate']) || 0), 0) || 0) + (allData?.expenses?.reduce((acc, curr) => acc + (parseFloat(curr.Amount) || 0), 0) || 0),
  };
  const profitMargin = financialSummary.totalIncome > 0 ? Math.round(((financialSummary.totalIncome - financialSummary.totalExpense) / financialSummary.totalIncome) * 100) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Corporate Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operations Hub</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Core metrics and operational health overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-slate-200">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            SYSTEM ACTIVE
          </div>
        </div>
      </header>

      {/* Corporate Grid: Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Workforce" 
          value={stats.staff} 
          icon={Users}
          color="indigo"
          subtitle={`${stats.deployed} Deployed • ${stats.onLeave} Leave`}
        />
        <StatsCard 
          label="Client Sites" 
          value={stats.clients} 
          icon={Building2}
          color="slate"
          subtitle="Active operational partners"
        />
        <StatsCard 
          label="Monthly Payroll" 
          value={stats.payroll} 
          icon={DollarSign}
          color="indigo"
          subtitle="Total net distribution"
        />
        <StatsCard 
          label="Operational Margin" 
          value={`${profitMargin}%`} 
          icon={TrendingUp}
          color="indigo"
          subtitle="Net financial efficiency"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Essential Operations Hub */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Action Center</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: UserPlus, label: "Recruit", count: stats.newApplications, tab: 'recruitment' },
                { icon: ShieldCheck, label: "Compliance", count: stats.complianceDue, tab: 'compliance' },
                { icon: Receipt, label: "Payroll", tab: 'payroll' },
                { icon: CheckSquare, label: "Approvals", count: stats.pendingLeave, tab: 'placements' },
                { icon: Users, label: "Staff", tab: 'placements' },
                { icon: UserCog, label: "System", tab: 'settings' }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: action.tab } }))}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-600 hover:shadow-md transition-all group relative text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-3">
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-black text-slate-600 group-hover:text-indigo-600 uppercase tracking-wider">{action.label}</span>
                  {action.count > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {action.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist P&L Snapshot */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <DollarSign size={150} />
             </div>
             <div className="relative z-10">
               <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-8">P&L Snapshot</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Revenue</p>
                   <p className="text-3xl font-black tracking-tighter">₹{(financialSummary.totalIncome / 100000).toFixed(2)}L</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Expenses</p>
                   <p className="text-3xl font-black tracking-tighter">₹{(financialSummary.totalExpense / 100000).toFixed(2)}L</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Operational Net</p>
                   <p className="text-3xl font-black tracking-tighter text-indigo-400">₹{((financialSummary.totalIncome - financialSummary.totalExpense) / 100000).toFixed(2)}L</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Recent Operational Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">System Log</h3>
          <div className="space-y-4 flex-1">
            {allData?.workforce?.slice(0, 6).map((emp, i) => (
              <div key={i} className="flex gap-4 items-center group cursor-pointer border-b border-slate-50 pb-4 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {(emp.Employee || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">{emp.Employee}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{emp.Role || 'OPERATIONAL STAFF'}</p>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">LOGGED</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'placements' } }))}
            className="mt-8 w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            Directory Archive
          </button>
        </div>
      </div>
    </div>
  );
}
