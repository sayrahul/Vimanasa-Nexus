"use client";
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus, ShieldAlert } from 'lucide-react';
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

  const leaveTypes = [
    { id: 'Casual Leave (CL)', allowed: 12 },
    { id: 'Sick Leave (SL)', allowed: 6 },
    { id: 'Earned Leave (EL)', allowed: 12 }, // Accrues 1 per month typically
    { id: 'Loss of Pay (LOP)', allowed: 365 } // Unpaid, for payroll deduction
  ];

  // Calculate balances on the fly
  const calculateBalances = (empId) => {
    if (!empId) return null;
    const balances = {};
    
    // Get all APPROVED leaves for this employee in current year
    const currentYear = new Date().getFullYear();
    const empLeaves = leaveRequests.filter(r => 
      (r['Employee ID'] === empId || r.employeeId === empId) && 
      r.Status === 'Approved' &&
      new Date(r['Start Date']).getFullYear() === currentYear
    );

    leaveTypes.forEach(type => {
      // Sum the 'Days' taken for this specific leave type
      const daysTaken = empLeaves
        .filter(l => l['Leave Type'] === type.id)
        .reduce((sum, l) => sum + (parseFloat(l.Days) || 0), 0);
      
      balances[type.id] = {
        total: type.allowed,
        taken: daysTaken,
        remaining: type.id.includes('LOP') ? 'N/A' : type.allowed - daysTaken
      };
    });

    return balances;
  };

  const selectedBalances = calculateBalances(formData.employeeId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employee = employees?.find(e => e['Employee ID'] === formData.employeeId || e.employeeId === formData.employeeId || e['ID'] === formData.employeeId);
    
    const days = calculateDays(formData.startDate, formData.endDate);
    
    // Prevent applying if balance is exceeded (unless LOP)
    if (!formData.leaveType.includes('LOP')) {
      const balance = selectedBalances?.[formData.leaveType]?.remaining || 0;
      if (days > balance) {
        toast.error(`Insufficient balance. You only have ${balance} days left for ${formData.leaveType}. Please choose LOP.`);
        return;
      }
    }

    const leaveRecord = {
      'Request ID': `LR${Date.now()}`,
      'Employee ID': formData.employeeId,
      'Employee Name': employee?.Employee || `${employee?.firstName} ${employee?.lastName}` || 'Unknown',
      'Leave Type': formData.leaveType,
      'Start Date': formData.startDate,
      'End Date': formData.endDate,
      'Days': days,
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
    if (!start || !end) return 0;
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Leave Management</h2>
          <p className="text-slate-500 mt-1">Manage employee leave requests and balances</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2 shadow-sm"
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
      <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Leave Requests</h3>
          <p className="text-xs text-slate-500 mt-1">Manage employee leave applications</p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Employee</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Leave Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Balance Effect</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests?.length > 0 ? leaveRequests.slice().reverse().map((request, idx) => {
                const balances = calculateBalances(request['Employee ID'] || request.employeeId);
                const reqType = request['Leave Type'];
                const remaining = balances?.[reqType]?.remaining;

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-800">{request['Employee Name']}</p>
                        <p className="text-sm text-slate-500">{request['Employee ID']}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-700">{request['Leave Type']}</span>
                      <p className="text-xs text-slate-500 mt-1 max-w-[150px] truncate" title={request.Reason}>
                        "{request.Reason}"
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-bold text-slate-700">{new Date(request['Start Date']).toLocaleDateString()}</p>
                        <p className="text-slate-500 text-xs">to {new Date(request['End Date']).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold text-sm">
                          -{request.Days}
                        </span>
                        {remaining !== undefined && remaining !== 'N/A' && request.Status === 'Pending' && (
                          <span className="text-xs font-medium text-slate-500">
                            ({remaining} left)
                          </span>
                        )}
                        {reqType?.includes('LOP') && (
                          <span className="text-xs font-bold text-red-500 flex items-center gap-1"><ShieldAlert size={12}/> Deduct</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(request.Status)}`}>
                        {request.Status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {request.Status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => onApprove && onApprove(request, idx)}
                            className="px-3 py-1.5 text-sm font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => onReject && onReject(request, idx)}
                            className="px-3 py-1.5 text-sm font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-3 space-y-3">
          {leaveRequests?.length > 0 ? leaveRequests.slice().reverse().map((request, idx) => {
            const balances = calculateBalances(request['Employee ID'] || request.employeeId);
            const reqType = request['Leave Type'];
            const remaining = balances?.[reqType]?.remaining;

            return (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                {/* Employee Info */}
                <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-200">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate">{request['Employee Name']}</h4>
                    <p className="text-xs text-slate-500">{request['Employee ID']}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ml-2 ${getStatusColor(request.Status)}`}>
                    {request.Status}
                  </span>
                </div>

                {/* Leave Details */}
                <div className="space-y-2 mb-3">
                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">Leave Type</div>
                    <div className="text-sm font-bold text-slate-700">{request['Leave Type']}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">Duration</div>
                    <div className="text-sm text-slate-700">
                      {new Date(request['Start Date']).toLocaleDateString()} - {new Date(request['End Date']).toLocaleDateString()}
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold text-xs">
                        {request.Days} days
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 font-bold mb-1">Reason</div>
                    <div className="text-sm text-slate-600 italic">"{request.Reason}"</div>
                  </div>

                  {remaining !== undefined && remaining !== 'N/A' && request.Status === 'Pending' && (
                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Balance remaining: {remaining} days
                    </div>
                  )}
                </div>

                {/* Actions */}
                {request.Status === 'Pending' && (
                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => onApprove && onApprove(request, idx)}
                      className="flex-1 px-3 py-2 text-sm font-bold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => onReject && onReject(request, idx)}
                      className="flex-1 px-3 py-2 text-sm font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="py-12 text-center text-slate-400">
              No leave requests found.
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-white">
              <h3 className="text-2xl font-black text-slate-800">New Leave Request</h3>
              <p className="text-slate-500 text-sm mt-1">Submit a leave request on behalf of an employee</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium"
                  >
                    <option value="">Search Employee...</option>
                    {employees?.map((emp, idx) => (
                      <option key={idx} value={emp['ID'] || emp['Employee ID'] || emp.employeeId}>
                        {emp.Employee || `${emp.firstName} ${emp.lastName}`} - {emp.Role}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.employeeId && selectedBalances && (
                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    {leaveTypes.map(type => (
                      <div key={type.id} className="flex-1 min-w-[120px] bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{type.id}</div>
                        <div className="text-lg font-black text-slate-800 mt-1">
                          {selectedBalances[type.id]?.remaining} <span className="text-xs text-slate-400 font-medium">left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Leave Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-medium"
                  >
                    <option value="">Select Category</option>
                    {leaveTypes.map((type, idx) => (
                      <option key={idx} value={type.id}>{type.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Total Duration
                  </label>
                  <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-700">
                    {formData.startDate && formData.endDate ? calculateDays(formData.startDate, formData.endDate) : 0} Days
                  </div>
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
                    Reason / Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows="3"
                    placeholder="Provide detailed reason..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none resize-none font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all border border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
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
    <div className={`p-5 rounded-2xl border ${colors[color]} flex items-center justify-between`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="opacity-80 bg-white/50 p-2 rounded-xl">
        <Icon size={24} />
      </div>
    </div>
  );
}
