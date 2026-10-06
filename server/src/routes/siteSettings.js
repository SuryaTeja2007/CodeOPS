import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const defaults = {
  home: true,
  stats: true,
  missionControl: true,
  events: true,
  register: true,
  notifications: true,
  agents: true,
  leaderboard: true,
  gallery: true,
  posters: true,
  contact: true,
};

router.get("/", async (_req, res) => {
  const item = await SiteSettings.findOne().lean();
  res.json({ sections: { ...defaults, ...(item?.sections || {}) } });
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const sections = { ...defaults, ...(req.body?.sections || {}) };
    const item = await SiteSettings.findOneAndUpdate(
      {},
      { sections },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
