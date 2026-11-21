import type { CatalogAddOn, CatalogFact, CatalogSource } from "./product-catalog.ts";

type Scope = "nito" | "utdanningsforbundet";
type Row = readonly [
  key: string, label: string, value: string, page: number, section: string,
  availability?: CatalogFact["coverageAvailability"],
];

const memberId = (scope: Scope, variant: string) => `tryg-${scope}-${variant}`;
const termsId = (scope: Scope, variant: string) => memberId(scope, variant) + "-terms";

const memberTerms = [
  ["nito", "bil-kasko", "2026-07-01", "d7d2763819d9d3b8718231813f38fc0e1d86e0d2ccd7fdda4e06d06c84451dae"],
  ["nito", "bil-ekstra", "2026-07-01", "826d759a161c45b75f9a23a65fa6494af785a5d59f9fd783fdb8a38c76ffcb6f"],
  ["nito", "elbil-ekstra", "2026-07-01", "c226077253fad5557eeab37e69d9e43cee9b653b51c69b28fb562306eaa41f4b"],
  ["utdanningsforbundet", "bil-ekstra", "2026-08-01", "2bba6051ca1787915908456820238801fabb7a36875d60f507c0aa6585f3d3ce"],
  ["utdanningsforbundet", "elbil-ekstra", "2026-08-01", "59d4b2e5111104847b276d5e6152d2ceb25b2c4704eb7c71f51ad241a1fd15ef"],
  ["nito", "hus", "2026-01-01", "dd05e9da41e31c49882bb16ac2f91efacc187286c93a019e689a59c18e685fef"],
  ["nito", "hus-ekstra", "2026-01-01", "3456e37be1e2868a1eb3ed299b818530e9683477864b405d05a48a80a32042f6"],
  ["utdanningsforbundet", "hus", "2026-01-01", "823da8be2c8ceb14fe003c70ff80633746693f55500442c6a5092ac9aec0ba57"],
  ["utdanningsforbundet", "hus-ekstra", "2026-01-01", "80c735f71ee6b1238eedb6e03bf1905ddadf6451e107bf35de33da31eac7354a"],
] as const;

const motorVariants = ["bil-ekstra", "elbil-ekstra"];
const extraPackages = (scope: Scope) => motorVariants.map(variant => memberId(scope, variant));

const memberAccidentEditions = [
  ...memberTerms.filter(([, variant]) => variant.includes("bil")),
  ["nito", "bil-ansvar", "2024-07-01", "c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6"],
  ["nito", "bil-delkasko", "2026-01-01", "3337c9c2e76f572f5c537470ff244c02ab7b24df3b71e2d1a041e974a68743be"],
  ["utdanningsforbundet", "bil-delkasko", "2026-07-01", "cf480e1a8370decd5b95f31696d55bfb2467d4edb5a92b54a385f568df78c69c"],
] as const;

const motorProductIds = (scope: Scope) => memberAccidentEditions
  .filter(([agreement]) => agreement === scope)
  .map(([, variant]) => memberId(scope, variant));

const supplementalDocuments = [
  {
    id: "tryg-nito-bil-market-kasko", agreementScope: "nito", insuranceType: "Bil",
    filename: "nito-bil-kasko.pdf", termsNumber: "PAU25205", effectiveFrom: "2026-07-01",
    url: "https://www.tryg.no/odpdf?vilk=nito-bil-kasko&vilkNr=05PAU25205",
    sha256: "d7d2763819d9d3b8718231813f38fc0e1d86e0d2ccd7fdda4e06d06c84451dae",
    productIds: extraPackages("nito"), slug: "nito-bil-kasko-pakke-2026",
  },
  {
    id: "tryg-utdanningsforbundet-bil-market-kasko", agreementScope: "utdanningsforbundet", insuranceType: "Bil",
    filename: "udf-bil-kasko-2026-07.pdf", termsNumber: "PAU25245", effectiveFrom: "2026-07-01",
    url: "https://www.tryg.no/odpdf?vilk=udf-bil-kasko&vilkNr=05PAU25245",
    sha256: "34fd8ee96c7fd17f9db8c72b54560e84c4809180c86cca70388a4bf44504627f",
    productIds: extraPackages("utdanningsforbundet"), slug: "utdanningsforbundet-bil-kasko-2026",
  },
  {
    id: "tryg-nito-hus-market-rate", agreementScope: "nito", insuranceType: "Hus",
    filename: "nito-hus-rate-skadedyr.pdf", termsNumber: "PPK40502", effectiveFrom: "2026-01-01",
    url: "https://www.tryg.no/odpdf?vilk=nito-hus-rate-skadedyr&vilkNr=05PPK40502",
    sha256: "97b0dafe4c6b5a1a4e051b2b5847effbe535e9ce2bbcdefd54c894106f156e22",
    productIds: [memberId("nito", "hus"), memberId("nito", "hus-ekstra")], slug: "nito-hus-rate-og-skadedyr-2026",
  },
  {
    id: "tryg-utdanningsforbundet-hus-market-rate", agreementScope: "utdanningsforbundet", insuranceType: "Hus",
    filename: "udf-hus-rate-skadedyr-2026-01.pdf", termsNumber: "PPK11603", effectiveFrom: "2026-01-01",
    url: "https://www.tryg.no/odpdf?vilk=udf-hus-rate-skadedyr&vilkNr=05PPK11603",
    sha256: "52d4fcaef488615ab8e271b5e2d3750601d9c6f793cd947dbfa01edffbc503ac",
    productIds: [memberId("utdanningsforbundet", "hus-ekstra")], slug: "utdanningsforbundet-hus-rate-og-skadedyr-2026",
  },
  {
    id: "tryg-nito-bil-market-ulykke", agreementScope: "nito", insuranceType: "Bil",
    filename: "nito-05pau28006.pdf", termsNumber: "PAU28006", effectiveFrom: "2024-07-01",
    url: "https://www.tryg.no/odpdf?vilk=nito-bil-trafikkulykke-person&vilkNr=05PAU28006",
    sha256: "ccfe912779e7132a657db1abc187a3177c8402f607ab21841188ca449b270c0e",
    productIds: motorProductIds("nito"),
    slug: "nito-trafikkulykke-person-pau28006",
  },
  {
    id: "tryg-utdanningsforbundet-bil-market-ulykke", agreementScope: "utdanningsforbundet", insuranceType: "Bil",
    filename: "udf-05pau28004.pdf", termsNumber: "PAU28004", effectiveFrom: "2025-01-01",
    url: "https://www.tryg.no/odpdf?vilk=udf-bil-forer-og-passasjerulykke&vilkNr=05PAU28004",
    sha256: "1fd126b1d5675635a934cbba65aeef5de2dae8cda5d319de788e92bbcbb9c142",
    productIds: [memberId("utdanningsforbundet", "bil-delkasko"), ...extraPackages("utdanningsforbundet")],
    slug: "utdanningsforbundet-forer-passasjerulykke-pau28004",
  },
  {
    id: "tryg-nito-bil-market-ansvar", agreementScope: "nito", insuranceType: "Bil",
    filename: "nito-bil-ansvar.pdf", termsNumber: "PAU25003", effectiveFrom: "2024-07-01",
    url: "https://www.tryg.no/odpdf?vilk=nito-bilforsikring-ansvar&vilkNr=05PAU25003",
    sha256: "c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6",
    productIds: motorProductIds("nito"), slug: "nito-bil-ansvar-pau25003",
  },
  {
    id: "tryg-utdanningsforbundet-bil-market-ansvar", agreementScope: "utdanningsforbundet", insuranceType: "Bil",
    filename: "udf-05pau25005.pdf", termsNumber: "PAU25005", effectiveFrom: "2024-07-01",
    url: "https://www.tryg.no/odpdf?vilk=udf-bilforsikring-ansvar&vilkNr=05PAU25005",
    sha256: "463c5e7127ee43f03ee917e1159312740ab52c86eaf85db4bd9a47d0c5069170",
    productIds: motorProductIds("utdanningsforbundet"), slug: "utdanningsforbundet-bil-ansvar-pau25005",
  },
  {
    id: "tryg-utdanningsforbundet-bil-market-produkt", agreementScope: "utdanningsforbundet", insuranceType: "Bil",
    filename: "udf-bil-produkt-2026-07.pdf", termsNumber: "PAU14480", effectiveFrom: "2026-07-01",
    url: "https://www.tryg.no/odpdf?vilk=UDF-Bil-Produkt&vilkNr=05PAU14480",
    sha256: "bcc64cf4c8b1b1471777294ae7b1d9de35e65031046e3ed2e6d0b2afe08fe9b6",
    productIds: motorProductIds("utdanningsforbundet"), slug: "utdanningsforbundet-bil-produkt-pau14480",
  },
] as const;

const nitoMotorProduct: CatalogSource = {
  id: "tryg-nito-bil-market-produkt", providerId: "tryg", company: "Tryg",
  agreementScope: "nito", insuranceType: "Bil", productIds: motorProductIds("nito"),
  filename: "PAU14000.pdf", termsNumber: "PAU14000", effectiveFrom: "2026-07-01",
  url: "https://www.tryg.no/odpdf?vilk=nito-Bil-Produkt&vilkNr=05PAU14000", sourceType: "full_terms",
  sha256: "ab2cad9d7799652ab208f237e0d9a1f1d36b3ad2fdc5b504b3536f37db25b116",
};

const nitoMotorLegal: CatalogSource = {
  id: "tryg-nito-bil-market-rettshjelp", providerId: "tryg", company: "Tryg",
  agreementScope: "nito", insuranceType: "Bil", productIds: motorProductIds("nito"),
  filename: "05PGE91500.pdf", termsNumber: "PGE91500", effectiveFrom: "2026-01-01",
  url: "https://www.tryg.no/odpdf?vilk=Rettshjelp&vilkNr=05PGE91500", sourceType: "full_terms",
  sha256: "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
};

const nitoMotorPage: CatalogSource = {
  id: "tryg-nito-bil-market-package-page", providerId: "tryg", company: "Tryg",
  agreementScope: "nito", insuranceType: "Bil", productIds: motorProductIds("nito"),
  filename: "Tryg – NITO Bilforsikring", termsNumber: "", effectiveFrom: "",
  url: "https://www.tryg.no/partnere/nito/nito-bilforsikring", sourceType: "product_page",
};

const nitoHusPage: CatalogSource = {
  id: "tryg-nito-hus-market-package-page", providerId: "tryg", company: "Tryg",
  agreementScope: "nito", insuranceType: "Hus", productIds: [memberId("nito", "hus-ekstra")],
  filename: "Tryg – NITO Husforsikring", termsNumber: "", effectiveFrom: "",
  url: "https://www.tryg.no/partnere/nito/nito-husforsikring", sourceType: "product_page",
};

const udfMotorPage: CatalogSource = {
  id: "tryg-utdanningsforbundet-bil-market-package-page", providerId: "tryg", company: "Tryg",
  agreementScope: "utdanningsforbundet", insuranceType: "Bil", productIds: motorProductIds("utdanningsforbundet"),
  filename: "Tryg – Utdanningsforbundet Bilforsikring", termsNumber: "", effectiveFrom: "",
  url: "https://www.tryg.no/partnere/utdanningsforbundet/utdanningsforbundet-bilforsikring", sourceType: "product_page",
};

export const trygMemberDamageArchives = supplementalDocuments.map((source) => ({
  provider: "tryg", slug: source.slug,
  archivePath: "catalog/sources/tryg/member-agreements/" + source.filename,
  sources: [[source.id, source.effectiveFrom, source.url] as const],
}));

function cite(source: CatalogSource, page: number, section: string): CatalogFact["source"] {
  const { id, filename, termsNumber, effectiveFrom, url, company, agreementScope } = source;
  return { documentId: id, filename, termsNumber, effectiveFrom, url, company, agreementScope, page, section };
}

function reviewedFacts(rows: readonly Row[], source: CatalogSource): CatalogFact[] {
  return rows.map(([key, label, value, page, section, coverageAvailability]) => ({
    key, label, value, source: cite(source, page, section),
    ...(coverageAvailability && { coverageAvailability }),
  }));
}

function setRows(facts: Record<string, CatalogFact[]>, id: string, rows: CatalogFact[], replaces: readonly string[] = []) {
  const keys = new Set([...replaces, ...rows.map(row => row.key)]);
  facts[id] = [...(facts[id] ?? []).filter(fact => !keys.has(fact.key)), ...rows];
}

function kaskoRows(nito: boolean, extra: boolean): Row[] {
  const brannPage = nito ? 2 : 1;
  const excess = nito ? "6 000" : "3 000";
  const common: Row[] = [
    ["kasko.dekning", "Skade på egen bil", "Sammenstøt, utforkjøring, velt, hærverk, feilfylling og annen plutselig, uventet, ytre påvirkning omfattes etter kaskovilkåret.", 1, "2.1 Kasko"],
    ["kasko.egenandel.dyr", "Påkjørsel av dyr – egenandel", nito
      ? "2 000 kr ved erstatningsmessig kaskoskade etter påkjørsel av dyr."
      : "0 kr ved erstatningsmessig kaskoskade etter påkjørsel av dyr når politi eller viltnemnd varsles så snart som mulig og varslingen dokumenteres.",
    1, "2.1 Kasko – Påkjørsel av dyr"],
    ["kasko.dyr.bonus", "Påkjørsel av dyr – bonustap",
      "Ingen bonustap ved erstatningsmessig kaskoskade etter påkjørsel av dyr når politi eller viltnemnd varsles så snart som mulig og varslingen dokumenteres.",
      1, "2.1 Kasko – Påkjørsel av dyr"],
    ["brann.dekning", "Brann", "Brann med åpen flamme, eksplosjon og lynnedslag omfattes.", brannPage, "2.2 Brann"],
    ["brann.egenandel", "Brann – egenandel", excess + " kr dersom ikke lavere egenandel står i forsikringsbeviset.", brannPage, "2.2 Brann"],
    ["tyveri.dekning", "Tyveri", "Tyveri og brukstyveri av bilen eller deler av den, og skade ved tyveriforsøk.", 2, "2.3 Tyveri"],
    ["tyveri.egenandel", "Tyveri – egenandel", excess + " kr dersom ikke lavere egenandel står i forsikringsbeviset.", 2, "2.3 Tyveri"],
    ["glass.dekning", "Glass", "Bruddskade på ruter, inkludert glasstak, dekkes ved bruk av avtaleverksted. Rute som allerede var for slitt eller ripete for EU-kontroll, er unntatt.", 2, "2.4 Glass"],
    ["glass.egenandel.bytte", "Glass – egenandel ved skifte", "3 000 kr ved bytte av rute.", 2, "2.4 Glass"],
    ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "0 kr ved reparasjon.", 2, "2.4 Glass"],
    ["veihjelp.dekning", "Veihjelp", "Persontransport og assistanse eller berging av kjøretøy etter vilkårene, blant annet ved skade og stans som følge av tomt batteri.", 2, "2.5 – persontransport og assistanse"],
    ["veihjelp.transport.grense", "Veihjelp – grense for transport av kjøretøy", "Inntil 50 % av kjøretøyets verdi da skaden skjedde.", 2, "2.5 Assistanse og transport av kjøretøy"],
    ["veihjelp.egenandel", "Veihjelp – egenandel", nito ? "750 kr." : "500 kr.", nito ? 3 : 2, "2.5 Egenandel"],
  ];
  if (!nito || !extra) common.push(["tilbehor.grense", "Fastmontert tilbehør – forsikringssum",
    nito
      ? "Inntil 10 000 kr for lovlig fastmontert tilbehør, med mindre annet står i forsikringsbeviset. Foliering regnes som fastmontert."
      : "Inntil 50 000 kr samlet for lovlig fastmontert tilbehør samt ekstra dekk og felger ved ett forsikringstilfelle. Foliering regnes som fastmontert.",
    1, "1 Fastmontert tilbehør"]);
  return common;
}

function trafficAccidentRows(nito: boolean): Row[] {
  return [
    ["ulykke.dekning", "Fører- og passasjerulykke", "Dekker varig medisinsk invaliditet og dødsfall etter ulykkesskade, samt sykehuskompensasjon etter egne vilkår.", 1, "1 Hva forsikringen omfatter", "included"],
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", nito
      ? "Rettmessig fører og passasjer i forsikringstakerens bil. For forsikringstakeren, ektefelle, registrert partner, samboer og hjemmeboende barn under 21 år med samme folkeregistrerte adresse gjelder den også ved nærmere angitte ulykker i annen privatbil, buss, drosje og ved kollisjon eller påkjørsel."
      : "Ulykke i eller på kjøretøyet. Også utenfor kjøretøyet når det er den direkte årsaken til skaden.",
    1, "2 Tilfeller som kan gi rett til erstatning"],
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 500 000 kr. For barn under 18 år er grensen 1 000 000 kr.", 2, nito ? "4.1 Medisinsk invaliditet" : "3.1 Medisinsk invaliditet"],
    ["ulykke.invaliditet.barn", "Fører/passasjer – invaliditet barn under 18 år", "Inntil 1 000 000 kr.", 2, nito ? "4.1 Medisinsk invaliditet" : "3.1 Medisinsk invaliditet"],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr ved dødsfall som følge av ulykkesskaden innen ett år.", nito ? 3 : 2, nito ? "4.2 Dødsfall" : "3.2 Dødsfall"],
    ["ulykke.sykehus", "Fører/passasjer – sykehuskompensasjon", nito
      ? "5 000 kr per skadetilfelle ved minst 48 sammenhengende timers sykehusinnleggelse etter ulykkesskade. Gjelder forsikringstakeren og husstanden som er angitt i punkt 2."
      : "5 000 kr per skadetilfelle ved minst 48 sammenhengende timers sykehusinnleggelse etter ulykkesskade.",
    nito ? 3 : 2, nito ? "4.3 Sykehusinnleggelse" : "3.3 Kompensasjon sykehusinnleggelse"],
  ];
}

function newCarRows(nito: boolean, variant: string): Row[] {
  const extended = nito && variant !== "bil-kasko";
  const title = extended ? "Totalskadegaranti" : "3.4 Totalskadegaranti";
  const page = extended ? 1 : 4;
  const threeYears = variant !== "bil-kasko";
  return [
    ["nyverdi.alder", "Nyverdierstatning – alder", threeYears
      ? "Innen tre år etter at bilen var registrert som fabrikkny på forsikringstakeren."
      : "Innen ett år etter at bilen var registrert som fabrikkny på forsikringstakeren.", page, title],
    ["nyverdi.km", "Nyverdierstatning – kilometer", threeYears ? "Høyst 60 000 km." : "Høyst 15 000 km.", page, title],
    ["nyverdi.skadegrad", "Nyverdierstatning – skadegrad", "Forventet reparasjonskostnad må overstige 80 % av nyanskaffelsesverdien på skadedagen.", page, title],
    ["nyverdi.tyveri", "Nyverdierstatning – tyveri", "Gjelder også ved tyveri når bilen ikke er kommet til rette innen tre uker.",
      extended && variant === "bil-ekstra" ? 2 : page, title],
    extended ? ["nyverdi.avtaler", "Nyverdierstatning – tilknyttede avtaler",
      "Inntil 10 000 kr for inngåtte abonnement og avtaler knyttet til bilens verdi, for eksempel en serviceavtale.", 1, title]
      : ["nyverdi.unntak", "Nyverdierstatning – leasing", "Leasingbiler er unntatt fra nyverdierstatning.", 4, title],
  ];
}

const liabilityLimits: readonly Row[] = [
  ["ansvar.person.grense", "Ansvar – personskade", "Ubegrenset beløp.", 1, "1.1 Ansvar"],
  ["ansvar.ting.grense", "Ansvar – annen skade", "Inntil 100 000 000 kr.", 1, "1.1 Ansvar"],
];

const liabilityRows: readonly Row[] = [
  ["ansvar.dekning", "Ansvar", "Ansvar etter bilansvarsloven når ansvar er avtalt. Utenfor Norge gjelder blant annet skadestedets regler og egne regler for fører og passasjer med fast bostedsadresse i Norge.", 1, "1.1 Ansvar"],
  ...liabilityLimits,
  ["rettshjelp.dekning", "Rettshjelp", "Utgifter til rettshjelp omfattes når ansvar er avtalt, etter vilkårenes regler.", 1, "1.2 Rettshjelp"],
];

const nitoLiabilityOnlyRows: readonly Row[] = [
  ["ansvar.dekning", "Ansvar", "Bilansvarsloven gir ubegrenset dekning ved personskade og inntil 100 millioner kroner ved annen skade. Utenfor Norge gjelder skadestedets regler, eller norske regler hvis de gir høyere erstatning for fører og passasjer med fast bostedsadresse i Norge.", 1, "1.1 Ansvar"],
  ...liabilityLimits,
  ["rettshjelp.dekning", "Rettshjelp", "Rettshjelp er omfattet etter vilkår PGE91500.", 1, "1.2 Rettshjelp"],
];

const nitoLegalRows: readonly Row[] = [
  ["rettshjelp.grense", "Rettshjelp – forsikringssum",
    "Ved avtalt ansvar er grensen 100 000 kr samlet per tvist eller 250 000 kr ved minst tre parter på sikredes side. Ved tvist med selskapet om dekning av rettshjelp er grensen 20 000 kr.", 4, "6.1 Forsikringssum"],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel",
    "4 000 kr pluss 20 % av utgiftene utover 4 000 kr. Én egenandel per tvist.", 5, "6.2 Egenandel"],
];

const udfLegalRows: readonly Row[] = [
  ["geografi.rettshjelp", "Rettshjelp – geografisk område",
    "Rettshjelpsvilkåret har Norden som utgangspunkt. PAU25005 utvider dekningen til EU/EØS for angitte tvister som eier eller fører av det forsikrede kjøretøyet, blant annet ved totalskade og ulykkesrelatert personskade. Tvist som selger av kjøretøyet gjelder i Norden. Produktsiden beskriver Europa mer generelt.", 1, "1.2 Rettshjelp"],
  ["rettshjelp.grense", "Rettshjelp – forsikringssum", "Inntil 100 000 kr samlet per tvist etter dekningsvilkåret.", 1, "1.2 Rettshjelp – forsikringssum"],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel",
    "4 000 kr pluss 20 % av utgiftene utover 4 000 kr. Én egenandel per tvist.", 1, "1.2 Rettshjelp – egenandel"],
];

const nitoExtraRows: readonly Row[] = [
  ["tilbehor.grense", "Fastmontert tilbehør – forsikringssum", "Inntil 50 000 kr samlet for fastmontert tilbehør og ekstra dekk og felger ved ett forsikringstilfelle. Foliering regnes som fastmontert.", 2, "1 Fastmontert tilbehør. Ekstra dekk og felger"],
  ["kasko.egenandel.reduksjon", "Kasko – redusert egenandel", "1 000 kr lavere kaskoegenandel ved bruk av avtaleverksted. Dekningsvilkåret angir unntak.", 1, "Redusert egenandel ved bruk av kasko"],
];
const houseRows = (nito: boolean, extra: boolean): Row[] => {
  const page = nito ? 2 : 6;
  const ordersPage = nito ? 2 : 5;
  const ordersSection = "Offentlige påbud";
  return [
    ["hus.brann.dekning", "Brann", "Plutselig og uforutsett skade ved brann der ild er kommet løs.", nito && extra ? 3 : page, "2.1 Brann"],
    ["hus.naturskade.dekning", "Naturskade", "Naturskade er omfattet etter vilkår PGE90010.", page, extra && !nito ? "1.9 Naturskade" : "1.7 Naturskade"],
    ["hus.brukstap.dekning", "Ubeboelig bolig og tapt husleie", "Tap ved ubeboelig egen bolig og eventuell tapt husleie erstattes i normal reparasjons- eller gjenoppføringstid etter en dekket skade.", page, "Ubeboelig bolig og tapt husleieinntekt", "included"],
    ["hus.pabud.dekning", "Offentlige påbud – dekning", "Dekker nødvendige merutgifter ved lov- eller forskriftsbaserte påbud ved reparasjon eller gjenoppføring etter en dekket skade. Påbud som kunne vært gitt før skaden er unntatt.", ordersPage, ordersSection, "included"],
    ["hus.pabud.grense", "Offentlige påbud – beløpsgrense", extra
      ? "Inntil 1 000 000 kr for fredede bygninger."
      : "Inntil 2 000 000 kr per skadetilfelle. Ved førsterisiko er grensen 20 % av forsikringssummen, maksimalt 2 000 000 kr.",
    extra ? ordersPage : page, ordersSection],
    ["hus.vatrom.folgeskade", "Utett våtrom – følgeskade", extra
      ? "Vann fra utett våtrom på tilstøtende og underliggende rom er omfattet."
      : "Vannskade fra utett våtrom, inkludert vann fra gulvsluk og oppforinger, er unntatt.", page + 1, "2.3 Utstrømming eller inntrengning av vann", extra ? "included" : "unavailable"],
    ["hus.vatrom.selverommet", "Våtrom – selve rommet", extra
      ? "Direkte vannskade fra svak konstruksjon, materialfeil eller feilmontering utført av godkjent eller autorisert personell. Skaden må oppstå i forsikringstiden og være konstatert innen ti år fra arbeidet. En mangel uten konstatert følgeskade dekkes ikke."
      : "Skade på selve våtrommet som skyldes at rommet er utett, er unntatt.", page + 1, "2.3 Utstrømming eller inntrengning av vann", extra ? "included" : "unavailable"],
  ];
};

function rotRows(qualification: string): Row[] {
  return [
    ["hus.rate.dekning", "Råte og sopp", qualification + "Skade på bygning ved nedbrytende råtesopp er omfattet. Dører, vinduer og annet utvendig treverk er unntatt.", 1, "2–3 Dekning og unntak", "included"],
    ["hus.rate.egenandel", "Råte og skadeinsekter – egenandel", qualification + "6 000 kr per skadetilfelle hvis beviset ikke angir annet.", 2, "4.2 Egenandel"],
    ["hus.skadedyr.dyr.bygningsskade", "Bygningsskade fra mus, rotter og andre dyr", qualification + "Skade på bygning som skyldes dyr er dekket med særskilte unntak for blant annet kjæledyr.", 1, "2–3 Dekning og unntak"],
    ["hus.skadedyr.dyr.bekjempelse", "Bekjempelse av mus, rotter og andre dyr", qualification + "VIS Forsikring dekker innvendig bekjempelse av mus og rotter etter påvist aktivitet.", 1, "2 Forsikringen dekker"],
    ["hus.skadedyr.insekter.bekjempelse", "Bekjempelse av skadeinsekter", qualification + "VIS Forsikring dekker reduksjon eller utryddelse av skadeinsekter etter påvist aktivitet.", 1, "2 Forsikringen dekker"],
    ["hus.skadedyr.insekter.egenandel", "Bekjempelse av skadeinsekter – egenandel", qualification + "2 000 kr ved skadedyrbekjempelse hvis beviset ikke angir annet.", 2, "4.2 Egenandel"],
  ];
}

export function addTrygMemberDamageComparisonFacts(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, addOns: CatalogAddOn[],
) {
  const [nitoKasko, udfKasko, nitoRot, udfRot, nitoAccident, udfAccident, nitoLiability, udfLiability, udfMotorProduct] = supplementalDocuments;
  for (const source of supplementalDocuments) {
    sources[source.id] = {
      id: source.id, filename: source.filename, termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
      url: source.url, sha256: source.sha256, agreementScope: source.agreementScope, insuranceType: source.insuranceType,
      productIds: [...source.productIds], providerId: "tryg", company: "Tryg", sourceType: "full_terms",
    };
  }
  sources[nitoHusPage.id] = nitoHusPage;
  sources[udfMotorPage.id] = udfMotorPage;
  sources[nitoMotorPage.id] = nitoMotorPage;
  sources[nitoMotorProduct.id] = nitoMotorProduct;
  sources[nitoMotorLegal.id] = nitoMotorLegal;

  for (const [scope, variant, version, sha256] of memberTerms) {
    const id = termsId(scope, variant);
    const primary = sources[id];
    if (primary?.agreementScope !== scope || primary.effectiveFrom !== version ||
      primary.productVersion !== version || primary.sha256 !== sha256) continue;
    const nito = scope === "nito";

    if (variant.includes("bil")) {
      const extra = variant !== "bil-kasko";
      const base = extra ? sources[nito ? nitoKasko.id : udfKasko.id] : primary;
      if (nito && extra && sources[termsId("nito", "bil-kasko")]?.sha256 !== base.sha256) continue;
      const reviewed = reviewedFacts(kaskoRows(nito, extra), base);
      reviewed.push(...reviewedFacts(newCarRows(nito, variant), nito && extra ? primary : base));
      if (extra && nito) reviewed.push(...reviewedFacts(nitoExtraRows, primary));
      if (extra && !nito) reviewed.push(...reviewedFacts([
        ["bil.parkeringsskade", "Parkeringsskade uten bonustap", "Dekket parkeringsskade med ukjent skadevolder gir fritak for bonustap til og med forsikringsperioden bilen fyller ti år. Avtalt kaskoegenandel gjelder.", 1, "Fritak for bonustap ved skade på parkert bil"],
        ["maskinskade.alder", "Maskinskade – alder", "Til og med forsikringsperioden bilen fyller ti år fra førstegangsregistrering.", 1, "Skade på motor, girkasse eller drivverk"],
      ], primary));
      setRows(facts, id, reviewed, ["bil.kollisjon", "bil.maskinskade", "kasko.dyr"]);
      continue;
    }

    const extra = variant === "hus-ekstra";
    const reviewed = reviewedFacts(houseRows(nito, extra), primary).map(fact =>
      !nito && fact.key === "hus.pabud.dekning"
        ? { ...fact, qualificationSource: cite(primary, 6, "Offentlige påbud – unntak") }
        : fact);
    if (extra) {
      reviewed.push(...reviewedFacts([
        ["hus.tilpasning.grense", "Tilpasning for rullestolbruker",
          "Inntil 250 000 kr samlet for alle sikrede per forsikringstilfelle til nødvendige tilpasninger i hjemmet. Ved ulykke i forsikringstiden kreves rullestolbehov og minst 50 % varig medisinsk invaliditet. Omfatter også barn som blir født med minst 50 % varig medisinsk invaliditet, etter vilkårene.",
          nito ? 2 : 9, nito ? "1.10 Tilpasning for rullestolbruker" : "2.8 Tilpasning for rullestolbruker"],
      ], primary));
    }
    if (extra && nito) {
      const qualificationSource = cite(nitoHusPage, 0, "Råte- og skadedyrforsikring – vilkår ved nysalg");
      reviewed.push(...reviewedFacts(rotRows("Gjelder ved nysalg etter 14. september 2026. For tidligere avtaler må dekningen kontrolleres i forsikringsbeviset. "), sources[nitoRot.id])
        .map(fact => ({ ...fact, qualificationSource })));
    } else if (extra) {
      reviewed.push(...reviewedFacts(rotRows(""), sources[udfRot.id]).map(fact => ({
        ...fact, qualificationSource: cite(primary, 6, "1.12 Råte og skadedyr"),
      })));
      reviewed.push(...reviewedFacts([
        ["hus.handverker.konkurs", "Håndverker – kriminalitet og konkurs", "Inntil 100 000 kr samlet for direkte økonomisk tap ved håndverkerens underslag, tyveri, bedrageri, dokumentfalsk eller konkurs i forbindelse med arbeid på den forsikrede bygningen. Ved konkurs må fordringen foreligge og være fremsatt ved konkursåpningen.", 9, "2.7 Kriminalitet og konkurs"],
      ], primary));
    } else if (nito) {
      facts[nitoRot.id] = reviewedFacts(rotRows(""), sources[nitoRot.id]);
      addOns.push({
        id: "tryg-nito-hus-rate-market-addon", name: "Råte og skadedyr", componentId: nitoRot.id,
        providerId: "tryg", agreementScope: "nito", requiresLevel: [memberId("nito", "hus")],
        insuranceTypes: ["Hus"],
      });
    }
    setRows(facts, id, reviewed);
  }

  for (const [scope, variant, version, sha256] of memberAccidentEditions) {
    const id = termsId(scope, variant);
    const primary = sources[id];
    if (primary?.agreementScope !== scope || primary.effectiveFrom !== version ||
      primary.productVersion !== version || primary.sha256 !== sha256) continue;
    const nito = scope === "nito";
    const accident = sources[nito ? nitoAccident.id : udfAccident.id];
    const rows = reviewedFacts(trafficAccidentRows(nito), accident).map((fact) =>
      (fact.key === "ulykke.dod" || fact.key === "ulykke.sykehus")
        ? { ...fact, qualificationSource: cite(accident, 1, fact.key === "ulykke.dod" ? "2.2 Dødsfall" : "2 og 2.3 Sykehusinnleggelse") }
        : fact);
    const liability = sources[nito ? nitoLiability.id : udfLiability.id];
    const productTerms = sources[nito ? nitoMotorProduct.id : udfMotorProduct.id];
    const sameLiabilityEdition = nito && variant === "bil-ansvar" &&
      liability.termsNumber === primary.termsNumber && liability.effectiveFrom === primary.effectiveFrom &&
      liability.sha256 === primary.sha256;
    rows.push(...reviewedFacts(sameLiabilityEdition ? nitoLiabilityOnlyRows : liabilityRows, liability));
    rows.push(...reviewedFacts([
      ["avtale.geografi", "Geografisk område",
        "Europa, unntatt Russland, Belarus og Tyrkia. Særregler gjelder der det kreves grenseforsikring.",
        1, nito ? "3 Hvor forsikringen gjelder" : "2 Hvor forsikringen gjelder"],
    ], productTerms));
    if (nito) {
      rows.push(...reviewedFacts(nitoLegalRows, nitoMotorLegal)
        .map(fact => ({ ...fact, qualificationSource: cite(productTerms, 1, "2 Hva forsikringen omfatter") })));
      rows.push(...reviewedFacts([
        ["geografi.rettshjelp", "Rettshjelp – geografisk område", "Norden.", 1, "3 Hvor forsikringen gjelder"],
      ], productTerms));
      rows.push({
        key: "ulykke.geografi", label: "Trafikkulykke – geografisk område",
        value: "PAU28006 oppgir Europa, unntatt Russland, Belarus og Tyrkia. Trygs produktside nevner også Israel og Tyrkia for personskader etter trafikkulykke. Avklar dekningen der med Tryg for den aktuelle avtalen.",
        requiresSourceClarification: true,
        source: cite(accident, 2, "3 Hvor forsikringen gjelder"),
        qualificationSource: cite(nitoMotorPage, 0, "Hvem gjelder bilforsikringen for?"),
      });
    } else {
      rows.push(...reviewedFacts(udfLegalRows, liability).map(fact => fact.key !== "geografi.rettshjelp" ? fact : ({
        ...fact, qualificationSource: cite(udfMotorPage, 0, "Ansvar og rettshjelp i nesten hele Europa"),
      })));
    }
    if (!nito && motorVariants.includes(variant)) rows.push(...reviewedFacts([
      ["natur.dekning", "Naturskade på egen bil", "Skade på eget kjøretøy som følge av en plutselig naturulykke, for eksempel flom, er omfattet.", 0, "Skade på bilen forårsaket av naturulykker", "included"],
    ], udfMotorPage));
    setRows(facts, id, rows, sameLiabilityEdition ? ["bil.ansvar", "bil.rettshjelp"] : []);
  }
}
