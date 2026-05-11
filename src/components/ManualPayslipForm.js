"use client";
import React, { useState } from 'react';
import { 
  X, 
  Save, 
  User, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  CreditCard, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export default function ManualPayslipForm({ employees = [], onSave, onClose }) {
  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().toISOString().slice(0, 7),
    gross_salary: '',
    deductions: '',
    net_salary: '',
    remarks: 'Manual processing'
  });

  const selectedEmployee = employees.find(e => (e.id === formData.employee_id || e.employee_id === formData.employee_id));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate net if gross or deductions change
      if (name === 'gross_salary' || name === 'deductions') {
        const gross = parseFloat(updated.gross_salary) || 0;
        const ded = parseFloat(updated.deductions) || 0;
        updated.net_salary = Math.max(0, gross - ded).toString();
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.gross_salary) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await onSave({
        ...formData,
        gross_salary: parseFloat(formData.gross_salary),
        deductions: parseFloat(formData.deductions || 0),
        net_salary: parseFloat(formData.net_salary),
        status: 'Issued',
        processed_at: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      toast.error('Failed to issue payslip');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden max-w-2xl w-full mx-auto"
    >
      <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <DollarSign className="text-emerald-400" size={28} />
            Manual Payslip Issuance
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Direct payroll processing bypass</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm appearance-none"
                required
              >
                <option value="">Choose Employee...</option>
                {employees.map(emp => (
                  <option key={emp.id || emp.employee_id} value={emp.id || emp.employee_id}>
                    {emp.Employee || emp.name} ({emp.id || emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payroll Month</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
              <input
                type="month"
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
                required
              />
            </div>
          </div>

          {/* Gross Salary */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gross Earnings (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
              <input
                type="number"
                name="gross_salary"
                placeholder="0.00"
                value={formData.gross_salary}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-50 transition-all font-black text-lg text-emerald-700"
                required
              />
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Deductions (₹)</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
              <input
                type="number"
                name="deductions"
                placeholder="0.00"
                value={formData.deductions}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-rose-50 transition-all font-black text-lg text-rose-600"
              />
            </div>
          </div>
        </div>

        {/* Net Salary Display */}
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Calculated Net Payout</p>
              <h4 className="text-3xl font-black text-emerald-700 tracking-tight">₹{parseFloat(formData.net_salary || 0).toLocaleString()}</h4>
           </div>
           <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-200">
              <CheckCircle size={24} />
           </div>
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Remarks</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Reason for manual issuance..."
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm min-h-[100px]"
            />
          </div>
        </div>

        <div className="pt-4 flex gap-4">
           <button 
             type="button" 
             onClick={onClose}
             className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
           >
             Cancel
           </button>
           <button 
             type="submit"
             className="flex-[2] px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
           >
             <Save size={18} />
             Finalize & Issue Payslip
           </button>
        </div>
      </form>
    </motion.div>
  );
}
