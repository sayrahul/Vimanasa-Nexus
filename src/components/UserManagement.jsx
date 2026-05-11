"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Key, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
  User,
  AtSign,
  Briefcase,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  MoreHorizontal,
  Save,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal states
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'password'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    must_change_password: false,
    is_active: true
  });

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
    must_change_password: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      setUsers(response.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/api/users', formData);
      toast.success('User created successfully!');
      setModalType(null);
      resetForm();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to create user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/api/users', {
        id: selectedUser.id,
        ...formData,
      });
      toast.success('User updated successfully!');
      setModalType(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update user');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      await api.post('/api/users', {
        action: 'reset_password',
        id: selectedUser.id,
        new_password: passwordData.new_password,
        must_change_password: passwordData.must_change_password,
      });
      toast.success('Password reset successfully!');
      setModalType(null);
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/api/users?id=${user.id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      full_name: '',
      role: 'employee',
      must_change_password: false,
      is_active: true
    });
  };

  const openCreateModal = () => {
    resetForm();
    setModalType('create');
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    });
    setModalType('edit');
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordData({
      new_password: '',
      confirm_password: '',
      must_change_password: true,
    });
    setModalType('password');
  };

  const getRoleBadge = (role) => {
    const roles = {
      super_admin: { label: 'Super Admin', color: 'bg-rose-50 text-rose-600 border-rose-100', icon: ShieldCheck },
      admin: { label: 'Admin', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: Shield },
      hr_manager: { label: 'HR Manager', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Users },
      finance_manager: { label: 'Finance', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: DollarSign },
      compliance_officer: { label: 'Compliance', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Lock },
      employee: { label: 'Employee', color: 'bg-slate-50 text-slate-600 border-slate-100', icon: User },
    };
    const config = roles[role] || roles.employee;
    const Icon = config.icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit", config.color)}>
        <Icon size={12} /> {config.label}
      </span>
    );
  };

  // Stats
  const activeCount = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role.includes('admin')).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Synchronizing Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-10">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center shadow-2xl shadow-slate-200">
            <Users size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Identity Management</h2>
            <div className="flex items-center gap-4 mt-1.5">
              <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                <CheckCircle2 size={12} className="text-emerald-500" /> {activeCount} Active
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                <Shield size={12} className="text-indigo-500" /> {adminCount} Admins
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full lg:w-auto px-10 py-4 bg-slate-900 text-white rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-95"
        >
          <UserPlus size={18} /> Add New Identity
        </button>
      </div>

      {/* Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, username or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-slate-50 transition-all font-semibold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-4">
            <Filter className="text-slate-300 ml-2" size={18} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-3.5 bg-transparent outline-none font-black text-xs uppercase tracking-widest appearance-none cursor-pointer"
            >
              <option value="All">All Roles</option>
              <option value="super_admin">Super Admins</option>
              <option value="admin">Admins</option>
              <option value="hr_manager">HR Managers</option>
              <option value="finance_manager">Finance</option>
              <option value="compliance_officer">Compliance</option>
              <option value="employee">Employees</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Directory */}
      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-12 px-10 py-6 bg-slate-50/50 border-b border-slate-100">
           <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Identity</div>
           <div className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Privilege</div>
           <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Directory Status</div>
           <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</div>
           <div className="col-span-1 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</div>
        </div>

        <div className="divide-y divide-slate-100">
          <AnimatePresence mode="popLayout">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={user.id}
                  className="group hover:bg-slate-50/50 transition-all p-6 lg:px-10 lg:py-6"
                >
                  <div className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-6">
                    {/* User Info */}
                    <div className="col-span-4 flex items-center gap-5">
                      <div className={cn(
                        "w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-lg shadow-lg border transition-all",
                        user.is_active ? "bg-white text-slate-900 border-slate-100 group-hover:scale-105" : "bg-slate-50 text-slate-300 border-slate-100"
                      )}>
                        {user.full_name?.charAt(0) || user.username?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-base leading-tight flex items-center gap-2">
                          {user.full_name}
                          {user.is_locked && <Lock size={14} className="text-rose-500" />}
                        </h4>
                        <div className="flex flex-col mt-1">
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">@{user.username}</span>
                          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Mail size={10} /> {user.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-3">
                       <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-2">Privilege</span>
                       {getRoleBadge(user.role)}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                       <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-2">Status</span>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            user.is_active ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-300"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            user.is_active ? "text-emerald-600" : "text-slate-400"
                          )}>
                            {user.is_active ? 'Online' : 'Disabled'}
                          </span>
                       </div>
                    </div>

                    {/* Last Login */}
                    <div className="col-span-2">
                       <span className="lg:hidden text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] block mb-2">Last Activity</span>
                       <div className="flex items-center gap-2 text-slate-400">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">
                            {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Never'}
                          </span>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex items-center justify-end gap-2 mt-4 lg:mt-0">
                       <button 
                         onClick={() => openPasswordModal(user)}
                         className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                         title="Reset Password"
                       >
                         <Key size={18} />
                       </button>
                       <button 
                         onClick={() => openEditModal(user)}
                         className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                         title="Edit User"
                       >
                         <Edit size={18} />
                       </button>
                       <button 
                         onClick={() => handleDeleteUser(user)}
                         className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                         title="Delete Identity"
                       >
                         <Trash2 size={18} />
                       </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-32 text-center flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                    <Users size={40} />
                 </div>
                 <h4 className="text-2xl font-black text-slate-900">Directory is empty</h4>
                 <p className="text-slate-500 font-medium max-w-sm mt-2">No users found matching your current search parameters.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalType(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-[110] bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 p-10 text-white relative">
                 <div className="absolute top-8 right-8">
                    <button onClick={() => setModalType(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                       <X size={24} />
                    </button>
                 </div>
                 <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                    {modalType === 'create' ? <UserPlus size={28} /> : modalType === 'edit' ? <Edit size={28} /> : <Key size={28} />}
                 </div>
                 <h3 className="text-2xl font-black tracking-tight uppercase">
                    {modalType === 'create' ? 'Define New Identity' : modalType === 'edit' ? 'Update Directory' : 'Security Reset'}
                 </h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                    <Shield size={12} className="text-indigo-400" /> Administrative Authorization Required
                 </p>
              </div>

              {/* Modal Content */}
              <div className="p-10">
                 {modalType === 'password' ? (
                   <form onSubmit={handleResetPassword} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Security Key</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input
                          type="checkbox"
                          id="must_change_password_reset"
                          checked={passwordData.must_change_password}
                          onChange={(e) => setPasswordData({ ...passwordData, must_change_password: e.target.checked })}
                          className="h-5 w-5 text-indigo-600 rounded-lg border-slate-200"
                        />
                        <label htmlFor="must_change_password_reset" className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">
                          Enforce change on next login
                        </label>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" /> : <RefreshCw size={18} />}
                        Update Security Policy
                      </button>
                   </form>
                 ) : (
                   <form onSubmit={modalType === 'create' ? handleCreateUser : handleUpdateUser} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {modalType === 'create' && (
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique Username</label>
                              <div className="relative">
                                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                <input
                                  type="text" required
                                  value={formData.username}
                                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
                                  placeholder="john.doe"
                                />
                              </div>
                            </div>
                         )}

                         <div className={cn("space-y-2", modalType !== 'create' && "md:col-span-2")}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Full Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input
                                type="text" required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
                                placeholder="John Doe"
                              />
                            </div>
                         </div>

                         <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                              <input
                                type="email" required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
                                placeholder="john@company.com"
                              />
                            </div>
                         </div>

                         {modalType === 'create' && (
                            <div className="md:col-span-2 space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Security Key</label>
                               <div className="relative">
                                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                  <input
                                    type="password" required minLength={8}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                  />
                               </div>
                            </div>
                         )}

                         <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Tier</label>
                            <div className="relative">
                               <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                               <select
                                 required
                                 value={formData.role}
                                 onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                 className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 transition-all font-black text-xs uppercase tracking-widest appearance-none"
                               >
                                 <option value="employee">Employee</option>
                                 <option value="hr_manager">HR Manager</option>
                                 <option value="finance_manager">Finance Manager</option>
                                 <option value="compliance_officer">Compliance Officer</option>
                                 <option value="admin">Admin</option>
                                 <option value="super_admin">Super Admin</option>
                               </select>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col gap-3">
                         {modalType === 'create' ? (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <input
                                 type="checkbox"
                                 id="must_change_password"
                                 checked={formData.must_change_password}
                                 onChange={(e) => setFormData({ ...formData, must_change_password: e.target.checked })}
                                 className="h-5 w-5 text-indigo-600 rounded-lg border-slate-200"
                               />
                               <label htmlFor="must_change_password" className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">
                                 Enforce change on first login
                               </label>
                            </div>
                         ) : (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                               <input
                                 type="checkbox"
                                 id="is_active"
                                 checked={formData.is_active}
                                 onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                 className="h-5 w-5 text-indigo-600 rounded-lg border-slate-200"
                               />
                               <label htmlFor="is_active" className="text-[10px] font-black text-slate-600 uppercase tracking-widest cursor-pointer">
                                 Identity Status is Active
                               </label>
                            </div>
                         )}
                      </div>

                      <button 
                        type="submit" 
                        disabled={isSaving}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isSaving ? <RefreshCw className="animate-spin" /> : modalType === 'create' ? <UserPlus size={18} /> : <Save size={18} />}
                        {modalType === 'create' ? 'Create Secure Identity' : 'Commit Directory Changes'}
                      </button>
                   </form>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
