import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

export const sendVerificationEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✅ Verify your ChatApp account',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#0f172a;color:#fff;border-radius:16px">
        <h2 style="color:#6366f1">Welcome to ChatApp 🚀</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Verify Email</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">Link expires in 24 hours.</p>
      </div>
    `
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🔐 Reset your ChatApp password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#0f172a;color:#fff;border-radius:16px">
        <h2 style="color:#f43f5e">Password Reset</h2>
        <p>Click below to reset your password. Link expires in 1 hour.</p>
        <a href="${url}" style="display:inline-block;padding:12px 24px;background:#f43f5e;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Reset Password</a>
      </div>
    `
  });
};