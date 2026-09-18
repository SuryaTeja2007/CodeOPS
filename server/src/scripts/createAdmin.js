import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import Admin from "../models/Admin.js";

if (!process.env.MONGODB_URI) {
  console.error("Set MONGODB_URI in server/.env first.");
  process.exit(1);
}

const rl = readline.createInterface({ input, output });

try {
  const name = (await rl.question("Admin name: ")).trim();
  const email = (await rl.question("Admin email: ")).trim().toLowerCase();
  const password = await rl.question("Admin password: ");

  if (!name || !email || !password) {
    throw new Error("Name, email and password are required.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.findOneAndUpdate(
    { email },
    { name, email, passwordHash, role: "superadmin" },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${admin.email}`);
} catch (error) {
  console.error("Could not create admin:", error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await mongoose.disconnect();
}
