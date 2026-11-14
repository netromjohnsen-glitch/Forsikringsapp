import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const insuranceType = "Hytte";
const labels = {
  "avtale.geografi": "Hvor forsikringen gjelder",
  "brann.dekning": "Brannskade",
  "vann.dekning": "Vannskade og rørbrudd",
  "tyveri.dekning": "Tyveri og skadeverk",
  "naturskade.dekning": "Naturskade",
  "dyr.dekning": "Skade fra dyr og bekjempelse",
  "rate.dekning": "Sopp og råte",
  "utett.dekning": "Følgeskade fra utett tak eller vegg",
  "feriegaranti.dekning": "Tap når hytta ikke kan brukes",
  "utleie.dekning": "Skadeverk eller mislighold ved utleie",
  "ansvar.dekning": "Privatansvar",
  "rettshjelp.dekning": "Rettshjelp",
  "egenandel.egenandel": "Avtalt egenandel",
  "sikkerhet.vann": "Sikkerhetsforskrift for vann ved fravær",
} as const;

type RowKey = keyof typeof labels;
type Row = [key: RowKey, value: string, page: number, section: string, availability?: CatalogFact["coverageAvailability"]];
type SourceInput = Pick<CatalogSource, "filename" | "documentName" | "url" | "sha256" | "termsNumber" | "effectiveFrom" | "physicalPages">;
type CabinSource = CatalogSource & { providerId: string; company: string };

export const cabinProducts: CatalogProduct[] = [];
export const cabinFacts: Record<string, CatalogFact[]> = {};
export const cabinSources: Record<string, CatalogSource> = {};
export const cabinAddOns: CatalogAddOn[] = [];

function registerSource(id: string, providerId: string, company: string, source: SourceInput): CabinSource {
  const registered: CabinSource = {
    ...source, id, providerId, company, insuranceType, sourceType: "full_terms", agreementScope: "ordinary",
    ...(source.effectiveFrom ? { version: source.effectiveFrom } : {}),
  };
  cabinSources[id] = registered;
  return registered;
}

function evidence(source: CatalogSource, rows: Row[]): CatalogFact[] {
  return rows.map(([key, value, page, section, coverageAvailability]) => ({
    key: `hytte.${key}`, label: labels[key], value,
    ...(coverageAvailability ? { coverageAvailability } : {}),
    ...(key === "egenandel.egenandel" ? { deductibleClassification: "reference" as const } : {}),
    source: {
      documentId: source.id, page, section, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, version: source.version,
      agreementScope: "ordinary",
    },
  }));
}

function registerProduct(provider: CabinSource, variant: string, name: string, facts: CatalogFact[]) {
  const { providerId, company } = provider;
  const productId = `${providerId}-hytte-${variant}`;
  cabinProducts.push({
    providerId, company, insuranceType, name, productId, agreementScope: "ordinary",
    version: provider.effectiveFrom || null, sourceId: provider.id, componentIds: [productId],
  });
  cabinFacts[productId] = facts;
  for (const id of new Set([provider.id, ...facts.map(fact => fact.source.documentId)])) {
    (cabinSources[id].productIds ??= []).push(productId);
  }
}

function registerAddOn(source: CabinSource, name: string, rows: Row[]) {
  const requiresLevel = cabinProducts.filter(product => product.providerId === source.providerId)
    .map(product => product.productId);
  const id = `${source.id}:optional`;
  for (const productId of requiresLevel) {
    const productIds = source.productIds ??= [];
    if (!productIds.includes(productId)) productIds.push(productId);
  }
  cabinFacts[id] = evidence(source, rows);
  cabinAddOns.push({
    id, name, componentId: id, providerId: source.providerId,
    insuranceTypes: [insuranceType], requiresLevel, agreementScope: "ordinary",
  });
}

const trygBase = registerSource("cabin:tryg:building", "tryg", "Tryg", {
  filename: "private-cabin/tryg-hytte-bygning.pdf", documentName: "Bygning – Tryg hytteforsikring",
  termsNumber: "PPK32001", effectiveFrom: "2026-01-01", physicalPages: [1, 8],
  url: "https://www.tryg.no/odpdf?vilk=Fritidshusforsikring-Bygning&vilkNr=05PPK32001",
  sha256: "b8bdc054bf9a3f863226f0ae87e85103f3c90a4ce094bc91c3c4fcb8f88707bf",
});
const trygExtra = registerSource("cabin:tryg:extra", "tryg", "Tryg", {
  filename: "private-cabin/tryg-hytte-ekstra.pdf", documentName: "Bygning Ekstra – Tryg hytteforsikring",
  termsNumber: "PPK32002", effectiveFrom: "2026-01-01", physicalPages: [1, 8],
  url: "https://www.tryg.no/odpdf?vilk=Fritidshusforsikring-Bygning-Ekstra&vilkNr=05PPK32002",
  sha256: "969aea768b613f9d98cfd52a0e3f45023393129a4a3071cb2e42e9d38dc51cfb",
});
const trygProduct = registerSource("cabin:tryg:product", "tryg", "Tryg", {
  filename: "private-cabin/tryg-hytte-produkt.pdf", documentName: "Hytte – Tryg produktvilkår",
  termsNumber: "PPK32000", effectiveFrom: "2025-07-01", physicalPages: [1, 1],
  url: "https://www.tryg.no/odpdf?vilk=Fritidshusforsikring-Produkt&vilkNr=05PPK32000",
  sha256: "14010738eb671a0240209b263c0bdc28f2875be5fa960de75d19ecb802a47121",
});
const trygSafety = registerSource("cabin:tryg:safety", "tryg", "Tryg", {
  filename: "private-cabin/tryg-hytte-sikkerhetsforskrift.pdf", documentName: "Hytte – Tryg sikkerhetsforskrifter",
  termsNumber: "", effectiveFrom: "", physicalPages: [1, 3],
  url: "https://www.tryg.no/odpdf?vilk=Fritidshusforsikring-Sikkerhetsforskrift-Hus&vilkNr=05000PF320",
  sha256: "d925047c79770cf0696015a4ddc515869ec6a20ffc4cebd67b2e4e0d26036492",
});
const trygPests = registerSource("cabin:tryg:pests", "tryg", "Tryg", {
  filename: "private-cabin/tryg-hytte-rate-skadedyr.pdf", documentName: "Råte og skadedyr hytte",
  termsNumber: "PPK40503", effectiveFrom: "2026-01-01", physicalPages: [1, 3],
  url: "https://www.tryg.no/odpdf?vilk=Hussoppforskring-Fritidshus&vilkNr=05PPK40503",
  sha256: "dd0e7d9e173d8498776d044ee016264bf813d0dee6aa61dc1efa424bf48521f1",
});
const trygRental = registerSource("cabin:tryg:rental", "tryg", "Tryg", {
  filename: "tryg/hus/05PPK11506.pdf", documentName: "Utleie – valgfri tilleggsdekning",
  termsNumber: "PPK11506", effectiveFrom: "2026-01-01", physicalPages: [1, 3],
  url: "https://www.tryg.no/odpdf?vilk=Utleieforsikring-Hus&vilkNr=05PPK11506",
  sha256: "7291f82a98a75c3ada8c2f9a34f03a9031dcb55abe7bb6cf8805ab6f130bdf3b",
});
for (const [variant, name, terms] of [["standard", "Hytteforsikring", trygBase], ["ekstra", "Hytteforsikring Ekstra", trygExtra]] as const) {
  const extra = variant === "ekstra";
  registerProduct(terms, variant, name, [
    ...evidence(terms, [
      ["brann.dekning", "Plutselig og uforutsett brannskade omfattes. Svi- og gnistskader uten brann er unntatt.", 2, "2.1", "included"],
      ["vann.dekning", "Omfatter blant annet lekkasje fra bygningens rør og plutselig vanninntrengning fra terreng eller grunn når fritt vann står over laveste gulv.", 3, "2.3–2.4", "included"],
      ["tyveri.dekning", "Tyveri og skadeverk på forsikringsstedet omfattes, med unntak blant annet for skadeverk utført av beboer eller bruker i utleid rom.", 4, "2.5", "included"],
      ["utett.dekning", extra
        ? "Følgeskade fra plutselig vanninntrengning over bakkenivå omfattes. Vann inn gjennom tak eller takgjennomføring eldre enn 50 år er unntatt."
        : "Vann fra tak, takrenne og utvendig nedløp er unntatt i standarddekningen.", 3, "2.3", extra ? "included" : "unavailable"],
      ["feriegaranti.dekning", `Kompensasjon ved ubeboelig hytte etter dekningsmessig skade. Grensen for ubeboelig hytte er ${extra ? "50 000" : "30 000"} kroner.`, 2, "Ubeboelig hytte og tapt husleieinntekt", "included"],
      ["naturskade.dekning", "Bygningsforsikringen omfatter naturskade etter egne vilkår.", 2, extra ? "1.6" : "1.5", "included"],
      ["ansvar.dekning", "Bygningsforsikringen omfatter privatansvar etter egne vilkår.", 2, extra ? "1.7" : "1.6", "included"],
      ["rettshjelp.dekning", "Bygningsforsikringen omfatter rettshjelp etter egne vilkår.", 2, extra ? "1.8" : "1.7", "included"],
      ["egenandel.egenandel", "Egenandelen i forsikringsbeviset gjelder der vilkårene ikke angir en annen egenandel.", 5, "3.2"],
    ]),
    ...evidence(trygProduct, [
      ["avtale.geografi", "Hytta er forsikret på stedet angitt i forsikringsbeviset. Naturskade gjelder i Norge, mens privatansvar og rettshjelp gjelder i Norden.", 1, "3 – Hvor forsikringen gjelder"],
    ]),
    ...evidence(trygSafety, [
      ["sikkerhet.vann", "Ved fravær over tre døgn må hovedstoppekranen stenges og eventuell egen vannpumpe slås av. Rør og sanitærutstyr må tappes ved behov for å unngå frost.", 1, "1.2 – Vann, rør og tilknyttet utstyr"],
    ]),
  ]);
}
registerAddOn(trygPests, "Råte og skadedyr", [
  ["rate.dekning", "Dekker blant annet nedbrytning av bygningsmaterialer fra råtesopp gjennom VIS Forsikring.", 1, "2"],
  ["dyr.dekning", "Omfatter angitt bygningsskade fra dyr og innvendig bekjempelse av mus og rotter ved påvist aktivitet.", 1, "2"],
]);
registerAddOn(trygRental, "Utleieforsikring", [
  ["utleie.dekning", "Omfatter blant annet angitt skadeverk og inntil seks måneders misligholdt leie, én gang per leietaker.", 1, "2.1–2.3"],
]);

const ifTerms = registerSource("cabin:if:building", "if", "If", {
  filename: "if/hus/Bygningsforsikring.pdf", documentName: "Bygningsforsikring",
  termsNumber: "BGN1-0", effectiveFrom: "2023-09", physicalPages: [1, 25],
  url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Bygningsforsikring",
  sha256: "9d2d36695c5677aea3e92ff8d395a9c5403f3d7d2afedb8e3447d9af21f526fe",
});
for (const [variant, name] of [["basis", "Basis"], ["utvidet", "Utvidet"], ["super", "Super"]] as const) {
  const extended = variant !== "basis";
  registerProduct(ifTerms, variant, name, evidence(ifTerms, [
    ["brann.dekning", "Brann, eksplosjon og plutselig nedsoting omfattes.", 6, "4.1.1", "included"],
    ["vann.dekning", "Rør- og vannskade omfattes. Dokumentert tining av utvendig frossen vann- eller avløpsledning har grense på 50 000 kroner inkludert angitte merutgifter.", 8, "4.4", "included"],
    ["tyveri.dekning", "Tyveri og skadeverk på forsikringsstedet omfattes. Skaden må politianmeldes.", 8, "4.5", "included"],
    ["naturskade.dekning", "Omfatter blant annet skred, storm, flom, stormflo og jordskjelv etter vilkåret.", 7, "4.2", "included"],
    ["dyr.dekning", "Omfatter bekjempelse av gnagere og fysisk bygningsskade fra gnagere på forsikret fritidsbolig i Norden.", 11, "4.10", "included"],
    ["rate.dekning", extended ? "Dekker bygningsskade fra treødeleggende sopp og råte etter særvilkårene." : "Sopp- og råtedekningen krever Utvidet eller Super.", 12, "4.11", extended ? "included" : "unavailable"],
    ["utett.dekning", extended
      ? "Vanninntrengning over terrengnivå kan gi dekning for følgeskader. Utettheten må utbedres for egen regning. Enkelte konstruksjoner eldre enn 50 år er unntatt."
      : "Dekningen for vanninntrengning utenfra over terrengnivå krever Utvidet eller Super.", 8, "4.4", extended ? "included" : "unavailable"],
    ["feriegaranti.dekning", "Dekker tap inntil 50 000 kroner når fritidsboligen ikke kan brukes etter en skade som omfattes.", 5, "3.2.2", "included"],
    ["ansvar.dekning", "Bygningsforsikringen omfatter ansvar etter egne vilkår.", 2, "Oversikt over forsikringen", "included"],
    ["rettshjelp.dekning", "Bygningsforsikringen omfatter rettshjelp etter egne vilkår.", 2, "Oversikt over forsikringen", "included"],
    ["egenandel.egenandel", "Beløpet i forsikringsbeviset gjelder når vilkårene ikke gir en særskilt egenandel.", 19, "5.7"],
    ["sikkerhet.vann", "Ved fravær over tre dager må hovedstoppekranen stenges, rørledningen avlastes ved å åpne tappekranene og stoppekranen kontrolleres for lekkasje.", 23, "6.3.3"],
  ]));
}

const gjensidigeBase = registerSource("cabin:gjensidige:standard", "gjensidige", "Gjensidige", {
  filename: "private-cabin/gjensidige-hytte.pdf", documentName: "Hytte – alminnelige vilkår",
  termsNumber: "", effectiveFrom: "", physicalPages: [1, 17],
  url: "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hytte-Standard-alminnelige-vilkar.pdf",
  sha256: "c9a0bca16a12a512242e7192781a4b3fafc56f7fdb6e9e549c200bea40012ab0",
});
const gjensidigePlus = registerSource("cabin:gjensidige:pluss", "gjensidige", "Gjensidige", {
  filename: "private-cabin/gjensidige-hytte-pluss.pdf", documentName: "Hytte Pluss – alminnelige vilkår",
  termsNumber: "", effectiveFrom: "", physicalPages: [1, 18],
  url: "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hytte-Pluss-alminnelige-vilkar.pdf",
  sha256: "034e140e2951f2c8ac113dcb2e2571ab164c3a21c3c41c76f31f43850c99a758",
});
for (const [variant, name, terms] of [["standard", "Hytte", gjensidigeBase], ["pluss", "Hytte Pluss", gjensidigePlus]] as const) {
  const plus = variant === "pluss";
  const rows: Row[] = [
    ["brann.dekning", "Plutselig og uforutsett skade fra brann, lyn, eksplosjon, nedsoting eller elektriske fenomener omfattes.", 3, "Hvilke skader?", "included"],
    ["vann.dekning", "Dekker blant annet rørlekkasje og vann fra grunnen eller terreng når det danner vannspeil.", 3, "Hvilke skader?", "included"],
    ["tyveri.dekning", "Dekker tyveri fra bygning og skader etter tyveriet.", 3, "Hvilke skader?", "included"],
    ["naturskade.dekning", "Dekker direkte skade fra blant annet storm, flom, skred og stormflo etter naturskadevilkårene.", 4, "Hvilke skader?", "included"],
    ["dyr.dekning", "Omfatter bygningsskade forårsaket av mus, rotter og andre dyr, og bekjempelse av levende skadedyr i bygningen med vilkårenes unntak.", 3, "Hvilke skader?", "included"],
    plus
      ? ["rate.dekning", "Dekker nedbrytning fra råtesopp og treødeleggende insekter på fullverdiforsikret bygning. Vilkårene har særskilte unntak for deler på utsiden av bygningen.", 6, "Råte og skadeinsekter", "included"]
      : ["rate.dekning", "Standardvilkåret unntar sopp og råte under andre plutselige og uforutsette skader.", 4, "Hvilke skader? – unntak", "unavailable"],
    ["utett.dekning", plus
      ? "Dekker vannskade fra utetthet over bakkeplan ved fullverdi. Utbedring av selve taket eller veggen og vann gjennom tak eldre enn 50 år er unntatt."
      : "Vann som trenger inn gjennom utett bygning er unntatt, med særregler for åpning oppstått ved en dekningsmessig skade.", 3, "Hvilke skader?", plus ? "included" : "unavailable"],
    ["feriegaranti.dekning", "Etter en dekningsmessig skade beregnes kompensasjon for tiden hytta ikke kan brukes ut fra markedsleien for tilsvarende hytte i området, inntil 50 000 kroner.", plus ? 17 : 16, "Feriegaranti", "included"],
    ["ansvar.dekning", "Forsikringsoversikten oppgir inntil 5 000 000 kroner i ansvarsforsikringssum.", 1, "Forsikringsbevis – ansvar", "included"],
    ["rettshjelp.dekning", "Forsikringsoversikten oppgir inntil 100 000 kroner i rettshjelpssum.", 1, "Forsikringsbevis – rettshjelp", "included"],
    ["egenandel.egenandel", "Avtalt egenandel trekkes fra erstatningsoppgjøret. Egne regler kan gjelde for enkelte skadetyper.", plus ? 17 : 16, "Egenandel / Aldersfradrag"],
    ["sikkerhet.vann", "Når hytta står ubebodd i mer enn tre døgn, må hovedstoppekranen stenges og en kran åpnes for å tømme rørene.", 1, "Sikkerhetsforskrifter"],
  ];
  registerProduct(terms, variant, name, evidence(terms, rows));
}
for (const source of [gjensidigeBase, gjensidigePlus]) {
  const id = `${source.id}:utleie`;
  cabinFacts[id] = evidence(source, [
    ["utleie.dekning", "Krever registrert utleie i forsikringsbeviset. Omfatter forsettlig skadeverk fra leietaker, opptil seks måneders misligholdt leie og opptil 20 000 kroner til utkastelse.", 3, "Hvilke skader? – utleie"],
  ]);
  cabinAddOns.push({
    id, name: "Utleie", componentId: id, providerId: source.providerId,
    insuranceTypes: [insuranceType], requiresLevel: source.productIds!, agreementScope: "ordinary",
  });
}

const storebrand = registerSource("cabin:storebrand:building", "storebrand", "Storebrand", {
  filename: "storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf", documentName: "Vilkår for hus- og hytteforsikring",
  termsNumber: "HUS10", effectiveFrom: "2025-08-15", physicalPages: [1, 49],
  url: "https://www.storebrand.no/privat/forsikring/hytteforsikring/_/attachment/inline/bed0c667-5e49-4a74-a9fe-3fee13bb9393:4249e68c81c5f5b48d1fd01bb4aabb347f4d1976/vilkar-husforsikring.pdf",
  sha256: "d69c9ec3fc2edfd71c625dfcf9d19dc801dadfb3f627bc0105a78891a3eacd61",
});
for (const [variant, name] of [["standard", "Standard"], ["super", "Super"]] as const) {
  const superCover = variant === "super";
  registerProduct(storebrand, variant, name, evidence(storebrand, [
    ["brann.dekning", "Brann, eksplosjon og plutselig nedsoting fra fyringsenhet omfattes. Plutselige gnist- og sviskader har egen sumgrense.", 7, "B.4.1", "included"],
    ["vann.dekning", "Dekker blant annet lekkasje fra bygningens rør og plutselig vann utenfra gjennom terreng eller grunn etter vilkårene.", 10, "B.4.5", "included"],
    ["tyveri.dekning", "Tyveri og skadeverk på forsikringsstedet omfattes etter vilkårene.", 11, "B.4.6", "included"],
    ["naturskade.dekning", "Bygningsforsikringen omfatter naturskade etter naturskadeforsikringsloven.", 13, "B.4.9", "included"],
    ["dyr.dekning", superCover
      ? "Super dekker fysisk bygningsskade fra skadeinsekter, skadedyr og gnagere, med særvilkår for isolasjon og adkomst."
      : "Standard har bekjempelse av angitte skadedyr og bygningsskade fra rotter og mus etter vilkårene.", superCover ? 34 : 15, superCover ? "C.1.2" : "B.4.11", "included"],
    ["rate.dekning", superCover ? "Super omfatter fysisk nedbrytning fra ekte hussopp, andre treødeleggende sopper og råte." : "Bygningsskade fra ekte hussopp og råte krever Super.", 35, "C.1.3", superCover ? "included" : "unavailable"],
    ["utett.dekning", superCover
      ? "Super dekker følgeskader fra plutselig vanninntrengning gjennom utettheter over bakkenivå. Taket må være under 50 år. Selve utettheten dekkes ikke."
      : "Følgeskader fra vanninntrengning gjennom utettheter over bakkenivå krever Super.", 34, "C.1.1", superCover ? "included" : "unavailable"],
    ["feriegaranti.dekning", "Opptil 50 000 kroner til leie av midlertidig hytte når egen hytte ikke kan brukes på grunn av dekningsmessig skade.", 19, "B.5.2.2", "included"],
    ["ansvar.dekning", "Ansvarsforsikring er del av bygningsforsikringen på begge nivåer.", 2, "A – Sammendrag av dekninger", "included"],
    ["rettshjelp.dekning", "Rettshjelpsforsikring er del av bygningsforsikringen på begge nivåer.", 2, "A – Sammendrag av dekninger", "included"],
    ["egenandel.egenandel", "Den valgte egenandelen fremgår av forsikringsbeviset.", 2, "A – Sammendrag av dekninger"],
    ["sikkerhet.vann", "Ved fravær over tre døgn skal hovedstoppekranen stenges og rørene tømmes ved å åpne en vannkran.", 26, "B.6.4 – Hovedstoppekran"],
  ]));
}
registerAddOn(storebrand, "Utleieforsikring", [
  ["utleie.dekning", "Vilkårene krever skriftlig kontrakt og har egne regler for korttidsutleie av fritidsbolig.", 46, "F – Utleieforsikring"],
]);

const fremtindArchive = {
  filename: "private-cabin/fremtind-hytte.pdf",
  url: "https://dokument.fremtind.no/vilkar/fremtind/pm/eiendom/Vilkar_Topp_Fritidshus.pdf",
  sha256: "573d65c0883e6fe680d3ae0341d4ca947125e71be137f1cc130faba76252a361",
};
const fremtindBase = registerSource("cabin:fremtind:standard", "fremtind", "Fremtind", {
  ...fremtindArchive, documentName: "Standard bygningsforsikring – fritidshus",
  termsNumber: "PBK-200.100-015", effectiveFrom: "2024-01-01", physicalPages: [2, 7],
});
const fremtindTop = registerSource("cabin:fremtind:topp", "fremtind", "Fremtind", {
  ...fremtindArchive, documentName: "Topp bygningsforsikring – fritidshus",
  termsNumber: "PBK-200.200-010", effectiveFrom: "2023-03-15", physicalPages: [1, 2],
});
const fremtindPests = registerSource("cabin:fremtind:pests", "fremtind", "Fremtind", {
  filename: "fremtind/hus/canonical/Vilkar_Sopp_og_Rate_valgbar.pdf", documentName: "Sopp-, råte- og insektsforsikring",
  termsNumber: "PBK-200.301-009", effectiveFrom: "2024-01-01", physicalPages: [1, 1],
  url: "https://dokument.fremtind.no/vilkar/fremtind/pm/eiendom/Vilkar_Sopp_og_Rate_valgbar.pdf",
  sha256: "036537b5fba6c097cb3ecc93e269a84ed89bd044227b1224cc11aeb29556b245",
});
for (const [variant, name] of [["standard", "Standard"], ["topp", "Topp"]] as const) {
  const top = variant === "topp";
  registerProduct(top ? fremtindTop : fremtindBase, variant, name, [
    ...evidence(fremtindBase, [
      ["brann.dekning", "Omfatter blant annet brann, eksplosjon, lynnedslag og elektriske fenomener med vilkårenes unntak.", 3, "4.1", "included"],
      ["vann.dekning", "Rørlekkasje og inntrengning fra terreng når vann står over gulvet omfattes etter vilkårene.", 4, "4.2–4.3", "included"],
      ["tyveri.dekning", "Brann-, tyveri- og hærverkskader skal politianmeldes.", 5, "5.1"],
      ["naturskade.dekning", "Naturskade dekkes etter egne vilkår.", 4, "4.5", "included"],
      ["ansvar.dekning", "Omfatter privatansvar som eier av den forsikrede eiendommen etter egne ansvarsvilkår.", 3, "3.5", "included"],
      ["rettshjelp.dekning", "Omfatter rettshjelp etter egne vilkår.", 3, "3.6", "included"],
      ["egenandel.egenandel", "Egenandelen fremgår av forsikringsbeviset eller vilkårene. Hvis flere gjelder, trekkes den høyeste.", 7, "6"],
    ]),
    ...(top ? evidence(fremtindTop, [
      ["dyr.dekning", "Fysisk bygningsskade, svekket isolasjonsevne eller lukt fra dyr på fullverdiforsikret hytte og bekjempelse ved påvist aktivitet omfattes etter vilkårene.", 1, "2.2", "included"],
      ["utett.dekning", "Omfatter følgeskade fra vann over terrengnivå, også fra utett tak som ikke er eldre enn 50 år. Selve feilen og skader på selve taket eller veggen er unntatt.", 1, "2.1", "included"],
      ["feriegaranti.dekning", "For fritidsbolig utvides sumgrensen for dekket brukstap og tapt husleie til ubegrenset sum.", 1, "1.1", "included"],
    ]) : evidence(fremtindBase, [
      ["dyr.dekning", "Skade som skyldes dyr eller insekter er unntatt fra standardvilkårets dekning for annen skade.", 4, "4.4", "unavailable"],
      ["utett.dekning", "Standardvilkåret unntar vann fra utett tak eller utett overgang mellom tak og vegg.", 4, "4.2", "unavailable"],
      ["feriegaranti.dekning", "Tap ved erstatningsmessig skade, inkludert eventuell tapt husleie, er begrenset til 25 000 kroner for fritidsbolig.", 3, "3.4", "included"],
    ])),
  ]);
}
registerAddOn(fremtindPests, "Sopp, råte og insekter", [
  ["rate.dekning", "Omfatter blant annet skade fra råte, ekte hussopp og treødeleggende sopp eller insekter på fullverdiforsikret hytte.", 1, "1.1–1.2"],
]);

const frende = registerSource("cabin:frende:building", "frende", "Frende", {
  filename: "frende/hus/canonical/Vilkar-husforsikring.pdf", documentName: "Vilkår for hus- og hytteforsikring",
  termsNumber: "", effectiveFrom: "2026-09-01", physicalPages: [1, 16],
  url: "https://api.frende.no/documents/terms/public/pnc/VacationHomeInsurance",
  sha256: "6938aa5da4dc6d21996a635cfeb9bd0f156be0a8a991d6fcceb5e02e2b4aeca7",
});
for (const [variant, name] of [["standard", "Standard"], ["utvidet", "Utvidet"]] as const) {
  const extended = variant === "utvidet";
  registerProduct(frende, variant, name, evidence(frende, [
    ["brann.dekning", "Omfatter brann, plutselig nedsoting og eksplosjon med vilkårenes unntak.", 3, "4.1–4.2", "included"],
    ["vann.dekning", "Plutselige rørlekkasjer og vannskader i de angitte tilfellene dekkes. Tining av frossen utvendig ledning har grense 50 000 kroner.", 4, "5.1 og 5.3", "included"],
    ["tyveri.dekning", "Tyveri og hærverk omfattes av standard bygningsforsikring etter vilkårenes nærmere regler.", 4, "5.1", "included"],
    ["naturskade.dekning", "Direkte naturskade omfattes etter naturskadeforsikringsloven og vilkårenes objektunntak.", 3, "4.1–4.3", "included"],
    ["dyr.dekning", "Standard skadedyrforsikring dekker bygningsskade fra dyr og bekjempelse av mus og rotter etter vilkårene.", 4, "5.2", "included"],
    ["utett.dekning", extended
      ? "Omfatter innvendig følgeskade fra lekkasje gjennom tak eller vegg. Reparasjon av taket eller veggen som vannet trengte gjennom er unntatt."
      : "Dekning av innvendige følgeskader fra utett tak eller vegg hører til Utvidet.", 13, "9.1 og 9.5", extended ? "included" : "unavailable"],
    ["feriegaranti.dekning", "Kompensasjon etter bygningsskade beregnes etter den faktiske bruken av hytta, inntil 50 000 kroner.", 7, "6.10", "included"],
    ["utleie.dekning", "Vilkårets særdekning for skadeverk ved utleie av bolig gjelder ikke hytter.", 4, "5.4", "unavailable"],
    ["ansvar.dekning", "Forsikringen omfatter eieransvar for den forsikrede eiendommen etter vilkårene.", 10, "7", "included"],
    ["rettshjelp.dekning", "Forsikringen omfatter juridisk bistand ved dekningsberettigede tvister etter vilkårene.", 11, "8", "included"],
    ["egenandel.egenandel", "Beløpet i forsikringsbeviset gjelder med mindre vilkårene setter en særskilt egenandel.", 8, "6.14"],
    ["sikkerhet.vann", "Steng hovedstoppekranen og kontroller med en åpen tappekran. Fristen er fravær over tre døgn fra 1. oktober til 1. april, ellers fravær over 15 døgn.", 15, "14 – Sikkerhetsforskrifter punkt 8 (fortsetter på side 16)"],
  ]));
}
registerAddOn(frende, "Sopp, råte og skadedyr", [
  ["rate.dekning", "VIS Forsikring dekker blant annet bygningsskade fra råtesopp og bekjempelse av skadeinsekter.", 13, "10–10.1"],
]);
