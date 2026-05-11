"use client";

import React, { useState, useEffect } from 'react';
import { authAPI } from '@/lib/apiClient';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('vimanasa_remember_username');
    const savedRememberMe = localStorage.getItem('vimanasa_remember_me') === 'true';
    
    if (savedRememberMe && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(username.trim(), password.trim());

      if (response.success) {
        if (rememberMe) {
          localStorage.setItem('vimanasa_remember_username', username.trim());
          localStorage.setItem('vimanasa_remember_me', 'true');
          localStorage.setItem('vimanasa_login_timestamp', Date.now().toString());
        } else {
          localStorage.removeItem('vimanasa_remember_username');
          localStorage.removeItem('vimanasa_remember_me');
          localStorage.removeItem('vimanasa_login_timestamp');
        }
        onLogin();
      } else {
        setError(response.message || 'Invalid username or password. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-6 antialiased">
      <div className="w-full max-w-[440px] space-y-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
             <div className="w-20 h-20 bg-black rounded-[24px] flex items-center justify-center shadow-2xl group transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                <img src="/vimanasa-logo.png" alt="Vimanasa" className="h-10 w-auto invert" />
             </div>
          </div>
          <div className="space-y-2">
             <h1 className="text-4xl font-black text-black tracking-[-0.06em]">Nexus.</h1>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Enterprise Access Protocol</p>
          </div>
        </div>

        <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-rose-50 p-5 rounded-2xl animate-in slide-in-from-top-2 duration-300 border border-rose-100 flex items-center gap-3">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                 <p className="text-[11px] font-black text-rose-800 uppercase tracking-widest">{error}</p>
              </div>
            )}

            <div className="space-y-6">
               <div className="space-y-2">
                 <label htmlFor="username" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity</label>
                 <input
                   id="username"
                   type="text"
                   value={username}
                   onChange={(e) => setUsername(e.target.value)}
                   required
                   className="w-full px-6 py-5 bg-[#F9F9F9] border border-slate-50 rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-black font-bold text-sm placeholder:text-slate-300"
                   placeholder="Username or ID"
                 />
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-center ml-1">
                    <label htmlFor="password" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secret</label>
                    <button
                      type="button"
                      className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-black transition-colors"
                      onClick={() => alert('Contact Systems Admin: systems@vimanasa.com')}
                    >
                      Forgotten?
                    </button>
                 </div>
                 <div className="relative">
                   <input
                     id="password"
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="w-full px-6 py-5 bg-[#F9F9F9] border border-slate-50 rounded-2xl focus:bg-white focus:border-black transition-all outline-none text-black font-bold text-sm placeholder:text-slate-300"
                     placeholder="••••••••"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-black transition-colors"
                   >
                     {showPassword ? (
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                     ) : (
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                     )}
                   </button>
                 </div>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                   <input
                     type="checkbox"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                     className="peer sr-only"
                   />
                   <div className="w-6 h-6 bg-[#F9F9F9] border border-slate-200 rounded-lg peer-checked:bg-black peer-checked:border-black transition-all duration-200" />
                   <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={4}><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest select-none">Persistent Session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-black text-[11px] uppercase tracking-[0.4em] py-6 rounded-2xl shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {isLoading ? "Authenticating..." : "Authorize Portal Access"}
            </button>
          </form>
        </div>

        <div className="text-center">
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
              Vimanasa Global Nexus Registry • 2026
           </p>
        </div>
      </div>
    </div>
  );
}
