# Bug Fix Required - Remove All Google Sheets References

## Issue
The application still has references to `sheetMapping` and `/api/gsheets` that cause errors when trying to delete or save data.

## Files to Fix
1. `src/app/page.js` - Multiple functions need updating

## Required Changes

### 1. ClientManagement Component (lines ~380-420)
Replace all three callbacks (onAdd, onEdit, onDelete) to use `/api/database` instead of `/api/gsheets`

### 2. AttendanceManager Component (lines ~430)
Update onSave to use `/api/database`

### 3. LeaveManager Component (lines ~440)
Update onSave to use `/api/database`

### 4. ExpenseManager Component
Update onSave to use `/api/database`

### 5. ClientInvoicing Component (lines ~520-560)
Update onGenerateInvoice and onUpdateStatus to use `/api/database`

## Solution
Since there are many references, I recommend:
1. Search for all `/api/gsheets` in src/app/page.js
2. Replace with `/api/database`
3. Update data structure from arrays to objects with IDs
4. Use `id` instead of `rowIndex`

Would you like me to create a complete fixed version of the page.js file?
