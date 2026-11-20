import comparisonEvidence from "../catalog/market-comparison-gap-evidence.json" with { type: "json" };
import { privateHolidayContentsMarket } from "./private-holiday-contents-gjensidige-watercircles.ts";
import { privateHomeTravelCoverageMarket } from "./private-home-travel-coverage-market.ts";
import { frendeDogMarket } from "./frende-dog-market.ts";
import { fremtindBobilMarket } from "./fremtind-bobil-market.ts";
import { productCatalog, type CatalogAddOn, type CatalogFact, type CatalogProduct, type CatalogSource } from "./product-catalog.ts";
import { sparebank1FremtindBilMarket } from "./sparebank1-fremtind-bil-market.ts";
import { storebrandHolidayContentsMarket } from "./holiday-contents-storebrand-market.ts";
import { storebrandInnboMarket } from "./storebrand-innbo-market.ts";
import { storebrandMotorMarket } from "./storebrand-motor-market.ts";
import { trygBilMarket } from "./tryg-bil-market.ts";
import { trygBoatMarket } from "./tryg-boat-market.ts";
import { trygHolidayContentsMarket } from "./holiday-contents-tryg-market.ts";
import { trygHomeMarketEvidence } from "./tryg-home-market-evidence.ts";
import { trygSnowMarket } from "./tryg-snow-market.ts";

const marketUpdates = [
  {
    ...trygBoatMarket,
    replacesProductIds: [
      "tryg-bat-ansvar", "tryg-bat-brann-ansvar", "tryg-bat-brann-tyveri-ansvar",
      "tryg-bat-kasko-ansvar", "tryg-bat-bat-ekstra",
    ],
  },
  storebrandHolidayContentsMarket,
  privateHolidayContentsMarket,
  privateHomeTravelCoverageMarket,
  storebrandInnboMarket,
  storebrandMotorMarket,
  fremtindBobilMarket,
  frendeDogMarket,
  sparebank1FremtindBilMarket,
  trygBilMarket,
  trygHolidayContentsMarket,
  trygHomeMarketEvidence,
  trygSnowMarket,
];

const replacements = new Map<string, CatalogProduct[]>();
for (const update of marketUpdates) {
  for (const [index, productId] of update.replacesProductIds.entries()) {
    replacements.set(productId, index === 0 ? update.products : []);
  }
}

const replacedAddOnIds = new Set(sparebank1FremtindBilMarket.replacesAddOnIds);

const marketSources = Object.assign({}, productCatalog.sources, ...marketUpdates.map(update => update.sources)) as Record<string, CatalogSource>;
const marketFacts = Object.assign({}, productCatalog.facts, ...marketUpdates.map(update => update.facts)) as Record<string, CatalogFact[]>;
const comparisonSources = { ...marketSources };
const activeComponents = new Set<string>();

for (const [id, update] of Object.entries(comparisonEvidence.sourceUrlUpdates)) {
  const source = marketSources[id];
  if (source?.effectiveFrom !== update.effectiveFrom || source.sha256 !== update.sha256 ||
    source.url !== update.previousUrl) continue;
  comparisonSources[id] = { ...source, url: update.url, previousUrl: update.previousUrl };
}

// Apply reviewed rows only to the source editions they were extracted from.
for (const [component, evidence] of Object.entries(comparisonEvidence.components)) {
  const matchesEdition = Object.entries(evidence.bindings).every(([id, expected]) => {
    const source = comparisonSources[id];
    return source && Object.entries(expected).every(([field, value]) =>
      source[field as keyof CatalogSource] === value);
  });
  if (!matchesEdition) continue;

  const replacedKeys = new Set<string>(evidence.remove);
  marketFacts[component] = [
    ...(marketFacts[component] ?? []).filter(fact => !replacedKeys.has(fact.key)),
    ...(evidence.rows as CatalogFact[]),
  ];
  activeComponents.add(component);
}

for (const [id, evidenceSource] of Object.entries(comparisonEvidence.sources)) {
  const source = evidenceSource as CatalogSource;
  const existing = marketSources[id];
  if (!existing) {
    comparisonSources[id] = source;
  } else if (existing.filename === source.filename && existing.termsNumber === source.termsNumber &&
    existing.effectiveFrom === source.effectiveFrom && existing.url === source.url && source.sha256 && !existing.sha256) {
    comparisonSources[id] = { ...existing, sha256: source.sha256 };
  }
}

export const marketProductCatalog = {
  ...productCatalog,
  alignComparisonRows: true,
  products: [
    ...productCatalog.products.flatMap(product => replacements.get(product.productId) ?? [product]),
    ...marketUpdates.filter(update => update.replacesProductIds.length === 0).flatMap(update => update.products),
  ],
  sources: comparisonSources,
  facts: marketFacts,
  addOns: [
    ...(productCatalog.addOns ?? []).filter(addOn => !replacedAddOnIds.has(addOn.id)),
    ...marketUpdates.flatMap(update => update.addOns),
    ...(comparisonEvidence.addOns as CatalogAddOn[]).filter(addOn => activeComponents.has(addOn.componentId)),
  ],
};
