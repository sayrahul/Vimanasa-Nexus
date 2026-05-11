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
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { apiClient, authAPI } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

export default function EmployeePortal({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [employeeRecord, setEmployeeRecord] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [stats, setStats] = useState({
    presentDays: 0,
    leaveBalance: 12,
    upcomingHolidays: 2
  });
  const [isClocking, setIsClocking] = useState(false);
  const [clockStatus, setClockStatus] = useState('Out'); // In | Out
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    fromDate: '',
    toDate: '',
    reason: ''
  });

  // Fetch all relevant data for the employee
  const fetchEmployeeData = async () => {
    setIsLoading(true);
    try {
      // 1. Find employee in workforce directory by email
      const workforceRes = await apiClient.get(`/api/database?table=workforce`);
      const allEmployees = workforceRes.data || [];
      console.log('Workforce fetched:', allEmployees.length, 'records');
      
      const userEmail = user.email?.toLowerCase();
      const myRecord = allEmployees.find(emp => {
        const empEmail = (emp.Email || emp.email || emp['Contact Email'] || '').toLowerCase();
        return empEmail === userEmail || (emp.Employee?.toLowerCase() === user.full_name?.toLowerCase());
      });
      
      if (myRecord) {
        console.log('Employee record matched:', myRecord.Employee);
        setEmployeeRecord(myRecord);
        
        // 2. Fetch attendance logs for this employee
        const attendanceRes = await apiClient.get(`/api/database?table=attendance`);
        const myAttendance = (attendanceRes.data || []).filter(log => 
          log.employee_id === myRecord.id || 
          log['Employee ID'] === myRecord['ID'] ||
          log['Employee ID'] === myRecord['Employee ID']
        );
        setAttendanceLogs(myAttendance);
        
        // Calculate present days this month
        const thisMonth = new Date().getMonth();
        const presentThisMonth = myAttendance.filter(log => {
          const logDate = new Date(log.Date || log.date);
          return logDate.getMonth() === thisMonth && (log.Status === 'Present' || log.status === 'Present');
        }).length;
        
        setStats(prev => ({ ...prev, presentDays: presentThisMonth }));
        
        // Determine current clock status from today's log
        const today = new Date().toISOString().split('T')[0];
        const todayLog = myAttendance.find(log => (log.Date || log.date) === today);
        if (todayLog) {
          setClockStatus(todayLog.Status === 'Present' || todayLog.status === 'Present' ? 'In' : 'Out');
        }

        // 3. Fetch leave history
        const leaveRes = await apiClient.get(`/api/database?table=leave`);
        const myLeave = (leaveRes.data || []).filter(req => req.employee_id === myRecord.id || req['Employee ID'] === myRecord['ID']);
        setLeaveHistory(myLeave);

        // 4. Fetch payroll
        const payrollRes = await apiClient.get(`/api/database?table=payroll`);
        const myPayroll = (payrollRes.data || []).filter(p => p.employee_id === myRecord.id || p['Employee ID'] === myRecord['ID']);
        setPayrollData(myPayroll);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast.error('Failed to load your records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [user.email]);

  const handleClockAction = async () => {
    if (!employeeRecord) {
      toast.error('Employee record not found. Contact HR.');
      return;
    }

    setIsClocking(true);
    try {
      const newStatus = clockStatus === 'In' ? 'Out' : 'In';
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Save to database
      await apiClient.post('/api/database', {
        table: 'attendance',
        data: {
          'Employee ID': employeeRecord['ID'],
          'Employee': employeeRecord['Employee'],
          Date: today,
          Status: newStatus === 'In' ? 'Present' : 'Out',
          'Check In': newStatus === 'In' ? nowTime : undefined,
          'Check Out': newStatus === 'Out' ? nowTime : undefined,
        }
      });

      setClockStatus(newStatus);
      fetchEmployeeData(); // Refresh logs
      toast.success(newStatus === 'In' ? 'Shift Started! Have a great day.' : 'Shift Ended! Rest well.');
    } catch (error) {
      console.error('Clock error:', error);
      toast.error('Failed to sync attendance. Try again.');
    } finally {
      setIsClocking(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!employeeRecord) return;
    if (!leaveForm.fromDate || !leaveForm.toDate) {
      toast.warn('Please select both dates');
      return;
    }

    try {
      await apiClient.post('/api/database', {
        table: 'leave',
        data: {
          'Employee ID': employeeRecord['ID'],
          'Employee': employeeRecord['Employee'],
          'Leave Type': leaveForm.type,
          'Start Date': leaveForm.fromDate,
          'End Date': leaveForm.toDate,
          Reason: leaveForm.reason,
          Status: 'Pending',
          'Applied On': new Date().toISOString().split('T')[0]
        }
      });
      
      toast.success('Leave request submitted for approval');
      setLeaveForm({ type: 'Casual Leave', fromDate: '', toDate: '', reason: '' });
      fetchEmployeeData(); // Refresh history
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  // Tabs for bottom navigation and desktop sidebar
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leave', label: 'Leave', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto shadow-xl shadow-indigo-100"></div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Initializing Secure Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24 lg:pb-0 lg:flex">
      {/* Desktop Sidebar (Only visible on LG+) */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen z-40">
        <div className="p-8 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
              <img src="/vimanasa-logo.png" alt="Nexus" className="h-6 w-auto" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase tracking-tighter">Nexus</h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Employee Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm",
                  isActive 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                )}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
           <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-900">
                 {user.full_name?.charAt(0)}
              </div>
              <div className="min-w-0">
                 <p className="font-bold text-slate-900 text-xs truncate">{user.full_name}</p>
                 <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-widest">{user.role?.replace('_', ' ')}</p>
              </div>
           </div>
           <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm">
              <LogOut size={20} />
              Sign Out
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header (Hidden on LG+) */}
        <header className="bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-30 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
               <img src="/vimanasa-logo.png" alt="Nexus" className="h-6 w-auto" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900">Nexus</h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">Self-Service</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button className="p-2.5 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all relative">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Desktop Header Title (Visible only on LG+) */}
        <header className="hidden lg:flex items-center justify-between px-12 py-8 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-30">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-slate-400 font-medium text-sm">Employee Self-Service Portal / {activeTab}</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                 <p className="text-xs font-black text-slate-900 tabular-nums">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                 </p>
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Network Secure</p>
              </div>
              <button className="p-3 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all relative">
                 <Bell size={20} />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
           </div>
        </header>

        {/* Dynamic Content Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 lg:px-12 lg:py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Reference-Style Header */}
              <div className="flex justify-between items-center px-2">
                 <div className="space-y-1">
                    <h2 className="text-2xl font-medium text-slate-400">Good morning, <span className="font-bold text-slate-900">{user.full_name?.split(' ')[0]} !</span></h2>
                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider">
                       <ShieldCheck size={16} />
                       {employeeRecord?.['Assigned Client'] || 'OFFICE'}
                    </div>
                 </div>
                 <div className="w-14 h-14 rounded-full border-4 border-white shadow-xl overflow-hidden">
                    <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="User" className="w-full h-full object-cover" />
                 </div>
              </div>

              {/* Reference-Style Clock Card */}
              <div className="bg-white rounded-[40px] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-white/50 text-center relative overflow-hidden">
                 <div className="space-y-1 mb-10">
                    <div className="text-5xl font-bold text-slate-900 tracking-tight tabular-nums flex items-center justify-center gap-3">
                       {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                       <span className="text-xl font-medium text-slate-400">hrs</span>
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                       {currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
                    </p>
                 </div>
                 
                 <div className="relative flex justify-center mb-12">
                    <motion.button 
                      whileTap={{ scale: 0.92 }}
                      onClick={handleClockAction}
                      disabled={isClocking}
                      className={cn(
                        "w-48 h-48 rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-500 relative z-10",
                        clockStatus === 'In'
                          ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_20px_40px_rgba(244,63,94,0.3)]"
                          : "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white shadow-[0_20px_40px_rgba(16,185,129,0.3)]"
                      )}
                    >
                       <div className="w-12 h-12 flex items-center justify-center mb-1">
                          <Fingerprint size={48} strokeWidth={1.5} />
                       </div>
                       <span className="font-bold text-lg tracking-tight">
                          {isClocking ? "..." : clockStatus === 'In' ? 'Check-out' : 'Check-in'}
                       </span>
                    </motion.button>
                    {/* Ripple effects */}
                    <div className={cn("absolute inset-0 m-auto w-48 h-48 rounded-full animate-ping opacity-20", clockStatus === 'In' ? 'bg-rose-400' : 'bg-emerald-400')} />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-8 mt-2">
                    <div className="flex flex-col items-center gap-2 border-r border-slate-50">
                       <div className="w-10 h-10 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <Clock size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">00:00 AM</p>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Check-in time</p>
                       </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 rounded-full border border-rose-100 flex items-center justify-center text-rose-600">
                          <Clock size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">00:00 PM</p>
                          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">Check-out time</p>
                       </div>
                    </div>
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
                     <button 
                       onClick={() => {
                         const latest = payrollData[0];
                         if (latest) toast.info(`Downloading ${latest.Month} payslip...`);
                         else toast.warn('No payslips available yet.');
                       }}
                       className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-all text-left group"
                     >
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                             <FileText size={22} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 text-sm">Latest Payslip</h4>
                             <p className="text-[10px] font-medium text-slate-400">
                               Available: {payrollData[0]?.Month || 'N/A'}
                             </p>
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
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight">Leave Manager</h2>
                 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                    {stats.leaveBalance} Days Left
                 </span>
              </div>

              {/* Leave Application Form Preview */}
               <form onSubmit={handleLeaveSubmit} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type of Absence</label>
                       <select 
                         value={leaveForm.type}
                         onChange={(e) => setLeaveForm(prev => ({ ...prev, type: e.target.value }))}
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none"
                       >
                          <option>Casual Leave</option>
                          <option>Sick Leave</option>
                          <option>Earned Leave</option>
                          <option>Comp-Off</option>
                       </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</label>
                          <input 
                            type="date" 
                            required
                            value={leaveForm.fromDate}
                            onChange={(e) => setLeaveForm(prev => ({ ...prev, fromDate: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</label>
                          <input 
                            type="date" 
                            required
                            value={leaveForm.toDate}
                            onChange={(e) => setLeaveForm(prev => ({ ...prev, toDate: e.target.value }))}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all" 
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason (Optional)</label>
                       <textarea 
                         value={leaveForm.reason}
                         onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                         placeholder="Why are you requesting leave?"
                         className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none h-24"
                       />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                    Submit Request
                 </button>
              </form>

              {/* Status List */}
              <div className="space-y-4 pt-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Recent Requests</h3>
                 <div className="space-y-3">
                    {leaveHistory.length > 0 ? leaveHistory.slice(0, 5).map((leave, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center",
                              leave.Status === 'Approved' ? "bg-emerald-50 text-emerald-600" :
                              leave.Status === 'Rejected' ? "bg-rose-50 text-rose-600" :
                              "bg-amber-50 text-amber-600"
                            )}>
                               {leave.Status === 'Approved' ? <CheckCircle2 size={20} /> : 
                                leave.Status === 'Rejected' ? <XCircle size={20} /> : 
                                <Clock size={20} />}
                            </div>
                            <div>
                               <h4 className="font-bold text-slate-900 text-sm">
                                 {new Date(leave['Start Date']).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(leave['End Date']).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                               </h4>
                               <p className={cn(
                                 "text-[10px] font-black uppercase tracking-widest",
                                 leave.Status === 'Approved' ? "text-emerald-600" :
                                 leave.Status === 'Rejected' ? "text-rose-600" :
                                 "text-amber-600"
                               )}>
                                 {leave.Status || 'Pending'}
                               </p>
                            </div>
                         </div>
                         <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    )) : (
                      <div className="bg-white p-8 rounded-[28px] border border-slate-100 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No leave history found</p>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-8"
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

          {activeTab === 'documents' && (
             <motion.div 
               key="documents"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="max-w-4xl mx-auto space-y-8"
             >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[
                     { id: 'offer', label: 'Offer Letter', date: employeeRecord?.['Joined Date'] || 'Joined', status: 'Ready', icon: ShieldCheck, color: 'indigo' },
                     { id: 'joining', label: 'Joining Letter', date: employeeRecord?.['Joined Date'] || 'Joined', status: 'Ready', icon: Briefcase, color: 'emerald' },
                     { id: 'experience', label: 'Experience Letter', date: 'N/A', status: employeeRecord?.Status === 'Inactive' ? 'Ready' : 'Locked', icon: FileText, color: 'amber' },
                     { id: 'relieving', label: 'Relieving Letter', date: 'N/A', status: employeeRecord?.Status === 'Inactive' ? 'Ready' : 'Locked', icon: LogOut, color: 'rose' },
                   ].map((doc) => (
                     <div 
                       key={doc.id}
                       className={cn(
                         "bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm transition-all group hover:shadow-xl hover:shadow-slate-200/50",
                         doc.status === 'Locked' ? "opacity-60 grayscale" : "cursor-pointer"
                       )}
                       onClick={() => doc.status === 'Ready' && toast.info(`Generating ${doc.label}...`)}
                     >
                        <div className="flex justify-between items-start mb-6">
                           <div className={cn(
                             "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                             doc.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                             doc.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                             doc.color === 'amber' ? "bg-amber-50 text-amber-600" :
                             "bg-rose-50 text-rose-600"
                           )}>
                              <doc.icon size={28} />
                           </div>
                           <div className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             doc.status === 'Ready' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400 border border-slate-200"
                           )}>
                              {doc.status}
                           </div>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 tracking-tight mb-1">{doc.label}</h4>
                        <p className="text-slate-400 text-xs font-medium mb-6">
                           {doc.status === 'Locked' ? 'Available upon resignation' : `Verified Document`}
                        </p>
                        <button 
                          disabled={doc.status === 'Locked'}
                          className={cn(
                            "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                            doc.status === 'Ready' ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}
                        >
                           <Download size={14} /> Download PDF
                        </button>
                     </div>
                   ))}
                </div>

                {/* Important Notice */}
                <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                   <div className="relative flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
                         <AlertCircle size={32} />
                      </div>
                      <div className="text-center md:text-left">
                         <h5 className="text-lg font-black tracking-tight mb-1">Need a specialized document?</h5>
                         <p className="text-indigo-100 text-sm font-medium opacity-90">If you require customized certifications or physical copies, please submit a request through the Help Desk.</p>
                      </div>
                      <button className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all md:ml-auto shadow-xl">
                         Contact Support
                      </button>
                   </div>
                </div>
             </motion.div>
          )}
           {activeTab === 'attendance' && (
              <motion.div 
                key="attendance"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex justify-between items-center px-1">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Logs</h2>
                   <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() - 1)))}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                         <ChevronRight size={20} className="rotate-180" />
                      </button>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest min-w-[120px] text-center">
                         {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => setCalendarDate(new Date(calendarDate.setMonth(calendarDate.getMonth() + 1)))}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                         <ChevronRight size={20} />
                      </button>
                   </div>
                </div>
                
                <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
                   <div className="grid grid-cols-7 gap-2 mb-6">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest pb-4">{d}</div>
                      ))}
                      {(() => {
                        const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
                        const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
                        const padding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                        
                        return [
                          ...Array(padding).fill(null),
                          ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
                        ].map((day, i) => {
                          if (!day) return <div key={`pad-${i}`} />;
                          
                          const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const log = attendanceLogs.find(l => (l.Date || l.date) === dateStr);
                          const isToday = new Date().toISOString().split('T')[0] === dateStr;
                          
                          let statusColor = "bg-slate-50 text-slate-400 border-slate-100";
                          if (log?.Status === 'Present' || log?.status === 'Present') statusColor = "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200";
                          else if (isToday) statusColor = "bg-white text-indigo-600 border-indigo-200 ring-2 ring-indigo-50";

                          return (
                            <div 
                              key={day} 
                              className={cn(
                                "aspect-square rounded-2xl flex flex-col items-center justify-center text-[13px] font-black border transition-all cursor-default group relative",
                                statusColor
                              )}
                            >
                               {day}
                               {log && !isToday && <div className="absolute bottom-2 w-1 h-1 rounded-full bg-white/40" />}
                            </div>
                          );
                        });
                      })()}
                   </div>

                   <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Holiday</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Timeline Summary</h3>
                   <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                      {attendanceLogs.length > 0 ? (
                        <div className="space-y-6">
                           {attendanceLogs.slice(0, 3).map((log, i) => (
                             <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                      <Calendar size={20} />
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-slate-900 text-sm">{new Date(log.Date || log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</h4>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.Status || log.status}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="text-sm font-black text-slate-900">{log['Check In'] || '--:--'}</p>
                                   <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Arrival</p>
                                </div>
                             </div>
                           ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                              <Calendar size={32} />
                           </div>
                           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No historical logs found</p>
                        </div>
                      )}
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
    </div>
  );
}
