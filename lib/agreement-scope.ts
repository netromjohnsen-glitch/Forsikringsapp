// Catalog/product identity only. Never store membership numbers, policy numbers
// or customer text here. External input must match a registered catalog ID.
export type AgreementScopeId = string;
export type AgreementScopeDefinition = {
  id: AgreementScopeId;
  providerId: string;
  name: string;
};
export type AgreementScoped = { agreementScope?: AgreementScopeId | null };
export const ORDINARY_AGREEMENT_SCOPE = "ordinary";

// Missing scope on legacy CATALOG metadata means ordinary. Missing scope on
// a customer request is unknown and must go through unambiguous lookup.
export function catalogAgreementScope(record: AgreementScoped): AgreementScopeId {
  return record.agreementScope ?? ORDINARY_AGREEMENT_SCOPE;
}

export function isRegisteredAgreementScope(
  value: unknown,
  definitions: readonly AgreementScopeDefinition[] = [],
  providerId?: string,
): value is AgreementScopeId {
  return value === ORDINARY_AGREEMENT_SCOPE ||
    (typeof value === "string" && /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(value) && value.length <= 64 &&
      definitions.some(definition => definition.id === value && (!providerId || definition.providerId === providerId)));
}

export function productsInAgreementScope<T extends AgreementScoped>(products: readonly T[], scope?: AgreementScopeId | null): T[] {
  const scopes = new Set(products.map(catalogAgreementScope));
  if (scope == null && scopes.size !== 1) return [];
  const resolved = scope ?? [...scopes][0];
  return products.filter(product => catalogAgreementScope(product) === resolved);
}
