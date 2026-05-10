"use client";
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, FileText, 
  MapPin, Briefcase, Mail, Phone, ChevronDown, CheckCircle, XCircle, Clock, Download,
  User, ExternalLink, Calendar
} from 'lucide-react';
import { exportToExcel } from '@/lib/excelExport';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkforceDirectory({ employees = [], clients = [], onAdd, onEdit, onDelete, onGenerateDoc }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Extract unique clients and roles for filters
  const uniqueClients = [...new Set(employees.map(e => e['Assigned Client']).filter(Boolean))].sort();

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        (emp.Employee || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp['ID'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp['Role'] || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const empStatus = emp['Deployment Status'] || (emp['Assigned Client'] ? 'Deployed' : 'On Bench');
      
      const matchesClient = clientFilter === 'All' || emp['Assigned Client'] === clientFilter;
      const matchesStatus = statusFilter === 'All' || empStatus === statusFilter;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [employees, searchTerm, clientFilter, statusFilter]);

  const getStatusBadge = (status) => {
    if (status === 'Deployed') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 uppercase tracking-wider">
        <CheckCircle size={10} /> Deployed
      </span>
    );
    if (status === 'On Bench') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
        <Clock size={10} /> On Bench
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
        {status || 'Unknown'}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Controls Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => exportToExcel(filteredEmployees, 'Workforce_Directory', 'Employees')}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              <Download size={18} /> 
              <span>Export</span>
            </button>
            <button 
              onClick={onAdd}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <Plus size={18} /> 
              <span>Add Employee</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row gap-3">
          <div className="relative flex-1">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700"
            >
              <option value="All">All Client Sites</option>
              {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="relative flex-1">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700"
            >
              <option value="All">All Status</option>
              <option value="Deployed">Deployed</option>
              <option value="On Bench">On Bench</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <AnimatePresence mode="popLayout">
          {filteredEmployees.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key="no-results"
              className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <User className="text-slate-300" size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800">No employees found</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Try adjusting your filters or search terms to find what you're looking for.</p>
            </motion.div>
          ) : (
            filteredEmployees.map((emp, idx) => (
              <EmployeeCard 
                key={emp.id || idx}
                emp={emp}
                idx={idx}
                onEdit={onEdit}
                onDelete={onDelete}
                onGenerateDoc={onGenerateDoc}
                getStatusBadge={getStatusBadge}
                getInitials={getInitials}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmployeeCard({ emp, idx, onEdit, onDelete, onGenerateDoc, getStatusBadge, getInitials }) {
  const [showDocMenu, setShowDocMenu] = useState(false);
  const status = emp['Deployment Status'] || (emp['Assigned Client'] ? 'Deployed' : 'On Bench');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.5) }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full"
    >
      {/* Card Header with Status */}
      <div className="p-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-100 shrink-0">
            {emp['Photo URL'] ? (
              <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover rounded-2xl" />
            ) : getInitials(emp.Employee)}
          </div>
          {getStatusBadge(status)}
        </div>
        <div className="min-w-0">
          <h3 className="font-black text-slate-900 text-base leading-tight truncate" title={emp.Employee}>
            {emp.Employee}
          </h3>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-tighter">ID: {emp['ID']}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 space-y-3 flex-1">
        <div className="flex items-start gap-3">
          <Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</p>
            <p className="text-sm font-bold text-slate-700 truncate">{emp['Role'] || 'Unassigned'}</p>
          </div>
        </div>

        {status === 'Deployed' ? (
          <div className="flex items-start gap-3 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
            <MapPin size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Work Site</p>
              <p className="text-sm font-black text-blue-700 truncate">{emp['Assigned Client']}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <Clock size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bench Since</p>
              <p className="text-sm font-bold text-slate-600 truncate">{emp['Created At'] ? new Date(emp['Created At']).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
        <button 
          onClick={() => onEdit(emp, idx)}
          className="flex-1 bg-white border border-slate-200 p-2 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-2 text-xs font-bold"
        >
          <Edit2 size={14} /> <span>Edit</span>
        </button>
        <button 
          onClick={() => onDelete(emp, idx)}
          className="bg-white border border-slate-200 p-2 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center shrink-0"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
        
        <div className="relative shrink-0">
          <button 
            onClick={() => setShowDocMenu(!showDocMenu)}
            className={`p-2 rounded-xl transition-all flex items-center justify-center ${showDocMenu ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <FileText size={14} />
          </button>
          
          <AnimatePresence>
            {showDocMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDocMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full right-0 mb-3 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden"
                >
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Documents</p>
                  </div>
                  <div className="p-1">
                    <DocMenuItem icon={FileText} label="Offer Letter" onClick={() => { onGenerateDoc(emp, 'offer'); setShowDocMenu(false); }} />
                    <DocMenuItem icon={ExternalLink} label="Joining Letter" onClick={() => { onGenerateDoc(emp, 'joining'); setShowDocMenu(false); }} />
                    <DocMenuItem icon={Calendar} label="Experience" onClick={() => { onGenerateDoc(emp, 'experience'); setShowDocMenu(false); }} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function DocMenuItem({ icon: Icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex items-center gap-2"
    >
      <Icon size={14} /> {label}
    </button>
  );
}
