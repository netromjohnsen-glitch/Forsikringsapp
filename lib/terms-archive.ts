import type { FactSource } from "./comparison.ts";
import { termsArchiveDocuments } from "./terms-archive-documents.ts";

function isDirectPdf(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const path = url.pathname.toLowerCase();
  return path.endsWith(".pdf") ||
    ((url.hostname === "if.no" || url.hostname === "www.if.no") &&
      (path === "/apps/vilkarsbasendokument/vilkaar" || path === "/apps/vilkarsbasendokument/ipid")) ||
    ((url.hostname === "tryg.no" || url.hostname === "www.tryg.no") && path === "/odpdf") ||
    (url.hostname === "api.frende.no" && path.startsWith("/documents/terms/public/")) ||
    (url.hostname === "www.gjensidige.no" && path.startsWith("/ipid/gfno/"));
}

export function termsSourceHref(source: Pick<FactSource, "documentId" | "effectiveFrom" | "page" | "url"> &
  Partial<Pick<FactSource, "filename">>): string | undefined {
  const archive = termsArchiveDocuments.find(document => document.sources.some(([id, date, url, previousUrl]) =>
    id === source.documentId && date === source.effectiveFrom &&
    (url === source.url || (previousUrl !== undefined && previousUrl === source.url))));
  const page = Number.isInteger(source.page) && source.page > 0 ? "#page=" + source.page : "";
  if (archive) return "/api/vilkar/" + archive.provider + "/" + archive.slug + page;

  // A source may name a PDF but point at a product page instead of its bytes.
  const { filename, url } = source;
  if (page && filename?.toLowerCase().endsWith(".pdf") && url && URL.canParse(url) && isDirectPdf(new URL(url))) {
    return url.split("#", 1)[0] + page;
  }
  return url;
}

export function memberTermsSourceHref(scope: string, productId: string, source: {
  url: string;
  documentNumber?: string;
  effectiveDate?: string;
  publicationDate?: string;
  archive?: { path: string; sha256: string };
}): string {
  const archive = termsArchiveDocuments.find(document => document.memberSources?.some(([agreement, product, url, number, date, hash]) =>
    agreement === scope && product === productId && url === source.url &&
    number === (source.documentNumber ?? "") && date === (source.effectiveDate ?? source.publicationDate ?? "") &&
    hash === (source.archive?.sha256 ?? "") &&
    (!source.archive || document.archivePath === "catalog/sources/" + source.archive.path)));
  return archive ? "/api/vilkar/" + archive.provider + "/" + archive.slug : source.url;
}
