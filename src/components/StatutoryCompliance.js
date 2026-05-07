"use client";
import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, UploadCloud, FileText, AlertTriangle, ChevronRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function StatutoryCompliance({ compliances = [], onSave }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ amount: '', dateFiled: '', receiptRef: '' });

  // Standard compliance calendar
  const complianceTasks = [
    { id: 'pf', name: 'PF ECR Filing', dueDay: 15, type: 'Monthly', desc: 'Provident Fund Electronic Challan cum Return' },
    { id: 'esic', name: 'ESIC Challan', dueDay: 15, type: 'Monthly', desc: 'Employees State Insurance Corporation Contribution' },
    { id: 'pt', name: 'Professional Tax', dueDay: 15, type: 'Monthly', desc: 'State Professional Tax Deposit' },
    { id: 'tds', name: 'TDS Payment', dueDay: 7, type: 'Monthly', desc: 'Tax Deducted at Source Deposit' },
    { id: 'gst', name: 'GSTR-1 / GSTR-3B', dueDay: 20, type: 'Monthly', desc: 'Goods and Services Tax Returns' },
    { id: 'tds-ret', name: 'TDS Return', dueDay: 31, type: 'Quarterly', desc: 'Quarterly TDS Return Filing (Form 24Q/26Q)' }
  ];

  const getStatus = (taskId) => {
    const record = compliances.find(c => c.taskId === taskId && c.month === selectedMonth);
    if (record && record.status === 'Filed') return 'Filed';
    
    // Check if overdue
    const task = complianceTasks.find(t => t.id === taskId);
    const [year, month] = selectedMonth.split('-');
    const dueDate = new Date(year, month - 1, task.dueDay); // month is 0-indexed in JS
    
    // If we are past the due date and it's not filed, it's overdue
    if (new Date() > dueDate && selectedMonth === new Date().toISOString().slice(0, 7)) {
        return 'Overdue';
    }
    return 'Pending';
  };

  const handleUploadClick = (task) => {
    setSelectedTask(task);
    setShowUploadModal(true);
    setFormData({ amount: '', dateFiled: new Date().toISOString().split('T')[0], receiptRef: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const record = {
      taskId: selectedTask.id,
      taskName: selectedTask.name,
      month: selectedMonth,
      status: 'Filed',
      amountPaid: parseFloat(formData.amount),
      dateFiled: formData.dateFiled,
      receiptRef: formData.receiptRef,
      filedAt: new Date().toISOString()
    };

    try {
      await onSave(record);
      toast.success(`${selectedTask.name} marked as Filed!`);
      setShowUploadModal(false);
    } catch (error) {
      toast.error('Failed to save compliance record.');
    }
  };

  const totalPaid = compliances
    .filter(c => c.month === selectedMonth && c.status === 'Filed')
    .reduce((sum, c) => sum + (c.amountPaid || 0), 0);

  const filedCount = complianceTasks.filter(t => getStatus(t.id) === 'Filed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={32} /> Statutory Compliance
          </h2>
          <p className="text-slate-500 mt-1">Track and file PF, ESIC, GST, and Tax returns</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Calendar className="text-slate-400" size={20} />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="font-bold text-slate-700 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Progress & Summary */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1 w-full">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Filing Progress</p>
              <h3 className="text-2xl font-black text-slate-800">{filedCount} / {complianceTasks.length} Completed</h3>
            </div>
            <p className="text-emerald-600 font-bold">{Math.round((filedCount / complianceTasks.length) * 100)}%</p>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(filedCount / complianceTasks.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="hidden md:block w-px h-16 bg-slate-200"></div>

        <div className="flex-1 w-full flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Statutory Paid</p>
            <p className="text-3xl font-black text-slate-800">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Compliance Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {complianceTasks.map((task) => {
          const status = getStatus(task.id);
          const record = compliances.find(c => c.taskId === task.id && c.month === selectedMonth);
          
          let statusStyles = '';
          let Icon = Clock;
          
          if (status === 'Filed') {
            statusStyles = 'bg-emerald-50 border-emerald-200 text-emerald-700';
            Icon = CheckCircle;
          } else if (status === 'Overdue') {
            statusStyles = 'bg-red-50 border-red-200 text-red-700';
            Icon = AlertTriangle;
          } else {
            statusStyles = 'bg-slate-50 border-slate-200 text-slate-600';
            Icon = Clock;
          }

          return (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${statusStyles}`}>
                    <Icon size={14} /> {status}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Due Date</p>
                    <p className="font-black text-slate-700">{task.dueDay}th</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-800 mb-1">{task.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{task.desc}</p>
                
                {status === 'Filed' && record && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Paid:</span>
                      <span className="font-bold text-slate-700">₹{record.amountPaid?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-bold text-slate-700">{new Date(record.dateFiled).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ref:</span>
                      <span className="font-bold text-slate-700 truncate max-w-[120px]">{record.receiptRef}</span>
                    </div>
                  </div>
                )}
              </div>

              {status !== 'Filed' && (
                <button
                  onClick={() => handleUploadClick(task)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <UploadCloud size={18} /> Mark as Filed
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-2xl font-black text-slate-800">File {selectedTask.name}</h3>
              <p className="text-slate-500 text-sm mt-1">Record the payment and challan details for {selectedMonth}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Amount Paid (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date Filed</label>
                <input
                  type="date"
                  required
                  value={formData.dateFiled}
                  onChange={e => setFormData({...formData, dateFiled: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Challan / Receipt Ref No.</label>
                <input
                  type="text"
                  required
                  value={formData.receiptRef}
                  onChange={e => setFormData({...formData, receiptRef: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} /> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
