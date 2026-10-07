import mongoose from "mongoose";

const agentSchema = new mongoose.Schema(
  {
    rollNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    department: { type: String, default: "", trim: true },
    position: { type: String, default: "", trim: true },
    language: { type: String, default: "", trim: true },
    github: { type: String, default: "#" },
    linkedin: { type: String, default: "#" },
    portfolio: { type: String, default: "#" },
    joined: { type: String, default: "" },
    photo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Agent", agentSchema);
