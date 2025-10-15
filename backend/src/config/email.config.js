import nodemailer from "nodemailer";
import { ENV } from "./env.js";


export const createEmailTransporter = () => {
  if (!ENV.SMTP_HOST || !ENV.SMTP_USER || !ENV.SMTP_PASS) {
    console.warn("⚠️  SMTP configuration is incomplete. Email functionality will be disabled.");
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
    } else {
      console.log("✅ Email server is ready to send messages");
    }
  });

  return transporter;
};

export const getDefaultFromAddress = () => {
  return `"${ENV.SMTP_FROM_NAME}" <${ENV.SMTP_FROM_EMAIL || ENV.SMTP_USER}>`;
};

