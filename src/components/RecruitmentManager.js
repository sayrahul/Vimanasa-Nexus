'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  UserPlus,
  ArrowRight,
  ChevronRight,
  Download,
  AlertCircle,
  DollarSign,
  Edit2,
  X,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function RecruitmentManager({ data, onUpdate, onNavigate }) {
  const [activeSubTab, setActiveSubTab] = useState('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const candidates = data?.candidates || [];

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
          admin_notes: candidate.admin_notes || '',
          reviewed_at: new Date().toISOString()
        }
      });

      if (response.success) {
        toast.success(`Candidate status updated to ${newStatus}`);
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
      // 1. Create the Employee Record in Workforce
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
        // 2. Automatically mark as Hired in database
        await handleUpdateStatus(candidate, 'hired');
        toast.success(`Successfully converted ${candidate['Full Name']} to Employee!`);
        
        // 3. Refresh data
        onUpdate('workforce');
        onUpdate('candidates');

        // 4. Navigate to Placements
        onNavigate('placements');
        setShowDrawer(false);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert candidate to employee');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'shortlisted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
      case 'on_hold': return 'bg-slate-50 text-slate-600 border-slate-100';
      case 'hired': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Recruitment Portal</h1>
          <p className="text-slate-500 mt-1">Manage job applications and hiring pipeline</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setActiveSubTab('applications')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'applications' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveSubTab('pipeline')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'pipeline' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Pipeline
          </button>
          <button 
            onClick={() => setActiveSubTab('openings')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeSubTab === 'openings' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Openings
          </button>
        </div>
      </div>

      {activeSubTab === 'applications' ? (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search candidates by name, phone or position..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {['all', 'pending', 'shortlisted', 'on_hold', 'rejected', 'hired'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider border transition-all whitespace-nowrap",
                    statusFilter === status 
                      ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Position</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Exp / Salary</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCandidates.length > 0 ? filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm border-2 border-white shadow-sm">
                            {candidate['Full Name']?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{candidate['Full Name']}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={12} /> Applied {new Date(candidate['Applied On']).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{candidate['Job Title']}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{candidate['Experience']}</p>
                          <p className="text-xs text-slate-500">Exp: {candidate['Expected Salary']}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          getStatusColor(candidate['Status'])
                        )}>
                          {candidate['Status'] || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => {
                            setSelectedCandidate(candidate);
                            setShowDrawer(true);
                          }}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeSubTab === 'pipeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Pending', 'Shortlisted', 'Rejected'].map(status => (
            <div key={status} className="bg-slate-50/50 p-4 rounded-[2rem] border border-slate-200 min-h-[500px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", 
                    status === 'Pending' ? "bg-amber-400" : status === 'Shortlisted' ? "bg-blue-500" : "bg-red-500"
                  )} />
                  {status}
                </h3>
                <span className="bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).length}
                </span>
              </div>
              <div className="space-y-4">
                {candidates.filter(c => (c['Status'] || 'Pending').toLowerCase() === status.toLowerCase()).map(candidate => (
                  <motion.div 
                    layoutId={candidate.id}
                    key={candidate.id} 
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setShowDrawer(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                        {candidate['Full Name']?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm mb-1">{candidate['Full Name']}</p>
                    <p className="text-xs text-slate-500 font-medium mb-3">{candidate['Job Title']}</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>{candidate['Experience']}</span>
                      <span>{candidate['Expected Salary']}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <JobOpeningsList 
          jobs={data?.job_openings || []} 
          onUpdate={() => onUpdate('job_openings')} 
        />
      )}

      {/* Candidate Profile Drawer */}
      <AnimatePresence>
        {showDrawer && selectedCandidate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-[101] overflow-y-auto"
            >
              <div className="p-8">
                {/* Drawer Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-blue-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-200">
                      {selectedCandidate['Full Name']?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedCandidate['Full Name']}</h2>
                      <p className="text-blue-600 font-bold">{selectedCandidate['Job Title']}</p>
                      <div className={cn(
                        "mt-2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block border",
                        getStatusColor(selectedCandidate['Status'])
                      )}>
                        {selectedCandidate['Status'] || 'Pending'}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)}
                    className="p-2 hover:bg-slate-100 rounded-full transition-all"
                  >
                    <XCircle size={24} className="text-slate-400" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Phone</p>
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        <Phone size={14} className="text-slate-400" />
                        {selectedCandidate['Phone']}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Email</p>
                      <div className="flex items-center gap-2 font-bold text-slate-800 truncate">
                        <Mail size={14} className="text-slate-400" />
                        {selectedCandidate['Email'] || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Identity & Professional */}
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-2">Professional Details</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <DetailItem label="Total Experience" value={selectedCandidate['Experience']} />
                      <DetailItem label="Current Salary" value={selectedCandidate['Current Salary']} />
                      <DetailItem label="Expected Salary" value={selectedCandidate['Expected Salary']} />
                      <DetailItem label="Notice Period" value={`${selectedCandidate['Notice Period']} Days`} />
                      <DetailItem label="Employer" value={selectedCandidate['Current Employer'] || 'N/A'} />
                      <DetailItem label="Skills" value={selectedCandidate['Skills'] || 'N/A'} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100 pb-2">Documents</h3>
                    <div className="flex gap-4">
                      {selectedCandidate['Resume Link'] && (
                        <a 
                          href={selectedCandidate['Resume Link']} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all border border-blue-100"
                        >
                          <FileText size={18} /> View Resume
                        </a>
                      )}
                      {selectedCandidate['Photo Link'] && (
                        <a 
                          href={selectedCandidate['Photo Link']} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-slate-100"
                        >
                          <Users size={18} /> View Photo
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Admin Section */}
                  <div className="pt-8 border-t border-slate-100 space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Admin Notes</label>
                      <textarea 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium text-sm"
                        placeholder="Add notes about this candidate..."
                        rows={4}
                        value={selectedCandidate.admin_notes || ''}
                        onChange={(e) => setSelectedCandidate({ ...selectedCandidate, admin_notes: e.target.value })}
                        onBlur={() => handleUpdateStatus(selectedCandidate, selectedCandidate.Status)}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {selectedCandidate.Status?.toLowerCase() !== 'shortlisted' && (
                        <button 
                          onClick={() => handleUpdateStatus(selectedCandidate, 'Shortlisted')}
                          disabled={isUpdating}
                          className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                          Shortlist
                        </button>
                      )}
                      
                      {selectedCandidate.Status?.toLowerCase() === 'shortlisted' && (
                        <button 
                          onClick={() => handleConvertToEmployee(selectedCandidate)}
                          className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                        >
                          <UserPlus size={18} /> Convert to Employee
                        </button>
                      )}

                      <button 
                        onClick={() => handleUpdateStatus(selectedCandidate, 'On_Hold')}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200 disabled:opacity-50"
                      >
                        Hold
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(selectedCandidate, 'Rejected')}
                        disabled={isUpdating}
                        className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-slate-800 break-words">{value || 'N/A'}</p>
    </div>
  );
}

function JobOpeningsList({ jobs, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    department: '',
    location: 'Remote',
    type: 'Full-time',
    salary_range: '',
    description: '',
    requirements: '',
    status: 'open'
  });

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await apiClient.post('/api/database', {
        table: 'job_openings',
        data: newJob
      });
      if (response.success) {
        toast.success('Job opening created successfully!');
        setShowAddForm(false);
        setNewJob({ title: '', department: '', location: 'Remote', type: 'Full-time', salary_range: '', description: '', requirements: '', status: 'open' });
        onUpdate('job_openings');
      }
    } catch (error) {
      toast.error('Failed to create job opening');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (job) => {
    const newStatus = job.status === 'open' ? 'closed' : 'open';
    try {
      const response = await apiClient.put('/api/database', {
        table: 'job_openings',
        id: job.id,
        data: { ...job, status: newStatus }
      });
      if (response.success) {
        toast.success(`Job status updated to ${newStatus}`);
        onUpdate('job_openings');
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Active Openings ({jobs.length})</h3>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          <Plus size={18} /> New Opening
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.length > 0 ? jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-black text-slate-900 text-lg leading-tight">{job.title}</h4>
                <p className="text-sm text-slate-500 font-medium">{job.department} • {job.location}</p>
              </div>
              <button 
                onClick={() => toggleStatus(job)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all",
                  job.status === 'open' ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-100 text-slate-400 border-slate-200"
                )}
              >
                {job.status}
              </button>
            </div>
            <div className="flex gap-4 text-xs font-bold text-slate-500 mb-4">
              <div className="flex items-center gap-1"><Clock size={14} /> {job.type}</div>
              <div className="flex items-center gap-1"><DollarSign size={14} /> {job.salary_range}</div>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Shared Link: /apply?job={job.id}</p>
              <button className="text-blue-600 hover:text-blue-700">
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 italic">
            No job openings created yet.
          </div>
        )}
      </div>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
              onClick={() => setShowAddForm(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl z-[111] overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create Job Opening</h3>
                  <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={24} className="text-slate-400" /></button>
                </div>
                
                <form onSubmit={handleSaveJob} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">Job Title</label>
                      <input required className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">Department</label>
                      <input className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.department} onChange={e => setNewJob({...newJob, department: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">Location</label>
                      <input className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">Type</label>
                      <select className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})}>
                        <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-400 uppercase ml-1">Salary Range</label>
                      <input className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.salary_range} onChange={e => setNewJob({...newJob, salary_range: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Description</label>
                    <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Requirements</label>
                    <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none focus:ring-4 focus:ring-blue-50 font-bold" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} />
                  </div>
                  
                  <div className="pt-6">
                    <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50">
                      {isSaving ? 'Saving...' : 'Publish Opening'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
