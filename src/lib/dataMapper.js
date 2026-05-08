// Data Mapper to translate frontend Google Sheets-style keys to Supabase PostgreSQL schema

export function toDB(table, data) {
  if (!data) return data;
  
  // Create a copy to avoid mutating the original
  const dbData = { ...data };
  
  // Remove frontend-only IDs if they look like temporary ones or are handled by DB
  if (dbData.id === '') delete dbData.id;
  
  // Store the entire original object in a metadata JSONB column to prevent data loss
  // of frontend-specific fields like "Employer PF", "Total Bill Rate", etc.
  const metadata = { ...data };
  
  switch(table) {
    case 'employees':
    case 'workforce':
      return {
        ...(dbData.id && { id: dbData.id }),
        employee_id: data['ID'] || data.employee_id || `EMP${String(Date.now()).slice(-6)}`,
        name: data['Employee'] || data['First Name'] || data.name,
        email: data['Email'] || data.email,
        phone: data['Phone'] || data.phone,
        designation: data['Role'] || data.designation,
        status: (data['Status'] || data['Employee Status'] || data.status || 'Active').toLowerCase(),
        salary: parseFloat(data['Basic Salary'] || data.salary || 0),
        aadhar_number: data['Aadhar'] || data.aadhar_number,
        pan_number: data['PAN'] || data.pan_number,
        
        // Map complex UI fields to unused SQL text fields for backward compatibility
        department: data['Assigned Client'] || data.department,
        address: data['Site Location'] || data.address,
        bank_account: data['Deployment Status'] || data.bank_account,
        emergency_contact: data['Emergency Contact'] || data.emergency_contact,
        metadata // True scalable enterprise solution
      };
      
    case 'clients':
      return {
        ...(dbData.id && { id: dbData.id }),
        client_id: data['Client ID'] || data.client_id || `CLI${String(Date.now()).slice(-6)}`,
        company_name: data['Client Name'] || data['Company Name'] || data.company_name,
        contact_person: data['Contact Person'] || data.contact_person,
        email: data['Email'] || data.email,
        phone: data['Phone'] || data.phone,
        address: data['Location'] || data['Address'] || data.address,
        status: (data['Status'] || data.status || 'Active').toLowerCase(),
        billing_cycle: data['Billing Cycle'] || data.billing_cycle,
        metadata
      };
      
    case 'partners':
      return {
        ...(dbData.id && { id: dbData.id }),
        partner_id: data['Site ID'] || data['Partner ID'] || data.partner_id || `SITE${String(Date.now()).slice(-6)}`,
        company_name: data['Partner Name'] || data.company_name,
        address: data['Location'] || data.address,
        status: (data['Status'] || data.status || 'Active').toLowerCase(),
        metadata
      };
      
    case 'attendance':
      return {
        ...(dbData.id && { id: dbData.id }),
        employee_id: data.employee_id || data.employeeId, // Requires actual UUID!
        date: data['Date'] || data.date,
        status: (data['Status'] || data.status || 'Present').toLowerCase(),
        metadata
      };
      
    case 'leave_requests':
    case 'leave':
      return {
        ...(dbData.id && { id: dbData.id }),
        employee_id: data.employee_id, 
        leave_type: data['Type'] || data.leave_type || 'Annual',
        start_date: data['Start Date'] || data.start_date,
        end_date: data['End Date'] || data.end_date,
        days: parseInt(data['Days'] || data.days || 1),
        status: (data['Status'] || data.status || 'pending').toLowerCase(),
        metadata
      };
      
    case 'expense_claims':
    case 'expenses':
      return {
        ...(dbData.id && { id: dbData.id }),
        employee_id: data.employee_id,
        expense_date: data['Date'] || data.expense_date,
        category: data['Category'] || data.category,
        amount: parseFloat(String(data['Amount'] || data.amount || '0').replace(/[^0-9.]/g, '')),
        status: (data['Status'] || data.status || 'pending').toLowerCase(),
        metadata
      };
      
    case 'payroll':
      return {
        ...(dbData.id && { id: dbData.id }),
        employee_id: data.employee_id,
        month: data['Month'] || data.month,
        year: parseInt(data['Year'] || data.year || new Date().getFullYear()),
        net_salary: parseFloat(String(data['Total Payout'] || data['Amount'] || data.net_salary || '0').replace(/[^0-9.]/g, '')),
        payment_status: (data['Status'] || data.payment_status || 'pending').toLowerCase(),
        metadata
      };
      
    case 'finance':
      return {
        ...(dbData.id && { id: dbData.id }),
        transaction_date: data['Date'] || data.transaction_date,
        transaction_type: data['Type'] || data.transaction_type,
        category: data['Category'] || data.category,
        amount: parseFloat(String(data['Amount'] || data.amount || '0').replace(/[^0-9.]/g, '')),
        status: (data['Status'] || data.status || 'completed').toLowerCase(),
        metadata
      };
      
    case 'compliance':
      return {
        ...(dbData.id && { id: dbData.id }),
        compliance_type: data['Type'] || data.compliance_type || 'General',
        title: data['Requirement'] || data.title,
        due_date: data['Deadline'] || data.due_date,
        status: (data['Status'] || data.status || 'pending').toLowerCase(),
        document_url: data['Doc Link'] || data.document_url,
        metadata
      };
      
    case 'invoices':
    case 'client_invoices':
      return {
        ...(dbData.id && { id: dbData.id }),
        invoice_number: data['Invoice Number'] || data.invoice_number,
        invoice_date: data['Invoice Date'] || data.invoice_date || new Date().toISOString().split('T')[0],
        // Omit client_id as the DB expects a UUID, we store it safely in metadata
        due_date: data['Due Date'] || data.due_date,
        amount: parseFloat(String(data['Invoice Amount'] || data.invoice_amount || data.amount || '0').replace(/[^0-9.]/g, '')),
        total_amount: parseFloat(String(data['Invoice Amount'] || data.invoice_amount || data.total_amount || '0').replace(/[^0-9.]/g, '')),
        tax_amount: parseFloat(String(data['GST Amount'] || data.tax_amount || '0').replace(/[^0-9.]/g, '')),
        status: (data['Status'] || data.status || 'pending').toLowerCase(),
        description: data['Month'] || data.month || data.description,
        metadata
      };

    case 'candidates':
      return {
        ...(dbData.id && { id: dbData.id }),
        job_title: data['Job Title'] || data.job_title,
        job_id: data['Job ID'] || data.job_id,
        full_name: data['Full Name'] || data.full_name,
        phone: data['Phone'] || data.phone,
        email: data['Email'] || data.email,
        date_of_birth: data['Date of Birth'] || data.date_of_birth,
        gender: data['Gender'] || data.gender,
        address: data['Address'] || data.address,
        aadhar_number: data['Aadhar'] || data.aadhar_number,
        pan_number: data['PAN'] || data.pan_number,
        current_employer: data['Current Employer'] || data.current_employer,
        total_experience_years: parseInt(data['Experience'] || data.total_experience_years || 0),
        current_salary: parseFloat(String(data['Current Salary'] || data.current_salary || '0').replace(/[^0-9.]/g, '')),
        expected_salary: parseFloat(String(data['Expected Salary'] || data.expected_salary || '0').replace(/[^0-9.]/g, '')),
        notice_period_days: parseInt(data['Notice Period'] || data.notice_period_days || 30),
        skills: data['Skills'] || data.skills,
        resume_url: data['Resume Link'] || data.resume_url,
        photo_url: data['Photo Link'] || data.photo_url,
        status: (data['Status'] || data.status || 'pending').toLowerCase(),
        admin_notes: data.admin_notes || '',
        ...(data.metadata ? { metadata: data.metadata } : {})
      };
      
    default:
      // If no mapping, just try to send it as is, Supabase will reject invalid columns
      return dbData;
  }
}

export function toFrontend(table, data) {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(item => toFrontend(table, item));
  
  // Merge back to frontend expected structure
  switch(table) {
    case 'employees':
    case 'workforce': {
      const meta = data.metadata || {};
      
      return {
        id: data.id,
        'ID': data.employee_id,
        'Employee': data.name,
        'Email': data.email,
        'Phone': data.phone,
        'Role': data.designation,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Active',
        'Basic Salary': data.salary,
        'Aadhar': data.aadhar_number,
        'PAN': data.pan_number,
        
        'Assigned Client': data.department || '',
        'Site Location': data.address || '',
        'Deployment Status': data.bank_account || 'On Bench',
        'Shift Start': meta['Shift Start'] || meta.shiftStart || '09:00',
        'Shift End': meta['Shift End'] || meta.shiftEnd || '18:00',
        'HRA': meta['HRA'] || meta.hra || 0,
        'Allowances': meta['Allowances'] || meta.allowances || 0,
        'Agency Commission': meta['Agency Commission'] || meta.agencyCommission || 0,
        ...data, // Keep rest
        ...meta // Override with true metadata
      };
    }
      
    case 'clients':
      return {
        id: data.id,
        'Client ID': data.client_id,
        'Client Name': data.company_name,
        'Company Name': data.company_name,
        'Contact Person': data.contact_person,
        'Email': data.email,
        'Phone': data.phone,
        'Location': data.address,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Active',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'partners':
      return {
        id: data.id,
        'Site ID': data.partner_id,
        'Partner Name': data.company_name,
        'Location': data.address,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Active',
        'Headcount': data.headcount || 0,
        ...data,
        ...(data.metadata || {})
      };
      
    case 'attendance':
      return {
        id: data.id,
        'Date': data.date,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Present',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'leave_requests':
    case 'leave':
      return {
        id: data.id,
        'Type': data.leave_type,
        'Start Date': data.start_date,
        'End Date': data.end_date,
        'Days': data.days,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'expense_claims':
    case 'expenses':
      return {
        id: data.id,
        'Date': data.expense_date,
        'Category': data.category,
        'Amount': `₹${data.amount}`,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'payroll':
      return {
        id: data.id,
        'Month': data.month,
        'Total Payout': `₹${data.net_salary}`,
        'Status': data.payment_status ? data.payment_status.charAt(0).toUpperCase() + data.payment_status.slice(1) : 'Pending',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'finance':
      return {
        id: data.id,
        'Date': data.transaction_date,
        'Type': data.transaction_type ? data.transaction_type.charAt(0).toUpperCase() + data.transaction_type.slice(1) : 'Income',
        'Category': data.category,
        'Amount': `₹${data.amount}`,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Completed',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'compliance':
      return {
        id: data.id,
        'Requirement': data.title,
        'Deadline': data.due_date,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
        'Doc Link': data.document_url || '',
        ...data,
        ...(data.metadata || {})
      };
      
    case 'invoices':
    case 'client_invoices':
      return {
        id: data.id,
        'Invoice Number': data.invoice_number,
        'Client ID': data.client_id,
        'Client Name': data.metadata?.['Client Name'] || data.client_name,
        'Month': data.description || data.month,
        'Due Date': data.due_date,
        'Invoice Amount': data.amount,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
        ...data,
        ...(data.metadata || {})
      };

    case 'candidates':
      return {
        id: data.id,
        'Applied On': data.created_at,
        'Full Name': data.full_name,
        'Phone': data.phone,
        'Email': data.email,
        'Job Title': data.job_title,
        'Experience': `${data.total_experience_years} Years`,
        'Expected Salary': `₹${data.expected_salary}`,
        'Status': data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'Pending',
        'Resume Link': data.resume_url,
        'Photo Link': data.photo_url,
        ...data,
        ...(data.metadata || {})
      };
      
    default:
      return { ...data, ...(data.metadata || {}) };
  }
}
