import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  { key: { type: String, unique: true, required: true }, initialized: { type: Boolean, default: false } },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
