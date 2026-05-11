"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Download, Mail, Calendar, DollarSign, Building2, CheckCircle, Clock, XCircle, Plus, Eye, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateClientInvoice } from '@/lib/pdfGenerator';

export default function ClientInvoicing({ invoices, clients, employees, attendance, onGenerateInvoice, onUpdateStatus }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredInvoices = React.useMemo(() => {
    return (invoices || []).filter(inv => {
      const matchesSearch = 
        (inv['Invoice Number'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv['Client Name'] || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || inv.Status === statusFilter;
      const matchesMonth = !selectedMonth || (inv['Invoice Date'] || inv.date)?.startsWith(selectedMonth);

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [invoices, searchTerm, statusFilter, selectedMonth]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return <CheckCircle size={16} />;
      case 'sent': return <Mail size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'overdue': return <XCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Client Invoicing</h1>
          <p className="text-slate-500 mt-1">Automated billing and invoice management</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} /> Generate Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoiced"
          value={`₹${invoices?.reduce((sum, inv) => sum + parseFloat(inv['Invoice Amount'] || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          label="Paid"
          value={invoices?.filter(inv => inv.Status === 'Paid').length || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Pending"
          value={invoices?.filter(inv => inv.Status === 'Pending' || inv.Status === 'Sent').length || 0}
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Overdue"
          value={invoices?.filter(inv => inv.Status === 'Overdue').length || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Invoice History</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search invoice # or client..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-slate-700 bg-white"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-semibold text-slate-700 bg-white"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Invoice #</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Month</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices?.length > 0 ? filteredInvoices.map((invoice, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{invoice['Invoice Number']}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-slate-400" />
                          <span className="font-medium text-slate-700">{invoice['Client Name']}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{invoice.Month}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">₹{parseFloat(invoice['Invoice Amount'] || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(invoice.Status)}`}>
                          {getStatusIcon(invoice.Status)}
                          {invoice.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{invoice['Due Date']}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={async () => await generateClientInvoice(
                              { 
                                'Client Name': invoice['Client Name'],
                                'Location': clients?.find(c => c['Client Name'] === invoice['Client Name'])?.Location,
                                'GST Number': clients?.find(c => c['Client Name'] === invoice['Client Name'])?.['GST Number']
                              }, 
                              invoice['Invoice Amount'], 
                              invoice['Invoice Number'],
                              invoice
                            )}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail size={16} />
                          </button>
                          <button
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
               : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No invoices generated yet</p>
                    <p className="text-sm mt-2">Click "Generate Invoice" to create your first client invoice</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {showGenerator && (
        <InvoiceGenerator
          clients={clients}
          employees={employees}
          attendance={attendance}
          onGenerate={onGenerateInvoice}
          onClose={() => setShowGenerator(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
    </div>
  );
}

function InvoiceGenerator({ clients, employees, attendance, onGenerate, onClose }) {
  const [formData, setFormData] = useState({
    clientId: '',
    month: new Date().toISOString().slice(0, 7),
    dueDate: '',
  });

  const [calculatedData, setCalculatedData] = useState(null);

  useEffect(() => {
    if (formData.clientId && formData.month) {
      calculateInvoice();
    }
  }, [formData.clientId, formData.month]);

  const calculateInvoice = () => {
    const selectedClient = clients?.find(c => c['Client ID'] === formData.clientId);
    if (!selectedClient) return;

    // Get employees deployed to this client
    const deployedEmployees = employees?.filter(
      emp => emp['Assigned Client'] === selectedClient['Client Name'] && emp['Deployment Status'] === 'Deployed'
    ) || [];

    // Get attendance records for the selected month
    const monthAttendance = attendance?.filter(a => a.Date?.startsWith(formData.month)) || [];

    // Calculate total billing
    let totalBillRate = 0;
    let employeeDetails = [];
    let totalSalaryCost = 0; // For profit margin calculation

    deployedEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      
      // Calculate Payable Days for this employee
      const empAttendance = monthAttendance.filter(a => a['Employee ID'] === empId || a.employeeId === empId);
      const present = empAttendance.filter(a => a.Status === 'Present').length;
      const leaves = empAttendance.filter(a => a.Status === 'On Leave').length;
      const halfDays = empAttendance.filter(a => a.Status === 'Half Day').length;
      
      const payableDays = present + leaves + (halfDays * 0.5);
      
      if (payableDays === 0) return; // Skip if they didn't work

      const billRate = parseFloat(emp['Total Bill Rate']) || 0;
      const amount = billRate * payableDays;

      // Estimate salary cost
      const basicSalaryRaw = parseFloat(emp['Basic Salary']) || 0;
      const hraRaw = parseFloat(emp['HRA']) || 0;
      const allowancesRaw = parseFloat(emp['Allowances']) || 0;
      const totalPayRate = basicSalaryRaw + hraRaw + allowancesRaw;
      
      const [year, month] = formData.month.split('-');
      const daysInMonth = new Date(year, month, 0).getDate();
      const estimatedSalary = (totalPayRate / daysInMonth) * payableDays;
      
      totalSalaryCost += estimatedSalary;
      totalBillRate += amount;

      employeeDetails.push({
        name: emp.Employee,
        role: emp['Role at Site'] || emp.Role,
        days: payableDays,
        ratePerDay: billRate,
        amount: amount,
      });
    });

    // Calculate Agency Margin based on Client Settings
    const marginType = selectedClient['Margin Type'] || 'Percentage';
    const marginRate = parseFloat(selectedClient['Agency Margin %']) || 0;
    
    let totalAgencyMargin = 0;
    if (marginType === 'Percentage') {
      totalAgencyMargin = totalBillRate * (marginRate / 100);
    } else if (marginType === 'Flat Fee') {
      // Calculate total headcount deployed to this client
      // Only count employees who actually worked (payableDays > 0)
      const workingEmployees = employeeDetails.length;
      totalAgencyMargin = marginRate * workingEmployees;
    }

    const subtotal = totalBillRate + totalAgencyMargin;
    
    // Calculate GST dynamically
    const gstRate = parseFloat(selectedClient['GST Percentage'] !== undefined ? selectedClient['GST Percentage'] : 18) / 100;
    const totalGST = subtotal * gstRate;
    const finalInvoiceAmount = subtotal + totalGST;
    
    const isLossMaking = totalBillRate < totalSalaryCost;

    setCalculatedData({
      client: selectedClient,
      employees: employeeDetails,
      totalEmployees: employeeDetails.length,
      totalBillRate: totalBillRate.toFixed(2),
      totalAgencyMargin: totalAgencyMargin.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gstRate: (gstRate * 100).toFixed(1),
      totalGST: totalGST.toFixed(2),
      finalAmount: finalInvoiceAmount.toFixed(2),
      totalSalaryCost: totalSalaryCost.toFixed(2),
      isLossMaking: isLossMaking
    });
  };

  const handleGenerate = () => {
    if (!calculatedData) return;

    const invoiceData = {
      'Invoice Number': `INV-${Date.now()}`,
      'Client Name': calculatedData.client['Client Name'],
      'Client ID': calculatedData.client['Client ID'],
      'Month': formData.month,
      'Invoice Date': new Date().toISOString().split('T')[0],
      'Due Date': formData.dueDate,
      'Total Employees': calculatedData.totalEmployees,
      'Bill Rate Subtotal': calculatedData.totalBillRate,
      'Agency Margin': calculatedData.totalAgencyMargin,
      'Subtotal': calculatedData.subtotal,
      'GST Percentage': calculatedData.gstRate,
      'GST Amount': calculatedData.totalGST,
      'Invoice Amount': calculatedData.finalAmount,
      'Status': 'Pending',
      'Payment Terms': calculatedData.client['Payment Terms'],
    };

    onGenerate(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
          <h2 className="text-2xl font-black">Generate Client Invoice</h2>
          <p className="text-blue-100 text-sm mt-1">Automated billing based on deployment and attendance</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Select Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option value="">Choose a client</option>
                {clients?.map((client, idx) => (
                  <option key={idx} value={client['Client ID']}>
                    {client['Client Name']} ({client['Client ID']})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Billing Month *</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Calculated Preview */}
          {calculatedData && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-blue-600" />
                Invoice Preview
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Client</p>
                  <p className="text-sm font-bold text-slate-900">{calculatedData.client['Client Name']}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase">Deployed Staff</p>
                  <p className="text-sm font-bold text-slate-900">{calculatedData.totalEmployees} Employees</p>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Total Resource Billing</span>
                  <span className="text-sm font-bold text-slate-900">₹{parseFloat(calculatedData.totalBillRate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Agency Margin ({calculatedData.client['Margin Type'] === 'Percentage' ? `${calculatedData.client['Agency Margin %']}%` : 'Flat Fee'})</span>
                  <span className="text-sm font-bold text-slate-900">₹{parseFloat(calculatedData.totalAgencyMargin).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-blue-100 pt-2 mt-2">
                  <span className="text-sm font-bold text-slate-700">Subtotal</span>
                  <span className="text-sm font-bold text-slate-900">₹{parseFloat(calculatedData.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">GST ({calculatedData.gstRate}%)</span>
                  <span className="text-sm font-bold text-slate-900">₹{parseFloat(calculatedData.totalGST).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-blue-200">
                  <span className="text-base font-bold text-slate-900">Total Invoice Amount</span>
                  <span className="text-xl font-black text-blue-600">₹{parseFloat(calculatedData.finalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!calculatedData}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Invoice
          </button>
        </div>
      </motion.div>
    </div>
  );
}
