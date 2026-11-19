import nito from "../catalog/tryg-member-agreements/nito.json" with { type: "json" };
import utdanningsforbundet from "../catalog/tryg-member-agreements/utdanningsforbundet.json" with { type: "json" };
import nitoEvidence from "../catalog/tryg-member-agreements/nito-evidence.json" with { type: "json" };
import udfEvidence from "../catalog/tryg-member-agreements/utdanningsforbundet-evidence.json" with { type: "json" };
import type { AgreementScopeDefinition } from "./agreement-scope.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";
import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type InventorySource = {
  url: string;
  role: string;
  label?: string;
  effectiveDate?: string;
  publicationDate?: string;
  documentNumber?: string;
  archive?: { path: string; sha256: string; pages: number };
};
type InventoryProduct = {
  id: string;
  name: string;
  insuranceType: string;
  kind: "member" | "discount" | "historical" | "other-insurer";
  sources: InventorySource[];
  components?: string[];
  notes?: string | string[];
  insurer?: string;
};
type Inventory = { providerId: string; agreementScope: string; name: string; products: InventoryProduct[] };
type ProductEvidence = {
  filename: string;
  url: string;
  sha256: string;
  version: string;
  termsNumber: string;
  validTo?: string;
  sourceType?: string;
  pages?: number;
  termination?: Pick<CatalogFact, "key" | "label" | "value"> & { page: number; section: string; productPage: string };
  facts: Array<Pick<CatalogFact, "key" | "label" | "value"> & { page: number; section: string; coverageAvailability?: string }>;
};

export const trygMemberInventories = [nito, utdanningsforbundet] as Inventory[];
export const trygMemberAgreementScopes: AgreementScopeDefinition[] = trygMemberInventories.map(
  ({ agreementScope: id, providerId, name }) => ({ id, providerId, name }),
);

const nameKey = (value: string) => value.normalize("NFKC").trim().toLocaleLowerCase("nb-NO").replace(/\s+/gu, " ");

export function matchTrygMemberProduct({ agreementScope, insuranceType, productName }: {
  agreementScope?: string | null;
  insuranceType: string;
  productName: string;
}): InventoryProduct | null {
  const inventory = trygMemberInventories.find(inventory => inventory.agreementScope === agreementScope);
  const matches = inventory?.products.filter(product =>
    (product.kind === "member" || product.kind === "discount") &&
    normalizeInsuranceType(product.insuranceType) === normalizeInsuranceType(insuranceType) &&
    nameKey(product.name) === nameKey(productName));
  return matches?.length === 1 ? matches[0] : null;
}

const evidenceByAgreement: Record<string, Record<string, ProductEvidence>> = {
  nito: nitoEvidence,
  utdanningsforbundet: udfEvidence,
};
const houseRental = "hus-utleie";
// Exact headings and variant names from the published member terms.
const selectionNames: Record<string, readonly string[]> = {
  "tryg-nito-bil-ansvar": ["Ansvar"],
  "tryg-nito-bil-delkasko": ["Delkasko"],
  "tryg-nito-bil-kasko": ["Kasko"],
  "tryg-nito-hus": ["NITO Bygning"],
  "tryg-nito-hus-ekstra": ["NITO Bygning Ekstra"],
  "tryg-nito-student-meg-legacy": ["NITO Studentforsikring +MEG (Uføre og Ulykke)"],
  "tryg-nito-student-mitt-legacy": ["NITO Studentforsikring +MITT (Innbo)"],
  "tryg-utdanningsforbundet-bil-delkasko": ["Delkasko"],
  "tryg-utdanningsforbundet-bil-ekstra": ["Ekstra", "Bil Ekstra"],
  "tryg-utdanningsforbundet-elbil-ekstra": ["Elbil Ekstra"],
  "tryg-utdanningsforbundet-hus": ["Bygning"],
  "tryg-utdanningsforbundet-hus-ekstra": ["Bygning Ekstra"],
  "tryg-utdanningsforbundet-innbo": ["Innboforsikring"],
  "tryg-utdanningsforbundet-grunnforsikring": ["Grunnforsikring"],
  "tryg-utdanningsforbundet-barneforsikring": ["Barneforsikring"],
  "tryg-utdanningsforbundet-student": ["Studentforsikring"],
};

export const trygMemberProducts: CatalogProduct[] = [];
export const trygMemberSources: Record<string, CatalogSource> = {};
export const trygMemberAddOns: CatalogAddOn[] = [];
export const trygMemberFacts: Record<string, CatalogFact[]> = {};

for (const { providerId, agreementScope, products } of trygMemberInventories) {
  for (const item of products) {
    const legacyStudent = agreementScope === "nito" && item.kind === "historical" &&
      (item.id === "student-meg" || item.id === "student-mitt");
    if (item.kind !== "member" && !legacyStudent) continue;

    const productId = `tryg-${agreementScope}-${item.id}${legacyStudent ? "-legacy" : ""}`;
    const entries = evidenceByAgreement[agreementScope];
    const editions = [item.id, ...Object.keys(entries).filter(id => id.startsWith(item.id + "-") &&
      id === item.id + "-" + entries[id].version)];
    for (const editionId of editions) {
      const evidence = entries[editionId];
      const suffix = editionId === item.id ? "" : "-" + evidence.version;
      const sourceId = evidence ? `${productId}-terms${suffix}` : undefined;
      const sourceType = evidence?.sourceType ?? "full_terms";
      if (sourceType !== "full_terms" && sourceType !== "ipid" && sourceType !== "product_page") {
        throw new Error(`Ukjent kildetype for ${productId}.`);
      }
      const version = sourceType === "full_terms" ? evidence?.version ?? null : null;
      const isHouseRental = item.id === houseRental;
      const parentIds = ["hus", "hus-ekstra"].map(id => `tryg-${agreementScope}-${id}`);
      const insuranceType = legacyStudent ? "Studentforsikring" : item.insuranceType;
      const product: CatalogProduct = {
        company: "Tryg", providerId, agreementScope, productId,
        insuranceType, name: item.name,
        requiresExplicitAgreementScope: true,
        selectionNames: selectionNames[productId],
        version,
        componentIds: sourceId ? [sourceId] : [],
        ...(sourceId ? { sourceId } : {}),
      };
      if (isHouseRental) {
        if (sourceId) trygMemberAddOns.push({
          id: productId, name: item.name, componentId: sourceId, providerId, agreementScope,
          requiresLevel: parentIds, insuranceTypes: ["Hus"],
        });
      } else {
        trygMemberProducts.push(product);
      }
      if (!evidence || !sourceId) continue;

      const source: CatalogSource = {
        id: sourceId, filename: evidence.filename, termsNumber: evidence.termsNumber,
        effectiveFrom: evidence.version, providerId, agreementScope, company: "Tryg",
        insuranceType, productIds: isHouseRental ? parentIds : [productId],
        ...(!isHouseRental && version ? { productVersion: version } : {}),
        // An annual edition cannot apply before its printed year. This is a
        // lower bound, not a claim about the exact start date.
        ...(/^\d{4}$/u.test(evidence.version) ? { validFrom: evidence.version + "-01-01" } : {}),
        validTo: legacyStudent ? "2026-12-31" : evidence.validTo,
        url: evidence.url, sha256: evidence.sha256, sourceType,
        ...(evidence.pages ? { physicalPages: [1, evidence.pages] as const } : {}),
      };
      trygMemberSources[sourceId] = source;
      trygMemberFacts[sourceId] = evidence.facts.map(({ page, section, coverageAvailability, ...fact }) => {
        if (coverageAvailability !== undefined && coverageAvailability !== "included" && coverageAvailability !== "unavailable") {
          throw new Error(`Ukjent dekningsstatus for ${productId}: ${fact.key}.`);
        }
        return {
          ...fact,
          ...(coverageAvailability ? { coverageAvailability } : {}),
          source: {
            documentId: sourceId, filename: source.filename, termsNumber: source.termsNumber,
            effectiveFrom: source.effectiveFrom, url: source.url, company: source.company,
            agreementScope, version: evidence.version, page, section,
          },
        };
      });

      if (!evidence.termination) continue;

      const terms = item.sources.find(entry => entry.role === "product_terms" && entry.documentNumber === "UUL41847");
      if (!terms?.archive || !terms.effectiveDate) throw new Error(`Mangler produktvilkår for ${productId}.`);
      const termsId = `${productId}-product-terms${suffix}`;
      const pageId = `${productId}-product-page${suffix}`;
      const binding = { providerId, agreementScope, company: source.company, insuranceType,
        productIds: [productId], productVersion: evidence.version };
      const { page, section, productPage, ...fact } = evidence.termination;
      const termsSource = trygMemberSources[termsId] = {
        ...binding, id: termsId, filename: terms.archive.path.split("/").at(-1)!,
        termsNumber: "UUL41847", effectiveFrom: terms.effectiveDate, url: terms.url,
        sha256: terms.archive.sha256, physicalPages: [1, terms.archive.pages], sourceType: "full_terms",
      };
      const pageSource = trygMemberSources[pageId] = {
        ...binding, id: pageId, filename: `Tryg – ${item.name}`,
        termsNumber: "", effectiveFrom: "", url: productPage, sourceType: "product_page",
      };

      product.componentIds?.push(termsId);
      trygMemberFacts[termsId] = [{
        ...fact,
        source: {
          documentId: termsId, filename: termsSource.filename, termsNumber: termsSource.termsNumber,
          effectiveFrom: termsSource.effectiveFrom, url: termsSource.url, company: source.company,
          agreementScope, version: termsSource.effectiveFrom, page, section,
        },
        qualificationSource: {
          documentId: pageId, filename: pageSource.filename, termsNumber: "", effectiveFrom: "",
          url: pageSource.url, company: source.company, agreementScope, page: 0,
          section: "Opphør ved utgangen av kalenderåret",
        },
      }];
    }
  }
}
