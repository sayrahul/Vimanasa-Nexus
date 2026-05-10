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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group"
    >
      {/* Top Banner Accent */}
      <div className={`h-1.5 w-full ${status === 'Deployed' ? 'bg-indigo-600' : 'bg-slate-300'}`} />
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-base border border-slate-100 shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 overflow-hidden">
            {emp['Photo URL'] ? (
              <img src={emp['Photo URL']} alt="" className="w-full h-full object-cover" />
            ) : getInitials(emp.Employee)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate mb-1" title={emp.Employee}>
              {emp.Employee}
            </h3>
            <div className="flex items-center flex-wrap gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {emp['ID'] || 'N/A'}</p>
              <div className="pt-0.5">
                {getStatusBadge(status)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-5">
          {/* Work Info Grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 py-4 border-y border-slate-50">
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Designation</p>
              <div className="flex items-center gap-2 text-slate-700">
                <Briefcase size={13} className="text-slate-300 shrink-0" />
                <p className="text-xs font-bold truncate" title={emp['Role']}>{emp['Role'] || 'Staff'}</p>
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Location</p>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin size={13} className="text-slate-300 shrink-0" />
                <p className="text-xs font-bold truncate" title={emp['Assigned Client']}>{emp['Assigned Client'] || 'Bench'}</p>
              </div>
            </div>
          </div>

          {/* Contact Quick Info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-slate-500 group/item">
              <Mail size={13} className="text-slate-300 shrink-0 group-hover/item:text-indigo-400 transition-colors" />
              <p className="text-xs font-medium truncate" title={emp['Email']}>{emp['Email'] || 'no-email@vimanasa.com'}</p>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500 group/item">
              <Phone size={13} className="text-slate-300 shrink-0 group-hover/item:text-indigo-400 transition-colors" />
              <p className="text-xs font-medium truncate">{emp['Phone'] || 'Not Provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Action Footer */}
      <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onEdit(emp, idx)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Details"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(emp, idx)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove Employee"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowDocMenu(!showDocMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              showDocMenu 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600'
            }`}
          >
            <FileText size={14} />
            <span>Documents</span>
          </button>
          
          <AnimatePresence>
            {showDocMenu && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setShowDocMenu(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[70] overflow-hidden"
                >
                  <div className="p-1.5">
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
      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors flex items-center gap-2"
    >
      <Icon size={14} /> {label}
    </button>
  );
}
