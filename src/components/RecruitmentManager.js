'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, CheckCircle, XCircle, Clock, 
  MoreVertical, Mail, Phone, Calendar, Briefcase, FileText, 
  UserPlus, ArrowRight, ChevronRight, Download, AlertCircle, 
  DollarSign, Edit2, X, ArrowUpRight, Trash2, MapPin, Building, AlertTriangle
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
        toast.success(`Status updated to ${newStatus}`);
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
        'Role': candidate['Job Title'],
        'Status': 'Active',
        'Assigned Client': 'Pending Assignment'
      };

      const empResponse = await apiClient.post('/api/database', {
        table: 'workforce',
        data: employeeData
      });

      if (empResponse.success) {
        await handleUpdateStatus(candidate, 'Hired');
        toast.success(`Hired ${candidate['Full Name']}!`);
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      shortlisted: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      rejected: 'bg-red-50 text-red-600 border-red-100',
      hold: 'bg-slate-100 text-slate-600 border-slate-200',
      hired: 'bg-green-50 text-green-600 border-green-100',
    };
    const s = status?.toLowerCase() || 'pending';
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border", styles[s] || styles.pending)}>
        {status || 'Pending'}
      </span>
    );
  };

  const getAccentColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted': return 'bg-indigo-600';
      case 'hired': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'hold': return 'bg-slate-400';
      default: return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Premium Corporate Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Recruitment HQ</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Users size={16} className="text-indigo-600" />
            Managing {candidates.length} candidate applications
          </p>
        </div>

        {/* Tab Switcher - Now integrated into header for mobile */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full lg:w-auto">
          {['applications', 'pipeline', 'openings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "flex-1 px-4 py-2 rounded-lg text-[10px] font-black transition-all capitalize whitespace-nowrap uppercase tracking-wider",
                activeSubTab === tab 
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50" 
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Corporate Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-5 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, role or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-bold text-slate-700 text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                {['all', 'pending', 'shortlisted', 'hold', 'rejected', 'hired'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all",
                      statusFilter === status 
                        ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-600 hover:text-indigo-600"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Corporate Candidate Grid - Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCandidates.length > 0 ? filteredCandidates.map((candidate, idx) => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  idx={idx}
                  getStatusBadge={getStatusBadge}
                  getAccentColor={getAccentColor}
                  onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}
                />
              )) : (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                   <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4"><Search size={32} /></div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No matching applications found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'pipeline' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {['Pending', 'Shortlisted', 'Rejected'].map((status) => (
              <div key={status} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", 
                      status === 'Pending' ? "bg-amber-400" : status === 'Shortlisted' ? "bg-indigo-500" : "bg-red-500"
                    )} />
                    {status}
                  </h3>
                  <span className="bg-white px-2.5 py-1 rounded-lg text-[10px] font-black text-slate-400 border border-slate-200">
                    {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                  </span>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                  {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).map((candidate, idx) => (
                    <CandidateCard 
                      key={candidate.id} 
                      candidate={candidate} 
                      idx={idx}
                      isCompact
                      getStatusBadge={getStatusBadge}
                      getAccentColor={getAccentColor}
                      onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSubTab === 'openings' && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <JobOpeningsList jobs={jobs} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Candidate Profile Drawer */}
      <AnimatePresence>
        {showDrawer && selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]" onClick={() => setShowDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[101] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-100">
                      {selectedCandidate['Full Name']?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedCandidate['Full Name']}</h2>
                      <div className="mt-2">{getStatusBadge(selectedCandidate['Status'])}</div>
                    </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X size={24} /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Contact</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm"><Phone size={14} className="text-indigo-500" /> {selectedCandidate['Phone']}</div>
                      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm truncate"><Mail size={14} className="text-indigo-500" /> {selectedCandidate['Email'] || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Application</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm"><Briefcase size={14} className="text-indigo-500" /> {selectedCandidate['Job Title']}</div>
                      <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm"><Calendar size={14} className="text-indigo-500" /> {selectedCandidate['Experience'] || 'Fresher'}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                   <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">Workflow Actions</h4>
                   <div className="flex flex-wrap gap-2">
                     <button 
                       onClick={() => handleUpdateStatus(selectedCandidate, 'Shortlisted')}
                       disabled={isUpdating || selectedCandidate['Status'] === 'Shortlisted'}
                       className="flex-1 bg-white border border-slate-200 text-indigo-600 font-bold py-2.5 rounded-lg text-xs hover:bg-indigo-50 hover:border-indigo-200 transition-all disabled:opacity-50"
                     >
                       Shortlist
                     </button>
                     <button 
                       onClick={() => handleUpdateStatus(selectedCandidate, 'Hold')}
                       disabled={isUpdating}
                       className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-2.5 rounded-lg text-xs hover:bg-slate-50 transition-all disabled:opacity-50"
                     >
                       On Hold
                     </button>
                     <button 
                       onClick={() => handleUpdateStatus(selectedCandidate, 'Rejected')}
                       disabled={isUpdating}
                       className="flex-1 bg-white border border-slate-200 text-red-600 font-bold py-2.5 rounded-lg text-xs hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-50"
                     >
                       Reject
                     </button>
                   </div>
                   
                   {selectedCandidate['Status']?.toLowerCase() === 'shortlisted' && (
                     <button 
                       onClick={() => handleConvertToEmployee(selectedCandidate)}
                       disabled={isUpdating}
                       className="w-full mt-4 bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm"
                     >
                       <UserPlus size={18} /> Convert to Employee
                     </button>
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

function CandidateCard({ candidate, idx, onClick, getStatusBadge, getAccentColor, isCompact = false }) {
  const status = candidate['Status'] || 'Pending';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group cursor-pointer overflow-hidden"
    >
      <div className={cn("h-1.5 w-full", getAccentColor(status))} />
      
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 font-black text-lg shrink-0">
              {candidate['Full Name']?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{candidate['Full Name']}</h3>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate">{candidate['Phone']}</p>
            </div>
          </div>
          {!isCompact && getStatusBadge(status)}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 py-2.5 border-y border-slate-50">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Briefcase size={10} className="text-slate-400" />
                <p className="text-[11px] font-semibold truncate">{candidate['Job Title']}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Calendar size={10} className="text-slate-400" />
                <p className="text-[11px] font-semibold truncate">{candidate['Experience'] || 'Fresher'}</p>
              </div>
            </div>
          </div>
          
          {!isCompact && (
            <div className="flex items-center justify-between text-slate-500">
               <div className="flex items-center gap-1.5">
                 <DollarSign size={10} />
                 <span className="text-[10px] font-bold">{candidate['Expected Salary'] || 'N/A'}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <MapPin size={10} />
                 <span className="text-[10px] font-bold truncate max-w-[80px]">{candidate['Address'] || 'Mumbai'}</span>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between group-hover:bg-indigo-50 transition-colors">
        <span className="text-[9px] font-black text-slate-400 group-hover:text-indigo-600 transition-colors">REVIEW PROFILE</span>
        <ChevronRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5" />
      </div>
    </motion.div>
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
        toast.success(editingJob ? 'Job updated!' : 'Job published!');
        setShowForm(false);
        onUpdate('job_openings');
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Talent Pipeline</h3>
          <p className="text-slate-400 text-[11px] font-bold mt-1">Actively managing {jobs.length} open positions</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-black text-xs shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> NEW OPENING
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.length > 0 ? jobs.map((job, idx) => (
          <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
            <div className={`h-1.5 w-full ${job.status === 'open' ? 'bg-green-500' : 'bg-slate-300'}`} />
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building size={20} />
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                  job.status === 'open' ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-100 text-slate-600 border-slate-200"
                )}>
                  {job.status}
                </span>
              </div>
              
              <h4 className="font-bold text-slate-900 text-lg leading-tight mb-2 truncate">{job.title}</h4>
              <div className="flex gap-3 text-[11px] font-bold text-slate-400 mb-4">
                <span className="flex items-center gap-1"><MapPin size={10} /> {job.location}</span>
                <span className="flex items-center gap-1"><Briefcase size={10} /> {job.department}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Type</p>
                  <p className="text-xs font-black text-slate-700">{job.type}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Budget</p>
                  <p className="text-xs font-black text-indigo-600">{job.salary_range}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100">
               <button 
                onClick={() => handleOpenForm(job)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs hover:border-indigo-600 hover:text-indigo-600 transition-all"
              >
                <Edit2 size={14} /> Edit Position
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No active job openings found</p>
          </div>
        )}
      </div>

      {/* Modern Job Editor Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden"
            >
              <form onSubmit={handleSaveJob} className="p-8 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingJob ? 'Edit Position' : 'New Position'}</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><X size={20} /></button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Job Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                  <FormInput label="Department" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <FormInput label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                  <FormInput label="Salary Range" value={formData.salary_range} onChange={v => setFormData({...formData, salary_range: v})} placeholder="e.g. ₹10L - ₹15L" />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requirements</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50">
                  {isSaving ? 'Saving...' : editingJob ? 'Update Position' : 'Publish Position'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange, required = false, placeholder = '' }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input required={required} placeholder={placeholder} className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-100 font-bold text-sm" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
