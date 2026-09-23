import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const PILOT_COOKIE_NAME = "forsikringsassistent_pilot";
export const PILOT_SESSION_SECONDS = 12 * 60 * 60;

type PilotConfig = { accessCode: string; sessionSecret: string };

function pilotConfig(): PilotConfig | null {
  const accessCode = process.env.PILOT_ACCESS_CODE;
  const sessionSecret = process.env.PILOT_SESSION_SECRET;
  if (!accessCode || accessCode.length < 12 || !sessionSecret || sessionSecret.length < 32) return null;
  return { accessCode, sessionSecret };
}

export function isPilotAccessConfigured(): boolean {
  return pilotConfig() !== null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function verifyPilotAccessCode(candidate: string): boolean {
  const config = pilotConfig();
  if (!config || candidate.length > 256) return false;
  return timingSafeEqual(digest(candidate), digest(config.accessCode));
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("base64url");
}

export function createPilotSession(now = Date.now()): string {
  const config = pilotConfig();
  if (!config) throw new Error("Pilot access is not configured.");
  const payload = Buffer.from(JSON.stringify({ version: 1, expiresAt: now + PILOT_SESSION_SECONDS * 1000 }))
    .toString("base64url");
  return `${payload}.${sign(payload, config.sessionSecret)}`;
}

function cookieValue(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0 || part.slice(0, separator).trim() !== name) continue;
    try { return decodeURIComponent(part.slice(separator + 1).trim()); }
    catch { return null; }
  }
  return null;
}

export function hasValidPilotSession(request: Request, now = Date.now()): boolean {
  const config = pilotConfig();
  const token = cookieValue(request, PILOT_COOKIE_NAME);
  if (!config || !token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return false;
  const expected = sign(payload, config.sessionSecret);
  const suppliedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<string, unknown>;
    return parsed.version === 1 && typeof parsed.expiresAt === "number" &&
      Number.isSafeInteger(parsed.expiresAt) && parsed.expiresAt > now;
  } catch {
    return false;
  }
}
