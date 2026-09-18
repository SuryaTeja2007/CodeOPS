import { Router } from "express";
import Event from "../models/Event.js";
import Alert from "../models/Alert.js";
import Leaderboard from "../models/Leaderboard.js";
import Stats from "../models/Stats.js";
import Agent from "../models/Agent.js";
import Gallery from "../models/Gallery.js";
import Poster from "../models/Poster.js";
import Media from "../models/Media.js";
import Contact from "../models/Contact.js";
import { requireAuth } from "../middleware/auth.js";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `media-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

const publicUrl = (file) => `/uploads/${file.filename}`;

async function nextEventCode() {
  const events = await Event.find({ code: /^CX-\\d+$/ }).select("code").lean();
  const used = new Set(events.map((item) => Number(item.code.slice(3))));
  let n = 1;
  while (used.has(n)) n += 1;
  return `CX-${String(n).padStart(3, "0")}`;
}

function crud(Model, sort = { createdAt: -1 }) {
  const name = Model.modelName.toLowerCase();

  router.get(`/${name}`, async (_req, res) => {
    res.json(await Model.find().sort(sort));
  });

  router.post(`/${name}`, requireAuth, async (req, res) => {
    try { res.status(201).json(await Model.create(req.body)); }
    catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.put(`/${name}/:id`, requireAuth, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) return res.status(404).json({ message: "Not found" });
      res.json(item);
    } catch (e) { res.status(400).json({ message: e.message }); }
  });

  router.delete(`/${name}/:id`, requireAuth, async (req, res) => {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  });
}

router.get("/event", async (_req, res) => res.json(await Event.find().sort({ createdAt: -1 })));

router.post("/event", requireAuth, upload.single("poster"), async (req, res) => {
  try {
    if (req.file) {
      const url = publicUrl(req.file);
      await Media.create({ title: req.body.title || req.file.originalname, url, kind: "poster" });
      req.body.poster = url;
    }
    const item = await Event.create(req.body);
    res.status(201).json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put("/event/:id", requireAuth, upload.single("poster"), async (req, res) => {
  try {
    if (req.file) {
      const url = publicUrl(req.file);
      await Media.create({ title: req.body.title || req.file.originalname, url, kind: "poster" });
      req.body.poster = url;
    } else {
      delete req.body.poster;
    }
    const item = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Not found" });
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete("/event/:id", requireAuth, async (req, res) => {
  const item = await Event.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
});

crud(Alert);
crud(Leaderboard, { xp: -1 });
crud(Agent);
crud(Gallery);
crud(Poster);

router.get("/contact", async (_req, res) => {
  const contact = await Contact.findOne();
  res.json(contact || {});
});

router.put("/contact", requireAuth, async (req, res) => {
  try {
    const contact = await Contact.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.json(contact);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.get("/media", requireAuth, async (_req, res) => {
  res.json(await Media.find().sort({ createdAt: -1 }));
});

router.post("/media", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });
    const media = await Media.create({
      title: req.body.title || req.file.originalname,
      url: publicUrl(req.file),
      kind: req.body.kind === "poster" ? "poster" : "image",
    });
    res.status(201).json(media);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete("/media/:id", requireAuth, async (req, res) => {
  const media = await Media.findById(req.params.id);
  if (!media) return res.status(404).json({ message: "Not found" });

  const [event, gallery, poster, agent] = await Promise.all([
    Event.exists({ poster: media.url }),
    Gallery.exists({ img: media.url }),
    Poster.exists({ img: media.url }),
    Agent.exists({ photo: media.url }),
  ]);
  if (event || gallery || poster || agent) {
    return res.status(409).json({ message: "This media is still in use. Reassign it before deleting." });
  }

  await Media.findByIdAndDelete(req.params.id);
  if (media.url.startsWith("/uploads/")) {
    const filename = path.basename(media.url);
    fs.rm(path.join(uploadDir, filename), { force: true }, () => {});
  }
  res.json({ message: "Deleted" });
});

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
