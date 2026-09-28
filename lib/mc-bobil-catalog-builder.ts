import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import { mcBobilFactLabel, mcBobilKeyApplies, type McBobilType } from "./mc-bobil-registry.ts";

export type McBobilRow = { key: string; value: string; sourceId: string; page: number; section: string;
  deductibleClassification?: CatalogFact["deductibleClassification"]; label?: string };
export type McBobilProductDefinition = { providerId: string; company: string; type: McBobilType;
  agreementScope: string; productId: string; name: string; version: string | null; sourceId: string; rows: McBobilRow[] };
export type McBobilAddOnDefinition = Omit<McBobilProductDefinition, "productId" | "version"> & { id: string; requiresLevel: string[]; exclusiveGroup?: string };

// Data-only adapter into the existing catalog. It neither infers inheritance
// nor turns available add-ons into facts of an unselected base product.
export function buildMcBobilCatalog(sources: Record<string, CatalogSource>, definitions: McBobilProductDefinition[], additions: McBobilAddOnDefinition[] = []) {
  const facts: Record<string, CatalogFact[]> = {};
  function rows(definition: McBobilProductDefinition | McBobilAddOnDefinition): CatalogFact[] {
    return definition.rows.map(row => {
      const source = sources[row.sourceId];
      if (!source || source.providerId !== definition.providerId || source.insuranceType?.toLowerCase() !== definition.type || source.agreementScope !== definition.agreementScope)
        throw new Error("Invalid MC/Bobil source applicability");
      if (!mcBobilKeyApplies(definition.type, row.key) || /^(?:premie|kjoretoy)\./u.test(row.key))
        throw new Error(`Invalid MC/Bobil catalog fact: ${row.key}`);
      return { key: row.key, label: row.label ?? mcBobilFactLabel(definition.type, row.key) ?? row.key, value: row.value,
        ...(row.deductibleClassification ? { deductibleClassification: row.deductibleClassification } : {}),
        source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, version: source.version, agreementScope: source.agreementScope,
          url: source.url, company: source.company, page: row.page, section: row.section,
          note: "Offentlig produktgrunnlag. Kundens forsikringsbevis har forrang; valgfrie dekninger krever dokumentert valg." } };
    });
  }
  const products: CatalogProduct[] = definitions.map(definition => {
    facts[definition.productId] = rows(definition);
    return { providerId: definition.providerId, company: definition.company, insuranceType: definition.type === "mc" ? "MC" : "Bobil",
      agreementScope: definition.agreementScope, productId: definition.productId, name: definition.name,
      version: definition.version, sourceId: definition.sourceId, componentIds: [definition.productId] };
  });
  const addOns: CatalogAddOn[] = additions.map(definition => {
    facts[definition.id] = rows(definition);
    return { id: definition.id, name: definition.name, providerId: definition.providerId, agreementScope: definition.agreementScope,
      insuranceTypes: [definition.type === "mc" ? "MC" : "Bobil"], requiresLevel: definition.requiresLevel,
      componentId: definition.id, ...(definition.exclusiveGroup ? { exclusiveGroup: definition.exclusiveGroup } : {}) };
  });
  return { products, facts, addOns, sources };
}
