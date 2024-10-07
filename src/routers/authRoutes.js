import { Router } from "express";
import { AttendeeRegister, login } from "../controllers/user/authController.js";
import { attendeeRegisterSchema } from "../lib/joiSchemas/account.schema.js";
import { JoiValidator } from "../lib/joiSchemas/index.js";
const router = Router();
router.post("/register", JoiValidator(attendeeRegisterSchema), AttendeeRegister);
router.post("/login", login);
export default router
