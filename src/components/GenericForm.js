"use client";
import React, { useState, useEffect } from 'react';
import { X, Save, XCircle } from 'lucide-react';
import { getFieldsByCategory } from '@/config/formFields';

export default function GenericForm({ title, fields, data, onSave, onCancel }) {
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState(null);

  // Group fields by category
  const fieldsByCategory = getFieldsByCategory(fields);
  const categories = Object.keys(fieldsByCategory);

  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0]);
    }
  }, [categories, activeTab]);

  useEffect(() => {
    if (data) {
      setFormData(data);
    } else {
      // Initialize with default values
      const defaults = {};
      fields.forEach(field => {
        defaults[field.name] = field.defaultValue || '';
      });
      setFormData(defaults);
    }
  }, [data, fields]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate payroll totals
      if (title === 'Payroll') {
        const earnings = [
          parseFloat(newData.BasicSalary || 0),
          parseFloat(newData.HRA || 0),
          parseFloat(newData.Conveyance || 0),
          parseFloat(newData.Medical || 0),
          parseFloat(newData.SpecialAllowance || 0),
          parseFloat(newData.Bonus || 0),
        ];
        const grossEarnings = earnings.reduce((sum, val) => sum + val, 0);
        
        const deductions = [
          parseFloat(newData.PF || 0),
          parseFloat(newData.ESI || 0),
          parseFloat(newData.ProfessionalTax || 0),
          parseFloat(newData.TDS || 0),
          parseFloat(newData.LoanRecovery || 0),
          parseFloat(newData.OtherDeductions || 0),
        ];
        const totalDeductions = deductions.reduce((sum, val) => sum + val, 0);
        
        newData.GrossEarnings = grossEarnings.toFixed(2);
        newData.TotalDeductions = totalDeductions.toFixed(2);
        newData.NetSalary = (grossEarnings - totalDeductions).toFixed(2);
      }
      
      // Auto-calculate finance net amount
      if (title === 'Finance') {
        const amount = parseFloat(newData.Amount || 0);
        const taxAmount = parseFloat(newData.TaxAmount || 0);
        newData.NetAmount = (amount - taxAmount).toFixed(2);
      }
      
      return newData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white">
              {data ? `Edit ${title}` : `Add New ${title}`}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {data ? 'Update existing entry' : 'Fill in the details below'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors group"
            title="Close"
          >
            <X className="text-white group-hover:rotate-90 transition-transform duration-300" size={24} />
          </button>
        </div>

        {/* Category Tabs (if multiple categories) */}
        {categories.length > 1 && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 overflow-x-auto">
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveTab(category)}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
                    activeTab === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col h-[calc(95vh-180px)]">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {categories.length > 1 ? (
              // Show fields by active category
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fieldsByCategory[activeTab]?.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                  />
                ))}
              </div>
            ) : (
              // Show all fields if only one category
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                  <FormField
                    key={field.name}
                    field={field}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 p-6 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3.5 bg-white border-2 border-slate-300 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center gap-2 group"
            >
              <XCircle size={20} className="group-hover:rotate-90 transition-transform" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group"
            >
              <Save size={20} className="group-hover:scale-110 transition-transform" />
              {data ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Separate FormField component for cleaner code
function FormField({ field, value, onChange }) {
  const isFullWidth = field.type === 'textarea' || field.type === 'url';
  
  return (
    <div className={isFullWidth ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === 'select' ? (
        <select
          name={field.name}
          value={value}
          onChange={onChange}
          required={field.required}
          disabled={field.disabled}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          <option value="">Select {field.label}</option>
          {field.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          name={field.name}
          value={value}
          onChange={onChange}
          required={field.required}
          disabled={field.disabled}
          placeholder={field.placeholder}
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 resize-none"
        />
      ) : (
        <input
          type={field.type}
          name={field.name}
          value={value}
          onChange={onChange}
          required={field.required}
          disabled={field.disabled}
          placeholder={field.placeholder}
          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      )}
      
      {field.disabled && field.placeholder && (
        <p className="text-xs text-slate-500 mt-1 italic">{field.placeholder}</p>
      )}
    </div>
  );
}
