import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts } from '../../lib/product-catalog.ts';
import { compareCatalogProducts } from '../../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../../lib/manual-agreement.ts';

// Shared mechanics only. Every batch supplies its independent source oracle,
// exact scope and assertions; no expected insurance values are derived here.
export const date = new Date('2026-09-29T10:52:14.812Z');
export const product = id => { const p=productCatalog.products.find(p=>p.productId===id);assert.ok(p,id);return p; };
export const facts = id => resolveCatalogFacts(product(id),[],date);
export const fact = (id,key) => { const f=facts(id).find(f=>f.key===key);assert.ok(f,id+' '+key);return f; };
export function sourceHash(path,hash){assert.equal(createHash('sha256').update(readFileSync(new URL('../../'+path,import.meta.url))).digest('hex'),hash);}
export function compareBoth(id,peers,keys){
  const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
  for(const peer of [id,...peers])for(const key of keys){
    const a=rows(id,peer).find(r=>r.key===key),b=rows(peer,id).find(r=>r.key===key);assert.ok(a,key);assert.ok(b,key);
    assert.equal(a.first.state,'included');assert.deepEqual(a.first,b.second);assert.deepEqual(a.second,b.first);
    if(peer===id)assert.equal(a.different,false);
  }
}
export function enrich(id,terms){const p=product(id);return enrichExtractedAgreementWithCatalog({company:p.company,totalAnnualPremium:null,
  insurances:[{type:p.insuranceType,productName:p.name,agreementScope:p.agreementScope,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms}]},date).insurances[0];}
export function documentPriority(id,key,value){
  const out=enrich(id,[{name:fact(id,key).label,canonicalKey:key,value}]);
  const term=out.importantTerms.find(t=>t.key===key);assert.ok(term,key);assert.equal(term.value,value);assert.equal(term.coverageOrigin,'document');assert.equal(out.addOnIds.length,0);
}
export function manual(id){const p=product(id);return normalizeManualAgreement({company:p.company,totalAnnualPremium:'',products:[{type:p.insuranceType,productName:p.name,agreementScope:p.agreementScope,annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:[]}]}).insuranceData.insurances[0];}
