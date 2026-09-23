// Synthetic regression data; no customer documents or identifiers.
import { includePdfAddOnTerms } from '../../lib/pdf-addons.ts';
import { enrichExtractedAgreementWithCatalog } from '../../lib/catalog-enrichment.ts';
export const rentalScenarios = [
  ['leiebil.dager', 'Ved reparasjon', '60'],
  ['leiebil.kondemnasjon', 'Ved totalskade eller tyveri', '30'],
  ['leiebil.teknisk', 'Tekniske problemer i Norden', '30'],
  ['leiebil.feriereise', 'Feriereise utenfor Norden', '15'],
];
export const addon = (name, importantTerms = []) => ({ name, annualPremium: null, deductible: null, importantTerms });
export function pilotPolicy(productName, { company = 'Gjensidige', addOns, rentalKeys = false } = {}) {
  const plus = productName === 'Pluss';
  const insurance = includePdfAddOnTerms({
    type: 'Bil', productName, canonicalProductName: productName,
    annualPremium: plus ? '12 788 kr' : '14 786 kr', deductible: null,
    coverageSummary: plus ? 'Leiebil er valgt. Maskinskade er valgt.' : 'Leiebil er ikke valgt',
    importantTerms: [
      { name: 'Totalskadegaranti', canonicalKey: 'nyverdi.grenser', value: plus ? '3 år / 60 000 km' : '1 år / 15 000 km' },
      { name: 'Bilnøkkel', value: plus ? '15 000 kr' : '7 500 kr' },
      { name: 'Premie total', canonicalKey: 'premie.total', value: plus ? '12 788 kr' : '14 786 kr' },
      ...(plus ? [
        { name: 'Premie', canonicalKey: 'premie.ekskl_tfa', value: '9 518 kr' },
        { name: 'Avgift', canonicalKey: 'premie.tfa', value: '3 270 kr' },
      ] : []),
    ],
    addOns: addOns ?? (plus ? [
      addon('Leiebil', rentalScenarios.map(([key, name, days]) => ({ name, value: `Leiebil i inntil ${days} dager`,
        canonicalKey: rentalKeys ? key : 'leiebil.dager' }))),
      addon('Maskinskade', [{ name: 'Varighet og kilometergrense', value: 'Til første hovedforfall etter 10 år eller 200 000 km' }]),
    ] : []),
  });
  return enrichExtractedAgreementWithCatalog({ company, totalAnnualPremium: insurance.annualPremium,
    totalAnnualPremiumScope: 'entire_agreement', insurances: [insurance] }, new Date('2026-09-23')).insurances[0];
}
