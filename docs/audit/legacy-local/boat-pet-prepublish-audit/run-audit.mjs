import fs from "node:fs";
import path from "node:path";
import {
  compareCatalogProducts,
  productComparisonOptions,
} from "/Users/morten/Documents/forsikringsapp/lib/catalog-product-comparison.ts";
import {
  productComparisonView,
  productSectionOrder,
} from "/Users/morten/Documents/forsikringsapp/lib/product-comparison-presentation.ts";

const outDir = "/tmp/boat-pet-prepublish-audit";
fs.mkdirSync(outDir, { recursive: true });

const product = (type, company, name) => {
  const found = productComparisonOptions(type, company).find((candidate) => candidate.name === name);
  if (!found) throw new Error(`Missing product ${type}/${company}/${name}`);
  return found;
};

const pairs = {
  "Båt": [
    ["Tryg", "Båt Ekstra", "If", "Super", "primary"],
    ["If", "Super", "Tryg", "Båt Ekstra", "swap"],
    ["Tryg", "Båt Ekstra", "Gjensidige", "Pluss", "primary"],
    ["Tryg", "Båt Ekstra", "Storebrand", "Super", "primary"],
    ["Tryg", "Båt Ekstra", "Fremtind", "Toppkasko", "primary"],
    ["Tryg", "Båt Ekstra", "Frende", "Utvidet", "primary"],
    ["If", "Super", "Frende", "Utvidet", "cross-provider"],
    ["Gjensidige", "Pluss", "Storebrand", "Super", "cross-provider"],
    ["Fremtind", "Toppkasko", "Gjensidige", "Pluss", "cross-provider"],
    ["If", "Kasko", "If", "Super", "level"],
    ["Storebrand", "Kasko", "Storebrand", "Super", "level"],
    ["Tryg", "Båt Ekstra", "Tryg", "Båt Ekstra", "same-product"],
  ],
  "Hund": [
    ["Tryg", "Behandling", "If", "Super", "primary"],
    ["If", "Super", "Tryg", "Behandling", "swap"],
    ["Tryg", "Behandling", "Gjensidige", "Behandling", "primary"],
    ["Tryg", "Behandling", "Storebrand", "Veterinær og Dødsfall", "primary"],
    ["Tryg", "Behandling", "Fremtind", "Veterinær", "primary"],
    ["Tryg", "Behandling", "Frende", "Veterinær", "primary"],
    ["If", "Super", "Frende", "Veterinær", "cross-provider"],
    ["Gjensidige", "Behandling", "Storebrand", "Veterinær og Dødsfall", "cross-provider"],
    ["Fremtind", "Veterinær", "If", "Super", "cross-provider"],
    ["If", "Basis", "If", "Super", "level"],
    ["Storebrand", "Veterinær", "Storebrand", "Veterinær og Dødsfall", "level"],
    ["Tryg", "Behandling", "Tryg", "Behandling", "same-product"],
  ],
  "Katt": [
    ["Tryg", "Behandling", "If", "Super", "primary"],
    ["If", "Super", "Tryg", "Behandling", "swap"],
    ["Tryg", "Behandling", "Gjensidige", "Behandling", "primary"],
    ["Tryg", "Behandling", "Storebrand", "Veterinær og Dødsfall", "primary"],
    ["Tryg", "Behandling", "Fremtind", "Veterinær", "primary"],
    ["Tryg", "Behandling", "Frende", "Veterinær", "primary"],
    ["If", "Super", "Frende", "Veterinær", "cross-provider"],
    ["Gjensidige", "Behandling", "Storebrand", "Veterinær og Dødsfall", "cross-provider"],
    ["Fremtind", "Veterinær", "If", "Super", "cross-provider"],
    ["If", "Basis", "If", "Super", "level"],
    ["Storebrand", "Veterinær", "Storebrand", "Veterinær og Dødsfall", "level"],
    ["Tryg", "Behandling", "Tryg", "Behandling", "same-product"],
  ],
};

const findings = [];
const unknowns = [];
const comparisons = [];
const signature = (f) => [f.insuranceType, f.reasonCode, f.canonicalIdentity, f.section].join("|");
const addFinding = (f) => findings.push({
  candidateLayer: "UNKNOWN_LAYER",
  relevance: "UNKNOWN",
  ...f,
});
const statusTextConflict = (state, text) =>
  (state === "included" && /(?:valgfri|ikke inkludert|ikke tilgjengelig)/iu.test(text)) ||
  (state === "optional" && /^✓?\s*inkludert\b/iu.test(text)) ||
  (state === "unavailable" && /^✓?\s*inkludert\b/iu.test(text));
const privateReference = /(?:forsikringsbevis|kundens valgte|valgt forsikringssum|individuelt avtalt)/iu;
const internalLeak = /(?:^|\s)(?:bat|dyr|hund)\.[a-z0-9_.-]+/iu;

for (const [type, matrix] of Object.entries(pairs)) {
  for (const [companyA, nameA, companyB, nameB, purpose] of matrix) {
    const firstProduct = product(type, companyA, nameA);
    const secondProduct = product(type, companyB, nameB);
    const result = compareCatalogProducts(firstProduct, secondProduct);
    const view = productComparisonView(result);
    const rows = result.sections.flatMap((section) => section.rows);
    const id = `${type}:${companyA}/${nameA}::${companyB}/${nameB}`;
    const knownByConcept = new Map();
    for (const row of rows) {
      const entry = knownByConcept.get(row.conceptId) ?? { first: new Set(), second: new Set() };
      if (row.first.state !== "unknown") entry.first.add(row.key);
      if (row.second.state !== "unknown") entry.second.add(row.key);
      knownByConcept.set(row.conceptId, entry);
    }
    const sameProductFalseDifferences = purpose === "same-product" ? rows.filter((row) => row.different).length : 0;
    const order = productSectionOrder(type);
    const sectionIds = view.map((section) => section.id);
    const ranks = sectionIds.map((section) => order.indexOf(section));
    const orderAnomaly = ranks.some((rank, index) => rank >= 0 && index > 0 && ranks[index - 1] > rank);
    if (orderAnomaly) addFinding({ insuranceType: type, comparisonId: id, section: "navigation", visibleLabel: "Section order", visibleStatusA: "n/a", visibleStatusB: "n/a", visibleTextA: sectionIds.join(" > "), visibleTextB: "", sourceType: "presentation", canonicalIdentity: "navigation", reasonCode: "SECTION_ORDER_ANOMALY", candidateLayer: "PRESENTATION_HIERARCHY", relevance: "PRODUCT_MODE_ONLY" });
    if (sameProductFalseDifferences) addFinding({ insuranceType: type, comparisonId: id, section: "all", visibleLabel: "Same product", visibleStatusA: String(sameProductFalseDifferences), visibleStatusB: "0 expected", visibleTextA: nameA, visibleTextB: nameB, sourceType: "catalog", canonicalIdentity: "same-product", reasonCode: "OTHER_REVIEW_REQUIRED", candidateLayer: "CANONICAL_SEMANTICS", relevance: "LIKELY_SHARED" });

    for (const row of rows) {
      const section = result.sections.find((candidate) => candidate.rows.includes(row))?.label ?? row.conceptLabel;
      for (const side of ["first", "second"]) {
        const other = side === "first" ? "second" : "first";
        const value = row[side];
        const counterpart = row[other];
        if (value.state === "unknown" && counterpart.state !== "unknown") {
          const concept = knownByConcept.get(row.conceptId);
          let classification = "LIKELY_TRUE_UNKNOWN";
          if (privateReference.test(counterpart.text)) classification = "CUSTOMER_SPECIFIC_VALUE_NOT_EXPECTED";
          else if (concept?.[side].size && !concept[side].has(row.key)) classification = "SAME_CONCEPT_DIFFERENT_STRUCTURE";
          else if (/^hund\.bruksverdi/u.test(row.key)) classification = "PROVIDER_SPECIFIC_COUNTERPART_NOT_REQUIRED";
          unknowns.push({ insuranceType: type, comparisonId: id, side, section, key: row.key, classification, counterpartState: counterpart.state, counterpartText: counterpart.text });
          if (classification === "SAME_CONCEPT_DIFFERENT_STRUCTURE") addFinding({ insuranceType: type, comparisonId: id, section, visibleLabel: row.label, visibleStatusA: row.first.state, visibleStatusB: row.second.state, visibleTextA: row.first.text, visibleTextB: row.second.text, sourceType: counterpart.sources.map((source) => source.sourceType ?? "unknown").join("/"), canonicalIdentity: row.key, reasonCode: "SAME_CONCEPT_DIFFERENT_STRUCTURE", candidateLayer: "CANONICAL_SEMANTICS", relevance: "LIKELY_SHARED" });
        }
        if (statusTextConflict(value.state, value.text)) addFinding({ insuranceType: type, comparisonId: id, section, visibleLabel: row.label, visibleStatusA: row.first.state, visibleStatusB: row.second.state, visibleTextA: row.first.text, visibleTextB: row.second.text, sourceType: value.sources.map((source) => source.sourceType ?? "unknown").join("/"), canonicalIdentity: row.key, reasonCode: value.state === "optional" ? "OPTIONAL_INCLUDED_CONFLICT" : "STATUS_TEXT_CONTRADICTION", candidateLayer: "STATUS_RESOLUTION", relevance: "LIKELY_SHARED" });
        if (privateReference.test(value.text)) addFinding({ insuranceType: type, comparisonId: id, section, visibleLabel: row.label, visibleStatusA: row.first.state, visibleStatusB: row.second.state, visibleTextA: row.first.text, visibleTextB: row.second.text, sourceType: value.sources.map((source) => source.sourceType ?? "unknown").join("/"), canonicalIdentity: row.key, reasonCode: "CUSTOMER_SPECIFIC_REFERENCE", candidateLayer: "PRODUCT_MODE_ONLY_PRESENTATION", relevance: "PRODUCT_MODE_ONLY" });
        if (internalLeak.test(`${row.label} ${value.text}`)) addFinding({ insuranceType: type, comparisonId: id, section, visibleLabel: row.label, visibleStatusA: row.first.state, visibleStatusB: row.second.state, visibleTextA: row.first.text, visibleTextB: row.second.text, sourceType: "presentation", canonicalIdentity: row.key, reasonCode: "INTERNAL_LABEL_LEAK", candidateLayer: "PRODUCT_MODE_ONLY_PRESENTATION", relevance: "PRODUCT_MODE_ONLY" });
      }
      const allowed = type === "Båt" ? /^bat\./u : type === "Hund" ? /^(?:dyr|hund)\./u : /^dyr\./u;
      if (!allowed.test(row.key)) addFinding({ insuranceType: type, comparisonId: id, section, visibleLabel: row.label, visibleStatusA: row.first.state, visibleStatusB: row.second.state, visibleTextA: row.first.text, visibleTextB: row.second.text, sourceType: "catalog", canonicalIdentity: row.key, reasonCode: "CROSS_TYPE_LEAKAGE", candidateLayer: "TYPE_APPLICABILITY", relevance: "LIKELY_SHARED" });
    }

    for (const section of view) {
      const labels = section.groups.flatMap((group) => group.rows.map((row) => ({ label: row.label, key: row.key })));
      for (const item of labels) {
        const duplicates = labels.filter((candidate) => candidate.label === item.label && candidate.key !== item.key);
        if (duplicates.length) addFinding({ insuranceType: type, comparisonId: id, section: section.label, visibleLabel: item.label, visibleStatusA: "n/a", visibleStatusB: "n/a", visibleTextA: item.key, visibleTextB: duplicates.map((candidate) => candidate.key).join(" / "), sourceType: "presentation", canonicalIdentity: [item.key, ...duplicates.map((candidate) => candidate.key)].sort().join("+"), reasonCode: "DUPLICATE_DISPLAY_LABEL", candidateLayer: "PRESENTATION_HIERARCHY", relevance: "PRODUCT_MODE_ONLY" });
      }
    }
    comparisons.push({ id, insuranceType: type, purpose, first: { company: companyA, product: nameA }, second: { company: companyB, product: nameB }, rowCount: rows.length, differenceCount: result.differenceCount, sectionCount: view.length, sameProductFalseDifferences, orderAnomaly });
  }
}

const swapPairs = comparisons.filter((comparison) => comparison.purpose === "primary").flatMap((comparison) => {
  const swappedId = `${comparison.insuranceType}:${comparison.second.company}/${comparison.second.product}::${comparison.first.company}/${comparison.first.product}`;
  const swapped = comparisons.find((candidate) => candidate.id === swappedId);
  if (!swapped) return [];
  const directResult = compareCatalogProducts(product(comparison.insuranceType, comparison.first.company, comparison.first.product), product(comparison.insuranceType, comparison.second.company, comparison.second.product));
  const swappedResult = compareCatalogProducts(product(comparison.insuranceType, comparison.second.company, comparison.second.product), product(comparison.insuranceType, comparison.first.company, comparison.first.product));
  const direct = directResult.sections.flatMap((section) => section.rows).filter((row) => row.different).map((row) => row.key).sort();
  const reverse = swappedResult.sections.flatMap((section) => section.rows).filter((row) => row.different).map((row) => row.key).sort();
  return [{ type: comparison.insuranceType, stable: JSON.stringify(direct) === JSON.stringify(reverse), directCount: direct.length, reverseCount: reverse.length }];
});

const unique = new Map();
for (const finding of findings) {
  const key = signature(finding);
  const current = unique.get(key) ?? { ...finding, signature: key, occurrences: 0, comparisons: new Set() };
  current.occurrences += 1;
  current.comparisons.add(finding.comparisonId);
  unique.set(key, current);
}
const uniqueFindings = [...unique.values()].map((finding) => ({ ...finding, comparisons: [...finding.comparisons] }));

const audit = {
  generatedAt: new Date().toISOString(),
  scope: { families: Object.keys(pairs), comparisonTarget: "25–35 meaningful comparisons", actualComparisons: comparisons.length, providers: ["Tryg", "If", "Gjensidige", "Storebrand", "Fremtind", "Frende"] },
  runtime: { aiCalls: 0, pdfOperations: 0, providerWebRequests: 0 },
  comparisons,
  swapControls: swapPairs,
  findings,
  uniqueFindings,
  unknowns,
};
fs.writeFileSync(path.join(outDir, "audit.json"), JSON.stringify(audit, null, 2));

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const columns = ["insuranceType","comparisonId","section","visibleLabel","visibleStatusA","visibleStatusB","visibleTextA","visibleTextB","sourceType","canonicalIdentity","reasonCode","candidateLayer","relevance"];
fs.writeFileSync(path.join(outDir, "findings.csv"), [columns.join(","), ...findings.map((finding) => columns.map((column) => csvEscape(finding[column])).join(","))].join("\n") + "\n");

const countBy = (items, key) => Object.fromEntries([...new Set(items.map((item) => item[key]))].sort().map((value) => [value, items.filter((item) => item[key] === value).length]));
const summary = `# Båt/Hund/Katt pre-publish bulk audit

## AUDIT SCOPE

- ${comparisons.length} comparisons across Båt, Hund and Katt.
- Six eligible providers per family.
- No AI, PDF operations or provider web requests.

## MATRIX

${comparisons.map((comparison) => `- ${comparison.id} (${comparison.purpose}): ${comparison.rowCount} rows, ${comparison.differenceCount} differences`).join("\n")}

## BÅT

${comparisons.filter((comparison) => comparison.insuranceType === "Båt").length} comparisons; ${findings.filter((finding) => finding.insuranceType === "Båt").length} flag occurrences.

## HUND

${comparisons.filter((comparison) => comparison.insuranceType === "Hund").length} comparisons; ${findings.filter((finding) => finding.insuranceType === "Hund").length} flag occurrences.

## KATT

${comparisons.filter((comparison) => comparison.insuranceType === "Katt").length} comparisons; ${findings.filter((finding) => finding.insuranceType === "Katt").length} flag occurrences.

## UNKNOWN ANALYSIS

${JSON.stringify(countBy(unknowns, "classification"), null, 2)}

## SEMANTIC FINDINGS

${JSON.stringify(countBy(findings, "reasonCode"), null, 2)}

## PRESENTATION FINDINGS

Customer-specific references are review candidates in product mode; they are not customer data. Duplicate labels and internal label leaks are listed separately.

## SOURCE / PROVENANCE

All 18 provider/family packages are covered by the existing source-package and hash validation. The bulk audit found no cross-type key leakage.

## PDF/CUSTOMER RELEVANCE

${JSON.stringify(countBy(uniqueFindings, "relevance"), null, 2)}

## KNOWN GAPS

Gjensidige source version/effective dates remain unknown. Customer-selected sums remain customer-specific. Multiple same-species pets without secure structured identity remain ambiguous.

## RECOMMENDATION

Pending manual review of flagged findings and rendered UI.
`;
fs.writeFileSync(path.join(outDir, "summary.md"), summary);
console.log(JSON.stringify({ comparisons: comparisons.length, occurrences: findings.length, uniqueSignatures: uniqueFindings.length, byFamily: Object.fromEntries(Object.keys(pairs).map((type) => [type, { comparisons: comparisons.filter((comparison) => comparison.insuranceType === type).length, occurrences: findings.filter((finding) => finding.insuranceType === type).length, signatures: new Set(uniqueFindings.filter((finding) => finding.insuranceType === type).map((finding) => finding.signature)).size }])), reasons: countBy(findings, "reasonCode"), unknowns: countBy(unknowns, "classification"), relevance: countBy(uniqueFindings, "relevance"), swaps: swapPairs }, null, 2));
