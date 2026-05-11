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
      pending: 'bg-slate-50 text-slate-500 border-slate-200/60',
      shortlisted: 'bg-indigo-50/50 text-indigo-600 border-indigo-100/80',
      rejected: 'bg-rose-50/50 text-rose-600 border-rose-100/80',
      hold: 'bg-zinc-100 text-zinc-500 border-zinc-200',
      hired: 'bg-emerald-50/50 text-emerald-600 border-emerald-100/80',
    };
    const s = status?.toLowerCase() || 'pending';
    return (
      <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border", styles[s] || styles.pending)}>
        {status || 'Pending'}
      </span>
    );
  };

  const getAccentColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'shortlisted': return 'bg-indigo-500';
      case 'hired': return 'bg-emerald-500';
      case 'rejected': return 'bg-rose-500';
      case 'hold': return 'bg-zinc-400';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Premium Corporate Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Recruitment HQ</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Managing {candidates.length} active applications
          </p>
        </div>

        {/* Tab Switcher - Now integrated into header for mobile */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/60 w-full lg:w-auto">
          {['applications', 'pipeline', 'openings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "flex-1 px-5 py-2 rounded-lg text-[11px] font-bold transition-all capitalize whitespace-nowrap uppercase tracking-wider",
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
            <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col xl:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200/60 bg-slate-50/30 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-semibold text-slate-700 text-sm placeholder:text-slate-400"
                />
              </div>
              <div className="flex flex-wrap gap-1.5 w-full xl:w-auto">
                {['all', 'pending', 'shortlisted', 'hold', 'rejected', 'hired'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                      statusFilter === status 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-500 border-slate-200/60 hover:border-indigo-400 hover:text-indigo-600"
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
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {['Pending', 'Shortlisted', 'Rejected'].map((status) => (
              <div key={status} className="bg-slate-50/40 rounded-3xl border border-slate-200/60 flex flex-col min-h-[600px] overflow-hidden">
                <div className="p-6 border-b border-slate-200/40 bg-white/40 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full ring-4", 
                      status === 'Pending' ? "bg-slate-400 ring-slate-400/10" : 
                      status === 'Shortlisted' ? "bg-indigo-500 ring-indigo-500/10" : 
                      "bg-rose-500 ring-rose-500/10"
                    )} />
                    <h3 className="font-bold text-slate-900 uppercase tracking-loose text-xs">
                      {status}
                    </h3>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm">
                    {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                  </span>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
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
                  {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest">No candidates</p>
                    </div>
                  )}
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
      transition={{ duration: 0.3, delay: Math.min(idx * 0.05, 0.4) }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200/70 transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden",
        "hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200/50 hover:-translate-y-0.5",
        isCompact ? "p-4" : "h-full"
      )}
    >
      {!isCompact && (
        <div className={cn("h-1 w-full", getAccentColor(status))} />
      )}
      
      <div className={cn(isCompact ? "" : "p-6 flex-1")}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-bold text-base shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              {candidate['Full Name']?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-[13px] leading-tight truncate">{candidate['Full Name']}</h3>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate flex items-center gap-1">
                <Phone size={10} className="text-slate-300" />
                {candidate['Phone']}
              </p>
            </div>
          </div>
          {!isCompact && getStatusBadge(status)}
        </div>

        <div className="space-y-4">
          <div className={cn(
            "grid grid-cols-2 gap-4 py-3 border-y border-slate-50",
            isCompact && "py-2 border-none bg-slate-50/50 rounded-xl px-3"
          )}>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
              <div className="flex items-center gap-1.5 text-slate-700">
                <p className="text-[11px] font-semibold truncate leading-none">{candidate['Job Title']}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
              <div className="flex items-center gap-1.5 text-slate-700">
                <p className="text-[11px] font-semibold truncate leading-none">{candidate['Experience'] || 'Fresher'}</p>
              </div>
            </div>
          </div>
          
          {!isCompact && (
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-1.5 text-slate-500">
                 <DollarSign size={12} className="text-slate-300" />
                 <span className="text-[11px] font-semibold">{candidate['Expected Salary'] || 'N/A'}</span>
               </div>
               <div className="flex items-center gap-1.5 text-slate-500">
                 <MapPin size={12} className="text-slate-300" />
                 <span className="text-[11px] font-semibold truncate max-w-[100px]">{candidate['Address'] || 'Mumbai'}</span>
               </div>
            </div>
          )}
        </div>
      </div>

      {!isCompact && (
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100/60 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors mt-auto">
          <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">View Profile</span>
          <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      )}
      
      {isCompact && (
         <div className="mt-3 flex items-center justify-between">
            {getStatusBadge(status)}
            <div className="p-1 rounded-md bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
              <ChevronRight size={14} />
            </div>
         </div>
      )}
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">Job Board</h3>
          <p className="text-slate-400 text-[11px] font-medium mt-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {jobs.length} Active job openings
          </p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> PUBLISH NEW ROLE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.length > 0 ? jobs.map((job, idx) => (
          <div 
            key={job.id} 
            className="bg-white rounded-2xl border border-slate-200/70 transition-all duration-300 flex flex-col group overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200/50"
            onClick={() => handleOpenForm(job)}
          >
            <div className={cn("h-1 w-full", job.status === 'open' ? 'bg-emerald-500' : 'bg-slate-300')} />
            <div className="p-6 flex-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <Building size={20} />
                </div>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
                  job.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100/80" : "bg-slate-50 text-slate-400 border-slate-200"
                )}>
                  {job.status}
                </span>
              </div>
              
              <h4 className="font-bold text-slate-900 text-[15px] leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
              <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-300" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-slate-300" /> {job.department}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 py-4 border-t border-slate-50">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Position Type</p>
                  <p className="text-[11px] font-bold text-slate-700">{job.type}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Annual Budget</p>
                  <p className="text-[11px] font-bold text-indigo-600">{job.salary_range}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100/60 flex items-center justify-between group-hover:bg-indigo-50/30 transition-colors mt-auto cursor-pointer">
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-indigo-600 transition-colors uppercase tracking-wider">Manage Opening</span>
              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm"><Briefcase size={32} /></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active job openings found</p>
          </div>
        )}
      </div>

      {/* Modern Job Editor Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200/60"
            >
              <form onSubmit={handleSaveJob} className="p-8 space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{editingJob ? 'Manage Position' : 'Publish Position'}</h3>
                    <p className="text-slate-400 text-xs font-medium mt-1">Fill in the details for the job opening</p>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput label="Job Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                  <FormInput label="Department" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <FormInput label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all font-semibold text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                  <FormInput label="Salary Range" value={formData.salary_range} onChange={v => setFormData({...formData, salary_range: v})} placeholder="e.g. ₹10L - ₹15L" />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all font-semibold text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Requirements</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all font-semibold text-sm placeholder:text-slate-400" placeholder="List key requirements..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                  </div>
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSaving ? 'Processing...' : editingJob ? 'Update Position' : 'Publish Position'}
                  {!isSaving && <ArrowRight size={18} />}
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
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        required={required} 
        placeholder={placeholder} 
        className="w-full px-4 py-2.5 bg-slate-50/50 rounded-xl border border-slate-200/60 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-50/50 transition-all font-semibold text-sm placeholder:text-slate-400" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}
