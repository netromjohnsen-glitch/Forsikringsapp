import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFParse} from 'pdf-parse';
import {getPath} from 'pdf-parse/worker';
import {catalogAgreementScope} from '../lib/agreement-scope.ts';
import {productCatalog,availableAddOns,findCatalogProduct} from '../lib/product-catalog.ts';
import {compareCatalogProducts,materializeCatalogProduct} from '../lib/catalog-product-comparison.ts';
import {canonicalCoverage} from '../lib/coverage-status.ts';
import {product,facts,fact,sourceHash,date,enrich,manual,documentPriority} from './helpers/wave3-catalog-gate.mjs';

// Authorized DATA-SPLIT only. e2f70dda0093e9e4 and SR-038 remain OPEN.
// Own Kasko PDF says sudden external influence; no unverified named-peril list.
const ids=['gjensidige-tilhenger-delkasko','gjensidige-tilhenger-kasko'];
const files=['gjensidige-tilhenger-delkasko-alminnelige-vilkar.pdf','gjensidige-tilhenger-kasko-alminnelige-vilkar.pdf'];
const hashes=['9154b1ee38457ccf602854819c21fea4374c7265172a6d39bbd28775299209fc','2c2f5b4a59d6dbe6564257319224d841e065eada4dab5f9c04ee05c6c3413328'];
const bindings=[['3d4ee18bb6b094da','GAP-2707','SF-3832',0],['3d4ee18bb6b094da','GAP-2722','SF-3852',1],['45971367d5d25145','GAP-2709','SF-3835',0],['45971367d5d25145','GAP-2724','SF-3855',1],['555c0ff7d7901126','GAP-2710','SF-3836',0],['555c0ff7d7901126','GAP-2725','SF-3856',1],['673b26b43f1be200','GAP-2727','SF-3858',1]];
const own=(id,key)=>fact(id,'tilhenger.'+key);
const check=(f,patterns)=>{for(const p of patterns)assert.match(f.value,p);return f;};
function dimension(sig,id){
 if(sig==='3d4ee18bb6b094da')return[check(own(id,'brann.dekning'),[/Brann med åpne flammer, lynnedslag og eksplosjon/,/Offentlig standardegenandel 4 000 kr/,/kundens forsikringsbevis går foran/]),check(own(id,'tyveri.dekning'),[/Tyveri og forsøk på tyveri av tilhengeren/,/Offentlig standardegenandel 4 000 kr/,/kundens forsikringsbevis går foran/])];
 if(sig==='45971367d5d25145')return[check(own(id,'redning.dekning'),[/hjemtransport av tilhengeren ved avbrutt reise/,/ulykke, sykdom eller død hos fører eller passasjerer/,/funnet igjen etter tyveri/,/ikke kan repareres innen to virkedager/,/Hjemtransporten erstattes bare når tilhengeren er ferdig reparert eller gjenfunnet/])];
 if(sig==='555c0ff7d7901126')return[check(own(id,'redning.dekning'),[/Merutgifter begrenses til tilhengerens verdi/,/hjemreise eller planlagt reise/,/reparasjon og deler/,/videresending av gods/,/hjemtransport utover rimeligste kommunikasjonsmiddel/,/garantiordninger knyttet til tilhengeren/,/importør, selger eller reparatør er ansvarlig for etter lov, forskrift, garanti eller reklamasjonsrett/,/Ikke hjemtransport dersom fører eller passasjer kan kjøre hjem/,/trekkvognens veihjelpsforsikring i annet selskap/])];
 assert.equal(sig,'673b26b43f1be200');const f=check(own(id,'kasko.dekning'),[/Skade på tilhengeren som følge av plutselig ytre påvirkning/,/Offentlig standardegenandel 6 000 kr/,/kundens forsikringsbevis går foran/]);assert.doesNotMatch(f.value,/velt|hærverk|utforkjøring|kollisjon/);return[f];
}
for(const[sig,gap,sf,tier]of bindings)test('R-057-'+sig+': '+gap+'/'+sf+' exact own-source dimensions',()=>{for(const f of dimension(sig,ids[tier])){assert.equal(f.source.documentId,'vehicle:'+files[tier]);assert.equal(f.source.filename,files[tier]);assert.equal(f.source.page,2);assert.ok(f.source.section);assert.equal(f.source.effectiveFrom,'');assert.equal(f.qualificationSource,undefined);if(sig==='555c0ff7d7901126'&&tier===1)assert.match(f.source.section,/fortsatt side 3/);}});

test('R-057-SOURCE: own originals, control HTML, exact four signatures/seven bindings',async()=>{
 for(let i=0;i<2;i++)sourceHash('catalog/sources/vehicle-extensions/'+files[i],hashes[i]);
 sourceHash('catalog/sources/vehicle-extensions/gjensidige-tilhengerforsikring.html','516d76e88532d1319c9d390c107a70ba284335ea1f6f480e927fd57799dfb883');
 const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-057');
 assert.deepEqual(batch.signature_ids.filter(s=>s!=='e2f70dda0093e9e4').sort(),[...new Set(bindings.map(b=>b[0]))].sort());
 assert.deepEqual(batch.dependencies,[]);assert.deepEqual(batch.P2_piggyback_signatures,[]);
 const expected=batch.evidence.filter(e=>e.finding_ids.some(g=>bindings.some(b=>b[1]===g))).flatMap(e=>e.finding_ids.map((g,i)=>[g,e.source_fact_ids[i],JSON.parse(e.product_identities[i]??e.product_identity)[3]]));
 assert.deepEqual(expected.sort(),bindings.map(([,g,s,t])=>[g,s,ids[t]]).sort());assert.equal(expected.length,7);
 PDFParse.setWorker(getPath());for(let tier=0;tier<2;tier++){const parser=new PDFParse({data:readFileSync(new URL('../catalog/sources/vehicle-extensions/'+files[tier],import.meta.url))});try{const pdf=await parser.getText(),text=pdf.pages[1].text.replace(/\s+/g,' ');
 assert.match(text,/Brann med åpne flammer, lynnedslag og eksplosjon/);assert.match(text,/Tyveri og forsøk på tyveri/);
 assert.match(text,/to virkedager/);assert.match(text,/Hjemtransporten[\s\S]{0,600}ferdig[\s\S]{0,200}reparert eller gjenfunnet/);
 assert.match(pdf.pages[0].text,/4 000/);if(tier===1){assert.match(text,/Skade på hengeren som følge av plutselig ytre påvirkning/);assert.match(pdf.pages[0].text,/6 000/);}
 }finally{await parser.destroy();}}
});

const PCs=[[1031,0,'tier'],[1032,0,'geography'],[1033,0,'liability'],[1034,0,'newvalue'],[1035,0,'admin'],[1036,1,'tier'],[1037,1,'geography'],[1038,1,'liability'],[1039,1,'newvalue'],[1040,1,'admin']];
for(const[pc,tier,kind]of PCs)test('R-057-PC-'+pc+': source-control meaning retained',()=>{const id=ids[tier],p=product(id),rows=facts(id);assert.equal(p.providerId,'gjensidige');assert.equal(p.insuranceType,'Tilhenger');assert.equal(catalogAgreementScope(p),'ordinary');assert.equal(p.version,null);
 if(kind==='tier'){for(const k of ['brann','tyveri','redning'])assert.ok(rows.some(f=>f.key==='tilhenger.'+k+'.dekning'));assert.equal(rows.some(f=>f.key==='tilhenger.kasko.dekning'),tier===1);}
 if(kind==='geography')assert.equal(own(id,'avtale.geografi').value,'Europa unntatt Kosovo, Russland og Belarus');
 if(kind==='liability')assert.ok(rows.every(f=>!/^tilhenger\.(ansvar|ulykke|rettshjelp)\./.test(f.key)));
 if(kind==='newvalue')assert.ok(rows.every(f=>!/^tilhenger\.(nyverdi|leasing|kjorelengde)\./.test(f.key)));
 if(kind==='admin')assert.ok(rows.every(f=>!/^tilhenger\.(administrasjon|klage|fornyelse|personvern|premie)\./.test(f.key)));
});

test('R-057-STATE: base inclusion without selecting rental or public example values',()=>{for(let tier=0;tier<2;tier++){const id=ids[tier],out=enrich(id,[]),m=materializeCatalogProduct(product(id));
 for(const k of ['brann','tyveri','redning',...(tier===1?['kasko']:[])]){assert.equal(canonicalCoverage(out,'Tilhenger','tilhenger.'+k+'.dekning').status,'selected');assert.equal(m.facts.find(f=>f.key==='tilhenger.'+k+'.dekning').state,'included');}
 assert.deepEqual(out.addOnIds,[]);assert.deepEqual(availableAddOns(product(id),date),[]);assert.equal(out.annualPremium,null);assert.equal(out.deductible,null);assert.ok(facts(id).every(f=>!f.key.includes('utleie')));}
 const row=compareCatalogProducts(product(ids[0]),product(ids[1])).sections.flatMap(s=>s.rows).find(r=>r.key==='tilhenger.kasko.dekning');assert.equal(row.first.state,'unknown');assert.equal(row.second.state,'included');
});
test('R-057-PRIORITY: explicit customer values and declines outrank every changed parent',()=>{for(let tier=0;tier<2;tier++)for(const key of ['brann','tyveri','redning',...(tier===1?['kasko']:[])]){const id=ids[tier],k='tilhenger.'+key+'.dekning';documentPriority(id,k,'Kundens dokumenterte vilkår og egenandel 2 777 kr');documentPriority(id,k,'Ikke valgt');assert.equal(canonicalCoverage(enrich(id,[{name:fact(id,k).label,canonicalKey:k,value:'Ikke valgt'}]),'Tilhenger',k).status,'not_selected');}});
test('R-057-COMPARE: source values and states, own product and both directions',()=>{const peers=productCatalog.products.filter(p=>p.insuranceType==='Tilhenger'&&catalogAgreementScope(p)==='ordinary');assert.ok(ids.every(id=>peers.some(p=>p.productId===id)));for(const id of ids)for(const peer of peers){const p=product(id),a=compareCatalogProducts(p,peer),b=compareCatalogProducts(peer,p);for(const row of a.sections.flatMap(s=>s.rows)){const rev=b.sections.flatMap(s=>s.rows).find(r=>r.key===row.key);assert.ok(rev);assert.deepEqual(row.first,rev.second);assert.deepEqual(row.second,rev.first);if(peer.productId===id)assert.equal(row.different,false);}for(const f of facts(id)){const row=a.sections.flatMap(s=>s.rows).find(r=>r.key===f.key);assert.ok(row);assert.ok(row.first.facts.some(t=>t.value===f.value));}}});
test('R-057-PROVENANCE: exact source identities retained through every converter',()=>{for(const id of ids)for(const f of facts(id)){for(const out of [enrich(id,[]),manual(id)]){const t=out.importantTerms.find(t=>t.key===f.key);assert.ok(t);assert.equal(t.value,f.value);assert.ok(t.sources.some(s=>Object.entries(f.source).every(([k,v])=>k==='note'?s.note.includes(v):s[k]===v)));}const t=materializeCatalogProduct(product(id)).facts.find(t=>t.key===f.key);assert.equal(t.sources.length,1);const{sourceType,...source}=t.sources[0];void sourceType;assert.deepEqual(source,f.source);}});
test('R-057-SCOPE: exact family/provider/scope/version, excluded dimension remains unimplemented',()=>{for(const id of ids){const p=product(id);
 for(const overrides of [{insuranceType:'Campingvogn',agreementScope:'ordinary'},{insuranceType:'Tilhenger',agreementScope:'nito'}])assert.equal(findCatalogProduct(p.providerId,id,null,overrides),null);
 assert.equal(findCatalogProduct('if',id,null,{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);
 assert.equal(findCatalogProduct(p.providerId,id,'invented',{insuranceType:'Tilhenger',agreementScope:'ordinary'}),null);
 assert.ok(facts(id).every(f=>f.key.startsWith('tilhenger.')));assert.ok(facts(id).every(f=>f.source.documentId==='vehicle:'+files[ids.indexOf(id)]));
 assert.doesNotMatch(own(id,'redning.dekning').value,/750|utelåsing|driftsstans|tauing|på vei|kjørbar før|hjelp hjemme/);
 assert.ok(facts(id).every(f=>!f.key.endsWith('.egenandel')&&!f.key.includes('utleie')));
 }
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>!files.some(file=>f.source.documentId==='vehicle:'+file)));
});
