'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, Filter, Eye, CheckCircle, XCircle, Clock, 
  MoreVertical, Mail, Phone, Calendar, Briefcase, FileText, 
  UserPlus, ArrowRight, ChevronRight, Download, AlertCircle, 
  DollarSign, Edit2, X, ArrowUpRight, Trash2, MapPin, Building, 
  AlertTriangle, Menu, LayoutGrid, Kanban, Sparkles, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';

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
    const toastId = toast.loading(`Updating ${candidate['Full Name']} status...`);
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
        toast.update(toastId, { render: "Status updated", type: "success", isLoading: false, autoClose: 2000 });
        onUpdate('candidates');
        if (selectedCandidate?.id === candidate.id) {
          setSelectedCandidate({ ...selectedCandidate, Status: newStatus });
        }
      }
    } catch (error) {
      toast.update(toastId, { render: "Update failed", type: "error", isLoading: false, autoClose: 3000 });
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
        toast.update(toastId, { render: "Onboarding successful!", type: "success", isLoading: false, autoClose: 3000 });
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
      shortlisted: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
      hold: 'bg-amber-100 text-amber-700 border-amber-200',
      hired: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
    const s = status?.toLowerCase() || 'pending';
    return (
      <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm", styles[s] || styles.pending)}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Clean Corporate Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Recruitment HQ</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">Manage candidate pipelines and job openings</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => exportToExcel(candidates, 'Candidate_Database', 'Candidates')}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Download size={18} />
            <span>Export Registry</span>
          </button>
          {activeSubTab === 'openings' && (
             <button 
                onClick={() => document.getElementById('add-job-btn')?.click()}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
             >
                <Plus size={18} />
                <span>Publish Role</span>
             </button>
          )}
        </div>
      </div>

      {/* Modern Sub-navigation */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 w-fit shadow-sm">
        {[
          { id: 'applications', label: 'Candidate Feed', icon: LayoutGrid },
          { id: 'pipeline', label: 'Hiring Pipeline', icon: Kanban },
          { id: 'openings', label: 'Job Board', icon: Briefcase },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest",
              activeSubTab === tab.id 
                ? "bg-slate-900 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === 'applications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Minimalist Filter Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name, role or contact..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'shortlisted', 'hold', 'rejected', 'hired'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        statusFilter === status 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : "bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCandidates.length > 0 ? filteredCandidates.map((candidate, idx) => (
                <CandidateCard 
                  key={candidate.id} 
                  candidate={candidate} 
                  idx={idx}
                  getStatusBadge={getStatusBadge}
                  onClick={() => { setSelectedCandidate(candidate); setShowDrawer(true); }}
                />
              )) : (
                <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-dashed border-slate-300">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-4"><Users size={32} /></div>
                   <h3 className="text-slate-900 font-bold">No candidates found</h3>
                   <p className="text-slate-400 text-sm mt-1">Try broadening your search or status filter.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'pipeline' && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} 
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {['Pending', 'Shortlisted', 'Rejected'].map((status) => (
              <div key={status} className="bg-slate-50/50 rounded-3xl border border-slate-200 flex flex-col min-h-[600px] overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-slate-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", 
                      status === 'Pending' ? "bg-slate-400" : 
                      status === 'Shortlisted' ? "bg-blue-500" : 
                      "bg-red-500"
                    )} />
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">
                      {status}
                    </h3>
                  </div>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">
                    {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                  </span>
                </div>
                
                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
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
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.99 }}>
            <JobOpeningsList jobs={jobs} onUpdate={onUpdate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Profile Drawer */}
      <AnimatePresence>
        {showDrawer && selectedCandidate && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]" onClick={() => setShowDrawer(false)} />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[101] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-lg overflow-hidden">
                     <img src={`https://i.pravatar.cc/150?u=${selectedCandidate.id}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedCandidate['Full Name']}</h2>
                    <div className="mt-1 flex items-center gap-2">{getStatusBadge(selectedCandidate['Status'])}</div>
                  </div>
                </div>
                <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={24} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Candidate Details</h4>
                       <DetailItem icon={Mail} value={selectedCandidate['Email'] || 'N/A'} />
                       <DetailItem icon={Phone} value={selectedCandidate['Phone']} />
                       <DetailItem icon={MapPin} value={selectedCandidate['Address'] || 'Mumbai'} />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Work Profile</h4>
                       <DetailItem icon={Briefcase} value={selectedCandidate['Job Title']} />
                       <DetailItem icon={Calendar} value={selectedCandidate['Experience'] || 'Fresher'} />
                       <DetailItem icon={DollarSign} value={selectedCandidate['Expected Salary'] || 'N/A'} />
                    </div>
                 </div>

                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Status Management</h3>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { label: 'Shortlist', status: 'Shortlisted', color: 'bg-white border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white', icon: CheckCircle },
                         { label: 'Hold', status: 'Hold', color: 'bg-white border-slate-200 text-slate-600 hover:bg-slate-600 hover:text-white', icon: Clock },
                         { label: 'Reject', status: 'Rejected', color: 'bg-white border-red-200 text-red-600 hover:bg-red-600 hover:text-white', icon: XCircle },
                       ].map((btn) => (
                         <button 
                           key={btn.label}
                           onClick={() => handleUpdateStatus(selectedCandidate, btn.status)}
                           disabled={isUpdating || selectedCandidate['Status'] === btn.status}
                           className={cn(
                             "py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center gap-2 transition-all active:scale-95 disabled:opacity-30 border shadow-sm",
                             btn.color
                           )}
                         >
                            <btn.icon size={18} />
                            {btn.label}
                         </button>
                       ))}
                    </div>

                    {selectedCandidate['Status']?.toLowerCase() === 'shortlisted' && (
                       <button 
                         onClick={() => handleConvertToEmployee(selectedCandidate)}
                         disabled={isUpdating}
                         className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-xs uppercase tracking-widest transition-all hover:bg-blue-600"
                       >
                          <UserPlus size={16} /> Convert to Employee
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

function DetailItem({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <Icon size={14} className="text-slate-400" />
      <p className="text-xs font-bold truncate">{value}</p>
    </div>
  );
}

function CandidateCard({ candidate, idx, onClick, getStatusBadge, isCompact = false }) {
  const status = candidate['Status'] || 'Pending';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group cursor-pointer relative overflow-hidden",
        isCompact ? "p-4" : "p-5"
      )}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        status === 'Shortlisted' ? 'bg-blue-500' : 
        status === 'Hired' ? 'bg-emerald-500' : 
        status === 'Rejected' ? 'bg-red-500' : 'bg-slate-200'
      }`} />
      
      <div className="flex justify-between items-start mb-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden shadow-inner">
             <img src={`https://i.pravatar.cc/150?u=${candidate.id}`} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-sm leading-tight truncate">{candidate['Full Name']}</h3>
            <p className="text-[9px] font-black text-slate-400 mt-0.5 uppercase tracking-wider truncate">{candidate['Job Title']}</p>
          </div>
        </div>
        {!isCompact && getStatusBadge(status)}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-50">
           <div>
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Exp</p>
              <p className="text-[11px] font-bold text-slate-600 truncate">{candidate['Experience'] || 'Fresher'}</p>
           </div>
           <div className="text-right">
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Expect</p>
              <p className="text-[11px] font-bold text-blue-600 truncate">{candidate['Expected Salary'] || 'N/A'}</p>
           </div>
        </div>
        
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={10} strokeWidth={2.5} />
              <span className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[100px]">{candidate['Address'] || 'Mumbai'}</span>
           </div>
           <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ChevronRight size={14} strokeWidth={3} />
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
        toast.success('Position updated');
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
      {/* Job Board Control */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{jobs.length} Active Positions</h2>
            <p className="text-xs text-slate-400 font-medium">Publicly listed openings</p>
          </div>
        </div>
        <button 
          id="add-job-btn"
          onClick={() => { setEditingJob(null); setFormData({title:'', department:'', location:'Remote', type:'Full-time', salary_range:'', description:'', requirements:'', status:'open'}); setShowForm(true); }}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 rounded-2xl font-black text-xs shadow-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={18} strokeWidth={3} /> NEW POSITION
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            onClick={() => { setEditingJob(job); setFormData({...job}); setShowForm(true); }}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                <Building2 size={20} />
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                job.status === 'open' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
              )}>
                {job.status}
              </span>
            </div>
            
            <h4 className="font-bold text-slate-900 text-lg leading-tight mb-4 group-hover:text-blue-600 transition-colors">{job.title}</h4>
            <div className="space-y-2 mb-6">
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <MapPin size={12} className="text-slate-300" /> {job.location}
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Building size={12} className="text-slate-300" /> {job.department}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
              <div>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Type</p>
                <p className="text-[11px] font-bold text-slate-700">{job.type}</p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Budget</p>
                <p className="text-[11px] font-bold text-blue-600">{job.salary_range || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-widest">{editingJob ? 'Edit Position' : 'New Role'}</h3>
                <button onClick={() => setShowForm(false)} className="hover:bg-white/20 p-2 rounded-lg transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveJob} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Job Title" value={formData.title} onChange={v => setFormData({...formData, title: v})} required />
                  <FormInput label="Department" value={formData.department} onChange={v => setFormData({...formData, department: v})} />
                  <FormInput label="Location" value={formData.location} onChange={v => setFormData({...formData, location: v})} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                    <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirements Profile</label>
                   <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" placeholder="Define key qualifications..." value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} />
                </div>

                <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-xs uppercase tracking-widest transition-all hover:bg-blue-700">
                  {isSaving ? 'Processing...' : editingJob ? 'Update Position' : 'Publish Position'}
                  <ArrowRight size={16} />
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
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        required={required} 
        placeholder={placeholder} 
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm" 
        value={value} 
        onChange={e => onChange(e.target.value)} 
      />
    </div>
  );
}
