import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productCatalog,resolveCatalogFacts,availableAddOns} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {product,facts,fact,sourceHash,compareBoth,documentPriority,manual,date} from './helpers/wave3-catalog-gate.mjs';

// B-034 / RC-010 / SCRC-017 / RB-15: exact source-clear dimensions,
// preserving B-006 and leaving SC-012's disputed age operators unchanged.
const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-034');
const ids=batch.products_affected.map(p=>JSON.parse(p)[3]);
const checks=[
 fs=>{assert.equal(get(fs,'geografi.dekning').value,'Europa, unntatt Russland, Tyrkia og Belarus');assert.equal(get(fs,'geografi.rettshjelp').value,'Norden');},
 fs=>bonus(fs),
 fs=>{const f=get(fs,'ulykke.invaliditet');assert.match(f.value,/200 000 kr ved 100 %.*forholdsmessig.*delvis invaliditet.*maksimalt 100 %/);assert.match(f.value,/Tidligere nedsatt funksjon.*sykelig tilstand.*fradrag.*uten brukbar funksjon.*ikke invaliditetserstatning/);assert.match(f.value,/innen tre år.*treårsdagen/);assert.equal(f.source.page,10);},
 fs=>{assert.match(get(fs,'ansvar.dekning').value,/bilansvarslova.*ulovfestede.*konstatert i forsikringstiden.*10 000 000 kr per skadetilfelle og samlet per år.*vegfraktavtaler er unntatt/);},
 fs=>{assert.match(get(fs,'rettshjelp.dekning').value,/Privatkundens.*personlig eier.*bruker eller fører.*salgstvist.*opphørte.*nytt kjøp før egen forsikring.*forsikret i Frende ved kjøpet.*Alminnelige domstoler.*voldgift/);},
 fs=>{const f=get(fs,'rettshjelp.dekning');for(const s of ['egen advokat','rettshjelper','advokatmekler','sakkyndige','vitner','forliksråd og tingrett','Ankegebyr','idømte','sameiere','yrke/virksomhet','familie/arv/skifte','namsmyndigheter','inkasso','straffesak','ulovlig handling','Forvaltningsvedtak','fullt utnyttet klageadgang','før tvisten','før forsikringen'])assert.ok(f.value.includes(s),s);assert.equal(f.coverageAvailability,'included');},
 fs=>{assert.match(get(fs,'rettshjelp.grense').value,/100 000 kr per tvist.*250 000 kr.*minst tre parter.*økonomiske interesse/);},
 fs=>{const f=get(fs,'tilbehor.grense');assert.match(f.value,/lakk utover original lakk, lakkbeskyttelse og ny foliering av det skadede området/);assert.match(f.value,/20 000|50 000/);},
 fs=>{assert.match(get(fs,'brann.dekning').value,/brann eller lynnedslag.*svimerker.*delen eller komponenten der brann eller kortslutning oppstod.*unntatt.*følgeskaden er omfattet/);},
 fs=>{assert.match(get(fs,'tyveri.dekning').value,/Tyveri.*forsøk på tyveri.*husstand eller ansatte.*utlånt eller prøvekjørt og ikke tilbakelevert.*unntatt/);},
 fs=>{assert.match(get(fs,'veihjelp.dekning').value,/påkoblet tilhenger eller campingvogn til nærmeste verksted.*reparasjon på stedet når det er rimeligere.*motorstopp, punktering, tomt batteri, sykdom.*hvilken som helst annen årsak.*hindrer videre kjøring.*hjemme/);},
 fs=>deductibles(fs),
 fs=>bonus(fs),
 fs=>{assert.match(get(fs,'bilnokkel.dekning').value,/skadet, stjålet eller mistet.*avtalt egenandel på kasko.*Utvidet.*uten egenandel og bonustap/);assert.match(get(fs,'bilnokkel.dekning').source.section,/11.11 side 9/);},
 fs=>{assert.equal(get(fs,'nyverdi.alder').value,'Under 1 år');assert.equal(get(fs,'nyverdi.km').value,'Under 15 000 km');assert.match(get(fs,'nyverdi.skadegrad').value,/over 80 %/);assert.equal(get(fs,'nyverdi.unntak').value,'Gjelder ikke leaset bil; Frende kan velge kontantutbetaling for tilsvarende ny bil');assert.equal(get(fs,'nyverdi.unntak').source.page,8);},
 fs=>{assert.match(get(fs,'leiebil.bilklasse').value,/Klasse C.*valgt i forsikringsbeviset.*dekket brann-, tyveri-, kasko- eller maskinskade/);assert.equal(get(fs,'leiebil.bilklasse').source.page,4);},
 fs=>{assert.match(get(fs,'maskinskade.dekning').value,/Plutselig og uforutsett.*hindrer kjøring.*dekningen står i forsikringsbeviset.*serviceintervall.*ikke er chippet eller trimmet/);},
 fs=>{const f=get(fs,'maskinskade.dekning');for(const s of ['tenningslås','startmotor','dynamo','motor med topp/blokk','turbo','dieselpartikkelfilter','EGR','AdBlue','girkasse','drivakslinger','dobbeltmasse','slavesylinder','termostat','vannpumpe','radiator','varmeapparatregister','kupevifte','AC-kompressor','kupevarmer','Start/Stop','servo','multifunksjonsratt','luftfjæringskompressor','airbag','ABS/TCS','adaptive lykter','radar','infotainmentskjerm','elbilbatteri','drive-unit','ladekontakt','høyvoltbatteriets kjølesystem','høyvoltovervåking','koblingsenhet','elektroniske styreenheter'])assert.ok(f.value.includes(s),s);},
 fs=>{const f=fs.find(f=>f.key==='maskinskade.unntak'&&f.source.documentId==='frendeMaskinskade');assert.ok(f);for(const s of ['Skade og følgeskade','clutchlamell','bremser','lykter/pærer','12 V','hjullagre','drivakselmansjetter','bare på skadet side','knekt fjær','Gradvis slitasje/korrosjon','garanti','redusert batterikapasitet','Avvist garantikrav kan dekkes','Frende overtar kravet'])assert.ok(f.value.includes(s),s);assert.doesNotMatch(f.value,/leaset|leasing/);const ipid=fs.find(f=>f.key==='maskinskade.unntak'&&f.source.documentId==='frendeIpid');assert.ok(ipid);assert.match(ipid.value,/leaset bil/);assert.equal(ipid.source.page,2);},
 fs=>deductibles(fs),
];
function get(fs,key){const f=fs.find(f=>f.key===key);assert.ok(f,key);return f;}
function bonus(fs){const f=get(fs,'bonus.delkasko');for(const s of ['tyveri, brann, glass og veihjelp','ukjent kjøretøy','bestemt parkering i et avgrenset tidsrom','valgt maskinskade','Utvidet','dyr omgående meldt til politi eller viltnemnda','naturulykke etter naturskadeloven','utvider ikke produktets dekninger'])assert.ok(f.value.includes(s),s);assert.equal(f.source.page,10);}
function deductibles(fs){assert.equal(get(fs,'brann.egenandel').value,'6 000 kr med mindre lavere egenandel står i forsikringsbeviset');const f=get(fs,'tyveri.egenandel');assert.match(f.value,/6 000 kr.*lavere egenandel.*ingen egenandel hvis tyverialarm fungerte på skadetidspunktet/);for(const k of ['brann.egenandel','tyveri.egenandel'])assert.equal(get(fs,k).deductibleClassification,'standard');}
test('R-034-01: own hashes, exact 4 Bil identities, 20 signatures and 53 scoped bindings',()=>{
 sourceHash('catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf','088201db9b2f6071e81d24d716a74233176cd3694ac2be1a92e44be6952e8f88');sourceHash('catalog/sources/frende/IPID_Personbil.pdf','4c2dca2923583ba1d46dea924730335b064d8e94cd4cb1df544a520ed2683b8d');assert.equal(batch.signature_ids.length,20);assert.equal(batch.evidence.flatMap(e=>e.finding_ids).length,53);assert.equal(batch.P2_piggyback_signatures.length,0);
 for(const raw of batch.products_affected){const [provider,type,scope,id,version]=JSON.parse(raw),p=product(id);assert.equal(p.providerId,provider);assert.equal(p.insuranceType.toLowerCase(),type);assert.equal(p.agreementScope??'ordinary',scope);assert.equal(p.version,version);}
});
for(const [n,e] of batch.evidence.entries())for(const [i,raw] of e.product_identities.entries())test(`R-034-source: ${e.finding_ids[i]}/${e.source_fact_ids[i]} ${JSON.parse(raw)[3]}`,()=>{
 const fs=resolveCatalogFacts(product(JSON.parse(raw)[3]),e.component?[e.component]:[],date);checks[n](fs);
 const keys=n===1?['bonus.delkasko']:e.proposed_existing_keys;for(const key of keys){const f=get(fs,key);assert.equal(productCatalog.sources[f.source.documentId].sha256,e.sha256);assert.ok(e.urls.includes(f.source.url));}
});
test('R-034-02: preserve B-006 parking identity and nearest tier/optional boundaries',()=>{
 for(const id of ids){const base=facts(id);assert.ok(base.every(f=>!f.key.startsWith('maskinskade.')&&!f.key.startsWith('leiebil.')));if(/ansvar|delkasko/.test(id)){assert.equal(availableAddOns(product(id),date).length,0);assert.ok(!base.some(f=>f.key==='bonus.parkert'));}else{assert.equal(availableAddOns(product(id),date).length,2);assert.match(fact(id,'bonus.parkert').value,/ukjent kjøretøy.*står parkert.*bestemt parkering.*avgrenset tidsrom/);}}
 assert.deepEqual(fact('frende-bil-kasko','bonus.parkert'),fact('frende-bil-utvidet','bonus.parkert'));assert.equal(fact('frende-bil-utvidet','nyverdi.alder').value,'Under 3 år');assert.match(fact('frende-bil-utvidet','nyverdi.unntak').value,/ikke leaset bil.*tyveri/);
});
test('R-034-03: same product, reverse comparison, asymmetry and no bonus assertions in product API',()=>{
 for(const id of ids){compareBoth(id,['dnb-bil-topp'],['ansvar.dekning','ulykke.invaliditet','rettshjelp.dekning','rettshjelp.grense','geografi.rettshjelp',...(id.endsWith('ansvar')?[]:['brann.dekning','tyveri.dekning','veihjelp.dekning'])]);const rows=compareCatalogProducts(product(id),product(id)).sections.flatMap(s=>s.rows);assert.ok(rows.every(r=>!r.key.startsWith('bonus.')));if(/kasko|utvidet/.test(id)&&!id.endsWith('delkasko'))for(const key of ['maskinskade.dekning','leiebil.bilklasse']){const r=rows.find(r=>r.key===key);assert.ok(r);assert.equal(r.first.state,'optional');assert.equal(r.second.state,'optional');}}
});
test('R-034-04: document priority, explicit rejection and silent selection/premiums',()=>{
 for(const id of ids){documentPriority(id,'rettshjelp.grense','Avtalt 77 777 kr');documentPriority(id,'rettshjelp.dekning','Ikke valgt');if(!id.endsWith('ansvar'))documentPriority(id,'tyveri.egenandel','Avtalt 500 kr');const out=manual(id);assert.equal(out.addOnIds.length,0);assert.equal(out.annualPremium,null);}
});
test('R-034-05: held-out PC-0579–0614 meaning and disputed SC-012 values stay unchanged',()=>{
 for(const id of ids){assert.match(fact(id,'ulykke.dod').value,/100 000.*ektefelle, samboer eller barn.*under 21/);assert.equal(fact(id,'rettshjelp.egenandel').value,'4 000 kr pluss 20 % av øvrige kostnader');assert.ok(!facts(id).some(f=>/panthaver|administrasjon/.test(f.key)));if(!id.endsWith('ansvar')){assert.match(fact(id,'glass.dekning').value,/glasstak.*tilfeldig plutselig ytre/);assert.equal(fact(id,'glass.egenandel.bytte').value,'3 000 kr');assert.equal(fact(id,'glass.egenandel.reparasjon').value,'0 kr');assert.equal(fact(id,'veihjelp.egenandel').value,'750 kr');}}
 for(const id of ['frende-bil-kasko','frende-bil-utvidet']){const fs=resolveCatalogFacts(product(id),['frende-maskinskade','frende-leiebil'],date);assert.equal(get(fs,'maskinskade.alder').value,'Ut forsikringsåret bilen blir 12 år');assert.equal(get(fs,'maskinskade.km').value,'Inntil 200 000 km');for(const [k,v] of [['maskinskade.egenandel.0-99999','10 000 kr'],['maskinskade.egenandel.100000-149999','15 000 kr'],['maskinskade.egenandel.150000-200000','20 000 kr']])assert.equal(get(fs,k).value,v);assert.equal(get(fs,'leiebil.dager').value,'Hele reparasjonstiden uten fast daggrense');assert.equal(get(fs,'leiebil.kondemnasjon').value,'Inntil 31 dager');assert.equal(get(fs,'leiebil.kontant').value,'250 kr per dag i inntil 31 dager hvis leiebil ikke brukes');assert.match(get(fs,'kasko.dekning').value,/sammenstøt, utforkjøring, velt, hærverk og feilfylling/);assert.equal(get(fs,'bagasje.grense').value,id.endsWith('utvidet')?'Inntil 20 000 kr':'Inntil 10 000 kr');}
 assert.equal(fact('frende-bil-utvidet','bilnokkel.grense').value,'Inntil 20 000 kr uten egenandel og bonustap');assert.equal(fact('frende-bil-utvidet','ladekabel.dekning').value,'Skadet eller stjålet ladekabel uten egenandel og bonustap');assert.equal(fact('frende-bil-utvidet','leasing.startleie').value,'Forholdsmessig erstatning av resterende startleie ved totalskade eller tyveri');
});
test('R-034-06: no other provider/type/scope/version receives these Bil-only refinements',()=>{
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>!['frendeAnsvar','frendeDelkasko','frendeKasko','frendeUtvidet'].includes(f.source.documentId)));
});
