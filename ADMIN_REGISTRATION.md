# Admin Registration Security Guide

## 🔒 How Admin Registration Works

Admin registration is **secured** using a secret key system. Only users with the correct secret key can register as administrators.

## Setup Instructions

### 1. Set Admin Secret Key in Backend

Add to your backend `.env` file:

```env
ADMIN_SECRET_KEY=your_strong_secret_key_here
```

**Important Security Tips:**
- Use a long, random string (at least 32 characters)
- Never commit this to version control
- Use different keys for development and production
- Change it periodically for security

### 2. Default Secret Key

If `ADMIN_SECRET_KEY` is not set in `.env`, the system defaults to:
```
TADBEER_ADMIN_2024_SECRET
```

⚠️ **Warning:** Always set a custom secret key in production!

## How to Register as Admin

### Option 1: Through Frontend (Recommended)

1. Go to the registration page: `/register`
2. Fill in all required fields (name, email, phone, password, CNIC)
3. Check the checkbox: **"Register as Administrator"**
4. Enter the **Admin Secret Key** in the field that appears
5. Submit the form

If the secret key is correct, you'll be registered as admin. If incorrect, you'll get an error message.

### Option 2: Through Postman/API

```bash
POST http://localhost:4000/auth/signup

Form Data:
- name: Admin Name
- email: admin@example.com
- phone: 03001234567
- password: yourpassword
- confirmPassword: yourpassword
- role: admin
- adminSecretKey: your_secret_key_here
- cnicFront: (file)
- cnicBack: (file)
```

## Security Features

✅ **Backend Validation:** The secret key is validated on the server side
✅ **No Frontend Exposure:** The secret key is never stored or exposed in frontend code
✅ **Default to User:** Without the secret key, registration defaults to "user" role
✅ **Error Messages:** Clear error messages if secret key is invalid

## Best Practices

1. **Share Secret Key Securely:**
   - Use secure channels (encrypted email, password manager, etc.)
   - Only share with authorized personnel
   - Rotate the key periodically

2. **Development vs Production:**
   - Use different keys for dev and production
   - Never use production keys in development

3. **Monitor Admin Registrations:**
   - Regularly check your database for new admin users
   - Set up alerts for admin account creation

## Troubleshooting

**Q: I can't register as admin even with the correct key**
- Check that `ADMIN_SECRET_KEY` is set in your backend `.env` file
- Restart the backend server after changing the key
- Verify the key matches exactly (case-sensitive, no extra spaces)

**Q: Can I change the secret key?**
- Yes, update it in `.env` and restart the server
- Existing admins won't be affected, only new registrations

**Q: What happens if someone tries to register as admin without the key?**
- The registration will fail with a 403 error
- They cannot become admin without the correct secret key
- The system defaults to "user" role if no role is specified

