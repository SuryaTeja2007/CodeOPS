import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default supabase;

export function toCamel(row) {
  if (!row) return row;
  const result = { ...row };
  if (result.id) result._id = result.id;
  for (const [snake, camel] of [
    ["roll_number", "rollNumber"],
    ["display_order", "displayOrder"],
    ["ongoing_since", "ongoingSince"],
    ["register_url", "registerUrl"],
    ["download_url", "downloadUrl"],
    ["faculty_coordinator", "facultyCoordinator"],
    ["map_url", "mapUrl"],
    ["password_hash", "passwordHash"],
    ["created_at", "createdAt"],
    ["updated_at", "updatedAt"]
  ]) {
    if (snake in result) {
      result[camel] = result[snake];
      delete result[snake];
    }
  }
  return result;
}

export function toCamelRows(rows = []) {
  return rows.map(toCamel);
}
