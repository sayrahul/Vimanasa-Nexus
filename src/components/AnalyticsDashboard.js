/**
 * Analytics Dashboard Component
 * Displays analytics data and insights
 */

import React, { useState, useEffect } from 'react';
import { BarChart, TrendingUp, Users, Activity, AlertCircle, Download } from 'lucide-react';
import { getAnalyticsSummary, exportAnalytics, clearAnalytics } from '@/lib/analytics';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null);
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = () => {
    setLoading(true);
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    const data = getAnalyticsSummary(startDate, endDate);
    setSummary(data);
    setLoading(false);
  };

  const handleExport = (format) => {
    const data = exportAnalytics(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all analytics data?')) {
      clearAnalytics();
      loadAnalytics();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-slate-500 mt-1">Track user behavior and app performance</p>
        </div>

        <div className="flex gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Export Button */}
          <div className="relative group">
            <button className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('json')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 rounded-t-xl"
              >
                Export as JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left hover:bg-slate-50 rounded-b-xl"
              >
                Export as CSV
              </button>
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Events"
          value={summary.totalEvents}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Page Views"
          value={summary.pageViews}
          icon={BarChart}
          color="green"
        />
        <StatCard
          label="Unique Users"
          value={summary.uniqueUsers}
          icon={Users}
          color="purple"
        />
        <StatCard
          label="Errors"
          value={summary.errors}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {summary.topPages.map((page, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{page.page}</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(page.count / summary.topPages[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{page.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Top Actions</h3>
          <div className="space-y-3">
            {summary.topActions.map((action, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{action.action}</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(action.count / summary.topActions[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{action.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Types */}
        {summary.errorTypes.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Error Types</h3>
            <div className="space-y-3">
              {summary.errorTypes.map((error, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{error.type}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${(error.count / summary.errorTypes[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{error.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Session Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Unique Sessions</span>
              <span className="text-2xl font-bold text-slate-900">{summary.uniqueSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Unique Users</span>
              <span className="text-2xl font-bold text-slate-900">{summary.uniqueUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">User Actions</span>
              <span className="text-2xl font-bold text-slate-900">{summary.userActions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Business Events</span>
              <span className="text-2xl font-bold text-slate-900">{summary.businessEvents}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </motion.div>
  );
}
