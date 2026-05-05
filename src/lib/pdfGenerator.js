import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function generateSalarySlip(employee, month, year) {
  const doc = new jsPDF();
  
  // Company Header
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Logo/Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VIMANASA SERVICES LLP', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Enterprise HR & Workforce Management', 105, 22, { align: 'center' });
  doc.text('Mumbai, Maharashtra | GST: 27XXXXX1234X1ZX', 105, 28, { align: 'center' });
  doc.text('www.vimanasa.com | hr@vimanasa.com', 105, 34, { align: 'center' });
  
  // Salary Slip Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY SLIP', 105, 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`For the month of ${month} ${year}`, 105, 57, { align: 'center' });
  
  // Employee Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, 65, 180, 35);
  
  // Employee Info - Left Column
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details:', 20, 73);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee ID: ${employee.employeeId || 'N/A'}`, 20, 80);
  doc.text(`Name: ${employee.firstName || ''} ${employee.lastName || ''}`, 20, 87);
  doc.text(`Designation: ${employee.designation || 'N/A'}`, 20, 94);
  
  // Employee Info - Right Column
  doc.text(`Department: ${employee.department || 'N/A'}`, 110, 80);
  doc.text(`Date of Joining: ${employee.dateOfJoining || 'N/A'}`, 110, 87);
  doc.text(`PAN: ${employee.panNumber || 'N/A'}`, 110, 94);
  
  // Salary Details Table
  const earnings = [
    ['Basic Salary', formatCurrency(employee.basicSalary || 0)],
    ['House Rent Allowance (HRA)', formatCurrency(employee.hra || 0)],
    ['Conveyance Allowance', formatCurrency(employee.conveyanceAllowance || 0)],
    ['Medical Allowance', formatCurrency(employee.medicalAllowance || 0)],
    ['Special Allowance', formatCurrency(employee.specialAllowance || 0)],
  ];
  
  const deductions = [
    ['Provident Fund (PF)', formatCurrency(calculatePF(employee.basicSalary || 0))],
    ['Employee State Insurance (ESI)', formatCurrency(calculateESI(getTotalEarnings(employee)))],
    ['Professional Tax', formatCurrency(200)],
    ['Income Tax (TDS)', formatCurrency(0)],
    ['Other Deductions', formatCurrency(0)],
  ];
  
  const totalEarnings = getTotalEarnings(employee);
  const totalDeductions = getTotalDeductions(employee);
  const netSalary = totalEarnings - totalDeductions;
  
  // Earnings Table
  doc.autoTable({
    startY: 110,
    head: [['EARNINGS', 'AMOUNT (₹)']],
    body: earnings,
    foot: [['Total Earnings', formatCurrency(totalEarnings)]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold', fontSize: 10 },
    footStyles: { fillColor: [241, 245, 249], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 15, right: 105 },
  });
  
  // Deductions Table
  doc.autoTable({
    startY: 110,
    head: [['DEDUCTIONS', 'AMOUNT (₹)']],
    body: deductions,
    foot: [['Total Deductions', formatCurrency(totalDeductions)]],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold', fontSize: 10 },
    footStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 120 },
      1: { cellWidth: 60, halign: 'right' }
    },
    margin: { left: 105, right: 15 },
  });
  
  // Net Salary Box
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFillColor(34, 197, 94);
  doc.rect(15, finalY, 180, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY:', 20, finalY + 10);
  doc.text(formatCurrency(netSalary), 190, finalY + 10, { align: 'right' });
  
  // Net Salary in Words
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Amount in words: ${numberToWords(netSalary)} Rupees Only`, 20, finalY + 22);
  
  // Bank Details
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details:', 20, finalY + 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank Name: ${employee.bankName || 'N/A'}`, 20, finalY + 42);
  doc.text(`Account Number: ${employee.accountNumber || 'N/A'}`, 20, finalY + 49);
  doc.text(`IFSC Code: ${employee.ifscCode || 'N/A'}`, 110, finalY + 42);
  doc.text(`Payment Mode: Bank Transfer`, 110, finalY + 49);
  
  // Footer
  doc.setDrawColor(200, 200, 200);
  doc.line(15, finalY + 60, 195, finalY + 60);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated salary slip and does not require a signature.', 105, finalY + 67, { align: 'center' });
  doc.text('For any queries, please contact HR Department at hr@vimanasa.com', 105, finalY + 72, { align: 'center' });
  
  // Confidential Notice
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIDENTIAL DOCUMENT - FOR RECIPIENT ONLY', 105, finalY + 80, { align: 'center' });
  
  // Generate filename
  const filename = `SalarySlip_${employee.employeeId}_${month}_${year}.pdf`;
  
  // Save PDF
  doc.save(filename);
  
  return filename;
}

export function generateBulkSalarySlips(employees, month, year) {
  const generatedFiles = [];
  
  employees.forEach(employee => {
    try {
      const filename = generateSalarySlip(employee, month, year);
      generatedFiles.push(filename);
    } catch (error) {
      console.error(`Error generating slip for ${employee.employeeId}:`, error);
    }
  });
  
  return generatedFiles;
}

// Helper Functions
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '₹ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getTotalEarnings(employee) {
  return (
    parseFloat(employee.basicSalary || 0) +
    parseFloat(employee.hra || 0) +
    parseFloat(employee.conveyanceAllowance || 0) +
    parseFloat(employee.medicalAllowance || 0) +
    parseFloat(employee.specialAllowance || 0)
  );
}

function calculatePF(basicSalary) {
  // 12% of basic salary
  return parseFloat(basicSalary || 0) * 0.12;
}

function calculateESI(grossSalary) {
  // 0.75% of gross salary (if gross < 21000)
  const gross = parseFloat(grossSalary || 0);
  if (gross <= 21000) {
    return gross * 0.0075;
  }
  return 0;
}

function getTotalDeductions(employee) {
  const totalEarnings = getTotalEarnings(employee);
  const pf = calculatePF(employee.basicSalary || 0);
  const esi = calculateESI(totalEarnings);
  const pt = 200; // Professional Tax
  
  return pf + esi + pt;
}

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const hundred = Math.floor((num % 1000) / 100);
  const remainder = Math.floor(num % 100);
  
  let words = '';
  
  if (crore > 0) {
    words += convertTwoDigit(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigit(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigit(thousand) + ' Thousand ';
  }
  if (hundred > 0) {
    words += ones[hundred] + ' Hundred ';
  }
  if (remainder > 0) {
    if (remainder < 10) {
      words += ones[remainder];
    } else if (remainder < 20) {
      words += teens[remainder - 10];
    } else {
      words += tens[Math.floor(remainder / 10)];
      if (remainder % 10 > 0) {
        words += ' ' + ones[remainder % 10];
      }
    }
  }
  
  return words.trim();
  
  function convertTwoDigit(n) {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '');
  }
}
