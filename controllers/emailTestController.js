import { createTransporter } from "../utils/emailService.js";

// @desc Test email configuration (Admin only)
export const testEmailConfiguration = async (req, res) => {
  try {
    console.log("🧪 [EMAIL TEST] Testing email configuration...");
    
    // Get test email from query or use admin's email
    const testEmail = req.query.email || req.user.email;
    
    if (!testEmail) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email address to test. Add ?email=your@email.com to the URL",
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Test 1: Verify SMTP connection
    console.log("🧪 [EMAIL TEST] Step 1: Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ [EMAIL TEST] SMTP connection verified successfully!");

    // Test 2: Send test email
    console.log(`🧪 [EMAIL TEST] Step 2: Sending test email to ${testEmail}...`);
    const mailOptions = {
      from: `"Tadbeer Resource Center" <${process.env.EMAIL_USER || "support@tadbeerresource.com"}>`,
      to: testEmail,
      subject: "🧪 Email Configuration Test - Tadbeer Resource Center",
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
            .info-box { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>✅ Email Configuration Test Successful!</h2>
            </div>
            <div class="content">
              <div class="success-box">
                <h3>🎉 Congratulations!</h3>
                <p>Your email configuration is working correctly!</p>
              </div>
              
              <div class="info-box">
                <h3>📧 Configuration Details:</h3>
                <p><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST || "smtp.gmail.com"}</p>
                <p><strong>SMTP Port:</strong> ${process.env.EMAIL_PORT || "587"}</p>
                <p><strong>Sender Email:</strong> ${process.env.EMAIL_USER || "support@tadbeerresource.com"}</p>
                <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
              </div>

              <p>If you received this email, it means:</p>
              <ul>
                <li>✅ SMTP server connection is working</li>
                <li>✅ Email authentication is successful</li>
                <li>✅ Emails can be sent from your server</li>
                <li>✅ Payment verification emails will work correctly</li>
              </ul>

              <p style="margin-top: 20px;">Your email system is ready to send payment notifications!</p>
            </div>
            <div class="footer">
              <p>This is a test email from Tadbeer Resource Center.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL TEST] Test email sent successfully!");
    console.log("  - Message ID:", info.messageId);
    console.log("  - Response:", info.response);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${testEmail}`,
      details: {
        messageId: info.messageId,
        response: info.response,
        from: process.env.EMAIL_USER || "support@tadbeerresource.com",
        to: testEmail,
        smtpHost: process.env.EMAIL_HOST || "smtp.gmail.com",
        smtpPort: process.env.EMAIL_PORT || "587",
      },
    });
  } catch (error) {
    console.error("❌ [EMAIL TEST] Error testing email configuration:");
    console.error("  - Error Code:", error.code);
    console.error("  - Error Message:", error.message);
    console.error("  - Full Error:", error);

    let errorMessage = "Failed to test email configuration";
    let errorDetails = {};

    if (error.code === "EAUTH") {
      errorMessage = "Authentication failed. Check EMAIL_USER and EMAIL_PASSWORD";
      errorDetails = {
        issue: "Invalid email credentials",
        solution: "Verify EMAIL_USER and EMAIL_PASSWORD in .env file. For Gmail, use App Password.",
      };
    } else if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      errorMessage = "Cannot connect to SMTP server";
      errorDetails = {
        issue: "Network/firewall blocking SMTP connection",
        solution: "Check internet connection and firewall settings. Verify EMAIL_HOST and EMAIL_PORT.",
      };
    } else if (error.message?.includes("EMAIL_PASSWORD")) {
      errorMessage = "EMAIL_PASSWORD not set";
      errorDetails = {
        issue: "Missing EMAIL_PASSWORD in .env file",
        solution: "Add EMAIL_PASSWORD to your .env file",
      };
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      errorCode: error.code,
      details: errorDetails,
    });
  }
};







