"use client";
import React, { useState, useMemo } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, MapPin, Users, Briefcase, Phone, Mail, Building2, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

export default function PartnerDirectory({ partners = [], onAdd, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = 
        (partner['Partner Name'] || partner.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner['Site ID'] || partner.partner_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (partner['Location'] || partner.address || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const pStatus = partner.Status || partner.status || 'Active';
      const matchesStatus = statusFilter === 'All' || pStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [partners, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    if (status === 'Active') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"><CheckCircle size={12} /> Active</span>;
    if (status === 'Inactive') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><XCircle size={12} /> Inactive</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{status || 'Unknown'}</span>;
  };

  const getInitials = (name) => {
    if (!name) return 'PR';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
      {/* Header and Controls */}
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600" /> Site Partners Directory
            </h2>
            <p className="text-sm text-slate-500 mt-1">Manage {partners.length} active service partners and sub-contractors.</p>
          </div>
          <button 
            onClick={onAdd}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Add Partner
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by partner name, ID, or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-sm font-bold text-slate-700"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        {filteredPartners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Building2 className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-700 mb-2">No partners found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or add a new partner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPartners.map((partner, idx) => {
              const status = partner.Status || partner.status || 'Active';
              return (
                <div key={partner.id || idx} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-blue-700 font-black text-xl border border-blue-200 shadow-sm">
                        {getInitials(partner['Partner Name'] || partner.company_name)}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight mb-1">{partner['Partner Name'] || partner.company_name}</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{partner['Site ID'] || partner.partner_id}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{partner['Location'] || partner.address || 'Address not provided'}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Users size={16} className="text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-800">{partner.Headcount || partner.headcount || 0} Staff</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Briefcase size={16} className="text-emerald-500 shrink-0" />
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col">
                      {partner.email && (
                         <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                           <Mail size={12}/> {partner.email}
                         </div>
                      )}
                      {partner.phone && (
                         <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                           <Phone size={12}/> {partner.phone}
                         </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(partner, idx)} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm" title="Edit Partner">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => onDelete(partner, idx)} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Delete Partner">
                        <Trash2 size={16} />
                      </button>
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
