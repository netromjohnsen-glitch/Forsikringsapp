import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeInsuranceType, normalizeTermName } from '../lib/insurance-normalization.ts';
import { normalizeDocumentFacts } from '../lib/document-fact-normalization.ts';
import { parseExtractionResponse, canonicalDocumentFactKeys } from '../lib/analysis-output.ts';
import { mcBobilFactKeysForType } from '../lib/mc-bobil-registry.ts';
import { canonicalCoverage } from '../lib/coverage-status.ts';

const policy = (type, terms) => ({ type, productName: 'Syntetisk produkt', canonicalProductName: null,
  annualPremium: null, deductible: null, coverageSummary: null, addOns: [], importantTerms: terms });
const term = (name, value, canonicalKey = null) => ({ name, value, canonicalKey });
const normalize = (type, terms) => normalizeDocumentFacts(policy(type, terms));
const value = (terms, key) => terms.filter(t => t.key === key).map(t => t.value);

for(const type of ['Bil','Hus','Innbo','Reise','Snøscooter','Campingvogn','Tilhenger']) {
  test(`${type}: new MC/Bobil enum keys never become foreign canonical facts`,()=>{
    const result=normalize(type,[term('Syntetisk dokumentfelt','Hele teksten bevares','mc.kjoreutstyr.grense'),
      term('Annet dokumentfelt','Også denne teksten bevares','bobil.fukt.alder')]);
    assert.ok(result.every(t=>!t.key?.startsWith('mc.')&&!t.key?.startsWith('bobil.')));
    assert.ok(result.some(t=>t.value==='Hele teksten bevares'));
    assert.ok(result.some(t=>t.value==='Også denne teksten bevares'));
  });
}

test('MC/Bobil exact type aliases stay distinct from other vehicles', () => {
  for (const alias of ['MC', 'MC-forsikring', 'Motorsykkel', 'Motorsykkelforsikring']) assert.equal(normalizeInsuranceType(alias), 'mc');
  for (const alias of ['Bobil', 'Bobilforsikring']) assert.equal(normalizeInsuranceType(alias), 'bobil');
  assert.equal(normalizeInsuranceType('Motorvogn', { productName: 'MC Kasko' }), 'mc');
  assert.equal(normalizeInsuranceType('Motorvogn', { productName: 'Bobil Super' }), 'bobil');
  assert.equal(new Set(['Bil','MC','Bobil','Campingvogn','Snøscooter','Tilhenger','ATV','Moped'].map(t => normalizeInsuranceType(t))).size, 8);
});
for (const [type, label, key] of [
  ['MC','Kjøreutstyr forsikringssum','mc.kjoreutstyr.grense'],
  ['MC','Bagasje forsikringssum','mc.bagasje.grense'],
  ['MC','Hjelm egenandel','mc.hjelm.egenandel'],
  ['MC','Leie-MC antall dager','mc.leiekjoretoy.dager'],
  ['MC','Motor- og girskade kilometergrense','maskinskade.km'],
  ['Bobil','Fukt aldersgrense','bobil.fukt.alder'],
  ['Bobil','Fukt fuktkontroll','bobil.fukt.kontroll'],
  ['Bobil','Fortelt forsikringssum','bobil.fortelt.grense'],
  ['Bobil','Personlige eiendeler forsikringssum','bobil.losore.grense'],
  ['Bobil','Ferieavbrudd antall dager','bobil.ferieavbrudd.dager'],
  ['Bobil','Feriegaranti antall dager','bobil.feriegaranti.dager'],
  ['Bobil','Leiebil antall dager','leiebil.dager'],
]) test(`exact typed alias ${type}: ${label}`, () => {
  assert.equal(normalizeTermName(label, { insuranceType: type }), key);
  assert.deepEqual(value(normalize(type, [term(label, 'Syntetisk dokumentverdi')]), key), ['Syntetisk dokumentverdi']);
});
for (const type of ['MC', 'Bobil']) {
  test(`${type}: rejected compound grammar retains explicit canonical identity`,()=>{
    const raw='Et ukjent dokumentformat: 4 år og 33 000 km';
    const result=normalize(type,[term('Dokumentert grense',raw,'nyverdi.km')]);
    assert.deepEqual(value(result,'nyverdi.km'),[raw]);
    assert.deepEqual(normalizeDocumentFacts(policy(type,result)),result);
  });
  for (const raw of ['Kan tegnes inntil 5 år og 100 000 km','Kan bestilles før 8 år og 130 000 km',
    'Ved tegning: under 8 år og 120 000 km','Kjøretøyet er 4 år og har kjørt 80 000 km']) {
    test(`${type}: no expiry derived from eligibility or actual object numbers: ${raw}`,()=>{
      const result=normalize(type,[term('Maskinskade',raw)]);
      assert.deepEqual(value(result,'maskinskade.alder'),[]);assert.deepEqual(value(result,'maskinskade.km'),[]);
      assert.deepEqual(value(result,'maskinskade.dekning'),[raw]);
    });
  }
  test(`${type}: exact renewal qualifier survives compound split and repeated normalization`,()=>{
    const raw='Til første hovedforfall etter at bobilen har blitt 15 år eller 200 000 km';
    const result=normalize(type,[term('Maskinskade',raw)]);
    assert.deepEqual(value(result,'maskinskade.alder'),['Til første hovedforfall etter at bobilen har blitt 15 år']);
    assert.deepEqual(value(result,'maskinskade.km'),['200 000 km']);
    assert.deepEqual(normalizeDocumentFacts(policy(type,result)),result);
  });
  for(const key of ['maskinskade.alder','maskinskade.km'])test(`${type}: compound in ${key} is not a competing child value`,()=>{
    const result=normalize(type,[term('Dokumentert grense','Inntil 9 år eller 175 000 km',key)]);
    assert.deepEqual(value(result,'maskinskade.alder'),['Inntil 9 år']);
    assert.deepEqual(value(result,'maskinskade.km'),['175 000 km']);
    assert.deepEqual(value(result,'maskinskade.varighet'),['Inntil 9 år eller 175 000 km']);
    assert.deepEqual(normalizeDocumentFacts(policy(type,result)),result);
  });
  test(`${type}: precise mileage labels repair wrong canonical keys without numeric heuristics`, () => {
    const actual = normalize(type, [term('Årlig kjørelengde','18 000 km','nyverdi.km'),
      term('Kilometerstand','134 567 km','maskinskade.km'),
      term('Avtalt maksimal kilometerstand','153 000 km','nyverdi.km'),
      term('Maskinskade kilometergrense','170 000 km','nyverdi.km'),
      term('Totalskadegaranti kilometergrense','27 000 km','maskinskade.km')]);
    for (const [key, expected] of [['kjoretoy.kjorelengde','18 000 km'],['kjoretoy.kilometerstand','134 567 km'],
      ['kjoretoy.avtalt_maks_kilometerstand','153 000 km'],['maskinskade.km','170 000 km'],['nyverdi.km','27 000 km']])
      assert.deepEqual(value(actual,key),[expected]);
  });
  test(`${type}: repeated normalization preserves established canonical identities and source`, () => {
    const source = { documentId:'pdf:existing:0',filename:'Syntetisk',page:1,section:'Syntetisk',termsNumber:'',effectiveFrom:'' };
    const first = normalize(type, [{...term('Dokumentert grense','19 000 km','nyverdi.km'),source}]);
    const second = normalizeDocumentFacts(policy(type, first));
    assert.deepEqual(second,first);
  });
  test(`${type}: maskinskade deductible interval is not coverage km`, () => {
    const result=normalize(type,[term('Maskinskade egenandel 90 000–129 999 km','6 000 kr','maskinskade.km'),
      term('Maskinskade kilometergrense','210 000 km')]);
    assert.deepEqual(value(result,'maskinskade.km'),['210 000 km']);
    assert.deepEqual(value(result,'maskinskade.egenandel.90000-129999'),['6 000 kr']);
  });
  test(`${type}: compound limit uses own clause, excluding sibling deductible and annual mileage`, () => {
    const result=normalize(type,[term('Maskinskade','Inntil 9 år eller 175 000 km. Egenandel 90 000–119 999 km: 8 000 kr. Årlig kjørelengde 22 000 km.')]);
    assert.deepEqual(value(result,'maskinskade.alder'),['Inntil 9 år']);
    assert.deepEqual(value(result,'maskinskade.km'),['175 000 km']);
    assert.deepEqual(value(result,'kjoretoy.kjorelengde'),[]);
    assert.deepEqual(value(result,'nyverdi.km'),[]);
  });
  test(`${type}: purchase limits cannot become expiry limits`, () => {
    const result=normalize(type,[term('Maskinskade','Kan kjøpes før 7 år og 130 000 km. Egenandel 8 000 kr.')]);
    assert.deepEqual(value(result,'maskinskade.km'),[]);assert.deepEqual(value(result,'maskinskade.alder'),[]);
  });
  test(`${type}: ambiguous multiple expiry numbers are retained without invented children`, () => {
    const raw='Inntil 7 år eller 9 år, og 140 000 km eller 175 000 km.';
    const result=normalize(type,[term('Maskinskade',raw)]);
    assert.deepEqual(value(result,'maskinskade.dekning'),[raw]);assert.deepEqual(value(result,'maskinskade.km'),[]);
  });
  test(`${type}: optional selected/not selected/unknown stay distinct`, () => {
    for(const [text,expected] of [['Valgt','selected'],['Ikke valgt','not_selected'],['Ikke dokumentert','unknown']]) {
      const p=policy(type,[]);p.importantTerms=normalize(type,[term('Motor- og girskade',text)]);
      assert.equal(canonicalCoverage(p,type,'maskinskade.dekning').status,expected);
    }
    assert.equal(canonicalCoverage(policy(type,[]),type,'maskinskade.dekning').status,'unknown');
  });
}
test('Bobil precise family repairs contradictory bobil.* key; amount does not determine identity',()=>{
  const actual=normalize('Bobil',[term('Fortelt forsikringssum','42 000 kr','bobil.fukt.alder'),
    term('Fukt egenandel','42 000 kr','bobil.fortelt.grense'),term('Feriegaranti antall dager','12 dager','leiebil.dager')]);
  assert.deepEqual(value(actual,'bobil.fortelt.grense'),['42 000 kr']);
  assert.deepEqual(value(actual,'bobil.fukt.egenandel'),['42 000 kr']);
  assert.deepEqual(value(actual,'bobil.feriegaranti.dager'),['12 dager']);
  assert.deepEqual(value(actual,'leiebil.dager'),[]);
});
test('MC/Bobil source-specific fact identities cannot leak through a wrong-type extraction key',()=>{
  for(const [type,key] of [['MC','bobil.fukt.alder'],['Bobil','mc.kjoreutstyr.grense'],['MC','campingvogn.fukt.alder'],['Bobil','leasing.startleie']]) {
    assert.ok(normalize(type,[term('Syntetisk ukjent vilkår','9000',key)]).every(t=>t.key!==key));
  }
  for(const type of ['Bil','MC']) assert.notEqual(normalizeTermName('Fukt fuktkontroll',{insuranceType:type}),'bobil.fukt.kontroll');
});
test('extraction schema accepts typed facts without new model calls and rejects arbitrary keys',()=>{
  assert.equal(new Set(canonicalDocumentFactKeys).size,canonicalDocumentFactKeys.length);
  const raw=policy('Bobil',[term('Fukt aldersgrense','13 år','bobil.fukt.alder')]);
  const parse=p=>parseExtractionResponse({output_text:JSON.stringify({company:'Syntetisk',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:[p]})});
  assert.equal(parse(raw).insurances[0].importantTerms[0].canonicalKey,'bobil.fukt.alder');
  assert.throws(()=>parse({...raw,importantTerms:[term('Ukjent','x','bobil.secret')]}));
  assert.ok(mcBobilFactKeysForType('MC').length===0,'registry receives canonical type IDs only');
});
