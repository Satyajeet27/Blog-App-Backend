import { Router } from "express";
import {
  createUser,
  getUser,
  loginUser,
  resetPassword,
  updateUser,
} from "../controllers/user";
import {
  validatePasswordResetRequest,
  validateUpdateUserRequest,
  validateUserLoginRequest,
  validateUserSignupRequest,
} from "../middlewares/validate";
import { authenticateUser } from "../middlewares/authenticate";

const router = Router();

router.post("/", validateUserSignupRequest, createUser);
router.post("/login", validateUserLoginRequest, loginUser);
router.get("/", authenticateUser, getUser);
router.put("/", validateUpdateUserRequest, authenticateUser, updateUser);
router.put(
  "/reset-password",
  validatePasswordResetRequest,
  authenticateUser,
  resetPassword
);

export default router;
