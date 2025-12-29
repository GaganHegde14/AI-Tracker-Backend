import nodemailer from "nodemailer";

// Allowed email domains (major providers only)
const ALLOWED_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "zoho.com",
];

// Check if email domain is allowed
export const isEmailDomainAllowed = (email) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

// Create transporter using Gmail (you can use any free service)
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "Email credentials not configured. Check EMAIL_USER and EMAIL_PASS in .env file"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail
      pass: process.env.EMAIL_PASS, // App-specific password
    },
  });
};

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "AI Task Manager - Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to AI Task Manager! 🎉</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: #374151;">Your Verification Code</h3>
            <h1 style="font-size: 32px; color: #4F46E5; letter-spacing: 5px; margin: 10px 0;">${otp}</h1>
            <p style="color: #6B7280; font-size: 14px;">This code expires in 10 minutes</p>
          </div>
          
          <p>Enter this 6-digit code in the verification page to activate your account.</p>
          
          <p style="color: #EF4444; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't create this account, please ignore this email.
          </p>
          
          <hr style="border: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            AI Task Manager Team<br>
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    };

    console.log("📤 Sending email...");
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error.message);
    return { success: false, error: error.message };
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to AI Task Manager! 🚀",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Account Verified Successfully! ✅</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          
          <p>Congratulations! Your email has been verified and your AI Task Manager account is now active.</p>
          
          <div style="background-color: #F0FDF4; padding: 20px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3 style="margin: 0; color: #059669;">What's Next?</h3>
            <ul style="color: #374151;">
              <li>Create your first task</li>
              <li>Explore AI-powered task generation</li>
              <li>Set up your profile</li>
              <li>Start leveling up by completing tasks!</li>
            </ul>
          </div>
          
          <p>We're excited to help you boost your productivity! 🎯</p>
          
          <hr style="border: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            AI Task Manager Team<br>
            Happy task managing! 📝✨
          </p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error: error.message };
  }
};
