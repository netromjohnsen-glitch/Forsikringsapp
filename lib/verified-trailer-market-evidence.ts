import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, source: CatalogFact["source"],
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification" | "qualificationSource">,
];

const included = { coverageAvailability: "included" } as const;
const coverageDeductible = { deductibleClassification: "coverage" } as const;
const referenceDeductible = { deductibleClassification: "reference" } as const;

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, productCode: source.productCode,
    version: source.version, agreementScope: source.agreementScope, page, section,
  };
}

export function addVerifiedTrailerMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function verified(productId: string, documentId: string, version: string | null, sha256: string) {
    const source = sources[documentId];
    if (source?.sha256 === sha256 && products.some(product => product.productId === productId &&
      product.sourceId === source.id && product.version === version && product.componentIds?.includes(productId))) return source;
  }

  function apply(productId: string, rows: ReviewedRow[]) {
    const keys = new Set(rows.map(([key]) => key));
    const inheritsBase = products.some(product => product.productId === productId && product.inheritsProductId);
    facts[productId] = [
      ...(facts[productId] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, source, options]) => ({
        key, label, value, source, ...options, ...(inheritsBase && { replacesBase: true }),
      })),
    ];
  }

  function productPage(source: CatalogSource, providerId: string, productIds: string[], url: string) {
    const id = "verified-trailer:" + providerId + ":product-page";
    const existing = sources[id];
    if (existing) return existing;
    const sales: CatalogSource = {
      id, company: source.company, providerId, insuranceType: "Tilhenger",
      agreementScope: "ordinary", sourceType: "product_page", productIds,
      filename: "Tilhengerforsikring", termsNumber: "Produktside", effectiveFrom: "", url,
    };
    sources[id] = sales;
    return sales;
  }

  const ifProducts = ["if-tilhenger-delkasko", "if-tilhenger-kasko"];
  for (const productId of ifProducts) {
    const terms = verified(productId, "vehicle:if-Vilkaar-4103ea25.pdf", "2024-03",
      "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987");
    if (!terms) continue;

    const sales = productPage(terms, "if", ifProducts, "https://www.if.no/privat/forsikring/kjoretoy/tilhengerforsikring");
    const offeredDeductible = cite(sales, 0, "Egenandel ved skade");
    const fallbackText = "If oppgir at du kan velge 2 000 eller 4 000 kr for tilhenger. Det generelle kjøretøyvilkåret oppgir 8 000 kr der det ikke er avtalt annet. Forsikringsbeviset avgjør din egenandel.";
    const generalDeductible = cite(terms, 19, "8.5.3 Brann, tyveri, hærverk og naturskade");
    const deductible = { ...referenceDeductible, qualificationSource: generalDeductible };
    const assistance = cite(sales, 0, "Hva dekker tilhengerforsikringen? – Veihjelp i Europa");
    const rows: ReviewedRow[] = [
      ["tilhenger.brann.egenandel", "Brann – egenandel", fallbackText, offeredDeductible, deductible],
      ["tilhenger.tyveri.egenandel", "Tyveri – egenandel", fallbackText, offeredDeductible, deductible],
      ["tilhenger.tyveri.dekning", "Tyveri",
        "Skade eller tap som følge av tyveri, tyveriforsøk og innbrudd. Det regnes ikke som tyveri når den skyldige tilhører sikredes husstand.",
        cite(terms, 5, "4.3 Tyveri"), included],
      ["tilhenger.redning.dekning", "Redning og veihjelp",
        "Veihjelp innenfor forsikringsområdet i Europa, med assistanse på stedet eller nødvendig transport til nærmeste verksted som kan reparere. Hendelsen må ha skjedd på et normalt fremkommelig sted uten adkomstrestriksjoner.",
        cite(terms, 5, "4.7 Veihjelp og 4.7.1 Transport av kjøretøy"), { ...included, qualificationSource: assistance }],
      ["tilhenger.redning.egenandel", "Redning – egenandel",
        "Ifs produktside oppgir 500 kr for veihjelp til tilhenger. Det generelle kjøretøyvilkåret oppgir 750 kr. Sjekk egenandelen i forsikringsbeviset.",
        assistance, { ...referenceDeductible, qualificationSource: cite(terms, 19, "8.5.6 Veihjelp") }],
    ];
    if (productId === "if-tilhenger-kasko") rows.push(
      ["tilhenger.kasko.dekning", "Kasko",
        "Skade på tilhengeren ved sammenstøt, utforkjøring, velt eller en annen tilfeldig, plutselig ytre hendelse.",
        cite(terms, 6, "4.8 Kaskoskader"), included],
      ["tilhenger.kasko.egenandel", "Kasko – egenandel",
        fallbackText, offeredDeductible, { ...referenceDeductible, qualificationSource: cite(terms, 19, "8.5.5 Kaskoskade") }],
    );
    apply(productId, rows);
  }

  for (const [level, sha256] of [
    ["delkasko", "9154b1ee38457ccf602854819c21fea4374c7265172a6d39bbd28775299209fc"],
    ["kasko", "2c2f5b4a59d6dbe6564257319224d841e065eada4dab5f9c04ee05c6c3413328"],
  ] as const) {
    const productId = "gjensidige-tilhenger-" + level;
    const terms = verified(productId, "vehicle:gjensidige-tilhenger-" + level + "-alminnelige-vilkar.pdf", null, sha256);
    if (!terms) continue;
    apply(productId, [
      ["tilhenger.hjul.dekning", "Dekk og felger", "Ett sett ekstra dekk og felger omfattes.",
        cite(terms, 2, "Forsikringsbevis – Hva er forsikret?"), included],
      ["tilhenger.rulling.egenandel", "Rulling uten fører – egenandel",
        "Ved skade som skyldes at kjøretøyet triller uten fører, økes egenandelen med 5 000 kr for privatforsikringer. Beløpet kreves også når skaden ellers ikke utløser egenandel.",
        cite(terms, 1, "Forsikringsbevis – Forhøyet egenandel der kjøretøyet triller uten fører"), coverageDeductible],
    ]);
  }

  for (const [level, file, sha256, conditionPage, deductiblePage, section] of [
    ["brann", "543856fa", "ef35e81a0c38a0d9ad824bf3bcc54422a29dabdef614a1eea550f9480d3d5d79", 1, 2, "2.2 Naturskade"],
    ["brann-og-tyveri", "05b2538c", "d23f9b93a43d7a346ac5452d1bb9b9e679ac62ce6c8c9ae2b3de5ec188a5362e", 2, 2, "2.3 Naturskade"],
    ["kasko", "f862c645", "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e", 2, 3, "2.5 Naturskade"],
  ] as const) {
    const productId = "tryg-tilhenger-" + level;
    const terms = verified(productId, "vehicle:tryg-odpdf-" + file + ".pdf", "2026-01-01", sha256);
    if (!terms) continue;
    const rows: ReviewedRow[] = [
      ["tilhenger.naturskade.dekning", "Naturskade",
        "Brannforsikret tilhenger dekkes ved direkte skade fra skred, storm, flom, stormflo, flodbølge, meteorittnedslag, jordskjelv eller vulkanutbrudd.",
        cite(terms, conditionPage, section), included],
      ["tilhenger.naturskade.egenandel", "Naturskade – egenandel", "8 000 kr.",
        cite(terms, deductiblePage, section + " – Egenandel"), coverageDeductible],
      ["tilhenger.hjul.dekning", "Dekk og felger",
        "Deler av tilhengeren, inkludert ekstra dekk og felger av standard utførelse tilsvarende antallet hjul, omfattes ved dekket skade.",
        cite(terms, 1, "1.1 Kjøretøyet"), included],
    ];
    if (level === "kasko") {
      const sales = productPage(terms, "tryg", [productId], "https://www.tryg.no/forsikringer/kjoretoy/tilhengerforsikring");
      rows.push(
        ["tilhenger.kasko.dekning", "Kasko",
          "Skade på tilhengeren og delene ved sammenstøt, utforkjøring, velt, hærverk eller plutselig, uventet og ytre påvirkning. Vilkåret setter ett døgn som øvre grense for hvor lenge påvirkningen kan ha vart.",
          cite(terms, 1, "2.1 Kasko"), included],
        ["tilhenger.kasko.egenandel", "Kasko – egenandel",
          "Avtalt egenandel står i forsikringsbeviset. Trygs produktside oppgir Kasko-egenandel fra 4 000 kr.",
          cite(terms, 2, "2.1 Kasko – Egenandel"), {
            ...referenceDeductible, qualificationSource: cite(sales, 0, "Hva er egenandelen på tilhengerforsikring?"),
          }],
        ["tilhenger.kasko.vaer.egenandel", "Værrelatert kaskoskade – egenandel",
          "Ingen egenandel ved dekket værrelatert kaskoskade når tilhengeren var parkert innendørs i garasje eller lignende da skaden oppstod.",
          cite(terms, 2, "2.1 Kasko – Værrelatert skade"), coverageDeductible],
      );
    }
    apply(productId, rows);
  }

  const storebrandProducts = ["storebrand-tilhenger-brann-og-tyveri", "storebrand-tilhenger-kasko"];
  for (const productId of storebrandProducts) {
    const terms = verified(productId, "vehicle:storebrand-vilkar-campingvogn-og-tilhenger.pdf", "2026-03-01",
      "fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8");
    if (!terms) continue;
    const sales = productPage(terms, "storebrand", storebrandProducts, "https://www.storebrand.no/privat/forsikring/tilhengerforsikring");
    const offeredDeductible = cite(sales, 0, "Hvilke egenandeler gjelder for forsikringen?");
    const deductible = "Storebrand oppgir 1 000 kr for tilhenger. Fellesvilkåret for campingvogn og tilhenger oppgir 8 000 kr når annet ikke står i forsikringsbeviset. Forsikringsbeviset gjelder foran vilkåret.";
    const rows: ReviewedRow[] = [
      ["tilhenger.brann.egenandel", "Brann – egenandel", deductible, offeredDeductible, {
        ...referenceDeductible, qualificationSource: cite(terms, 5, "6.1.1 Brann – Egenandeler"),
      }],
      ["tilhenger.tyveri.egenandel", "Tyveri – egenandel", deductible, offeredDeductible, {
        ...referenceDeductible, qualificationSource: cite(terms, 6, "6.1.2 Tyveri – Egenandeler"),
      }],
      ["tilhenger.tyveri.dekning", "Tyveri",
        "Tyveri av tilhengeren og skade ved tyveri eller tyveriforsøk. Hærverk omfattes når det er åpenbart at det samtidig er gjort forsøk på å stjele tilhengeren. Det regnes ikke som tyveri når den skyldige tilhører sikredes husstand.",
        cite(terms, 6, "6.1.2 Tyveri"), included],
      ["tilhenger.hjul.dekning", "Dekk og felger", "Hjulsett av samme standard som ved levering som ny. Verdi som nytt, justert for alder.",
        cite(terms, 4, "5 Hva er forsikret – Kjøretøyet og tilleggsutstyr"), included],
    ];
    if (productId === "storebrand-tilhenger-kasko") rows.push(
      ["tilhenger.kasko.egenandel", "Kasko – egenandel",
        "Egenandelen står i forsikringsbeviset. Storebrands produktside oppgir 1 000 kr for tilhenger.",
        cite(terms, 7, "6.2 Kaskoforsikring – Egenandeler"), { ...referenceDeductible, qualificationSource: offeredDeductible }],
      ["tilhenger.naturskade.dekning", "Naturskade", "Naturskade på tilhengeren omfattes når Kasko er avtalt i forsikringsbeviset.",
        cite(terms, 6, "6.2 Kaskoforsikring"), included],
    );
    apply(productId, rows);
  }
}
