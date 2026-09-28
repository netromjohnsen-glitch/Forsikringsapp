import type { DocumentFact } from "./document-fact-normalization.ts";

// Only a named coverage's own explicit limit clause may create a child limit.
// Numbers in equipment, deductibles, purchase eligibility or sibling benefits
// never supply a coverage limit. Unknown prose is retained without interpretation.
export function mcBobilCompoundFacts(term: DocumentFact, type: string): DocumentFact[] {
  if (type !== "mc" && type !== "bobil") return [];
  const family = term.key?.split(".")[0];
  if (family !== "maskinskade" && family !== "nyverdi") return [];
  if (!term.key || ![`${family}.dekning`, `${family}.varighet`, `${family}.grenser`, `${family}.alder`, `${family}.km`].includes(term.key)) return [];
  const cut = term.value.search(/\b(?:egenandel|aldersfradrag|kilometerfradrag|kan\s+(?:kjøpes|tegnes|bestilles)|ved\s+(?:kjøp|tegning)|kjøpsgrense|årlig\s+kjørelengde|faktisk\s+kilometerstand|kilometerstand\s+ved|fukt|ferieavbrudd|feriegaranti|leiebil|fastmontert|kjøreutstyr)\b/iu);
  let clause = cut >= 0 ? term.value.slice(0, cut) : term.value;
  const other = family === "maskinskade" ? /\b(?:totalskadegaranti|nyverdierstatning)\b/iu : /\b(?:maskinskade|motor[- ]+og\s+girskade)\b/iu;
  const sibling = clause.search(other);
  if (sibling >= 0) clause = clause.slice(0, sibling);
  // An eligibility/range/table is not a coverage expiry. Avoid partial parsing
  // of multi-limit text; such text remains available in its original fact.
  if (/\b(?:mellom|fra|over)\s+\d|\d\s*[–—-]\s*\d/iu.test(clause)) return [];
  const age = /\d{1,2}\s*år(?:\s+(?:etter|fra)\s+(?:første\s+registrering|førstegangsregistrering))?/giu;
  const km = /(?:(?:inntil|under|maks(?:imalt)?)\s+)?\d[\d .\u00a0\u202f]*\s*(?:km|kilometer)\b/giu;
  const ages = [...clause.matchAll(age)], kms = [...clause.matchAll(km)];
  if (ages.length !== 1 || kms.length !== 1) return [];
  // Require an explicit limit grammar; an object's actual age/mileage or a
  // purchase eligibility sentence is not an expiry rule. Keep the entire
  // qualifier (especially renewal timing), rather than reducing it to a year.
  const prefix = clause.slice(0, ages[0].index).trim();
  const simple = /^(?:(?:gjelder(?:\s+for\s+(?:kjøretøy|bobil|motorsykkel))?|dekker)\s+)?(?:inntil|under|innen|til|maks(?:imalt)?)\s*(?:(?:kjøretøyet|bobilen|motorsykkelen)\s+(?:er|fyller|har\s+blitt)\s*)?$/iu;
  const renewal = /^(?:til\s+)?første\s+hovedforfall\s+etter(?:\s+at\s+(?:kjøretøyet|bobilen|motorsykkelen)\s+(?:er|fyller|har\s+blitt))?$/iu;
  const compact = !prefix && /\.(?:grenser|varighet|alder|km)$/u.test(term.key);
  if (!simple.test(prefix) && !renewal.test(prefix) && !compact) return [];
  const ageValue = clause.slice(0, ages[0].index + ages[0][0].length).trim();
  return [["alder", ageValue], ["km", kms[0][0].trim()]].map(([suffix, value]) => ({
    ...term, key: `${family}.${suffix}`, name: `${family === "nyverdi" ? "Totalskadegaranti" : "Maskinskade"} – ${suffix === "alder" ? "aldersgrense" : "kilometergrense"}`, value,
  }));
}
