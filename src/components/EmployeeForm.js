import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    ID: '',
    Employee: '',
    Role: '',
    Status: 'Active',
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Employee ID *
            </label>
            <input
              type="text"
              name="ID"
              value={formData.ID}
              onChange={handleChange}
              required
              disabled={!!employee}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              placeholder="EMP001"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Employee Name *
            </label>
            <input
              type="text"
              name="Employee"
              value={formData.Employee}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Role *
            </label>
            <select
              name="Role"
              value={formData.Role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Role</option>
              <option value="Security Guard">Security Guard</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
              <option value="Team Leader">Team Leader</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Status *
            </label>
            <select
              name="Status"
              value={formData.Status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              {employee ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
