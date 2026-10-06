import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    sections: {
      home: { type: Boolean, default: true },
      stats: { type: Boolean, default: true },
      missionControl: { type: Boolean, default: true },
      events: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      agents: { type: Boolean, default: true },
      leaderboard: { type: Boolean, default: true },
      gallery: { type: Boolean, default: true },
      posters: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
