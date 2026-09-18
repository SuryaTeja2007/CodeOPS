import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    nickname: { type: String, required: true, trim: true },
    division: { type: String, default: "", trim: true },
    status: { type: String, default: "Offline", trim: true },
    threatClass: { type: String, default: "", trim: true },
    clearance: { type: Number, default: 0, min: 0, max: 10 },
    xp: { type: Number, default: 0, min: 0 },
    missions: { type: Number, default: 0, min: 0 },
    language: { type: String, default: "", trim: true },
    project: { type: String, default: "", trim: true },
    github: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    portfolio: { type: String, default: "#" },
    joined: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
