import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    home: {
      titleLine1: { type: String, default: "CODEOPS" },
      titleLine2: { type: String, default: "Cyber Operations" },
      titleLine3: { type: String, default: "Command Centre" },
      description: { type: String, default: "A command centre for builders, competitors, and operators. Learn, build, compete, and lead — every mission logged, every agent ranked." },
      joinLabel: { type: String, default: "Join Mission" },
      eventsLabel: { type: String, default: "Explore Events" },
      agentsLabel: { type: String, default: "Access Database" },
    },
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
