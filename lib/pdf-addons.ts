export type PdfTerm = { name: string; value: string };
export type PdfAddOn = {
  name: string;
  annualPremium: string | null;
  deductible: string | null;
  importantTerms: PdfTerm[];
};
export type PdfInsuranceWithAddOns = {
  importantTerms: PdfTerm[];
  addOns?: PdfAddOn[];
};

// Beholder tilleggene som egne komponenter, men gjør vilkårene tilgjengelige
// for den eksisterende sammenligningsmotoren på samme bilforsikring.
export function includePdfAddOnTerms<T extends PdfInsuranceWithAddOns>(insurance: T): T {
  const seen = new Set<string>();
  const importantTerms = [...insurance.importantTerms, ...(insurance.addOns ?? []).flatMap((addOn) => addOn.importantTerms)]
    .filter((term) => {
      const key = `${term.name.trim().toLocaleLowerCase("nb-NO")}\u0000${term.value.trim().toLocaleLowerCase("nb-NO")}`;
      if (!term.name.trim() || !term.value.trim() || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { ...insurance, addOns: insurance.addOns ?? [], importantTerms };
}
