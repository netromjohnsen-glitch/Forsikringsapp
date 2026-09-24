import type { ComparedDocument, FactSource, InsuranceGroup } from "./comparison.ts";
import { annualAmount, vehiclePriceFields, vehiclePrices, type VehiclePriceKey } from "./vehicle-price-presentation.ts";
import { normalizeInsuranceType } from "./insurance-normalization.ts";

export type PriceCompleteness = "complete" | "partial" | "unavailable" | "conflicting";
export type PortfolioPrice = ReturnType<typeof portfolioPrice>;
export type PortfolioPriceInput = {
  key: VehiclePriceKey;
  state: "present" | "missing" | "conflict" | "unparseable" | "not_required";
  annualBasis: "canonical_annual" | "unresolved";
  comparable: boolean;
  reason: "OPTIONAL_TFA_NOT_REQUIRED" | "CONSOLIDATION_UNRESOLVED" | "CONSOLIDATION_FACT_CONFLICT" | "MULTIPLE_DOCUMENT_AMOUNTS" |
    "CONTRIBUTION_ACCEPTED" | "PRICE_UNPARSEABLE" | "PRICE_MISSING" | "PRICE_TYPE_UNSUPPORTED";
};
export const formatPortfolioPrice = (ore: number) => `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100)} kr`;

// Consumes logical objects AFTER consolidation. Object identity and cross-side
// matching belong exclusively to the existing object pipeline.
export function portfolioPrice(document: ComparedDocument, failedDocuments = 0, observer?: (objectIndex: number, input: PortfolioPriceInput) => void) {
  const objects = document.insuranceData.insurances;
  const prices = objects.map(vehiclePrices);
  const compatible = objects.length > 0 && prices.every(Boolean);
  const components = vehiclePriceFields.map(field => {
    const contributions: { objectIndex: number; amount: number; sources: FactSource[] }[] = [];
    let expected = 0, conflict = false;
    objects.forEach((object, index) => {
      const price = prices[index]?.find(item => item.key === field.key);
      const observe = (state: PortfolioPriceInput["state"], reason: PortfolioPriceInput["reason"]) => {
        if (!observer) return;
        try {
          observer(index, { key: field.key, state, annualBasis: price?.amount !== null && price?.amount !== undefined ? "canonical_annual" : "unresolved",
            comparable: state === "present", reason });
        } catch { /* Optional diagnostics cannot affect price resolution. */ }
      };
      // Reuse object-price presentation's optional-TFA visibility policy for
      // these types. No inferred zero or subtraction-derived prices.
      if (field.key === "premie.tfa" && ["tilhenger", "campingvogn", "snøscooter"].includes(normalizeInsuranceType(object.type)) && !price?.value) {
        observe("not_required", "OPTIONAL_TFA_NOT_REQUIRED"); return;
      }
      expected++;
      const disputed = object.consolidation?.status === "unresolved" || object.consolidation?.factConflicts?.some(item => {
        if (item.key !== field.key) return false;
        const amounts = item.values.map(value => annualAmount(value, field.key));
        // A consolidation conflict can be textual formatting only. Resolve
        // that case using the same strict annual-amount policy as object prices.
        return amounts.includes(null) || new Set(amounts).size !== 1;
      });
      const values = object.importantTerms.filter(term => term.coverageOrigin !== "catalog" && term.key === field.key).map(term => annualAmount(term.value, field.key));
      const multiple = new Set(values.filter(value => value !== null)).size > 1;
      if (disputed || multiple) {
        conflict = true;
        observe("conflict", object.consolidation?.status === "unresolved" ? "CONSOLIDATION_UNRESOLVED" : disputed ? "CONSOLIDATION_FACT_CONFLICT" : "MULTIPLE_DOCUMENT_AMOUNTS");
        return;
      }
      if (price?.amount !== null && price?.amount !== undefined) {
        contributions.push({ objectIndex: index, amount: price.amount, sources: price.sources });
        observe("present", "CONTRIBUTION_ACCEPTED");
      } else observe(price?.value ? "unparseable" : "missing", !prices[index] ? "PRICE_TYPE_UNSUPPORTED" : price?.value ? "PRICE_UNPARSEABLE" : "PRICE_MISSING");
    });
    const sum = contributions.reduce((value, item) => value + item.amount, 0);
    if (!Number.isSafeInteger(sum)) conflict = true;
    const completeness: PriceCompleteness = conflict ? "conflicting" : !compatible || !contributions.length ? "unavailable" :
      contributions.length === expected && failedDocuments === 0 ? "complete" : "partial";
    return { ...field, origin: "calculated_portfolio" as const, completeness, expected, priced: contributions.length,
      amount: compatible && contributions.length && !conflict ? sum : null, contributions };
  });
  const documentedValue = document.insuranceData.totalAnnualPremium;
  const documentedAmount = documentedValue === null ? null : annualAmount(documentedValue);
  const total = components.find(component => component.key === "premie.total")!;
  const conflict = documentedAmount !== null && total.completeness === "complete" && total.amount !== documentedAmount;
  return { compatible, objectCount: objects.length, failedDocuments, components,
    documented: { origin: document.source === "manual" ? "manual_agreement" as const : "documented_agreement" as const, value: documentedValue, amount: documentedAmount },
    conflict };
}

export function portfolioPriceDifference(first: PortfolioPrice, second: PortfolioPrice, groups: InsuranceGroup[]): string | null {
  if (!groups.length || groups.length !== first.objectCount || groups.length !== second.objectCount || groups.some(group => group.objectMatch?.status !== "matched") ||
    first.failedDocuments || second.failedDocuments || first.conflict || second.conflict) return null;
  const totals = [first, second].map(side => side.components.find(component => component.key === "premie.total")!);
  if (totals.some(total => total.completeness !== "complete" || total.amount === null)) return null;
  const delta = totals[1].amount! - totals[0].amount!;
  return delta === 0 ? null : `Samlet prisforskjell: Nytt tilbud er ${formatPortfolioPrice(Math.abs(delta))} ${delta < 0 ? "billigere" : "dyrere"} per år, inkludert eventuell TFA.`;
}
