# 🔧 Payroll System Integration Guide

## Quick Integration Steps

### Step 1: Import Components

Add these imports to your `src/app/page.js`:

```javascript
import AutomatedPayrollSystem from '@/components/AutomatedPayrollSystem';
import SalaryAdvanceManager from '@/components/SalaryAdvanceManager';
import LoanManagementSystem from '@/components/LoanManagementSystem';
```

### Step 2: Add to Tab Rendering

In your main component's render section, add the payroll system to your tab switch:

```javascript
{activeTab === 'payroll' && (
  <div className="space-y-6">
    {/* Existing PayrollActions component */}
    <PayrollActions employees={data.workforce} />
    
    {/* NEW: Automated Payroll System */}
    <AutomatedPayrollSystem
      employees={data.workforce}
      attendance={data.attendance}
      onSave={handleSave}
    />
  </div>
)}
```

### Step 3: Add Salary Advances Tab (Optional)

If you want a dedicated tab for advances:

```javascript
{activeTab === 'advances' && (
  <SalaryAdvanceManager
    employees={data.workforce}
    advances={data.salaryAdvances || []}
    onSave={handleSave}
  />
)}
```

### Step 4: Add Loans Tab (Optional)

If you want a dedicated tab for loans:

```javascript
{activeTab === 'loans' && (
  <LoanManagementSystem
    employees={data.workforce}
    loans={data.employeeLoans || []}
    onSave={handleSave}
  />
)}
```

### Step 5: Update Data State

Add the new data fields to your state:

```javascript
const [data, setData] = useState({
  // ... existing fields
  payroll: [],
  salaryAdvances: [],
  employeeLoans: [],
});
```

### Step 6: Update handleSave Function

Ensure your handleSave function supports the new tables:

```javascript
const handleSave = async (formData, table = activeTab, action = 'create') => {
  try {
    const endpoint = '/api/database';
    
    if (action === 'create') {
      await axios.post(endpoint, { table, data: formData });
      toast.success('Data saved successfully!');
    } else if (action === 'update') {
      await axios.put(endpoint, { table, id: formData.id, data: formData });
      toast.success('Data updated successfully!');
    }
    
    // Refresh data
    fetchData(table);
  } catch (error) {
    toast.error('Failed to save data');
    console.error(error);
  }
};
```

---

## Alternative: Standalone Usage

If you prefer to use the payroll system as a standalone page:

### Create New Route

Create `src/app/payroll/page.js`:

```javascript
"use client";
import React, { useState, useEffect } from 'react';
import AutomatedPayrollSystem from '@/components/AutomatedPayrollSystem';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function PayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get('/api/database?table=workforce'),
        axios.get('/api/database?table=attendance')
      ]);
      
      setEmployees(empRes.data.data || []);
      setAttendance(attRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    }
  };

  const handleSave = async (formData, table) => {
    try {
      await axios.post('/api/database', { table, data: formData });
      toast.success('Saved successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <AutomatedPayrollSystem
        employees={employees}
        attendance={attendance}
        onSave={handleSave}
      />
    </div>
  );
}
```

---

## Database Setup

### Run SQL Script

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Create new query
4. Copy contents from `scripts/create-payroll-tables.sql`
5. Click "Run"

### Verify Tables

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%payroll%' OR table_name LIKE '%loan%' OR table_name LIKE '%advance%';
```

Expected output:
- payroll
- salary_advances
- employee_loans
- payroll_history
- tax_declarations
- bank_transfer_batches

---

## Testing

### Test Payroll Processing

1. Navigate to Payroll tab
2. Select current month
3. System auto-calculates for all employees
4. Review calculations
5. Click "Process Payroll"
6. Verify data in Supabase

### Test Salary Advance

1. Go to Advances tab
2. Click "New Advance Request"
3. Fill form and submit
4. Approve the advance
5. Process payroll
6. Verify advance recovery in payroll

### Test Employee Loan

1. Go to Loans tab
2. Click "New Loan"
3. Enter loan details
4. View EMI calculation
5. View amortization schedule
6. Process payroll
7. Verify EMI deduction

---

## Troubleshooting

### Issue: Tables not found
**Solution**: Run the SQL script in Supabase SQL Editor

### Issue: Calculations incorrect
**Solution**: Check `src/lib/payrollCalculations.js` for calculation logic

### Issue: Data not saving
**Solution**: Verify API route `/api/database/route.js` includes new tables in tableMapping

### Issue: Components not rendering
**Solution**: Check imports and ensure all dependencies are installed

---

## API Route Update

Ensure your `/api/database/route.js` includes the new tables:

```javascript
const tableMapping = {
  // ... existing mappings
  payroll: 'payroll',
  salaryAdvances: 'salary_advances',
  employeeLoans: 'employee_loans',
  taxDeclarations: 'tax_declarations',
  bankTransferBatches: 'bank_transfer_batches',
};
```

---

## Complete Example

Here's a complete integration example:

```javascript
// src/app/page.js

import AutomatedPayrollSystem from '@/components/AutomatedPayrollSystem';

// In your component
{activeTab === 'payroll' && (
  <>
    {/* Header */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-black text-slate-900">Payroll Management</h2>
      <PayrollActions employees={data.workforce} />
    </div>

    {/* Automated Payroll System */}
    <AutomatedPayrollSystem
      employees={data.workforce}
      attendance={data.attendance}
      onSave={async (formData, table) => {
        try {
          await axios.post('/api/database', { 
            table, 
            data: formData 
          });
          toast.success('Payroll processed successfully!');
          fetchData('payroll');
        } catch (error) {
          toast.error('Failed to process payroll');
          console.error(error);
        }
      }}
    />
  </>
)}
```

---

## Next Steps

1. ✅ Run database migration
2. ✅ Import components
3. ✅ Add to your page
4. ✅ Test with sample data
5. ✅ Generate payslips
6. ✅ Process first payroll

**You're all set! 🎉**
