"use client";
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar, CreditCard, FileText, Briefcase, GraduationCap, Users as UsersIcon, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EmployeeDetailForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    // Basic Information
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    
    // Address Information
    currentAddress: '',
    permanentAddress: '',
    city: '',
    state: '',
    pincode: '',
    
    // Employment Details
    designation: '',
    department: '',
    dateOfJoining: '',
    employmentType: '',
    workLocation: '',
    reportingManager: '',
    employeeStatus: 'Active',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    
    // Statutory Details
    aadharNumber: '',
    pfNumber: '',
    esiNumber: '',
    uanNumber: '',
    
    // Salary Details
    basicSalary: '',
    hra: '',
    conveyanceAllowance: '',
    medicalAllowance: '',
    specialAllowance: '',
    
    // Emergency Contact
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    
    // Education
    highestQualification: '',
    university: '',
    yearOfPassing: '',
    
    // Experience
    previousCompany: '',
    previousDesignation: '',
    yearsOfExperience: '',
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (employee) {
      // Map employee data to form fields
      setFormData({
        employeeId: employee['Employee ID'] || employee.employeeId || '',
        firstName: employee['First Name'] || employee.firstName || '',
        lastName: employee['Last Name'] || employee.lastName || '',
        email: employee['Email'] || employee.email || '',
        phone: employee['Phone'] || employee.phone || '',
        alternatePhone: employee['Alternate Phone'] || employee.alternatePhone || '',
        dateOfBirth: employee['Date of Birth'] || employee.dateOfBirth || '',
        gender: employee['Gender'] || employee.gender || '',
        maritalStatus: employee['Marital Status'] || employee.maritalStatus || '',
        
        currentAddress: employee['Current Address'] || employee.currentAddress || '',
        permanentAddress: employee['Permanent Address'] || employee.permanentAddress || '',
        city: employee['City'] || employee.city || '',
        state: employee['State'] || employee.state || '',
        pincode: employee['Pincode'] || employee.pincode || '',
        
        designation: employee['Designation'] || employee.designation || '',
        department: employee['Department'] || employee.department || '',
        dateOfJoining: employee['Date of Joining'] || employee.dateOfJoining || '',
        employmentType: employee['Employment Type'] || employee.employmentType || '',
        workLocation: employee['Work Location'] || employee.workLocation || '',
        reportingManager: employee['Reporting Manager'] || employee.reportingManager || '',
        employeeStatus: employee['Status'] || employee.employeeStatus || 'Active',
        
        bankName: employee['Bank Name'] || employee.bankName || '',
        accountNumber: employee['Account Number'] || employee.accountNumber || '',
        ifscCode: employee['IFSC Code'] || employee.ifscCode || '',
        panNumber: employee['PAN Number'] || employee.panNumber || '',
        
        aadharNumber: employee['Aadhar Number'] || employee.aadharNumber || '',
        pfNumber: employee['PF Number'] || employee.pfNumber || '',
        esiNumber: employee['ESI Number'] || employee.esiNumber || '',
        uanNumber: employee['UAN Number'] || employee.uanNumber || '',
        
        basicSalary: employee['Basic Salary'] || employee.basicSalary || '',
        hra: employee['HRA'] || employee.hra || '',
        conveyanceAllowance: employee['Conveyance Allowance'] || employee.conveyanceAllowance || '',
        medicalAllowance: employee['Medical Allowance'] || employee.medicalAllowance || '',
        specialAllowance: employee['Special Allowance'] || employee.specialAllowance || '',
        
        emergencyContactName: employee['Emergency Contact Name'] || employee.emergencyContactName || '',
        emergencyContactRelation: employee['Emergency Contact Relation'] || employee.emergencyContactRelation || '',
        emergencyContactPhone: employee['Emergency Contact Phone'] || employee.emergencyContactPhone || '',
        
        highestQualification: employee['Highest Qualification'] || employee.highestQualification || '',
        university: employee['University'] || employee.university || '',
        yearOfPassing: employee['Year of Passing'] || employee.yearOfPassing || '',
        
        previousCompany: employee['Previous Company'] || employee.previousCompany || '',
        previousDesignation: employee['Previous Designation'] || employee.previousDesignation || '',
        yearsOfExperience: employee['Years of Experience'] || employee.yearsOfExperience || '',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Basic validations
    if (!formData.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';
    if (!formData.designation) newErrors.designation = 'Designation is required';
    if (!formData.dateOfJoining) newErrors.dateOfJoining = 'Date of joining is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    // Convert form data to Google Sheets format
    const sheetData = {
      'Employee ID': formData.employeeId,
      'First Name': formData.firstName,
      'Last Name': formData.lastName,
      'Email': formData.email,
      'Phone': formData.phone,
      'Alternate Phone': formData.alternatePhone,
      'Date of Birth': formData.dateOfBirth,
      'Gender': formData.gender,
      'Marital Status': formData.maritalStatus,
      'Current Address': formData.currentAddress,
      'Permanent Address': formData.permanentAddress,
      'City': formData.city,
      'State': formData.state,
      'Pincode': formData.pincode,
      'Designation': formData.designation,
      'Department': formData.department,
      'Date of Joining': formData.dateOfJoining,
      'Employment Type': formData.employmentType,
      'Work Location': formData.workLocation,
      'Reporting Manager': formData.reportingManager,
      'Status': formData.employeeStatus,
      'Bank Name': formData.bankName,
      'Account Number': formData.accountNumber,
      'IFSC Code': formData.ifscCode,
      'PAN Number': formData.panNumber,
      'Aadhar Number': formData.aadharNumber,
      'PF Number': formData.pfNumber,
      'ESI Number': formData.esiNumber,
      'UAN Number': formData.uanNumber,
      'Basic Salary': formData.basicSalary,
      'HRA': formData.hra,
      'Conveyance Allowance': formData.conveyanceAllowance,
      'Medical Allowance': formData.medicalAllowance,
      'Special Allowance': formData.specialAllowance,
      'Emergency Contact Name': formData.emergencyContactName,
      'Emergency Contact Relation': formData.emergencyContactRelation,
      'Emergency Contact Phone': formData.emergencyContactPhone,
      'Highest Qualification': formData.highestQualification,
      'University': formData.university,
      'Year of Passing': formData.yearOfPassing,
      'Previous Company': formData.previousCompany,
      'Previous Designation': formData.previousDesignation,
      'Years of Experience': formData.yearsOfExperience,
    };
    
    onSave(sheetData);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'bank', label: 'Bank & Statutory', icon: CreditCard },
    { id: 'salary', label: 'Salary', icon: FileText },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
    { id: 'education', label: 'Education', icon: GraduationCap },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <User className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {employee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-blue-100 text-sm font-medium">Complete employee information</p>
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
                    ? 'border-blue-600 text-blue-600'
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
                label="Employee ID"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                error={errors.employeeId}
                required
                placeholder="EMP001"
                disabled={!!employee}
              />
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                placeholder="John"
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
                placeholder="Doe"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="john.doe@company.com"
              />
              <FormField
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder="9876543210"
              />
              <FormField
                label="Alternate Phone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                placeholder="9876543211"
              />
              <FormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <FormSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={['Male', 'Female', 'Other']}
              />
              <FormSelect
                label="Marital Status"
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                options={['Single', 'Married', 'Divorced', 'Widowed']}
              />
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormField
                  label="Current Address"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  placeholder="123, Street Name, Area"
                />
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Permanent Address"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  placeholder="456, Street Name, Area"
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
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                error={errors.designation}
                required
                placeholder="Security Guard"
              />
              <FormField
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Operations"
              />
              <FormField
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={formData.dateOfJoining}
                onChange={handleChange}
                error={errors.dateOfJoining}
                required
              />
              <FormSelect
                label="Employment Type"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                options={['Full-time', 'Part-time', 'Contract', 'Temporary']}
              />
              <FormField
                label="Work Location"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                placeholder="Mumbai Office"
              />
              <FormField
                label="Reporting Manager"
                name="reportingManager"
                value={formData.reportingManager}
                onChange={handleChange}
                placeholder="Manager Name"
              />
              <FormSelect
                label="Employee Status"
                name="employeeStatus"
                value={formData.employeeStatus}
                onChange={handleChange}
                options={['Active', 'On Leave', 'Inactive', 'Resigned']}
              />
            </div>
          )}

          {/* Bank & Statutory Tab */}
          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Bank Details</h3>
              </div>
              <FormField
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="HDFC Bank"
              />
              <FormField
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="1234567890"
              />
              <FormField
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="HDFC0001234"
              />
              <FormField
                label="PAN Number"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="ABCDE1234F"
              />
              
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Statutory Details</h3>
              </div>
              <FormField
                label="Aadhar Number"
                name="aadharNumber"
                value={formData.aadharNumber}
                onChange={handleChange}
                placeholder="1234 5678 9012"
              />
              <FormField
                label="PF Number"
                name="pfNumber"
                value={formData.pfNumber}
                onChange={handleChange}
                placeholder="PF/MH/12345/67890"
              />
              <FormField
                label="ESI Number"
                name="esiNumber"
                value={formData.esiNumber}
                onChange={handleChange}
                placeholder="1234567890"
              />
              <FormField
                label="UAN Number"
                name="uanNumber"
                value={formData.uanNumber}
                onChange={handleChange}
                placeholder="123456789012"
              />
            </div>
          )}

          {/* Salary Tab */}
          {activeTab === 'salary' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Basic Salary"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleChange}
                placeholder="15000"
              />
              <FormField
                label="HRA"
                name="hra"
                type="number"
                value={formData.hra}
                onChange={handleChange}
                placeholder="7500"
              />
              <FormField
                label="Conveyance Allowance"
                name="conveyanceAllowance"
                type="number"
                value={formData.conveyanceAllowance}
                onChange={handleChange}
                placeholder="1600"
              />
              <FormField
                label="Medical Allowance"
                name="medicalAllowance"
                type="number"
                value={formData.medicalAllowance}
                onChange={handleChange}
                placeholder="1250"
              />
              <FormField
                label="Special Allowance"
                name="specialAllowance"
                type="number"
                value={formData.specialAllowance}
                onChange={handleChange}
                placeholder="5000"
              />
              <div className="md:col-span-2 mt-4 p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">Total CTC (Monthly)</span>
                  <span className="text-2xl font-black text-blue-600">
                    ₹{(
                      parseFloat(formData.basicSalary || 0) +
                      parseFloat(formData.hra || 0) +
                      parseFloat(formData.conveyanceAllowance || 0) +
                      parseFloat(formData.medicalAllowance || 0) +
                      parseFloat(formData.specialAllowance || 0)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Tab */}
          {activeTab === 'emergency' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
              <FormField
                label="Relation"
                name="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={handleChange}
                placeholder="Spouse"
              />
              <FormField
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="9876543210"
              />
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Education Details</h3>
              </div>
              <FormField
                label="Highest Qualification"
                name="highestQualification"
                value={formData.highestQualification}
                onChange={handleChange}
                placeholder="Bachelor's Degree"
              />
              <FormField
                label="University"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="Mumbai University"
              />
              <FormField
                label="Year of Passing"
                name="yearOfPassing"
                type="number"
                value={formData.yearOfPassing}
                onChange={handleChange}
                placeholder="2020"
              />
              
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Previous Experience</h3>
              </div>
              <FormField
                label="Previous Company"
                name="previousCompany"
                value={formData.previousCompany}
                onChange={handleChange}
                placeholder="ABC Security Services"
              />
              <FormField
                label="Previous Designation"
                name="previousDesignation"
                value={formData.previousDesignation}
                onChange={handleChange}
                placeholder="Security Supervisor"
              />
              <FormField
                label="Years of Experience"
                name="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                placeholder="5"
              />
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
            className="px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200"
          >
            {employee ? 'Update Employee' : 'Add Employee'}
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
        } focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed`}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, required }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium"
      >
        <option value="">Select {label}</option>
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}
