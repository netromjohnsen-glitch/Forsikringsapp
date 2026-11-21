import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification" | "qualificationSource" | "replacesBase">];

const included = { coverageAvailability: "included" } as const;
const unavailable = { coverageAvailability: "unavailable" } as const;

function citation(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, version: source.version,
    productCode: source.productCode, agreementScope: source.agreementScope, page, section,
  };
}

export function addConfirmedNonmemberDamageMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function apply(productId: string, version: string | null, documentId: string, sha256: string,
    rows: ReviewedRow[], component = productId) {
    const source = sources[documentId];
    if (source?.sha256 !== sha256 || !products.some(product => product.productId === productId &&
      product.version === version && product.sourceId === documentId && product.componentIds?.includes(component))) return;
    const keys = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...(facts[component] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, page, section, options]) => ({
        key, label, value, source: citation(source, page, section), ...options,
      })),
    ];
  }

  const fremtindCabinHash = "573d65c0883e6fe680d3ae0341d4ca947125e71be137f1cc130faba76252a361";
  const fremtindStandard = sources["cabin:fremtind:standard"];
  if (fremtindStandard?.sha256 === fremtindCabinHash && fremtindStandard.termsNumber === "PBK-200.100-015") {
    apply("fremtind-hytte-topp", "2023-03-15", "cabin:fremtind:topp", fremtindCabinHash, [[
      "hytte.handverker.egenandel", "Håndverker- og entreprenørfeil – egenandel",
      "Egenandelen står i forsikringsbeviset eller følger Standard-vilkårets punkt 6.", 2, "4 Egenandel",
      { deductibleClassification: "reference", qualificationSource: citation(fremtindStandard, 7, "6 Egenandel") },
    ]]);
  }

  for (const level of ["standard", "utvidet"]) {
    const id = "frende-hytte-" + level;
    apply(id, "2026-11-20", "cabin:frende:building:2026-11-20",
      "e07aad93b1702ad0e9cadce89bd6b3d9237431c2510dff6a930e5abd4b5d3358", [[
        "hytte.tilpasning.dekning", "Ombygging for rullestolbruker",
        "Ombygging for rullestolbruker etter dette punktet gjelder bare boligen sikrede bor fast i. En fritidsbolig som ikke er fast bolig, omfattes ikke.",
        4, "4.5 Kostnader til ombygging av bolig for rullestolbruker", unavailable,
      ]], id + ":2026-11-20");
  }

  apply("frende-reiseforsikring", "2026-03-01", "frendeReiseTerms",
    "a15cb9cf2a1cba6c17eb62f3793cc5f664724f66780ebb692b93775f3f922509", [[
      "reise.forsinkelse.avgang_sum", "Forsinket avgang – grense",
      "Ingen beløpsgrense for nødvendige merutgifter til å innhente reiseruten. Nødvendig overnatting dekkes inntil 6 000 kr per person. Ved forsinkelse eller kansellering av forhåndsbestilt offentlig transport pga. vær eller teknisk feil må transportøren være ute av stand til å tilby ny reise innen 24 timer. Ny reise og overnatting må først kreves av reiseselskapet eller transportøren.",
      4, "4.2 Forsinket avgang",
    ]], "frendeReiseCoverage");

  const ifTravelHash = "1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566";
  apply("if-reise-basis", "2026-09-20-canonical", "ifReiseTerms", ifTravelHash, [[
    "reise.bagasje.pass_billetter", "Pass og reisedokumenter", "Dekningen for pass i punkt 4.2.8 inngår i Standard og Super.",
    2, "Produktoversikt – Personlige eiendeler", unavailable,
  ]], "ifReiseBasis");
  apply("if-reise-standard", "2026-09-20-canonical", "ifReiseTerms", ifTravelHash, [[
    "reise.bagasje.pass_billetter", "Pass og reisedokumenter",
    "Rimelige og nødvendige utgifter til å erstatte skadet eller tapt pass og innhente fastlagt reiserute, når passet er skadet eller tapt av en årsak i punkt 4.2.1–4.2.6.",
    10, "4.2.8 Skadet eller tapt pass", { ...included, replacesBase: true },
  ]], "ifReiseStandard");

  for (const [id, component, documentId, sha256, pluss] of [
    ["gjensidige-reise", "gjensidigeReise", "gjensidigeReiseTerms", "dcf6dfd6c62112d634019ce0cd12793dc8009fba7fda527359da2a7828a37a82", false],
    ["gjensidige-reise-pluss", "gjensidigeReisePluss", "gjensidigeReisePlussTerms", "97823ecfea0e62a98965bc51ebaac61ee05f3b42766333f959cf2c29ceacea04", true],
  ] as const) {
    apply(id, "2026-09-20-canonical", documentId, sha256, [[
      "reise.bagasje.pass_billetter", "Pass og reisedokumenter",
      "Reisegodsdekningen omfatter gjenanskaffelse av reisedokumenter eller pass på reisen. Ved forsinkelse etter tap av dokumentene omfattes også merutgifter til å innhente en forhåndsbetalt reise.",
      5, "Hva er forsikret? – Reisegods, reisedokumenter/pass", { ...included, replacesBase: pluss },
    ]], component);
  }

  for (const level of ["standard", "elite"]) {
    apply("watercircles-reise-" + level, "WtCREI-2.17", "watercircles-reise",
      "70291d41311f5d5e5f407866b91ed1eb0291a36e1cfc1ea190aa127261756128", [[
        "reise.ulykke.behandling", "Behandlingsutgifter etter ulykke",
        "Nødvendige behandlingsutgifter i Norge de første to årene etter ulykkesskaden, dersom utgiftene ikke kan kreves erstattet av andre. Grensen er 5 % av forsikringssummen ved medisinsk invaliditet. Etter fylte 70 år dekkes inntil 5 000 kr. For barn under 18 år kan første permanente tannbehandling forhåndsgodkjennes også ved utsettelse på grunn av alder, med oppgjør senest ti år etter utgangen av skadeåret.",
        12, "6.2 Behandlingsutgifter og 6.3 a Alder", included,
      ]]);
  }

  for (const [level, file, hash, legalPage] of [
    ["ansvar", "snoscooter-ansvar", "5c7e634313b96147b294cfa18ef6edf6e3f8c8e668dd2e1ea2ecead56b34e8be", 7],
    ["delkasko", "Snoscooter-Delkasko", "ac376b33b1d9c90d82c2a478f9336eb7b09122a96a4bc90022d3432b0f9ce27b", 8],
    ["kasko", "Snoscooter-Kasko", "ba089fbe156e6f025971d3ab7ef6d78d9a6832d4bfac0af6743b1fa5494d47b4", 8],
  ] as const) {
    const rows: ReviewedRow[] = [
      ["snoscooter.rettshjelp.grense", "Rettshjelp – forsikringssum",
        "Erstatningen begrenses av forsikringsbeviset og den økonomiske interessen i saken. Ved flere parter forsikret i Gjensidige på samme side viser vilkåret disse grensene per tvist: 100 000 kr for 1–2 parter, 250 000 kr for 3–10, 500 000 kr for 11–25, 750 000 kr for 26–49 og 1 000 000 kr ved minst 50.",
        legalPage, "Rettshjelp – Forsikringssum og egenandel"],
      ["snoscooter.rettshjelp.egenandel", "Rettshjelp – egenandel",
        "4 000 kr pluss 20 % av de dekkede utgiftene. Én egenandel per tvist. Ved utenrettslig mekling via Mekle.no er egenandelen 0 kr.",
        legalPage, "Rettshjelp – Forsikringssum og egenandel", { deductibleClassification: "coverage" }],
    ];
    if (level !== "ansvar") rows.push(
      ["snoscooter.brann.egenandel", "Brann – egenandel", "6 000 kr i det offentlige vilkårseksempelet. Forsikringsbeviset går foran.",
        1, "Forsikringsbevis – Brann og tyveri", { deductibleClassification: "standard" }],
      ["snoscooter.tyveri.egenandel", "Tyveri – egenandel", "6 000 kr i det offentlige vilkårseksempelet. Forsikringsbeviset går foran.",
        1, "Forsikringsbevis – Brann og tyveri", { deductibleClassification: "standard" }],
    );
    apply("gjensidige-snoscooter-" + level, null, "vehicle:gjensidige-" + file + "-alminnelige-vilkar.pdf", hash, rows);
  }

  const campingTerms = "vehicle:fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf";
  const campingHash = "b858b6444a8dce7b9a6cf184b5e69ebe85eea2a1a1471f39712807a06986dc9a";
  const theft = "Når kjøretøyet ikke er kommet til rette etter 21 dager, beregnes erstatningen etter markedsverdien på skadedagen. Kommer kjøretøyet til rette før utbetaling, faller erstatningsavtalen bort. Etter utbetaling tilfaller det selskapet, men sikrede kan kjøpe det tilbake ved skriftlig beskjed og tilbakebetaling innen 21 dager fra selskapets melding.";
  for (const [kind, level] of [["campingvogn", "minikasko"], ["tilhenger", "kasko"]] as const) {
    apply("eika-fremtind-" + kind + "-" + level, "2024-03-21", campingTerms, campingHash, [[
      kind + ".tyveri.oppgjor", "Tyveri – erstatningsoppgjør", theft, 3, "Minikasko 3.4 Erstatningsregler ved tyveri",
    ]]);
  }
  apply("eika-fremtind-tilhenger-kasko", "2024-03-21", campingTerms, campingHash, [
    ["tilhenger.kasko.dekning", "Kasko", "Skade ved sammenstøt, utforkjøring, velt eller annen tilfeldig, plutselig ytre påvirkning.",
      4, "Kasko 1.1 Kaskoskader", included],
    ["tilhenger.kasko.begrensning", "Kasko – begrensninger", "Skade ved ervervsmessig bruk er unntatt. Skade på tilhengeren som skyldes gods eller andre gjenstander som fraktes med den, dekkes bare når skaden følger av en annen erstatningsmessig skade.",
      4, "Kasko 1.1 Kaskoskader – Dekkes ikke"],
  ]);

  for (const level of ["delkasko", "kasko", "toppkasko"]) {
    apply("sparebank1-fremtind-bat-" + level, "2024-06-10", "boat-pet:sparebank1-fremtind:båt",
      "1364fc8bde39923ea1e9f0f36a9d9abf5596721958114b93485b5c730d70669f", [
        ["bat.transport.dekning", "Transport til verksted etter skade", "Nødvendig transport av båten til nærmeste verksted som kan reparere en dekket skade.",
          2, "Minikasko 2.4 Transport", included],
        ["bat.redning.hjemtransport.dekning", "Hjemtransport av båten", "Hjemtransport dekkes når båten blir funnet igjen etter et tyveri.",
          2, "Minikasko 2.4 Transport", included],
        ...(level === "delkasko" ? [] : [[
          "bat.ferieavbrudd.dekning", "Ferieavbrudd",
          "Dagsbeløp for utgifter til leiebåt, leiebil eller losji når en dekket skade gjør at en planlagt ferietur på mer enn tre dager ikke kan gjennomføres. Utbetaling begrenses til normal reparasjonstid og må godkjennes på forhånd. Utgiftene må dokumenteres.",
          6, level === "kasko" ? "Kasko 2.2 Erstatning ved avbrutt ferietur" : "Toppkasko 2.1 Erstatning ved avbrutt ferietur (fortsetter på PDF-side 7)", included,
        ] as const]),
        ["bat.redning.bergelonn", "Bergelønn", "Bergelønn erstattes med beløpet Fremtind beregner etter gjeldende lovverk.",
          2, "Minikasko 2.6 Bergelønn", included],
        ["bat.vrakfjerning.grense", "Vrakfjerning", "Utgifter til vrakfjerning ved en dekket skade erstattes når fjerningen er pålagt av offentlig myndighet.",
          2, "Minikasko 2.7 Fjerning av vrak", included],
        ["bat.rettshjelp.grense", "Rettshjelp – forsikringssum", "Inntil 100 000 kr per tvist, begrenset til sikredes økonomiske interesse. Ved minst tre parter på samme side kan grensen økes til 250 000 kr. Ektefeller eller samboere i samme tvist regnes som én part.",
          11, "Rettshjelp 5.1 Erstatningsberegning"],
        ["bat.rettshjelp.egenandel", "Rettshjelp – egenandel", "Beløpet i forsikringsbeviset pluss 20 % av utgiftene til advokat og sakkyndig bistand. Én egenandel per tvist, også ved flere parter på samme side.",
          11, "Rettshjelp 5.2 Egenandel", { deductibleClassification: "coverage" }],
      ]);
  }

  for (const [species, hash] of [
    ["hund", "5897fd60318410bdc5481e12d4cd6454e7fe4741682a13e5289991f211b7d9f7"],
    ["katt", "91385b8b466923a5ca1c37d8f53781c5af3f63e3f6e037afae367f4399b75286"],
  ] as const) {
    for (const level of ["veterin-r", "veterin-r-og-d-dsfall"]) {
      apply("storebrand-" + species + "-" + level, "2025-02-01", "boat-pet:storebrand:" + species,
        "b236f856380b8010c7439765ea72a88d076e5d387d4653a7f033980892732591", [
          ["dyr.veterinar.avliving", "Avliving – veterinærdekning",
            "Veterinæranbefalt avliving av dyrevernhensyn dekkes til og med forsikringsåret dyret fyller 10 år, innenfor avtalt årlig veterinærsum.",
            6, "B.4.1 nr. 7 Avlivning", included],
          ["dyr.veterinar.kremering.grense", "Kremering – forsikringssum",
            "Kremering etter erstatningsmessig dødsfall omfattes. Ved separat kremering er grensen 1 500 kr.",
            6, "B.4.1 nr. 8 Kremering"],
          ["dyr.fodsel.dekning", "Keisersnitt og fødselshjelp",
            "Keisersnitt eller fødselshjelp én gang i dyrets liv, inntil avtalt veterinærsum. Tilsvarende veterinærforsikring må ha vært i kraft i minst ett år ved behandling. Dyret kan ikke ha hatt to eller flere keisersnitt tidligere. Vilkåret stiller krav til parringen og har unntak for angitte hunderaser.",
            4, "B.4.1 nr. 2 Keisersnitt eller fødselshjelp (fortsetter på PDF-side 5)", included],
        ]);
    }
    const id = "boat-pet:sparebank1-fremtind:" + species;
    const source = sources[id];
    if (source?.sha256 !== hash) continue;
    apply("sparebank1-fremtind-" + species + "-veterin-r", "2025-08-07", id, hash, [[
      "dyr.veterinar.avliving", "Avliving – veterinærdekning",
      "Inntil 2 000 kr samlet til avliving og kremering. Avliving må skje forsvarlig av dyrevernhensyn. Veterinærattest kreves når undersøkelse og eventuell behandling ikke fører frem og dyret må avlives.",
      1, "Veterinærutgifter", { ...included, qualificationSource: citation(source, 2, "Avliving") },
    ]]);
  }
}
