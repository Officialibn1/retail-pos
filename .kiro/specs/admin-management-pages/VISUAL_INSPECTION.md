# Visual Inspection Guide

## Quick Visual Checks

### Categories Page (`/dashboard/categories`)

#### Expected Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Categories Management                    [+ Add Category]   │
│ Manage product categories for your store                    │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌──────────────────────┐        │
│ │ Total Categories     │  │ Total Items          │        │
│ │ 📦 5                 │  │ 🛍️  23               │        │
│ └──────────────────────┘  └──────────────────────┘        │
├─────────────────────────────────────────────────────────────┤
│ Categories                                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔍 Search categories...                                 ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Name          │ Item Count │ Actions                    ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Electronics   │ 10         │ ⋮ [Edit] [Delete]         ││
│ │ Clothing      │ 8          │ ⋮ [Edit] [Delete]         ││
│ │ Food          │ 5          │ ⋮ [Edit] [Delete]         ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Color Scheme:

- Background: White
- Headers: brand-main-800 (dark blue)
- Text: brand-main-700 (medium blue)
- Cards: border-brand-main-200 (light blue border)
- Buttons: brand-main-600 (primary blue)
- Hover: brand-main-100 (very light blue)

#### Add Category Dialog:

```
┌─────────────────────────────────────┐
│ Add New Category                    │
│ Create a new category to organize   │
│ your inventory items.               │
├─────────────────────────────────────┤
│ Category Name *                     │
│ ┌─────────────────────────────────┐ │
│ │ e.g., Electronics, Clothing...  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]           [Add Category]   │
└─────────────────────────────────────┘
```

### Customers Page (`/dashboard/customers`)

#### Expected Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ Customers Management                    [+ Add Customer]    │
│ Manage customer information and track sales history         │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐  ┌──────────────────────┐        │
│ │ Total Customers      │  │ Total Sales          │        │
│ │ 👥 15                │  │ 💰 45                │        │
│ └──────────────────────┘  └──────────────────────┘        │
├─────────────────────────────────────────────────────────────┤
│ Customers                                                    │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ 🔍 Search customers...                                  ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ Name    │ Email         │ Phone      │ Sales │ Actions ││
│ ├─────────────────────────────────────────────────────────┤│
│ │ John    │ john@ex.com   │ +234...    │ 5     │ ⋮       ││
│ │ Jane    │ N/A           │ +234...    │ 3     │ ⋮       ││
│ │ N/A     │ bob@ex.com    │ +234...    │ 2     │ ⋮       ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Add Customer Dialog:

```
┌─────────────────────────────────────┐
│ Add New Customer                    │
│ Create a new customer record.       │
│ At least one field must be provided.│
├─────────────────────────────────────┤
│ Customer Name                       │
│ ┌─────────────────────────────────┐ │
│ │ e.g., John Doe                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Email Address                       │
│ ┌─────────────────────────────────┐ │
│ │ e.g., john@example.com          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Phone Number                        │
│ ┌─────────────────────────────────┐ │
│ │ e.g., +2348012345678            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]           [Add Customer]   │
└─────────────────────────────────────┘
```

## Visual Checklist

### Categories Page

- [ ] Page header displays correctly
- [ ] "Add Category" button visible (MANAGER+ only)
- [ ] Summary cards show correct icons and data
- [ ] Table displays with proper columns
- [ ] Search input has magnifying glass icon
- [ ] Action dropdown shows on hover
- [ ] Edit/Delete options in dropdown
- [ ] Empty state shows when no data
- [ ] Loading spinner appears during fetch
- [ ] Brand colors used consistently

### Customers Page

- [ ] Page header displays correctly
- [ ] "Add Customer" button visible (all roles)
- [ ] Summary cards show correct icons and data
- [ ] Table displays with proper columns
- [ ] "N/A" shows for null values
- [ ] Search input has magnifying glass icon
- [ ] Action dropdown shows on hover
- [ ] Edit option always available
- [ ] Delete option shows "Restricted" for CASHIER
- [ ] Empty state shows when no data
- [ ] Loading spinner appears during fetch
- [ ] Brand colors used consistently

### Dialogs

- [ ] Dialogs centered on screen
- [ ] Proper width (max-w-[500px])
- [ ] Title and description visible
- [ ] Form fields properly labeled
- [ ] Input fields have placeholders
- [ ] Cancel button on left
- [ ] Submit button on right
- [ ] Loading spinner in submit button when processing
- [ ] Error messages appear below fields
- [ ] Error messages in red color
- [ ] Dialog closes on Escape key
- [ ] Dialog closes on backdrop click

### Confirmation Dialogs

- [ ] Warning icon or styling
- [ ] Clear confirmation message
- [ ] Entity name shown in message
- [ ] Cancel button (gray)
- [ ] Confirm button (red for delete)
- [ ] Warning text for customers with sales

### Notifications (Toast)

- [ ] Success notifications (green)
- [ ] Error notifications (red)
- [ ] Notifications auto-dismiss
- [ ] Notifications positioned correctly
- [ ] Messages are clear and helpful

### Sidebar Navigation

- [ ] "Categories" link visible (MANAGER+)
- [ ] "Customers" link visible (all roles)
- [ ] FolderKanban icon for Categories
- [ ] UserCircle icon for Customers
- [ ] Active state highlights current page
- [ ] Icons display correctly

## Responsive Checks

### Desktop (1920x1080)

- [ ] Full layout displays correctly
- [ ] Summary cards in 2-column grid
- [ ] Table columns all visible
- [ ] Dialogs centered with proper width
- [ ] No horizontal scrolling

### Tablet (768x1024)

- [ ] Layout adapts appropriately
- [ ] Summary cards stack or resize
- [ ] Table remains usable
- [ ] Dialogs fit screen
- [ ] Touch targets adequate size

### Mobile (375x667)

- [ ] Layout stacks vertically
- [ ] Summary cards stack
- [ ] Table scrolls horizontally if needed
- [ ] Dialogs fit screen
- [ ] Buttons large enough for touch
- [ ] Text remains readable

## Accessibility Checks

### Focus Indicators

- [ ] Visible focus ring on all interactive elements
- [ ] Focus ring color contrasts with background
- [ ] Focus order logical (top to bottom, left to right)
- [ ] Focus trapped in open dialogs
- [ ] Focus restored after dialog closes

### Color Contrast

- [ ] Text meets WCAG AA (4.5:1 for normal text)
- [ ] Large text meets WCAG AA (3:1)
- [ ] Error messages have sufficient contrast
- [ ] Disabled elements visually distinct

### Screen Reader

- [ ] Page title announced
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Success/error notifications announced
- [ ] Button purposes clear

## Common Issues to Look For

### Layout Issues

- [ ] Text overflow or truncation
- [ ] Misaligned elements
- [ ] Inconsistent spacing
- [ ] Broken grid layouts
- [ ] Overlapping elements

### Interaction Issues

- [ ] Buttons not clickable
- [ ] Dropdowns not opening
- [ ] Dialogs not closing
- [ ] Forms not submitting
- [ ] Search not working

### Data Display Issues

- [ ] Missing data shows as "undefined" or "null"
- [ ] Numbers not formatted correctly
- [ ] Dates not formatted correctly
- [ ] Empty states not showing
- [ ] Loading states stuck

### Style Issues

- [ ] Wrong colors used
- [ ] Inconsistent fonts
- [ ] Missing icons
- [ ] Broken hover states
- [ ] Incorrect button styles

## Browser-Specific Checks

### Chrome

- [ ] All features work
- [ ] Styles render correctly
- [ ] No console errors

### Firefox

- [ ] All features work
- [ ] Styles render correctly
- [ ] No console errors

### Safari

- [ ] All features work
- [ ] Styles render correctly
- [ ] No console errors
- [ ] Date inputs work

### Edge

- [ ] All features work
- [ ] Styles render correctly
- [ ] No console errors

## Performance Checks

### Load Time

- [ ] Page loads in < 2 seconds
- [ ] No flash of unstyled content
- [ ] Smooth transitions

### Interactions

- [ ] Buttons respond immediately
- [ ] Dialogs open/close smoothly
- [ ] No lag when typing
- [ ] Search debouncing works (300ms)

### Network

- [ ] Loading states show during fetch
- [ ] Error states show on network failure
- [ ] Retry mechanism works
- [ ] Cache invalidation works
