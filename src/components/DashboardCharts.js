"use client";
import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardCharts({ data }) {
  // Prepare data for charts
  const monthlyPayrollData = [
    { month: 'Jan', amount: 1200000 },
    { month: 'Feb', amount: 1250000 },
    { month: 'Mar', amount: 1180000 },
    { month: 'Apr', amount: 1300000 },
    { month: 'May', amount: 1350000 },
  ];

  const headcountData = [
    { month: 'Jan', count: 118 },
    { month: 'Feb', count: 120 },
    { month: 'Mar', count: 122 },
    { month: 'Apr', count: 124 },
    { month: 'May', count: 124 },
  ];

  const deploymentData = [
    { name: 'Deployed', value: data?.workforce?.filter(e => e.Status === 'Active').length || 98 },
    { name: 'On Leave', value: data?.workforce?.filter(e => e.Status === 'On Leave').length || 12 },
    { name: 'Inactive', value: data?.workforce?.filter(e => e.Status === 'Inactive').length || 14 },
  ];

  const revenueExpenseData = [
    { month: 'Jan', revenue: 2500000, expense: 1800000 },
    { month: 'Feb', revenue: 2600000, expense: 1850000 },
    { month: 'Mar', revenue: 2450000, expense: 1780000 },
    { month: 'Apr', revenue: 2700000, expense: 1900000 },
    { month: 'May', revenue: 2800000, expense: 1950000 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Payroll Trend */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Monthly Payroll Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyPayrollData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Headcount Growth */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Headcount Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={headcountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
            <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Deployment Distribution */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Deployment Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={deploymentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {deploymentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Expense */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue vs Expense</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={revenueExpenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
