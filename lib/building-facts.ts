// Generelle bygningskonsepter. Ingen selskapsnavn eller automatisk
// skadeberegning: vilkårets forutsetninger må alltid følge tallene.
export type BuildingInsuranceForm = "full_value" | "first_loss" | "agreed_sum";
export type BuildingFactData =
  | { kind: "insurance_form"; forms: BuildingInsuranceForm[]; defaultForm?: BuildingInsuranceForm;
      authority: "policy" | "catalog"; index?: string; sumNok?: number }
  | { kind: "age_deduction"; component: string; scope: string; freeYears: number;
      annualPercent: number; maximumPercent: number; minimumCompensationPercent: number;
      yearBasis: "year" | "started_year"; exceptions: string[]; calculationBasis: string }
  | { kind: "age_threshold"; component: string; scope: string; olderThanYears: number;
      deductionPercent?: number; fixedDeductionNok?: number; maximumCompensationNok?: number;
      note?: string };
