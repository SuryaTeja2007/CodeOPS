import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Admin from "../models/Admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required" });

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), role: admin.role, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie("codeops_token", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({ admin: { id: admin._id, username: admin.username, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("codeops_token");
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("username role createdAt");
  if (!admin) return res.status(401).json({ message: "Admin not found" });
  res.json({ admin: { id: admin._id, username: admin.username, role: admin.role, createdAt: admin.createdAt } });
});

export default router;
