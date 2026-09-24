import { vehicleObjectType, vehicleObjectFactKeys } from "./vehicle-object-registry.ts";
import type { ExtractedInsurance, ExtractedTerm } from "./analysis-output.ts";
import {
  normalizeCatalogTermKey,
  normalizeInsuranceType,
  normalizeTermName,
  relatedCoveragesForInsuranceType,
} from "./insurance-normalization.ts";
import type { CatalogFact } from "./product-catalog.ts";

export type DocumentFact = ExtractedTerm & {
  key?: string;
  coverageOrigin: "document";
  source?: CatalogFact["source"];
  sources?: CatalogFact["source"][];
};

const normalizeWords = (value: string) => value.normalize("NFKC")
  .toLocaleLowerCase("nb-NO")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .replace(/\s+/gu, " ")
  .trim();

const amount = /\b\d{1,3}(?:[ .]\d{3})+\s*(?:kr|kroner)\b/iu;
const yearLimit = /\b\d{1,2}\s*år\b/iu;
const kilometerLimit = /\b(?:\d{1,3}(?:[ .\u00a0\u202f]\d{3})+|\d+)\s*(?:km|kilometer)\b/iu;
const registrationYear = /\b(?:første gang registrert|førstegangsregistrert|førstegangsregistrering|første registreringsdato)\s*(?::|er)?\s*((?:19|20)\d{2})\b/iu;

const totalskadeLabels = new Set([
  "totalskadegaranti",
  "nyverdierstatning",
  "nybilgaranti",
]);

function explicitKey(
  term: ExtractedTerm,
  insurance: ExtractedInsurance,
  relatedCoverageParentKeys: readonly string[] = [],
): string {
  // Internal document facts have already converted canonicalKey into key.
  // Preserve that identity on repeated normalization (e.g. consolidation).
  // Raw extraction cannot supply key/coverageOrigin through its schema.
  const prior = term as Partial<DocumentFact>;
  const canonicalKey = term.canonicalKey || (prior.coverageOrigin === "document" ? prior.key : undefined);
  // A precise approved vehicle-field label is stronger than a contradictory
  // extraction key. Never infer field identity from a number or the unit km.
  if (normalizeInsuranceType(insurance.type) === "bil") {
    const labelKey = normalizeTermName(term.name, { insuranceType: insurance.type });
    if (["kjoretoy.kilometerstand", "kjoretoy.avtalt_maks_kilometerstand", "kjoretoy.kjorelengde"].includes(labelKey)) return labelKey;
    if (["veihjelp.egenandel", "bilnokkel.egenandel", "bilnokkel.grense", "bilnokkel.antall_skader"].includes(labelKey)) return labelKey;
    const product = normalizeWords(insurance.canonicalProductName ?? insurance.productName ?? "");
    if (product && [...totalskadeLabels].some(label => normalizeWords(term.name) === `${label} ${product}`)) {
      return "nyverdi.grenser";
    }
  }
  const objectType = vehicleObjectType(normalizeInsuranceType(insurance.type));
  if (objectType && canonicalKey && !canonicalKey.startsWith("premie.") &&
      !(canonicalKey.startsWith(`${objectType.prefix}.`) && vehicleObjectFactKeys.some((key) => key === canonicalKey))) {
    return normalizeTermName(term.name, { insuranceType: insurance.type, relatedCoverageParentKeys });
  }
  if (canonicalKey) {
    // A generic repair key from extraction must not override an exact, scoped
    // scenario label. No inference from day counts or free-form value text.
    if (normalizeInsuranceType(insurance.type) === "bil" && canonicalKey === "leiebil.dager") {
      const scenario = normalizeTermName(term.name, {
        insuranceType: insurance.type, relatedCoverageParentKeys,
        structuredCoverageContext: relatedCoverageParentKeys.includes("leiebil.dekning"), termValue: term.value,
      });
      if (["leiebil.kondemnasjon", "leiebil.teknisk", "leiebil.feriereise", "leiebil.tyveri"].includes(scenario)) return scenario;
    }
    return normalizeCatalogTermKey(canonicalKey);
  }
  return normalizeCatalogTermKey(normalizeTermName(term.name, {
    insuranceType: insurance.type,
    relatedCoverageParentKeys,
    structuredCoverageContext: relatedCoverageParentKeys.length > 0,
    termValue: term.value,
  }));
}

function extractedTerm(
  key: string | undefined,
  name: string,
  value: string,
  original?: Partial<DocumentFact>,
): DocumentFact {
  return {
    name,
    value,
    key,
    coverageOrigin: "document",
    ...(original?.source ? { source: original.source } : {}),
    ...(original?.sources ? { sources: original.sources } : {}),
  };
}

function valueMatch(value: string, pattern: RegExp): string | null {
  return value.match(pattern)?.[0]?.trim() ?? null;
}

const maskinskadeCompoundLabels = new Set([
  "varighet",
  "varighet og kilometergrense",
  "alder og kilometergrense",
]);

function compoundDetails(
  term: DocumentFact,
  insuranceType: string,
  relatedCoverageParentKeys: readonly string[] = [],
): DocumentFact[] {
  if (normalizeInsuranceType(insuranceType) !== "bil") return [];
  const result: DocumentFact[] = [];
  const scopedValue = coverageLimitSection(term.value);
  const add = (key: string, name: string, pattern: RegExp) => {
    const value = valueMatch(scopedValue, pattern);
    if (value) result.push(extractedTerm(key, name, value, term));
  };

  const maskinskadeContext = term.key === "maskinskade.dekning" ||
    term.key === "maskinskade.varighet" ||
    (relatedCoverageParentKeys.includes("maskinskade.dekning") &&
      maskinskadeCompoundLabels.has(normalizeWords(term.name)));
  if (maskinskadeContext) {
    add("maskinskade.alder", "Maskinskade – alder", yearLimit);
    add("maskinskade.km", "Maskinskade – kilometer", kilometerLimit);
  }
  if (term.key === "bilnokkel.dekning") {
    const sum = /(?:forsikringssum|erstatningsgrense|inntil|opptil)\s*[:=]?\s*((?:\d{1,3}(?:[ .]\d{3})+|\d+)\s*(?:kr|kroner)?)/iu.exec(scopedValue)?.[1];
    const deductible = /egenandel\s*(?:er|på|:)\s*((?:\d{1,3}(?:[ .]\d{3})+|\d+)\s*(?:kr|kroner)?)/iu.exec(scopedValue)?.[1] ??
      /egenandel\s+((?:\d{1,3}(?:[ .]\d{3})+|\d+)\s*(?:kr|kroner)?)/iu.exec(scopedValue)?.[1];
    const count = /(?:maks(?:imalt)?\.?\s+)?(?:ett|én|en|\d+)\s+skadetilfell(?:e|er)(?:\s+(?:pr\.?|per)\s+forsikringsår)?/iu.exec(scopedValue)?.[0];
    if (sum) result.push(extractedTerm("bilnokkel.grense", "Bilnøkkel – forsikringssum", sum.trim(), term));
    else if (!/egenandel/iu.test(scopedValue)) add("bilnokkel.grense", "Bilnøkkel – forsikringssum", amount);
    if (deductible) result.push(extractedTerm("bilnokkel.egenandel", "Bilnøkkel – egenandel", deductible.trim(), term));
    if (count) result.push(extractedTerm("bilnokkel.antall_skader", "Bilnøkkel – skadetilfeller", count, term));
  }
  if (totalskadeLabels.has(normalizeWords(term.name))) {
    add("nyverdi.alder", "Totalskadegaranti – alder", yearLimit);
    add("nyverdi.km", "Totalskadegaranti – kilometer", kilometerLimit);
  }
  if (term.key === "nyverdi.grenser" ||
    (["nyverdi.alder", "nyverdi.km"].includes(term.key ?? "") &&
      valueMatch(term.value, yearLimit) && valueMatch(term.value, kilometerLimit))) {
    add("nyverdi.alder", "Totalskadegaranti – alder", yearLimit);
    add("nyverdi.km", "Totalskadegaranti – kilometer", kilometerLimit);
  }
  return result;
}

function explicitCoverageStatuses(text: string, insuranceType: string): DocumentFact[] {
  const normalized = normalizeWords(text);
  const result: DocumentFact[] = [];
  for (const coverage of relatedCoveragesForInsuranceType(insuranceType)) {
    const aliases = new Set([coverage.label, ...(coverage.aliases ?? [])]);
    for (const alias of aliases) {
      const label = normalizeWords(alias);
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&").replace(/\s+/gu, "\\s+");
      const negative = new RegExp(`(?:^|\\s)${escaped}(?:\\s+er)?\\s+ikke\\s+(?:valgt|inkludert)(?:\\s|$)`, "u");
      const positive = new RegExp(`(?:^|\\s)${escaped}(?:\\s+er)?\\s+(?:valgt|inkludert)(?:\\s|$)`, "u");
      if (negative.test(normalized)) {
        result.push(extractedTerm(coverage.parentKey, coverage.label, `${coverage.label} er ikke valgt`));
        break;
      }
      if (positive.test(normalized)) {
        result.push(extractedTerm(coverage.parentKey, coverage.label, `${coverage.label} er valgt`));
        break;
      }
    }
  }
  return result;
}

const nextBilFact = /\b(?:maskinskade|maskin og elektronikkdekning|motor og girskade|totalskadegaranti|nyverdierstatning|nybilgaranti|bilnøkkel|leiebil|parkeringsskade|punkteringsskade|veihjelp)\b/iu;

// Object mileage is never a coverage limit. Stop at an explicit new field,
// also when extraction flattens headings into a single sentence without punctuation.
const vehicleFactBoundary = /\b(?:årlig\s+kjørelengde|kjørelengde|(?:avtalt\s+)?maksimal\s+kilometerstand|(?:faktisk|nåværende|avlest)\s+kilometerstand|kilometerstand|førstegangsregistrering)\b/iu;
function coverageLimitSection(value: string): string {
  const text = value.replace(/^\s*(?:totalskadegaranti|nyverdierstatning|nybilgaranti|maskinskade|maskin og elektronikkdekning|motor og girskade)\s*[:–-]?\s*/iu, "");
  const boundaries = [text.search(vehicleFactBoundary), text.search(nextBilFact)].filter((index) => index >= 0);
  return text.slice(0, boundaries.length ? Math.min(...boundaries) : undefined);
}

function boundedSection(text: string, label: RegExp): string | null {
  const labelMatch = label.exec(text);
  if (!labelMatch || labelMatch.index === undefined) return null;
  const remainder = text.slice(labelMatch.index + labelMatch[0].length, labelMatch.index + labelMatch[0].length + 320);
  const boundaries = [
    remainder.search(/[;\n]/u),
    remainder.search(/\.(?:\s|$)/u),
    remainder.search(nextBilFact),
    remainder.search(vehicleFactBoundary),
  ].filter((index) => index >= 0);
  return remainder.slice(0, boundaries.length ? Math.min(...boundaries) : undefined);
}

function boundedLimitPair(
  text: string,
  label: RegExp,
): { age: string; kilometer: string } | null {
  const section = boundedSection(text, label);
  if (section === null) return null;
  const age = valueMatch(section, yearLimit);
  const kilometer = valueMatch(section, kilometerLimit);
  return age && kilometer ? { age, kilometer } : null;
}

function structuredBilSummaryFacts(summary: string): DocumentFact[] {
  const result: DocumentFact[] = [];
  const maskinskade = boundedLimitPair(
    summary,
    /\b(?:maskinskade|maskin og elektronikkdekning|motor og girskade)\b/iu,
  );
  if (maskinskade) {
    result.push(extractedTerm("maskinskade.alder", "Maskinskade – alder", maskinskade.age));
    result.push(extractedTerm("maskinskade.km", "Maskinskade – kilometer", maskinskade.kilometer));
  }
  const totalskade = boundedLimitPair(
    summary,
    /\b(?:totalskadegaranti|nyverdierstatning|nybilgaranti)\b/iu,
  );
  if (totalskade) {
    result.push(extractedTerm("nyverdi.alder", "Totalskadegaranti – alder", totalskade.age));
    result.push(extractedTerm("nyverdi.km", "Totalskadegaranti – kilometer", totalskade.kilometer));
  }
  const bilnokkelSection = boundedSection(summary, /\bbilnøkkel\b/iu);
  if (bilnokkelSection) {
    result.push(...compoundDetails(extractedTerm("bilnokkel.dekning", "Bilnøkkel", bilnokkelSection), "Bil"));
  }
  return result;
}

function summaryFacts(insurance: ExtractedInsurance): DocumentFact[] {
  const summary = insurance.coverageSummary;
  if (!summary) return [];
  const result = explicitCoverageStatuses(summary, insurance.type);
  if (normalizeInsuranceType(insurance.type) === "bil") {
    result.push(...structuredBilSummaryFacts(summary));
    const registration = summary.match(registrationYear)?.[1];
    if (registration) {
      result.push(extractedTerm(
        "kjoretoy.forstegangsregistrering",
        "Førstegangsregistrert",
        registration,
      ));
    }
  }
  return result;
}

function uniqueDocumentFacts(terms: DocumentFact[]): DocumentFact[] {
  const seen = new Map<string, DocumentFact>();
  for (const term of terms) {
    const identity = `${term.key ?? normalizeWords(term.name)}\u0000${normalizeWords(term.value)}`;
    const previous = seen.get(identity);
    if (!previous) { seen.set(identity, term); continue; }
    const sources = [...(previous.sources ?? (previous.source ? [previous.source] : [])), ...(term.sources ?? (term.source ? [term.source] : []))];
    if (sources.length) previous.sources = sources.filter((source, index) => sources.findIndex((candidate) => candidate.documentId === source.documentId && candidate.page === source.page && candidate.section === source.section) === index);
  }
  return [...seen.values()];
}

// Normaliseringen bruker bare eksplisitte, forsikringstypeavgrensede aliaser og
// mønstre. Den tolker sammensatte dokumentverdier til samme canonical feltnøkler
// som katalogen, slik at kundedokumentet kan få deterministisk forrang.
export function normalizeDocumentFacts(insurance: ExtractedInsurance): DocumentFact[] {
  const addOnContexts = new Map<string, Set<string>>();
  for (const addOn of insurance.addOns ?? []) {
    const parentKey = normalizeTermName(addOn.name, { insuranceType: insurance.type });
    if (!relatedCoveragesForInsuranceType(insurance.type).some((coverage) => coverage.parentKey === parentKey)) continue;
    for (const term of addOn.importantTerms) {
      const identity = `${normalizeWords(term.name)}\u0000${normalizeWords(term.value)}`;
      const contexts = addOnContexts.get(identity) ?? new Set<string>();
      contexts.add(parentKey);
      addOnContexts.set(identity, contexts);
    }
  }
  const originals = insurance.importantTerms.map((term) => {
    const identity = `${normalizeWords(term.name)}\u0000${normalizeWords(term.value)}`;
    const relatedCoverageParentKeys = [...(addOnContexts.get(identity) ?? [])];
    const key = explicitKey(term, insurance, relatedCoverageParentKeys);
    // Bare eksplisitt kjente, strukturerte nøkler festes til råfeltet. Ukjente
    // etiketter må fortsatt kunne normaliseres med sammenligningskontekst.
    const normalized = extractedTerm(
      key.includes(".") ? key : undefined,
      term.name,
      term.value,
      term as Partial<DocumentFact>,
    );
    return { term: normalized, relatedCoverageParentKeys };
  });
  const derived = originals.flatMap(({ term, relatedCoverageParentKeys }) => [
    ...compoundDetails(term, insurance.type, relatedCoverageParentKeys),
    ...explicitCoverageStatuses(term.value, insurance.type),
  ]);
  const premiumLabels: Record<string, string> = {
    "premie.total": "Årspremie inkl. trafikkforsikringsavgift",
    "premie.ekskl_tfa": "Premie ekskl. trafikkforsikringsavgift",
    "premie.tfa": "Trafikkforsikringsavgift",
  };
  const normalizedOriginals = originals.flatMap(({ term }) => {
    // En sammensatt grense feilplassert på alder/km må ikke bli stående som
    // en konkurrerende effektiv verdi etter at den er splittet.
    if (["nyverdi.alder", "nyverdi.km"].includes(term.key ?? "") &&
      valueMatch(term.value, yearLimit) && valueMatch(term.value, kilometerLimit)) {
      return [{ ...term, key: "nyverdi.grenser" }];
    }
    return [{ ...term, name: premiumLabels[term.key ?? ""] ?? term.name }];
  });
  // Explicit structured fields take precedence over a secondary summary-derived
  // limit. Conflicting explicit document values remain visible, never first-wins.
  const explicitLimitKeys = new Set([...normalizedOriginals, ...derived].filter((term) =>
    ["nyverdi.alder", "nyverdi.km", "maskinskade.alder", "maskinskade.km"].includes(term.key ?? "") &&
    valueMatch(term.value, term.key?.endsWith(".km") ? kilometerLimit : yearLimit)
  ).map((term) => term.key));
  const supplemental = summaryFacts(insurance).filter((term) => !explicitLimitKeys.has(term.key));
  return uniqueDocumentFacts([...normalizedOriginals, ...derived, ...supplemental]);
}
