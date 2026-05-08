'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [clientEnv, setClientEnv] = useState({});
  const [serverEnv, setServerEnv] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check client-side variables
    setClientEnv({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length + ')' : 'NOT FOUND',
      NEXT_PUBLIC_ADMIN_USER: process.env.NEXT_PUBLIC_ADMIN_USER || 'NOT FOUND',
    });

    // Check server-side variables via API
    fetch('/api/check-env')
      .then(res => res.json())
      .then(data => {
        setServerEnv(data);
        setLoading(false);
      })
      .catch(err => {
        setServerEnv({ error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🛡️ Vimanasa Nexus Debugger</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#0066cc border-bottom: 2px solid #0066cc' }}>🌐 Client-Side Variables</h2>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>These must be available in the browser bundle.</p>
          <pre style={{ backgroundColor: '#eee', padding: '1rem', borderRadius: '0.5rem' }}>
            {JSON.stringify(clientEnv, null, 2)}
          </pre>
          <div style={{ marginTop: '1rem' }}>
            <strong>Status:</strong> {clientEnv.NEXT_PUBLIC_SUPABASE_URL !== 'NOT FOUND' ? '✅ OK' : '❌ FAILED'}
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#cc0066', borderBottom: '2px solid #cc0066' }}>🖥️ Server-Side (API) Status</h2>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>These are checked via the /api/check-env endpoint.</p>
          {loading ? (
            <p>Loading server diagnostics...</p>
          ) : (
            <>
              <pre style={{ backgroundColor: '#eee', padding: '1rem', borderRadius: '0.5rem' }}>
                {JSON.stringify(serverEnv, null, 2)}
              </pre>
              <div style={{ marginTop: '1rem' }}>
                <strong>Status:</strong> {serverEnv?.status === 'OK' ? '✅ OK' : '❌ FAILED'}
              </div>
            </>
          )}
        </section>
      </div>

      <section style={{ marginTop: '2rem', backgroundColor: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h2 style={{ borderBottom: '2px solid #333' }}>📋 Action Plan</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li>If <strong>Client-Side</strong> shows "NOT FOUND": You must redeploy on Vercel after adding variables.</li>
          <li>If <strong>Server-Side</strong> shows "NOT SET": Check the variable names in Vercel dashboard for typos.</li>
          <li>If both are ✅ OK but data still doesn't load: Check Supabase RLS (Row Level Security) settings.</li>
        </ul>
        <button 
          onClick={() => window.location.reload()}
          style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
        >
          🔄 Refresh Test
        </button>
      </section>
    </div>
  );
}
