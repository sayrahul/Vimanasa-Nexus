import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {String} sheetName - Name of the sheet
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Data') => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
