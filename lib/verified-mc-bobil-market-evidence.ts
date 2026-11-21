import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type Document = readonly [id: string, sha256: string, termsNumber: string, effectiveFrom: string];
type Row = readonly [key: string, label: string, value: string, page: number, section: string,
  availability?: CatalogFact["coverageAvailability"]];
type VehicleType = "Bobil" | "MC";

const towing = "veihjelp.dekning";
const vehicle = "veihjelp.hjemtransport.dekning";
const persons = "veihjelp.hjemreise.dekning";
const holidayRental = "veihjelp.ferieutland.leiebil";
const moisturePipes = "bobil.fukt.ror.dekning";
const towingLabel = "Veihjelp og berging";
const vehicleLabel = "Hjemtransport av kjøretøyet";
const personsLabel = "Hjemreise for fører og passasjerer";
const holidayRentalLabel = "Leiekjøretøy ved veihjelp utenfor Norden";
const moisturePipesLabel = "Fuktskade etter lekkasje fra boenhetens røranlegg";

const ifSpecial: Document = ["mcb:if:bobil:if-SV707.pdf",
  "a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e", "SV707", "2022-06"];
const fremtindMcHash = "2698b98c7ed2b19e82ba8df52a7b14b97d94cbf98c48d55629a72d2e0a89da7e";
const fremtindMc: Document = ["mcb-ff-fremtind-mc-terms", fremtindMcHash, "PMO-357.000-006", "2023-10-29"];
const fremtindMcMini: Document = ["mcb-ff-fremtind-mc-terms-mini", fremtindMcHash, "PMO-357.110-013", "2023-07-10"];
const frendeHash = "952f1c99f91e457ade95a7279f16c1c73e2f2575f92197f16a9d6b398985a9e7";
const storebrandHash = "40e0be304d36a651ab77c76bb9af02ab771b20e516aa0d671d17188d9623ccd7";

const gjensidigeDocuments = [
  ["Bobil", "delkasko", "978ff27d1df6f978775356ec1a65c164a2d18d2912d1b13bb63b99a110e1f1fd", 3, 3],
  ["Bobil", "kasko", "7971a0170cf272cacec8e9da23633fa630245631d04e99f455b174dd3a2fc734", 3, 3],
  ["Bobil", "pluss", "64eff6544529afba60722892de07b2db9ee8c3d0b0123001cbb7dfedfcd7e7d7", 3, 4],
  ["MC", "delkasko", "45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7", 3, 3],
  ["MC", "kasko", "735f518bd45c6470965c1ea6be2f596b6504cee9a09c47718a629ed319db5e58", 4, 4],
] as const;
const trygDocuments = [
  ["Bobil", "PAU25335", "2a1cd47ccbfbb5ea8532500d3b964fac22a2ede5d34fcffb2046899185fd0e48", "2026-01-01",
    "PAU25305", "cd521eb44c91f9ab6a0fd9c06513b1e1e076355efdb2fe130ed222c80c25edea", "2026-01-01",
    "PAU27007", "a14a3404fceef8c42d91fb4ec95906e06b87edcfc13188e697e01855aa99f404"],
  ["MC", "PAU25935", "7996b6796ba109c322b0382576da6fe3f63145b8fb1342378d5683df82cfbb30", "2026-01-01",
    "PAU25405", "917b3381e5792c10decfdeceb3c8af3bb70b4703d0c15406dd972c55321411c0", "2026-07-01",
    "PAU27010", "75657812b727c1346472dac5464fd8077826e114e7fe00679e6ac2d2aee97c8b"],
] as const;

const ifRoadside: Row[] = [
  [towing, towingLabel, "Nødvendig transport til nærmeste verksted som kan reparere, eller rimeligere nødreparasjon på stedet. Omfatter blant annet dekket skade eller tyveri, startvansker, motorstopp, tom tank eller driftsbatteri, feilfylling, utelåsing, nøkkelproblemer og ekstraordinære punkteringsproblemer.", 5, "4.7.1 Transport av kjøretøy (fortsetter på side 6)"],
  [vehicle, vehicleLabel, "Rimeligste henting etter reparasjon når kjøretøyet måtte etterlates etter omfattende skade eller ikke kunne settes i trafikksikker stand innen tre dager. Dekker også gjenfunnet kjøretøy etter tyveri og kjøretøy som må etterlates når fører eller passasjer rammes av plutselig sykdom, ulykke eller dødsfall. If skal varsles på forhånd og avgjør transportformen.", 6, "4.7.1 Hjemtransport av kjøretøyet og 4.7.4 Skadeoppgjør"],
  [persons, personsLabel, "Rimelige merutgifter til hjemreise fra skadestedet når kjøretøyet må etterlates. Haikere er unntatt. Ved sykdom, ulykke eller dødsfall kreves legeerklæring.", 6, "4.7.2 Hjelp til personer og 4.7.4 Skadeoppgjør"],
];

function gjensidigeRoadside(type: VehicleType, start: number, detail: number): Row[] {
  const bobil = type === "Bobil";
  const section = "Forsikringsbevis – Hvilke utgifter? Veihjelp";
  return [
    [towing, towingLabel, "Berging eller tauing av kjøretøy og tilhenger til nærmeste verksted ved skade, utelåsing, tyveri eller annen driftsstans.", start, section],
    [vehicle, vehicleLabel, bobil
      ? "Dekker hjemtransport av bobilen etter avbrutt reise ved sykdom, ulykke eller dødsfall hos fører eller passasjer. Ved tyveri eller når bobilen ikke kan repareres innen to virkedager, dekkes hjemtransport av bobilen når den er gjenfunnet eller reparert. Hjemtransport av bobilen er unntatt hvis fører eller passasjer kan kjøre hjem."
      : "Dekker hjemtransport av motorsykkel og tilhenger ved avbrutt reise etter sykdom, ulykke eller dødsfall hos fører eller passasjer, eller når motorsykkelen er stjålet eller ikke kan repareres innen to virkedager. Hjemtransport av kjøretøy er unntatt hvis fører eller passasjer kan kjøre hjem.",
      detail, detail === start ? section : section + ", jf. side " + start],
    [persons, personsLabel, "Hjemreise for fører og passasjerer ved avbrutt reise etter sykdom, ulykke eller dødsfall, eller når kjøretøyet er stjålet eller ikke kan repareres innen to virkedager. Dekker merutgifter til hotell i stedet for hjemreise når kjøretøyet repareres innen rimelig tid, og nødvendig transport til hotell, sykehus eller lege.",
      detail, detail === start ? section : section + ", jf. side " + start],
  ];
}

function trygRoadside(section: string): Row[] {
  return [
    [towing, towingLabel, "Berging eller tauing av kjøretøy og tilhenger ved skade, utelåsing, startproblemer, upåregnelig driftsstans eller tom tank eller driftsbatteri. Transport til nærmeste verksted dekkes dersom reparasjon på stedet ikke er rimeligere.", 2, section + " – Assistanse og transport av kjøretøy"],
    [vehicle, vehicleLabel, "Nødvendige merutgifter til henting av etterlatt kjøretøy og eventuell tilhenger under vilkårene for veihjelp. Erstatningen er begrenset til 50 % av kjøretøyets verdi på skadetidspunktet.", 2, section + " – Assistanse og transport av kjøretøy"],
    [persons, personsLabel, "Nødvendige merutgifter til billigste hjemreise, inkludert bagasje, ved skade som ikke kan utbedres til trafikksikker stand innen rimelig tid, eller tyveri uten gjenfunn innen rimelig tid. Dekker også passasjerer når fører rammes av ulykke, plutselig sykdom eller dødsfall. Annet reisemål kan dekkes inntil kostnaden for hjemreise. Haikere er unntatt.", 2, section + " – Persontransport"],
  ];
}

const storebrandRoadside: Row[] = [
  [towing, towingLabel, "Nødvendig transport til nærmeste verksted eller rimeligere reparasjon på stedet ved blant annet dekket skade, tyveri, startvansker, motorstopp, tom tank, feilfylling, utelåsing eller punktering.", 11, "6.2.3 Veihjelp nr. 1"],
  [vehicle, vehicleLabel, "Rimeligste hjemtransport inkludert bagasje hvis kjøretøyet ikke kan repareres innen rimelig tid eller sykdom, ulykke eller dødsfall hindrer videre reise. I disse tilfellene er grensen 50 % av kjøretøyets verdi på hjemsendelsestidspunktet. Dekker også rimeligste hjemtransport ved gjenfunn etter tyveri når kunden har reist hjem.", 11, "6.2.3 Veihjelp nr. 2–3"],
  [persons, personsLabel, "Rimeligste hjemreise og opphold for fører og passasjerer inkludert bagasje ved forholdene som gir rett til hjemtransport. Originalkvittering kreves. Ved hjemreise på grunn av sykdom eller ulykke må det foreligge legeerklæring.", 11, "6.2.3 Veihjelp nr. 4 og Begrensninger nr. 4"],
];
const frendeRoadside: Row[] = [
  [towing, towingLabel, "Nødvendig berging av kjøretøy og påkoblet tilhenger eller campingvogn til nærmeste verksted, eller rimeligere reparasjon på stedet, når videre kjøring hindres av for eksempel skade, driftsstans, punktering, tomt batteri eller sykdom. Gjelder også hjemme.", 3, "5.2 Veihjelp – berging av kjøretøy"],
  [vehicle, vehicleLabel, "Ved henting av reparert eller etterlatt kjøretøy dekkes forhåndsgodkjente reiseutgifter for én person tilbake til kjøretøyet, tilhengeren eller campingvognen. Ved gjenfunn etter tyveri dekkes nødvendige hjemtransportutgifter inntil kjøretøyets markedsverdi.", 3, "5.4 Hjemtransport av kjøretøyet"],
  [persons, personsLabel, "Hvis kjøretøyet ikke kan repareres samme dag, dekkes rimelige og nødvendige merutgifter til hjemreise utover planlagt hjemkjøring. Frende kan dekke hotell i stedet hvis det er rimeligere. Utgiftene må forhåndsgodkjennes.", 3, "5.3 Hjemtransport av fører og passasjer eller hotellopphold"],
];

function fremtindRoadside(type: VehicleType): Row[] {
  const mc = type === "MC";
  return [
    [towing, towingLabel, "Nødvendig transport til nærmeste egnede verksted ved dekket skade eller upåregnelig driftsstans, eller rimeligere reparasjon på stedet. Assistanse ved driftsstans på bostedsadressen og ved tom tank omfattes.", mc ? 6 : 5, "Minikasko 2.4.2 Transport av kjøretøy"],
    [vehicle, vehicleLabel, "Merutgifter til henting eller transport av etterlatt kjøretøy etter forholdene i veihjelpsvilkåret. Transport er begrenset til 50 % av markedsverdien." +
      (mc ? " Grensen gjelder ikke ved erstatningsmessig skade." : ""), mc ? 6 : 5, "Minikasko 2.4.2 Transport av kjøretøy"],
    [persons, personsLabel, "Nødvendige merutgifter til rimeligste hjemreise når fører eller passasjer rammes av ulykke, plutselig sykdom eller dødsfall, kjøretøyet får en dekket skade eller uventet driftsstans og ikke kan settes raskt nok i trafikksikker stand, eller det er stjålet uten raskt gjenfunn. Videre reise til bestemmelsesstedet kan dekkes hvis det er rimeligere.", 5, "Minikasko 2.4.1 Persontransport" + (mc ? " (fortsetter på side 6)" : "")],
    [holidayRental + ".dekning", holidayRentalLabel, "Ved dekket skade utenfor Norden kan leiebil dekkes for å følge fastlagt reiserute. Driftsstans alene gir ikke dekning. Leieforholdet må godkjennes av selskapet. Drivstoff, ferger, veiavgifter, ekstra ulykkesforsikring og særskilt avtalt leiebilegenandel er unntatt.", 5, "Minikasko 2.4.1 Persontransport"],
    [holidayRental + ".dagsgrense", holidayRentalLabel + " – beløp per dag", mc ? "Inntil 350 kr per dag." : "Inntil 600 kr per dag.", 5, "Minikasko 2.4.1 Persontransport"],
    [holidayRental + ".dager", holidayRentalLabel + " – antall dager", mc ? "Inntil 30 dager." : "Inntil 45 dager.", 5, "Minikasko 2.4.1 Persontransport"],
  ];
}

export function addVerifiedMcBobilMarketEvidence(
  sources: Readonly<Record<string, CatalogSource>>,
  facts: Record<string, CatalogFact[]>,
  products: readonly CatalogProduct[],
): void {
  const lookup = new Map(products.map(product => [product.productId, product]));

  function apply(type: VehicleType, providerId: string, id: string, version: string | null, primary: Document,
    rows: readonly Row[], evidence = primary, scope = "ordinary", component = id) {
    const product = lookup.get(id);
    if (!product || product.insuranceType !== type || product.providerId !== providerId ||
      product.version !== version || product.sourceId !== primary[0] ||
      (product.agreementScope ?? "ordinary") !== scope || !product.componentIds?.includes(component) || !facts[component]) return;
    for (const [sourceId, sha256, termsNumber, effectiveFrom] of [primary, evidence]) {
      const source = sources[sourceId];
      if (source?.id !== sourceId || source.sha256 !== sha256 || source.termsNumber !== termsNumber ||
        source.effectiveFrom !== effectiveFrom || source.insuranceType !== type || source.providerId !== providerId ||
        source.sourceType !== "full_terms" || (source.agreementScope ?? "ordinary") !== scope ||
        (source.productIds && !source.productIds.includes(id))) return;
    }
    const source = sources[evidence[0]];
    const updated = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...facts[component].filter(fact => !updated.has(fact.key)),
      ...rows.map(([key, label, value, page, section, coverageAvailability]) => ({
        key, label, value, ...(coverageAvailability && { coverageAvailability }),
        source: { documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, company: source.company, url: source.url, version: source.version,
          agreementScope: source.agreementScope, page, section },
      })),
    ];
  }

  for (const type of ["Bobil", "MC"] as const) {
    const slug = type.toLowerCase();
    const ifMotor: Document = ["mcb:if:" + slug + ":if-MOT2-2.pdf",
      "57a0966a974bddc588454e8c829ad02543649c5e577c3fec5f804b8bf2d81987", "MOT2-2", "2024-03"];
    const storebrand: Document = ["storebrand:motor10:" + slug, storebrandHash, "motor10", "2026-11-15"];
    for (const level of ["delkasko", "kasko"]) {
      apply(type, "if", "if-" + slug + "-" + level, "2024-03", ifMotor, ifRoadside);
      apply(type, "storebrand", "storebrand-" + slug + "-" + level + "-motor10", "motor10", storebrand, storebrandRoadside);
    }
    const frende: Document = ["mcb-ff-frende-" + slug + "-terms:2026-11-20", frendeHash, "", "2026-11-20"];
    for (const level of type === "Bobil" ? ["delkasko", "kasko", "utvidet"] : ["delkasko", "kasko"]) {
      const id = "frende-" + slug + "-" + level;
      apply(type, "frende", id, "2026-11-20", frende, [
        ...frendeRoadside,
        ...(level === "utvidet" ? [[moisturePipes, moisturePipesLabel,
          "Fukt- og råteskade etter rørbrudd eller lekkasje fra rør eller ledninger er unntatt fra fuktdekningen.", 5,
          "8.7 Fukt- og råteskade i bobil", "unavailable"] satisfies Row] : []),
      ], frende, "ordinary", id + ":2026-11-20");
    }
    if (type === "Bobil") {
      apply(type, "storebrand", "storebrand-bobil-super-motor10", "motor10", storebrand, storebrandRoadside);
      apply(type, "if", "if-bobil-super", "2022-06", ifSpecial, ifRoadside, ifMotor);
    }
  }
  apply("Bobil", "if", "if-bobil-super", "2022-06", ifSpecial, [
    [moisturePipes, moisturePipesLabel, "Dekker skader etter lekkasje fra boenhetens ferskvann, avløp eller varmesystem. På denne dekningen kreves ingen fuktkontroll. Bobilen må være nyere enn 15 år regnet fra produksjonsåret.", 2, "3.3.1 Fukt/vannskader – Skader som skyldes boenhetens røranlegg"],
  ]);

  for (const [type, level, hash, start, detail] of gjensidigeDocuments) {
    const slug = type.toLowerCase();
    const id = "gjensidige-" + slug + "-" + level;
    const source: Document = ["mc-bobil:" + id + "-vilkar.pdf:" + slug, hash, "", ""];
    const rentalDelay = type === "Bobil" ? "tre virkedager" : "to virkedager";
    const rentalSection = "Forsikringsbevis – Veihjelp ved feriereiser utenfor Norden";
    apply(type, "gjensidige", id, null, source, [
      ...gjensidigeRoadside(type, start, detail),
      ...(level === "delkasko" ? [] : [
        [holidayRental + ".dekning", holidayRentalLabel, "Ved feriereise utenfor Norden kan leie av et kjøretøy av tilnærmet samme type dekkes for å fullføre ferien når det forsikrede kjøretøyet ikke kan repareres innen " + rentalDelay + ".", 4, rentalSection] satisfies Row,
        [holidayRental + ".dager", holidayRentalLabel + " – antall dager", "Inntil 15 dager.", 4, rentalSection] satisfies Row,
      ]),
    ]);
  }

  for (const [type, delCode, delHash, delDate, kaskoCode, kaskoHash, kaskoDate, extraCode, extraHash] of trygDocuments) {
    const slug = type.toLowerCase();
    const document = (number: string, hash: string, date: string): Document =>
      ["mcb:tryg:" + slug + ":tryg-05" + number + ".pdf", hash, number, date];
    const delkasko = document(delCode, delHash, delDate);
    const kasko = document(kaskoCode, kaskoHash, kaskoDate);
    const extra = document(extraCode, extraHash, "2026-07-01");
    const id = "tryg-" + slug + "-" + slug + "-ekstra";
    apply(type, "tryg", "tryg-" + slug + "-delkasko", delDate, delkasko, trygRoadside("2.4 Veihjelp"));
    apply(type, "tryg", "tryg-" + slug + "-kasko", kaskoDate, kasko, trygRoadside("2.5 Veihjelp"));
    apply(type, "tryg", id, "2026-07-01", extra, trygRoadside("2.5 Veihjelp"), kasko);
    apply(type, "tryg", id, "2026-07-01", extra, type === "Bobil" ? [
      [moisturePipes, moisturePipesLabel, "Fuktskade som skyldes rørbrudd eller lekkasje fra rør, er unntatt fra fuktdekningen.", 1, "Fuktskade – Unntak", "unavailable"],
    ] : [
      ["leiebil.dekning", "Leiebil", "Leie av bil eller motorsykkel ved en skade forsikringen dekker. Faktura fra utleieselskapet kreves. Øvrige bruksutgifter erstattes ikke.", 1, "Leiebil"],
      ["leiebil.dagsgrense", "Leiebil – beløp per dag", "Inntil 500 kr per dag.", 1, "Leiebil"],
      ["leiebil.dager", "Leiebil – antall dager", "Normal reparasjonstid, inntil 10 dager.", 1, "Leiebil"],
      ["veihjelp.reservedeler.grense", "Levering av reservedeler på langtur – beløpsgrense", "Inntil 3 000 kr for dokumentert transport av reservedeler etter plutselig og uforutsett teknisk feil som hindrer videre ferdsel. Langtur betyr minst tre timers reisetid fra bostedsadressen. Ingen egenandel.", 1, "Transportkostnader langtur"],
    ]);
  }

  for (const level of ["delkasko", "kasko"]) {
    apply("MC", "fremtind", "fremtind-mc-" + level, null, fremtindMc, fremtindRoadside("MC"), fremtindMcMini, "ordinary-sparebank1");
  }
  const dnbDate = "2026-09-24";
  const minikasko: Document = ["minikasko-mcb-ff-fremtind-bobil-minikasko-marked-20260924",
    "3ca7b4f39b08b4aba1003023f35c5b97a86b5d0776a2f5c5f89b9890933f4537", "PMO-357.210-013", dnbDate];
  const kasko: Document = ["kasko-mcb-ff-fremtind-bobil-kasko-marked-20260924",
    "63a859a5de71d44f7a22bfd0a079107b0798e7c3af20990e7f9cebd829f51303", "PMO-357.220-007", "2025-09-18"];
  const topp: Document = ["topp-mcb-ff-fremtind-bobil-topp-marked-20260924",
    "7510de8c6fe0f23c20e36361510de715c48654a3d7f77ad81a3ad7a49a3f3cfa", "PMO-350.210-011", "2025-09-18"];
  for (const [level, primary] of [["minikasko", minikasko], ["kasko", kasko], ["topp", topp]] as const) {
    const evidence: Document = level === "minikasko" ? minikasko
      : [level + "-mcb-ff-fremtind-bobil-topp-mini-marked-20260924", primary[1], "PMO-357.210-013", dnbDate];
    apply("Bobil", "fremtind", "fremtind-bobil-" + level + "-marked-20260924", dnbDate,
      primary, fremtindRoadside("Bobil"), evidence, "ordinary-dnb");
  }
}
