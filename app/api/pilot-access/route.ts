import { NextResponse } from "next/server";
import { isSameOriginRequest, NO_STORE_HEADERS } from "@/lib/http-security";
import {
  createPilotSession,
  isPilotAccessConfigured,
  PILOT_COOKIE_NAME,
  PILOT_SESSION_SECONDS,
  verifyPilotAccessCode,
} from "@/lib/pilot-access";

function json(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function POST(request: Request) {
  if (!isPilotAccessConfigured()) return json({ error: "Pilottilgang er ikke konfigurert på serveren." }, 503);
  if (!isSameOriginRequest(request)) return json({ error: "Requesten ble avvist fordi origin ikke stemmer." }, 403);

  let code: unknown;
  try {
    const body = await request.json() as Record<string, unknown>;
    code = body.code;
  } catch {
    return json({ error: "Ugyldig request." }, 400);
  }
  if (typeof code !== "string" || !verifyPilotAccessCode(code)) {
    return json({ error: "Ugyldig pilotkode." }, 401);
  }

  const response = json({ ok: true }, 200);
  response.cookies.set({
    name: PILOT_COOKIE_NAME,
    value: createPilotSession(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: PILOT_SESSION_SECONDS,
  });
  return response;
}
