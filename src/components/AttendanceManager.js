"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Users, Download, Lock, Unlock, CheckSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import ExportMenu from '@/components/ExportMenu';

export default function AttendanceManager({ employees = [], attendanceData = [], leaveRequests = [], onSave }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [attendance, setAttendance] = useState({});
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'report'
  const [isLocked, setIsLocked] = useState(false);
  const [selectedClientFilter, setSelectedClientFilter] = useState('All');

  // Extract unique clients
  const uniqueClients = [...new Set(employees.map(e => e['Assigned Client']).filter(Boolean))].sort();

  // Filter ONLY Deployed Employees
  const deployedEmployees = employees.filter(e => 
    e['Deployment Status'] === 'Deployed' || (!e['Deployment Status'] && e['Assigned Client'])
  );

  const filteredEmployees = selectedClientFilter === 'All' 
    ? deployedEmployees 
    : deployedEmployees.filter(e => e['Assigned Client'] === selectedClientFilter);

  useEffect(() => {
    // When date changes, check if attendance is already marked and locked
    const recordsForDate = attendanceData.filter(r => r.Date === selectedDate);
    
    if (recordsForDate.length > 0) {
      // Load existing records
      const existingAttendance = {};
      recordsForDate.forEach(r => {
        existingAttendance[r['Employee ID']] = r.Status;
      });
      setAttendance(existingAttendance);
      setIsLocked(true); // Auto-lock if records exist
    } else {
      // Check for approved leaves on this date
      const newAttendance = {};
      const currentDateObj = new Date(selectedDate);
      
      deployedEmployees.forEach(emp => {
        const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
        
        // Find if employee has an approved leave spanning this date
        const isOnLeave = leaveRequests.some(lr => {
          if (lr.Status !== 'Approved' || lr['Employee ID'] !== empId) return false;
          const start = new Date(lr['Start Date']);
          const end = new Date(lr['End Date']);
          return currentDateObj >= start && currentDateObj <= end;
        });

        if (isOnLeave) {
          newAttendance[empId] = 'On Leave';
        }
      });
      
      setAttendance(newAttendance);
      setIsLocked(false);
    }
  }, [selectedDate, attendanceData, leaveRequests, deployedEmployees.length]);

  const handleMarkAttendance = (employeeId, status) => {
    if (isLocked) {
      toast.error('Attendance is locked for this date. Unlock to make changes.');
      return;
    }
    setAttendance(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  const handleMarkAllPresent = () => {
    if (isLocked) {
      toast.error('Attendance is locked.');
      return;
    }
    const newAttendance = { ...attendance };
    filteredEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      // Only mark present if not already explicitly marked as something else (like On Leave)
      if (!newAttendance[empId]) {
        newAttendance[empId] = 'Present';
      }
    });
    setAttendance(newAttendance);
    toast.info(`All unmarked ${selectedClientFilter !== 'All' ? 'filtered ' : ''}employees set to Present.`);
  };

  const handleSaveAttendance = async () => {
    if (isLocked) return;

    // Ensure all filtered employees are marked
    const unmarked = filteredEmployees.filter(emp => !attendance[emp['ID'] || emp.employeeId || emp['Employee ID']]);
    if (unmarked.length > 0) {
      toast.error(`Please mark attendance for all ${selectedClientFilter !== 'All' ? 'filtered ' : ''}employees. ${unmarked.length} remaining.`);
      return;
    }

    // Only save the currently filtered ones to avoid overwriting or saving empty ones
    const attendanceRecords = Object.entries(attendance)
      .filter(([empId]) => filteredEmployees.some(e => (e['ID'] || e.employeeId || e['Employee ID']) === empId))
      .map(([empId, status]) => {
      const employee = employees.find(e => e['ID'] === empId || e['Employee ID'] === empId || e.employeeId === empId);
      return {
        Date: selectedDate,
        'Employee ID': empId,
        employee_id: employee?.id,
        'Employee Name': employee?.Employee || employee?.firstName + ' ' + employee?.lastName || 'Unknown',
        Status: status,
        'Marked By': 'Admin',
        'Marked At': new Date().toLocaleString()
      };
    });

    try {
      for (const record of attendanceRecords) {
        await onSave(record);
      }
      toast.success(`Attendance successfully saved for ${attendanceRecords.length} employees.`);
      // If we are filtering, we might not want to lock the WHOLE day yet
      if (selectedClientFilter === 'All') {
         setIsLocked(true);
      }
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error(error);
    }
  };

  const unlockAttendance = () => {
    const password = prompt("Enter Admin Password to unlock attendance for this date:");
    if (password === "admin") { // In a real app, this would verify via an API/auth
      setIsLocked(false);
      toast.success("Attendance unlocked for editing.");
    } else if (password !== null) {
      toast.error("Incorrect password.");
    }
  };

  const getAttendanceStats = () => {
    let present = 0, absent = 0, leave = 0, halfDay = 0;
    
    filteredEmployees.forEach(emp => {
      const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
      const status = attendance[empId];
      if (status === 'Present') present++;
      if (status === 'Absent') absent++;
      if (status === 'On Leave') leave++;
      if (status === 'Half Day') halfDay++;
    });
    
    return { present, absent, leave, halfDay, total: filteredEmployees.length };
  };

  const stats = getAttendanceStats();

  // Generate Monthly Summary
  const monthlySummary = filteredEmployees.map(emp => {
    const empId = emp['ID'] || emp.employeeId || emp['Employee ID'];
    const empRecords = attendanceData.filter(r => (r['Employee ID'] === empId || r.employee_id === emp.id) && r.Date?.startsWith(selectedMonth));
    
    return {
      'Employee ID': empId,
      'Employee Name': emp.Employee || 'Unknown',
      'Client Site': emp['Assigned Client'] || 'N/A',
      'Total Present': empRecords.filter(r => r.Status === 'Present').length,
      'Total Absent': empRecords.filter(r => r.Status === 'Absent').length,
      'Total Half Days': empRecords.filter(r => r.Status === 'Half Day').length,
      'Total Leaves': empRecords.filter(r => r.Status === 'On Leave').length,
      'Total Payable Days': empRecords.filter(r => r.Status === 'Present').length + 
                           (empRecords.filter(r => r.Status === 'Half Day').length * 0.5) +
                           empRecords.filter(r => r.Status === 'On Leave').length // Assuming paid leaves
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Attendance Engine</h2>
          <p className="text-slate-500 mt-1">Mark daily attendance for all {deployedEmployees.length} deployed employees</p>
        </div>
        <div className="flex gap-3 bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setViewMode('mark')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'mark' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mark Daily
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monthly Summary
          </button>
        </div>
      </div>

      {viewMode === 'mark' && (
        <>
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex-1 lg:flex-none">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full lg:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-slate-50"
                />
              </div>

              <div className="flex-1 lg:flex-none">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Filter by Client</label>
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="w-full lg:w-auto px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-slate-50 min-w-[200px]"
                >
                  <option value="All">All Clients</option>
                  {uniqueClients.map((client, idx) => (
                    <option key={idx} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              
              <div className="hidden lg:block h-10 w-px bg-slate-200"></div>

              {isLocked ? (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl font-bold border border-amber-200">
                  <Lock size={18} />
                  Locked
                  <button onClick={unlockAttendance} className="ml-2 text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-2 py-1 rounded transition-colors">
                    Unlock
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl font-bold border border-green-200">
                  <Unlock size={18} />
                  Open for Edits
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button
                onClick={handleMarkAllPresent}
                disabled={isLocked}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50 border border-slate-200"
              >
                <CheckSquare size={18} className="text-green-600" /> Mark Unmarked as Present
              </button>
              
              <button
                onClick={handleSaveAttendance}
                disabled={isLocked || Object.keys(attendance).length === 0}
                className="flex-1 lg:flex-none px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Lock & Save
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Present" value={stats.present} color="green" icon={CheckCircle} />
            <StatCard label="Absent" value={stats.absent} color="red" icon={XCircle} />
            <StatCard label="On Leave" value={stats.leave} color="blue" icon={Calendar} />
            <StatCard label="Half Day" value={stats.halfDay} color="amber" icon={Clock} />
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {filteredEmployees.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  No employees found for this selection.
                </div>
              ) : (
                filteredEmployees.map((employee, idx) => {
                  const empId = employee['ID'] || employee.employeeId || employee['Employee ID'];
                const empName = employee.Employee || `${employee.firstName} ${employee.lastName}`;
                const clientSite = employee['Assigned Client'];
                const currentStatus = attendance[empId];

                return (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm border border-white shadow-sm overflow-hidden shrink-0">
                          {employee['Photo URL'] ? <img src={employee['Photo URL']} alt="" className="w-full h-full object-cover" /> : (empName || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{empName}</p>
                          <p className="text-xs font-medium text-slate-500">Site: <span className="text-blue-600">{clientSite}</span></p>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap gap-2">
                        <AttendanceButton
                          label="Present"
                          active={currentStatus === 'Present'}
                          color="green"
                          disabled={isLocked}
                          onClick={() => handleMarkAttendance(empId, 'Present')}
                        />
                        <AttendanceButton
                          label="Absent"
                          active={currentStatus === 'Absent'}
                          color="red"
                          disabled={isLocked}
                          onClick={() => handleMarkAttendance(empId, 'Absent')}
                        />
                        <AttendanceButton
                          label="Leave"
                          active={currentStatus === 'On Leave'}
                          color="blue"
                          disabled={isLocked}
                          onClick={() => handleMarkAttendance(empId, 'On Leave')}
                        />
                        <AttendanceButton
                          label="Half Day"
                          active={currentStatus === 'Half Day'}
                          color="amber"
                          disabled={isLocked}
                          onClick={() => handleMarkAttendance(empId, 'Half Day')}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
              )}
            </div>
          </div>
        </>
      )}

      {viewMode === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-slate-700">Select Month:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700 bg-white"
              />
            </div>
            <ExportMenu data={monthlySummary} filename={`Attendance_Summary_${selectedMonth}.csv`} />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Client Site</th>
                  <th className="px-6 py-4 text-center">Present</th>
                  <th className="px-6 py-4 text-center">Absent</th>
                  <th className="px-6 py-4 text-center">Leave</th>
                  <th className="px-6 py-4 text-center">Half Day</th>
                  <th className="px-6 py-4 text-center text-blue-600 font-black">Payable Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlySummary.map((summary, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{summary['Employee Name']}</div>
                      <div className="text-xs text-slate-500">{summary['Employee ID']}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{summary['Client Site']}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{summary['Total Present']}</td>
                    <td className="px-6 py-4 text-center font-bold text-red-600">{summary['Total Absent']}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">{summary['Total Leaves']}</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">{summary['Total Half Days']}</td>
                    <td className="px-6 py-4 text-center font-black text-blue-700 bg-blue-50">{summary['Total Payable Days']}</td>
                  </tr>
                ))}
                {monthlySummary.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      No deployed employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} flex items-center justify-between`}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className="opacity-80">
        <Icon size={28} />
      </div>
    </div>
  );
}

function AttendanceButton({ label, active, color, disabled, onClick }) {
  const colors = {
    green: active ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-slate-50 text-slate-500 hover:bg-green-50 hover:text-green-600 border border-slate-200',
    red: active ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-600 border border-slate-200',
    blue: active ? 'bg-blue-500 text-white shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-200',
    amber: active ? 'bg-amber-500 text-white shadow-md shadow-amber-200' : 'bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-slate-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all flex-1 sm:flex-none ${colors[color]} ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-slate-50 hover:text-slate-500' : ''}`}
    >
      {label}
    </button>
  );
}
