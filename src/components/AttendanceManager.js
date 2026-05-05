"use client";
import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Users, Download } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AttendanceManager({ employees, onSave }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [viewMode, setViewMode] = useState('mark'); // 'mark' or 'report'

  const handleMarkAttendance = (employeeId, status) => {
    setAttendance(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    const attendanceRecords = Object.entries(attendance).map(([empId, status]) => {
      const employee = employees.find(e => e['Employee ID'] === empId || e.employeeId === empId);
      return {
        Date: selectedDate,
        'Employee ID': empId,
        'Employee Name': employee?.Employee || employee?.firstName + ' ' + employee?.lastName || 'Unknown',
        Status: status,
        'Marked By': 'Admin',
        'Marked At': new Date().toLocaleString()
      };
    });

    try {
      // Save to Google Sheets
      for (const record of attendanceRecords) {
        await onSave(record);
      }
      toast.success(`Attendance marked for ${attendanceRecords.length} employees`);
      setAttendance({});
    } catch (error) {
      toast.error('Failed to save attendance');
      console.error(error);
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(s => s === 'Present').length;
    const absent = Object.values(attendance).filter(s => s === 'Absent').length;
    const leave = Object.values(attendance).filter(s => s === 'On Leave').length;
    const halfDay = Object.values(attendance).filter(s => s === 'Half Day').length;
    
    return { present, absent, leave, halfDay, total: employees?.length || 0 };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Attendance Management</h2>
          <p className="text-slate-500 mt-1">Mark daily attendance for all employees</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('mark')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              viewMode === 'mark'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setViewMode('report')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              viewMode === 'report'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            View Reports
          </button>
        </div>
      </div>

      {viewMode === 'mark' && (
        <>
          {/* Date Selector & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Calendar className="inline mr-2" size={16} />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <StatCard label="Present" value={stats.present} color="green" icon={CheckCircle} />
            <StatCard label="Absent" value={stats.absent} color="red" icon={XCircle} />
            <StatCard label="On Leave" value={stats.leave} color="blue" icon={Calendar} />
            <StatCard label="Half Day" value={stats.halfDay} color="orange" icon={Clock} />
          </div>

          {/* Employee List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">
                  <Users className="inline mr-2" size={20} />
                  Mark Attendance for {selectedDate}
                </h3>
                <button
                  onClick={handleSaveAttendance}
                  disabled={Object.keys(attendance).length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Attendance
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {employees?.map((employee, idx) => {
                const empId = employee['Employee ID'] || employee.employeeId;
                const empName = employee.Employee || `${employee.firstName} ${employee.lastName}`;
                const empRole = employee.Role || employee.designation;
                const currentStatus = attendance[empId];

                return (
                  <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {empName?.charAt(0) || 'E'}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{empName}</p>
                          <p className="text-sm text-slate-500">{empId} • {empRole}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <AttendanceButton
                          label="Present"
                          active={currentStatus === 'Present'}
                          color="green"
                          onClick={() => handleMarkAttendance(empId, 'Present')}
                        />
                        <AttendanceButton
                          label="Absent"
                          active={currentStatus === 'Absent'}
                          color="red"
                          onClick={() => handleMarkAttendance(empId, 'Absent')}
                        />
                        <AttendanceButton
                          label="Leave"
                          active={currentStatus === 'On Leave'}
                          color="blue"
                          onClick={() => handleMarkAttendance(empId, 'On Leave')}
                        />
                        <AttendanceButton
                          label="Half Day"
                          active={currentStatus === 'Half Day'}
                          color="orange"
                          onClick={() => handleMarkAttendance(empId, 'Half Day')}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {viewMode === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="text-center py-12">
            <Download size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Attendance Reports</h3>
            <p className="text-slate-500 mb-6">Generate monthly attendance reports</p>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all">
              Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold opacity-80">{label}</span>
        <Icon size={18} />
      </div>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function AttendanceButton({ label, active, color, onClick }) {
  const colors = {
    green: active ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600 hover:bg-green-100',
    red: active ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100',
    blue: active ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    orange: active ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${colors[color]}`}
    >
      {label}
    </button>
  );
}
