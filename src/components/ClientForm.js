/**
 * Client Form Component
 * Add/Edit client information
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ClientForm({ client, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    'Client ID': '',
    'Client Name': '',
    'GST Number': '',
    'Location': '',
    'Contact Person': '',
    'Contact Email': '',
    'Contact Phone': '',
    'Payment Terms': 'Net 30',
    'Agency Margin (%)': '8.5',
    'Contract Duration': '1 Year',
    'Status': 'Active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      // Generate new Client ID
      const newId = `CLI${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, 'Client ID': newId }));
    }
  }, [client]);

  const validate = () => {
    const newErrors = {};

    if (!formData['Client Name']?.trim()) {
      newErrors['Client Name'] = 'Client name is required';
    }

    if (!formData['GST Number']?.trim()) {
      newErrors['GST Number'] = 'GST number is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData['GST Number'])) {
      newErrors['GST Number'] = 'Invalid GST number format';
    }

    if (!formData['Contact Email']?.trim()) {
      newErrors['Contact Email'] = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData['Contact Email'])) {
      newErrors['Contact Email'] = 'Invalid email format';
    }

    if (!formData['Contact Phone']?.trim()) {
      newErrors['Contact Phone'] = 'Contact phone is required';
    } else if (!/^[0-9]{10}$/.test(formData['Contact Phone'].replace(/[^0-9]/g, ''))) {
      newErrors['Contact Phone'] = 'Invalid phone number (10 digits required)';
    }

    const margin = parseFloat(formData['Agency Margin (%)']);
    if (isNaN(margin) || margin < 0 || margin > 100) {
      newErrors['Agency Margin (%)'] = 'Margin must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onCancel}
            className="text-white hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client ID */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={formData['Client ID']}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData['Client Name']}
                onChange={(e) => handleChange('Client Name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors['Client Name'] ? 'border-red-500' : 'border-slate-200'
                } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all`}
                placeholder="Zilla Parishad IT Department"
              />
              {errors['Client Name'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Client Name']}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                GST Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData['GST Number']}
                onChange={(e) => handleChange('GST Number', e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors['GST Number'] ? 'border-red-500' : 'border-slate-200'
                } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all`}
                placeholder="27AABCU9603R1ZM"
                maxLength={15}
              />
              {errors['GST Number'] && (
                <p className="text-red-500 text-sm mt-1">{errors['GST Number']}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData['Location']}
                onChange={(e) => handleChange('Location', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                placeholder="Pune, Maharashtra"
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData['Contact Person']}
                onChange={(e) => handleChange('Contact Person', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                placeholder="Mr. Rajesh Kumar"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData['Contact Email']}
                onChange={(e) => handleChange('Contact Email', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors['Contact Email'] ? 'border-red-500' : 'border-slate-200'
                } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all`}
                placeholder="rajesh@zp.gov.in"
              />
              {errors['Contact Email'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Contact Email']}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData['Contact Phone']}
                onChange={(e) => handleChange('Contact Phone', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors['Contact Phone'] ? 'border-red-500' : 'border-slate-200'
                } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all`}
                placeholder="+91 98765 43210"
              />
              {errors['Contact Phone'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Contact Phone']}</p>
              )}
            </div>

            {/* Payment Terms */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Payment Terms
              </label>
              <select
                value={formData['Payment Terms']}
                onChange={(e) => handleChange('Payment Terms', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
                <option value="Immediate">Immediate</option>
              </select>
            </div>

            {/* Agency Margin */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Agency Margin (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData['Agency Margin (%)']}
                onChange={(e) => handleChange('Agency Margin (%)', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors['Agency Margin (%)'] ? 'border-red-500' : 'border-slate-200'
                } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all`}
                placeholder="8.5"
              />
              {errors['Agency Margin (%)'] && (
                <p className="text-red-500 text-sm mt-1">{errors['Agency Margin (%)']}</p>
              )}
            </div>

            {/* Contract Duration */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Contract Duration
              </label>
              <select
                value={formData['Contract Duration']}
                onChange={(e) => handleChange('Contract Duration', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
              >
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="Ongoing">Ongoing</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Status
              </label>
              <select
                value={formData['Status']}
                onChange={(e) => handleChange('Status', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200"
            >
              {client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
