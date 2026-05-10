"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Filter, CheckCircle, XCircle, 
  FileText, Edit2, Trash2 
} from 'lucide-react';
import ExportMenu from '@/components/ExportMenu';

export default function TableView({ title, subtitle, data, columns, onAdd, onEdit, onDelete, tab, onGenerateDoc }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data ? data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">{subtitle}</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
          <button 
            onClick={onAdd}
            data-action={`add-${tab}`}
            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
          </button>
          <ExportMenu data={filteredData} filename={title.toLowerCase().replace(' ', '_')} title={title} />
        </div>
      </header>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={`Search in ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 text-sm sm:text-base font-medium"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
        </div>

        {/* Mobile View */}
        <div className="space-y-3 p-3 sm:hidden">
          {filteredData.length > 0 ? filteredData.map((row, i) => {
            const titleValue = row.Employee || row['Client Name'] || row['Partner Name'] || row.Requirement || row.Category || row.Month || row.ID || `Record ${i + 1}`;
            const statusColumn = columns.find((col) => col.toLowerCase().includes('status'));

            return (
              <article key={row.id || i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900">{titleValue}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{row.ID || row['Client ID'] || row['Site ID'] || title}</p>
                  </div>
                  {statusColumn && (
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase text-slate-600">
                      {row[statusColumn] || 'N/A'}
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  {columns.filter((col) => col !== statusColumn).slice(0, 4).map((col) => (
                    <div key={col} className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <dt className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{col}</dt>
                      <dd className="truncate text-sm font-bold text-slate-800">{row[col] || 'N/A'}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  {tab === 'workforce' && onGenerateDoc && (
                    <button onClick={() => onGenerateDoc(row, 'offer')} className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700">
                      Offer
                    </button>
                  )}
                  <button onClick={() => onEdit(row, i)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    Edit
                  </button>
                  <button onClick={() => onDelete(row, i)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                    Delete
                  </button>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              {data ? 'No records found matching your search.' : 'Loading entries...'}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80">
                {columns.map(col => (
                  <th key={col} className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
                <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                  {columns.map(col => (
                    <td key={col} className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      {col.toLowerCase().includes('status') ? (
                        <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border whitespace-nowrap ${
                          String(row[col]).toLowerCase().includes('active') || String(row[col]).toLowerCase().includes('paid') || String(row[col]).toLowerCase().includes('completed')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : String(row[col]).toLowerCase().includes('progress')
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {row[col] || 'N/A'}
                        </span>
                      ) : col.toLowerCase() === 'employee' ? (
                        <div className="flex items-center gap-3">
                          {row['Photo URL'] ? (
                            <img src={row['Photo URL']} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {String(row[col] || '?').charAt(0)}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{row[col] || 'N/A'}</span>
                        </div>
                      ) : col.toLowerCase() === 'docs' ? (
                        <div className="flex items-center justify-center">
                          {row['Aadhar Doc URL'] && row['PAN Doc URL'] ? (
                            <CheckCircle size={18} className="text-green-500" title="All documents uploaded" />
                          ) : (
                            <XCircle size={18} className="text-red-500" title="Missing documents" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{row[col] || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 sticky right-0 bg-white/95 backdrop-blur-md shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 group-hover:bg-blue-50/90 transition-colors">
                    <div className="flex gap-2 items-center">
                      {tab === 'workforce' && onGenerateDoc && (
                        <div className="flex gap-1.5 border-r border-slate-200 pr-3 mr-1">
                          <button onClick={() => onGenerateDoc(row, 'offer')} title="Offer Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1"><FileText size={12}/> Offer</button>
                          <button onClick={() => onGenerateDoc(row, 'joining')} title="Joining Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-100 flex items-center gap-1"><FileText size={12}/> Joining</button>
                          <button onClick={() => onGenerateDoc(row, 'experience')} title="Experience Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100 flex items-center gap-1"><FileText size={12}/> Experience</button>
                        </div>
                      )}
                      <button 
                        onClick={() => onEdit(row, i)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(row, i)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 sm:px-8 py-12 sm:py-20 text-center text-slate-400 text-sm sm:text-base italic">
                    {data ? "No records found matching your search." : "Loading entries from Google Sheets..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
