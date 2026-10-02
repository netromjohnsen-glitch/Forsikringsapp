import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { productCatalog, resolveCatalogFacts, availableAddOns, findCatalogProduct } from '../lib/product-catalog.ts';
import { compareCatalogProducts } from '../lib/catalog-product-comparison.ts';
import { enrichExtractedAgreementWithCatalog } from '../lib/catalog-enrichment.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';
import { product, facts, fact, date, sourceHash, documentPriority, manual } from './helpers/wave3-catalog-gate.mjs';

const ids=['frende-bat-brann-og-tyveri','frende-bat-kasko','frende-bat-utvidet'];
const sourceId='boat-pet:frende:båt';
const hash='272b9c86efaf39c30930b284fdadc49019d4e2f98ca13c2de426d0ec2f4f66d0';
const signatures=['0269141925857de7','03869197440768b4','0b2cb35f34b74837','151308b054600999','2592c13d72614038','26d05391ac658832','2f4bf5b9b96fa34e','41d3f3d5b1f7e81c','48ea935fb497494e','6e0088f510319d31','741711cbf120a2dc','7b73f956ed3a62e1','7c9d5fe0bbb7c656','8250d101fb2c2864','8b665b250a619f6b','9371f540421d419e','9499657835ae56a0','992d9a036f76127f','cb60396ca849bcbc','d27862ffbdc36ee4','e33a91941fcd3378','e392e38bad9d27e9','e5832e3f47b9b52f','e70b25cd3532f31d','e8dcfbfdccfdee28','f6e97fd9e37d6be2','f90da646f62c42ca'];
const scoped=(id,component,key)=>{
  const f=resolveCatalogFacts(product(id),component?[component]:[],date).find(f=>f.key===key);
  assert.ok(f,`${id}/${component}/${key}`);return f;
};
// Independent frozen source oracle. Each original dimension, its source page,
// exact level/component applicability and material qualifiers are asserted.
const oracle=[
  ['GAP-1156',ids,'','bat.geografi.omrade',2,['12 nautiske mil','Lindesnes–Hirtshals','Finskebukta','Bottenvika','1. mai–30. september','200 nautiske mil','Island, Storbritannia, Svalbard, Madeira, Azorene og Kanariøyene','Helårsutvidelse krever']],
  ['GAP-1157',ids.slice(0,2),'','bat.jolle.dekning',2,['10 fot','sammen med båten','10 hk']],
  ['GAP-1159',ids,'','bat.brann.begrensning',3,['Varmgang','følgeskade','Delen eller komponenten','kortslutning']],
  ['GAP-1160',ids,'','bat.tyveri.dekning',3,['forsøk på tyveri','midlertidig i land','avlåst bod','bare du']],
  ['GAP-1161',[ids[0]],'','bat.redning.dekning',3,['Bare ansvaret for bergelønn','kapittel 16','brann og tyveri']],
  ['GAP-1167',ids,'frende-bat-ulykke','bat.ulykke.dekning',8,['Valgfritt når oppført','fører, passasjerer og rettmessig bruker','plutselig ytre, uventet fysisk hendelse','sykdom, slag, illebefinnende']],
  ['GAP-1168',ids,'frende-bat-ulykke','bat.ulykke.dod',8,['100 000 kr','ektefelle, samboer eller barn','under 21 år','testament','§15-1']],
  ['GAP-1169',ids,'frende-bat-ulykke','bat.ulykke.invaliditet',8,['200 000 kr','100 %','forholdsmessig','innen tre år','treårsdagen','Tidligere redusert','Død før fastsatt']],
  ['GAP-1170',ids,'frende-bat-ulykke','bat.ulykke.begrensning',8,['røntgenpåvist ulykkesbrudd','selvmord','F43.1 PTSD','livsvarig','rus','motorsport']],
  ['GAP-1171',ids,'','bat.ansvar.grense',10,['Per hendelse','3 020 000 SDR','1 510 000 SDR','Ingen egenandel']],
  ['GAP-1172',ids,'','bat.ansvar.begrensning',9,['forsett','yrke','familien','minst 50 %','felleseie','lånte/brukte/oppbevarte','avtaleansvar','gradvise prosesser','forlist','5.3 nr. 4']],
  ['GAP-1173',ids,'','bat.rettshjelp.dekning',10,['Norden','personlig eier, rettmessig bruker eller fører','salg','kjøp av nytt','Samme tvist','Voldgift']],
  ['GAP-1174',ids,'','bat.rettshjelp.grense',11,['100 000 kr per tvist','250 000 kr','tre eller flere','økonomiske interessen','Uforsikrede parter']],
  ['GAP-1175',ids,'','bat.rettshjelp.begrensning',10,['egen advokat','rettshjelper','sakkyndige','vitner','Ikke ankegebyr','idømte','betalingsudyktig motpart','sameiere','familie/arv','ubestridt inkasso','straffesak','eget rettshjelpsavslag','før forsikringen']],
  ['GAP-1187',ids.slice(1),'','bat.redning.dekning',4,['bergelønn','10 %','offentlig pålegg']],
  ['GAP-1188',ids.slice(1),'','bat.kasko.dekning',3,['hærverk','sammenstøt','grunnstøting','stranding','kantring','synking','mast/bom','transport','boblehavn','mot betaling']],
  ['GAP-1189',ids.slice(1),'','bat.kasko.begrensning',3,['vind som bare skader seil','berøring med is','frost/is-sprengning/nedbør','betalt opplag','varmgang','drivstoff','5.2 c','Garanti','produksjons-','sjødyktig']],
  ['GAP-1190',ids.slice(1),'','bat.redning.dekning',4,['dekningsmessig båtskade','akutt sykdom, ulykke eller død','båtturen ikke kan fortsette']],
  ['GAP-1191',ids.slice(1),'','bat.redning.dekning',4,['nærmeste trygge havn','forhåndsgodkjent','verksted','vrakfjerning','10 %','offentlig pålegg','sykehus/lege','rimeligste hjemreise','avtalt hotell']],
  ['GAP-1192',ids.slice(1),'','bat.redning.geografi',2,['Norge og Sverige']],
  ['GAP-1193',ids.slice(1),'','bat.redning.egenandel',4,['750 kr']],
  ['GAP-1194',ids.slice(1),'frende-bat-maskinskade','bat.maskinskade.dekning',4,['Valgfritt når oppført','tilstoppet kjølesystem','dieseldyr','fremdriftsmotor, gir, aksling, styring, ror og drivstoffsystem','demontering','undersøkelse']],
  ['GAP-1195',ids.slice(1),'frende-bat-maskinskade','bat.maskinskade.begrensning',4,['Garanti er primær','overtar kravet','vedlikehold, frost, korrosjon','feilbruk','gradvis forringelse/utmatting','lettbåt eller ekstra motor']],
  ['GAP-1196',ids.slice(1),'frende-bat-maskinskade','bat.maskinskade.begrensning',4,['motorens/drivverkets markedsverdi','Udokumentert hendelsesdato regnes som meldedato']],
  ['GAP-1197',ids.slice(1),'frende-bat-maskinskade','bat.maskinskade.egenandel',7,['5 år 6 000 kr','6 år 10 % minst 7 000 kr','7 år 20 % minst 8 000 kr','8 år 30 % minst 9 000 kr','9 år 40 % minst 10 000 kr','10 år 50 % minst 11 000 kr','11 år 60 % minst 12 000 kr','12 år eller mer 70 % minst 13 000 kr']],
  ['GAP-1219',[ids[2]],'','bat.jolle.dekning',2,['10 fot','sammen med båten','10 hk']],
  ['GAP-1220',[ids[2]],'','bat.losore.grense',5,['50 000 kr på Utvidet','forsikringsbevis']],
];
for(const [gap,products,component,key,page,values] of oracle)test(`R-036-${gap}: own source, level, units and qualifications`,()=>{
  for(const id of products){const f=scoped(id,component,key);assert.equal(f.source.documentId,sourceId);assert.equal(f.source.page,page);
    assert.equal(f.source.version,'2026-01-01');assert.equal(f.source.agreementScope,'ordinary');
    assert.equal(f.source.url,'https://www.frende.no/forsikringer/batforsikring/');
    for(const value of values)assert.ok(f.value.includes(value),`${gap}/${id}: ${value}`);}
});
test('R-036-SOURCE: unchanged original and 27 signatures / 63 exact bindings',()=>{
  sourceHash('catalog/sources/boat-pet/frende-boat-terms.pdf',hash);
  assert.equal(productCatalog.sources[sourceId].sha256,hash);
  const b=JSON.parse(readFileSync(new URL('../docs/audit/legacy-local/source-catalog-remediation-triage/triage.json',import.meta.url))).batches.find(b=>b.batch_id==='B-036');
  assert.deepEqual(b.signature_ids,signatures);assert.equal(b.evidence.length,27);
  assert.equal(b.evidence.reduce((n,e)=>n+e.finding_ids.length,0),63);
  assert.deepEqual(oracle.map(o=>o[0]),b.evidence.map(e=>e.finding_id));
  for(const e of b.evidence){assert.equal(e.sha256,hash);for(const identity of e.product_identities){const [,type,scope,id,version]=JSON.parse(identity);assert.equal(type,'båt');assert.equal(scope,'ordinary');assert.equal(version,'2026-01-01');assert.ok(ids.includes(id));}}
});
test('R-036-LEVEL: limited fire salvage cannot acquire Kasko rescue/transport',()=>{
  const fs=facts(ids[0]);assert.ok(!fs.some(f=>['bat.kasko.dekning','bat.transport.dekning','bat.redning.grense','bat.redning.geografi','bat.redning.egenandel'].includes(f.key)));
  assert.match(fact(ids[0],'bat.redning.begrensning').value,/gir ikke redningstiltak eller hjemtransport/);
  for(const id of ids){assert.equal(fact(id,'bat.jolle.grense').value,'Inntil 20 000 kr totalt for jolle/gummibåt og tilhørende motor');assert.equal(new Set(facts(id).map(f=>f.key)).size,facts(id).length);}
});
test('R-036-LEVEL: base and extended transport, distinct contents sums',()=>{
  assert.equal(fact(ids[1],'bat.redning.grense').value,'Hjemtransport begrenset til båtens verdi på tidspunktet for hjemtransport');
  assert.equal(fact(ids[2],'bat.redning.grense').value,'Hjemtransport fra Norge/Sverige begrenset til båtens verdi; merutgifter fra andre land inntil 50 000 kr');
  assert.match(fact(ids[2],'bat.redning.geografi').value,/øvrig dokumentert fartsområde/);
  assert.equal(fact(ids[1],'bat.losore.grense').value,'10 000 kr dersom annen sum ikke står i forsikringsbeviset');
  assert.equal(fact(ids[1],'bat.redning.egenandel').deductibleClassification,'coverage');
  for(const id of ids)assert.equal(fact(id,'bat.rettshjelp.egenandel').value,'4 000 kr pluss 20 % av øvrige kostnader; én egenandel per tvist også ved flere parter på samme side');
});
const enriched=(id,terms=[])=>{const p=product(id);return enrichExtractedAgreementWithCatalog({company:'Frende',totalAnnualPremium:null,insurances:[{type:'Båt',company:'Frende',productName:p.name,agreementScope:'ordinary',annualPremium:null,deductible:null,coverageSummary:null,addOns:[],importantTerms:terms}]},date).insurances[0];};
test('R-036-OPTIONAL: availability never selects accident or machine; rejection preserved',()=>{
  for(const id of ids){const out=enriched(id);assert.equal(out.addOnIds.length,0);assert.equal(out.annualPremium,null);
    assert.equal(canonicalCoverage(out,'Båt','bat.ulykke.dekning').status,'unknown');
    assert.equal(canonicalCoverage(out,'Båt','bat.maskinskade.dekning').status,'unknown');
    const choices=availableAddOns(product(id),date).map(a=>a.id);assert.ok(choices.includes('frende-bat-ulykke'));
    assert.equal(choices.includes('frende-bat-maskinskade'),id!==ids[0]);
    for(const key of ['bat.ulykke.dekning','bat.maskinskade.dekning']){
      const negative=enriched(id,[{name:key,canonicalKey:key,value:'Ikke valgt'}]);
      assert.equal(canonicalCoverage(negative,'Båt',key).status,'not_selected');assert.equal(negative.addOnIds.length,0);
    }
    const m=manual(id);assert.equal(m.addOnIds.length,0);assert.equal(m.annualPremium,null);
  }
});
test('R-036-COMPARE: same product and both directions preserve optional states and source differences',()=>{
  const peers=productCatalog.products.filter(p=>p.insuranceType==='Båt'&&p.providerId!=='frende');
  for(const id of ids)for(const other of [product(id),...peers]){
    const a=compareCatalogProducts(product(id),other).sections.flatMap(s=>s.rows);
    const b=compareCatalogProducts(other,product(id)).sections.flatMap(s=>s.rows);
    for(const row of a){const inverse=b.find(r=>r.key===row.key);assert.ok(inverse);assert.deepEqual(row.first,inverse.second);assert.deepEqual(row.second,inverse.first);
      if(other.productId===id)assert.equal(row.different,false);
      if(row.key.startsWith('bat.ulykke.'))assert.equal(row.first.state,'optional');
      if(row.key.startsWith('bat.maskinskade.')&&id!==ids[0]){
        assert.equal(row.first.state,row.key==='bat.maskinskade.alder'?'unknown':'optional');
        if(row.key==='bat.maskinskade.alder')assert.deepEqual(row.first.facts,[]);
      }
    }
  }
});
test('R-036-DOCUMENT: explicit customer facts override all refined base facts',()=>{
  for(const id of ids)for(const f of facts(id))documentPriority(id,f.key,'Dokumentert avtalt særvilkår');
});
test('R-036-SCOPE: wrong provider/type/scope/version cannot resolve Frende Boat identities',()=>{
  for(const id of ids){assert.equal(product(id).version,'2026-01-01');
    assert.equal(findCatalogProduct('frende',id,'2026-01-01',{insuranceType:'Båt',agreementScope:'ordinary'}),product(id));
    for(const scope of [{insuranceType:'Bobil'},{agreementScope:'nito'}])assert.equal(findCatalogProduct('frende',id,'2026-01-01',scope),null);
    assert.equal(findCatalogProduct('if',id,'2026-01-01'),null);assert.equal(findCatalogProduct('frende',id,'unknown'),null);
  }
  for(const p of productCatalog.products.filter(p=>!ids.includes(p.productId)))assert.ok(facts(p.productId).every(f=>f.source.documentId!==sourceId));
});
