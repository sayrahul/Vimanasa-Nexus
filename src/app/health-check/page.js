"use client";
import React, { useState, useEffect } from 'react';
import { apiClient, authAPI } from '@/lib/apiClient';

export default function GlobalHealthCheck() {
  const [results, setResults] = useState({});
  const [authStatus, setAuthStatus] = useState('Checking...');
  const [isScanning, setIsScanning] = useState(false);

  const tables = [
    'workforce', 'clients', 'partners', 'job_openings', 'candidates', 
    'payroll', 'finance', 'compliance', 'attendance', 'leave', 'expenses'
  ];

  const runGlobalScan = async () => {
    setIsScanning(true);
    setAuthStatus('Checking Authentication...');
    
    // 1. Check Auth
    try {
      const auth = await authAPI.verify();
      setAuthStatus(auth.success ? '✅ Authenticated' : '❌ Unauthorized (Login Required)');
    } catch (e) {
      setAuthStatus('❌ Auth API Error');
    }

    // 2. Scan Tables
    const scanResults = {};
    for (const table of tables) {
      scanResults[table] = { status: '⌛ Scanning...', count: 0 };
      setResults({ ...scanResults });
      
      try {
        const res = await apiClient.get(`/api/database?table=${table}&timestamp=${Date.now()}`);
        const data = res.data || res || [];
        scanResults[table] = { 
          status: '✅ Success', 
          count: Array.isArray(data) ? data.length : (data.success ? 'OK' : 0) 
        };
      } catch (e) {
        scanResults[table] = { status: '❌ Failed', count: 0, error: e.message };
      }
      setResults({ ...scanResults });
    }
    setIsScanning(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nexus Global Health Check</h1>
          <p className="text-slate-500 mt-2 font-medium italic">Diagnostic tool for Live Production Environment</p>
        </div>
        <button 
          onClick={runGlobalScan}
          disabled={isScanning}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-3"
        >
          {isScanning ? 'SCANNING SYSTEM...' : 'START FULL SYSTEM SCAN 🚀'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auth Status Card */}
        <div className="md:col-span-3 bg-white p-6 rounded-[2rem] border-2 border-indigo-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Authentication Layer</h3>
            <p className={`text-xl font-bold ${authStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>{authStatus}</p>
          </div>
          <div className="text-right text-xs text-slate-400 font-medium">
            Verifies if JWT_SECRET is correctly configured on server
          </div>
        </div>

        {/* Table Cards */}
        {tables.map(table => (
          <div key={table} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-black text-slate-900 capitalize text-lg">{table.replace('_', ' ')}</h3>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                results[table]?.status?.includes('✅') ? 'bg-green-100 text-green-700' : 
                results[table]?.status?.includes('❌') ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {results[table]?.status || 'Ready'}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-900">{results[table]?.count || 0}</span>
              <span className="text-slate-400 font-bold mb-1">Records</span>
            </div>
            {results[table]?.error && (
              <p className="mt-4 text-[10px] text-red-500 font-mono bg-red-50 p-2 rounded-lg break-all">
                Error: {results[table].error}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl border-t-4 border-indigo-500">
        <h3 className="text-2xl font-black mb-6">💡 Live Troubleshooting Guide:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300">
          <div className="space-y-4">
            <p className="font-bold text-white text-lg">1. If Auth is ❌ and Tables are 0:</p>
            <p className="text-sm">Your login session is invalid. Logout and login again. If it still fails, your <code className="bg-slate-800 px-1 rounded text-indigo-400">JWT_SECRET</code> environment variable is missing on Cloudflare/Live platform.</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-white text-lg">2. If Auth is ✅ but Tables are 0:</p>
            <p className="text-sm">The connection to Supabase is working, but the tables might be empty or the <code className="bg-slate-800 px-1 rounded text-indigo-400">SUPABASE_SERVICE_ROLE_KEY</code> is incorrect for this project.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
