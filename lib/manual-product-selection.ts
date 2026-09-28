import type { ManualProductInput } from "./manual-agreement.ts";
import {
  catalogProductsForSelection,
  productCatalog,
  type CatalogProduct,
  type ProductCatalog,
  catalogProductIdentity,
  catalogReferenceForProduct,
} from "./product-catalog.ts";
import { catalogAgreementScope, type AgreementScopeId } from "./agreement-scope.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";

export const CUSTOM_PRODUCT_SELECTION = "__custom_product__";

export type ManualProductOption = {
  value: string;
  label: string;
  product: CatalogProduct;
};

function optionValue(product: CatalogProduct): string {
  return catalogProductIdentity(product);
}

export function manualProductOptions(
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
  agreementScope?: AgreementScopeId | null,
): ManualProductOption[] {
  const products = catalogProductsForSelection(catalog, company, insuranceType, agreementScope);
  return products.map((product) => ({
    value: optionValue(product),
    label: products.filter(candidate => candidate.name === product.name).length > 1
      ? `${product.name} (${product.version ?? "ukjent versjon"})` : product.name,
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
    catalogAgreementScope(option.product) === catalogAgreementScope(product.catalogReference!) &&
    (!product.catalogReference!.insuranceType || normalizeInsuranceType(option.product.insuranceType) === normalizeInsuranceType(product.catalogReference!.insuranceType)) &&
    option.product.version === product.catalogReference!.version);
  if (byReference) return byReference;
  const byName = options.filter((option) => option.product.name === product.productName);
  return byName.length === 1 ? byName[0] : null;
}

export function manualProductSelection(
  product: ManualProductInput,
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): string {
  if (!company.trim() || !insuranceType.trim()) return "";
  const options = manualProductOptions(company, insuranceType, catalog, product.agreementScope);
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
    catalogAgreementScope(product.catalogReference) === catalogAgreementScope(option.product) &&
    product.catalogReference.version === option.product.version);
  return {
    ...product,
    productName: option.product.name,
    customProduct: false,
    ...(option.product.agreementScope !== undefined ? { agreementScope: option.product.agreementScope } : {}),
    catalogReference: catalogReferenceForProduct(option.product),
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
  const option = manualProductOptions(company, insuranceType, catalog, product.agreementScope)
    .find((candidate) => candidate.value === selection);
  return option ? selectOption(product, option) : product;
}

export function transitionManualProductScope(
  product: ManualProductInput,
  company: string,
  insuranceType: string,
  catalog: ProductCatalog = productCatalog,
): ManualProductInput {
  const options = manualProductOptions(company, insuranceType, catalog, product.agreementScope);
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

export function changeManualAgreementScope(product: ManualProductInput, company: string, insuranceType: string, agreementScope: AgreementScopeId | null, catalog: ProductCatalog = productCatalog): ManualProductInput {
  // A scope change cannot silently transfer the previous product or add-ons.
  return transitionManualProductScope({ ...product, agreementScope, catalogReference: null, addOnIds: [],
    productName: product.customProduct ? product.productName : "" }, company, insuranceType, catalog);
}
