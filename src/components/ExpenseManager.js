"use client";
import React, { useState } from 'react';
import { DollarSign, Upload, CheckCircle, XCircle, Clock, Plus, FileText, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ExpenseManager({ employees, expenses = [], onSave, onApprove, onReject }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receiptUrl: '',
    status: 'Pending'
  });

  const expenseCategories = [
    'Travel',
    'Food & Accommodation',
    'Office Supplies',
    'Training & Development',
    'Medical',
    'Communication',
    'Client Entertainment',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employee = employees?.find(e => e['Employee ID'] === formData.employeeId || e.employeeId === formData.employeeId);
    
    const expenseRecord = {
      'Claim ID': `EXP${Date.now()}`,
      'Employee ID': formData.employeeId,
      'Employee Name': employee?.Employee || `${employee?.firstName} ${employee?.lastName}` || 'Unknown',
      'Category': formData.category,
      'Amount': `₹${formData.amount}`,
      'Date': formData.date,
      'Description': formData.description,
      'Receipt URL': formData.receiptUrl,
      'Status': 'Pending',
      'Submitted On': new Date().toLocaleDateString(),
      'Manager Status': 'Pending',
      'Finance Status': 'Pending',
      'Approved By': '',
      'Approved On': '',
      'Paid On': ''
    };

    try {
      await onSave(expenseRecord);
      toast.success('Expense claim submitted successfully');
      setShowForm(false);
      setFormData({
        employeeId: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        receiptUrl: '',
        status: 'Pending'
      });
    } catch (error) {
      toast.error('Failed to submit expense claim');
      console.error(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'paid':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'processing':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const pendingCount = expenses?.filter(e => e.Status === 'Pending').length || 0;
  const approvedCount = expenses?.filter(e => e.Status === 'Approved' || e.Status === 'Paid').length || 0;
  const rejectedCount = expenses?.filter(e => e.Status === 'Rejected').length || 0;
  const totalAmount = expenses?.reduce((sum, e) => {
    const amount = parseFloat(e.Amount?.replace(/[₹,]/g, '') || 0);
    return sum + amount;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Expense Management</h2>
          <p className="text-slate-500 mt-1">Submit and manage employee expense claims</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          New Expense Claim
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Claims" value={expenses?.length || 0} color="blue" icon={FileText} />
        <StatCard label="Pending" value={pendingCount} color="amber" icon={Clock} />
        <StatCard label="Approved" value={approvedCount} color="green" icon={CheckCircle} />
        <StatCard label="Total Amount" value={`₹${totalAmount.toLocaleString('en-IN')}`} color="purple" icon={DollarSign} />
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Expense Claims</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Claim ID</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Description</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses?.length > 0 ? expenses.map((expense, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{expense['Claim ID']}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-800">{expense['Employee Name']}</p>
                      <p className="text-sm text-slate-500">{expense['Employee ID']}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">{expense.Category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-lg font-black text-green-600">{expense.Amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{expense.Date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{expense.Description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(expense.Status)}`}>
                      {expense.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {expense['Receipt URL'] && (
                        <a
                          href={expense['Receipt URL']}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Receipt"
                        >
                          <FileText size={18} />
                        </a>
                      )}
                      {expense.Status === 'Pending' && (
                        <>
                          <button
                            onClick={() => onApprove && onApprove(expense, idx)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => onReject && onReject(expense, idx)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    No expense claims found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Claim Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">New Expense Claim</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                  >
                    <option value="">Select Employee</option>
                    {employees?.map((emp, idx) => (
                      <option key={idx} value={emp['Employee ID'] || emp.employeeId}>
                        {emp.Employee || `${emp.firstName} ${emp.lastName}`} ({emp['Employee ID'] || emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    {expenseCategories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="5000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="3"
                    placeholder="Provide details about the expense..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none resize-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Receipt URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.receiptUrl}
                      onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none"
                    />
                    <button
                      type="button"
                      className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
                    >
                      <Upload size={18} />
                      Upload
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Upload receipt to Google Drive and paste the link here</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold opacity-80">{label}</span>
        <Icon size={20} />
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
