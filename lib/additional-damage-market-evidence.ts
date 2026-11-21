import { addConfirmedNonmemberDamageMarketEvidence } from "./confirmed-nonmember-damage-market-evidence.ts";
import { addStorebrandBoatBobilMarketEvidence } from "./storebrand-boat-bobil-market-evidence.ts";
import { addVerifiedDamageFollowupMarketEvidence } from "./verified-damage-followup-market-evidence.ts";
import { addVerifiedValuablesMarketEvidence } from "./verified-valuables-market-evidence.ts";
import { addVerifiedTrailerMarketEvidence } from "./verified-trailer-market-evidence.ts";
import { addVerifiedSnowmobileMarketEvidence } from "./verified-snowmobile-market-evidence.ts";
import { addVerifiedPetMarketEvidence } from "./verified-pet-market-evidence.ts";
import { addVerifiedInnboMarketEvidence } from "./verified-innbo-market-evidence.ts";
import { addVerifiedBilAccessoryMarketEvidence } from "./verified-bil-accessory-market-evidence.ts";
import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type MarketEdition = { products: CatalogProduct[]; addOns: CatalogAddOn[] };
type ReviewedRow = readonly [key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification" | "qualificationSource" | "replacesBase">];

const frendeEditionDate = "2026-11-20";
const frendePetTermsUrl = "https://api.frende.no/documents/terms/public/pnc/PetInsurance?type=";
const frendePetDocuments = [
  ["hund", "Hund", "6d052e5092d9f92050dcf95a92fa6ce5deda18a5825cdd00ca1c8cd2658c9135", "f3d8705de77e48544b28a1939950ebababdd86eb3450bd33260fd73080bd1657", 5],
  ["katt", "Katt", "5c7791b59cf84da6ef475020f997bac1cc13a865777bdc791b2c3f7ba4b4fe6b", "72a9cc4d780af483eec974a6787cf96f7fa0281803fd7d68eb74c0bc723fc467", 4],
] as const;

const currentEdition = (id: string) => id + ":" + frendeEditionDate;
const frendePetDocumentId = (species: string) => "boat-pet:frende:" + species;
const frendePetFilename = (species: string) => "frende-" + species + "-20112026.pdf";

export const additionalDamageMarketArchives = frendePetDocuments.map(([species]) => ({
  provider: "frende",
  slug: species + "-" + frendeEditionDate,
  archivePath: "catalog/sources/frende/2026-11-20/" + frendePetFilename(species),
  sources: [[currentEdition(frendePetDocumentId(species)), frendeEditionDate, frendePetTermsUrl + species] as const],
}));

const included = { coverageAvailability: "included" } as const;

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  return {
    documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
    effectiveFrom: source.effectiveFrom, company: source.company, url: source.url,
    productCode: source.productCode, version: source.version, agreementScope: source.agreementScope, page, section,
  };
}

function upsertRows(facts: Record<string, CatalogFact[]>, component: string, source: CatalogSource, rows: ReviewedRow[]) {
  const keys = new Set(rows.map(([key]) => key));
  facts[component] = [
    ...(facts[component] ?? []).filter(fact => !keys.has(fact.key)),
    ...rows.map(([key, label, value, page, section, options]) => ({ key, label, value, source: cite(source, page, section), ...options })),
  ];
}

function updateReference(facts: Record<string, CatalogFact[]>, component: string, documentId: string,
  keys: string[], page: number, section: string, values: Record<string, string> = {}) {
  facts[component] = facts[component].map(row => keys.includes(row.key) && row.source.documentId === documentId
    ? { ...row, value: values[row.key] ?? row.value, source: { ...row.source, page, section } }
    : row);
}

function addFrendePetMarketTerms(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  for (const [species, insuranceType, previousHash, sha256, pages] of frendePetDocuments) {
    const previousId = frendePetDocumentId(species);
    const previous = sources[previousId];
    const productId = "frende-" + species + "-veterin-r";
    const product = market.products.find(entry => entry.productId === productId);
    const dog = species === "hund";
    const previousUrl = "https://www.frende.no/forsikringer/" + (dog ? "hunde" : "katte") + "forsikring/";
    if (previous?.sha256 !== previousHash || previous.effectiveFrom !== "2026-01-01" ||
      previous.url !== previousUrl || product?.sourceId !== previousId ||
      product.version !== previous.effectiveFrom || !product.componentIds?.includes(productId)) continue;

    const source: CatalogSource = {
      ...previous, id: currentEdition(previousId), filename: frendePetFilename(species),
      effectiveFrom: frendeEditionDate, version: frendeEditionDate, productVersion: frendeEditionDate,
      productIds: [productId], documentName: "Vilkår for " + (dog ? "hunde" : "katte") + "forsikring",
      physicalPages: [1, pages], sha256, url: frendePetTermsUrl + species,
    };
    sources[source.id] = source;
    const selectedAddOns = market.addOns.filter(addOn => addOn.providerId === "frende" &&
      addOn.insuranceTypes?.includes(insuranceType) && addOn.requiresLevel?.includes(productId));
    const components = new Set([...product.componentIds, ...selectedAddOns.map(addOn => addOn.componentId)]);
    function currentReference(reference: CatalogFact["source"]) {
      return reference.documentId === previousId ? { ...reference, ...cite(source, reference.page, reference.section) } : reference;
    }
    for (const component of components) {
      facts[currentEdition(component)] = (facts[component] ?? []).map(row => ({
        ...row, source: currentReference(row.source),
        ...(row.qualificationSource && { qualificationSource: currentReference(row.qualificationSource) }),
      }));
    }
    market.products = market.products.map(entry => entry === product ? {
      ...product, version: frendeEditionDate, sourceId: source.id, componentIds: product.componentIds?.map(currentEdition),
    } : entry);
    market.addOns = market.addOns.map(addOn => selectedAddOns.includes(addOn)
      ? { ...addOn, componentId: currentEdition(addOn.componentId) } : addOn);

    const vet = currentEdition(productId);
    const tap = currentEdition("frende-" + species + "-tap");
    const medisin = currentEdition("frende-" + species + "-medisin");
    const allergySection = dog ? "4.1 nr. 4 og 4.2 nr. 5 (fortsetter på PDF-side 3)" : "4.1 nr. 2 og 4.2 nr. 5";
    const allergy = "Første diagnostisering og behandling av allergi eller atopi. Symptomer på øre- eller hudlidelser før kjøp eller de første 20 dagene etter kjøp er unntatt. Antistoffer påvist før tre måneder regnes som allergi påbegynt før kjøp.";
    updateReference(facts, vet, source.id, ["dyr.allergi.grense"], 2, allergySection);
    updateReference(facts, vet, source.id, ["dyr.karenstid.sykdom"], dog ? 3 : 2, dog ? "4.2 nr. 12" : "4.2 nr. 9");
    updateReference(facts, vet, source.id, ["dyr.veterinar.begrensning"], 2, dog
      ? "4.2 nr. 1–4, 6–11 og 13 (fortsetter på PDF-side 3)" : "4.2 nr. 1–4, 6–8 og 10 (PDF-side 2–3)");
    if (dog) facts[vet] = facts[vet].map(row => {
      if (row.key === "dyr.veterinar.begrensning") return { ...row, value: row.value.replace("4.2.7–9", "4.2 nr. 8–10") };
      if (row.key === "dyr.veterinar.sum.valgbar" && row.qualificationSource?.documentId === source.id) {
        return { ...row, qualificationSource: cite(source, 2, "4.1, jf. 8.4 på PDF-side 4") };
      }
      return row;
    });

    upsertRows(facts, vet, source, [
      ["dyr.veterinar.avliving", "Avliving – veterinærdekning", "Inntil 2 000 kr til avliving og kremering av dyr som er høyst 10 år, når Frende har erstattet ulykken eller sykdommen.", 2, dog ? "4.1 nr. 7" : "4.1 nr. 4", included],
      ["dyr.allergi.dekning", "Utredning og behandling av allergi", allergy, 2, allergySection, included],
      ["dyr.veterinar.geografi", "Veterinærforsikring – område", "Hele verden.", 2, "2 Hvor og når forsikringen gjelder"],
      ...(!dog ? [["dyr.veterinar.sum.valgbar", "Veterinærutgifter – forsikringssum", "Forsikringssummen i beviset gjelder per skadetilfelle og samlet per forsikringsår. Samlet erstatning for veterinær- og medisinutgifter per skadetilfelle er begrenset til samme sum også når utgiftene kommer over flere år.", 2, "4.1, jf. 7.4 på PDF-side 3"] as const] : []),
    ]);
    upsertRows(facts, medisin, source, [
      ["dyr.medisin.grense", "Medisinutgifter – forsikringssum", "Når tillegget Medisin er avtalt: Inntil 20 000 kr per skadetilfelle og samlet per forsikringsår.", 3, dog ? "6 Medisinutgifter" : "5 Medisinutgifter"],
    ]);
    upsertRows(facts, tap, source, [
      ["dyr.liv.reduksjon.sats", "Tap av dyret – aldersfradrag", "20 % fradrag for hvert hele år dyret er eldre enn 7 år.", dog ? 5 : 4, dog ? "8.5 Aldersfradrag" : "7.5 Aldersfradrag"],
      ["dyr.liv.geografi", "Dødsfall og tap av dyret – område", "Hele verden.", 2, "2 Hvor og når forsikringen gjelder"],
    ]);
    if (dog) {
      upsertRows(facts, tap, source, [[
        "dyr.liv.forsvinning", "Tyveri og forsvinning av dyret",
        "Tillegget Tap dekker tyveri eller forsvinning. Ved forsvinning kan erstatning tidligst utbetales tre måneder etter at hunden ble meldt savnet til Frende og politiet.", 3,
        "7.1 nr. 2, jf. 8.4 på PDF-side 4",
      ]]);
    } else {
      // The claims provision describes disappearance, while the coverage grant
      // lists death, euthanasia and burglary. Keep the scope question visible.
      facts[tap] = facts[tap].filter(row => row.key !== "dyr.liv.forsvinning");
      upsertRows(facts, tap, source, [[
        "dyr.liv.dekning", "Dødsfall og tap av dyret",
        "Tillegget Tap må stå i forsikringsbeviset. Det dekker dødsfall eller avliving av dyrevernhensyn etter ulykke eller sykdom, og tyveri ved innbrudd i bygning.", 3, "6 og 6.1",
      ]]);
      facts[tap] = facts[tap].map(row => row.key === "dyr.liv.begrensning" ? {
        ...row,
        value: row.value + ". Punkt 7.4 oppgir tidligst utbetaling tre måneder etter savnetmelding til Frende og politiet. Det er uavklart om dette også gir dekning ved forsvinning uten innbrudd, siden punkt 6.1 bare oppgir tyveri ved innbrudd.",
        source: cite(source, 3, "6.1, 6.2 og 7.4"),
      } : row);
    }
  }
}

function correctFrendeMotorRows(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  const reviewedProducts = [
    ["frende-bil-kasko", "frendeKasko"], ["frende-bil-utvidet", "frendeUtvidet"],
    ...["ansvar", "delkasko", "kasko"].map(level => ["frende-mc-" + level, "mcb-ff-frende-mc-terms"]),
    ...["ansvar", "delkasko", "kasko", "utvidet"].map(level => ["frende-bobil-" + level, "mcb-ff-frende-bobil-terms"]),
  ];
  for (const [productId, id] of reviewedProducts) {
    const product = market.products.find(entry => entry.productId === productId && entry.version === frendeEditionDate);
    const source = sources[currentEdition(id)];
    const component = product?.componentIds?.[0];
    if (!component || !facts[component] || source?.sha256 !== "952f1c99f91e457ade95a7279f16c1c73e2f2575f92197f16a9d6b398985a9e7" ||
      source.effectiveFrom !== frendeEditionDate) continue;
    updateReference(facts, component, source.id, ["rettshjelp.geografi"], 2, "2 Hvor forsikringen gjelder");
    updateReference(facts, component, source.id, ["kasko.egenandel"], 8, "11.11 Egenandel – vogndekninger");
    const price = "Reparasjonen koster mer enn 80 % av listeprisen for en ny bil.";
    const keys = ["nyverdi.dekning", "nyverdi.alder", "nyverdi.km", "nyverdi.skadegrad"];
    if (productId.endsWith("-kasko")) {
      updateReference(facts, component, source.id, keys, 3, "6.1, jf. 11.7 på PDF-side 8", {
        "nyverdi.alder": "Ikke eldre enn 1 år på skadedato", "nyverdi.skadegrad": price,
      });
    } else if (productId.endsWith("-utvidet")) {
      updateReference(facts, component, source.id, keys, 4, "8.1 Ny bil ved totalskade", {
        "nyverdi.alder": "Ikke eldre enn 3 år på skadedato", "nyverdi.skadegrad": price,
      });
    }
  }
}

function addStorebrandPetRows(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  for (const [species, months] of [["hund", 3], ["katt", 6]] as const) {
    const source = sources["boat-pet:storebrand:" + species];
    if (source?.sha256 !== "b236f856380b8010c7439765ea72a88d076e5d387d4653a7f033980892732591" ||
      source.effectiveFrom !== "2025-02-01" || source.termsNumber !== "dyr04") continue;
    for (const level of ["veterin-r", "d-dsfall", "veterin-r-og-d-dsfall"]) {
      const component = "storebrand-" + species + "-" + level;
      if (!market.products.some(product => product.productId === component && product.sourceId === source.id &&
        product.version === source.effectiveFrom && product.componentIds?.includes(component))) continue;
      if (level.includes("veterin-r")) upsertRows(facts, component, source, [[
        "dyr.veterinar.geografi", "Veterinærforsikring – område", "Sykdom og ulykke som oppstår i Europa.", 3, "B.1.2 Hvor forsikringen gjelder",
      ]]);
      if (level.includes("d-dsfall")) upsertRows(facts, component, source, [
        ["dyr.liv.forsvinning", "Tyveri og forsvinning av dyret", "Tyveri eller forsvinning må meldes til Storebrand og politiet, og dyret må etterlyses ved annonsering. Dyret regnes som tapt " + months + " måneder etter savnetmelding.", 9, "B.5.1 punkt 1", included],
        ["dyr.liv.geografi", "Dødsfall og tap av dyret – område", "Hele verden.", 3, "B.1.2 Hvor forsikringen gjelder"],
        ["dyr.liv.egenandel", "Dødsfall og tap av dyret – egenandel", species === "hund" ? "Ingen egenandel under dødsfallsforsikringen, inkludert nedsatt bruksverdi." : "Ingen egenandel under dødsfallsforsikringen.", 3, "B.3 Egenandel", { deductibleClassification: "coverage" }],
        ...(species === "hund" ? [
          ["hund.bruksverdi.alder", "Nedsatt bruksverdi – opphørsalder", "Dekningen opphører når hunden fyller 7 år.", 9, "B.5.1 punkt 2"],
          ["hund.bruksverdi.begrensning", "Nedsatt bruksverdi – begrensninger", "Varig tap av bruksverdi som følge av dekket sykdom eller ulykkesskade må attesteres av veterinær. Erstatning kan utbetales én gang i hundens liv.", 9, "B.5.1 punkt 2"],
        ] satisfies ReviewedRow[] : []),
      ]);
    }
  }
}

function addGjensidigeCabinAdaptations(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  for (const [level, hash] of [
    ["standard", "c9a0bca16a12a512242e7192781a4b3fafc56f7fdb6e9e549c200bea40012ab0"],
    ["pluss", "034e140e2951f2c8ac113dcb2e2571ab164c3a21c3c41c76f31f43850c99a758"],
  ] as const) {
    const source = sources["cabin:gjensidige:" + level];
    const component = "gjensidige-hytte-" + level;
    if (source?.sha256 !== hash || !market.products.some(product => product.productId === component &&
      product.sourceId === source.id && product.version === null && product.componentIds?.includes(component))) continue;
    upsertRows(facts, component, source, [
      ["hytte.tilpasning.dekning", "Ombygging for rullestolbruker", "Nødvendige endringer i boligen for å bedre bevegelsesmulighetene når sikrede blir varig rullestolbruker etter en plutselig ytre fysisk hendelse eller ved medfødt funksjonsnedsettelse. Skade utenfor forsikringstiden og komplikasjoner ved medisinsk undersøkelse eller behandling er unntatt.", 5, "Ombygging for rullestolbruker", included],
      ["hytte.tilpasning.grense", "Ombygging for rullestolbruker – forsikringssum", "Inntil 250 000 kr samlet, også med både bygnings- og innboforsikring i Gjensidige. Utgiftene må påløpe innen ti år etter ulykken. Ved medfødt funksjonsnedsettelse gjelder ti år etter offentlig tildeling av rullestol, senest 20 år etter fødselen.", 5, "Ombygging for rullestolbruker"],
    ]);
  }
}

function correctIfRentalVehicleScope(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  const source = sources.ifReiseTerms;
  if (source?.sha256 !== "1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566" ||
    source.effectiveFrom !== "2025-03-22" || source.termsNumber !== "ERA3-4") return;
  const active = (productId: string, component: string) => market.products.some(product => product.productId === productId &&
    product.sourceId === source.id && product.version === "2026-09-20-canonical" && product.componentIds?.includes(component));
  if (active("if-reise-basis", "ifReiseBasis")) upsertRows(facts, "ifReiseBasis", source, [[
    "reise.leiebil.egenandel", "Egenandel for leid transportmiddel", "Dekningen inngår bare i Super.", 2, "Produktoversikt",
    { coverageAvailability: "unavailable" },
  ]]);
  if (active("if-reise-super", "ifReiseSuper")) upsertRows(facts, "ifReiseSuper", source, [[
    "reise.leiebil.egenandel", "Egenandel for leid transportmiddel", "Egenandel oppgitt i leiekontrakten ved tyveri eller ytre skade på leid personbil eller bobil inntil 7 500 kg, motorsykkel over 50 cm³, sykkel eller elsykkel, eller på tilhørende nøkler. Feriereisen må ha minst én overnatting. Kjøretøyet krever gyldig førerkort der det er påbudt, og motorkjøretøy må ha kasko for skade og tyveri.", 21, "10.1 (fortsetter på PDF-side 22)",
    { coverageAvailability: "included", replacesBase: true },
  ]]);
}

function addTrygMotorExtras(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  for (const [kind, termsNumber, hash, name] of [
    ["mc", "PAU27010", "75657812b727c1346472dac5464fd8077826e114e7fe00679e6ac2d2aee97c8b", "MC Ekstra"],
    ["bobil", "PAU27007", "a14a3404fceef8c42d91fb4ec95906e06b87edcfc13188e697e01855aa99f404", "Bobil Ekstra"],
  ] as const) {
    const source = sources["mcb:tryg:" + kind + ":tryg-05" + termsNumber + ".pdf"];
    const component = "tryg-" + kind + "-" + kind + "-ekstra";
    if (source?.sha256 !== hash || source.termsNumber !== termsNumber || source.effectiveFrom !== "2026-07-01" ||
      !market.products.some(product => product.productId === component && product.sourceId === source.id &&
        product.version === source.effectiveFrom && product.componentIds?.includes(component))) continue;

    upsertRows(facts, component, source, [[
      "avtale.bonus.fritak", "Skader uten bonustap", "Utbetaling bare under " + name + " medfører ikke bonustap.", 2, "2 Bonus", included,
    ]]);
    if (kind === "mc") {
      upsertRows(facts, component, source, [
        ["ulykke.sykehus", "Sykehusinnleggelse etter ulykke", "Engangserstatning på 5 000 kr per skadetilfelle når forsikrede er innlagt på sykehus i minst 48 sammenhengende timer som følge av ulykkesskade.", 2, "1 Sykehusinnleggelse", included],
        ["mc.langtur.transport.dekning", "Frakt av reservedeler på langtur", "Dokumenterte transportutgifter for å levere reservedeler etter plutselig og uforutsett teknisk feil som hindrer videre ferdsel. Langtur er minst tre timers reisetid fra bostedsadressen.", 1, "1 Transportkostnader langtur", included],
        ["mc.langtur.transport.grense", "Frakt av reservedeler på langtur – grense", "Inntil 3 000 kr.", 1, "1 Transportkostnader langtur"],
        ["mc.langtur.transport.egenandel", "Frakt av reservedeler på langtur – egenandel", "Ingen egenandel.", 1, "1 Transportkostnader langtur", { deductibleClassification: "coverage" }],
        ["mc.transport.bonustap", "Skade under transport med ferge eller tog", "Skade under transport med ferge eller tog dekkes uten bonustap.", 1, "1 Transport med ferge eller tog", included],
      ]);
      updateReference(facts, component, source.id, ["mc.parkert.dekning", "mc.parkert.alder"], 1,
        "1 Fritak for bonustap ved velteskade på parkert motorsykkel", {
          "mc.parkert.dekning": "Vilkårspunktet om velteskade på parkert motorsykkel gir fritak for bonustap ved erstatningsmessig kaskoskade. Eventuell skadevolder må være ukjent.",
        });
    }
  }
}

function addGjensidigeValuablesTheft(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  const source = sources["private-valuables:gjensidige"];
  const productId = "gjensidige-verdisak-pluss";
  if (source?.sha256 !== "5539d7fed69485b306b28da9fa09fc783209770289e96cc42bb6f4d143f78701" ||
    !market.products.some(product => product.productId === productId && product.sourceId === source.id &&
      product.version === null && product.componentIds?.includes(source.id))) return;

  const salesPage: CatalogSource = {
    id: "private-valuables:gjensidige:product-page",
    filename: "Verdigjenstandsforsikring", company: "Gjensidige", providerId: "gjensidige", insuranceType: "Verdisak",
    termsNumber: "Produktside", effectiveFrom: "", sourceType: "product_page", productIds: [productId], agreementScope: "ordinary",
    url: "https://www.gjensidige.no/forsikring/verdigjenstandsforsikring",
  };
  sources[salesPage.id] = salesPage;
  upsertRows(facts, source.id, source, [[
    "verdisak.tyveri", "Tyveri", "Tyveri er omfattet. Årsaken og tidspunktet må være kjent, og sikkerhetsforskriftene gjelder.", 2,
    "Hvilke skader?, jf. Sikkerhetsforskrifter på PDF-side 1",
    { coverageAvailability: "included", qualificationSource: cite(salesPage, 0, "Hva dekker verdigjenstandsforsikringen?") },
  ]]);
}

export function addAdditionalDamageMarketEvidence(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, market: MarketEdition) {
  addFrendePetMarketTerms(sources, facts, market);
  correctFrendeMotorRows(sources, facts, market);
  addStorebrandPetRows(sources, facts, market);
  addGjensidigeCabinAdaptations(sources, facts, market);
  correctIfRentalVehicleScope(sources, facts, market);
  addTrygMotorExtras(sources, facts, market);
  addGjensidigeValuablesTheft(sources, facts, market);
  addConfirmedNonmemberDamageMarketEvidence(sources, facts, market.products);
  addStorebrandBoatBobilMarketEvidence(sources, facts, market.products);
  addVerifiedDamageFollowupMarketEvidence(sources, facts, market.products);
  addVerifiedValuablesMarketEvidence(sources, facts, market.products);
  addVerifiedTrailerMarketEvidence(sources, facts, market.products);
  addVerifiedSnowmobileMarketEvidence(sources, facts, market.products);
  addVerifiedPetMarketEvidence(sources, facts, market.products, market.addOns);
  addVerifiedInnboMarketEvidence(sources, facts, market.products, market.addOns);
  addVerifiedBilAccessoryMarketEvidence(sources, facts, market.products);
}
