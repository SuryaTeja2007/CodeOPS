import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const homeDefaults = {\n  titleLine1: "CODEOPS",\n  titleLine2: "Cyber Operations",\n  titleLine3: "Command Centre",\n  description: "A command centre for builders, competitors, and operators. Learn, build, compete, and lead — every mission logged, every agent ranked.",\n  joinLabel: "Join Mission",\n  eventsLabel: "Explore Events",\n  agentsLabel: "Access Database",\n};\n\nconst defaults = {
  home: true,
  stats: true,
  missionControl: true,
  events: true,
  notifications: true,
  agents: true,
  leaderboard: true,
  gallery: true,
  posters: true,
  contact: true,
};

router.get("/", async (_req, res) => {
  const item = await SiteSettings.findOne().lean();
  res.json({ home: { ...homeDefaults, ...(item?.home || {}) }, sections: { ...defaults, ...(item?.sections || {}) } });
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const sections = { ...defaults, ...(req.body?.sections || {}) };\n    const home = { ...homeDefaults, ...(req.body?.home || {}) };
    const item = await SiteSettings.findOneAndUpdate(
      {},
      { home, sections },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
