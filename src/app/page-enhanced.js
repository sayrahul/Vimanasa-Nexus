"use client";
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import EmployeeForm from '@/components/EmployeeForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Plus, Filter, Download, ArrowUpRight, Send, Edit2, Trash2, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import axios from 'axios';
import { exportToPDF, exportToExcel, exportToCSV, printView } from '@/lib/exportUtils';
import { authenticateUser, canAccessModule, canPerformAction, PERMISSIONS, ROLES } from '@/lib/rbac';

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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
  const [showExportMenu, setShowExportMenu] = useState(false);

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
    
    // Check permission
    if (currentUser && !canAccessModule(currentUser.role, tab)) {
      return;
    }
    
    setIsLoading(true);
    try {
      const sheetName = sheetMapping[tab] || tab.charAt(0).toUpperCase() + tab.slice(1);
      const response = await axios.get(`/api/gsheets?sheet=${sheetName}`);
      setData(prev => ({ ...prev, [tab]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${tab} data:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchData(activeTab);
    }
  }, [activeTab, isAuthenticated, currentUser, fetchData]);

  const handleSync = () => {
    fetchData(activeTab);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleAddNew = () => {
    if (!canPerformAction(currentUser, getAddPermission(activeTab))) {
      alert('You do not have permission to add entries');
      return;
    }
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    if (!canPerformAction(currentUser, getEditPermission(activeTab))) {
      alert('You do not have permission to edit entries');
      return;
    }
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!canPerformAction(currentUser, getDeletePermission(activeTab))) {
      alert('You do not have permission to delete entries');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    
    // TODO: Implement delete API call
    alert('Delete functionality will be implemented with backend API');
  };

  const handleSave = async (formData) => {
    try {
      const sheetName = sheetMapping[activeTab];
      const values = Object.values(formData);
      
      await axios.post('/api/gsheets', {
        sheet: sheetName,
        values: values
      });
      
      setShowForm(false);
      setEditingItem(null);
      fetchData(activeTab);
      alert('Entry saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleExport = (format) => {
    if (!canPerformAction(currentUser, PERMISSIONS.EXPORT_DATA)) {
      alert('You do not have permission to export data');
      return;
    }

    const currentData = data[activeTab];
    if (!currentData || currentData.length === 0) {
      alert('No data to export');
      return;
    }

    const title = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    const filename = `${title}-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'pdf':
        const columns = Object.keys(currentData[0]);
        exportToPDF(currentData, columns, `${title} Report`, `${filename}.pdf`);
        break;
      case 'excel':
        exportToExcel(currentData, `${filename}.xlsx`, title);
        break;
      case 'csv':
        exportToCSV(currentData, `${filename}.csv`);
        break;
      case 'print':
        printView();
        break;
    }
    
    setShowExportMenu(false);
  };

  const getAddPermission = (tab) => {
    const permissionMap = {
      workforce: PERMISSIONS.ADD_EMPLOYEE,
      partners: PERMISSIONS.ADD_PARTNER,
      payroll: PERMISSIONS.ADD_PAYROLL,
      finance: PERMISSIONS.ADD_TRANSACTION,
      compliance: PERMISSIONS.ADD_COMPLIANCE,
    };
    return permissionMap[tab];
  };

  const getEditPermission = (tab) => {
    const permissionMap = {
      workforce: PERMISSIONS.EDIT_EMPLOYEE,
      partners: PERMISSIONS.EDIT_PARTNER,
      payroll: PERMISSIONS.EDIT_PAYROLL,
      finance: PERMISSIONS.EDIT_TRANSACTION,
      compliance: PERMISSIONS.EDIT_COMPLIANCE,
    };
    return permissionMap[tab];
  };

  const getDeletePermission = (tab) => {
    const permissionMap = {
      workforce: PERMISSIONS.DELETE_EMPLOYEE,
      partners: PERMISSIONS.DELETE_PARTNER,
      payroll: PERMISSIONS.DELETE_PAYROLL,
      finance: PERMISSIONS.DELETE_TRANSACTION,
      compliance: PERMISSIONS.DELETE_COMPLIANCE,
    };
    return permissionMap[tab];
  };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  // Check if user can access current tab
  if (!canAccessModule(currentUser.role, activeTab)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this module.</p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        onSync={handleSync}
        currentUser={currentUser}
      />
      
      <main className="flex-1 ml-64 p-8">
        {/* User Info Bar */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            Welcome, <span className="font-bold text-slate-900">{currentUser?.name}</span>
            <span className="ml-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
              {currentUser?.role.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>

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

            {activeTab === 'dashboard' && <DashboardView data={data.dashboard} />}
            {activeTab !== 'dashboard' && activeTab !== 'ai' && (
              <TableView 
                title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                subtitle={getSubtitle(activeTab)}
                data={data[activeTab]}
                columns={getColumns(activeTab)}
                onAdd={handleAddNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
                showExportMenu={showExportMenu}
                setShowExportMenu={setShowExportMenu}
                canAdd={canPerformAction(currentUser, getAddPermission(activeTab))}
                canEdit={canPerformAction(currentUser, getEditPermission(activeTab))}
                canDelete={canPerformAction(currentUser, getDeletePermission(activeTab))}
                canExport={canPerformAction(currentUser, PERMISSIONS.EXPORT_DATA)}
              />
            )}
            {activeTab === 'ai' && <AiAssistantView dataContext={data} />}
          </motion.div>
        </AnimatePresence>

        {/* Forms */}
        {showForm && activeTab === 'workforce' && (
          <EmployeeForm
            employee={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function getSubtitle(tab) {
  const subtitles = {
    workforce: 'Manage employees and site assignments',
    partners: 'Active client sites and service partners',
    payroll: 'Salary processing and disbursement status',
    finance: 'Revenue, expenses and profit tracking',
    compliance: 'Statutory filings and regulatory status',
  };
  return subtitles[tab] || '';
}

function getColumns(tab) {
  const columnMap = {
    workforce: ['ID', 'Employee', 'Role', 'Status'],
    partners: ['Site ID', 'Partner Name', 'Location', 'Headcount'],
    payroll: ['Month', 'Total Payout', 'Pending', 'Status'],
    finance: ['Category', 'Amount', 'Date', 'Type'],
    compliance: ['Requirement', 'Deadline', 'Status', 'Doc Link'],
  };
  return columnMap[tab] || [];
}

// Dashboard, StatsCard, TableView, AiAssistantView, and Login components remain the same
// (Copy from original page.js)

