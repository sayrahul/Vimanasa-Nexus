"use client";
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

export default function LeaveManager({ employees, leaveRequests = [], onSave, onApprove, onReject }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending'
  });

  const leaveTypes = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave', 'Unpaid Leave'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employee = employees?.find(e => e['Employee ID'] === formData.employeeId || e.employeeId === formData.employeeId);
    
    const leaveRecord = {
      'Request ID': `LR${Date.now()}`,
      'Employee ID': formData.employeeId,
      'Employee Name': employee?.Employee || `${employee?.firstName} ${employee?.lastName}` || 'Unknown',
      'Leave Type': formData.leaveType,
      'Start Date': formData.startDate,
      'End Date': formData.endDate,
      'Days': calculateDays(formData.startDate, formData.endDate),
      'Reason': formData.reason,
      'Status': 'Pending',
      'Applied On': new Date().toLocaleDateString(),
      'Approved By': '',
      'Approved On': ''
    };

    try {
      await onSave(leaveRecord);
      toast.success('Leave request submitted successfully');
      setShowForm(false);
      setFormData({
        employeeId: '',
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'Pending'
      });
    } catch (error) {
      toast.error('Failed to submit leave request');
      console.error(error);
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 text-green-600 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const pendingCount = leaveRequests?.filter(r => r.Status === 'Pending').length || 0;
  const approvedCount = leaveRequests?.filter(r => r.Status === 'Approved').length || 0;
  const rejectedCount = leaveRequests?.filter(r => r.Status === 'Rejected').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Leave Management</h2>
          <p className="text-slate-500 mt-1">Manage employee leave requests and approvals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          New Leave Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={leaveRequests?.length || 0} color="blue" icon={Calendar} />
        <StatCard label="Pending" value={pendingCount} color="amber" icon={Clock} />
        <StatCard label="Approved" value={approvedCount} color="green" icon={CheckCircle} />
        <StatCard label="Rejected" value={rejectedCount} color="red" icon={XCircle} />
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Leave Requests</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Days</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests?.length > 0 ? leaveRequests.map((request, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-slate-800">{request['Employee Name']}</p>
                      <p className="text-sm text-slate-500">{request['Employee ID']}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-700">{request['Leave Type']}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-semibold text-slate-700">{request['Start Date']}</p>
                      <p className="text-slate-500">to {request['End Date']}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">
                      {request.Days} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{request.Reason}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.Status)}`}>
                      {request.Status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {request.Status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApprove && onApprove(request, idx)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => onReject && onReject(request, idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No leave requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">New Leave Request</h3>
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
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
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
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    min={formData.startDate}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows="3"
                    placeholder="Please provide reason for leave..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                {formData.startDate && formData.endDate && (
                  <div className="md:col-span-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm font-bold text-blue-800">
                      Total Days: {calculateDays(formData.startDate, formData.endDate)} days
                    </p>
                  </div>
                )}
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
                  className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  Submit Request
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
    red: 'bg-red-50 text-red-600 border-red-200',
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
