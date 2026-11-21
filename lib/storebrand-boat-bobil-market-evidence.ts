import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [key: string, label: string, value: string, page: number, section: string,
  options?: Pick<CatalogFact, "coverageAvailability" | "deductibleClassification">];

const included = { coverageAvailability: "included" } as const;
const unavailable = { coverageAvailability: "unavailable" } as const;
const coverageDeductible = { deductibleClassification: "coverage" } as const;

const boatCommonRows: ReviewedRow[] = [
  ["bat.ansvar.grense", "Ansvar – grense",
    "Per hendelse dekkes inntil 3 020 000 SDR ved personskade og 1 510 000 SDR ved tingskade.", 16, "9.1 Hva forsikringen dekker"],
  ["bat.ansvar.egenandel", "Ansvar – egenandel",
    "Ingen egenandel, med mindre annet står i forsikringsbeviset.", 17, "9.4 Egenandel", coverageDeductible],
  ["bat.vrakfjerning.grense", "Vrakfjerning",
    "Ingen særskilt beløpsgrense for fjerning av vrak som er til sjenanse eller skjemmende, eller som en offentlig myndighet pålegger fjernet. Godtgjørelse må avtales med Storebrands samtykke.",
    16, "9.1 Hva forsikringen dekker, jf. oversikten på PDF-side 4 og samtykke i 8.1 på PDF-side 14", included],
  ["bat.rettshjelp.grense", "Rettshjelp – grense",
    "Inntil 100 000 kr per tvist med 1–2 parter på sikredes side. Ved 3–10 parter er grensen 250 000 kr, ved 11–25 parter 500 000 kr, ved 26–49 parter 750 000 kr og ved minst 50 parter 1 000 000 kr. Uten forhåndsgodkjenning av utgiftene er erstatningen begrenset til den antatte økonomiske verdien av sikredes interesse i tvisten.",
    19, "10.5 Forsikringssum"],
  ["bat.rettshjelp.egenandel", "Rettshjelp – egenandel",
    "4 000 kr pluss 20 % av det resterende erstatningsbeløpet. Det trekkes én egenandel per tvist, også med flere parter på samme side.",
    19, "10.6 Egenandel", coverageDeductible],
  ["bat.brann.egenandel", "Brann – egenandel", "6 000 kr hvis forsikringsbeviset ikke oppgir noe annet.",
    8, "5.1.3 Egenandeler", coverageDeductible],
  ["bat.tyveri.egenandel", "Tyveri – egenandel",
    "6 000 kr hvis forsikringsbeviset ikke oppgir noe annet. Ved tyveri av utenbordsmotor reduseres egenandelen med 4 000 kr når motoren var låst eller boltet fast med godkjent boltlås eller tilsvarende. Ved tyveri av båten gis samme reduksjon hvis den hadde et FG-godkjent søke- og gjenfinningssystem i drift på tyveritidspunktet, eller hele båten var merket med Securmark.",
    8, "5.1.3 Egenandeler", coverageDeductible],
  ["bat.redning.bergelonn", "Bergelønn",
    "Bergelønn ved vellykket berging dekkes etter reglene om berging i sjøloven. Vilkårstabellen oppgir ingen særskilt beløpsgrense. Godtgjørelsen må avtales med Storebrands samtykke.",
    8, "5.1.3 nr. 5 Bergelønnskrav, jf. samtykke i 8.1 på PDF-side 14", included],
  ["bat.kriseterapi.dekning", "Kriseterapi",
    "Inntil 10 behandlingstimer hos psykolog etter avtale ved alvorlig kollisjon, personskade eller brann i den forsikrede båten, eller ved ran, overfall eller voldtekt i tilknytning til båten. Ran, overfall og voldtekt må politianmeldes. Terapi senere enn 12 måneder fra skadedato er unntatt.",
    8, "5.1.3 nr. 6 Kriseterapi", included],
  ["bat.ulykke.dekning", "Fører- og passasjerulykke",
    "Ulykkesskade på personer som oppholder seg om bord med eierens tillatelse. Skade utenfor båten dekkes hvis båten er den direkte årsaken. Betalende passasjerer og utleie er unntatt.",
    20, "11.1 Hvem forsikringen gjelder for og 11.2 Hva er forsikret, jf. nivåoversikten på PDF-side 4", included],
  ["bat.ulykke.invaliditet", "Fører- og passasjerulykke – medisinsk invaliditet",
    "Ved 100 % livsvarig medisinsk invaliditet er summen 200 000 kr per voksen og 500 000 kr per barn under 18 år. Ved lavere invaliditetsgrad reduseres erstatningen forholdsmessig.",
    20, "11.2 Hva er forsikret – Livsvarig medisinsk invaliditet", included],
  ["bat.ulykke.dod", "Fører- og passasjerulykke – dødsfall", "100 000 kr per forsikret ved dødsfall som følge av ulykkesskaden.",
    20, "11.2 Hva er forsikret – Død", included],
  ["bat.ulykke.grense", "Fører- og passasjerulykke – samlet grense", "Inntil 1 000 000 kr samlet per skadetilfelle.",
    20, "11.2 Hva er forsikret – Samlet erstatning"],
  ["bat.ulykke.behandling", "Fører- og passasjerulykke – behandlingsutgifter", "Behandlingsutgifter dekkes ikke under ulykkesdekningen.",
    20, "11.2 Hva er forsikret – Behandlingsutgifter", unavailable],
  ["bat.maskinskade.dekning", "Motor- og maskinskade",
    "Motoren har ingen egen maskinskadedekning. Motorskade kan dekkes når den følger av brann, lynnedslag, eksplosjon, tyveri, hærverk eller sammenstøt, når skroget også har vært utsatt for kantring eller synking, eller ved riggbrudd. Skadeårsaken må være dekket på valgt nivå.",
    11, "6 nr. 18 Skader som ikke dekkes", unavailable],
];

const boatHullRows: ReviewedRow[] = [
  ["bat.kasko.dekning", "Skade på egen båt",
    "Skade ved grunnstøting, sammenstøt, kantring, synking eller annen tilfeldig, plutselig ytre påvirkning. Kontroll av skroget inngår etter grunnstøting.",
    9, "5.2 Kasko og nr. 1 Kontroll av skrog etter grunnstøting", included],
  ["bat.kasko.egenandel", "Skade på egen båt – egenandel", "8 000 kr hvis forsikringsbeviset ikke oppgir noe annet.",
    9, "5.2 Kasko – Egenandeler", coverageDeductible],
  ["bat.transport.skade.dekning", "Skade på båten under transport",
    "Skade på båt og tilbehør ved en tilfeldig, plutselig ytre påvirkning under transport dekkes innenfor forsikringssummen.",
    9, "5.2 nr. 2 Skade på båt og tilbehør under transport", included],
];

const boatSuperRows: ReviewedRow[] = [
  ["bat.ferieavbrudd.dekning", "Ferieavbrudd",
    "Ved dekket brann-, tyveri- eller kaskoskade fra 15. april til 15. september. Ved brann eller kaskoskade må båten være sjøudyktig. Normal reparasjonstid og ventetid regnes fra skaden er meldt til Storebrand og politiet. Ved tyveri regnes tiden fra melding til Storebrand til båten kommer til rette, med eventuell normal reparasjonstid for skader knyttet til tyveriet.",
    10, "5.3 nr. 1 Ferieavbruddsforsikringen", included],
  ["bat.ferieavbrudd.dagsbelop", "Ferieavbrudd – beløp per dag", "2 promille (0,2 %) av båtens forsikringssum per dag.",
    10, "5.3 nr. 1 Ferieavbruddsforsikringen"],
  ["bat.ferieavbrudd.dager", "Ferieavbrudd – antall dager", "Inntil 30 dager. Ved totalskade gis erstatning for 30 dager.",
    10, "5.3 nr. 1 Ferieavbruddsforsikringen"],
  ["bat.ferieavbrudd.grense", "Ferieavbrudd – samlet grense", "Inntil 60 000 kr samlet.",
    10, "5.3 nr. 1 Ferieavbruddsforsikringen"],
  ["bat.totalskade.dekning", "Totalskade og ny båt",
    "For båt og motor kjøpt som ny kan en tilsvarende ny båt eller motor erstattes innen forsikringssummen, med samme merke, modell, årgang og utstyrsnivå. For bruktbåt gjelder egne oppgjørsregler i punkt 5.3 nr. 6 og 8.3. Dokumentasjon av kjøpet kreves.",
    10, "5.3 nr. 6 Totalskadegaranti", included],
  ["bat.totalskade.skadegrad", "Totalskade og ny båt – skadeterskel",
    "For båt eller motor kjøpt som ny gjelder garantien når båten eller motoren er tapt, eller reparasjonen koster mer enn 80 % av importørens listepris for tilsvarende båt eller motor på skadetidspunktet.",
    10, "5.3 nr. 6 Totalskadegaranti – Båt kjøpt som ny"],
  ["bat.totalskade.alder", "Totalskade og ny båt – aldersgrense", "Inntil tre år fra båt eller motor ble kjøpt ny. For bruktbåt regnes tre år fra kjøpsdatoen etter bruktbåtregelen.",
    10, "5.3 nr. 6 Totalskadegaranti"],
];

const bobilAnimalCollision: ReviewedRow = ["kasko.egenandel.dyr", "Påkjørsel av dyr – egenandel",
  "Egenandelen reduseres med 6 000 kr ved påkjørsel av dyr som går løse på veien, dersom politiet eller viltnemnda på stedet varsles umiddelbart.",
  13, "6.3 Egenandeler", coverageDeductible];

export function addStorebrandBoatBobilMarketEvidence(
  sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>, products: CatalogProduct[],
) {
  function apply(productId: string, source: CatalogSource, rows: ReviewedRow[]) {
    if (!products.some(product => product.productId === productId && product.sourceId === source.id &&
      product.version === source.version && product.componentIds?.includes(productId))) return;

    const keys = new Set(rows.map(([key]) => key));
    facts[productId] = [
      ...(facts[productId] ?? []).filter(row => !keys.has(row.key)),
      ...rows.map(([key, label, value, page, section, options]) => ({
        key, label, value, ...options,
        source: {
          documentId: source.id, filename: source.filename, termsNumber: source.termsNumber,
          effectiveFrom: source.effectiveFrom, company: source.company, url: source.url,
          version: source.version, agreementScope: source.agreementScope, page, section,
        },
      })),
    ];
  }

  const boat = sources["boat-pet:storebrand:båt"];
  if (boat?.sha256 === "e945049a6b9fba643d9804279690fc8e1dfbb1cd4a419a81503e58fd5b959baa" &&
    boat.termsNumber === "båt03" && boat.effectiveFrom === "2024-09-01" && boat.version === "2024-09-01") {
    for (const level of ["delkasko", "kasko", "super"]) {
      const advanced = level !== "delkasko";
      const superLevel = level === "super";
      apply("storebrand-bat-" + level, boat, [
        ...boatCommonRows,
        ["bat.transport.dekning", "Transport til verksted etter skade",
          "Rimelige kostnader til nødvendig transport eller midlertidig reparasjon for å få skadet båt eller tilbehør til nærmeste verksted som kan reparere. Gjelder etter " +
          (advanced ? "brann, tyveri eller annen dekket skade." : "dekket brann- eller tyveriskade."),
          8, "5.1.3 nr. 2 Transport av skadet båt til nærmeste verksted, jf. nivåoversikten på PDF-side 7", included],
        ["bat.redning.hjemtransport.dekning", "Hjemtransport av båten",
          "Rimelige merutgifter til hjemtransport etter reparasjon av en dekket " +
          (advanced ? "skade" : "brann- eller tyveriskade") + " eller når båten er gjenfunnet etter tyveri." +
          (superLevel ? " Super dekker også nødvendige merutgifter for å få en etterlatt båt til fast havn når reisen hindres av et plutselig båtuhell eller av sykdom, ulykke eller dødsfall hos fører eller passasjer." : ""),
          8, superLevel ? "5.1.3 nr. 3, jf. 5.3 nr. 3–4 på PDF-side 10" : "5.1.3 nr. 3 Hjemtransport av båt", included],
        ["bat.losore.dekning", "Løsøre og bagasje", "Bagasje omfattes ved brann eller tyveri." +
          (advanced ? " Ved kaskoskade på løst utstyr og bagasje gjelder de særskilt oppførte skadeårsakene i vilkåret." : ""), 7,
          advanced ? "5.1.1 Brann og 5.1.2 Tyveri, jf. 6 nr. 20 på PDF-side 11" : "5.1.1 Brann og 5.1.2 Tyveri", included],
        ["bat.losore.grense", "Løsøre og bagasje – grense",
          superLevel ? "Inntil 100 000 kr ved brann eller tyveri av bagasje." : "Inntil 50 000 kr ved brann eller tyveri av bagasje.",
          7, "5.1.1 Brann og 5.1.2 Tyveri"],
        ...(advanced ? boatHullRows : [["bat.transport.skade.dekning", "Skade på båten under transport",
          "Dekningen for tilfeldig, plutselig ytre skade på båt og tilbehør under transport inngår i Kasko og Super.",
          9, "5.2 Kasko – Nivåoversikt og nr. 2 Skade på båt og tilbehør under transport", unavailable] as const]),
        ...(superLevel ? boatSuperRows : []),
      ]);
    }
  }

  const bobil = sources["storebrand:motor10:bobil"];
  if (bobil?.sha256 === "40e0be304d36a651ab77c76bb9af02ab771b20e516aa0d671d17188d9623ccd7" &&
    bobil.termsNumber === "motor10" && bobil.effectiveFrom === "2026-11-15" && bobil.version === "motor10") {
    for (const level of ["kasko", "super"]) {
      apply("storebrand-bobil-" + level + "-motor10", bobil, [bobilAnimalCollision]);
    }
  }
}
