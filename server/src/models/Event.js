import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    poster: { type: String, default: "" },
    description: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    status: { type: String, default: "OPEN", trim: true },
    registerUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
