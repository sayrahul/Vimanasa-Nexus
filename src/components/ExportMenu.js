"use client";
import React, { useState } from 'react';
import { Download, FileText, Table, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportMenu({ data, filename, title }) {
  const [showMenu, setShowMenu] = useState(false);

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, title || 'Data');
      XLSX.writeFile(wb, `${filename.replace('.csv', '')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file downloaded successfully!');
      setShowMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename.replace('.csv', '')}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('CSV file downloaded successfully!');
      setShowMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to CSV');
    }
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) {
      toast.warning('No data available to export');
      return;
    }
    try {
      const doc = new jsPDF('l', 'pt', 'a4');
      doc.setFontSize(18);
      doc.setTextColor(26, 86, 166);
      doc.text(title || 'Data Export', 40, 45);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 65);
      
      const columns = Object.keys(data[0]).map(key => ({ header: key, dataKey: key }));
      
      doc.autoTable({
        columns: columns,
        body: data,
        startY: 80,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [26, 86, 166], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });
      
      doc.save(`${filename.replace('.csv', '')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF file downloaded successfully!');
      setShowMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const printTable = () => {
    window.print();
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2"
      >
        <Download size={20} />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-2">
              <button
                onClick={exportToExcel}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-green-50 hover:text-green-600 transition-all"
              >
                <FileSpreadsheet size={18} className="text-green-600" />
                Export to Excel
              </button>
              <button
                onClick={exportToCSV}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                <Table size={18} className="text-blue-600" />
                Export to CSV
              </button>
              <button
                onClick={exportToPDF}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <FileText size={18} className="text-red-600" />
                Export to PDF
              </button>
              <div className="border-t border-slate-200 my-2" />
              <button
                onClick={printTable}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-all"
              >
                <FileText size={18} className="text-purple-600" />
                Print
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
