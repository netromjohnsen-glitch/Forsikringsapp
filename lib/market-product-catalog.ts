import { frendeDogMarket } from "./frende-dog-market.ts";
import { fremtindBobilMarket } from "./fremtind-bobil-market.ts";
import { productCatalog, type CatalogProduct } from "./product-catalog.ts";
import { sparebank1FremtindBilMarket } from "./sparebank1-fremtind-bil-market.ts";
import { storebrandInnboMarket } from "./storebrand-innbo-market.ts";
import { storebrandMotorMarket } from "./storebrand-motor-market.ts";
import { trygBoatMarket } from "./tryg-boat-market.ts";
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
  storebrandInnboMarket,
  storebrandMotorMarket,
  fremtindBobilMarket,
  frendeDogMarket,
  sparebank1FremtindBilMarket,
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

export const marketProductCatalog = {
  ...productCatalog,
  products: productCatalog.products.flatMap(product => replacements.get(product.productId) ?? [product]),
  sources: Object.assign({}, productCatalog.sources, ...marketUpdates.map(update => update.sources)) as typeof productCatalog.sources,
  facts: Object.assign({}, productCatalog.facts, ...marketUpdates.map(update => update.facts)) as typeof productCatalog.facts,
  addOns: [...(productCatalog.addOns ?? []).filter(addOn => !replacedAddOnIds.has(addOn.id)), ...marketUpdates.flatMap(update => update.addOns)],
};
