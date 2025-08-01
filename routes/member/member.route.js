import express from 'express'; 
import { protect } from '../../middleware/authMiddleware.js';
import uploadMiddleware from '../../config/upload.js';
import { getLoggedInUser, updateMemberProfile } from '../../controllers/member/member.controller.js';

const router = express.Router();

router.patch('/profile', protect, uploadMiddleware, updateMemberProfile);
router.get("/info", protect, getLoggedInUser);

export default router;



