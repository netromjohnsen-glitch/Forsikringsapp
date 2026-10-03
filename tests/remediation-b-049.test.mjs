import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,availableAddOns,findCatalogProduct,catalogProductIdentity} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {vehicleObjectCoverageMatrix} from '../lib/vehicle-object-catalog.ts';
import {product,facts,fact,sourceHash,date,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// G1-SG01 DATA-SPLIT: RC-025/SCRC-033. The road/home source conflict
// 26668a6c81e5b5d9 (SC-029/SR-028) is deliberately not resolved.
const ids=['gjensidige-campingvogn-delkasko','gjensidige-campingvogn-kasko','gjensidige-campingvogn-pluss'];
const files=['gjensidige-Campingvogn-Delkasko-alminnelige-vilkar.pdf','gjensidige-Campingvogn-Kasko-alminnelige-vilkar.pdf','gjensidige-Campingvogn-Pluss-alminnelige-vilkar.pdf','gjensidige-campingvognforsikring.html'];
const hashes=['aac62443966b522b04903f765eb31376b8a48cddd39d14781d447bcaa82677de','fb61c6696cbf3a12067cef1b71f73b6562c37495151268fe769d4520b7ac4194','129827ede6156025a74dae49392e2744eebff0d0e42a30a08e9b1449859365ca','4f30c8c2a2dabd6425c61bba12513a824c6a2ac4d24a206a261d4f45b3c278a8'];
const signatures=['101b925147dfac6f','2ebfe0a8f3dfd17a','2f258ae6616c209a','30897f426f9132f0','601282f1d7c0e9ee','70e9f182bad07f6b','9e40aabb7ed11744','ac4a7af1869fc04d','c475a2402d80d7a1','d2b2cade925b8bae','d99b0aa4bb221490'];
// Independent original-source dimensions, not expectations copied from new rows.
// signature, [GAP,SF,tier], source role, canonical leaves tested below.
const bindings=[
 ['101b925147dfac6f',[[2640,3750,0],[2660,3775,1],[2682,3802,2]],'pdf'],
 ['d2b2cade925b8bae',[[2641,3751,0],[2661,3776,1],[2683,3803,2]],'pdf'],
 ['2ebfe0a8f3dfd17a',[[2642,3752,0],[2662,3777,1],[2684,3804,2]],'web'],
 ['30897f426f9132f0',[[2646,3757,0]],'pdf'],
 ['601282f1d7c0e9ee',[[2650,3762,0],[2672,3789,1],[2697,3819,2]],'pdf'],
 ['2f258ae6616c209a',[[2651,3763,0],[2673,3790,1],[2698,3820,2]],'pdf'],
 ['ac4a7af1869fc04d',[[2665,3781,1],[2687,3808,2]],'pdf'],
 ['d99b0aa4bb221490',[[2667,3783,1],[2689,3810,2]],'web'],
 ['70e9f182bad07f6b',[[2668,3784,1],[2690,3811,2]],'pdf+web'],
 ['c475a2402d80d7a1',[[2692,3813,2]],'pdf'],
 ['9e40aabb7ed11744',[[2693,3814,2]],'pdf'],
];
const own=(id,key)=>fact(id,'campingvogn.'+key);
const check=(f,patterns)=>{for(const pattern of patterns)assert.match(f.value,pattern);return f;};
function dimension(signature,tier){const id=ids[tier];switch(signature){
 case '101b925147dfac6f':return [check(own(id,'brann.dekning'),[/åpne flammer/,/lynnedslag/,/eksplosjon/,/6 000 kr/,/forsikringsbevis går foran/]),check(own(id,'tyveri.dekning'),[/Tyveri og forsøk på tyveri/,/campingvognen/,/6 000 kr/,/forsikringsbevis går foran/])];
 case 'd2b2cade925b8bae':return [check(own(id,'utstyr.dekning'),[/Fastmontert ekstrautstyr/,/skade som dekkes av valgt produktnivå/,/Fortelt omfattes ikke/,/egen utvidelse/]),check(own(id,'utstyr.grense'),[/Ubegrenset sum/,/fastmontert ekstrautstyr/,/fortelt\/tilbygg/,/separat avtalt sum/,/egen utvidelse/])];
 case '2ebfe0a8f3dfd17a':return [check(own(id,'losore.dekning'),[/Personlige ting i campingvognen/,/hendelser som dekkes av valgt produktnivå/,/fortelt\/tilbygg når dette er medforsikret/]),check(own(id,'losore.grense'),[tier===2?/50 000 kr/:/10 000 kr/,/basisdekningen/,/Høyere sum kan avtales/,/kontakt med Gjensidige/,/tillegg i prisen/,/kundens forsikringsbevis/])];
 case '30897f426f9132f0':{const f=check(own(id,'naturskade.dekning'),[/flom eller andre naturskader/,/unntatt fra Delkasko/]);assert.equal(f.coverageAvailability,'unavailable');return[f];}
 case '601282f1d7c0e9ee':{const f=check(own(id,'redning.dekning'),[/hjemtransport av campingvognen/,/avbrutt reise/,/ulykke, sykdom eller død/,/fører eller passasjerer i trekkvogna/,/funnet igjen etter tyveri/,/eller ikke kan repareres innen to virkedager/]);assert.doesNotMatch(f.value,/tilhengertransport|først etter reparert|hjemtransport først etter reparasjon/i);return[f];}
 case '2f258ae6616c209a':return[check(own(id,'redning.dekning'),[/campingvognens verdi/,/Ikke utgifter som hadde påløpt ved hjemreise eller planlagt reise/,/reparasjon og deler/,/videresending av gods/,/importør, selger eller reparatør/,/lov, forskrift, garanti eller reklamasjonsrett/,/Ikke hjemtransport dersom fører eller passasjer kan kjøre hjem/,/utgifter som kan kreves gjennom trekkvognas veihjelpsforsikring i annet selskap/,/Hastighetsløp/,/opplæring til førerkort/])];
 case 'ac4a7af1869fc04d':return[check(own(id,'glass.dekning'),[/campingvognens ruter og takluker/,/reparasjon dekkes inntil 1 000 kr uten egenandel/,/skifte har 3 000 kr i egenandel/,/Solcellepanel dekkes som kaskoskade, ikke som glasskade/])];
 case 'd99b0aa4bb221490':return[check(own(id,'naturskade.dekning'),[/flom, storm eller skred/,/Kasko og Pluss/]),check(own(id,'naturskade.egenandel'),[/summen kunden velger/,/6 000 til 12 000 kr/,/offentlige standard er 8 000 kr/,/flomskader.*20 000 kr/,/Kundens forsikringsbevis går foran/])];
 case '70e9f182bad07f6b':{const f=check(own(id,'kasko.dekning'),[/campingvognen/,/plutselig ytre påvirkning/,/fortelt\/tilbygg dersom dette er medforsikret/,/6 000 til 12 000 kr/,/kundens valg må fremgå av forsikringsbeviset/]);assert.equal(f.qualificationSource.documentId,'vehicle:'+files[3]);assert.equal(f.qualificationSource.page,1);assert.match(f.qualificationSource.section,/egenandelen.*6 000–12 000 kr/);return[f];}
 case 'c475a2402d80d7a1':return[check(own(id,'fukt.dekning'),[/vegger, tak og gulv/,/alder og fuktighetstest/]),check(own(id,'fukt.alder'),[/Ikke eldre enn 15 år fra produksjonsdato/]),check(own(id,'fukt.begrensning'),[/uten anmerkninger/,/forhandler eller campingvognverksted/,/mindre enn ett år før skaden oppdages/,/konstatert i forsikringstiden/])];
 case '9e40aabb7ed11744':return[check(own(id,'ferie.dekning'),[/etter en dekket skade/,/ikke kan benyttes/,/planlagt ferie med varighet over 6 dager/,/dokumenterte utgifter/,/leie av campingvogn, hotell eller lignende/,/utlån eller utleie erstattes ikke/]),check(own(id,'ferie.grense'),[/1 500 kr per dag/,/inntil 14 dager/])];
 default:assert.fail(signature);
}}
for(const [signature,rows,role]of bindings)for(const [gap,sf,tier]of rows)test(`R-049-${signature}: GAP-${gap} / SF-${sf} own-source dimensions`,()=>{
 const list=dimension(signature,tier);for(const f of list){assert.equal(f.source.documentId,'vehicle:'+files[role==='web'?3:tier]);assert.ok(f.source.section);assert.ok(f.source.page>=1&&f.source.page<=4);assert.equal(f.source.effectiveFrom,'');assert.ok(!f.source.documentId.includes('MOT07'));}
});

test('R-049-SOURCE: four frozen hashes, exact narrowed signature/occurrence set and source roles',async()=>{
 for(let i=0;i<files.length;i++)sourceHash('catalog/sources/vehicle-extensions/'+files[i],hashes[i]);
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-049');
 assert.deepEqual(batch.signature_ids.filter(s=>s!=='26668a6c81e5b5d9').sort(),signatures);
 assert.equal(bindings.flatMap(b=>b[1]).length,24);assert.deepEqual(batch.dependencies,[]);assert.deepEqual(batch.root_cause_ids,['RC-025']);assert.deepEqual(batch.original_root_cause_ids,['SCRC-033']);assert.deepEqual(batch.P2_piggyback_signatures,[]);
 const actual=batch.evidence.flatMap(e=>e.finding_ids.map((gap,i)=>[gap,e.source_fact_ids[i],JSON.parse(e.product_identities[i]??e.product_identity)[3]])).filter(([gap])=>!['GAP-2649','GAP-2671','GAP-2696'].includes(gap));
 assert.deepEqual(actual.sort(),bindings.flatMap(b=>b[1].map(([g,s,t])=>['GAP-'+g,'SF-'+s,ids[t]])).sort());
 PDFParse.setWorker(getPath());for(let tier=0;tier<3;tier++){const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+files[tier],import.meta.url))});try{const pdf=await parser.getText();const p1=pdf.pages[0].text.replace(/\s+/g,' ');assert.match(p1,/6 000/);assert.match(p1,/Fastmontert ekstrautstyr med ubegrenset sum/);const text=pdf.text.replace(/\s+/g,' ');assert.match(text,/hjemtransport av campingvognen når den er funnet igjen etter tyveri, eller ikke kan repareres innen to virkedager/);assert.match(text,/Fortelt dekkes ikke som fastmontert ekstrautstyr, men krever egen utvidelse/);if(tier===0)assert.match(text,/Skader som følge av flom eller andre naturskader/);else{assert.match(text,/plutselig ytre påvirkning/);assert.match(text,/Skade på solcellepanel dekkes ikke som glasskade, men som kaskoskade/);}if(tier===2){assert.match(text,/15 år regnet fra vognens produksjonsdato/);assert.match(text,/mindre enn 1 år før skaden oppdages/);assert.match(text,/ferie med varighet over 6 dager/);}}finally{await parser.destroy();}}
});

for(let tier=0;tier<3;tier++)for(let control=0;control<5;control++)test(`R-049-PC-${1016+tier*5+control}: source-bound positive control`,()=>{
 const id=ids[tier],p=product(id),out=enrich(id,[]);assert.equal(p.providerId,'gjensidige');assert.equal(p.insuranceType,'Campingvogn');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,null);
 if(control===0){assert.match(own(id,'brann.dekning').value,/Brann/);assert.equal(facts(id).some(f=>f.key==='campingvogn.kasko.dekning'),tier!==0);assert.equal(facts(id).some(f=>f.key==='campingvogn.fukt.dekning'),tier===2);}
 if(control===1){assert.equal(own(id,'avtale.geografi').value,'Mobil bruk: Europa. Fast sted: Norge, Sverige, Danmark og Finland');assert.equal(own(id,'avtale.geografi').source.documentId,'vehicle:'+files[tier]);}
 if(control===2){assert.match(own(id,'fortelt.begrensning').value,/egen avtalt utvidelse og sum/);assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.fortelt.dekning').status,'unknown');assert.deepEqual(out.addOnIds,[]);assert.equal(out.importantTerms.some(t=>/15 000/.test(t.value)),false);}
 if(control===3)assert.ok(facts(id).every(f=>!f.key.startsWith('campingvogn.ansvar.')));
 if(control===4)assert.ok(facts(id).every(f=>!/^campingvogn\.(?:administrasjon|klage|personvern|fornyelse)\./.test(f.key)));
});

test('R-049-STATUS: base levels, unavailable nature and absent Kasko remain distinct',()=>{
 for(let i=0;i<ids.length;i++){const id=ids[i],out=enrich(id,[]),m=materializeCatalogProduct(product(id));assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.naturskade.dekning').status,i===0?'not_selected':'selected');assert.equal(m.facts.find(f=>f.key==='campingvogn.naturskade.dekning').state,i===0?'unavailable':'included');assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.losore.dekning').status,'selected');assert.deepEqual(availableAddOns(product(id),date),[]);assert.equal(out.deductible,null);assert.equal(out.annualPremium,null);assert.equal(out.importantTerms.some(t=>t.key==='campingvogn.kasko.egenandel'),false);if(i!==2)assert.ok(facts(id).every(f=>!/^campingvogn\.(fukt|ferie)\./.test(f.key)));}
 assert.equal(vehicleObjectCoverageMatrix[ids[0]]['campingvogn.naturskade.dekning'],'not_included');assert.equal(vehicleObjectCoverageMatrix[ids[0]]['campingvogn.kasko.dekning'],'not_included');
 const row=compareCatalogProducts(product(ids[0]),product(ids[1])).sections.flatMap(s=>s.rows).find(r=>r.key==='campingvogn.kasko.dekning');assert.equal(row.first.state,'unknown');assert.equal(row.second.state,'included');
});

test('R-049-PROVENANCE: both Kasko sources remain exact in customer/manual/product/comparison',()=>{
 for(const id of ids.slice(1)){const f=own(id,'kasko.dekning'),refs=[f.source,f.qualificationSource];const out=enrich(id,[]);for(const obj of [out,manual(id)]){const t=obj.importantTerms.find(t=>t.key===f.key);assert.equal(t.value,f.value);for(const ref of refs)assert.ok(t.sources.some(s=>Object.entries(ref).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)));assert.equal(canonicalCoverage(obj,'Campingvogn',f.key).status,'selected');assert.equal(canonicalCoverage(obj,'Campingvogn','campingvogn.fortelt.dekning').status,'unknown');}
 const result=compareCatalogProducts(product(id),product(id));const row=result.sections.flatMap(s=>s.rows).find(r=>r.key===f.key);assert.equal(row.first.sources.length,2);assert.deepEqual(row.first.sources.map(({sourceType:_type,...s})=>s),refs);assert.equal(row.different,false);}
});

test('R-049-PRIORITY: documented values and explicit rejection override source-backed catalog',()=>{
 for(const id of ids){documentPriority(id,'campingvogn.losore.grense','Kundens dokumenterte sum 27 777 kr');documentPriority(id,'campingvogn.brann.dekning','Ikke valgt');const out=enrich(id,[{name:'Brann',canonicalKey:'campingvogn.brann.dekning',value:'Ikke valgt'}]);assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.brann.dekning').status,'not_selected');assert.equal(canonicalCoverage(out,'Campingvogn','campingvogn.fortelt.dekning').status,'unknown');}
 for(const id of ids.slice(1))documentPriority(id,'campingvogn.naturskade.egenandel','Kundens avtalte egenandel 9 111 kr');
});

test('R-049-COMPARE: every relevant Campingvogn peer, same product and both directions',()=>{
 const peers=productCatalog.products.filter(p=>p.insuranceType==='Campingvogn'&&catalogAgreementScope(p)==='ordinary');assert.ok(ids.every(id=>peers.some(p=>p.productId===id)));for(const id of ids)for(const peer of peers){const p=product(id),a=compareCatalogProducts(p,peer),b=compareCatalogProducts(peer,p);for(const r of a.sections.flatMap(s=>s.rows)){const reverse=b.sections.flatMap(s=>s.rows).find(x=>x.key===r.key);assert.ok(reverse);assert.deepEqual(r.first,reverse.second);assert.deepEqual(r.second,reverse.first);if(catalogProductIdentity(p)===catalogProductIdentity(peer))assert.equal(r.different,false);}for(const f of facts(id)){const r=a.sections.flatMap(s=>s.rows).find(r=>r.key===f.key);assert.ok(r);assert.ok(r.first.facts.some(t=>t.value===f.value));}}
});

test('R-049-SCOPE: provider/type/scope/version and held dimensions stay isolated',()=>{
 for(const id of ids){const p=product(id);assert.equal(findCatalogProduct('if',id,p.version,{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct(p.providerId,id,'invented-version',{insuranceType:'Campingvogn',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct(p.providerId,id,p.version,{insuranceType:'Snøscooter',agreementScope:'ordinary'}),null);assert.equal(findCatalogProduct(p.providerId,id,p.version,{insuranceType:'Campingvogn',agreementScope:'nito'}),null);
 assert.doesNotMatch(own(id,'redning.dekning').value,/750|hjemmehjelp|på vei og var kjørbar|nærmeste verksted/);}
 assert.equal(own(ids[0],'glass.dekning').value,'Inkludert i produktnivået');assert.equal(own(ids[0],'glass.dekning').source.section,'Hvilke skader/utgifter');
 for(const p of productCatalog.products.filter(p=>p.providerId!=='gjensidige'||p.insuranceType!=='Campingvogn'))assert.ok(facts(p.productId).every(f=>!f.source.documentId.includes('gjensidige-Campingvogn')&&f.qualificationSource?.documentId!=='vehicle:'+files[3]));
});
