# Email Configuration Summary

## Current Setup

The email system is configured to send emails **only when admin accepts or rejects payment**.

### Email Account
- **EMAIL_USER**: `support@tadbeerresource.com`
- **EMAIL_PASSWORD**: `Zia@2025Secure`

### Email Flow

1. **User submits payment** → No email sent (payment is pending)
2. **Admin accepts payment** → Email sent to user from `support@tadbeerresource.com`
   - Subject: "✅ Payment Verified - Welcome to Tadbeer Resource Center!"
   - Message: "Your payment has been reviewed successfully. You can now access your dashboard."
3. **Admin rejects payment** → Email sent to user from `support@tadbeerresource.com`
   - Subject: "❌ Payment Verification Rejected"
   - Message: "Your payment has been reviewed. Unfortunately, you cannot access the dashboard at this time."

### Dashboard Access Control

- **Users can ONLY access dashboard after payment is verified**
- If payment is not verified, user is redirected to `/payment` page
- User must wait for admin to review and accept payment before accessing dashboard

### Environment Variables

Add these to your `.env` file:

```env
EMAIL_USER=support@tadbeerresource.com
EMAIL_PASSWORD=Zia@2025Secure
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
FRONTEND_URL=https://www.tadbeerresource.com
```

### Important Notes

- All emails are sent **FROM** `support@tadbeerresource.com` **TO** the user's email
- No emails are sent to admin when payment is submitted
- Emails are only sent when admin takes action (accept/reject)
- Dashboard access is blocked until payment is verified

