import { car, term, parsed } from './pilot-quality.mjs';
import { planExtractionBatches } from '../../lib/analysis-batching.ts';
import { enrichBatch, mergeBatchResults } from '../../lib/analysis-merge.ts';
import { createAnalysisTelemetry } from '../../lib/analysis-telemetry.ts';

export const generalTerms = (product = 'Kasko', overrides = {}) => ({
  ...car(product), productName: 'Produktbeskrivelse', documentRole: 'general_terms',
  objectIdentifiers: [], annualPremium: null, deductible: null, coverageSummary: null, addOns: [],
  importantTerms: [term('Totalskadegaranti – alder', '1 år', 'nyverdi.alder'),
    term('Totalskadegaranti – kilometer', '20 000 km', 'nyverdi.km'),
    term('Generelt produktunntak', 'Syntetisk produktbegrensning')], ...overrides,
});
export const objects = d => d.insuranceData.insurances;
export function batchDocuments(documents, side = 'existing', split = false) {
  return planExtractionBatches(documents.map((_,documentIndex) => ({ side, documentIndex, pages: 1,
    text: 'Synthetic '.repeat(split ? 9000 : 10) }))).map(batch => {
    const records = batch.documents.flatMap((doc,index) => documents[doc.documentIndex].map(record => ({ ...record,
      documentIndices: [index+1],
      objectIdentifiers: record.objectIdentifiers.map(id => ({ ...id, documentIndices: [index+1] })),
      importantTerms: record.importantTerms.map(t => ({ ...t, documentIndices: [index+1] })),
      addOns: record.addOns.map(addon => ({ ...addon, importantTerms: addon.importantTerms.map(t => ({ ...t, documentIndices: [index+1] })) })),
    })));
    return { batch, agreement: enrichBatch(parsed(records), batch, createAnalysisTelemetry('synthetic-object-role')) };
  });
}
export function documentPipeline(documents, side = 'existing', split = false, reverseCompletion = false) {
  const results = batchDocuments(documents,side,split);
  return mergeBatchResults(reverseCompletion ? results.toReversed() : results, side, false);
}
export function portfolioDocuments(side = 'existing') {
  const records = ['Kasko','Pluss'].map(product => {
    const policy = car(product);
    // Alternate synthetic amounts, separate from the reported production prices.
    for (const t of policy.importantTerms) if(t.canonicalKey?.startsWith('premie.')) {
      const values = product === 'Kasko' ? [8641,1359,10321] : [7263,2047,9527];
      t.value = `${values[['premie.ekskl_tfa','premie.tfa','premie.total'].indexOf(t.canonicalKey)]} kr${side === 'existing' ? '.' : ''}`;
    }
    return [policy,generalTerms(product)];
  });
  return side === 'offer' ? records.toReversed() : records;
}
