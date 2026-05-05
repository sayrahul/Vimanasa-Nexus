"use client";
import React, { useState, useEffect } from 'react';
import { X, Building2, Mail, Phone, MapPin, FileText, Users, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PartnerDetailForm({ partner, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    // Basic Information
    siteId: '',
    partnerName: '',
    companyType: '',
    industry: '',
    gstNumber: '',
    panNumber: '',
    
    // Contact Information
    primaryContactPerson: '',
    primaryEmail: '',
    primaryPhone: '',
    secondaryContactPerson: '',
    secondaryEmail: '',
    secondaryPhone: '',
    
    // Address Information
    siteAddress: '',
    city: '',
    state: '',
    pincode: '',
    region: '',
    
    // Contract Details
    contractStartDate: '',
    contractEndDate: '',
    contractValue: '',
    billingCycle: '',
    paymentTerms: '',
    
    // Service Details
    serviceType: '',
    headcount: '',
    shiftPattern: '',
    workingHours: '',
    
    // SLA & Performance
    slaResponseTime: '',
    slaResolutionTime: '',
    performanceRating: '',
    
    // Financial
    monthlyBilling: '',
    outstandingAmount: '',
    lastPaymentDate: '',
    
    // Status
    partnerStatus: 'Active',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (partner) {
      setFormData({
        siteId: partner['Site ID'] || partner.siteId || '',
        partnerName: partner['Partner Name'] || partner.partnerName || '',
        companyType: partner['Company Type'] || partner.companyType || '',
        industry: partner['Industry'] || partner.industry || '',
        gstNumber: partner['GST Number'] || partner.gstNumber || '',
        panNumber: partner['PAN Number'] || partner.panNumber || '',
        
        primaryContactPerson: partner['Primary Contact Person'] || partner.primaryContactPerson || '',
        primaryEmail: partner['Primary Email'] || partner.primaryEmail || '',
        primaryPhone: partner['Primary Phone'] || partner.primaryPhone || '',
        secondaryContactPerson: partner['Secondary Contact Person'] || partner.secondaryContactPerson || '',
        secondaryEmail: partner['Secondary Email'] || partner.secondaryEmail || '',
        secondaryPhone: partner['Secondary Phone'] || partner.secondaryPhone || '',
        
        siteAddress: partner['Site Address'] || partner.siteAddress || '',
        city: partner['City'] || partner.city || '',
        state: partner['State'] || partner.state || '',
        pincode: partner['Pincode'] || partner.pincode || '',
        region: partner['Region'] || partner.region || '',
        
        contractStartDate: partner['Contract Start Date'] || partner.contractStartDate || '',
        contractEndDate: partner['Contract End Date'] || partner.contractEndDate || '',
        contractValue: partner['Contract Value'] || partner.contractValue || '',
        billingCycle: partner['Billing Cycle'] || partner.billingCycle || '',
        paymentTerms: partner['Payment Terms'] || partner.paymentTerms || '',
        
        serviceType: partner['Service Type'] || partner.serviceType || '',
        headcount: partner['Headcount'] || partner.headcount || '',
        shiftPattern: partner['Shift Pattern'] || partner.shiftPattern || '',
        workingHours: partner['Working Hours'] || partner.workingHours || '',
        
        slaResponseTime: partner['SLA Response Time'] || partner.slaResponseTime || '',
        slaResolutionTime: partner['SLA Resolution Time'] || partner.slaResolutionTime || '',
        performanceRating: partner['Performance Rating'] || partner.performanceRating || '',
        
        monthlyBilling: partner['Monthly Billing'] || partner.monthlyBilling || '',
        outstandingAmount: partner['Outstanding Amount'] || partner.outstandingAmount || '',
        lastPaymentDate: partner['Last Payment Date'] || partner.lastPaymentDate || '',
        
        partnerStatus: partner['Status'] || partner.partnerStatus || 'Active',
        remarks: partner['Remarks'] || partner.remarks || '',
      });
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.siteId) newErrors.siteId = 'Site ID is required';
    if (!formData.partnerName) newErrors.partnerName = 'Partner name is required';
    if (!formData.primaryContactPerson) newErrors.primaryContactPerson = 'Primary contact is required';
    if (!formData.primaryEmail) newErrors.primaryEmail = 'Primary email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.primaryEmail)) newErrors.primaryEmail = 'Email is invalid';
    if (!formData.primaryPhone) newErrors.primaryPhone = 'Primary phone is required';
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    const sheetData = {
      'Site ID': formData.siteId,
      'Partner Name': formData.partnerName,
      'Company Type': formData.companyType,
      'Industry': formData.industry,
      'GST Number': formData.gstNumber,
      'PAN Number': formData.panNumber,
      'Primary Contact Person': formData.primaryContactPerson,
      'Primary Email': formData.primaryEmail,
      'Primary Phone': formData.primaryPhone,
      'Secondary Contact Person': formData.secondaryContactPerson,
      'Secondary Email': formData.secondaryEmail,
      'Secondary Phone': formData.secondaryPhone,
      'Site Address': formData.siteAddress,
      'City': formData.city,
      'State': formData.state,
      'Pincode': formData.pincode,
      'Region': formData.region,
      'Contract Start Date': formData.contractStartDate,
      'Contract End Date': formData.contractEndDate,
      'Contract Value': formData.contractValue,
      'Billing Cycle': formData.billingCycle,
      'Payment Terms': formData.paymentTerms,
      'Service Type': formData.serviceType,
      'Headcount': formData.headcount,
      'Shift Pattern': formData.shiftPattern,
      'Working Hours': formData.workingHours,
      'SLA Response Time': formData.slaResponseTime,
      'SLA Resolution Time': formData.slaResolutionTime,
      'Performance Rating': formData.performanceRating,
      'Monthly Billing': formData.monthlyBilling,
      'Outstanding Amount': formData.outstandingAmount,
      'Last Payment Date': formData.lastPaymentDate,
      'Status': formData.partnerStatus,
      'Remarks': formData.remarks,
    };
    
    onSave(sheetData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contacts', icon: Phone },
    { id: 'address', label: 'Location', icon: MapPin },
    { id: 'contract', label: 'Contract', icon: FileText },
    { id: 'service', label: 'Service', icon: Users },
    { id: 'financial', label: 'Financial', icon: DollarSign },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {partner ? 'Edit Partner' : 'Add New Partner'}
              </h2>
              <p className="text-purple-100 text-sm font-medium">Complete partner/client information</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Site ID"
                name="siteId"
                value={formData.siteId}
                onChange={handleChange}
                error={errors.siteId}
                required
                placeholder="SITE001"
                disabled={!!partner}
              />
              <FormField
                label="Partner/Client Name"
                name="partnerName"
                value={formData.partnerName}
                onChange={handleChange}
                error={errors.partnerName}
                required
                placeholder="Tech Corp India Pvt Ltd"
              />
              <FormSelect
                label="Company Type"
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                options={['Private Limited', 'Public Limited', 'Partnership', 'Proprietorship', 'LLP', 'Government']}
              />
              <FormField
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                placeholder="IT Services"
              />
              <FormField
                label="GST Number"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="27AABCU9603R1ZM"
              />
              <FormField
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="AABCU9603R"
              />
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Primary Contact</h3>
              </div>
              <FormField
                label="Contact Person Name"
                name="primaryContactPerson"
                value={formData.primaryContactPerson}
                onChange={handleChange}
                error={errors.primaryContactPerson}
                required
                placeholder="Rajesh Kumar"
              />
              <FormField
                label="Email"
                name="primaryEmail"
                type="email"
                value={formData.primaryEmail}
                onChange={handleChange}
                error={errors.primaryEmail}
                required
                placeholder="rajesh@techcorp.com"
              />
              <FormField
                label="Phone"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleChange}
                error={errors.primaryPhone}
                required
                placeholder="9876543210"
              />
              
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Secondary Contact (Optional)</h3>
              </div>
              <FormField
                label="Contact Person Name"
                name="secondaryContactPerson"
                value={formData.secondaryContactPerson}
                onChange={handleChange}
                placeholder="Priya Sharma"
              />
              <FormField
                label="Email"
                name="secondaryEmail"
                type="email"
                value={formData.secondaryEmail}
                onChange={handleChange}
                placeholder="priya@techcorp.com"
              />
              <FormField
                label="Phone"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleChange}
                placeholder="9876543211"
              />
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  label="Site Address"
                  name="siteAddress"
                  value={formData.siteAddress}
                  onChange={handleChange}
                  placeholder="Plot No. 123, Sector 5, Industrial Area"
                />
              </div>
              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
              />
              <FormField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
              />
              <FormField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="400001"
              />
              <FormSelect
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                options={['North', 'South', 'East', 'West', 'Central']}
              />
            </div>
          )}

          {/* Contract Tab */}
          {activeTab === 'contract' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Contract Start Date"
                name="contractStartDate"
                type="date"
                value={formData.contractStartDate}
                onChange={handleChange}
              />
              <FormField
                label="Contract End Date"
                name="contractEndDate"
                type="date"
                value={formData.contractEndDate}
                onChange={handleChange}
              />
              <FormField
                label="Contract Value (Annual)"
                name="contractValue"
                type="number"
                value={formData.contractValue}
                onChange={handleChange}
                placeholder="5000000"
              />
              <FormSelect
                label="Billing Cycle"
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                options={['Monthly', 'Quarterly', 'Half-Yearly', 'Annually']}
              />
              <FormSelect
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                options={['Net 15', 'Net 30', 'Net 45', 'Net 60', 'Advance']}
              />
              <FormSelect
                label="Partner Status"
                name="partnerStatus"
                value={formData.partnerStatus}
                onChange={handleChange}
                options={['Active', 'Inactive', 'On Hold', 'Terminated']}
              />
            </div>
          )}

          {/* Service Tab */}
          {activeTab === 'service' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Service Type"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                error={errors.serviceType}
                required
                options={['Security Services', 'Facility Management', 'Housekeeping', 'Technical Support', 'Manpower Supply', 'Consulting']}
              />
              <FormField
                label="Headcount Required"
                name="headcount"
                type="number"
                value={formData.headcount}
                onChange={handleChange}
                placeholder="25"
              />
              <FormSelect
                label="Shift Pattern"
                name="shiftPattern"
                value={formData.shiftPattern}
                onChange={handleChange}
                options={['Day Shift', 'Night Shift', 'Rotational', '24x7', 'General Shift']}
              />
              <FormField
                label="Working Hours"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                placeholder="8 hours/day"
              />
              <FormField
                label="SLA Response Time"
                name="slaResponseTime"
                value={formData.slaResponseTime}
                onChange={handleChange}
                placeholder="2 hours"
              />
              <FormField
                label="SLA Resolution Time"
                name="slaResolutionTime"
                value={formData.slaResolutionTime}
                onChange={handleChange}
                placeholder="24 hours"
              />
              <FormSelect
                label="Performance Rating"
                name="performanceRating"
                value={formData.performanceRating}
                onChange={handleChange}
                options={['Excellent', 'Good', 'Average', 'Below Average', 'Poor']}
              />
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Monthly Billing Amount"
                name="monthlyBilling"
                type="number"
                value={formData.monthlyBilling}
                onChange={handleChange}
                placeholder="250000"
              />
              <FormField
                label="Outstanding Amount"
                name="outstandingAmount"
                type="number"
                value={formData.outstandingAmount}
                onChange={handleChange}
                placeholder="0"
              />
              <FormField
                label="Last Payment Date"
                name="lastPaymentDate"
                type="date"
                value={formData.lastPaymentDate}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Additional notes or comments..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="border-t border-slate-200 px-8 py-6 bg-slate-50 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-200"
          >
            {partner ? 'Update Partner' : 'Add Partner'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, name, type = 'text', value, onChange, error, required, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
        } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed`}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, required, error }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-xl border ${
          error ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'
        } focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all text-slate-900 font-medium`}
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}
