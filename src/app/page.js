"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, Send } from 'lucide-react';
import axios from 'axios';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start with false for security
  const [data, setData] = useState({
    dashboard: null,
    workforce: [],
    partners: [],
    payroll: [],
    finance: [],
    compliance: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  // Map application tabs to actual Google Sheets names
  const sheetMapping = {
    dashboard: 'Dashboard',
    workforce: 'Employees',
    partners: 'Clients',
    payroll: 'Payroll',
    finance: 'Finance',
    compliance: 'Compliance'
  };

  const fetchData = useCallback(async (tab) => {
    if (tab === 'ai') return;
    setIsLoading(true);
    
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const sheetName = sheetMapping[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
        const response = await axios.get(`/api/gsheets?sheet=${sheetName}`);
        setData(prev => ({ ...prev, [tab]: response.data }));
        setIsLoading(false);
        return; // Success, exit function
      } catch (error) {
        console.error(`Error fetching ${tab} data (attempt ${retries + 1}/${maxRetries}):`, error);
        
        retries++;
        
        if (retries >= maxRetries) {
          // Final attempt failed
          setIsLoading(false);
          
          if (error.response?.data?.code === 'ENOTFOUND') {
            // Network error - show user-friendly message
            console.error('Network connectivity issue. Data will retry automatically.');
          } else if (error.response?.status === 500) {
            console.error('API Error details:', error.response?.data);
          }
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
    }
  }, []);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleSync = () => {
    fetchData(activeTab);
  };

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => setIsAuthenticated(false)}
        onSync={handleSync}
      />
      
      <main className="flex-1 ml-64 p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto"
          >
            {isLoading && (
              <div className="fixed top-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-600 animate-pulse">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                Updating from Cloud...
              </div>
            )}

            {activeTab === 'dashboard' && <DashboardView data={data.dashboard} />}
            {activeTab === 'workforce' && <TableView title="Workforce" subtitle="Manage employees and site assignments" data={data.workforce} columns={['ID', 'Employee', 'Role', 'Status']} />}
            {activeTab === 'partners' && <TableView title="Partners" subtitle="Active client sites and service partners" data={data.partners} columns={['Site ID', 'Partner Name', 'Location', 'Headcount']} />}
            {activeTab === 'payroll' && <TableView title="Payroll" subtitle="Salary processing and disbursement status" data={data.payroll} columns={['Month', 'Total Payout', 'Pending', 'Status']} />}
            {activeTab === 'finance' && <TableView title="Finance" subtitle="Revenue, expenses and profit tracking" data={data.finance} columns={['Category', 'Amount', 'Date', 'Type']} />}
            {activeTab === 'compliance' && <TableView title="Compliance" subtitle="Statutory filings and regulatory status" data={data.compliance} columns={['Requirement', 'Deadline', 'Status', 'Doc Link']} />}
            {activeTab === 'ai' && <AiAssistantView dataContext={data} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function DashboardView({ data }) {
  // Use mock if data is empty for visual demonstration
  const stats = data && data.length > 0 ? data[0] : {
    staff: "124",
    deployed: "98",
    clients: "12",
    payroll: "₹1.2M"
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Command Center</h1>
        <p className="text-slate-500 mt-2 text-lg">Real-time operational overview for Vimanasa Nexus</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Staff" value={stats.staff || stats.Staff || "0"} trend="+5%" icon="users" />
        <StatsCard label="Deployed" value={stats.deployed || stats.Deployed || "0"} trend="82%" icon="target" />
        <StatsCard label="Active Clients" value={stats.clients || stats.Clients || "0"} icon="briefcase" />
        <StatsCard label="Monthly Payroll" value={stats.payroll || stats.Payroll || "₹0"} icon="credit-card" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-xl text-slate-800">Deployment Distribution</h3>
            <button className="text-sm text-blue-600 font-semibold hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">View All Sites</button>
          </div>
          <div className="h-80 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 group hover:border-blue-200 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="text-blue-500" size={32} />
              </div>
              <p className="text-slate-400 font-medium tracking-wide uppercase text-xs">Dynamic Chart Loading...</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
          <h3 className="font-bold text-xl text-slate-800 mb-6">Live Logs</h3>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex gap-4 items-start p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {i}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">New Onboarding</p>
                  <p className="text-xs text-slate-500 mt-0.5">EMP_ID: {2000 + i} assigned to Site B</p>
                  <p className="text-[10px] text-blue-500 font-bold mt-1 uppercase tracking-widest">Just Now</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, trend, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
          <Shield size={16} />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-3xl font-black text-slate-900">{value}</h4>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight size={12} />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function TableView({ title, subtitle, data, columns }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data ? data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-95">
            <Plus size={20} /> Add Entry
          </button>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            <Download size={20} />
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search in ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80">
                {columns.map(col => (
                  <th key={col} className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{col}</th>
                ))}
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                  {columns.map(col => (
                    <td key={col} className="px-8 py-6">
                      {col.toLowerCase().includes('status') ? (
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                          String(row[col]).toLowerCase().includes('active') || String(row[col]).toLowerCase().includes('paid') || String(row[col]).toLowerCase().includes('success')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {row[col] || 'N/A'}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-700">{row[col] || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-8 py-6">
                    <button className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-8 py-20 text-center text-slate-400 italic">
                    {data ? "No records found matching your search." : "Loading entries from Google Sheets..."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AiAssistantView({ dataContext }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Vimanasa AI Assistant. I have access to your Workforce, Payroll, and Finance data. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/ai', {
        prompt: input,
        context: dataContext
      });
      
      if (response.data.error) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${response.data.error}. Please check your AI configuration.` 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.text }]);
      }
    } catch (error) {
      console.error('AI Assistant Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while processing your request. Please ensure your Gemini API key is configured correctly." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in duration-500">
      <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nexus AI</h2>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Enterprise Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-6 rounded-3xl font-medium text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 rounded-br-none' 
                : 'bg-slate-50 text-slate-800 shadow-sm rounded-bl-none border border-slate-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-2">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-slate-50/30 border-t border-slate-100">
        <div className="relative flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Ask about payroll trends, staff distribution, or compliance alerts..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-8 py-5 rounded-[2rem] border-none shadow-xl focus:ring-4 focus:ring-blue-100 outline-none text-slate-700 font-bold"
          />
          <button 
            onClick={handleSend}
            className="p-5 bg-blue-600 text-white rounded-[2rem] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-90"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check credentials against environment variables
    if (username === process.env.NEXT_PUBLIC_ADMIN_USER && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-md text-center space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-200">
          <Shield size={40} />
        </div>
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Nexus Portal</h2>
          <p className="text-slate-400 mt-3 font-bold uppercase tracking-widest text-xs">Secure Access Command</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="User ID" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-slate-700"
          />
          <input 
            type="password" 
            placeholder="Access Key" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-8 py-5 rounded-3xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all outline-none font-bold text-slate-700"
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Authenticating...' : 'Initialize Sync'}
        </button>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">© 2026 Vimanasa Services LLP</p>
      </form>
    </div>
  );
}

