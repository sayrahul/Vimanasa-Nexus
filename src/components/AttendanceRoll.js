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
  const [manualDays, setManualDays] = useState({}); // { employeeId: days }

  const activeEmployees = employees.filter(e => e.Status !== 'Inactive');
  const uniqueClients = [...new Set(activeEmployees.map(e => e['Assigned Client']).filter(Boolean))].sort();

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month, 0).getDate();
  };

  const totalDaysInMonth = getDaysInMonth(selectedMonth);

  // Calculate "Calculated Days" based on existing daily attendance
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

  const handleDayChange = (empId, val) => {
    const numVal = parseFloat(val);
    if (isNaN(numVal)) {
      const newDays = { ...manualDays };
      delete newDays[empId];
      setManualDays(newDays);
      return;
    }
    if (numVal < 0 || numVal > totalDaysInMonth) return;
    setManualDays({ ...manualDays, [empId]: numVal });
  };

  const handleBulkUpload = () => {
    toast.info('Bulk CSV upload feature coming soon! Please enter manually for now.');
  };

  const handleAutoFill = () => {
    const newManual = {};
    filteredEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      newManual[empId] = calculatedDays[empId] || 0;
    });
    setManualDays({ ...manualDays, ...newManual });
    toast.success('Manual days synced with calculated records');
  };

  const handleSave = async () => {
    const recordsToSave = Object.entries(manualDays).map(([empId, days]) => ({
      employee_id: empId,
      month: selectedMonth,
      payable_days: days,
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
      toast.success('Attendance roll saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance roll');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Clock size={24} />
            </div>
            Monthly Attendance Roll
          </h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Manual override & bulk attendance processing
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={handleAutoFill}
            className="flex-1 lg:flex-none px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw size={16} /> SYNC WITH AUTO
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || Object.keys(manualDays).length === 0}
            className="flex-1 lg:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isSaving ? 'Saving...' : 'Finalize Roll'}
            <Save size={16} />
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] border border-slate-200/60 p-6 shadow-sm flex flex-col md:flex-row items-end gap-6">
        <div className="w-full md:w-64 space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Month</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-50/50 outline-none font-bold text-slate-800 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Employee</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-50 transition-all font-semibold text-sm"
            />
          </div>
        </div>

        <div className="w-full md:w-auto space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client Filter</label>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-50 transition-all font-bold text-xs appearance-none text-slate-700 min-w-[160px]"
            >
              <option value="All">All Clients</option>
              {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-4">
        <Info size={20} className="text-indigo-500 mt-0.5 shrink-0" />
        <div className="text-xs font-medium text-indigo-700 leading-relaxed">
          <p className="font-black uppercase tracking-wider mb-1">Intelligence Advice:</p>
          Manual Attendance Roll overrides automated daily logs for the selected month. Use this when clients provide a total attendance figure. 
          The payroll engine will automatically prioritize these manual figures for salary calculation.
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-4">Employee Information</div>
          <div className="col-span-3 text-center">Auto-Calculated Days</div>
          <div className="col-span-3 text-center">Manual Payable Days</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, idx) => {
                const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
                const autoVal = calculatedDays[empId] || 0;
                const manualVal = manualDays[empId];
                const isOverridden = manualVal !== undefined;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={empId}
                    className="p-6 lg:px-8 lg:py-5 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-6">
                      {/* Employee Info */}
                      <div className="col-span-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200">
                          {emp.Employee?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-base truncate">{emp.Employee}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{empId}</span>
                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 rounded-md">
                              {emp['Assigned Client'] || 'Internal'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Auto Calculated */}
                      <div className="col-span-3 flex flex-col items-center">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Auto Days</span>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 font-black text-slate-400 text-lg">
                          {autoVal}
                        </div>
                      </div>

                      {/* Manual Input */}
                      <div className="col-span-3 flex flex-col items-center">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-blue-500">Manual Override</span>
                        <div className="relative w-full max-w-[140px]">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={totalDaysInMonth}
                            placeholder={autoVal.toString()}
                            value={manualVal || ''}
                            onChange={(e) => handleDayChange(empId, e.target.value)}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border-2 outline-none font-black text-center text-xl transition-all",
                              isOverridden 
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100" 
                                : "border-slate-100 bg-white text-slate-400 focus:border-blue-200"
                            )}
                          />
                          {isOverridden && (
                            <button 
                              onClick={() => handleDayChange(empId, null)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex justify-end">
                        {isOverridden ? (
                          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                            <CheckCircle2 size={12} /> Overridden
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                            <Clock size={12} /> Auto-Sync
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <Users size={48} className="text-slate-200 mb-4" />
                <h4 className="text-lg font-bold text-slate-900">No employees to roll</h4>
                <p className="text-slate-500 text-sm">Adjust filters to find employees</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bulk Upload Modal Mock */}
      <div className="flex justify-center mt-8">
        <button 
          onClick={handleBulkUpload}
          className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-dashed border-slate-200 rounded-[32px] text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
        >
          <FileSpreadsheet size={24} className="group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <p className="font-black uppercase tracking-widest text-xs">Bulk Upload Attendance</p>
            <p className="text-[10px] font-medium opacity-60">Upload CSV provided by Client for massive updates</p>
          </div>
        </button>
      </div>
    </div>
  );
}
