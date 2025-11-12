# 📧 Email SMTP Configuration Guide - Step by Step

## What is SMTP Configuration?

SMTP (Simple Mail Transfer Protocol) is how your application sends emails. You need to configure your `EMAIL_USER` account to allow your backend server to send emails on its behalf.

---

## ✅ How to Check if Email is Configured

### Method 1: Check Backend Console on Startup

When your backend server starts, look for these logs:

```
📧 Email Configuration:
  - Host: smtp.gmail.com
  - Port: 587
  - User: support@tadbeerresource.com
  - Password: ***SET***
```

**If you see:**
- ✅ `Password: ***SET***` → Email password is configured
- ❌ `Password: ***NOT SET***` → Email password is missing

### Method 2: Use the Test Endpoint (Recommended)

1. **Start your backend server**
2. **Login as admin** in your frontend
3. **Open browser** and go to:
   ```
   http://localhost:4000/email/test?email=your-test-email@gmail.com
   ```
   (Replace `your-test-email@gmail.com` with your actual email)

4. **Check the response:**
   - ✅ **Success**: You'll receive a test email and see success message
   - ❌ **Error**: You'll see error details with solutions

### Method 3: Check .env File

Open `Tabdeer_backend-1-/.env` and verify these exist:

```env
EMAIL_USER=support@tadbeerresource.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

---

## 🔧 Step-by-Step: Configure Gmail SMTP

### Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **"2-Step Verification"**
3. Click **"Get Started"**
4. Follow the prompts to enable 2-Step Verification
   - You'll need your phone number
   - Google will send a verification code

**Why?** Gmail requires 2-Step Verification to generate App Passwords.

### Step 2: Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Scroll down and click **"App passwords"**
   - If you don't see it, search for "App passwords" in the search bar
3. You may need to sign in again
4. Select:
   - **App**: Choose **"Mail"**
   - **Device**: Choose **"Other (Custom name)"**
   - Enter: **"Tadbeer Backend"**
5. Click **"Generate"**
6. **Copy the 16-character password** that appears
   - It will look like: `abcd efgh ijkl mnop`
   - **Remove all spaces** when using it

### Step 3: Update .env File

1. Open `Tabdeer_backend-1-/.env` file
2. Update these values:

```env
# Your Gmail account (the one you just created App Password for)
EMAIL_USER=your-email@gmail.com

# The 16-character App Password (NO SPACES)
# Example: If Google shows "abcd efgh ijkl mnop", use "abcdefghijklmnop"
EMAIL_PASSWORD=abcdefghijklmnop

# Gmail SMTP settings (don't change these)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

3. **Save the file**

### Step 4: Restart Backend Server

**IMPORTANT:** After changing `.env` file, you MUST restart your backend server:

```bash
# Stop the server (Ctrl+C)
# Then start again:
cd Tabdeer_backend-1-
npm start
```

### Step 5: Test the Configuration

**Option A: Use Test Endpoint**
```
http://localhost:4000/email/test?email=your-email@gmail.com
```

**Option B: Test by Accepting a Payment**
1. Have a user submit a payment
2. Accept the payment as admin
3. Check backend console for email logs
4. Check user's email inbox (and spam folder)

---

## 🔍 How to Verify Configuration is Working

### Check 1: Backend Console Logs

When you start the server, you should see:
```
📧 Email Configuration:
  - Host: smtp.gmail.com
  - Port: 587
  - User: your-email@gmail.com
  - Password: ***SET***
```

### Check 2: Test Endpoint Response

Visit: `http://localhost:4000/email/test?email=your-email@gmail.com`

**Success Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully to your-email@gmail.com",
  "details": {
    "messageId": "...",
    "from": "your-email@gmail.com",
    "to": "your-email@gmail.com",
    "smtpHost": "smtp.gmail.com",
    "smtpPort": "587"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD",
  "errorCode": "EAUTH",
  "details": {
    "issue": "Invalid email credentials",
    "solution": "Verify EMAIL_USER and EMAIL_PASSWORD in .env file. For Gmail, use App Password."
  }
}
```

### Check 3: Check Your Email Inbox

After running the test:
- ✅ **Email received** → Configuration is working!
- ❌ **No email** → Check spam folder, then check error logs

---

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication failed" or "Invalid login"

**Problem:** Wrong password or using regular Gmail password instead of App Password

**Solution:**
1. Make sure you're using **App Password**, not your regular Gmail password
2. Generate a new App Password from Google Account
3. Copy it exactly (remove spaces)
4. Update `.env` file
5. Restart backend server

### Issue 2: "Connection timeout" or "ECONNREFUSED"

**Problem:** Network/firewall blocking SMTP port 587

**Solution:**
1. Check internet connection
2. Check firewall settings
3. Try port 465 with `EMAIL_SECURE=true`:
   ```env
   EMAIL_PORT=465
   EMAIL_SECURE=true
   ```

### Issue 3: "EMAIL_PASSWORD not set"

**Problem:** Missing EMAIL_PASSWORD in .env file

**Solution:**
1. Add `EMAIL_PASSWORD=your_app_password` to `.env` file
2. Restart backend server

### Issue 4: Email sent but not received

**Problem:** Email might be in spam or wrong email address

**Solution:**
1. Check spam/junk folder
2. Verify the recipient email address is correct
3. Wait a few minutes (emails can be delayed)

---

## 📝 Quick Checklist

- [ ] 2-Step Verification enabled on Gmail account
- [ ] App Password generated from Google Account
- [ ] `.env` file has `EMAIL_USER` (your Gmail address)
- [ ] `.env` file has `EMAIL_PASSWORD` (16-character App Password, no spaces)
- [ ] `.env` file has `EMAIL_HOST=smtp.gmail.com`
- [ ] `.env` file has `EMAIL_PORT=587`
- [ ] `.env` file has `EMAIL_SECURE=false`
- [ ] Backend server restarted after updating `.env`
- [ ] Test endpoint shows success
- [ ] Test email received in inbox

---

## 🎯 Summary

**EMAIL_USER** = Your Gmail account that sends emails  
**EMAIL_PASSWORD** = Gmail App Password (NOT your regular password)  
**SMTP Configuration** = Setting up your email account to allow the server to send emails

**To check if configured:**
1. Look at backend console logs on startup
2. Use test endpoint: `http://localhost:4000/email/test?email=your@email.com`
3. Check if you receive the test email

**If not working:**
- Make sure you're using App Password (not regular password)
- Make sure 2-Step Verification is enabled
- Restart backend server after changing `.env`







