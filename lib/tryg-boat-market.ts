import { buildBoatPetCatalog, type BoatPetRow, type BoatPetProductDefinition, type BoatPetAddOnDefinition } from "./boat-pet-catalog-builder.ts";
import { boatPetSources } from "./boat-pet-catalog.ts";
import type { CatalogSource } from "./product-catalog.ts";

const documents = {
  "summary": {
    "termsNumber": "IPID Fritidsbåtforsikring",
    "version": "2026-09-01",
    "slug": "bat-ipid-2026-09",
    "archivePath": "catalog/sources/boat-pet/tryg-boat-ipid-2026-09.pdf",
    "url": "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Batforsikring.pdf",
    "sha256": "87306b65124b15af75a125d12a6952310361726a94e09a894cee5a4895ae8cce"
  },
  "geography": {
    "termsNumber": "PFB33000",
    "version": "2026-01-01",
    "slug": "bat-produkt-innenbord",
    "archivePath": "catalog/sources/boat-pet/tryg-boat-inboard-terms.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB33000&vilk=Baatforsikring-innenbords-Produkt",
    "sha256": "d79e9af50bf6ba36b8c0b9093fbca2bd7f43b55b86b3b42b0db45581f3122cd5"
  },
  "kaskoInboard": {
    "termsNumber": "PFB33100",
    "version": "2026-01-01",
    "slug": "bat-kasko-innenbord",
    "archivePath": "catalog/sources/tryg/member-agreements/nito-rabatt/05pfb33100.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB33100&vilk=Baatforsikring-innenbords-Kasko-Ansvar",
    "sha256": "ad1fdc605f9f36d09f2052a5ed1fa9ed0fe17a2bb2fe13e886e1d3b4ef839a35"
  },
  "kaskoOutboard": {
    "termsNumber": "PFB34100",
    "version": "2026-01-01",
    "slug": "bat-kasko-pahengsmotor",
    "archivePath": "catalog/sources/tryg/member-agreements/nito-rabatt/05pfb34100.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB34100&vilk=Baatforsikring-Utenbords-Kasko-Ansvar",
    "sha256": "57813c7c94e82c06961c8c051cc7432d14dcafd61170d997b8aa9c4d0fe58591"
  },
  "kaskoSail": {
    "termsNumber": "PFB35100",
    "version": "2026-07-01",
    "slug": "bat-kasko-seilbat",
    "archivePath": "catalog/sources/tryg/member-agreements/nito-rabatt/05pfb35100.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB35100&vilk=Seilbaatforsikring-Kasko-Ansvar",
    "sha256": "498cc9bfb6adbbd0ccbbb875450239c774fefc17d2ec42e353dc271f1ff138f3"
  },
  "kaskoRow": {
    "termsNumber": "PFB37100",
    "version": "2026-07-01",
    "slug": "bat-kasko-robat",
    "archivePath": "catalog/sources/tryg/member-agreements/nito-rabatt/05pfb37100.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB37100&vilk=Robaat-Kano-Kajakk-Kasko-Ansvar",
    "sha256": "e59efd936e4e591b163035ee113bb9b44fd45fdf9b2af768e7f3ff6427664b8a"
  },
  "extra": {
    "termsNumber": "PFB36900",
    "version": "2026-07-01",
    "slug": "bat-ekstra",
    "archivePath": "catalog/sources/boat-pet/tryg-boat-extra-terms.pdf",
    "url": "https://www.tryg.no/odpdf?vilkNr=05PFB36900&vilk=Baat%20Ekstra",
    "sha256": "994998cf314d6062ee313941b804b382fd5e4818ab223601aed4ec2c7bb92b0a"
  }
} as const;

type MarketDocument = keyof typeof documents;
const sourceId = (key: MarketDocument) => "boat-pet:tryg:båt:market:" + key;
const machineryId = "boat-pet:tryg:båt:machinery";
const accidentId = "boat-pet:tryg:båt:accident";

export const trygBoatMarketArchives = (Object.keys(documents) as MarketDocument[]).map(key => {
  const { slug, archivePath, version, url } = documents[key];
  return { provider: "tryg", slug, archivePath, sources: [[sourceId(key), version, url] as const] };
});

const marketSources: Record<string, CatalogSource> = Object.fromEntries((Object.keys(documents) as MarketDocument[]).map(key => {
  const { archivePath, version, termsNumber, url, sha256 } = documents[key];
  const id = sourceId(key);
  return [id, { id, filename: archivePath.split("/").at(-1)!, providerId: "tryg", company: "Tryg", insuranceType: "Båt",
    agreementScope: "ordinary", sourceType: key === "summary" ? "ipid" : "full_terms", termsNumber,
    effectiveFrom: version, version, url, sha256, documentName: termsNumber } satisfies CatalogSource];
}));

const citation = (document: MarketDocument, page: number, section: string) => ({ sourceId: sourceId(document), page, section });
const fact = (key: string, value: string, source: ReturnType<typeof citation>, qualificationSource?: ReturnType<typeof citation>): BoatPetRow => ({
  key, value, ...source, ...(qualificationSource ? { qualificationSource } : {}),
});

const geography = citation("summary", 2, "Hvor gjelder forsikringen?");
const fire = citation("summary", 1, "Brann/Tyveri/Ansvar");
const kasko = citation("summary", 1, "Kasko/Ansvar");
const workshopInboard = citation("kaskoInboard", 3, "3.4 Transport av skadet båt");
const extraTransport = citation("extra", 1, "1.6 Transport av båten");
const extraLimits = citation("extra", 2, "1.6 Ferieavbrudd og felles erstatningsgrense");
const workshopText = "Ved en skade som omfattes av Kasko dekkes utgifter til transport til nærmeste verksted, eller reparasjon på stedet hvis det er rimeligere.";

const core: BoatPetRow[] = [
  fact("bat.ansvar.dekning", "Privat erstatningsansvar for skade som båten påfører andre personer eller andres eiendeler.", citation("summary", 1, "Ansvar")),
  fact("bat.rettshjelp.dekning", "Rettshjelp gjelder i Norden.", geography),
  fact("bat.geografi.dekning", "Inkludert", geography),
  fact("bat.geografi.omrade", "Europa inntil 200 nautiske mil fra fastlandet, med unntak for Russland og russisk farvann. Overfart til Svalbard, Island, Storbritannia, Madeira, Azorene og Kanariøyene omfattes. Rettshjelp gjelder i Norden.",
    geography, citation("geography", 1, "3 Hvor forsikringen gjelder – innenbordsmotor og vannscooter")),
];
const fireAndTheft: BoatPetRow[] = [
  fact("bat.brann.dekning", "Skade ved brann, eksplosjon eller lynnedslag når båten er på sjøen eller i opplag.", fire),
  fact("bat.tyveri.dekning", "Tyveri, brukstyveri og forsøk på tyveri av eller fra båten.", fire),
];
const kaskoFacts: BoatPetRow[] = [
  ...core, ...fireAndTheft,
  fact("bat.kasko.dekning", "Dekker blant annet grunnstøting, sammenstøt, synking, kantring og plutselig ytre skade under transport, slipp eller løft. Detaljene følger vilkåret for båttypen.",
    kasko, citation("kaskoInboard", 2, "2.1 Transport, slipp og løft")),
  fact("bat.haerverk.dekning", "Skade på båten ved hærverk.", kasko),
  fact("bat.transport.dekning", workshopText, workshopInboard, citation("kaskoRow", 2, "3.4 Transport av skadet båt")),
  fact("bat.transport.begrensning", "Vilkåret for påhengsmotor dekker skade på båten under transport, slipp eller løft ved en tilfeldig, plutselig og ytre påvirkning. For en nyinnkjøpt båt i utlandet er transport til Norge unntatt.",
    citation("kaskoOutboard", 2, "2.1 Transport, slipp og løft")),
  fact("bat.redning.dekning", "Bergelønn dekkes etter sjølovens regler. Ved uventet driftsstans dekker Kasko for motor- og seilbåt rimelige og nødvendige utgifter til slep til nærmeste havn.",
    citation("kaskoSail", 3, "3.4 Assistanse og bergelønn"), citation("kaskoInboard", 3, "3.4 Assistanse og bergelønn")),
  { ...fact("bat.redning.egenandel", "500 kr ved assistanse etter uventet driftsstans for motor- og seilbåt. Assistanse som følge av en dekket skade har ingen egenandel.",
    citation("kaskoSail", 3, "3.6 Egenandel"), citation("kaskoInboard", 3, "3.6 Egenandel")), deductibleClassification: "coverage" },
];
const extraFacts: BoatPetRow[] = [
  ...kaskoFacts.filter(row => row.key !== "bat.transport.dekning"),
  fact("bat.transport.dekning", "Båt Ekstra er et tillegg til Kasko. " + workshopText +
    " Tillegget dekker nødvendige merutgifter til henting eller transport hvis båten må etterlates etter skaden, eller ved ulykke, plutselig sykdom eller akutt forverring hos føreren eller en annen sentral person.",
    extraTransport, workshopInboard),
  fact("bat.transport.grense", "Samlet for transport, opphold, hjemreise og ferieavbrudd etter punkt 1.6: inntil 20 % av båtens forsikringssum, maksimalt 100 000 kr.", extraLimits),
  fact("bat.ferieavbrudd.dekning", "Ved avbrutt planlagt båttur på over seks dager kan ferieavbrudd erstattes når båten er stjålet eller ikke kan brukes etter en dekket skade. Utgifter og turens varighet må dokumenteres.", extraLimits),
  fact("bat.ferieavbrudd.dager", "Inntil 21 dager.", extraLimits),
  fact("bat.ferieavbrudd.dagsbelop", "2 500 kr per dag.", extraLimits),
  fact("bat.losore.grense", "Inntil 100 000 kr, med 30 000 kr per gjenstand. Løsøre ved utleie er unntatt.", citation("extra", 1, "1.2 Personlig løsøre")),
  fact("bat.opplagsutstyr.dekning", "Utstyr og materiell til opplag omfattes. Egenandel 2 500 kr.", citation("extra", 1, "1.4 Materiell til bruk ved opplag")),
  fact("bat.opplagsutstyr.grense", "Inntil 30 000 kr.", citation("extra", 1, "1.4 Materiell til bruk ved opplag")),
  fact("bat.jolle.dekning", "Én småbåt på inntil 14 fot til hovedbåten, og én ekstra påhengsmotor på inntil 25 hk. Egenandel 2 500 kr.", citation("extra", 1, "1.5 Småbåt med ekstra motor")),
  fact("bat.jolle.grense", "Samlet inntil 50 000 kr for småbåt og ekstra motor.", citation("extra", 1, "1.5 Småbåt med ekstra motor")),
  fact("bat.totalskade.dekning", "Ny båt av samme merke og modell ved totalskade innen tre år etter kjøp av fabrikkny båt, når reparasjon koster over 60 % av gjenanskaffelsesverdien. Erstatningen er begrenset til avtalt forsikringssum.",
    citation("extra", 2, "1.8 Totalskade")),
];

const provider = { providerId: "tryg", company: "Tryg", type: "båt", agreementScope: "ordinary" } as const;
const products: BoatPetProductDefinition[] = [
  { productId: "tryg-marked-bat-ansvar", name: "Ansvar", rows: core },
  { productId: "tryg-marked-bat-brann-tyveri-ansvar", name: "Brann/Tyveri/Ansvar", rows: [
    ...core, ...fireAndTheft,
    fact("bat.transport.dekning", "Transport til nærmeste verksted ved båtskade i forbindelse med brann eller tyveri.", fire),
  ] },
  { productId: "tryg-marked-bat-kasko-ansvar", name: "Kasko/Ansvar", rows: kaskoFacts },
  { productId: "tryg-marked-bat-ekstra", name: "Båt Ekstra", rows: extraFacts },
].map(product => ({ ...provider, ...product, version: documents.summary.version, sourceId: sourceId("summary") }));

const addOns: BoatPetAddOnDefinition[] = [
  { ...provider, id: "tryg-marked-bat-maskinskade", name: "Maskinskade", sourceId: machineryId,
    requiresLevel: ["tryg-marked-bat-kasko-ansvar", "tryg-marked-bat-ekstra"], rows: [
      { key: "bat.maskinskade.dekning", value: "Valgfritt tillegg for motorbåt og seilbåt. Omfatter blant annet brudd og brekkasje i motor, gir, aksel og styring etter vilkårene.", sourceId: machineryId, page: 1, section: "1 Hva forsikringen omfatter" },
      { key: "bat.maskinskade.alder", value: "Til utløpet av forsikringsperioden hvor motoren eller delene fyller 15 år for innenbordsmotor og 12 år for påhengsmotor.", sourceId: machineryId, page: 1, section: "1 Hva forsikringen omfatter" },
      { key: "bat.maskinskade.egenandel", value: "4 000 kr til og med fem års alder. Deretter 25 % av skaden, minst 4 000 kr.", sourceId: machineryId, page: 1, section: "1.1 Egenandel", deductibleClassification: "coverage" },
    ],
  },
  { ...provider, id: "tryg-marked-bat-ulykke", name: "Fører- og passasjerulykke", sourceId: accidentId,
    requiresLevel: products.map(product => product.productId), rows: [
      { key: "bat.ulykke.dekning", value: "Valgfritt tillegg for ulykkesskade under rettmessig bruk av båten. Utenfor båten kreves det at båten er direkte årsak til skaden.", sourceId: accidentId, page: 1, section: "2 Tilfeller som kan gi rett til erstatning" },
      { key: "bat.ulykke.invaliditet", value: "Inntil 200 000 kr ved varig medisinsk invaliditet.", sourceId: accidentId, page: 1, section: "3.1 Invaliditetserstatning" },
      { key: "bat.ulykke.dod", value: "100 000 kr ved dødsfall, redusert til 20 000 kr hvis avdøde ikke hadde ektefelle eller barn under 20 år. Samlet maksimum 1 500 000 kr per ulykke.", sourceId: accidentId, page: 2, section: "3.2 Dødsfall og 3.3 Maksimal erstatning" },
    ],
  },
];

export const trygBoatMarket = buildBoatPetCatalog({
  ...marketSources,
  [machineryId]: boatPetSources[machineryId],
  [accidentId]: boatPetSources[accidentId],
}, products, addOns);
