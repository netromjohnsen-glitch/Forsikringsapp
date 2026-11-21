import assert from "node:assert/strict";
import test from "node:test";
import { marketProductCatalog as market } from "../lib/market-product-catalog.ts";
import { productCatalog as raw, availableAddOns, resolveCatalogFacts } from "../lib/product-catalog.ts";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";

const asOf = new Date("2026-11-20");

function product(id,catalog=market) {
  const entry = catalog.products.find(p=>p.productId===id);
  assert.ok(entry,id);
  return entry;
}
function facts(id,catalog=market){
  return materializeCatalogProduct(product(id,catalog),catalog).facts;
}
function fact(id,key,catalog=market){
  const matches = facts(id,catalog).filter(entry=>entry.key===key);
  assert.equal(matches.length,1,id+"/"+key);
  return matches[0];
}
function row(first,second,key){
  const matches = compareCatalogProducts(product(first),product(second),market)
    .sections.flatMap(section=>section.rows).filter(entry=>entry.key===key);
  assert.equal(matches.length,1,key);
  return matches[0];
}

test("If Barn grounds both 4 G exceptions and inherited services in exact BAF pages", () => {
  for (const level of ["standard","super"]) {
    const id = "if-person-barn-"+level;
    const prefix = "person.barn.";
    const payout = fact(id,prefix+"diagnose");
    assert.match(payout.value,/4 G.*andre alvorlige sykdommer og skader.*over 50 %.*24 timer.*én utbetaling per bokstavgruppe.*unntak for brannskade.*ingen ny utbetaling/u);
    assert.deepEqual(payout.sources.map(s=>s.page),[5,7]);
    assert.match(fact(id,prefix+"helserad").value,/Døgnåpen.*Barn over 16 år/u);
    const help = fact(id,prefix+"psykologisk_forstehjelp");
    assert.match(help.value,/Inntil 10 timer for barnet, foreldre eller søsken/u);
    assert.equal(help.sources[0].page,10);
    assert.equal(help.sources[0].documentId,level==="super"?"person:"+id+":barn":"person:"+id);
    assert.equal(fact(id,prefix+"diagnose.cystisk_fibrose").sources[0].page,6);
    assert.equal(fact(id,prefix+"uforepensjon").state,level==="super"?"included":"unavailable");
    assert.equal(row(id,"storebrand-person-barn-standard",prefix+"psykologisk_forstehjelp").second.state,"included");
    assert.ok(!facts(id,raw).some(f=>f.key===prefix+"psykologisk_forstehjelp"));
    assert.doesNotMatch(fact(id,prefix+"diagnose",raw).value,/over 50 %/u);
  }
});

test("Tryg child helpline is included and the guarantee remains attached to the Behandling selection", () => {
  const service = "person.barn.helserad";
  const key = "person.barn.behandling.garantikompensasjon";
  for (const level of ["ekstra","ulykke"]) {
    const id = "tryg-person-barn-"+level;
    const serviceFact=fact(id,service);
    assert.equal(serviceFact.state,"included");
    assert.match(serviceFact.value,/Tryg Legehjelp.*365 dager/u);
    assert.equal(serviceFact.sources[0].page,1);
    const parent=product(id);
    const addOn=availableAddOns(parent,asOf,null,market).find(a=>a.name==="Behandling");
    assert.ok(addOn);
    assert.ok(!resolveCatalogFacts(parent,[],asOf,null,market).some(f=>f.key===key));
    const selected = resolveCatalogFacts(parent,[addOn.id],asOf,null,market).find(f=>f.key===key);
    assert.ok(selected,addOn.id);
    assert.match(selected.value,/500 kr per dag.*14-virkedagersgarantien.*10 000 kr samlet/u);
    assert.deepEqual([selected.source.page,selected.qualificationSource.page],[6,1]);
    assert.equal(fact(id,key).state,"optional");
    assert.ok(!resolveCatalogFacts(product(id,raw),[addOn.id],asOf,null,raw).some(f=>f.key===key));
    assert.equal(row(id,"if-person-barn-standard",service).second.state,"included");
  }
  assert.equal(fact("tryg-person-barn-ulykke","person.barn.diagnose.cystisk_fibrose").state,"optional");
});

test("three Ulykke variants align mental invalidity separately from crisis and retain settlement terms", () => {
  const [ifId,gjId,trygId]=["if-person-ulykke","gjensidige-person-ulykke","tryg-person-ulykke"];
  const mental="person.ulykke.psykisk_invaliditet";
  const [a,b,c]=[fact(ifId,mental),fact(gjId,mental),fact(trygId,mental)];
  assert.deepEqual([a.state,b.state,c.state],["unavailable","included","included"]);
  assert.match(a.value,/ICD-10 F00–F99/u);
  assert.match(b.value,/samme ulykke.*fysisk skade.*erstatningsberettiget medisinsk invaliditet/u);
  assert.match(c.value,/PTSD.*ICD-10 F43\.1.*psykiater eller klinisk psykolog/u);
  assert.deepEqual([a,b,c].map(f=>f.sources[0].page),[6,2,1]);
  for(const [left,right] of [[ifId,gjId],[ifId,trygId],[gjId,trygId]]){
    assert.deepEqual(row(left,right,mental).first,row(right,left,mental).second);
    assert.equal(row(left,right,mental).conceptId,"ulykke.skade");
    assert.ok(!facts(left,raw).some(f=>f.key===mental));
  }
  const crisis=fact(ifId,"person.ulykke.krisehjelp");
  assert.match(crisis.value,/fører til forsikredes død.*ektefelle, samboer eller barn.*12 måneder/u);
  assert.deepEqual(crisis.sources.map(s=>s.page),[5,2]);
  const death=fact(trygId,"person.ulykke.dodsfall");
  assert.match(death.value,/skyldes ulykkesskaden.*ett år.*ikke allerede er utbetalt.*invaliditet.*faller da bort/u);
  assert.equal(death.sources[0].termsNumber,"UUL41502");
  const treatment=fact(gjId,"person.ulykke.utgifter");
  assert.match(treatment.value,/50 000 kr.*15 000 kr.*500 kr.*to år.*folketrygd.*Originalkvitteringer.*annet hold/u);
  assert.deepEqual(treatment.sources.map(s=>s.page),[2,8]);
  assert.doesNotMatch(treatment.value,/25 år/u);
  const dental=fact(gjId,"person.ulykke.utgifter.tannbehandling");
  assert.match(dental.value,/toårsfristen.*utgangen av kalenderåret.*25 år.*offentlige ikke dekker/u);
  assert.equal(dental.sources[0].page,8);
});

test("Godt voksen keeps 14-day stroke processing separate from 350 kr per day hospital cover", () => {
  const id="if-person-godt-voksen";
  assert.match(fact(id,"person.senior.utbetaling").value,/100 000 kr.*24 timer.*Én utbetaling per bokstavgruppe.*bare én/u);
  const stroke=fact(id,"person.senior.diagnose.hjerneslag");
  assert.match(stroke.value,/CT eller MR.*etter 14 dager.*nødvendig dokumentasjon/u);
  assert.deepEqual(stroke.sources.map(s=>s.page),[3,4]);
  assert.match(fact(id,"person.senior.sykehus").value,/350 kr per døgn.*90 døgn.*tre sammenhengende døgn/u);
  assert.ok(!facts(id,raw).some(f=>f.key===stroke.key));
});

test("both Liv products retain recipients and cite the pre-death separation/divorce exception", () => {
  const [a,b]=["frende-person-liv","fremtind-person-liv"];
  const key="person.liv.mottaker";
  const compared=row(a,b,key);
  for(const [id,side] of [[a,compared.first],[b,compared.second]]){
    assert.match(side.text,/ektefelle.*arvinger etter lov eller testament.*før dødsfallet.*separasjon eller skilsmisse.*ikke er rettskraftig eller endelig/u);
    assert.doesNotMatch(fact(id,key,raw).value,/separasjon eller skilsmisse/u);
  }
  assert.deepEqual([compared.first.sources[0].page,compared.second.sources[0].page],[2,1]);
  assert.match(fact(a,"person.liv.opphor").value,/hovedforfall.*80 år/u);
  assert.match(fact(b,"person.liv.opphor").value,/80 år ifølge produktarket/u);
});
