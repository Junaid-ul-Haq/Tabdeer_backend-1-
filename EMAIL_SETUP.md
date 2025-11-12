# Email Setup Guide for Nodemailer

This guide will help you configure email notifications for the payment verification system.

## Environment Variables Required

Add these to your `.env` file (or `.env.production` for production):

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@tadbeerresource.com
FRONTEND_URL=https://www.tadbeerresource.com
```

### Important Notes:

1. **EMAIL_USER**: This is the email account that **SENDS** all emails. This should be your Gmail account (or any email service account). This is the "from" address in all emails.

2. **EMAIL_PASSWORD**: This is the password for the EMAIL_USER account. For Gmail, you **cannot** use your regular Gmail password. You must create an **App Password** (see Gmail Setup below).

3. **ADMIN_EMAIL**: This is where payment notifications will be sent. You can specify:
   - **Single admin**: `admin@tadbeerresource.com`
   - **Multiple admins** (comma-separated): `admin1@tadbeerresource.com,admin2@tadbeerresource.com,admin3@tadbeerresource.com`
   
   All admins will receive payment verification requests when a user submits payment.

## Gmail Setup (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to [Google Account](https://myaccount.google.com/)
2. Click on **Security** → **2-Step Verification**
3. Enable it (you'll need your phone number)

### Step 2: Generate App Password
1. Go to [Google Account](https://myaccount.google.com/) → **Security**
2. Click on **App passwords** (you may need to search for it)
3. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - Enter: "Tadbeer Backend"
4. Click **Generate**
5. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
6. **Remove spaces** when adding to `.env` file

### Step 3: Configure .env File
```env
# EMAIL_USER: Your Gmail account (the sender)
EMAIL_USER=yourname@gmail.com

# EMAIL_PASSWORD: The 16-character app password (NO SPACES)
# Example: If Google shows "abcd efgh ijkl mnop", use "abcdefghijklmnop"
EMAIL_PASSWORD=abcdefghijklmnop

# ADMIN_EMAIL: Where notifications are sent (can be multiple)
# Single admin:
ADMIN_EMAIL=admin@tadbeerresource.com

# Multiple admins (comma-separated):
ADMIN_EMAIL=admin1@tadbeerresource.com,admin2@tadbeerresource.com,admin3@tadbeerresource.com
```

### Important:
- **EMAIL_USER** = The Gmail account that sends emails (the "from" address)
- **EMAIL_PASSWORD** = The App Password for that Gmail account (NOT your regular password)
- **ADMIN_EMAIL** = Where payment notifications are received (can be different from EMAIL_USER)

## Other Email Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASSWORD=your-password
```

## Email Flow

### 1. Payment Submitted (User → Admin Panel)
- When a user submits payment, **NO email is sent to admin**
- Payment appears in the admin panel as a "pending" request
- Admin can view the payment request, screenshot, and user details in the admin dashboard
- Admin can then accept or reject the payment request

### 2. Payment Accepted (Admin → User)
- When admin accepts payment, **email is sent to the user**
- Email includes:
  - Confirmation message
  - Payment amount details
  - Credit hours information (3 credit hours added)
  - Link to dashboard

### 3. Payment Rejected (Admin → User)
- When admin rejects payment, **email is sent to the user**
- Email includes:
  - Rejection notice
  - Payment amount details
  - Admin notes (if provided)
  - Link to submit new payment

## Testing

After setting up, test the email functionality:

1. Submit a payment as a user (no email sent)
2. Check admin panel for the payment request
3. Accept/reject payment as admin
4. Check user email for confirmation/rejection message

## Troubleshooting

### Emails not sending?
- Check if `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Verify SMTP settings (host, port, secure)
- Check firewall/network restrictions
- Review server logs for error messages

### Gmail App Password not working?
- Make sure 2-Step Verification is enabled
- Regenerate the app password
- Remove spaces from the password in `.env`

### Email going to spam?
- Add email to contacts
- Check spam folder
- Consider using a dedicated email service (SendGrid, Mailgun, etc.)

## Production Considerations

For production, consider:
- Using a dedicated email service (SendGrid, AWS SES, Mailgun)
- Setting up SPF/DKIM records
- Using a dedicated email domain
- Monitoring email delivery rates
- Implementing email queue for better reliability

