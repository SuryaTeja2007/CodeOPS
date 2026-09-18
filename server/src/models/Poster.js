import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    img: { type: String, required: true, trim: true },
    downloadUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Poster", posterSchema);
