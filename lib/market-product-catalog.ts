import { productCatalog } from "./product-catalog.ts";
import { trygBoatMarket } from "./tryg-boat-market.ts";

export const marketProductCatalog = {
  ...productCatalog,
  products: productCatalog.products.flatMap(product => {
    if (product.providerId !== "tryg" || product.insuranceType !== "Båt" || product.agreementScope !== "ordinary") return [product];
    return product.productId === "tryg-bat-ansvar" ? trygBoatMarket.products : [];
  }),
  sources: { ...productCatalog.sources, ...trygBoatMarket.sources },
  facts: { ...productCatalog.facts, ...trygBoatMarket.facts },
  addOns: [...(productCatalog.addOns ?? []), ...trygBoatMarket.addOns],
};
