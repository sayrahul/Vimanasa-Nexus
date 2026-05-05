"use client";
import React, { useState } from 'react';
import { FileText, Download, Mail, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { generateSalarySlip, generateBulkSalarySlips } from '@/lib/pdfGenerator';

export default function PayrollActions({ employees }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const [year, month] = selectedMonth.split('-');
      const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
      
      if (selectedEmployee === 'all') {
        // Generate for all employees
        const generatedFiles = generateBulkSalarySlips(employees, monthName, year);
        toast.success(`Generated ${generatedFiles.length} salary slips!`);
      } else {
        // Generate for single employee
        const employee = employees.find(e => 
          (e['Employee ID'] || e.employeeId) === selectedEmployee
        );
        
        if (employee) {
          // Map employee data to expected format
          const employeeData = {
            employeeId: employee['Employee ID'] || employee.employeeId,
            firstName: employee['First Name'] || employee.firstName || employee.Employee?.split(' ')[0],
            lastName: employee['Last Name'] || employee.lastName || employee.Employee?.split(' ')[1] || '',
            designation: employee.Designation || employee.Role,
            department: employee.Department || 'Operations',
            dateOfJoining: employee['Date of Joining'] || employee.dateOfJoining,
            panNumber: employee['PAN Number'] || employee.panNumber || 'N/A',
            bankName: employee['Bank Name'] || employee.bankName || 'N/A',
            accountNumber: employee['Account Number'] || employee.accountNumber || 'N/A',
            ifscCode: employee['IFSC Code'] || employee.ifscCode || 'N/A',
            basicSalary: employee['Basic Salary'] || employee.basicSalary || 15000,
            hra: employee.HRA || employee.hra || 7500,
            conveyanceAllowance: employee['Conveyance Allowance'] || employee.conveyanceAllowance || 1600,
            medicalAllowance: employee['Medical Allowance'] || employee.medicalAllowance || 1250,
            specialAllowance: employee['Special Allowance'] || employee.specialAllowance || 5000,
          };
          
          generateSalarySlip(employeeData, monthName, year);
          toast.success('Salary slip generated successfully!');
        }
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate salary slip');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
      >
        <FileText size={20} />
        Generate Payslips
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 rounded-t-3xl">
              <h3 className="text-2xl font-black text-white">Generate Salary Slips</h3>
              <p className="text-purple-100 text-sm mt-1">Create PDF payslips for employees</p>
            </div>

            <div className="p-8 space-y-6">
              {/* Month Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  max={new Date().toISOString().slice(0, 7)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold"
                />
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Select Employee
                </label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none font-semibold"
                >
                  <option value="all">All Employees ({employees?.length || 0})</option>
                  {employees?.map((emp, idx) => (
                    <option key={idx} value={emp['Employee ID'] || emp.employeeId}>
                      {emp.Employee || `${emp.firstName} ${emp.lastName}`} ({emp['Employee ID'] || emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm text-purple-800 font-semibold">
                  {selectedEmployee === 'all' 
                    ? `📄 ${employees?.length || 0} PDF files will be generated`
                    : '📄 1 PDF file will be generated'
                  }
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Files will be downloaded to your Downloads folder
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Generate PDF
                    </>
                  )}
                </button>
              </div>

              {/* Email Option (UI Ready) */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  disabled
                  className="w-full px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Mail size={20} />
                  Email to Employees (Coming Soon)
                </button>
                <p className="text-xs text-slate-500 text-center mt-2">
                  Email functionality will be available after SMTP setup
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
