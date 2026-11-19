import type { FactSource } from "./comparison.ts";
import { termsArchiveDocuments } from "./terms-archive-documents.ts";

export function termsSourceHref(source: Pick<FactSource, "documentId" | "effectiveFrom" | "page" | "url">): string | undefined {
  const archive = termsArchiveDocuments.find(document => document.sources.some(([id, date, url]) =>
    id === source.documentId && date === source.effectiveFrom && url === source.url));
  if (!archive) return source.url;
  const page = Number.isInteger(source.page) && source.page > 0 ? "#page=" + source.page : "";
  return "/api/vilkar/" + archive.provider + "/" + archive.slug + page;
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
