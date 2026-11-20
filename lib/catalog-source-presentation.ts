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

const htmlTerms = new Set(["gjensidigeHusSmartTerms"]);

export function comparisonSourcePresentation(source: ProductComparisonSource) {
  const type = source.sourceType ?? (legacyProductPages.has(source.documentId) ? "product_page" : "full_terms");
  const productPage = type === "product_page";
  return {
    label: productPage ? "Produktside" : type === "ipid" ? "IPID / produktark" : "Offentlig vilkår",
    page: !productPage && !htmlTerms.has(source.documentId) && source.page > 0 ? `side ${source.page}` : null,
    section: source.section ? (productPage ? source.section : `punkt ${source.section}`) : null,
  };
}
