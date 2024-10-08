import { Router } from 'express';
const router = Router();
import { AttendeeRegister, hostRegister, login } from "../controllers/authController.js";
import { attendeeRegisterSchema } from "../lib/joiSchemas/account.schema.js";
import { JoiValidator } from "../lib/joiSchemas/index.js";
import { auth, isAdmin } from "../middleware/auth.js";
import { participants } from '../controllers/operations.js';

router.post("/auth/register", JoiValidator(attendeeRegisterSchema), AttendeeRegister);
router.post("/auth/host-register", auth, isAdmin, hostRegister)
router.post("/auth/host-login", login)
router.post("/participants/:id", auth, participants)
export default router