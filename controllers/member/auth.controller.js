import jwt from 'jsonwebtoken';
import RedanMember from '../../models//member.model.js';
import BlockedAccount from '../../models/blockedAccount.model.js';
import crypto from 'crypto';
import { getVerificationEmailTemplate, WELCOME_EMAIL_TEMPLATE,PASSWORD_RESET_SUCCESS_TEMPLATE, PASSWORD_RESET_EMAIL_TEMPLATE, PASSWORD_CHANGED_EMAIL_TEMPLATE } from '../../utils/templates/emailTemplate.js';
import sendEmail from '../../utils/sendEmail.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const registerMember = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address, state } = req.body;

    if (!fullName || !email || !password || !phoneNumber || !address || !state) {
      return res.status(400).json({ success: false, message: "All required fields must be filled" });
    }

    const existingUser = await RedanMember.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const newMember = await RedanMember.create(req.body);
    newMember.generateMembershipId();

    // Generate a 6-digit OTP and token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const verificationToken = crypto.randomBytes(20).toString("hex");

    newMember.verificationCode = otpCode;
    newMember.verificationToken = verificationToken;
    newMember.verificationTokenExpiresAt = Date.now() + 1000 * 60 * 30; // 30 mins
    await newMember.save();

    const baseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: newMember.email,
      subject: "Verify Your REDAN Account",
      html: getVerificationEmailTemplate(otpCode, verifyUrl),
    });

    res.status(201).json({
      success: true,
      message: "Account created. Check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const member = await RedanMember.findOne({ email });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email",
      });
    }

    if (member.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    // Generate OTP and token
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const verificationToken = crypto.randomBytes(20).toString("hex");

    member.verificationCode = otpCode;
    member.verificationToken = verificationToken;
    member.verificationTokenExpiresAt = Date.now() + 1000 * 60 * 30; // 30 mins
    member.otpAttemptCount = 0;
    await member.save();

    const baseUrl = process.env.CLIENT_BASE_URL || "http://localhost:5173";
    const verifyUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: member.email,
      subject: "Verify Your REDAN Account",
      html: getVerificationEmailTemplate(otpCode, verifyUrl),
    });

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });

  } catch (err) {
    console.error("Resend verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not resend verification email",
    });
  }
};

export const verifyMemberAccount = async (req, res) => {
  try {
    const { token } = req.query;
    const { otpCode } = req.body || {};

    let member = null;
    let verifiedVia = null;

    // ✅ Token-based verification
    if (token) {
      member = await RedanMember.findOne({
        verificationToken: token,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });

      if (member) {
        verifiedVia = "token";
      }
    }

    // ✅ OTP-based verification
    if (!member && otpCode) {
      member = await RedanMember.findOne({ verificationCode: otpCode });

      if (!member || member.verificationCodeExpiresAt < Date.now()) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      if (member.otpAttemptCount >= 5) {
        return res.status(403).json({
          success: false,
          message: "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      verifiedVia = "otp";
    }

    // ✅ If still no member, increment OTP attempts if relevant
    if (!member) {
      if (otpCode) {
        const user = await RedanMember.findOne({ verificationCode: otpCode });
        if (user) {
          user.otpAttemptCount = (user.otpAttemptCount || 0) + 1;
          user.lastOtpAttemptAt = new Date();
          await user.save();
        }
      }

      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification credentials",
      });
    }

    // ✅ Reset verification state
    member.isVerified = true;
    member.verificationToken = undefined;
    member.verificationCode = undefined;
    member.verificationTokenExpiresAt = undefined;
    member.verificationCodeExpiresAt = undefined;
    member.otpAttemptCount = 0;
    member.lastOtpAttemptAt = undefined;
    await member.save();

    // ✅ Send welcome email
    await sendEmail({
      to: member.email,
      subject: "Welcome to REDAN Portal!",
      html: WELCOME_EMAIL_TEMPLATE(member.fullName || member.email),
    });

    // ✅ Return JWT if verified via token
    if (verifiedVia === "token") {
      const payload = {
        id: member._id,
        email: member.email,
        role: "member",
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        success: true,
        message: "Account verified successfully",
        token,
        data: {
          fullName: member.fullName,
          email: member.email,
          membershipId: member.membershipId,
          isVerified: member.isVerified,
        },
      });
    }

    // ✅ Return success for OTP flow
    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
    });

  } catch (err) {
    console.error("Verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};



export const loginMember = async (req, res) => {
  try {
    const { email, password } = req.body;

    const member = await RedanMember.findOne({ email }).select('+password');

    if (!member || !(await member.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!member.isVerified) {
      return res.status(403).json({ success: false, message: "Please verify your account first" });
    }

    if (member.accountBlock) {
      const block = await BlockedAccount.findById(member.accountBlock);
      if (block) {
        return res.status(403).json({ success: false, message: `Account is blocked: ${block.reason}` });
      }
    }

    // Sign token with both id and role
    const token = generateToken(member);

    member.lastLogin = Date.now();
    await member.save();

      // Convert to object and strip sensitive fields
    const memberData = member.toObject();
    delete memberData.password;
    delete memberData.verificationCode;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data:memberData,
     token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const member = await RedanMember.findOne({ email });

    if (!member) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    member.resetPasswordToken = resetToken;
    member.resetPasswordExpiresAt = Date.now() + 1000 * 60 * 30;
    await member.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_EMAIL_TEMPLATE(resetLink),
    });

    res.status(200).json({ success: true, message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    const member = await RedanMember.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    }).select('+password');

    if (!member) {
      return res.status(400).json({ success: false, message: "Token expired or invalid" });
    }

    member.password = newPassword;
    member.resetPasswordToken = undefined;
    member.resetPasswordExpiresAt = undefined;
    await member.save();

    await sendEmail({
      to: member.email,
      subject: "Your Password Has Been Reset",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE(member.fullName || "there"),
    });

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Change password (user must be logged in)
export const changePassword = async (req, res) => {
  try {
    const member = await RedanMember.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await member.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    member.password = newPassword;
    await member.save();

    await sendEmail({
      to: member.email,
      subject: "Your Password Has Been Changed",
      html: PASSWORD_CHANGED_EMAIL_TEMPLATE(member.fullName || "there"),
    });

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Logout (optional if using token-based frontend)
export const logoutMember = (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully (client should handle token removal)" });
};
