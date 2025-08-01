import express from 'express';
import {
  registerMember,
  verifyMemberAccount,
  loginMember,
  forgotPassword,
  resetPassword,
  changePassword,
  logoutMember,
  resendVerificationEmail
} from '../../controllers/member/auth.controller.js';

import { protect } from '../../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/register-member', registerMember);
router.post('/verify', verifyMemberAccount);
router.get('/verify', verifyMemberAccount); // For email verification via token url
router.post("/resend-verification", resendVerificationEmail);
router.post('/login', loginMember);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', protect, changePassword);
router.post('/logout', logoutMember);

export default router;
