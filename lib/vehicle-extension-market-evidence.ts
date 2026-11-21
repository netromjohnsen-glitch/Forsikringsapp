import { addVerifiedCaravanMarketEvidence } from "./verified-caravan-market-evidence.ts";
import { addVerifiedMcBobilMarketEvidence } from "./verified-mc-bobil-market-evidence.ts";
import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [
  key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "deductibleClassification" | "coverageAvailability" | "replacesBase">,
];

type ReviewedVehicleTerms = {
  id: string;
  sha256: string;
  url: string;
  effectiveFrom: string;
  termsNumber: string;
  providerId: string;
  insuranceType: string;
  version: string | null;
};

const gjensidigeDocuments = [
  ["gjensidige-tilhenger-delkasko", "tilhenger-delkasko-alminnelige-vilkar.pdf", "9154b1ee38457ccf602854819c21fea4374c7265172a6d39bbd28775299209fc", "Tilhenger"],
  ["gjensidige-tilhenger-kasko", "tilhenger-kasko-alminnelige-vilkar.pdf", "2c2f5b4a59d6dbe6564257319224d841e065eada4dab5f9c04ee05c6c3413328", "Tilhenger"],
  ["gjensidige-campingvogn-delkasko", "Campingvogn-Delkasko-alminnelige-vilkar.pdf", "aac62443966b522b04903f765eb31376b8a48cddd39d14781d447bcaa82677de", "Campingvogn"],
  ["gjensidige-campingvogn-kasko", "Campingvogn-Kasko-alminnelige-vilkar.pdf", "fb61c6696cbf3a12067cef1b71f73b6562c37495151268fe769d4520b7ac4194", "Campingvogn"],
  ["gjensidige-campingvogn-pluss", "Campingvogn-Pluss-alminnelige-vilkar.pdf", "129827ede6156025a74dae49392e2744eebff0d0e42a30a08e9b1449859365ca", "Campingvogn"],
] as const;

function gjensidigeVehicleTerms(file: string, sha256: string, insuranceType: string): ReviewedVehicleTerms {
  return {
    id: "vehicle:gjensidige-" + file,
    sha256,
    url: "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/" + file,
    effectiveFrom: "",
    termsNumber: "",
    providerId: "gjensidige",
    insuranceType,
    version: null,
  };
}

const storebrandCampingvogn: ReviewedVehicleTerms = {
  id: "vehicle:storebrand-vilkar-campingvogn-og-tilhenger.pdf",
  sha256: "fae736d8fb37b41b2c9e09f9c0de99760691023a3bd8c4d5d6ee520957e883c8",
  url: "https://www.storebrand.no/privat/forsikring/campingvognforsikring/_/attachment/inline/047a8396-0549-4f55-8afe-a20fe3cc42d6:af61e7bae3bcc2f6f5300195d35d576c461f0b33/vilkar-campingvogn-og-tilhenger.pdf",
  effectiveFrom: "2026-03-01", termsNumber: "camp02", providerId: "storebrand", insuranceType: "Campingvogn", version: "2026-03-01",
};
const storebrandSnow: ReviewedVehicleTerms = {
  id: "storebrand:motor10:snøscooter",
  sha256: "40e0be304d36a651ab77c76bb9af02ab771b20e516aa0d671d17188d9623ccd7",
  url: "https://www.storebrand.no/privat/forsikring/snoscooterforsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:49412a46852264b027eb6ff60fb9f1ad0db8d2a4/vilkar-motorvognforsikring.pdf",
  effectiveFrom: "2026-11-15", termsNumber: "motor10", providerId: "storebrand", insuranceType: "Snøscooter", version: "motor10",
};
const fremtindSnow: ReviewedVehicleTerms = {
  id: "vehicle:fremtind-Vilkar_Kasko_Snoscooter.pdf",
  sha256: "2103322d55713ff007aec488ffd3cc09ebd35d88ded5904314226f48c36915bb",
  url: "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Snoscooter.pdf",
  effectiveFrom: "2023-10-29", termsNumber: "PMO-357.000-006", providerId: "eika-fremtind", insuranceType: "Snøscooter", version: "2023-10-29",
};

const coverageDeductible = { deductibleClassification: "coverage" } as const;
const standardDeductible = { deductibleClassification: "standard" } as const;

const gjensidigeGlassKasko: ReviewedRow[] = [
  ["campingvogn.glass.dekning", "Glass", "Bruddskade på ruter og takluker omfattes. Skader på solcellepanel behandles under kaskodekningen.", 3, "Forsikringsbevis – Hvilke skader?"],
  ["campingvogn.glass.grense", "Glass – forsikringssum", "Inntil 1 000 kr ved reparasjon av rute eller takluke i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Glass"],
  ["campingvogn.glass.egenandel", "Glass – egenandel", "0 kr ved reparasjon; 3 000 kr ved skifte av rute eller takluke i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Glass", coverageDeductible],
];
const gjensidigeGlassDelkasko: ReviewedRow = [
  "campingvogn.glass.dekning", "Glass", "Delkasko har ingen egen dekning for brudd på rute eller takluke.", 3,
  "Forsikringsbevis – Hvilke skader?", { coverageAvailability: "unavailable" },
];

const storebrandSnowCommon: ReviewedRow[] = [
  ["snoscooter.avtale.geografi", "Forsikringens geografiske område", "Europa, unntatt Tyrkia, Russland, Belarus, Kosovo og land eller områder med offisiell reiseadvarsel. Rettshjelp gjelder i Norden.", 6, "4 Hvor forsikringen gjelder"],
  ["snoscooter.ansvar.grense", "Ansvar – forsikringssum", "Ubegrenset ved personskade; inntil 100 000 000 kr ved tingskade.", 9, "6.1 Ansvarsforsikring"],
  ["snoscooter.ansvar.egenandel", "Ansvar – egenandel", "Ingen egenandel ved ansvarsskade.", 9, "6.1 Ansvarsforsikring", coverageDeductible],
  ["snoscooter.ulykke.dekning", "Fører- og passasjerulykke", "Gjelder fører og passasjerer i eller på snøscooteren og føreren utenfor den når snøscooteren er direkte årsak til skaden. Betalende passasjerer er unntatt. Dekningen må stå i forsikringsbeviset.", 28, "12.1 og 12.3"],
  ["snoscooter.ulykke.grense", "Fører- og passasjerulykke – forsikringssum", "Når dekningen er avtalt: 100 000 kr ved dødsfall innen to år; ved 100 % varig medisinsk invaliditet 200 000 kr fra fylte 18 år og 500 000 kr for barn under 18 år. Lavere invaliditetsgrad gir forholdsmessig erstatning.", 28, "12.1 og 12.3, jf. 12.7.1 side 30"],
  ["snoscooter.rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist, begrenset til den økonomiske interessen i saken. Ved minst tre parter på sikredes side og vesentlig samme faktiske og juridiske problemstillinger er samlet grense 250 000 kr, også på tvers av selskaper.", 33, "13.5 Forsikringssum, jf. dekningstabellen side 5"],
  ["snoscooter.rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av det resterende erstatningsbeløpet. Én egenandel per tvist, også ved flere parter på samme side.", 33, "13.6 Egenandel", coverageDeductible],
];
const storebrandSnowDamage: ReviewedRow[] = [
  ["snoscooter.brann.egenandel", "Brann – egenandel", "8 000 kr dersom annet ikke står i forsikringsbeviset.", 10, "6.2.1 Brann", standardDeductible],
  ["snoscooter.tyveri.egenandel", "Tyveri – egenandel", "8 000 kr dersom annet ikke står i forsikringsbeviset.", 10, "6.2.2 Tyveri", standardDeductible],
  ["snoscooter.utstyr.dekning", "Fastmontert utstyr", "Fastmontert ekstrautstyr er med ved dekket brann, tyveri eller tyveriforsøk. Kjøredress, hjelm, hansker og støvler regnes som sikkerhetsutstyr for den forsikrede snøscooteren.", 9, "6.2.1 og 6.2.2 side 10, jf. 5 side 7"],
  ["snoscooter.utstyr.grense", "Fastmontert utstyr – forsikringssum", "Inntil 20 000 kr for fastmontert ekstrautstyr ved dekket brann eller tyveri, og maksimalt 50 % av kjøretøyets gjenanskaffelsesverdi.", 9, "6.2.1 og 6.2.2 side 10, jf. 5 side 7"],
  ["snoscooter.losore.grense", "Løsøre – forsikringssum", "Inntil 10 000 kr for bagasje ved dekket brann eller tyveri. På snøscooter angir produktoversikten en fastmontert, låsbar boks for bagasjen.", 9, "6.2.1 og 6.2.2 side 10"],
  ["snoscooter.naturskade.dekning", "Naturskade", "Skade direkte forårsaket av skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden. Sammenstøt med gjenstander som naturhendelsen har flyttet, regnes ikke som naturskade.", 12, "6.2.5 Skader som skyldes naturskade"],
  ["snoscooter.naturskade.egenandel", "Naturskade – egenandel", "8 000 kr dersom annet ikke står i forsikringsbeviset.", 12, "6.2.5 Skader som skyldes naturskade", standardDeductible],
  ["snoscooter.redning.dekning", "Redning", "Transport til nærmeste verksted eller rimeligere reparasjon på stedet, og hjemtransport av snøscooteren på vilkårene. Transport av snøscooteren har en egen beløpsbegrensning.", 11, "6.2.3 Veihjelp"],
  ["snoscooter.redning.begrensning", "Redning – begrensninger", "50 % av transportkostnadene, inntil halvparten av erstatningsbeløpet når skaden overstiger egenandelen. Andre transportutgifter dekkes ikke.", 11, "6.2.3 Begrensninger for veihjelp nr. 5"],
  ["snoscooter.redning.egenandel", "Redning – egenandel", "750 kr.", 12, "6.2.3 Veihjelp – Egenandeler", coverageDeductible],
];

const fremtindSnowAccident: ReviewedRow = [
  "snoscooter.ulykke.grense", "Fører- og passasjerulykke – forsikringssum",
  "100 000 kr ved dødsfall med gjenlevende ektefelle, samboer eller barn under 20 år; ellers 50 000 kr. Dødsfallet må skyldes ulykken og inntreffe innen ett år. Utbetalt invaliditetserstatning for samme skade trekkes fra. Ved 100 % livsvarig medisinsk invaliditet oppgir vilkårspunkt 2 200 000 kr for voksne og 1 000 000 kr for barn under 20 år. Oppgjørsregelen i punkt 5.2 oppgir 200 000 kr ved 100 % invaliditet uten å gjenta beløpet for barn.",
  2, "FMO-002.401-003 punkt 2, jf. 5.1–5.2 side 3", { replacesBase: true },
];

function addCoveredTowing(facts: CatalogFact[], key: string, prefix: string, page: number, section: string): ReviewedRow[] {
  const previous = facts.find(fact => fact.key === key);
  if (!previous) return [];
  const value = previous.value.startsWith(prefix) ? previous.value : prefix + " " + previous.value;
  return [[key, previous.label, value, page, section]];
}

export function addVehicleExtensionMarketEvidence(
  sources: Readonly<Record<string, CatalogSource>>,
  facts: Record<string, CatalogFact[]>,
  products: readonly CatalogProduct[],
): void {
  const productsById = new Map(products.map(product => [product.productId, product]));

  function applyRows(productId: string, document: ReviewedVehicleTerms, rows: ReviewedRow[]) {
    const product = productsById.get(productId);
    const source = sources[document.id];
    const previous = facts[productId];
    if (!source || !product || !previous || product.sourceId !== document.id ||
      product.providerId !== document.providerId || product.insuranceType !== document.insuranceType ||
      product.version !== document.version || (product.agreementScope ?? "ordinary") !== "ordinary" ||
      !product.componentIds?.includes(productId) || source.sha256 !== document.sha256 ||
      source.termsNumber !== document.termsNumber || source.effectiveFrom !== document.effectiveFrom ||
      source.url !== document.url) return;

    const reviewedKeys = new Set(rows.map(([key]) => key));
    facts[productId] = [
      ...previous.filter(fact => !reviewedKeys.has(fact.key)),
      ...rows.map(([key, label, value, page, section, options]) => ({
        key, label, value,
        ...options,
        source: {
          documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, url: source.url, company: source.company, version: source.version,
          agreementScope: source.agreementScope, page, section,
        },
      })),
    ];
  }

  for (const [id, file, sha256, type] of gjensidigeDocuments) {
    const source = gjensidigeVehicleTerms(file, sha256, type);
    const delkasko = id.endsWith("-delkasko");
    const previous = facts[id] ?? [];

    if (type === "Tilhenger") {
      applyRows(id, source, [
        ...addCoveredTowing(previous, "tilhenger.redning.dekning", "Berging eller tauing til nærmeste verksted ved skade, utelåsing, tyveri eller annen driftsstans.", 2, "Forsikringsbevis – Hvilke utgifter? Veihjelp" + (delkasko ? "" : " (fortsetter side 3)")),
        ["tilhenger.redning.egenandel", "Redning – egenandel", "750 kr i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Redning", coverageDeductible],
        ["tilhenger.brann.egenandel", "Brann – egenandel", "4 000 kr i det offentlige vilkårseksempelet; forsikringsbeviset går foran.", 1, "Forsikringsbevis – " + (delkasko ? "Delkasko" : "Brann/tyveri"), standardDeductible],
        ["tilhenger.tyveri.egenandel", "Tyveri – egenandel", "4 000 kr i det offentlige vilkårseksempelet; forsikringsbeviset går foran.", 1, "Forsikringsbevis – " + (delkasko ? "Delkasko" : "Brann/tyveri"), standardDeductible],
        ...(delkasko ? [] : [
          ["tilhenger.kasko.egenandel", "Kasko – egenandel", "6 000 kr i det offentlige vilkårseksempelet; forsikringsbeviset går foran.", 1, "Forsikringsbevis – Kasko", standardDeductible] satisfies ReviewedRow,
        ]),
      ]);
    } else {
      applyRows(id, source, [
        ["campingvogn.redning.egenandel", "Redning – egenandel", "750 kr i det offentlige vilkårseksempelet.", 1, "Forsikringsbevis – Veihjelp", coverageDeductible],
        ...(delkasko ? [gjensidigeGlassDelkasko] : gjensidigeGlassKasko),
      ]);
    }
  }

  for (const tier of ["brann-og-tyveri", "kasko", "super"]) {
    applyRows("storebrand-campingvogn-" + tier, storebrandCampingvogn, [
      ["campingvogn.redning.egenandel", "Redning – egenandel", "750 kr.", 6, "6.1.3 Veihjelp – Egenandeler", coverageDeductible],
    ]);
  }

  for (const tier of ["ansvar", "delkasko", "kasko"]) {
    const rows: ReviewedRow[] = [...storebrandSnowCommon];
    if (tier !== "ansvar") rows.push(
      ...storebrandSnowDamage,
      ["snoscooter.redning.geografi", "Redning – geografisk område",
        tier === "delkasko" ? "Norden." : "Europa innenfor forsikringens geografiske avgrensninger.", 6, "4 Hvor forsikringen gjelder"],
    );
    applyRows("storebrand-snoscooter-" + tier + "-motor10", storebrandSnow, rows);
  }

  for (const tier of ["ansvar", "minikasko", "kasko"]) {
    applyRows("eika-fremtind-snoscooter-" + tier, fremtindSnow, [fremtindSnowAccident]);
  }
  addVerifiedCaravanMarketEvidence(sources, facts, products);
  addVerifiedMcBobilMarketEvidence(sources, facts, products);
}

export const vehicleExtensionMarketArchives = [
  ...gjensidigeDocuments.map(([id, file, sha256, type]) => {
    const doc = gjensidigeVehicleTerms(file, sha256, type);
    return {
      provider: "gjensidige",
      slug: id.slice("gjensidige-".length),
      archivePath: "catalog/sources/vehicle-extensions/gjensidige-" + file,
      sources: [[doc.id, doc.effectiveFrom, doc.url]] as const,
    };
  }),
  {
    provider: "fremtind",
    slug: "kasko-snoscooter",
    archivePath: "catalog/sources/vehicle-extensions/fremtind-Vilkar_Kasko_Snoscooter.pdf",
    sources: [[fremtindSnow.id, fremtindSnow.effectiveFrom, fremtindSnow.url]],
  },
] as const;
