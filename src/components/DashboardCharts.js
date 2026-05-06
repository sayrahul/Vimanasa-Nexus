"use client";
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardCharts({ data }) {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  
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
    { name: 'Deployed', value: data?.workforce?.filter(e => e.Status === 'Active' || e['Employee Status'] === 'Active').length || 98 },
    { name: 'On Leave', value: data?.workforce?.filter(e => e.Status === 'On Leave' || e['Employee Status'] === 'On Leave').length || 12 },
    { name: 'Inactive', value: data?.workforce?.filter(e => e.Status === 'Inactive' || e['Employee Status'] === 'Inactive').length || 14 },
  ];

  const revenueExpenseData = [
    { month: 'Jan', revenue: 2500000, expense: 1800000, profit: 700000 },
    { month: 'Feb', revenue: 2600000, expense: 1850000, profit: 750000 },
    { month: 'Mar', revenue: 2450000, expense: 1780000, profit: 670000 },
    { month: 'Apr', revenue: 2700000, expense: 1900000, profit: 800000 },
    { month: 'May', revenue: 2800000, expense: 1950000, profit: 850000 },
  ];

  const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200">
          <p className="font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('amount') || entry.name.includes('revenue') || entry.name.includes('expense') || entry.name.includes('profit')
                ? `₹${(entry.value / 100000).toFixed(2)}L`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" size={28} />
            Analytics & Insights
          </h2>
          <p className="text-slate-500 text-sm mt-1">Visual representation of key metrics</p>
        </div>
        <div className="flex gap-2">
          {['1m', '3m', '6m', '1y'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {period.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payroll Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Monthly Payroll Trend</h3>
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
              <TrendingUp size={16} />
              <span>+12.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyPayrollData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#colorAmount)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Headcount Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Headcount Growth</h3>
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
              <TrendingUp size={16} />
              <span>+5.1%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={headcountData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Deployment Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4">Deployment Distribution</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={deploymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={5}
                >
                  {deploymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {deploymentData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{entry.name}</p>
                    <p className="text-xs text-slate-500">{entry.value} employees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Revenue vs Expense */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">Revenue vs Expense</h3>
            <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
              <TrendingUp size={16} />
              <span>Profit +21%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px', fontWeight: 600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
