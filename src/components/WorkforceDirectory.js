"use client";
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Edit2, Trash2, FileText, 
  MapPin, Briefcase, Mail, Phone, ChevronDown, CheckCircle, XCircle, Clock
} from 'lucide-react';

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
    if (status === 'Deployed') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12} /> Deployed</span>;
    if (status === 'On Bench') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12} /> On Bench</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status || 'Unknown'}</span>;
  };

  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
      {/* Header and Controls */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Workforce Directory</h2>
            <p className="text-sm text-slate-500 mt-1">Manage {employees.length} total employees across all sites.</p>
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Employee
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
              >
                <option value="All">All Sites</option>
                {uniqueClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative min-w-[140px]">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="Deployed">Deployed</option>
                <option value="On Bench">On Bench</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid/List */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No employees found</h3>
            <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp, idx) => {
              const status = emp['Deployment Status'] || (emp['Assigned Client'] ? 'Deployed' : 'On Bench');
              return (
                <div key={emp.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-black text-lg border border-blue-200">
                        {getInitials(emp.Employee)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 leading-tight">{emp.Employee}</h3>
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{emp['ID']}</span>
                      </div>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                  
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase size={14} className="text-slate-400" />
                      <span className="truncate">{emp['Role'] || 'Unassigned Role'}</span>
                    </div>
                    {status === 'Deployed' && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <span className="truncate font-medium">{emp['Assigned Client']}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(emp, idx)} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors" title="Edit Employee">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(emp, idx)} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Delete Employee">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="relative group/menu">
                      <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                        <FileText size={14} /> Docs
                      </button>
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 overflow-hidden transform translate-y-2 group-hover/menu:translate-y-0">
                        <button onClick={() => onGenerateDoc(emp, 'offer')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-100">Offer Letter</button>
                        <button onClick={() => onGenerateDoc(emp, 'joining')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-b border-slate-100">Joining Letter</button>
                        <button onClick={() => onGenerateDoc(emp, 'experience')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600">Experience Letter</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
