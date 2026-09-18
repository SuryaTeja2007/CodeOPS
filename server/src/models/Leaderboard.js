import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nickname: { type: String, default: "", trim: true },
    division: { type: String, default: "", trim: true },
    threatClass: { type: String, default: "", trim: true },
    xp: { type: Number, default: 0, min: 0 },
    missions: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Leaderboard", leaderboardSchema);
