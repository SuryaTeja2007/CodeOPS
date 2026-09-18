import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true },
    url: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["image", "poster"], default: "image" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
