import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification">,
];

const included = { coverageAvailability: "included" } as const;
const unavailable = { coverageAvailability: "unavailable" } as const;
const coverageDeductible = { deductibleClassification: "coverage" } as const;

const klpHouseTerms = [
  ["klp-hus-hus", "new-private:klp-hus.pdf", "6a6e92d877d45e4547c075d2f4ff8967fa3d41d93aad35ba1a919043acfd6cd5"],
  ["klp-hus-utvidet-rate-og-insektskader", "new-private:klp-hus-rate.pdf", "4003b4b656437fcfe48703e91bde7d51f52b07f781c68fbbdc82af8062f572cf"],
  ["klp-hus-hus-maks", "new-private:klp-hus-maks.pdf", "de573541144530e4c0b2333d59f4b9493c8ffa7f9d845b4589202f376fec2c22"],
] as const;

const klpOutbuildings: ReviewedRow = [
  "hus.bygninger.tilbehor", "Ledninger og tilleggsbygg",
  "Utvendige ledninger med tilknyttet utstyr frem til brønn, tank, spredeledning eller offentlig ledning og drenssystem omfattes. Tilleggsbygg inntil 10 m² har brann- og naturskadedekning når bygget står i forsikringsbeviset og ikke har egen forsikring. Tilleggsbygg omfattes inntil 250 000 kr ved avtaler inngått før 17. november 2018. For avtaler etter denne datoen skal byggene forsikres særskilt og stå i forsikringsbeviset.",
  1, "Hva forsikringen omfatter",
];

const landkredittDeductibleWaiver: ReviewedRow = [
  "hus.egenandel.fritak", "Fritak for egenandel",
  "Ingen egenandel ved tyveri når innbruddsalarm som varsler alarmsentral eller vaktselskap var i bruk på skadetidspunktet. Fritaket gjelder også ved brudd på innvendig vannledning når en vannstoppventil som sikrer hele byggets rørsystem var i bruk, og ved skade som bare rammer overspenningsvern, brannalarm eller innbruddsalarm.",
  8, "5.2 Egenandel (fortsetter på PDF-side 9)", coverageDeductible,
];

const landkredittWetRoomCondition =
  " ved skade fra materialfeil, konstruksjonsfeil, prosjekteringsfeil eller feilmontering etter arbeid utført av faglært håndverker eller godkjent eller registrert entreprenør. Skaden må ha oppstått i forsikringstiden og være konstatert innen ti år etter arbeidet.";

export function addVerifiedDamageFollowupMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function apply(productId: string, source: CatalogSource | undefined, sha256: string,
    version: string | null, rows: ReviewedRow[]) {
    if (source?.sha256 !== sha256 || !products.some(product => product.productId === productId &&
      product.sourceId === source.id && product.version === version && product.componentIds?.includes(productId))) return;

    const keys = new Set(rows.map(([key]) => key));
    facts[productId] = [
      ...(facts[productId] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, page, section, options]) => ({
        key, label, value, ...options,
        source: {
          documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, productCode: source.productCode,
          version: source.version, agreementScope: source.agreementScope, page, section,
        },
      })),
    ];
  }

  for (const [id, documentId, hash] of klpHouseTerms) {
    const rows = [klpOutbuildings];
    if (id !== "klp-hus-hus-maks") rows.push([
      "hus.vatrom.selverommet", "Skade på selve våtrommet",
      "Skade på gulv og vegger i våtrom som skal tåle vann, er unntatt. Vilkåret regner bygningsdeler innenfor våtrommets bjelkelag og stenderverk som del av våtrommet.",
      2, "Standard dekning – Hus: Hva som ikke dekkes", unavailable,
    ]);
    apply(id, sources[documentId], hash, null, rows);
  }

  const landkreditt = sources["new-private:landkreditt-hus.pdf"];
  const landkredittHash = "8e173190f1f4cfb1d8f06ae0c34e543a5002fed266018ada5eaad7bea79b252d";
  apply("landkreditt-hus-standard", landkreditt, landkredittHash, "2026-01-01", [
    landkredittDeductibleWaiver,
    ["hus.vatrom.selverommet", "Skade på selve våtrommet",
      "Skade på selve våtrommet eller sanitærrommet på grunn av utetthet er unntatt. Vilkåret regner bygningsdeler innenfor våtrommets bjelkelag og stenderverk som del av våtrommet.",
      4, "4.2 f Bygningsforsikringen dekker ikke", unavailable],
    ["hus.vatrom.folgeskade", "Følgeskade fra utett våtrom",
      "Skade i tilstøtende rom som skyldes at våtrommet eller sanitærrommet er utett, er unntatt.",
      4, "4.2 f Bygningsforsikringen dekker ikke", unavailable],
  ]);
  apply("landkreditt-hus-utvidet", landkreditt, landkredittHash, "2026-01-01", [
    landkredittDeductibleWaiver,
    ["hus.vatrom.selverommet", "Skade på selve våtrommet",
      "Bygningsdeler innenfor våtrommets bjelkelag og stenderverk dekkes" + landkredittWetRoomCondition,
      17, "10.2.1 Følgeskader ved utett våtrom", included],
    ["hus.vatrom.folgeskade", "Følgeskade fra utett våtrom",
      "Følgeskade i tilstøtende rom dekkes" + landkredittWetRoomCondition,
      17, "10.2.1 Følgeskader ved utett våtrom", included],
  ]);

  const waterCircles = sources["new-private:watercircles-hus.pdf"];
  const waterCirclesHash = "133afa1893075c936691a65fd4b736718a304bf3917ce6909a598add09fc27e0";
  const fixedDockLimit = "Inntil 100 000 kr for fast trebrygge ved dekningsmessig skade. ";
  apply("watercircles-hus-standard", waterCircles, waterCirclesHash, "WTC-VIL-2.17", [
    ["hus.vatrom.folgeskade", "Utett våtrom – følgeskade",
      "Skade i andre rom som skyldes at våtrommet er utett, er unntatt i Standard.",
      6, "A.1.5.1 k Annen skade – unntak", unavailable],
    ["hus.vatrom.selverommet", "Våtrom – selve rommet",
      "Skade som skyldes at våtrommet er utett, er unntatt i Standard.",
      6, "A.1.5.1 k Annen skade – unntak", unavailable],
    ["hus.hage.objekter", "Hageanlegg og utendørsobjekter",
      "Inntil 150 000 kr samlet for hageanlegg på inntil fem dekar, basseng og andre badeinnretninger koblet til byggets faste rør, gjerde, fast trebrygge og flaggstang. Av dette dekkes fast trebrygge inntil 100 000 kr.",
      6, "A.2.2 nr. 2 Hageanlegg tilknyttet boligen"],
    ["hus.hage.brygge", "Brygge",
      fixedDockLimit + "Beløpet inngår i den samlede grensen på 150 000 kr. Andre typer brygger og kaianlegg omfattes ikke.",
      6, "A.2.2 nr. 2 Hageanlegg tilknyttet boligen"],
  ]);
  apply("watercircles-hus-elite", waterCircles, waterCirclesHash, "WTC-VIL-2.17", [
    ["hus.vatrom.folgeskade", "Utett våtrom – følgeskade",
      "Følgeskade i andre rom fra vann fra utett våtrom omfattes.",
      14, "D A nr. 3 Utvidet vannskadedekning", included],
    ["hus.vatrom.selverommet", "Våtrom – selve rommet",
      "Skade som skyldes at selve våtrommet er utett, er unntatt. Elite-utvidelsen gjelder følgeskade i andre rom.",
      14, "D A nr. 3, jf. unntaket i A.1.5.1 k på PDF-side 6", unavailable],
    ["hus.hage.brygge", "Brygge",
      fixedDockLimit + "Beløpet inngår i den samlede grensen på 2 000 000 kr. Andre typer brygger og kaianlegg omfattes ikke.",
      14, "D B nr. 1 Beløpsbegrensninger, jf. A.2.2 nr. 2 på PDF-side 6"],
  ]);
}
