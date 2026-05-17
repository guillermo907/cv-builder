import { NextResponse } from "next/server";
import { getUpcomingPublicEvents } from "@/lib/events";

export async function GET() {
  return NextResponse.json(await getUpcomingPublicEvents(), {
    headers: {
      "Cache-Control": "no-store, max-age=0"
    }
  });
}
