import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    facultyCoordinator: { type: String, default: "" },
    hod: { type: String, default: "" },
    email: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    discord: { type: String, default: "" },
    mapUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
