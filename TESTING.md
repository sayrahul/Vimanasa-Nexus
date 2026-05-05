# Testing Guide - Vimanasa Nexus

## Manual Testing Checklist

### 1. Authentication Testing

#### Login Functionality
- [ ] Can access login page at root URL
- [ ] Login form displays correctly
- [ ] Username field accepts input
- [ ] Password field masks input
- [ ] Submit button is clickable
- [ ] Correct credentials allow login
- [ ] Incorrect credentials show error message
- [ ] Error message is user-friendly
- [ ] Form validation works (empty fields)
- [ ] Loading state shows during authentication

**Test Cases:**
```
Valid Login:
- Username: admin
- Password: Vimanasa@2026
- Expected: Redirect to dashboard

Invalid Login:
- Username: wrong
- Password: wrong
- Expected: Error message displayed

Empty Fields:
- Username: (empty)
- Password: (empty)
- Expected: Form validation error
```

#### Logout Functionality
- [ ] Logout button visible in sidebar
- [ ] Clicking logout returns to login page
- [ ] Cannot access dashboard after logout
- [ ] Session is properly cleared

---

### 2. Dashboard Testing

#### Visual Elements
- [ ] Dashboard loads without errors
- [ ] All stat cards display correctly
- [ ] Numbers are formatted properly
- [ ] Icons render correctly
- [ ] Trend indicators show (if applicable)
- [ ] Layout is responsive on different screen sizes

#### Data Display
- [ ] Stats show correct data from Google Sheets
- [ ] "Total Staff" displays number
- [ ] "Deployed" displays number
- [ ] "Active Clients" displays number
- [ ] "Monthly Payroll" displays currency
- [ ] Live logs section displays activities
- [ ] Deployment distribution area renders

#### Interactions
- [ ] "View All Sites" button is clickable
- [ ] Hover effects work on cards
- [ ] Animations play smoothly
- [ ] No console errors

---

### 3. Workforce Module Testing

#### Data Loading
- [ ] Workforce tab loads data
- [ ] Table displays employee records
- [ ] All columns render correctly (ID, Employee, Role, Status)
- [ ] Data matches Google Sheets
- [ ] Empty state shows if no data
- [ ] Loading indicator appears during fetch

#### Search Functionality
- [ ] Search box accepts input
- [ ] Search filters results in real-time
- [ ] Search works across all columns
- [ ] Case-insensitive search
- [ ] Clear search shows all results
- [ ] "No records found" message for no matches

#### UI Elements
- [ ] "Add Entry" button visible
- [ ] Download button visible
- [ ] Filter button visible
- [ ] Status badges color-coded correctly
- [ ] "Manage" button appears on hover
- [ ] Table is scrollable if many records
- [ ] Responsive on mobile devices

---

### 4. Partners Module Testing

#### Data Display
- [ ] Partners tab loads correctly
- [ ] Table shows partner records
- [ ] Columns: Site ID, Partner Name, Location, Headcount
- [ ] Data syncs from Google Sheets
- [ ] Formatting is consistent

#### Functionality
- [ ] Search works for partners
- [ ] Filter button present
- [ ] Add/Download buttons functional
- [ ] Row hover effects work
- [ ] Status indicators display correctly

---

### 5. Payroll Module Testing

#### Data Accuracy
- [ ] Payroll tab displays salary data
- [ ] Columns: Month, Total Payout, Pending, Status
- [ ] Currency formatting correct (₹)
- [ ] Status badges show correct colors
- [ ] Totals calculate correctly

#### Features
- [ ] Search filters payroll records
- [ ] Can search by month, amount, status
- [ ] Status colors: Green (Paid), Amber (Pending)
- [ ] Export functionality available

---

### 6. Finance Module Testing

#### Transaction Display
- [ ] Finance tab loads transactions
- [ ] Columns: Category, Amount, Date, Type
- [ ] Income/Expense types distinguished
- [ ] Dates formatted correctly
- [ ] Amounts show currency symbol

#### Data Integrity
- [ ] All transactions from Sheets appear
- [ ] Search works for categories
- [ ] Filter by type works
- [ ] Sorting works (if implemented)

---

### 7. Compliance Module Testing

#### Requirements Display
- [ ] Compliance tab shows requirements
- [ ] Columns: Requirement, Deadline, Status, Doc Link
- [ ] Deadlines formatted as dates
- [ ] Status badges color-coded
- [ ] Document links are clickable

#### Status Tracking
- [ ] Completed items show green
- [ ] Pending items show amber/yellow
- [ ] Overdue items highlighted (if implemented)
- [ ] Search works for requirements

---

### 8. AI Assistant Testing

#### Chat Interface
- [ ] AI tab loads chat interface
- [ ] Welcome message displays
- [ ] Input field accepts text
- [ ] Send button is clickable
- [ ] Enter key sends message

#### AI Responses
- [ ] User messages appear on right
- [ ] AI messages appear on left
- [ ] Typing indicator shows while processing
- [ ] Responses are relevant to questions
- [ ] Context from other modules included
- [ ] Error handling for failed requests

**Test Queries:**
```
1. "How many employees do we have?"
   Expected: Number from workforce data

2. "What's our total payroll for this month?"
   Expected: Amount from payroll data

3. "List all pending compliance items"
   Expected: Filtered compliance data

4. "Show me our top partners"
   Expected: Partner information

5. "What's our financial status?"
   Expected: Summary from finance data
```

#### Error Handling
- [ ] Shows error if API key invalid
- [ ] Handles network errors gracefully
- [ ] Displays user-friendly error messages
- [ ] Can recover from errors

---

### 9. Sync Functionality Testing

#### Cloud Sync
- [ ] "Sync Cloud" button visible in sidebar
- [ ] Clicking sync refreshes current tab data
- [ ] Loading indicator shows during sync
- [ ] Success feedback provided
- [ ] Data updates after sync
- [ ] Works for all tabs

#### Auto-Refresh
- [ ] Data loads on tab switch
- [ ] No duplicate requests
- [ ] Caching works appropriately

---

### 10. Navigation Testing

#### Sidebar Navigation
- [ ] All menu items visible
- [ ] Active tab highlighted
- [ ] Clicking tab switches view
- [ ] Icons display correctly
- [ ] Smooth transitions between tabs
- [ ] Sidebar fixed on scroll

#### Routing
- [ ] URL doesn't change (single page app)
- [ ] Back button doesn't break app
- [ ] Refresh maintains state (if implemented)

---

### 11. Responsive Design Testing

#### Desktop (1920x1080)
- [ ] Layout uses full width appropriately
- [ ] No horizontal scroll
- [ ] All elements visible
- [ ] Spacing is comfortable

#### Laptop (1366x768)
- [ ] Layout adapts correctly
- [ ] Sidebar remains functional
- [ ] Tables are readable
- [ ] No overlapping elements

#### Tablet (768x1024)
- [ ] Sidebar behavior appropriate
- [ ] Tables scroll horizontally if needed
- [ ] Touch targets are adequate
- [ ] Forms are usable

#### Mobile (375x667)
- [ ] Sidebar collapses or adapts
- [ ] Tables are scrollable
- [ ] Buttons are touch-friendly
- [ ] Text is readable
- [ ] No content cut off

---

### 12. Performance Testing

#### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Tab switching < 1 second
- [ ] Search results instant
- [ ] AI responses < 5 seconds
- [ ] Sync operation < 3 seconds

#### Resource Usage
- [ ] No memory leaks
- [ ] CPU usage reasonable
- [ ] Network requests optimized
- [ ] Images load efficiently

#### Browser Console
- [ ] No JavaScript errors
- [ ] No warning messages
- [ ] API calls successful
- [ ] No 404 errors

---

### 13. Browser Compatibility Testing

#### Chrome (Latest)
- [ ] All features work
- [ ] Animations smooth
- [ ] No visual glitches

#### Firefox (Latest)
- [ ] Full functionality
- [ ] Styling consistent
- [ ] Performance good

#### Safari (Latest)
- [ ] Works on macOS
- [ ] Works on iOS
- [ ] No compatibility issues

#### Edge (Latest)
- [ ] All features functional
- [ ] Rendering correct

---

### 14. Security Testing

#### Authentication
- [ ] Cannot access dashboard without login
- [ ] Credentials validated properly
- [ ] No credentials in URL
- [ ] Session management works

#### API Security
- [ ] API keys not exposed in client
- [ ] Environment variables secure
- [ ] No sensitive data in console
- [ ] CORS configured properly

#### Data Protection
- [ ] Private key not in client code
- [ ] No SQL injection vulnerabilities
- [ ] XSS protection in place
- [ ] Input sanitization works

---

### 15. Error Handling Testing

#### Network Errors
- [ ] Handles offline state
- [ ] Shows error for failed API calls
- [ ] Retry mechanism works
- [ ] User informed of issues

#### Data Errors
- [ ] Handles empty data gracefully
- [ ] Validates data format
- [ ] Shows appropriate messages
- [ ] Doesn't crash on bad data

#### User Errors
- [ ] Form validation clear
- [ ] Error messages helpful
- [ ] Recovery path obvious
- [ ] No cryptic errors

---

## Automated Testing (Future Implementation)

### Unit Tests
```javascript
// Example test structure
describe('Authentication', () => {
  test('validates credentials correctly', () => {
    // Test implementation
  });
});

describe('Data Fetching', () => {
  test('fetches workforce data', async () => {
    // Test implementation
  });
});
```

### Integration Tests
- API route testing
- Component integration
- Data flow testing

### E2E Tests
- Full user workflows
- Critical path testing
- Regression testing

---

## Bug Reporting Template

When you find a bug, report it with:

```markdown
**Bug Title:** Brief description

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Enter...
4. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Screen Size: 1920x1080

**Console Errors:**
[Paste any console errors]
```

---

## Testing Schedule

### Before Each Release
- [ ] Complete manual testing checklist
- [ ] Test on all supported browsers
- [ ] Test on different screen sizes
- [ ] Verify all API integrations
- [ ] Check performance metrics
- [ ] Review security measures

### Weekly
- [ ] Smoke test critical paths
- [ ] Check data sync accuracy
- [ ] Monitor error logs
- [ ] Review user feedback

### Monthly
- [ ] Full regression testing
- [ ] Performance audit
- [ ] Security review
- [ ] Dependency updates

---

© 2026 Vimanasa Services LLP
