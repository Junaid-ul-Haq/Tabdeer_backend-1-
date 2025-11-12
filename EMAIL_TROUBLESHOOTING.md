# Email Troubleshooting Guide

## Issue: Email Not Received After Payment Acceptance

If the admin accepted the payment but the client didn't receive an email, follow these steps:

## Step 1: Check Backend Logs

When you accept a payment, check your backend server console/terminal. You should see logs like:

```
📧 Attempting to send verified email to user: user@example.com
📧 Email Configuration:
  - Host: smtp.gmail.com
  - Port: 587
  - User: support@tadbeerresource.com
  - Password: ***SET***
📧 Preparing to send payment accepted email to: user@example.com
✅ SMTP server connection verified
📧 Sending email to: user@example.com
✅ Payment accepted email sent successfully!
  - Message ID: <...>
  - Response: 250 2.0.0 OK ...
✅ Successfully sent payment accepted email to: user@example.com
```

### If you see ERROR logs:
- ❌ **"Invalid login"** → Wrong EMAIL_PASSWORD (need Gmail App Password)
- ❌ **"Connection timeout"** → Network/firewall issue
- ❌ **"Authentication failed"** → Wrong EMAIL_USER or EMAIL_PASSWORD
- ❌ **"User not found"** → User account deleted or invalid

## Step 2: Verify .env File Configuration

Check your `Tabdeer_backend-1-/.env` file has:

```env
EMAIL_USER=support@tadbeerresource.com
EMAIL_PASSWORD=Zia@2025Secure
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
FRONTEND_URL=http://localhost:3000
```

**IMPORTANT:** 
- `EMAIL_PASSWORD` must be a **Gmail App Password**, NOT your regular Gmail password
- If `Zia@2025Secure` is your regular password, it won't work!

## Step 3: Check Gmail App Password

### If using Gmail, you MUST use App Password:

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Create new App Password:
   - App: **Mail**
   - Device: **Other (Custom name)** → Enter "Tadbeer Backend"
5. Copy the 16-character password (remove spaces)
6. Update `.env` file:
   ```env
   EMAIL_PASSWORD=abcdefghijklmnop  # Use the App Password here
   ```
7. **Restart your backend server**

## Step 4: Check Email Spam Folder

- Emails might go to **Spam/Junk** folder
- Ask the client to check their spam folder
- The email subject is: "✅ Payment Verified - Welcome to Tadbeer Resource Center!"

## Step 5: Verify Email Address

- Make sure the user's email address in the database is correct
- Check backend logs to see what email address was used

## Step 6: Test Email Configuration

You can test if email is working by checking the backend logs when accepting a payment:

1. Accept a payment as admin
2. Check backend console for email logs
3. Look for:
   - ✅ "SMTP server connection verified" → Email config is correct
   - ✅ "Email sent successfully" → Email was sent
   - ❌ Any error messages → Follow the error message

## Common Issues & Solutions

### Issue 1: "Invalid login" or "Authentication failed"
**Solution:** Use Gmail App Password, not regular password

### Issue 2: "Connection timeout"
**Solution:** 
- Check internet connection
- Check firewall settings
- Try port 465 with `EMAIL_SECURE=true`

### Issue 3: Email sent but not received
**Solution:**
- Check spam folder
- Verify recipient email address is correct
- Wait a few minutes (emails can be delayed)

### Issue 4: No logs appear when accepting payment
**Solution:**
- Check if backend server is running
- Check if `.env` file exists and is loaded
- Restart backend server

## Quick Test

To test email immediately:

1. Make sure `.env` file is configured correctly
2. Restart backend server: `npm start`
3. Accept a payment as admin
4. Check backend console logs immediately
5. Look for email-related logs (📧 emoji)

## Still Not Working?

If emails still don't work after checking all above:

1. **Share backend console logs** when accepting payment
2. **Verify `.env` file** has correct values
3. **Check if Gmail App Password** is being used (not regular password)
4. **Test with a different email provider** (if Gmail doesn't work)








