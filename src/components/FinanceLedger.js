"use client";
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Filter, Search, Plus, 
  ArrowUpRight, ArrowDownRight, Briefcase, Calendar, ChevronDown, Download
} from 'lucide-react';

export default function FinanceLedger({ transactions = [], invoices = [], expenses = [], payroll = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));

  // Consolidate all financial data into a unified ledger
  const unifiedLedger = useMemo(() => {
    let ledger = [...transactions];
    
    // Add Paid Invoices as Income
    invoices?.forEach(inv => {
      if (inv.Status === 'Paid') {
        ledger.push({
          id: `INV-${inv.id}`,
          Date: inv['Invoice Date'] || inv.date,
          Type: 'Income',
          Category: 'Client Payment',
          Amount: inv['Invoice Amount'] || inv.amount,
          Description: `Payment from ${inv['Client Name']}`,
          Status: 'Completed'
        });
      }
    });

    // Add Approved Expenses as Expense
    expenses?.forEach(exp => {
      if (exp.Status === 'Approved' || exp.Status === 'Paid') {
        ledger.push({
          id: `EXP-${exp.id}`,
          Date: exp.Date || exp.expense_date,
          Type: 'Expense',
          Category: exp.Category,
          Amount: exp.Amount,
          Description: `Expense Claim by ${exp['Employee Name']} - ${exp.Description}`,
          Status: 'Completed'
        });
      }
    });

    // Add Paid Payroll as Expense
    payroll?.forEach(pr => {
      if (pr.Status === 'Paid') {
        ledger.push({
          id: `PR-${pr.id}`,
          Date: pr.Date || pr.month,
          Type: 'Expense',
          Category: 'Payroll',
          Amount: pr['Total Payout'] || pr.net_salary,
          Description: `Payroll processing for ${pr.Month}`,
          Status: 'Completed'
        });
      }
    });

    // Sort by date descending
    return ledger.sort((a, b) => new Date(b.Date) - new Date(a.Date));
  }, [transactions, invoices, expenses, payroll]);

  const filteredLedger = useMemo(() => {
    return unifiedLedger.filter(item => {
      const amtStr = String(item.Amount || '0').replace(/[₹,]/g, '');
      const matchesSearch = 
        (item.Description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.Category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        amtStr.includes(searchTerm);
      
      const matchesType = typeFilter === 'All' || item.Type === typeFilter;
      const matchesMonth = item.Date?.startsWith(monthFilter);

      return matchesSearch && matchesType && matchesMonth;
    });
  }, [unifiedLedger, searchTerm, typeFilter, monthFilter]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    filteredLedger.forEach(item => {
      const amt = parseFloat(String(item.Amount || '0').replace(/[₹,]/g, ''));
      if (item.Type === 'Income') income += amt;
      else if (item.Type === 'Expense') expense += amt;
    });

    return { income, expense, profit: income - expense };
  }, [filteredLedger]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Financial Ledger</h2>
          <p className="text-slate-500 mt-1">Unified view of revenue, expenses, and net profit</p>
        </div>
        <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg">
          <Download size={20} /> Export Ledger
        </button>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <DollarSign size={80} />
          </div>
          <p className="text-blue-100 font-bold mb-1 uppercase tracking-wider text-sm">Net Profit / Loss</p>
          <h3 className="text-4xl font-black mb-4">₹{summary.profit.toLocaleString('en-IN')}</h3>
          <div className="flex items-center gap-2 text-sm font-medium bg-white/20 w-fit px-3 py-1.5 rounded-lg backdrop-blur-sm">
            {summary.profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{summary.income > 0 ? Math.round((summary.profit / summary.income) * 100) : 0}% Margin</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Total Income</p>
              <h3 className="text-3xl font-black text-slate-800">₹{summary.income.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <ArrowUpRight size={24} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Invoices & Direct Payments</span>
            <span className="text-green-600 font-bold">Received</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-1">Total Expenses</p>
              <h3 className="text-3xl font-black text-slate-800">₹{summary.expense.toLocaleString('en-IN')}</h3>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <ArrowDownRight size={24} strokeWidth={3} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Payroll, Claims & Bills</span>
            <span className="text-red-500 font-bold">Deducted</span>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search descriptions, categories, or amounts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select 
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 min-w-[150px]"
              >
                <option value="">All Time</option>
                <option value={new Date().toISOString().slice(0,7)}>This Month</option>
                <option value={new Date(new Date().setMonth(new Date().getMonth()-1)).toISOString().slice(0,7)}>Last Month</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-700 min-w-[130px]"
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-x-auto">
          {filteredLedger.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="text-slate-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No transactions found</h3>
              <p className="text-slate-500 text-sm">Adjust your filters or search term.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLedger.map((item, idx) => {
                  const isIncome = item.Type === 'Income';
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                        {new Date(item.Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                            {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{item.Description || 'General Transaction'}</p>
                            <p className="text-xs text-slate-500 font-medium">{item.id || `TRX-${1000+idx}`}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200">
                          {item.Category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <CheckCircle size={14} className="text-green-500" /> {item.Status || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-base font-black ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
                          {isIncome ? '+' : '-'}₹{parseFloat(String(item.Amount || '0').replace(/[₹,]/g, '')).toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
