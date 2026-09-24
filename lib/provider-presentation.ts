import { canonicalProviderId, productCatalog, type ProductCatalog } from "./product-catalog.ts";
import type { ComparedDocument, ComparedInsurance } from "./comparison.ts";

// Display only: keep raw/legal names on the document and its source records.
// Exact product references preserve distributor names when a provider has
// several channels; a provider ID alone must not pick an arbitrary channel.
export function providerDisplayName(raw: string | null | undefined, reference?: ComparedInsurance["catalogReference"], catalog: ProductCatalog = productCatalog): string | null {
  const providerId = reference?.providerId ?? (raw ? canonicalProviderId(raw, catalog) : null);
  if (!providerId) return raw || null;
  const products = catalog.products.filter(product => product.providerId === providerId &&
    (!reference || (product.productId === reference.productId && product.version === reference.version)));
  const names = [...new Set(products.map(product => product.company))];
  return names.length === 1 ? names[0] : raw || null;
}

export function agreementProviderDisplayName(data: ComparedDocument["insuranceData"]): string | null {
  const names = data.insurances.map(insurance => providerDisplayName(insurance.company ?? data.company, insurance.catalogReference));
  return names.length && names.every(name => name && name === names[0]) ? names[0] : providerDisplayName(data.company);
}
