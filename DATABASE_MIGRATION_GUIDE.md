# Database Migration Guide - From Google Sheets to Database

## 📊 Current Data Structure Analysis

Your Vimanasa Nexus application currently uses **Google Sheets** with the following sheets:
- **Employees** (Workforce management)
- **Clients** (Client information)
- **Partners** (Partner details)
- **Payroll** (Salary and payment records)
- **Finance** (Financial transactions)
- **Compliance** (Compliance records)
- **Attendance** (Employee attendance)
- **Leave Requests** (Leave management)
- **Expense Claims** (Expense tracking)
- **Client_Invoices** (Invoice management)

---

## 🎯 Best Database Recommendation: **Supabase (PostgreSQL)**

### Why Supabase is Perfect for Your Case:

✅ **FREE Tier Generous Limits:**
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth per month
- Unlimited API requests
- 50,000 monthly active users
- **No credit card required**

✅ **Built-in Features:**
- Real-time subscriptions (better than polling!)
- Row-level security (RLS)
- Auto-generated REST API
- Authentication built-in
- PostgreSQL (most powerful open-source DB)
- Dashboard for data management

✅ **Perfect for Your Use Case:**
- Next.js integration (official support)
- Real-time sync (replaces your polling)
- Relational data (employees, clients, invoices)
- Complex queries (reports, analytics)
- ACID compliance (data integrity)
- Scalable (can grow with your business)

✅ **Developer Experience:**
- Easy setup (5 minutes)
- Great documentation
- TypeScript support
- Prisma ORM compatible
- Vercel deployment friendly

---

## 🔄 Alternative Options Comparison

### 1. **Supabase (PostgreSQL)** ⭐ RECOMMENDED
**Free Tier:** 500 MB, unlimited requests  
**Pros:** Real-time, built-in auth, REST API, powerful queries, relational  
**Cons:** Learning curve for SQL  
**Best For:** Your exact use case - business management with relations

### 2. **MongoDB Atlas**
**Free Tier:** 512 MB, shared cluster  
**Pros:** Flexible schema, easy to learn, JSON-like documents  
**Cons:** No real-time in free tier, less powerful for complex queries  
**Best For:** Rapidly changing schemas, document-heavy apps

### 3. **Firebase Firestore**
**Free Tier:** 1 GB storage, 50K reads/day, 20K writes/day  
**Pros:** Real-time, easy setup, Google integration  
**Cons:** Limited queries, expensive at scale, NoSQL limitations  
**Best For:** Simple apps, mobile apps, real-time chat

### 4. **PlanetScale (MySQL)**
**Free Tier:** 5 GB storage, 1 billion row reads/month  
**Pros:** Generous free tier, branching databases, MySQL  
**Cons:** No foreign keys, requires credit card  
**Best For:** MySQL users, large datasets

### 5. **Neon (PostgreSQL)**
**Free Tier:** 512 MB, 3 GB storage  
**Pros:** Serverless PostgreSQL, instant branching  
**Cons:** Smaller free tier than Supabase  
**Best For:** PostgreSQL users who need branching

---

## 🚀 Step-by-Step Migration to Supabase

### Phase 1: Setup Supabase (15 minutes)

#### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. **No credit card required!**

#### Step 2: Create New Project
1. Click "New Project"
2. Fill in details:
   - **Name:** `vimanasa-nexus`
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to your users (e.g., Mumbai for India)
   - **Pricing Plan:** Free
3. Click "Create new project"
4. Wait 2-3 minutes for setup

#### Step 3: Get API Credentials
1. Go to **Project Settings** (gear icon)
2. Click **API** tab
3. Copy these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon/public key: eyJhbGc...
   service_role key: eyJhbGc... (keep secret!)
   ```

---

### Phase 2: Create Database Schema (20 minutes)

#### Step 1: Open SQL Editor
1. In Supabase dashboard, click **SQL Editor**
2. Click **New Query**

#### Step 2: Create Tables
Copy and paste this SQL schema:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EMPLOYEES TABLE
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  designation VARCHAR(100),
  department VARCHAR(100),
  date_of_joining DATE,
  status VARCHAR(50) DEFAULT 'active',
  salary DECIMAL(10, 2),
  bank_account VARCHAR(50),
  pan_number VARCHAR(20),
  aadhar_number VARCHAR(20),
  address TEXT,
  emergency_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CLIENTS TABLE
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  gstin VARCHAR(20),
  pan_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  contract_start_date DATE,
  contract_end_date DATE,
  billing_cycle VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. PARTNERS TABLE
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id VARCHAR(50) UNIQUE NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  gstin VARCHAR(20),
  pan_number VARCHAR(20),
  partnership_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. PAYROLL TABLE
CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10, 2),
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2),
  payment_date DATE,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- 5. ATTENDANCE TABLE
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(50) DEFAULT 'present',
  hours_worked DECIMAL(4, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- 6. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. EXPENSE CLAIMS TABLE
CREATE TABLE expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  receipt_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'pending',
  approved_by VARCHAR(255),
  approved_at TIMESTAMP,
  reimbursed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. CLIENT INVOICES TABLE
CREATE TABLE client_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_date DATE NOT NULL,
  due_date DATE,
  amount DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  paid_date DATE,
  description TEXT,
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. FINANCE TABLE
CREATE TABLE finance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  reference_id VARCHAR(100),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. COMPLIANCE TABLE
CREATE TABLE compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compliance_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to VARCHAR(255),
  completed_at TIMESTAMP,
  document_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_month_year ON payroll(month, year);
CREATE INDEX idx_attendance_employee ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_expenses_employee ON expense_claims(employee_id);
CREATE INDEX idx_expenses_status ON expense_claims(status);
CREATE INDEX idx_invoices_client ON client_invoices(client_id);
CREATE INDEX idx_invoices_status ON client_invoices(status);
CREATE INDEX idx_finance_date ON finance(transaction_date);
CREATE INDEX idx_compliance_status ON compliance(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to all tables
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expense_claims_updated_at BEFORE UPDATE ON expense_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_invoices_updated_at BEFORE UPDATE ON client_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finance_updated_at BEFORE UPDATE ON finance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_updated_at BEFORE UPDATE ON compliance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** to execute the schema
4. You should see "Success. No rows returned"

---

### Phase 3: Configure Environment Variables (5 minutes)

#### Step 1: Update `.env.local`
Add these new variables (keep your existing Google Sheets variables for now):

```env
# Existing Google Sheets variables (keep for migration)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# New Supabase variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database mode (switch between 'sheets' and 'supabase')
DATABASE_MODE=sheets
```

---

### Phase 4: Install Supabase Client (2 minutes)

```bash
npm install @supabase/supabase-js
```

---

### Phase 5: Create Supabase Client (5 minutes)

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client for server (uses service role key)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);
```

---

### Phase 6: Create Database API Routes (30 minutes)

Create `src/app/api/database/route.js`:

```javascript
import { supabaseAdmin } from '@/lib/supabase';

// Map frontend tabs to database tables
const tableMapping = {
  workforce: 'employees',
  clients: 'clients',
  partners: 'partners',
  payroll: 'payroll',
  finance: 'finance',
  compliance: 'compliance',
  attendance: 'attendance',
  leave: 'leave_requests',
  expenses: 'expense_claims',
  invoices: 'client_invoices'
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get('table');
  
  if (!table) {
    return Response.json({ 
      error: 'Validation Error',
      message: 'Table name is required' 
    }, { status: 400 });
  }

  const dbTable = tableMapping[table] || table;

  try {
    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json({ 
      success: true, 
      data: data || [], 
      count: data?.length || 0 
    });
  } catch (error) {
    console.error('Database Error (GET):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { table, data: insertData } = body;
    
    if (!table || !insertData) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name and data are required' 
      }, { status: 400 });
    }

    const dbTable = tableMapping[table] || table;

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .insert(insertData)
      .select();

    if (error) throw error;

    return Response.json({ 
      success: true, 
      data: data[0],
      message: 'Data added successfully' 
    });
  } catch (error) {
    console.error('Database Error (POST):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { table, id, data: updateData } = body;
    
    if (!table || !id || !updateData) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name, ID, and data are required' 
      }, { status: 400 });
    }

    const dbTable = tableMapping[table] || table;

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return Response.json({ 
      success: true, 
      data: data[0],
      message: 'Data updated successfully' 
    });
  } catch (error) {
    console.error('Database Error (PUT):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { table, id } = body;
    
    if (!table || !id) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name and ID are required' 
      }, { status: 400 });
    }

    const dbTable = tableMapping[table] || table;

    const { error } = await supabaseAdmin
      .from(dbTable)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ 
      success: true, 
      message: 'Data deleted successfully' 
    });
  } catch (error) {
    console.error('Database Error (DELETE):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}
```

---

### Phase 7: Data Migration Script (20 minutes)

Create `migrate-to-supabase.js` in project root:

```javascript
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Sheet to table mapping
const sheetToTable = {
  'Employees': 'employees',
  'Clients': 'clients',
  'Partners': 'partners',
  'Payroll': 'payroll',
  'Attendance': 'attendance',
  'Leave Requests': 'leave_requests',
  'Expense Claims': 'expense_claims',
  'Client_Invoices': 'client_invoices',
  'Finance': 'finance',
  'Compliance': 'compliance'
};

async function fetchSheetData(sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];
    
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${sheetName}:`, error.message);
    return [];
  }
}

async function migrateSheet(sheetName, tableName) {
  console.log(`\n📊 Migrating ${sheetName} to ${tableName}...`);
  
  const data = await fetchSheetData(sheetName);
  
  if (data.length === 0) {
    console.log(`⚠️  No data found in ${sheetName}`);
    return;
  }
  
  console.log(`📝 Found ${data.length} rows`);
  
  // Transform data to match database schema
  // You'll need to customize this based on your actual column names
  const transformedData = data.map(row => {
    // Remove empty rows
    if (Object.values(row).every(val => !val)) return null;
    
    // Add any necessary transformations here
    return row;
  }).filter(Boolean);
  
  if (transformedData.length === 0) {
    console.log(`⚠️  No valid data to migrate from ${sheetName}`);
    return;
  }
  
  // Insert in batches of 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { data: inserted, error } = await supabase
      .from(tableName)
      .insert(batch)
      .select();
    
    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += inserted.length;
      console.log(`✅ Inserted batch ${i / batchSize + 1}: ${inserted.length} rows`);
    }
  }
  
  console.log(`✨ Migration complete for ${sheetName}: ${successCount} success, ${errorCount} errors`);
}

async function migrateAll() {
  console.log('🚀 Starting migration from Google Sheets to Supabase...\n');
  
  for (const [sheetName, tableName] of Object.entries(sheetToTable)) {
    await migrateSheet(sheetName, tableName);
  }
  
  console.log('\n🎉 Migration complete!');
}

migrateAll().catch(console.error);
```

Run migration:
```bash
node migrate-to-supabase.js
```

---

### Phase 8: Update Frontend to Use Database (15 minutes)

Update `src/app/page.js` - modify the `fetchData` function:

```javascript
const fetchData = useCallback(async (tab, silent = false) => {
  if (!silent) {
    setIsLoading(true);
  } else {
    setIsSyncing(true);
  }

  try {
    const databaseMode = process.env.NEXT_PUBLIC_DATABASE_MODE || 'sheets';
    let response;

    if (databaseMode === 'supabase') {
      // Use Supabase
      response = await axios.get(`/api/database?table=${tab}`);
    } else {
      // Use Google Sheets (existing code)
      const sheetName = sheetMapping[tab];
      if (!sheetName) {
        throw new Error(`No sheet mapping found for tab: ${tab}`);
      }
      response = await axios.get(`/api/gsheets?sheet=${sheetName}`);
    }

    if (response.data.success) {
      setData(prev => ({
        ...prev,
        [tab]: response.data.data
      }));
      setLastSyncTime(new Date());
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    if (!silent) {
      toast.error('Failed to fetch data');
    }
  } finally {
    if (!silent) {
      setIsLoading(false);
    } else {
      setIsSyncing(false);
    }
  }
}, []);
```

---

### Phase 9: Enable Real-Time Sync (10 minutes)

Update `src/app/page.js` to use Supabase real-time:

```javascript
import { supabase } from '@/lib/supabase';

// Add this useEffect for real-time subscriptions
useEffect(() => {
  if (process.env.NEXT_PUBLIC_DATABASE_MODE !== 'supabase') return;
  if (!isAuthenticated) return;

  const tableMapping = {
    workforce: 'employees',
    clients: 'clients',
    partners: 'partners',
    // ... add all mappings
  };

  const tableName = tableMapping[activeTab];
  if (!tableName) return;

  // Subscribe to real-time changes
  const subscription = supabase
    .channel(`${tableName}_changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tableName },
      (payload) => {
        console.log('Real-time update:', payload);
        // Refresh data
        fetchData(activeTab, true);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [activeTab, isAuthenticated, fetchData]);
```

---

### Phase 10: Testing & Gradual Migration (30 minutes)

#### Step 1: Test with Supabase
1. Update `.env.local`:
   ```env
   DATABASE_MODE=supabase
   ```
2. Restart dev server: `npm run dev`
3. Test all CRUD operations
4. Verify real-time sync works

#### Step 2: Parallel Running (Recommended)
Keep both systems running for 1-2 weeks:
- Read from Supabase
- Write to both Supabase AND Google Sheets
- Compare data regularly
- Build confidence before full switch

#### Step 3: Full Migration
Once confident:
1. Set `DATABASE_MODE=supabase` permanently
2. Remove Google Sheets API calls
3. Archive Google Sheets as backup

---

## 📋 Migration Checklist

- [ ] Create Supabase account
- [ ] Create new project
- [ ] Copy API credentials
- [ ] Run SQL schema in Supabase
- [ ] Update `.env.local` with Supabase credentials
- [ ] Install `@supabase/supabase-js`
- [ ] Create `src/lib/supabase.js`
- [ ] Create `src/app/api/database/route.js`
- [ ] Create `migrate-to-supabase.js`
- [ ] Run migration script
- [ ] Verify data in Supabase dashboard
- [ ] Update frontend to use database API
- [ ] Test all CRUD operations
- [ ] Enable real-time subscriptions
- [ ] Test real-time sync
- [ ] Run parallel for 1-2 weeks
- [ ] Full switch to Supabase
- [ ] Archive Google Sheets

---

## 🎯 Benefits After Migration

### Performance
- ⚡ **10x faster** queries (indexed database vs sheet scanning)
- 🚀 **Real-time updates** (no polling needed)
- 📊 **Complex queries** (joins, aggregations, filtering)

### Features
- 🔐 **Row-level security** (fine-grained permissions)
- 🔄 **ACID transactions** (data integrity)
- 📈 **Scalability** (millions of rows)
- 🔍 **Full-text search** (built-in)

### Developer Experience
- 🛠️ **Auto-generated API** (no manual routes)
- 📝 **TypeScript types** (auto-generated)
- 🎨 **Dashboard UI** (manage data visually)
- 📚 **Better documentation** (PostgreSQL ecosystem)

---

## 💰 Cost Comparison

### Google Sheets (Current)
- ✅ Free
- ❌ 5M cells limit
- ❌ Slow for large datasets
- ❌ No real-time
- ❌ Limited queries

### Supabase Free Tier
- ✅ Free forever
- ✅ 500 MB database
- ✅ Unlimited API requests
- ✅ Real-time included
- ✅ 50K monthly active users
- ✅ No credit card required

**Upgrade Path:**
- Pro: $25/month (8 GB database, 50 GB bandwidth)
- Team: $599/month (unlimited)

---

## 🆘 Support & Resources

### Supabase Documentation
- Official Docs: https://supabase.com/docs
- Next.js Guide: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Real-time: https://supabase.com/docs/guides/realtime

### Community
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase
- Twitter: @supabase

---

## 🚨 Important Notes

1. **Backup First:** Export all Google Sheets data before migration
2. **Test Thoroughly:** Test all features in development first
3. **Gradual Migration:** Run both systems in parallel initially
4. **Monitor Closely:** Watch for any data inconsistencies
5. **Keep Credentials Safe:** Never commit `.env.local` to git

---

**Ready to migrate? Let me know and I'll help you with each step!** 🚀
