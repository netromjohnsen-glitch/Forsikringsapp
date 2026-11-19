import type { FactSource } from "./comparison.ts";

export const frendeTermsArchive = [
  {
    slug: "hytte",
    documentId: "cabin:frende:building",
    effectiveFrom: "2026-09-01",
    archivePath: "catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf",
    filename: "Frende-hyttevilkar.pdf",
  },
  {
    slug: "verdisak",
    documentId: "private-valuables:frende",
    effectiveFrom: "2026-01-01",
    archivePath: "catalog/sources/private-valuables/frende-verdisak.pdf",
    filename: "Frende-verdisakvilkar.pdf",
  },
] as const;

export function termsSourceHref(source: Pick<FactSource, "documentId" | "effectiveFrom" | "page" | "url">): string | undefined {
  const archive = frendeTermsArchive.find(document =>
    document.documentId === source.documentId && document.effectiveFrom === source.effectiveFrom);
  if (!archive) return source.url;
  const page = Number.isInteger(source.page) && source.page > 0 ? "#page=" + source.page : "";
  return "/api/vilkar/frende/" + archive.slug + page;
}
