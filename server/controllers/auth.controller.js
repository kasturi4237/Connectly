import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/email.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const setCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

// Register
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username,
      email,
      password,
      verificationToken,
      isVerified: true
    });

    // Try to send email but don't crash if it fails
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Still allow registration even if email fails
    }

    return res.status(201).json({
      message: 'Account created! Please check your email to verify your account.'
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return res.json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }

    user.isOnline = true;
    await user.save();

    const token = signToken(user._id);
    setCookie(res, token);

    return res.json({ user: user.toPublicJSON(), token });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    if (req.user) {
      req.user.isOnline = false;
      req.user.lastSeen = new Date();
      await req.user.save();
    }
    res.clearCookie('jwt');
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (emailErr) {
      console.error('Reset email failed:', emailErr.message);
    }

    return res.json({ message: 'Password reset email sent!' });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: 'Password reset successful! You can now log in.' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Get Me
export const getMe = async (req, res) => {
  try {
    return res.json({ user: req.user.toPublicJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};