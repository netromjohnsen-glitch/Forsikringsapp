import type { ManualProductInput } from "./manual-agreement.ts";
import {
  catalogProductsForSelection,
  productCatalog,
  type CatalogProduct,
  type ProductCatalog,
} from "./product-catalog.ts";

export const CUSTOM_PRODUCT_SELECTION = "__custom_product__";

export type ManualProductOption = {
  value: string;
  label: string;
  product: CatalogProduct;
};

function optionValue(product: CatalogProduct): string {
  return [product.providerId, product.productId, product.version ?? ""].map(encodeURIComponent).join(":");
}

export function manualProductOptions(
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): ManualProductOption[] {
  return catalogProductsForSelection(catalog, company, insuranceType).map((product) => ({
    value: optionValue(product),
    label: product.name,
    product,
  }));
}

function selectedOption(
  product: ManualProductInput,
  options: ManualProductOption[],
): ManualProductOption | null {
  if (product.customProduct) return null;
  const byReference = product.catalogReference && options.find((option) =>
    option.product.providerId === product.catalogReference!.providerId &&
    option.product.productId === product.catalogReference!.productId &&
    option.product.version === product.catalogReference!.version);
  if (byReference) return byReference;
  const byName = options.filter((option) => option.label === product.productName);
  return byName.length === 1 ? byName[0] : null;
}

export function manualProductSelection(
  product: ManualProductInput,
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): string {
  if (!company.trim() || !insuranceType.trim()) return "";
  const options = manualProductOptions(company, insuranceType, catalog);
  const selected = selectedOption(product, options);
  if (selected) return selected.value;
  if (product.customProduct || product.productName.trim() || options.length === 0) {
    return CUSTOM_PRODUCT_SELECTION;
  }
  return "";
}

function selectOption(product: ManualProductInput, option: ManualProductOption): ManualProductInput {
  const sameProduct = Boolean(product.catalogReference &&
    product.catalogReference.providerId === option.product.providerId &&
    product.catalogReference.productId === option.product.productId &&
    product.catalogReference.version === option.product.version);
  return {
    ...product,
    productName: option.product.name,
    customProduct: false,
    catalogReference: {
      providerId: option.product.providerId,
      productId: option.product.productId,
      version: option.product.version,
    },
    addOnIds: sameProduct ? product.addOnIds ?? [] : [],
  };
}

export function applyManualProductSelection(
  product: ManualProductInput,
  company: string,
  insuranceType: string,
  selection: string,
  catalog: ProductCatalog = productCatalog,
): ManualProductInput {
  if (selection === CUSTOM_PRODUCT_SELECTION) {
    const preserveName = product.customProduct || !product.catalogReference;
    return {
      ...product,
      productName: preserveName ? product.productName : "",
      customProduct: true,
      catalogReference: null,
      addOnIds: [],
    };
  }
  const option = manualProductOptions(company, insuranceType, catalog)
    .find((candidate) => candidate.value === selection);
  return option ? selectOption(product, option) : product;
}

export function transitionManualProductScope(
  product: ManualProductInput,
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): ManualProductInput {
  const options = manualProductOptions(company, insuranceType, catalog);
  const selected = selectedOption(product, options);
  if (selected) return selectOption(product, selected);

  // Ukjente produkter kan ikke valideres mot katalogen. Bevar brukerens tekst
  // som eksplisitt custom i stedet for å gjette et katalogprodukt.
  if (!product.catalogReference && product.productName.trim()) {
    return { ...product, customProduct: true, catalogReference: null, addOnIds: [] };
  }
  if (options.length === 1) return selectOption(product, options[0]);
  return {
    ...product,
    productName: "",
    customProduct: options.length === 0,
    catalogReference: null,
    addOnIds: [],
  };
}
