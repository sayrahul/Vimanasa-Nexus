'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, CheckCircle, XCircle, Clock, 
  MoreVertical, Mail, Phone, Calendar, Briefcase, FileText, 
  UserPlus, ArrowRight, ChevronRight, Download, AlertCircle, 
  DollarSign, Edit2, X, ArrowUpRight, Trash2, MapPin, Building, 
  AlertTriangle, Menu, LayoutGrid, Kanban, Sparkles
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
    const toastId = toast.loading(`Updating ${candidate['Full Name']} to ${newStatus}...`);
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
        toast.update(toastId, { render: "Status synchronization complete", type: "success", isLoading: false, autoClose: 2000 });
        onUpdate('candidates');
        if (selectedCandidate?.id === candidate.id) {
          setSelectedCandidate({ ...selectedCandidate, Status: newStatus });
        }
      }
    } catch (error) {
      toast.update(toastId, { render: "Update failed. Database error.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConvertToEmployee = async (candidate) => {
    setIsUpdating(true);
    const toastId = toast.loading(`Onboarding ${candidate['Full Name']}...`);
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
        toast.update(toastId, { render: "Onboarding successful! Welcome aboard.", type: "success", isLoading: false, autoClose: 3000 });
        onUpdate('workforce');
        onUpdate('candidates');
        onNavigate('placements');
        setShowDrawer(false);
      }
    } catch (error) {
      toast.update(toastId, { render: "Onboarding failed.", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-slate-100 text-slate-500 border-slate-200',
      shortlisted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      rejected: 'bg-rose-100 text-rose-700 border-rose-200',
      hold: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      hired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    const s = status?.toLowerCase() || 'pending';
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", styles[s] || styles.pending)}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      {/* Premium Mesh Header */}
      <header className="relative px-8 pt-12 pb-20 rounded-b-[60px] shadow-2xl overflow-hidden mb-[-40px] z-10">
        <div className="absolute inset-0 bg-[#0F172A]">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#1E293B] rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#334155] rounded-full blur-[100px]"></div>
           <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[80px]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <h1 className="text-white font-black text-xs uppercase tracking-[0.3em] opacity-60">Talent Acquisition</h1>
            </div>
            <h2 className="text-white text-5xl font-black tracking-tighter leading-tight">Recruitment HQ</h2>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-white/80 text-xs font-black uppercase tracking-widest">{candidates.length} Applications</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
              <p className="text-white/40 text-xs font-bold">{jobs.length} Active Openings</p>
            </div>
          </div>

          <div className="flex bg-white/5 backdrop-blur-xl p-1.5 rounded-[24px] border border-white/10 shadow-2xl">
            {[
              { id: 'applications', label: 'Feed', icon: LayoutGrid },
              { id: 'pipeline', label: 'Pipeline', icon: Kanban },
              { id: 'openings', label: 'Board', icon: Briefcase },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-8 py-4 rounded-[18px] text-[11px] font-black transition-all uppercase tracking-widest",
                  activeSubTab === tab.id 
                    ? "bg-white text-slate-900 shadow-xl" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                <tab.icon size={16} strokeWidth={2.5} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 relative z-20">
        <AnimatePresence mode="wait">
          {activeSubTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
              {/* Glassmorphism Filter Bar */}
              <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[40px] border border-white shadow-[0_30px_60px_rgba(0,0,0,0.03)] flex flex-col xl:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search candidate identity..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 rounded-[22px] border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-bold text-slate-700 text-sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2 w-full xl:w-auto">
                  {['all', 'pending', 'shortlisted', 'hold', 'rejected', 'hired'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        statusFilter === status 
                          ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                          : "bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 shadow-sm"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Candidate Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCandidates.length > 0 ? filteredCandidates.map((candidate, idx) => (
                  <CandidateCard 
                    key={candidate.id} 
                    candidate={candidate} 
                    idx={idx}
                    getStatusBadge={getStatusBadge}
                    onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}
                  />
                )) : (
                  <div className="col-span-full py-32 text-center bg-white rounded-[60px] border border-white shadow-sm">
                     <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mx-auto mb-6"><Search size={40} /></div>
                     <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-[10px]">Registry Empty</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSubTab === 'pipeline' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {['Pending', 'Shortlisted', 'Rejected'].map((status) => (
                <div key={status} className="bg-white/40 rounded-[48px] border border-white flex flex-col min-h-[700px] overflow-hidden shadow-sm">
                  <div className="p-8 flex items-center justify-between border-b border-white/50 bg-white/30 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-3 h-3 rounded-full shadow-[0_0_15px_currentColor]", 
                        status === 'Pending' ? "text-slate-400" : 
                        status === 'Shortlisted' ? "text-indigo-500" : 
                        "text-rose-500"
                      )} />
                      <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">
                        {status}
                      </h3>
                    </div>
                    <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 shadow-sm border border-slate-50">
                      {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
                    {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).map((candidate, idx) => (
                      <CandidateCard 
                        key={candidate.id} 
                        candidate={candidate} 
                        idx={idx}
                        isCompact
                        getStatusBadge={getStatusBadge}
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
      </main>

      {/* Profile Drawer */}
      <AnimatePresence>
        {showDrawer && selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100]" onClick={() => setShowDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 35, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-[#F8FAFB] shadow-2xl z-[101] flex flex-col"
            >
              <div className="bg-white p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-900 text-white flex items-center justify-center font-black text-4xl shadow-2xl shadow-slate-900/20 overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${selectedCandidate.id}`} alt="Candidate" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{selectedCandidate['Full Name']}</h2>
                      <div className="flex items-center gap-3">{getStatusBadge(selectedCandidate['Status'])}</div>
                    </div>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="w-12 h-12 bg-slate-50 hover:bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-colors"><X size={24} /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12">
                 <div className="grid grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] border-b border-slate-100 pb-3">Identification</h4>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50"><Mail size={16} /></div>
                             <p className="text-sm font-bold text-slate-700">{selectedCandidate['Email'] || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50"><Phone size={16} /></div>
                             <p className="text-sm font-bold text-slate-700">{selectedCandidate['Phone']}</p>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] border-b border-slate-100 pb-3">Expertise</h4>
                       <div className="space-y-4">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50"><Briefcase size={16} /></div>
                             <p className="text-sm font-bold text-slate-700">{selectedCandidate['Job Title']}</p>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm border border-slate-50"><Calendar size={16} /></div>
                             <p className="text-sm font-bold text-slate-700">{selectedCandidate['Experience'] || 'Fresher'}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-10 rounded-[48px] border border-white shadow-xl shadow-slate-200/20">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Decision Console</h3>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { label: 'Shortlist', status: 'Shortlisted', color: 'bg-indigo-600 text-white shadow-indigo-100', icon: CheckCircle },
                         { label: 'Hold', status: 'Hold', color: 'bg-slate-100 text-slate-900 border-slate-200', icon: Clock },
                         { label: 'Reject', status: 'Rejected', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: XCircle },
                       ].map((btn) => (
                         <button 
                           key={btn.label}
                           onClick={() => handleUpdateStatus(selectedCandidate, btn.status)}
                           disabled={isUpdating || selectedCandidate['Status'] === btn.status}
                           className={cn(
                             "py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 transition-all active:scale-95 disabled:opacity-30 border shadow-lg",
                             btn.color
                           )}
                         >
                            <btn.icon size={20} strokeWidth={2.5} />
                            {btn.label}
                         </button>
                       ))}
                    </div>

                    {selectedCandidate['Status']?.toLowerCase() === 'shortlisted' && (
                       <motion.button 
                         initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                         onClick={() => handleConvertToEmployee(selectedCandidate)}
                         disabled={isUpdating}
                         className="w-full mt-8 bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-4 text-sm group"
                       >
                          <UserPlus size={20} /> ONBOARD AS EMPLOYEE
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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

function CandidateCard({ candidate, idx, onClick, getStatusBadge, isCompact = false }) {
  const status = candidate['Status'] || 'Pending';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.4) }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-[40px] border border-white transition-all duration-500 flex flex-col group cursor-pointer relative overflow-hidden",
        "hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-2",
        isCompact ? "p-6" : "p-8 shadow-sm"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F8FAFB] border border-slate-50 flex items-center justify-center text-slate-900 font-black text-xl shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 overflow-hidden shadow-inner">
             <img src={`https://i.pravatar.cc/150?u=${candidate.id}`} alt="C" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-slate-900 text-base leading-tight truncate tracking-tight">{candidate['Full Name']}</h3>
            <p className="text-[10px] font-black text-slate-300 mt-1 uppercase tracking-widest">{candidate['Job Title']}</p>
          </div>
        </div>
        {!isCompact && getStatusBadge(status)}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between py-5 border-y border-slate-50/50">
           <div>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Experience</p>
              <p className="text-sm font-bold text-slate-700">{candidate['Experience'] || 'Fresher'}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Expected</p>
              <p className="text-sm font-bold text-indigo-600">{candidate['Expected Salary'] || 'N/A'}</p>
           </div>
        </div>
        
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400">
              <MapPin size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[120px]">{candidate['Address'] || 'Mumbai'}</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ChevronRight size={16} strokeWidth={3} />
           </div>
        </div>
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

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiClient[editingJob ? 'put' : 'post']('/api/database', {
        table: 'job_openings',
        id: editingJob?.id,
        data: formData
      });
      if (response.success) {
        toast.success(editingJob ? 'Position Registry Updated' : 'Role Published Successfully');
        setShowForm(false);
        onUpdate('job_openings');
      }
    } catch (error) {
      toast.error('Registry operation failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#0F172A] p-10 rounded-[60px] shadow-2xl shadow-slate-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10">
          <h3 className="font-black text-white uppercase tracking-[0.4em] text-xs opacity-50 mb-2">Job Board</h3>
          <h2 className="text-3xl font-black text-white tracking-tighter">{jobs.length} Active Openings</h2>
        </div>
        <button 
          onClick={() => { setEditingJob(null); setFormData({title:'', department:'', location:'Remote', type:'Full-time', salary_range:'', description:'', requirements:'', status:'open'}); setShowForm(true); }}
          className="w-full sm:w-auto bg-white text-slate-900 px-10 py-5 rounded-[28px] font-black text-xs shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 relative z-10"
        >
          <Plus size={20} strokeWidth={3} /> PUBLISH NEW ROLE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {jobs.map((job, idx) => (
          <div 
            key={job.id} 
            className="bg-white rounded-[48px] p-10 border border-white shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer"
            onClick={() => { setEditingJob(job); setFormData({...job}); setShowForm(true); }}
          >
            <div className="flex justify-between items-start mb-8">
              <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                <Building size={28} strokeWidth={1.5} />
              </div>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                job.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
              )}>
                {job.status}
              </span>
            </div>
            
            <h4 className="font-black text-slate-900 text-2xl tracking-tighter mb-4 leading-tight">{job.title}</h4>
            <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-300 mb-8 uppercase tracking-widest">
              <span className="flex items-center gap-2"><MapPin size={14} /> {job.location}</span>
              <span className="flex items-center gap-2"><Briefcase size={14} /> {job.department}</span>
            </div>

            <div className="grid grid-cols-2 gap-8 py-8 border-t border-slate-50">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Category</p>
                <p className="text-xs font-bold text-slate-700">{job.type}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-2">Budget</p>
                <p className="text-xs font-bold text-indigo-600">{job.salary_range}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F8FAFB] rounded-[60px] shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveJob} className="p-12 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingJob ? 'Update Position' : 'New Position Registry'}</h3>
                  <button type="button" onClick={() => setShowForm(false)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors shadow-sm border border-slate-100"><X size={24} /></button>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <FormInput label="Job Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                  <FormInput label="Department" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <FormInput label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Type</label>
                    <select className="w-full px-6 py-4 bg-white rounded-2xl border border-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-sm shadow-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Requirements Profile</label>
                   <textarea rows={4} className="w-full px-6 py-5 bg-white rounded-[32px] border border-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-sm shadow-sm" placeholder="Define the ideal candidate..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white font-black py-6 rounded-[32px] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 text-sm active:scale-95 transition-all">
                  {isSaving ? 'Processing Registry...' : editingJob ? 'COMMIT CHANGES' : 'PUBLISH POSITION'}
                  <ArrowRight size={20} />
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
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">{label}</label>
      <input 
        required={required} 
        placeholder={placeholder} 
        className="w-full px-6 py-4 bg-white rounded-2xl border border-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-sm shadow-sm" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}
