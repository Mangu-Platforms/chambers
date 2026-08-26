import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Uptime probe. Never touches the database — cheap enough for 10s polling. */
export function GET() {
  return NextResponse.json({
    ok: true,
    service: "chambers-studio",
    mode: isSupabaseConfigured() ? "supabase" : "demo",
    time: new Date().toISOString(),
  });
}
