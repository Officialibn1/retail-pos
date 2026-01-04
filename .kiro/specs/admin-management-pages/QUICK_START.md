# Quick Start Guide - Admin Management Pages

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Development Server

```bash
pnpm dev
```

### Step 2: Login with Test Credentials

Navigate to: http://localhost:3000/login

Use one of these test accounts:

- **SUPERADMIN**: superadmin@example.com / password123
- **ADMIN**: admin@example.com / password123
- **MANAGER**: manager@example.com / password123
- **CASHIER**: cashier@example.com / password123

### Step 3: Access the Pages

#### Categories Management

- URL: http://localhost:3000/dashboard/categories
- Access: MANAGER, ADMIN, SUPERADMIN only
- Features: Create, Read, Update, Delete categories

#### Customers Management

- URL: http://localhost:3000/dashboard/customers
- Access: All roles (CASHIER, MANAGER, ADMIN, SUPERADMIN)
- Features: Create, Read, Update, Delete customers
- Note: CASHIER cannot delete customers

### Step 4: Test Basic Operations

#### Test Categories

1. Click "Add Category" button
2. Enter a category name (e.g., "Electronics")
3. Click "Add Category" to save
4. See the new category in the table
5. Click the ⋮ menu on a category row
6. Select "Edit" to modify
7. Select "Delete" to remove (with confirmation)

#### Test Customers

1. Click "Add Customer" button
2. Enter customer details (at least one field required)
3. Click "Add Customer" to save
4. See the new customer in the table
5. Click the ⋮ menu on a customer row
6. Select "Edit" to modify
7. Select "Delete" to remove (MANAGER+ only)

### Step 5: Test Role-Based Access

#### As MANAGER/ADMIN/SUPERADMIN:

- ✅ Can access Categories page
- ✅ Can create, edit, delete categories
- ✅ Can access Customers page
- ✅ Can create, edit, delete customers

#### As CASHIER:

- ❌ Cannot access Categories page (redirected)
- ✅ Can access Customers page
- ✅ Can create and edit customers
- ❌ Cannot delete customers (button shows "Restricted")

## 🧪 Quick Test Scenarios

### Scenario 1: Create a Category

1. Go to Categories page
2. Click "Add Category"
3. Enter "Test Category"
4. Click "Add Category"
5. ✅ Should see success notification
6. ✅ Should see new category in table

### Scenario 2: Edit a Category

1. Click ⋮ menu on any category
2. Click "Edit"
3. Change the name
4. Click "Save Changes"
5. ✅ Should see success notification
6. ✅ Should see updated name in table

### Scenario 3: Delete a Category

1. Click ⋮ menu on any category
2. Click "Delete"
3. Confirm deletion
4. ✅ Should see success notification
5. ✅ Category should be removed from table
6. ⚠️ If category has items, should see error

### Scenario 4: Create a Customer

1. Go to Customers page
2. Click "Add Customer"
3. Enter name, email, and/or phone
4. Click "Add Customer"
5. ✅ Should see success notification
6. ✅ Should see new customer in table

### Scenario 5: Test Validation

1. Click "Add Category"
2. Leave name empty
3. Try to submit
4. ✅ Should see "Category name is required" error
5. Enter invalid characters (e.g., "Test@#$")
6. ✅ Should see character validation error

### Scenario 6: Test CASHIER Restrictions

1. Login as CASHIER
2. Try to access /dashboard/categories
3. ✅ Should be redirected or see access denied
4. Go to /dashboard/customers
5. ✅ Should see page
6. Try to delete a customer
7. ✅ Delete button should show "Restricted"

## 🔍 What to Look For

### Visual Elements

- ✅ Page headers with titles and descriptions
- ✅ Summary cards with icons and numbers
- ✅ Data tables with search inputs
- ✅ Action dropdowns (⋮) on each row
- ✅ Dialogs for create/edit operations
- ✅ Confirmation dialogs for delete
- ✅ Toast notifications for success/error

### Interactions

- ✅ Buttons respond to clicks
- ✅ Dialogs open and close smoothly
- ✅ Forms validate input
- ✅ Search input works (debounced)
- ✅ Dropdowns open on click
- ✅ Keyboard navigation works

### Data

- ✅ Categories show item counts
- ✅ Customers show sales counts
- ✅ Null values display as "N/A"
- ✅ Numbers formatted correctly
- ✅ Empty states show when no data

### Errors

- ✅ Validation errors show inline
- ✅ API errors show in toast
- ✅ Network errors handled gracefully
- ✅ Constraint violations explained clearly

## 🐛 Common Issues & Solutions

### Issue: "Cannot access page"

**Solution:** Check your user role. Categories requires MANAGER+, Customers allows all roles.

### Issue: "Delete button disabled"

**Solution:** If you're a CASHIER, you cannot delete customers. Login as MANAGER+ to test delete.

### Issue: "Category has items" error

**Solution:** This is expected. You cannot delete a category that has inventory items. Remove items first.

### Issue: "Customer has sales" error

**Solution:** This is expected. You cannot delete a customer with sales history due to database constraints.

### Issue: "Duplicate email" error

**Solution:** This is expected. Email addresses must be unique across customers.

### Issue: Page not loading

**Solution:**

1. Check if dev server is running
2. Check console for errors
3. Verify database is accessible
4. Check if you're logged in

## 📋 Testing Checklist

Use this quick checklist for basic testing:

- [ ] Categories page loads
- [ ] Can create a category
- [ ] Can edit a category
- [ ] Can delete a category
- [ ] Customers page loads
- [ ] Can create a customer
- [ ] Can edit a customer
- [ ] Can delete a customer (MANAGER+)
- [ ] CASHIER cannot delete customers
- [ ] CASHIER cannot access categories
- [ ] Validation errors show
- [ ] Success notifications show
- [ ] Error notifications show
- [ ] Search input works
- [ ] Tables display data correctly
- [ ] Dialogs open and close
- [ ] Keyboard navigation works
- [ ] Mobile responsive (resize browser)

## 📚 Additional Resources

- **Full Testing Checklist**: `TESTING_CHECKLIST.md`
- **Test Report**: `TEST_REPORT.md`
- **Visual Inspection Guide**: `VISUAL_INSPECTION.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Requirements**: `requirements.md`
- **Design Document**: `design.md`

## 🎯 Success Criteria

Your testing is successful if:

1. ✅ All CRUD operations work for both pages
2. ✅ Role-based access control works correctly
3. ✅ Validation prevents invalid data
4. ✅ Error messages are clear and helpful
5. ✅ UI is responsive and accessible
6. ✅ No console errors during normal use
7. ✅ Data persists across page refreshes

## 🚨 When to Report Issues

Report an issue if you encounter:

- ❌ Page crashes or shows blank screen
- ❌ Data not saving or loading
- ❌ Buttons not working
- ❌ Incorrect role-based access
- ❌ Validation not working
- ❌ Console errors
- ❌ UI elements misaligned or broken
- ❌ Accessibility issues

## ✅ Next Steps

After completing basic testing:

1. Test on different browsers (Chrome, Firefox, Safari, Edge)
2. Test on different devices (desktop, tablet, mobile)
3. Test with large datasets
4. Test error scenarios (network failures, etc.)
5. Test keyboard-only navigation
6. Test with screen readers
7. Review the full testing checklist

## 💡 Tips

- Use browser DevTools to inspect elements
- Check the Network tab for API calls
- Check the Console tab for errors
- Use React DevTools to inspect component state
- Test with different screen sizes using DevTools
- Clear browser cache if you see stale data

---

**Happy Testing! 🎉**

If you find any issues, please document them with:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Browser and device information
