"use client"; // Premium Responsive Attendance
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Users, Download, Lock, Unlock, CheckSquare, ChevronDown, Filter, LayoutGrid, List, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ExportMenu from '@/components/ExportMenu';
import { motion, AnimatePresence } from 'framer-motion';

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
      if (!newAttendance[empId]) {
        newAttendance[empId] = 'Present';
      }
    });
    setAttendance(newAttendance);
    toast.info(`All unmarked ${selectedClientFilter !== 'All' ? 'filtered ' : ''}employees set to Present.`);
  };

  const handleSaveAttendance = async () => {
    if (isLocked) return;

    const unmarked = filteredEmployees.filter(emp => !attendance[emp['ID'] || emp.employeeId || emp['Employee ID']]);
    if (unmarked.length > 0) {
      toast.error(`Please mark attendance for all employees. ${unmarked.length} remaining.`);
      return;
    }

    const attendanceRecords = Object.entries(attendance)
      .filter(([empId]) => filteredEmployees.some(e => (e['ID'] || e.employeeId || e['Employee ID']) === empId))
      .map(([empId, status]) => {
      const employee = employees.find(e => e['ID'] === empId || e['Employee ID'] === empId || e.employeeId === empId);
      return {
        Date: selectedDate,
        'Employee ID': empId,
        employee_id: employee?.id,
        'Employee Name': employee?.Employee || 'Unknown',
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
    if (password === "admin") {
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
                           empRecords.filter(r => r.Status === 'On Leave').length
    };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Premium Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Attendance Engine</h2>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            Tracking {deployedEmployees.length} deployed staff members
          </p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setViewMode('mark')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              viewMode === 'mark' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid size={18} /> Daily Mark
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
              viewMode === 'report' ? 'bg-white text-blue-600 shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <List size={18} /> Monthly Report
          </button>
        </div>
      </div>

      {viewMode === 'mark' && (
        <div className="space-y-6">
          {/* Enhanced Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Filter Client Site</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <select
                  value={selectedClientFilter}
                  onChange={(e) => setSelectedClientFilter(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-slate-50/50 appearance-none"
                >
                  <option value="All">All Active Sites</option>
                  {uniqueClients.map((client, idx) => (
                    <option key={idx} value={client}>{client}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
              {isLocked ? (
                <div className="flex items-center justify-between gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-2xl font-black border border-amber-200 text-xs sm:text-sm">
                  <div className="flex items-center gap-2"><Lock size={16} /> Locked</div>
                  <button onClick={unlockAttendance} className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-1 rounded-lg uppercase tracking-tighter">Unlock</button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-2xl font-black border border-green-200 text-xs sm:text-sm">
                  <Unlock size={16} /> Mark Open
                </div>
              )}
            </div>

            <div className="lg:col-span-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleMarkAllPresent}
                disabled={isLocked}
                className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckSquare size={16} className="text-green-600" /> Auto Present
              </button>
              
              <button
                onClick={handleSaveAttendance}
                disabled={isLocked || Object.keys(attendance).length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-black text-xs hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
              >
                Lock & Save
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatTile label="Present" value={stats.present} color="green" icon={CheckCircle} />
            <StatTile label="Absent" value={stats.absent} color="red" icon={XCircle} />
            <StatTile label="On Leave" value={stats.leave} color="blue" icon={Calendar} />
            <StatTile label="Half Day" value={stats.halfDay} color="amber" icon={Clock} />
          </div>

          {/* Employee Attendance Grid */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="max-h-[700px] overflow-y-auto custom-scrollbar">
              {filteredEmployees.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-bold">
                  <Users size={64} className="mx-auto mb-4 opacity-10" />
                  No employees deployed at this site.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee, idx) => {
                    const empId = employee['ID'] || employee.employeeId || employee['Employee ID'];
                    const empName = employee.Employee || 'Unknown Employee';
                    const clientSite = employee['Assigned Client'];
                    const currentStatus = attendance[empId];

                    return (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={idx} 
                        className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          {/* Employee Info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-xl border-2 border-white shadow-sm shrink-0">
                              {employee['Photo URL'] ? <img src={employee['Photo URL']} alt="" className="w-full h-full object-cover rounded-2xl" /> : (empName || '?').charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-slate-900 text-base sm:text-lg truncate">{empName}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">ID: {empId}</span>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1">
                                  <Building2 size={10} /> {clientSite}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Attendance Controls */}
                          <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-2 sm:gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
                            <AttendanceOption
                              label="Present"
                              active={currentStatus === 'Present'}
                              color="green"
                              disabled={isLocked}
                              onClick={() => handleMarkAttendance(empId, 'Present')}
                            />
                            <AttendanceOption
                              label="Absent"
                              active={currentStatus === 'Absent'}
                              color="red"
                              disabled={isLocked}
                              onClick={() => handleMarkAttendance(empId, 'Absent')}
                            />
                            <AttendanceOption
                              label="Leave"
                              active={currentStatus === 'On Leave'}
                              color="blue"
                              disabled={isLocked}
                              onClick={() => handleMarkAttendance(empId, 'On Leave')}
                            />
                            <AttendanceOption
                              label="Half Day"
                              active={currentStatus === 'Half Day'}
                              color="amber"
                              disabled={isLocked}
                              onClick={() => handleMarkAttendance(empId, 'Half Day')}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'report' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Month</label>
              <div className="relative w-full sm:w-auto">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full sm:w-auto pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-slate-700 bg-white"
                />
              </div>
            </div>
            <ExportMenu data={monthlySummary} filename={`Nexus_Attendance_${selectedMonth}.csv`} />
          </div>
          
          {/* List View for Mobile & Desktop */}
          <div className="divide-y divide-slate-100">
            {monthlySummary.length === 0 ? (
              <div className="p-20 text-center text-slate-400 font-bold">
                No attendance data for this month.
              </div>
            ) : (
              monthlySummary.map((summary, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 border border-slate-200 shrink-0">
                        {summary['Employee Name'].charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-slate-900 text-base">{summary['Employee Name']}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold uppercase tracking-tighter">
                          <span>{summary['Employee ID']}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-blue-600">{summary['Client Site']}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <SummaryStat label="P" value={summary['Total Present']} color="green" />
                      <SummaryStat label="A" value={summary['Total Absent']} color="red" />
                      <SummaryStat label="L" value={summary['Total Leaves']} color="blue" />
                      <SummaryStat label="H" value={summary['Total Half Days']} color="amber" />
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-center shadow-lg shadow-blue-100 flex flex-col items-center justify-center min-w-[100px]">
                        <div className="text-[8px] font-black uppercase opacity-70 tracking-widest">Payable Days</div>
                        <div className="text-xl font-black leading-none mt-1">{summary['Total Payable Days']}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border ${colors[color]} flex items-center justify-between shadow-sm relative overflow-hidden group`}>
      <div className="relative z-10">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-3xl sm:text-4xl font-black">{value}</p>
      </div>
      <Icon size={48} className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500" />
    </div>
  );
}

function AttendanceOption({ label, active, color, disabled, onClick }) {
  const colors = {
    green: active ? 'bg-green-600 text-white shadow-xl shadow-green-100 border-green-600' : 'bg-white text-slate-500 hover:bg-green-50 hover:text-green-600 border-slate-200',
    red: active ? 'bg-red-600 text-white shadow-xl shadow-red-100 border-red-600' : 'bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 border-slate-200',
    blue: active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 border-blue-600' : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600 border-slate-200',
    amber: active ? 'bg-amber-600 text-white shadow-xl shadow-amber-100 border-amber-600' : 'bg-white text-slate-500 hover:bg-amber-50 hover:text-amber-600 border-slate-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all border shrink-0 ${colors[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
    >
      {label}
    </button>
  );
}

function SummaryStat({ label, value, color }) {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${colors[color]}`}>
      <div className="text-[8px] font-black uppercase opacity-60 leading-none">{label}</div>
      <div className="text-base font-black leading-none mt-1">{value}</div>
    </div>
  );
}
