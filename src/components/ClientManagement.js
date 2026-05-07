"use client";
import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Calendar, DollarSign, Users, Edit2, Trash2, Plus, X, Search } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Client Management</h1>
          <p className="text-slate-500 mt-1">Manage outsourcing clients and deployment sites</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={20} /> Add Client
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name, ID, or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 bg-slate-50"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-full text-center py-20 text-slate-400">
            <Building2 size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No clients added yet</p>
            <p className="text-sm mt-2">Click "Add Client" to create your first client profile</p>
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
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Building2 size={24} />
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            status === 'Active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {status}
          </span>
        </div>
        <h3 className="font-black text-lg text-slate-900 mb-1">{client['Client Name']}</h3>
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-500 font-medium">{client['Client ID']}</p>
          
          {isExpiringSoon && (
            <p className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md inline-block w-fit mt-1">
              ⚠️ Contract expires in {daysUntilExpiry} days
            </p>
          )}
          {isExpired && (
            <p className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md inline-block w-fit mt-1">
              ❌ Contract Expired
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin size={16} className="text-slate-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Location</p>
            <p className="text-sm text-slate-700 font-medium">{client.Location || 'Not specified'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Phone size={16} className="text-slate-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Contact</p>
            <p className="text-sm text-slate-700 font-medium">{client['Contact Person'] || 'Not specified'}</p>
            <p className="text-xs text-slate-500">{client['Contact Phone'] || ''}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign size={16} className="text-slate-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Payment Terms</p>
            <p className="text-sm text-slate-700 font-medium">{client['Payment Terms'] || 'Net 30'}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              <button 
                onClick={() => setShowEmployees(true)}
                className="text-sm font-bold text-slate-700 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
              >
                {deployedStaff.length} Deployed
              </button>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    {showEmployees && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-black text-slate-800">Deployed Employees</h3>
              <p className="text-sm text-slate-500">{client['Client Name']}</p>
            </div>
            <button onClick={() => setShowEmployees(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            {deployedStaff.length > 0 ? (
              <div className="space-y-3">
                {deployedStaff.map((emp, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center">
                        {emp.Employee.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{emp.Employee}</p>
                        <p className="text-xs text-slate-500">{emp['Role at Site'] || emp.Role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400">BILL RATE</p>
                      <p className="text-sm font-bold text-slate-700">₹{emp['Total Bill Rate']}/day</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Users size={48} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium">No active employees deployed here.</p>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{client ? 'Edit Client' : 'Add New Client'}</h2>
            <p className="text-blue-100 text-sm mt-1">Configure client profile and billing settings</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building2 size={20} className="text-blue-600" />
                Basic Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Client ID</label>
              <input
                type="text"
                value={formData['Client ID']}
                disabled
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Client Name *</label>
              <input
                type="text"
                value={formData['Client Name']}
                onChange={(e) => handleChange('Client Name', e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="e.g., Zilla Parishad IT Department"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">GST Number</label>
              <input
                type="text"
                value={formData['GST Number']}
                onChange={(e) => handleChange('GST Number', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="27AABCU9603R1ZM"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Location *</label>
              <input
                type="text"
                value={formData['Location']}
                onChange={(e) => handleChange('Location', e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="Pune, Maharashtra"
              />
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-blue-600" />
                Contact Information
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person</label>
              <input
                type="text"
                value={formData['Contact Person']}
                onChange={(e) => handleChange('Contact Person', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="Mr. Rajesh Kumar"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={formData['Contact Phone']}
                onChange={(e) => handleChange('Contact Phone', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={formData['Contact Email']}
                onChange={(e) => handleChange('Contact Email', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="contact@client.com"
              />
            </div>

            {/* Commercial Terms */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-600" />
                Commercial Terms (Admin Only)
              </h3>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Payment Terms</label>
              <select
                value={formData['Payment Terms']}
                onChange={(e) => handleChange('Payment Terms', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Net 60</option>
                <option>Immediate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Agency Margin %</label>
              <input
                type="number"
                step="0.1"
                value={formData['Agency Margin %']}
                onChange={(e) => handleChange('Agency Margin %', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="8.5"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Margin Type</label>
              <select
                value={formData['Margin Type']}
                onChange={(e) => handleChange('Margin Type', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option>Percentage</option>
                <option>Flat Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">GST Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData['GST Percentage']}
                onChange={(e) => handleChange('GST Percentage', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
                placeholder="18"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contract Start</label>
              <input
                type="date"
                value={formData['Contract Start']}
                onChange={(e) => handleChange('Contract Start', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Contract End</label>
              <input
                type="date"
                value={formData['Contract End']}
                onChange={(e) => handleChange('Contract End', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Client Manages Leaves?</label>
              <select
                value={formData['Manages Leaves']}
                onChange={(e) => handleChange('Manages Leaves', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <select
                value={formData['Status']}
                onChange={(e) => handleChange('Status', e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>On Hold</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            {client ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
