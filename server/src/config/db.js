import mongoose from "mongoose";
import Agent from "../models/Agent.js";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected");

  // Remove the legacy unique index created for the old Agent.id field.
  // Without this migration, CSV imports fail with duplicate key { id: null }.
  try {
    await Agent.collection.dropIndex("id_1");
    console.log("Removed legacy Agent.id index");
  } catch (error) {
    if (error?.codeName !== "IndexNotFound" && error?.code !== 27) throw error;
  }

  await Agent.syncIndexes();
}
