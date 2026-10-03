import { agreementScopeAllowed, catalogReferenceForProduct, type CatalogProductReference, type ProductCatalog, catalogProductMatchesSelection, findCatalogProduct, findCatalogProductBySelection, productCatalog, resolveCatalogEvidence, resolveCatalogFacts } from "./product-catalog.ts";
import type { AgreementScopeId } from "./agreement-scope.ts";
import { summarizeManualAnnualPremium } from "./agreement-pricing.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import { catalogFactSources } from "./catalog-enrichment.ts";

export type ManualTermInput = { name: string; value: string };
export type ManualProductInput = {
  agreementScope?: AgreementScopeId | null;
  type: string;
  productName: string;
  annualPremium: string;
  deductible: string;
  coverageSummary: string;
  importantTerms: ManualTermInput[];
  annualMileage?: string;
  customProduct?: boolean;
  // Kan fylles med en stabil ID og vilkårsversjon når en produktkatalog kobles til.
  catalogReference?: CatalogProductReference | null;
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
    coverageSummary: "", importantTerms: [], annualMileage: "", customProduct: false,
    catalogReference: null, addOnIds: [],
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

function manualAnnualMileage(value: unknown, type: string, productIndex: number) {
  if (value === undefined || value === null || value === "") return null;
  if (normalizeInsuranceType(type) !== "bil") {
    throw new ManualAgreementError("Årlig kjørelengde kan bare registreres for Bil.");
  }
  const raw = field(value, `årlig kjørelengde ${productIndex + 1}`, 30);
  if (!/^(?:\d+|\d{1,3}(?:[ .\u00a0\u202f]\d{3})+)$/u.test(raw)) {
    throw new ManualAgreementError("Ugyldig årlig kjørelengde. Oppgi et ikke-negativt heltall.");
  }
  const amount = Number(raw.replace(/[\s.\u00a0\u202f]/gu, ""));
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new ManualAgreementError("Ugyldig årlig kjørelengde. Oppgi et ikke-negativt heltall.");
  }
  return {
    name: "Årlig kjørelengde",
    value: `${amount.toLocaleString("nb-NO")} km/år`,
    key: "kjoretoy.kjorelengde",
    coverageOrigin: "document" as const,
  };
}

export function normalizeManualAgreement(input: unknown, catalog: ProductCatalog = productCatalog) {
  const agreement = object(input);
  const company = field(agreement.company, "selskap", 150);
  const distributionChannel = optional(agreement.distributionChannel, "distribusjonskanal", 100);
  if (!company) throw new ManualAgreementError("Oppgi selskap for manuell registrering.");
  if (!Array.isArray(agreement.products) || agreement.products.length === 0 || agreement.products.length > 30) {
    throw new ManualAgreementError("Legg til minst ett forsikringsprodukt.");
  }

  const insurances = agreement.products.map((rawProduct, productIndex) => {
    const product = object(rawProduct);
    if (product.agreementScope != null && !agreementScopeAllowed(company, product.agreementScope, catalog)) {
      throw new ManualAgreementError("Ugyldig avtalescope.");
    }
    const agreementScope = product.agreementScope as AgreementScopeId | null | undefined;
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
    const annualMileage = manualAnnualMileage(product.annualMileage, type, productIndex);

    const rawReference = product.catalogReference;
    let catalogReference = null;
    let catalogFacts = null;
    let effectiveFacts = null;
    let selectedAddOnIds: string[] = [];
    let catalogProduct = null;
    if (product.customProduct !== true && rawReference !== undefined && rawReference !== null) {
      const reference = object(rawReference);
      if (reference.insuranceType !== undefined && normalizeInsuranceType(field(reference.insuranceType, "katalogtype", 120)) !== normalizeInsuranceType(type)) {
        throw new ManualAgreementError("Katalogreferansen har feil forsikringstype.");
      }
      if (reference.agreementScope != null && (!agreementScopeAllowed(company, reference.agreementScope, catalog) ||
          (agreementScope != null && agreementScope !== reference.agreementScope))) {
        throw new ManualAgreementError("Katalogreferansen har feil avtalescope.");
      }
      catalogProduct = findCatalogProduct(
        field(reference.providerId, "katalogleverandør", 100),
        field(reference.productId, "katalogprodukt", 100),
        optional(reference.version, "vilkårsversjon", 100),
        { insuranceType: type, agreementScope: agreementScope ?? reference.agreementScope as AgreementScopeId | null | undefined }, catalog,
      );
      const referencedProducts = catalog.products.filter(candidate => candidate.providerId === reference.providerId &&
        candidate.productId === reference.productId && candidate.version === (reference.version ?? null));
      if (referencedProducts.length && referencedProducts.every(candidate => normalizeInsuranceType(candidate.insuranceType) !== normalizeInsuranceType(type))) {
        throw new ManualAgreementError("Valgt katalogprodukt stemmer ikke med selskap, type og produkt.");
      }
    }
    const selectedByFields = product.customProduct === true ? null : findCatalogProductBySelection(
      company, type, field(product.productName, "produktnavn", 150),
      agreementScope, catalog,
    );
    if (catalogProduct && (!catalogProductMatchesSelection(
      catalogProduct, company, type, field(product.productName, "produktnavn", 150),
      agreementScope ?? catalogProduct.agreementScope, catalog,
    ) || (selectedByFields && catalogProduct !== selectedByFields))) {
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
        effectiveFacts = resolveCatalogFacts(catalogProduct, selectedAddOnIds, new Date(), distributionChannel, catalog);
        catalogFacts = resolveCatalogEvidence(catalogProduct, selectedAddOnIds, new Date(), distributionChannel, catalog);
      } catch {
        throw new ManualAgreementError("Ugyldig eller ikke gyldig tilleggsdekning.");
      }
      catalogReference = catalogReferenceForProduct(catalogProduct);
    } else if (Array.isArray(product.addOnIds) && product.addOnIds.length > 0) {
      throw new ManualAgreementError("Tillegg krever et sikkert katalogprodukt.");
    }
    const counts = new Map<string, number>();
    for (const item of effectiveFacts ?? []) counts.set(item.key, (counts.get(item.key) ?? 0) + 1);
    const addOns = selectedAddOnIds.map((id) => {
      const addOn = catalog.addOns?.find((entry) => entry.id === id && entry.providerId === catalogProduct!.providerId &&
        (entry.agreementScope ?? "ordinary") === (catalogProduct!.agreementScope ?? "ordinary"));
      if (!addOn) throw new ManualAgreementError("Ukjent tilleggsdekning.");
      return {
        id,
        name: addOn.name,
        annualPremium: null,
        deductible: null,
        source: catalog.sources?.[addOn.componentId] ?? null,
        coverageOrigin: "catalog" as const,
        importantTerms: (catalogFacts ?? []).filter(item => (catalog.facts?.[addOn.componentId] ?? []).includes(item)).map((item) => ({
          name: item.label, value: item.value, key: item.key, source: item.source,
          ...(item.qualificationSource ? { sources: catalogFactSources(item) } : {}),
          coverageOrigin: "catalog" as const,
          ...(item.coverageAvailability ? { coverageAvailability: item.coverageAvailability } : {}),
          deductibleClassification: item.deductibleClassification,
        })),
      };
    });
    const resolvedTerms = effectiveFacts
      ? effectiveFacts.map((item) => ({
          name: item.label,
          value: (counts.get(item.key) ?? 0) > 1 ? `${item.source.termsNumber}: ${item.value}` : item.value,
          key: item.key,
          coverageOrigin: "catalog" as const,
          ...(item.coverageAvailability ? { coverageAvailability: item.coverageAvailability } : {}),
          structuredValue: item.structuredValue,
          deductibleClassification: item.deductibleClassification,
          source: item.source,
          sources: catalogFactSources(item).map((source, index) => index === 0
            ? { ...source, note: [
              ...(item.source.note ? [item.source.note] : []),
              ...(item.replacesBase ? ["Effektiv verdi fra dokumentert utvidelse eller tillegg"] : []),
              ...(item.deductibleClassification ? [deductibleNotes[item.deductibleClassification]] : []),
            ].join(" · ") || undefined }
            : { ...source, note: [source.note,
              item.deductibleClassification === "standard"
                ? "Forbehold for standardegenandel"
                : "Supplerende kilde for faktumets anvendelse",
            ].filter(Boolean).join(" · ") }),
          overriddenBase: item.replacesBase
            ? (catalogFacts ?? []).filter((base) =>
              base.key === item.key && base !== item
            ).map((base) => ({ value: base.value, source: base.source }))
            : [],
        }))
      : importantTerms;
    return {
      ...(agreementScope !== undefined ? { agreementScope } : catalogProduct?.agreementScope ? { agreementScope: catalogProduct.agreementScope } : {}),
      type,
      productName: optional(product.productName, "produktnavn", 150),
      annualPremium: optional(product.annualPremium, "årspremie", 100),
      deductible: optional(product.deductible, "egenandel", 300),
      deductibleOrigin: "customer" as const,
      coverageSummary: catalogFacts ? null : optional(product.coverageSummary, "dekningssammendrag", 2000),
      importantTerms: annualMileage
        ? [...resolvedTerms.filter((term) => !("key" in term) || term.key !== annualMileage.key), annualMileage]
        : resolvedTerms,
      catalogReference,
      catalogSelectionConfirmed: Boolean(catalogReference),
      ...(catalogProduct ? { catalogProductName: catalogProduct.name } : {}),
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
