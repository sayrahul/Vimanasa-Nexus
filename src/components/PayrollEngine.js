"use client";
import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Calculator, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Download, 
  Search, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  Users,
  ChevronRight,
  Printer
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { generateSalarySlip } from '@/lib/pdfGenerator';
import ExportMenu from '@/components/ExportMenu';
import { cn } from '@/lib/utils';

export default function PayrollEngine({ employees = [], attendanceData = [], monthlyAttendanceData = [], onSavePayroll }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('All');

  // Filter deployed employees
  const activeEmployees = employees.filter(e => e.Status !== 'Inactive');
  const uniqueClients = [...new Set(activeEmployees.map(e => e['Assigned Client']).filter(Boolean))].sort();

  const getDaysInMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-');
    return new Date(year, month, 0).getDate();
  };

  const totalDaysInMonth = getDaysInMonth(selectedMonth);

  // Calculate Payroll for all active employees
  const payrollData = useMemo(() => {
    return activeEmployees.map(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      
      // Get attendance records for this month
      const monthRecords = attendanceData.filter(r => 
        (r['Employee ID'] === empId || r.employeeId === empId) && 
        r.Date?.startsWith(selectedMonth)
      );

      // Attendance Metrics
      const presentDays = monthRecords.filter(r => r.Status === 'Present').length;
      const halfDays = monthRecords.filter(r => r.Status === 'Half Day').length;
      const leaveDays = monthRecords.filter(r => r.Status === 'On Leave').length;
      const absentDays = monthRecords.filter(r => r.Status === 'Absent').length;
      
      const payableDaysCalculated = presentDays + (halfDays * 0.5) + leaveDays;

      // Check for Manual Override from Attendance Roll
      const manualRecord = monthlyAttendanceData.find(r => 
        (r.employee_id === empId || r['Employee ID'] === empId) && 
        (r.Date?.startsWith(selectedMonth) || r.date?.startsWith(selectedMonth))
      );
      
      const isOverridden = manualRecord !== undefined;
      const payableDays = isOverridden ? parseFloat(manualRecord.payable_days) : payableDaysCalculated;
      const otHours = isOverridden ? parseFloat(manualRecord.overtime_hours || 0) : 0;

      // Base Salary Details
      const basicSalaryRaw = parseFloat(emp['Basic Salary']) || 0;
      const hraRaw = parseFloat(emp['HRA']) || 0;
      const allowancesRaw = parseFloat(emp['Allowances']) || 0;
      const totalPayRate = parseFloat(emp['Total Pay Rate']) || (basicSalaryRaw + hraRaw + allowancesRaw);

      // Calculated (Prorated) Earnings
      const dailyBasic = basicSalaryRaw / totalDaysInMonth;
      const dailyHra = hraRaw / totalDaysInMonth;
      const dailyAllowances = allowancesRaw / totalDaysInMonth;

      const earnedBasic = dailyBasic * payableDays;
      const earnedHra = dailyHra * payableDays;
      const earnedAllowances = dailyAllowances * payableDays;

      // Overtime Calculation (Hourly Rate = Daily Gross / 8)
      const hourlyRate = (totalPayRate / totalDaysInMonth) / 8;
      const overtimePay = otHours * hourlyRate;

      const grossSalary = earnedBasic + earnedHra + earnedAllowances + overtimePay;

      // Deductions Rules
      let pfDeduction = 0;
      let esicDeduction = 0;
      const hasPF = !!emp['PF Number'];
      const hasESIC = !!emp['ESIC Number'];

      // Rule: Deduct PF (12% of Earned Basic)
      if (hasPF) {
        pfDeduction = earnedBasic * 0.12;
      }

      // Rule: Deduct ESIC (0.75% of Gross) ONLY IF Gross <= 21,000
      if (hasESIC && grossSalary <= 21000) {
        esicDeduction = grossSalary * 0.0075; // 0.75%
      }

      const totalDeductions = pfDeduction + esicDeduction;
      const netSalary = grossSalary - totalDeductions;

      // Validation Rules
      const errors = [];
      if (!hasPF && basicSalaryRaw > 0) {
        errors.push("Missing PF Number");
      }

      return {
        ...emp,
        empId,
        payableDays,
        absentDays,
        basicSalaryRaw,
        earnedBasic,
        earnedHra,
        earnedAllowances,
        otHours,
        overtimePay,
        grossSalary,
        pfDeduction,
        esicDeduction,
        totalDeductions,
        netSalary,
        errors,
        isOverridden,
        isReady: errors.length === 0 && payableDays > 0
      };
    });
  }, [activeEmployees, attendanceData, selectedMonth, totalDaysInMonth]);

  const totalPayrollCost = payrollData.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalNetPayout = payrollData.reduce((sum, p) => sum + p.netSalary, 0);

  const handleGeneratePayslip = async (data) => {
    try {
      const [year, month] = selectedMonth.split('-');
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

      const slipData = {
        employeeId: data.empId,
        firstName: data.Employee?.split(' ')[0] || '',
        lastName: data.Employee?.split(' ').slice(1).join(' ') || '',
        designation: data.Role || 'Employee',
        department: data['Assigned Client'] || 'Bench',
        dateOfJoining: data['Date of Joining'] || 'N/A',
        panNumber: data.PAN || 'N/A',
        bankName: data['Bank Name'] || 'N/A',
        accountNumber: data['Bank Account'] || 'N/A',
        ifscCode: data['IFSC Code'] || 'N/A',
        pfNumber: data['PF Number'] || 'N/A',
        esicNumber: data['ESIC Number'] || 'N/A',
        
        // Calculated Earnings
        basicSalary: data.earnedBasic,
        hra: data.earnedHra,
        conveyanceAllowance: data.earnedAllowances * 0.4,
        medicalAllowance: data.earnedAllowances * 0.3,
        specialAllowance: data.earnedAllowances * 0.3,
        
        // Calculated Deductions
        pfDeduction: data.pfDeduction,
        esicDeduction: data.esicDeduction
      };

      await generateSalarySlip(slipData, monthName, year);
      toast.success(`Payslip generated for ${data.Employee}`);
    } catch (error) {
      toast.error('Failed to generate payslip');
    }
  };

  const handleRunPayroll = async () => {
    const readyEmployees = payrollData.filter(p => p.isReady);
    if (readyEmployees.length === 0) {
      toast.error('No employees ready for payroll generation.');
      return;
    }

    setIsProcessing(true);
    try {
      const payrollRecord = {
        'Month': selectedMonth,
        'Total Employees': readyEmployees.length,
        'Total Gross': totalPayrollCost.toFixed(2),
        'Total Payout': totalNetPayout.toFixed(2),
        'Total PF Ded': readyEmployees.reduce((s, p) => s + p.pfDeduction, 0).toFixed(2),
        'Total ESIC Ded': readyEmployees.reduce((s, p) => s + p.esicDeduction, 0).toFixed(2),
        'Status': 'Processed',
        'Processed Date': new Date().toISOString()
      };

      if (onSavePayroll) {
        await onSavePayroll(payrollRecord);
      }
      toast.success(`Payroll processed for ${readyEmployees.length} employees.`);
    } catch (error) {
      toast.error('Failed to run payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportData = payrollData.map(p => ({
    'Employee ID': p.empId,
    'Employee Name': p.Employee,
    'Client Site': p['Assigned Client'] || 'Bench',
    'Payable Days': p.payableDays,
    'Gross Salary': p.grossSalary.toFixed(2),
    'PF Deduction': p.pfDeduction.toFixed(2),
    'ESIC Deduction': p.esicDeduction.toFixed(2),
    'Net Payout': p.netSalary.toFixed(2),
    'Bank Account': p['Bank Account'] || 'N/A',
    'IFSC Code': p['IFSC Code'] || 'N/A'
  }));

  const filteredData = payrollData.filter(data => {
    const matchesSearch = (data.Employee || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (data.empId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === 'All' || data['Assigned Client'] === clientFilter;
    return matchesSearch && matchesClient;
  });

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Calculator size={24} className="text-indigo-600" />
            </div>
            Payroll Engine
          </h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm sm:text-base">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Automated compliance & payout management
          </p>
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <ExportMenu 
            data={exportData} 
            filename={`Payroll_${selectedMonth}.csv`}
            customTrigger={
              <button className="flex-1 lg:flex-none px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Download size={16} /> EXPORT SHEET
              </button>
            }
          />
          <button
            onClick={handleRunPayroll}
            disabled={isProcessing || payrollData.length === 0}
            className="flex-1 lg:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            {isProcessing ? 'Processing...' : 'Run Master Payroll'}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Control Card */}
      <div className="bg-white/40 backdrop-blur-xl rounded-[32px] border border-slate-200/60 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Month Selector */}
          <div className="lg:col-span-4 space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reporting Period</label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 transition-transform group-hover:scale-110" size={20} />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 outline-none font-black text-slate-800 bg-white text-lg transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-100 px-2 py-1 rounded-lg text-[10px] font-black text-slate-500">
                {totalDaysInMonth} DAYS
              </div>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1 h-16 w-px bg-slate-200 mx-auto" />

          {/* Key Metrics */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-6 sm:gap-12">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Total Gross</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-slate-400">₹</span>
                <span className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                  {totalPayrollCost.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Net Payout</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-emerald-400">₹</span>
                <span className="text-2xl sm:text-4xl font-black text-emerald-600 tracking-tighter">
                  {totalNetPayout.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-slate-50 transition-all font-semibold text-sm"
          />
        </div>
        <div className="flex gap-3">
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

      {/* Main Content Area */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Header - Desktop Only */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-3">Employee</div>
          <div className="col-span-1 text-center">Days</div>
          <div className="col-span-2 text-right">Gross (₹)</div>
          <div className="col-span-2 text-right text-rose-400">Deductions</div>
          <div className="col-span-2 text-right">Net Pay (₹)</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Content Body */}
        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredData.length > 0 ? (
              filteredData.map((data, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={data.empId || idx}
                  className={cn(
                    "group p-6 lg:px-8 lg:py-5 hover:bg-slate-50/80 transition-colors",
                    !data.isReady && "bg-rose-50/30"
                  )}
                >
                  <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-4 lg:gap-4">
                    {/* Employee Info */}
                    <div className="col-span-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 group-hover:bg-white group-hover:border-indigo-200 transition-all">
                        {data.Employee?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{data.Employee}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{data.empId}</span>
                          {data.grossSalary > 21000 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500 text-[8px] font-black uppercase">ESIC Exempt</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats Group - Mobile Card Layout Style */}
                    <div className="flex lg:grid lg:col-span-7 grid-cols-2 lg:grid-cols-7 gap-4 items-center">
                      <div className="lg:col-span-1 flex flex-col items-center lg:items-center">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Worked</span>
                        <div className="flex items-baseline gap-1">
                          <span className={cn("text-base font-black", data.payableDays > 0 ? "text-slate-800" : "text-rose-500")}>
                            {data.payableDays}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">/{totalDaysInMonth}</span>
                        </div>
                        {data.isOverridden && (
                          <div className="mt-1 text-[8px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-1 rounded border border-blue-100">
                            Manual Override
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2 text-right">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Gross</span>
                        <div className="font-bold text-slate-700 text-sm">₹{data.grossSalary.toLocaleString('en-IN', {maximumFractionDigits: 0})}</div>
                        {data.overtimePay > 0 && (
                          <div className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter mt-0.5">
                            +₹{Math.round(data.overtimePay)} OT
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2 text-right">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Total Ded.</span>
                        <span className="font-bold text-rose-500 text-sm">-₹{data.totalDeductions.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                      </div>

                      <div className="lg:col-span-2 text-right lg:bg-emerald-50/30 lg:py-2 lg:px-4 lg:rounded-xl">
                        <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Net Pay</span>
                        <span className="font-black text-emerald-600 text-base">₹{data.netSalary.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                      </div>
                    </div>

                    {/* Status & Action */}
                    <div className="col-span-2 flex items-center justify-between lg:justify-center gap-4">
                      <div className="flex-1 lg:flex-none">
                        {data.isReady ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <CheckCircle size={12} /> Ready
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
                            <ShieldAlert size={12} /> Blocked
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleGeneratePayslip(data)}
                        disabled={!data.isReady}
                        className="p-3 bg-white text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed group-hover:border-indigo-200 group-hover:shadow-sm"
                        title="Generate Payslip"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Errors / Notes */}
                  {!data.isReady && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-4 p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center gap-3"
                    >
                      <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                      <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">
                        {data.payableDays === 0 ? 'Zero attendance recorded for this month' : data.errors.join(' • ')}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                  <Users size={32} />
                </div>
                <h4 className="text-xl font-black text-slate-900">No employees found</h4>
                <p className="text-slate-500 font-medium max-w-xs mt-2">Try adjusting your filters or search term to find what you're looking for.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-slate-900 rounded-[32px] text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Processing</p>
            <p className="text-3xl font-black">{filteredData.length}</p>
          </div>
          <Users size={48} className="absolute -right-2 -bottom-2 text-white/5" />
        </div>
        
        <div className="p-6 bg-indigo-600 rounded-[32px] text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2">Compliance Ready</p>
            <p className="text-3xl font-black">{filteredData.filter(p => p.isReady).length}</p>
          </div>
          <CheckCircle size={48} className="absolute -right-2 -bottom-2 text-white/5" />
        </div>

        <div className="p-6 bg-rose-500 rounded-[32px] text-white flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-200 mb-2">Action Required</p>
            <p className="text-3xl font-black">{filteredData.filter(p => !p.isReady).length}</p>
          </div>
          <AlertTriangle size={48} className="absolute -right-2 -bottom-2 text-white/5" />
        </div>
      </div>
    </div>
  );
}
