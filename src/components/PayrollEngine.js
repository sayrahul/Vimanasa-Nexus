"use client";
import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, Calculator, FileText, AlertTriangle, CheckCircle, ShieldAlert, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateSalarySlip } from '@/lib/pdfGenerator';
import ExportMenu from '@/components/ExportMenu';

export default function PayrollEngine({ employees = [], attendanceData = [], onSavePayroll }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter deployed employees
  const activeEmployees = employees.filter(e => e.Status !== 'Inactive');

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
      
      const payableDays = presentDays + (halfDays * 0.5) + leaveDays;

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

      const grossSalary = earnedBasic + earnedHra + earnedAllowances;

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
      if (grossSalary > 21000 && hasESIC) {
        // Not an error, just logic rule executed, maybe info
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
        grossSalary,
        pfDeduction,
        esicDeduction,
        totalDeductions,
        netSalary,
        errors,
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
        conveyanceAllowance: data.earnedAllowances * 0.4, // Split generic allowance for payslip format
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
      console.error(error);
    }
  };

  const handleRunPayroll = async () => {
    const readyEmployees = payrollData.filter(p => p.isReady);
    if (readyEmployees.length === 0) {
      toast.error('No employees ready for payroll generation. Check attendance and missing PF numbers.');
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
      toast.success(`Payroll processed successfully for ${readyEmployees.length} employees.`);
    } catch (error) {
      toast.error('Failed to run payroll');
    } finally {
      setIsProcessing(false);
    }
  };

  // Prepare CSV Export Data
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Calculator className="text-purple-600" /> Automated Payroll Engine
          </h2>
          <p className="text-slate-500 mt-1">Calculate PF, ESIC, and Net Pay automatically from attendance data</p>
        </div>
      </div>

      {/* Controls & Summary */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-8 justify-between">
        <div className="flex-1 space-y-4">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Payroll Month</label>
          <div className="flex items-center gap-4">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-6 py-4 rounded-2xl border-2 border-purple-100 focus:ring-4 focus:ring-purple-50 focus:border-purple-500 outline-none font-black text-slate-700 bg-purple-50 text-xl"
            />
            <div className="text-sm font-bold text-slate-500">
              Total Days: <span className="text-purple-600">{totalDaysInMonth}</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-slate-100"></div>

        <div className="flex-1 grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Gross Salary</p>
            <p className="text-3xl font-black text-slate-800">₹{totalPayrollCost.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 mb-1">Net Payout</p>
            <p className="text-3xl font-black text-green-600">₹{totalNetPayout.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-slate-100"></div>

        <div className="flex flex-col justify-center gap-3">
          <button
            onClick={handleRunPayroll}
            disabled={isProcessing || payrollData.length === 0}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {isProcessing ? 'Processing...' : 'Run Master Payroll'}
          </button>
          <ExportMenu data={exportData} filename={`Payroll_Bank_Sheet_${selectedMonth}.csv`} />
        </div>
      </div>

      {/* Payroll Processing Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <DollarSign className="text-green-500" /> Employee Salary Breakdown
          </h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
               <span className="w-3 h-3 rounded-full bg-green-500"></span> Ready ({payrollData.filter(p => p.isReady).length})
             </div>
             <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
               <span className="w-3 h-3 rounded-full bg-red-500"></span> Blocked ({payrollData.filter(p => !p.isReady).length})
             </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-bold border-b-2 border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4 text-center border-l border-slate-100">Payable<br/>Days</th>
                <th className="px-6 py-4 text-right border-l border-slate-100">Gross<br/>Salary (₹)</th>
                <th className="px-6 py-4 text-right text-red-500 border-l border-slate-100">PF Ded.<br/>(12%)</th>
                <th className="px-6 py-4 text-right text-red-500">ESIC Ded.<br/>(0.75%)</th>
                <th className="px-6 py-4 text-right text-green-600 border-l border-slate-100 font-black text-xs">Net Payout</th>
                <th className="px-6 py-4 text-center border-l border-slate-100">Status</th>
                <th className="px-6 py-4 text-right border-l border-slate-100">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {payrollData.map((data, idx) => (
                <tr key={idx} className={`hover:bg-slate-50 transition-colors ${!data.isReady ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{data.Employee}</div>
                    <div className="text-xs text-slate-500 flex gap-2 mt-1">
                      <span>{data.empId}</span>
                      {data.grossSalary > 21000 && <span className="text-purple-600 bg-purple-50 px-1.5 rounded font-bold border border-purple-100">ESIC Exempt</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center border-l border-slate-100">
                    <div className={`font-black text-lg ${data.payableDays > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                      {data.payableDays}
                    </div>
                    <div className="text-[10px] text-slate-400">out of {totalDaysInMonth}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-700 border-l border-slate-100">
                    {data.grossSalary.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600 border-l border-slate-100">
                    {data.pfDeduction > 0 ? data.pfDeduction.toLocaleString('en-IN', {maximumFractionDigits: 2}) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    {data.esicDeduction > 0 ? data.esicDeduction.toLocaleString('en-IN', {maximumFractionDigits: 2}) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-black text-green-600 border-l border-slate-100 text-base bg-green-50/30">
                    {data.netSalary.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 border-l border-slate-100">
                    {data.isReady ? (
                      <div className="flex items-center justify-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold border border-green-200">
                        <CheckCircle size={14} /> Ready
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-[10px] font-bold border border-red-200 text-center">
                        <ShieldAlert size={14} /> 
                        {data.payableDays === 0 ? '0 Days Worked' : data.errors.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right border-l border-slate-100">
                    <button
                      onClick={() => handleGeneratePayslip(data)}
                      disabled={!data.isReady}
                      className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-purple-200 shadow-sm"
                      title="Generate Payslip PDF"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {payrollData.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No active employees to process payroll.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
