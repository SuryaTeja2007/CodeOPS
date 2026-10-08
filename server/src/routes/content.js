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
const uploadDir = path.join(__dirname, "../../uploads");
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
  const events = await Event.find({ code: /^CO-\d+$/ }).select("code").lean();
  const used = new Set(events.map((item) => Number(item.code.slice(3))));
  let n = 1;
  while (used.has(n)) n += 1;
  return `CO-${String(n).padStart(3, "0")}`;
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

router.get("/event", async (_req, res) => {
  const now = new Date();

  // OPEN events automatically become ONGOING when their countdown reaches zero.
  await Event.updateMany(
    { status: "OPEN", deadline: { $lte: now } },
    { $set: { status: "ONGOING", ongoingSince: now } }
  );

  // Any event that has been ONGOING for 24 hours automatically closes.
  await Event.updateMany(
    {
      status: "ONGOING",
      ongoingSince: { $ne: null, $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    },
    { $set: { status: "CLOSED" } }
  );

  res.json(await Event.find().sort({ createdAt: -1 }));
});

router.put("/agents/reorder", requireAuth, async (req, res) => {
  try {
    const order = Array.isArray(req.body?.order) ? req.body.order : [];
    const operations = order.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { displayOrder: index } } },
    }));
    if (operations.length) await Agent.bulkWrite(operations);
    res.json(await Agent.find().sort({ displayOrder: 1, createdAt: 1 }));
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/agents/import", requireAuth, async (req, res) => {
  try {
    if (!Array.isArray(req.body?.agents)) return res.status(400).json({ message: "agents must be an array" });

    const rows = req.body.agents;
    const valid = [];
    const seen = new Set();

    for (const row of rows) {
      const rollNumber = String(row?.rollNumber || "").trim();
      const name = String(row?.name || "").trim();
      if (!rollNumber || !name) continue;

      const key = rollNumber.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      valid.push({
        rollNumber,
        name,
        department: String(row?.department || "").trim(),
        position: String(row?.position || "").trim(),
        language: String(row?.language || "").trim(),
        github: String(row?.github || "").trim() || "#",
        linkedin: String(row?.linkedin || "").trim() || "#",
        portfolio: String(row?.portfolio || "").trim() || "#",
        photo: String(row?.photo || "").trim(),
      });
    }

    const existing = await Agent.find({
      rollNumber: { $in: valid.map((item) => item.rollNumber) },
    }).select("rollNumber").lean();

    const existingRollNumbers = new Set(existing.map((item) => item.rollNumber.toLowerCase()));
    const toCreate = valid.filter((item) => !existingRollNumbers.has(item.rollNumber.toLowerCase()));

    if (toCreate.length) await Agent.insertMany(toCreate, { ordered: false });

    res.status(201).json({
      created: toCreate.length,
      ignored: rows.length - toCreate.length,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post("/event", requireAuth, upload.single("poster"), async (req, res) => {
  try {
    if (req.file) {
      const url = publicUrl(req.file);
      await Media.create({ title: req.body.title || req.file.originalname, url, kind: "poster" });
      req.body.poster = url;
    }
    if (!req.body.code?.trim()) req.body.code = await nextEventCode();
    if (req.body.status === "ONGOING") req.body.ongoingSince = new Date();
    else if (req.body.status !== "CLOSED") req.body.ongoingSince = null;
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
    }
    // Keep the poster when the edit uses a media-library URL instead of a new file.
    if (!req.file && !req.body.poster) {
      delete req.body.poster;
    }
    if (!req.body.code?.trim()) req.body.code = await nextEventCode();

    if (req.body.status === "ONGOING") {
      const existing = await Event.findById(req.params.id).select("status ongoingSince");
      if (existing?.status !== "ONGOING") req.body.ongoingSince = new Date();
      else if (!existing.ongoingSince) req.body.ongoingSince = new Date();
    } else if (req.body.status && req.body.status !== "ONGOING") {
      req.body.ongoingSince = null;
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
  const [stats, totalAgents, totalXp] = await Promise.all([
    Stats.findOne().sort({ updatedAt: -1 }).lean(),
    Agent.countDocuments(),
    Agent.aggregate([{ $group: { _id: null, total: { $sum: "$xp" } } }]),
  ]);

  res.json({
    activeAgents: totalAgents,
    communityMembers: stats?.communityMembers || 0,
    projectsCompleted: stats?.projectsCompleted || 0,
    workshopsConducted: stats?.workshopsConducted || 0,
    hackathonsOrganised: stats?.hackathonsOrganised || 0,
    totalXpEarned: totalXp[0]?.total || 0,
  });
});

router.put("/stats", requireAuth, async (req, res) => {
  try {
    const stats = await Stats.findOneAndUpdate({}, req.body, { new: true, upsert: true, runValidators: true });
    res.json(stats);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

export default router;
