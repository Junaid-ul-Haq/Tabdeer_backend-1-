import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create transporter (configure based on your email service)
export const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || "support@tadbeerresource.com";
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");
  
  console.log("📧 Email Configuration:");
  console.log("  - Host:", emailHost);
  console.log("  - Port:", emailPort);
  console.log("  - User:", emailUser);
  console.log("  - Password:", process.env.EMAIL_PASSWORD ? "***SET***" : "***NOT SET***");
  
  // Validate that EMAIL_PASSWORD is set
  if (!process.env.EMAIL_PASSWORD) {
    console.error("❌ EMAIL_PASSWORD is not set in environment variables!");
    throw new Error("EMAIL_PASSWORD environment variable is required");
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: process.env.EMAIL_PASSWORD, // Password for the email account
    },
  });
};

// Send email to user when payment is submitted (waiting for admin approval)
export const sendPaymentSubmittedEmail = async (user, payment) => {
  try {
    // Validate user object
    if (!user) {
      throw new Error("User object is required");
    }
    if (!user.email) {
      throw new Error("User email is required");
    }
    if (!user.name) {
      console.warn("⚠️ [PAYMENT SUBMITTED] User name is missing, using email as fallback");
    }

    console.log(`📧 [PAYMENT SUBMITTED] Preparing to send email to: ${user.email}`);
    const transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();
    console.log("✅ [PAYMENT SUBMITTED] SMTP server connection verified");

    const mailOptions = {
      from: `"Tadbeer Resource Center" <${process.env.EMAIL_USER || "support@tadbeerresource.com"}>`,
      to: user.email,
      subject: "⏳ Payment Submitted - Waiting for Admin Approval",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .pending-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⏳ Payment Submitted Successfully!</h2>
            </div>
            <div class="content">
              <p>Dear ${user.name || user.email || 'Valued User'},</p>
              
              <div class="pending-box">
                <h3>📋 Payment Received</h3>
                <p>Thank you for submitting your payment of <strong>PKR ${payment.amount ? payment.amount.toLocaleString() : 'N/A'}</strong>.</p>
                <p><strong>Your payment is now under review by our admin team.</strong></p>
              </div>

              <p><strong>⏳ Waiting for Admin Approval</strong></p>
              <p>Please wait for admin verification. Once your payment is approved, you will receive an email notification and can access your dashboard.</p>
              <p>You will be notified via email once the admin reviews your payment request.</p>

              <p style="margin-top: 20px;">Thank you for choosing Tadbeer Resource Center!</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Tadbeer Resource Center.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`📧 [PAYMENT SUBMITTED] Sending email to: ${user.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [PAYMENT SUBMITTED] Email sent successfully!");
    console.log("  - Message ID:", info.messageId);
    console.log("  - Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ [PAYMENT SUBMITTED] Error sending email:");
    console.error("  - To:", user.email);
    console.error("  - Error Code:", error.code);
    console.error("  - Error Message:", error.message);
    console.error("  - Full Error:", error);
    throw error;
  }
};

// Send email to user when payment is accepted (from admin)
export const sendPaymentAcceptedEmail = async (user, payment) => {
  try {
    // Validate user object
    if (!user) {
      throw new Error("User object is required");
    }
    if (!user.email) {
      throw new Error("User email is required");
    }
    if (!user.name) {
      console.warn("⚠️ [PAYMENT ACCEPTED] User name is missing, using email as fallback");
    }

    console.log(`📧 [PAYMENT ACCEPTED] Preparing to send email to: ${user.email}`);
    const transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();
    console.log("✅ [PAYMENT ACCEPTED] SMTP server connection verified");

    const mailOptions = {
      from: `"Tadbeer Resource Center Admin" <${process.env.EMAIL_USER || "support@tadbeerresource.com"}>`,
      to: user.email,
      subject: "✅ Payment Verified - Welcome to Tadbeer Resource Center!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8FC241 0%, #18BAD2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background: #8FC241; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Payment Verified Successfully!</h2>
            </div>
            <div class="content">
              <p>Dear ${user.name || user.email || 'Valued User'},</p>
              
              <div class="success-box">
                <h3>🎉 Great News!</h3>
                <p>Your payment of <strong>PKR ${payment.amount ? payment.amount.toLocaleString() : 'N/A'}</strong> has been successfully received and verified by our admin team.</p>
                <p>You now have <strong>3 credit hours</strong> to apply for Education and Guidance and Entrepreneur Incubation programs!</p>
              </div>

              <p><strong>Your payment has been successfully received. You can now access your dashboard.</strong></p>
              <a href="${process.env.FRONTEND_URL || "https://www.tadbeerresource.com"}/user" class="button">Go to Dashboard</a>

              <p style="margin-top: 20px;">Thank you for choosing Tadbeer Resource Center!</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Tadbeer Resource Center.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`📧 [PAYMENT ACCEPTED] Sending email to: ${user.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [PAYMENT ACCEPTED] Email sent successfully!");
    console.log("  - Message ID:", info.messageId);
    console.log("  - Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ [PAYMENT ACCEPTED] Error sending email:");
    console.error("  - To:", user.email);
    console.error("  - Error Code:", error.code);
    console.error("  - Error Message:", error.message);
    console.error("  - Full Error:", error);
    throw error;
  }
};

// Send email to user when payment is rejected (from admin)
export const sendPaymentRejectedEmail = async (user, payment) => {
  try {
    // Validate user object
    if (!user) {
      throw new Error("User object is required");
    }
    if (!user.email) {
      throw new Error("User email is required");
    }
    if (!user.name) {
      console.warn("⚠️ [PAYMENT REJECTED] User name is missing, using email as fallback");
    }

    console.log(`📧 [PAYMENT REJECTED] Preparing to send email to: ${user.email}`);
    const transporter = createTransporter();

    // Verify transporter connection
    await transporter.verify();
    console.log("✅ [PAYMENT REJECTED] SMTP server connection verified");

    const mailOptions = {
      from: `"Tadbeer Resource Center Admin" <${process.env.EMAIL_USER || "support@tadbeerresource.com"}>`,
      to: user.email,
      subject: "❌ Payment Verification Rejected",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
            .reject-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 24px; background: #8FC241; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>❌ Payment Verification Rejected</h2>
            </div>
            <div class="content">
              <p>Dear ${user.name || user.email || 'Valued User'},</p>
              
              <div class="reject-box">
                <h3>Important Notice</h3>
                <p>We regret to inform you that your payment of <strong>PKR ${payment.amount ? payment.amount.toLocaleString() : 'N/A'}</strong> has been rejected by our admin team.</p>
                ${payment.adminNotes ? `<p><strong>Reason:</strong> ${payment.adminNotes}</p>` : ""}
              </div>

              <p><strong>Unfortunately, your payment has been rejected. You cannot access the dashboard at this time.</strong></p>
              <p>Please review your payment details and submit a new payment if needed. Make sure the payment screenshot is clear and shows all required information.</p>
              <a href="${process.env.FRONTEND_URL || "https://www.tadbeerresource.com"}/payment" class="button">Submit New Payment</a>

              <p style="margin-top: 20px;">If you believe this is an error, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Tadbeer Resource Center.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log(`📧 [PAYMENT REJECTED] Sending email to: ${user.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [PAYMENT REJECTED] Email sent successfully!");
    console.log("  - Message ID:", info.messageId);
    console.log("  - Response:", info.response);
    return info;
  } catch (error) {
    console.error("❌ [PAYMENT REJECTED] Error sending email:");
    console.error("  - To:", user.email);
    console.error("  - Error Code:", error.code);
    console.error("  - Error Message:", error.message);
    console.error("  - Full Error:", error);
    throw error;
  }
};
