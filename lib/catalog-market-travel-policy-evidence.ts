import type { CatalogFact, CatalogSource } from "./product-catalog.ts";

type VersionedDocument = readonly [id: string, sha256: string];
type Clause = readonly [page: number, section: string];
type Evidence = readonly [key: string, label: string, value: string, clause: Clause, clarification?: Clause];

const documents = {
  trygPremium: ["trygReisePremium", "a97b0d836b6465ff1c79a49441306f5cc1c77cc656c17870a5a3e04d836a475b"],
  trygSafety: ["trygReiseSafety", "abeeb1f83c66fda107c2a3123880df24d2a9e636c8b17bc0f8881f871f431a96"],
  trygAccidentPremium: ["trygReiseAccidentPremium", "c7ac2474edc27f8aed66e00296c5c2c037b728eb89ca9e2cd147558d2d42e7f4"],
  trygProductPage: ["trygReiseProductPage", "5025281e76080e5854c80cd098825d50d7f28f5d137e55237dfa1d0ac9648567"],
  fremtind: ["fremtindReiseUnifiedTerms", "2e410ce7bb27c5d355f564d4fd44c88e28e5199448cb691f139440cacc8d4267"],
  if: ["ifReiseTerms", "1311ec0273592571c46ec37f2874791f420c900583e601c3ae95c0a1fda4b566"],
  storebrand: ["storebrandReiseTerms", "d44b4ef668a51db2e2d0c72714737dee59cb74d10fad13b65e3cde5695e5e414"],
  klp: ["klp-reise", "73a8d7c5471634ec6fbc229d0dae056a28034aff41dbf57fcbe70a4360074729"],
  klpMaks: ["klp-reise-maks", "7e8f7cfe8a86bf83a7d0a26590fb080c908246a41807c1221c750729d4f9681b"],
  waterCircles: ["watercircles-reise", "70291d41311f5d5e5f407866b91ed1eb0291a36e1cfc1ea190aa127261756128"],
  landkreditt: ["landkreditt-reise", "40de3aee9b92e86e7362d1dad246887f53c9feb2ad2ee2c49b97123f02152e88"],
} as const satisfies Record<string, VersionedDocument>;

const familiarIllness = "reise.medisinsk.kjent";
const acuteDeterioration = "Uventet akutt og alvorlig forverring av kjent sykdom kan dekkes. Planlagt behandling eller kontroll på reisen og komplikasjoner eller forverring som var sannsynlig etter en objektiv medisinsk vurdering er unntatt.";

const premiumRows: readonly Evidence[] = [
  ["reise.avbestilling.dekning", "Avbestilling", "Uventet akutt sykdom, alvorlig ulykkesskade, akutt alvorlig forverring av kjent sykdom eller dødsfall hos sikrede, nærmeste familie, reisefølge eller eneste medreisendes nærmeste familie; også angitte savnet-, behandling-, boligskade-, naturkatastrofe- og UD-tilfeller.", [1, "2.1"]],
  ["reise.avbestilling.ud", "Avbestilling ved UD-reiseadvarsel", "Offisiell UD-reiseadvarsel ved avreise kan gi dekning. Advarsler som forelå ved bestilling, er unntatt.", [1, "2.1"], [2, "2.2"]],
  ["reise.forsinkelse.rute", "Forsinket avgang og fremmøte", "Forsinket forhåndsbestilt offentlig transport eller fremmøte etter kollisjon, utforkjøring, teknisk feil, nødlanding, vær eller terrorhandling/-trussel. Rimelig transport for å innhente ruten og nødvendig overnatting omfattes.", [2, "3.1"]],
  ["reise.bagasje.dekning", "Reisegods", "Personlige eiendeler med til eget bruk, samt ting lånt/leid og medbrakt som egne på hele reisen. Innsjekket bagasje, tyveri, ran, dyr, trafikkuhell, båtulykke, brann, vann, naturulykke og hærverk omfattes etter vilkåret.", [3, "4 og 4.1"], [4, "4.1"]],
  ["reise.bagasje.sportsutstyr", "Sportsutstyr", "Eget sportsutstyr regnes som reisegods. Uhell på sykkel i bosteds-/arbeids-/studiekommune, lagidrett, sykkelritt og flere risikosituasjoner er begrenset eller unntatt.", [4, "4.1"]],
  ["reise.bagasje.uhell", "Uhell på reisegods", "Plutselig og uforutsett fysisk skade med kjent ytre årsak og tidspunkt. Tingen må fremvises; mistet/gjenglemt ting dekkes ikke.", [4, "4.1"]],
  ["reise.medisinsk.behandling", "Reisesyke – behandling", "Rimelige og nødvendige utgifter ved uventet akutt sykdom, ulykkesskade eller uventet akutt alvorlig forverring av kjent sykdom. Dette omfatter blant annet lege, sykehus i inntil 60 døgn, medisiner, hjelpemidler, foreskrevet fysikalsk behandling og transport.", [6, "5.2"], [5, "5.1"]],
  ["reise.sykeledsagelse", "Tilkalling og sykeledsagelse", "Med forhåndsgodkjenning dekkes rimelige og nødvendige utgifter for inntil to nærstående når medisinsk nødvendig.", [6, "5.2"]],
  ["reise.medisinsk.forlenget", "Utsatt hjemreise", "Nødvendige merutgifter til overnatting, måltider og transport til reiseruten kan dekkes når medisinske årsaker hindrer planlagt videre reise; forhåndsgodkjenning kreves.", [6, "5.2"]],
  ["reise.medisinsk.graviditet", "Svangerskap og fødsel", "Svangerskap, frivillig abort og fødsel fra uke 37 regnes ikke som sykdom; sykdom/ulykke under svangerskap, abort eller fødsel kan likevel dekkes når øvrige kriterier er oppfylt.", [5, "5.1"]],
  ["reise.hjemtransport", "Hjemtransport", "Nødvendige merutgifter ved medisinsk nødvendig tidligere hjemtransport, dødsfall, savnet nær familie, alvorlig familiehendelse eller alvorlig skade på bolig/virksomhet. Tryg/Tryg Alarm må godkjenne på forhånd.", [6, "5.4"], [7, "5.4"]],
  ["reise.evakuering", "Evakuering", "Nødvendige merutgifter til overnatting, måltider og transport til nærmeste sikre destinasjon eller bosted i Norden ved offisielt UD-evakueringsråd; reise inn etter varslet situasjon og manglende bestilt retur er unntatt.", [8, "6"]],
  ["reise.reiseavbrudd", "Reiseavbrudd", "Kompensasjon for ubenyttede kalenderdager ved sykehusinnleggelse, dekket hjemtransport eller evakuering, eller tilsvarende hendelse hos eneste medreisende. Sykdom eller skade på hjemreisedagen, på tjenestereise eller på en reise planlagt ut over avtalt varighet er unntatt.", [7, "5.5"]],
  ["reise.forsinkelse.hotell_arrangement", "Tapt hotell og arrangement", "Ubenyttet hotellovernatting og forhåndsbetalt arrangement etter minst fem timers dekket forsinkelse; inntil én hotellovernatting.", [3, "3.2"]],
  ["reise.forsinkelse.leiebilavtale", "Tapt leiebilavtale", "Kansellert forhåndsbetalt leiebilavtale for bil etter minst 1,5 times dekket forsinkelse; privatleie, andre kjøretøy og bil for andre er unntatt.", [3, "3.2–3.3"]],
  ["reise.leiebil.egenandel", "Egenandel leiebil", "Belastet egenandel ved skade eller tyveri av leiebil til eget bruk på feriereise med minst én overnatting og kontrakt med utleiefirma. Andre kjøretøy, bildeling, verkstedleie, flytting og varetransport er unntatt.", [8, "7.1–7.2"], [9, "7.2"]],
  ["reise.bagasje.uhell_begrensning", "Uhell på reisegods – sentrale begrensninger", "Sykkelskade i bosteds-, studie- eller arbeidskommune, kosmetisk skade på koffert, bag, ryggsekk, barnevogn, sykkel, kano eller kajakk, arbeidsgivers eller skolens eiendeler, leid løsøre og motoriserte kjøretøy eller små elektriske kjøretøy er unntatt.", [4, "4.1"]],
];

const interruption = "reise.reiseavbrudd";
const lostDays = "Reiseavbrudd – tapte feriedager";
const limit = "Reiseavbrudd – sum";
const excursion = "Ubenyttede billetter og arrangementer";

function cite(source: CatalogSource, [page, section]: Clause): CatalogFact["source"] {
  const { id, filename, termsNumber, effectiveFrom, url, company, agreementScope } = source;
  return { documentId: id, filename, termsNumber, effectiveFrom, url, company, agreementScope, page, section };
}

export function addReviewedTravelPolicyFacts(
  sources: Readonly<Record<string, CatalogSource>>,
  facts: Record<string, CatalogFact[]>,
) {
  function verified([id, sha256]: VersionedDocument) {
    const source = sources[id];
    return source?.sha256 === sha256 && (source.agreementScope ?? "ordinary") === "ordinary" ? source : undefined;
  }

  function setRows(component: string, source: CatalogSource, rows: readonly Evidence[], extraSources: Readonly<Record<string, CatalogFact["source"]>> = {}) {
    if (!facts[component]) return;
    const keys = new Set(rows.map(([key]) => key));
    facts[component] = [
      ...facts[component].filter(fact => !keys.has(fact.key)),
      ...rows.map(([key, label, value, clause, clarification]) => ({
        key, label, value, source: cite(source, clause), replacesBase: true,
        qualificationSource: clarification ? cite(source, clarification) : extraSources[key],
      })),
    ];
  }

  const premium = verified(documents.trygPremium);
  const productPage = verified(documents.trygProductPage);
  const accident = verified(documents.trygAccidentPremium);
  const safety = verified(documents.trygSafety);
  if (premium) {
    setRows("trygReisePremium", premium, premiumRows);
    if (safety) setRows("trygReisePremium", premium, [
      [familiarIllness, "Kjent sykdom", acuteDeterioration + " Ved pågående eller ventet behandling må lege før avreise skriftlig bekrefte at reisen er forsvarlig og at forverring eller komplikasjoner er lite sannsynlig.", [8, "5.6, jf. 5.1 på side 5"]],
    ], { [familiarIllness]: cite(safety, [2, "2.1"]) });
    if (accident) setRows("trygReisePremium", premium, [
      ["reise.medisinsk.tann", "Tannbehandling", "Tannskade og tannsykdom er unntatt under reisesyke. Tannbehandling etter en dekket ulykke kan omfattes av den inkluderte Ulykke Premium-dekningen.", [8, "5.6"]],
    ], { "reise.medisinsk.tann": cite(accident, [2, "3.2"]) });
  }
  if (premium && productPage) {
    setRows("trygReisePremium", productPage, [
      ["reise.overnatting", "Reise med eller uten overnatting", "Reise Premium gjelder fritids- og tjenestereiser med og uten overnatting.", [1, "Reiser uten overnatting"]],
      ["reise.tjenestereise", "Tjenestereise", "Reise Premium gjelder også på tjenestereiser. Avbestilling, enkelte forsinkelsesutgifter og reiseavbrudd har egne unntak for tjenestereiser.", [1, "Reiser uten overnatting"]],
    ], { "reise.tjenestereise": cite(premium, [2, "2.2, jf. 3.3 og 5.5"]) });
  }

  const fremtind = verified(documents.fremtind);
  if (fremtind) setRows("fremtindReiseActiveTerms", fremtind, [
    [interruption, lostDays, "Tapte reisedager kan erstattes ved dekket sykehusinnleggelse eller hjemtransport. Legepålagt sengeleie utenfor sykehus må vare i minst tre dager og regnes fra første legebesøk. Vilkåret har egne regler for eneste medreisende og medforsikrede familiemedlemmer.", [8, "10.4–10.5"]],
    [interruption + ".sum", limit, "Inntil 2 000 kr per person per døgn ved dekket sykehusinnleggelse eller hjemtransport, begrenset til reisekostnaden. Ved dekket sengeleie er beløpet 750 kr per person per dag i inntil 10 dager per reise.", [8, "10.4–10.5"]],
    [interruption + ".arrangement", excursion, "Inntil 5 000 kr per skadetilfelle for ubenyttede forhåndsbetalte dagsutflukter og turisttjenester ved akutt uventet sykdom, akutt forverring av kronisk sykdom eller ulykkesskade. Dekningen omfatter også forhåndsbetalte aktiviteter som legen forbyr deg å delta på.", [9, "10.6"]],
  ]);

  const ifTerms = verified(documents.if);
  if (ifTerms) {
    setRows("ifReiseStandard", ifTerms, [
      ["reise.avbestilling.sum", "Avbestilling – forsikringssum", "Ubegrenset hvis en særskilt grense ikke følger av vilkåret. Avbestillingsforsikringen må være gyldig før første innbetaling av reisekostnadene.", [5, "2.1"]],
      [interruption, lostDays, "Standard og Super kan gi kompensasjon ved forhåndsgodkjent hjemkallelse, evakuering eller hjemtransport, eller når du, eneste medreisende eller en medforsikret medreisende legges inn på sykehus i minst ett døgn. Ved sykehusopphold kan den syke og én medforsikret medreisende få kompensasjon.", [14, "5.2.5–5.2.6"]],
      [interruption + ".sum", limit, "Dokumentert reise og overnatting før første syke- eller avbruddsdag fordeles etter forholdet mellom tapte og planlagte dager. Ingen egen generell beløpsgrense er oppgitt for denne kompensasjonen.", [14, "5.1 og 5.2.5–5.2.6"], [15, "5.2.6"]],
      [interruption + ".arrangement", excursion, "Inntil 5 000 kr per skadetilfelle for forhåndsbetalte utflukter og turisttjenester legen forbyr deg å delta på. Utbetales ikke i tillegg til kompensasjon for avbrutt eller tapt feriereise.", [15, "5.2.8"]],
    ]);
  }

  const storebrand = verified(documents.storebrand);
  if (storebrand) {
    for (const [component, total] of [
      ["storebrandReiseStandard", " Forsikringssummen er også begrenset til 20 000 kr for enkeltperson og 50 000 kr per skadetilfelle for familie."],
      ["storebrandReiseSuper", ""],
    ]) {
      setRows(component, storebrand, [
        [interruption, lostDays, "Tapte feriedager kan erstattes ved hjemkallelse eller forhåndsgodkjent hjemtransport, sykehusinnleggelse eller skriftlig dokumentert sengeleie pålagt av lege på reisemålet. Vilkåret omfatter også hendelser hos eneste reiseledsager eller en medforsikret medreisende. Ved sykehusinnleggelse eller sengeleie kan den syke og én medforsikret medreisende få kompensasjon.", [16, "B.5.1 nr. 9"]],
        [interruption + ".sum", limit, "Inntil 2 000 kr per person per døgn, innenfor reisens pris og beregnet ut fra andelen tapte av planlagte dager." + total, [16, "B.5.1 nr. 9"], [14, "B.5 Forsikringssummer"]],
        [interruption + ".arrangement", excursion, "Inntil 6 000 kr per skadetilfelle for forhåndsbetalte utflukter og arrangementer som ikke kunne brukes på grunn av sykehusinnleggelse, nødvendig hjemreise eller forbud fra behandlende lege på stedet.", [17, "B.5.1 nr. 10"]],
      ]);
    }
  }

  for (const document of [documents.klp, documents.klpMaks]) {
    const source = verified(document);
    if (!source) continue;
    const clause = [5, "Avbrutt reise – tapte feriedager"] as const;
    setRows(source.id, source, [
      [interruption, lostDays, "Kompensasjon ved sykehusinnleggelse etter dekket sykdom eller ulykke, hele dager med legebekreftet sengeleie etter alvorlig ulykke eller akutt sykdom, eller ved dekket hjemtransport eller evakuering. Også om eneste medreisende legges inn eller må holde sengen. Ett familiemedlem med reisedekning i KLP kan også få erstatning når ferien avbrytes.", clause],
      [interruption + ".sum", limit, "Inntil 1 500 kr per person per dag, innenfor reisens pris og maksimalt 150 000 kr per person. Beløpet beregnes ut fra andelen tapte av planlagte dager.", clause],
      [interruption + ".arrangement", excursion, "Inntil 10 000 kr per skadetilfelle for forhåndsbetalte billetter til utflukter og arrangementer som ikke kunne brukes på grunn av avbrutt reise.", clause],
    ]);
  }

  const waterCircles = verified(documents.waterCircles);
  if (waterCircles) {
    for (const [component, total, event] of [
      ["watercircles-reise-standard", " Samlet grense er 150 000 kr per person og 200 000 kr per familie.", "Inntil 2 000 kr per person per skadetilfelle."],
      ["watercircles-reise-elite", "", "Inntil reisens pris dersom billettene ble betalt sammen med reisen. Utbetales ikke i tillegg til kompensasjon for tapte feriedager."],
    ]) {
      setRows(component, waterCircles, [
        [interruption, lostDays, "Kompensasjon ved dekket sykehusinnleggelse eller påkrevd tidlig hjemreise. Legepålagt og dokumentert sengeleie kan dekkes fra første legebesøk i reisens første 45 dager. Vilkåret omfatter også angitte hendelser hos eneste reiseledsager eller medforsikret ektefelle, samboer eller barn.", [11, "5.5 i"]],
        [interruption + ".sum", limit, "Inntil 2 000 kr per person per dag innenfor reisens pris, beregnet ut fra andelen ubenyttede av planlagte dager." + total, [11, "5.5 i"]],
        [interruption + ".arrangement", excursion, "Forhåndsbetalte utflukter og arrangementer som behandlende lege på stedet forbød deg å delta på. " + event, [11, "5.5 j"]],
      ]);
    }
  }

  const landkreditt = verified(documents.landkreditt);
  if (landkreditt) setRows("landkreditt-reise", landkreditt, [
    [interruption, lostDays, "Forhåndsbetalte kostnader ved dekket sykehusopphold eller hjemtransport, alvorlig ulykke eller akutt sykdom i mer enn to dager med legebekreftet begrensning til bostedet på reisen, eller dokumentert sengeleie der kostnaden dekkes under punkt 10.", [8, "8.1"], [9, "8.1"]],
    [interruption + ".sum", limit, "Inntil 2 000 kr per person per dag innenfor reisens pris. Beløpet beregnes ut fra andelen ubenyttede av planlagte dager.", [9, "8.2"]],
    [interruption + ".arrangement", excursion, "Forhåndsbetalte billetter til utflukter, konserter og lignende i perioden ferien ble avbrutt.", [9, "8.1"]],
  ]);
}
