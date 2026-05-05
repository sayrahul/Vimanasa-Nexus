# 🚀 Quick Start Guide - Vimanasa Nexus Phase 1

## ⚡ Immediate Steps to Test

### 1. Install Dependencies (if not done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Application
Navigate to: **http://localhost:3000**

### 4. Login
- **Username**: `admin`
- **Password**: `Vimanasa@2026`

---

## 🧪 Testing Checklist

### ✅ Test 1: Login Page
- [ ] Logo displays with white background
- [ ] Professional gradient background visible
- [ ] Show/hide password toggle works
- [ ] Login with demo credentials works
- [ ] Error message shows for wrong credentials

### ✅ Test 2: Dashboard
- [ ] Real-time stats display correctly
- [ ] Quick action cards visible
- [ ] Recent activity shows employee data
- [ ] All stat cards have colored icons

### ✅ Test 3: Add New Employee
1. Click **Workforce** tab
2. Click **Add Entry** button
3. Fill the form across all 7 tabs:
   - Basic Info (required fields marked with *)
   - Address
   - Employment
   - Bank & Statutory
   - Salary (see auto-calculated CTC)
   - Emergency
   - Education
4. Click **Add Employee**
5. Check for success toast notification
6. **Verify in Google Sheets** - new row added

### ✅ Test 4: Edit Existing Employee
1. Go to **Workforce** tab
2. Hover over any employee row
3. Click **Edit** icon (pencil)
4. Modify some fields
5. Click **Update Employee**
6. Check for success toast
7. **Verify in Google Sheets** - existing row updated (NOT new row!)

### ✅ Test 5: Delete Employee
1. Go to **Workforce** tab
2. Hover over any employee row
3. Click **Delete** icon (trash)
4. Confirm deletion
5. Check for success toast
6. **Verify in Google Sheets** - row deleted

### ✅ Test 6: Add New Partner/Client
1. Click **Partners** tab
2. Click **Add Entry** button
3. Fill the form across all 6 tabs:
   - Basic Info
   - Contacts
   - Location
   - Contract
   - Service
   - Financial
4. Click **Add Partner**
5. Check for success toast
6. **Verify in Google Sheets**

### ✅ Test 7: Search Functionality
1. Go to any tab (Workforce, Partners, etc.)
2. Type in the search box
3. Table filters in real-time

### ✅ Test 8: Other Modules
- [ ] Payroll tab loads
- [ ] Finance tab loads
- [ ] Compliance tab loads
- [ ] AI Assistant tab loads

---

## 🎨 Visual Checks

### Logo
- [ ] Login page: Logo in white container
- [ ] Sidebar: Logo in white rounded box
- [ ] Logo is clear and not blurry

### UI Elements
- [ ] Gradient buttons (blue to cyan)
- [ ] Smooth hover effects on cards
- [ ] Status badges with colors (green/blue/amber)
- [ ] Toast notifications appear in top-right
- [ ] Loading spinner shows when fetching data

### Responsive Design
- [ ] Resize browser window
- [ ] Forms adapt to smaller screens
- [ ] Tables scroll horizontally on mobile
- [ ] Sidebar remains fixed

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" errors
**Solution:**
```bash
npm install
```

### Issue 2: Google Sheets not loading
**Solution:**
- Check `.env.local` file exists
- Verify Google Sheets API credentials
- Check internet connection
- Look for network errors in browser console

### Issue 3: Toast notifications not showing
**Solution:**
- Check browser console for errors
- Verify `react-toastify` is installed
- Refresh the page

### Issue 4: Forms not saving
**Solution:**
- Check browser console for API errors
- Verify Google Sheets API has write permissions
- Check network tab in browser DevTools

### Issue 5: Build takes too long
**Solution:**
- This is normal for first build (2-3 minutes)
- Subsequent builds are faster
- Use `npm run dev` for development (faster)

---

## 📊 Google Sheets Setup (Optional)

If you want to use the comprehensive forms with all fields, update your Google Sheets:

### Option 1: Add New Columns
Add the new columns to your existing sheets (see PHASE1_COMPLETE.md for full list)

### Option 2: Create New Sheets
Create new sheets with the comprehensive column structure

### Option 3: Use As-Is
The app works with your existing columns! It maps both old and new field names.

---

## 🎯 Key Features to Test

### 1. Row-Level Editing (IMPORTANT!)
- Edit an employee
- Save changes
- **Verify**: The existing row is updated, NOT a new row created

### 2. Comprehensive Forms
- Employee form has 7 tabs with 40+ fields
- Partner form has 6 tabs with 25+ fields
- All fields save correctly

### 3. Auto-Calculations
- In Employee form → Salary tab
- Enter Basic, HRA, Allowances
- See Total CTC calculate automatically

### 4. Form Validation
- Try submitting without required fields
- See error messages
- See red borders on invalid fields

### 5. Toast Notifications
- Success: Green toast with checkmark
- Error: Red toast with X icon
- Auto-dismiss after 3 seconds

---

## 📱 Mobile Testing

1. Open browser DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select mobile device (iPhone, Android)
4. Test all features on mobile view

---

## 🚀 Performance Tips

### For Faster Development:
```bash
npm run dev --turbo
```

### For Production Build:
```bash
npm run build
npm start
```

### Clear Cache (if issues):
```bash
rm -rf .next
npm run dev
```

---

## 📞 Need Help?

### Check These First:
1. **Browser Console** (F12) - Look for errors
2. **Terminal** - Look for server errors
3. **Network Tab** - Check API calls
4. **Google Sheets** - Verify data is saving

### Common Error Messages:

**"ENOTFOUND oauth2.googleapis.com"**
- Network issue
- App will retry automatically (3 times)
- Check internet connection

**"Failed to fetch data"**
- Google Sheets API issue
- Check credentials in `.env.local`
- Verify spreadsheet ID is correct

**"Invalid username or password"**
- Check `.env.local` has:
  ```
  NEXT_PUBLIC_ADMIN_USER=admin
  NEXT_PUBLIC_ADMIN_PASSWORD=Vimanasa@2026
  ```

---

## ✅ Success Criteria

You'll know Phase 1 is working when:
- ✅ Login page looks professional with logo
- ✅ Dashboard shows real data from Google Sheets
- ✅ Can add new employees with comprehensive form
- ✅ Can edit employees (updates existing row)
- ✅ Can delete employees
- ✅ Toast notifications appear
- ✅ Search works across all tables
- ✅ All tabs load without errors

---

## 🎉 Ready to Test!

1. Run `npm run dev`
2. Open http://localhost:3000
3. Login with admin/Vimanasa@2026
4. Follow the testing checklist above
5. Report any issues you find

**Everything is ready for your review!**

---

## 📋 What to Check Before Confirming

- [ ] Logo has white background (login + sidebar)
- [ ] Can add employees with 20+ fields
- [ ] Can edit employees (replaces existing entry)
- [ ] Can delete employees
- [ ] Can add partners with 25+ fields
- [ ] Toast notifications work
- [ ] Search works
- [ ] UI looks professional
- [ ] No critical errors in console

**Once confirmed, we can push to GitHub!**

---

**Built for Vimanasa Services LLP**
**Phase 1 - Complete & Ready for Testing**

