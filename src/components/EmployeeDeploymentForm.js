"use client";
import React, { useState } from 'react';
import { X, User, Building2, DollarSign, MapPin, Clock, Shield, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmployeeDeploymentForm({ employee, clients, onSave, onCancel, userRole }) {
  const isAdmin = userRole === 'admin';
  
  const [formData, setFormData] = useState({
    // Basic Info
    'ID': employee?.['ID'] || `EMP${String(Date.now()).slice(-6)}`,
    'Employee': employee?.['Employee'] || '',
    'Role': employee?.['Role'] || 'Security Guard',
    'Status': employee?.['Status'] || 'Active',
    'Phone': employee?.['Phone'] || '',
    'Email': employee?.['Email'] || '',
    'Aadhar': employee?.['Aadhar'] || '',
    'PAN': employee?.['PAN'] || '',
    
    // Deployment Info
    'Deployment Status': employee?.['Deployment Status'] || 'On Bench',
    'Assigned Client': employee?.['Assigned Client'] || '',
    'Deployment Date': employee?.['Deployment Date'] || '',
    'Site Location': employee?.['Site Location'] || '',
    'Shift Start': employee?.['Shift Start'] || '09:00',
    'Shift End': employee?.['Shift End'] || '18:00',
    
    // Pay Rate (Visible to Employee & Sub-Admin)
    'Basic Salary': employee?.['Basic Salary'] || '',
    'HRA': employee?.['HRA'] || '',
    'Allowances': employee?.['Allowances'] || '',
    'Total Pay Rate': employee?.['Total Pay Rate'] || '',
    
    // Bill Rate (Admin Only - Hidden from Employee)
    'Employer PF': employee?.['Employer PF'] || '',
    'Employer ESIC': employee?.['Employer ESIC'] || '',
    'Agency Commission': employee?.['Agency Commission'] || '',
    'Total Bill Rate': employee?.['Total Bill Rate'] || '',
    'GST Amount': employee?.['GST Amount'] || '',
    'Final Invoice Amount': employee?.['Final Invoice Amount'] || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate Total Pay Rate
      if (['Basic Salary', 'HRA', 'Allowances'].includes(field)) {
        const basic = parseFloat(updated['Basic Salary']) || 0;
        const hra = parseFloat(updated['HRA']) || 0;
        const allowances = parseFloat(updated['Allowances']) || 0;
        updated['Total Pay Rate'] = (basic + hra + allowances).toFixed(2);
        
        // Auto-calculate Bill Rate (Admin only)
        if (isAdmin) {
          const payRate = parseFloat(updated['Total Pay Rate']) || 0;
          const employerPF = (basic * 0.12).toFixed(2); // 12% of basic
          const employerESIC = ((basic + hra + allowances) * 0.0325).toFixed(2); // 3.25% of gross
          const agencyCommission = parseFloat(updated['Agency Commission']) || 0;
          
          updated['Employer PF'] = employerPF;
          updated['Employer ESIC'] = employerESIC;
          
          const totalBillRate = payRate + parseFloat(employerPF) + parseFloat(employerESIC) + agencyCommission;
          updated['Total Bill Rate'] = totalBillRate.toFixed(2);
          
          const gstAmount = (totalBillRate * 0.18).toFixed(2);
          updated['GST Amount'] = gstAmount;
          updated['Final Invoice Amount'] = (totalBillRate + parseFloat(gstAmount)).toFixed(2);
        }
      }
      
      // Recalculate when Agency Commission changes
      if (field === 'Agency Commission' && isAdmin) {
        const payRate = parseFloat(updated['Total Pay Rate']) || 0;
        const employerPF = parseFloat(updated['Employer PF']) || 0;
        const employerESIC = parseFloat(updated['Employer ESIC']) || 0;
        const agencyCommission = parseFloat(value) || 0;
        
        const totalBillRate = payRate + employerPF + employerESIC + agencyCommission;
        updated['Total Bill Rate'] = totalBillRate.toFixed(2);
        
        const gstAmount = (totalBillRate * 0.18).toFixed(2);
        updated['GST Amount'] = gstAmount;
        updated['Final Invoice Amount'] = (totalBillRate + parseFloat(gstAmount)).toFixed(2);
      }
      
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-black">{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p className="text-blue-100 text-sm mt-1">Configure employee profile, deployment, and compensation</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={formData['ID']}
                      disabled
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData['Employee']}
                      onChange={(e) => handleChange('Employee', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      placeholder="Rajesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Role *</label>
                    <select
                      value={formData['Role']}
                      onChange={(e) => handleChange('Role', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    >
                      <option>Security Guard</option>
                      <option>Supervisor</option>
                      <option>Manager</option>
                      <option>Team Leader</option>
                      <option>Office Staff</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData['Phone']}
                        onChange={(e) => handleChange('Phone', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                      <select
                        value={formData['Status']}
                        onChange={(e) => handleChange('Status', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      >
                        <option>Active</option>
                        <option>On Leave</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Aadhar Number</label>
                      <input
                        type="text"
                        value={formData['Aadhar']}
                        onChange={(e) => handleChange('Aadhar', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        placeholder="1234 5678 9012"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={formData['PAN']}
                        onChange={(e) => handleChange('PAN', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Deployment Information */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-blue-600" />
                  Deployment Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Deployment Status</label>
                    <select
                      value={formData['Deployment Status']}
                      onChange={(e) => handleChange('Deployment Status', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    >
                      <option>On Bench</option>
                      <option>Deployed</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  {formData['Deployment Status'] === 'Deployed' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Assigned Client *</label>
                        <select
                          value={formData['Assigned Client']}
                          onChange={(e) => handleChange('Assigned Client', e.target.value)}
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        >
                          <option value="">Select Client</option>
                          {clients && clients.map((client, idx) => (
                            <option key={idx} value={client['Client Name']}>
                              {client['Client Name']} ({client['Client ID']})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Deployment Date</label>
                        <input
                          type="date"
                          value={formData['Deployment Date']}
                          onChange={(e) => handleChange('Deployment Date', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Site Location</label>
                        <input
                          type="text"
                          value={formData['Site Location']}
                          onChange={(e) => handleChange('Site Location', e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                          placeholder="Pune Office - Gate 2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Shift Start</label>
                          <input
                            type="time"
                            value={formData['Shift Start']}
                            onChange={(e) => handleChange('Shift Start', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Shift End</label>
                          <input
                            type="time"
                            value={formData['Shift End']}
                            onChange={(e) => handleChange('Shift End', e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pay Rate (Visible to All) */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-600" />
                  Pay Rate (Employee Salary)
                </h3>
                <div className="space-y-4 bg-green-50 p-4 rounded-xl border border-green-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Basic Salary *</label>
                    <input
                      type="number"
                      value={formData['Basic Salary']}
                      onChange={(e) => handleChange('Basic Salary', e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none bg-white"
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">HRA</label>
                    <input
                      type="number"
                      value={formData['HRA']}
                      onChange={(e) => handleChange('HRA', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none bg-white"
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Allowances</label>
                    <input
                      type="number"
                      value={formData['Allowances']}
                      onChange={(e) => handleChange('Allowances', e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 outline-none bg-white"
                      placeholder="2000"
                    />
                  </div>
                  <div className="pt-4 border-t border-green-200">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Total Pay Rate</label>
                    <input
                      type="text"
                      value={`₹${formData['Total Pay Rate'] || '0'}`}
                      disabled
                      className="w-full px-4 py-3 bg-green-100 border border-green-200 rounded-xl font-bold text-green-700 text-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Bill Rate (Admin Only) */}
              {isAdmin && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-red-600" />
                    Bill Rate (Admin Only - Hidden from Employee)
                  </h3>
                  <div className="space-y-4 bg-red-50 p-4 rounded-xl border border-red-200">
                    <div className="flex items-start gap-2 p-3 bg-red-100 rounded-lg">
                      <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700 font-medium">
                        This section is strictly confidential and visible only to Super Admin. Never share with employees or sub-admins.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Employer PF (12%)</label>
                        <input
                          type="text"
                          value={`₹${formData['Employer PF'] || '0'}`}
                          disabled
                          className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Employer ESIC (3.25%)</label>
                        <input
                          type="text"
                          value={`₹${formData['Employer ESIC'] || '0'}`}
                          disabled
                          className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-600"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Agency Commission (Markup)</label>
                      <input
                        type="number"
                        value={formData['Agency Commission']}
                        onChange={(e) => handleChange('Agency Commission', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none bg-white"
                        placeholder="2500"
                      />
                    </div>
                    <div className="pt-4 border-t border-red-200 space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Total Bill Rate (Before GST)</label>
                        <input
                          type="text"
                          value={`₹${formData['Total Bill Rate'] || '0'}`}
                          disabled
                          className="w-full px-4 py-3 bg-red-100 border border-red-200 rounded-xl font-bold text-red-700 text-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">GST (18%)</label>
                        <input
                          type="text"
                          value={`₹${formData['GST Amount'] || '0'}`}
                          disabled
                          className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Final Invoice Amount</label>
                        <input
                          type="text"
                          value={`₹${formData['Final Invoice Amount'] || '0'}`}
                          disabled
                          className="w-full px-4 py-3 bg-red-600 border border-red-700 rounded-xl font-black text-white text-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            {employee ? 'Update Employee' : 'Add Employee'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
