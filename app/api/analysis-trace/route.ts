import { isDeepStrictEqual } from "node:util";
import { isSameOriginRequest, noStoreJson } from "../../../lib/http-security.ts";
import { hasValidPilotSession } from "../../../lib/pilot-access.ts";
import { sanitizeTraceEvent } from "../../../lib/production-trace.ts";
import { validateTraceTicket } from "../../../lib/production-trace-ticket.ts";

export const runtime = "nodejs";

const MAX_BYTES = 256 * 1024;
const MAX_EVENTS = 256;
const CLIENT_STAGES = new Set(["client_result", "price_input", "portfolio", "comparison", "presentation"]);
const received = new Map<string, number>();

class InvalidReceipt extends Error {
  readonly status: number;
  constructor(status: number) { super("Invalid diagnostic receipt"); this.status = status; }
}

async function boundedBody(request: Request): Promise<unknown> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/u.test(contentLength) || Number(contentLength) > MAX_BYTES)) throw new InvalidReceipt(413);
  if (!request.body) throw new InvalidReceipt(400);
  const reader = request.body.getReader();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new InvalidReceipt(408)), 5_000);
  });
  let total = 0;
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: true });
  try {
    for (;;) {
      const chunk = await Promise.race([reader.read(), deadline]);
      if (chunk.done) break;
      total += chunk.value.byteLength;
      if (total > MAX_BYTES) throw new InvalidReceipt(413);
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    clearTimeout(timeout);
    void reader.cancel().catch(() => undefined);
  }
}

/** Temporary, authenticated structural diagnostics. Never accepts analysis documents. */
export async function POST(request: Request): Promise<Response> {
  if (process.env.PILOT_TRACE_ENABLED !== "true") return noStoreJson({ error: "Unavailable" }, 404);
  if (!hasValidPilotSession(request)) return noStoreJson({ error: "Unauthorized" }, 401);
  if (!isSameOriginRequest(request)) return noStoreJson({ error: "Forbidden" }, 403);
  if (!/^application\/json(?:\s*;|$)/iu.test(request.headers.get("content-type") ?? "")) return noStoreJson({ error: "Invalid receipt" }, 415);

  try {
    const body = await boundedBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new InvalidReceipt(400);
    const candidate = body as Record<string, unknown>;
    if (!isDeepStrictEqual(Object.keys(candidate).sort(), ["events", "ticket", "traceId"]) ||
      typeof candidate.traceId !== "string" || typeof candidate.ticket !== "string" ||
      !validateTraceTicket(candidate.traceId, candidate.ticket)) throw new InvalidReceipt(400);
    if (!Array.isArray(candidate.events) || candidate.events.length < 1 || candidate.events.length > MAX_EVENTS) throw new InvalidReceipt(400);
    const events = candidate.events.map((event: unknown) => {
      const safe = sanitizeTraceEvent(event);
      if (!safe || !CLIENT_STAGES.has(safe.stage) || !isDeepStrictEqual(safe, event)) throw new InvalidReceipt(400);
      return safe;
    });
    const now = Date.now();
    for (const [id, expiry] of received) if (expiry <= now) received.delete(id);
    if (received.has(candidate.traceId)) throw new InvalidReceipt(409);
    if (received.size >= 2_048) throw new InvalidReceipt(503);
    received.set(candidate.traceId, now + 5 * 60 * 1000);
    for (const [sequence, event] of events.entries()) {
      console.info("ANALYSIS_TRACE", JSON.stringify({ traceId: candidate.traceId, phase: "client", sequence, ...event }));
    }
    return noStoreJson({ ok: true });
  } catch (error) {
    return noStoreJson({ error: "Invalid receipt" }, error instanceof InvalidReceipt ? error.status : 400);
  }
}
