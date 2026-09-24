import { NextRequest, NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/github/username";
/** Native form fallback validates before reaching the data boundary. */
export function GET(request: NextRequest) {
  const username = normalizeUsername(
    request.nextUrl.searchParams.get("username"),
  );
  return NextResponse.redirect(
    new URL(`/u/${username ?? "invalid!"}`, request.url),
    303,
  );
}
