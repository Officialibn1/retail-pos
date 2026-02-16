# Store Branding Customization Guide

This guide explains how to customize your store's branding across all email templates in the POS system.

## Overview

The system supports comprehensive store branding customization through environment variables. All email templates automatically use your store's branding, including:

- Store name
- Contact information (address, phone, email)
- Brand colors (primary and secondary)
- Logo

## Environment Variables

Add these variables to your `.env` file:

### Store Information

```env
# Store name displayed in emails and UI
NEXT_PUBLIC_STORE_NAME="Your Store Name"

# Physical store address
NEXT_PUBLIC_STORE_ADDRESS="123 Main Street, City, State 12345"

# Store phone number
NEXT_PUBLIC_STORE_PHONE="(555) 123-4567"

# Store contact email (displayed in email footers)
NEXT_PUBLIC_STORE_EMAIL="support@yourstore.com"

# Store logo URL or path
NEXT_PUBLIC_STORE_LOGO="/pos_logo.png"
```

### Brand Colors

```env
# Primary brand color (used for headers, buttons, accents)
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#7c3aed"

# Secondary brand color (used for gradients, hover states)
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#a78bfa"
```

### Application URL

```env
# Your application URL (used for password reset links)
NEXT_PUBLIC_APP_URL="https://yourstore.com"
```

## Color Customization

### Choosing Colors

Your brand colors should be in hexadecimal format (e.g., `#7c3aed`). Consider:

1. **Primary Color**: Main brand color, used for:
   - Email headers
   - Call-to-action buttons
   - Important highlights
   - Links and accents

2. **Secondary Color**: Complementary color, used for:
   - Gradients (with primary)
   - Hover states
   - Secondary elements

### Color Examples

Here are some popular color combinations:

**Purple Theme (Default)**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#7c3aed"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#a78bfa"
```

**Blue Theme**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#3b82f6"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#60a5fa"
```

**Green Theme**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#10b981"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#34d399"
```

**Red Theme**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#ef4444"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#f87171"
```

**Orange Theme**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#f97316"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#fb923c"
```

**Teal Theme**

```env
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#14b8a6"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#2dd4bf"
```

### Testing Colors

To test your colors:

1. Update your `.env` file with new colors
2. Restart your development server
3. Trigger a test email (e.g., password reset)
4. Check the email appearance

## Email Templates Using Store Branding

All email templates automatically use your store branding:

### 1. Password Reset Email

- Gradient header with store colors
- Store name and contact info in footer
- Branded buttons and accents

### 2. User Creation Email

- Store colors in header
- Store contact information
- Branded design elements

### 3. User Status Change Email

- Status-specific colors (active/blocked/suspended)
- Store information in footer

### 4. Customer Welcome Email

- Store colors in header
- Store contact details
- Branded welcome message

### 5. Purchase Receipt Email

- Store branding throughout
- Store logo and information
- Branded receipt design

### 6. Canceled Orders Email

- Store colors in header
- Store contact information
- Branded report design

## Logo Customization

### Logo Requirements

- **Format**: PNG, JPG, or SVG
- **Recommended Size**: 150-200px width
- **Background**: Transparent (PNG) or white
- **Aspect Ratio**: Horizontal or square works best

### Logo Setup

1. **Option 1: Local File**
   - Place logo in `/public` directory
   - Set `NEXT_PUBLIC_STORE_LOGO="/your-logo.png"`

2. **Option 2: External URL**
   - Upload logo to CDN or image hosting
   - Set `NEXT_PUBLIC_STORE_LOGO="https://cdn.example.com/logo.png"`

## Implementation Details

### Store Info Utility

The `getStoreInfo()` function in `lib/email/store-info.ts` retrieves all store information:

```typescript
import { getStoreInfo } from "@/lib/email/store-info";

const store = getStoreInfo();
// Returns: { name, address, phone, email, logo, colors: { primary, secondary } }
```

### Using Store Colors in Templates

All email templates automatically use store colors:

```typescript
const store = getStoreInfo();

// Use in HTML
`<div style="background: linear-gradient(135deg, ${store.colors.primary} 0%, ${store.colors.secondary} 100%);">`
// Use for buttons
`<a style="background: ${store.colors.primary};">Click Here</a>`;
```

### Store Information Footer

All emails include a consistent footer with store information:

```typescript
<div class="contact-info">
  <p><strong>${store.name}</strong></p>
  ${store.address ? `<p>${store.address}</p>` : ""}
  ${store.phone ? `<p>Phone: ${store.phone}</p>` : ""}
  ${store.email ? `<p>Email: ${store.email}</p>` : ""}
</div>
```

## Best Practices

### 1. Color Accessibility

- Ensure sufficient contrast between text and background
- Test colors with accessibility tools
- Consider colorblind users

### 2. Consistent Branding

- Use the same colors across all platforms
- Match your website/app branding
- Keep logo consistent

### 3. Professional Appearance

- Use high-quality logo images
- Choose professional color combinations
- Keep contact information up-to-date

### 4. Testing

- Send test emails before going live
- Check appearance in multiple email clients
- Verify all links work correctly

## Troubleshooting

### Colors Not Showing

1. Check `.env` file has correct format
2. Restart development server
3. Clear browser cache
4. Verify hex color format (include `#`)

### Logo Not Displaying

1. Verify logo path is correct
2. Check file exists in `/public` directory
3. For external URLs, ensure CORS is configured
4. Test logo URL in browser

### Store Info Not Updating

1. Restart development server after `.env` changes
2. Check environment variable names are correct
3. Verify no typos in variable names
4. Clear Next.js cache: `rm -rf .next`

## Examples

### Complete Store Configuration

```env
# Store Information
NEXT_PUBLIC_STORE_NAME="Acme Retail Store"
NEXT_PUBLIC_STORE_ADDRESS="456 Commerce Ave, Business District, NY 10001"
NEXT_PUBLIC_STORE_PHONE="(212) 555-0123"
NEXT_PUBLIC_STORE_EMAIL="support@acmeretail.com"
NEXT_PUBLIC_STORE_LOGO="https://cdn.acmeretail.com/logo.png"

# Brand Colors (Blue theme)
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#2563eb"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#60a5fa"

# Application URL
NEXT_PUBLIC_APP_URL="https://pos.acmeretail.com"
```

### Minimal Configuration

```env
# Only required fields
NEXT_PUBLIC_STORE_NAME="My Store"
NEXT_PUBLIC_STORE_EMAIL="info@mystore.com"

# Colors will use defaults if not specified
NEXT_PUBLIC_STORE_COLOR_PRIMARY="#7c3aed"
NEXT_PUBLIC_STORE_COLOR_SECONDARY="#a78bfa"
```

## Related Files

- `lib/email/store-info.ts` - Store information utility
- `lib/email/templates/*.ts` - All email templates
- `.env.example` - Example environment configuration
- `FORGOT_PASSWORD_IMPLEMENTATION.md` - Password reset feature docs
- `EMAIL_SYSTEM_IMPLEMENTATION.md` - Email system docs

## Support

For issues or questions about store branding:

1. Check this documentation
2. Review `.env.example` for correct format
3. Test with default values first
4. Check email template files for customization options
