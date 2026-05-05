// Comprehensive form field configurations for all modules

export const employeeFormFields = [
  // Personal Information
  { name: 'ID', label: 'Employee ID', type: 'text', required: true, placeholder: 'EMP001', category: 'Personal' },
  { name: 'Name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe', category: 'Personal' },
  { name: 'Email', label: 'Email Address', type: 'email', required: true, placeholder: 'john.doe@company.com', category: 'Personal' },
  { name: 'Phone', label: 'Phone Number', type: 'tel', required: true, placeholder: '+91-9876543210', category: 'Personal' },
  { name: 'DOB', label: 'Date of Birth', type: 'date', required: true, category: 'Personal' },
  { name: 'Gender', label: 'Gender', type: 'select', required: true, options: ['Male', 'Female', 'Other'], category: 'Personal' },
  { name: 'Address', label: 'Residential Address', type: 'textarea', required: true, placeholder: 'Complete address with pincode', category: 'Personal' },
  
  // Employment Details
  { name: 'Role', label: 'Designation/Role', type: 'select', required: true, options: ['Security Guard', 'Supervisor', 'Manager', 'Team Leader', 'HR Executive', 'Accountant'], category: 'Employment' },
  { name: 'Department', label: 'Department', type: 'select', required: true, options: ['Operations', 'HR', 'Finance', 'Admin', 'Sales'], category: 'Employment' },
  { name: 'JoiningDate', label: 'Date of Joining', type: 'date', required: true, category: 'Employment' },
  { name: 'EmploymentType', label: 'Employment Type', type: 'select', required: true, options: ['Full-Time', 'Part-Time', 'Contract', 'Temporary'], category: 'Employment' },
  { name: 'Status', label: 'Employment Status', type: 'select', required: true, options: ['Active', 'On Leave', 'Inactive', 'Terminated'], defaultValue: 'Active', category: 'Employment' },
  { name: 'ReportingManager', label: 'Reporting Manager', type: 'text', required: false, placeholder: 'Manager Name', category: 'Employment' },
  
  // Salary & Bank Details
  { name: 'BasicSalary', label: 'Basic Salary (₹)', type: 'number', required: true, placeholder: '25000', category: 'Salary' },
  { name: 'HRA', label: 'HRA (₹)', type: 'number', required: false, placeholder: '10000', category: 'Salary' },
  { name: 'BankName', label: 'Bank Name', type: 'text', required: true, placeholder: 'State Bank of India', category: 'Bank' },
  { name: 'BankAccount', label: 'Bank Account Number', type: 'text', required: true, placeholder: '1234567890', category: 'Bank' },
  { name: 'IFSC', label: 'IFSC Code', type: 'text', required: true, placeholder: 'SBIN0001234', category: 'Bank' },
  
  // Government IDs
  { name: 'PAN', label: 'PAN Number', type: 'text', required: true, placeholder: 'ABCDE1234F', category: 'Documents' },
  { name: 'Aadhar', label: 'Aadhar Number', type: 'text', required: true, placeholder: '1234-5678-9012', category: 'Documents' },
  { name: 'UAN', label: 'UAN Number', type: 'text', required: false, placeholder: 'Universal Account Number', category: 'Documents' },
  
  // Emergency Contact
  { name: 'EmergencyContact', label: 'Emergency Contact Name', type: 'text', required: true, placeholder: 'Contact Person Name', category: 'Emergency' },
  { name: 'EmergencyPhone', label: 'Emergency Contact Phone', type: 'tel', required: true, placeholder: '+91-9876543210', category: 'Emergency' },
  { name: 'EmergencyRelation', label: 'Relationship', type: 'select', required: true, options: ['Spouse', 'Parent', 'Sibling', 'Friend', 'Other'], category: 'Emergency' },
  
  // Education & Experience
  { name: 'Qualification', label: 'Highest Qualification', type: 'select', required: true, options: ['10th', '12th', 'Diploma', 'Graduate', 'Post Graduate', 'Other'], category: 'Education' },
  { name: 'Experience', label: 'Total Experience (Years)', type: 'number', required: false, placeholder: '5', category: 'Education' },
];

export const partnerFormFields = [
  // Basic Information
  { name: 'SiteID', label: 'Site/Partner ID', type: 'text', required: true, placeholder: 'SITE001', category: 'Basic' },
  { name: 'PartnerName', label: 'Partner/Client Name', type: 'text', required: true, placeholder: 'Tech Corp India Pvt Ltd', category: 'Basic' },
  { name: 'PartnerType', label: 'Partner Type', type: 'select', required: true, options: ['Client', 'Vendor', 'Consultant', 'Contractor'], category: 'Basic' },
  { name: 'Industry', label: 'Industry', type: 'select', required: true, options: ['IT', 'Manufacturing', 'Retail', 'Healthcare', 'Education', 'Real Estate', 'Other'], category: 'Basic' },
  
  // Contact Details
  { name: 'ContactPerson', label: 'Primary Contact Person', type: 'text', required: true, placeholder: 'Mr. Rajesh Kumar', category: 'Contact' },
  { name: 'ContactEmail', label: 'Contact Email', type: 'email', required: true, placeholder: 'contact@partner.com', category: 'Contact' },
  { name: 'ContactPhone', label: 'Contact Phone', type: 'tel', required: true, placeholder: '+91-9876543210', category: 'Contact' },
  { name: 'AlternatePhone', label: 'Alternate Phone', type: 'tel', required: false, placeholder: '+91-9876543211', category: 'Contact' },
  
  // Location Details
  { name: 'Location', label: 'Site Location', type: 'text', required: true, placeholder: 'Mumbai, Maharashtra', category: 'Location' },
  { name: 'Address', label: 'Complete Address', type: 'textarea', required: true, placeholder: 'Full address with pincode', category: 'Location' },
  { name: 'City', label: 'City', type: 'text', required: true, placeholder: 'Mumbai', category: 'Location' },
  { name: 'State', label: 'State', type: 'text', required: true, placeholder: 'Maharashtra', category: 'Location' },
  { name: 'Pincode', label: 'Pincode', type: 'text', required: true, placeholder: '400001', category: 'Location' },
  
  // Contract Details
  { name: 'ContractStartDate', label: 'Contract Start Date', type: 'date', required: true, category: 'Contract' },
  { name: 'ContractEndDate', label: 'Contract End Date', type: 'date', required: false, category: 'Contract' },
  { name: 'ContractValue', label: 'Contract Value (₹)', type: 'number', required: false, placeholder: '1000000', category: 'Contract' },
  { name: 'BillingCycle', label: 'Billing Cycle', type: 'select', required: true, options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], category: 'Contract' },
  
  // Service Details
  { name: 'Headcount', label: 'Required Headcount', type: 'number', required: true, placeholder: '25', category: 'Service' },
  { name: 'ServiceType', label: 'Service Type', type: 'select', required: true, options: ['Security Services', 'Housekeeping', 'Facility Management', 'Manpower Supply', 'Other'], category: 'Service' },
  { name: 'Status', label: 'Partnership Status', type: 'select', required: true, options: ['Active', 'Inactive', 'On Hold', 'Terminated'], defaultValue: 'Active', category: 'Service' },
  
  // Financial Details
  { name: 'GSTIN', label: 'GSTIN', type: 'text', required: false, placeholder: '22AAAAA0000A1Z5', category: 'Financial' },
  { name: 'PaymentTerms', label: 'Payment Terms (Days)', type: 'number', required: true, placeholder: '30', category: 'Financial' },
];

export const payrollFormFields = [
  // Period Information
  { name: 'Month', label: 'Payroll Month', type: 'text', required: true, placeholder: 'January 2026', category: 'Period' },
  { name: 'PayrollDate', label: 'Payroll Processing Date', type: 'date', required: true, category: 'Period' },
  { name: 'PaymentDate', label: 'Payment Date', type: 'date', required: true, category: 'Period' },
  
  // Employee Reference
  { name: 'EmployeeID', label: 'Employee ID', type: 'text', required: true, placeholder: 'EMP001', category: 'Employee' },
  { name: 'EmployeeName', label: 'Employee Name', type: 'text', required: true, placeholder: 'John Doe', category: 'Employee' },
  
  // Earnings
  { name: 'BasicSalary', label: 'Basic Salary (₹)', type: 'number', required: true, placeholder: '25000', category: 'Earnings' },
  { name: 'HRA', label: 'House Rent Allowance (₹)', type: 'number', required: false, placeholder: '10000', category: 'Earnings' },
  { name: 'Conveyance', label: 'Conveyance Allowance (₹)', type: 'number', required: false, placeholder: '2000', category: 'Earnings' },
  { name: 'Medical', label: 'Medical Allowance (₹)', type: 'number', required: false, placeholder: '1500', category: 'Earnings' },
  { name: 'SpecialAllowance', label: 'Special Allowance (₹)', type: 'number', required: false, placeholder: '5000', category: 'Earnings' },
  { name: 'Bonus', label: 'Bonus/Incentive (₹)', type: 'number', required: false, placeholder: '0', category: 'Earnings' },
  
  // Deductions
  { name: 'PF', label: 'Provident Fund (₹)', type: 'number', required: false, placeholder: '1800', category: 'Deductions' },
  { name: 'ESI', label: 'ESI (₹)', type: 'number', required: false, placeholder: '0', category: 'Deductions' },
  { name: 'ProfessionalTax', label: 'Professional Tax (₹)', type: 'number', required: false, placeholder: '200', category: 'Deductions' },
  { name: 'TDS', label: 'TDS (₹)', type: 'number', required: false, placeholder: '0', category: 'Deductions' },
  { name: 'LoanRecovery', label: 'Loan Recovery (₹)', type: 'number', required: false, placeholder: '0', category: 'Deductions' },
  { name: 'OtherDeductions', label: 'Other Deductions (₹)', type: 'number', required: false, placeholder: '0', category: 'Deductions' },
  
  // Attendance
  { name: 'WorkingDays', label: 'Total Working Days', type: 'number', required: true, placeholder: '26', category: 'Attendance' },
  { name: 'PresentDays', label: 'Present Days', type: 'number', required: true, placeholder: '24', category: 'Attendance' },
  { name: 'LeaveDays', label: 'Leave Days', type: 'number', required: false, placeholder: '2', category: 'Attendance' },
  
  // Totals (Auto-calculated in UI)
  { name: 'GrossEarnings', label: 'Gross Earnings (₹)', type: 'number', required: false, placeholder: 'Auto-calculated', disabled: true, category: 'Summary' },
  { name: 'TotalDeductions', label: 'Total Deductions (₹)', type: 'number', required: false, placeholder: 'Auto-calculated', disabled: true, category: 'Summary' },
  { name: 'NetSalary', label: 'Net Salary (₹)', type: 'number', required: false, placeholder: 'Auto-calculated', disabled: true, category: 'Summary' },
  
  // Status
  { name: 'Status', label: 'Payment Status', type: 'select', required: true, options: ['Pending', 'Processing', 'Paid', 'On Hold'], defaultValue: 'Pending', category: 'Status' },
];

export const financeFormFields = [
  // Transaction Details
  { name: 'TransactionID', label: 'Transaction ID', type: 'text', required: true, placeholder: 'TXN001', category: 'Transaction' },
  { name: 'Date', label: 'Transaction Date', type: 'date', required: true, category: 'Transaction' },
  { name: 'Type', label: 'Transaction Type', type: 'select', required: true, options: ['Income', 'Expense'], category: 'Transaction' },
  { name: 'Category', label: 'Category', type: 'select', required: true, options: [
    'Client Payment',
    'Salary Payout',
    'Office Rent',
    'Utilities',
    'Equipment Purchase',
    'Marketing',
    'Travel',
    'Statutory Payments',
    'Loan Payment',
    'Other'
  ], category: 'Transaction' },
  
  // Amount Details
  { name: 'Amount', label: 'Amount (₹)', type: 'number', required: true, placeholder: '50000', category: 'Amount' },
  { name: 'TaxAmount', label: 'Tax Amount (₹)', type: 'number', required: false, placeholder: '0', category: 'Amount' },
  { name: 'NetAmount', label: 'Net Amount (₹)', type: 'number', required: false, placeholder: 'Auto-calculated', disabled: true, category: 'Amount' },
  
  // Reference Details
  { name: 'ReferenceNumber', label: 'Reference/Invoice Number', type: 'text', required: false, placeholder: 'INV-2026-001', category: 'Reference' },
  { name: 'PartyName', label: 'Party Name', type: 'text', required: true, placeholder: 'Client/Vendor Name', category: 'Reference' },
  { name: 'Description', label: 'Description', type: 'textarea', required: true, placeholder: 'Transaction details', category: 'Reference' },
  
  // Payment Details
  { name: 'PaymentMode', label: 'Payment Mode', type: 'select', required: true, options: ['Bank Transfer', 'Cash', 'Cheque', 'UPI', 'Card', 'Other'], category: 'Payment' },
  { name: 'PaymentStatus', label: 'Payment Status', type: 'select', required: true, options: ['Completed', 'Pending', 'Failed', 'Cancelled'], defaultValue: 'Completed', category: 'Payment' },
  
  // Approval
  { name: 'ApprovedBy', label: 'Approved By', type: 'text', required: false, placeholder: 'Manager Name', category: 'Approval' },
  { name: 'ApprovalDate', label: 'Approval Date', type: 'date', required: false, category: 'Approval' },
];

export const complianceFormFields = [
  // Requirement Details
  { name: 'ComplianceID', label: 'Compliance ID', type: 'text', required: true, placeholder: 'COMP001', category: 'Basic' },
  { name: 'Requirement', label: 'Compliance Requirement', type: 'text', required: true, placeholder: 'PF Filing - January 2026', category: 'Basic' },
  { name: 'Type', label: 'Compliance Type', type: 'select', required: true, options: [
    'PF Filing',
    'ESI Filing',
    'TDS Return',
    'GST Return',
    'Income Tax',
    'Labor License',
    'Contract Labor Act',
    'Shops & Establishment',
    'Professional Tax',
    'Other'
  ], category: 'Basic' },
  
  // Timeline
  { name: 'Deadline', label: 'Deadline', type: 'date', required: true, category: 'Timeline' },
  { name: 'ReminderDate', label: 'Reminder Date', type: 'date', required: false, category: 'Timeline' },
  { name: 'CompletionDate', label: 'Completion Date', type: 'date', required: false, category: 'Timeline' },
  
  // Status & Priority
  { name: 'Status', label: 'Status', type: 'select', required: true, options: ['Pending', 'In Progress', 'Completed', 'Overdue'], defaultValue: 'Pending', category: 'Status' },
  { name: 'Priority', label: 'Priority', type: 'select', required: true, options: ['High', 'Medium', 'Low'], defaultValue: 'Medium', category: 'Status' },
  
  // Details
  { name: 'Description', label: 'Description', type: 'textarea', required: false, placeholder: 'Detailed description of compliance requirement', category: 'Details' },
  { name: 'Authority', label: 'Regulatory Authority', type: 'text', required: false, placeholder: 'EPFO, ESIC, Income Tax Dept, etc.', category: 'Details' },
  { name: 'Frequency', label: 'Frequency', type: 'select', required: true, options: ['One-time', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], category: 'Details' },
  
  // Documents
  { name: 'DocLink', label: 'Document Link', type: 'url', required: false, placeholder: 'https://docs.google.com/...', category: 'Documents' },
  { name: 'ReferenceNumber', label: 'Reference/Challan Number', type: 'text', required: false, placeholder: 'Challan or filing reference', category: 'Documents' },
  
  // Responsibility
  { name: 'AssignedTo', label: 'Assigned To', type: 'text', required: false, placeholder: 'Employee name', category: 'Responsibility' },
  { name: 'Remarks', label: 'Remarks', type: 'textarea', required: false, placeholder: 'Additional notes', category: 'Responsibility' },
];

// Helper function to get fields by category
export function getFieldsByCategory(fields) {
  const categories = {};
  fields.forEach(field => {
    const cat = field.category || 'Other';
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(field);
  });
  return categories;
}

// Helper function to get form fields by module
export function getFormFieldsByModule(module) {
  const fieldMap = {
    workforce: employeeFormFields,
    partners: partnerFormFields,
    payroll: payrollFormFields,
    finance: financeFormFields,
    compliance: complianceFormFields,
  };
  return fieldMap[module] || [];
}
