import { Router } from 'express';
const router = Router();
import { hostRegister, login } from "../controllers/authController.js";
import { auth, isAdmin } from "../middleware/auth.js";
import { changePassword, participants, visit } from '../controllers/operations.js';

// router.post("/auth/register", JoiValidator(attendeeRegisterSchema), AttendeeRegister);
router.post("/auth/host-register", auth, isAdmin, hostRegister)
router.post("/auth/host-login", login)
router.post("/auth/change-password", auth, isAdmin, changePassword)
router.post("/participants", auth, participants)
router.post("/visit", auth, visit)
export default router


