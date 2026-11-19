import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const effectiveFrom = "2026-07-01";
const insuranceType = "Innbo fritidsbolig";
const tiers = [
  { id: "tryg-innbo-fritidsbolig-standard", name: "Innbo", termsNumber: "PPK32013", slug: "innbo-fritidsbolig-ppk32013-2026-07",
    filename: "tryg-hytte-innbo-2026-07.pdf", pages: 5, option: "Fritidshusforsikring-Innbo", allowance: "20 000",
    sha256: "d4287ae753b95c8662780995af89f61bc9810accb1bf8004de939f7ac7465fdf" },
  { id: "tryg-innbo-fritidsbolig-ekstra", name: "Innbo Ekstra", termsNumber: "PPK32014", slug: "innbo-fritidsbolig-ppk32014-2026-07",
    filename: "tryg-hytte-innbo-ekstra-2026-07.pdf", pages: 6, option: "Fritidshusforsikring-Innbo-Ekstra", allowance: "40 000",
    sha256: "370901ed23d1c0ce2ea1df03f7190a6a0265136b9d90dd828705ab5e78f298be" },
] as const;

const common = {
  company: "Tryg", providerId: "tryg", insuranceType, agreementScope: "ordinary",
} as const;
const productIds = tiers.map(tier => tier.id);
const documentId = (termsNumber: string) => "tryg:market:innbo-fritidsbolig:" + termsNumber;
const pdf = (termsNumber: string, option: string) => "https://www.tryg.no/odpdf?vilk=" + option + "&vilkNr=05" + termsNumber;

const productTerms: CatalogSource = {
  ...common,
  id: documentId("PPK32000"), filename: "tryg-hytte-produkt.pdf", termsNumber: "PPK32000", version: "PPK32000",
  effectiveFrom: "2025-07-01", url: pdf("PPK32000", "Fritidshusforsikring-Produkt"),
  sourceType: "full_terms", productIds, physicalPages: [1, 1],
  sha256: "14010738eb671a0240209b263c0bdc28f2875be5fa960de75d19ecb802a47121",
};
const salesPage: CatalogSource = {
  ...common,
  id: documentId("product-page"), filename: "Innboforsikring for hytte", termsNumber: "Produktside", effectiveFrom: "",
  updatedAt: "2026-07-08", sourceType: "product_page", productIds,
  url: "https://www.tryg.no/forsikringer/bolig-og-innbo/fritidsbolig-hytteforsikring/innboforsikring-for-hytte",
};
const coverageTerms = tiers.map<CatalogSource>(tier => ({
  ...common,
  id: documentId(tier.termsNumber), filename: tier.filename, termsNumber: tier.termsNumber, version: tier.termsNumber,
  effectiveFrom, url: pdf(tier.termsNumber, tier.option), productIds: [tier.id], physicalPages: [1, tier.pages],
  sourceType: "full_terms", sha256: tier.sha256,
}));

function citation(document: CatalogSource, page: number, section: string): CatalogFact["source"] {
  const { id, filename, termsNumber, version, effectiveFrom, url } = document;
  return {
    documentId: id, page, section, filename, termsNumber, version, effectiveFrom, url,
    company: "Tryg", agreementScope: "ordinary",
  };
}

const unavailable = { coverageAvailability: "unavailable" } as const;

const facts: Record<string, CatalogFact[]> = Object.fromEntries(tiers.map((tier, index) => {
  const document = coverageTerms[index];
  const extra = tier.name === "Innbo Ekstra";
  const row = (key: string, label: string, value: string, page: number, section: string, options?: Pick<CatalogFact,
    "coverageAvailability" | "deductibleClassification" | "qualificationSource">): CatalogFact =>
    ({ key, label, value, source: citation(document, page, section), ...options });

  const rows: CatalogFact[] = [
    { key: "innbo.kjopskrav", label: "Krav ved kjøp", value: "Kjøpes sammen med Trygs hytteforsikring. Valgt innbodekning står i forsikringsbeviset.",
      source: citation(productTerms, 1, "2"), qualificationSource: citation(salesPage, 0, "Innboforsikring for hytte") },
    row("innbo.forsikringssted", "Forsikringssted", "Hytta eller fritidsboligen på adressen i forsikringsbeviset.", 1, "1.1",
      { qualificationSource: citation(productTerms, 1, "3") }),
    row("innbo.forsikringssum", "Samlet forsikringssum for innbo og løsøre", "Inntil forsikringssummen du velger, som fremgår av forsikringsbeviset. Enkelte ting og skader har egne beløpsgrenser.", 1, "1.1"),
    row("egenandel.standard", "Generell egenandel", "Står i forsikringsbeviset med mindre vilkåret angir en annen egenandel.", extra ? 5 : 4, "3.2",
      { deductibleClassification: "reference" }),
    row("brann.dekning", "Brann", "Plutselig og uforutsett skade når ild kommer løs. Svi- eller gnistskade uten brann omfattes ikke.", 2, "2.1"),
    row("elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Plutselig og uforutsett skade ved lynnedslag, kortslutning, elektrisk fenomen eller tilsvarende. Kortslutning eller elektrisk fenomen på grunn av vann eller væske er unntatt.", 3, "2.2"),
    row("vann.dekning", "Vannskade", "Plutselig og uforutsett utstrømming fra blant annet rør, tilknyttet utstyr eller akvarium, og enkelte former for inntrenging. Ved vann direkte fra terreng eller grunn kreves frittstående vann over laveste gulv.", 3, "2.3"),
    row("vann.egenandel", "Vann fra terreng eller grunn – egenandel", "Minst 8 000 kr ved skade fra terreng eller grunn.", 3, "2.3", { deductibleClassification: "override" }),
    row("naturskade.dekning", "Naturskade", "Omfattet i Norge etter de særskilte naturskadevilkårene PGE90010.", 2, "1.3",
      { qualificationSource: citation(productTerms, 1, "3") }),
    row("tyveri.dekning", "Tyveri og skadeverk", "Tyveri og skadeverk på ting, blant annet i rom du disponerer i bygning på forsikringsstedet. Vilkåret har egne delgrenser og unntak for enkelte oppbevaringssteder.", 3, "2.4"),
    row("tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "Inntil " + tier.allowance + " kr på eget privat uteareal.", 3, "2.4"),
    row("sykkel.tyveri.grense", "Sykkel, elsykkel, sykkeltilhenger og barnevogn – tyverigrense",
      "Inntil " + tier.allowance + " kr per gjenstand ved tyveri eller skadeverk" + (extra ? "." : " andre steder enn de særskilt oppregnede."),
      3, "2.4"),
    row("innbo.fritidsbat.grense", "Fritidsbåt og utenbordsmotor – grense", "Til sammen " + tier.allowance + " kr for fritidsbåt inntil 15 fot og båtmotor inntil 10 hk på forsikringsstedet.", 1, "1.1"),
    row("innbo.tilhenger.grense", "Tilhenger til person- og varebil – grense", "Til sammen " + tier.allowance + " kr for vare- og båttilhenger på forsikringsstedet.", 1, "1.1"),
    row("innbo.penger.grense", "Penger og verdipapirer – grense", "Til sammen inntil 20 000 kr ved erstatningsmessig skade.", 2, "1.2"),
    row("innbo.opphold.dekning", "Erstatningshytte etter skade", "Dekningen for opphold utenfor hjemmet gjelder ikke for fritidshusforsikring.", 2, "1.2", unavailable),
    row("ansvar.dekning", "Privatansvar", "Omfattet etter de særskilte vilkårene for privatansvar PGE90020.", 2, "1.4"),
    row("rettshjelp.dekning", "Rettshjelp", "Omfattet etter de særskilte rettshjelpsvilkårene PGE91500.", 2, "1.5"),
  ];

  if (extra) {
    rows.push(
      row("uhell.dekning", "Uhell", "Plutselig og uforutsett skade med kjent årsak. Forsvinning omfattes ikke. Skader på sykkel og elsykkel er begrenset til 40 000 kr og er unntatt under ritt, løp eller konkurranse.", 4, "2.5"),
      row("uhell.egenandel", "Uhell – egenandel", "2 000 kr per skadetilfelle. Minst 8 000 kr ved vind svakere enn storm, snøtyngde eller ras fra tak.", 4, "2.5", { deductibleClassification: "override" }),
      row("skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelsesdekningen i Innbo Ekstra punkt 2.6 gjelder forsikringstakers faste bosted i Norge.", 4, "2.6", unavailable),
    );
  } else {
    rows.push(row("uhell.dekning", "Uhell", "Innbo har særregler for bestemte andre skadetilfeller. Den generelle dekningen for plutselige og uforutsette skader følger Innbo Ekstra.", 4, "2.5", unavailable));
  }

  return [tier.id, rows];
}));

const products = tiers.map<CatalogProduct>(tier => ({
  ...common,
  productId: tier.id, name: tier.name, version: tier.termsNumber, sourceId: documentId(tier.termsNumber), componentIds: [tier.id],
}));

export const trygHolidayContentsMarket = {
  replacesProductIds: [] as string[],
  products,
  sources: Object.fromEntries([productTerms, salesPage, ...coverageTerms].map(source => [source.id, source])),
  facts,
  addOns: [] as CatalogAddOn[],
};

export const trygHolidayContentsArchives = [
  { provider: "tryg", slug: "innbo-fritidsbolig-ppk32000-2025-07",
    archivePath: "catalog/sources/private-cabin/" + productTerms.filename,
    sources: [[productTerms.id, productTerms.effectiveFrom, productTerms.url!] as const] },
  ...coverageTerms.map((source, index) => ({
    provider: "tryg", slug: tiers[index].slug,
    archivePath: "catalog/sources/private-cabin/" + source.filename,
    sources: [[source.id, source.effectiveFrom, source.url!] as const],
  })),
];
