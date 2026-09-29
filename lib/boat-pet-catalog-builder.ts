import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { boatPetFactLabel, boatPetKeyApplies, type BoatPetType } from "./boat-pet-registry.ts";

export type BoatPetRow = {
  key: string;
  value: string;
  sourceId: string;
  page: number;
  section: string;
  deductibleClassification?: CatalogFact["deductibleClassification"];
  label?: string;
};
export type BoatPetProductDefinition = {
  providerId: string;
  company: string;
  type: BoatPetType;
  agreementScope: string;
  productId: string;
  name: string;
  version: string | null;
  sourceId: string;
  rows: BoatPetRow[];
};
export type BoatPetAddOnDefinition = Omit<BoatPetProductDefinition, "productId" | "version"> & {
  id: string;
  requiresLevel: string[];
  exclusiveGroup?: string;
};

const displayType = (type: BoatPetType) => type === "båt" ? "Båt" : type === "hund" ? "Hund" : "Katt";

export function buildBoatPetCatalog(
  sources: Record<string, CatalogSource>,
  definitions: BoatPetProductDefinition[],
  additions: BoatPetAddOnDefinition[] = [],
) {
  const facts: Record<string, CatalogFact[]> = {};
  function rows(definition: BoatPetProductDefinition | BoatPetAddOnDefinition): CatalogFact[] {
    return definition.rows.map((row) => {
      const source = sources[row.sourceId];
      if (!source || source.providerId !== definition.providerId || source.insuranceType?.toLowerCase() !== definition.type || source.agreementScope !== definition.agreementScope) {
        throw new Error("Invalid Båt/Hund/Katt source applicability");
      }
      if (!boatPetKeyApplies(definition.type, row.key) || row.key.startsWith("premie.")) {
        throw new Error(`Invalid Båt/Hund/Katt catalog fact: ${row.key}`);
      }
      return {
        key: row.key,
        label: row.label ?? boatPetFactLabel(definition.type, row.key) ?? row.key,
        value: row.value,
        ...(row.deductibleClassification ? { deductibleClassification: row.deductibleClassification } : {}),
        source: {
          documentId: source.id,
          filename: source.filename,
          termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom,
          version: source.version,
          agreementScope: source.agreementScope,
          url: source.url,
          company: source.company,
          page: row.page,
          section: row.section,
          note: "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger og kundespesifikke summer krever dokumentert valg.",
        },
      };
    });
  }
  const products: CatalogProduct[] = definitions.map((definition) => {
    facts[definition.productId] = rows(definition);
    return {
      providerId: definition.providerId,
      company: definition.company,
      insuranceType: displayType(definition.type),
      agreementScope: definition.agreementScope,
      productId: definition.productId,
      name: definition.name,
      version: definition.version,
      sourceId: definition.sourceId,
      componentIds: [definition.productId],
    };
  });
  const addOns: CatalogAddOn[] = additions.map((definition) => {
    facts[definition.id] = rows(definition);
    const requiresLevel = definition.requiresLevel.map((level) => definitions.find((product) =>
      product.providerId === definition.providerId
      && product.type === definition.type
      && product.agreementScope === definition.agreementScope
      && (product.productId === level || product.name === level)
    )?.productId ?? level);
    return {
      id: definition.id,
      name: definition.name,
      providerId: definition.providerId,
      agreementScope: definition.agreementScope,
      insuranceTypes: [displayType(definition.type)],
      requiresLevel,
      componentId: definition.id,
      ...(definition.exclusiveGroup ? { exclusiveGroup: definition.exclusiveGroup } : {}),
    };
  });
  return { products, facts, addOns, sources };
}
