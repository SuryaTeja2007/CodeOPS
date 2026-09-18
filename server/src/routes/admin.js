import { Router } from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function requireSuperadmin(req, res, next) {
  if (req.admin?.role !== "superadmin") {
    return res.status(403).json({ message: "Superadmin access required" });
  }
  next();
}

router.get("/", requireAuth, requireSuperadmin, async (_req, res) => {
  const admins = await Admin.find().select("username role createdAt").sort({ createdAt: 1 });
  res.json(admins);
});

router.post("/", requireAuth, requireSuperadmin, async (req, res) => {
  try {
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const exists = await Admin.findOne({ username });
    if (exists) return res.status(409).json({ message: "Username already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ username, passwordHash, role: "admin" });

    res.status(201).json({
      id: admin._id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", requireAuth, requireSuperadmin, async (req, res) => {
  if (req.params.id === req.admin.id) {
    return res.status(400).json({ message: "You cannot remove your own account" });
  }

  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) return res.status(404).json({ message: "Admin not found" });

  res.json({ message: "Admin removed" });
});

export default router;
