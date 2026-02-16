# Store Branding in Email Templates - Update Summary

## Overview

All email templates have been updated to include store branding information (name, address, phone, and logo) from environment variables.

## Changes Made

### 1. New Store Information Utility ✅

**File:** `lib/email/store-info.ts`

**Functions:**

- `getStoreInfo()` - Retrieves store information from environment variables
- `generateStoreHeader()` - Generates HTML header with logo and store details
- `generateStoreFooterText()` - Generates plain text footer with store details

**Environment Variables Used:**

- `NEXT_PUBLIC_STORE_NAME` - Store name (default: "POS Store")
- `NEXT_PUBLIC_STORE_ADDRESS` - Store address (optional)
- `NEXT_PUBLIC_STORE_PHONE` - Store phone number (optional)
- `NEXT_PUBLIC_STORE_LOGO` - Logo URL or path (default: "/pos_logo.png")

### 2. Updated Email Templates ✅

All three customer-facing email templates now include store branding:

#### Customer Welcome Email

**File:** `lib/email/templates/customer-welcome.ts`

**Updates:**

- Store logo and header at the top
- Store name in welcome message
- Store phone in contact information
- Store details in footer

#### User Creation Email

**File:** `lib/email/templates/user-creation.ts`

**Updates:**

- Store logo and header at the top
- Store name in welcome message ("Welcome to [Store Name]!")
- Store phone in contact information
- Store details in footer

#### Purchase Receipt Email

**File:** `lib/email/templates/purchase-receipt.ts`

**Updates:**

- Store logo and header at the top
- Store name, address, and phone at the top of receipt
- Store details in footer
- Professional receipt layout with branding

### 3. Environment Configuration ✅

**File:** `.env.example`

Added store information variables:

```env
# Store Information (for emails and receipts)
NEXT_PUBLIC_STORE_NAME="Item7 Retail Store"
NEXT_PUBLIC_STORE_ADDRESS="1203 N AVALON BLVD, WILMINGTON, CALIFORNIA 90744"
NEXT_PUBLIC_STORE_PHONE="(555) 123-4567"
NEXT_PUBLIC_STORE_LOGO="/pos_logo.png"
```

## Email Template Structure

### HTML Email Header

Each email now includes a professional header:

```html
<table>
	<tr>
		<td align="center">
			<img
				src="/pos_logo.png"
				alt="Store Name"
				style="max-width: 150px;" />
		</td>
	</tr>
	<tr>
		<td align="center">
			<h2>Store Name</h2>
			<p>Store Address</p>
			<p>Tel: Store Phone</p>
		</td>
	</tr>
</table>
```

### Plain Text Email Header

```
Store Name
Store Address
Tel: Store Phone
```

### Email Footer

Both HTML and plain text versions include store details at the bottom.

## Logo Handling

**Default Logo:** `/pos_logo.png` (must exist in `public/` folder)

**Custom Logo:** Set `NEXT_PUBLIC_STORE_LOGO` to:

- Relative path: `/custom-logo.png`
- Absolute URL: `https://yourdomain.com/logo.png`
- CDN URL: `https://cdn.example.com/logo.png`

**Logo Requirements:**

- Recommended size: 150px width (height auto-scales)
- Format: PNG, JPG, or SVG
- Location: `public/` folder for local files

## Configuration Steps

### 1. Add Store Information to Environment

Edit your `.env.local` file:

```env
NEXT_PUBLIC_STORE_NAME="Your Store Name"
NEXT_PUBLIC_STORE_ADDRESS="Your Store Address"
NEXT_PUBLIC_STORE_PHONE="Your Phone Number"
NEXT_PUBLIC_STORE_LOGO="/pos_logo.png"
```

### 2. Add Store Logo

Place your logo file in the `public/` folder:

- Default: `public/pos_logo.png`
- Custom: `public/your-logo.png` (update `NEXT_PUBLIC_STORE_LOGO`)

### 3. Restart Application

After updating environment variables:

```bash
# Stop the development server
# Then restart
pnpm dev
```

## Testing

### Test Customer Welcome Email

1. Create a new customer with an email address
2. Check the customer's email inbox
3. Verify store logo, name, address, and phone appear correctly

### Test User Creation Email

1. Create a new user (as SUPERADMIN)
2. Check the user's email inbox
3. Verify store branding appears correctly

### Test Purchase Receipt Email

1. Complete a sale with a customer who has an email
2. Check the customer's email inbox
3. Verify store branding and receipt details

## Email Examples

### Customer Welcome Email

**Subject:** Welcome! Thank You for Joining Us

**Content:**

- Store logo at top
- "Welcome to [Store Name]!"
- Store contact information
- Benefits of being a customer
- Store details in footer

### User Creation Email

**Subject:** Welcome to [Store Name] - Your Account Details

**Content:**

- Store logo at top
- "Welcome to [Store Name]!"
- Login credentials
- Security notice
- Store contact information in footer

### Purchase Receipt Email

**Subject:** Purchase Receipt - Order #[ID]

**Content:**

- Store logo and details at top
- "Thank You for Your Purchase!"
- Itemized receipt with discount (if applicable)
- Payment information
- Store details in footer

## Benefits

1. **Professional Branding** - All emails reflect your store's identity
2. **Easy Contact** - Customers can easily reach you
3. **Trust Building** - Professional emails build customer confidence
4. **Consistency** - Same branding across all communications
5. **Flexibility** - Easy to update via environment variables

## Fallback Behavior

If environment variables are not set:

- **Store Name:** Defaults to "POS Store"
- **Store Address:** Not shown if empty
- **Store Phone:** Not shown if empty
- **Store Logo:** Defaults to "/pos_logo.png"

This ensures emails still work even without configuration.

## File Structure

```
lib/email/
├── store-info.ts                    # NEW - Store information utility
├── templates/
│   ├── customer-welcome.ts          # UPDATED - With store branding
│   ├── user-creation.ts             # UPDATED - With store branding
│   └── purchase-receipt.ts          # UPDATED - With store branding

public/
└── pos_logo.png                     # Store logo (required)

.env.example                         # UPDATED - Store variables added
```

## Environment Variables Summary

```env
# Required for branding
NEXT_PUBLIC_STORE_NAME="Your Store Name"

# Optional but recommended
NEXT_PUBLIC_STORE_ADDRESS="Your Address"
NEXT_PUBLIC_STORE_PHONE="Your Phone"
NEXT_PUBLIC_STORE_LOGO="/pos_logo.png"
```

## Notes

- All changes are backward compatible
- Emails work without store information (with defaults)
- Logo must be accessible via HTTP (public folder or CDN)
- Store information is read at runtime (no rebuild needed)
- Plain text versions also include store information

## Next Steps

1. ✅ Store information utility created
2. ✅ All email templates updated
3. ✅ Environment variables documented
4. ⏳ Add store information to `.env.local`
5. ⏳ Add store logo to `public/` folder
6. ⏳ Test all three email types
7. ⏳ Verify branding appears correctly

## Support

If store branding doesn't appear:

1. Check environment variables are set correctly
2. Restart the application after changing `.env.local`
3. Verify logo file exists in `public/` folder
4. Check console logs for any errors
5. Test with a simple logo first (e.g., PNG file)
