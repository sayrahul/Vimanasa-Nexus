"use client";
import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Calendar, DollarSign, Users, Edit2, Trash2, Plus, X, Search, Download } from 'lucide-react';
import { exportToExcel } from '@/lib/excelExport';
import { motion } from 'framer-motion';

export default function ClientManagement({ clients, employees, onAdd, onEdit, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredClients = React.useMemo(() => {
    return (clients || []).filter(c => {
      const matchesSearch = 
        (c['Client Name'] || c['Company Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c['Client ID'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c['Location'] || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || c.Status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, statusFilter]);

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Client Management</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Manage outsourcing clients and deployment sites</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => exportToExcel(filteredClients, 'Client_Directory', 'Clients')}
            className="px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Download size={18} className="sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Export</span>
            <span className="sm:hidden">Export Data</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Add Client</span>
            <span className="sm:hidden">New Client</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
        <div className="relative w-full sm:flex-1 sm:max-w-md lg:max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 bg-slate-50"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {filteredClients && filteredClients.length > 0 ? (
          filteredClients.map((client, idx) => (
            <ClientCard
              key={idx}
              client={client}
              employees={employees}
              onEdit={() => handleEdit(client)}
              onDelete={() => onDelete(client, idx)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12 sm:py-20 text-slate-400">
            <Building2 size={48} className="sm:w-16 sm:h-16 mx-auto mb-4 opacity-20" />
            <p className="text-base sm:text-lg font-medium">No clients added yet</p>
            <p className="text-xs sm:text-sm mt-2 px-4">Click "Add Client" to create your first client profile</p>
          </div>
        )}
      </div>

      {/* Client Form Modal */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSave={(data) => {
            if (editingClient) {
              onEdit(data, clients.indexOf(editingClient));
            } else {
              onAdd(data);
            }
            handleClose();
          }}
          onCancel={handleClose}
        />
      )}
    </div>
  );
}

function ClientCard({ client, employees, onEdit, onDelete }) {
  const [showEmployees, setShowEmployees] = useState(false);

  const deployedCount = client['Deployed Staff'] || 0;
  const status = client.Status || 'Active';

  // Contract expiry warning
  const contractEnd = client['Contract End'] ? new Date(client['Contract End']) : null;
  const today = new Date();
  const daysUntilExpiry = contractEnd ? Math.floor((contractEnd - today) / (1000 * 60 * 60 * 24)) : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0;

  const deployedStaff = employees?.filter(emp => emp['Assigned Client'] === client['Client Name'] && emp['Deployment Status'] === 'Deployed') || [];

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
            <Building2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-black text-base text-slate-900 truncate flex-1">{client['Client Name']}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${
                status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-2">{client['Client ID']}</p>
            
            {isExpiringSoon && (
              <p className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md inline-block">
                ⚠️ Expires in {daysUntilExpiry} days
              </p>
            )}
            {isExpired && (
              <p className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md inline-block">
                ❌ Expired
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Compact Details Grid */}
      <div className="p-4 space-y-3">
        {/* Location & Contact in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Location</p>
              <p className="text-sm text-slate-700 font-semibold truncate" title={client.Location}>
                {client.Location || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Phone size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Contact</p>
              <p className="text-sm text-slate-700 font-semibold truncate" title={client['Contact Person']}>
                {client['Contact Person'] || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Terms & Deployed in 2 columns */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <DollarSign size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Payment</p>
              <p className="text-sm text-slate-700 font-semibold truncate">
                {client['Payment Terms'] || 'Net 30'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Staff</p>
              <button 
                onClick={() => setShowEmployees(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                {deployedStaff.length} Deployed
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Edit2 size={14} />
            <span>Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </motion.div>

    {showEmployees && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="min-w-0 flex-1 pr-2">
              <h3 className="text-lg sm:text-xl font-black text-slate-800 truncate">Deployed Employees</h3>
              <p className="text-xs sm:text-sm text-slate-500 truncate">{client['Client Name']}</p>
            </div>
            <button onClick={() => setShowEmployees(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors flex-shrink-0">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 sm:p-6 overflow-y-auto flex-1">
            {deployedStaff.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {deployedStaff.map((emp, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                        {emp.Employee.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate">{emp.Employee}</p>
                        <p className="text-xs text-slate-500 truncate">{emp['Role at Site'] || emp.Role}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right ml-13 sm:ml-0 flex-shrink-0">
                      <p className="text-xs font-bold text-slate-400">BILL RATE</p>
                      <p className="text-sm font-bold text-slate-700">₹{emp['Total Bill Rate']}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-slate-400">
                <Users size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-sm sm:text-base">No active employees deployed here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function ClientForm({ client, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    'Client ID': client?.['Client ID'] || `CLI${String(Date.now()).slice(-6)}`,
    'Client Name': client?.['Client Name'] || '',
    'GST Number': client?.['GST Number'] || '',
    'Location': client?.['Location'] || '',
    'Contact Person': client?.['Contact Person'] || '',
    'Contact Phone': client?.['Contact Phone'] || '',
    'Contact Email': client?.['Contact Email'] || '',
    'Payment Terms': client?.['Payment Terms'] || 'Net 30',
    'Contract Start': client?.['Contract Start'] || '',
    'Contract End': client?.['Contract End'] || '',
    'Agency Margin %': client?.['Agency Margin %'] || '8.5',
    'Margin Type': client?.['Margin Type'] || 'Percentage',
    'GST Percentage': client?.['GST Percentage'] || '18',
    'Manages Leaves': client?.['Manages Leaves'] || 'No',
    'Status': client?.['Status'] || 'Active',
    'Deployed Staff': client?.['Deployed Staff'] || '0',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6 text-white flex justify-between items-center flex-shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-xl sm:text-2xl font-black truncate">{client ? 'Edit Client' : 'Add New Client'}</h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 hidden sm:block">Configure client profile and billing settings</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0">
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Basic Information */}
            <div className="sm:col-span-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Building2 size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Client ID</label>
              <input
                type="text"
                value={formData['Client ID']}
                disabled
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Client Name *</label>
              <input
                type="text"
                value={formData['Client Name']}
                onChange={(e) => handleChange('Client Name', e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="e.g., Zilla Parishad IT"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">GST Number</label>
              <input
                type="text"
                value={formData['GST Number']}
                onChange={(e) => handleChange('GST Number', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="27AABCU9603R1ZM"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData['Location']}
                onChange={(e) => handleChange('Location', e.target.value)}
                required
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="Pune, Maharashtra"
              />
            </div>

            {/* Contact Information */}
            <div className="sm:col-span-2 mt-2 sm:mt-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Phone size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                Contact Information
              </h3>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Contact Person</label>
              <input
                type="text"
                value={formData['Contact Person']}
                onChange={(e) => handleChange('Contact Person', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="Mr. Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData['Contact Phone']}
                onChange={(e) => handleChange('Contact Phone', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={formData['Contact Email']}
                onChange={(e) => handleChange('Contact Email', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="contact@client.com"
              />
            </div>

            {/* Commercial Terms */}
            <div className="sm:col-span-2 mt-2 sm:mt-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                Commercial Terms
              </h3>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Payment Terms</label>
              <select
                value={formData['Payment Terms']}
                onChange={(e) => handleChange('Payment Terms', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
                <option>Immediate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Agency Margin %</label>
              <input
                type="number"
                step="0.1"
                value={formData['Agency Margin %']}
                onChange={(e) => handleChange('Agency Margin %', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="8.5"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Margin Type</label>
              <select
                value={formData['Margin Type']}
                onChange={(e) => handleChange('Margin Type', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option>Percentage</option>
                <option>Flat Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">GST Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData['GST Percentage']}
                onChange={(e) => handleChange('GST Percentage', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
                placeholder="18"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Contract Start</label>
              <input
                type="date"
                value={formData['Contract Start']}
                onChange={(e) => handleChange('Contract Start', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Contract End</label>
              <input
                type="date"
                value={formData['Contract End']}
                onChange={(e) => handleChange('Contract End', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Client Manages Leaves?</label>
              <select
                value={formData['Manages Leaves']}
                onChange={(e) => handleChange('Manages Leaves', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                value={formData['Status']}
                onChange={(e) => handleChange('Status', e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg text-sm"
          >
            {client ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
