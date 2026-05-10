"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import EmployeeDetailForm from '@/components/EmployeeDetailForm';
import EmployeeDeploymentForm from '@/components/EmployeeDeploymentForm';
import PartnerDetailForm from '@/components/PartnerDetailForm';
import ClientManagement from '@/components/ClientManagement';
import ClientInvoicing from '@/components/ClientInvoicing';
import GenericForm from '@/components/GenericForm';
import AttendanceManager from '@/components/AttendanceManager';
import LeaveManager from '@/components/LeaveManager';
import DeploymentManager from '@/components/DeploymentManager';
import DashboardCharts from '@/components/DashboardCharts';
import ExpenseManager from '@/components/ExpenseManager';
import PayrollEngine from '@/components/PayrollEngine';
import FinanceLedger from '@/components/FinanceLedger';
import StatutoryCompliance from '@/components/StatutoryCompliance';
import ExportMenu from '@/components/ExportMenu';
import WorkforceDirectory from '@/components/WorkforceDirectory';
import PartnerDirectory from '@/components/PartnerDirectory';
import RecruitmentManager from '@/components/RecruitmentManager';
import SharePlatform from '@/components/SharePlatform';
import UserManagement from '@/components/UserManagement';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, Send, Edit2, Trash2, FileText, TrendingUp, Users, DollarSign, AlertTriangle, Bell, CheckSquare, CheckCircle, XCircle, Briefcase, ArrowRight, UserPlus, Calendar, Building2, ShieldCheck, Receipt, UserCog } from 'lucide-react';
import { apiClient, authAPI, setToken, setUser, removeToken } from '@/lib/apiClient';
import { toast } from 'react-toastify';
import { generateSalarySlip, generateOfferLetter, generateJoiningLetter, generateExperienceLetter } from '@/lib/pdfGenerator';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

function SubNavigation({ tabs, mainTab, subTabs, onChange }) {
  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/60 shadow-sm">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(mainTab, tab.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center lg:justify-start gap-2.5 min-w-0 truncate",
                subTabs[mainTab] === tab.id 
                  ? "bg-white text-blue-600 shadow-md shadow-blue-100/50 border border-slate-200/50 scale-[1.02]" 
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
              )}
            >
              {Icon && <Icon size={14} className={cn("shrink-0", subTabs[mainTab] === tab.id ? "text-blue-500" : "text-slate-400")} />}
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('admin'); // admin, sub-admin, employee
  const [data, setData] = useState({
    dashboard: null,
    workforce: [],
    clients: [],
    partners: [],
    payroll: [],
    finance: [],
    compliance: [],
    attendance: [],
    leaveRequests: [],
    expenses: [],
    invoices: [],
    candidates: [],
    job_openings: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncInterval, setSyncInterval] = useState(null);

  const [subTabs, setSubTabs] = useState({
    clients: 'clients',
    placements: 'workforce',
    finance: 'overview',
    compliance: 'calendar',
    reports: 'compliance',
    settings: 'company'
  });

  const handleSubTabChange = (mainTab, newSubTab) => {
    setSubTabs(prev => ({ ...prev, [mainTab]: newSubTab }));
  };

  // Check for auto-login on component mount
  useEffect(() => {
    const rememberMe = localStorage.getItem('vimanasa_remember_me') === 'true';
    const loginTimestamp = localStorage.getItem('vimanasa_login_timestamp');
    const savedUsername = localStorage.getItem('vimanasa_remember_username');
    
    // Load auto-sync preference
    const savedAutoSync = localStorage.getItem('vimanasa_auto_sync');
    if (savedAutoSync !== null) {
      setAutoSyncEnabled(savedAutoSync === 'true');
    }
    
    if (rememberMe && loginTimestamp && savedUsername) {
      const daysSinceLogin = (Date.now() - parseInt(loginTimestamp)) / (1000 * 60 * 60 * 24);
      
      // Auto-login if less than 7 days have passed
      if (daysSinceLogin < 7) {
        // Verify token in background
        authAPI.verify()
          .then(res => {
            if (res.success) {
              setIsAuthenticated(true);
              toast.success(`Welcome back, ${savedUsername}! 👋`, {
                position: "top-right",
                autoClose: 3000,
              });
            } else {
              removeToken();
            }
          })
          .catch(() => {
            removeToken();
          });
      } else {
        // Clear expired session
        removeToken();
        localStorage.removeItem('vimanasa_login_timestamp');
      }
    }
  }, []);

  // Listen for navigation events from other components
  useEffect(() => {
    const handleNavigate = (e) => {
      const { tab, subTab, data: incomingData, action } = e.detail;
      
      // Set main tab
      setActiveTab(tab);
      
      // Set sub-tab if provided
      if (subTab) {
        setSubTabs(prev => ({ ...prev, [tab]: subTab }));
      }
      
      if (action === 'add') {
        // Special case for workforce/placements mapping
        const formTarget = tab === 'placements' ? 'workforce' : tab;
        setEditingItem(incomingData);
        setShowForm(true);
        setFormType(formTarget);
      }
    };

    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, []);

  const fetchData = useCallback(async (tab, silent = false) => {
    if (!isAuthenticated) return;
    
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsSyncing(true);
    }
    
    try {
      // Use authenticated apiClient instead of raw axios
      const response = await apiClient.get(`/api/database?table=${tab}&timestamp=${Date.now()}`);
      
      // Handle response format with success and data fields
      const responseData = response.data || response;
      
      let changed = false;
      
      setData(prev => {
        const currentData = prev[tab];
        const hasChanged = JSON.stringify(currentData) !== JSON.stringify(responseData);
        
        if (!hasChanged) {
          return prev; // Return exact same reference to prevent re-renders
        }
        
        changed = true;
        return { ...prev, [tab]: responseData };
      });
      
      setLastSyncTime(new Date());
      
      if (!silent) {
        setIsLoading(false);
      } else {
        setIsSyncing(false);
      }
      
      // Show notification only if data changed during background sync
      if (silent && changed && responseData?.length > 0) {
        toast.info('📊 Data updated', {
          position: "bottom-right",
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
      setIsLoading(false);
      setIsSyncing(false);
      
      if (!silent) {
        toast.error('Failed to fetch data. Please try again.');
      }
    }
  }, [isAuthenticated]);

  const syncCurrentGroup = useCallback((silent = false) => {
    if (activeTab === 'dashboard') {
      fetchData('workforce', silent);
      fetchData('clients', silent);
      fetchData('partners', silent);
      fetchData('payroll', silent);
      fetchData('finance', silent);
      fetchData('leave', silent);
      fetchData('expenses', silent);
      fetchData('compliance', silent);
      fetchData('candidates', silent);
      fetchData('job_openings', silent);
    } else if (activeTab === 'recruitment') {
      fetchData('candidates', silent);
      fetchData('job_openings', silent);
    } else if (activeTab === 'clients') {
      fetchData('clients', silent);
      fetchData('partners', silent);
    } else if (activeTab === 'placements') {
      fetchData('workforce', silent);
      fetchData('attendance', silent);
      fetchData('leave', silent);
    } else if (activeTab === 'finance') {
      fetchData('finance', silent);
      fetchData('payroll', silent);
      fetchData('expenses', silent);
      fetchData('invoices', silent);
    } else if (activeTab === 'reports') {
      fetchData('compliance', silent);
      fetchData('attendance', silent);
    }
  }, [activeTab, fetchData]);

  useEffect(() => {
    // When active tab changes, fetch the necessary data for that group
    syncCurrentGroup(false);
  }, [activeTab, syncCurrentGroup]);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!isAuthenticated || !autoSyncEnabled || !supabase) return;

    // Subscribe to all public tables
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          // Only fetch if we are not currently editing to prevent UI jumping
          if (!showForm && !isLoading) {
            syncCurrentGroup(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, autoSyncEnabled, showForm, isLoading, syncCurrentGroup]);

  // Listen for navigation events from dashboard quick actions
  useEffect(() => {
    const handleNavigate = (event) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, []);

  const handleSync = () => {
    toast.info('🔄 Syncing all data...', {
      position: "top-right",
      autoClose: 1500,
    });
    // Sync current tab group
    syncCurrentGroup(false);
    
    // Also sync all other tables in background
    const allTabs = ['workforce', 'clients', 'partners', 'attendance', 'leave', 'expenses', 'payroll', 'finance', 'compliance', 'invoices'];
    allTabs.forEach(tab => {
      fetchData(tab, true);
    });
  };

  const toggleAutoSync = () => {
    const newState = !autoSyncEnabled;
    setAutoSyncEnabled(newState);
    
    // Save preference to localStorage
    localStorage.setItem('vimanasa_auto_sync', newState.toString());
    
    toast.success(
      newState 
        ? '✅ Auto-sync enabled - Updates every 10 seconds' 
        : '⏸️ Auto-sync paused - Click sync button to update manually',
      {
        position: "top-right",
        autoClose: 3000,
      }
    );
  };

  const handleAddNew = (tab) => {
    setFormType(tab);
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item, tab, rowIndex) => {
    setFormType(tab);
    setEditingItem({ ...item, _rowIndex: rowIndex });
    setShowForm(true);
  };

  const handleDelete = async (item, tab, rowIndex) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Get the item ID for Supabase
      const itemId = item.id;
      
      if (!itemId) {
        toast.error('❌ Cannot delete: Item ID not found');
        return;
      }
      
      // Optimistic update - remove from UI immediately
      const updatedData = data[tab].filter((_, index) => index !== rowIndex);
      setData(prev => ({ ...prev, [tab]: updatedData }));
      
      await apiClient.delete('/api/database', {
        table: tab,
        id: itemId
      });
      
      toast.success('✅ Entry deleted successfully!');
      
      // Fetch fresh data to ensure sync
      setTimeout(() => fetchData(tab, true), 1000);
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('❌ Failed to delete entry. Please try again.');
      // Revert optimistic update by fetching fresh data
      fetchData(tab);
    }
  };

  const handleSave = async (formData) => {
    try {
      // Validation for "fsf" category in finance/expenses
      if (formType === 'finance' || formType === 'expenses') {
        const category = formData.Category || formData.category;
        if (category && category.trim().length < 3) {
          toast.error('❌ Category name must be at least 3 characters long.');
          return;
        }
      }
      
      if (editingItem && editingItem.id) {
        // Update existing item
        const updatedData = data[formType].map(item => 
          item.id === editingItem.id ? { ...item, ...formData } : item
        );
        setData(prev => ({ ...prev, [formType]: updatedData }));
        
        // Update on server
        await apiClient.put('/api/database', {
          table: formType,
          id: editingItem.id,
          data: formData
        });
        
        toast.success('✅ Entry updated successfully!');
      } else {
        // Add new item
        const response = await apiClient.post('/api/database', {
          table: formType,
          data: formData
        });
        
        // Add to local state with returned data (includes ID)
        const newData = [...(data[formType] || []), response.data.data];
        setData(prev => ({ ...prev, [formType]: newData }));
        
        toast.success('✅ Entry added successfully!');
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormType(null);
      
      // Fetch fresh data to ensure sync
      setTimeout(() => fetchData(formType, true), 1000);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('❌ Failed to save entry. Please try again.');
      // Revert optimistic update by fetching fresh data
      fetchData(formType);
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
        onLogout={() => {
          authAPI.logout();
        }}
        onSync={handleSync}
        lastSyncTime={lastSyncTime}
        isSyncing={isSyncing}
        autoSyncEnabled={autoSyncEnabled}
        onToggleAutoSync={toggleAutoSync}
      />
      
      <main className="flex-1 lg:ml-64 pt-24 pb-28 lg:pt-12 lg:pb-8 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
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
              <div className="fixed top-8 right-8 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 text-sm font-medium text-slate-600 animate-pulse z-50">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                Updating from Cloud...
              </div>
            )}

            {activeTab === 'dashboard' && (
              <>
                <DashboardView data={data.dashboard} allData={data} />
                <div className="mt-8">
                  <DashboardCharts data={data} />
                </div>
              </>
            )}

            {activeTab === 'recruitment' && (
              <RecruitmentManager 
                data={data} 
                onUpdate={fetchData} 
                onNavigate={setActiveTab} 
              />
            )}

            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Client Hub</h1>
                    <p className="text-slate-500 mt-1">Manage client relationships and site partners</p>
                  </div>
                </div>
                <SubNavigation 
                  mainTab="clients" 
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                  tabs={[
                    { id: 'clients', label: 'Client Management' },
                    { id: 'partners', label: 'Site Partners' }
                  ]} 
                />
                
                {subTabs.clients === 'clients' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <ClientManagement
                      clients={data.clients}
                      employees={data.workforce}
                      onAdd={async (clientData) => {
                        try {
                          await apiClient.post('/api/database', { table: 'clients', data: clientData });
                          toast.success('✅ Client added successfully!');
                          fetchData('clients');
                        } catch (error) { toast.error('❌ Failed to add client.'); }
                      }}
                      onEdit={async (clientData, idx) => {
                        try {
                          const client = data.clients[idx];
                          await apiClient.put('/api/database', { table: 'clients', id: client.id, data: clientData });
                          toast.success('✅ Client updated successfully!');
                          fetchData('clients');
                        } catch (error) { toast.error('❌ Failed to update client.'); }
                      }}
                      onDelete={async (client, idx) => {
                        if (!confirm('Delete this client?')) return;
                        try {
                          await apiClient.delete('/api/database', { table: 'clients', id: client.id });
                          toast.success('✅ Client deleted successfully!');
                          fetchData('clients');
                        } catch (error) { toast.error('❌ Failed to delete client.'); }
                      }}
                    />
                  </motion.div>
                )}
                
                {subTabs.clients === 'partners' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <PartnerDirectory 
                      partners={data.partners}
                      onAdd={() => handleAddNew('partners')} 
                      onEdit={(item, idx) => handleEdit(item, 'partners', idx)} 
                      onDelete={(item, idx) => handleDelete(item, 'partners', idx)} 
                    />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'placements' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Manpower Placements</h1>
                    <p className="text-slate-500 mt-1">Manage workforce deployment, attendance, and leaves</p>
                  </div>
                </div>
                <SubNavigation 
                  tabs={[
                    { id: 'workforce', label: 'Workforce Directory', icon: Users },
                    { id: 'deployment', label: 'Deployment Manager', icon: Briefcase },
                    { id: 'attendance', label: 'Attendance Tracking', icon: CheckSquare },
                    { id: 'leave', label: 'Leave Requests', icon: FileText }
                  ]}
                  mainTab="placements"
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                />

                {subTabs.placements === 'workforce' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <WorkforceDirectory 
                      employees={data.workforce} 
                      clients={data.clients}
                      onAdd={() => handleAddNew('workforce')} 
                      onEdit={(item, idx) => handleEdit(item, 'workforce', idx)} 
                      onDelete={(item, idx) => handleDelete(item, 'workforce', idx)} 
                      onGenerateDoc={async (item, type) => {
                        try {
                          toast.info(`Generating ${type} letter...`);
                          if (type === 'offer') await generateOfferLetter(item);
                          if (type === 'joining') await generateJoiningLetter(item);
                          if (type === 'experience') await generateExperienceLetter(item);
                          toast.success('Document generated successfully!');
                        } catch (e) {
                          toast.error('Failed to generate document');
                        }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.placements === 'deployment' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <DeploymentManager 
                      employees={data.workforce}
                      clients={data.clients}
                      onSave={async (employee) => {
                        try {
                          await apiClient.put('/api/database', { table: 'workforce', id: employee.id, data: employee });
                          toast.success(`✅ ${employee.Employee} deployment updated!`);
                          fetchData('workforce');
                        } catch (error) { toast.error('❌ Failed to update deployment.'); }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.placements === 'attendance' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <AttendanceManager 
                      employees={data.workforce}
                      attendanceData={data.attendance}
                      leaveRequests={data.leave}
                      onSave={async (record) => {
                        try {
                          await apiClient.post('/api/database', { table: 'attendance', data: record });
                          toast.success('✅ Attendance recorded successfully!');
                          fetchData('attendance');
                        } catch (error) { toast.error('❌ Failed to save attendance.'); }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.placements === 'leave' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <LeaveManager 
                      employees={data.workforce}
                      leaveRequests={data.leave}
                      onSave={async (record) => {
                        try {
                          await apiClient.post('/api/database', { table: 'leave', data: record });
                          toast.success('✅ Leave request submitted!');
                          fetchData('leave');
                        } catch (error) { toast.error('❌ Failed to submit leave request.'); }
                      }}
                      onApprove={async (request, idx) => {
                        try {
                          await apiClient.put('/api/database', {
                            table: 'leave', id: request.id,
                            data: { ...request, status: 'approved', approved_by: 'Admin', approved_at: new Date().toISOString() }
                          });
                          toast.success('✅ Leave request approved');
                          fetchData('leave');
                        } catch (error) { toast.error('❌ Failed to approve leave request.'); }
                      }}
                      onReject={async (request, idx) => {
                        try {
                          await apiClient.put('/api/database', {
                            table: 'leave', id: request.id,
                            data: { ...request, status: 'rejected', approved_by: 'Admin', approved_at: new Date().toISOString() }
                          });
                          toast.success('✅ Leave request rejected');
                          fetchData('leave');
                        } catch (error) { toast.error('❌ Failed to reject leave request.'); }
                      }}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Finance Center</h1>
                    <p className="text-slate-500 mt-1">Unified payroll, expenses, and invoicing platform</p>
                  </div>
                </div>
                <SubNavigation 
                  mainTab="finance" 
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                  tabs={[
                    { id: 'overview', label: 'Financial Ledger' },
                    { id: 'payroll', label: 'Payroll Processing' },
                    { id: 'invoices', label: 'Client Invoices' },
                    { id: 'expenses', label: 'Expense Claims' }
                  ]} 
                />

                {subTabs.finance === 'overview' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <FinanceLedger 
                      transactions={data.finance}
                      invoices={data.invoices}
                      expenses={data.expenses}
                      payroll={data.payroll}
                    />
                  </motion.div>
                )}

                {subTabs.finance === 'payroll' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <PayrollEngine 
                      employees={data.workforce}
                      attendanceData={data.attendance}
                      onSavePayroll={async (record) => {
                        try {
                          await apiClient.post('/api/database', { table: 'payroll', data: record });
                          toast.success('✅ Payroll processed and saved successfully!');
                          fetchData('payroll');
                        } catch (error) { toast.error('❌ Failed to save payroll data.'); }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.finance === 'invoices' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <ClientInvoicing
                      invoices={data.invoices}
                      clients={data.clients}
                      employees={data.workforce}
                      attendance={data.attendance}
                      onGenerateInvoice={async (invoiceData) => {
                        try {
                          await apiClient.post('/api/database', { table: 'invoices', data: invoiceData });
                          toast.success('✅ Invoice generated successfully!');
                          fetchData('invoices');
                        } catch (error) { toast.error('❌ Failed to generate invoice.'); }
                      }}
                      onUpdateStatus={async (invoice, idx, newStatus) => {
                        try {
                          await apiClient.put('/api/database', { table: 'invoices', id: invoice.id, data: { ...invoice, status: newStatus } });
                          toast.success('✅ Invoice status updated!');
                          fetchData('invoices');
                        } catch (error) { toast.error('❌ Failed to update status.'); }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.finance === 'expenses' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <ExpenseManager 
                      employees={data.workforce}
                      expenses={data.expenses}
                      onSave={async (record) => {
                        try {
                          await apiClient.post('/api/database', { table: 'expenses', data: record });
                          toast.success('✅ Expense claim submitted!');
                          fetchData('expenses');
                        } catch (error) { toast.error('❌ Failed to submit expense claim.'); }
                      }}
                      onApprove={async (expense, idx) => {
                        try {
                          await apiClient.put('/api/database', { table: 'expenses', id: expense.id, data: { ...expense, status: 'approved', approved_by: 'Admin', approved_at: new Date().toISOString() } });
                          toast.success('✅ Expense claim approved');
                          fetchData('expenses');
                        } catch (error) { toast.error('❌ Failed to approve expense claim.'); }
                      }}
                      onReject={async (expense, idx) => {
                        try {
                          await apiClient.put('/api/database', { table: 'expenses', id: expense.id, data: { ...expense, status: 'rejected', approved_by: 'Admin', approved_at: new Date().toISOString() } });
                          toast.success('✅ Expense claim rejected');
                          fetchData('expenses');
                        } catch (error) { toast.error('❌ Failed to reject expense claim.'); }
                      }}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Compliance Shield</h1>
                    <p className="text-slate-500 mt-1">Manage statutory filings and deadlines</p>
                  </div>
                </div>
                <SubNavigation 
                  mainTab="compliance" 
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                  tabs={[
                    { id: 'calendar', label: 'Compliance Calendar', icon: Calendar }
                  ]} 
                />
                {subTabs.compliance === 'calendar' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <StatutoryCompliance 
                      compliances={data.compliance} 
                      onSave={async (record) => {
                        try {
                          await apiClient.post('/api/database', { table: 'compliance', data: record });
                          toast.success('✅ Compliance record saved!');
                          fetchData('compliance');
                        } catch (error) { toast.error('❌ Failed to save compliance record.'); }
                      }} 
                    />
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Reports & Compliance</h1>
                    <p className="text-slate-500 mt-1">Regulatory filings, audit reports, and statutory compliance</p>
                  </div>
                </div>
                <SubNavigation 
                  mainTab="reports" 
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                  tabs={[
                    { id: 'compliance', label: 'Compliance Tracker', icon: CheckCircle },
                    { id: 'exports', label: 'Data Exports', icon: Download }
                  ]} 
                />

                {subTabs.reports === 'compliance' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <TableView title="Compliance" subtitle="Statutory filings and regulatory status" data={data.compliance} columns={['Requirement', 'Deadline', 'Status', 'Doc Link']} onAdd={() => handleAddNew('compliance')} onEdit={(item, idx) => handleEdit(item, 'compliance', idx)} onDelete={(item, idx) => handleDelete(item, 'compliance', idx)} tab="compliance" />
                  </motion.div>
                )}

                {subTabs.reports === 'exports' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-6">Master Data Exports</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['workforce', 'clients', 'attendance', 'finance', 'payroll'].map((dataset) => (
                           <div key={dataset} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                 <FileText size={20} />
                               </div>
                               <div>
                                 <div className="font-semibold text-slate-800 capitalize">{dataset} Data</div>
                                 <div className="text-xs text-slate-500">{data[dataset]?.length || 0} Records found</div>
                               </div>
                             </div>
                             <ExportMenu data={data[dataset] || []} filename={`${dataset}_export`} title={`${dataset.charAt(0).toUpperCase() + dataset.slice(1)} Master Data`} />
                           </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
                    <p className="text-slate-500 mt-1">Create and manage user accounts and permissions</p>
                  </div>
                </div>
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <UserManagement />
                </motion.div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 mt-1">Configure preferences and system parameters</p>
                  </div>
                </div>
                
                <SubNavigation 
                  mainTab="settings" 
                  subTabs={subTabs}
                  onChange={handleSubTabChange}
                  tabs={[
                    { id: 'company', label: 'Company Profile' },
                    { id: 'salary', label: 'Salary Components' },
                    { id: 'leave', label: 'Leave Policy' },
                    { id: 'users', label: 'User Management' },
                    { id: 'system', label: 'System Settings' }
                  ]} 
                />

                {subTabs.settings === 'company' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-slate-800 mb-6">Company Profile</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                          <input type="text" defaultValue="Vimanasa Services LLP" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">GSTIN</label>
                          <input type="text" defaultValue="27AABCU9603R1ZM" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Company Logo URL</label>
                          <input type="text" defaultValue="/vimanasa-logo.png" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Save Company Profile</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {subTabs.settings === 'salary' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-slate-800 mb-6">Salary & Allowances Config</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">HRA Percentage (%)</label>
                          <input type="number" defaultValue="40" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">PF Employer Share (%)</label>
                          <input type="number" defaultValue="13" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Save Configurations</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {subTabs.settings === 'leave' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-slate-800 mb-6">Leave Policy Limits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Casual Leaves (CL) / Year</label>
                          <input type="number" defaultValue="12" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Sick Leaves (SL) / Year</label>
                          <input type="number" defaultValue="6" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Earned Leaves (EL) / Month</label>
                          <input type="number" defaultValue="1.5" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="md:col-span-3">
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Update Policy</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {subTabs.settings === 'users' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 text-center text-slate-500">
                      <Users size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="font-bold text-lg">User Management</p>
                      <p className="text-sm">Feature coming soon. Manage Admin and Sub-Admin roles here.</p>
                    </div>
                  </motion.div>
                )}

                {subTabs.settings === 'system' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                      <h3 className="text-xl font-bold text-slate-800 mb-6">System Connection</h3>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mb-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-lg">Auto-Sync Data</span>
                          <span className="text-sm text-slate-500">Automatically sync data from cloud every 10 seconds</span>
                        </div>
                        <button
                          onClick={toggleAutoSync}
                          className={cn(
                            "relative inline-flex h-7 w-14 items-center rounded-full transition-colors",
                            autoSyncEnabled ? "bg-green-500" : "bg-slate-300"
                          )}
                        >
                          <span className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                            autoSyncEnabled ? "translate-x-8" : "translate-x-1"
                          )} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 mb-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-lg">System Mode</span>
                          <span className="text-sm text-slate-500">Database connection active</span>
                        </div>
                        <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Supabase PostgreSQL
                        </div>
                      </div>

                      <div className="mt-8 border-t border-slate-200 pt-6">
                        <h4 className="font-bold text-slate-800 mb-2 text-red-600 flex items-center gap-2"><AlertTriangle size={18} /> Danger Zone</h4>
                        <p className="text-sm text-slate-500 mb-4">Actions here are irreversible.</p>
                        <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold border border-red-200 hover:bg-red-100 transition-colors">Wipe All Application Data</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Form Modals */}
      {showForm && formType === 'workforce' && (
        <EmployeeDeploymentForm
          employee={editingItem}
          clients={data.clients}
          userRole={userRole}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormType(null);
          }}
        />
      )}
      
      {showForm && formType === 'partners' && (
        <PartnerDetailForm
          partner={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
            setFormType(null);
          }}
        />
      )}
      
      {showForm && formType && !['workforce', 'partners'].includes(formType) && (
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

function DashboardView({ data, allData }) {
  const [activeTab, setActiveTab] = useState('workforce');
  
  // Calculate real-time stats from actual data
  const stats = {
    staff: allData?.workforce?.length || 0,
    deployed: allData?.workforce?.filter(e => e['Deployment Status'] === 'Deployed' || (!e['Deployment Status'] && e['Assigned Client'])).length || 0,
    onLeave: allData?.workforce?.filter(e => e['Deployment Status'] === 'On Leave').length || 0,
    clients: allData?.clients?.length || 0,
    payroll: allData?.payroll?.length > 0 ? `₹${(allData.payroll.reduce((acc, curr) => acc + (parseFloat(curr['Net Salary']) || 0), 0) / 100000).toFixed(2)}L` : '₹0.00L',
    pendingLeave: allData?.leave?.filter(r => r.Status === 'Pending' || r.Status === 'Applied').length || 0,
    complianceDue: allData?.compliance?.filter(c => c.Status === 'Pending' || c.Status === 'Upcoming').length || 0,
    newApplications: allData?.candidates?.filter(c => c.Status === 'Pending' || !c.Status).length || 0,
  };

  // Financial summaries
  const financialSummary = {
    totalIncome: allData?.invoices?.reduce((acc, curr) => acc + (parseFloat(curr['Total Amount']) || 0), 0) || 0,
    totalExpense: (allData?.payroll?.reduce((acc, curr) => acc + (parseFloat(curr['Total Bill Rate']) || 0), 0) || 0) + (allData?.expenses?.reduce((acc, curr) => acc + (parseFloat(curr.Amount) || 0), 0) || 0),
  };
  const profitMargin = financialSummary.totalIncome > 0 ? Math.round(((financialSummary.totalIncome - financialSummary.totalExpense) / financialSummary.totalIncome) * 100) : 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Premium Corporate Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Operations Hub</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Core metrics and operational health overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-slate-200">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            SYSTEM ACTIVE
          </div>
        </div>
      </header>

      {/* Corporate Grid: Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Workforce" 
          value={stats.staff} 
          icon={Users}
          color="indigo"
          subtitle={`${stats.deployed} Deployed • ${stats.onLeave} Leave`}
        />
        <StatsCard 
          label="Client Sites" 
          value={stats.clients} 
          icon={Building2}
          color="slate"
          subtitle="Active operational partners"
        />
        <StatsCard 
          label="Monthly Payroll" 
          value={stats.payroll} 
          icon={DollarSign}
          color="indigo"
          subtitle="Total net distribution"
        />
        <StatsCard 
          label="Operational Margin" 
          value={`${profitMargin}%`} 
          icon={TrendingUp}
          color="indigo"
          subtitle="Net financial efficiency"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Essential Operations Hub */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Action Center</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: UserPlus, label: "Recruit", count: stats.newApplications, tab: 'recruitment' },
                { icon: ShieldCheck, label: "Compliance", count: stats.complianceDue, tab: 'compliance' },
                { icon: Receipt, label: "Payroll", tab: 'payroll' },
                { icon: CheckSquare, label: "Approvals", count: stats.pendingLeave, tab: 'placements' },
                { icon: Users, label: "Staff", tab: 'placements' },
                { icon: UserCog, label: "System", tab: 'settings' }
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: action.tab }))}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-600 hover:shadow-md transition-all group relative text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors mb-3">
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-black text-slate-600 group-hover:text-indigo-600 uppercase tracking-wider">{action.label}</span>
                  {action.count > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {action.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist P&L Snapshot */}
          <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5">
               <DollarSign size={150} />
             </div>
             <div className="relative z-10">
               <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-8">P&L Snapshot</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Revenue</p>
                   <p className="text-3xl font-black tracking-tighter">₹{(financialSummary.totalIncome / 100000).toFixed(2)}L</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Expenses</p>
                   <p className="text-3xl font-black tracking-tighter">₹{(financialSummary.totalExpense / 100000).toFixed(2)}L</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Operational Net</p>
                   <p className="text-3xl font-black tracking-tighter text-indigo-400">₹{((financialSummary.totalIncome - financialSummary.totalExpense) / 100000).toFixed(2)}L</p>
                 </div>
               </div>
             </div>
          </div>
        </div>
        
        {/* Recent Operational Log */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">System Log</h3>
          <div className="space-y-4 flex-1">
            {allData?.workforce?.slice(0, 6).map((emp, i) => (
              <div key={i} className="flex gap-4 items-center group cursor-pointer border-b border-slate-50 pb-4 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {(emp.Employee || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">{emp.Employee}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-widest">{emp.Role || 'OPERATIONAL STAFF'}</p>
                </div>
                <span className="text-[8px] font-black text-slate-300 uppercase shrink-0">LOGGED</span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'placements' }))}
            className="mt-8 w-full py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            Directory Archive
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group">
      <div className={cn("h-1 w-full transition-all duration-500", color === 'indigo' ? 'bg-indigo-600' : 'bg-slate-200 group-hover:bg-indigo-400')} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
            <Icon size={20} />
          </div>
          <div className="text-[9px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors">LIVE SYNC</div>
        </div>
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</h4>
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}




function TableView({ title, subtitle, data, columns, onAdd, onEdit, onDelete, tab, onGenerateDoc }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data ? data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg">{subtitle}</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full md:w-auto">
          <button 
            onClick={onAdd}
            data-action={`add-${tab}`}
            className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
          </button>
          <ExportMenu data={filteredData} filename={title.toLowerCase().replace(' ', '_')} title={title} />
        </div>
      </header>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
        <div className="p-3 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder={`Search in ${title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border-none bg-white shadow-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none text-slate-700 text-sm sm:text-base font-medium"
            />
          </div>
          <button className="hidden sm:flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Filter size={18} /> Filter
          </button>
        </div>

        <div className="space-y-3 p-3 sm:hidden">
          {filteredData.length > 0 ? filteredData.map((row, i) => {
            const titleValue = row.Employee || row['Client Name'] || row['Partner Name'] || row.Requirement || row.Category || row.Month || row.ID || `Record ${i + 1}`;
            const statusColumn = columns.find((col) => col.toLowerCase().includes('status'));

            return (
              <article key={row.id || i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-slate-900">{titleValue}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{row.ID || row['Client ID'] || row['Site ID'] || title}</p>
                  </div>
                  {statusColumn && (
                    <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase text-slate-600">
                      {row[statusColumn] || 'N/A'}
                    </span>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3">
                  {columns.filter((col) => col !== statusColumn).slice(0, 4).map((col) => (
                    <div key={col} className="min-w-0 rounded-xl bg-slate-50 p-3">
                      <dt className="mb-1 text-[10px] font-black uppercase tracking-wide text-slate-400">{col}</dt>
                      <dd className="truncate text-sm font-bold text-slate-800">{row[col] || 'N/A'}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  {tab === 'workforce' && onGenerateDoc && (
                    <button onClick={() => onGenerateDoc(row, 'offer')} className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700">
                      Offer
                    </button>
                  )}
                  <button onClick={() => onEdit(row, i)} className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    Edit
                  </button>
                  <button onClick={() => onDelete(row, i)} className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                    Delete
                  </button>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              {data ? 'No records found matching your search.' : 'Loading entries...'}
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="bg-slate-50/80">
                {columns.map(col => (
                  <th key={col} className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">{col}</th>
                ))}
                <th className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-wider sticky right-0 bg-slate-50/90 backdrop-blur-sm shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length > 0 ? filteredData.map((row, i) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                  {columns.map(col => (
                    <td key={col} className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6">
                      {col.toLowerCase().includes('status') ? (
                        <span className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border whitespace-nowrap ${
                          String(row[col]).toLowerCase().includes('active') || String(row[col]).toLowerCase().includes('paid') || String(row[col]).toLowerCase().includes('completed')
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : String(row[col]).toLowerCase().includes('progress')
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {row[col] || 'N/A'}
                        </span>
                      ) : col.toLowerCase() === 'employee' ? (
                        <div className="flex items-center gap-3">
                          {row['Photo URL'] ? (
                            <img src={row['Photo URL']} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                              {String(row[col] || '?').charAt(0)}
                            </div>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{row[col] || 'N/A'}</span>
                        </div>
                      ) : col.toLowerCase() === 'docs' ? (
                        <div className="flex items-center justify-center">
                          {row['Aadhar Doc URL'] && row['PAN Doc URL'] ? (
                            <CheckCircle size={18} className="text-green-500" title="All documents uploaded" />
                          ) : (
                            <XCircle size={18} className="text-red-500" title="Missing documents" />
                          )}
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">{row[col] || 'N/A'}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 sticky right-0 bg-white/95 backdrop-blur-md shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 group-hover:bg-blue-50/90 transition-colors">
                    <div className="flex gap-2 items-center">
                      {tab === 'workforce' && onGenerateDoc && (
                        <div className="flex gap-1.5 border-r border-slate-200 pr-3 mr-1">
                          <button onClick={() => onGenerateDoc(row, 'offer')} title="Offer Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 flex items-center gap-1"><FileText size={12}/> Offer</button>
                          <button onClick={() => onGenerateDoc(row, 'joining')} title="Joining Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-100 flex items-center gap-1"><FileText size={12}/> Joining</button>
                          <button onClick={() => onGenerateDoc(row, 'experience')} title="Experience Letter" className="px-2 py-1 text-[10px] sm:text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100 flex items-center gap-1"><FileText size={12}/> Experience</button>
                        </div>
                      )}
                      <button 
                        onClick={() => onEdit(row, i)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(row, i)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 sm:px-8 py-12 sm:py-20 text-center text-slate-400 text-sm sm:text-base italic">
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

function Login({ onLogin }) {
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
      // Use authAPI to login and get JWT token
      const response = await authAPI.login(username.trim(), password.trim());

      if (response.success) {
        // Handle Remember Me functionality
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
                <div className="bg-white p-4 rounded-2xl shadow-lg">
                  <img 
                    src="/vimanasa-logo.png" 
                    alt="Vimanasa Services LLP" 
                    className="h-16 w-auto"
                  />
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
              <label className="flex items-center gap-2 cursor-pointer group relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer"
                />
                <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors select-none">
                  Remember me
                </span>
                {rememberMe && (
                  <span className="ml-1 text-green-600" title="Your username will be saved">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
                {/* Tooltip */}
                <div className="absolute left-0 -bottom-8 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Stay logged in for 7 days
                  <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 transform rotate-45"></div>
                </div>
              </label>
              <button
                type="button"
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                onClick={() => {
                  alert('Please contact your administrator to reset your password.\n\nEmail: vimanasaservices@gmail.com\nPhone: +91 99217 13207');
                }}
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


