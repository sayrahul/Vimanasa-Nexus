"use client";
import React, { useState } from 'react';
import { Wallet, Plus, CheckCircle, XCircle, Clock, DollarSign, Calendar, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/lib/payrollCalculations';

export default function SalaryAdvanceManager({ employees, advances = [], onSave }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    amount: '',
    reason: '',
    requestDate: new Date().toISOString().split('T')[0],
    recoveryMonths: 1,
    status: 'pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employee = employees.find(emp => 
      (emp.id || emp['Employee ID']) === formData.employeeId
    );

    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    const advanceData = {
      ...formData,
      employeeName: employee.Name || employee.Employee || `${employee.firstName} ${employee.lastName}`,
      recoveryAmount: Math.ceil(parseFloat(formData.amount) / parseInt(formData.recoveryMonths)),
      remainingAmount: parseFloat(formData.amount),
      recovered: false,
      createdAt: new Date().toISOString()
    };

    try {
      await onSave(advanceData, 'salary_advances');
      toast.success('Salary advance request created!');
      setShowModal(false);
      setFormData({
        employeeId: '',
        amount: '',
        reason: '',
        requestDate: new Date().toISOString().split('T')[0],
        recoveryMonths: 1,
        status: 'pending'
      });
    } catch (error) {
      toast.error('Failed to create advance request');
      console.error(error);
    }
  };

  const handleApprove = async (advanceId) => {
    try {
      await onSave({ id: advanceId, status: 'approved' }, 'salary_advances', 'update');
      toast.success('Advance approved!');
    } catch (error) {
      toast.error('Failed to approve advance');
    }
  };

  const handleReject = async (advanceId) => {
    try {
      await onSave({ id: advanceId, status: 'rejected' }, 'salary_advances', 'update');
      toast.success('Advance rejected');
    } catch (error) {
      toast.error('Failed to reject advance');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      recovered: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle }
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text} flex items-center gap-1 w-fit`}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalAdvances = advances.reduce((sum, adv) => sum + (parseFloat(adv.amount) || 0), 0);
  const pendingAdvances = advances.filter(adv => adv.status === 'pending').length;
  const activeAdvances = advances.filter(adv => adv.status === 'approved' && !adv.recovered).length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Advances"
          value={formatCurrency(totalAdvances)}
          icon={Wallet}
          color="purple"
        />
        <StatCard
          label="Pending Requests"
          value={pendingAdvances}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          label="Active Advances"
          value={activeAdvances}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Total Requests"
          value={advances.length}
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          New Advance Request
        </button>
      </div>

      {/* Advances List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Salary Advance Requests</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {advances.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-semibold">No advance requests yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first advance request</p>
            </div>
          ) : (
            advances.map((advance, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <User size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{advance.employeeName}</p>
                      <p className="text-sm text-slate-500">{advance.employeeId}</p>
                      <p className="text-xs text-slate-400 mt-1">{advance.reason}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-black text-purple-600">
                      {formatCurrency(advance.amount)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Recovery: {formatCurrency(advance.recoveryAmount)}/month × {advance.recoveryMonths}
                    </p>
                    {getStatusBadge(advance.status)}
                  </div>

                  {advance.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(advance.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(advance.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">New Salary Advance Request</h3>
              <p className="text-purple-100 text-sm mt-1">Request advance payment for employees</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Select Employee
                </label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold"
                >
                  <option value="">Choose employee...</option>
                  {employees?.map((emp, idx) => (
                    <option key={idx} value={emp.id || emp['Employee ID']}>
                      {emp.Name || emp.Employee || `${emp.firstName} ${emp.lastName}`} ({emp.id || emp['Employee ID']})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <DollarSign className="inline mr-2" size={16} />
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  min="1"
                  placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold"
                />
              </div>

              {/* Recovery Months */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Recovery Period (Months)
                </label>
                <input
                  type="number"
                  value={formData.recoveryMonths}
                  onChange={(e) => setFormData({ ...formData, recoveryMonths: e.target.value })}
                  required
                  min="1"
                  max="12"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold"
                />
                {formData.amount && formData.recoveryMonths && (
                  <p className="text-sm text-purple-600 font-semibold mt-2">
                    Monthly Recovery: {formatCurrency(Math.ceil(parseFloat(formData.amount) / parseInt(formData.recoveryMonths)))}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reason for Advance
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  rows="3"
                  placeholder="Medical emergency, personal need, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <div className={`p-6 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold opacity-80">{label}</span>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
