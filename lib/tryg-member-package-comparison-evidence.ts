import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

type ReviewedRow = readonly [key: string, label: string, value: string, section: string, availability?: CatalogFact["coverageAvailability"]];
type PageReference = readonly [page: number, section: string];
type PagedRow = readonly [page: number, row: ReviewedRow, qualification?: PageReference];

const travelCancellationRow: ReviewedRow = [
  "reise.avbestilling.sum", "Avbestilling – forsikringssum",
  "Ubegrenset forsikringssum ved avbestilling som omfattes av vilkårene.", "Avbestilling",
];

const udfPackageCancellation = (certificatePage: number, termsPage: number): PagedRow => [
  certificatePage,
  [
    "reise.avbestilling.sum", "Avbestilling – forsikringssum",
    "Forsikringsbeviset oppgir ubegrenset forsikringssum. Vilkårets punkt 8.2 oppgir inntil 100 000 kr for samme hendelse eller reise. Forsikringsbeviset gjelder foran vilkårene ved motstrid.",
    "Forsikringsbevis – avbestilling",
  ],
  [termsPage, "8.2 Beregning av erstatning ved avbestilling"],
];

const commonTravelRows: readonly ReviewedRow[] = [
  ["reise.forsinkelse.fremmote_sum", "Forsinket fremmøte – sum", "Ubegrenset forsikringssum, med enkelte utgiftsbegrensninger.", "Forsinket fremmøte"],
  ["reise.bagasje.total", "Reisegods – samlet sum", "Ubegrenset samlet forsikringssum, med særgrenser for enkelte eiendeler.", "Reisegods"],
  ["reise.bagasje.per_gjenstand", "Reisegods – enkeltgjenstand", "Inntil 40 000 kr per enkeltgjenstand.", "Reisegods"],
  ["reise.medisinsk.sum", "Reisesyke – samlet sum", "Ubegrenset forsikringssum, med enkelte utgiftsbegrensninger.", "Reisesyke"],
  ["reise.hjemtransport.sum", "Hjemtransport – sum", "Ubegrenset forsikringssum. Hjemtransport for én medreisende er omfattet etter vilkårene.", "Hjemtransport"],
  ["reise.reiseavbrudd.sum", "Reiseavbrudd – sum", "Inntil 1 500 kr per døgn per sikret.", "Reiseavbrudd"],
  ["reise.evakuering.sum", "Evakuering – sum", "Ubegrenset forsikringssum ved dekket evakuering.", "Evakuering"],
  ["reise.ansvar.sum", "Privatansvar – forsikringssum", "15 000 000 kr per skadetilfelle.", "Reiseansvar"],
  ["reise.rettshjelp.sum", "Rettshjelp – forsikringssum", "100 000 kr per tvist.", "Rettshjelp"],
];

const nitoTravelRows: readonly ReviewedRow[] = [
  ["reise.varighet.maks", "Maksimal sammenhengende reisevarighet", "De første 90 dagene av ferie-, fritids- og tjenestereiser.", "Reisens varighet"],
  ["reise.forsinkelse.avgang_sum", "Forsinket avgang – sum", "Inntil 5 000 kr per sikret.", "Forsinket avgang"],
  ["reise.bagasje.forsinket_sum", "Forsinket bagasje – sum", "Inntil 6 000 kr per sikret. Ved mellomlanding er grensen 1 000 kr.", "Forsinket bagasje"],
  ["reise.bagasje.uhell_sum", "Uhell – sum", "Inntil 8 000 kr per år.", "Uhellsdekning"],
  ["reise.bagasje.uhell_egenandel", "Uhell – egenandel", "1 500 kr per skadetilfelle. Ved gjentatt tap av eller skade på mobiltelefon er egenandelen 2 000 kr.", "Egenandel"],
  ["reise.idtyveri.juridisk", "ID-tyveri – juridisk bistand", "Inntil 25 000 kr til juridisk bistand ved ID-tyveri.", "ID-tyveri"],
];

const udfDepartureRow: ReviewedRow = [
  "reise.forsinkelse.avgang_sum", "Forsinket avgang – sum",
  "Inntil 4 000 kr per sikret. Ved overnatting inntil 3 000 kr per natt i maksimalt fem netter.",
  "Forsinket avgang",
];

const udfSharedTravelRows: readonly ReviewedRow[] = [
  ["reise.bagasje.forsinket_sum", "Forsinket bagasje – sum", "Inntil 6 000 kr per sikret. Ved mellomlanding er grensen 500 kr.", "Forsinket bagasje"],
  ["reise.leiebil.egenandel_sum", "Leiebilegenandel – sum", "Ubegrenset forsikringssum for dekket egenandel for leiebil og leid sykkel eller elsykkel.", "Egenandel leiebil og leiet sykkel/el-sykkel"],
];

const familyTravelScope = "Ektefelle eller samboer må ha samme folkeregistrerte adresse som medlemmet. Barn må være registrert hos en av foreldrene og er dekket ut kalenderåret de fyller 21 år.";
const udfExtendedFamilyTravelScope = "Fosterbarn, barnebarn og oldebarn som bor fast hos medlemmet er omfattet. Barnebarn og oldebarn er også omfattet når de reiser sammen med sikrede og mangler annen reiseforsikring.";
const nordicEligibility = "De sikrede må være fast bosatt i Norden og medlem av en offentlig trygdeordning i Norden.";

const atPage = (page: number, rows: readonly ReviewedRow[]): PagedRow[] => rows.map((row) => [page, row]);

const travelCancellationCoverage: ReviewedRow = [
  "reise.avbestilling.dekning", "Avbestilling",
  "Avbestilling ved blant annet uventet akutt sykdom, alvorlig ulykkesskade, akutt alvorlig forverring av kjent sykdom eller dødsfall hos personer angitt i vilkåret. Punkt 8 angir også andre årsaker og unntak.",
  "8.1 Tilfeller som kan gi rett til erstatning",
];

const travelMedical: ReviewedRow = [
  "reise.medisinsk.behandling", "Reisesyke – medisinsk behandling",
  "Rimelige og nødvendige behandlingsutgifter ved uventet akutt sykdom, ulykkesskade eller uventet akutt alvorlig forverring av kjent sykdom på reisen, etter vilkårene.",
  "11.1 og 11.2 Reisesyke",
];

const travelCompanion: ReviewedRow = [
  "reise.sykeledsagelse.tilkalling", "Tilkalling og sykeledsagelse",
  "Rimelige og nødvendige utgifter for inntil to nærstående som må tilkalles eller bli igjen på reisemålet. Ved sykdom eller skade må det være medisinsk nødvendig. Tryg eller Tryg Alarm må godkjenne utgiftene på forhånd.",
  "11.2 Tilkalling og sykeledsagelse",
];

const travelRepatriation: ReviewedRow = [
  "reise.hjemtransport", "Hjemtransport",
  "Nødvendige merutgifter ved medisinsk nødvendig hjemtransport før planlagt hjemreise. Det gjelder egne regler ved dødsfall og for medreisende. Hjemtransport skal forhåndsgodkjennes av Tryg eller Tryg Alarm.",
  "11.4 Hjemtransport",
];

const travelInterruption: ReviewedRow = [
  "reise.reiseavbrudd", "Reiseavbrudd",
  "Kompensasjon for tapte reisedager ved blant annet sykehusinnleggelse, sengeleie etter legens ordre eller hjemtransport som dekkes etter vilkårene. Egne unntak gjelder.",
  "11.5 Reiseavbrudd",
];

const travelLiability: ReviewedRow = [
  "reise.ansvar.dekning", "Privatansvar på reise",
  "Rettslig erstatningsansvar som privatperson ved person- eller tingskade på reise utenfor Norden, etter vilkårenes regler og unntak.",
  "13.1 Hva dekningen omfatter",
];

const travelLegal: ReviewedRow = [
  "reise.rettshjelp.dekning", "Rettshjelp på reise",
  "Nødvendige utgifter ved tvist som privatperson som oppstår på reise utenfor Norden, etter vilkårenes regler og unntak.",
  "14.1 Hva forsikringen omfatter",
];

const travelEvacuation: ReviewedRow = [
  "reise.evakuering", "Evakuering",
  "Nødvendige merutgifter ved evakuering etter vilkårenes regler ved blant annet krig, alvorlig uro, naturkatastrofe eller epidemi.",
  "12.1 og 12.2 Evakuering",
];

const cashOnTravel = (amount: string): ReviewedRow => [
  "reise.bagasje.kontanter", "Kontanter – sum",
  "Inntil " + amount + " kr per skadetilfelle ved dekket tap av reisegods.",
  "10.2 Reisegods – beløpsbegrensninger",
];

const travelPlace: ReviewedRow = [
  "reise.omrade.verden", "Geografisk område",
  "Reiser i hele verden, med unntakene i vilkåret. Reiseansvar og rettshjelp gjelder på reiser utenfor Norden.",
  "3 Hvor forsikringen gjelder",
];

const travelWarning: ReviewedRow = [
  "reise.omrade.ud", "Reiseadvarsel fra UD",
  "Dekningen gjelder ikke ved reise til et område som UD har en gyldig offisiell reiseadvarsel for ved avreise. Det gjelder også om advarselen oppheves underveis.",
  "3 Hvor forsikringen gjelder – reiseadvarsel",
];

const travelOvernight: ReviewedRow = [
  "reise.overnatting", "Reise med eller uten overnatting",
  "Forsikringen kan gjelde fra du forlater bostedsadressen i Norden, også uten overnatting. Enkelte dekninger har egne vilkår.",
  "Når forsikringen gjelder",
];

const nitoAdultAccidentSum = "500 000 kr ut forsikringsåret den forsikrede fyller 70 år. Fra forsikringsåret den forsikrede fyller 71 år og ut forsikringsåret den fyller 80 år er summen 100 000 kr.";

const nitoRows = (family: boolean): PagedRow[] => [
  ...atPage(2, [travelCancellationRow, ...commonTravelRows, ...nitoTravelRows]),
  ...atPage(6, [
    ["reise.personer.omfang", "Hvem forsikringen gjelder for",
      family
        ? "NITO-medlemmet som har kjøpt familievarianten, ektefelle eller samboer og barn. " + familyTravelScope + " Barnebarn og fosterbarn som bor fast hos medlemmet er også omfattet. " + nordicEligibility
        : "NITO-medlemmet som har kjøpt enkeltpersonvarianten. " + nordicEligibility,
      "1 Hvem forsikringen gjelder for"],
  ]),
  ...atPage(family ? 7 : 6, [travelPlace, travelWarning]),
  ...atPage(7, [travelOvernight]),
  ...atPage(family ? 8 : 7, [travelCancellationCoverage]),
  ...atPage(11, [cashOnTravel("6 000")]),
  ...atPage(12, [travelMedical]),
  ...atPage(13, [travelCompanion, travelRepatriation]),
  ...atPage(14, [
    travelInterruption,
    ["reise.medisinsk.tann", "Tannbehandling under reisesyke",
      "Tannskade og tannsykdom er unntatt under reisesyke. Separat ulykkesdekning etter punkt 17 har egne vilkår for tannbehandling.",
      "11.6 Felles unntak ved reisesyke", "unavailable"],
  ]),
  [family ? 15 : 14, travelEvacuation, family ? undefined : [15, "12.2 Evakuering – beregning"]],
  [15, travelLiability, [family ? 7 : 6, "3 Hvor forsikringen gjelder"]],
  [family ? 17 : 16, travelLegal, [family ? 7 : 6, "3 Hvor forsikringen gjelder"]],
  [19, ["reise.leiebil.egenandel", "Egenandel for leiebil og leid sykkel",
    "Egenandel ved skade på eller tyveri av leiebil, leid sykkel eller elsykkel til eget bruk på feriereise med minst én overnatting, etter vilkårene.",
    "15.1 Egenandelsforsikring for leiebil"]],
  [19, ["reise.leiebil.egenandel_sum", "Leiebilegenandel – sum",
    "Forsikringsbeviset oppgir ubegrenset forsikringssum for leiebilegenandel. Punkt 15.1 omfatter egenandel ved skade på eller tyveri av leiebil og leid sykkel eller elsykkel på feriereise med minst én overnatting.",
    "15.1 og 15.2 Egenandelsforsikring for leiebil"], [2, "Forsikringsbevis – egenandelsforsikring for leiebil"]],
  [20, ["reise.ulykke.dekning", "Ulykkesdekning",
    "Dekker varig medisinsk invaliditet, behandlingsutgifter og dødsfall etter ulykkesskade. Ulykkesdekningen opphører ved utgangen av forsikringsåret den forsikrede fyller 80 år.",
    "17.1 Hva ulykkesforsikringen omfatter"], [6, "1 Hvem forsikringen gjelder for – opphør av ulykkesdekning"]],
  [21, ["reise.ulykke.invaliditet", "Medisinsk invaliditet etter ulykke",
    nitoAdultAccidentSum + (family ? " Medforsikrede barn har 500 000 kr ut forsikringsåret de fyller 21 år." : ""),
    "17.3 A Varig skade på person"], [2, "Forsikringsbevis – forsikringssummer for medisinsk invaliditet"]],
  [family ? 22 : 21, ["reise.ulykke.behandling", "Behandlingsutgifter etter ulykke",
    "Inntil 5 % av forsikringssummen for medisinsk invaliditet til rimelig og nødvendig behandling innen tre år fra ulykken. Utgifter som erstattes fra annet hold, trekkes fra.",
    "17.3 B Utgifter til medisinsk behandling"]],
  [22, ["reise.ulykke.dodsfall", "Dødsfall etter ulykke",
    nitoAdultAccidentSum + (family ? " Medforsikrede barn har 100 000 kr ut forsikringsåret de fyller 21 år." : "") +
    " Dødsfallet må skyldes ulykkesskaden og inntreffe innen ett år.",
    "17.3 C Dødsfall etter ulykke"], [21, "17.2 B Dødsfall etter ulykke"]],
];

const udfTravelRows = (family: boolean): PagedRow[] => [
  ...atPage(2, [travelCancellationRow, ...commonTravelRows, udfDepartureRow, ...udfSharedTravelRows, [
    "reise.overnatting", "Reise med eller uten overnatting",
    "Gjelder fra du forlater bostedsadressen i Norden. Reisen trenger ingen overnatting.",
    "Forsikringsbevis reiseforsikring",
  ]]),
  ...atPage(6, [
    ["reise.personer.omfang", "Hvem forsikringen gjelder for",
      family
        ? "Utdanningsforbundets medlem med gyldig tilslutning og familie når familievarianten er valgt. " + familyTravelScope + " " + udfExtendedFamilyTravelScope + " Au pair som bor hos medlemmet er også omfattet, med unntak for ulykkesdekningen. " + nordicEligibility
        : "Utdanningsforbundets medlem med gyldig tilslutning for én person. " + nordicEligibility,
      "1 Hvem forsikringen gjelder for"],
  ]),
  ...atPage(8, [
    ["reise.varighet.maks", "Maksimal sammenhengende reisevarighet", "De første 90 dagene av hver reise. Vilkåret angir særskilte utvidelser ved forsinket hjemreise.", "Når forsikringen gjelder"],
  ]),
  ...atPage(7, [travelPlace, travelWarning]),
  ...atPage(9, [travelCancellationCoverage]),
  ...atPage(14, [cashOnTravel("6 000")]),
  ...atPage(15, [
    travelMedical,
    ["reise.medisinsk.tann", "Tannbehandling under reisesyke",
      "Nødvendig tannbehandling dekkes inntil 5 000 kr ved ulykke og inntil 1 000 kr per skadetilfelle ved akutt tannskade som må behandles på reisen. Tannskade ved spising regnes ikke som ulykke.",
      "11.2 Behandling av tannskade"],
  ]),
  ...atPage(16, [travelCompanion, travelRepatriation]),
  ...atPage(17, [travelInterruption]),
  ...atPage(18, [travelEvacuation]),
  [19, travelLiability, [7, "3 Hvor forsikringen gjelder"]],
  [21, travelLegal, [7, "3 Hvor forsikringen gjelder"]],
  [24, ["reise.leiebil.egenandel", "Egenandel for leiebil og leid sykkel",
    "Egenandel ved skade på eller tyveri av leiebil, leid sykkel eller elsykkel til eget bruk på feriereise med minst én overnatting, etter vilkårene.",
    "15.1 Egenandel leiebil og leiet sykkel eller elsykkel"]],
  [6, ["reise.ulykke.dekning", "Ulykkesdekning",
    "Dekker varig medisinsk invaliditet og dødsfall etter ulykkesskade. Unntatt er forsikrede omfattet av Utdanningsforbundets grunnforsikring eller 70+, samt au pair.",
    "1 Hvem forsikringen gjelder for – ulykke"], [25, "16.1 Hvilke skader ulykkesforsikringen omfatter"]],
  [25, ["reise.ulykke.invaliditet", "Medisinsk invaliditet etter ulykke",
    "Inntil 500 000 kr per forsikret. Dekningen opphører ved utgangen av kalenderåret den forsikrede fyller 75 år.",
    "16.2 Erstatning for varig skade på person"], [6, "1 Hvem forsikringen gjelder for – opphør ved 75 år"]],
  [26, ["reise.ulykke.dodsfall", "Dødsfall etter ulykke",
    "0,5 G per forsikret ved dødsfall som skyldes ulykkesskade. Dødsfallsdekningen opphører ved utgangen av kalenderåret den forsikrede fyller 70 år.",
    "16.3 Erstatning ved dødsfall"], [7, "1 Hvem forsikringen gjelder for – opphør av dødsfallsdekning ved 70 år"]],
];

const plus70Rows = (family: boolean): PagedRow[] => [
  ...atPage(2, [
    ["innbo.forsikringssum", "Samlet forsikringssum for innbo og løsøre", "Inntil 3 000 000 kr per skade.", "Innboforsikring – forsikringssum"],
    ["innbo.egenandel", "Generell egenandel for innbo", "2 000 kr. Særregler gjelder for uregistrert sykkel og elsykkel, naturskade, rettshjelp og privatansvar.", "Innboforsikring – egenandel"],
    ["innbo.dekning", "Hva innboforsikringen dekker", "Privat innbo og løsøre ved brann, vannskade, innbrudd, uhell og naturskade. Tryg ID er inkludert.", "Innboforsikring"],
    ["ansvar.sum", "Privatansvar under innboforsikringen – forsikringssum", "5 000 000 kr.", "Innboforsikring – forsikringssum"],
    ["rettshjelp.grense", "Rettshjelp under innboforsikringen – forsikringssum", "100 000 kr.", "Innboforsikring – forsikringssum"],
    ["reise.varighet.maks", "Maksimal sammenhengende reisevarighet", "Inntil 90 dager per reise. Reisen regnes fra du forlater bostedsadressen i Norden, også uten overnatting.", "Reiseforsikring"],
    travelOvernight,
    udfDepartureRow,
  ]),
  udfPackageCancellation(2, 29),
  ...atPage(3, [
    ...commonTravelRows, ...udfSharedTravelRows,
    ["reise.tjeneste.legehjelp", "Tryg Legehjelp", "Telefontjeneste med leger og sykepleiere 365 dager i året.", "Helsetelefonen Tryg Legehjelp"],
  ]),
  ...atPage(26, [
    ["reise.personer.omfang", "Hvem reiseforsikringen gjelder for",
      family
        ? "Utdanningsforbundets medlem med gyldig tilslutning til 70+ og familien i familievarianten. " + familyTravelScope + " " + udfExtendedFamilyTravelScope + " " + nordicEligibility
        : "Utdanningsforbundets medlem med gyldig tilslutning til 70+ for én person. " + nordicEligibility,
      "1 Hvem forsikringen gjelder for"],
  ]),
  ...atPage(27, [travelPlace, travelWarning]),
  ...atPage(33, [cashOnTravel("3 000")]),
  ...atPage(47, [
    ["person.ulykke.utgifter", "Behandlings- og reiseutgifter etter ulykke", "Inntil 5 % av forsikringssummen til rimelig, nødvendig behandling innen tre år etter ulykken. Egenandelen er 500 kr.", "7.2 Utgifter til medisinsk behandling"],
    ...(family ? [[
      "person.ulykke.barn.dodsfall", "Utbetaling ved medforsikret barns død",
      "0,5 G ved medforsikret barns død, etter vilkårene for ulykkesforsikringen.",
      "7.3 Erstatning ved barns død",
    ] as const] : []),
  ]),
];

const grunnRows: readonly PagedRow[] = [
  ...atPage(2, [
    ["person.liv.familiedod", "Forsikringssum ved familiemedlems død", "0,5 G ved medforsikret familiemedlems død.", "Erstatning ved familiemedlems død"],
    ["person.liv.opphor", "Opphørsalder", "Grunnforsikringen gjelder ut kalenderåret den forsikrede fyller 70 år.", "Når grunnforsikringen opphører"],
  ]),
  ...atPage(6, [
    ["person.liv.familiedod.omfang", "Hvem som omfattes av familiedekningen",
      "Engangsutbetaling ved medforsikret ektefelles, samboers eller barns død uansett årsak. Dekningen gjelder når medlemmet er tilsluttet og ikke har reservert seg. Egne definisjoner av samboer og barn gjelder, og dødsfall i svangerskap etter uke 22 er også omfattet.",
      "Erstatning ved familiemedlems død, punkt 1 og 2"],
  ]),
  ...atPage(11, [
    ["person.ulykke.utgifter", "Behandlings- og reiseutgifter etter ulykke", "Inntil 5 % av forsikringssummen til rimelig, nødvendig behandling innen tre år etter ulykken. Egenandelen er 500 kr.", "7.2 og 7.2.2 Utgifter til medisinsk behandling"],
  ]),
];

const dataReconstructionRow: ReviewedRow = [
  "innbo.datalager.grense", "Rekonstruksjon av datalagre mv. – grense",
  "Inntil 50 000 kr samlet for rekonstruksjon av datalagre, notater, manuskripter og tegninger.",
  "Datalagre, notater, manuskripter og tegninger",
];

const necessaryLodging = (place: string) =>
  `Ekstra nødvendige utgifter ved opphold utenfor ${place} når den forsikrede boligen er ubeboelig etter en dekket skade. Gjelder i normal reparasjonstid. Opphold utover én uke må avtales med Tryg.`;

const nitoContentsRows = (variant: "innbo" | "innbo-student" | "innbo-fritidsbolig"): PagedRow[] => {
  const holiday = variant === "innbo-fritidsbolig";
  const student = variant === "innbo-student";
  const scope = student ? "utenfor boligen" : "etter vilkårenes regler om forsikringssted og sikring";
  return [
    ...atPage(2, [
      [holiday ? "egenandel.standard" : "innbo.egenandel", "Generell egenandel for innbo", "2 000 kr. Enkelte dekninger har egne egenandeler.", "Hva er forsikret"],
      ["innbo.sikrede", "Hvem som er forsikret", "NITO-medlemmet, ektefelle eller samboer på samme folkeregistrerte adresse og fast husstand, med særregler for blant annet barn som studerer eller er i førstegangstjeneste.", "Hvem forsikringen gjelder for"],
      ["sykkel.tyveri.grense", "Sykkel og elsykkel – tyverigrense", `Inntil 50 000 kr ved tyveri av låst sykkel eller elsykkel ${scope}.`, "Dekningsomfang – tyveri"],
      ["uhell.egenandel", "Uhell – egenandel", "2 000 kr. Vilkåret angir særregler for blant annet knust mobilskjerm.", "Dekningsomfang – uflaksskader"],
      ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skadetilfelle, med stedsbegrensningen under skadedyrbekjempelse.", "Dekningsomfang, jf. 4.6 på PDF-side 9"],
      ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr per skadetilfelle.", "Dekningsomfang – skadedyr"],
      [holiday ? "ansvar.grense" : "ansvar.sum", "Privatansvar – forsikringssum", "5 000 000 kr.", "Dekningsomfang – privatansvar"],
      ["ansvar.dekning", "Privatansvar", "Privatansvar i Norden etter vilkårets ansvarsregler.", "Dekningsomfang – privatansvar"],
      ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr.", "Dekningsomfang – privatansvar"],
      ["naturskade.dekning", "Naturskade", "Naturskade omfattes inntil forsikringssummen etter de særskilte naturskadevilkårene.", "Dekningsomfang, jf. 10"],
      ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr, den lovbestemte egenandelen angitt i beviset.", "Dekningsomfang – naturskade"],
      ["rettshjelp.dekning", "Rettshjelp", "Rettshjelp i Norden, også for tvist ved kjøp og salg av bolig etter vilkåret.", "Dekningsomfang, jf. 6"],
      ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr.", "Dekningsomfang – rettshjelp"],
      ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av utgiftene over 4 000 kr.", "Dekningsomfang – rettshjelp"],
      ["utleie.skadeverk.grense", "Utleie – skadeverk og underslag", "Samlet grense på 500 000 kr ved skadeverk, tyveri eller underslag av innbo og løsøre.", "Dekningsomfang, jf. 4.8 på PDF-side 10"],
      ["utleie.tyveri.grense", "Utleie – tyveri og underslag", "Samlet grense på 500 000 kr for skadeverk, tyveri og underslag av innbo og løsøre.", "Dekningsomfang, jf. 4.8 på PDF-side 10"],
      ["utleie.egenandel", "Utleie – egenandel ved skadeverk, tyveri og underslag", "2 000 kr.", "Dekningsomfang – utleie"],
      ["utleie.husleietap.grense", "Utleie – tapt husleieinntekt", "Inntil seks måneders husleie, med tre måneders egenandelsperiode.", "Dekningsomfang – tapt husleieinntekt"],
    ]),
    ...atPage(6, [dataReconstructionRow]),
    ...atPage(7, [
      ["innbo.penger.dekning", "Penger og verdipapirer", "Tap av penger og verdipapirer omfattes ved erstatningsmessig skade, med egne regler ved tyveri.", "3.2 Utgifter og tap ved erstatningsmessig skade", "included"],
      ["innbo.penger.grense", "Penger og verdipapirer – grense", "Inntil 40 000 kr samlet ved erstatningsmessig skade. Ved tyveri gjelder vilkårets egne regler.", "3.2 Utgifter og tap ved erstatningsmessig skade"],
      [holiday ? "innbo.opphold.dekning" : "innbo.opphold.grense", holiday ? "Erstatningshytte etter skade" : "Opphold utenfor hjemmet – grense",
        necessaryLodging(holiday ? "fritidsboligen" : "hjemmet"), holiday ? "3.2 Opphold utenfor fritidsboligen" : "3.2 Opphold utenfor hjemmet", "included"],
      ["brann.dekning", "Brann", "Plutselig og uforutsett skade ved brann omfattes etter vilkåret.", "4.1 Brann"],
    ]),
    [9, ["glass.sanitaer.dekning", "Glass og sanitærporselen",
      `Plutselig bruddskade på fast innsatt glass, sanitærporselen og integrerte hvitevarer i leide rom, egne rom i sameie eller egen leilighet i borettslag${holiday ? " på den forsikrede fritidsboligen" : ""}. Riper, avskalling og andre skjønnhetsfeil er unntatt.`,
      "4.7 Bygningsdeler", "included"], variant === "innbo" ? [10, "4.7 Følgende er dekket og unntak"] : undefined],
    ...atPage(8, [
      ["vann.dekning", "Vannskade", "Plutselig og uforutsett utstrømming og nærmere angitt inntrenging av vann, væske eller pulver omfattes.", "4.3 Vann, væske eller pulver"],
      ["tyveri.dekning", "Tyveri og skadeverk", "Ran, overfall, tyveri og skadeverk omfattes med egne steds- og beløpsgrenser.", "4.4 Tyveri og skadeverk"],
    ]),
    ...atPage(variant === "innbo" ? 9 : 8, [
      ["sykkel.egenandel.rabatt", "Sykkeltyveri – egenandelsreduksjon", "2 000 kr, redusert til 1 000 kr ved betalt og løpende registrering i FG-godkjent sykkelregister.", "4.4 Egenandel"],
    ]),
    ...atPage(holiday ? 8 : 9, [
      ["uhell.dekning", "Uhell", "Plutselige og uforutsette skader i hele verden omfattes. Ren forsvinning er unntatt. Ved reise eller opphold utenfor Norden gjelder dekningen de første 90 dagene, inntil 40 000 kr.", "4.5 Uflaksskader"],
    ]),
    ...atPage(9, [
      ["skadedyr.dekning", "Bekjempelse av skadedyr", holiday
        ? "Vilkåret angir fast bosted i Norge som sted for bekjempelse. Nødvendig opphold utenfor fritidsboligen forutsetter forhåndsavtale med VIS."
        : "Bekjempelse av skadeinsekter, mus og rotter på forsikringstakerens faste bosted i Norge gjennom VIS Forsikring.",
      "4.6 Bekjempelse av skadeinsekter, mus og rotter"],
    ]),
  ];
};

const udfContentsRows: readonly PagedRow[] = [
  ...atPage(2, [
    ["brann.dekning", "Brann", "Brannskade på privat innbo og løsøre omfattes.", "Forsikringsbevis innboforsikring, jf. 5.1 på PDF-side 8"],
    ["vann.dekning", "Vannskade", "Vannskade på privat innbo og løsøre omfattes.", "Forsikringsbevis innboforsikring, jf. 5.3 på PDF-side 9"],
    ["naturskade.dekning", "Naturskade", "Naturskader på privat innbo og løsøre omfattes.", "Forsikringsbevis innboforsikring"],
    ["naturskade.egenandel", "Naturskade – egenandel", "8 000 kr.", "Egenandel"],
    ["ansvar.sum", "Privatansvar – forsikringssum", "5 000 000 kr.", "Forsikringssum"],
    ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr.", "Egenandel"],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr.", "Forsikringssum"],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av utgiftene over 4 000 kr. Ved rettshjelp for forbrukerkjøp er egenandelen 4 000 kr.", "Egenandel"],
  ]),
  ...atPage(6, [dataReconstructionRow]),
  [7, ["innbo.penger.dekning", "Penger og verdipapirer", "Tap av penger og verdipapirer omfattes ved erstatningsmessig skade. Under tyveridekningen erstattes de bare ved veskenapping.", "4.2 Utgifter og tap ved erstatningsmessig skade", "included"], [9, "5.4 Tyveri og skadeverk"]],
  [7, ["innbo.penger.grense", "Penger og verdipapirer – grense", "Inntil 20 000 kr samlet ved erstatningsmessig skade. Under tyveridekningen gjelder dette bare ved veskenapping.", "4.2 Utgifter og tap ved erstatningsmessig skade"], [9, "5.4 Tyveri og skadeverk"]],
  ...atPage(8, [
    ["innbo.opphold.grense", "Opphold utenfor hjemmet – grense", necessaryLodging("hjemmet"), "4.2 Opphold utenfor hjemmet"],
    ["ansvar.dekning", "Privatansvar", "Privatansvar i Norden etter vilkårets punkt 7.", "4.4 Privatansvar, jf. 2 på PDF-side 5"],
    ["rettshjelp.dekning", "Rettshjelp", "Rettshjelp i Norden etter vilkårets punkt 8.", "4.5 Rettshjelp, jf. 2 på PDF-side 5"],
  ]),
  ...atPage(9, [
    ["tyveri.dekning", "Tyveri og skadeverk", "Ran, overfall, tyveri og skadeverk omfattes med egne steds- og beløpsgrenser.", "5.4 Tyveri og skadeverk"],
    ["sykkel.tyveri.grense", "Sykkel og elsykkel – tyverigrense", "Inntil 40 000 kr per gjenstand ved tyveri eller skadeverk på sykkel, elsykkel, barnevogn, sykkeltilhenger eller gressklipper på andre steder enn angitt i punkt 5.4.", "5.4 Tyveri og skadeverk"],
  ]),
  ...atPage(10, [
    ["sykkel.egenandel.rabatt", "Sykkeltyveri – egenandelsreduksjon", "4 000 kr ved manglende registrering i FG-godkjent sykkelregister med betalt og løpende abonnement. Ordinær egenandel er 2 000 kr.", "5.4 Egenandel"],
    ["uhell.dekning", "Uhell", "Plutselige og uforutsette skader i hele verden omfattes. Ren forsvinning er unntatt. Ved reise eller opphold utenfor Norden gjelder dekningen de første 90 dagene, inntil 40 000 kr.", "5.5 Plutselige og uforutsette skadetilfeller"],
    ["uhell.egenandel", "Uhell – egenandel", "2 000 kr.", "5.5 Plutselige og uforutsette skadetilfeller"],
  ]),
  ...atPage(11, [
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av skadeinsekter, mus og rotter på medlemmets faste bosted i Norge gjennom VIS Forsikring.", "5.6 Bekjempelse av skadeinsekter, mus og rotter"],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skadetilfelle.", "5.6 Bekjempelse av skadeinsekter, mus og rotter"],
    ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr per skadetilfelle.", "5.6 Bekjempelse av skadeinsekter, mus og rotter"],
    ["glass.sanitaer.dekning", "Glass og sanitærporselen", "Plutselig bruddskade på fast innsatt glass, sanitærporselen, dusjdører og integrerte hvitevarer i leide rom, egne rom i sameie eller egen leilighet i borettslag. Riper, avskalling og andre skjønnhetsfeil er unntatt.", "5.7 Bygningsdeler", "included"],
  ]),
  ...atPage(13, [
    ["innbo.ombygging.grense", "Tilpasning av bolig etter ulykke", "Inntil 250 000 kr samlet for alle sikrede per forsikringstilfelle til nødvendig tilpasning av egen eid bolig. Ved ulykke i forsikringstiden kreves rullestolbehov og minst 50 % varig medisinsk invaliditet. Omfatter også barn som blir født med minst 50 % varig medisinsk invaliditet, etter vilkårene.", "6.6 Tilpasning av egen eiet bolig for rullestolbruker"],
  ]),
];

const udfStudentRows: readonly PagedRow[] = [
  ...atPage(2, [
    ["student.sikrede", "Hvem kan kjøpe studentforsikringen?", "Medlemmer i Lærerstudentene i Utdanningsforbundet.", "Forsikringsbevis"],
    ["innbo.forsikringssum", "Samlet forsikringssum for innbo og løsøre", "Inntil 500 000 kr per skade.", "Innboforsikring – forsikringssum"],
    ["innbo.egenandel", "Generell egenandel for innbo", "1 000 kr. Det er særskilte egenandeler for blant annet sykkel, elektronikk, skadedyr, naturskade, rettshjelp og privatansvar.", "Innboforsikring – egenandel (PDF-side 2–3)"],
    ["innbo.dekning", "Hva innboforsikringen dekker", "Brann, vann, innbrudd, uhell og naturskade på privat innbo og løsøre. Tryg ID er inkludert.", "Innboforsikring"],
    ["ansvar.sum", "Privatansvar under innboforsikringen – forsikringssum", "5 000 000 kr.", "Innboforsikring – forsikringssum"],
    ["rettshjelp.grense", "Rettshjelp under innboforsikringen – forsikringssum", "100 000 kr.", "Innboforsikring – forsikringssum"],
    ["reise.personer.omfang", "Hvem reiseforsikringen gjelder for", "Én person, i hele verden etter vilkårene.", "Forsikringsbevis"],
    ["ulykke.forsikringssum", "Ulykkesforsikring – forsikringssum", "Inntil 500 000 kr.", "Forsikringsbevis"],
    ["person.ufore.sum", "Uføreforsikring – forsikringssum", "Inntil 400 000 kr. Engangsutbetalingen beregnes etter uføregraden når NAV innvilger minst 50 % varig uføretrygd.", "Forsikringsbevis, jf. uføreforsikring (PDF-side 4)"],
    ["student.legehjelp", "Tryg Legehjelp og psykisk helsehjelp", "Tilgang til Tryg Legehjelp og samtale med kognitiv sykepleier for vurdering av selvhjelpsprogram eller henvisning til psykolog.", "Tryg Legehjelp"],
  ]),
  ...atPage(3, [
    ["reise.varighet.maks", "Maksimal sammenhengende reisevarighet", "Inntil 90 dager. Reisen regnes fra du forlater bostedsadressen i Norden, også uten overnatting.", "Reiseforsikring for én person"],
    ...commonTravelRows, udfDepartureRow, ...udfSharedTravelRows,
    ["reise.studiested.behandling", "Behandlingsutgifter på studiested", "Ubegrenset forsikringssum for dekkede behandlingsutgifter etter punkt 16.", "Dekning reiseforsikring, jf. 16"],
  ]),
  udfPackageCancellation(3, 33),
  ...atPage(30, [travelPlace, travelWarning]),
  ...atPage(36, [cashOnTravel("3 000")]),
  [40, ["reise.hjemtransport.studiested", "Hjemtransport fra studiested ved alvorlig hendelse i familien",
    "Inntil 10 000 kr for hjemtransport fra studiested ved dødsfall i nær familie eller når et nært familiemedlem blir innlagt på sykehus som følge av akutt alvorlig sykdom eller alvorlig ulykkesskade. Gjelder også når studenten ikke er på reise, til fast bosted eller behandlingsstedet i Norden.",
    "11.5 Hjemtransport ved dødsfall, akutt og alvorlig sykdom eller ulykke i nær familie"],
    [3, "Forsikringsbevis – hjemtransport i Norden ved hendelse i nær familie"]],
  ...atPage(4, [
    ["reise.studieopphold.varighet", "Reisevarighet ved utenlandsstudier", "Inntil 180 dager fra utreise ved dokumentert studieopphold utenfor Norden. Utvidelsen kan brukes én gang per medlem.", "Studieopphold utenfor Norden"],
    ["person.ufore.forskudd", "Månedlig forskudd ved innvilgede arbeidsavklaringspenger", "1 500 kr per måned ved vedtak om arbeidsavklaringspenger fra NAV, frem til varig uførevedtak eller i maksimalt fem år.", "Uføreforsikring med månedlig forskuddsutbetaling"],
    ["person.ufore.opphor", "Opphørsalder for uføreforsikringen", "Ved utgangen av kalenderåret forsikrede fyller 35 år.", "Uføreforsikring – opphørsalder"],
    ["person.ufore.karens", "Arbeidsuførhet ved kjent sykdom", "Arbeidsuførhet som inntrer innen to år etter at Trygs ansvar begynte å løpe, er unntatt når den skyldes sykdom, lyte eller mén som da forelå og som forsikrede må antas å ha kjent til.", "Uføreforsikring – særlige begrensninger"],
    ["student.studieavbrudd", "Erstatning ved studieavbrudd", "10 000 kr ved studieavbrudd som er dekket etter vilkåret.", "Studieavbrudd, jf. 11 (PDF-side 54)"],
  ]),
  ...atPage(51, [
    ["person.ulykke.brudd", "Erstatning ved bruddskade", "5 000 kr per skadetilfelle.", "7.3 Erstatning ved bruddskader"],
    ["person.ulykke.utgifter", "Behandlingsutgifter etter ulykke", "Inntil 5 % av forsikringssummen til dekkede behandlingsutgifter, etter vilkårets regler om blant annet annen dekning.", "7.2 Utgifter til medisinsk behandling"],
  ]),
];

const udfArchiveRoot = "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/";

const udfPackageEditions = [
  {
    filename: "udf-student.pdf", onlineFilename: "studentforsikring-2026.pdf", slug: "utdanningsforbundet-student-2026",
    sha256: "cac86b613f1ca908ee23bdd7d7fbfe4f0892ee670feda3a25194de32aa4ee345",
    variants: [["student", udfStudentRows]],
  },
  {
    filename: "udf-innbo.pdf", onlineFilename: "innboforsikring-2026.pdf", slug: "utdanningsforbundet-innbo-2026",
    sha256: "8deeabf725de05d48edb505403ca0f809dc05766991ab85dbfa13e684fa3bb02",
    variants: [["innbo", udfContentsRows]],
  },
  {
    filename: "udf-reise.pdf", onlineFilename: "reiseforsikring-2026.pdf", slug: "utdanningsforbundet-reise-2026",
    sha256: "473d3b7713f86937fbe15bdf62319fe4ecc341da2c261ec5332767978fa04a83",
    variants: [["reise-en-person", udfTravelRows(false)], ["reise-familie", udfTravelRows(true)]],
  },
  {
    filename: "udf-70-pluss.pdf", onlineFilename: "70_pluss-2026.pdf", slug: "utdanningsforbundet-70-pluss-2026",
    sha256: "29a18f97388d0ec5f2eaa07728867aacb997c08b8028fe65b6cabcdad532722f",
    variants: [["70-pluss-en-person", plus70Rows(false)], ["70-pluss-familie", plus70Rows(true)]],
  },
  {
    filename: "udf-grunnforsikring.pdf", onlineFilename: "grunnforsikring-2026.pdf", slug: "utdanningsforbundet-grunnforsikring-2026",
    sha256: "fe145d02dbc87b15b343983dc7fbc26251380be05c6ef9bc36f7ae229cf9d336",
    variants: [["grunnforsikring", grunnRows]],
  },
] as const;
const udfSourceId = (variant: string) => "tryg-utdanningsforbundet-" + variant + "-terms";

export const trygMemberPackageArchives = udfPackageEditions.map(({ filename, onlineFilename, slug, variants }) => ({
  provider: "tryg",
  slug,
  archivePath: "catalog/sources/tryg/member-agreements/" + filename,
  sources: variants.map(([variant]) => [udfSourceId(variant), "2026", udfArchiveRoot + onlineFilename] as const),
}));

const nitoTravelEditions = [
  ["enkeltperson", "28ea69381919a6102214026c7b07820bc52c2e7067784040b67e16758627f8b5", nitoRows(false)],
  ["familie", "a94ca59ede62ea3eb1752e407cfec26374f9585f52aca4880b46cca4c7b3f590", nitoRows(true)],
] as const;

const nitoContentsEditions = [
  ["innbo", "c88d60872ee9ed6147774073559feaddfe2901a64cb6ffe1b3b8b1e5daed26e8"],
  ["innbo-student", "38d8a832db4da8a104521e5e9f5ae165210ddad0209e9f1d5080499fc5ff536b"],
  ["innbo-fritidsbolig", "c5e0eba96b2a40f67fcacf2ce497ebd5cb93927365a7f6f1187869dfbf58dc3a"],
] as const;

const editions = [
  ...nitoContentsEditions.map(([variant, sha256]) =>
    [`tryg-nito-${variant}-terms`, "nito", "2026-01-01", sha256, nitoContentsRows(variant)] as const),
  ...udfPackageEditions.flatMap(({ sha256, variants }) => variants.map(([variant, rows]) =>
    [udfSourceId(variant), "utdanningsforbundet", "2026", sha256, rows] as const)),
  ...nitoTravelEditions.map(([variant, sha256, rows]) =>
    [`tryg-nito-reise-${variant}-terms`, "nito", "2026-01-01", sha256, rows] as const),
];

const legacyTravelKeys = new Set(["reise.varighet", "reise.avbestilling", "reise.hvem"]);

export function addTrygMemberPackageComparisonFacts(sources: Record<string, CatalogSource>, facts: Record<string, CatalogFact[]>) {
  for (const [id, scope, version, sha256, rows] of editions) {
    const source = sources[id];
    if (source?.agreementScope !== scope || source.effectiveFrom !== version ||
      source.productVersion !== version || source.sha256 !== sha256) continue;

    const cite = (page: number, section: string): CatalogFact["source"] => ({
      documentId: id, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: version, version, url: source.url, company: source.company,
      agreementScope: scope, page, section,
    });
    const reviewedKeys = new Set(rows.map(([, [key]]) => key));
    facts[id] = [
      ...(facts[id] ?? []).filter((fact) => !legacyTravelKeys.has(fact.key) && !reviewedKeys.has(fact.key)),
      ...rows.map(([page, [key, label, value, section, coverageAvailability], qualification]) => ({
        key, label, value, source: cite(page, section),
        ...(coverageAvailability && { coverageAvailability }),
        ...(qualification && { qualificationSource: cite(...qualification) }),
      })),
    ];
  }
}
