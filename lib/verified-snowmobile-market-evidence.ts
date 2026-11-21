import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, source: CatalogFact["source"],
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification" | "qualificationSource" | "replacesBase">,
];

const included = { coverageAvailability: "included" } as const;
const unavailable = { coverageAvailability: "unavailable" } as const;
const coverageDeductible = { deductibleClassification: "coverage" } as const;

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    effectiveFrom: source.effectiveFrom, company: source.company, url: source.url,
    version: source.version, agreementScope: source.agreementScope, page, section,
  };
}

export function addVerifiedSnowmobileMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function verified(productId: string, documentId: string, version: string, sha256: string) {
    const source = sources[documentId];
    if (source?.sha256 === sha256 && products.some(product => product.productId === productId &&
      product.sourceId === documentId && product.version === version && product.componentIds?.includes(productId))) return source;
  }

  function apply(component: string, rows: ReviewedRow[]) {
    const keys = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...(facts[component] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, source, options]) => ({ key, label, value, source, ...options })),
    ];
  }

  const ifId = "vehicle:if-Vilkaar-4103ea25.pdf";
  const ifHash = "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987";
  const ifBase = "if-snoscooter-ansvar";
  const ifBaseTerms = verified(ifBase, ifId, "2024-03", ifHash);
  if (ifBaseTerms) {
    apply(ifBase, [
      ["snoscooter.ulykke.grense", "Fører- og passasjerulykke – forsikringssum",
        "100 000 kr per forsikret ved dødsfall som følge av ulykken. Ved 100 % medisinsk invaliditet er summen 200 000 kr per forsikret. Ved lavere invaliditetsgrad utbetales en tilsvarende andel av summen.",
        cite(ifBaseTerms, 22, "11.5.1 Medisinsk invaliditet og 11.5.2 Dødsfall"), included],
    ]);
  }

  const ifDelkasko = "if-snoscooter-delkasko";
  const ifKasko = "if-snoscooter-kasko";
  const ifCoverTerms = verified(ifDelkasko, ifId, "2024-03", ifHash);
  const ifSpecial = sources["mcb:if:mc:if-SV692.pdf"];
  if (ifCoverTerms && ifSpecial?.sha256 === "ac91470a3859045cd1ab64300bca5ba34531f73faed7965f00797bb89de6f419") {
    const special: CatalogSource = {
      ...ifSpecial, id: "verified-snowmobile:if:sv692", insuranceType: "Snøscooter",
      productIds: [ifDelkasko, ifKasko], physicalPages: [1, 4],
    };
    const sales: CatalogSource = {
      id: "verified-snowmobile:if:product-page", company: "If", providerId: "if", insuranceType: "Snøscooter",
      agreementScope: "ordinary", sourceType: "product_page", productIds: [ifDelkasko, ifKasko],
      filename: "Snøscooterforsikring", termsNumber: "Produktside", effectiveFrom: "",
      url: "https://www.if.no/privat/forsikring/kjoretoy/snoscooterforsikring",
    };
    sources[special.id] = special;
    sources[sales.id] = sales;
    const ifPropertyRows: ReviewedRow[] = [
      ["snoscooter.tyveri.egenandel", "Tyveri – egenandel",
        "Egenandelen står i forsikringsbeviset. Særvilkåret gir 2 000 kr reduksjon når en riktig montert FG-godkjent tilleggslås for kjøretøytypen var i bruk. Ifs produktside oppgir at egenandelen faller bort med godkjent alarm i tillegg.",
        cite(special, 3, "4.1 Tyveri med godkjent tilleggslås i bruk"), {
          ...coverageDeductible, qualificationSource: cite(sales, 0, "Hva er egenandelen ved skade?"),
        }],
      ["snoscooter.tyveri.dekning", "Tyveri",
        "Skade eller tap som følge av tyveri, tyveriforsøk eller innbrudd. Når den skyldige tilhører sikredes husstand, regnes det ikke som tyveri etter vilkåret.",
        cite(ifCoverTerms, 5, "4.3 Tyveri"), included],
      ["snoscooter.kjoreutstyr.dekning", "Personlig kjøreutstyr",
        "Dekning for skade på personlig kjøreutstyr som hjelm, kjøredress, hansker, kjørestøvler, ryggskinne og airbagvest, -jakke eller -dress. Ved oppbevaring på kjøretøyet må utstyret ligge i et fastlåst eller fastboltet rom, eller være fastlåst til kjøretøyet. Nøkkelen må oppbevares borte fra snøscooteren.",
        cite(special, 1, "1 Hva er forsikret, jf. 3.1 Sikkerhetsforskrift på PDF-side 3"), included],
    ];
    apply(ifDelkasko, ifPropertyRows);
    if (verified(ifKasko, ifId, "2024-03", ifHash)) {
      apply(ifKasko, ifPropertyRows.map(([key, label, value, source, options]) =>
        [key, label, value, source, { ...options, replacesBase: true }]));
    }
  }

  const fremtindId = "vehicle:fremtind-Vilkar_Kasko_Snoscooter.pdf";
  const fremtindHash = "2103322d55713ff007aec488ffd3cc09ebd35d88ded5904314226f48c36915bb";
  const minikasko = "eika-fremtind-snoscooter-minikasko";
  const fremtindKasko = "eika-fremtind-snoscooter-kasko";
  const fremtind = verified(minikasko, fremtindId, "2023-10-29", fremtindHash);
  if (fremtind) {
    const fireTheft: ReviewedRow[] = [
      ["snoscooter.brann.dekning", "Brann", "Skade ved brann, lynnedslag eller eksplosjon.",
        cite(fremtind, 4, "Minikasko 2.1 Brann"), included],
      ["snoscooter.tyveri.dekning", "Tyveri",
        "Tyveri, brukstyveri, tyveriforsøk og hærverk i forbindelse med dette. Hærverk ellers omfattes også. Det regnes ikke som tyveri når gjerningspersonen tilhører sikredes husstand eller er ansatt sjåfør.",
        cite(fremtind, 4, "Minikasko 2.2 Tyveri og hærverk"), included],
    ];
    apply(minikasko, [
      ...fireTheft,
      ["snoscooter.tyveri.egenandel", "Tyveri – egenandel",
        "Avtalt egenandel kan reduseres med inntil 4 000 kr ved tyveri av eller fra snøscooteren når FG-godkjent eller fabrikkmontert alarm var i drift. Ved tyveri av snøscooteren gjelder reduksjonen også når et FG-godkjent søke- og gjenfinningssystem var i drift.",
        cite(fremtind, 7, "Minikasko 4.1 Ved montert skadeforebyggende tiltak"), coverageDeductible],
      ["snoscooter.redning.dekning", "Redning",
        "Nødvendig transport til nærmeste verksted som kan reparere etter en dekket skade. Reparasjon på stedet dekkes når det er rimeligere enn transport. Driftsstans alene på snøscooter er unntatt.",
        cite(fremtind, 5, "Minikasko 2.4.2 Transport av kjøretøy"), included],
      ["snoscooter.redning.egenandel", "Redning – egenandel", "500 kr ved dekket redning.",
        cite(fremtind, 7, "Minikasko 4.3 Redning"), coverageDeductible],
      ["snoscooter.kjoreutstyr.dekning", "Personlig kjøreutstyr",
        "Kjøreutstyr for snøscooter er omfattet. Vilkåret oppgir ingen egen beløpsgrense for kjøreutstyr i punkt 1.2.",
        cite(fremtind, 4, "Minikasko 1.2 Tilleggsutstyr"), included],
      ["snoscooter.losore.dekning", "Bagasje og løsøre",
        "Løsøre i boks eller veske er ikke dekket for snøscooter etter dette punktet. Snøscooterens kjøreutstyr og fastmonterte tilleggsutstyr er omfattet etter punkt 1.2.",
        cite(fremtind, 4, "Minikasko 1.2 Tilleggsutstyr og 1.3 Løsøre"), unavailable],
    ]);
    if (verified(fremtindKasko, fremtindId, "2023-10-29", fremtindHash)) {
      apply(fremtindKasko, fireTheft.map(([key, label, value, source, options]) =>
        [key, label, value, source, { ...options, replacesBase: true }]));
    }
  }

  for (const [level, hash, page] of [
    ["brann-og-tyveri", "576521c433ef20b4eedf09d0efde0fc7f7aeb378c83c16286c88bc84350dacbd", 1],
    ["kasko", "1b073ad7823b6c4230786f70ded6da0d3403ab212b79f610951d32cfea76cad8", 2],
  ] as const) {
    const productId = "tryg-snoscooter-" + level + "-marked";
    const terms = verified(productId, "tryg:snoscooter:market:" + (level === "kasko" ? "kasko" : "brann"), "2026-10-01", hash);
    if (!terms) continue;
    apply(productId, [
      ["snoscooter.redning.dekning", "Redning",
        "Redning og veihjelp er unntatt. Vilkåret unntar også utgifter til transport av snøscooteren til nærmeste reparasjonsverksted.",
        cite(terms, page, "3.1 Erstatning – Utgifter til transport"), unavailable],
      ["snoscooter.kjoreutstyr.dekning", "Personlig kjøreutstyr", "Hjelm omfattes ved dekket skade.",
        cite(terms, 1, "1 Hva forsikringen omfatter – Kjøretøyet"), included],
    ]);
  }
}
