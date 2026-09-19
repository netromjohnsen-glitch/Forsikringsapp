export type AgreementPriceScope = "entire_agreement" | "partial_or_unclear";

export type ManualPremiumSummary = {
  knownAnnualPremium: string | null;
  missingCount: number;
};

function premiumInOre(value: string): number | null {
  const amount = value.trim().replace(/[\u00a0\u202f]/g, " ").replace(/\s*(?:kr|kroner)$/i, "").trim();
  if (!/^(?:\d+|\d{1,3}(?:[ .]\d{3})+)(?:,\d{1,2})?$/.test(amount)) return null;
  const ore = Math.round(Number(amount.replace(/[ .]/g, "").replace(",", ".")) * 100);
  return Number.isSafeInteger(ore) ? ore : null;
}

function formatPremium(ore: number): string {
  return `${new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 }).format(ore / 100).replace(/[\u00a0\u202f]/g, " ")} kr`;
}

// Manuelle produktpremier summeres bare til en total når alle produkter har pris.
export function summarizeManualAnnualPremium(premiums: readonly (string | null)[]): {
  totalAnnualPremium: string | null;
  priceSummary: ManualPremiumSummary;
} {
  let sumOre = 0;
  let knownCount = 0;
  let missingCount = 0;
  for (const premium of premiums) {
    if (premium === null || premium.trim() === "") {
      missingCount++;
      continue;
    }
    const ore = premiumInOre(premium);
    if (ore === null || !Number.isSafeInteger(sumOre + ore)) throw new Error("Ugyldig årspremie.");
    sumOre += ore;
    knownCount++;
  }
  const knownAnnualPremium = knownCount ? formatPremium(sumOre) : null;
  return {
    totalAnnualPremium: missingCount === 0 ? knownAnnualPremium : null,
    priceSummary: { knownAnnualPremium, missingCount },
  };
}

export function annualPremiumLabel(data: {
  totalAnnualPremium: string | null;
  priceSummary?: ManualPremiumSummary;
}): string {
  if (data.totalAnnualPremium !== null) return data.totalAnnualPremium;
  const summary = data.priceSummary;
  if (summary?.knownAnnualPremium && summary.missingCount > 0) {
    return `Kjent årspremie: ${summary.knownAnnualPremium} – pris mangler for ${summary.missingCount} ${summary.missingCount === 1 ? "forsikring" : "forsikringer"}`;
  }
  return "Pris ikke oppgitt";
}

// En totalsum fra ett av flere dokumenter kan allerede inkludere enkeltpremier.
// Uten uttrykkelig dekning av hele avtalen vises ingen sammenlagt totalpris.
export function finalizeAgreementPricing<T extends {
  totalAnnualPremium: string | null;
  totalAnnualPremiumScope: AgreementPriceScope;
}>(data: T): Omit<T, "totalAnnualPremiumScope"> {
  const { totalAnnualPremiumScope, ...result } = data;
  return {
    ...result,
    totalAnnualPremium: totalAnnualPremiumScope === "entire_agreement"
      ? data.totalAnnualPremium
      : null,
  };
}
