import { count } from "drizzle-orm";

import { getDb, schema } from "@/db";
import { empty, json, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export const OPTIONS = preflight;

export async function GET() {
  const [{ total }] = getDb().select({ total: count() }).from(schema.connections).all();
  return json({ total });
}

export async function POST(req: Request) {
  const { user_id } = await req.json();
  getDb().insert(schema.connections).values({ user_id }).run();
  return empty(201);
}
