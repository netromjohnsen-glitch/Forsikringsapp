import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Clause = readonly [page: number, section: string];
type Row = readonly [key: keyof typeof headings, value: string, clause: Clause,
  options?: Pick<CatalogFact, "deductibleClassification" | "qualificationSource" | "replacesBase">];

const headings = {
  "ladekabel.dekning": "Ladekabel",
  "ladekabel.egenandel": "Ladekabel – egenandel",
  "bilnokkel.dekning": "Bilnøkkel",
  "bilnokkel.grense": "Bilnøkkel – beløpsgrense",
  "bilnokkel.egenandel": "Bilnøkkel – egenandel",
  "bilnokkel.vilkar": "Bilnøkkel – vilkår",
} as const;

const cable = "ladekabel.dekning";
const cableDeductible = "ladekabel.egenandel";
const keyCoverage = "bilnokkel.dekning";
const keyCap = "bilnokkel.grense";
const keyDeductible = "bilnokkel.egenandel";
const deductible = { deductibleClassification: "coverage" } as const;

function cite(source: CatalogSource, [page, section]: Clause): CatalogFact["source"] {
  const { id, filename, termsNumber, effectiveFrom, company, url, agreementScope, productCode, version } = source;
  return { documentId: id, filename, termsNumber, effectiveFrom, company, url, agreementScope, productCode, version, page, section };
}

export function addVerifiedBilAccessoryMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function original(id: string, digest: string) {
    return sources[id]?.sha256 === digest ? sources[id] : undefined;
  }
  function hasComponent(productId: string, version: string | null, sourceId: string | undefined, component: string) {
    return products.some(product => product.productId === productId && product.version === version &&
      product.sourceId === sourceId && product.insuranceType === "Bil" &&
      (product.agreementScope ?? "ordinary") === "ordinary" && product.componentIds?.includes(component));
  }
  function upsert(component: string, source: CatalogSource, rows: readonly Row[]) {
    if (!facts[component]) return;
    const keys = new Set<string>(rows.map(([key]) => key));
    facts[component] = [
      ...facts[component].filter(row => !keys.has(row.key)),
      ...rows.map(([key, value, clause, options]) => ({ key, label: headings[key], value, source: cite(source, clause), ...options })),
    ];
  }

  const ifHash = "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987";
  const ifProperty = [3, "3.4 Tilleggsutstyr og bagasje"] as const;
  const ifDelkasko = original("ifDelkasko", ifHash);
  if (ifDelkasko && hasComponent("if-bil-delkasko", "MOT2-2", undefined, ifDelkasko.id)) upsert(ifDelkasko.id, ifDelkasko, [
    [cable, "Ladekabel til elbil eller hybridbil er omfattet ved dekket brann eller tyveri. Kabel, annet tilleggsutstyr og bagasje har en felles grense på 40 000 kr, høyst halvparten av kjøretøyets gjenanskaffelsesverdi.", ifProperty,
      { qualificationSource: cite(ifDelkasko, [5, "4.3 Tyveri, se også 4.2 Brann på PDF-side 4"]) }],
  ]);
  const ifKasko = original("ifKasko", ifHash);
  if (ifKasko && hasComponent("if-bil-kasko", "MOT2-2", undefined, ifKasko.id)) upsert(ifKasko.id, ifKasko, [
    [cable, "Ladekabel til elbil eller hybridbil er omfattet ved dekket brann, tyveri eller kaskoskade. Kabel, annet tilleggsutstyr og bagasje har en felles grense på 40 000 kr, høyst halvparten av kjøretøyets gjenanskaffelsesverdi.", ifProperty,
      { replacesBase: true, qualificationSource: cite(ifKasko, [6, "4.8 Kaskoskader"]) }],
  ]);
  const ifSuper = original("ifSuper", ifHash);
  if (ifSuper && hasComponent("if-bil-super", "MOT2-2", undefined, ifSuper.id)) {
    const accident = [12, "4.11.2 Uhellsforsikring"] as const;
    const ownRisk = [12, "4.11.3 Egenandel Uhellsforsikring"] as const;
    upsert(ifSuper.id, ifSuper, [
      [cable, "Tilfeldig, plutselig ytre skade, tyveri eller hærverk på ladekabel til elbil eller hybridbil under Super Uhellsforsikring. Fastmontert ladestasjon i bygning er unntatt. Uhellsforsikringen har en generell grense på 20 000 kr inkl. mva. per skadetilfelle.", accident,
        { replacesBase: true, qualificationSource: cite(ifSuper, [12, "4.11.6 Skadeoppgjør"]) }],
      ["bilnokkel.vilkar", "Alle nøkler til bilen omfattes, inkludert fjernkontroll til parkeringsvarmer. Skadeårsaken må være kjent og tapet må kunne knyttes til et bestemt skadetidspunkt.", accident,
        { qualificationSource: cite(ifSuper, [11, "4.11.2 Uhellsforsikring – hva er forsikret"]) }],
      [keyDeductible, "1 000 kr under Super Uhellsforsikring.", ownRisk, deductible],
      [cableDeductible, "1 000 kr under Super Uhellsforsikring.", ownRisk, deductible],
    ]);
  }

  for (const [level, hash, claimPage] of [
    ["delkasko", "b3acb6a95e44c5315c7c3fe151d359a63040f4ff784b28ff00738a495192e1f9", 8],
    ["kasko", "3fbfa81e3454a95898f7746f9858f7a173dbf433e5597ce58e08213251c5d477", 8],
    ["kasko-maks", "d61a75ea110a00367448f674597b777ea20e89df1faf53f76806c440801716a8", 9],
  ] as const) {
    const component = "klp-bil-" + level;
    const source = original("new-private:" + component + ".pdf", hash);
    if (!source || !hasComponent(component, null, source.id, component)) continue;
    const extension = level === "delkasko" ? "" : " Kasko omfatter også dekket plutselig ytre skade.";
    upsert(component, source, [
      [cable, "Ladekabel til elbil eller ladbar hybrid er omfattet ved dekket brann, tyveri eller tyveriforsøk." + extension, [1, "Hva forsikringen omfatter"],
        { qualificationSource: cite(source, [claimPage, "Oppgjørsregler – egenandel ved tyveri av eller skade på ladekabel"]) }],
    ]);
    if (level === "kasko-maks") upsert(component, source, [
      [keyCap, "Inntil 12 000 kr for ny nøkkel, programmering og omkoding hos autorisert verksted eller låsesmed.", [3, "Maks – hva som dekkes"]],
    ]);
  }

  const watercircles = original("new-private:watercircles-bil.pdf", "41b60ce2e10f7b31de13521f7bce3f5deef5cfd749549a8059736997b9284e65");
  if (watercircles) {
    for (const level of ["delkasko", "kasko", "elite"]) {
      const component = "watercircles-bil-" + level;
      if (!hasComponent(component, "WTC-BIL-2.19", watercircles.id, component)) continue;
      upsert(component, watercircles, [
        [cable, "Tyveri av ladekabel til motorvognen er omfattet.", [4, "3.2 Delkaskoforsikring"]],
      ]);
      if (level === "elite") upsert(component, watercircles, [
        [keyCap, "Inntil 20 000 kr for ny bilnøkkel, programmering og omkoding.", [14, "§ 15 punkt 4.1 Bilnøkkel"]],
      ]);
    }
  }

  const frendeHash = "952f1c99f91e457ade95a7279f16c1c73e2f2575f92197f16a9d6b398985a9e7";
  const frendeVersion = "2026-11-20";
  const frendeTerms = "frendeTerms:" + frendeVersion;
  const frendeKasko = original("frendeKasko:" + frendeVersion, frendeHash);
  if (frendeKasko && hasComponent("frende-bil-kasko", frendeVersion, frendeTerms, frendeKasko.id)) {
    const ownRisk = [9, "11.11 Egenandel"] as const;
    upsert(frendeKasko.id, frendeKasko, [
      [keyCoverage, "Bilnøkkel som er skadet, stjålet eller mistet, er omfattet.", [3, "6.1 Disse skadene erstatter vi på kasko – punkt 4"]],
      [cable, "Ladekabel til elbil eller hybridbil er omfattet ved dekket skade eller tyveri.", [2, "3 Hva forsikringen omfatter – punkt 4"],
        { qualificationSource: cite(frendeKasko, ownRisk) }],
      [cableDeductible, "Avtalt kaskoegenandel ved dekket skade på eller tyveri av ladekabel.", ownRisk, deductible],
      [keyDeductible, "Avtalt kaskoegenandel ved dekket nøkkelskade.", ownRisk, deductible],
    ]);
  }
  const frendeExtended = original("frendeUtvidet:" + frendeVersion, frendeHash);
  if (frendeExtended && hasComponent("frende-bil-utvidet", frendeVersion, frendeTerms, frendeExtended.id)) {
    const key = [4, "8.2 Skadet, stjålet eller mistet nøkkel og fjernkontroll"] as const;
    const damagedCable = [4, "8.3 Skadet eller stjålet ladekabel"] as const;
    upsert(frendeExtended.id, frendeExtended, [
      [keyCoverage, "Skadet, stjålet eller mistet bilnøkkel eller fjernkontroll til motor og kupévarmer omfattes uten bonustap.", key, { replacesBase: true }],
      [cable, "Skadet eller stjålet ladekabel erstattes uten bonustap.", damagedCable, { replacesBase: true }],
      [cableDeductible, "Ingen egenandel ved dekket skade på eller tyveri av ladekabel.", damagedCable, { ...deductible, replacesBase: true }],
      [keyDeductible, "Ingen egenandel ved dekket skade på, tyveri eller tap av nøkkel eller fjernkontroll.", key, { ...deductible, replacesBase: true }],
    ]);
  }

  const storebrand = original("storebrand:motor10:bil", "40e0be304d36a651ab77c76bb9af02ab771b20e516aa0d671d17188d9623ccd7");
  if (storebrand && hasComponent("sb-bil-super-motor10", "motor10", storebrand.id, "sbSuper-motor10")) {
    upsert("sbSuper-motor10", storebrand, [
      [keyCoverage, "Ny nøkkel, programmering og omkoding hos autorisert verksted eller låsesmed når nøkkelen er mistet, stjålet eller skadet av ytre påvirkning. Gjenglemte nøkler, teknisk feil på nøkkelen alene og separate nøkler til ekstrautstyr er unntatt.", [17, "6.4.4 Bilnøkkelforsikring"]],
    ]);
  }

  const landkreditt = original("new-private:landkreditt-bil.pdf", "5459d712e9c59125646314bff36af58a4a1a839c3672c1a2d937ef92096df6ca");
  if (landkreditt && hasComponent("landkreditt-bil-kasko-pluss", "2023-09-15", landkreditt.id, "landkreditt-bil-kasko-pluss")) {
    const ownRisk = [14, "12.4.4 Egenandel"] as const;
    upsert("landkreditt-bil-kasko-pluss", landkreditt, [
      [keyDeductible, "1 000 kr for dekket uhell under uflaksforsikringen.", ownRisk, deductible],
      [cableDeductible, "1 000 kr for dekket uhell under uflaksforsikringen.", ownRisk, deductible],
    ]);
  }
}
