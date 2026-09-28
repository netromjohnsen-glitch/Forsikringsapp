// Synthetic public-free customer records; no real registrations or policies.
export const mcBobilTerm = (name, value, canonicalKey = null) => ({ name, value, canonicalKey, documentIndices: [1] });
export function mcBobilRecord(type = 'MC', index = 1, overrides = {}) {
  return { type, company: 'If', productName: 'Kasko', canonicalProductName: 'Kasko', documentRole: 'individual_agreement',
    annualPremium: null, deductible: null, coverageSummary: null, agreementPeriod: null, documentIndices: [1], addOns: [],
    objectIdentifiers: [{ type: 'registration', value: `ZZ95${String(index).padStart(3,'0')}`, documentIndices: [1] }],
    importantTerms: [
      mcBobilTerm('Forsikringspris',`${1000+index} kr.`,'premie.ekskl_tfa'),
      mcBobilTerm('Trafikkforsikringsavgift',`${200+index} kr`,'premie.tfa'),
      mcBobilTerm('Totalpris',`${1200+2*index} kr.`,'premie.total'),
      mcBobilTerm('Årlig kjørelengde',`${8000+1000*index} km per år`,'kjoretoy.kjorelengde'),
    ], ...overrides };
}
export const mcBobilTerms = (type = 'MC', overrides = {}) => mcBobilRecord(type,1,{
  documentRole:'general_terms',objectIdentifiers:[],importantTerms:[],...overrides,
});
