import type { ProductComparisonFact } from "./catalog-product-comparison.ts";
import type { CatalogProduct } from "./product-catalog.ts";
import { reviewedWetRoomRows } from "./catalog-reviewed-wet-room.ts";

const storebrandPublicOrders =
  "Merutgifter ved endrede tekniske krav til skadd del. Fredet/verneverdig bygning er begrenset til 1 000 000 kroner; arbeidet må fullføres innen fem år.";
const frendePublicOrderLimit =
  "Fullverdi dekker alle slike utgifter, fredet bygg inntil 1 000 000 kr; førsterisiko inntil 25 % av summen og maksimalt 250 000 kr.";
const ifRentalDeductibles =
  "Tre måneders husleie. Høyere sikkerhet trekkes fullt fra. Ved ordinært tyveri/skadeverk på utleid bolig: depositum/bankgaranti, minst 10 000 kroner.";

function describedFact(fact: ProductComparisonFact, key: string, label: string, value: string): ProductComparisonFact {
  return { ...fact, key, label, value };
}

const waterCirclesKaskoIds = new Set(["watercircles-bil-kasko", "watercircles-bil-elite"]);
const waterCirclesMotorDocument = "new-private:watercircles-bil.pdf";
const collisionDeductibleKey = "kasko.egenandel.dyr";
const collisionDeductibleLabel = "Påkjørsel av dyr – egenandel";
const collisionBonusKey = "kasko.dyr.bonus";
const collisionBonusLabel = "Påkjørsel av dyr – bonustap";
const waterCirclesBonusExceptions =
  "Brann, tyveri, glass, natur, transport, veihjelp og straks politimeldt dyrepåkjørsel gir ikke bonustap.";

function reviewedAnimalCollision(product: CatalogProduct, fact: ProductComparisonFact): ProductComparisonFact[] | undefined {
  const [source, ...additional] = fact.sources;
  if (product.productId === "bil-kasko" && product.version === "PAU25205" && fact.key === "kasko.dyr" &&
    source.documentId === "kasko" && source.effectiveFrom === "2026-07-01" && source.page === 1 && source.section === "2.1") {
    return [
      describedFact(fact, collisionDeductibleKey, collisionDeductibleLabel, "2 000 kr ved erstatningsmessig kaskoskade etter påkjørsel av dyr."),
      describedFact(fact, collisionBonusKey, collisionBonusLabel,
        "Ingen bonustap ved erstatningsmessig kaskoskade etter påkjørsel av dyr når politi eller viltnemnd varsles så snart som mulig og varslingen dokumenteres."),
    ];
  }

  if (product.version !== "WTC-BIL-2.19" || source.documentId !== waterCirclesMotorDocument ||
    source.effectiveFrom !== "2026-03-01") return;
  const kasko = waterCirclesKaskoIds.has(product.productId);
  if (fact.key === collisionDeductibleKey && source.page === 9 && source.section === "7.4.5") {
    if (product.productId === "watercircles-bil-delkasko") {
      return [{
        ...describedFact(fact, collisionDeductibleKey, collisionDeductibleLabel,
          "Ordinær skade på egen bil ved påkjørsel av dyr inngår i Kasko, jf. dekningsoversikten."),
        state: "unavailable",
        sources: [{ ...source, page: 4, section: "3.2.3–3.2.4" }, ...additional],
      }];
    }
    if (kasko) {
      return [describedFact(fact, collisionDeductibleKey, collisionDeductibleLabel,
        "Ingen egenandel ved påkjørsel av løse dyr på vei som omgående meldes til politi eller viltnemnd på stedet. Står det en egenandel over 8 000 kr i forsikringsbeviset, reduseres den med 8 000 kr.")];
    }
  }
  if (kasko && fact.key === "kasko.dyr" && source.page === 4 && source.section === "3.2.4") {
    return [describedFact(fact, "kasko.skadedyr.dekning", "Skade fra insekter, gnagere og andre skadedyr",
      "Kasko dekker uforutsett skade på bilen forårsaket av insekter, gnagere og andre skadedyr.")];
  }
  if ((kasko || product.productId === "watercircles-bil-delkasko") && fact.key === "avtale.bonus.ordning" &&
    source.page === 9 && source.section === "9" && fact.value.includes(waterCirclesBonusExceptions)) {
    const general = { ...fact, value: fact.value.replace(waterCirclesBonusExceptions,
      "Brann, tyveri, glass, natur, transport og veihjelp gir ikke bonustap.") };
    if (!kasko) return [general];
    return [
      general,
      {
        ...describedFact(fact, collisionBonusKey, collisionBonusLabel,
          "Ingen bonustap ved påkjørsel av løse dyr på vei som omgående meldes til politi eller viltnemnd på stedet."),
        sources: [{ ...source, page: 10, section: "9" }, ...additional],
      },
    ];
  }
}

function reviewedLateArrival(product: CatalogProduct, fact: ProductComparisonFact): ProductComparisonFact[] | undefined {
  const [source] = fact.sources;
  if (product.productId === "fremtind-reise" && product.version === "PRE-450.200-015" &&
    fact.key === "reise.forsinkelse.ankomst" && source.documentId === "fremtindReiseUnifiedTerms" &&
    source.effectiveFrom === "2025-03-17" && source.page === 6 && source.section === "8.2") {
    const conditions = "Gjelder forsinkelse over åtte timer ved rutefly, charterreise eller reise arrangert av turoperatør, ved årsak som er omfattet. Reisearrangøren må dokumentere forsinkelsen skriftlig.";
    return [
      describedFact(fact, "reise.forsinkelse.ankomst_tapt_ferie", "Forsinket ankomst – tapt ferie",
        "Inntil 500 kr per påbegynt døgn per sikret, maksimalt 5 000 kr per person. " + conditions),
      describedFact(fact, "reise.forsinkelse.ankomst_turisttjenester", "Forsinket ankomst – ubenyttede turisttjenester",
        "Forhåndsbetalte utflukter og andre ubenyttede turisttjenester erstattes med inntil 5 000 kr per skadetilfelle. " + conditions),
    ];
  }
  if (product.productId === "landkreditt-reise" && product.version === "2026-05-01" &&
    fact.key === "reise.forsinkelse.ankomst_sum" && source.documentId === "landkreditt-reise" &&
    source.effectiveFrom === "2026-05-01" && source.page === 6 && source.section === "5.2") {
    return [describedFact(fact, "reise.forsinkelse.ankomst_kost_losji", "Forsinket ankomst – kost og losji",
      "Inntil 1 000 kr per person per påbegynt døgn ved forsinkelse over åtte timer på grunn av værforhold eller mekaniske eller tekniske årsaker. Forsinkelsen beregnes mot reisearrangørens rutetabell, med endringer som var planlagt og meddelt før avreise.")];
  }
}

export function expandReviewedMarketRow(product: CatalogProduct, fact: ProductComparisonFact): ProductComparisonFact[] {
  const source = fact.sources[0];
  if (!source) return [fact];

  const revised = reviewedAnimalCollision(product, fact) ?? reviewedLateArrival(product, fact) ??
    reviewedWetRoomRows(product, fact);
  if (revised) return revised;

  if (fact.key === "hus.utleie.egenandel" && source.documentId === "ifHusTerms" &&
    source.effectiveFrom === "2023-09" && source.page === 20 && fact.value === ifRentalDeductibles) {
    return [
      { ...fact, value: "Under If Utleieforsikring er egenandelen tre måneders husleie. Høyere sikkerhet trekkes fullt fra." },
      describedFact(fact, "hus.utleie.tyveri_skadeverk.egenandel", "Utleie – egenandel ved ordinært tyveri eller skadeverk",
        "Ved ordinært tyveri eller skadeverk på utleid bolig er egenandelen depositum eller bankgaranti, minst 10 000 kroner."),
    ];
  }

  const prefix = fact.key.startsWith("hytte.") ? "hytte" : "hus";
  const storebrandDocument = prefix === "hytte" ? "cabin:storebrand:building" : "storebrandHusTerms";
  if (fact.key === prefix + ".pabud.grense" && fact.value === storebrandPublicOrders &&
    source.documentId === storebrandDocument && source.effectiveFrom === "2025-08-15" &&
    source.page === 25) {
    return [
      describedFact(fact, prefix + ".pabud.dekning", "Offentlige påbud – dekning",
        "Merutgifter ved endrede tekniske krav til skadd del. Arbeidet må fullføres innen fem år."),
      describedFact(fact, fact.key, "Offentlige påbud – beløpsgrense", "Inntil 1 000 000 kroner ved skade på fredet eller verneverdig bygning."),
    ];
  }

  const frendeDocument = prefix === "hytte" ? "cabin:frende:building:2026-11-20" : "frendeHusStandard:2026-11-20";
  if (fact.key === prefix + ".pabud.dekning" && fact.value.includes(frendePublicOrderLimit) &&
    source.documentId === frendeDocument && source.effectiveFrom === "2026-11-20" && source.page === 6) {
    return [
      { ...fact, value: fact.value.replace(" " + frendePublicOrderLimit, "") },
      {
        ...describedFact(fact, prefix + ".pabud.grense", "Offentlige påbud – beløpsgrense", frendePublicOrderLimit),
        role: "term",
        sources: [{ ...source, page: 4, section: "4.8 nr. 5" }, ...fact.sources.slice(1)],
      },
    ];
  }

  return [fact];
}
