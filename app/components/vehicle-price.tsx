import type { ComparedInsurance as Insurance } from "../../lib/comparison.ts";
import { vehiclePrices } from "../../lib/vehicle-price-presentation.ts";

export function VehiclePriceList({ insurance }: { insurance: Insurance }) {
  const prices = vehiclePrices(insurance);
  if (!prices) return null;
  const unclassifiedPremium = insurance.annualPremium && !prices.some((price) => price.value === insurance.annualPremium);
  return <div className="mt-3"><dl className="space-y-2 text-sm">{prices.map((price) => <div key={price.key} className={`flex flex-wrap justify-between gap-2 ${price.key === "premie.total" ? "border-t border-slate-200 pt-2 font-semibold" : ""}`}><dt>{price.label}</dt><dd className="tabular-nums">{price.value || "Ikke dokumentert"}</dd></div>)}</dl>{unclassifiedPremium && <p className="mt-2 text-xs text-slate-600">Oppgitt årspris (prisgrunnlag ikke avklart): {insurance.annualPremium}</p>}</div>;
}
