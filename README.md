# Vimanasa Nexus - Enterprise Management Portal

A comprehensive Next.js-based enterprise management system for workforce, payroll, finance, and compliance management with AI-powered insights.

![Vimanasa Nexus](./assets/banner.png)

## 🚀 Features

- **📊 Dashboard**: Real-time operational overview with key metrics
- **👥 Workforce Management**: Employee tracking and site assignments
- **🏢 Partner Management**: Client sites and service partner tracking
- **💰 Payroll System**: Salary processing and disbursement status
- **💼 Finance Tracking**: Revenue, expenses, and profit monitoring
- **✅ Compliance**: Statutory filings and regulatory status tracking
- **🤖 AI Assistant**: Gemini-powered intelligent assistant with business context
- **☁️ Cloud Sync**: Real-time Google Sheets integration
- **🔐 Secure Authentication**: Protected access with credentials

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.4 (App Router)
- **UI**: React 19.2.4, Tailwind CSS 4, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: Google Sheets (via Google Sheets API)
- **AI**: Google Gemini AI (gemini-1.5-flash)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom animations

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Sheets API enabled
- Google Service Account credentials
- Google Gemini API key

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vimanasa-nexus
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Authentication
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
```

4. **Set up Google Sheets**

Create a Google Spreadsheet with the following sheets:
- `Dashboard` - Columns: Staff, Deployed, Clients, Payroll
- `Workforce` - Columns: ID, Employee, Role, Status
- `Partners` - Columns: Site ID, Partner Name, Location, Headcount
- `Payroll` - Columns: Month, Total Payout, Pending, Status
- `Finance` - Columns: Category, Amount, Date, Type
- `Compliance` - Columns: Requirement, Deadline, Status, Doc Link

Share the spreadsheet with your service account email.

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

## 🔑 Default Login Credentials

- **Username**: admin
- **Password**: Vimanasa@2026

⚠️ **Important**: Change these credentials in production!

## 📁 Project Structure

```
vimanasa-nexus/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/route.js          # Gemini AI endpoint
│   │   │   └── gsheets/route.js     # Google Sheets API
│   │   ├── globals.css              # Global styles
│   │   ├── layout.js                # Root layout
│   │   └── page.js                  # Main dashboard
│   ├── components/
│   │   └── Sidebar.js               # Navigation sidebar
│   └── lib/
│       └── utils.js                 # Utility functions
├── public/                          # Static assets
├── .env.local                       # Environment variables
├── next.config.mjs                  # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
└── package.json                     # Dependencies
```

## 🎨 Key Components

### Dashboard
- Real-time metrics display
- Deployment distribution visualization
- Live activity logs

### Data Tables
- Search and filter functionality
- Status indicators
- Export capabilities
- Responsive design

### AI Assistant
- Context-aware responses
- Business data integration
- Natural language queries
- Real-time chat interface

## 🔌 API Endpoints

### Google Sheets API
- `GET /api/gsheets?sheet=SheetName` - Fetch data from a sheet
- `POST /api/gsheets` - Append data to a sheet

### AI Assistant API
- `POST /api/ai` - Send prompts to Gemini AI with business context

## 🎯 Usage

1. **Login**: Use admin credentials to access the portal
2. **Navigate**: Use the sidebar to switch between modules
3. **Sync Data**: Click "Sync Cloud" to refresh data from Google Sheets
4. **AI Assistant**: Ask questions about your business data
5. **Search & Filter**: Use search bars to find specific records

## 🔒 Security Notes

- Never commit `.env.local` to version control
- Use strong passwords in production
- Rotate API keys regularly
- Implement proper authentication in production
- Use HTTPS in production environments

## 🐛 Troubleshooting

### Google Sheets API Errors
- Verify service account has access to the spreadsheet
- Check that the private key is properly formatted with `\n` characters
- Ensure Sheets API is enabled in Google Cloud Console

### AI Assistant Not Responding
- Verify Gemini API key is valid
- Check API quota limits
- Review browser console for errors

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## 📝 License

© 2026 Vimanasa Services LLP. All rights reserved.

## 🤝 Support

For support, contact your system administrator or refer to the documentation.

---

Built with ❤️ using Next.js and Google Cloud Platform
