import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { frendeTermsArchive } from "../../../../../lib/frende-terms-archive.ts";
import { NO_STORE_HEADERS, noStoreJson } from "../../../../../lib/http-security.ts";
import { hasValidPilotSession } from "../../../../../lib/pilot-access.ts";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ document: string }> }) {
  if (!hasValidPilotSession(request)) return noStoreJson({ error: "Gyldig pilottilgang kreves." }, 401);

  const { document } = await params;
  const archive = frendeTermsArchive.find(item => item.slug === document);
  if (!archive) return noStoreJson({ error: "Vilkåret finnes ikke i arkivet." }, 404);

  const pdf = await readFile(join(process.cwd(), archive.archivePath));
  return new Response(new Uint8Array(pdf), {
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="' + archive.filename + '"',
      "Content-Length": String(pdf.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
