# Phase 2: Advanced Features Implementation Plan

## Overview
This phase adds enterprise-grade features including geofenced attendance, client portal, compliance vault, WhatsApp automation, and profitability analytics.

---

## Feature 1: Geofenced Facial Recognition Attendance

### Business Value
- Prevent buddy punching and fake attendance
- Ensure employees are physically at client site
- Build trust with clients through verified attendance
- Reduce attendance fraud by 95%

### Technical Implementation

#### 1.1 Geofence Setup (Admin)
**Component:** `src/components/GeofenceManager.js`

**Features:**
- Interactive map to set client site location
- Drop pin on exact location
- Set radius (50m, 100m, 200m, 500m)
- Save lat/lng/radius to client profile
- Visual circle showing geofence boundary

**Tech Stack:**
- Google Maps API or Leaflet.js
- Geolocation API
- Haversine formula for distance calculation

**Database Changes:**
```javascript
// Add to Clients sheet
Geofence Lat | Geofence Lng | Geofence Radius | Geofence Active
18.5204 | 73.8567 | 100 | Yes
```

#### 1.2 Mobile Attendance App
**Component:** `src/components/MobileAttendance.js`

**Workflow:**
1. Employee opens app at client site
2. App requests location permission
3. App captures GPS coordinates
4. App opens camera for selfie
5. System verifies:
   - Employee is within geofence radius
   - Face matches stored photo
   - Not duplicate punch (same day)
6. If all pass → Attendance marked
7. If fail → Show error with reason

**Face Recognition Options:**
- **Option A:** Face-API.js (client-side, free)
- **Option B:** AWS Rekognition (cloud, paid, more accurate)
- **Option C:** Azure Face API (cloud, paid)

**Implementation Steps:**
```javascript
// 1. Get GPS coordinates
navigator.geolocation.getCurrentPosition()

// 2. Calculate distance from geofence center
const distance = calculateDistance(
  employeeLat, employeeLng,
  geofenceLat, geofenceLng
)

// 3. Check if within radius
if (distance <= geofenceRadius) {
  // 4. Capture face
  const faceImage = await capturePhoto()
  
  // 5. Verify face
  const faceMatch = await verifyFace(faceImage, storedFaceId)
  
  // 6. Mark attendance
  if (faceMatch.confidence > 0.85) {
    markAttendance()
  }
}
```

#### 1.3 Face Enrollment
**Component:** `src/components/FaceEnrollment.js`

**Process:**
1. During employee onboarding
2. Capture 3-5 photos from different angles
3. Upload to face recognition service
4. Store face ID in employee profile
5. Use for future verification

**Database Changes:**
```javascript
// Add to Employees sheet
Face ID | Face Enrolled | Face Photos Count
face_emp001_xyz | Yes | 5
```

#### 1.4 Attendance Verification Dashboard
**Component:** `src/components/AttendanceVerification.js`

**Features:**
- View all attendance punches
- See GPS coordinates on map
- View selfie taken at punch time
- Distance from geofence center
- Verification status (Pass/Fail)
- Reject suspicious punches
- Export verified attendance

---

## Feature 2: Client Portal (Read-Only Access)

### Business Value
- Clients can self-serve attendance data
- Reduces admin queries by 70%
- Builds transparency and trust
- Clients can approve timesheets
- Download invoices anytime

### Technical Implementation

#### 2.1 Client Authentication
**Component:** `src/app/client-portal/login/page.js`

**Features:**
- Separate login page: `/client-portal`
- Client-specific credentials
- JWT token-based authentication
- Session management
- Password reset via email

**Database Changes:**
```javascript
// Add to Clients sheet
Portal Username | Portal Password (Hashed) | Portal Active | Last Login
zp_pune | $2b$10$... | Yes | 2026-05-06 10:30
```

**Implementation:**
```javascript
// API Route: /api/client-auth
export async function POST(req) {
  const { username, password } = await req.json()
  
  // Verify credentials
  const client = await findClient(username)
  const isValid = await bcrypt.compare(password, client.password)
  
  if (isValid) {
    // Generate JWT token
    const token = jwt.sign(
      { clientId: client.id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    return Response.json({ token, client })
  }
}
```

#### 2.2 Client Dashboard
**Component:** `src/app/client-portal/dashboard/page.js`

**Features:**
- Welcome message with client name
- Quick stats:
  - Total deployed staff
  - Present today
  - On leave today
  - This month's attendance %
- Recent activity feed
- Pending approvals count

#### 2.3 Deployed Staff View
**Component:** `src/app/client-portal/staff/page.js`

**Features:**
- List of all employees deployed to this client
- Employee details (name, role, shift timings)
- Current status (Present/Absent/Leave)
- Contact information
- Deployment date
- **Hidden:** Salary information (Pay Rate and Bill Rate)

**Data Filtering:**
```javascript
// Only show employees deployed to this client
const deployedStaff = employees.filter(
  emp => emp['Assigned Client'] === clientName &&
         emp['Deployment Status'] === 'Deployed'
)

// Remove sensitive fields
const sanitizedStaff = deployedStaff.map(emp => ({
  name: emp.Employee,
  role: emp.Role,
  status: emp.Status,
  phone: emp.Phone,
  // Exclude: salary, bill rate, commission
}))
```

#### 2.4 Live Attendance Dashboard
**Component:** `src/app/client-portal/attendance/page.js`

**Features:**
- Calendar view of attendance
- Filter by date range
- Employee-wise attendance
- Daily summary (Present/Absent/Leave)
- Attendance percentage
- Export to Excel
- Real-time updates

**Visualizations:**
- Attendance heatmap calendar
- Daily attendance chart
- Employee-wise attendance bars
- Monthly trends

#### 2.5 Timesheet Approval
**Component:** `src/app/client-portal/timesheets/page.js`

**Workflow:**
1. Admin locks attendance at month-end
2. System generates timesheet for client
3. Client receives notification
4. Client reviews timesheet in portal
5. Client can:
   - Approve timesheet
   - Reject with comments
   - Request corrections
6. Once approved → Invoice generated

**Features:**
- Month-wise timesheet view
- Employee-wise breakdown
- Total working days
- Leaves taken
- Approve/Reject buttons
- Comments section
- Approval history

#### 2.6 Invoice Management
**Component:** `src/app/client-portal/invoices/page.js`

**Features:**
- List of all invoices for this client
- Filter by month, status
- View invoice details
- Download PDF
- Payment status
- Payment history
- Due date reminders

**Security:**
- Client can only see their own invoices
- Cannot see other clients' data
- Cannot see cost breakdown (your margins)
- Read-only access (no editing)

---

## Feature 3: Compliance Challan Vault

### Business Value
- Centralized document storage
- Easy access during audits
- Client confidence in compliance
- Attach proof to invoices
- Reduce compliance queries

### Technical Implementation

#### 3.1 Document Upload System
**Component:** `src/components/ComplianceVault.js`

**Features:**
- Upload PF challans (monthly)
- Upload ESIC challans (monthly)
- Upload PT challans (monthly)
- Upload other statutory documents
- Tag to specific clients
- Tag to specific month
- Add notes/descriptions

**File Storage Options:**
- **Option A:** Google Drive API (free, 15GB)
- **Option B:** AWS S3 (paid, unlimited)
- **Option C:** Cloudinary (free tier, 10GB)

**Database Changes:**
```javascript
// New Sheet: Compliance_Documents
Document ID | Document Type | Month | Client Name | File URL | Upload Date | Uploaded By | Notes
DOC001 | PF Challan | 2026-01 | Zilla Parishad IT | https://... | 2026-02-05 | Admin | January PF payment
```

**Implementation:**
```javascript
// Upload to Google Drive
const uploadToGoogleDrive = async (file, metadata) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', metadata.name)
  formData.append('parents', [COMPLIANCE_FOLDER_ID])
  
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: formData
    }
  )
  
  return response.json()
}
```

#### 3.2 Document Organization
**Component:** `src/components/ComplianceVaultBrowser.js`

**Features:**
- Folder structure:
  - By Year → Month → Document Type
  - By Client → Year → Month
- Search by document type, month, client
- Filter by date range
- Sort by upload date
- Bulk download

#### 3.3 Invoice Attachment
**Enhancement to:** `src/components/ClientInvoicing.js`

**Features:**
- When generating invoice
- Show list of compliance documents for that month
- Select documents to attach
- Documents linked to invoice
- Client can view attached documents in portal

**Implementation:**
```javascript
// In invoice generation
const relevantDocs = complianceDocuments.filter(
  doc => doc.Month === invoiceMonth &&
         doc['Client Name'] === clientName
)

// Attach to invoice
invoice.attachedDocuments = relevantDocs.map(doc => ({
  type: doc['Document Type'],
  url: doc['File URL']
}))
```

#### 3.4 Audit Trail
**Component:** `src/components/ComplianceAuditLog.js`

**Features:**
- Log all document uploads
- Log all document views
- Log all document downloads
- Who accessed what and when
- Export audit log

---

## Feature 4: WhatsApp API Automation

### Business Value
- Instant notifications
- 98% open rate (vs 20% email)
- Reduce manual communication
- Professional image
- Automated reminders

### Technical Implementation

#### 4.1 WhatsApp Business API Setup

**Options:**
- **Option A:** Twilio WhatsApp API (paid, official)
- **Option B:** WhatsApp Business API (official, requires approval)
- **Option C:** WATI.io (paid, easy setup)
- **Option D:** Gupshup (paid, India-focused)

**Setup Steps:**
1. Register WhatsApp Business Account
2. Get API credentials
3. Create message templates
4. Get templates approved by WhatsApp
5. Integrate API

**Environment Variables:**
```env
WHATSAPP_API_KEY=your_api_key
WHATSAPP_PHONE_NUMBER=+919876543210
WHATSAPP_ACCOUNT_SID=your_account_sid
```

#### 4.2 Message Templates

**Template 1: Deployment Confirmation**
```
Hello {{employee_name}}! 🎉

Welcome to Vimanasa Services. You have been deployed to:

📍 Client: {{client_name}}
📅 Start Date: {{deployment_date}}
⏰ Shift: {{shift_start}} - {{shift_end}}
📍 Location: {{site_location}}

Download your ID card: {{id_card_link}}

For queries, contact: +91 98765 43210

- Vimanasa HR Team
```

**Template 2: Payslip Delivery**
```
Hi {{employee_name}},

Your salary for {{month}} has been processed! 💰

Salary: ₹{{amount}}
Status: {{status}}

Download payslip: {{payslip_link}}

Thank you for your hard work!

- Vimanasa Payroll Team
```

**Template 3: Shift Reminder**
```
Good morning {{employee_name}}! ☀️

Reminder: Your shift starts at {{shift_start}} today.

📍 Location: {{site_location}}
👤 Client: {{client_name}}

Don't forget to mark attendance!

Have a great day! 😊
```

**Template 4: Leave Approval**
```
Hi {{employee_name}},

Your leave request has been {{status}}! ✅

Leave Type: {{leave_type}}
Dates: {{start_date}} to {{end_date}}
Days: {{total_days}}

{{approval_comments}}

- Vimanasa HR Team
```

**Template 5: Invoice to Client**
```
Dear {{client_name}},

Your invoice for {{month}} is ready! 📄

Invoice #: {{invoice_number}}
Amount: ₹{{amount}}
Due Date: {{due_date}}

Download invoice: {{invoice_link}}

For queries: billing@vimanasa.com

Thank you for your business!

- Vimanasa Billing Team
```

#### 4.3 Automation Triggers

**Component:** `src/lib/whatsappAutomation.js`

**Trigger Points:**
```javascript
// 1. On Employee Deployment
const sendDeploymentMessage = async (employee, client) => {
  await sendWhatsApp({
    to: employee.Phone,
    template: 'deployment_confirmation',
    params: {
      employee_name: employee.Employee,
      client_name: client['Client Name'],
      deployment_date: employee['Deployment Date'],
      shift_start: employee['Shift Start'],
      shift_end: employee['Shift End'],
      site_location: employee['Site Location'],
      id_card_link: generateIDCardLink(employee)
    }
  })
}

// 2. On Payslip Generation
const sendPayslipMessage = async (employee, payslip) => {
  await sendWhatsApp({
    to: employee.Phone,
    template: 'payslip_delivery',
    params: {
      employee_name: employee.Employee,
      month: payslip.Month,
      amount: payslip['Total Pay Rate'],
      status: 'Processed',
      payslip_link: generatePayslipLink(payslip)
    }
  })
}

// 3. Daily Shift Reminder (Scheduled)
const sendShiftReminders = async () => {
  const deployedEmployees = employees.filter(
    emp => emp['Deployment Status'] === 'Deployed'
  )
  
  for (const emp of deployedEmployees) {
    await sendWhatsApp({
      to: emp.Phone,
      template: 'shift_reminder',
      params: {
        employee_name: emp.Employee,
        shift_start: emp['Shift Start'],
        site_location: emp['Site Location'],
        client_name: emp['Assigned Client']
      }
    })
  }
}

// 4. On Leave Approval/Rejection
const sendLeaveStatusMessage = async (employee, leaveRequest) => {
  await sendWhatsApp({
    to: employee.Phone,
    template: 'leave_approval',
    params: {
      employee_name: employee.Employee,
      status: leaveRequest.Status,
      leave_type: leaveRequest['Leave Type'],
      start_date: leaveRequest['Start Date'],
      end_date: leaveRequest['End Date'],
      total_days: leaveRequest['Total Days'],
      approval_comments: leaveRequest.Comments || ''
    }
  })
}

// 5. On Invoice Generation
const sendInvoiceToClient = async (client, invoice) => {
  await sendWhatsApp({
    to: client['Contact Phone'],
    template: 'invoice_delivery',
    params: {
      client_name: client['Client Name'],
      month: invoice.Month,
      invoice_number: invoice['Invoice Number'],
      amount: invoice['Invoice Amount'],
      due_date: invoice['Due Date'],
      invoice_link: generateInvoiceLink(invoice)
    }
  })
}
```

#### 4.4 Scheduled Messages

**Component:** `src/lib/scheduledMessages.js`

**Cron Jobs:**
```javascript
// Daily at 7:00 AM - Shift reminders
cron.schedule('0 7 * * *', () => {
  sendShiftReminders()
})

// Daily at 8:00 PM - Attendance reminder
cron.schedule('0 20 * * *', () => {
  sendAttendanceReminders()
})

// 1st of every month - Payslip delivery
cron.schedule('0 9 1 * *', () => {
  sendMonthlyPayslips()
})

// 5th of every month - Invoice delivery
cron.schedule('0 10 5 * *', () => {
  sendMonthlyInvoices()
})
```

#### 4.5 Message Status Tracking

**Database Changes:**
```javascript
// New Sheet: WhatsApp_Messages
Message ID | Recipient | Template | Status | Sent At | Delivered At | Read At | Failed Reason
MSG001 | +919876543210 | deployment_confirmation | Delivered | 2026-05-06 10:30 | 2026-05-06 10:31 | 2026-05-06 10:35 |
```

**Status Tracking:**
- Queued
- Sent
- Delivered
- Read
- Failed

---

## Feature 5: Margin & Profitability Dashboard

### Business Value
- Real-time profit visibility
- Identify most profitable clients
- Track on-bench costs
- Make data-driven decisions
- Optimize pricing

### Technical Implementation

#### 5.1 Profitability Dashboard
**Component:** `src/components/ProfitabilityDashboard.js`

**Key Metrics:**

**1. Monthly Overview:**
```javascript
const monthlyMetrics = {
  totalRevenue: sum(invoices.filter(inv => inv.Month === currentMonth)),
  totalPayroll: sum(employees.map(emp => emp['Total Pay Rate'])),
  totalStatutory: sum(employees.map(emp => 
    parseFloat(emp['Employer PF']) + parseFloat(emp['Employer ESIC'])
  )),
  totalCosts: totalPayroll + totalStatutory,
  grossMargin: totalRevenue - totalCosts,
  marginPercentage: (grossMargin / totalRevenue) * 100
}
```

**2. Client-wise Profitability:**
```javascript
const clientProfitability = clients.map(client => {
  const deployedToClient = employees.filter(
    emp => emp['Assigned Client'] === client['Client Name']
  )
  
  const revenue = deployedToClient.reduce((sum, emp) => 
    sum + parseFloat(emp['Final Invoice Amount']), 0
  )
  
  const costs = deployedToClient.reduce((sum, emp) => 
    sum + parseFloat(emp['Total Pay Rate']) + 
    parseFloat(emp['Employer PF']) + 
    parseFloat(emp['Employer ESIC']), 0
  )
  
  return {
    clientName: client['Client Name'],
    deployedCount: deployedToClient.length,
    monthlyRevenue: revenue,
    monthlyCosts: costs,
    monthlyProfit: revenue - costs,
    marginPercentage: ((revenue - costs) / revenue) * 100
  }
})
```

**3. On-Bench Cost Analysis:**
```javascript
const onBenchEmployees = employees.filter(
  emp => emp['Deployment Status'] === 'On Bench'
)

const onBenchCost = onBenchEmployees.reduce((sum, emp) => 
  sum + parseFloat(emp['Total Pay Rate']) + 
  parseFloat(emp['Employer PF']) + 
  parseFloat(emp['Employer ESIC']), 0
)

const onBenchMetrics = {
  count: onBenchEmployees.length,
  monthlyCost: onBenchCost,
  annualCost: onBenchCost * 12,
  percentageOfWorkforce: (onBenchEmployees.length / employees.length) * 100
}
```

**4. Revenue per Employee:**
```javascript
const revenuePerEmployee = employees.map(emp => ({
  name: emp.Employee,
  role: emp.Role,
  deploymentStatus: emp['Deployment Status'],
  monthlyRevenue: emp['Deployment Status'] === 'Deployed' 
    ? parseFloat(emp['Final Invoice Amount']) 
    : 0,
  monthlyCost: parseFloat(emp['Total Pay Rate']) + 
               parseFloat(emp['Employer PF']) + 
               parseFloat(emp['Employer ESIC']),
  monthlyProfit: emp['Deployment Status'] === 'Deployed'
    ? parseFloat(emp['Final Invoice Amount']) - 
      (parseFloat(emp['Total Pay Rate']) + 
       parseFloat(emp['Employer PF']) + 
       parseFloat(emp['Employer ESIC']))
    : -(parseFloat(emp['Total Pay Rate']) + 
        parseFloat(emp['Employer PF']) + 
        parseFloat(emp['Employer ESIC']))
}))
```

#### 5.2 Visualizations

**Charts to Include:**
1. **Monthly Revenue vs Cost Trend** (Line chart)
2. **Client-wise Profit Margin** (Bar chart)
3. **Deployment Status Distribution** (Pie chart)
4. **On-Bench Cost Over Time** (Area chart)
5. **Top 5 Profitable Clients** (Horizontal bar)
6. **Revenue per Employee** (Scatter plot)

**Libraries:**
- Chart.js
- Recharts
- ApexCharts

#### 5.3 Profitability Reports

**Component:** `src/components/ProfitabilityReports.js`

**Report Types:**
1. **Monthly P&L Statement**
   - Revenue breakdown
   - Cost breakdown
   - Gross margin
   - Net margin

2. **Client Profitability Report**
   - Client-wise revenue
   - Client-wise costs
   - Client-wise margins
   - Ranking by profitability

3. **Employee Utilization Report**
   - Deployed vs On-Bench
   - Utilization percentage
   - Revenue per employee
   - Cost per employee

4. **Quarterly Business Review**
   - 3-month trends
   - Growth metrics
   - Key insights
   - Recommendations

**Export Options:**
- PDF
- Excel
- CSV

---

## Implementation Timeline

### Week 1-2: Geofenced Attendance
- Day 1-2: Geofence setup UI
- Day 3-5: Mobile attendance app
- Day 6-7: Face recognition integration
- Day 8-10: Testing and refinement

### Week 3-4: Client Portal
- Day 1-3: Authentication system
- Day 4-6: Dashboard and staff view
- Day 7-9: Attendance and timesheet approval
- Day 10-12: Invoice management
- Day 13-14: Testing and security audit

### Week 5: Compliance Vault
- Day 1-2: Document upload system
- Day 3-4: Organization and search
- Day 5: Invoice attachment
- Day 6-7: Testing

### Week 6: WhatsApp Automation
- Day 1-2: API setup and templates
- Day 3-4: Automation triggers
- Day 5: Scheduled messages
- Day 6-7: Testing and monitoring

### Week 7: Profitability Dashboard
- Day 1-3: Metrics calculation
- Day 4-6: Visualizations
- Day 7: Reports and exports

---

## Dependencies & Costs

### APIs & Services:
1. **Google Maps API:** $200/month (for geofencing)
2. **AWS Rekognition:** $1 per 1000 faces (for face recognition)
3. **Twilio WhatsApp:** $0.005 per message (for WhatsApp)
4. **Google Drive API:** Free (for document storage)

**Total Estimated Cost:** ~$300-500/month

### NPM Packages:
```json
{
  "face-api.js": "^0.22.2",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "twilio": "^4.20.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "node-cron": "^3.0.3",
  "chart.js": "^4.4.1",
  "react-chartjs-2": "^5.2.0"
}
```

---

## Testing Checklist

### Geofenced Attendance:
- [ ] Geofence setup saves correctly
- [ ] GPS coordinates captured accurately
- [ ] Distance calculation works
- [ ] Face recognition verifies correctly
- [ ] Attendance marked only within geofence
- [ ] Error messages clear and helpful

### Client Portal:
- [ ] Client can login successfully
- [ ] Client sees only their data
- [ ] Attendance displays correctly
- [ ] Timesheet approval works
- [ ] Invoices download properly
- [ ] Security: No access to other clients' data

### Compliance Vault:
- [ ] Documents upload successfully
- [ ] Search and filter work
- [ ] Documents attach to invoices
- [ ] Audit trail logs correctly

### WhatsApp Automation:
- [ ] Messages send successfully
- [ ] Templates render correctly
- [ ] Scheduled messages trigger on time
- [ ] Status tracking works
- [ ] Failed messages retry

### Profitability Dashboard:
- [ ] Metrics calculate correctly
- [ ] Charts display properly
- [ ] Reports export successfully
- [ ] Data updates in real-time

---

## Security Considerations

### Client Portal:
- JWT token expiration (8 hours)
- Password hashing (bcrypt)
- Rate limiting on login
- HTTPS only
- CORS restrictions
- SQL injection prevention

### Document Storage:
- Encrypted file storage
- Access control lists
- Audit logging
- Secure file URLs (signed URLs)

### WhatsApp:
- API key security
- Message encryption
- Rate limiting
- Spam prevention

---

## Phase 2 Complete Deliverables

1. ✅ Geofenced facial recognition attendance
2. ✅ Client portal with read-only access
3. ✅ Compliance document vault
4. ✅ WhatsApp automation system
5. ✅ Profitability analytics dashboard
6. ✅ Comprehensive testing
7. ✅ Documentation and training materials

---

**Ready to implement when you are!** 🚀

Each feature can be implemented independently or all together based on your priority.
