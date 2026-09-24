import { createHmac, timingSafeEqual } from "node:crypto";

const TICKET_TTL_MS = 5 * 60 * 1000;
const TRACE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const DOMAIN = "forsikringsassistent:temporary-production-trace:v1:";

function secret(): string | null {
  const configured = process.env.PILOT_SESSION_SECRET;
  return process.env.PILOT_TRACE_ENABLED === "true" && configured && configured.length >= 32 ? configured : null;
}

function sign(payload: string, sessionSecret: string): string {
  return createHmac("sha256", sessionSecret).update(`${DOMAIN}${payload}`, "utf8").digest("base64url");
}

/** Short-lived receipt permission, unrelated to any document or customer identifier. */
export function createTraceTicket(traceId: string): string | null {
  const configured = secret();
  if (!configured || !TRACE_ID.test(traceId)) return null;
  const payload = Buffer.from(JSON.stringify({ traceId, expiresAt: Date.now() + TICKET_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload, configured)}`;
}

export function validateTraceTicket(traceId: string, ticket: string): boolean {
  const configured = secret();
  if (!configured || !TRACE_ID.test(traceId) || ticket.length > 512) return false;
  const [payload, signature, extra] = ticket.split(".");
  if (!payload || !signature || extra !== undefined) return false;
  const expected = Buffer.from(sign(payload, configured));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const now = Date.now();
    return parsed.traceId === traceId && Number.isSafeInteger(parsed.expiresAt) &&
      parsed.expiresAt > now && parsed.expiresAt <= now + TICKET_TTL_MS;
  } catch { return false; }
}
