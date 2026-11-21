import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Document = readonly [id: string, hash: string, termsNumber: string, effectiveFrom: string];
type Row = readonly [key: string, label: string, value: string, page: number];

const ifMotor: Document = ["vehicle:if-Vilkaar-4103ea25.pdf",
  "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987", "MOT2-2", "2024-03"];
const ifCaravan: Document = ["vehicle:if-SV707.pdf",
  "a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e", "SV707", "2022-06"];
const storebrand: Document = ["vehicle:storebrand-vilkar-campingvogn-og-tilhenger.pdf",
  "fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8", "camp02", "2026-03-01"];
const trygKasko: Document = ["vehicle:tryg-odpdf-f862c645.pdf",
  "44633a6fb75be6d3a8b1b8a85a4c3ee5fbaf09a4f3e58e37c74d9304d07d403e", "PAU25255", "2026-01-01"];
const trygExtra: Document = ["vehicle:tryg-odpdf-d09fac80.pdf",
  "e046a62bec7a85adccd901d51b391e653cdb2e86bc6891b186694adba4bcf726", "PAU27016", "2025-07-01"];

const gjensidigeDocuments = [
  ["delkasko", "Campingvogn-Delkasko", "aac62443966b522b04903f765eb31376b8a48cddd39d14781d447bcaa82677de", 3, 3],
  ["kasko", "Campingvogn-Kasko", "fb61c6696cbf3a12067cef1b71f73b6562c37495151268fe769d4520b7ac4194", 4, 4],
  ["pluss", "Campingvogn-Pluss", "129827ede6156025a74dae49392e2744eebff0d0e42a30a08e9b1449859365ca", 3, 4],
] as const;

const towingKey = "campingvogn.redning.dekning";
const homeKey = "campingvogn.redning.hjemtransport.dekning";
const homeRestrictionsKey = "campingvogn.redning.hjemtransport.begrensning";
const fixedSiteKey = "campingvogn.redning.fast_plass.grense";
const fixedSiteLabel = "Frigjøring og transport fra fast plass – beløpsgrense";
const homeLabel = "Hjemtransport av campingvognen";

export function addVerifiedCaravanMarketEvidence(
  sources: Readonly<Record<string, CatalogSource>>, facts: Record<string, CatalogFact[]>,
  products: readonly CatalogProduct[],
): void {
  function verified(productId: string, version: string | null, base: Document, evidence = base) {
    const product = products.find(entry => entry.productId === productId && entry.insuranceType === "Campingvogn" &&
      entry.version === version && (entry.agreementScope ?? "ordinary") === "ordinary" &&
      entry.sourceId === base[0] && entry.componentIds?.includes(productId));
    if (!product || !facts[productId]) return;
    for (const [id, hash, termsNumber, effectiveFrom] of [base, evidence]) {
      const source = sources[id];
      if (source?.id !== id || source.sha256 !== hash || source.termsNumber !== termsNumber ||
        source.effectiveFrom !== effectiveFrom || (source.agreementScope ?? "ordinary") !== "ordinary" ||
        (source.productIds && !source.productIds.includes(productId))) return;
    }
    return sources[evidence[0]];
  }

  function apply(productId: string, source: CatalogSource, section: string, rows: readonly Row[], removedKey?: string) {
    const component = facts[productId];
    const updated = new Set(rows.map(([key]) => key));
    facts[productId] = [
      ...component.filter(row => row.key !== removedKey && !updated.has(row.key)),
      ...rows.map(([key, label, value, page]) => ({
        key, label, value, source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, version: source.version,
          agreementScope: source.agreementScope, page, section },
      })),
    ];
  }

  function holiday(productId: string, source: CatalogSource, page: number, section: string, duration: string) {
    apply(productId, source, section, [
      ["campingvogn.ferie.dagsbelop", "Ferieavbrudd – beløp per dag", "Inntil 1 500 kr per dag.", page],
      ["campingvogn.ferie.dager", "Ferieavbrudd – antall dager", duration, page],
    ], "campingvogn.ferie.grense");
  }

  for (const [tier, name, hash, homePage, restrictionPage] of gjensidigeDocuments) {
    const id = "gjensidige-campingvogn-" + tier;
    const source = verified(id, null, ["vehicle:gjensidige-" + name + "-alminnelige-vilkar.pdf", hash, "", ""]);
    if (!source) continue;
    apply(id, source, "Forsikringsbevis – Hvilke utgifter? Veihjelp", [
      [towingKey, "Redning og veihjelp", "Berging eller tauing til nærmeste verksted ved skade, utelåsing, tyveri eller annen driftsstans, når campingvognen står på vei og var kjørbar før skaden.", 3],
      [homeKey, homeLabel, "Dekker hjemtransport ved avbrutt reise på grunn av ulykke, sykdom eller død hos fører eller passasjerer i trekkvognen. Dekker også hjemtransport når campingvognen er gjenfunnet etter tyveri eller ikke kan repareres innen to virkedager.", homePage],
      [homeRestrictionsKey, homeLabel + " – begrensninger", "Hjemtransport dekkes ikke hvis fører eller passasjer kan kjøre hjem, eller hvis utgiftene dekkes av trekkvognens veihjelp i et annet selskap.", restrictionPage],
      ["campingvogn.redning.begrensning", "Veihjelp – begrensninger", "Merutgiftene er begrenset til campingvognens verdi. Ordinære reiseutgifter, reparasjon og deler, videresending av gods og skader som andre svarer for etter lov, forskrift, garanti eller reklamasjonsrett, er unntatt.", 3],
    ]);
    apply(id, source, "Forsikringsbevis – Hvilke utgifter? Veihjelp", [
      ["campingvogn.redning.konkurranse.begrensning", "Veihjelp – hastighetsløp", "Veihjelp omfatter ikke hastighetsløp eller lignende på avsperret område, med unntak for opplæring til førerkort.", restrictionPage],
    ]);
    if (tier === "pluss") holiday(id, source, 4, "Feriegaranti – kompensasjon for avbrutt ferie", "Inntil 14 dager.");
  }

  for (const tier of ["brann-og-tyveri", "kasko", "super"]) {
    const id = "storebrand-campingvogn-" + tier;
    const source = verified(id, "2026-03-01", storebrand);
    if (!source) continue;
    const currentTowing = facts[id].find(row => row.key === towingKey);
    if (currentTowing) {
      const shortened = currentTowing.value.replace(" For campingvogn på fast sted dekkes inntil 5 000 kr for transport til kjørbar vei og frigjøring fra bygningskonstruksjon.", "");
      facts[id] = facts[id].map(row => row === currentTowing ? { ...row, value: shortened } : row);
    }
    apply(id, source, "6.1.3 Veihjelp", [[fixedSiteKey, fixedSiteLabel,
      "Inntil 5 000 kr samlet for å frigjøre campingvognen fra en bygningskonstruksjon og transportere den til kjørbar vei etter skade på fast plass.", 6]]);
    if (tier !== "brann-og-tyveri") apply(id, source, "6.2 Kaskoforsikring", [[
      "campingvogn.naturskade.dekning", "Naturskade", "Naturskade på campingvognen er omfattet av kaskodekningen.", 6,
    ]]);
    if (tier === "super") holiday(id, source, 8, "6.3.3 Feriegaranti", "Resterende planlagte feriedager, inntil 15 dager.");
  }

  const ifBaseId = "if-campingvogn-delkasko";
  const ifSource = verified(ifBaseId, "2024-03", ifMotor);
  const ifCoverage = facts[ifBaseId]?.find(row => row.key === towingKey);
  if (ifSource && ifCoverage) {
    facts[ifBaseId] = facts[ifBaseId].map(row => row === ifCoverage ? {
      ...row,
      value: "Veihjelp ved blant annet dekket skade, tyveri eller upåregnelig driftsstans. Nødvendig berging til nærmeste egnede verksted, eller rimeligere nødreparasjon på stedet. Veien eller stedet må være normalt fremkommelig uten adkomstrestriksjoner. Ifs produktoversikt oppgir også transport av reservedeler.",
    } : row);
    apply(ifBaseId, ifSource, "4.7.1 Hjemtransport av kjøretøyet, jf. 4.7.3 og 4.7.4", [
      [homeKey, homeLabel, "Dekker rimeligste hjemtransport ved gjenfunn etter tyveri, eller etter ferdig reparasjon når vognen måtte etterlates på grunn av omfattende skade eller fordi den ikke kunne settes i trafikksikker stand innen tre dager. Dekker også hvis vognen må etterlates på grunn av plutselig sykdom, personulykke eller dødsfall hos fører eller passasjer. If skal varsles på forhånd når vognen må settes igjen.", 6],
      ["campingvogn.redning.grense", "Veihjelp – transportgrense", "Transportkostnader som overstiger 50 % av campingvognens verdi i den stand den er på transporttidspunktet, er unntatt.", 6],
    ]);
  }

  const ifId = "if-campingvogn-super";
  const ifSpecial = verified(ifId, "2024-03", ifMotor, ifCaravan);
  if (ifSpecial) {
    apply(ifId, ifSpecial, "2.1 Transport etter skade", [[fixedSiteKey, fixedSiteLabel,
      "Inntil 5 000 kr samlet for å frigjøre campingvognen fra bygningskonstruksjon eller lignende og transportere den til kjørbar vei etter en dekket skade.", 2]],
      "campingvogn.redning.grense");
    holiday(ifId, ifSpecial, 3, "3.3.2 Feriegaranti", "Resterende planlagte feriedager, inntil 15 dager.");
  }

  const trygId = "tryg-campingvogn-campingvogn-ekstra";
  const tryg = verified(trygId, "2026-01-01", trygKasko, trygExtra);
  if (tryg) holiday(trygId, tryg, 1, "Avbrutt ferie", "Resterende planlagte feriedager, inntil 14 dager.");
}
