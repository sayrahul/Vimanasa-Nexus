# Quick Reference - Vimanasa Nexus

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Setup (Unix/Mac)
bash scripts/setup.sh

# Setup (Windows)
scripts\setup.bat
```

---

## 🔑 Default Credentials

```
Username: admin
Password: Vimanasa@2026
```

⚠️ **Change these in production!**

---

## 📋 Environment Variables

```env
# Required in .env.local
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
ADMIN_USER=admin
ADMIN_PASSWORD=your_password
```

---

## 📊 Google Sheets Structure

### Required Sheets & Columns

**Dashboard**
- Staff, Deployed, Clients, Payroll

**Workforce**
- ID, Employee, Role, Status

**Partners**
- Site ID, Partner Name, Location, Headcount

**Payroll**
- Month, Total Payout, Pending, Status

**Finance**
- Category, Amount, Date, Type

**Compliance**
- Requirement, Deadline, Status, Doc Link

---

## 🔌 API Endpoints

### Google Sheets
```javascript
// GET data
GET /api/gsheets?sheet=SheetName

// POST data
POST /api/gsheets
Body: { sheet: "SheetName", values: [...] }
```

### AI Assistant
```javascript
POST /api/ai
Body: { 
  prompt: "Your question",
  context: { /* business data */ }
}
```

---

## 🎨 Component Structure

```
page.js
├── DashboardLayout (Main)
│   ├── Sidebar
│   ├── DashboardView
│   ├── TableView (Workforce, Partners, etc.)
│   ├── AiAssistantView
│   └── Login
```

---

## 🛠️ Key Files

| File | Purpose |
|------|---------|
| `src/app/page.js` | Main application & all components |
| `src/app/layout.js` | Root layout & metadata |
| `src/app/globals.css` | Global styles & animations |
| `src/components/Sidebar.js` | Navigation sidebar |
| `src/app/api/gsheets/route.js` | Google Sheets API |
| `src/app/api/ai/route.js` | Gemini AI API |
| `src/lib/utils.js` | Utility functions |
| `.env.local` | Environment variables |
| `next.config.mjs` | Next.js configuration |
| `tailwind.config.js` | Tailwind configuration |

---

## 🎯 Module Navigation

| Tab | ID | Data Source |
|-----|----|----|
| Dashboard | `dashboard` | Dashboard sheet |
| Workforce | `workforce` | Workforce sheet |
| Partners | `partners` | Partners sheet |
| Payroll | `payroll` | Payroll sheet |
| Finance | `finance` | Finance sheet |
| Compliance | `compliance` | Compliance sheet |
| AI Assistant | `ai` | Gemini AI |

---

## 🔍 Common Issues & Solutions

### Build Fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Google Sheets Error
- Check service account email
- Verify spreadsheet is shared
- Validate private key format
- Ensure Sheets API is enabled

### AI Not Responding
- Verify Gemini API key
- Check API quota
- Review console errors

### Login Not Working
- Check .env.local exists
- Verify ADMIN_USER and ADMIN_PASSWORD
- Restart dev server

### Environment Variables Not Loading
```bash
# Restart the server after changing .env.local
# Press Ctrl+C and run npm run dev again
```

---

## 📱 Responsive Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

---

## 🎨 Color Palette

```css
/* Primary */
Blue: #2563eb (blue-600)
Blue Light: #3b82f6 (blue-500)
Blue Dark: #1d4ed8 (blue-700)

/* Neutrals */
Slate 50: #f8fafc
Slate 100: #f1f5f9
Slate 200: #e2e8f0
Slate 400: #94a3b8
Slate 500: #64748b
Slate 600: #475569
Slate 700: #334155
Slate 800: #1e293b
Slate 900: #0f172a

/* Status */
Success: #10b981 (emerald-500)
Warning: #f59e0b (amber-500)
Error: #ef4444 (red-500)
```

---

## 🔐 Security Checklist

- [ ] .env.local in .gitignore
- [ ] Changed default password
- [ ] API keys not in client code
- [ ] Service account has minimal permissions
- [ ] HTTPS enabled (production)
- [ ] Input validation on forms
- [ ] Error messages don't leak info

---

## 📦 Key Dependencies

```json
{
  "next": "16.2.4",
  "react": "19.2.4",
  "tailwindcss": "^4",
  "framer-motion": "^12.38.0",
  "axios": "^1.16.0",
  "googleapis": "^171.4.0",
  "@google/generative-ai": "^0.24.1",
  "lucide-react": "^1.14.0"
}
```

---

## 🧪 Testing Quick Checks

```bash
# 1. Login works
# 2. Dashboard loads
# 3. All tabs accessible
# 4. Search functions
# 5. Sync button works
# 6. AI responds
# 7. No console errors
# 8. Responsive on mobile
```

---

## 📝 Git Workflow

```bash
# Initial setup
git init
git add .
git commit -m "Initial commit"

# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

---

## 🚀 Deployment Quick Start

### Vercel
```bash
npm i -g vercel
vercel login
vercel
```

### Docker
```bash
docker build -t vimanasa-nexus .
docker run -p 3000:3000 --env-file .env.local vimanasa-nexus
```

---

## 📞 Support Resources

- **Documentation:** README.md
- **Setup:** SETUP_GUIDE.md
- **Deployment:** DEPLOYMENT.md
- **Testing:** TESTING.md
- **Summary:** PROJECT_SUMMARY.md

---

## 💡 Pro Tips

1. **Use the Sync button** after updating Google Sheets
2. **Search is case-insensitive** across all modules
3. **AI Assistant has context** from all your data
4. **Status badges are color-coded** for quick scanning
5. **Hover over rows** to see action buttons
6. **Press Enter** to send AI messages
7. **Check console** for detailed error messages
8. **Restart server** after .env.local changes

---

## 🔄 Update Workflow

```bash
# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Update specific package
npm install package-name@latest

# Rebuild after updates
npm run build
```

---

## 📊 Performance Targets

- Initial Load: < 3s
- Tab Switch: < 1s
- Search: Instant
- AI Response: < 5s
- Sync: < 3s

---

## 🎯 Feature Flags

Currently all features are enabled. To disable:

```javascript
// In page.js
const FEATURES = {
  ai: true,          // AI Assistant
  sync: true,        // Cloud sync
  search: true,      // Search functionality
  export: false,     // Export (not implemented)
};
```

---

**Quick Reference v1.0**
**Last Updated:** May 5, 2026

---

© 2026 Vimanasa Services LLP
