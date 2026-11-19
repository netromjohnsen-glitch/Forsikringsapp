import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { termsArchiveDocuments } from "../../../../../lib/terms-archive-documents.ts";
import { NO_STORE_HEADERS, noStoreJson } from "../../../../../lib/http-security.ts";
import { hasValidPilotSession } from "../../../../../lib/pilot-access.ts";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ provider: string; document: string }> }) {
  if (!hasValidPilotSession(request)) return noStoreJson({ error: "Gyldig pilottilgang kreves." }, 401);

  const { provider, document } = await params;
  const archive = termsArchiveDocuments.find(item => item.provider === provider && item.slug === document);
  if (!archive) return noStoreJson({ error: "Vilkåret finnes ikke i arkivet." }, 404);

  const pdf = await readFile(join(process.cwd(), archive.archivePath));
  return new Response(new Uint8Array(pdf), {
    headers: {
      ...NO_STORE_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="' + archive.provider + '-' + archive.slug + '.pdf"',
      "Content-Length": String(pdf.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
