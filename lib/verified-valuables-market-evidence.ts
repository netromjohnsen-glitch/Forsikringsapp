import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, source: CatalogFact["source"],
  options?: Pick<CatalogFact, "coverageAvailability" | "qualificationSource">,
];

const covered = { coverageAvailability: "included" } as const;

function reference(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, productCode: source.productCode,
    version: source.version, agreementScope: source.agreementScope, page, section,
  };
}

export function addVerifiedValuablesMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function boundProduct(productId: string, component: string, version: string, sha256: string) {
    const source = sources[component];
    if (source?.sha256 === sha256 && products.some(product => product.productId === productId &&
      product.sourceId === source.id && product.version === version && product.componentIds?.includes(component))) return source;
  }

  function record(component: string, rows: ReviewedRow[]) {
    const keys = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...(facts[component] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, source, options]) => ({ key, label, value, source, ...options })),
    ];
  }

  function productPage(productId: string, terms: CatalogSource, url: string, section: string) {
    const id = terms.id + ":product-page";
    const source: CatalogSource = {
      id, company: terms.company, providerId: terms.providerId, insuranceType: terms.insuranceType,
      agreementScope: terms.agreementScope, sourceType: "product_page", productIds: [productId],
      termsNumber: "Produktside", effectiveFrom: "", filename: "Verdisakforsikring", url,
    };
    sources[id] = source;
    return reference(source, 0, section);
  }

  const ifTerms = boundProduct("if-verdisak", "private-valuables:if", "VSK1-8",
    "3eebd6c473bd5488e9834c89afd224c38501f9dfd33cf3c10a768ddeb3bdb746");
  if (ifTerms) {
    const sales = productPage("if-verdisak", ifTerms, "https://www.if.no/privat/forsikring/bolig/verdisakforsikring",
      "Dette dekker verdisakforsikringen – Tyveri");
    record(ifTerms.id, [[
      "verdisak.tyveri", "Tyveri",
      "Tyveri av en forsikret gjenstand dekkes innenfor avtalt forsikringsområde. Tyveriet skal meldes til politiet.",
      reference(ifTerms, 5, "7.1 Plikter ved skade, jf. 4 Hvilke skader dekkes på PDF-side 3"),
      { ...covered, qualificationSource: sales },
    ]]);
  }

  const tryg = boundProduct("tryg-verdisak", "private-valuables:tryg", "2026-07-01",
    "779dea13130c94982bcea454f21b40ad138d24811feda0b351aca7c5e5b0d55b");
  const trygSafety = sources["private-valuables:tryg:safety"];
  if (tryg && trygSafety?.sha256 === "00a62b9bc4932f1424b321f65c1ac94216c9d3795ecc56d513578247f854b892") {
    const sales = productPage("tryg-verdisak", tryg, "https://www.tryg.no/forsikringer/bolig-og-innbo/verdigjenstandsforsikring",
      "Verdigjenstandsforsikring – skade, tyveri og tap");
    record(tryg.id, [
      ["verdisak.tyveri", "Tyveri",
        "Tyveri av en forsikret gjenstand omfattes. Sikkerhetsforskriftene gjelder.",
        reference(tryg, 1, "2.1 Plutselige skadetilfeller og 3.2 Egenandel ved sykkeltyveri"),
        { ...covered, qualificationSource: sales }],
      ["verdisak.tap", "Tap av gjenstand",
        "Tryg opplyser at en forsikret gjenstand som er mistet eller gjenglemt, kan dekkes. Sikkerhetsforskriften krever tilsyn eller innlåsing. Brudd kan redusere eller fjerne erstatningen etter en vurdering av både skadeforløpet og skyldgraden.",
        sales, { ...covered, qualificationSource: reference(trygSafety, 1, "1.1 Sikkerhetsforskrifter og 1.2 Tilsyn") }],
    ]);
  }

  const fremtind = boundProduct("fremtind-verdisak", "private-valuables:fremtind", "PBK-230.100-007",
    "4318f0856972300347a2e3a67714c3be544b4e2c1130c266815c9130a4a75375");
  if (fremtind) {
    const kasko = reference(fremtind, 1, "4.1 Kasko");
    record(fremtind.id, [
      ["verdisak.tyveri", "Tyveri",
        "Tyveri kan erstattes når skadeårsaken er kjent og tapet kan knyttes til et bestemt tidspunkt. Vilkåret har en egen beløpsgrense ved tyveri fra motorkjøretøy om natten eller etter lengre parkering.",
        kasko, covered],
      ["verdisak.grense.biltyveri", "Tyveri fra bil – grense",
        "Inntil 10 000 kr per skadetilfelle ved tyveri fra motorkjøretøyets kupé om natten eller ved tyveri fra et motorkjøretøy som har stått i mer enn ett døgn.",
        kasko],
    ]);
  }

  const storebrand = boundProduct("storebrand-verdisak", "private-valuables:storebrand", "verdi04",
    "f931b6459295d4417ecd296a81340a4d39916ffee90e5cbf8e270273d10e4809");
  if (storebrand) {
    record(storebrand.id, [[
      "verdisak.grense.biltyveri", "Tyveri fra bil – grense",
      "Inntil 10 000 kr per skadetilfelle ved tyveri fra bilens kupé om natten eller ved tyveri fra en bil som har stått parkert i mer enn ett døgn.",
      reference(storebrand, 4, "B.4.2 Tyveri og tap – Begrensninger"),
    ]]);
  }
}
