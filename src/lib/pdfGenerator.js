import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper to load the letterhead image from public folder
const loadLetterhead = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = '/letterhead.jpg';
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Letterhead not found at /letterhead.jpg");
      resolve(null);
    };
  });
};

const applyLetterhead = (doc, img) => {
  if (img) {
    // A4 size is 210 x 297 mm
    doc.addImage(img, 'JPEG', 0, 0, 210, 297);
  }
};

export async function generateSalarySlip(employee, month, year) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const letterhead = await loadLetterhead();
  applyLetterhead(doc, letterhead);
  
  // Start drawing below the letterhead header area (approx 45mm down)
  const startY = 55;
  
  // Salary Slip Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('SALARY SLIP', 105, startY, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`For the month of ${month} ${year}`, 105, startY + 7, { align: 'center' });
  
  // Employee Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, startY + 15, 180, 35);
  
  // Employee Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details:', 20, startY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee ID: ${employee.employeeId || 'N/A'}`, 20, startY + 30);
  doc.text(`Name: ${employee.firstName || ''} ${employee.lastName || ''}`, 20, startY + 37);
  doc.text(`Designation: ${employee.designation || 'N/A'}`, 20, startY + 44);
  
  doc.text(`Department: ${employee.department || 'N/A'}`, 110, startY + 30);
  doc.text(`Date of Joining: ${employee.dateOfJoining || 'N/A'}`, 110, startY + 37);
  doc.text(`PAN: ${employee.panNumber || 'N/A'}`, 110, startY + 44);
  
  // Tables
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
  ];
  
  const totalEarnings = getTotalEarnings(employee);
  const totalDeductions = getTotalDeductions(employee);
  const netSalary = totalEarnings - totalDeductions;
  
  doc.autoTable({
    startY: startY + 55,
    head: [['EARNINGS', 'AMOUNT (Rs)']],
    body: earnings,
    foot: [['Total Earnings', formatCurrency(totalEarnings)]],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
    margin: { left: 15, right: 105 },
  });
  
  doc.autoTable({
    startY: startY + 55,
    head: [['DEDUCTIONS', 'AMOUNT (Rs)']],
    body: deductions,
    foot: [['Total Deductions', formatCurrency(totalDeductions)]],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
    margin: { left: 105, right: 15 },
  });
  
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Net Salary
  doc.setFillColor(34, 197, 94);
  doc.rect(15, finalY, 180, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET SALARY:', 20, finalY + 10);
  doc.text(formatCurrency(netSalary), 190, finalY + 10, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(`Amount in words: ${numberToWords(netSalary)} Rupees Only`, 20, finalY + 22);
  
  const filename = `SalarySlip_${employee.employeeId}_${month}_${year}.pdf`;
  doc.save(filename);
  return filename;
}

export async function generateOfferLetter(employee) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const letterhead = await loadLetterhead();
  applyLetterhead(doc, letterhead);
  
  const startY = 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, startY, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`To,`, 20, startY + 10);
  doc.text(`${employee.firstName || employee.Employee}`, 20, startY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Subject: Offer of Employment`, 20, startY + 28);
  
  doc.text(`Dear ${employee.firstName || employee.Employee},`, 20, startY + 40);
  
  const body = `We are pleased to offer you the position of ${employee.Role || employee.designation} at Vimanasa Services LLP. We were impressed with your credentials and believe you will be a valuable addition to our team.

Your expected joining date will be ${employee['Date of Joining'] || new Date().toLocaleDateString()}. Your Total Pay Rate will be Rs. ${employee['Basic Salary'] || employee.salary}/- per month.

Please review the attached terms and conditions of your employment. If you choose to accept this offer, please sign and return a copy of this letter.

We look forward to welcoming you to Vimanasa Services LLP.`;

  const splitBody = doc.splitTextToSize(body, 170);
  doc.text(splitBody, 20, startY + 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Sincerely,`, 20, startY + 110);
  doc.text(`Human Resources`, 20, startY + 125);
  doc.text(`Vimanasa Services LLP`, 20, startY + 131);
  
  doc.save(`OfferLetter_${employee.Employee || employee.employeeId}.pdf`);
}

export async function generateJoiningLetter(employee) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const letterhead = await loadLetterhead();
  applyLetterhead(doc, letterhead);
  
  const startY = 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, startY, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`JOINING LETTER`, 105, startY + 15, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`To,`, 20, startY + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(`${employee.firstName || employee.Employee}`, 20, startY + 36);
  doc.text(`Emp ID: ${employee.employeeId || employee['ID']}`, 20, startY + 42);
  
  doc.setFont('helvetica', 'normal');
  const body = `This is to certify that ${employee.firstName || employee.Employee} has officially joined Vimanasa Services LLP in the capacity of ${employee.Role || employee.designation} with effect from ${employee['Date of Joining'] || new Date().toLocaleDateString()}.

You have been deployed at ${employee['Assigned Client'] || 'our headquarters'} starting today.

We wish you a long and successful career with us.`;

  const splitBody = doc.splitTextToSize(body, 170);
  doc.text(splitBody, 20, startY + 55);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Authorized Signatory`, 20, startY + 110);
  doc.text(`Vimanasa Services LLP`, 20, startY + 116);
  
  doc.save(`JoiningLetter_${employee.Employee || employee.employeeId}.pdf`);
}

export async function generateExperienceLetter(employee) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const letterhead = await loadLetterhead();
  applyLetterhead(doc, letterhead);
  
  const startY = 60;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, startY, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text(`EXPERIENCE CERTIFICATE`, 105, startY + 15, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.text(`TO WHOMSOEVER IT MAY CONCERN`, 105, startY + 30, { align: 'center' });
  
  const body = `This is to certify that ${employee.firstName || employee.Employee} was employed with Vimanasa Services LLP from ${employee['Date of Joining'] || 'N/A'} to ${new Date().toLocaleDateString()}. 

During their tenure, they held the position of ${employee.Role || employee.designation}. We found them to be highly professional, diligent, and hardworking. They executed all assigned duties to our full satisfaction.

We wish them all the best in their future endeavors.`;

  const splitBody = doc.splitTextToSize(body, 170);
  doc.text(splitBody, 20, startY + 50);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Authorized Signatory`, 20, startY + 110);
  doc.text(`Vimanasa Services LLP`, 20, startY + 116);
  
  doc.save(`ExperienceLetter_${employee.Employee || employee.employeeId}.pdf`);
}

export async function generateClientInvoice(client, amount, invoiceNo, items = []) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const letterhead = await loadLetterhead();
  applyLetterhead(doc, letterhead);
  
  const startY = 55;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`TAX INVOICE`, 105, startY, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  doc.text(`Invoice No: ${invoiceNo}`, 20, startY + 15);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, startY + 21);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Billed To:`, 130, startY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(`${client['Client Name'] || client.company_name}`, 130, startY + 21);
  doc.text(`${client.Location || client.address || 'Address N/A'}`, 130, startY + 27);
  
  let currentY = startY + 40;
  
  if (items.length > 0) {
    doc.autoTable({
      startY: currentY,
      head: [['Description', 'Qty', 'Rate', 'Amount']],
      body: items.map(item => [item.desc, item.qty, item.rate, item.amount]),
      foot: [['', '', 'Total', formatCurrency(amount)]],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' }
    });
    currentY = doc.lastAutoTable.finalY + 20;
  } else {
    doc.text(`Service: Manpower Provisioning Services`, 20, currentY);
    doc.text(`Total Amount: ${formatCurrency(amount)}`, 20, currentY + 10);
    currentY += 30;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Payment Details:`, 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`Bank Name: HDFC Bank`, 20, currentY + 7);
  doc.text(`Account No: 1234567890`, 20, currentY + 14);
  doc.text(`IFSC Code: HDFC0001234`, 20, currentY + 21);
  
  doc.save(`Invoice_${invoiceNo}.pdf`);
}

export async function generateBulkSalarySlips(employees, month, year) {
  const generatedFiles = [];
  for (const employee of employees) {
    try {
      const filename = await generateSalarySlip(employee, month, year);
      generatedFiles.push(filename);
    } catch (error) {
      console.error(`Error generating slip for ${employee.employeeId}:`, error);
    }
  }
  return generatedFiles;
}

// Helpers
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return 'Rs. ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function getTotalEarnings(e) {
  return parseFloat(e.basicSalary||0) + parseFloat(e.hra||0) + parseFloat(e.conveyanceAllowance||0) + parseFloat(e.medicalAllowance||0) + parseFloat(e.specialAllowance||0);
}
function calculatePF(b) { return parseFloat(b||0) * 0.12; }
function calculateESI(g) { return g <= 21000 ? g * 0.0075 : 0; }
function getTotalDeductions(e) { return calculatePF(e.basicSalary||0) + calculateESI(getTotalEarnings(e)) + 200; }
function numberToWords(num) { return num.toString(); }
