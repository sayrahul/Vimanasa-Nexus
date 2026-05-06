/**
 * Bank Transfer File Generator
 * Generates NEFT/RTGS/IMPS files for salary payments
 */

/**
 * Generate NEFT file format
 * Standard format accepted by most Indian banks
 */
export function generateNEFTFile(payrollRecords, companyDetails) {
  const {
    companyName = 'VIMANASA OUTSOURCING SERVICES',
    accountNumber = '',
    ifscCode = '',
    bankName = ''
  } = companyDetails;

  const date = new Date();
  const batchNumber = `NEFT${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  let fileContent = '';
  
  // Header Record
  fileContent += generateNEFTHeader(companyName, accountNumber, ifscCode, batchNumber, payrollRecords.length);
  fileContent += '\n';
  
  // Detail Records
  payrollRecords.forEach((record, index) => {
    fileContent += generateNEFTDetail(record, index + 1, batchNumber);
    fileContent += '\n';
  });
  
  // Trailer Record
  const totalAmount = payrollRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0);
  fileContent += generateNEFTTrailer(payrollRecords.length, totalAmount);
  
  return {
    content: fileContent,
    filename: `${batchNumber}_${date.getTime()}.txt`,
    batchNumber,
    totalRecords: payrollRecords.length,
    totalAmount
  };
}

function generateNEFTHeader(companyName, accountNumber, ifscCode, batchNumber, recordCount) {
  const date = new Date();
  const dateStr = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
  
  return [
    'H',                                          // Record Type
    batchNumber.padEnd(20),                       // Batch Number
    companyName.padEnd(40),                       // Company Name
    accountNumber.padEnd(20),                     // Debit Account Number
    ifscCode.padEnd(11),                          // IFSC Code
    dateStr,                                      // Transaction Date
    String(recordCount).padStart(6, '0'),         // Total Records
  ].join('|');
}

function generateNEFTDetail(record, serialNo, batchNumber) {
  const {
    employeeId = '',
    employeeName = '',
    accountNumber = '',
    ifscCode = '',
    netSalary = 0,
    bankName = ''
  } = record;
  
  return [
    'D',                                          // Record Type
    String(serialNo).padStart(6, '0'),            // Serial Number
    batchNumber.padEnd(20),                       // Batch Number
    employeeId.padEnd(20),                        // Beneficiary ID
    employeeName.padEnd(40),                      // Beneficiary Name
    accountNumber.padEnd(20),                     // Credit Account Number
    ifscCode.padEnd(11),                          // IFSC Code
    String(Math.round(netSalary * 100)).padStart(15, '0'), // Amount in paise
    'SAL',                                        // Payment Type (Salary)
    `Salary ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`.padEnd(50), // Narration
    bankName.padEnd(40),                          // Bank Name
  ].join('|');
}

function generateNEFTTrailer(recordCount, totalAmount) {
  return [
    'T',                                          // Record Type
    String(recordCount).padStart(6, '0'),         // Total Records
    String(Math.round(totalAmount * 100)).padStart(17, '0'), // Total Amount in paise
  ].join('|');
}

/**
 * Generate CSV format for bank upload
 * Alternative format accepted by many banks
 */
export function generateBankCSV(payrollRecords, companyDetails) {
  const headers = [
    'Sr No',
    'Employee ID',
    'Employee Name',
    'Account Number',
    'IFSC Code',
    'Bank Name',
    'Amount',
    'Narration',
    'Email',
    'Mobile'
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  payrollRecords.forEach((record, index) => {
    const row = [
      index + 1,
      record.employeeId || '',
      `"${record.employeeName || ''}"`,
      record.accountNumber || '',
      record.ifscCode || '',
      `"${record.bankName || ''}"`,
      record.netSalary || 0,
      `"Salary ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}"`,
      record.email || '',
      record.mobile || ''
    ];
    csvContent += row.join(',') + '\n';
  });
  
  const date = new Date();
  const filename = `Salary_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getTime()}.csv`;
  
  return {
    content: csvContent,
    filename,
    totalRecords: payrollRecords.length,
    totalAmount: payrollRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0)
  };
}

/**
 * Generate Excel-compatible format
 */
export function generateBankExcel(payrollRecords) {
  // This would require a library like xlsx
  // For now, return CSV which Excel can open
  return generateBankCSV(payrollRecords, {});
}

/**
 * Validate bank details before generating file
 */
export function validateBankDetails(payrollRecords) {
  const errors = [];
  
  payrollRecords.forEach((record, index) => {
    const employeeRef = `${record.employeeName} (${record.employeeId})`;
    
    if (!record.accountNumber || record.accountNumber.trim() === '') {
      errors.push(`${employeeRef}: Missing account number`);
    }
    
    if (!record.ifscCode || record.ifscCode.trim() === '') {
      errors.push(`${employeeRef}: Missing IFSC code`);
    }
    
    if (!record.netSalary || record.netSalary <= 0) {
      errors.push(`${employeeRef}: Invalid net salary amount`);
    }
    
    // Validate IFSC format (should be 11 characters)
    if (record.ifscCode && record.ifscCode.length !== 11) {
      errors.push(`${employeeRef}: Invalid IFSC code format`);
    }
    
    // Validate account number (should be numeric and reasonable length)
    if (record.accountNumber && !/^\d{9,18}$/.test(record.accountNumber)) {
      errors.push(`${employeeRef}: Invalid account number format`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Download file to user's computer
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generate and download NEFT file
 */
export function generateAndDownloadNEFT(payrollRecords, companyDetails) {
  // Validate first
  const validation = validateBankDetails(payrollRecords);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }
  
  // Generate file
  const fileData = generateNEFTFile(payrollRecords, companyDetails);
  
  // Download
  downloadFile(fileData.content, fileData.filename);
  
  return {
    success: true,
    ...fileData
  };
}

/**
 * Generate and download CSV file
 */
export function generateAndDownloadCSV(payrollRecords, companyDetails) {
  // Validate first
  const validation = validateBankDetails(payrollRecords);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }
  
  // Generate file
  const fileData = generateBankCSV(payrollRecords, companyDetails);
  
  // Download
  downloadFile(fileData.content, fileData.filename, 'text/csv');
  
  return {
    success: true,
    ...fileData
  };
}

/**
 * Generate payment summary report
 */
export function generatePaymentSummary(payrollRecords) {
  const summary = {
    totalEmployees: payrollRecords.length,
    totalAmount: 0,
    byBank: {},
    byDepartment: {},
    errors: []
  };
  
  payrollRecords.forEach(record => {
    // Total amount
    summary.totalAmount += record.netSalary || 0;
    
    // By bank
    const bank = record.bankName || 'Unknown';
    if (!summary.byBank[bank]) {
      summary.byBank[bank] = { count: 0, amount: 0 };
    }
    summary.byBank[bank].count++;
    summary.byBank[bank].amount += record.netSalary || 0;
    
    // By department
    const dept = record.department || 'Unknown';
    if (!summary.byDepartment[dept]) {
      summary.byDepartment[dept] = { count: 0, amount: 0 };
    }
    summary.byDepartment[dept].count++;
    summary.byDepartment[dept].amount += record.netSalary || 0;
  });
  
  return summary;
}

/**
 * Format amount for display
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Generate payment advice (for email)
 */
export function generatePaymentAdvice(record, month, year) {
  return `
Dear ${record.employeeName},

Your salary for ${month} ${year} has been processed.

Payment Details:
- Employee ID: ${record.employeeId}
- Gross Salary: ${formatAmount(record.grossEarnings)}
- Total Deductions: ${formatAmount(record.totalDeductions)}
- Net Salary: ${formatAmount(record.netSalary)}

Bank Details:
- Bank: ${record.bankName}
- Account: ${record.accountNumber}
- IFSC: ${record.ifscCode}

The amount will be credited to your account within 1-2 working days.

For detailed payslip, please check your email or download from the portal.

Regards,
HR Department
VIMANASA OUTSOURCING SERVICES
  `.trim();
}

/**
 * Batch records for processing
 * Some banks have limits on records per file
 */
export function batchRecords(records, batchSize = 100) {
  const batches = [];
  for (let i = 0; i < records.length; i += batchSize) {
    batches.push(records.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Generate multiple files if needed
 */
export function generateMultipleBankFiles(payrollRecords, companyDetails, format = 'NEFT', batchSize = 100) {
  const batches = batchRecords(payrollRecords, batchSize);
  const files = [];
  
  batches.forEach((batch, index) => {
    let fileData;
    if (format === 'NEFT') {
      fileData = generateNEFTFile(batch, companyDetails);
    } else if (format === 'CSV') {
      fileData = generateBankCSV(batch, companyDetails);
    }
    
    files.push({
      ...fileData,
      batchNumber: index + 1,
      totalBatches: batches.length
    });
  });
  
  return files;
}
