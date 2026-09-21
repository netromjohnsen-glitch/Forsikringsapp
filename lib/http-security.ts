export const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export function noStoreJson(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  for (const [name, value] of Object.entries(NO_STORE_HEADERS)) headers.set(name, value);
  return Response.json(body, { status, headers });
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const supplied = new URL(origin);
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim();
    const expectedHost = forwardedHost || request.headers.get("host") || requestUrl.host;
    const expectedProtocol = `${forwardedProto || requestUrl.protocol.replace(":", "")}:`;
    return supplied.host === expectedHost && supplied.protocol === expectedProtocol;
  } catch {
    return false;
  }
}

export function safeErrorMetadata(requestId: string, category: string, error: unknown) {
  const candidate = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const status = typeof candidate.status === "number" ? candidate.status : undefined;
  const rawRequestId = candidate.request_id ?? candidate._request_id;
  const externalRequestId = typeof rawRequestId === "string" && /^[\w-]{1,120}$/u.test(rawRequestId)
    ? rawRequestId
    : undefined;
  return {
    requestId,
    category,
    ...(status === undefined ? {} : { externalStatus: status }),
    ...(externalRequestId === undefined ? {} : { externalRequestId }),
  };
}
