import { boatPetFacts, boatPetSources } from "./boat-pet-catalog.ts";
import type { CatalogAddOn, CatalogFact, CatalogSource } from "./product-catalog.ts";

const gjensidigeCat: CatalogSource = {
  id: "boat-pet:gjensidige:katt:treatment",
  company: "Gjensidige", providerId: "gjensidige", insuranceType: "Katt", agreementScope: "ordinary",
  filename: "gjensidige-cat-treatment-terms.pdf", documentName: "Katt Behandling – alminnelige vilkår",
  termsNumber: "", effectiveFrom: "", physicalPages: [1, 8], sourceType: "full_terms",
  url: "https://www.gjensidige.no/files/privat/vilkar/dyr/Katt-Behandling-alminnelige-vilkar.pdf",
  sha256: "6e16b50107c236ed60203df36371b3140b950eff03773e885b9f62ddb9069921",
};

type Row = readonly [
  key: string, label: string, value: string, page: number, section: string,
  availability?: CatalogFact["coverageAvailability"],
];

function withTerms(componentId: string, source: CatalogSource, rows: readonly Row[]): CatalogFact[] {
  const replaced = new Set(rows.map(([key]) => key));
  return [
    ...(boatPetFacts[componentId] ?? []).filter(fact => !replaced.has(fact.key)),
    ...rows.map(([key, label, value, page, section, coverageAvailability]) => ({
      key, label, value,
      ...(coverageAvailability && { coverageAvailability }),
      source: {
        documentId: source.id, company: source.company, filename: source.filename,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
        agreementScope: source.agreementScope, version: source.version, url: source.url, page, section,
      },
    })),
  ];
}

const facts: Record<string, CatalogFact[]> = {
  "gjensidige-katt-behandling": withTerms("gjensidige-katt-behandling", gjensidigeCat, [
    ["dyr.diagnostikk.dekning", "Diagnostikk", "MR og CT omfattes innenfor valgt forsikringssum.", 2,
      "For veterinærutgifter gjelder i tillegg", "included"],
    ["dyr.medisin.dekning", "Medisiner",
      "Foreskrevne medisiner og preparater til behandling av dekket sykdom eller ulykkesskade, samt bandasje- og beskyttelsesmateriell, omfattes innenfor forsikringssummen. Foreskrevet behandling må fremgå av journal eller attest.",
      2, "For veterinærutgifter gjelder i tillegg", "included"],
    ["dyr.tannskade.dekning", "Tannskade ved ulykke", "Trekking av permanente tenner med brudd etter ulykke omfattes.",
      2, "For veterinærutgifter gjelder i tillegg – Dekkes ikke", "included"],
    ["dyr.tannsykdom.dekning", "Tannsykdom",
      "Tannsykdom, tannresorpsjon, tannkjøttbetennelse og tannstein er unntatt. Ulykkesbetinget tannfraktur har en særregel.",
      2, "For veterinærutgifter gjelder i tillegg – Dekkes ikke", "unavailable"],
    ["dyr.fodsel.dekning", "Drektighet og fødsel",
      "Ett keisersnitt i kattens levetid når katten har hatt sammenhengende veterinærdekning i minst ett år ved behandlingen.",
      2, "For veterinærutgifter gjelder i tillegg", "included"],
    ["dyr.karenstid.sykdom", "Karenstid – sykdom",
      "Sykdom eller lidelse som katten har ved ikrafttredelse eller som oppstår i de første 20 dagene, er unntatt. Dette gjelder også ved forhøyelse av forsikringssum eller dekningsutvidelse.",
      2, "Veterinærutgifter – Dekkes ikke"],
    ["dyr.rehabilitering.dekning", "Rehabilitering",
      "Rehabilitering og fysikalsk behandling, inkludert trening og behandling i vann, er unntatt.",
      2, "For veterinærutgifter gjelder i tillegg – Dekkes ikke", "unavailable"],
    ["dyr.veterinar.online", "Videokonsultasjon med veterinær",
      "Videokonsultasjoner med online veterinær omfattes. Gjensidige trekker ingen egenandel hos veterinær de har avtale med.",
      2, "Online veterinær"],
    ["dyr.veterinar.avliving", "Avliving – veterinærdekning",
      "Avliving og kremering omfattes med inntil 1 500 kr samlet ved dekket diagnose frem til katten fyller 13 år.", 1,
      "Forsikringsbevis – Behandling, med aldersgrensen på side 2"],
  ]),
  "tryg-hund-dod": withTerms("tryg-hund-dod", boatPetSources["boat-pet:tryg:hund:life"], [
    ["dyr.liv.reduksjon.start", "Liv, død og tap – aldersreduksjon starter",
      "Som hovedregel fra hunden er 7 år. Vilkåret lister raser der fradraget starter ved 5 år og raser der det starter ved 9 år.",
      2, "3 Slik beregnes erstatningen – raseavhengig startalder"],
    ["hund.bruksverdi.dekning", "Bruksverdi",
      "Hund død kan gi erstatning ved livsvarig nedsatt verdi som avls- eller brukshund etter akutt sykdom eller ulykkesskade. Avlsbruk eller dokumentert trening og praktisk bruk må oppfylle vilkårets krav.",
      1, "2 Nedsatt bruksverdi"],
    ["hund.bruksverdi.alder", "Bruksverdi – aldersgrense", "Hunden må være under 8 år.", 2,
      "2 Nedsatt bruksverdi (fortsettelse)"],
    ["hund.bruksverdi.grense", "Bruksverdi – erstatning",
      "50 % av forsikringssummen. Utbetalt erstatning for nedsatt bruksverdi trekkes fra ved senere dødsfallsoppgjør.",
      2, "3 Slik beregnes erstatningen"],
  ]),
  "tryg-katt-ekstra": withTerms("tryg-katt-ekstra", boatPetSources["boat-pet:tryg:katt:extra"], [
    ["dyr.fodsel.kull.dekning", "Forsikring av kull",
      "Livreddende behandling av kattunger etter den forsikrede katten de første ti levedøgnene.", 1, "2 Kattungeforsikring"],
    ["dyr.fodsel.kull.grense", "Forsikring av kull – beløpsgrense",
      "Inntil 5 000 kr per kattunge og 10 000 kr per kull.", 1, "2 Kattungeforsikring"],
    ["dyr.fodsel.kull.egenandel", "Forsikring av kull – egenandel", "Ingen egenandel.", 1, "2 Kattungeforsikring"],
  ]),
};

const addOns: CatalogAddOn[] = [];
for (const species of ["hund", "katt"] as const) {
  const isDog = species === "hund";
  const subject = isDog ? "hunden" : "katten";
  const source = boatPetSources["boat-pet:if:" + species];
  const variants = ["basis", "standard", "super"];
  const productIds = variants.map(level => "if-" + species + "-" + level);
  for (const level of variants) {
    const id = "if-" + species + "-" + level;
    const birth = "Én behandling i løpet av dyrets levetid etter minst ett år med tilsvarende veterinærdekning. Dyret kan ikke ha hatt to eller flere tidligere keisersnitt.";
    const dogTerms = " Boston terrier, chihuahua, pomeranian, engelsk bulldog og fransk bulldog må i tillegg dokumentere tidligere kull der alle valper er født uten keisersnitt. Parringen må følge Norsk Kennel Klubbs etiske regler.";
    const rows: Row[] = [
      ["dyr.fodsel.dekning", "Drektighet og fødsel", "Keisersnitt eller fødselshjelp. " + birth +
        (isDog ? dogTerms : ""), 5, "5.1.6 Keisersnitt og fødselshjelp", "included"],
      ["dyr.veterinar.medfodte_feil", "Medfødte feil",
        "Feil med betydning for helse og funksjon kan dekkes når " + subject +
        " var forsikret før fire måneders alder, og feilen var under utvikling uten symptomer eller kjent diagnose ved kontrollen før levering.",
        5, "5.1.7 Medfødte feil", "included"],
      ["dyr.veterinar.avliving", "Avliving – veterinærdekning",
        "Avliving anbefalt av veterinær av dyrevernmessige grunner omfattes til og med forsikringsåret " + subject +
        " fyller 10 år.", 5, "5.1.8 Avliving"],
    ];
    if (level === "basis") {
      rows.push(["dyr.allergi.dekning", "Allergi", "Utredning av allergi omfattes.",
        4, "5.1.4 Allergi", "included"]);
    }
    if (level === "super") {
      rows.push(["dyr.rehabilitering.dekning", "Rehabilitering",
        "Fysioterapi, rehabilitering eller kiropraktikk rekvirert eller utført av veterinær, innenfor valgt forsikringssum. Behandlingen må skje innen ett år etter skaden.",
        5, "5.1.5 Fysioterapi, rehabilitering og kiropraktikk", "included"]);
      if (!isDog) rows.push(["dyr.tannsykdom.grense", "Tannsykdom – beløpsgrense",
        "Inntil valgt årlig veterinærsum. Tannresorpsjon har en særgrense på 5 000 kr per år.",
        4, "5.1.3 Tannbehandling ved sykdom"]);
    }
    facts[id] = withTerms(id, source, rows);
  }

  const id = isDog ? "if-hund-valpekull" : "if-katt-kattunge";
  const litterPage = isDog ? 7 : 6;
  const litterSection = isDog ? "5.3 Veterinærutgifter valpekull" : "5.3 Veterinærutgifter kattunger";
  const qualifier = isDog ? " Parringen må følge Norsk Kennel Klubbs etiske regler." :
    " Kullet må være født før kattemoren fyller seks år.";
  facts[id] = withTerms(id, source, [
    ["dyr.fodsel.kull.dekning", "Forsikring av kull",
      "Valgfri dekning for nødvendige veterinærutgifter og foreskrevne medisiner ved sykdom eller ulykke. Må kjøpes før fødsel og gjelder frem til overlevering, senest ved tolv ukers alder." +
      qualifier, litterPage, litterSection],
    ["dyr.fodsel.kull.grense", "Forsikring av kull – beløpsgrense", "Inntil 30 000 kr for hele kullet.", litterPage, litterSection],
    ["dyr.fodsel.kull.egenandel", "Forsikring av kull – egenandel", "2 000 kr per skade eller sykdom.", litterPage, litterSection],
  ]);
  addOns.push({ id, componentId: id, name: isDog ? "Valpekullforsikring" : "Kattungeforsikring",
    agreementScope: "ordinary", providerId: "if", insuranceTypes: [isDog ? "Hund" : "Katt"], requiresLevel: productIds });
}

export const petCoverageMarket = {
  replacesProductIds: [],
  products: [],
  sources: { [gjensidigeCat.id]: gjensidigeCat },
  facts,
  addOns,
};

export const petCoverageMarketArchives = [
  { provider: "gjensidige", slug: "katt-behandling", source: gjensidigeCat },
  { provider: "if", slug: "hund-veterinar", source: boatPetSources["boat-pet:if:hund"] },
  { provider: "if", slug: "katt-veterinar", source: boatPetSources["boat-pet:if:katt"] },
].map(({ provider, slug, source }) => ({
  provider, slug, archivePath: "catalog/sources/boat-pet/" + source.filename,
  sources: [[source.id, source.effectiveFrom, source.url!]] as const,
}));
