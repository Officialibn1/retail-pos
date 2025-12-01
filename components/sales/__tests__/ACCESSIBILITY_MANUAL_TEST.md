# Accessibility and UX Manual Testing Guide

This document provides manual testing steps to verify the accessibility and UX improvements for the checkout dialogs.

## CheckoutDialog Accessibility Features

### 1. Auto-focus on "Complete Payment" Button

**Test Steps:**

1. Add items to cart
2. Click "Proceed to Checkout"
3. Observe that the "Complete Payment" button receives focus automatically

**Expected Result:** The "Complete Payment" button should be visually focused (with focus ring) when the dialog opens.

### 2. Enter Key Support

**Test Steps:**

1. Open the checkout dialog
2. Press the Enter key

**Expected Result:** The payment dialog should open (same as clicking "Complete Payment").

### 3. Escape Key Support

**Test Steps:**

1. Open the checkout dialog
2. Press the Escape key

**Expected Result:** The dialog should close and the cart should be cleared.

### 4. ARIA Labels

**Test Steps:**

1. Open the checkout dialog
2. Use a screen reader (VoiceOver on Mac, NVDA on Windows)
3. Navigate through the dialog elements

**Expected Result:**

- Dialog title should be announced: "Order Summary"
- Dialog description should be announced
- All monetary values should have proper labels
- Buttons should have descriptive labels

### 5. Keyboard Navigation

**Test Steps:**

1. Open the checkout dialog
2. Use Tab key to navigate through elements
3. Use Shift+Tab to navigate backwards

**Expected Result:** Focus should move logically through: Complete Payment button → Close button → X button

### 6. Mobile Responsiveness

**Test Steps:**

1. Open the checkout dialog on mobile viewport (< 640px)
2. Check button layout and spacing

**Expected Result:**

- Buttons should stack vertically on mobile
- Buttons should be full width on mobile
- Dialog should not exceed 90vh height
- Content should be scrollable if needed

## PaymentDialog Accessibility Features

### 1. Auto-focus on Amount Paid Field

**Test Steps:**

1. Open the payment dialog
2. Observe the cursor position

**Expected Result:** The "Amount Paid" input field should be focused automatically.

### 2. Enter Key Support

**Test Steps:**

1. Open the payment dialog
2. Enter an amount in the "Amount Paid" field
3. Press Enter

**Expected Result:** The sale should be completed (same as clicking "Complete Sale").

### 3. Escape Key Support

**Test Steps:**

1. Open the payment dialog
2. Press Escape

**Expected Result:** The dialog should close without completing the sale.

### 4. ARIA Labels

**Test Steps:**

1. Open the payment dialog
2. Use a screen reader
3. Navigate through all form elements

**Expected Result:**

- All input fields should have proper labels
- Radio buttons should be in a labeled group
- Error messages should be announced with `role="alert"`
- Buttons should have descriptive labels

### 5. Keyboard Navigation

**Test Steps:**

1. Open the payment dialog
2. Use Tab to navigate through elements
3. Use arrow keys to select payment methods

**Expected Result:**

- Focus moves logically: Amount Paid → Quick Fill → Payment Methods → Receipt Checkbox → Cancel → Complete Sale
- Arrow keys work for radio button selection
- All interactive elements are keyboard accessible

### 6. Mobile Responsiveness

**Test Steps:**

1. Open the payment dialog on mobile viewport
2. Test all interactions

**Expected Result:**

- All form fields are easily tappable (min 44px touch target)
- Buttons stack vertically on mobile
- Buttons are full width on mobile
- Dialog scrolls if content exceeds viewport
- Number keyboard appears for amount input on mobile

## Error Handling Accessibility

### 1. Error Message Announcement

**Test Steps:**

1. Trigger a payment error (e.g., network failure)
2. Use a screen reader

**Expected Result:**

- Error message should be announced immediately
- Error has `role="alert"` and `aria-live="assertive"`
- Retry button should be keyboard accessible

## Testing Tools

### Recommended Tools:

- **Screen Readers:**

  - macOS: VoiceOver (Cmd+F5)
  - Windows: NVDA (free) or JAWS
  - Chrome: ChromeVox extension

- **Keyboard Testing:**

  - Tab, Shift+Tab, Enter, Escape, Arrow keys
  - No mouse required

- **Mobile Testing:**

  - Chrome DevTools device emulation
  - Real device testing
  - Test with touch and keyboard

- **Automated Testing:**
  - axe DevTools browser extension
  - Lighthouse accessibility audit
  - WAVE browser extension

## Accessibility Checklist

- [x] Auto-focus on primary action element
- [x] Keyboard shortcuts (Enter, Escape)
- [x] Proper ARIA labels on all interactive elements
- [x] Semantic HTML structure
- [x] Focus management
- [x] Screen reader support
- [x] Mobile responsive design
- [x] Touch target sizes (min 44px)
- [x] Error message accessibility
- [x] Loading state announcements
- [x] Disabled state handling
