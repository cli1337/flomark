import { createEmailTransporter, getDefaultFromAddress } from "../config/email.config.js";

// Create the transporter instance
const transporter = createEmailTransporter();

/**
 * Email Service - Provides methods for sending emails
 */
export const emailService = {
  /**
   * Check if email service is configured and available
   * @returns {boolean}
   */
  isConfigured() {
    return transporter !== null;
  },

  /**
   * Send a basic email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email address
   * @param {string} options.subject - Email subject
   * @param {string} options.text - Plain text body
   * @param {string} [options.html] - HTML body (optional)
   * @param {string} [options.from] - Sender email (optional, uses default if not provided)
   * @returns {Promise<Object>} Send result
   */
  async sendEmail({ to, subject, text, html, from }) {
    if (!this.isConfigured()) {
      throw new Error("Email service is not configured. Please check your SMTP settings.");
    }

    try {
      const mailOptions = {
        from: from || getDefaultFromAddress(),
        to,
        subject,
        text,
        html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("✉️  Email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error("❌ Failed to send email:", error.message);
      throw error;
    }
  },

  /**
   * Send a welcome email to a new user
   * @param {string} to - Recipient email
   * @param {string} userName - User's name
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(to, userName) {
    const subject = "Welcome to Flomark!";
    const text = `Hi ${userName},\n\nWelcome to Flomark! We're excited to have you on board.\n\nBest regards,\nThe Flomark Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Flomark!</h2>
        <p>Hi ${userName},</p>
        <p>Welcome to Flomark! We're excited to have you on board.</p>
        <p>Get started by creating your first project and inviting your team members.</p>
        <br>
        <p>Best regards,<br>The Flomark Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  /**
   * Send a password reset email
   * @param {string} to - Recipient email
   * @param {string} resetToken - Password reset token
   * @param {string} resetUrl - Reset URL
   * @returns {Promise<Object>}
   */
  async sendPasswordResetEmail(to, resetToken, resetUrl) {
    const subject = "Password Reset Request";
    const text = `You requested a password reset.\n\nPlease use this link to reset your password:\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset.</p>
        <p>Click the button below to reset your password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  /**
   * Send a project invitation email
   * @param {string} to - Recipient email
   * @param {string} projectName - Project name
   * @param {string} inviterName - Name of person who sent the invitation
   * @param {string} inviteUrl - Invitation URL
   * @returns {Promise<Object>}
   */
  async sendProjectInvitationEmail(to, projectName, inviterName, inviteUrl) {
    const subject = `You've been invited to join "${projectName}"`;
    const text = `${inviterName} has invited you to join the project "${projectName}" on Flomark.\n\nClick here to join: ${inviteUrl}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Project Invitation</h2>
        <p><strong>${inviterName}</strong> has invited you to join the project:</p>
        <h3 style="color: #4CAF50;">${projectName}</h3>
        <div style="margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="color: #666; font-size: 14px;">This invitation link will expire in 7 days.</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },

  /**
   * Send a notification email
   * @param {string} to - Recipient email
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {Promise<Object>}
   */
  async sendNotificationEmail(to, title, message) {
    const subject = `Flomark: ${title}`;
    const text = message;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${title}</h2>
        <p>${message}</p>
        <br>
        <p style="color: #666; font-size: 14px;">Best regards,<br>The Flomark Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, text, html });
  },
};

