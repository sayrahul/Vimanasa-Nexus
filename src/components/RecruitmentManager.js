'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, CheckCircle, XCircle, Clock, 
  MoreVertical, Mail, Phone, Calendar, Briefcase, FileText, 
  UserPlus, ArrowRight, ChevronRight, Download, AlertCircle, 
  DollarSign, Edit2, X, ArrowUpRight, Trash2, MapPin, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

export default function RecruitmentManager({ data, onUpdate, onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const candidates = data?.candidates || [];
  const jobs = data?.job_openings || [];

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = 
      c['Full Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c['Phone']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c['Job Title']?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c['Status']?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (candidate, newStatus) => {
    setIsUpdating(true);
    try {
      const response = await apiClient.put('/api/database', {
        table: 'candidates',
        id: candidate.id,
        data: {
          ...candidate,
          'Status': newStatus,
          reviewed_at: new Date().toISOString()
        }
      });

      if (response.success) {
        toast.success(`Status updated to ${newStatus}`, { position: "top-right" });
        onUpdate('candidates');
        if (selectedCandidate?.id === candidate.id) {
          setSelectedCandidate({ ...selectedCandidate, Status: newStatus });
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertToEmployee = async (candidate) => {
    setIsUpdating(true);
    try {
      const employeeData = {
        'Employee ID': `EMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        'Employee': candidate['Full Name'],
        'Phone': candidate['Phone'],
        'Email': candidate['Email'] || '',
        'Aadhar': candidate['Aadhar'] || '',
        'PAN': candidate['PAN'] || '',
        'Photo Link': candidate['Photo Link'] || '',
        'Role': candidate['Job Title'],
        'Status': 'Active',
        'Assigned Client': 'Pending Assignment',
        'Basic Salary': candidate['Expected Salary'] || '0',
        'Date of Birth': candidate['Date of Birth'] || '',
        'Site Location': candidate['Address'] || 'Unassigned'
      };

      const empResponse = await apiClient.post('/api/database', {
        table: 'workforce',
        data: employeeData
      });

      if (empResponse.success) {
        await handleUpdateStatus(candidate, 'Hired');
        toast.success(`Hired ${candidate['Full Name']}!`, { position: "top-right" });
        onUpdate('workforce');
        onUpdate('candidates');
        onNavigate('placements');
        setShowDrawer(false);
      }
    } catch (error) {
      toast.error('Conversion failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shortlisted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'on_hold': case 'on-hold': case 'hold': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'hired': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Recruitment Portal <span className="text-blue-600 text-base font-black px-3 py-1 bg-blue-50 rounded-full">HQ</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Manage workforce demand and candidate pipeline</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full lg:w-auto overflow-x-auto scrollbar-hide">
          {['applications', 'pipeline', 'openings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-xs font-black transition-all capitalize whitespace-nowrap",
                activeSubTab === tab 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'applications' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {/* Intelligent Search & Filter */}
            <div className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-5 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name, role or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                {['all', 'pending', 'shortlisted', 'hold', 'rejected', 'hired'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                      statusFilter === status 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive Table Grid */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Candidate Info</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Applied Role</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">Experience</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Review</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="group hover:bg-blue-50/30 transition-all cursor-pointer" onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
                              {candidate['Full Name']?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-base">{candidate['Full Name']}</p>
                              <p className="text-xs text-slate-500 font-bold flex items-center gap-1 mt-1">
                                <Phone size={12} /> {candidate['Phone']}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Briefcase size={14} /></div>
                            <span className="text-sm font-black text-slate-700">{candidate['Job Title']}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 hidden sm:table-cell">
                          <p className="text-sm font-black text-slate-800">{candidate['Experience'] || 'Fresher'}</p>
                          <p className="text-xs text-slate-400 font-bold mt-0.5">Exp: {candidate['Expected Salary']}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                            getStatusColor(candidate['Status'])
                          )}>
                            {candidate['Status'] || 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300"><Search size={40} /></div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-sm italic">No matching applications found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeSubTab === 'pipeline' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {['Pending', 'Shortlisted', 'Rejected'].map((status, idx) => (
              <div key={status} className="bg-slate-100/50 p-6 rounded-[3rem] border border-slate-200/60 flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-8 px-4">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-3">
                    <span className={cn("w-3 h-3 rounded-full animate-pulse", 
                      status === 'Pending' ? "bg-amber-400" : status === 'Shortlisted' ? "bg-blue-500" : "bg-red-500"
                    )} />
                    {status}
                  </h3>
                  <span className="bg-white px-3 py-1 rounded-full text-xs font-black text-slate-400 border border-slate-100 shadow-sm">
                    {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                  </span>
                </div>
                
                <div className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).map(candidate => (
                    <motion.div 
                      layoutId={candidate.id}
                      key={candidate.id} 
                      onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {candidate['Full Name']?.charAt(0).toUpperCase()}
                        </div>
                        <div className="p-1.5 bg-slate-50 text-slate-300 rounded-lg group-hover:text-blue-500"><ArrowUpRight size={16} /></div>
                      </div>
                      <p className="font-black text-slate-900 text-base mb-1">{candidate['Full Name']}</p>
                      <p className="text-xs text-slate-500 font-bold mb-4">{candidate['Job Title']}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-black uppercase text-slate-400">{candidate['Experience']}</span>
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">{candidate['Expected Salary']}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSubTab === 'openings' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <JobOpeningsList jobs={jobs} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Candidate Profile Drawer */}
      <AnimatePresence>
        {showDrawer && selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]" onClick={() => setShowDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] z-[101] overflow-y-auto"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-4xl shadow-lg ring-8 ring-blue-50">
                      {selectedCandidate['Full Name']?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedCandidate['Full Name']}</h2>
                      <p className="text-blue-600 font-bold text-lg mt-2">{selectedCandidate['Job Title']}</p>
                      <div className={cn("mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border", getStatusColor(selectedCandidate['Status']))}>
                        {selectedCandidate['Status'] || 'Pending'}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="p-3 bg-slate-100 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-700 font-bold"><Phone size={18} className="text-blue-500" /> {selectedCandidate['Phone']}</div>
                      <div className="flex items-center gap-3 text-slate-700 font-bold"><Mail size={18} className="text-blue-500" /> {selectedCandidate['Email'] || 'Not provided'}</div>
                      <div className="flex items-center gap-3 text-slate-700 font-bold"><MapPin size={18} className="text-blue-500" /> {selectedCandidate['Address'] || 'Mumbai, India'}</div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Professional Snapshot</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DetailBox label="Experience" value={selectedCandidate['Experience']} />
                      <DetailBox label="Exp. Salary" value={selectedCandidate['Expected Salary']} />
                      <DetailBox label="Notice" value={selectedCandidate['Notice Period'] ? `${selectedCandidate['Notice Period']} Days` : 'Immediate'} />
                      <DetailBox label="Location" value="On-Site" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Administrative Actions</h3>
                  
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => handleUpdateStatus(selectedCandidate, 'Shortlisted')}
                      disabled={isUpdating || selectedCandidate['Status'] === 'Shortlisted'}
                      className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} /> Shortlist
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedCandidate, 'Hold')}
                      disabled={isUpdating}
                      className="flex-1 bg-white text-slate-600 border border-slate-200 font-black py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Clock size={20} /> Put on Hold
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedCandidate, 'Rejected')}
                      disabled={isUpdating}
                      className="flex-1 bg-red-50 text-red-600 border border-red-100 font-black py-4 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={20} /> Reject Application
                    </button>
                  </div>

                  {selectedCandidate['Status']?.toLowerCase() === 'shortlisted' && (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleConvertToEmployee(selectedCandidate)}
                      className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg"
                    >
                      <UserPlus size={24} /> FINAL HIRE: CONVERT TO EMPLOYEE
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{label}</p>
      <p className="text-sm font-black text-slate-800">{value || 'N/A'}</p>
    </div>
  );
}

function JobOpeningsList({ jobs, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', department: '', location: 'Remote', type: 'Full-time', 
    salary_range: '', description: '', requirements: '', status: 'open'
  });

  const handleOpenForm = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({ ...job });
    } else {
      setEditingJob(null);
      setFormData({ title: '', department: '', location: 'Remote', type: 'Full-time', salary_range: '', description: '', requirements: '', status: 'open' });
    }
    setShowForm(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const endpoint = '/api/database';
      const method = editingJob ? apiClient.put : apiClient.post;
      const payload = {
        table: 'job_openings',
        id: editingJob?.id,
        data: formData
      };

      const response = await method(endpoint, payload);
      if (response.success) {
        toast.success(editingJob ? 'Job updated! ✨' : 'Job published! 🚀', { position: "top-right" });
        setShowForm(false);
        onUpdate('job_openings');
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      await apiClient.put('/api/database', {
        table: 'job_openings',
        id: job.id,
        data: { ...job, status: newStatus }
      });
      onUpdate('job_openings');
      toast.success(`Position ${newStatus === 'open' ? 'Opened ✅' : 'Closed 🔒'}`, { position: "top-right" });
    } catch (e) {
      toast.error('Status update failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Talent Demand</h3>
          <p className="text-slate-400 text-xs font-bold mt-1">Currently managing {jobs.length} active positions</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={20} /> NEW OPENING
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:border-blue-100 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><Building size={80} /></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight leading-tight mb-2">{job.title}</h4>
                <div className="flex gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase size={12} /> {job.department}</span>
                </div>
              </div>
              <button 
                onClick={() => toggleStatus(job)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                  job.status === 'open' ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-400 border-slate-200"
                )}
              >
                {job.status}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Job Type</p>
                <p className="text-sm font-black text-slate-800">{job.type}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Salary Budget</p>
                <p className="text-sm font-black text-blue-600">{job.salary_range}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50">
              <div className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">ID: {job.id.slice(0,8)}...</div>
              <button 
                onClick={() => handleOpenForm(job)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md shadow-slate-100"
              >
                <Edit2 size={14} /> Edit Position
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest italic">No active job openings found</p>
          </div>
        )}
      </div>

      {/* Modern Job Editor Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200]" onClick={() => setShowForm(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-3 top-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full max-w-2xl bg-white rounded-[2rem] shadow-xl z-[201] overflow-y-auto"
            >
              <form onSubmit={handleSaveJob} className="p-10 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{editingJob ? 'Edit Position' : 'Create Position'}</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900"><X size={24} /></button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput label="Job Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                  <FormInput label="Department" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <FormInput label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Type</label>
                    <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-blue-50 font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                  <FormInput label="Salary Range" value={formData.salary_range} onChange={v => setFormData({...formData, salary_range: v})} placeholder="e.g. ₹10L - ₹15L" />
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Status</label>
                    <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-blue-50 font-bold" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="open">Open (Accepting Apps)</option>
                      <option value="closed">Closed (On Hold)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Job Description</label>
                    <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-blue-50 font-bold text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Requirements</label>
                    <textarea rows={3} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-blue-50 font-bold text-sm" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-md hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                  {isSaving ? 'SYNCING...' : editingJob ? 'UPDATE POSITION' : 'PUBLISH POSITION'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange, required = false, placeholder = '' }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
      <input required={required} placeholder={placeholder} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-8 focus:ring-blue-50 font-bold" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
