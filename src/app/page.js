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
import AttendanceRoll from '@/components/AttendanceRoll';
import EmployeePortal from '@/components/EmployeePortal';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, Filter, Download, ArrowUpRight, ArrowDownRight, Send, Edit2, Trash2, FileText, TrendingUp, Users, DollarSign, AlertTriangle, Bell, CheckSquare, CheckCircle, XCircle, Briefcase, ArrowRight, UserPlus, Calendar, Building2, ShieldCheck, Receipt, UserCog } from 'lucide-react';
import { apiClient, authAPI, setToken, setUser, removeToken } from '@/lib/apiClient';
import { toast } from 'react-toastify';
import { generateSalarySlip, generateOfferLetter, generateJoiningLetter, generateExperienceLetter } from '@/lib/pdfGenerator';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Login from '@/components/Login';
import DashboardView from '@/components/DashboardView';
import TableView from '@/components/TableView';

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
  const [user, setUserState] = useState(null);
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
              setUserState(res.user);
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
      const detail = e.detail;
      const tab = typeof detail === 'string' ? detail : detail.tab;
      const subTab = typeof detail === 'object' ? detail.subTab : null;
      const incomingData = typeof detail === 'object' ? detail.data : null;
      const action = typeof detail === 'object' ? detail.action : null;
      
      // Set main tab
      if (tab) setActiveTab(tab);
      
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
    // If employee, only sync personal relevant data
    if (user?.role === 'employee') {
      fetchData('workforce', silent);
      fetchData('attendance', silent);
      fetchData('leave', silent);
      fetchData('payroll', silent);
      return;
    }

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
  }, [activeTab, user, fetchData]);

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



  const handleSync = () => {
    toast.info('🔄 Syncing all data...', {
      position: "top-right",
      autoClose: 1500,
    });
    // Sync current tab group
    syncCurrentGroup(false);
    
    // Also sync all other tables in background
    const tabs = [
      'workforce', 'clients', 'partners', 'attendance', 'leave', 
      'expenses', 'finance', 'payroll', 'compliance', 'invoices', 
      'candidates', 'job_openings'
    ];
    tabs.forEach(tab => {
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

  if (!isAuthenticated) return (
    <Login onLogin={() => {
      setIsAuthenticated(true);
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUserState(JSON.parse(savedUser));
    }} />
  );

  // Redirect to Employee Portal if role is employee
  if (user?.role === 'employee') {
    return (
      <EmployeePortal 
        user={user} 
        onLogout={() => {
          authAPI.logout();
          setIsAuthenticated(false);
          setUserState(null);
        }} 
      />
    );
  }

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
                            data: { ...request, Status: 'Approved', approved_by: 'Admin', approved_at: new Date().toISOString() }
                          });
                          toast.success('✅ Leave request approved');
                          fetchData('leave');
                        } catch (error) { toast.error('❌ Failed to approve leave request.'); }
                      }}
                      onReject={async (request, idx) => {
                        try {
                          await apiClient.put('/api/database', {
                            table: 'leave', id: request.id,
                            data: { ...request, Status: 'Rejected', approved_by: 'Admin', approved_at: new Date().toISOString() }
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
                    { id: 'attendance_roll', label: 'Attendance Roll' },
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

                {subTabs.finance === 'attendance_roll' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <AttendanceRoll 
                      employees={data.workforce}
                      attendanceData={data.attendance}
                      onSaveRoll={async (records, month) => {
                        try {
                          for (const record of records) {
                            // Find the employee DB ID (UUID) to satisfy FK constraints
                            const emp = data.workforce.find(e => 
                              (e['ID'] === record.employee_id || e.employee_id === record.employee_id || e['Employee ID'] === record.employee_id)
                            );
                            
                            if (!emp?.id) {
                              console.error('Employee not found for ID:', record.employee_id);
                              continue; 
                            }

                            const [year, monthNum] = month.split('-');
                            const lastDay = new Date(year, monthNum, 0).getDate();
                            const attendanceRecord = {
                              employee_id: emp.id, // Use the UUID
                              Date: `${month}-${lastDay}`,
                              Status: 'monthly_roll',
                              payable_days: record.payable_days,
                              overtime_hours: record.overtime_hours,
                              remarks: record.remarks
                            };
                            await apiClient.post('/api/database', { table: 'attendance', data: attendanceRecord });
                          }
                          toast.success('✅ Attendance roll finalized!');
                          fetchData('attendance');
                        } catch (error) { toast.error('❌ Failed to save roll.'); }
                      }}
                    />
                  </motion.div>
                )}

                {subTabs.finance === 'payroll' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <PayrollEngine 
                      employees={data.workforce}
                      attendanceData={data.attendance}
                      monthlyAttendanceData={data.attendance.filter(r => r.status === 'monthly_roll' || r.Status === 'monthly_roll')}
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
                          // Optimistic update
                          setData(prev => ({ ...prev, invoices: [invoiceData, ...(prev.invoices || [])] }));
                          
                          await apiClient.post('/api/database', { table: 'invoices', data: invoiceData });
                          toast.success('✅ Invoice generated successfully!');
                          fetchData('invoices');
                        } catch (error) { 
                          toast.error('❌ Failed to generate invoice.'); 
                          fetchData('invoices'); // Revert by fetching
                        }
                      }}
                      onUpdateStatus={async (invoice, idx, newStatus) => {
                        try {
                          await apiClient.put('/api/database', { table: 'invoices', id: invoice.id, data: { ...invoice, Status: newStatus } });
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
                          await apiClient.put('/api/database', { table: 'expenses', id: expense.id, data: { ...expense, Status: 'Approved', approved_by: 'Admin', approved_at: new Date().toISOString() } });
                          toast.success('✅ Expense claim approved');
                          fetchData('expenses');
                        } catch (error) { toast.error('❌ Failed to approve expense claim.'); }
                      }}
                      onReject={async (expense, idx) => {
                        try {
                          await apiClient.put('/api/database', { table: 'expenses', id: expense.id, data: { ...expense, Status: 'Rejected', approved_by: 'Admin', approved_at: new Date().toISOString() } });
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




