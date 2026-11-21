#!/usr/bin/env node
/**
 * Generates NITO hus / hus-ekstra facts for nito-evidence.json from tryg-hus-catalog
 * keys, with values verified against member PDFs. Run after pdftotext -layout on
 * catalog/sources/tryg/member-agreements/nito-hus.pdf and nito-hus-ekstra.pdf.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trygHusFacts } from "../lib/tryg-hus-catalog.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = path.join(root, "catalog/tryg-member-agreements/nito-evidence.json");

const pdfText = {
  standard: readFileSync("/tmp/nito-hus.txt", "utf8").replace(/\s+/gu, " "),
  extra: readFileSync("/tmp/nito-hus-ekstra.txt", "utf8").replace(/\s+/gu, " "),
};

/** Member-specific text that must not be taken from ordinary Tryg Hus vilkår uten kontroll. */
const overrides = {
  extra: {
    "hus.forsikringsform": {
      label: "Forsikringsform",
      value:
        "Bygning Ekstra er en fullverdiforsikring. Utgangspunktet for erstatningen er kostnaden ved å gjenoppføre bygningen til samme eller vesentlig samme stand som umiddelbart før skaden.",
      page: 1,
      section: "Innledning – fullverdi",
    },
    "hus.forsikringssum": {
      value:
        "Forsikringssummen som står i forsikringsbeviset er utgangspunkt for prisberegning. Sumbegrensninger i vilkårene gjelder foran forsikringssummen i beviset. Forsikringssummen reguleres årlig etter Prisindeks for nye eneboliger (SSB).",
      page: 1,
      section: "Innledning – forsikringssum",
    },
    "hus.hage.grense": {
      value:
        "Skade på hageanlegg rundt bygning på forsikret eiendom og tilførselsvei på eiendommen er omfattet. Brygger og kaier regnes ikke som hageanlegg.",
      page: 1,
      section: "1.3 Hageanlegg og brygge",
    },
    "hus.pabud.grense": {
      value:
        "Merutgifter ved offentlige påbud er omfattet uten generell beløpsgrense i vilkåret. For fredede bygninger gjelder inntil 1 000 000 kroner.",
      page: 1,
      section: "1.5 Offentlige påbud",
    },
    "hus.naturskade.dekning": {
      value: "Naturskade er omfattet. Se vilkår for Naturskade, PGE90010.",
      page: 1,
      section: "1.7 Naturskade",
    },
    "hus.ansvar.dekning": {
      label: "Privatansvar",
      value: "Prrivat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.8 Privatansvar",
    },
    "hus.rettshjelp.dekning": {
      value: "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
      page: 1,
      section: "1.9 Rettshjelp",
    },
    "hus.tilpasning.grense": {
      value:
        "Nødvendige utgifter til tilpasning av hjemmet for rullestolbruker erstattes med inntil 250 000 kroner per forsikringstilfelle ved ulykkesskade i forsikringstiden med minst 50 % varig medisinsk invaliditet, eller barn født med tilsvarende invaliditet. Utgiftene må være påløpt innen 5 år; ingen egenandel.",
      page: 1,
      section: "1.10 Tilpasning for rullestolbruker",
    },
    "hus.vatrom.selverommet": {
      value:
        "Forsikringen dekker vannskade på våtrom som er en direkte følge av svak konstruksjon, materialfeil eller feilmontering når arbeidet er utført av godkjent/autorisert personell, vannskaden er oppstått mens forsikringen er i kraft og konstatert innen 15 år fra arbeidet ble utført. Materialfeil, feil utførelse eller mangelfullt arbeid uten konstatert følgeskade på våtrommet er ikke skade.",
      page: 3,
      section: "2.3 Våtromsdekning",
    },
    "hus.vann.egenandel.gjentatt_vann": {
      value:
        "Egenandelen økes med 20 000 kroner når bygningen i løpet av de siste 36 måneder har hatt en tilsvarende skade ved inntrengning fra terreng, gjennom flatt tak, balkong eller terrasse, eller utstrømming fra innvendige rør.",
      page: 3,
      section: "2.3 Egenandel",
    },
    "hus.hage.vaer": {
      value:
        "Skade på hageanlegg forårsaket av dyr, frost eller andre klimatiske forhold er unntatt; flomlignende situasjon dekkes.",
      page: 4,
      section: "2.6 Unntak – hageanlegg",
    },
    "hus.vann.egenandel.terreng_grunnvann": {
      value: "Ved skade som følge av vann fra terreng er egenandelen minimum 8 000 kroner.",
      page: 3,
      section: "2.3 Egenandel",
    },
    "hus.vaer.begrensning": {
      page: 4,
      section: "2.6 Unntak",
    },
    "hus.plutselig.dekning": {
      page: 4,
      section: "2.6 Følgende er dekket",
    },
  },
  standard: {
    "hus.ansvar.dekning": {
      label: "Privatansvar",
      value: "Privat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.8 Privatansvar",
    },
    "hus.forsikringsform": {
      label: "Forsikringsform",
      value:
        "Bygning kan være en fullverdi- eller førsterisikoforsikring. Det står i forsikringsbeviset hvis forsikringen er førsterisikoforsikring. Er dette ikke spesifisert, er bygningen fullverdiforsikret. Fullverdi tar utgangspunkt i gjenoppføring til samme eller vesentlig samme stand før skaden.",
      page: 1,
      section: "Innledning – fullverdi og førsterisiko",
    },
    "hus.forsikringssum": {
      value:
        "Forsikringssummen som står i forsikringsbeviset er utgangspunkt for prisberegning. Sumbegrensninger i vilkårene gjelder foran forsikringssummen i beviset. Forsikringssummen reguleres årlig etter Prisindeks for nye eneboliger (SSB).",
      page: 1,
      section: "Innledning – forsikringssum",
    },
    "hus.bygninger.utsmykning": {
      value: "Kunstnerisk utsmykning er ikke omfattet.",
      page: 1,
      section: "1.1 Bygninger – unntak",
      coverageAvailability: "unavailable",
    },
    "hus.hage.grense": {
      value:
        "Skade på hageanlegg rundt bygning på forsikret eiendom og tilførselsvei er omfattet. Brygger og kaier regnes ikke som hageanlegg og er ikke omfattet.",
      page: 1,
      section: "1.3 Hageanlegg og brygge",
    },
    "hus.pabud.grense": {
      value:
        "Merutgifter ved offentlige påbud er omfattet med inntil 2 000 000 kroner per skadetilfelle. Ved førsterisiko gjelder inntil 20 % av forsikringssummen, maksimalt 2 000 000 kroner.",
      page: 1,
      section: "1.5 Offentlige påbud",
    },
    "hus.naturskade.dekning": {
      value: "Naturskade er omfattet. Se vilkår for Naturskade, PGE90010.",
      page: 1,
      section: "1.7 Naturskade",
    },
    "hus.rettshjelp.dekning": {
      value: "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
      page: 1,
      section: "1.9 Rettshjelp",
    },
    "hus.takvegg.folgeskade": {
      value:
        "Plutselig inntrengning fra utvendige rør og gjennom åpning eller utetthet på grunn av annen dekningsmessig skade, samt vann direkte fra terreng eller grunn når det gir frittstående vann over laveste gulv, er dekket. Vann fra tak, takrenne og utvendig nedløp er unntatt.",
      page: 3,
      section: "2.3 Følgende er dekket / unntak",
    },
    "hus.vatrom.folgeskade": {
      value: "Skade ved vann fra utett våtrom, inkludert fra gulvsluk og oppforinger, er unntatt.",
      page: 3,
      section: "2.3 Unntak",
      coverageAvailability: "unavailable",
    },
    "hus.vatrom.selverommet": {
      value:
        "Skade på våtrom som skyldes at våtrommet er utett er unntatt. Med våtrom menes bygningskomponenter innenfor våtrommets bjelkelag og stenderverk.",
      page: 3,
      section: "2.3 Unntak",
      coverageAvailability: "unavailable",
    },
    "hus.vann.egenandel.terreng_grunnvann": {
      value: "Ved skade som følge av vann fra terreng eller grunn er egenandelen minimum 8 000 kroner.",
      page: 3,
      section: "2.3 Egenandel",
    },
    "hus.skadedyr.bygningsskade": {
      coverageAvailability: "unavailable",
    },
  },
};

const appendedReferenceFacts = {
  standard: [
    {
      key: "hus.naturskade.dekning",
      label: "Naturskade",
      value: "Naturskade er omfattet. Se vilkår for Naturskade, PGE90010.",
      page: 1,
      section: "1.7 Naturskade",
    },
    {
      key: "hus.ansvar.dekning",
      label: "Privatansvar",
      value: "Privat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.8 Privatansvar",
    },
    {
      key: "hus.rettshjelp.dekning",
      label: "Rettshjelp",
      value: "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
      page: 1,
      section: "1.9 Rettshjelp",
    },
  ],
  extra: [
    {
      key: "hus.naturskade.dekning",
      label: "Naturskade",
      value: "Naturskade er omfattet. Se vilkår for Naturskade, PGE90010.",
      page: 1,
      section: "1.7 Naturskade",
    },
    {
      key: "hus.ansvar.dekning",
      label: "Privatansvar",
      value: "Prrivat erstatningsansvar er omfattet. Se vilkår for Privatansvar, PGE90020.",
      page: 1,
      section: "1.8 Privatansvar",
    },
    {
      key: "hus.rettshjelp.dekning",
      label: "Rettshjelp",
      value: "Rettshjelp er omfattet. Se vilkår for Rettshjelp, PGE91500.",
      page: 1,
      section: "1.9 Rettshjelp",
    },
  ],
};

const legacyKeys = {
  standard: [
    {
      key: "hus.utvendige_ror",
      label: "Utvendige rør og ledninger",
      value:
        "Bygningens utvendige rør og ledninger med tilknyttet utstyr er omfattet. Brønn, borehull, drensledning, infiltrasjonsledning, spredeledning eller spredegrøft er ikke omfattet; drensledning er likevel omfattet ved brann og naturskade.",
      page: 1,
      section: "1.2 Utvendige rør og ledninger med tilknyttet utstyr",
    },
  ],
  extra: [
    {
      key: "hus.kunstnerisk_utsmykning",
      label: "Kunstnerisk utsmykning",
      value: "Kunstnerisk utsmykning på bygninger nevnt i forsikringsbeviset er omfattet.",
      page: 1,
      section: "1.1 Bygninger",
      coverageAvailability: "included",
    },
  ],
};

function toEvidence(facts, kind) {
  const patch = overrides[kind] ?? {};
  const mapped = facts.map(({ key, label, value, source, coverageAvailability }) => {
    const o = patch[key] ?? {};
    const entry = {
      key,
      label: o.label ?? label,
      value: o.value ?? value,
      page: o.page ?? source.page,
      section: o.section ?? source.section,
    };
    const availability = o.coverageAvailability ?? coverageAvailability;
    if (availability === "included" || availability === "unavailable") entry.coverageAvailability = availability;
    return entry;
  });
  const byKey = new Map(mapped.map((entry) => [entry.key, entry]));
  for (const entry of appendedReferenceFacts[kind]) byKey.set(entry.key, { ...byKey.get(entry.key), ...entry });
  return [...byKey.values(), ...legacyKeys[kind].filter((entry) => !byKey.has(entry.key))];
}

function assertInPdf(kind, facts) {
  const pdf = pdfText[kind];
  const failures = [];
  for (const fact of facts) {
    const snippet = fact.value.replace(/\s+/gu, " ").slice(0, 48).trim();
    if (snippet.length < 18) continue;
    const probe = snippet.slice(0, Math.min(20, snippet.length));
    if (!pdf.toLowerCase().includes(probe.toLowerCase())) failures.push({ key: fact.key, probe });
  }
  if (failures.length) {
    console.error(`PDF validation failed for ${kind}:`, failures);
    process.exit(1);
  }
}

const standardFacts = toEvidence(trygHusFacts.trygHus, "standard");
const extraFacts = toEvidence(trygHusFacts.trygHusExtra, "extra");

// Member PDFs do not document separate Tryg safety / IPID / generelle rows.
const dropPrefixes = ["hus.sikkerhet.", "hus.avtale.", "hus.geografi", "hus.bygninger.tilbehor"];
const dropKeys = new Set([
  "hus.naturskade.egenandel",
  "hus.naturskade.hage",
  "hus.naturskade.relokalisering",
  "hus.rettshjelp.grense",
  "hus.rettshjelp.egenandel",
]);
const filter = (facts, extraDrop = []) =>
  facts.filter(
    (f) =>
      !dropPrefixes.some((p) => f.key.startsWith(p) || f.key === p) &&
      !dropKeys.has(f.key) &&
      !extraDrop.includes(f.key),
  );

const husFacts = filter(standardFacts);
const husEkstraFacts = filter(extraFacts, ["hus.ror.frost", "hus.sprengning.egenandel"]);

assertInPdf("standard", husFacts.filter((f) => overrides.standard[f.key]));
assertInPdf("extra", husEkstraFacts.filter((f) => overrides.extra[f.key] || f.key === "hus.kunstnerisk_utsmykning"));

const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
const before = { hus: evidence.hus.facts.length, "hus-ekstra": evidence["hus-ekstra"].facts.length };
evidence.hus.facts = husFacts;
evidence["hus-ekstra"].facts = husEkstraFacts;
evidence.hus.pages = 9;
evidence["hus-ekstra"].pages = 10;
writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);

console.log(
  JSON.stringify({
    hus: { before: before.hus, after: husFacts.length },
    "hus-ekstra": { before: before["hus-ekstra"], after: husEkstraFacts.length },
  }),
);