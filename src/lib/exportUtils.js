// Export utilities for PDF and Excel
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data to PDF
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column headers
 * @param {string} title - Document title
 * @param {string} filename - Output filename
 */
export function exportToPDF(data, columns, title, filename = 'export.pdf') {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 20);
  
  // Add metadata
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text('Vimanasa Nexus - Enterprise Management Portal', 14, 34);
  
  // Prepare table data
  const tableData = data.map(row => 
    columns.map(col => row[col] || 'N/A')
  );
  
  // Add table
  doc.autoTable({
    head: [columns],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
    margin: { top: 40 },
  });
  
  // Add footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  doc.save(filename);
}

/**
 * Export data to Excel
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 * @param {string} sheetName - Sheet name
 */
export function exportToExcel(data, filename = 'export.xlsx', sheetName = 'Data') {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Set column widths
  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, 15)
  }));
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Save file
  XLSX.writeFile(wb, filename);
}

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 */
export function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Print current view
 */
export function printView() {
  window.print();
}
