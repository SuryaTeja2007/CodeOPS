import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, default: "", trim: true },
    category: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
