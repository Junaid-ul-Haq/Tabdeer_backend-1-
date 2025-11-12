# Environment Variables Setup Guide

## Quick Explanation

### EMAIL_USER (The Sender)
- **This is NOT the user who requests payment**
- **This is the email account that SENDS all emails**
- This is the "from" address that appears in all emails
- Example: `tadbeerresource@gmail.com`
- This should be your organization's Gmail account (or any email service)

### EMAIL_PASSWORD (Password for EMAIL_USER)
- **This is the password for the EMAIL_USER account**
- **For Gmail: You CANNOT use your regular password**
- You MUST create a Gmail "App Password"
- See instructions below on how to get App Password

### ADMIN_EMAIL (Optional - Not Currently Used)
- **Note: This is currently NOT used in the code**
- Payment requests appear in the admin panel dashboard (no email notifications)
- Admin reviews payments in the dashboard and accepts/rejects them
- Emails are only sent TO users when admin accepts/rejects their payment
- This variable is kept for future use or reference only

## How to Get Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to https://myaccount.google.com/
2. Click **Security**
3. Enable **2-Step Verification** (if not already enabled)

### Step 2: Create App Password
1. Go to https://myaccount.google.com/ → **Security**
2. Find **App passwords** (search if needed)
3. Click **Select app** → Choose **Mail**
4. Click **Select device** → Choose **Other (Custom name)**
5. Enter: **Tadbeer Backend**
6. Click **Generate**
7. **Copy the 16-character password** (it will show like: `abcd efgh ijkl mnop`)
8. **Remove all spaces** when adding to `.env` file → `abcdefghijklmnop`

## Example .env File

```env
# The email account that sends emails (the "from" address)
EMAIL_USER=tadbeerresource@gmail.com

# The App Password for the EMAIL_USER account (NOT your regular password)
EMAIL_PASSWORD=abcdefghijklmnop

# Optional: Not currently used (payment requests appear in admin panel, not via email)
ADMIN_EMAIL=admin@tadbeerresource.com
```

## Email Flow

**Current Implementation:**
1. User submits payment → Payment appears in admin panel (NO email sent to admin)
2. Admin reviews payment in dashboard → Accepts or rejects
3. Admin accepts/rejects → Email sent TO user (not to admin)

**Note:** `ADMIN_EMAIL` is not currently used. Payment requests are managed through the admin dashboard interface.

## Important Notes

1. **EMAIL_USER** = The account that sends emails (not the requesting user)
2. **EMAIL_PASSWORD** = App Password for EMAIL_USER (not regular password)
3. **ADMIN_EMAIL** = Optional, not currently used (payment requests appear in admin panel)
4. For Gmail, you MUST use App Password, regular password won't work
5. **No emails are sent to admin** - Admin reviews payments in the dashboard
6. **Emails are only sent to users** when admin accepts/rejects their payment

