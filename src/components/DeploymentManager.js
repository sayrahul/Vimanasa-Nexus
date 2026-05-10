"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, X, Clock, Calendar, Briefcase, DollarSign, Search, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DeploymentManager({ employees, clients, onSave }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Filter employees for Bench
  const benchEmployees = employees?.filter(e => 
    e['Deployment Status'] === 'On Bench' || 
    (!e['Deployment Status'] && !e['Assigned Client']) ||
    e['Status'] === 'On Bench'
  ) || [];

  // Filter deployed employees
  const deployedEmployees = employees?.filter(e => 
    e['Deployment Status'] === 'Deployed' || 
    (!e['Deployment Status'] && e['Assigned Client'])
  ) || [];

  const [deploymentForm, setDeploymentForm] = useState({
    'Assigned Client': '',
    'Site Location': '',
    'Deployment Date': new Date().toISOString().split('T')[0],
    'Expected End Date': '',
    'Role at Site': '',
    'Total Bill Rate': '', // Daily rate charged to client
    'Agency Commission': ''
  });

  const handleDeploy = (e) => {
    e.preventDefault();
    if (!deploymentForm['Assigned Client']) {
      toast.error('Please select a client to deploy to');
      return;
    }
    
    // Update employee record
    const updatedEmployee = {
      ...selectedEmployee,
      ...deploymentForm,
      'Deployment Status': 'Deployed',
      'Status': 'Active'
    };
    
    onSave(updatedEmployee);
    setSelectedEmployee(null);
  };

  const handleEndDeployment = (emp) => {
    if (!confirm(`Are you sure you want to end the deployment for ${emp.Employee} at ${emp['Assigned Client']}? They will be moved to the Bench.`)) return;
    
    const updatedEmployee = {
      ...emp,
      'Deployment Status': 'On Bench',
      'Assigned Client': '',
      'Site Location': '',
      'Role at Site': '',
      'Total Bill Rate': '',
    };
    
    onSave(updatedEmployee);
    toast.info(`${emp.Employee} has been moved to the Bench.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Bench Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Shield className="text-amber-500" size={20} /> 
                Bench Roster
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Employees ready for deployment</p>
            </div>
            <div className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full text-sm">
              {benchEmployees.length}
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search bench..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-2">
            {benchEmployees
              .filter(e => (e.Employee || '').toLowerCase().includes(searchTerm.toLowerCase()))
              .map(emp => (
              <div 
                key={emp.id || emp.ID} 
                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedEmployee?.id === emp.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
                onClick={() => {
                  setSelectedEmployee(emp);
                  setDeploymentForm({
                    ...deploymentForm,
                    'Role at Site': emp.Role || ''
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm border-2 border-white shadow-sm overflow-hidden">
                      {emp['Photo URL'] ? <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover" /> : (emp.Employee || '?').charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{emp.Employee}</div>
                      <div className="text-xs text-slate-500 font-medium">{emp.Role} • ID: {emp.ID}</div>
                    </div>
                  </div>
                  <ArrowRight size={16} className={selectedEmployee?.id === emp.id ? 'text-blue-500' : 'text-slate-300'} />
                </div>
              </div>
            ))}
            {benchEmployees.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-slate-400" size={24} />
                </div>
                <p className="text-slate-500 font-medium">No employees on bench.</p>
                <p className="text-xs text-slate-400 mt-1">Hire more staff to deploy.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deployment Configuration */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
          {!selectedEmployee ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
              <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Select an Employee</h3>
              <p className="text-slate-500 max-w-sm mx-auto">Choose an employee from the Bench Roster on the left to configure their deployment to a client site.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-blue-600 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Deploy {selectedEmployee.Employee}</h3>
                  <p className="text-blue-100 text-sm font-medium mt-1">Configure client site assignment</p>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)} 
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleDeploy} className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Building2 size={16} className="text-blue-500" /> Assigned Client *
                    </label>
                    <select
                      value={deploymentForm['Assigned Client']}
                      onChange={(e) => setDeploymentForm({...deploymentForm, 'Assigned Client': e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Client</option>
                      {clients?.map((client, idx) => (
                        <option key={idx} value={client['Client Name'] || client.company_name}>
                          {client['Client Name'] || client.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Site Location</label>
                    <input
                      type="text"
                      value={deploymentForm['Site Location']}
                      onChange={(e) => setDeploymentForm({...deploymentForm, 'Site Location': e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      placeholder="e.g., Tech Park, Phase 1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-blue-500" /> Start Date *
                      </label>
                      <input
                        type="date"
                        value={deploymentForm['Deployment Date']}
                        onChange={(e) => setDeploymentForm({...deploymentForm, 'Deployment Date': e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" /> Expected End
                      </label>
                      <input
                        type="date"
                        value={deploymentForm['Expected End Date']}
                        onChange={(e) => setDeploymentForm({...deploymentForm, 'Expected End Date': e.target.value})}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <Briefcase size={16} className="text-blue-500" /> Role at Site
                    </label>
                    <input
                      type="text"
                      value={deploymentForm['Role at Site']}
                      onChange={(e) => setDeploymentForm({...deploymentForm, 'Role at Site': e.target.value})}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <label className="block text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <DollarSign size={16} className="text-blue-600" /> Daily Bill Rate (to Client) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        value={deploymentForm['Total Bill Rate']}
                        onChange={(e) => setDeploymentForm({...deploymentForm, 'Total Bill Rate': e.target.value})}
                        required
                        min="0"
                        className="w-full pl-8 pr-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-blue-900 font-bold"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">This exact rate will be multiplied by their attendance days to generate client invoices.</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                  <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm active:scale-[0.98]">
                    Deploy Employee
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Active Deployments - Card Grid instead of Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Building2 className="text-green-600" size={20} /> 
              Active Deployments
            </h3>
            <p className="text-xs text-slate-500 mt-1">Currently deployed workforce</p>
          </div>
          <div className="bg-green-100 text-green-700 font-black px-3 py-1 rounded-full text-sm">
            {deployedEmployees.length} Deployed
          </div>
        </div>
        
        <div className="p-3 sm:p-6 bg-slate-50/30">
          {deployedEmployees.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Building2 size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium">No active deployments</p>
              <p className="text-sm mt-2">Deploy an employee from the bench to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {deployedEmployees.map((emp) => (
                <div key={emp.id || emp.ID} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                      {emp['Photo URL'] ? <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover" /> : (emp.Employee || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 text-sm truncate">{emp.Employee}</div>
                      <div className="text-xs text-slate-500 font-medium">{emp.ID}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Building2 size={12} className="text-blue-500 flex-shrink-0" />
                      <span className="font-bold text-slate-700 truncate">{emp['Assigned Client']}</span>
                    </div>
                    {emp['Site Location'] && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{emp['Site Location']}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Briefcase size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate">{emp['Role at Site'] || emp.Role}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                      <span>{emp['Deployment Date'] ? new Date(emp['Deployment Date']).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEndDeployment(emp)}
                    className="w-full text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all border border-red-100 opacity-0 group-hover:opacity-100"
                  >
                    End Deployment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
