// Frozen catalogue checkpoints predate the person insurance entries.
const historicalInsuranceTypes = [
  "Snøscooter", "Campingvogn", "Tilhenger", "Bil", "Hus", "Innbo", "Reise",
  "Ulykke", "Båt", "MC", "Bobil", "Hund", "Katt", "Barn", "Liv",
];
const addedTypeLabels = new Set(["Uføre", "Kritisk sykdom", "Behandling", "Gravid", "Senior"]);

export function beforePersonInsuranceCatalog(catalog) {
  if (!catalog.products.some((product) => product.sourceId?.startsWith("person:"))) return catalog;
  const existingEntries = (entries) => Object.fromEntries(Object.entries(entries)
    .filter(([id]) => !id.startsWith("person:")));
  const insuranceTypes = catalog.insuranceTypes.filter((type) => !addedTypeLabels.has(type));
  const historicalPosition = (type) => {
    const index = historicalInsuranceTypes.indexOf(type);
    return index < 0 ? Infinity : index;
  };
  return {
    ...catalog,
    insuranceTypes: insuranceTypes.sort((a, b) => historicalPosition(a) - historicalPosition(b)),
    products: catalog.products.filter((product) => !product.sourceId?.startsWith("person:")),
    sources: existingEntries(catalog.sources),
    facts: existingEntries(catalog.facts),
  };
}
