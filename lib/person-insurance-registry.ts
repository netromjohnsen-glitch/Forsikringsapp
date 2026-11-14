const personInsuranceTypeDefinitions = [
  ["ulykke", "Ulykke", ["ulykkes", "personulykke"]],
  ["barn", "Barn", ["barne", "barneulykkes"]],
  ["liv", "Liv", ["livs"]],
  ["uføre", "Uføre", ["uførhet", "uførepensjon", "uførekapital"]],
  ["kritisk sykdom", "Kritisk sykdom", ["alvorlig sykdom"]],
  ["behandling", "Behandling", ["behandlings", "helse"]],
  ["gravid", "Gravid", [
    "graviditet", "graviditets", "svangerskap", "svangerskaps", "baby",
    "gravid og baby", "graviditet og baby", "gravid og spedbarn",
  ]],
  ["senior", "Senior", ["godt voksen"]],
] as const;

export type PersonInsuranceType = typeof personInsuranceTypeDefinitions[number][0];

export const personInsuranceTypes = personInsuranceTypeDefinitions.map(([, label]) => label);
export const personInsuranceTypeAliases = Object.fromEntries(
  personInsuranceTypeDefinitions.map(([id, , aliases]) => [id, aliases]),
);
export const personInsuranceTypeLabels = Object.fromEntries(
  personInsuranceTypeDefinitions.map(([id, label]) => [id, label]),
);
