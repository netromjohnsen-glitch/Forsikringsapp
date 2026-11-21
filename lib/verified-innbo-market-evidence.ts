import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Clause = readonly [page: number, section: string];
type Row = readonly [key: keyof typeof headings, value: string, clause: Clause,
  options?: Pick<CatalogFact, "coverageAvailability" | "qualificationSource" | "replacesBase">];

const headings = {
  "innbo.fryserinnhold.dekning": "Matvarer ved temperaturstigning",
  "innbo.fryserinnhold.grense": "Matvarer ved temperaturstigning – beløpsgrense",
  "flytting.dekning": "Flytteforsikring",
  "flytting.grense": "Flytteforsikring – beløpsgrense",
  "flytting.tyveri.grense": "Tyveri under transport ved flytting – beløpsgrense",
  "flytting.enkeltgjenstand.grense": "Flytteforsikring – grense per gjenstand eller samling",
  "flytting.unntak": "Flytteforsikring – unntak",
} as const;

const freezer = "innbo.fryserinnhold.dekning";
const freezerCap = "innbo.fryserinnhold.grense";
const move = "flytting.dekning";
const oldMove = "flytting.transport.grense";
const unavailable = { coverageAvailability: "unavailable" } as const;
const replacesBase = { replacesBase: true } as const;

function cite(source: CatalogSource, [page, section]: Clause): CatalogFact["source"] {
  const { id, filename, termsNumber, effectiveFrom, company, url, agreementScope, productCode, version } = source;
  return { documentId: id, filename, termsNumber, effectiveFrom, company, url, agreementScope, productCode, version, page, section };
}

export function addVerifiedInnboMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>,
  products: CatalogProduct[], addOns: CatalogAddOn[],
) {
  function original(id: string, digest: string) {
    return sources[id]?.sha256 === digest ? sources[id] : undefined;
  }
  function hasComponent(productId: string, version: string | null, sourceId: string, component: string) {
    return products.some(product => product.productId === productId && product.version === version && product.sourceId === sourceId &&
      product.insuranceType === "Innbo" && (product.agreementScope ?? "ordinary") === "ordinary" &&
      product.componentIds?.includes(component));
  }
  function upsert(component: string, source: CatalogSource, rows: readonly Row[], remove?: string) {
    if (!facts[component]) return;
    const keys = new Set<string>(rows.map(([key]) => key));
    facts[component] = [
      ...facts[component].filter(row => row.key !== remove && !keys.has(row.key)),
      ...rows.map(([key, value, clause, options]) => ({ key, label: headings[key], value, source: cite(source, clause), ...options })),
    ];
  }

  const tryg = original("trygInnbo", "dc1232e8506616af03a937c97a381ccc962eccca61bbd9544bf55b86b8effb39");
  if (tryg && hasComponent("tryg-innbo", "2026-07-01", tryg.id, tryg.id)) {
    const clause = [4, "2.5 Andre skadetilfeller"] as const;
    upsert(tryg.id, tryg, [
      [freezer, "Ødelagte matvarer i fryseskap eller fryseboks etter plutselig svikt i strømforsyningen eller frysesystemet.", clause],
      [freezerCap, "Inntil 15 000 kr samlet.", clause],
    ]);
  }

  const ifHash = "0d5aaf3702020ca458bb9af64c0a089b488a41f11198e07368699ff2d57ec270";
  const ifFreezer = [8, "4.7 Innhold i fryser (kun Super)"] as const;
  const ifMove = [8, "4.9 Skade ved flytting (Utvidet og Super)"] as const;
  const ifBasis = original("ifInnboBasis", ifHash);
  if (ifBasis && hasComponent("if-innbo-basis", "IBO2-1", "ifInnboTerms", ifBasis.id)) {
    upsert(ifBasis.id, ifBasis, [
      [freezer, "Den særskilte dekningen for matvarer ved temperaturstigning i fryser gjelder bare med Super.", ifFreezer, unavailable],
      [move, "Den særskilte flytteskadedekningen gjelder med Utvidet og Super.", ifMove, unavailable],
    ]);
  }
  const ifUtvidet = original("ifInnboUtvidet", ifHash);
  if (ifUtvidet && hasComponent("if-innbo-utvidet", "IBO2-1", "ifInnboTerms", ifUtvidet.id)) {
    upsert(ifUtvidet.id, ifUtvidet, [
      [move, "Plutselig ytre skade under transport, innbæring og utbæring ved flytting til ny bolig eller fritidsbolig.", ifMove, replacesBase],
      ["flytting.unntak", "Kosmetiske skader som riper, rifter, skraper, flekker, hakk og avskalling er unntatt.", [9, "4.9 Skade ved flytting"]],
    ], oldMove);
  }
  const ifSuper = original("ifInnboSuper", ifHash);
  if (ifSuper && hasComponent("if-innbo-super", "IBO2-1", "ifInnboTerms", ifSuper.id)) {
    upsert(ifSuper.id, ifSuper, [
      [freezer, "Skade på matvarer i fryser når temperaturen stiger som følge av strømbrudd, kortslutning, lysbue, overslag eller overspenning. Dette omfatter også slike skader ved lyn og tordenvær.", ifFreezer, replacesBase],
      [freezerCap, "Inntil 40 000 kr.", ifFreezer],
    ]);
  }

  for (const [id, component, hash] of [
    ["gj-innbo", "gjInnboStandard", "df7af2a169d293e22df138e6561c4c34da854d4923596a828e14bcea7f28cf20"],
    ["gj-innbo-pluss", "gjInnboPlus", "4e10857cb9b7832b5661d48089a6024c3622a499d66156b6122f2010574787a1"],
  ] as const) {
    const gj = original(component, hash);
    if (!gj || !hasComponent(id, null, "gjInnboIpid", component)) continue;
    upsert(component, gj, [
      [freezer, "Skadde matvarer og luktskade på fryser eller kjøleskap ved utilsiktet temperaturstigning.", [4, "Forsikringsbevis – Dekkes"], replacesBase],
    ]);
    if (component === "gjInnboPlus") upsert(component, gj, [
      [move, "Ved flytting til ny bolig i Norge dekkes plutselig og uforutsett ytre skade og tyveri fra transportmiddel. Eiendeler skal emballeres og sikres for normale påkjenninger.", [5, "Flytteforsikring (fortsatt fra PDF-side 4)"], {
        qualificationSource: cite(gj, [1, "Sikkerhetsforskrifter ved flytting"]),
      }],
    ], oldMove);
  }

  const storebrand = original("storebrand:market:innbo:innbo10", "b0e518d636a1350de08d5f9783ce65165d6b25b137382f089365344f5d836256");
  if (storebrand) {
    const standard = "sb-innbo-standard-innbo10";
    const superId = "sb-innbo-super-innbo10";
    const clause = [20, "C.1.5 Flytteforsikring"] as const;
    if (hasComponent(standard, "innbo10", storebrand.id, standard)) upsert(standard, storebrand, [
      [freezerCap, "Inntil avtalt forsikringssum.", [5, "B.3 Hva forsikringen omfatter"]],
      [move, "Den særskilte flytteskadedekningen i C.1.5 er bare inkludert med Super.", clause, unavailable],
    ]);
    if (hasComponent(superId, "innbo10", storebrand.id, superId)) upsert(superId, storebrand, [
      [move, "Plutselig og uforutsett ytre skade under transport og bæring mellom bolig, bil eller lager ved flytting i Norden. Tyveri fra transportmiddel omfattes. Lagring under flytting følger B.4.8.", clause, replacesBase],
      ["flytting.grense", "Inntil avtalt forsikringssum ved skade på innbo under flytting. Tyveri fra transportmiddel har egen grense.", clause],
      ["flytting.tyveri.grense", "Inntil 100 000 kr ved tyveri fra transportmiddel.", clause],
      ["flytting.unntak", "Blant annet skade på piano eller flygel, tyveri av angitte verdisaker fra motorkjøretøy eller tilhenger, tap på andre måter enn tyveri, og skade med ukjent årsak. Se også unntakene for uhellsforsikringen i C.1.2.", clause],
    ], oldMove);
  }

  for (const [tier, component, hash, amount, chapter] of [
    ["standard", "fremtindInnboStandard", "eddc6ba67d46495fce5925679fc75a92bfdb3af7aa4f7ed5ebb0d0592032fced", "20 000", "4.8"],
    ["topp", "fremtindInnboTopp", "d051745eb18921707f85bf42c130b780af4c65a0427207390bff6eea17257547", "50 000", "4.5"],
  ] as const) {
    const fremtind = original(component, hash);
    if (!fremtind || !hasComponent("fremtind-innbo-" + tier, "2025-01-01", component, component)) continue;
    const clause = [4, chapter + " Matvarer i fryser og kjøleskap"] as const;
    upsert(component, fremtind, [
      [freezer, "Skade på matvarer i fryser eller kjøleskap ved utilsiktet temperaturendring. Skade på apparatet omfattes når den følger av en dekket matskade. Meld skaden straks og oppbevar matvarene for besiktigelse.", clause, replacesBase],
      [freezerCap, "Inntil " + amount + " kr for matvarer.", clause, replacesBase],
    ]);
    if (tier === "topp") {
      const moving = [4, "4.6 Flytteforsikring"] as const;
      upsert(component, fremtind, [
        [move, "Tilfeldig og plutselig skade under transport og bæring mellom bolig og bil ved flytting til ny bolig i Norden. Dekker også tyveri under transport og tyveri fra bygning eller container ved midlertidig lagring i forbindelse med flyttingen.", moving],
        ["flytting.tyveri.grense", "Inntil 100 000 kr ved tyveri under transport.", moving],
        ["flytting.enkeltgjenstand.grense", "Inntil 100 000 kr per enkeltgjenstand eller samling.", moving],
        ["flytting.unntak", "Unntakene omfatter tyveri av smykker, edelt metall og klokker fra motorkjøretøy eller tilhenger, underslag, bedrageri, kosmetiske skader, skade på tilhenger eller hobbyveksthus, penger, verdipapirer, piano, flygel, dyr og planter.", moving],
      ], oldMove);
    }
  }

  const frende = original("frendeInnboUhell:2026-11-20", "5709ed20d7be2beb696ea61106adbbfac19016bc04bc19eb0c434f9c134aa5bb");
  if (frende && hasComponent("frende-innbo-standard", "2026-11-20", "frendeInnboStandard:2026-11-20", "frendeInnboStandard:2026-11-20") &&
      addOns.some(addOn => addOn.id === "frende-innbo-uhell" && addOn.componentId === frende.id && addOn.requiresLevel?.includes("frende-innbo-standard"))) {
    const clause = [12, "10.3 Skader vi erstatter på uhell"] as const;
    upsert(frende.id, frende, [
      [move, "Ved egen flytting til nytt forsikringssted i Norden dekker tillegget tyveri og plutselig, uforutsett ytre skade under transport og inn- og utbæring. Ved slik skade må du ha sett hendelsen da den skjedde.", clause],
      ["flytting.grense", "Inntil 100 000 kr samlet ved flytteskade.", clause],
    ], oldMove);
  }
}
