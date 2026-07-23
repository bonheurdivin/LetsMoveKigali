import { Router } from "express";
import { register, login, updateMe, changePassword } from "../controllers/authController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/me", authenticate, updateMe);
router.put("/change-password", authenticate, changePassword);

export default router;