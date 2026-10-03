import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {normalizeManualAgreement} from '../lib/manual-agreement.ts';
import {normalizeTermName} from '../lib/insurance-normalization.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product, fact, date, sourceHash, documentPriority, enrich, manual} from './helpers/wave3-catalog-gate.mjs';

// Independent full-terms oracle: RC-016/SCRC-008, ordinary Standard,
// effective 2026-09-01. The older IPID does not resolve SC-003/SR-018.
const id='frende-innbo-standard', addon='frende-innbo-uhell';
const hash='608a09ff2513ac8756bd3cb12736a4d04e3dce51b87ca4a986c47b5ab2bc12db';
const signatures=['1385d054ca982975','30f4027e244565fe','67807640ae1f35b9','b5e02c84e91713e9','b5eb98e914354960','b7f3ca5fc51cf2eb','df91d55454eefd03','f1c1cc848624746c'];
const oracle=[
 ['GAP-0275','SF-0452','vann.dekning',4,['nedbør, snøsmelting eller kjøving','vann flyter over gulvet','utvendig rørledning','bygningsskade Frende erstatter','innvendig ledning eller tilknyttet utstyr']],
 ['GAP-0278','SF-0460','innbo.opphold.grense',5,['annen bolig','flytte- og lagringsutgifter','normal reparasjons- eller gjenoppføringstid','dekket på bygningsforsikringen','ubeboelig','forhånd','utgiftene før skaden','tapt husleieinntekt','ikke å kunne bruke boligen','annet selskap']],
 ['GAP-0282','SF-0470','skadedyr.dekning',7,['veggedyr, kakerlakker, skjeggkre','rotter og mus','forsikringsstedet','Vis Forsikring','reduksjon eller utryddelse','undersøkelse av om skade foreligger','forebygging','uten Vis sitt samtykke','ikke erstatning for skade på innbo']],
 ['GAP-0283','SF-0472','ansvar.dekning',8,['privatperson','Norden','yrke, næringsvirksomhet, styreoppdrag','annen fast eiendom enn den forsikrede','landbrukseiendom','under 100 000 kr','ikke er CE-merket leketøy eller veier 250 gram eller mer','lånte/leide/brukte/oppbevarte ting','minst 50 %','plutselig og uforutsett','gradvise prosesser']],
 ['GAP-0284','SF-0473','rettshjelp.grense',10,['100 000 kr per tvist','250 000 kr ved minst tre parter','1 000 000 kr ved minst 20 parter','samme side','økonomiske interessen','på tvers av forsikringer og selskaper','Uforsikrede parter']],
 ['GAP-0286','SF-0477','rettshjelp.dekning',9,['familie/separasjon/skilsmisse/barnefordeling/arv/skifte','namsmyndighetssaker unntatt tvist om boligen','ubestridt inkasso','straffesak','før klageadgangen er fullt utnyttet','mellom sameiere','motorvogn, båt','advokatsalær/sakkyndigutgifter','Utgifter før tvist','tvistegrunnlag før forsikringen ble kjøpt']],
 ['GAP-0287','SF-0479','idtyveri.dekning',11,['Mehrwerk','økonomisk tap, nye ID-papirer/betalingskort og advokatbistand er unntatt','Kortsvindel','regnes ikke som ID-tyveri','yrke/næring','kreditorer utenfor Norden','kravet er sendt fra et norsk inkassobyrå eller rettsinstans']],
 ['GAP-0288','SF-0484','uhell.unntak',12,['sykkel/elsykkel','mistet eller gjenglemt','fullvilkåret av 1. september 2026 punkt 11.4','punkt 4.1','sopp, råte, bakterier eller insekter','riper, rift, hakk, hull og avskallinger','kjæledyr','slitasje, forbruk og andre forhold ved tingen selv']],
];
const rows=(selected=[])=>resolveCatalogFacts(product(id),selected,date);
const own=(key)=>{const f=rows([addon]).find(f=>f.key===key);assert.ok(f,key);return f;};

test('R-040-01: both original hashes, dated source and exact eight signatures/bindings',async()=>{
 sourceHash('catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf',hash);
 sourceHash('catalog/sources/frende/innbo/IPID_Innbo.pdf','9aef7acd6b6f80c8ebea822ec9a8a9613e37a0d67e2bb37a5fbb665c53ae5057');
 const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-040');
 assert.deepEqual(b.signature_ids,signatures);assert.equal(b.P2_piggyback_count,0);assert.deepEqual(b.dependencies,[]);
 assert.deepEqual(b.evidence.map(e=>[e.finding_id,e.source_fact_id]),oracle.map(e=>e.slice(0,2)));
 for(const e of b.evidence){assert.equal(e.sha256,hash);assert.equal(e.product_identity,JSON.stringify(['frende','innbo','ordinary',id,'2026-09-01']));}
 PDFParse.setWorker(getPath());const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf',import.meta.url))});
 try{const pdf=await parser.getText();assert.equal(pdf.total,14);assert.match(pdf.text,/Vilkår av 1\. september 2026/);
  assert.match(pdf.text.replace(/\s+/g,' '),/kreditorer utenfor Norden som ikke er sendt fra et norsk inkassobyrå eller rettsinstans/);
 }finally{await parser.destroy();}
});
for(const [gap,sf,key,page,values] of oracle)test(`R-040-${gap}/${sf}: precise own-source ${key}`,()=>{
 const f=own(key);for(const value of values)assert.ok(f.value.includes(value),`${gap}: ${value}`);
 assert.equal(f.source.page,page);assert.equal(f.source.documentId,key==='uhell.unntak'?'frendeInnboUhell':'frendeInnboStandard');
 assert.equal(f.source.company,'Frende');assert.equal(f.source.filename,'Vilkar_innboforsikring_01092026.pdf');
 assert.equal(f.source.effectiveFrom,'2026-09-01');assert.equal(f.source.version,'Ikke oppgitt');assert.equal(f.source.termsNumber,'Ikke oppgitt');
 assert.equal(f.source.url,'https://api.frende.no/documents/terms/public/pnc/ContentInsurance');assert.equal(productCatalog.sources[f.source.documentId].sha256,hash);
});
test('R-040-10: ID exclusion exact creditor geography and FROM qualification; net limitations separate',()=>{
 const f=own('idtyveri.dekning');assert.doesNotMatch(f.value,/utenlandske kreditorer|inndrives|rettes til/);assert.match(f.source.section,/10\.3.*side 12/);
 const net=own('nettmisbruk.dekning');for(const text of ['norsk, dansk, svensk eller engelsk','Samtykket publisering','lukkede grupper','ulovlige for Mehrwerk å besøke','økonomisk tap'])assert.ok(net.value.includes(text),text);
 assert.equal(net.source.page,11);assert.match(net.source.section,/10\.3.*side 12/);assert.notEqual(net.key,f.key);
});
test('R-040-11: explicit choice, silent optional and rejected Uhell remain distinct',()=>{
 assert.deepEqual(availableAddOns(product(id),date).map(a=>a.id),[addon]);
 assert.equal(rows().some(f=>f.key.startsWith('uhell.')),false);assert.equal(rows([addon]).filter(f=>f.key==='uhell.dekning').length,1);
 const silent=manual(id);assert.equal(canonicalCoverage(silent,'Innbo','uhell.dekning').status,'unknown');assert.deepEqual(silent.addOnIds,[]);
 const selected=normalizeManualAgreement({company:'Frende',totalAnnualPremium:'',products:[{type:'Innbo',productName:'Standard',annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:[addon]}]}).insuranceData.insurances[0];
 assert.equal(canonicalCoverage(selected,'Innbo','uhell.dekning').status,'selected');
 const rejected=enrich(id,[{name:'Uhell',canonicalKey:'uhell.dekning',value:'Ikke valgt'}]);assert.equal(canonicalCoverage(rejected,'Innbo','uhell.dekning').status,'not_selected');assert.deepEqual(rejected.addOnIds,[]);
 assert.ok(rejected.importantTerms.some(t=>t.key==='skadedyr.dekning'));
});
test('R-040-12: document restrictions do not select Uhell or replace pest control',()=>{
 const out=enrich(id,[{name:'Uhell – viktige unntak',canonicalKey:'uhell.unntak',value:'Kundens dokumenterte unntak'}]);
 assert.deepEqual(out.addOnIds,[]);assert.equal(canonicalCoverage(out,'Innbo','uhell.dekning').status,'unknown');
 assert.equal(out.importantTerms.find(t=>t.key==='uhell.unntak').coverageOrigin,'document');
 assert.ok(out.importantTerms.some(t=>t.key==='skadedyr.dekning'));
});
test('R-040-13: same product and both directions preserve values, optionality and sources',()=>{
 for(const peer of [id,'sb-innbo-super','fremtind-innbo-topp','if-innbo-super']){
  const a=compareCatalogProducts(product(id),product(peer)).sections.flatMap(s=>s.rows);
  const b=compareCatalogProducts(product(peer),product(id)).sections.flatMap(s=>s.rows);
  for(const r of a){const reverse=b.find(s=>s.key===r.key);assert.ok(reverse,r.key);assert.deepEqual(r.first,reverse.second);assert.deepEqual(r.second,reverse.first);if(peer===id)assert.equal(r.different,false);}
  for(const key of oracle.map(o=>o[2]))assert.equal(a.find(r=>r.key===key).first.state,key==='uhell.unntak'?'optional':'included',key);
 }
});
test('R-040-14: explicit document value and rejection override each base dimension',()=>{
 for(const key of [...oracle.filter(o=>o[2]!=='uhell.unntak').map(o=>o[2]),'nettmisbruk.dekning'])for(const value of ['Kundens uttrykkelige vilkår 17 777 kr','Ikke valgt'])documentPriority(id,key,value);
});
test('R-040-15: optional own-document exception retained without inferred customer addon choice',()=>{
 const value='Kundens uttrykkelige Uhell-unntak';const out=enrich(id,[{name:'Uhell – viktige unntak',canonicalKey:'uhell.unntak',value}]);
 const f=out.importantTerms.find(f=>f.key==='uhell.unntak');assert.ok(f);assert.equal(f.value,value);assert.equal(f.coverageOrigin,'document');assert.deepEqual(out.addOnIds,[]);
 assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);
});
test('R-040-16: canonical keys unchanged and each effective key unique',()=>{
 const sum=own('innbo.forsikringssum');assert.equal(sum.key,'innbo.forsikringssum');
 assert.equal(sum.label,'Samlet forsikringssum');assert.equal(normalizeTermName(sum.label,{insuranceType:'Innbo'}),'samlet forsikringssum');
 const compared=compareCatalogProducts(product(id),product(id)).sections.flatMap(s=>s.rows);
 for(const selected of [[],[addon]]){const fs=rows(selected);assert.equal(new Set(fs.map(f=>f.key)).size,fs.length);
  for(const f of fs){const row=compared.find(r=>r.key===f.key);assert.ok(row,f.key);
   assert.ok(row.first.facts.some(c=>c.key===f.key&&c.value===f.value),f.key);
   assert.ok(row.second.facts.some(c=>c.key===f.key&&c.value===f.value),f.key);
  }
 }
});
test('R-040-17: held-out PC controls preserve limits, deductibles, objects and optional boundaries',()=>{
 const expected={'innbo.verdigjenstander.enkeltgjenstand.grense':'500 000 kr per enkeltgjenstand','innbo.datalager.grense':'30 000 kr','innbo.vaesketap.grense':'10 000 kr','skadedyr.grense':'150 000 kr per skadetilfelle','skadedyr.egenandel':'2 000 kr per skade','ansvar.egenandel':'6 000 kr per skadetilfelle','uhell.grense':'40 000 kr'};
 for(const [key,value]of Object.entries(expected))assert.equal(own(key).value,value);
 assert.match(own('uhell.egenandel').value,/2 000 kr.*40 000 kr.*andre skade.*forsikringsbeviset/);assert.match(own('flytting.transport.grense').value,/100 000 kr.*Norden/);
 assert.match(own('rettshjelp.egenandel').value,/4 000 kr pluss 20 %.*Mekle/);assert.match(own('innbo.forsikringssum').value,/Ubegrenset.*forsikringsbeviset/);
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/regression-control-registry.csv',import.meta.url),'utf8');
 for(const pc of [175,176,177,178,179,180,181,182,183,184,185,186,187,188,189])assert.ok(registry.includes(`PC-${String(pc).padStart(4,'0')},AUDITED_POSITIVE,frende Innbo`));
});
test('R-040-18: exact provider/type/scope/version; no leaked Frende Innbo addons or provenance',()=>{
 assert.equal(findCatalogProduct('frende',id,'2026-09-01',{insuranceType:'Innbo',agreementScope:'ordinary'}),product(id));
 assert.equal(findCatalogProduct('if',id,'2026-09-01'),null);assert.equal(findCatalogProduct('frende',id,'wrong-version'),null);
 for(const opts of [{insuranceType:'Hus'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-09-01',opts),null);
 for(const p of productCatalog.products.filter(p=>p.productId!==id)){
  assert.equal(availableAddOns(p,date).some(a=>a.id===addon),false,p.productId);
  assert.ok(resolveCatalogFacts(p,[],date).every(f=>!['frendeInnboStandard','frendeInnboUhell'].includes(f.source.documentId)),p.productId);
 }
});
