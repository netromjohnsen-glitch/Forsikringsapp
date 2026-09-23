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
const kilometerLimit = /\b\d{1,3}(?:[ .]\d{3})+\s*(?:km|kilometer)\b/iu;
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
  if (term.canonicalKey) return normalizeCatalogTermKey(term.canonicalKey);
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
  const add = (key: string, name: string, pattern: RegExp) => {
    const value = valueMatch(term.value, pattern);
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
    add("bilnokkel.grense", "Bilnøkkel – forsikringssum", amount);
  }
  if (totalskadeLabels.has(normalizeWords(term.name))) {
    add("nyverdi.alder", "Totalskadegaranti – alder", yearLimit);
    add("nyverdi.km", "Totalskadegaranti – kilometer", kilometerLimit);
  }
  if (term.key === "nyverdi.grenser") {
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

function boundedSection(text: string, label: RegExp): string | null {
  const labelMatch = label.exec(text);
  if (!labelMatch || labelMatch.index === undefined) return null;
  const remainder = text.slice(labelMatch.index + labelMatch[0].length, labelMatch.index + labelMatch[0].length + 320);
  const boundaries = [
    remainder.search(/[;\n]/u),
    remainder.search(/\.(?:\s|$)/u),
    remainder.search(nextBilFact),
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
  const bilnokkel = bilnokkelSection?.match(amount)?.[0];
  if (bilnokkel) {
    result.push(extractedTerm("bilnokkel.grense", "Bilnøkkel – forsikringssum", bilnokkel));
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
  const seen = new Set<string>();
  return terms.filter((term) => {
    const identity = `${term.key ?? normalizeWords(term.name)}\u0000${normalizeWords(term.value)}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
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
  return uniqueDocumentFacts([...originals.map(({ term }) => term), ...derived, ...summaryFacts(insurance)]);
}
