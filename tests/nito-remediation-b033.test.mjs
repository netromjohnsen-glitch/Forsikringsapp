import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productCatalog,resolveCatalogFacts,availableAddOns} from '../lib/product-catalog.ts';
import {compareCatalogProducts} from '../lib/catalog-product-comparison.ts';
import {product,facts,fact,sourceHash,compareBoth,documentPriority,manual,date} from './helpers/wave3-catalog-gate.mjs';

// B-033 / RC-009 / SCRC-051 / RB-47: 48 P1 signatures, 134 own-source
// bindings across 16 ordinary Bil products. Cloud source/scope/reverse gates.
// The archived manifest enumerates identities; expected insurance meaning below
// comes from the five original PDFs, not catalog values or another provider.
const batch=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-033');
const ids=batch.products_affected.map(p=>JSON.parse(p)[3]);
const originals=[
 ['Vilkar_ansvar_bil.pdf','0e36f6bf5b484ca3d246d63dd701b7b76c9b6de4095a37be2c695ebc4edb5568'],
 ['Vilkar_Minikasko_Bil.pdf','8a85385f3899b450a9dcafd873fb8d6517d974908c7196590f429ec3b2a3d818'],
 ['Vilkar_Kasko_Bil.pdf','87696e04484ca2d3e98b2e62c070b1886b8eae6bd8206c6b029eb80a3693a739'],
 ['Vilkar_Toppkasko_Bil.pdf','cc9af96bd2f91dffe76dced3d58481007d3036ba452e695f4f2b4a9489e01781'],
 ['Vilkar_maskinskade.pdf','0ad5c24b9dca610189dfcd9f10ee6a56a37fa977ed4b1da00a1725baa05d63db'],
];
const oracles={
 's2–3FMO002':fs=>{const f=fs.find(f=>f.key==='ulykke.omfang');assert.ok(f);assert.match(f.value,/i, på eller utenfor kjøretøyet.*kjøretøyet er direkte årsak/);assert.match(f.value,/Sykdom.*besvimelse, forgiftning.*sovemidler, smertestillende eller narkotiske midler/);assert.match(f.value,/unntakene for forgiftning og disse midlene gjelder ikke barn under 16 år/);assert.equal(f.coverageAvailability,'included');assert.equal(f.source.documentId,'sp1Ulykke');assert.equal(f.source.page,2);},
 's4–5§4–5':fs=>{const f=fs.find(f=>f.key==='rettshjelp.grense');assert.ok(f);assert.match(f.value,/økonomiske interesse, maksimalt 100 000 kr per tvist.*kan utvides til 250 000 kr ved minst tre parter.*ektefeller\/samboere regnes som én part/);assert.match(f.value,/Finansklagenemnda: inntil 15 000 kr; forliksråd\/jordskifterett: inntil 25 000 kr.*ikke er oppnevnt av retten: inntil 20 % av forsikringssummen.*utgifter godkjent.*på forhånd/);assert.equal(f.source.documentId,'sp1Rettshjelp');assert.equal(f.source.page,5);assert.match(f.source.section,/4\.1–4\.2 side 4/);},
 's4§1.3':fs=>{const f=fs.find(f=>f.key==='bagasje.grense');assert.ok(f);assert.equal(f.value,'Inntil 20 000 kr i bilen; penger, gavekort, verdipapirer, smykker og klokker er unntatt');assert.equal(f.source.documentId,'sp1Delkasko');assert.equal(f.source.page,4);},
 's4§2.2':fs=>{const f=fs.find(f=>f.key==='tyveri.dekning');assert.ok(f);assert.match(f.value,/Tyveri, tyveriforsøk og hærverk.*husstand eller ansatt sjåfør.*unntatt fra tyveribegrepet.*Underslag ved prøvekjøring.*selges gjennom offentlig tilgjengelige annonsemedier/);assert.equal(f.source.documentId,'sp1Delkasko');assert.equal(f.source.page,4);},
 's4§2.3;s6§3.5':fs=>{const f=fs.find(f=>f.key==='glass.dekning');assert.ok(f);assert.match(f.value,/Reparasjon eller skifte av rute, glasstak og takluke ved bruddskade; solcellepanel er unntatt.*Ved skifte.*50 % av bilens markedsverdi/);assert.equal(f.source.page,4);assert.match(f.source.section,/3\.5 side 6/);},
 's5§2.4.1':fs=>{const f=fs.find(f=>f.key==='veihjelp.dekning');assert.ok(f);assert.match(f.value,/rimeligste kommunikasjonsmiddel til bosted.*fører\/passasjer.*ulykkestilfelle, plutselig sykdom eller død.*hindrer fortsatt reise/);assert.match(f.value,/dekket skade eller upåregnelig driftsstopp.*trafikksikker stand innen rimelig tid.*stjålet og ikke kommet til rette innen rimelig tid/);assert.match(f.value,/Etter sikredes ønske.*videre reise.*bestemmelsesstedet.*rimeligere enn hjemreise/);assert.equal(f.source.page,5);},
 's6§3.2.2':fs=>{const f=fs.find(f=>f.key==='nyverdi.unntak');assert.ok(f);assert.match(f.value,/Ny bil.*gjelder ikke leaset bil.*Startleie.*forholdsmessig nedskrevet etter gjenstående leiemåneder.*innen 1 år.*fabrikkny.*ikke kjørt over 15 000 km.*over 80 %.*skadedagen.*listepris uten rabatter eller spesialpris/);assert.equal(f.source.documentId,'sp1Delkasko');assert.equal(f.source.page,6);},
 's6§3.3':fs=>{const f=fs.find(f=>f.key==='reparasjon.garanti');assert.ok(f);assert.match(f.value,/8 år.*privatbil inntil 3 500 kg.*avtaleverksted.*glass og slitasjedeler er unntatt/);assert.match(f.value,/etter 01.01.2023.*fra dagen bilen utleveres fra verkstedet.*Leiebil ved garantireparasjon: inntil 600 kr per dag i inntil 45 dager.*veihjelp etter gjeldende vilkår/);assert.match(f.value,/til både verkstedet og Fremtind.*innen to måneder.*mangel er oppdaget/);assert.equal(f.source.page,6);},
 's6§3.4':fs=>{const f=fs.find(f=>f.key==='tyveri.dekning');assert.ok(f);assert.match(f.value,/ikke er kommet til rette etter 21 dager.*markedsverdien på skadedagen.*bare stjålet nøkkel.*ny nøkkel, programmering og omkoding.*hensiktsmessig som et skadeforebyggende tiltak/);assert.match(f.source.section,/3\.4 side 6/);},
 's8§1.1':fs=>{const f=fs.find(f=>f.key==='kasko.dekning');assert.ok(f);assert.match(f.value,/Sammenstøt, utforkjøring, velting, feilfylling.*plutselig ytre påvirkning.*Maskinskade og leiebil er separate valgfrie dekninger/);assert.match(f.value,/Slitasje, gradvis utviklet skade, frost.*visste eller burde vite.*ulovlig terrengkjøring.*avsperret område.*autorisert trafikkskole.*førerutviklingskurs forhåndsgodkjent/);assert.match(f.value,/Utleieskade.*unntatt med mindre forsikringsbeviset.*drosje, budbil eller annen næringsvirksomhet/);assert.equal(f.source.documentId,'sp1Kasko');assert.equal(f.source.page,8);},
 's1§1.1':fs=>{const f=fs.find(f=>f.key==='maskinskade.dekning'),el=fs.find(f=>f.key==='maskinskade.el');assert.ok(f);assert.ok(el);for(const part of ['motorblokk','topplokk','ventiler','kamaksel','turbo','wastegate','coil','innsprøytningssystem','EGR','vannpumpe','startmotor','dynamo','lambdasonde','NOX-sensor','AdBlue','dobbeltmasse','slavesylinder','vinkeldrev','uten mansjetter','girvelger','servopumpe'])assert.ok(f.value.includes(part),part);assert.match(f.value,/Tilfeldig og plutselig skade.*oppregnede komponenter/);for(const part of ['Høyvoltsbatteri','DC/DC','strømveksler','fabrikkmontert batterilader','el-motor og dens girkasse','høyvoltsbatteri','stillmotor','PTC-varmer','AC/klimakompressor'])assert.ok(el.value.includes(part),part);assert.match(el.value,/der den har kjøle- og\/eller varmefunksjon mot høyvoltsbatteri/);for(const row of [f,el]){assert.equal(row.source.documentId,'sp1Maskinskade');assert.equal(row.source.page,1);}},
 's9§2.1':fs=>{const f=fs.find(f=>f.key==='nyverdi.unntak');assert.ok(f);assert.match(f.value,/Ny bil.*gjelder ikke leaset bil.*Startleie.*gjenstående leiemåneder.*innen 3 år.*fabrikkny.*ikke kjørt over 100 000 km.*over 80 %.*skadedagen.*listepris uten rabatter eller spesialpris/);assert.equal(f.source.documentId,'sp1Toppkasko');assert.equal(f.source.page,9);},
};
test('R-033-01: frozen originals, exact sixteen product identities, 48P1/134 bindings',()=>{
 for(const [name,hash] of originals)sourceHash('catalog/sources/sparebank1-fremtind/'+name,hash);
 assert.equal(batch.signature_ids.length,48);assert.equal(batch.P2_piggyback_signatures.length,0);assert.equal(batch.evidence.flatMap(e=>e.finding_ids).length,134);assert.equal(ids.length,16);
 for(const identity of batch.products_affected){const [provider,type,scope,id,version]=JSON.parse(identity),p=product(id);assert.equal(p.providerId,provider);assert.equal(p.insuranceType.toLowerCase(),type);assert.equal(p.agreementScope??'ordinary',scope);assert.equal(p.version,version);}
});
for(const e of batch.evidence)for(const [i,identity] of e.product_identities.entries()){
 const id=JSON.parse(identity)[3];
 test(`R-033-source: ${e.finding_ids[i]}/${e.source_fact_ids[i]} ${id} ${e.component||'base'}`,()=>{
  const selected=resolveCatalogFacts(product(id),e.component?[e.component]:[],date,e.component.startsWith('fremtind-sb1-')?'SpareBank 1':null);
  assert.ok(oracles[e.location],e.location);oracles[e.location](selected);
  for(const key of e.proposed_existing_keys){const f=selected.find(f=>f.key===key);assert.ok(f,key);assert.equal(productCatalog.sources[f.source.documentId].sha256,e.sha256);assert.equal(f.source.url,e.urls[0]);}
 });
}
test('R-033-02: nearest tiers, inherited source refinements and optional boundaries unchanged',()=>{
 for(const id of ids){const p=product(id),base=facts(id);assert.ok(base.every(f=>!f.key.startsWith('maskinskade.')&&!f.key.startsWith('leiebil.')));
  if(id.endsWith('ansvar')){assert.ok(base.every(f=>!['bagasje.grense','tyveri.dekning','glass.dekning','veihjelp.dekning','nyverdi.unntak','kasko.dekning'].includes(f.key)));assert.equal(availableAddOns(p,date).length,0);}
  if(id.endsWith('delkasko')){assert.ok(base.every(f=>!f.key.startsWith('kasko.')));assert.equal(availableAddOns(p,date).length,0);}
  if(id.endsWith('kasko')&&!id.endsWith('toppkasko'))assert.match(fact(id,'nyverdi.unntak').value,/innen 1 år.*15 000 km/);
  if(/topp(?:kasko)?$/.test(id))assert.match(fact(id,'nyverdi.unntak').value,/innen 3 år.*100 000 km/);
 }
});
test('R-033-03: source-bound same-product and both directions across channels and competitor',()=>{
 for(const id of ids){const keys=['ulykke.omfang','rettshjelp.grense',...(id.endsWith('ansvar')?[]:['bagasje.grense','tyveri.dekning','glass.dekning','veihjelp.dekning','reparasjon.garanti'])];compareBoth(id,['frende-bil-kasko','dnb-bil-topp'],keys);}
});
test('R-033-04: silent machine/rental optional, including conditional rental inside repair guarantee',()=>{
 for(const id of ids.filter(id=>/kasko$|topp$/.test(id)&&!id.endsWith('delkasko'))){const out=manual(id);assert.equal(out.addOnIds.length,0);assert.equal(out.annualPremium,null);
  const rows=compareCatalogProducts(product(id),product(id)).sections.flatMap(s=>s.rows);for(const key of ['maskinskade.dekning','leiebil.dager']){const r=rows.find(r=>r.key===key);assert.ok(r,key);assert.equal(r.first.state,'optional');assert.equal(r.second.state,'optional');assert.equal(r.different,false);}}
});
test('R-033-05: customer facts and explicit rejection win over the richer source-bound catalog',()=>{
 for(const id of ids){documentPriority(id,'rettshjelp.grense','88 888 kr');if(!id.endsWith('ansvar')){documentPriority(id,'tyveri.dekning','Ikke valgt');documentPriority(id,'reparasjon.garanti','Dokumentert særvilkår: 4 år');}}
});
test('R-033-06: held-out PC-1884 onwards retain sums, geography, deductibles and optional caps',()=>{
 for(const id of ids){assert.match(fact(id,'ulykke.invaliditet').value,/200 000 kr/);assert.match(fact(id,'ulykke.invaliditet.barn').value,/under 20.*1 000 000/);assert.match(fact(id,'ulykke.dod').value,/100 000.*under 20.*50 000/);assert.match(fact(id,'rettshjelp.egenandel').value,/forsikringsbeviset.*20 %/);assert.equal(fact(id,'geografi.dekning').value,'Europa, unntatt Tyrkia, Kosovo, Russland og Belarus');
  if(!id.endsWith('ansvar'))assert.equal(fact(id,'brann.dekning').value,'Brann, lynnedslag og eksplosjon');
  if(/kasko$|topp$/.test(id)&&!id.endsWith('delkasko')){assert.match(fact(id,'kasko.egenandel.ung').value,/12 000/);assert.match(fact(id,'kasko.egenandel.dyr').value,/2 000/);for(const a of availableAddOns(product(id),date)){const fs=resolveCatalogFacts(product(id),[a.id],date);if(a.id.includes('maskinskade')){assert.match(fs.find(f=>f.key==='maskinskade.alder').value,/første hovedforfall.*10 år/);assert.match(fs.find(f=>f.key==='maskinskade.km').value,/200 000/);assert.equal(fs.find(f=>f.key==='maskinskade.egenandel.0-99999').value,'10 000 kr');}else{assert.match(fs.find(f=>f.key==='leiebil.dager').value,/45 dager/);assert.match(fs.find(f=>f.key==='leiebil.dagsgrense').value,/600 kr/);}}}
 }
});
test('R-033-07: no non-Bil product or other provider acquires these Bil components',()=>{
 for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>!['sp1Ulykke','sp1Rettshjelp','sp1Delkasko','sp1Kasko','sp1Toppkasko','sp1Maskinskade'].includes(f.source.documentId)));
});
