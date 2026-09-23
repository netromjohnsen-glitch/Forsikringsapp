// Synthetic extraction response: no raw addon array and no literal selection words.
export function pdfAddonSelection({ company = 'Gjensidige', productName = 'Pluss', importantTerms, addOns = [] } = {}) {
  return {
    company, totalAnnualPremium: null, totalAnnualPremiumScope: 'partial_or_unclear',
    insurances: [{ type: 'Bil', productName, canonicalProductName: productName,
      annualPremium: null, deductible: null, coverageSummary: null, addOns,
      importantTerms: importantTerms ?? [
        { name: 'Leiebil ved reparasjon', canonicalKey: 'leiebil.dager', value: 'Inntil 60 dager' },
        { name: 'Leiebil ved totalskade', canonicalKey: 'leiebil.kondemnasjon', value: 'Inntil 30 dager' },
        { name: 'Leiebil ved tekniske problemer i Norden', canonicalKey: 'leiebil.teknisk', value: 'Inntil 30 dager' },
        { name: 'Leiebil på feriereise utenfor Norden', canonicalKey: 'leiebil.feriereise', value: 'Inntil 15 dager' },
        { name: 'Maskinskade', canonicalKey: 'maskinskade.varighet', value: 'Til første hovedforfall etter 10 år eller 200 000 km' },
      ],
    }],
  };
}
