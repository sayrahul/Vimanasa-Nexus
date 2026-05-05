"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import GenericForm from '@/components/GenericForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, Send, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState({
    dashboard: null,
    workforce: [],
    partners: [],
    payroll: [],
    finance: [],
    compliance: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState(null);

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

  const handleAddNew = (tab) => {
    setFormType(tab);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item, tab) => {
    setFormType(tab);
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item, tab) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    alert('Delete functionality requires backend implementation. For now, please delete directly from Google Sheets.');
  };

  const handleSave = async (formData) => {
    try {
      const sheetName = sheetMapping[formType];
      const values = Object.values(formData);
      
      await axios.post('/api/gsheets', {
        sheet: sheetName,
        values: values
      });
      
      setShowForm(false);
      setEditingItem(null);
      setFormType(null);
      fetchData(formType);
      alert('Entry saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const getFormFields = (tab) => {
    const fieldConfigs = {
      workforce: [
        { name: 'ID', label: 'Employee ID', type: 'text', required: true, disabled: true, placeholder: 'EMP001' },
        { name: 'Employee', label: 'Employee Name', type: 'text', required: true, placeholder: 'John Doe' },
        { name: 'Role', label: 'Role', type: 'select', required: true, options: ['Security Guard', 'Supervisor', 'Manager', 'Team Leader'] },
        { name: 'Status', label: 'Status', type: 'select', required: true, options: ['Active', 'On Leave', 'Inactive'], defaultValue: 'Active' },
      ],
      partners: [
        { name: 'Site ID', label: 'Site ID', type: 'text', required: true, disabled: true, placeholder: 'SITE001' },
        { name: 'Partner Name', label: 'Partner Name', type: 'text', required: true, placeholder: 'Tech Corp India' },
        { name: 'Location', label: 'Location', type: 'text', required: true, placeholder: 'Mumbai, Maharashtra' },
        { name: 'Headcount', label: 'Headcount', type: 'number', required: true, placeholder: '25' },
      ],
      payroll: [
        { name: 'Month', label: 'Month', type: 'text', required: true, placeholder: 'January 2026' },
        { name: 'Total Payout', label: 'Total Payout', type: 'text', required: true, placeholder: '₹1,200,000' },
        { name: 'Pending', label: 'Pending Amount', type: 'text', required: true, placeholder: '₹0' },
        { name: 'Status', label: 'Status', type: 'select', required: true, options: ['Paid', 'Processing', 'Pending'], defaultValue: 'Pending' },
      ],
      finance: [
        { name: 'Category', label: 'Category', type: 'text', required: true, placeholder: 'Client Payment - Tech Corp' },
        { name: 'Amount', label: 'Amount', type: 'text', required: true, placeholder: '₹500,000' },
        { name: 'Date', label: 'Date', type: 'date', required: true },
        { name: 'Type', label: 'Type', type: 'select', required: true, options: ['Income', 'Expense'] },
      ],
      compliance: [
        { name: 'Requirement', label: 'Requirement', type: 'text', required: true, placeholder: 'PF Filing - January' },
        { name: 'Deadline', label: 'Deadline', type: 'date', required: true },
        { name: 'Status', label: 'Status', type: 'select', required: true, options: ['Completed', 'Pending', 'In Progress'], defaultValue: 'Pending' },
        { name: 'Doc Link', label: 'Document Link', type: 'url', required: false, placeholder: 'https://docs.google.com/' },
      ],
    };
    return fieldConfigs[tab] || [];
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
            {activeTab === 'workforce' && <TableView title="Workforce" subtitle="Manage employees and site assignments" data={data.workforce} columns={['ID', 'Employee', 'Role', 'Status']} onAdd={() => handleAddNew('workforce')} onEdit={(item) => handleEdit(item, 'workforce')} onDelete={(item) => handleDelete(item, 'workforce')} />}
            {activeTab === 'partners' && <TableView title="Partners" subtitle="Active client sites and service partners" data={data.partners} columns={['Site ID', 'Partner Name', 'Location', 'Headcount']} onAdd={() => handleAddNew('partners')} onEdit={(item) => handleEdit(item, 'partners')} onDelete={(item) => handleDelete(item, 'partners')} />}
            {activeTab === 'payroll' && <TableView title="Payroll" subtitle="Salary processing and disbursement status" data={data.payroll} columns={['Month', 'Total Payout', 'Pending', 'Status']} onAdd={() => handleAddNew('payroll')} onEdit={(item) => handleEdit(item, 'payroll')} onDelete={(item) => handleDelete(item, 'payroll')} />}
            {activeTab === 'finance' && <TableView title="Finance" subtitle="Revenue, expenses and profit tracking" data={data.finance} columns={['Category', 'Amount', 'Date', 'Type']} onAdd={() => handleAddNew('finance')} onEdit={(item) => handleEdit(item, 'finance')} onDelete={(item) => handleDelete(item, 'finance')} />}
            {activeTab === 'compliance' && <TableView title="Compliance" subtitle="Statutory filings and regulatory status" data={data.compliance} columns={['Requirement', 'Deadline', 'Status', 'Doc Link']} onAdd={() => handleAddNew('compliance')} onEdit={(item) => handleEdit(item, 'compliance')} onDelete={(item) => handleDelete(item, 'compliance')} />}
            {activeTab === 'ai' && <AiAssistantView dataContext={data} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Generic Form Modal */}
      {showForm && formType && (
        <GenericForm
          title={formType.charAt(0).toUpperCase() + formType.slice(1)}
          fields={getFormFields(formType)}
          data={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormType(null);
          }}
        />
      )}
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

function TableView({ title, subtitle, data, columns, onAdd, onEdit, onDelete }) {
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
          <button 
            onClick={onAdd}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
          >
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
                          String(row[col]).toLowerCase().includes('active') || String(row[col]).toLowerCase().includes('paid') || String(row[col]).toLowerCase().includes('completed')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : String(row[col]).toLowerCase().includes('progress')
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
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
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(row)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(row)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check credentials against environment variables
    if (username === process.env.NEXT_PUBLIC_ADMIN_USER && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid username or password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-center relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              {/* Logo */}
              <div className="mb-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                  <svg width="120" height="40" viewBox="0 0 1024 200" className="w-auto h-12">
                    {/* V Logo */}
                    <path d="M 20 20 L 70 180 L 90 180 L 140 20 Z" fill="#2563eb"/>
                    <path d="M 90 20 L 140 180 L 160 180 L 210 20 Z" fill="#06b6d4"/>
                    {/* VIMANASA Text */}
                    <text x="240" y="120" fontFamily="Arial, sans-serif" fontSize="80" fontWeight="bold" fill="#2563eb">VIMANASA</text>
                    <text x="240" y="180" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="normal" fill="#64748b">SERVICES LLP</text>
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Welcome Back</h1>
              <p className="text-blue-100 text-sm font-medium">Sign in to access your dashboard</p>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-bold text-slate-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <button
                type="button"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-3 group"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </>
              )}
            </button>

            {/* Demo Credentials */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center mb-2 font-medium">Demo Credentials</p>
              <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-slate-600"><span className="font-semibold">Username:</span> admin</p>
                <p className="text-xs text-slate-600"><span className="font-semibold">Password:</span> Vimanasa@2026</p>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-xs text-slate-500">
              © 2026 Vimanasa Services LLP. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Secure Enterprise Management Portal
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-xs">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
          <span className="font-medium">Secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

