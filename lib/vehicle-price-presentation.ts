import { isMotorVehicleType, normalizeTermName } from "./insurance-normalization.ts";
import type { ComparedInsurance } from "./comparison.ts";

export const vehiclePriceFields = [
  { key: "premie.ekskl_tfa", label: "Forsikringspris" },
  { key: "premie.tfa", label: "TFA" },
  { key: "premie.total", label: "Totalt" },
] as const;
export type VehiclePriceKey = typeof vehiclePriceFields[number]["key"];
export function isVehiclePriceKey(key: string): key is VehiclePriceKey {
  return vehiclePriceFields.some((field) => field.key === key);
}
export function vehiclePrices(insurance: ComparedInsurance) {
  if (!isMotorVehicleType(insurance.type, insurance)) return null;
  return vehiclePriceFields.map((field) => {
    const terms = insurance.importantTerms.filter((term) => term.coverageOrigin !== "catalog" &&
      (term.key || normalizeTermName(term.name, { insuranceType: insurance.type })) === field.key);
    const values = [...new Set(terms.map((term) => term.value.trim()).filter(Boolean))];
    const amounts = values.map(annualAmount);
    const uniqueAmounts = new Set(amounts);
    return { ...field, value: values.length ? values.join(" · ") : null,
      amount: amounts.length > 0 && !uniqueAmounts.has(null) && uniqueAmounts.size === 1 ? amounts[0] : null,
      sources: terms.flatMap((term) => term.sources ?? (term.source ? [term.source] : [])) };
  });
}
// Only a single explicit annual amount, never extract a number from a mixed range/monthly sentence.
export function annualAmount(value: string): number | null {
  const clean = value.trim().replace(/[\u00a0\u202f]/g, " ");
  const match = /^(?:(kr|kroner)\s*)?((?:\d+|\d{1,3}(?:[ .]\d{3})+)(?:,\d{1,2})?)\s*(kr|kroner)?(?:\s*(?:per år|\/\s*år|årlig))?$/iu.exec(clean);
  if (!match || (match[1] && match[3])) return null;
  const number = Number(match[2].replace(/[ .]/g, "").replace(",", "."));
  const ore = Math.round(number * 100);
  return Number.isSafeInteger(ore) ? ore : null;
}
export function vehiclePriceDifferences(first: ComparedInsurance, second: ComparedInsurance) {
  const left = vehiclePrices(first), right = vehiclePrices(second);
  if (!left || !right) return [];
  return left.flatMap((field, index) => {
    const other = right[index];
    if (field.key === "premie.tfa" || field.amount === null || other.amount === null || field.amount === other.amount) return [];
    const delta = other.amount - field.amount;
    const amount = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(Math.abs(delta) / 100);
    return [{ key: field.key, label: field.label, deltaOre: delta,
      text: `Nytt tilbud er ${amount} kr ${delta < 0 ? "billigere" : "dyrere"} per år.` }];
  });
}
export function differentVehiclePriceBasis(first: ComparedInsurance, second: ComparedInsurance): boolean {
  const left = vehiclePrices(first), right = vehiclePrices(second);
  if (!left || !right) return false;
  const comparable = [0, 2].some((i) => left[i].amount !== null && right[i].amount !== null);
  return !comparable && (left.some((f) => f.value) || right.some((f) => f.value) || Boolean(first.annualPremium || second.annualPremium));
}
