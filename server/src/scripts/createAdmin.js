import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!MONGODB_URI || !ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.");
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    { name: ADMIN_NAME, email: ADMIN_EMAIL.toLowerCase(), passwordHash, role: "superadmin" },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin ready: ${admin.email}`);
} catch (error) {
  console.error("Could not create admin:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
