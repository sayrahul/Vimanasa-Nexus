"use client";
import React, { useState } from 'react';
import { 
  PiggyBank, Plus, TrendingUp, Calendar, DollarSign, 
  User, CheckCircle, Clock, FileText, Download 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  calculateLoanEMI, 
  generateLoanSchedule, 
  formatCurrency 
} from '@/lib/payrollCalculations';

export default function LoanManagementSystem({ employees, loans = [], onSave }) {
  const [showModal, setShowModal] = useState(false);
  const [showSchedule, setShowSchedule] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    loanType: 'Personal',
    principal: '',
    interestRate: '10',
    tenureMonths: '12',
    startDate: new Date().toISOString().split('T')[0],
    purpose: '',
    status: 'active'
  });

  const [calculatedEMI, setCalculatedEMI] = useState(0);

  const handleCalculateEMI = () => {
    if (formData.principal && formData.interestRate && formData.tenureMonths) {
      const emi = calculateLoanEMI(
        formData.principal,
        formData.interestRate,
        formData.tenureMonths
      );
      setCalculatedEMI(emi);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const employee = employees.find(emp => 
      (emp.id || emp['Employee ID']) === formData.employeeId
    );

    if (!employee) {
      toast.error('Employee not found');
      return;
    }

    const emi = calculateLoanEMI(
      formData.principal,
      formData.interestRate,
      formData.tenureMonths
    );

    const schedule = generateLoanSchedule(
      formData.principal,
      formData.interestRate,
      formData.tenureMonths,
      formData.startDate
    );

    const loanData = {
      ...formData,
      employeeName: employee.Name || employee.Employee || `${employee.firstName} ${employee.lastName}`,
      emi,
      remainingBalance: parseFloat(formData.principal),
      paidInstallments: 0,
      totalInstallments: parseInt(formData.tenureMonths),
      schedule: JSON.stringify(schedule),
      createdAt: new Date().toISOString()
    };

    try {
      await onSave(loanData, 'employee_loans');
      toast.success('Loan created successfully!');
      setShowModal(false);
      setFormData({
        employeeId: '',
        loanType: 'Personal',
        principal: '',
        interestRate: '10',
        tenureMonths: '12',
        startDate: new Date().toISOString().split('T')[0],
        purpose: '',
        status: 'active'
      });
      setCalculatedEMI(0);
    } catch (error) {
      toast.error('Failed to create loan');
      console.error(error);
    }
  };

  const viewSchedule = (loan) => {
    const schedule = JSON.parse(loan.schedule || '[]');
    setShowSchedule({ loan, schedule });
  };

  const totalLoans = loans.reduce((sum, loan) => sum + (parseFloat(loan.principal) || 0), 0);
  const activeLoans = loans.filter(loan => loan.status === 'active').length;
  const totalEMI = loans
    .filter(loan => loan.status === 'active')
    .reduce((sum, loan) => sum + (parseFloat(loan.emi) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Loans"
          value={formatCurrency(totalLoans)}
          icon={PiggyBank}
          color="green"
        />
        <StatCard
          label="Active Loans"
          value={activeLoans}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          label="Monthly EMI"
          value={formatCurrency(totalEMI)}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          label="Total Loans"
          value={loans.length}
          icon={FileText}
          color="orange"
        />
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          New Loan
        </button>
      </div>

      {/* Loans List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">Employee Loans</h3>
        </div>

        <div className="divide-y divide-slate-100">
          {loans.length === 0 ? (
            <div className="p-12 text-center">
              <PiggyBank size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-semibold">No loans yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first employee loan</p>
            </div>
          ) : (
            loans.map((loan, idx) => (
              <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <PiggyBank size={24} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{loan.employeeName}</p>
                      <p className="text-sm text-slate-500">{loan.employeeId} • {loan.loanType} Loan</p>
                      <p className="text-xs text-slate-400 mt-1">{loan.purpose}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="text-sm">
                          <span className="text-slate-500">Principal:</span>
                          <span className="font-bold text-slate-700 ml-1">
                            {formatCurrency(loan.principal)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Rate:</span>
                          <span className="font-bold text-slate-700 ml-1">
                            {loan.interestRate}%
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-slate-500">Tenure:</span>
                          <span className="font-bold text-slate-700 ml-1">
                            {loan.tenureMonths} months
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-black text-green-600">
                      {formatCurrency(loan.emi)}/mo
                    </p>
                    <p className="text-sm text-slate-500">
                      {loan.paidInstallments || 0}/{loan.totalInstallments} paid
                    </p>
                    <div className="w-48 bg-slate-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((loan.paidInstallments || 0) / loan.totalInstallments) * 100}%`
                        }}
                      />
                    </div>
                    <button
                      onClick={() => viewSchedule(loan)}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                    >
                      <Calendar size={16} />
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Loan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">New Employee Loan</h3>
              <p className="text-green-100 text-sm mt-1">Create a new loan with EMI calculation</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <User className="inline mr-2" size={16} />
                    Select Employee
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  >
                    <option value="">Choose employee...</option>
                    {employees?.map((emp, idx) => (
                      <option key={idx} value={emp.id || emp['Employee ID']}>
                        {emp.Name || emp.Employee || `${emp.firstName} ${emp.lastName}`} ({emp.id || emp['Employee ID']})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loan Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Loan Type
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  >
                    <option value="Personal">Personal Loan</option>
                    <option value="Emergency">Emergency Loan</option>
                    <option value="Education">Education Loan</option>
                    <option value="Medical">Medical Loan</option>
                    <option value="Housing">Housing Loan</option>
                  </select>
                </div>

                {/* Principal Amount */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <DollarSign className="inline mr-2" size={16} />
                    Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.principal}
                    onChange={(e) => {
                      setFormData({ ...formData, principal: e.target.value });
                      handleCalculateEMI();
                    }}
                    required
                    min="1"
                    placeholder="50000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <TrendingUp className="inline mr-2" size={16} />
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => {
                      setFormData({ ...formData, interestRate: e.target.value });
                      handleCalculateEMI();
                    }}
                    required
                    min="0"
                    step="0.1"
                    placeholder="10"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  />
                </div>

                {/* Tenure */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <Calendar className="inline mr-2" size={16} />
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={formData.tenureMonths}
                    onChange={(e) => {
                      setFormData({ ...formData, tenureMonths: e.target.value });
                      handleCalculateEMI();
                    }}
                    required
                    min="1"
                    max="60"
                    placeholder="12"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold"
                  />
                </div>

                {/* Purpose */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Purpose of Loan
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    rows="2"
                    placeholder="Describe the purpose..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none font-semibold resize-none"
                  />
                </div>
              </div>

              {/* EMI Display */}
              {calculatedEMI > 0 && (
                <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-green-700">Monthly EMI</p>
                      <p className="text-3xl font-black text-green-600 mt-1">
                        {formatCurrency(calculatedEMI)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">
                        Total Payment: {formatCurrency(calculatedEMI * formData.tenureMonths)}
                      </p>
                      <p className="text-sm text-green-600">
                        Interest: {formatCurrency((calculatedEMI * formData.tenureMonths) - formData.principal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all"
                >
                  Create Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">Loan Amortization Schedule</h3>
              <p className="text-blue-100 text-sm mt-1">
                {showSchedule.loan.employeeName} - {showSchedule.loan.loanType} Loan
              </p>
            </div>

            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Month</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">EMI</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Principal</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Interest</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showSchedule.schedule.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.month}</td>
                        <td className="px-4 py-3 text-slate-600">{row.paymentDate}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          {formatCurrency(row.emi)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatCurrency(row.principal)}
                        </td>
                        <td className="px-4 py-3 text-right text-orange-600">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowSchedule(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Close
                </button>
                <button
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Download Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
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
