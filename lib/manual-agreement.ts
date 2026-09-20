import { findCatalogProduct, findCatalogProductBySelection, productCatalog, resolveCatalogEvidence, resolveCatalogFacts, resolveProductComponentIds } from "./product-catalog.ts";
import { summarizeManualAnnualPremium } from "./agreement-pricing.ts";

export type ManualTermInput = { name: string; value: string };
export type ManualProductInput = {
  type: string;
  productName: string;
  annualPremium: string;
  deductible: string;
  coverageSummary: string;
  importantTerms: ManualTermInput[];
  // Kan fylles med en stabil ID og vilkårsversjon når en produktkatalog kobles til.
  catalogReference?: { providerId: string; productId: string; version: string | null } | null;
  addOnIds?: string[];
};
export type ManualAgreementInput = {
  company: string;
  distributionChannel?: string;
  totalAnnualPremium: string;
  products: ManualProductInput[];
};

export function emptyManualProduct(): ManualProductInput {
  return {
    type: "", productName: "", annualPremium: "", deductible: "",
    coverageSummary: "", importantTerms: [], catalogReference: null, addOnIds: [],
  };
}

export function emptyManualAgreement(): ManualAgreementInput {
  return { company: "", distributionChannel: "", totalAnnualPremium: "", products: [emptyManualProduct()] };
}

export class ManualAgreementError extends Error {}

const deductibleNotes: Record<string, string> = {
  standard: "Standardegenandel; kan avvike fra avtalt verdi",
  coverage: "Egenandel for denne dekningen; forrang over avtalt generell egenandel er ikke dokumentert",
  override: "Uttrykkelig særskilt egenandel som erstatter generell verdi",
  reference: "Beløpet må kontrolleres i forsikringsbeviset",
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ManualAgreementError("Ugyldig manuell registrering.");
  return value as Record<string, unknown>;
}

function field(value: unknown, label: string, max = 1000): string {
  if (typeof value !== "string" || value.length > max) throw new ManualAgreementError(`Ugyldig felt: ${label}.`);
  return value.trim();
}

function optional(value: unknown, label: string, max = 1000): string | null {
  if (value === undefined || value === null || value === "") return null;
  return field(value, label, max) || null;
}

export function normalizeManualAgreement(input: unknown) {
  const agreement = object(input);
  const company = field(agreement.company, "selskap", 150);
  const distributionChannel = optional(agreement.distributionChannel, "distribusjonskanal", 100);
  if (!company) throw new ManualAgreementError("Oppgi selskap for manuell registrering.");
  if (!Array.isArray(agreement.products) || agreement.products.length === 0 || agreement.products.length > 30) {
    throw new ManualAgreementError("Legg til minst ett forsikringsprodukt.");
  }

  const insurances = agreement.products.map((rawProduct, productIndex) => {
    const product = object(rawProduct);
    const type = field(product.type, `forsikringstype ${productIndex + 1}`, 120);
    if (!type) throw new ManualAgreementError(`Oppgi forsikringstype for produkt ${productIndex + 1}.`);
    if (!Array.isArray(product.importantTerms) || product.importantTerms.length > 60) {
      throw new ManualAgreementError(`Ugyldige vilkår for ${type}.`);
    }
    const importantTerms = product.importantTerms.map((rawTerm, termIndex) => {
      const term = object(rawTerm);
      const name = field(term.name, `vilkårsnavn ${termIndex + 1}`, 150);
      const value = field(term.value, `vilkårsverdi ${termIndex + 1}`, 1000);
      if (Boolean(name) !== Boolean(value)) throw new ManualAgreementError(`Fyll ut både navn og verdi for vilkår på ${type}.`);
      return { name, value };
    }).filter((term) => term.name && term.value);

    const rawReference = product.catalogReference;
    let catalogReference = null;
    let catalogFacts = null;
    let effectiveFacts = null;
    let selectedAddOnIds: string[] = [];
    let catalogProduct = null;
    if (rawReference !== undefined && rawReference !== null) {
      const reference = object(rawReference);
      catalogProduct = findCatalogProduct(
        field(reference.providerId, "katalogleverandør", 100),
        field(reference.productId, "katalogprodukt", 100),
        optional(reference.version, "vilkårsversjon", 100),
      );
    }
    const selectedByFields = findCatalogProductBySelection(
        company, type, field(product.productName, "produktnavn", 150),
    );
    if (catalogProduct && (
      catalogProduct.company.toLocaleLowerCase("nb-NO") !== company.toLocaleLowerCase("nb-NO") ||
      catalogProduct.insuranceType.toLocaleLowerCase("nb-NO") !== type.toLocaleLowerCase("nb-NO") ||
      catalogProduct.name.toLocaleLowerCase("nb-NO") !== field(product.productName, "produktnavn", 150).toLocaleLowerCase("nb-NO") ||
      (selectedByFields && catalogProduct !== selectedByFields)
    )) {
      throw new ManualAgreementError("Valgt katalogprodukt stemmer ikke med selskap, type og produkt.");
    }
    catalogProduct ??= selectedByFields;
    if (catalogProduct) {
      const rawAddOnIds = product.addOnIds ?? [];
      if (!Array.isArray(rawAddOnIds) || rawAddOnIds.length > 30 ||
          rawAddOnIds.some((id) => typeof id !== "string" || id.length > 100)) {
        throw new ManualAgreementError("Ugyldige tilleggsdekninger.");
      }
      selectedAddOnIds = rawAddOnIds as string[];
      try {
        effectiveFacts = resolveCatalogFacts(catalogProduct, selectedAddOnIds, new Date(), distributionChannel);
        catalogFacts = resolveCatalogEvidence(catalogProduct, selectedAddOnIds, new Date(), distributionChannel);
      } catch {
        throw new ManualAgreementError("Ugyldig eller ikke gyldig tilleggsdekning.");
      }
      catalogReference = { providerId: catalogProduct.providerId, productId: catalogProduct.productId, version: catalogProduct.version };
    } else if (Array.isArray(product.addOnIds) && product.addOnIds.length > 0) {
      throw new ManualAgreementError("Tillegg krever et sikkert katalogprodukt.");
    }
    const counts = new Map<string, number>();
    for (const item of effectiveFacts ?? []) counts.set(item.key, (counts.get(item.key) ?? 0) + 1);
    const addOns = selectedAddOnIds.map((id) => {
      const addOn = productCatalog.addOns?.find((entry) => entry.id === id);
      if (!addOn) throw new ManualAgreementError("Ukjent tilleggsdekning.");
      return {
        id,
        name: addOn.name,
        annualPremium: null,
        deductible: null,
        source: productCatalog.sources?.[addOn.componentId] ?? null,
        importantTerms: (productCatalog.facts?.[addOn.componentId] ?? []).map((item) => ({
          name: item.label, value: item.value, key: item.key, source: item.source,
          deductibleClassification: item.deductibleClassification,
        })),
      };
    });
    return {
      type,
      productName: optional(product.productName, "produktnavn", 150),
      annualPremium: optional(product.annualPremium, "årspremie", 100),
      deductible: optional(product.deductible, "egenandel", 300),
      deductibleOrigin: "customer" as const,
      coverageSummary: catalogFacts ? null : optional(product.coverageSummary, "dekningssammendrag", 2000),
      importantTerms: effectiveFacts
        ? effectiveFacts.map((item) => ({
          name: item.label,
          value: (counts.get(item.key) ?? 0) > 1 ? `${item.source.termsNumber}: ${item.value}` : item.value,
          key: item.key,
          structuredValue: item.structuredValue,
          deductibleClassification: item.deductibleClassification,
          source: item.source,
          sources: [
            { ...item.source, note: [
              ...(item.source.note ? [item.source.note] : []),
              ...(item.replacesBase ? ["Effektiv verdi fra tillegg"] : []),
              ...(item.deductibleClassification ? [deductibleNotes[item.deductibleClassification]] : []),
            ].join(" · ") || undefined },
            ...(item.qualificationSource ? [{ ...item.qualificationSource, note: "Forbehold for standardegenandel" }] : []),
          ],
          overriddenBase: item.replacesBase
            ? (catalogFacts ?? []).filter((base) =>
              base.key === item.key && base.source.documentId !== item.source.documentId &&
              (catalogProduct ? resolveProductComponentIds(catalogProduct).includes(base.source.documentId) : false)
            ).map((base) => ({ value: base.value, source: base.source }))
            : [],
        }))
        : importantTerms,
      catalogReference,
      catalogFacts,
      addOnIds: catalogReference ? selectedAddOnIds : [],
      addOns,
    };
  });

  let pricing;
  try {
    pricing = summarizeManualAnnualPremium(insurances.map((insurance) => insurance.annualPremium));
  } catch {
    throw new ManualAgreementError("Ugyldig årspremie. Oppgi et beløp i kroner, for eksempel 5 000 kr.");
  }

  return {
    source: "manual" as const,
    filename: "Manuelt registrert",
    text: "",
    insuranceData: {
      customer: null,
      customerType: null,
      offerNumber: null,
      company,
      distributionChannel,
      totalAnnualPremium: pricing.totalAnnualPremium,
      priceSummary: pricing.priceSummary,
      insurances,
    },
  };
}
