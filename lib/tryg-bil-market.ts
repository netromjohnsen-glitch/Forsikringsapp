import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { trygFacts, trygSources } from "./tryg-catalog.ts";

const officialDocuments = [
  ["ansvar", "bil-ansvar-pau25003", "Bilforsikring-Ansvar", 1, "c024994aa75d6dd5a6f6fd8349589a19afb3d7e6d69ab133dbb280c57342b3d6"],
  ["delkasko", "bil-delkasko-pau25835", "Bilforsikring-Delkasko", 3, "3337c9c2e76f572f5c537470ff244c02ab7b24df3b71e2d1a041e974a68743be"],
  ["kasko", "bil-kasko-pau25205", "Bilforsikring-Kasko", 4, "d7d2763819d9d3b8718231813f38fc0e1d86e0d2ccd7fdda4e06d06c84451dae"],
  ["bilEkstra", "bil-ekstra-pau27002", "Bilforsikring-BilEkstra", 2, "c7514c58cf572dc52fc8251a7d5caec64d53c8b670ea3e24c517eff5e040c74d"],
  ["elbilEkstra", "elbil-ekstra-pau27013", "Bilforsikring-ElbilEkstra", 2, "2696a5e335c88c020f1d6eebb007cc941a02f6c56b2373ce116223e61c1da48d"],
  ["leiebil", "bil-leiebil-pau27008", "Bilforsikring-Leiebil", 1, "a488b0963dd74741c1608f1b5687f4aa070c533efa73950c465410987646192e"],
  ["maskinskade", "bil-maskinskade-pau27110", "Bilforsikring-Maskinskade", 2, "2aa1b0b720c552de29409db06dfdd89c97a57a27a2b669576f3e15f90b21c71d"],
  ["ulykke", "bil-forer-passasjerulykke-pau28003", "Forerogpassasjerulykke", 2, "d3b347f12c14756916de04c0a5a595d34bf8c082ff8d59dc1e2f02d07cfa8f52"],
  ["ulykkeEkstra", "bil-forer-passasjerulykke-ekstra-pau28013", "ForerogpassasjerulykkeEkstra", 2, "00f818f64e54c2db9dc58d77786232f27cb771c802f1fa4d5ac45e50aa01a556"],
] as const;

const sources: Record<string, CatalogSource> = Object.fromEntries(officialDocuments.map(([id, , path, pages, sha256]) => {
  const source = trygSources[id];
  const url = "https://www.tryg.no/odpdf?vilkNr=05" + source.termsNumber + "&vilk=" + path;
  return [id, { ...source, url, sha256, physicalPages: [1, pages] }];
}));

const supplementalDocuments = [
  {
    id: "tryg-bil-produkt-pau14000", slug: "bil-produkt-pau14000",
    archivePath: "catalog/sources/tryg/market-bil-2026/PAU14000.pdf",
    termsNumber: "PAU14000", effectiveFrom: "2026-07-01", pages: 2,
    url: "https://www.tryg.no/odpdf?vilkNr=05PAU14000&vilk=Bilforsikring-Produkt",
    sha256: "ab2cad9d7799652ab208f237e0d9a1f1d36b3ad2fdc5b504b3536f37db25b116",
  },
  {
    id: "tryg-bil-rettshjelp-pge91500", slug: "bil-rettshjelp-pge91500",
    archivePath: "catalog/sources/tryg/hus/05PGE91500.pdf",
    termsNumber: "PGE91500", effectiveFrom: "2026-01-01", pages: 5,
    url: "https://www.tryg.no/odpdf?vilkNr=05PGE91500&vilk=Fellesvilkaar-Rettshjelp",
    sha256: "bb2facd87cd377c994521ecf530ff82e1872ffc058d142f32832e5cd1999e291",
  },
] as const;

for (const { id, archivePath, termsNumber, effectiveFrom, pages, url, sha256 } of supplementalDocuments) {
  sources[id] = {
    id, filename: archivePath.slice(archivePath.lastIndexOf("/") + 1), termsNumber, effectiveFrom,
    url, sha256, company: "Tryg", providerId: "tryg", insuranceType: "Bil", agreementScope: "ordinary",
    sourceType: "full_terms", physicalPages: [1, pages],
  };
}

function reference(id: string, page: number, section: string): CatalogFact["source"] {
  const { filename, termsNumber, effectiveFrom, url, company, agreementScope } = sources[id];
  return { documentId: id, filename, termsNumber, effectiveFrom, url, company, agreementScope, page, section };
}

const productTerms = supplementalDocuments[0].id;
const legalTerms = supplementalDocuments[1].id;
const facts: Record<string, CatalogFact[]> = Object.fromEntries(Object.entries(trygFacts).map(([componentId, rows]) => [
  componentId,
  rows.map(fact => {
    const { documentId, section } = fact.source;
    let { page } = fact.source;
    if (documentId === "kasko" && ["2.3", "2.4", "2.5"].includes(section)) {
      page = fact.key === "veihjelp.egenandel" ? 3 : 2;
    }
    if (documentId === "ansvar" && fact.key === "rettshjelp.dekning") {
      return {
        ...fact, value: "Inkludert når ansvar er avtalt",
        source: reference(documentId, 1, "1.2"),
        qualificationSource: reference(productTerms, 1, "2"),
      };
    }
    const base = { ...fact, source: { ...fact.source, page, url: sources[documentId].url } };
    return fact.key === "ulykke.dod"
      ? { ...base, source: { ...base.source, section: "3.2" }, qualificationSource: reference(documentId, 1, "2.2") }
      : base;
  }),
]));

facts.ansvar.push(
  { key: "avtale.geografi", label: "Geografisk område", value: "Europa, unntatt Russland, Belarus og Tyrkia.", source: reference(productTerms, 1, "3") },
  { key: "rettshjelp.geografi", label: "Rettshjelp – geografisk område", value: "Norden.", source: reference(productTerms, 1, "3") },
  { key: "rettshjelp.grense", label: "Rettshjelp – forsikringssum",
    value: "100 000 kr per tvist, inntil 250 000 kr når minst tre parter er på sikredes side. Eiere av samme gjenstand regnes som én part. Grensen er sikredes antatte økonomiske interesse, med mindre Tryg godkjenner mer. Tvister om selve rettshjelpsdekningen har grense på 20 000 kr.",
    source: reference(legalTerms, 4, "6.1") },
  { key: "rettshjelp.egenandel", label: "Rettshjelp – egenandel",
    value: "4 000 kr pluss 20 % av utgiftene over 4 000 kr. Én egenandel per tvist.", source: reference(legalTerms, 5, "6.2"),
    deductibleClassification: "coverage" },
  { key: "bonus.topp", label: "Toppbonus",
    value: "75 % i system A eller 80 % i system B. Toppbonus oppnås etter tre skadefrie år med 75 % bonus. Avtalt system står i forsikringsbeviset.",
    source: reference(productTerms, 2, "5.1") },
  { key: "bonus.fritak", label: "Skader uten bonustap",
    value: "Brann, tyveri, glass og veihjelp gir ikke bonustap. Det samme gjelder naturskade som skyldes skred, storm, flom eller stormflo direkte. Påkjørsel av dyr gir ikke bonustap når politi eller viltnemnd varsles omgående og varslingen kan dokumenteres.",
    source: reference(productTerms, 2, "5.1") },
);

facts.kasko.push({
  key: "reparasjon.garanti", label: "Garanti ved reparasjon",
  value: "8 år ved karosserireparasjon av dekket skade hos avtaleverksted. Mekaniske deler har samme garanti som hos merkeforhandler. Ved bytte til brukt motor er garantien 3 år når service overholdes. Slitedeler er unntatt.",
  source: reference("kasko", 3, "3.2 Reparasjonsgaranti"),
});

export const trygBilMarket = {
  replacesProductIds: [] as string[],
  products: [] as CatalogProduct[],
  sources,
  facts,
  addOns: [] as CatalogAddOn[],
};

export const trygBilMarketArchives = [
  ...officialDocuments.map(([id, slug]) => {
    const source = sources[id];
    return {
      provider: "tryg",
      slug,
      archivePath: "catalog/sources/tryg/" + source.filename,
      sources: [[id, source.effectiveFrom, source.url!]] as const,
    };
  }),
  ...supplementalDocuments.map(({ id, slug, archivePath, effectiveFrom, url }) => ({
    provider: "tryg", slug, archivePath, sources: [[id, effectiveFrom, url]] as const,
  })),
];
