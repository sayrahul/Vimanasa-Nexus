"use client"; // Premium Responsive Deployment
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ArrowRight, X, Clock, Calendar, Briefcase, DollarSign, Search, Shield, MapPin, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
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
    toast.success(`${selectedEmployee.Employee} successfully deployed to ${deploymentForm['Assigned Client']}`);
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
    <div className="space-y-6 sm:space-y-8">
      {/* Top Section: Bench and Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Bench Roster (lg:4/12) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px] sm:h-[600px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
                <Shield className="text-amber-500" size={20} /> 
                Bench Roster
              </h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-1">Available for Deployment</p>
            </div>
            <div className="bg-amber-100 text-amber-700 font-black px-3 py-1 rounded-full text-xs">
              {benchEmployees.length}
            </div>
          </div>
          
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search bench staff..." 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {benchEmployees
              .filter(e => (e.Employee || '').toLowerCase().includes(searchTerm.toLowerCase()))
              .map(emp => (
              <motion.div 
                layout
                key={emp.id || emp.ID} 
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${selectedEmployee?.id === emp.id ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
                onClick={() => {
                  setSelectedEmployee(emp);
                  setDeploymentForm({
                    ...deploymentForm,
                    'Role at Site': emp.Role || ''
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm border border-slate-200 overflow-hidden shrink-0">
                      {emp['Photo URL'] ? <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover" /> : (emp.Employee || '?').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 text-sm truncate">{emp.Employee}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter truncate">{emp.Role} • {emp.ID}</div>
                    </div>
                  </div>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${selectedEmployee?.id === emp.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
            {benchEmployees.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-50">
                <Shield className="text-slate-300 mb-4" size={48} />
                <p className="font-bold text-slate-500">No staff on bench</p>
                <p className="text-xs text-slate-400 mt-1">Ready for more hiring?</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Deployment Config (lg:8/12) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <AnimatePresence mode="wait">
            {!selectedEmployee ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/30"
              >
                <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 text-slate-300 rounded-full flex items-center justify-center mb-6">
                  <UserCheck size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Assignment Panel</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Select an employee from the bench on the left to begin site configuration and deployment.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col h-full"
              >
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between shadow-lg z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-white text-lg border border-white/30">
                      {selectedEmployee.Employee.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-black text-lg">Deploy {selectedEmployee.Employee}</h3>
                      <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">{selectedEmployee.Role} Assignment</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedEmployee(null)} 
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleDeploy} className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Client Site *</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          value={deploymentForm['Assigned Client']}
                          onChange={(e) => setDeploymentForm({...deploymentForm, 'Assigned Client': e.target.value})}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                        >
                          <option value="">Select Client Site</option>
                          {clients?.map((client, idx) => (
                            <option key={idx} value={client['Client Name'] || client.company_name}>
                              {client['Client Name'] || client.company_name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Specific Site Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={deploymentForm['Site Location']}
                          onChange={(e) => setDeploymentForm({...deploymentForm, 'Site Location': e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                          placeholder="e.g., Warehouse Block A"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployment Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          value={deploymentForm['Role at Site']}
                          onChange={(e) => setDeploymentForm({...deploymentForm, 'Role at Site': e.target.value})}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-slate-700"
                          placeholder="Site Supervisor"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Deployment Start *</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="date"
                          value={deploymentForm['Deployment Date']}
                          onChange={(e) => setDeploymentForm({...deploymentForm, 'Deployment Date': e.target.value})}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-bold text-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Daily Billing Rate *</label>
                      <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 font-black text-lg">₹</span>
                        <input
                          type="number"
                          value={deploymentForm['Total Bill Rate']}
                          onChange={(e) => setDeploymentForm({...deploymentForm, 'Total Bill Rate': e.target.value})}
                          required
                          min="0"
                          className="w-full pl-10 pr-4 py-3 bg-blue-50/30 border border-blue-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none font-black text-blue-700 text-lg shadow-inner"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                      <AlertCircle className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <p className="text-xs text-slate-500 font-medium">The daily bill rate is used for automated client invoicing based on verified attendance records for this site.</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100">
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98] flex items-center justify-center gap-3">
                      <UserCheck size={20} />
                      Confirm & Deploy Staff
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Active Deployments Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl flex items-center gap-2">
              <Building2 className="text-green-600" size={24} /> 
              Active Site Deployments
            </h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Workforce currently on field</p>
          </div>
          <div className="bg-green-100 text-green-700 font-black px-4 py-1.5 rounded-full text-xs sm:text-sm border border-green-200">
            {deployedEmployees.length} Total Deployed
          </div>
        </div>
        
        <div className="p-4 sm:p-8">
          {deployedEmployees.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <Building2 size={64} className="mx-auto mb-4 text-slate-200" />
              <h4 className="text-xl font-black text-slate-400">No active deployments</h4>
              <p className="text-slate-400 mt-2 font-medium">Deploy an employee from the bench to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {deployedEmployees.map((emp) => (
                <motion.div 
                  layout
                  key={emp.id || emp.ID} 
                  className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-green-300 hover:shadow-2xl hover:shadow-green-50 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xl border border-slate-200 overflow-hidden shrink-0 group-hover:border-green-200 transition-colors">
                      {emp['Photo URL'] ? <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover" /> : (emp.Employee || '?').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 text-base truncate">{emp.Employee}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{emp.ID}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase border border-green-100">
                        <CheckCircle size={10} /> Active Deployment
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-green-100 transition-colors">
                      <Building2 size={16} className="text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Client Site</p>
                        <p className="font-black text-slate-800 text-sm truncate">{emp['Assigned Client']}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Location</p>
                          <p className="text-xs font-bold text-slate-600 truncate">{emp['Site Location'] || 'Main Site'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Started</p>
                          <p className="text-xs font-bold text-slate-600 truncate">{emp['Deployment Date'] ? new Date(emp['Deployment Date']).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleEndDeployment(emp)}
                    className="w-full text-xs font-black text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-4 py-3 rounded-2xl transition-all border border-red-100 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <X size={14} /> End Deployment
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
