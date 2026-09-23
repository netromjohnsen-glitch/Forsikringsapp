import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { vehicleObjectSources } from "./vehicle-object-sources.ts";
import { vehicleObjectCoverages } from "./vehicle-object-registry.ts";
export { vehicleObjectSources } from "./vehicle-object-sources.ts";

type ObjectType = "snoscooter" | "campingvogn" | "tilhenger";
type Row = [key: string, value: string, page: number, section: string, sourceFile?: string];
const labels = { snoscooter: "Snøscooter", campingvogn: "Campingvogn", tilhenger: "Tilhenger" };
const typeId = (type: ObjectType) => type === "snoscooter" ? "snøscooter" : type;
export const vehicleObjectProducts: CatalogProduct[] = [];
export const vehicleObjectFacts: Record<string, CatalogFact[]> = {};
export const vehicleObjectAddOns: CatalogAddOn[] = [];
export const vehicleObjectCoverageMatrix: Record<string, Record<string, "standard" | "optional" | "not_included" | "unknown">> = {};

function facts(type: ObjectType, file: string, rows: Row[]): CatalogFact[] {
  const definitions = vehicleObjectCoverages(typeId(type));
  const withParents = [...rows];
  for (const [key, , page, section, override] of rows) {
    const family = key.split(".")[0];
    if (["utstyr.grense", "losore.grense"].includes(key) && !withParents.some(([k]) => k === `${family}.dekning`)) {
      withParents.push([`${family}.dekning`, "Omfattes ved skade som dekkes av valgt produktnivå", page, section, override]);
    }
  }
  return withParents.map(([key, value, page, section, override]) => {
    const source = vehicleObjectSources[`vehicle:${override ?? file}`];
    if (!source) throw new Error("Missing vehicle catalog source");
    if (source.effectiveFrom > "2026-09-23") throw new Error("Future terms cannot establish current vehicle facts");
    const fullKey = `${type}.${key}`;
    const coverage = definitions.find((definition) => definition.parentKey === fullKey || definition.details.some((detail) => detail.key === fullKey));
    const detail = coverage?.details.find((entry) => entry.key === fullKey);
    return { key: fullKey, label: coverage ? `${coverage.label}${detail ? ` – ${detail.summaryLabel}` : ""}` : key.replaceAll(".", " – "), value,
      ...(key.endsWith("egenandel") ? { deductibleClassification: "standard" as const } : {}),
      source: { documentId: source.id, filename: source.filename, url: source.url,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom, ...(source.version ? { version: source.version } : {}), page, section,
        note: "Offentlig produktgrunnlag; kundens forsikringsbevis går foran. Ukjent dokumentdato er ikke en bekreftet gyldighetsdato." } };
  });
}
function product(providerId: string, company: string, type: ObjectType, name: string, file: string, rows: Row[], excluded: string[] = []) {
  const slug = name.toLocaleLowerCase("nb-NO").replaceAll(" ", "-");
  const productId = `${providerId}-${type}-${slug}`;
  const source = vehicleObjectSources[`vehicle:${file}`];
  vehicleObjectProducts.push({ providerId, company, insuranceType: labels[type], name, productId,
    version: source.effectiveFrom || null, sourceId: source.id, componentIds: [productId] });
  vehicleObjectFacts[productId] = facts(type, file, rows);
  vehicleObjectCoverageMatrix[productId] = Object.fromEntries(vehicleObjectCoverages(typeId(type)).map(({ parentKey }) =>
    [parentKey, vehicleObjectFacts[productId].some(({ key }) => key === parentKey) ? "standard" : excluded.some((key) => `${type}.${key}.dekning` === parentKey) ? "not_included" : "unknown"]));
  return productId;
}
const row = (key: string, value: string, page: number, section: string, file?: string): Row => [key, value, page, section, file];
const included = (keys: string[], page: number, section: string, file?: string): Row[] => keys.map((key) => row(`${key}.dekning`, "Inkludert i produktnivået", page, section, file));

// Tryg: October 2026 snøscooter terms are archived but not used. IPID and
// active product/ansvar terms establish only the limited current base below.
const trygSnow = "tryg-IPID-Snoscooter.pdf";
for (const name of ["Ansvar", "Brann og tyveri", "Kasko"]) {
  product("tryg", "Tryg", "snoscooter", name, trygSnow, [
    ...included(["ansvar", "rettshjelp"], 1, "Ansvar"),
    row("ansvar.grense", "Ubegrenset personskade; inntil 100 000 000 kr for annen skade per hendelse", 1, "1.1 Ansvar", "tryg-odpdf-060a2170.pdf"),
    row("avtale.geografi", "Europa unntatt Russland, Belarus og Tyrkia; rettshjelp i Norden", 1, "3", "tryg-odpdf-dbf5be98.pdf"),
    row("avtale.sesong", "Sesongfordelt pris ved opphør; ikke jevn fordeling av årsprisen", 1, "5", "tryg-odpdf-dbf5be98.pdf"),
    ...(name !== "Ansvar" ? included(["brann", "tyveri"], 1, "Brann og tyveri") : []),
    ...(name === "Kasko" ? included(["kasko"], 1, "Kasko") : []),
    row("redning.begrensning", "Utgifter til redning/veihjelp er unntatt", 1, "Begrensninger"),
  ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Kasko" ? [] : ["kasko"]);
}
for (const type of ["campingvogn", "tilhenger"] as const) {
  for (const name of ["Brann", "Brann og tyveri", "Kasko", ...(type === "campingvogn" ? ["Campingvogn Ekstra"] : [])]) {
    const file = name === "Brann" ? "tryg-odpdf-543856fa.pdf" : name === "Brann og tyveri" ? "tryg-odpdf-05b2538c.pdf" : "tryg-odpdf-f862c645.pdf";
    const extra = name === "Campingvogn Ekstra";
    const rows: Row[] = [
      ...included(["brann", "rettshjelp"], 1, "1 og 2"),
      row("avtale.geografi", "Europa unntatt Russland, Belarus og Tyrkia; rettshjelp i Norden", 1, "3", "tryg-odpdf-f52d5798.pdf"),
      ...(type === "tilhenger" ? [
        ...included(["naturskade"], 1, "2.2", "tryg-odpdf-543856fa.pdf"),
        row("naturskade.egenandel", "8 000 kr", 2, "2.2", "tryg-odpdf-543856fa.pdf"),
      ] : []),
      row("avtale.forsikringssum", "Avtalt forsikringssum; ved totalskade begrenset til markedsverdien", 1, "Forsikringssum"),
      row("utstyr.grense", extra ? "50 000 kr" : "10 000 kr", 1, "Fastmontert tilbehør", extra ? "tryg-odpdf-d09fac80.pdf" : file),
      ...(name !== "Brann" ? included(["tyveri"], 1, "2") : []),
      ...(["Kasko", "Campingvogn Ekstra"].includes(name) ? [
        ...included(["kasko", "glass"].filter((key) => type === "campingvogn" || key !== "glass"), 2, "2.1 og 2.4"),
        row("kasko.begrensning", extra ? "Frost, strømbrudd og konstruksjonssprekker er unntatt" : "Frost, strømbrudd, konstruksjonssprekker og insekter/gnagere er unntatt", 1, "2.1"),
        row("brann.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt", 2, "2.2"),
        row("tyveri.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt", 2, "2.3"),
      ] : []),
      ...(type === "campingvogn" ? [
        row("losore.grense", extra ? "50 000 kr samlet; 10 000 kr per gjenstand; 15 000 kr i tekstilfortelt" : "15 000 kr samlet; 5 000 kr per gjenstand", 1, "Løst utstyr", extra ? "tryg-odpdf-d09fac80.pdf" : file),
        row("fortelt.dekning", extra ? "Fortelt og terrasse konstruert for campingvognen omfattes; løsøre i tekstilfortelt har egen særgrense" : "Fortelt og terrasse konstruert for campingvognen omfattes; tyveri fra tekstilfortelt er unntatt", 1, "1.1 og 2.3"),
      ] : []),
      ...(extra ? [
        ...included(["fukt", "skadedyr", "ferie"], 1, "Utvidelser", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.alder", "Innen 10 år etter første registrering som fabrikkny", 1, "Fuktskade", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.egenandel", "8 000 kr inntil 5 år; deretter 25 %, minst 8 000 kr", 1, "Fuktskade", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.begrensning", "Rørlekkasje, frost, fortelt, terrasse og teltvogn er unntatt", 1, "Unntak", "tryg-odpdf-d09fac80.pdf"),
        row("ferie.grense", "1 500 kr per dag i resterende planlagt ferie, maksimalt 14 dager", 1, "Avbrutt ferie", "tryg-odpdf-d09fac80.pdf"),
        row("ferie.begrensning", "Ikke ved helt eller delvis utleie", 1, "Avbrutt ferie", "tryg-odpdf-d09fac80.pdf"),
      ] : []),
    ];
    product("tryg", "Tryg", type, name, file, rows, name === "Brann" ? ["tyveri", "kasko"] : name === "Brann og tyveri" ? ["kasko"] : []);
  }
}
for (const [name, family, file] of [["Førerulykke", "forerulykke", "tryg-odpdf-2001c3a6.pdf"], ["Fører- og passasjerulykke", "ulykke", "tryg-odpdf-56716918.pdf"]]) {
  const id = `tryg-snoscooter-${family}`;
  vehicleObjectFacts[id] = facts("snoscooter", file, [...included([family], 1, "1"), row(`${family}.grense`, "Invaliditet og dødsfall etter avtalt forsikringssum i forsikringsbeviset", 1, "1")]);
  vehicleObjectAddOns.push({ id, name, componentId: id, providerId: "tryg", insuranceTypes: ["Snøscooter"], requiresLevel: ["tryg-snoscooter-ansvar", "tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-kasko"], exclusiveGroup: "tryg-snoscooter-ulykke" });
  for (const productId of ["tryg-snoscooter-ansvar", "tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-kasko"]) vehicleObjectCoverageMatrix[productId][`snoscooter.${family}.dekning`] = "optional";
}

// Gjensidige: public specimen policies, not evidence of any customer's choices.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const levels = type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Delkasko", "Kasko", "Pluss"] : ["Delkasko", "Kasko"];
  for (const name of levels) {
    const file = type === "snoscooter" ? (name === "Ansvar" ? "gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf" : `gjensidige-Snoscooter-${name}-alminnelige-vilkar.pdf`) : type === "campingvogn" ? `gjensidige-Campingvogn-${name}-alminnelige-vilkar.pdf` : `gjensidige-tilhenger-${name.toLowerCase()}-alminnelige-vilkar.pdf`;
    const rows: Row[] = [
      ...(type === "snoscooter" ? [
        ...included(["ansvar", "rettshjelp", "ulykke"], 3, "Hvilke skader"),
        row("ansvar.grense", "Ubegrenset personskade; 100 millioner kr tingskade", 1, "Dekningsoversikt"),
        row("ulykke.grense", "Dødsfall 100 000 kr; invaliditet 200 000 kr", 1, "Dekningsoversikt"),
      ] : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], type === "tilhenger" ? 2 : 3, "Hvilke skader") : []),
      ...(["Kasko", "Pluss"].includes(name) ? included(["kasko"], type === "tilhenger" ? 2 : 3, "Hvilke skader") : []),

      ...(type === "snoscooter" && name !== "Ansvar" ? [row("utstyr.grense", "10 000 kr", 1, "Fastmontert ekstrautstyr"), row("losore.grense", "5 000 kr", 1, "Løsøre"), row("redning.begrensning", "Transport til og fra verksted ved reparasjon er unntatt", 3, "Dekkes ikke")] : []),
      ...(type === "campingvogn" ? [
        ...included(["glass", "redning"], 3, "Hvilke skader/utgifter"),
        row("avtale.geografi", "Mobil bruk: Europa. Fast sted: Norge, Sverige, Danmark og Finland", 3, "Hvor gjelder forsikringen"),
        row("fortelt.begrensning", "Fortelt/tilbygg krever egen avtalt utvidelse og sum; er ikke fastmontert ekstrautstyr", 3, "Hva er forsikret"),
        ...(["Kasko", "Pluss"].includes(name) ? included(["skadedyr"], 3, "Hvilke skader") : []),
        ...(name === "Pluss" ? [
          ...included(["fukt", "ferie"], 3, "Pluss"),
          row("fukt.alder", "Ikke eldre enn 15 år fra produksjonsdato", 3, "Fuktskader"),
          row("fukt.begrensning", "Fuktighetstest uten anmerkning fra forhandler/verksted mindre enn ett år før skaden oppdages", 3, "Fuktskader"),
          row("ferie.grense", "Inntil 1 500 kr per dag i inntil 14 dager", 4, "Feriegaranti"),
        ] : []),
      ] : []),
      ...(type === "tilhenger" ? [
        ...included(["redning"], 2, "Hvilke utgifter"),
        row("avtale.geografi", "Europa unntatt Kosovo, Russland og Belarus", 2, "Hvor gjelder forsikringen"),
      ] : []),
    ];
    product("gjensidige", "Gjensidige", type, name, file, rows, name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Delkasko" ? ["kasko"] : []);
  }
}

// Frende's three official endpoints currently serve the same terms. Sharing
// text does not imply sharing the vehicle's coverage selections or scope.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = `frende-${type === "snoscooter" ? "Snowmobile" : type === "campingvogn" ? "Caravan" : "Trailer"}Insurance.pdf`;
  for (const name of [...(type === "snoscooter" ? ["Ansvar"] : []), "Brann og tyveri", "Kasko"]) {
    product("frende", "Frende", type, name, file, [
      ...included(["rettshjelp"], 11, "14 (privatkunder)"),
      ...(type === "snoscooter" ? included(["ansvar"], 11, "13") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], 3, "4") : []),
      ...(name === "Kasko" ? included(["kasko"], 3, "6.1") : []),
      row("avtale.geografi", "Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden", 2, "2"),
      ...(name !== "Ansvar" ? [row("utstyr.grense", "20 000 kr fastmontert ekstrautstyr", 2, "3.7")] : []),
      ...(type === "campingvogn" ? [
        row("losore.grense", "20 000 kr eller avtalt sum", 2, "3.9"),
        row("fortelt.dekning", "Fortelt, samt platting og terrasse knyttet til campingvognen", 2, "3.10–11"),
        ...(name === "Kasko" ? [
          ...included(["fukt"], 3, "6.1.2"),
          row("fukt.begrensning", "Godkjent fukttest må vise at skaden oppstod siste år; utbedring av lekkasjen og rørlekkasje er ikke omfattet", 3, "6.1.2"),
        ] : []),
      ] : []),
      ...(type === "tilhenger" ? [row("kasko.begrensning", "Løse ting og bagasje på tilhenger er ikke omfattet", 2, "3.9")] : []),
    ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name !== "Kasko" ? ["kasko"] : []);
  }
}

// Storebrand explicitly includes snowmobiles in motor09. Do not inherit its
// passenger-car extensions. camp02's contradictory Super contents sum is omitted.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = type === "snoscooter" ? "storebrand-vilkar-motorvognforsikring.pdf" : "storebrand-vilkar-campingvogn-og-tilhenger.pdf";
  for (const name of (type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Brann og tyveri", "Kasko", "Super"] : ["Brann og tyveri", "Kasko"])) {
    const snow = type === "snoscooter";
    product("storebrand", "Storebrand", type, name, file, [
      ...included(["rettshjelp"], snow ? 30 : 12, "Rettshjelp"),
      ...(snow ? included(["ansvar"], 3, "1.1") : []),
      ...(snow && name !== "Ansvar" ? included(["ulykke"], 5, "Andre dekninger") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], snow ? 3 : 2, "Sammendrag av dekninger") : []),
      ...(["Kasko", "Super"].includes(name) ? included(["kasko"], snow ? 3 : 2, "Sammendrag av dekninger") : []),
      row("rettshjelp.grense", "100 000 kr per tvist", snow ? 32 : 14, "Rettshjelp – forsikringssum"),
      ...(!snow ? [
        row("brann.egenandel", "8 000 kr dersom annet ikke fremgår av forsikringsbeviset", 5, "6.1.1"),
        row("avtale.geografi", "EØS og Sveits; øvrige Grønt kort-land i Europa inntil 3 måneder, unntatt Tyrkia, Russland, Belarus og Kosovo", 3, "4"),
        ...included(["redning"], 2, "Sammendrag"),
      ] : []),
      ...(type === "campingvogn" ? [
        row("fortelt.begrensning", "Fortelt og bygningskonstruksjon som tilbygg må spesifiseres i forsikringsbeviset", 4, "5"),
        ...(name !== "Super" ? [row("losore.grense", "30 000 kr samlet; 5 000 kr per gjenstand", 4, "5")] : []),
        ...(name === "Super" ? [
          ...included(["fukt", "ferie", "nyverdi"], 7, "6.3"),
          row("nyverdi.alder", "Innen tre år etter registrering som fabrikkny på forsikringstakeren", 7, "6.3.1"),
          row("nyverdi.begrensning", "Tapt campingvogn eller reparasjon som overstiger listepris for tilsvarende ny campingvogn; krav om tilsvarende gjenkjøp/dokumentasjon", 7, "6.3.1"),
          row("fukt.alder", "Nyere enn 15 år fra produksjonsdato", 7, "6.3.2"),
          row("fukt.begrensning", "Fuktkontroll uten anmerkninger fra forhandler/verksted mindre enn ett år før skaden oppdages; ny årlig kontroll kreves. Frost og frost/snøtyngde som medvirkende årsak er unntatt", 7, "6.3.2, fortsetter side 8"),
          row("ferie.grense", "1 500 kr per dag i resterende planlagt ferie, inntil 15 dager", 8, "6.3.3"),
        ] : []),
      ] : []),
    ], ["Ansvar", "Delkasko", "Brann og tyveri"].includes(name) ? ["kasko"] : []);
  }
}

// If: MOT2-2 explicitly covers all three objects. S-709 is a trailer rider,
// not snowmobile terms despite the snowmobile page linking it as a særvilkår.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = "if-Vilkaar-4103ea25.pdf";
  const levels = type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Delkasko", "Kasko", "Super"] : ["Delkasko", "Kasko"];
  for (const name of levels) {
    product("if", "If", type, name, file, [
      ...included(["rettshjelp"], 24, "12"),
      ...(type === "snoscooter" ? included(["ansvar", "ulykke"], 4, "4.1 og 11") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], 4, "4.2–4.3") : []),
      ...(["Kasko", "Super"].includes(name) ? included(["kasko"], 6, "4.8") : []),
      ...(name !== "Ansvar" ? [row("brann.egenandel", "8 000 kr dersom annet ikke er avtalt i særvilkår/forsikringsbevis", 19, "8.5.3"), row("tyveri.egenandel", "8 000 kr dersom annet ikke er avtalt i særvilkår/forsikringsbevis", 19, "8.5.3")] : []),
      row("rettshjelp.egenandel", "4 000 kr + 20 % av det overskytende", 19, "8.5.2"),
      ...(type === "campingvogn" ? [
        ...included(["glass", "naturskade"], 5, "4.5–4.6"),
        row("glass.egenandel", "3 000 kr ved skifte; ingen egenandel ved reparasjon", 19, "8.5.4"),
      ] : []),
      ...(type === "tilhenger" ? [row("avtale.forsikringssum", "Gjenanskaffelsesverdi av angitt tilhenger med fastmontert utstyr", 1, "1", "if-Vilkaar-b7d19ed7.pdf")] : []),
    ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Delkasko" ? ["kasko"] : []);
  }
}

// Eika channel ONLY. No inference that SpareBank 1 or DNB sell these same
// rules; no historical M10/M10P data mixed with the current linked PMO terms.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const snow = type === "snoscooter";
  const file = snow ? "fremtind-Vilkar_Kasko_Snoscooter.pdf" : "fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf";
  for (const name of [...(snow ? ["Ansvar"] : []), ...(type !== "tilhenger" ? ["Minikasko"] : []), "Kasko"]) {
    product("eika-fremtind", "Eika / Fremtind", type, name, file, [
      ...(snow ? included(["ansvar", "rettshjelp", "ulykke"], 1, "Ansvar", "fremtind-IPID_Snoscooter.pdf") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], snow ? 4 : 1, "Minikaskoforsikring") : []),
      ...(name === "Kasko" ? included(["kasko"], snow ? 7 : 4, "Kaskoforsikring") : []),
      row("avtale.geografi", snow ? "Norden; lovpliktig ansvar gjelder også hele EØS" : "Europa, Tyrkia og Israel", 1, "2"),
      row("avtale.egenandel", "Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret", 1, "4"),
      ...(snow ? [row("avtale.sesong", "Sesongvariert pris ved opphør/lagring; kasko/minikasko omgjøres til lagring ved midlertidig avregistrering", 1, "5 og prisberegning")] : name !== "Ansvar" ? included(["redning"], 2, "2.4") : []),
      ...(type === "campingvogn" ? [
        ...included(["glass"], 2, "2.3"),
        row("losore.grense", "10 000 kr per gjenstand; samlet sum fremgår av forsikringsbeviset", 1, "1.2"),
        row("tyveri.begrensning", "Tyveri fra fortelt er unntatt", 2, "2.2"),
        row("fortelt.begrensning", "Fortelt/tilbygg må inngå i avtalt forsikringssum", 2, "3.1"),
      ] : []),
    ], name !== "Kasko" ? ["kasko"] : []);
  }
}

// Only explicitly documented level relationships. Repeated rows retain the
// exact child document as evidence; the established replacesBase rule selects
// one effective value. Conflicting Storebrand Super contents are deliberately
// not inherited from Kasko.
const documentedParents: readonly [string, string][] = [
  ["tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-ansvar"],
  ["tryg-snoscooter-kasko", "tryg-snoscooter-brann-og-tyveri"],
  ["tryg-campingvogn-campingvogn-ekstra", "tryg-campingvogn-kasko"],
  ["if-snoscooter-delkasko", "if-snoscooter-ansvar"],
  ["if-snoscooter-kasko", "if-snoscooter-delkasko"],
  ["if-campingvogn-kasko", "if-campingvogn-delkasko"],
  ["if-campingvogn-super", "if-campingvogn-kasko"],
  ["if-tilhenger-kasko", "if-tilhenger-delkasko"],
  ["eika-fremtind-snoscooter-minikasko", "eika-fremtind-snoscooter-ansvar"],
  ["eika-fremtind-snoscooter-kasko", "eika-fremtind-snoscooter-minikasko"],
  ["eika-fremtind-campingvogn-kasko", "eika-fremtind-campingvogn-minikasko"],
];
for (const [childId, parentId] of documentedParents) {
  const child = vehicleObjectProducts.find((entry) => entry.productId === childId)!;
  const parent = vehicleObjectProducts.find((entry) => entry.productId === parentId)!;
  if (child.providerId !== parent.providerId || child.insuranceType !== parent.insuranceType || child.version !== parent.version) throw new Error("Invalid documented vehicle inheritance");
  child.inheritsProductId = parentId;
  const parentKeys = new Set(vehicleObjectFacts[parentId].map(({ key }) => key));
  vehicleObjectFacts[childId] = vehicleObjectFacts[childId].map((fact) => parentKeys.has(fact.key) ? { ...fact, replacesBase: true } : fact);
}
