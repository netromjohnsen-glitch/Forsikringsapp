import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { productCatalog, resolveCatalogFacts, findCatalogProduct } from '../lib/product-catalog.ts';
import { materializeCatalogProduct, compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog, catalogFactSources } from '../lib/catalog-enrichment.ts';
import { normalizeManualAgreement } from '../lib/manual-agreement.ts';
import { groupInsurances, groupTerms } from '../lib/comparison.ts';
const audit=new URL('../docs/audit/checkpoints/b051-rental-loss-use-5718a5f/',import.meta.url);
// Independent, source-reviewed oracle recorded before production edits.
const oracle=JSON.parse(readFileSync(new URL('source-oracle.json',audit)));
const authorization=JSON.parse(readFileSync(new URL('authorization.json',audit)));
const date=new Date('2026-10-06T12:00:00Z'),ids=['gjensidige-hus','gjensidige-hus-pluss'],rental='gjensidige-hus-utleie';
const keys=Object.keys(oracle),rentalKeys=keys.filter(k=>k.startsWith('hus.utleie.'));
const product=id=>{const p=productCatalog.products.find(p=>p.productId===id);assert.ok(p,id);return p;};
const facts=(id,addons=[])=>resolveCatalogFacts(product(id),addons,date);
const fact=(id,key)=>{const matches=facts(id,[rental]).filter(f=>f.key===key);assert.equal(matches.length,1,key);return matches[0];};
const customerSource={documentId:'synthetic-b051-customer',filename:'customer.pdf',termsNumber:'Kundebevis',effectiveFrom:'',page:2,section:'Avtalte vilkår',company:'Gjensidige',url:'https://example.invalid/customer'};
const reference=(page,section)=>({documentId:'gjensidigeHusStandard',filename:'Hus-Standard-alminnelige-vilkar.pdf',termsNumber:'Hus Standard',effectiveFrom:'',company:'Gjensidige',url:'https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Hus-Standard-alminnelige-vilkar.pdf',section,page,version:'Alminnelige vilkår',productCode:undefined});
const expectedSources=key=>{const o=oracle[key];return [reference(...o.primary),...(o.qualification?[reference(...o.qualification)]:[])];};
const manual=(id,addons=[])=>normalizeManualAgreement({company:'Gjensidige',totalAnnualPremium:'',products:[{type:'Hus',productName:product(id).name,annualPremium:'',deductible:'',coverageSummary:'',importantTerms:[],addOnIds:addons}]}).insuranceData.insurances[0];
const enrich=(id,terms)=>enrichExtractedAgreementWithCatalog({company:'Gjensidige',totalAnnualPremium:null,insurances:[{type:'Hus',productName:product(id).name,annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms}]},date);
const term=(key,value)=>({name:oracle[key].label,canonicalKey:key,value,source:customerSource});
const rows=(a,b)=>compareCatalogProducts(product(a),product(b)).sections.flatMap(s=>s.rows);
const hash=b=>createHash('sha256').update(b).digest('hex');

test('R-051-BINDINGS: exact five signatures and ten original GAP/SF/product bindings',()=>{
 const registry=readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/p1-triage.csv',import.meta.url),'utf8');
 const expected={ '08203cfa28493e63':[['GAP-2089','SF-2994'],['GAP-2144','SF-3078']], '8e8d82878deb95b5':[['GAP-2090','SF-2996'],['GAP-2145','SF-3080']], 'b5b211cad16d32c6':[['GAP-2091','SF-2997'],['GAP-2146','SF-3081']], '4a844bae3be9dea8':[['GAP-2100','SF-3009'],['GAP-2159','SF-3096']], '8d28f56b17a9bae2':[['GAP-2116','SF-3034'],['GAP-2175','SF-3121']] };
 assert.deepEqual(authorization.signatures.map(s=>s.signature).sort(),Object.keys(expected).sort());
 for(const [signature,pairs] of Object.entries(expected)){
  const s=authorization.signatures.find(s=>s.signature===signature);assert.ok(registry.includes(signature));assert.equal(s.original_binding.final_batch_id,'B-051');
  assert.deepEqual(s.finding_ids.sort(),pairs.map(p=>p[0]).sort());assert.deepEqual(s.source_fact_ids.sort(),pairs.map(p=>p[1]).sort());
  for(const [gap,sf] of pairs){const e=s.original_source_evidence.find(e=>e.finding_id===gap);assert.equal(e.source_fact_id,sf);assert.equal(JSON.parse(e.product_identity)[0],'gjensidige');assert.equal(JSON.parse(e.product_identity)[2],'ordinary');assert.ok(ids.includes(JSON.parse(e.product_identity)[3]));assert.equal(JSON.parse(e.product_identity)[4],'Alminnelige vilkår');}
 }
});

test('R-051-SOURCES: exact registered bytes, provider, type, version and original clauses in both PDFs',()=>{
 for(const [level,hashValue,last,additional] of [['Standard','d237795bdfd0223a9e078bf308d86fdc2f46de953784aea06264ff8024e44edc',17,5],['Pluss','79f127ae557e13af8c7a55f95a56c69cf890188dc2e5fcbd4b50ee051e10c792',18,6]]){
  const filename=`Hus-${level}-alminnelige-vilkar.pdf`,path=new URL('../catalog/sources/gjensidige/hus/'+filename,import.meta.url);
  assert.equal(hash(readFileSync(path)),hashValue);const s=productCatalog.sources['gjensidigeHus'+level];
  assert.equal(s.filename,filename);assert.equal(s.sha256,hashValue);assert.equal(Object.hasOwn(s,'sourceType'),false);assert.equal(s.documentName,'Alminnelige vilkår Hus '+level);assert.equal(s.company,'Gjensidige');assert.equal(s.insuranceType,'Hus');assert.equal(s.effectiveFrom,'');assert.equal(s.version,'Alminnelige vilkår');
  const page=p=>execFileSync('pdftotext',['-f',String(p),'-l',String(p),path.pathname,'-']).toString().replace(/\s+/gu,' ').trim();
  const first=page(1),covered=page(3),excluded=page(4),loss=page(additional),settlement=page(last);
  for(const phrase of ['innen 14 dager fra leien skulle ha blitt betalt','14 dagers frist til å betale fra varselet er sendt','innen 6 uker fra første betalingsmislighold','namsmannen','forsikringsavtaleloven § 4-8'])assert.ok(first.includes(phrase),level+': '+phrase);
  for(const phrase of ['Er det i forsikringsbeviset angitt utleie','med vilje påført av','kun en gang','ved skadeverk eller','kr 20 000','godkjent for varig opphold'])assert.ok(covered.includes(phrase),level+': '+phrase);
  for(const phrase of ['rettmessig tilbakeholdt','feil eller mangler','hard bruk','Vasking og rydding','etterlatte','Utgifter utover misligholdt husleie'])assert.ok(excluded.includes(phrase),level+': '+phrase);
  for(const phrase of ['umiddelbar nærhet','redningstiltak etter FAL § 6-4','etter avtale med Gjensidige','all adkomst','inntil forsikringssummen','10 millioner per kunde'])assert.ok(loss.includes(phrase),level+': '+phrase);
  for(const phrase of ['kontaktdetaljer','fødselsnummer/org nr','husleieregulering','forskuddsbetaling','Depositum eller bankgaranti','Tilbakelevering og fraflytting','form og varighet','særlig tvangsgrunnlag','14 dager etter skriftlig varsel','andre opplysninger av betydning','for det utbetalte beløp','behandling i offentlige instanser','markedspris for umøblerte rom','For korttidsutleie dekkes kun inngåtte kontrakter','erstatning i 3 måneder','innsparte utgifter','opptjente renter','50% av gjeldende leiepris'])assert.ok(settlement.includes(phrase),level+': '+phrase);
 }
});
for(const key of keys)test('R-051-FACT '+key+': exact value, label, primary and qualification provenance in both levels',()=>{
 const o=oracle[key];const raw=productCatalog.facts[o.owner].filter(f=>f.key===key);assert.equal(raw.length,1);
 for(const id of ids){const f=fact(id,key);assert.equal(f.value,o.value);assert.equal(f.label,o.label);assert.deepEqual(f.source,expectedSources(key)[0]);assert.deepEqual(f.qualificationSource,expectedSources(key)[1]);assert.deepEqual(catalogFactSources(f),expectedSources(key));
  const presented=materializeCatalogProduct(product(id)).facts.filter(f=>f.key===key);assert.equal(presented.length,1);assert.equal(presented[0].value,o.value);assert.deepEqual(presented[0].sources,expectedSources(key).map(s=>({...s,sourceType:undefined})));assert.equal(presented[0].state,key.startsWith('hus.utleie.')?'optional':'included');
 }
});

test('R-051-REVERSE: historical rental/garden rows remain intact; exact six source-approved events/building transforms',()=>{
 execFileSync('node',[new URL('../docs/audit/checkpoints/b051-craftsmanship-0cedd98/catalog-audit.mjs',import.meta.url).pathname],{stdio:'pipe'});
 for(const id of ids){assert.equal(facts(id,[rental]).filter(f=>keys.includes(f.key)).length,6);assert.equal(facts(id,[rental]).filter(f=>f.key.startsWith('hus.utleie.')).length,5);assert.equal(facts(id,[rental]).find(f=>f.key==='hus.utleie.egenandel').value,'10 000 kroner ved misligholdt husleie og skadeverk av leietaker.');}
});

test('R-051-AVAILABLE: optional catalog information never selects customer rental; manual catalog input is explicit',()=>{
 for(const id of ids){const no=manual(id),yes=manual(id,[rental]);assert.deepEqual(no.addOnIds,[]);assert.equal(no.importantTerms.some(t=>rentalKeys.includes(t.key)),false);assert.deepEqual(yes.addOnIds,[rental]);
  for(const key of keys){const t=yes.importantTerms.find(t=>t.key===key);assert.ok(t);assert.equal(t.value,oracle[key].value);assert.equal(t.coverageOrigin,'catalog');assert.deepEqual(t.sources.map(({note,...s})=>s),expectedSources(key));}
  const customer=enrich(id,[]).insurances[0];assert.deepEqual(customer.addOnIds,[]);assert.equal(customer.importantTerms.some(t=>rentalKeys.includes(t.key)),false);
 }
});
for(const id of ids)test('R-051-DOCUMENT '+id+': values, choice/rejection/unknown/conflict and full source-only provenance retained without inferred addon',()=>{
 for(const key of keys)for(const values of [['Dokumentert kundevilkår 13 000 kr'],['Valgt'],['Ikke valgt'],['Ukjent'],['Valgt','Ikke valgt']]){
  const out=enrich(id,values.map(v=>term(key,v))),i=out.insurances[0],ts=i.importantTerms.filter(t=>t.key===key);assert.deepEqual(i.addOnIds,[]);
  const sentinelFallback=values.length===1&&values[0]==='Ukjent'&&!key.startsWith('hus.utleie.');
  const expectedValues=sentinelFallback?[oracle[key].value]:values;assert.deepEqual(ts.map(t=>t.value),expectedValues);for(const t of ts){assert.equal(t.coverageOrigin,sentinelFallback?'catalog':'document');assert.deepEqual(t.source,sentinelFallback?expectedSources(key)[0]:customerSource);if(sentinelFallback)assert.deepEqual(t.sources,expectedSources(key));else assert.equal(Object.hasOwn(t,'sources'),false);}
  const row=groupTerms(groupInsurances(out.insurances,out.insurances,null)[0],null).find(r=>r.key===key);assert.ok(row);const missingSentinel=values.length===1&&values[0]==='Ukjent'&&key.startsWith('hus.utleie.');assert.equal(row.firstValueCount,missingSentinel?0:values.length);assert.equal(row.first,row.second);if(missingSentinel)assert.equal(row.first,null);assert.deepEqual(row.firstSources,missingSentinel?[]:sentinelFallback?expectedSources(key):[customerSource]);
  if(key==='hus.brukstap.dekning'&&['Valgt','Ikke valgt'].includes(values[0])){assert.equal(row.firstCoverage.status,values.length===2?'unknown':values[0]==='Valgt'?'selected':'not_selected');assert.equal(row.firstCoverage.conflict,values.length===2);}
  const again=enrichExtractedAgreementWithCatalog(out,date).insurances[0];assert.deepEqual(again.importantTerms.filter(t=>t.key===key).map(t=>t.value),expectedValues);assert.deepEqual(again.addOnIds,[]);
 }
});

test('R-051-COMPARISON: same product, both directions, exact states/content/sources and provider isolation',()=>{
 for(const a of ids)for(const b of [...ids,'if-hus-basis','storebrand-hus-standard']){
  const forward=rows(a,b),reverse=rows(b,a);if(a===b)assert.equal(compareCatalogProducts(product(a),product(b)).differenceCount,0);
  for(const key of keys){const f=forward.find(r=>r.key===key),r=reverse.find(r=>r.key===key);assert.ok(f);assert.ok(r);assert.deepEqual(f.first,r.second);assert.deepEqual(f.second,r.first);assert.equal(f.first.state,key.startsWith('hus.utleie.')?'optional':'included');assert.ok(f.first.text.includes(oracle[key].value));assert.deepEqual(f.first.sources,expectedSources(key).map(s=>({...s,sourceType:undefined})));if(!ids.includes(b))assert.equal(f.second.sources.some(s=>s.documentId==='gjensidigeHusStandard'),false);}
 }
});

test('R-051-CUSTOMER-COMPARISON: separate document priorities survive both directions and retain conflicts',()=>{
 for(const id of ids)for(const key of keys){const customer=enrich(id,[term(key,'Kundevilkår 13 000 kr')]),catalog={insuranceData:{insurances:[manual(id,[rental])]}};
  for(const [a,b,customerSide] of [[customer.insurances,catalog.insuranceData.insurances,'first'],[catalog.insuranceData.insurances,customer.insurances,'second']]){const row=groupTerms(groupInsurances(a,b,null)[0],null).find(r=>r.key===key);assert.ok(row);assert.equal(row[customerSide],'Kundevilkår 13 000 kr');assert.deepEqual(row[customerSide+'Sources'],[customerSource]);}
 }
});

test('R-051-SCOPE: exact provider/type/version/ordinary identities; no new components/addons/sources',()=>{
 for(const id of ids){const p=product(id);assert.equal(findCatalogProduct('gjensidige',id,p.version,{agreementScope:'ordinary',insuranceType:'Hus'}),p);for(const context of [{insuranceType:'Innbo'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('gjensidige',id,p.version,context),null);assert.equal(findCatalogProduct('gjensidige',id,'2026-10-06',{insuranceType:'Hus'}),null);}
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.equal(resolveCatalogFacts(p,[],date).some(f=>f.source.documentId==='gjensidigeHusStandard'),false,p.productId);
});
