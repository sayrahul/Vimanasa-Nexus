# Vimanasa Nexus - Complete Setup Guide

## Step-by-Step Setup Instructions

### 1. Google Cloud Setup

#### Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Vimanasa Nexus" and click "Create"

#### Enable Google Sheets API
1. In the Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

#### Create Service Account
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Name: `vimanasa-service-account`
4. Click "Create and Continue"
5. Skip optional steps and click "Done"

#### Generate Service Account Key
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON" format
5. Download the key file (keep it secure!)

#### Extract Credentials
From the downloaded JSON file, you need:
- `client_email` → Use as `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → Use as `GOOGLE_PRIVATE_KEY`

### 2. Google Sheets Setup

#### Create the Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "Vimanasa Nexus Data"
3. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

#### Create Required Sheets

**Sheet 1: Dashboard**
| Staff | Deployed | Clients | Payroll |
|-------|----------|---------|---------|
| 124   | 98       | 12      | ₹1.2M   |

**Sheet 2: Workforce**
| ID | Employee | Role | Status |
|----|----------|------|--------|
| EMP001 | John Doe | Security Guard | Active |
| EMP002 | Jane Smith | Supervisor | Active |

**Sheet 3: Partners**
| Site ID | Partner Name | Location | Headcount |
|---------|--------------|----------|-----------|
| SITE001 | Tech Corp | Mumbai | 25 |
| SITE002 | Finance Ltd | Delhi | 15 |

**Sheet 4: Payroll**
| Month | Total Payout | Pending | Status |
|-------|--------------|---------|--------|
| Jan 2026 | ₹1,200,000 | ₹0 | Paid |
| Feb 2026 | ₹1,250,000 | ₹50,000 | Processing |

**Sheet 5: Finance**
| Category | Amount | Date | Type |
|----------|--------|------|------|
| Revenue | ₹2,500,000 | 2026-01-31 | Income |
| Salaries | ₹1,200,000 | 2026-01-31 | Expense |

**Sheet 6: Compliance**
| Requirement | Deadline | Status | Doc Link |
|-------------|----------|--------|----------|
| PF Filing | 2026-02-15 | Completed | https://... |
| ESI Return | 2026-02-21 | Pending | https://... |

#### Share with Service Account
1. Click "Share" button in Google Sheets
2. Paste your service account email (from JSON file)
3. Give "Editor" access
4. Uncheck "Notify people"
5. Click "Share"

### 3. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create a new API key or use existing one
4. Copy the API key

### 4. Environment Configuration

Create `.env.local` file in project root:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Authentication (Change these!)
ADMIN_USER=admin
ADMIN_PASSWORD=Vimanasa@2026
```

**Important Notes:**
- Keep the quotes around `GOOGLE_PRIVATE_KEY`
- Ensure `\n` characters are preserved in the private key
- Never commit `.env.local` to version control

### 5. Install Dependencies

```bash
npm install
```

### 6. Run the Application

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

### 7. First Login

1. Open http://localhost:3000
2. Use credentials:
   - Username: `admin`
   - Password: `Vimanasa@2026`
3. Click "Initialize Sync"

### 8. Verify Functionality

- ✅ Dashboard loads with metrics
- ✅ Workforce tab shows employee data
- ✅ Partners tab displays client sites
- ✅ Payroll shows salary information
- ✅ Finance displays transactions
- ✅ Compliance shows requirements
- ✅ AI Assistant responds to queries
- ✅ "Sync Cloud" button refreshes data

## Troubleshooting

### "Error fetching data from Google Sheets"
- Verify service account has access to spreadsheet
- Check spreadsheet ID is correct
- Ensure private key is properly formatted

### "AI Assistant not responding"
- Verify Gemini API key is valid
- Check API quota hasn't been exceeded
- Look for errors in browser console

### "Invalid credentials" on login
- Check ADMIN_USER and ADMIN_PASSWORD in .env.local
- Restart the dev server after changing .env.local

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure these environment variables are set:
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `NEXT_PUBLIC_GEMINI_API_KEY`
- `ADMIN_USER`
- `ADMIN_PASSWORD`

## Security Checklist

- [ ] Changed default admin password
- [ ] Added `.env.local` to `.gitignore`
- [ ] Service account has minimal required permissions
- [ ] API keys are rotated regularly
- [ ] HTTPS enabled in production
- [ ] Implemented rate limiting for API routes
- [ ] Added proper error handling
- [ ] Set up monitoring and logging

## Next Steps

1. Customize the dashboard metrics
2. Add more data validation
3. Implement role-based access control
4. Add data export functionality
5. Set up automated backups
6. Configure email notifications
7. Add audit logging

## Support

For issues or questions:
1. Check this guide first
2. Review error messages in console
3. Verify all environment variables
4. Contact system administrator

---

© 2026 Vimanasa Services LLP
