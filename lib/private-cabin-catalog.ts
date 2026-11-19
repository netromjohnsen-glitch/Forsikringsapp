import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { trygHusFacts, trygHusSources } from "./tryg-hus-catalog.ts";
import { ifHusFacts, ifHusSources } from "./if-hus-catalog.ts";
import { storebrandHusFacts, storebrandHusSources } from "./storebrand-hus-catalog.ts";
import { frendeHusFacts, frendeHusSources } from "./frende-hus-catalog.ts";

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
  termsNumber: "PBK-200.100-015", effectiveFrom: "2024-01-01", physicalPages: [2, 8],
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


// Shared building clauses apply to the same archived building PDF. Cabin-only
// scope is established below, before rebinding the original page and source.
type DetailRow = [key: string, label: string, value: string, page: number, section: string,
  deductible?: CatalogFact["deductibleClassification"]];

function detailedEvidence(source: CabinSource, rows: DetailRow[]): CatalogFact[] {
  return rows.map(([key, label, value, page, section, deductibleClassification]) => ({
    key: `hytte.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: source.id, page, section, filename: source.filename,
      termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom,
      company: source.company, url: source.url, version: source.version, agreementScope: "ordinary",
    },
  }));
}

function appendCabinFacts(productId: string, additions: CatalogFact[]) {
  const existing = cabinFacts[productId];
  if (!existing) throw new Error(`Unknown cabin component ${productId}`);
  for (const fact of additions) {
    if (existing.some(candidate => candidate.key === fact.key)) continue;
    existing.push(fact);
    const source = cabinSources[fact.source.documentId];
    const productIds = source.productIds ??= [];
    // Optional component IDs identify the selected component, not a new level.
    const eligible = cabinAddOns.find(addOn => addOn.componentId === productId)?.requiresLevel ?? [productId];
    for (const id of eligible) if (!productIds.includes(id)) productIds.push(id);
  }
}

function sharedBuildingFacts(source: CabinSource, references: Record<string, CatalogSource>,
  facts: CatalogFact[], keys: readonly string[], pageOffset: number | Record<string, number> = 0): CatalogFact[] {
  return facts.filter(fact => keys.includes(fact.key.replace(/^hus\./u, ""))).map(fact => {
    if (references[fact.source.documentId]?.sha256 !== source.sha256) {
      throw new Error(`Cabin source differs from shared building source ${fact.source.documentId}`);
    }
    const [rebound] = detailedEvidence(source, [[fact.key.replace(/^hus\./u, ""), fact.label,
      fact.value, typeof pageOffset === "number" ? fact.source.page + pageOffset : pageOffset[fact.key], fact.source.section, fact.deductibleClassification]]);
    return { ...rebound, ...(fact.coverageAvailability ? { coverageAvailability: fact.coverageAvailability } : {}) };
  });
}

const sharedBuildingKeys = [
  "avtale.forbehold", "forsikringsform", "bygninger.dekning", "bygninger.utsmykning",
  "andrebygninger.endring", "ror.utvendig", "hage.objekter", "hage.basseng", "hage.brygge",
  "rydding.dekning", "pabud.vilkar", "pabud.grense", "pabud.dekning",
  "gjenoppforing.prisstigning", "elektrisk.dekning", "eksplosjon.dekning",
  "vaer.dekning", "vaer.begrensning", "snovejr.dekning", "vann.utstromming", "vann.terreng",
  "ror.brudd", "ror.tining", "vatrom.folgeskade", "vatrom.selverommet", "plutselig.dekning",
  "skadedyr.bygningsskade", "skadedyr.bekjempelse", "gjenoppforing.hovedregel",
  "gjenoppforing.annetsted", "gjenoppforing.markedsverdi", "gjenoppforing.ingen",
  "gjenoppforing.oppgjorsmate", "skadedyr.egenandel", "naturskade.egenandel",
  "vaer.egenandel", "ror.frost.egenandel", "teknisk.glass.egenandel", "glass.egenandel",
  "egenandel.gjentatt_skade", "vannoverflate.egenandel", "egenandel.fritak",
  "vann.egenandel.alder_frost_vannforhold", "aldersfradrag.bereder_pumpe",
  "aldersfradrag.oppvarming", "aldersfradrag.ventilasjon_solceller",
  "aldersfradrag.integrerte_hvitevarer", "aldersfradrag.utvendige_ror",
  "aldersfradrag.badeinnretning", "aldersfradrag.utvendige_ledninger_tanker",
  "aldersfradrag.varmtvannsbereder_pumper", "aldersfradrag.basseng_boblebad",
  "aldersfradrag.oppvarming_kjoling", "ansvar.grense", "ansvar.egenandel",
  "rettshjelp.grense", "rettshjelp.egenandel", "handverker.folgeskade",
  "handverker.juridisk", "glass.isolerglass_punktering", "vann.vannstopper",
];

// Full-year-home inspections, primary-home adaptation and ordinary rental
// protection are excluded. Their object/selection conditions do not establish
// ordinary cabin cover.
for (const product of cabinProducts.filter(product => product.providerId === "if")) {
  const extended = product.productId !== "if-hytte-basis";
  const superCover = product.productId === "if-hytte-super";
  const selected = new Map(ifHusFacts.ifHusBasis.map(fact => [fact.key, fact]));
  if (extended) for (const fact of ifHusFacts.ifHusExtended) selected.set(fact.key, fact);
  if (superCover) for (const fact of ifHusFacts.ifHusSuper) selected.set(fact.key, fact);
  appendCabinFacts(product.productId, sharedBuildingFacts(ifTerms, ifHusSources, [...selected.values()], sharedBuildingKeys));
}
for (const product of cabinProducts.filter(product => product.providerId === "storebrand")) {
  const selected = new Map(storebrandHusFacts.storebrandHusStandard.map(fact => [fact.key, fact]));
  if (product.productId === "storebrand-hytte-super") {
    for (const fact of storebrandHusFacts.storebrandHusSuper) selected.set(fact.key, fact);
  }
  const building = selected.get("hus.bygninger.dekning")!;
  selected.set(building.key, { ...building, value: product.productId === "storebrand-hytte-standard"
    ? "Bygninger i forsikringsbeviset med vanlig fastmontert utstyr. Uspesifiserte frittstående bygg inntil 10 m² omfattes med Standard."
    : "Bygninger i forsikringsbeviset med vanlig fastmontert utstyr. B.3 angir at uspesifiserte småbygg inntil 10 m² omfattes med Standard, mens tabellen angir at de ikke er omfattet med Super. Eventuelle tilleggsbygg må avklares i forsikringsbeviset." });
  const settlement = selected.get("hus.gjenoppforing.hovedregel")!;
  selected.set(settlement.key, { ...settlement,
    value: "Hytte følger regelen for andre bygninger. Reparasjon/gjenoppføring til samme eller vesentlig samme stand beregnes etter pris på skadedagen, med fradrag for markedsverdiøkning over 40 prosent. Faste boligers særskilte fullverdigaranti kan ikke anvendes på hytte.",
    source: { ...settlement.source, section: "B.6.2.1.2 – Andre bygninger (garasje, hytte m.m.)" } });
  // Existing shared rows mix printed and physical page references.
  const physicalPages: Record<string, number> = {
    "hus.avtale.forbehold": 1, "hus.forsikringsform": 20, "hus.bygninger.dekning": 6,
    "hus.bygninger.utsmykning": 5, "hus.andrebygninger.endring": 7, "hus.ror.utvendig": 6,
    "hus.hage.objekter": 6, "hus.hage.brygge": 5, "hus.rydding.dekning": 18,
    "hus.pabud.grense": 25, "hus.elektrisk.dekning": 8, "hus.vaer.dekning": 9,
    "hus.ror.brudd": 9, "hus.vann.utstromming": 10, "hus.vann.terreng": 10,
    "hus.vatrom.folgeskade": 11, "hus.vatrom.selverommet": 11, "hus.plutselig.dekning": 12,
    "hus.skadedyr.bekjempelse": 16, "hus.skadedyr.bygningsskade": 16,
    "hus.gjenoppforing.hovedregel": 21, "hus.gjenoppforing.annetsted": 21,
    "hus.gjenoppforing.markedsverdi": 22, "hus.naturskade.egenandel": 30,
    "hus.vann.egenandel.alder_frost_vannforhold": 30, "hus.skadedyr.egenandel": 30,
    "hus.ansvar.grense": 40, "hus.ansvar.egenandel": 40,
    "hus.rettshjelp.grense": 41, "hus.rettshjelp.egenandel": 45,
    "hus.aldersfradrag.bereder_pumpe": 29, "hus.aldersfradrag.oppvarming": 29,
    "hus.aldersfradrag.integrerte_hvitevarer": 29, "hus.aldersfradrag.utvendige_ror": 29,
    "hus.aldersfradrag.badeinnretning": 29,
    "hus.handverker.folgeskade": product.productId === "storebrand-hytte-super" ? 36 : 12,
    "hus.vann.vannstopper": 37,
  };
  if (product.productId === "storebrand-hytte-super") {
    physicalPages["hus.skadedyr.bygningsskade"] = 34;
    physicalPages["hus.vatrom.folgeskade"] = 36;
    physicalPages["hus.vatrom.selverommet"] = 36;
  }
  appendCabinFacts(product.productId, sharedBuildingFacts(storebrand, storebrandHusSources,
    [...selected.values()], sharedBuildingKeys, physicalPages));
}
for (const product of cabinProducts.filter(product => product.providerId === "frende")) {
  const selected = new Map(frendeHusFacts.frendeHusStandard.map(fact => [fact.key, fact]));
  if (product.productId === "frende-hytte-utvidet") {
    for (const fact of frendeHusFacts.frendeHusExtended) selected.set(fact.key, fact);
  }
  appendCabinFacts(product.productId, sharedBuildingFacts(frende, frendeHusSources, [...selected.values()], sharedBuildingKeys));
}

for (const [productId, source, extra] of [
  ["tryg-hytte-standard", trygBase, false],
  ["tryg-hytte-ekstra", trygExtra, true],
] as const) {
  appendCabinFacts(productId, detailedEvidence(trygProduct, [
    ["avtale.forbehold", "Forsikringsbevis og fellesvilkår", "Forsikringsbeviset går foran vilkårene og angir valgte dekninger. Generelle vilkår PGE91000 gjelder i tillegg.", 1, "Innledning"],
    ["avtale.personer", "Hvem er sikret?", "Forsikringstaker, ektefelle eller samboer med samme folkeregistrerte adresse og øvrige medlemmer av fast husstand. Bokollektiv regnes ikke som fast husstand. Tinglyste rettighetshavere i fast eiendom omfattes også.", 1, "1"],
    ["avtale.eierskifte", "Eierskifte", "Forsikringen opphører ved eierskifte, men gjelder inntil 14 dager for ny eier dersom denne ikke har avtalt egen forsikring.", 1, "4"],
  ]));
  appendCabinFacts(productId, detailedEvidence(source, [
    ["forsikringsform", "Fullverdi og førsterisiko", extra
      ? "Bygning Ekstra er fullverdiforsikring. Utgangspunktet er gjenoppføring til samme eller vesentlig samme stand. Vilkårets særgrenser går foran summen i beviset."
      : "Fullverdi gjelder med mindre førsterisiko er spesifisert i beviset. Førsterisiko begrenser oppgjøret til avtalt sum. Summen reguleres årlig etter SSBs prisindeks, og særgrenser i vilkåret går foran bevisets sum.", 1, "Innledning"],
    ["bygninger.dekning", "Forsikrede bygninger og utsmykning", extra
      ? "Bygningene i forsikringsbeviset og kunstnerisk utsmykning omfattes."
      : "Bare bygningene i forsikringsbeviset omfattes. Kunstnerisk utsmykning er unntatt.", 1, "1.1"],
    ["ror.utvendig", "Utvendige rør og ledninger", "Tilknyttede utvendige rør og ledninger omfattes. Brønn, borehull, drens-, infiltrasjons- og spredeledning samt spredegrøft er unntatt. Drensledning omfattes likevel ved brann og naturskade. Basseng håndteres som hageanlegg.", 1, "1.2–1.3"],
    ["hage.grense", "Hageanlegg – grense", extra
      ? "1 000 000 kroner, uten denne sumgrensen ved brann eller naturskade på hageanlegg tilknyttet hytta. Fast tilkoblet basseng regnes med."
      : "500 000 kroner, uten denne sumgrensen ved brann eller naturskade på hageanlegg tilknyttet hytta. Fast tilkoblet basseng regnes med.", 1, "1.3"],
    ["hage.brygge", "Trebrygge og flytebrygge", "Bare brann og naturskade, samlet inntil 100 000 kroner. Økt bryggesum krever egen avtale i beviset.", 1, "1.3"],
    ["rydding.dekning", "Riving, rydding og deponering", "Merutgifter etter erstatningsmessig bygningsskade omfattes. Ved førsterisiko er grensen 20 prosent av forsikringssummen.", 1, extra ? "1.5, fortsetter på PDF-side 2" : "1.4, fortsetter på PDF-side 2"],
    ["pabud.grense", "Offentlige påbud – grense", extra
      ? "Merutgifter ved påbud etter skade omfattes. For fredede bygninger er grensen 1 000 000 kroner."
      : "Inntil 2 000 000 kroner. Ved førsterisiko gjelder 20 prosent av summen, maksimalt 2 000 000 kroner.", 2, extra ? "1.5" : "1.4"],
    ["pabud.vilkar", "Offentlige påbud – vilkår", "Omfatter påbudskostnader knyttet til skadd del, nødvendige grunnundersøkelser og fundamentering. Kjellerutgraving og påbud som kunne vært gitt uten skaden er unntatt. Arbeid må være avsluttet innen fem år, og kostnadene påløpt og dokumentert. Større nybygg gir forholdsmessig beregning.", 7, "3.6"],
    ["elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Plutselig og uforutsett skade ved lynnedslag, kortslutning, elektrisk fenomen eller tilsvarende.", extra ? 2 : 3, "2.2"],
    ["brann.egenandel.alarm", "Brannalarm – egenandelsreduksjon", extra
      ? "Inntil 6 000 kroner i reduksjon når brannalarm koblet til alarmsentral varsler om brannen."
      : "Inntil 6 000 kroner i reduksjon når tilkoblet brannalarm varsler. Ingen egenandel når Smarthytte er særskilt tegnet og tilhørende røyksensor varsler skaden.", 2, "2.1 – Egenandel", "override"],
    ["vann.egenandel.terreng", "Terrengvann – egenandel", "Minimum 8 000 kroner ved vann fra terreng eller grunn.", 3, "2.3 – Egenandel", "coverage"],
    ["vann.egenandel.gjentatt", "Gjentatt vannskade", "20 000 kroner i tillegg ved tilsvarende skade de siste 36 månedene fra terreng/grunn eller innvendig rør. " + (extra ? "Tillegget gjelder også inntrengning gjennom flatt tak, balkong eller terrasse." : ""), 3, "2.3 – Egenandel", "coverage"],
    ["vann.egenandel.fritak", "Vannstopp og overvannstiltak", "Ingen egenandel ved brudd på innvendig vannledning når automatisk vannstoppventil er i bruk og sikrer hele rørsystemet. Ingen egenandel ved overvannsskade når angitte tanker, magasiner eller overvannsdammer er etablert. Vannalarm til alarmsentral kan redusere egenandelen med inntil 6 000 kroner.", 3, "2.3 – Egenandel", "override"],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", extra
      ? "Vann fra utett våtrom kan dekkes i tilstøtende og underliggende rom. Skade på selve våtrommet innenfor bjelkelag og stenderverk er unntatt."
      : "Vannskade fra utett våtrom, sluk og oppforing rundt sluk er unntatt. Selve det utette våtrommet er også unntatt.", 3, "2.3"],
    ["ror.brudd", "Rørbrudd og tilknyttet utstyr", "Brudd på innvendige rør og utstyr samt utvendige væskerør, drenskum, septik-/oljetank, vann-/kloakkpumpe, rensetank og elektrisk ledning omfattes. Egenandel trekkes per bruddsted.", 3, "2.4"],
    ["ror.frost", "Frosset utvendig rør", extra
      ? "Ingen egenandel ved førstegangs staking eller TV-undersøkelse etter punkt 2.4."
      : "Frysing av utvendig rør uten fysisk brudd gir ikke dekning for utgifter eller tap. Takrenne og utvendig nedløp er unntatt.", 3, "2.4"],
    ["plutselig.unntak", "Andre skader – avgrensninger", extra
      ? "Slitasje, tæring, elde, kosmetikk, kjæledyr, insekter, bakterier, sopp/råte og utette gulv/vegger i våtrom er unntatt. Følgeskade fra håndverkerfeil krever faglært arbeid og oppdagelse innen ti år. Selve feilen og tilkomst utover utbedring av følgeskaden omfattes ikke."
      : "Fundamentering, setninger, jordtrykk, frost/tele, material-/konstruksjonsfeil, feilmontering, slitasje, elde, dyr, insekter, bakterier og sopp/råte er unntatt. Enkelte unntak gjelder ikke glassbrudd. Punktert isolerglass og kosmetiske skader er unntatt. Glassmontering/transport utover glassprisen erstattes ikke.", 4, "2.6"],
    ["hage.vaer", "Hage – klimatiske unntak", "Hageanlegg og tilknyttet basseng med rør dekkes ikke ved dyr, frost eller andre klimatiske forhold. Skade ved flomlignende situasjon er likevel omfattet.", 4, "2.6"],
    ["vaer.egenandel", "Vind, snø og takras – egenandel", "Minimum 8 000 kroner ved vind svakere enn storm, snøtyngde eller ras fra tak.", 4, "2.6 – Egenandel", "coverage"],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte og leverandør", "Tryg velger kontantoppgjør, reparasjon, gjenoppføring eller tilsvarende gjenanskaffelse og leverandør. Kontantoppgjør begrenses til Trygs kostnad. Eget skadebegrensnings-, vaske- og ryddearbeid erstattes med 300 kroner per time. Merverdiavgift krever dokumentert betaling og fradragsføres ikke dobbelt.", extra ? 4 : 5, "3.1, fortsetter på PDF-side 5"],
    ["gjenoppforing.hovedregel", "Gjenoppføring – hovedregel", "Samme eller vesentlig samme stand med nye eller brukte tilsvarende deler. Samme sted og formål, eier på skadedagen eller ektefelle/samboer/livsarving som byggherre, innen fem år. Gjenverdier og planlagt utskifting trekkes fra. Urasjonell byggemåte og estetiske forskjeller på uskadde deler erstattes ikke.", 5, "3.3.1"],
    ["gjenoppforing.annetsted", "Annet sted, formål eller byggherre", "Annet sted i Norge gir fradrag for markedsverdiøkning over 40 prosent. Myndighetspålagt flytting innen samme kommune følger hovedregelen. Annet formål gir fradrag for hele verdiøkningen. Andre byggherrer eller manglende reparasjon innen fem år begrenser oppgjøret til markedsverdifallet.", 6, "3.3.2 A–D"],
    ["gjenoppforing.kjop", "Kjøp av annen fritidsbolig", "Ved totalskade kan annen fritidsbolig med samme formål kjøpes i samme fylke innen to år. Oppgjøret begrenses til markedsverdien før skaden. Påbud og prisstigning erstattes ikke. Rettighetshavere må samtykke til overføring av interessen. " + (extra ? "Oppgjøret er eksklusiv merverdiavgift." : ""), 6, "3.3.2 E"],
    ["gjenoppforing.riving", "Bygg bestemt revet", "Bygg bestemt revet og midlertidig bygg som ikke gjenoppføres erstattes til brukbare materialers salgsverdi fratrukket riving og transportklargjøring.", 6, "3.3.2 F"],
    ["aldersfradrag.ror", "Ledninger og tanker – aldersfradrag", "Utvendige ledninger og bunnledninger av annet materiale enn plast har 20 frie år, deretter 5 prosent per år til maksimalt 80 prosent. Tanker og kummer har 20 frie år, deretter 5 prosent til 100 prosent.", extra ? 6 : 7, "3.4", "coverage"],
    ["aldersfradrag.teknisk", "Teknisk utstyr – aldersfradrag", "Luft-luft/luft-vann-varmepumper, beredere, pumper og elektronikk har fem frie år, deretter 10 prosent til 100 prosent. Annen oppvarming/kjøling har ti frie år og 10 prosent til 100 prosent. Integrerte hvitevarer og mindre badeinnretninger har fem frie år og 10 prosent til 80 prosent. Solceller har 20 frie år og 10 prosent til 80 prosent.", extra ? 6 : 7, "3.4", "coverage"],
    ["aldersfradrag.beregning", "Aldersfradrag – beregning", "Beregnes før egenandel av hele reparasjonskostnaden. Eldste skadde del styrer. Det gjøres ikke aldersfradrag ved totalskade på fullverdiforsikret bygg, brann med løs ild eller naturskade.", extra ? 6 : 7, "3.4"],
    ["hage.oppgjor", "Hage – erstatningsberegning", "Tilbakeføring til samme eller vesentlig samme stand. Beplantning erstattes med tilsvarende ung handelsvare fra gartneri.", 7, "3.5"],
    ["feriegaranti.beregning", "Ubeboelig hytte – beregning", "Normal reparasjons-/gjenoppføringstid og årlig markedspris for umøblerte rom legges til grunn. Sparte utgifter og renter trekkes fra. Ved kjøp av annen hytte opphører kompensasjonen senest ved overtakelse.", 7, "3.7"],
    ["leietap.skade", "Tapt husleie etter bygningsskade", "Normal reparasjons-/gjenoppføringstid og årlig markedsleie legges til grunn. Tapt korttidsleie erstattes ikke. Sparte utgifter og renter trekkes fra. Ved kjøp av annen hytte opphører tapet senest ved overtakelse.", extra ? 7 : 8, "3.8"],
    ["gjenoppforing.prisstigning", "Prisstigning", "Beregnes fra skadedagen i normal håndverksmessig reparasjonstid etter SSBs gjennomsnittlige byggekostnadsindeks. Sparte utgifter og renter trekkes fra.", 8, "3.9"],
    ["oppgjor.rettighetshavere", "Panthaver, bo og ny eier", "Panthaver og konkursbo begrenses til det laveste av markedsverdifall og økonomisk interesse. Dødsbo begrenses til markedsverdifallet. Ny eiers mangelskrav mot sikrede omfattes ikke. Skjønn kan kreves av begge parter.", 8, "3.10–3.13"],
  ]));
  if (extra) appendCabinFacts(productId, detailedEvidence(source, [
    ["andrebygninger.endring", "Nye og endrede bygg", "Garasje, naust, uthus, tilbygg og påbygg oppført på forsikringsstedet etter siste fornyelse omfattes frem til neste fornyelse. Endringen må meldes snarest og senest innen fornyelsen.", 1, "1.4"],
    ["aldersfradrag.isolerglass", "Punktert isolerglass – aldersfradrag", "Ti frie år, deretter 5 prosent per år inntil 100 prosent. Regelen gjelder bare punktering.", 6, "3.4", "coverage"],
  ]));
  appendCabinFacts(productId, detailedEvidence(trygSafety, [
    ["sikkerhet.vedlikehold", "Vedlikehold og fagfolk", "Bygg skal oppfylle brann-/byggekrav og vedlikeholdes. Elektro- og VVS-arbeid krever godkjent håndverker. Synlige feil, lekkasjer og løse beslag skal utbedres straks. Renner, nedløp, kummer og sluk renses hver vår og høst.", 1, "1.2"],
    ["sikkerhet.brann", "Røykvarsling og slokking", "Godkjent røykvarsler i hver etasje og slokkeutstyr som når alle rom. Gassutstyr installeres, kontrolleres og vedlikeholdes etter produsentens anvisninger.", 1, "1.2"],
    ["sikkerhet.tyveri", "Låsing og nøkler", "Dører låses, vinduer lukkes og stenges når ingen er til stede. Luftestilling er utilstrekkelig. Nøkler skal være utilgjengelige for uvedkommende.", 1, "1.2"],
    ["sikkerhet.frost_sno", "Oppvarming og snørydding", "Bygning og basseng må holdes tilstrekkelig oppvarmet. Tak, balkong og terrasse må måkes for å hindre snøpress, ras og smeltevannsskade. Sprengning krever sertifisert personell.", 1, "1.2"],
    ["sikkerhet.oljetank", "Oljetank ute av bruk", "Tank skal tømmes og graves opp eller fjernes av fagkyndig. Påfyllingsanordning fjernes så feilpåfylling ikke kan skje.", 1, "1.2, fortsetter på PDF-side 2"],
    ["avtale.risiko", "Endringer, utleie og uaktsomhet", "Risikoendringer og ombygging må meldes. Betalt utleie krever avtale med Tryg, med det angitte familieunntaket. Forsett kan medføre bortfall og grov uaktsomhet redusert oppgjør. Ektefelle/samboers handlinger kan identifiseres med sikrede.", 2, "2–3"],
    ["avtale.meldefrist", "Melding av skade", "Skade skal meldes uten ugrunnet opphold. Retten til erstatning kan tapes hvis kravet ikke meldes innen ett år etter kunnskap om forholdene som begrunner det.", 3, "4"],
  ]));
}
appendCabinFacts("cabin:tryg:pests:optional", detailedEvidence(trygPests, [
  ["rate.langvarig_vann", "Langvarig aktiv vannskade", "Nedbrytning som skyldes vannskade som har vart mer enn ett år og fortsatt er aktiv ved oppdagelsen omfattes av det valgte tillegget.", 1, "2"],
  ["rate.objekter", "Tilleggets objekter", "Bygning og frittstående garasje angitt i beviset. Bygg brukt til næring eller landbruk og utvendig basseng/boblebad med tilknyttede rør omfattes ikke.", 1, "1.1"],
  ["rate.unntak", "Råte- og vannskader – unntak", "Varig fast innredning/utstyr, dører, vinduer, utvendig treverk, tak og laft er unntatt for råte/vann. Slit/elde, korrosjon, blåved/mugg, kosmetikk, kjæledyr, forebygging, indirekte tap, utvendige/bunnledninger og konstruksjoner mot terreng er blant unntakene. Skadeutvikling utenfor forsikringstiden dekkes ikke.", 1, "3"],
  ["skadedyr.tid", "Bekjempelse – tidsvilkår", "Bekjempelse etter påvist aktivitet krever aktivitet innen forsikringstiden. Tidligere aktivitet kan likevel omfattes dersom bygningsforsikringen ved aktivitetens start hadde dekket den. VIS velger metode og nødvendig tilkomst.", 1, "2–3"],
  ["rate.egenandel", "Råte og bygningsskade – egenandel", "6 000 kroner per skadetilfelle dersom ikke beviset angir annet.", 2, "4.2", "standard"],
  ["skadedyr.egenandel", "Bekjempelse – egenandel", "2 000 kroner dersom ikke beviset angir annet.", 2, "4.2", "standard"],
  ["rate.oppgjor", "VIS – oppgjør og samtykke", "VIS velger kontantoppgjør, reparasjon, gjenoppføring eller bekjempelse og leverandør. Avtalt egeninnsats honoreres med 250 kroner per time. Forhåndssamtykke kreves til bekjempelse/reparasjon. Krav meldes snarest og innen ett år.", 2, "4.1, jf. 4.3.3 på PDF-side 3"],
  ["rate.brukstap", "Brukstap ved skade under tillegget", "For fritidsbolig er grensen 25 000 kroner. Normal reparasjonstid og markedsleie legges til grunn med fradrag for sparte utgifter. Flytte- og lagringsutgifter ved nødvendig flytting omfattes.", 2, "4.3.1"],
  ["rate.aldersfradrag", "Tilleggets aldersfradrag", "Teknisk utstyr har egne fem-/tiårsfrister og 10 prosent årlig fradrag inntil 80 prosent. Ved tak/terrasse over 30 år, innvendig rør over 50 år eller våtrom over 20 år trekkes 50 prosent av skadekostnaden og maksimal erstatning er 200 000 kroner.", 3, "4.4, jf. tabellen i 4.3.2 på PDF-side 2", "coverage"],
  ["rate.vann.grense", "Vanninntrengning – særgrenser", "Via tak inntil 200 000 kroner per skade og 600 000 kroner per forsikringsår. Kondens fra hvitevarer, varmepumper o.l. inntil 50 000 kroner per skade og 100 000 kroner per år.", 3, "4.6"],
  ["rate.prisstigning", "Tillegget – prisstigning", "Normal reparasjons-/gjenoppføringstid, maksimalt 24 måneder, beregnet etter SSBs byggekostnadsindeks.", 3, "4.5"],
]));
appendCabinFacts("cabin:tryg:rental:optional", detailedEvidence(trygRental, [
  ["utleie.skadeverk.grense", "Skadeverk fra leietaker", "Inntil 500 000 kroner per skadetilfelle på bygning, hage og forsikret innbo. Slitasje, kosmetikk, vedlikehold og forbedring er unntatt.", 1, "2.1"],
  ["utleie.tyveri.grense", "Tyveri og underslag fra leietaker", "Inntil 500 000 kroner per skadetilfelle for innbo og løsøre på forsikringsstedet, utført av leietaker eller gjester.", 1, "2.2"],
  ["utleie.utkastelse.grense", "Utkastelse – kostnader", "Rimelige og nødvendige kostnader inntil 20 000 kroner ved manglende utflytting eller brudd på leieavtalen.", 1, "2.4"],
  ["utleie.egenandel", "Utleie – egenandel", "6 000 kroner per skadetilfelle. Misligholdt leie har egenandel på tre måneders leie, minst 10 000 kroner.", 1, "2.5", "coverage"],
  ["utleie.oppgjor", "Utleie – oppgjør", "Bygning og hage følger bygningsvilkårets oppgjørsregler. Tryg overtar utleiers krav mot leietaker for utbetalt beløp. Innbo følger egne reparasjons-/gjenanskaffelses- og verdifradragsregler.", 1, "2.6–3, utdypet på PDF-side 2–3"],
]));

const fremtindLiability = registerSource("cabin:fremtind:liability", "fremtind", "Fremtind", {
  ...fremtindArchive, documentName: "Ansvar – fellesvilkår i fritidshusarkivet",
  termsNumber: "FFE-002.001-007", effectiveFrom: "2023-01-01", physicalPages: [8, 9],
});
const fremtindLegal = registerSource("cabin:fremtind:legal", "fremtind", "Fremtind", {
  ...fremtindArchive, documentName: "Rettshjelp – fellesvilkår i fritidshusarkivet",
  termsNumber: "FFE-003.001-003", effectiveFrom: "2025-01-01", physicalPages: [10, 12],
});
const fremtindNatural = registerSource("cabin:fremtind:natural", "fremtind", "Fremtind", {
  ...fremtindArchive, documentName: "Naturskade – fellesvilkår i fritidshusarkivet",
  termsNumber: "FFE-001.001-006", effectiveFrom: "2023-01-01", physicalPages: [12, 13],
});
for (const product of cabinProducts.filter(product => product.providerId === "fremtind")) {
  const top = product.productId === "fremtind-hytte-topp";
  appendCabinFacts(product.productId, detailedEvidence(fremtindBase, [
    ["avtale.personer", "Hvem er sikret?", "Forsikringstaker og innehaver av tinglyst eiendomsrett, panterett eller annen tinglyst sikkerhetsrett i eiendommen.", 2, "1 – Standard bygningsforsikring"],
    ["avtale.geografi", "Forsikringssted", "Stedet som er angitt i forsikringsbeviset.", 2, "2 – Standard bygningsforsikring"],
    ["bygninger.dekning", "Forsikrede bygninger", "Bygningen i beviset med vanlig fastmontert utstyr. Tilleggsbygg inntil 10 m² bruttoareal er omfattet for brann og naturskade. Bygningsmaterialer til forsikret bygg lagret i bygning/container i Norge omfattes. Kunstnerisk utsmykning er unntatt på Standard.", 3, "3.1"],
    ["ror.utvendig", "Utvendige ledninger", "Ledninger med tilknyttet utstyr frem til offentlig ledning eller brønn. Overvanns-/infiltrasjonsledning, spredegrøft, brønn og borehull er unntatt.", 3, "3.2"],
    ["hage.objekter", "Hage og basseng", "Hageanlegg og tomt inntil fem mål. Standard dekker utvendig basseng/boblebad med ledninger inntil 200 000 kroner.", 3, "3.3"],
    ["hage.brygge", "Brygge – objektgrense", "Fast trebrygge og flytebrygge med installasjoner inntil 100 000 kroner. Andel i fellesbrygge er unntatt. Skadeårsakene følger særreglene i punkt 4.4–4.5.", 3, "3.3"],
    ["pabud.vilkar", "Offentlige påbud", "Merutgifter etter erstatningsmessig skade omfattes, ved førsterisiko inntil 20 prosent av valgt sum. Latente påbud, tap av nytteareal, forebyggende tiltak, grunnundersøkelse utenfor eiendommen og antikvarisk istandsetting er unntatt.", 3, "3.4"],
    ["rydding.dekning", "Riving, rydding og flytting", "Riving, rydding, bortkjøring og deponering av verdiløse rester omfattes. Ved førsterisiko er grensen 20 prosent av valgt sum. Nødvendig flytting og lagring omfattes.", 3, "3.4"],
    ["brann.unntak", "Brann – avgrensninger", "Svi-/gnistskade uten brann, heksesot, kjemisk sverting, konstruksjons-/material-/montasjefeil, spenninger i bygg og svinnsprekker/avskalling er unntatt etter punkt 4.1.", 3, "4.1"],
    ["vatrom.folgeskade", "Våtrom – følgeskade", "Vannskade på tilstøtende rom ved utett våtrom omfattes. Selve det utette våtrommet innenfor bjelkelag og stenderverk er unntatt på Standard.", 4, "4.2"],
    ["ror.brudd", "Rørbrudd og tining", "Brudd på innvendig rør, radiator og bereder samt utvendig rør, oljetank, septiktank og drenskum omfattes. Tining av utvendig vann-/avløpsledning inntil 50 000 kroner inklusive merutgifter og tap. Renner, nedløp, taksluk og drensledning med avløp er unntatt.", 4, "4.3"],
    ["plutselig.unntak", "Andre plutselige skader – unntak", "Standard unntar blant annet fundamentering, setning, jordtrykk, frost/tele, material-/montasjefeil, egne mangler, mekanisk svikt, dyr/insekter/bakterier, kosmetikk og punktert isolerglass. Brygge, takrenne/snøfanger ved snøskade, klimaskade på hage og frost/snø på basseng er unntatt.", 4, "4.4"],
    ["naturskade.brygge", "Utvidelse ved naturskade", "Ferdigmontert fastskrudd antenne/markise og flytebrygge omfattes særskilt. Fortøyning/moring og ren forskyvning av flytebrygge er unntatt.", 4, "4.5"],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte og arbeid", "Fremtind velger kontantoppgjør, reparasjon eller gjenoppføring og leverandør. Udokumenterte arbeidspenger beregnes med 75 prosent av kalkulert timesats uten MVA. Eget skadebegrensnings-, vaske- og ryddearbeid erstattes med 250 kroner per time. Betalt MVA dokumenteres. Brann, tyveri og hærverk politianmeldes.", 5, "5.1, starter på PDF-side 4"],
    ["gjenoppforing.hovedregel", "Gjenoppføring – hovedregel", "Samme eller vesentlig samme stand med pris på skadedagen og ferdigstillelse innen fem år. Fullverdibygg reparert av eier, ektefelle/samboer eller livsarving på samme sted og til samme formål får ikke verdiøkningsfradrag.", 5, "5.2.1–5.2.2.1"],
    ["gjenoppforing.annetsted", "Annet sted eller formål", "Verdiøkning over 40 prosent trekkes fra ved annet sted eller formål. Myndighetspålagt flytting innen kommunen er likestilt med samme sted. Annen byggherre eller ingen gjenoppføring innen fem år gir fradrag for hele verdiøkningen og markedsverdifall som øvre grense.", 5, "5.2.2.1–5.2.2.3"],
    ["gjenoppforing.kjop", "Kjøp av annen fritidsbolig", "Annen bygning i Norge til samme formål kan kjøpes innen to år ved totalskade. Oppgjøret begrenses av gjenoppføringspris uten MVA og markedsverdi før skade med 40 prosent tillegg. Dokumentert oppussing/tilpasning inntil 1 000 000 kroner innen to år etter kjøpet. Påbud og prisstigning omfattes ikke.", 5, "5.2.2.4"],
    ["forsikringsform", "Førsterisiko og endringer", "Førsterisiko er begrenset til bevisets sum med verdiøkningsfradrag over 40 prosent. Verdiøkende tilbygg/endringer må meldes for å unngå forholdsmessig underforsikring.", 5, "5.2.2–5.2.3"],
    ["gjenoppforing.riving", "Riving og bygg ute av bruk", "Bygg bestemt revet og midlertidig bygg som ikke gjenoppføres erstattes til brukbare materialers verdi fratrukket klargjøring. For bygg ute av bruk trekkes hele verdiøkningen fra, med markedsverdifall som øvre grense.", 6, "5.2.4–5.2.5"],
    ["aldersfradrag.ror", "Ledninger, tanker og solceller – aldersfradrag", "20 frie år og deretter 5 prosent per påbegynt år, maksimalt 80 prosent, for ledninger av annet enn plast, tanker/kummer av annet enn plast/glassfiber, sjø-/jordvarmeledninger og solceller.", 6, "5.3", "coverage"],
    ["aldersfradrag.teknisk", "Teknisk utstyr – aldersfradrag", "Basseng, luftvarmepumper, integrerte hvitevarer og smarthuselektronikk har fem frie år og 10 prosent årlig fradrag. Berg-/jordvarmepumpe har sju frie år. Beredere/pumper har fem frie år og 5 prosent. Varmekabler/annen varme/kjøling har ti frie år og 10 prosent. Maksimalt 80 prosent.", 6, "5.3", "coverage"],
    ["aldersfradrag.beregning", "Aldersfradrag – hvilke skader", "Fradragene gjelder ved lyn, spenningsfeil, annen tilfeldig/plutselig skade og brudd på ledning/utstyr. Eldste del og totale reparasjonskostnader legges til grunn.", 6, "5.3"],
    ["hage.oppgjor", "Hage – oppgjør", "Tilbakeføring til samme stand. Uten reparasjon erstattes det laveste av gjenopprettingskostnad og markedsverdifall. Beplantning erstattes som ung handelsvare. Forebygging/sikring omfattes ikke.", 6, "5.4"],
    ["leietap.beregning", "Brukstap og husleie – beregning", "Normal reparasjonstid og årlig markedsleie for umøblerte rom legges til grunn. Korttidsleie omfattes ikke. Sparte utgifter og renter trekkes fra.", 6, "5.5.2, fortsetter på PDF-side 7"],
    ["gjenoppforing.prisstigning", "Prisstigning", "Normal håndverksmessig gjenoppførings-/reparasjonstid etter SSBs byggekostnadsindeks.", 7, "5.5.3"],
    ["oppgjor.rettighetshavere", "Panthavere, bo og eierskifte", "Panthavere, konkursbo, dødsbo og andre nye eiere begrenses til det laveste av markedsverdifall og økonomisk interesse. Forsikringen opphører ved eierskifte og dekker ikke mangelskrav etter avhendingsloven. Skjønn kan kreves.", 7, "5.6–5.8"],
    ["egenandel.sikkerhetstiltak", "Forebyggende tiltak – egenandel", "FG-godkjente tiltak i drift kan redusere egenandelen med inntil 6 000 kroner ved angitte brann-, tyveri- og innvendige rørskader. Ved angitte overvannstiltak trekkes ingen egenandel på overvannsskaden.", 7, "6.1", "override"],
    ["glass.egenandel", "Glass og sanitærporselen – egenandel", "2 000 kroner når skaden rammer glass i vindu/dør eller sanitærporselen. Integrerte hvitevarer har også 2 000 kroner.", 7, "6.2–6.3", "coverage"],
    ["vann.egenandel.gjentatt", "Gjentatte vannskader", "20 000 kroner i tillegg ved gjentatt vannskade av samme årsak på samme bygg innen 24 måneder.", 7, "6.4", "coverage"],
  ]));
  appendCabinFacts(product.productId, detailedEvidence(fremtindLiability, [
    ["ansvar.grense", "Ansvar – forsikringssum", "5 000 000 kroner per skadetilfelle dersom ikke annet er avtalt. Flere skader fra samme hendelse regnes som ett tilfelle.", 8, "3.1"],
    ["ansvar.unntak", "Ansvar – avgrensninger", "Dekningen gjelder privat erstatningsansvar som eier av forsikret eiendom. Yrke/næring, avtaleutvidet ansvar, egne/leide/lånte ting, nær familie, motor/båt/luftfartøy, graving/sprengning og flere særskilte ansvarstyper er unntatt etter vilkåret.", 8, "3.1, fortsetter på PDF-side 9"],
    ["ansvar.oppgjor", "Ansvar – behandling av krav", "Krav meldes snarest. Sikrede skal dokumentere og medvirke og kan ikke erkjenne eller forhandle om ansvar uten samtykke. Selskapet behandler dekningsmessige krav og kan betale direkte til skadelidte.", 9, "4"],
    ["ansvar.egenandel", "Ansvar – egenandel", "4 000 kroner per skadetilfelle med mindre beviset sier annet.", 9, "5", "standard"],
  ]));
  appendCabinFacts(product.productId, detailedEvidence(fremtindLegal, [
    ["rettshjelp.omfang", "Rettshjelp – omfang og tvist", "Rimelige nødvendige advokat-, retts-, sakkyndig- og vitneutgifter ved tvist som eier av forsikret eiendom i Norden. Krav må være bestridt, eller møtt med taushet i mer enn to måneder. Sakkyndig uten rettsoppnevning er begrenset til 20 prosent av summen.", 10, "1–4.2"],
    ["rettshjelp.unntak", "Rettshjelp – avgrensninger", "Blant annet yrke/næring, annen eiendom, familie/arv, straff, ubestridt inkasso, ekspropriasjon, salærtvist og offentlig forvaltningssak er unntatt. Uttømte administrative klagemuligheter kan gi dekning ved etterfølgende søksmål. Særregler gjelder personskade og motor/båt.", 11, "4.2"],
    ["rettshjelp.grense", "Rettshjelp – grense", "100 000 kroner og den økonomiske interessen per tvist. Ved minst tre parter kan summen økes til 250 000 kroner. Finansklagenemnda inntil 15 000 kroner og forliksråd/jordskifterett inntil 25 000 kroner.", 11, "4.2 og 5.1"],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "Beløpet i beviset, med 20 prosent tillegg for advokat og sakkyndig. Standard bygningsvilkår angir 4 000 kroner. Én egenandel per tvist.", 12, "5.2, jf. Standard punkt 6.6 på PDF-side 7", "coverage"],
    ["rettshjelp.meldefrist", "Rettshjelp – melding og advokat", "Meldes skriftlig snarest og senest ett år etter at tvist er oppstått og advokat engasjert. Ved offentlig forvaltningssak regnes fristen fra uttømt klageadgang. Sikrede velger advokat, men likeartede parter kan pålegges felles bistand.", 12, "6–7"],
  ]));
  appendCabinFacts(product.productId, detailedEvidence(fremtindNatural, [
    ["naturskade.objekter", "Naturskade – objekter", "Brannforsikrede objekter i Norge og tomt inntil fem mål rundt forsikret fritidshus, med vei innen området. Ordinær naturskade har egne unntak blant annet for flytende konstruksjoner og visse brygger. Bygningsvilkårets særutvidelse for flytebrygge vurderes separat.", 12, "1.1"],
    ["naturskade.unntak", "Naturskade – unntak", "Direkte naturulykke omfattes. Frost, tele, tørke, nedbør, snøtyngde, isgang og skade fra dyr, insekter, bakterier eller sopp/råte omfattes ikke av naturskadevilkåret.", 13, "2.1"],
    ["naturskade.relokalisering", "Ny naturskaderisiko på tomten", "Ved offentlig byggeforbud etter skade eller ustabil grunn gjelder lovens totalskade- og tomteregler, begrenset til fem dekar. Skriftlig samtykke kan gi sikring som alternativ. Forebyggings- og konstruksjonsforhold kan redusere oppgjøret.", 13, "3"],
  ]));
  // The deductible is on the Standard component's page, not the natural-hazard subdocument.
  appendCabinFacts(product.productId, detailedEvidence(fremtindBase, [
    ["naturskade.egenandel", "Naturskade – egenandel", "Den myndighetsfastsatte egenandelen, oppgitt til 8 000 kroner i arkivet.", 8, "6.7", "coverage"],
  ]));
  if (top) appendCabinFacts(product.productId, detailedEvidence(fremtindTop, [
    ["hage.basseng.utvidelse", "Topp – basseng", "Basseng/boblebad med ledninger utvides til 500 000 kroner. Kunstnerisk utsmykning og verdiøkende endringer i perioden omfattes, med melding senest ved periodens slutt.", 1, "1.1"],
    ["dyr.unntak", "Topp – dyreskader", "Fysisk skade, svekket isolasjonsevne og lukt omfattes. Tidligere aktivitet, kosmetikk, kjæledyr, insekter/bakterier og isolasjon uten påvist funksjonstap er unntatt. Selskapet velger bekjempelsesmetode og firma.", 1, "2.2"],
    ["handverker.vatrom", "Topp – håndverkerfeil på våtrom", "Skade fra godkjent/autorisert håndverker eller entreprenør ved material-, konstruksjons- eller monteringsfeil. Konstatert innen ti år. Rettidig reklamasjon kreves. Innen reklamasjonstid kreves konkurs hos utførende. Selve feilen, eget arbeid, kjente feil og kosmetikk er unntatt.", 1, "2.3"],
    ["handverker.folgeskade", "Topp – andre håndverkerfeil", "Bygningsskade ved fagutført fundamenterings-, konstruksjons-, material- eller montasjefeil, konstatert innen ti år og med rettidig reklamasjon. Samme reklamasjons-/konkursvilkår som våtrom. Selve feilen, kondens, drensvann, sopp/råte og kosmetikk er unntatt.", 2, "2.4"],
    ["gjenoppforing.totalskade", "Topp – totalskadeterskel", "Ved skade over 75 prosent av gjenoppføringsprisen kan erstatning som totalskade kreves. Gjenverdier må rives og fjernes innen to år. Gjelder også førsterisiko innen forsikringssummen.", 2, "3.1"],
    ["handverker.egenandel", "Topp – håndverkerfeil egenandel", "Avtalt egenandel gjelder. Ved vannskade på våtrom som følge av håndverker-/entreprenørfeil økes den med 5 000 kroner.", 2, "4", "coverage"],
  ]));
}
appendCabinFacts("cabin:fremtind:pests:optional", detailedEvidence(fremtindPests, [
  ["rate.unntak", "Råte – unntak i tillegget", "Blåved, sverte-/muggsopp, jordslag og kosmetikk er unntatt. Tak fra overkant sperre/overgurt, dører, vinduer, lekter, utvendig treverk og laftede yttervegger er unntatt. Utvikling utenfor forsikringstiden og tilkomst gjennom ikke-dekket konstruksjon omfattes ikke.", 1, "1.1"],
  ["skadedyr.insekter", "Insekter – skade og bekjempelse", "På fullverdiforsikret fritidsbolig omfattes fysisk bygningsskade, svekket isolasjon og lukt fra insekter samt selskapsgodkjent bekjempelse av bygningsskadelige insekter. Rent kosmetiske forhold og bekjempelse etter opphør er unntatt.", 1, "1.2"],
  ["rate.egenandel", "Tillegget – egenandeler", "Ved skade på etasjeskiller mot krypkjeller eller jordgulv økes avtalt egenandel med 15 000 kroner. Bekjempelse av insekter har 2 000 kroner i egenandel.", 1, "2", "coverage"],
]));

for (const [productId, source, plus] of [
  ["gjensidige-hytte-standard", gjensidigeBase, false],
  ["gjensidige-hytte-pluss", gjensidigePlus, true],
] as const) {
  const commonOffset = plus ? 1 : 0;
  const settlement = plus ? 16 : 15;
  appendCabinFacts(productId, detailedEvidence(source, [
    ["avtale.personer", "Hvem er sikret?", "Forsikringstaker, ektefelle/samboer med felles folkeregistrert adresse, hjemmeboende barn og barn borte for utdanning/førstegangstjeneste uten adresseendring. Barn i fast husstand med delt foreldreansvar og privat medeier med tinglyst rett omfattes også.", 3, "Hvem gjelder forsikringen for?"],
    ["bygninger.dekning", "Bygninger og fast utstyr", "Bygningene i beviset med fastmontert utstyr og frittliggende bygg til og med 10 m² bruttoareal på forsikringsstedet. Større bygg krever oppføring i beviset.", 3, "Hva er forsikret?"],
    ["teknisk.solceller", "Solcelleanlegg", "Solceller som dekker privat forbruk omfattes.", 3, "Hva er forsikret?"],
    ["ror.utvendig", "Utvendige ledninger og objektunntak", "Ledninger med tilknyttet utstyr til offentlig ledning eller spredeledning omfattes. Brønn/borehull, hobbyveksthus og mineraloljetank/fyrkjel er unntatt. Drensledning dekkes bare ved brann og naturskade.", 3, "Hva er forsikret?, jf. unntak på PDF-side 4"],
    ["hage.objekter", "Hage og basseng", "Hageanlegg inntil fem dekar med utvendig badekilde/basseng. Fast brygge inntil 100 000 kroner bare ved brann eller naturskade. Molo/bølgebryter, flytebrygge og landgang er unntatt.", 3, "Hva er forsikret?"],
    ["vatrom.folgeskade", "Utett våtrom – følgeskade", "Vannskade på tilstøtende rom ved utett våtrom omfattes. Selve det utette våtrommet innenfor bjelkelag/stenderverk er unntatt fra denne dekningen.", 3, "Hvilke skader?"],
    ["dyr.unntak", "Dyreskader og bekjempelse – unntak", "Skade omfatter fysisk skade, påvist svekket isolasjonsevne og lukt. Kjæledyr, fredede dyr, forebygging og fjerning av rester uten bygningsskade er unntatt. Standard unntar også insekter. Pluss har egen råte-/insektdekning.", 4, "Hvilke skader? – avgrensninger"],
    ["plutselig.unntak", "Andre skader – avgrensninger", "Blant unntakene er manglende vedlikehold, slitasje, kosmetikk, punktert isolerglass, kondens, heksesot, setning/jordtrykk/frost og konstruksjons-/montasjefeil. Klima- og dyreskade på hage/basseng/brygge er unntatt, med unntak for flomlignende situasjon. Skade andre kan og skal erstatte etter garanti omfattes ikke.", 4, "Hvilke skader? – avgrensninger"],
    ["rydding.dekning", "Riving, rydding og deponering", "Etter erstatningsmessig skade omfattes riving, rydding, bortkjøring og deponering av verdiløse bygningsrester utover forsikringssummen.", plus ? 6 : 5, "Tilleggsytelser etter skade"],
    ["vann.vannavgift", "Økt vannavgift", "Økt vannavgift som følge av en erstatningsmessig skade omfattes utover forsikringssummen.", plus ? 6 : 5, "Tilleggsytelser etter skade"],
    ["sikkerhet.brann_tyveri", "Brannvern og låsing", "Dører/vinduer lukkes og låses og nøkler oppbevares utilgjengelig for uvedkommende. Bygningen må oppfylle brann-/byggekrav. Rør- og elektroarbeid utføres av godkjent håndverker.", 1, "Sikkerhetsforskrifter"],
    ["sikkerhet.vedlikehold", "Frost, snø og vedlikehold", "Tilstrekkelig oppvarming mot frost. Snø/is fjernes før bæreevnen overskrides og ved rasfare, også fra solceller og varmepumpe. Utvendige sluk renses vår/høst. Synlige tak-/veggfeil utbedres snarest.", 1, "Sikkerhetsforskrifter"],
    ["avtale.risiko", "Risikoendringer og underforsikring", "Utleie utenfor angitt familie, næringsbruk, endret rabattgivende sikring, for stort areal og verdiøkende til-/påbygg må meldes. Manglende melding kan redusere erstatningen etter forholdet mellom avtalt og korrekt pris.", 2, "Ansvarsbegrensninger"],
    ["avtale.meldefrist", "Frist for skademelding", "Krav meldes innen ett år etter at sikrede fikk kunnskap om forholdene som begrunner det, ellers kan retten falle bort.", 1, "Frist for å melde skade"],
    ["ansvar.omfang", "Eieransvar – omfang", "Rettslig erstatningsansvar som eier av forsikret eiendom i Norden. Person-, ting- og formuesskade konstatert i forsikringstiden omfattes etter fellesvilkåret. Plutselig og uforutsett forurensning kan omfattes.", 6 + commonOffset, "Ansvar – Hvilke ansvar?"],
    ["ansvar.unntak", "Eieransvar – avgrensninger", "Yrke/næring, nær familie, eget sameieandelstap, avtaleutvidet ansvar, lånte/leide ting, styreverv, gradvis forurensning, sopp/råte, straffbare eller forsettlige handlinger og særskilte motor-/båt-/luftfartøyansvar er blant unntakene. Graving/sprengning omfattes ikke automatisk som ordinært eieransvar.", 6 + commonOffset, "Ansvar – Dekkes ikke"],
    ["ansvar.egenandel", "Eieransvar – egenandel", "Egenandelen i forsikringsbeviset trekkes ved hvert tilfelle. Publisert oversikt oppgir 4 000 kroner. Samme ansvarsutløsende forhold regnes som ett tilfelle.", 7 + commonOffset, "Ansvar – Forsikringssum, egenandel og serieskade", "reference"],
    ["ansvar.oppgjor", "Eieransvar – krav og saksomkostninger", "Gjensidige behandler dekningsmessige krav over egenandel. Sikrede skal gi dokumenter og medvirke og må ikke påta seg ansvar eller forhandle uten godkjenning. Delvis dekning, forlik og krav over summen har særregler for saksomkostninger.", 7 + commonOffset, "Ansvar – Behandling av erstatningskrav"],
    ["rettshjelp.omfang", "Rettshjelp – kostnader", "Tvist som eier av forsikret eiendom i Norden. Rimelige nødvendige advokat-, retts-, sakkyndig- og vitneutgifter omfattes. Sakkyndig uten rettsoppnevning har grense 40 prosent av sum eller økonomisk interesse. Idømte sakskostnader og utgifter før tvist er unntatt.", 8 + commonOffset, "Rettshjelp – Hvilke utgifter?"],
    ["rettshjelp.unntak", "Rettshjelp – avgrensninger", "Blant unntakene er yrke/næring, annen eiendom, familie/arv, straff/ulovlig handling, ubestridt inkasso, forvaltning, salær og flere sameietvister. Vilkåret inneholder både en omtale av Husleietvistutvalget og en senere avgrensning. Den motstridende HTU-regelen er ikke brukt til å etablere en positiv hytterettighet.", 9 + commonOffset, "Rettshjelp – Dekkes ikke, starter på foregående PDF-side"],
    ["rettshjelp.grense", "Rettshjelp – forsikringssummer", "1–2 parter inntil 100 000 kroner, 3–10 inntil 250 000, 11–25 inntil 500 000, 26–49 inntil 750 000 og minst 50 inntil 1 000 000 kroner. Begrenset til økonomisk interesse og forsikrede parter. Gruppesøksmål har egne grenser.", 10 + commonOffset, "Forsikringssum og egenandel"],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kroner pluss 20 prosent av de dekkede utgiftene, én egenandel per tvist. Utenrettslig mekling via Mekle.no har null egenandel.", 10 + commonOffset, "Forsikringssum og egenandel", "coverage"],
    ["rettshjelp.meldefrist", "Rettshjelp – tvist og melding", "Bestridt krav er tvist. Dokumentert purret taushet over tre måneder kan også være tvist. Meldes snarest og senest ett år etter kontakt med advokat. Ved forvaltning regnes fristen fra uttømt klagebehandling. Salær og sakens løsning dokumenteres.", 10 + commonOffset, "Hva er en tvist? / Melding av rettshjelpssaker"],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte og arbeid", "Gjensidige velger bistått reparasjon/gjenoppføring eller kontantoppgjør og leverandør. Tilsvarende nye eller brukte materialer kan brukes. Udokumenterte arbeidspenger beregnes til 75 prosent av kalkulert timesats uten MVA, øvrig arbeid 300 kroner per time. Kontantoppgjør overstiger ikke selskapets reparasjonskostnad.", settlement, "Hvordan erstatningen blir beregnet"],
    ["gjenoppforing.hovedregel", "Fullverdi – gjenoppføring", "Samme sted og formål innen fem år uten verdiøkningsfradrag. Ved annet sted eller formål trekkes enhver markedsverdiøkning fra.", settlement, "Fullverdiforsikret bygning"],
    ["gjenoppforing.totalskade", "Totalskadeterskel", "Ved skade over 75 prosent av gjenoppføringskostnaden kan totalskadeoppgjør kreves uten gjenverdifradrag. Gjenverdiene må rives og fjernes innen to år.", settlement, "Fullverdiforsikret bygning"],
    ["forsikringsform", "Førsterisiko", "Avtalt sum er øvre grense ved reparasjon/gjenoppføring innen fem år. Verdiøkning over 40 prosent trekkes fra. Annet sted eller formål gir fradrag for all verdiøkning.", settlement, "Førsterisikoforsikret bygning"],
    ["gjenoppforing.ingen", "Ingen gjenoppføring og planlagt riving", "Uten reparasjon/gjenoppføring innen fem år er oppgjøret begrenset til det laveste av beregnet reparasjonskostnad og markedsverdifall. Planlagt revne/utskiftede deler erstattes etter brukbare materialers verdi. Uavhengige rivingskostnader erstattes ikke.", settlement, "Bygning som ikke repareres / bygning bestemt revet"],
    ["andrebygninger.endring", "Endrede bygg og areal", "Tilbygg, påbygg og sidebygg må meldes innen neste hovedforfall. Uregistrert verdiøkning og uriktig areal kan gi forholdsmessig underforsikring.", settlement, "Tilbygg, påbygg og sidebygg / Underforsikring på neste PDF-side"],
    ["aldersfradrag.ror", "Ledninger og tanker – aldersfradrag", "Ved brudd på utvendige ledninger/tanker av annet enn plast/glassfiber trekkes 5 prosent per påbegynt år fra 20 år, maksimalt 80 prosent. Eldste del styrer.", settlement + 1, "Egenandel / Aldersfradrag", "coverage"],
    ["aldersfradrag.teknisk", "Teknisk utstyr – aldersfradrag", "Luft-luft-varmepumpe og integrerte hvitevarer har fem frie år, øvrige oppvarmings-/kjøle-/ventilasjons-/VVS-installasjoner sju og varmekabler/bereder ti. Deretter 10 prosent per år, maksimalt 80 prosent. Hvitevarereparasjon og punktreparasjon av varmekabel/bereder har særskilt fritak. Utvendig badekilde har fem frie år.", settlement + 1, "Egenandel / Aldersfradrag", "coverage"],
    ["aldersfradrag.beregning", "Aldersfradrag – beregning", "Gjelder skadd gjenstand og nødvendige reparasjons-/utskiftingskostnader. Ingen fradrag ved totalskade av fullverdibygg, brann med ild eller naturskade.", settlement + 1, "Egenandel / Aldersfradrag"],
    ["egenandel.fritak", "Egenandelsfritak", "Fritak ved brudd på innvendig vannledning med vannstopp for hele bygget, ved elektrisk brann med godkjent kontroll de siste fem år og ved skade bare på overspenningsvern/brann-/innbruddsalarm.", settlement + 1, "Det trekkes ikke egenandel ved", "override"],
    ["pabud.vilkar", "Offentlige påbud – vilkår", "Nødvendige dokumenterte merkostnader til bygning, grunnundersøkelse og fundamentering etter skade omfattes når de ikke kan dekkes av det offentlige. Latente påbud, tap av nytteareal, antikvariske prinsipper og midlertidige/rivings-/rehabiliteringsbygg er unntatt. Større nybygg gir forholdsmessig beregning. Dispensasjon kan kreves søkt.", settlement + 2, "Merutgifter som følge av påbud"],
    ["naturskade.relokalisering", "Naturskade – ny tomterisiko", "Ved offentlig nektet gjenoppføring på grunn av ny naturskaderisiko gjelder lovens totalskade- og tomteregler, begrenset til fem dekar. Ustabil grunn kan omfattes selv uten skade på bygget. Sikring kan avtales skriftlig som alternativ.", settlement + 1, "Naturskade, fortsetter på neste PDF-side"],
    ["hage.oppgjor", "Hage og tomt – oppgjør", "Tilbakeføring til samme stand. Uten utbedring begrenses oppgjøret til det laveste av gjenopprettingskostnad og markedsverdifall. Svak konstruksjon og manglende forebygging kan redusere naturskadeoppgjør. Beplantning erstattes med ung handelsvare.", settlement + 2, "Naturskade og flomlignende situasjon på hageanlegg, jf. foregående oppgjørsside"],
    ["gjenoppforing.utbetaling", "Utbetaling, MVA og gjenstander", "Utbetaling følger fremdriften. Påløpt MVA må dokumenteres. Kontantoppgjør og flytting/annet formål krever tinglyste rettighetshaveres samtykke. Gjensidige kan overta erstattede materialer. Forsett/grov uaktsomhet og identifikasjon med ektefelle/samboer kan redusere oppgjøret.", settlement + 2, "Utbetaling av erstatning"],
    ["avtale.fornyelse", "Fornyelse og angrerett", "Ettårige avtaler fornyes automatisk. Tidsbegrenset avtale utløper på avtalt dato. Ved fjernsalg har privat skadeforsikring 14 dagers angrerett fra mottatt forsikringsdokument. Utløp og oppsigelse reguleres av fellesvilkårene.", 11 + commonOffset, "Generelle vilkår punkt 6–8"],
    ["avtale.eierskifte", "Eierskifte", "Fellesvilkåret regulerer opphør ved eierskifte og overgangsdekning i inntil 14 dager dersom ny eier ikke har tegnet egen forsikring.", 11 + commonOffset, "Generelle vilkår punkt 12"],
    ["avtale.krig", "Krig og uroligheter", "Krig/alvorlige uroligheter i Norge og deltakelse i krig er unntatt. Utenlandsregelen har særskilt UD-/skriftlig-avtalevilkår. Unntak som bare gjelder reise-, person-, yrkesskade- eller motorforsikring etablerer ingen hytteutvidelse.", 11 + commonOffset, "Generelle vilkår punkt 17, fortsetter på neste PDF-side"],
    ["avtale.terror", "Terror – begrensninger", "Samlet selskapsansvar er begrenset til 1 milliard kroner per hendelse, med 48-timers sammenregning og forholdsmessig reduksjon. Uttrykkelig opplistede særbygg og objekter utenfor Norden er unntatt. Hytte har ikke reise-/personunntakene.", 12 + commonOffset, "Generelle vilkår punkt 18"],
    ["avtale.farlig_spredning", "Biologisk, kjemisk og radioaktiv skade", "For øvrige forsikringer, herunder hytte, dekkes ikke de særskilt angitte tapene ved farlig biologisk/kjemisk spredning, raketter, atomvåpen eller radioaktiv stråling. Person-/reise-/lovbestemte personskaderegler gir ingen utvidelse til hytta.", 12 + commonOffset, "Generelle vilkår punkt 19"],
    ["avtale.sanksjoner", "Sanksjoner", "Erstatningsplikt og andre forpliktelser bortfaller når oppfyllelse bryter de sanksjons-/restriksjonsregelverkene fellesvilkåret angir.", 12 + commonOffset, "Generelle vilkår punkt 21"],
    ["oppgjor.skjonn", "Skjønn og klage", "Begge parter kan kreve sakkyndig skjønn. Verdifastsettelsen er bindende og øvre økonomiske grense. Partene bærer normalt egne skjønnsmenn og deler oppmann, men Gjensidige dekker angitte kostnader når selskapet krever skjønn overfor privatkunde. Klage kan bringes til selskapets klageinstans og Finansklagenemnda.", 13 + commonOffset, "Generelle vilkår punkt 24–26"],
  ]));
  if (plus) appendCabinFacts(productId, detailedEvidence(source, [
    ["handverker.vatrom", "Pluss – håndverkerfeil på våtrom", "Material-, konstruksjons-, prosjekterings- eller monteringsfeil fra faglært håndverker/godkjent registrert entreprenør. Skaden må oppstå i forsikringstiden og konstateres innen ti år. Eget/ufaglært arbeid, kosmetikk, bakterier/heksesot og skader andre kan og skal erstatte er unntatt.", 5, "Håndverks- og entreprenørfeil – våtrom"],
    ["handverker.folgeskade", "Pluss – øvrige håndverkerfeil", "Følgeskade fra fagutført material-, konstruksjons-, prosjekterings- eller monteringsfeil, konstatert innen ti år. Selve feilen, eget/ufaglært arbeid, unødvendig tilkomst, kosmetikk, drensledning og angitt garantiansvar er unntatt.", 5, "Håndverks- og entreprenørfeil – andre bygningsskader"],
    ["rate.unntak", "Pluss – råte og skadeinsekter", "Krever fullverdiforsikret bygning. Skadeutvikling før/etter avtalen, kontroll/vedlikehold/forebygging og angitte utvendige deler er unntatt. Bekjempelse og metode må følge vilkårets særregler.", 6, "Råte og skadeinsekter"],
  ]));
  appendCabinFacts(source.id + ":utleie", detailedEvidence(source, [
    ["utleie.vilkar", "Utleie – kontrakt", "Utleie må stå i beviset. Skriftlig kontrakt kreves med parter, pris, varighet, depositum/garanti, tilbakelevering og tvangsfravikelse. Misligholdt leie utover seks måneder eller rettmessig tilbakeholdt leie omfattes ikke.", settlement + 1, "Leiekontrakten, jf. Hvilke skader? på PDF-side 3–4"],
    ["sikkerhet.utleie", "Utleie – frister ved mislighold", "Betalingsvarsel om utkastelse sendes innen 14 dager etter forfall med 14 dagers betalingsfrist. Begjæring om utkastelse leveres innen seks uker fra første mislighold.", 1, "Sikkerhetsforskrifter"],
    ["utleie.egenandel", "Utleie – egenandel", "Publisert oversikt angir 10 000 kroner. Kundens forsikringsbevis må kontrolleres.", 1, "Forsikringsoversikt", "reference"],
    ["leietap.skade", "Tapt avtalt leie etter skade", "Leiekontraktens inntekt i normal reparasjonstid legges til grunn. Korttidsutleie krever inngåtte kontrakter. Uten gjenoppføring/reparasjon gis tre måneder. Sparte utgifter og renter trekkes fra.", settlement + 1, "Tap ved nedgang i utleieinntekt"],
  ]));
}


// General PDFs independently checked against the official publisher on 19 November 2026.
const cabinGeneralSources: Record<string, CabinSource> = {
  tryg: registerSource("cabin:tryg:general", "tryg", "Tryg", {"filename": "tryg/hus/05PGE91000.pdf", "documentName": "Generelle vilkår for private forsikringer", "termsNumber": "PGE91000", "effectiveFrom": "2024-07-01", "url": "https://www.tryg.no/odpdf?vilkNr=05PGE91000&vilk=Fellesvilkaar-Generelle", "sha256": "b8d0244084b7ffa5f35c4c4fd131b54497e247683da82ee5afc8668fd67a1320", "physicalPages": [1, 5]}),
  if: registerSource("cabin:if:general", "if", "If", {"filename": "if/innbo/If_Generelle_vilkar_GEN2-9.pdf", "documentName": "Generelle vilkår", "termsNumber": "GEN2-9", "effectiveFrom": "2025-06", "url": "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Generelle_vilk%C3%A5r", "sha256": "b74e00edd2b18560d77a4ec9ef089a393ced723b5ec619186fb0678e96fde046", "physicalPages": [1, 13]}),
  storebrand: registerSource("cabin:storebrand:general", "storebrand", "Storebrand", {"filename": "storebrand/hus/Generelle-vilkar-GENER07.pdf", "documentName": "Generelle vilkår", "termsNumber": "GENER07", "effectiveFrom": "2026-09-01", "url": "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf", "sha256": "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754", "physicalPages": [1, 11]}),
  frende: registerSource("cabin:frende:general", "frende", "Frende", {"filename": "frende/hus/canonical/Generelle-vilkar-01012026.pdf", "documentName": "Generelle vilkår for alle skadeforsikringer i Frende", "termsNumber": "", "effectiveFrom": "2026-01-01", "url": "https://www.frende.no/documents/2/Generelle_vilk%C3%A5r-01012026.pdf", "sha256": "7eb30f58fc546990ec8d42a7130e0e49d0fc71e949a26f6db2213f3bf39b997b", "physicalPages": [1, 4]}),
};
const cabinGeneralRows: Record<string, DetailRow[]> = {
  tryg: [
    ["avtale.start_slutt", "Avtalens start og opphør", "Forsikringen starter klokken 00 på avtalt startdato og opphører klokken 24 på avtalt sluttdato. Ved avtale og oppstart samme dag gjelder den fra avtaletidspunktet.", 1, "1.1"],
    ["avtale.fornyelse", "Automatisk fornyelse", "Avtaler på minst ett år fornyes automatisk ett år, med mindre annet er avtalt eller en part varsler opphør. Forsikringstaker må varsle innen utløpet, mens selskapet må varsle senest to måneder før utløpet.", 1, "1.2"],
    ["avtale.oppsigelse.sikrede", "Forsikringstakers oppsigelse", "Forsikringstaker kan si opp ved bortfalt behov, andre særlige grunner eller flytting til annet selskap med minst én måneds varsel. Ved flytting skal nytt selskap og flyttetidspunkt oppgis.", 1, "1.3 – Private forsikringer"],
    ["avtale.oppsigelse", "Selskapets oppsigelse", "Uriktige eller ufullstendige risikoopplysninger gir 14 dagers oppsigelsesfrist. Ved svikaktige risikoopplysninger kan selskapet si opp med øyeblikkelig virkning.", 1, "1.4 (fortsetter på side 2)"],
    ["avtale.oppsigelse.andre", "Øvrige oppsigelsesgrunner", "Svik i skadeoppgjør gir én ukes varsel. Med to måneders varsel og rimelighetskrav kan selskapet si opp ved brudd på sikkerhetsvilkår, vesentlig endret bruk eller risiko, unormal skadefrekvens eller skadeforløp, manglende lovpålagte kundetiltak eller trusler mot ansatte.", 2, "1.4 – fortsettelse"],
    ["avtale.refusjon", "Premie ved opphør", "Ved opphør i forsikringstiden tilbakebetales for mye betalt premie forholdsmessig etter gjenstående forsikringstid.", 2, "1.5"],
    ["oppgjor.vinning", "Faktisk tap og forsikringssum", "Forsikringen skal bare erstatte det lidte tapet innenfor avtalen. Forsikringssummen fastsetter ikke gjenstandens verdi og forsikringen skal ikke føre til vinning.", 2, "2.1"],
    ["krav.politi", "Politianmeldelse", "Brann, innbrudd, skadeverk, tyveri, ran og overfall skal meldes til politiet.", 2, "2.2"],
    ["egenandel.samlet", "Samme hendelse under flere forsikringer", "Når samme hendelse omfattes av flere av sikredes forsikringer i Tryg, trekkes bare én egenandel, den høyeste. Særskilte egenandeler i produktvilkårene gjelder foran forsikringsbevisets egenandel.", 2, "2.3"],
    ["avtale.renter", "Renter av erstatningen", "Renter beregnes etter forsikringsavtaleloven. Selskapet svarer renter når to måneder er gått etter skademelding. Forsinkelse på grunn av manglende opplysninger eller dokumenter, eller urettmessig avvist oppgjør, gir ikke renter for den tapte tiden.", 2, "2.4"],
    ["oppgjor.skjonn_kostnad", "Kostnader ved skjønn", "Skjønnet avgis av sakkyndige og uhildede personer og binder partene. Hver part betaler sin skjønnsmann, og kostnaden til oppmann og øvrige skjønnsutgifter deles likt.", 3, "2.5 – fortsettelse"],
    ["avtale.garantiordning", "Garantiordning for skadeforsikring", "Vilkåret angir 90 prosent som alminnelig garantiandel, men 100 prosent for forsikring som gjelder bolig og tvungen ansvarsforsikring. Øvre grense er 20 millioner kroner per krav, sikret og skadetilfelle. Garantiordningen er en insolvensordning og er ikke produktets skadesum.", 3, "2.6"],
    ["unntak.svik", "Konsekvenser av svik", "Svik fjerner retten etter denne og andre forsikringer for samme hendelse. Selskapet kan si opp alle avtaler med den som har begått svik. Premie for medgått forsikringstid refunderes ikke.", 3, "3"],
    ["oppgjor.periodisering", "Skadetidspunkt og gjeldende vilkår", "Tingskaden må ha inntruffet mens forsikringen var i kraft. Vilkår og beløp på skadetidspunktet legges til grunn.", 3, "4"],
    ["unntak.farlig_spredning", "Kjernefysisk, kjemisk og biologisk skade", "Direkte og indirekte skade eller økt tap ved biologisk eller kjemisk spredning, raketter, atomvåpen, radioaktiv stråling, atomkjernereaksjoner, ioniserende stråling, kjernebrennstoff, radioaktivt avfall og farlige kjerneladede sprenglegemer er unntatt.", 3, "5.1"],
    ["unntak.krig", "Krig og uroligheter", "Krig, krigslignende handlinger, opprør og tilsvarende uroligheter er unntatt. Krigsrisiko i utlandet dekkes likevel i inntil én måned når sikrede allerede er i området ved utbruddet, og området var fredelig før avreise.", 3, "5.1"],
    ["unntak.jordskjelv", "Generelt jordskjelvunntak og naturskade", "Det generelle vilkåret unntar jordskjelv og vulkanutbrudd, med forbehold for produktspesifikke avvik. Hytteproduktets uttrykkelige naturskadedekning vurderes foran dette generelle unntaket.", 4, "5.1 – fortsettelse"],
    ["unntak.terror", "Terror – begrensninger", "Tryg og Enters samlede terroransvar er 500 millioner kroner per hendelse og 1 milliard kroner per kalenderår. Sammenhengende skader innen 48 timer regnes som én hendelse. Overstiges hendelsesgrensen, reduseres erstatningene forholdsmessig.", 4, "5.2"],
    ["gjenstand.lovlig_interesse", "Lovlig økonomisk interesse", "Bare lovlige interesser som kan verdsettes i penger er omfattet.", 4, "6.1"],
    ["gjenstand.innfort", "Deklarering ved innførsel", "Udeklarerte gjenstander over tollfrigrensen er helt unntatt, også når tjenester eller reparasjoner i utlandet skulle vært deklarert. Ved innførsel av flere ting kan de med samlet verdi under tollfrigrensen erstattes hvis øvrige vilkår er oppfylt.", 4, "6.1"],
    ["avtale.valuta", "Valuta og avtalespråk", "Premie, summer, erstatninger og andre beløp regnes i norske kroner dersom ikke vilkår eller forsikringsbevis sier noe annet.", 4, "6.2"],
    ["avtale.verneting", "Verneting", "Tvister avgjøres ved norske domstoler dersom ikke annet er avtalt eller følger av ufravikelige regler.", 4, "7"],
  ],
  if: [
    ["avtale.start_slutt", "Avtalens start og opphør", "Avtalen gjelder fra partenes avtaletidspunkt, eller klokken 00 på en senere avtalt startdato, til klokken 24 på siste avtaledag. Eventuelt krav om betalt premie før dekningen starter må stå i forsikringsbeviset.", 3, "1"],
    ["avtale.fornyelse", "Automatisk fornyelse", "Forsikring på minst ett år fornyes ett år av gangen hvis forsikringstaker ikke sier opp innen utløpet.", 3, "2"],
    ["avtale.refusjon", "Premie ved opphør", "Ved opphør i avtaleperioden har If krav på forholdsmessig premie for tiden avtalen har vært i kraft, hvis ikke produktvilkåret sier noe annet. Terminbetaling kan ha termintillegg.", 3, "1"],
    ["avtale.oppsigelse.sikrede", "Forsikringstakers oppsigelse", "Skadeforsikringen kan sies opp når behovet faller bort eller ved andre særlige grunner. Flytting til annet selskap krever én måneds varsel med flyttedato og nytt selskap, og ny forsikring må ha minst samme eller tilnærmet samme dekning.", 3, "3.1.3"],
    ["avtale.oppsigelse", "Selskapets oppsigelse", "If kan endre pris og vilkår ved fornyelse og har to måneders oppsigelsesfrist før utløp. I forsikringstiden er fristen straks ved svikaktige risikoopplysninger, én uke ved svik i oppgjøret og 14 dager ved uriktige eller ufullstendige risikoopplysninger.", 4, "4–4.1"],
    ["avtale.oppsigelse.andre", "Øvrige oppsigelsesgrunner", "Med to måneders varsel kan If si opp når det er rimelig ved forsett, brudd på sikkerhetsforskrifter, unormalt skadeforløp, minst tre skader på ett år, medvirkning til svik, gjentatt betalingsmislighold, trusler, straffbare forhold mot If, manglende kundetiltak eller vesentlig endret bruk eller gjenforsikringsrisiko.", 4, "4.1.4–4.1.5"],
    ["avtale.premie", "Premie og betaling", "Ved opphør på grunn av manglende betaling har If krav på premie for tiden det har båret risikoen. Vilkåret gir også adgang til poliseutstedelseskostnad på inntil 300 kroner per avtale og inntil 300 kroner for panthaverinteresse per objekt.", 5, "4.2 (begynner på side 4)"],
    ["oppgjor.skjonn_kostnad", "Kostnader ved skjønn", "Skjønn kan kreves når som helst under oppgjøret, og verdiene binder partene. Hver part betaler sin skjønnsmann og halvparten av øvrige skjønnskostnader. Krever If skjønn ved privat tingskade, dekker If alle kostnadene hvis kunden ikke selv ønsker å betale sin del.", 5, "5"],
    ["avtale.renter", "Renter av erstatningen", "Renter av erstatningen følger forsikringsavtaleloven § 8-4 eller § 18-4.", 5, "6"],
    ["oppgjor.reparasjonsfeil", "Mangelfull reparasjon", "If svarer ikke for mangelfull eller feilaktig reparasjon eller følgeskade, med mindre den nye skaden selv er dekket etter forsikringens vilkår.", 5, "8"],
    ["unntak.svik", "Konsekvenser av svik", "Svik fjerner erstatningskrav etter denne og andre avtaler for samme hendelse. Utbetalt erstatning kan kreves tilbake, og If kan si opp avtaler med den som har begått eller medvirket til svik.", 6, "9"],
    ["gjenstand.lovlig_interesse", "Lovlig økonomisk interesse", "Bare lovlige interesser som kan verdsettes i penger er omfattet.", 6, "11"],
    ["oppgjor.vinning", "Faktisk tap og forsikringssum", "Forsikringen skal bare erstatte det faktiske tapet innen avtalen og skal ikke føre til vinning. Forsikringssummen er ikke bevis for verdien.", 6, "13"],
    ["avtale.lovvalg", "Lovvalg", "Norsk lov gjelder med forbehold for ufravikelig lovvalg eller annen avtale.", 6, "14"],
    ["avtale.valuta", "Valuta og avtalespråk", "Premie, forsikringssummer og erstatninger regnes i norske kroner hvis ikke vilkår eller forsikringsbevis sier noe annet.", 6, "15"],
    ["avtale.garantiordning", "Garantiordning for skadeforsikring", "Vilkåret angir 90 prosent som alminnelig garantiandel, men 100 prosent for forsikring som gjelder bolig og tvungen ansvarsforsikring. Øvre grense er 20 millioner kroner per krav, sikret og skadetilfelle. Garantiordningen er en insolvensordning og er ikke produktets skadesum.", 7, "16"],
    ["unntak.farlig_spredning", "Kjernefysisk, kjemisk og biologisk skade", "Kjernefysisk og radioaktiv skade, samt kjemiske, biologiske, biokjemiske og elektromagnetiske våpen, er unntatt uavhengig av medvirkende årsaker. Unntaket for radioaktivt materiale har et særskilt unntak for angitte fredelige bruksområder for isotoper som ikke er kjernebrensel.", 7, "17.1"],
    ["unntak.krig", "Krig og uroligheter", "Direkte og indirekte skade ved krig, invasjon, fiendtligheter, borgerkrig, mytteri, opprør, streik, opptøyer, sivile uroligheter av angitt omfang og maktovertakelse er unntatt uavhengig av medvirkende årsaker.", 8, "17.2"],
    ["unntak.terror", "Terror – begrensninger", "Terrorskade ved bruk eller trussel om atomvåpen eller farlig biologisk eller kjemisk spredning er unntatt.", 8, "17.3"],
    ["unntak.jordskjelv", "Generelt jordskjelvunntak og naturskade", "Det generelle vilkåret unntar jordskjelv og vulkanutbrudd, med forbehold for produktspesifikke avvik. Hytteproduktets uttrykkelige naturskadedekning vurderes foran dette generelle unntaket.", 8, "17.4"],
    ["avtale.sanksjoner", "Sanksjoner og eksportkontroll", "Dekning og utbetaling er begrenset når de vil utsette If for brudd på eller håndheving av FN-resolusjoner, handels- eller økonomiske sanksjoner, eksportkontroll eller relevante regler i EU, Storbritannia eller USA.", 8, "17.5"],
    ["unntak.russland", "Russland og øvrige angitte områder", "Transport av varer og tilknyttede krav til, fra, innen eller gjennom Russland, Belarus, Donetsk, Luhansk, Krim eller russisk territorialfarvann er unntatt. Det samme gjelder eiendom kjøpt eller importert direkte eller indirekte fra Russland etter 31. desember 2022.", 9, "17.6 (begynner på side 8)"],
    ["avtale.verneting", "Verneting", "Tvister avgjøres ved norsk domstol med forbehold for ufravikelige regler eller annen avtale.", 9, "18"],
  ],
  storebrand: [
    ["avtale.start_slutt", "Avtalens start og opphør", "Avtalen gjelder fra begge parters signering eller aksept, eller klokken 00 på en senere avtalt startdato, til klokken 24 på siste avtaledag. Premien skal betales innen fristen, og eventuelt krav om forskuddsbetaling før dekning må stå i forsikringsbeviset.", 3, "1.1–1.2"],
    ["avtale.fornyelse", "Automatisk fornyelse", "Avtaler på minst ett år fornyes automatisk ett år hvis ingen part sier opp. Storebrand har to måneders oppsigelsesfrist før utløpet og kan endre vilkår og premie fra fornyelsen. Tidsbegrensede avtaler opphører på utløpsdatoen uten varsel.", 3, "2"],
    ["avtale.refusjon", "Premie ved opphør", "Ved opphør i avtaleperioden beregnes forholdsmessig premie for tiden avtalen har vært i kraft, hvis ikke produktvilkåret sier noe annet. For mye betalt premie tilbakebetales.", 3, "1.3"],
    ["avtale.premie", "Premie og betaling", "Manglende betaling innen fristen i andre varsel fører til opphør. Storebrand har krav på premie for perioden det har båret risikoen.", 3, "1.4"],
    ["unntak.farlig_spredning", "Kjernefysisk, kjemisk og biologisk skade", "Direkte og indirekte skade ved farlige kjerneladede sprenglegemer, atomreaksjoner, ioniserende stråling, kjernebrensel, radioaktivt avfall og spredning av biologisk eller kjemisk materiale er unntatt, uavhengig av medvirkende årsaker, hvis ikke produktvilkåret fraviker regelen.", 3, "3.1"],
    ["unntak.jordskjelv", "Generelt jordskjelvunntak og naturskade", "Det generelle vilkåret unntar jordskjelv og vulkanutbrudd, med forbehold for produktspesifikke avvik. Hytteproduktets uttrykkelige naturskadedekning vurderes foran dette generelle unntaket.", 4, "3.2"],
    ["unntak.krig", "Krig og uroligheter", "Direkte og indirekte skade ved krig, krigslignende handlinger, opprør og tilsvarende alvorlige uroligheter er unntatt.", 4, "3.3"],
    ["unntak.terror", "Terror – begrensninger", "Samlet terroransvar er 1 milliard kroner per hendelse og per kalenderår. Sammenhengende skader innen 48 timer regnes som én hendelse, med forholdsmessig avkortning over grensen. Terror med radioaktive, kjemiske eller biologiske våpen er unntatt.", 4, "3.4"],
    ["unntak.cyber_generelt", "Elektroniske data og cyberhendelser", "Generelle vilkår unntar tap, endring, sletting eller redusert funksjon av elektroniske data og følgekostnader. Fysisk skade kan omfattes når den direkte skyldes en spesifisert dekket årsak. Produktvilkårets egne dekninger og begrensninger gjelder.", 4, "3.5"],
    ["avtale.sanksjoner", "Sanksjoner og eksportkontroll", "Dekning og utbetaling kan ikke gis i strid med sanksjoner eller forbud fra FN, EU, Storbritannia og Nord-Irland, Norge eller USA. Begrensningen kan ikke fravikes ved avtale.", 5, "3.6"],
    ["unntak.russland", "Russland og øvrige angitte områder", "Transport av varer og tilknyttede krav til, fra, innen eller gjennom Russland, Belarus, Donetsk, Luhansk, Krim eller russisk territorialfarvann er unntatt. Det samme gjelder eiendom kjøpt eller importert direkte eller indirekte fra Russland etter 31. desember 2022.", 5, "3.6.1"],
    ["unntak.pandemi", "Sykdom og pandemi", "Direkte og indirekte skade, tap, kostnad eller verdireduksjon knyttet til patogener, mikroorganismer, sykdommer de forårsaker eller trussel eller frykt for disse er unntatt, med mindre produktvilkåret fraviker begrensningen.", 5, "3.7"],
    ["oppgjor.skjonn_kostnad", "Kostnader ved skjønn", "Skjønnsverdiene binder partene. Hver part betaler sin skjønnsmann og halvparten av øvrige skjønnskostnader. Krever Storebrand skjønn ved privat tingskade, dekker Storebrand alle kostnadene hvis kunden ikke selv ønsker å betale sin del.", 6, "4 (begynner på side 5)"],
    ["avtale.renter", "Renter av erstatningen", "Renter av erstatningen følger forsikringsavtaleloven § 8-4 eller § 18-4.", 6, "5"],
    ["unntak.svik", "Konsekvenser av svik", "Svik fjerner erstatningskrav etter denne og andre avtaler for samme hendelse. Storebrand kan si opp avtaler med den som har begått eller medvirket til svik.", 6, "6"],
    ["krav.meldefrist", "Frist for skademelding", "Krav må meldes innen ett år etter at sikrede fikk kunnskap om forholdene som begrunner kravet. Kravet foreldes også etter forsikringsavtalelovens foreldelsesregler.", 6, "7"],
    ["krav.soksmalsfrist", "Frist etter skriftlig avslag", "Søksmål eller nemndbehandling må kreves innen seks måneder etter skriftlig avslag når avslaget samtidig opplyser om fristen, dens lengde og konsekvensen av å oversitte den.", 6, "7"],
    ["avtale.oppsigelse", "Selskapets oppsigelse", "Oppsigelse kan skje straks ved svikaktige risikoopplysninger, med én ukes varsel ved svik i oppgjøret og med 14 dager ved uriktige eller ufullstendige risikoopplysninger.", 7, "8.1 (begynner på side 6)"],
    ["avtale.oppsigelse.andre", "Øvrige oppsigelsesgrunner", "Med to måneders varsel og krav om rimelighet kan Storebrand si opp ved forsett, sikkerhetsbrudd, unormalt skadeforløp eller minst tre skader på ett år, medvirkning til svik, grove tillitsbrudd, gjentatt betalingsmislighold, trusler eller trakassering, straffbare forhold mot selskapet, manglende kundetiltak eller vesentlig endret risiko.", 7, "8.1"],
    ["avtale.oppsigelse.sikrede", "Forsikringstakers oppsigelse", "Forsikringstaker kan si opp ved bortfalt behov eller andre særlige grunner og flytte til annet selskap med én måneds varsel. Nytt selskap og flyttedato skal oppgis, og ny forsikring må ha minst samme eller tilnærmet samme dekning.", 7, "8.2 – Skadeforsikring"],
    ["gjenstand.lovlig_interesse", "Lovlig økonomisk interesse", "Bare lovlige interesser som kan verdsettes i penger er omfattet.", 8, "10"],
    ["oppgjor.vinning", "Faktisk tap og forsikringssum", "Forsikringen skal bare erstatte det faktiske tapet innen avtalen og skal ikke føre til vinning. Forsikringssummen er ikke bevis for verdien.", 8, "11"],
    ["avtale.lovvalg", "Lovvalg", "Norsk lov gjelder med forbehold for ufravikelig lovvalg eller annen avtale. Tvister avgjøres ved norsk domstol med tilsvarende forbehold.", 8, "12"],
    ["avtale.valuta", "Valuta og avtalespråk", "Premie, summer og erstatninger regnes i norske kroner hvis ikke vilkår eller bevis sier noe annet. Informasjon og avtalevilkår gis på norsk hvis ikke annet språk er avtalt.", 8, "13"],
    ["oppgjor.reparasjonsfeil", "Mangelfull reparasjon", "Storebrand svarer ikke for feilaktig eller mangelfull reparasjon eller følgeskade, med mindre den nye skaden selv er dekket etter forsikringens vilkår.", 9, "15"],
    ["krav.klage", "Klageadgang", "Uenighet om selskapets avgjørelse kan klages til Finansklagenemnda.", 9, "16"],
    ["avtale.garantiordning", "Garantiordning for skadeforsikring", "Vilkåret angir 90 prosent som alminnelig garantiandel, men 100 prosent for forsikring som gjelder bolig og tvungen ansvarsforsikring. Øvre grense er 20 millioner kroner per krav, sikret og skadetilfelle. Garantiordningen er en insolvensordning og er ikke produktets skadesum.", 10, "21"],
  ],
  frende: [
    ["unntak.farlig_spredning", "Kjernefysisk, kjemisk og biologisk skade", "Direkte og indirekte skade eller tap ved atomvåpen, kjemiske eller bakteriologiske våpen, radioaktiv eller ioniserende stråling og avfall, eller spredning av bakterier, virus, biologisk materiale eller kjemiske stoffer er unntatt.", 2, "1.1 punkt 1–3"],
    ["unntak.krig", "Krig og uroligheter", "Innreise til område med krig, krigslignende handlinger, militæroperasjoner, opprør eller tilsvarende uroligheter er unntatt. Er sikrede allerede i området når hendelsen bryter ut, omfattes hendelser mens sikrede er der i inntil seks uker etter utbruddet.", 2, "1.1 punkt 4"],
    ["unntak.terror", "Terror – begrensninger", "Frendes samlede ansvar ved terror eller epidemi eller pandemi er maksimalt 100 millioner kroner per kalenderår, med forholdsmessig reduksjon over grensen. Er hendelsen også omfattet av et absolutt unntak i punkt 1.1, gjelder ikke dekningen.", 2, "1.2"],
    ["avtale.renter", "Renter av erstatningen", "Renter av erstatningen kan kreves etter forsikringsavtaleloven § 8-4 eller § 18-4.", 2, "2"],
    ["avtale.oppsigelse.sikrede", "Forsikringstakers oppsigelse", "Forsikringstaker kan si opp når behovet faller bort, ved andre særlige grunner eller ved flytting til annet selskap. Flytting krever én måneds varsel med nytt selskap og flyttetidspunkt.", 2, "3.1"],
    ["avtale.oppsigelse", "Selskapets oppsigelse", "Frende kan si opp med 14 dagers varsel ved uriktige eller ufullstendige risikoopplysninger, straks ved svikaktige slike opplysninger og med én uke ved svik i oppgjøret. Svik eller medvirkning fra ektefelle, samboer eller livsarving kan også gi én ukes oppsigelse av deres avtaler.", 3, "3.2 (begynner på side 2)"],
    ["avtale.oppsigelse.andre", "Øvrige oppsigelsesgrunner", "Med to måneders varsel og krav om rimelighet kan Frende si opp ved endret bruk, vanskjøtsel, manglende opplysninger eller bistand, truende eller uakseptabel opptreden, tillitssvikt ut fra skadehistorikk, ulovlig bruk eller manglende gjenforsikringsdekning. Reglene gjelder også forhold som skyldes ektefelle eller samboer.", 3, "3.2"],
    ["unntak.svik", "Konsekvenser av svik", "Svik fjerner retten til erstatning etter avtalene i Frende og kan føre til oppsigelse, også når en medforsikret har begått svik. Brudd på opplysningsplikten kan gjøres gjeldende overfor andre forsikrede. Premie for medgått forsikringstid refunderes ikke ved svik eller uredelighet.", 3, "4"],
    ["avtale.eierskifte", "Eierskifte", "Forsikringen avsluttes ved salg eller annen overføring til ny eier. Har ny eier ikke tegnet forsikring, gjelder den likevel for skader innen 14 dager etter eierskiftet.", 3, "5"],
    ["oppgjor.periodisering", "Skadetidspunkt og gjeldende vilkår", "Bare skade som inntrer mens forsikringen gjelder omfattes. Vilkår og beløp på tidspunktet skaden inntraff brukes.", 3, "6"],
    ["oppgjor.skjonn", "Sakkyndig skjønn", "Frende eller sikrede kan kreve sakkyndig og uhildet skjønn over erstatningsgrunnlag og verdier ved tingskade. Skjønnet bygger på forsikringsavtalen og binder partene.", 4, "7 (begynner på side 3)"],
    ["oppgjor.skjonn_kostnad", "Kostnader ved skjønn", "Partene betaler hver sin skjønnsmann og halvparten av oppmann og andre kostnader. Frende betaler alle skjønnskostnader ved privat tingskade når selskapet krever skjønn.", 4, "7"],
    ["avtale.rabatt", "Bortfall av særskilt rabatt", "Rabatt eller andre fordeler gitt på grunn av ansettelse eller tillitsverv i Frende eller hos en distributør faller bort når arbeidsforholdet eller vervet avsluttes.", 4, "8"],
    ["unntak.cyber_generelt", "Elektroniske data og cyberhendelser", "Det generelle unntaket omfatter datainnbrudd, nettangrep, virus, hacking og uautorisert bruk, endring eller sletting av programvare eller data. Unntaket har reservasjon for fysisk skade eller tap som er dekket av produktvilkåret.", 4, "9"],
    ["oppgjor.overdragelse", "Overdragelse av forsikringskrav", "Forsikringskrav kan ikke pantsettes eller selges før forsikringstilfellet har inntruffet.", 4, "10"],
    ["oppgjor.vinning", "Faktisk tap og forsikringssum", "Forsikringen skal bare erstatte det reelle tapet innen avtalen og skal ikke gi gevinst. Forsikringssummen er ikke bevis for verdien.", 4, "11"],
  ],
};
for (const product of cabinProducts) {
  const source = cabinGeneralSources[product.providerId];
  if (!source) continue;
  const general = detailedEvidence(source, cabinGeneralRows[product.providerId]);
  const natural = cabinFacts[product.productId].find(fact => fact.key === "hytte.naturskade.dekning");
  for (const fact of general) {
    if (fact.key === "hytte.unntak.jordskjelv" && natural) fact.qualificationSource = { ...natural.source };
  }
  appendCabinFacts(product.productId, general);
}

for (const product of cabinProducts.filter(product => product.providerId === "if")) {
  appendCabinFacts(product.productId, detailedEvidence(ifTerms, [
    ["avtale.personer", "Sikrede og eierskifte", "Tinglyst eier, panthaver og annen tinglyst rettighetshaver er sikret. Dødsbo trer inn ved dødsfall. Ved eierskifte gjelder forsikringen for ny eier inntil ny forsikring tegnes, maksimalt 14 dager.", 4, "1"],
    ["avtale.geografi", "Forsikringssted", "Stedet i forsikringsbeviset. Skaden må inntreffe mens Ifs ansvar løper.", 4, "Innledning og 2"],
    ["brann.gnist.grense", "Gnist- og sviskade", "Plutselig gnist- og sviskade er omfattet inntil 10 000 kroner.", 7, "4.1.1"],
    ["skadedyr.vilkar", "Skadedyr – adkomst og samtykke", "Anticimex kontaktes før tiltak. Tidligere/senere aktivitet, forebygging, konstruksjonsåpning for påvisning, innbo og ikke-boligbygg er unntatt. Uten bilvei bekoster forsikringstaker ekstra transport/reisetid. Utvidet/Super har særskilte insekt- og metodeunntak, med mulig husbukkbehandling.", 11, "4.10, fortsetter på PDF-side 12"],
    ["feriegaranti.beregning", "Hytte – brukstap og leieinntekt", "Samlet hyttegrense er 50 000 kroner. Normal reparasjonstid og umøblert markedsleie legges til grunn. Dokumenterte boutgifter kan erstattes innen denne rammen, ellers 50 prosent av markedsleien. Sparte utgifter og forbedringsforsinkelse trekkes fra.", 5, "3.2.2"],
    ["hage.oppgjor", "Hage og planlagt riving", "Hage erstattes til samme stand eller markedsverdifall dersom ikke utbedret, med ung handelsvare for beplantning. Forebygging/sikring er unntatt. Planlagt utskiftede/revne bygningsdeler begrenses til brukbare materialers verdi.", 17, "5.3"],
    ["sikkerhet.vedlikehold", "Vedlikehold og fagfolk", "Synlige lekkasjer, manglende takstein og løse beslag utbedres snarest. Byggearbeid må være offentlig godkjent og forskriftsmessig. Elektro/VVS utføres av godkjent fagperson. Forebyggende skadedyrtiltak følges.", 22, "6.3.1, fortsetter på PDF-side 23"],
    ["sikkerhet.brann_tyveri", "Brannvern og låsing", "Forskriftsmessig røykvarsling og slokkeutstyr kreves. Dører låses, vinduer lukkes og nøkler oppbevares utilgjengelig for uvedkommende. Luftestilling er utilstrekkelig.", 23, "6.3.2 og 6.3.4, brannregelen starter på PDF-side 22"],
    ["sikkerhet.frost_sno", "Frost og snø", "Bygningen og utvendig badeinnretning holdes tilstrekkelig oppvarmet. Tak, renner, veranda, balkong og terrasse ryddes for snø.", 23, "6.3.3 og 6.3.7"],
    ["avtale.risiko", "Opplysninger og bruksbegrensninger", "Riktige risiko- og bruksopplysninger, herunder utleie, må gis. Risikoendring og regelstridig bruk kan redusere ansvar. Identifikasjon med ektefelle/samboer og sikkerhetsbrudd reguleres særskilt.", 22, "6.1–6.3, starter på PDF-side 21"],
    ["oppgjor.rettighetshavere", "Panthavere, ny eier og MVA", "Panthaver/bo/andre rettighetshavere har særskilte interesse-/verdigrenser. Ny eiers mangelskrav dekkes ikke. MVA erstattes bare når påløpt og dokumentert. If kan overta erstattede ting.", 21, "5.9–5.11, starter på PDF-side 20"],
  ]));
  if (product.productId === "if-hytte-super") appendCabinFacts(product.productId, detailedEvidence(ifTerms, [
    ["service.overvannsrapport", "Super – overvannsrapport", "Inntil 10 000 kroner ved dekket plutselig vanninntrengning fra terreng/grunn/overflate eller flomskade på hage. Maksimalt én gang per eiendom.", 6, "3.4"],
    ["handverker.vilkar", "Super – håndverkerfeil vilkår", "Krever dokumentert autorisert arbeid under ti år, skade oppdaget i forsikringstiden og rettidig reklamasjon. Eget arbeid eller firma sikrede eier/arbeider i er unntatt. Innen reklamasjonstid må ansvarlig håndverker være konkurs. Selve feilen og tilkomst vurderes separat fra følgeskade.", 13, "4.12, fortsetter på PDF-side 14"],
  ]));
}
for (const product of cabinProducts.filter(product => product.providerId === "storebrand")) {
  appendCabinFacts(product.productId, detailedEvidence(storebrand, [
    ["avtale.personer", "Sikrede og eierskifte", "Tinglyst eier, panthaver og annen tinglyst rettighetshaver omfattes. Dødsbo trer inn ved dødsfall. Ved eierskifte gjelder overgangsdekning inntil 14 dager eller til ny forsikring. Ny eiers mangelskrav er unntatt.", 5, "B.1"],
    ["avtale.geografi", "Forsikringssted og særgeografi", "Forsikringsstedet i beviset. Naturskade gjelder i Norge, eieransvar og rettshjelp i Norden.", 5, "B.2"],
    ["bygninger.tilbehor", "Fast utstyr og solceller", "Grunnmur, fundament, innvendige rør og vanlig fast utstyr samt bygningsdeler midlertidig demontert eller klare til montering. Privat strømproduserende solceller omfattes. Drivhus og nærings-/produksjonsutstyr omfattes ikke.", 6, "B.3"],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte og eget arbeid", "Storebrand velger oppgjørsmåte og leverandør. Udokumentert håndverkerlønn beregnes med 75 prosent av kalkulert normal timepris uten MVA, øvrig arbeid 300 kroner per time. Kontantoppgjør overstiger ikke selskapets reparasjons-/gjenanskaffelseskostnad.", 20, "B.6.2"],
    ["gjenoppforing.ingen", "Ikke gjenoppført innen fem år", "Oppgjøret kan ikke overstige omsetningsverdien før skaden. Hvis bygningen ikke kan omsettes separat brukes bruksverdien.", 22, "B.6.3.2"],
    ["hage.oppgjor", "Hage og planlagt riving", "Tilbakeføring til samme stand, eller laveste av gjenopprettingskostnad og markedsverdifall uten utbedring. Beplantning erstattes som ung handelsvare. Planlagt revne/utskiftede deler begrenses til brukbare materialers verdi.", 23, "B.6.4.2–B.6.4.3"],
    ["feriegaranti.beregning", "Hytte – midlertidig hytte", "Leie av midlertidig hytte inntil 50 000 kroner. Beregnes etter de angitte boutgiftsreglene. Normal reparasjonstid og fradrag for sparte utgifter/renter gjelder.", 19, "B.5.2.2, jf. B.5.2.1"],
    ["gjenoppforing.prisstigning", "Prisstigning og renter", "Prisstigning fra skadedato til normal ferdigstillelse etter SSB-indeks. Vilkåret sammenholder samlede angitte tilleggsytelser med renter av bygningserstatningen og erstatter det høyeste beløpet.", 19, "B.5.3 og B.6.4.4 på PDF-side 23–24"],
    ["sikkerhet.vedlikehold", "Vedlikehold og krypkjeller", "Bygning, drenering, tak og rør vedlikeholdes. Renner/sluk holdes åpne, feil rettes snarest og krypkjeller inspiseres minst to ganger årlig. Fagfolk og forskriftsmessig godkjent byggearbeid kreves.", 26, "B.6.4.10, fortsetter på PDF-side 27–28"],
    ["sikkerhet.brann_tyveri", "Brannvern og låsing", "Røykvarsling og slokkeutstyr kreves. Gassutstyr følger produsentanvisninger. Dører låses, vinduer lukkes og nøkler sikres. Bod og fellesdisponerte rom har løpende låsekrav.", 26, "B.6.4.10, fortsetter på PDF-side 27"],
    ["sikkerhet.frost_sno", "Oppvarming, snø og oljetank", "Bygg og basseng holdes tilstrekkelig oppvarmet. Tak, takrenner, veranda, balkong og terrasse måkes. Oljetank ute av bruk tømmes og fjernes fagmessig sammen med påfylling.", 27, "B.6.4.10 punkt 4–6"],
    ["sikkerhet.handverker_lading", "Håndverker, sprengning og lading", "Rettidig skriftlig reklamasjon ved håndverkerfeil. Sprengning krever sertifikat. Lading krever overspenningsvern og original lader uten skjøteledning. Innendørs lading av el-sparkesykkel skjer med våkent tilsyn.", 28, "B.6.4.10 punkt 13–15, fortsetter på PDF-side 29"],
    ["avtale.risiko", "Risikoendring, utleie og identifikasjon", "Areal- og risikoendringer meldes straks eller innen trygghetsgarantiens frist. Utleie må være avtalt i beviset med angitt nærfamilieunntak. Ulovlig/reguleringsstridig eller næringsmessig bruk kan redusere eller bortfalle ansvar. Ektefelle/samboers handlinger kan identifiseres med sikrede.", 31, "B.8, fortsetter på PDF-side 32–33"],
    ["avtale.meldefrist", "Skademelding og politianmeldelse", "Skade meldes så raskt som mulig. Brann, tyveri, hærverk og underslag politianmeldes. Selskapet kan kreve politianmeldelse av andre hendelser.", 31, "B.8.1"],
    ["ansvar.unntak", "Eieransvar – avgrensninger", "Yrke/næring, avtaleutvidet ansvar, leide/lånte ting, nær familie, annet fast eierskap, motor/luftfartøy og angitte grave-/sprengnings-, forurensnings- og sopp-/fuktskader er blant unntakene.", 39, "D.4, fortsetter på PDF-side 40"],
    ["rettshjelp.unntak", "Rettshjelp – avgrensninger", "Yrke/næring, annen eiendom, familie/arv, straff/ulovlig handling, ubestridt inkasso, ekspropriasjon, forvaltning og salær har særskilte unntak. Forvaltningsklager må være uttømt før eventuell dekning av søksmål.", 43, "E.4, fortsetter på PDF-side 44–45"],
    ["rettshjelp.meldefrist", "Rettshjelp – melding", "Meldes snarest og senest ett år etter at tvist er oppstått og advokat engasjert. Sikrede velger passende advokat og dokumenterer salær og betalt egenandel.", 45, "E.5"],
  ]));
  if (product.productId === "storebrand-hytte-super") appendCabinFacts(product.productId, detailedEvidence(storebrand, [
    ["dyr.egenandel.tillegg", "Super hytte – dyr og råte egenandel", "Avtalt egenandel økes med 8 000 kroner ved skade på fritidsbolig fra dyr/skadeinsekter og ved nedbrytning fra ekte hussopp, andre treødeleggende sopper og råte.", 30, "B.7 punkt 2", "coverage"],
    ["rate.vilkar", "Super – råte avgrensninger", "Skadeutvikling utenfor forsikringstiden, forebygging, indirekte tap, mugg/blåved, tak/utvendig treverk/laft og ikke-boligbygg over 50 år er blant unntakene. Uten biladkomst bekoster sikrede ekstra transport/reisetid.", 35, "C.1.3"],
    ["handverker.vilkar", "Super – håndverkerfeil vilkår", "Arbeidet må være utført i forsikringstakers eiertid av autorisert håndverker de siste ti år og dokumentert med faktura. Innen reklamasjonstid kreves rettidig skriftlig reklamasjon og avslag fra håndverker eller konkurs. Eget arbeid og kjente feil er unntatt.", 36, "C.1.5, fortsetter på PDF-side 37"],
  ]));
}
appendCabinFacts("cabin:storebrand:building:optional", detailedEvidence(storebrand, [
  ["utleie.vilkar", "Utleie – avtale og kontrakt", "Utleie må være privat, avtalt og aktiv i beviset før leieforholdet. Skriftlig kontrakt og korrekte bruksopplysninger kreves. Normalt minst to måneders depositum/bankgaranti, med særregel for korttidsutleie av fritidsbolig inntil 30 døgn.", 46, "F – Vilkår for gyldighet"],
  ["utleie.mislighold", "Misligholdt leie", "Inntil seks måneders leie, én gang per leietaker, fra utkastelsesbegjæring til tilbakeføring av boligen pluss to måneder.", 47, "F.1"],
  ["utleie.utkastelse", "Utkastelse – grense", "Rimelige nødvendige kostnader inntil 20 000 kroner.", 47, "F.2"],
  ["utleie.skadeverk", "Skadeverk fra leietaker", "Forsettlig skadeverk fra leietaker eller gjester. Slitasje, hard/feil bruk, dyr, kosmetikk og rengjøring er unntatt.", 47, "F.3"],
  ["utleie.tyveri", "Tyveri og underslag", "Tyveri og underslag fra leietaker eller husstandsmedlem, inntil 500 000 kroner etter oversikten.", 47, "F.4, jf. oversikten på PDF-side 46"],
  ["utleie.egenandel", "Kort- og langtidsutleie – egenandel", "Korttid inntil 30 døgn har høyeste av 10 000 kroner og depositum. Langtid har tre måneders leie, minst depositum/garanti. Høyere sikkerhet trekkes i sin helhet.", 48, "F.5, starter på PDF-side 47", "coverage"],
  ["sikkerhet.utleie", "Utleie – betalingsmislighold", "Varsel innen 14 dager med 14 dagers betalingsfrist, utkastelsesbegjæring innen seks uker etter opprinnelig forfall og melding til selskapet innen samme frist.", 28, "B.6.4.10 punkt 11"],
  ["utleie.oppgjor", "Utleie – verdsettelse", "Erstatning begrenses til verdi før skade minus restverdi, med fradrag for verdiøkning/elde/bruk. Brukte, arvede og utrangerte gjenstander følger markedsverdi. Storebrand velger reparasjon, gjenanskaffelse eller kontantoppgjør.", 48, "F.7, fortsetter på PDF-side 49"],
]));
for (const product of cabinProducts.filter(product => product.providerId === "frende")) {
  appendCabinFacts(product.productId, detailedEvidence(frende, [
    ["avtale.personer", "Sikrede og identifikasjon", "Forsikringstaker og ektefelle eller samboer med felles folkeregistrert bolig. Tinglyste eiere, panthavere og sikkerhetsrettighetshavere omfattes. Ektefelle/samboers handlinger kan identifiseres med sikrede.", 2, "1"],
    ["avtale.geografi", "Sted og virketid", "Forsikringsstedet i beviset. Eieransvar og rettshjelp gjelder i Norden. Avtalen gjelder mens den betales og ikke er sagt opp, med årlig fornyelse.", 2, "2"],
    ["gjenoppforing.oppgjorsmate", "Oppgjørsmåte, MVA og eget arbeid", "Frende velger reparasjon, tilsvarende gjenanskaffelse, gjenoppføring eller kontantoppgjør og leverandør. Kontantoppgjør begrenses til selskapets laveste kostnad. Betalt MVA dokumenteres. Egen vask/rydding erstattes med 200 kroner per time.", 6, "6.1–6.3"],
    ["sikkerhet.brann_tyveri", "Brannvern og låsing", "Røykvarsling/slokkeutstyr og forsvarlig gassutstyr kreves. Dører låses, vinduer lukkes og nøkler oppbevares utilgjengelig for uvedkommende.", 15, "14 punkt 1–5"],
    ["sikkerhet.frost_sno", "Oppvarming, snø og vannveier", "Minst ti grader i alle rom. Snø fjernes før bæreevnen overskrides eller rasfare oppstår. Sluk/vannlåser/renner holdes åpne. Bygningen dekkes til under arbeid for å hindre snø-/vindskade.", 15, "14 punkt 6–12, fortsetter på PDF-side 16"],
    ["sikkerhet.vedlikehold", "Vedlikehold og fagfolk", "Bygningsdeler og tekniske anlegg vedlikeholdes og skiftes etter forventet levetid. Skadedyrfirma gis effektiv adkomst. Elektro/VVS og andre autorisasjonspliktige arbeider utføres av autorisert håndverker.", 16, "14 punkt 13–16"],
    ["avtale.risiko", "Riktige opplysninger og bruksbegrensninger", "Feil og endrede forhold meldes snarest og senest ved hovedforfall. Risiko-/arealavvik kan gi forholdsmessig reduksjon eller bortfall. Fraflyttingsforbeholdet gjelder uttrykkelig ikke hytte. Institusjonslignende bruk er begrenset.", 15, "12–13"],
    ["avtale.meldefrist", "Frist for skademelding", "Krav meldes snarest og senest ett år etter kunnskap om forholdene som begrunner det. Brann, tyveri, innbrudd og hærverk politianmeldes.", 16, "15, jf. 6.1 på PDF-side 6"],
  ]));
}
appendCabinFacts("cabin:frende:building:optional", detailedEvidence(frende, [
  ["rate.langvarig_vann", "Langvarig aktiv vannskade", "Tillegget omfatter nedbrytning av bygningsmaterialer ved råtesopp eller aktiv vannskade som har vart mer enn ett år.", 13, "10.1"],
  ["rate.unntak", "Tilleggets objekt- og tidsgrenser", "Varig innredning/utstyr, dører, vinduer, lekter, tak, laft og annet utvendig treverk samt blåved, mugg og kosmetikk er unntatt. Aktivitet for bekjempelse må ha startet etter kjøpet, og tiltak utføres bare mens avtalen løper.", 13, "10.1–10.2, fortsetter på PDF-side 14"],
  ["rate.egenandel", "Tillegget – egenandeler", "6 000 kroner ved bygningsskade, 2 000 kroner ved bekjempelse av skadedyr og insekter.", 8, "6.14", "coverage"],
]));

const trygNatural = registerSource("cabin:tryg:natural", "tryg", "Tryg", {
  filename: "tryg/hus/05PGE90010.pdf", documentName: "Naturskade",
  termsNumber: "PGE90010", effectiveFrom: "2025-01-01", physicalPages: [1, 2],
  url: "https://www.tryg.no/odpdf?vilkNr=05PGE90010&vilk=Fellesvilkaar-Naturskade",
  sha256: "11439a7669131319396db7c2caa6f28ac140389e3e11408bb75badea0fdccef6",
});
const trygLiability = registerSource("cabin:tryg:liability", "tryg", "Tryg", {
  filename: "tryg/hus/05PGE90020.pdf", documentName: "Privatansvar",
  termsNumber: "PGE90020", effectiveFrom: "2026-10-01", physicalPages: [1, 3],
  url: "https://www.tryg.no/odpdf?vilkNr=05PGE90020&vilk=Fellesvilkaar-Privat",
  sha256: "c75dcb29b61d990dd95869e884fb64f59dd839717f9cb88fa9d85f0618d000df",
});
const trygLegal = registerSource("cabin:tryg:legal", "tryg", "Tryg", {
  filename: "tryg/hus/05PGE91500.pdf", documentName: "Rettshjelp",
  termsNumber: "PGE91500", effectiveFrom: "2026-01-01", physicalPages: [1, 5],
  url: "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Fellesvilkaar-Rettshjelp",
  sha256: "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
});
const ifLiability = registerSource("cabin:if:liability", "if", "If", {
  filename: "if/hus/Rettshjelp-og-ansvarsforsikring.pdf", documentName: "Rettshjelp- og ansvarsforsikring",
  termsNumber: "S-006 / SV006", effectiveFrom: "2021-06", physicalPages: [1, 4],
  url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV006",
  sha256: "7edf14be25afedc260ad602f87ddc7ba6c58c038bcbeaacc0bbf6301a0f15ceb",
});
for (const product of cabinProducts.filter(product => product.providerId === "tryg")) {
  appendCabinFacts(product.productId, sharedBuildingFacts(trygNatural, trygHusSources,
    trygHusFacts.trygHusNatural, ["naturskade.egenandel", "naturskade.hage", "naturskade.relokalisering"]));
  appendCabinFacts(product.productId, detailedEvidence(trygNatural, [
    ["naturskade.unntak", "Naturskade – avgrensninger", "Direkte skred, storm, flom, stormflo, flodbølge, meteoritt, jordskjelv og vulkanutbrudd omfattes. Lyn, frost, tele, tørke, nedbør, snøtyngde, isgang og dyr/insekter/sopp/råte er unntatt fra denne særdekningen. Særreglene går foran øvrige produktvilkår.", 2, "2"],
    ["naturskade.oppgjor", "Naturskade – oppgjør", "Hage og tomt tilbakeføres til samme stand, eller laveste av gjenopprettingskostnad og markedsverdifall uten utbedring. Ung handelsvare brukes for beplantning. Svak konstruksjon, tilsyn og forebygging kan redusere erstatningen. Myndighetsfastsatt totalgrense ved katastrofe kan gi forholdsmessig reduksjon.", 2, "3"],
  ]));
  const earthquake = cabinFacts[product.productId].find(fact => fact.key === "hytte.unntak.jordskjelv");
  if (earthquake) earthquake.qualificationSource = detailedEvidence(trygNatural,
    [["naturskade.dekning", "Naturskade", "", 2, "2"]])[0].source;
  appendCabinFacts(product.productId, detailedEvidence(trygLiability, [
    ["ansvar.omfang", "Eieransvar – person og ting", "Hytte gjelder rettslig ansvar som eier eller fester av forsikret eiendom i Norden. Person-/tingskaden må være konstatert i forsikringstiden. Samme skadevoldende hendelse henføres til første konstaterte skade.", 1, "1–3.1"],
    ["ansvar.grense", "Eieransvar – forsikringssum", "Inntil 5 000 000 kroner ved samme hendelse.", 2, "3.3"],
    ["ansvar.egenandel", "Eieransvar – egenandel", "4 000 kroner per skadetilfelle.", 2, "3.3", "coverage"],
    ["ansvar.unntak", "Eieransvar – avgrensninger", "Avtale-/garantiansvar, bøter/oppreisning, leide/lånte ting, nær familie, motor/luftfartøy, grave-/sprengningsskade, yrke/næring, gradvis forurensning og hussopp/langsom fukt er blant unntakene. Innbo-/reise-/båtutvidelser overføres ikke til hytte.", 2, "3.2, starter på PDF-side 1"],
    ["ansvar.oppgjor", "Eieransvar – plikter og oppgjør", "Sikrede sikrer regress, gir opplysninger og medvirker. Ansvar må ikke erkjennes eller forhandles uten samtykke. Tryg behandler dekningsmessige krav over egenandel og dekker nødvendige saksomkostninger, med særregler for delvis dekning og forlik.", 3, "4–5"],
  ]));
  appendCabinFacts(product.productId, sharedBuildingFacts(trygLegal, trygHusSources,
    trygHusFacts.trygHusLegal, ["rettshjelp.grense", "rettshjelp.egenandel"]));
  appendCabinFacts(product.productId, detailedEvidence(trygLegal, [
    ["rettshjelp.omfang", "Rettshjelp – omfang", "Rimelige nødvendige dokumenterte advokat-/rettshjelper-, retts-, godkjente sakkyndig- og vitneutgifter ved tvist som privat eier eller fester av forsikret eiendom i Norden. Tvisten må oppstå mens forsikringen løper.", 2, "4–5.2, jf. 2–3 på PDF-side 1"],
    ["rettshjelp.unntak", "Rettshjelp – avgrensninger", "Blant unntakene er kostnad før tvist, ankegebyr, idømte kostnader, andre eiendommer, timeshare, yrke/næring, familie/arv, sameier, straff/ulovlig handling og forvaltning uten uttømt klageadgang. Tvist i husleieforhold ved forsikret eiendom er særskilt unntatt fra namsunntaket.", 4, "5.5, starter på PDF-side 3"],
    ["rettshjelp.egen_selskap", "Tvist om rettshjelpsdekning", "Ved tvist mot selskapet om rettshjelpsdekning er samlet sum 20 000 kroner uavhengig av antall parter.", 4, "6.1"],
    ["rettshjelp.meldefrist", "Rettshjelp – melding og advokat", "Skriftlig melding snarest og innen ett år etter tvist og engasjert advokat/rettshjelper. Forvaltning regnes fra uttømt behandling. Sikrede velger passende advokat, begrenser kostnadene og dokumenterer salær og resultat. Likeartede parter kan pålegges felles bistand.", 5, "7"],
  ]));
}
for (const product of cabinProducts.filter(product => product.providerId === "if")) {
  appendCabinFacts(product.productId, sharedBuildingFacts(ifLiability, ifHusSources,
    ifHusFacts.ifHusLiability, ["rettshjelp.grense", "rettshjelp.egenandel",
      "rettshjelp.begrensning", "ansvar.grense", "ansvar.egenandel"]));
  appendCabinFacts(product.productId, detailedEvidence(ifLiability, [
    ["rettshjelp.omfang", "Rettshjelp – omfang", "Personlig eier av forsikret eiendom i Norden. Tvisten må oppstå i forsikringstiden. Rettssakens rimelige nødvendige kostnader og forhåndsgodkjent sakkyndig kan omfattes. Tildelte sakskostnader trekkes fra med unntak ved insolvent motpart.", 1, "1.1–1.4"],
    ["rettshjelp.unntak", "Rettshjelp – avgrensninger", "Blant unntakene er tidligere tvistegrunnlag, familie/arv, yrke/næring, straff, tvangsfullbyrdelse, annen eiendom og juridiske personer. Forvaltningsklage må uttømmes før eventuell søksmålsdekning. Timesats mot boligselger er offentlig salærsats pluss 200 kroner.", 2, "1.5–1.6"],
    ["rettshjelp.meldefrist", "Rettshjelp – melding", "Skriftlig melding snarest og innen ett år etter engasjert advokat. Ved forvaltning fra uttømt klagebehandling. Sikrede velger passende advokat og dokumenterer arbeidstid/salær.", 2, "1.8"],
    ["ansvar.omfang", "Eieransvar – omfang", "Rettslig ansvar som personlig eier av forsikret eiendom i Norden, herunder person-/tingskade og de angitte plutselige naturmangfoldskadene. Første konstaterte skade styrer hvilket forsikringsår som gjelder.", 3, "2.1–2.4"],
    ["ansvar.unntak", "Eieransvar – avgrensninger", "Avtaleutvidet ansvar, lånte/leide ting, nær familie, yrke/næring, annen eiendom, motor/båt/luftfartøy og angitte grave-/sprengnings-, forurensnings- og sopp-/fuktskader er blant unntakene.", 3, "2.5"],
    ["ansvar.oppgjor", "Eieransvar – oppgjør", "Skade meldes uten ugrunnet opphold. Sikrede gir opplysninger og medvirker og kan ikke binde If ved egen erkjennelse. If utreder og behandler dekningsmessige krav. Saksomkostninger kommer i tillegg til summen, med særregler ved delvis dekning og forlik.", 4, "2.8–2.9"],
    ["sikkerhet.tanker", "Tanker – kontroll", "Myndighetskrav til tanker følges. Nedgravd tank kontrolleres/tetthetsprøves senest etter 15 år, deretter hvert femte år. Rekondisjonert tank første gang etter ti år og deretter hvert femte år. Resultatet dokumenteres.", 4, "2.10.1"],
  ]));
}
