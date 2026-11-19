import { vehicleObjectAddOns, vehicleObjectFacts, vehicleObjectProducts, vehicleObjectSources } from "./vehicle-object-catalog.ts";
import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

const summary = {
  slug: "snoscooter-ipid-2026-09",
  filename: "tryg-IPID-Snoscooter-2026-09.pdf",
  termsNumber: "IPID Snøscooterforsikring",
  effectiveFrom: "2026-09-01",
  url: "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Snoscooter.pdf",
  sha256: "388025be35e68b61adc6828fbcba58db5ca31d1ddce7fbc092c047050b15aab4",
  pages: 2,
} as const;

const fullTerms = {
  ansvar: ["tryg-odpdf-060a2170.pdf", "snoscooter-ansvar", 1],
  produkt: ["tryg-odpdf-dbf5be98.pdf", "snoscooter-produkt", 2],
  brann: ["tryg-odpdf-0d60de94.pdf", "snoscooter-brann-tyveri-2026-10", 2],
  kasko: ["tryg-odpdf-a1702ca7.pdf", "snoscooter-kasko-2026-10", 3],
  forerulykke: ["tryg-odpdf-2001c3a6.pdf", "snoscooter-forerulykke", 2],
  passasjerulykke: ["tryg-odpdf-56716918.pdf", "snoscooter-forer-passasjerulykke", 2],
} as const;

type FullDocument = keyof typeof fullTerms;
type Document = FullDocument | "summary";
const keys = Object.keys(fullTerms) as FullDocument[];
const sourceId = (key: Document) => "tryg:snoscooter:market:" + key;
const marketId = (id: string) => id + "-marked";

const sources: Record<string, CatalogSource> = Object.fromEntries((["summary", ...keys] as Document[]).map(key => {
  const [filename, , pages] = key === "summary" ? [summary.filename, summary.slug, summary.pages] as const : fullTerms[key];
  const document = key === "summary" ? summary : vehicleObjectSources["vehicle:" + filename];
  return [sourceId(key), {
    id: sourceId(key), filename, providerId: "tryg", company: "Tryg", insuranceType: "Snøscooter",
    agreementScope: "ordinary", sourceType: key === "summary" ? "ipid" : "full_terms",
    termsNumber: document.termsNumber, effectiveFrom: document.effectiveFrom, version: document.effectiveFrom,
    url: document.url, sha256: document.sha256, physicalPages: [1, pages],
    documentName: document.termsNumber,
  } satisfies CatalogSource];
}));

export const trygSnowMarketArchives = (["summary", ...keys] as Document[]).map(key => {
  const source = sources[sourceId(key)];
  return {
    provider: "tryg", slug: key === "summary" ? summary.slug : fullTerms[key][1],
    archivePath: "catalog/sources/vehicle-extensions/" + source.filename,
    sources: [[source.id, source.effectiveFrom, source.url!]] as const,
  };
});

function citation(key: Document, page: number, section: string): CatalogFact["source"] {
  const { id, filename, company, termsNumber, effectiveFrom, url, version } = sources[sourceId(key)];
  return { documentId: id, filename, company, termsNumber, effectiveFrom, url, version, agreementScope: "ordinary", page, section };
}

const previousDocument = new Map(keys.map(key => ["vehicle:" + fullTerms[key][0], key] as const));
const toSource = (source: CatalogFact["source"]) => {
  const key = previousDocument.get(source.documentId);
  if (key) return citation(key, source.page, source.section);
  return source.documentId === "vehicle:tryg-IPID-Snoscooter.pdf" ? citation("summary", source.page, source.section) : source;
};

function marketFact(fact: CatalogFact, tier: string): CatalogFact {
  const fireDocument = tier === "Kasko" ? "kasko" : "brann";
  if (fact.key === "snoscooter.brann.dekning") return {
    ...fact, value: "Skade ved brann med åpen flamme, eksplosjon eller lynnedslag.",
    source: citation(fireDocument, 1, tier === "Kasko" ? "2.2 Brann" : "2.1 Brann"),
  };
  if (fact.key === "snoscooter.tyveri.dekning") return {
    ...fact, value: "Tyveri eller brukstyveri av kjøretøyet eller deler av det. Skade eller hærverk ved tyveriforsøk omfattes.",
    source: citation(fireDocument, 1, tier === "Kasko" ? "2.3 Tyveri" : "2.2 Tyveri"),
  };
  if (fact.key === "snoscooter.kasko.dekning") return {
    ...fact, value: "Skade på eget kjøretøy ved sammenstøt, utforkjøring, velt, hærverk, feilfylling av drivstoff eller annen plutselig, uventet og ytre påvirkning.",
    source: citation("kasko", 1, "2.1 Kasko"),
  };
  if (fact.key === "snoscooter.rettshjelp.dekning") return {
    ...fact, value: "Rettshjelp er omfattet når ansvar er avtalt. Rettshjelp gjelder i Norden.",
    source: citation("produkt", 1, "2–3 Rettshjelp"),
  };
  return { ...fact, source: toSource(fact.source) };
}

function coverageFacts(tier: string): CatalogFact[] {
  if (tier === "Ansvar") return [];
  const document = tier === "Kasko" ? "kasko" : "brann";
  const deductible = tier === "Kasko" ? "4 000 kr" : "6 000 kr";
  const facts: CatalogFact[] = [
    {
      key: "snoscooter.brann.egenandel", label: "Brann – egenandel", value: deductible,
      deductibleClassification: "coverage",
      source: citation(document, 1, tier === "Kasko" ? "2.2 Brann – egenandel" : "2.1 Brann – egenandel"),
    },
    {
      key: "snoscooter.tyveri.egenandel", label: "Tyveri – egenandel", value: deductible,
      deductibleClassification: "coverage",
      source: citation(document, 1, tier === "Kasko" ? "2.3 Tyveri – egenandel" : "2.2 Tyveri – egenandel"),
    },
    {
      key: "snoscooter.utstyr.dekning", label: "Utstyr", value: "Hjelm og lovlig fastmontert tilbehør. Foliering regnes som fastmontert tilbehør.",
      source: citation(document, 1, "1 Kjøretøyet og fastmontert tilbehør"),
    },
    {
      key: "snoscooter.utstyr.grense", label: "Utstyr – forsikringssum", value: "Inntil 10 000 kr for lovlig fastmontert tilbehør.",
      source: citation(document, 1, "1 Fastmontert tilbehør"),
    },
    {
      key: "snoscooter.utstyr.begrensning", label: "Utstyr – begrensning", value: "Tilhenger og utstyr som kan tas av uten verktøy, regnes ikke som fastmontert tilbehør. Spesiallakk omfattes ikke.",
      source: citation(document, 1, "1 Kjøretøyet og fastmontert tilbehør"),
    },
  ];
  if (tier === "Kasko") facts.push({
    key: "snoscooter.kasko.egenandel", label: "Kasko – avtalt egenandel", value: "Står i forsikringsbeviset.",
    deductibleClassification: "reference", source: citation("kasko", 1, "2.1 Kasko – avtalt egenandel"),
  });
  return facts;
}

const legacyProducts = vehicleObjectProducts.filter(product =>
  product.providerId === "tryg" && product.insuranceType === "Snøscooter" && product.sourceId === "vehicle:tryg-IPID-Snoscooter.pdf");
const replacesProductIds = legacyProducts.map(product => product.productId);
const legacyAddOns = vehicleObjectAddOns.filter(addOn =>
  addOn.providerId === "tryg" && addOn.requiresLevel?.some(level => replacesProductIds.includes(level)));

const products = legacyProducts.map(legacy => {
  const document = legacy.name === "Kasko" ? "kasko" : legacy.name === "Brann og tyveri" ? "brann" : "summary";
  return {
    ...legacy, agreementScope: "ordinary" as const, productId: marketId(legacy.productId),
    // Each legacy component already repeats every inherited coverage. Current
    // certificates differ by tier, so each market level uses its own full rows.
    inheritsProductId: undefined, componentIds: [marketId(legacy.productId)],
    sourceId: sourceId(document), version: sources[sourceId(document)].version!,
  };
});

const facts: Record<string, CatalogFact[]> = Object.fromEntries([
  ...legacyProducts.map(product => {
    const rows = [
      ...vehicleObjectFacts[product.productId].map(fact => marketFact(fact, product.name)),
      ...coverageFacts(product.name),
    ];
    return [marketId(product.productId), rows] as const;
  }),
  ...legacyAddOns.map(addOn => [marketId(addOn.componentId),
    vehicleObjectFacts[addOn.componentId].map(fact => ({ ...fact, source: toSource(fact.source) }))] as const),
]);

const addOns = legacyAddOns.map(addOn => ({
  ...addOn, id: marketId(addOn.id), componentId: marketId(addOn.componentId),
  requiresLevel: replacesProductIds.map(marketId),
}));

export const trygSnowMarket = { replacesProductIds, products, sources, facts, addOns };
