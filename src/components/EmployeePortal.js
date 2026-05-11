"use client";

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  Bell, 
  ChevronRight, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Download,
  AlertCircle,
  Briefcase,
  Smartphone,
  LogOut,
  Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiClient, authAPI } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

export default function EmployeePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [stats, setStats] = useState({
    presentDays: 0,
    leaveBalance: 12,
    upcomingHolidays: 2
  });
  const [isClocking, setIsClocking] = useState(false);
  const [clockStatus, setClockStatus] = useState('Out'); // In | Out

  // Tabs for bottom navigation
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leave', label: 'Leave', icon: Clock },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleClockAction = async () => {
    setIsClocking(true);
    // Simulate geo-fencing and clocking
    setTimeout(() => {
      const newStatus = clockStatus === 'In' ? 'Out' : 'In';
      setClockStatus(newStatus);
      setIsClocking(false);
      toast.success(newStatus === 'In' ? 'Clocked In Successfully!' : 'Clocked Out Successfully!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      {/* Top Header */}
      <header className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
             <img src="/vimanasa-logo.png" alt="Nexus" className="h-6 w-auto" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">Nexus ESS</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Self-Service Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="p-2.5 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
           </button>
           <button onClick={onLogout} className="p-2.5 bg-slate-50 text-slate-400 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all">
              <LogOut size={20} />
           </button>
        </div>
      </header>

      {/* Dynamic Content */}
      <main className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="p-6 space-y-8"
            >
              {/* Welcome Card */}
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hi, {user.full_name?.split(' ')[0]}! 👋</h2>
                 <p className="text-slate-500 font-medium text-sm">Welcome to your workspace for today.</p>
              </div>

              {/* Attendance Clock Card */}
              <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden text-center">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[100px] -z-10 opacity-50"></div>
                 
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Status: {clockStatus === 'In' ? 'Active Work' : 'Break / Out'}</p>
                 <div className="text-4xl font-black text-slate-900 mb-8 tracking-tighter tabular-nums">09:42 <span className="text-slate-300">AM</span></div>
                 
                 <button 
                   onClick={handleClockAction}
                   disabled={isClocking}
                   className={cn(
                     "w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95",
                     clockStatus === 'In' 
                      ? "bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-100 hover:bg-rose-100" 
                      : "bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800"
                   )}
                 >
                   {isClocking ? (
                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <>
                        <Fingerprint size={20} />
                        {clockStatus === 'In' ? 'End Shift' : 'Begin Shift'}
                     </>
                   )}
                 </button>
                 
                 <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-400 bg-slate-50 py-2 rounded-xl">
                    <MapPin size={14} className="text-indigo-500" /> Site: Nexus HQ, Bangalore
                 </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                       <Calendar size={20} />
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.presentDays}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days Present</p>
                 </div>
                 <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                       <Clock size={20} />
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{stats.leaveBalance}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Leave Balance</p>
                 </div>
              </div>

              {/* Quick Actions List */}
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Essentials</h3>
                 <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                    <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-all text-left group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <FileText size={22} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">Latest Payslip</h4>
                             <p className="text-[10px] font-medium text-slate-400">Available: April 2026</p>
                          </div>
                       </div>
                       <Download size={18} className="text-slate-300 group-hover:text-amber-600" />
                    </button>
                    
                    <button onClick={() => setActiveTab('leave')} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-all text-left group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <Plus size={22} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">Request Leave</h4>
                             <p className="text-[10px] font-medium text-slate-400">Apply for time off</p>
                          </div>
                       </div>
                       <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600" />
                    </button>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'leave' && (
            <motion.div 
              key="leave"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Leave Manager</h2>
                 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                    {stats.leaveBalance} Days Left
                 </span>
              </div>

              {/* Leave Application Form Preview */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Absence</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none">
                          <option>Casual Leave</option>
                          <option>Sick Leave</option>
                          <option>Earned Leave</option>
                          <option>Comp-Off</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                          <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                          <input type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" />
                       </div>
                    </div>
                 </div>
                 <button className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                    Submit Request
                 </button>
              </div>

              {/* Status List */}
              <div className="space-y-4 pt-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Recent Requests</h3>
                 <div className="space-y-3">
                    <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                             <Clock size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">May 14 - May 16</h4>
                             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Pending Review</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </div>
                    <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                             <CheckCircle2 size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">April 10 - April 11</h4>
                             <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Approved</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                 <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-100 flex items-center justify-center font-black text-4xl text-slate-900">
                    {user.full_name?.charAt(0)}
                 </div>
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.full_name}</h2>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 mt-2">
                       {user.role?.replace('_', ' ')}
                    </p>
                 </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                 <div className="p-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Corporate Email</label>
                    <p className="font-bold text-slate-900">{user.email}</p>
                 </div>
                 <div className="p-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Username</label>
                    <p className="font-bold text-slate-900">@{user.username}</p>
                 </div>
                 <div className="p-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Joined Directory</label>
                    <p className="font-bold text-slate-900">{new Date(user.created_at).toLocaleDateString()}</p>
                 </div>
              </div>

              <button 
                onClick={onLogout}
                className="w-full py-5 bg-rose-50 text-rose-600 rounded-[24px] font-black text-xs uppercase tracking-widest border border-rose-100 shadow-xl shadow-rose-100/50 hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
              >
                <LogOut size={18} /> End Secure Session
              </button>
            </motion.div>
          )}

          {activeTab === 'attendance' && (
             <motion.div 
               key="attendance"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="p-6 space-y-6"
             >
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Logs</h2>
                
                <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm">
                   <div className="flex items-center justify-between mb-8">
                      <div>
                         <h3 className="font-black text-slate-900 text-lg tracking-tight">May 2026</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Summary</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                         <Calendar size={24} />
                      </div>
                   </div>

                   <div className="grid grid-cols-7 gap-2 mb-4">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-300">{d}</div>
                      ))}
                      {Array.from({ length: 31 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "aspect-square rounded-lg flex items-center justify-center text-[11px] font-black border transition-all",
                            i === 10 ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200" :
                            i < 10 ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            "bg-slate-50 text-slate-400 border-slate-100"
                          )}
                        >
                          {i + 1}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Today's Timeline</h3>
                   <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                      <div className="absolute left-10 top-12 bottom-12 w-0.5 bg-slate-100"></div>
                      
                      <div className="space-y-8 relative">
                         <div className="flex items-start gap-6">
                            <div className="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white shadow-lg z-10 flex items-center justify-center">
                               <CheckCircle2 size={12} className="text-white" />
                            </div>
                            <div>
                               <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Shift Started</h4>
                               <p className="text-[11px] font-bold text-slate-400">09:12 AM • Nexus HQ Site</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-6 opacity-40">
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-4 border-white z-10"></div>
                            <div>
                               <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">Break Begun</h4>
                               <p className="text-[11px] font-bold text-slate-400">Scheduled: 01:00 PM</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 transition-all relative px-3 py-1",
                  isActive ? "text-slate-900" : "text-slate-300"
                )}
              >
                {isActive && (
                   <motion.div 
                     layoutId="activeTab"
                     className="absolute -top-1 w-8 h-1 bg-slate-900 rounded-full"
                   />
                )}
                <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
