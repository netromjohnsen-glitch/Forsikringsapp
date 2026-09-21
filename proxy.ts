import { NextResponse, type NextRequest } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http-security";
import { hasValidPilotSession, isPilotAccessConfigured } from "@/lib/pilot-access";

function noStore(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) response.headers.set(name, value);
  return response;
}

export function proxy(request: NextRequest) {
  if (isPilotAccessConfigured() && hasValidPilotSession(request)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return noStore(NextResponse.json(
      { error: isPilotAccessConfigured() ? "Gyldig pilottilgang kreves." : "Pilottilgang er ikke konfigurert." },
      { status: isPilotAccessConfigured() ? 401 : 503 },
    ));
  }

  const accessUrl = request.nextUrl.clone();
  accessUrl.pathname = "/pilot-access";
  accessUrl.search = isPilotAccessConfigured() ? "" : "?configuration=missing";
  return noStore(NextResponse.redirect(accessUrl));
}

export const config = {
  matcher: ["/", "/api/analyze/:path*"],
};
