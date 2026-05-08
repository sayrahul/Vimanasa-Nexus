"use client";
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export default function RecruitmentDebug() {
  const [status, setStatus] = useState('Initializing...');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState(null);

  const runDiagnostic = async () => {
    setStatus('📡 Fetching data directly from API...');
    try {
      // Fetch Job Openings
      const jobRes = await apiClient.get('/api/database?table=job_openings&timestamp=' + Date.now());
      console.log('Jobs API Response:', jobRes);
      
      // Fetch Candidates
      const candRes = await apiClient.get('/api/database?table=candidates&timestamp=' + Date.now());
      console.log('Candidates API Response:', candRes);

      setJobs(jobRes.data || jobRes || []);
      setCandidates(candRes.data || candRes || []);
      setStatus('✅ Diagnostic Complete!');
    } catch (err) {
      console.error('Diagnostic Error:', err);
      setError(err.message);
      setStatus('❌ Diagnostic Failed!');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-black mb-6">🔍 Recruitment Diagnostic Hub</h1>
      
      <div className="bg-slate-100 p-6 rounded-2xl mb-8 border-2 border-slate-200">
        <p className="font-bold text-slate-700 mb-4">Status: {status}</p>
        <button 
          onClick={runDiagnostic}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg"
        >
          RUN DEEP SCAN 🚀
        </button>
        {error && <p className="mt-4 text-red-600 font-bold">Error: {error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            📂 Job Openings ({jobs.length})
          </h2>
          <div className="space-y-3">
            {jobs.length > 0 ? jobs.map((job, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                <p className="font-bold">{job['Job Title'] || job.title}</p>
                <p className="text-xs text-slate-500">{job.location} • {job.status}</p>
              </div>
            )) : <p className="text-slate-400 italic">No jobs found in API response</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2">
            👥 Candidates ({candidates.length})
          </h2>
          <div className="space-y-3">
            {candidates.length > 0 ? candidates.map((cand, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl text-sm border border-slate-100">
                <p className="font-bold">{cand['Full Name'] || cand.full_name}</p>
                <p className="text-xs text-slate-500">{cand['Job Title'] || cand.job_title} • {cand.status}</p>
              </div>
            )) : <p className="text-slate-400 italic">No candidates found in API response</p>}
          </div>
        </div>
      </div>

      <div className="mt-12 bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl">
        <h3 className="text-lg font-black mb-4">💡 Diagnostic Instructions:</h3>
        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
          <li>If the counts above are **greater than 0**, the issue is in the Dashboard UI.</li>
          <li>If the counts are **0**, the issue is in the Database API or Authentication.</li>
          <li>Check your browser console (F12) for the raw JSON objects.</li>
        </ul>
      </div>
    </div>
  );
}
