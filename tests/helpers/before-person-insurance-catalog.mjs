import { beforePrivatePolicyPages } from "./before-private-policy-pages.mjs";

// Frozen catalogue checkpoints predate the person, private and Tryg member entries.
const historicalInsuranceTypes = [
  "Snøscooter", "Campingvogn", "Tilhenger", "Bil", "Hus", "Innbo", "Reise",
  "Ulykke", "Båt", "MC", "Bobil", "Hund", "Katt", "Barn", "Liv",
];
const addedTypeLabels = new Set(["Uføre", "Kritisk sykdom", "Behandling", "Gravid", "Senior", "Hytte", "Verdisak", "Innbo fritidsbolig", "Personforsikring", "Studentforsikring", "70+"]);
const addedProviders = new Set(["klp", "landkreditt", "watercircles"]);
const addedCompanies = new Set(["KLP", "Landkreditt", "WaterCircles"]);
const expandedIds = /^(?:tryg-(?:nito|utdanningsforbundet)-|person:|cabin:|private-valuables:|new-private:|(?:klp|landkreditt|watercircles)-|(?:tryg|if|gjensidige|storebrand|fremtind|frende)-hytte-)/;

export function beforePersonInsuranceCatalog(catalog) {
  if (!catalog.products.some((product) => product.sourceId?.startsWith("person:"))) return catalog;
  const existingEntries = (entries) => Object.fromEntries(Object.entries(entries)
    .filter(([id]) => !expandedIds.test(id)));
  const insuranceTypes = catalog.insuranceTypes.filter((type) => !addedTypeLabels.has(type));
  const historical = beforePrivatePolicyPages(catalog);
  const historicalPosition = (type) => {
    const index = historicalInsuranceTypes.indexOf(type);
    return index < 0 ? Infinity : index;
  };
  return {
    ...catalog,
    agreementScopes: catalog.agreementScopes?.filter(scope => scope.id !== "nito" && scope.id !== "utdanningsforbundet"),
    insuranceTypes: insuranceTypes.sort((a, b) => historicalPosition(a) - historicalPosition(b)),
    companies: catalog.companies.filter(company => !addedCompanies.has(company)),
    products: catalog.products.filter(product =>
      !addedProviders.has(product.providerId) && !expandedIds.test(product.productId) && !expandedIds.test(product.sourceId ?? "")),
    addOns: catalog.addOns.filter(addOn => !addedProviders.has(addOn.providerId) && !expandedIds.test(addOn.id)),
    sources: existingEntries(historical.sources),
    facts: existingEntries(historical.facts),
  };
}
