"use client";
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, ShieldAlert, User, FileText, ChevronRight, Filter, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

export default function LeaveManager({ employees, leaveRequests = [], onSave, onApprove, onReject }) {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  });

  const leaveTypes = [
    { id: 'Casual Leave (CL)', allowed: 12 },
    { id: 'Sick Leave (SL)', allowed: 6 },
    { id: 'Earned Leave (EL)', allowed: 12 },
    { id: 'Loss of Pay (LOP)', allowed: 365 }
  ];

  const calculateBalances = (empId) => {
    if (!empId) return null;
    const balances = {};
    const currentYear = new Date().getFullYear();
    const empLeaves = leaveRequests.filter(r => 
      (r['Employee ID'] === empId || r.employeeId === empId) && 
      r.Status === 'Approved' &&
      new Date(r['Start Date']).getFullYear() === currentYear
    );

    leaveTypes.forEach(type => {
      const daysTaken = empLeaves
        .filter(l => l['Leave Type'] === type.id)
        .reduce((sum, l) => sum + (parseFloat(l.Days) || 0), 0);
      
      balances[type.id] = {
        total: type.allowed,
        taken: daysTaken,
        remaining: type.id.includes('LOP') ? '∞' : type.allowed - daysTaken
      };
    });

    return balances;
  };

  const selectedBalances = calculateBalances(formData.employeeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const employee = employees?.find(e => e['Employee ID'] === formData.employeeId || e.employeeId === formData.employeeId || e['ID'] === formData.employeeId);
    const days = calculateDays(formData.startDate, formData.endDate);
    
    if (!formData.leaveType.includes('LOP')) {
      const balance = selectedBalances?.[formData.leaveType]?.remaining || 0;
      if (balance !== '∞' && days > balance) {
        toast.error(`Insufficient balance. You only have ${balance} days left.`);
        return;
      }
    }

    const leaveRecord = {
      'Request ID': `LR${Date.now()}`,
      'Employee ID': formData.employeeId,
      'Employee Name': employee?.Employee || 'Unknown',
      'Leave Type': formData.leaveType,
      'Start Date': formData.startDate,
      'End Date': formData.endDate,
      'Days': days,
      'Reason': formData.reason,
      'Status': 'Pending',
      'Applied On': new Date().toLocaleDateString(),
    };

    try {
      await onSave(leaveRecord);
      toast.success('Leave request submitted successfully');
      setShowForm(false);
      setFormData({ employeeId: '', leaveType: '', startDate: '', endDate: '', reason: '', status: 'Pending' });
    } catch (error) {
      toast.error('Failed to submit leave request');
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-50';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const pendingCount = leaveRequests?.filter(r => r.Status === 'Pending').length || 0;
  const filteredRequests = leaveRequests?.filter(r => 
    (r['Employee Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r['Employee ID'] || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Time Off Central</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Clock size={16} className="text-amber-500" />
            {pendingCount} pending requests awaiting approval
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Apply New Leave
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <MiniStat label="Total Requests" value={leaveRequests?.length || 0} color="blue" icon={Calendar} />
        <MiniStat label="Pending" value={pendingCount} color="amber" icon={Clock} />
        <MiniStat label="Approved" value={leaveRequests?.filter(r => r.Status === 'Approved').length || 0} color="green" icon={CheckCircle} />
        <MiniStat label="Rejected" value={leaveRequests?.filter(r => r.Status === 'Rejected').length || 0} color="red" icon={XCircle} />
      </div>

      {/* Leave Feed */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-black text-slate-900 text-lg">Leave Request History</h3>
          <div className="relative w-full sm:w-auto sm:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? (
              filteredRequests.slice().reverse().map((request, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={request['Request ID'] || idx}
                  className="p-5 sm:p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Employee Info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-200 shrink-0 group-hover:border-blue-200 transition-colors">
                        {request['Employee Name'].charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 text-base sm:text-lg truncate">{request['Employee Name']}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{request['Employee ID']}</p>
                      </div>
                    </div>

                    {/* Leave Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-8 flex-1">
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Leave Type</p>
                        <p className="font-black text-slate-700 text-sm truncate">{request['Leave Type']}</p>
                        {request.Reason && <p className="text-xs text-slate-400 italic mt-1 truncate" title={request.Reason}>"{request.Reason}"</p>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-black text-slate-800">
                            {request.Days} <span className="text-xs text-slate-400">days</span>
                          </div>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <p className="text-xs font-bold text-slate-500">{new Date(request['Start Date']).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</p>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-center lg:justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(request.Status)}`}>
                          {request.Status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 lg:min-w-[200px] lg:justify-end">
                      {request.Status === 'Pending' ? (
                        <div className="flex gap-2 w-full lg:w-auto">
                          <button
                            onClick={() => onApprove && onApprove(request, idx)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-xl font-black text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() => onReject && onReject(request, idx)}
                            className="flex-1 lg:flex-none px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-black text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                          Processed on {request['Applied On']}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-20 text-center opacity-40">
                <FileText size={64} className="mx-auto mb-4" />
                <h4 className="text-xl font-black">No leave requests found</h4>
                <p className="font-bold">Adjust your search or apply for a new leave.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-3xl font-black">New Request</h3>
                    <p className="text-blue-100 font-bold mt-1 text-sm uppercase tracking-widest">Apply leave for workforce</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <User size={14} className="text-blue-500" /> Target Employee *
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      required
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-slate-50 appearance-none"
                    >
                      <option value="">Select Employee...</option>
                      {employees?.map((emp, idx) => (
                        <option key={idx} value={emp['ID'] || emp['Employee ID'] || emp.employeeId}>
                          {emp.Employee} ({emp['ID'] || emp.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.employeeId && selectedBalances && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
                      {leaveTypes.map(type => (
                        <div key={type.id} className="text-center">
                          <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter truncate">{type.id.split('(')[0]}</p>
                          <p className="text-lg font-black text-blue-700 mt-1">{selectedBalances[type.id]?.remaining}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Leave Type *</label>
                      <select
                        value={formData.leaveType}
                        onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-slate-50 appearance-none"
                      >
                        <option value="">Select Category</option>
                        {leaveTypes.map((type, idx) => (
                          <option key={idx} value={type.id}>{type.id}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Duration</label>
                      <div className="px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-black text-slate-700 flex items-center justify-between">
                        <span>{formData.startDate && formData.endDate ? calculateDays(formData.startDate, formData.endDate) : 0} Days</span>
                        <Calendar size={18} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Start Date *</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">End Date *</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                        min={formData.startDate}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason for Absence *</label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                      rows="3"
                      placeholder="Enter a brief reason for leave..."
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all border-2 border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-4 rounded-2xl font-black bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    Confirm Request <ChevronRight size={18} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className={`p-4 sm:p-6 rounded-[24px] border ${colors[color]} flex items-center justify-between shadow-sm relative overflow-hidden group`}>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-2xl sm:text-3xl font-black tracking-tighter">{value}</p>
      </div>
      <Icon size={32} className="absolute -right-1 -bottom-1 opacity-10 group-hover:scale-110 transition-transform duration-500" />
    </div>
  );
}
