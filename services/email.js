require('dotenv').config();
const nodemailer = require('nodemailer');

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = (email, message, headers) => {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Farmeely'} <${process.env.SMTP_USER}>`,
        to: email,
        subject: headers,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Farmeely Notification</h2>
            <p>${message}</p>
            <p>Best regards,<br>The Farmeely Team</p>
        </div>`
    };

    transporter.sendMail(mailOptions)
    .then(() => {
        console.log("Email sent successfully");
    })
    .catch((error) => {
        console.error("Email sending failed:", error);
    });
};

// Enhanced email functions for different use cases
const sendWelcomeEmail = (email, firstName) => {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Farmeely'} <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Welcome to Farmeely!",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Farmeely, ${firstName}!</h2>
          <p>Thank you for joining Farmeely. You can now create and join farming groups.</p>
          <p>Start exploring groups and begin your farming journey today!</p>
          <p>Best regards,<br>The Farmeely Team</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
};

const sendOTPEmail = (email, otp, firstName) => {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Farmeely'} <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verification Code - Farmeely",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Farmeely</h1>
          </div>

          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">Verification Code</h2>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Hi ${firstName},</p>
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Please use the following code to verify your account:</p>

            <div style="background: white; border: 2px dashed #28a745; border-radius: 10px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #28a745; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
            </div>

            <p style="color: #e74c3c; font-size: 14px; margin-top: 20px;">
              <strong>⚠️ This code will expire in 15 minutes</strong>
            </p>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>

          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>Best regards,<br>The Farmeely Team</p>
          </div>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = (email, resetToken, firstName) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Farmeely'} <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Password Reset Request - Farmeely",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Farmeely Team</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendEmail,
    sendWelcomeEmail,
    sendOTPEmail,
    sendPasswordResetEmail
};