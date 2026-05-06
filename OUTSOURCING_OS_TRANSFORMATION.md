# Vimanasa Nexus: Outsourcing OS Transformation Plan

## Executive Summary
Transform from single-tenant HRMS to multi-tenant Outsourcing Management System with dual-salary structure, automated client invoicing, and advanced compliance features.

---

## Phase 1: Core Structural Changes

### 1.1 Client Management Module (NEW)
**Replace:** Department-based grouping  
**Add:** Comprehensive Client entity

**Client Schema:**
```javascript
{
  clientId: "CLI001",
  clientName: "Zilla Parishad IT Department",
  gstNumber: "27AABCU9603R1ZM",
  billingAddress: {},
  contactPerson: {},
  paymentTerms: "Net 30",
  agencyMargin: 8.5, // % or flat fee (ADMIN ONLY)
  marginType: "percentage", // or "flat"
  status: "Active",
  contractStartDate: "2026-01-01",
  contractEndDate: "2027-01-01",
  managesLeaves: false, // Does client manage leaves?
  geofenceLocation: { lat, lng, radius: 100 },
  createdAt: timestamp
}
```

### 1.2 Employee Deployment Status (MODIFY)
**Add to Employee Schema:**
```javascript
{
  deploymentStatus: "Deployed" | "On Bench" | "Inactive",
  assignedClient: "CLI001", // Reference to Client
  deploymentDate: "2026-01-15",
  siteLocation: "Pune Office",
  shiftTimings: { start: "09:00", end: "18:00" }
}
```

### 1.3 Dual-Salary Financial Engine (CRITICAL)
**Employee Financial Schema:**
```javascript
{
  // VISIBLE TO EMPLOYEE & SUB-ADMIN
  payRate: {
    basicSalary: 15000,
    hra: 5000,
    allowances: 2000,
    totalPayRate: 22000
  },
  
  // VISIBLE ONLY TO SUPER ADMIN
  billRate: {
    payRate: 22000,
    employerPF: 1800,      // 12% of basic
    employerESIC: 750,     // 3.25% of gross
    agencyCommission: 2500, // Markup
    totalBillRate: 27050,
    gstAmount: 4869,       // 18% GST
    finalInvoiceAmount: 31919
  },
  
  // AUDIT TRAIL
  rateHistory: [
    { effectiveFrom: "2026-01-01", payRate: 22000, billRate: 27050 }
  ]
}
```

### 1.4 Split Finance Module
**Current:** Single Finance tracking  
**New:** Separate Payroll & Invoicing

**Payroll Module:**
- Employee salary calculations
- Statutory deductions (PF, ESIC, PT)
- Payslip generation
- Bank transfer files

**Client Invoicing Module:**
- Attendance-based billing
- Bill Rate × Present Days
- GST calculations
- Automated invoice generation
- Payment tracking

---

## Phase 2: Advanced Features

### 2.1 Client Portal (Read-Only)
**Features:**
- Secure client login
- View deployed staff
- Live attendance dashboard
- Approve monthly timesheets
- Download invoices
- View compliance documents

### 2.2 Geofenced Facial Recognition Attendance
**Implementation:**
- Admin sets geofence (lat, lng, radius)
- Mobile app captures selfie
- AI face verification (Face-API.js or AWS Rekognition)
- GPS validation within geofence
- Reject if outside radius or face mismatch

### 2.3 Compliance Challan Vault
**Features:**
- Upload PF/ESIC challans
- Tag to specific clients
- Month-wise organization
- Attach to client invoices
- Secure document storage

### 2.4 WhatsApp API Integration
**Automation Triggers:**
- Deployment confirmation
- ID card download link
- Shift reminders
- Payslip delivery
- Leave approval notifications
- Invoice delivery to clients

### 2.5 Margin & Profitability Dashboard
**Metrics:**
- Total Client Invoices (Month)
- Total Payroll Disbursed (Month)
- Gross Margin = Invoices - Payroll
- Margin % by Client
- On-Bench Cost Analysis
- Revenue per Employee

---

## Phase 3: Updated Workflow

### Step 1: Commercial Setup (Super Admin)
1. Create Client Profile
2. Set billing rules (GST, payment terms)
3. Configure agency margin (% or flat)
4. Set geofence location
5. Configure client-specific settings

### Step 2: Deployment & Mapping (Sub-Admin)
1. Add employee with KYC
2. Click "Deploy" → Select Client
3. Assign shift timings
4. Generate ID card
5. Send WhatsApp welcome message

### Step 3: Daily Operations (Employee)
1. Arrive at client site
2. Open mobile app
3. Take selfie within geofence
4. System verifies face + location
5. Punch In/Out recorded
6. Apply leave if needed

### Step 4: Monthly Billing Cycle (Automated)
1. **Day 30/31:** Sub-Admin locks attendance
2. **Payroll Run:**
   - Calculate salaries (Pay Rate)
   - Generate payslips
   - Create bank transfer file
3. **Invoice Run:**
   - Calculate billing (Bill Rate × Days)
   - Add GST (18%)
   - Generate branded PDF invoice
   - Attach compliance challans
4. **Distribution:**
   - Email invoices to clients
   - WhatsApp payslips to employees
   - Update payment tracking

---

## Database Schema Changes

### New Collections/Sheets:

1. **Clients**
   - Client profiles
   - Billing configurations
   - Geofence settings

2. **Deployments**
   - Employee-Client mappings
   - Deployment history
   - Bench tracking

3. **Dual_Financials**
   - Pay Rate (visible to employee)
   - Bill Rate (admin only)
   - Rate history

4. **Client_Invoices**
   - Invoice details
   - Payment status
   - Attached documents

5. **Compliance_Vault**
   - PF/ESIC challans
   - Client-wise organization
   - Document metadata

6. **Geofence_Attendance**
   - Location data
   - Face verification status
   - Punch records

---

## Security & Access Control

### Role-Based Permissions:

**Super Admin:**
- Full access to all modules
- View/edit Bill Rates
- View agency margins
- Access profitability dashboard

**Sub-Admin:**
- Manage employees
- Deploy to clients
- Lock attendance
- Generate payslips
- View Pay Rates only

**Employee:**
- View own profile
- View Pay Rate only
- Mark attendance
- Apply leaves
- Download payslips

**Client (Portal):**
- View deployed staff
- View attendance
- Approve timesheets
- Download invoices
- View compliance docs

---

## Implementation Priority

### Phase 1A (Core - Week 1-2):
1. ✅ Client Management Module
2. ✅ Employee Deployment Status
3. ✅ Dual-Salary Structure
4. ✅ Role-Based Access Control

### Phase 1B (Billing - Week 3-4):
1. ✅ Client Invoicing Engine
2. ✅ Automated Invoice Generation
3. ✅ GST Calculations
4. ✅ Payment Tracking

### Phase 2A (Advanced - Week 5-6):
1. ⏳ Geofenced Attendance
2. ⏳ Compliance Vault
3. ⏳ Margin Dashboard

### Phase 2B (Integration - Week 7-8):
1. ⏳ Client Portal
2. ⏳ WhatsApp API
3. ⏳ Face Recognition

---

## Technical Stack Additions

**New Dependencies:**
- `face-api.js` - Face recognition
- `twilio` or `whatsapp-web.js` - WhatsApp integration
- `pdfkit` - Enhanced invoice generation
- `bcryptjs` - Client portal authentication
- `jsonwebtoken` - Client portal sessions

**Google Sheets Structure:**
- Add "Clients" sheet
- Add "Deployments" sheet
- Add "Client_Invoices" sheet
- Add "Dual_Financials" sheet
- Modify "Employees" sheet

---

## Next Steps

1. Review and approve this transformation plan
2. Begin Phase 1A implementation
3. Set up new Google Sheets structure
4. Implement Client Management Module
5. Build Dual-Salary Engine
6. Create Invoice Generation System

**Estimated Timeline:** 8-10 weeks for complete transformation
**Priority:** Phase 1 (Core) must be completed before Phase 2 (Advanced)
