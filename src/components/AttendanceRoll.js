"use client";
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Save, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Info,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export default function AttendanceRoll({ employees = [], attendanceData = [], onSaveRoll }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [clientFilter, setClientFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [manualData, setManualData] = useState({}); // { employeeId: { days, ot, remarks } }

  const activeEmployees = employees.filter(e => e.Status !== 'Inactive');
  const uniqueClients = [...new Set(activeEmployees.map(e => e['Assigned Client']).filter(Boolean))].sort();

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month, 0).getDate();
  };

  const totalDaysInMonth = getDaysInMonth(selectedMonth);

  const calculatedDays = useMemo(() => {
    const result = {};
    activeEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      const monthRecords = attendanceData.filter(r => 
        (r['Employee ID'] === empId || r.employeeId === empId) && 
        r.Date?.startsWith(selectedMonth)
      );
      const presentDays = monthRecords.filter(r => r.Status === 'Present').length;
      const halfDays = monthRecords.filter(r => r.Status === 'Half Day').length;
      const leaveDays = monthRecords.filter(r => r.Status === 'On Leave').length;
      result[empId] = presentDays + (halfDays * 0.5) + leaveDays;
    });
    return result;
  }, [activeEmployees, attendanceData, selectedMonth]);

  const filteredEmployees = activeEmployees.filter(emp => {
    const matchesSearch = (emp.Employee || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (emp['ID'] || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === 'All' || emp['Assigned Client'] === clientFilter;
    return matchesSearch && matchesClient;
  });

  const handleUpdate = (empId, field, val) => {
    const current = manualData[empId] || {};
    if (val === null || val === '') {
      const updated = { ...current };
      delete updated[field];
      if (Object.keys(updated).length === 0) {
        const newData = { ...manualData };
        delete newData[empId];
        setManualData(newData);
      } else {
        setManualData({ ...manualData, [empId]: updated });
      }
      return;
    }
    setManualData({ ...manualData, [empId]: { ...current, [field]: val } });
  };

  const handleAutoFill = () => {
    const newManual = { ...manualData };
    filteredEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      newManual[empId] = { ...(newManual[empId] || {}), days: calculatedDays[empId] || 0 };
    });
    setManualData(newManual);
    toast.success('Manual days synced with calculated records');
  };

  const handleMarkAllPresent = () => {
    const newManual = { ...manualData };
    filteredEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      newManual[empId] = { ...(newManual[empId] || {}), days: totalDaysInMonth };
    });
    setManualData(newManual);
    toast.success(`All filtered marked as ${totalDaysInMonth} days`);
  };

  const handleReset = () => {
    setManualData({});
    toast.info('All overrides cleared');
  };

  const handleSave = async () => {
    const recordsToSave = Object.entries(manualData).map(([empId, data]) => ({
      employee_id: empId,
      month: selectedMonth,
      payable_days: data.days,
      overtime_hours: data.ot || 0,
      remarks: data.remarks || '',
      type: 'monthly_roll',
      updated_at: new Date().toISOString()
    }));

    if (recordsToSave.length === 0) {
      toast.error('No manual entries to save');
      return;
    }

    setIsSaving(true);
    try {
      if (onSaveRoll) {
        await onSaveRoll(recordsToSave, selectedMonth);
      }
      toast.success('Attendance roll finalized successfully');
    } catch (error) {
      toast.error('Failed to save attendance roll');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const overriddenCount = Object.keys(manualData).length;
  const totalEmployeesCount = filteredEmployees.length;

  return (
    <div className="space-y-6 pb-24 lg:pb-12">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center shadow-2xl shadow-slate-200">
            <Clock size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Manual Attendance Roll</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                <Users size={12} /> {totalEmployeesCount} Employees
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={12} /> {overriddenCount} Overridden
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={handleReset}
            className="flex-1 lg:flex-none px-6 py-3 bg-white text-rose-600 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
          >
            Reset All
          </button>
          <button 
            onClick={handleMarkAllPresent}
            className="flex-1 lg:flex-none px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all shadow-sm"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || overriddenCount === 0}
            className="w-full lg:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isSaving ? 'Processing...' : 'Finalize Roll'}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Modern Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Month</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 transition-transform group-hover:scale-110" size={20} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-100 outline-none font-black text-slate-800 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Directory</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, ID or role..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all font-semibold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client View</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all font-black text-xs appearance-none text-slate-700"
              >
                <option value="All">All Entities</option>
                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Bulk Header Controls */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAutoFill}
              className="px-4 py-2 bg-white text-indigo-600 border border-indigo-100 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={14} /> Sync All from Daily Logs
            </button>
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} /> Use 0.5 for Half-Days
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, idx) => {
                const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
                const autoVal = calculatedDays[empId] || 0;
                const manual = manualData[empId] || {};
                const isOverridden = manual.days !== undefined;

                return (
                  <motion.div 
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={empId}
                    className={cn(
                      "group p-6 lg:px-8 lg:py-6 transition-all",
                      isOverridden ? "bg-indigo-50/20" : "hover:bg-slate-50/50"
                    )}
                  >
                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-6">
                      {/* Left Side: Employee Brand */}
                      <div className="col-span-4 flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base border transition-all",
                          isOverridden ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100" : "bg-slate-100 text-slate-400 border-slate-200"
                        )}>
                          {emp.Employee?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-base lg:text-sm truncate leading-tight">{emp.Employee}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{empId}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{emp['Assigned Client'] || 'Internal'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Data Entry Grid */}
                      <div className="col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Auto Days</label>
                          <div className="h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-slate-400">
                            {autoVal}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest ml-1">Payable Days</label>
                          <input
                            type="number" step="0.5" min="0" max={totalDaysInMonth}
                            placeholder={autoVal.toString()}
                            value={manual.days || ''}
                            onChange={(e) => handleUpdate(empId, 'days', e.target.value)}
                            className={cn(
                              "h-12 w-full px-4 rounded-2xl border-2 outline-none font-black text-center text-lg transition-all",
                              isOverridden ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-xl shadow-indigo-50" : "border-slate-100 bg-white text-slate-400 focus:border-indigo-200"
                            )}
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">OT Hours</label>
                          <input
                            type="number" step="1" min="0"
                            placeholder="0"
                            value={manual.ot || ''}
                            onChange={(e) => handleUpdate(empId, 'ot', e.target.value)}
                            className={cn(
                              "h-12 w-full px-4 rounded-2xl border-2 outline-none font-black text-center text-lg transition-all",
                              manual.ot ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-xl shadow-emerald-50" : "border-slate-100 bg-white text-slate-400 focus:border-emerald-200"
                            )}
                          />
                        </div>

                        <div className="hidden lg:flex flex-col gap-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</label>
                          <input
                            type="text"
                            placeholder="Add note..."
                            value={manual.remarks || ''}
                            onChange={(e) => handleUpdate(empId, 'remarks', e.target.value)}
                            className="h-12 w-full px-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-xs bg-white focus:border-indigo-200"
                          />
                        </div>
                      </div>

                      {/* Right Side: Status Badge */}
                      <div className="col-span-2 flex items-center justify-between lg:justify-end gap-3 mt-4 lg:mt-0">
                         <div className="lg:hidden flex-1">
                            <input
                              type="text"
                              placeholder="Notes..."
                              value={manual.remarks || ''}
                              onChange={(e) => handleUpdate(empId, 'remarks', e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-100 outline-none font-bold text-[10px] bg-slate-50"
                            />
                         </div>
                        {isOverridden ? (
                          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200">
                            <CheckCircle2 size={20} />
                          </div>
                        ) : (
                          <div className="bg-slate-100 text-slate-300 p-2 rounded-xl">
                            <RefreshCw size={20} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-32 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                   <Users size={40} />
                </div>
                <h4 className="text-2xl font-black text-slate-900">No matches found</h4>
                <p className="text-slate-500 font-medium max-w-sm mt-2">Adjust your filters or try a different search term to find employees.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Mobile Action Bar */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] flex gap-3">
         <button 
           onClick={handleSave}
           disabled={isSaving || overriddenCount === 0}
           className="flex-1 bg-slate-900 text-white h-16 rounded-[24px] font-black text-sm shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50"
         >
           {isSaving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
           FINALIZE ATTENDANCE ROLL
         </button>
      </div>

      {/* CSV Bulk Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="p-8 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6 group hover:border-indigo-200 transition-all">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
               <Download size={24} />
            </div>
            <div>
               <h5 className="font-black text-sm uppercase tracking-widest text-slate-800">Download Template</h5>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Get pre-filled CSV for this month</p>
            </div>
         </div>

         <div className="p-8 bg-white border border-slate-200 rounded-[32px] flex items-center gap-6 group hover:border-emerald-200 transition-all cursor-pointer">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
               <Upload size={24} />
            </div>
            <div>
               <h5 className="font-black text-sm uppercase tracking-widest text-slate-800">Import CSV Sheet</h5>
               <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Process mass updates from client files</p>
            </div>
         </div>
      </div>
    </div>
  );
}
