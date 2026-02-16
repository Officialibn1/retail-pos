# Database Backup Feature

## Overview

Manual database backup feature that allows SUPERADMIN users to export the entire database to an Excel file.

## Components

### BackupConfirmationDialog

- Location: `components/settings/backup-confirmation-dialog.tsx`
- Displays confirmation dialog with warning about not performing operations during backup
- Handles the backup download process
- Shows loading state during backup creation

## API Endpoint

### POST /api/backup

- Location: `app/api/backup/route.ts`
- Requires SUPERADMIN role
- Exports all database tables to Excel format:
  - Users (excluding passwords)
  - Customers
  - Categories
  - Inventory Items
  - Sales
  - Sale Items
  - Stock Movements
  - Activity Logs
- Returns Excel file with timestamp in filename

## Usage

1. Navigate to Settings page (only visible to SUPERADMIN)
2. Click "Create Backup" button in the Database Backup card
3. Review the warning in the confirmation dialog
4. Click "Proceed with Backup"
5. Excel file will be downloaded automatically

## Dependencies

- `xlsx` - Excel file generation library
