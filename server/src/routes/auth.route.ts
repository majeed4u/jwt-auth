import express from "express";
import { currentUser, refreshAccessToken, signIn, signOut, signUp } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
const router = express.Router();


router.post("/sign-up", signUp)
router.post("/sign-in", signIn)
router.post("/refresh-token", refreshAccessToken)
router.get("/me", authMiddleware, currentUser)
router.post("/sign-out", signOut)


export default router;