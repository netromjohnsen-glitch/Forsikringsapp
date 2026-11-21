import type { ProductComparisonSource } from "./catalog-product-comparison.ts";

// Verified pages which predate the typed sources in the catalogue. Use exact
// document IDs so a binding agreement published as HTML keeps its own label.
const legacyProductPages = new Set([
  "ifHusProductPage",
  "storebrandHusProduct",
  "gjensidigeHusProduct",
  "gjensidigeHusSmart",
  "fremtindHusSpareBank1Channel",
  "frendeHusPestPage",
  "trygReiseProductPage",
  "ifReiseHelp",
  "ifReiseSmartDelay",
  "storebrandReiseProductPage",
  "gjensidigeReiseDays",
  "gjensidigeReiseAlarm",
  "gjensidigeReiseDoctor",
  "frendeReiseDoctor",
  "vehicle:gjensidige-snoscooterforsikring.html",
  "vehicle:gjensidige-campingvognforsikring.html",
  "vehicle:frende-snoscooterforsikring.html",
  "vehicle:frende-campingvognforsikring.html",
  "vehicle:frende-tilhengerforsikring.html",
  "vehicle:if-snoscooterforsikring.html",
  "vehicle:if-campingvognforsikring.html",
]);

const legacyIpids = new Set([
  "gjUtvidetUtstyr",
  "gjSpesiallakk",
  "gjFunksjonsutstyr",
  "frendeIpid",
  "ifInnboIpid",
  "ifHusIpid",
  "storebrandHusIpid",
  "gjensidigeHusIpid",
  "fremtindHusIpid",
  "frendeHusIpid",
  "fremtindReiseUnifiedIpid",
  "frendeReiseIpid",
  "vehicle:fremtind-IPID_Snoscooter.pdf",
]);

const htmlTerms = new Set(["gjensidigeHusSmartTerms"]);

function comparisonSourceType(source: Pick<ProductComparisonSource, "documentId" | "sourceType">) {
  if (source.sourceType) return source.sourceType;
  if (legacyProductPages.has(source.documentId)) return "product_page";
  return legacyIpids.has(source.documentId) ? "ipid" : "full_terms";
}

export function comparisonSourcePresentation(source: ProductComparisonSource) {
  const type = comparisonSourceType(source);
  const productPage = type === "product_page";
  const section = source.section?.trim();
  return {
    label: productPage ? "Produktside" : type === "ipid" ? "IPID / produktark" : "Offentlig vilkår",
    page: !productPage && !htmlTerms.has(source.documentId) && source.page > 0 ? `side ${source.page}` : null,
    section: section ? (productPage || /^punkt\b/iu.test(section) ? section : `punkt ${section}`) : null,
  };
}

export function comparisonDocumentLinkLabel(
  source: Pick<ProductComparisonSource, "documentId" | "sourceType" | "filename">,
  href: string,
): string {
  const type = comparisonSourceType(source);
  if (type === "product_page") return "Åpne produktsiden";
  if (type === "ipid") return "Åpne produktark (IPID)";
  const pdf = href.startsWith("/api/vilkar/") || /\.pdf$/iu.test(source.filename);
  return pdf ? "Åpne vilkår (PDF)" : "Åpne vilkår";
}

export function comparisonSourceReferences(sources: ProductComparisonSource[]) {
  const locations = sources.map((source) => {
    const { label, page, section } = comparisonSourcePresentation(source);
    const document = source.termsNumber && source.termsNumber !== "Ikke oppgitt" ? source.termsNumber : source.filename;
    return { label, page, section, document, reference: page ?? section ?? document };
  });
  return locations.map((location, index) => {
    const matching = locations.filter((candidate) => candidate.label === location.label &&
      candidate.reference === location.reference);
    if (matching.length < 2) return location.reference;
    const sameDocument = matching.filter((candidate) => candidate.document === location.document);
    const extra = sameDocument.length === 1 ? location.document : location.section ?? sources[index].effectiveFrom;
    const reference = [location.reference, extra].filter((item, position, items) =>
      Boolean(item) && items.indexOf(item) === position).join(" · ");
    return reference;
  });
}
