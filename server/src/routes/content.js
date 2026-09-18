import { Router } from "express";
import Event from "../models/Event.js";
import Alert from "../models/Alert.js";
import Leaderboard from "../models/Leaderboard.js";
import Stats from "../models/Stats.js";
import { requireAuth } from "../middleware/auth.js";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../uploads"),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `event-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});


function crud(Model, sort = { createdAt: -1 }) {
  router.get(`/${Model.modelName.toLowerCase()}`, async (_req, res) => {
    res.json(await Model.find().sort(sort));
  });

  router.post(`/${Model.modelName.toLowerCase()}`, requireAuth, async (req, res) => {
    try { res.status(201).json(await Model.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.put(`/${Model.modelName.toLowerCase()}/:id`, requireAuth, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.delete(`/${Model.modelName.toLowerCase()}/:id`, requireAuth, async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  });
}

crud(Event);
crud(Alert);
crud(Leaderboard, { xp: -1 });

router.get("/stats", async (_req, res) => {
  const stats = await Stats.findOne().sort({ updatedAt: -1 });
  res.json(stats || { activeAgents: 0, communityMembers: 0, projectsCompleted: 0, workshopsConducted: 0, hackathonsOrganised: 0 });
});

router.put("/stats", requireAuth, async (req, res) => {
  try {
    const stats = await Stats.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.json(stats);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;
