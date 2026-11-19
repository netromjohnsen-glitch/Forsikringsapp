import { fremtindFrendeMcBobilCatalog as previous } from "./mc-bobil-fremtind-frende-catalog.ts";
import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

const revision = "2026-09-24";
const previousToppId = "mcb-ff-fremtind-bobil-topp";
const oldSource = (suffix: string) => "mcb-ff-fremtind-bobil-" + suffix;
const currentId = (id: string) => id + "-marked-20260924";

const documents = {
  ansvar: ["ansvar", "0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568", 6, "ansvar"],
  minikasko: ["minikasko", "3ca7b4f39b08b4aba1003023f35c5b97a86b5d0776a2f5c5f89b9890933f4537", 10, "minikasko"],
  kasko: ["kasko", "63a859a5de71d44f7a22bfd0a079107b0798e7c3af20990e7f9cebd829f51303", 10, "kasko"],
  topp: ["bobil-topp", "7510de8c6fe0f23c20e36361510de715c48654a3d7f77ad81a3ad7a49a3f3cfa", 12, "topp"],
  maskinskade: ["maskinskade", "58a5d4c44501599038fa64e8e90653378cbec0ad28049aa912fb7acfea8a70a3", 2, "maskinskade"],
  leiebil: ["leiebil", "6b5c71e898b670c5ef613946c1b6b77e19839bebfb30bd369190aadd1f227f14", 1, "leiebil"],
} as const;
type DocumentKey = keyof typeof documents;
type BobilTier = "ansvar" | "minikasko" | "kasko" | "topp";

const sources: Record<string, CatalogSource> = {};
const documentSources: Record<DocumentKey, CatalogSource[]> = {
  ansvar: [], minikasko: [], kasko: [], topp: [], maskinskade: [], leiebil: [],
};
function register(document: DocumentKey, editionId: string, productIds: string[], termsNumber?: string) {
  const [filename, sha256, pages, authoritySuffix] = documents[document];
  const edition = previous.sources[editionId];
  const source: CatalogSource = {
    ...edition,
    id: currentId(document + "-" + editionId),
    filename: filename + ".pdf",
    documentName: filename + ".pdf",
    url: previous.sources[oldSource(authoritySuffix)].url,
    ...(termsNumber ? { termsNumber, version: termsNumber, effectiveFrom: revision } : {}),
    sha256,
    physicalPages: [1, pages],
    productIds,
  };
  sources[source.id] = source;
  documentSources[document].push(source);
  return source;
}

function withSource(fact: CatalogFact, source: CatalogSource, page: number, section = fact.source.section, value = fact.value) {
  return {
    ...fact,
    value,
    source: {
      ...fact.source, documentId: source.id, filename: source.filename, url: source.url,
      termsNumber: source.termsNumber, version: source.version, effectiveFrom: source.effectiveFrom, page, section,
    },
  };
}

const facts: Record<string, CatalogFact[]> = {};
const previousProducts = previous.products.filter(product => product.agreementScope === "ordinary-dnb" && product.insuranceType === "Bobil");
const products = previousProducts.map(product => {
  const tier = product.productId.slice("fremtind-bobil-".length) as BobilTier;
  const id = currentId(product.productId);
  const productIds = [id];
  const isTopp = tier === "topp";
  const own = register(tier, oldSource(tier), productIds, tier === "minikasko" ? "PMO-357.210-013" : undefined);
  const common = tier === "ansvar" ? own : register(tier, oldSource("ansvar"), productIds);
  const liability = register(tier, previousToppId + "-ansvar", productIds);
  const accident = register(tier, previousToppId + "-ulykke", productIds);
  const legal = register(tier, previousToppId + "-rettshjelp", productIds);
  // All current packages above Ansvar include the September 2026 Minikasko section.
  const mini = tier === "ansvar" || tier === "minikasko" ? own
    : register(tier, previousToppId + "-mini", productIds, "PMO-357.210-013");
  const kasko = isTopp ? register(tier, previousToppId + "-kasko", productIds) : own;
  const legalStart = tier === "ansvar" ? 4 : isTopp ? 10 : 8;
  const legalEnd = legalStart + 2;

  facts[id] = previous.facts[product.productId].map(fact => {
    const { key, source } = fact;
    if (key === "avtale.geografi") return withSource(fact, common, 1);
    if (key.startsWith("ansvar.")) return withSource(fact, liability, 2);
    if (key.startsWith("ulykke.")) return withSource(fact, accident, 3);
    if (key === "rettshjelp.grense") return withSource(fact, legal, tier === "ansvar" ? 5 : legalEnd,
      tier === "ansvar" ? "Rettshjelp 4.2 og 5.1, sakkyndige i 4.1 side 4"
        : "Rettshjelp 5.1, begrensninger og sakkyndige i 4.1–4.2 side " + (legalStart + 1));
    if (key.startsWith("rettshjelp.")) return withSource(fact, legal, key.endsWith(".egenandel") ? legalEnd : legalStart);
    if (isTopp && key.startsWith("nyverdi.")) {
      const value = key === "nyverdi.dekning"
        ? "Ny bil av tilsvarende modell og type med fabrikkmontert tilbehør. For utgått modell eller en erstatter med vesentlige endringer gis kontanterstatning etter sist kjente listepris for modell og utstyrsvariant."
        : fact.value;
      return withSource(fact, own, 9, "Toppkasko Bobil 3.1", value);
    }
    if (source.documentId === oldSource("minikasko") || source.documentId === previousToppId + "-mini") {
      const value = key === "glass.dekning"
        ? "Reparasjon eller skifte av glass ved bruddskade på rute, glasstak og takluke. Solcellepanel omfattes ikke."
        : fact.value;
      return withSource(fact, mini, source.page, source.section, value);
    }
    if (source.documentId === oldSource("kasko") || source.documentId === previousToppId + "-kasko") {
      if (key === "kasko.egenandel") return withSource(fact, kasko, 8, "Kasko 3.1");
      if (key === "feilfylling.dekning") return withSource(fact, kasko, 7, "Kasko 1.1, redning i Minikasko 2.4.2 side 5");
      return withSource(fact, kasko, 7, "Kasko 1.1");
    }
    if (source.documentId !== previousToppId || !isTopp) throw new Error("Uventet vilkårskilde for DNB Bobil: " + source.documentId);
    if (key.endsWith(".egenandel")) return withSource(fact, own, 10, key.startsWith("nokkel.") ? "Toppkasko Bobil 4.1" : "Toppkasko Bobil 4.4");
    if (key.startsWith("nokkel.")) return withSource(fact, own, 8, "Toppkasko Bobil 2.1.1");
    if (key.startsWith("parkering.")) return withSource(fact, own, 8, "Toppkasko Bobil 2.1.4");
    if (key.startsWith("bobil.fukt.")) return withSource(fact, own, 9, "Toppkasko Bobil 2.1.7");
    if (key.startsWith("bobil.feriegaranti.")) return withSource(fact, own, 9, "Toppkasko Bobil 2.1.6");
    return withSource(fact, own, source.page, source.section);
  });
  return {
    ...product, productId: id, componentIds: [id], sourceId: own.id,
    version: tier === "ansvar" ? product.version : revision,
  };
});

const addOns = (["leiebil", "maskinskade"] as const).map(document => {
  const addOn = previous.addOns.find(item => item.id === "fremtind-bobil-" + document)!;
  const id = currentId(addOn.id);
  const requiresLevel = addOn.requiresLevel!.map(currentId);
  const source = register(document, oldSource(document), requiresLevel,
    document === "leiebil" ? "PMO-350.402-004" : "PMO-350.201-002");
  facts[id] = previous.facts[addOn.componentId].map(fact => {
    let value = fact.value;
    if (fact.key === "maskinskade.dekning") value = value.replace(
      "PTC-varmer og AC/klimakompressor når de har kjøle-/varmefunksjon mot høyvoltsbatteri",
      "PTC-varmer med varmefunksjon mot høyvoltsbatteriet og AC-klimakompressor med kjøle- eller varmefunksjon mot høyvoltsbatteriet",
    );
    if (fact.key === "maskinskade.begrensning") {
      value = "Unntak omfatter slitasje og gradvis utviklet skade, samt skade som fører til eller skyldes forhøyet oljeforbruk, varmgang, frost, irr eller fukt.";
    }
    return withSource(fact, source, fact.source.page, fact.source.section, value);
  });
  return { ...addOn, id, componentId: id, requiresLevel };
});

export const fremtindBobilMarket = {
  replacesProductIds: previousProducts.map(product => product.productId),
  products, facts, sources, addOns,
};

export const fremtindBobilMarketArchives = (Object.keys(documents) as DocumentKey[]).map(document => ({
  provider: "fremtind",
  slug: "bobil-" + document + "-20260924",
  archivePath: "catalog/sources/fremtind/current-20260924/" + documents[document][0] + ".pdf",
  sources: documentSources[document].map(source => [source.id, source.effectiveFrom, source.url!] as const),
}));
