import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    priority: { type: String, default: "NORMAL", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);
