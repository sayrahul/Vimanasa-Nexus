export async function generateClientInvoice(invoiceData) {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [37, 99, 235]; // Blue-600
  const secondaryColor = [71, 85, 105]; // Slate-600
  const accentColor = [6, 182, 212]; // Cyan-600
  
  // Header with Company Logo/Name
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('VIMANASA SERVICES LLP', 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Outsourcing & Manpower Solutions', 105, 22, { align: 'center' });
  doc.text('GST: 27AABCU9603R1ZM | PAN: AABCU9603R', 105, 28, { align: 'center' });
  doc.text('Email: billing@vimanasa.com | Phone: +91 98765 43210', 105, 34, { align: 'center' });
  
  // Invoice Title
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 105, 50, { align: 'center' });
  
  // Invoice Details Box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(15, 60, 180, 35);
  
  // Left side - Client Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...secondaryColor);
  doc.text('BILL TO:', 20, 68);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoiceData['Client Name'] || 'N/A', 20, 75);
  doc.setFontSize(9);
  doc.text(`Client ID: ${invoiceData['Client ID'] || 'N/A'}`, 20, 81);
  doc.text(`GST: ${invoiceData['Client GST'] || 'N/A'}`, 20, 87);
  
  // Right side - Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Invoice Number:', 120, 68);
  doc.text('Invoice Date:', 120, 75);
  doc.text('Due Date:', 120, 82);
  doc.text('Payment Terms:', 120, 89);
  
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData['Invoice Number'] || 'N/A', 160, 68);
  doc.text(invoiceData['Invoice Date'] || 'N/A', 160, 75);
  doc.text(invoiceData['Due Date'] || 'N/A', 160, 82);
  doc.text(invoiceData['Payment Terms'] || 'Net 30', 160, 89);
  
  // Billing Period
  doc.setFillColor(240, 240, 240);
  doc.rect(15, 100, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Billing Period: ${invoiceData['Month'] || 'N/A'}`, 20, 107);
  
  // Table - Employee Details
  const tableData = [];
  
  // Add employee rows (if available in invoice data)
  if (invoiceData.employees && invoiceData.employees.length > 0) {
    invoiceData.employees.forEach((emp, idx) => {
      tableData.push([
        idx + 1,
        emp.name || 'N/A',
        emp.role || 'N/A',
        emp.days || 26,
        `₹${parseFloat(emp.ratePerDay || 0).toLocaleString()}`,
        `₹${parseFloat(emp.amount || 0).toLocaleString()}`
      ]);
    });
  } else {
    // Fallback if no employee details
    tableData.push([
      1,
      'Manpower Services',
      'Multiple Roles',
      invoiceData['Total Employees'] || 0,
      '-',
      `₹${parseFloat(invoiceData['Subtotal'] || 0).toLocaleString()}`
    ]);
  }
  
  doc.autoTable({
    startY: 115,
    head: [['#', 'Employee Name', 'Role', 'Days', 'Rate/Day', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: secondaryColor,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 40 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 35, halign: 'right' },
    },
  });
  
  // Summary Box
  const finalY = doc.lastAutoTable.finalY + 10;
  
  // Left side - Bank Details
  doc.setDrawColor(200, 200, 200);
  doc.rect(15, finalY, 100, 40);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('BANK DETAILS:', 20, finalY + 7);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Bank Name: HDFC Bank', 20, finalY + 14);
  doc.text('Account Name: Vimanasa Services LLP', 20, finalY + 20);
  doc.text('Account Number: 50200012345678', 20, finalY + 26);
  doc.text('IFSC Code: HDFC0001234', 20, finalY + 32);
  
  // Right side - Amount Summary
  doc.rect(120, finalY, 75, 40);
  
  const subtotal = parseFloat(invoiceData['Subtotal'] || 0);
  const gst = parseFloat(invoiceData['GST Amount'] || 0);
  const total = parseFloat(invoiceData['Invoice Amount'] || 0);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subtotal:', 125, finalY + 10);
  doc.text(`₹${subtotal.toLocaleString()}`, 190, finalY + 10, { align: 'right' });
  
  doc.text('GST (18%):', 125, finalY + 18);
  doc.text(`₹${gst.toLocaleString()}`, 190, finalY + 18, { align: 'right' });
  
  // Total with highlight
  doc.setFillColor(...accentColor);
  doc.rect(120, finalY + 24, 75, 12, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 125, finalY + 32);
  doc.text(`₹${total.toLocaleString()}`, 190, finalY + 32, { align: 'right' });
  
  // Terms & Conditions
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Terms & Conditions:', 15, finalY + 50);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('1. Payment is due within the specified payment terms.', 15, finalY + 57);
  doc.text('2. Late payments may incur additional charges as per agreement.', 15, finalY + 62);
  doc.text('3. All statutory compliances (PF, ESIC, PT) are included in the billing.', 15, finalY + 67);
  doc.text('4. This is a computer-generated invoice and does not require a signature.', 15, finalY + 72);
  
  // Footer
  doc.setFillColor(...primaryColor);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, 287, { align: 'center' });
  doc.text('For queries, contact: billing@vimanasa.com | +91 98765 43210', 105, 292, { align: 'center' });
  
  // Save the PDF
  const fileName = `Invoice_${invoiceData['Invoice Number']}_${invoiceData['Client Name']?.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  
  return doc;
}

// Generate Invoice Summary Report
export async function generateInvoiceSummaryReport(invoices, month) {
  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
  
  const doc = new jsPDF();
  
  const primaryColor = [37, 99, 235];
  const secondaryColor = [71, 85, 105];
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE SUMMARY REPORT', 105, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${month}`, 105, 23, { align: 'center' });
  
  // Filter invoices for the month
  const monthInvoices = invoices.filter(inv => inv.Month === month);
  
  // Summary Stats
  const totalInvoiced = monthInvoices.reduce((sum, inv) => sum + parseFloat(inv['Invoice Amount'] || 0), 0);
  const totalPaid = monthInvoices.filter(inv => inv.Status === 'Paid').reduce((sum, inv) => sum + parseFloat(inv['Invoice Amount'] || 0), 0);
  const totalPending = totalInvoiced - totalPaid;
  
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(10);
  doc.text(`Total Invoices: ${monthInvoices.length}`, 20, 45);
  doc.text(`Total Invoiced: ₹${totalInvoiced.toLocaleString()}`, 20, 52);
  doc.text(`Total Paid: ₹${totalPaid.toLocaleString()}`, 20, 59);
  doc.text(`Total Pending: ₹${totalPending.toLocaleString()}`, 20, 66);
  
  // Table
  const tableData = monthInvoices.map(inv => [
    inv['Invoice Number'],
    inv['Client Name'],
    inv['Invoice Date'],
    `₹${parseFloat(inv['Invoice Amount'] || 0).toLocaleString()}`,
    inv.Status
  ]);
  
  doc.autoTable({
    startY: 75,
    head: [['Invoice #', 'Client', 'Date', 'Amount', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
  });
  
  doc.save(`Invoice_Summary_${month}.pdf`);
  return doc;
}
