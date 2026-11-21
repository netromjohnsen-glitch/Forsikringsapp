import assert from "node:assert/strict";
import { test } from "node:test";
import { compareCatalogProducts, materializeCatalogProduct } from "../lib/catalog-product-comparison.ts";
import { marketProductCatalog } from "../lib/market-product-catalog.ts";
import { productCatalog } from "../lib/product-catalog.ts";
import { termsSourceHref } from "../lib/terms-archive.ts";

const barnSymptom = "person.barn.symptom";
const livExpiry = "person.liv.opphor";
const disabilityContinuation = "person.ufore.fortsettelse";
const disabilityReduction = "person.ufore.kapital.sum";
const accidentInvalidity = "person.ulykke.invaliditet";
const pregnancyScope = "person.gravid.hvem";
const healthHelp = "person.behandling.helserad";
const mentalHelp = "person.behandling.mental_selvhjelp";
const udfPrefix = "tryg-utdanningsforbundet-";
const ifBarn = "if-person-barn-super";
const ifPregnancy = "if-person-gravid-super";
const gjTreatment = "gjensidige-person-behandling";
const nitoTreatment = "tryg-nito-behandling-enkel";

function product(id, catalog = marketProductCatalog) {
  const item = catalog.products.find(candidate => candidate.productId === id);
  assert.ok(item, id);
  return item;
}

function facts(id, catalog = marketProductCatalog) {
  return materializeCatalogProduct(product(id, catalog), catalog).facts;
}

function fact(id, key) {
  const found = facts(id).filter(item => item.key === key);
  assert.equal(found.length, 1, id + " / " + key);
  return found[0];
}

function row(id, other, key) {
  const rows = (a, b) => compareCatalogProducts(product(a), product(b), marketProductCatalog)
    .sections.flatMap(section => section.rows).filter(item => item.key === key);
  const direct = rows(id, other);
  const reversed = rows(other, id);
  assert.equal(direct.length, 1, id + " / " + other + " / " + key);
  assert.equal(reversed.length, 1, other + " / " + id + " / " + key);
  assert.equal(direct[0].label, reversed[0].label);
  assert.deepEqual(direct[0].first, reversed[0].second);
  assert.deepEqual(direct[0].second, reversed[0].first);
  return direct[0];
}

function sourcePage(item, documentId, page, section) {
  const source = item.sources.find(candidate => candidate.documentId === documentId && candidate.page === page);
  assert.ok(source, documentId + " / " + page);
  assert.equal(source.sourceType, "full_terms");
  assert.match(source.section, section);
  assert.match(termsSourceHref(source), new RegExp("#page=" + page + "$", "u"));
}

function rawOmits(id, key) {
  assert.ok(!facts(id, productCatalog).some(item => item.key === key), id + " / " + key);
}

test("Godt voksen lists all six categories of economic first aid with their own conditions", () => {
  const id = "if-person-godt-voksen";
  const prefix = "person.senior.diagnose.";
  assert.equal(facts(id).filter(item => item.key.startsWith(prefix)).length, 6);
  for (const [key, page, clause, detail] of [
    ["kreft", 3, /4\.1 a/u, /leukemi.*lymfom.*in situ.*leppekreft/u],
    ["hjernesvulst", 3, /4\.1 b/u, /CT eller MR.*nevrokirurgi.*medisinsk-tekniske årsaker/u],
    ["hjerneslag", 3, /4\.1 c/u, /utfall.*utskrivning.*CT eller MR/u],
    ["hjerteoperasjon", 4, /4\.1 d/u, /bypass.*PCI.*hjerteklaff/u],
    ["amputasjon", 4, /4\.1 e/u, /ankelleddet.*håndleddet/u],
    ["brannskade", 4, /4\.1 f/u, /minst 15 %.*minst 10 %.*plastisk kirurgi/u],
  ]) {
    const item = fact(id, prefix + key);
    assert.equal(item.state, "included");
    assert.match(item.value, detail);
    sourcePage(item, "person:" + id, page, clause);
    rawOmits(id, prefix + key);
  }
  assert.match(fact(id, "person.senior.utbetaling").value, /100 000 kr.*24 timer.*Én utbetaling per bokstavgruppe/u);
});

test("Utdanningsforbundet Liv separates member and spouse termination events on the existing row", () => {
  const member = udfPrefix + "liv-medlem";
  const spouse = udfPrefix + "liv-ektefelle";
  const compared = row(member, spouse, livExpiry);
  assert.match(compared.first.text, /70 år.*to måneder etter utmeldingsdatoen.*utbetaling av forsikringssummen/u);
  assert.doesNotMatch(compared.first.text, /dødsfallet.*registrert|separasjon|adresseendring/u);
  assert.match(compared.second.text, /70 år.*dødsfallet er registrert.*to måneder etter utmeldingsdatoen.*betalt premie.*separasjon eller skilsmisse.*folkeregistrert adresseendring/u);
  for (const [id, cell] of [[member, compared.first], [spouse, compared.second]]) {
    assert.equal(cell.state, "included");
    assert.match(cell.text, /annen grunn enn oppnådd alder eller utbetaling.*uten helsevurdering.*skriftlig melding.*seks måneder.*samme forsikringssum og forsikringstid/iu);
    sourcePage(cell, id + "-terms", 5, /§ 7.*Opphør/u);
    sourcePage(cell, id + "-terms", 6, /§ 12.*fortsettelsesforsikring/u);
    const raw = facts(id, productCatalog).find(item => item.key === livExpiry);
    assert.match(raw.value, /kalenderåret.*70 år/u);
    assert.doesNotMatch(raw.value, /helsevurdering|utmeldingsdatoen/u);
  }
  const nito = row(spouse, "tryg-nito-liv", livExpiry);
  assert.match(nito.second.text, /75 år.*utgangen av forsikringsåret.*seks måneder/u);
});

test("disability continuation aligns while each policy keeps its actual qualifying events", () => {
  const member = udfPrefix + "ufore-medlem";
  const spouse = udfPrefix + "ufore-ektefelle";
  const extra = "tryg-nito-ufore-ekstra";
  const afterStudies = "tryg-nito-ufore-etter-studiet";
  for (const [id, documentId, page, condition, rule] of [
    [member, member + "-terms", 7, /§ 10/u, /annen grunn enn oppnådd alder eller utbetaling/u],
    [spouse, spouse + "-terms", 7, /§ 10/u, /annen grunn enn oppnådd alder eller utbetaling/u],
    [extra, extra + "-product-terms", 3, /§ 7/u, /annen grunn enn oppnådd alder/u],
    [afterStudies, afterStudies + "-terms", 5, /§ 6/u, /under 60 år.*når dekningen opphører/u],
  ]) {
    const cell = row(id, id === member ? afterStudies : member, disabilityContinuation).first;
    assert.equal(cell.state, "included", id);
    assert.match(cell.text, rule);
    assert.match(cell.text, /uten helsevurdering.*skriftlig melding.*seks måneder.*samme forsikringssum og forsikringstid/iu);
    if (id === extra || id === afterStudies) assert.doesNotMatch(cell.text, /utbetaling av forsikringssummen/u);
    sourcePage(cell, documentId, page, condition);
    rawOmits(id, disabilityContinuation);
  }

  const sum = row(member, spouse, disabilityReduction);
  for (const [id, cell] of [[member, sum.first], [spouse, sum.second]]) {
    assert.match(cell.text, /2 % ved 41–50 år, 4 % ved 51–55 år og 2 % ved 56–60 år.*11 G eller 22 G.*1,8 % ved 41–50 år og 3,2 % ved 51–60 år.*50 %/u);
    sourcePage(cell, id + "-terms", 3, /Forsikringssum og nedtrapping/u);
    rawOmits(id, disabilityReduction);
  }
  assert.equal(row(member, afterStudies, disabilityReduction).second.state, "unknown");
});

test("child symptom clauses use one terms row with variant-specific trigger and transfer conditions", () => {
  for (const [id, sourceId, page, clause, detail] of [
    ["if-person-barn-standard", "person:if-person-barn-standard", 12, /6\.2\.1/u, /90 dagene.*If har mottatt.*godkjent flytting.*utløpt karenstid/u],
    [ifBarn, "person:if-person-barn-super:barn", 12, /6\.2\.1/u, /90 dagene.*fullstendig helseerklæring/u],
    ["tryg-person-barn-ekstra", "person:tryg-person-barn-ekstra:barn-produktvilkar", 1, /Barn Ekstra/u, /90 dagene etter at forsikringen begynner å gjelde.*12 måneder/u],
    ...["standard", "super"].map(tier => ["storebrand-person-barn-" + tier, "person:storebrand-person-barn-" + tier, 4, /A\.5\.1/u, /12 måneder fra signert forsikringssøknad.*Utvalgte sykdommer.*tre måneder.*ulykke eller dødsfall/u]),
    ...["bra", "best"].map(tier => ["frende-person-barn-" + tier, "person:frende-person-barn-" + tier, 10, /6 b/u, /tre måneder.*levert fullstendig helseerklæring.*12 måneder.*psykiske lidelser.*muskel- og skjelettlidelser.*bransjeavtalen/u]),
    ...["basis", "medium", "pluss"].map(tier => ["gjensidige-person-barn-" + tier, "person:gjensidige-person-barn-" + tier, 2, /Barneforsikring/u, /tre måneder.*signert og mottatt.*uførepensjon når denne dekningen inngår.*12 måneder/u]),
    ...["", "-maks"].map(suffix => ["klp-person-barn" + suffix, "person:klp-person-barn" + suffix, 9, /Symptomklausul/u, /tre månedene.*signert og sendt.*12 måneder.*er betalt/u]),
    ["fremtind-person-barn", "person:fremtind-person-barn", 8, /14 a/u, /tre måneder.*forsikringstakeren aksepterte avtalen.*12 måneder/u],
    ["landkreditt-person-barn", "person:landkreditt-person-barn", 7, /6\.2/u, /tre månedene.*fullstendig egenerklæring.*signert og sendt/u],
  ]) {
    const cell = row(id, id === ifBarn ? "storebrand-person-barn-super" : ifBarn, barnSymptom).first;
    assert.equal(cell.state, "included", id);
    assert.match(cell.text, detail, id);
    sourcePage(cell, sourceId, page, clause);
    if (id.startsWith("gjensidige-")) sourcePage(cell, sourceId + ":barn-uforepensjon", 2, /Uførepensjon/u);
    rawOmits(id, barnSymptom);
  }

  for (const id of ["tryg-person-barn-ulykke", "fremtind-person-barn-ulykke", "landkreditt-person-barn-ulykke", "klp-person-spedbarn"]) {
    assert.equal(row(ifBarn, id, barnSymptom).second.state, "unknown", id);
  }
});

test("four Tryg and NITO accident contracts show their own 1 percent minimum on the invalidity row", () => {
  const ordinary = "tryg-person-ulykke";
  const family = "tryg-person-familieulykke";
  const base = "tryg-nito-ulykke-grunn";
  const extended = "tryg-nito-ulykke-utvidet";
  for (const [id, documentId, page, clause, detail] of [
    [ordinary, "person:" + ordinary, 2, /3\.1/u, /med mindre annet er avtalt.*Forsikringsbeviset/u],
    [family, "person:" + family, 2, /3\.1/u, /100 %.*hele forsikringssummen/u],
    [base, base + "-terms", 5, /5\.1/u, /1 000 000 kr.*uten egenandel/u],
    [extended, extended + "-terms", 7, /6\.1/u, /45 G.*familiesammensetningen på ulykkesdagen/u],
  ]) {
    const cell = row(id, id === ordinary ? base : ordinary, accidentInvalidity).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, /fra og med 1 %/u);
    assert.match(cell.text, detail);
    sourcePage(cell, documentId, page, clause);
    const raw = facts(id, productCatalog).find(item => item.key === accidentInvalidity);
    assert.doesNotMatch(raw.value, /fra og med 1 %/u);
  }
  assert.doesNotMatch(row(ordinary, "if-person-ulykke", accidentInvalidity).second.text, /fra og med 1 %/u);
});

test("If and Tryg Gravid compare who is insured without changing their existing payout limits", () => {
  for (const [id, sourceId, page, rule] of [
    ...["gratis", "ekstra", "premium"].map(tier => ["tryg-person-gravid-" + tier, "person:tryg-person-gravid-" + tier + ":gravid-produktvilkar", 1, /§ 1/u]),
    ...["basis", "super"].map(tier => ["if-person-gravid-" + tier, "person:if-person-gravid-" + tier, 3, /§ 2/u]),
  ]) {
    const cell = row(id, id === ifPregnancy ? "tryg-person-gravid-premium" : ifPregnancy, pregnancyScope).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, /alle ventede barn.*tvillinger, trillinger.*Folkeregisteret.*norsk folketrygd.*forsikringstilfellet/u);
    sourcePage(cell, sourceId, page, rule);
    rawOmits(id, pregnancyScope);
  }
  const storebrand = "storebrand-person-gravid";
  const storebrandScope = row(ifPregnancy, storebrand, pregnancyScope).second;
  assert.equal(storebrandScope.state, "included");
  assert.match(storebrandScope.text, /Barnet er forsikret.*Mor er også omfattet av sykehusdekningen.*barnets mor eller verge.*fast bopel i Norge.*de siste fem årene/u);
  sourcePage(storebrandScope, "person:" + storebrand, 2, /Forsikringstaker og forsikret/u);
  rawOmits(storebrand, pregnancyScope);
  const payment = row("tryg-person-gravid-ekstra", ifPregnancy, "person.gravid.medfodt");
  assert.match(payment.first.text, /200 000 kr én gang/u);
  assert.match(payment.second.text, /500 000 kr/u);
});

test("medical and digital mental services are visible on the right treatment plans", () => {
  for (const [id, page, clause, detail] of [
    [gjTreatment, 3, /Online lege/u, /barn under 18 år.*videokonsultasjon.*150 kr/u],
    ["gjensidige-person-helse-55", 1, /Helsehjelp 24\/7/u, /Helsehjelp 24\/7.*Helse 55\+/u],
    ["landkreditt-person-behandling", 6, /§ 7\.7/u, /faste husstand.*videokonsultasjon.*Falck/u],
  ]) {
    const cell = row(id, nitoTreatment, healthHelp).first;
    assert.equal(cell.state, "included");
    assert.match(cell.text, detail);
    sourcePage(cell, "person:" + id, page, clause);
    rawOmits(id, healthHelp);
  }
  const mental = row(gjTreatment, nitoTreatment, mentalHelp);
  assert.equal(mental.first.state, "included");
  assert.match(mental.first.text, /ett behandlingsforløp.*12-månedersperiode/u);
  assert.match(mental.second.text, /veiledede digitale selvhjelpsprogrammer/u);
  sourcePage(mental.first, "person:" + gjTreatment, 2, /Online Mental Helsehjelp/u);
  assert.equal(row(gjTreatment, "gjensidige-person-helse-55", mentalHelp).second.state, "unknown");
  rawOmits(gjTreatment, mentalHelp);
});

test("ordinary Gjensidige Alvorlig sykdom displays the evidenced helpline and sum adjustment", () => {
  const id = "gjensidige-person-alvorlig-sykdom";
  for (const [key, page, clause, value] of [
    ["person.sykdom.helserad", 1, /Helsehjelp 24\/7/u, /Helsehjelp 24\/7/u],
    ["person.sykdom.sum", 9, /G-regulering/u, /avtalt i forsikringsbeviset.*hovedforfall.*gjelder ikke den faste ytelsen/u],
  ]) {
    const item = fact(id, key);
    assert.equal(item.state, "included");
    assert.match(item.value, value);
    sourcePage(item, "person:" + id, page, clause);
    rawOmits(id, key);
  }
  assert.match(fact(id, "person.sykdom.sykehus").value, /100 000 kr én gang.*60 sammenhengende dager/u);
});
