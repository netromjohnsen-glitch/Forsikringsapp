import type { PersonFactDefinition, PersonTerms } from "./person-insurance-catalog.ts";

export const additionalFactKinds = {
  barnBehandling: { key: "person.barn.behandling", label: "Privat utredning og behandling for barn" },
  barnBetalingsfritak: { key: "person.barn.betalingsfritak", label: "Betalingsfritak ved foresattes død" },
  barnGeografi: { key: "person.barn.geografi", label: "Hvor barneforsikringen gjelder", term: true },
  barnOpphor: { key: "person.barn.opphor", label: "Opphørsalder og videreføring", term: true },
  barnSkolerobot: { key: "person.barn.skolerobot", label: "Skolerobot ved langvarig fravær" },
  behandlingAndrevurdering: { key: "person.behandling.andrevurdering", label: "Ny medisinsk vurdering (second opinion)" },
  behandlingBildeFrist: { key: "person.behandling.bildediagnostikkfrist", label: "Frist for bildediagnostikk", term: true },
  behandlingBilder: { key: "person.behandling.bildediagnostikk", label: "Bildediagnostikk" },
  behandlingDagkirurgi: { key: "person.behandling.dagkirurgi", label: "Dagkirurgi" },
  behandlingDagkirurgiFrist: { key: "person.behandling.dagkirurgifrist", label: "Frist for dagkirurgi", term: true },
  behandlingEgenandel: { key: "person.behandling.egenandel", label: "Egenandel", term: true },
  behandlingEtterkontroll: { key: "person.behandling.etterkontroll", label: "Etterkontroll" },
  behandlingForhandsgodkjenning: { key: "person.behandling.forhandsgodkjenning", label: "Krav om forhåndsgodkjenning", term: true },
  behandlingFysikalsk: { key: "person.behandling.fysikalsk", label: "Fysikalsk behandling" },
  behandlingKompensasjon: { key: "person.behandling.garantikompensasjon", label: "Kompensasjon ved brudd på behandlingsgaranti", term: true },
  behandlingKrisehjelp: { key: "person.behandling.psykologisk_forstehjelp", label: "Psykologisk førstehjelp" },
  behandlingPsykolog: { key: "person.behandling.psykolog", label: "Behandling hos psykolog" },
  behandlingRehabilitering: { key: "person.behandling.rehabilitering", label: "Rehabilitering etter behandling" },
  behandlingReiseutgifter: { key: "person.behandling.reiseutgifter", label: "Reiseutgifter til behandling" },
  forskuddKarenstid: { key: "person.ufore.forskudd.karenstid", label: "Ventetid etter inntruffet uførhet for forskudd", term: true },
  forskuddMinstegrad: { key: "person.ufore.forskudd.minstegrad", label: "Minste uføregrad for månedlig forskudd", term: true },
  forskuddNav: { key: "person.ufore.forskudd.nav", label: "Krav til offentlig ytelse for forskudd", term: true },
  forskuddVarighet: { key: "person.ufore.forskudd.varighet", label: "Varighet og sluttoppgjør for månedlig forskudd", term: true },
  gravidDodsfall: { key: "person.gravid.dodsfall", label: "Utbetaling ved dødsfall" },
  gravidHelserad: { key: "person.gravid.helserad", label: "Medisinsk rådgivningstjeneste" },
  gravidKrisehjelp: { key: "person.gravid.psykologisk_forstehjelp", label: "Psykologisk førstehjelp" },
  gravidUlykkesutgifter: { key: "person.gravid.ulykkesutgifter", label: "Behandlingsutgifter etter ulykke" },
  kapitalMinstegrad: { key: "person.ufore.kapital.minstegrad", label: "Minste uføregrad for uførekapital", term: true },
  kapitalOpphor: { key: "person.ufore.kapital.opphor", label: "Aldersgrense for uførekapital", term: true },
  kapitalVentetid: { key: "person.ufore.kapital.ventetid", label: "Ventetid etter inntruffet uførhet for uførekapital", term: true },
  livHelserad: { key: "person.liv.helserad", label: "Medisinsk rådgivning" },
  livMottaker: { key: "person.liv.mottaker", label: "Hvem får utbetalingen?", term: true },
  livOpphor: { key: "person.liv.opphor", label: "Opphørsalder", term: true },
  livPsykolog: { key: "person.liv.psykolog", label: "Psykologisk førstehjelp ved dødsfall" },
  livSelvmord: { key: "person.liv.selvmord", label: "Begrensning ved selvmord", term: true },
  livSum: { key: "person.liv.sum", label: "Regulering av forsikringssummen", term: true },
  pensjonKarenstid: { key: "person.ufore.pensjon.karenstid", label: "Ventetid etter inntruffet uførhet for uførepensjon", term: true },
  pensjonMinstegrad: { key: "person.ufore.pensjon.minstegrad", label: "Minste uføregrad for uførepensjon", term: true },
  pensjonNav: { key: "person.ufore.pensjon.nav", label: "Krav til offentlig ytelse for uførepensjon", term: true },
  pensjonOpphor: { key: "person.ufore.pensjon.opphor", label: "Hvor lenge kan uførepensjon utbetales?", term: true },
  pensjonPremiefritak: { key: "person.ufore.pensjon.premiefritak", label: "Premiefritak under uførepensjon", term: true },
  seniorBrudd: { key: "person.senior.brudd", label: "Engangsutbetaling ved alvorlig brudd" },
  seniorSykehus: { key: "person.senior.sykehus", label: "Utbetaling ved sykehusinnleggelse" },
  sykdomGjentakelse: { key: "person.sykdom.gjentakelse", label: "Begrensning per diagnosegruppe", term: true },
  sykdomHjerneslag: { key: "person.sykdom.diagnose.hjerneslag", label: "Hjerneslag" },
  sykdomHjerteinfarkt: { key: "person.sykdom.diagnose.hjerteinfarkt", label: "Hjerteinfarkt" },
  sykdomKarenstid: { key: "person.sykdom.karenstid", label: "Symptomklausul ved oppstart", term: true },
  sykdomKreft: { key: "person.sykdom.diagnose.kreft", label: "Kreft" },
  sykdomKrisepsykolog: { key: "person.sykdom.krisepsykolog", label: "Psykologisk førstehjelp" },
  sykdomMs: { key: "person.sykdom.diagnose.ms", label: "Multippel sklerose (MS)" },
  sykdomOpphor: { key: "person.sykdom.opphor", label: "Opphørsalder", term: true },
  sykdomOverlevelse: { key: "person.sykdom.overlevelse", label: "Krav om overlevelse", term: true },
  sykdomSykehus: { key: "person.sykdom.sykehus", label: "Utbetaling ved langvarig sykehusopphold" },
  sykdomUfore: { key: "person.sykdom.ufore", label: "Uførekapital ved kritisk sykdom" },
  sykdomUtbetalingsgrense: { key: "person.sykdom.utbetalingsgrense", label: "Hvor mange diagnoseutbetalinger?", term: true },
  uforeSymptom: { key: "person.ufore.symptom", label: "Symptomklausul ved oppstart", term: true },
  ulykkeArbeid: { key: "person.ulykke.arbeid", label: "Ulykkesdekning på jobb og i fritiden", term: true },
  ulykkeFaginvaliditet: { key: "person.ulykke.faginvaliditet", label: "Utvidet erstatning ved faginvaliditet" },
  ulykkeGeografi: { key: "person.ulykke.geografi", label: "Hvor ulykkesforsikringen gjelder", term: true },
  ulykkeKrisehjelp: { key: "person.ulykke.krisehjelp", label: "Psykologisk førstehjelp etter krise" },
  ulykkeOpphor: { key: "person.ulykke.opphor", label: "Opphørsalder", term: true },
} as const;

export const additionalPersonTerms: Record<string, PersonTerms> = {
  "fremtind-barn-uforekapital": { url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_uforekapital2_barn.pdf", sha256: "86db9f142cc9f0f37aa0844d35c4cf505ba80743a6645aa30a08646fc451cda9", pages: 2, effectiveFrom: "2023-05-11", edition: "2023-05-11" },
  "fremtind-barn-uforepensjon": { url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_uforepensjon2_barn.pdf", sha256: "b8b8cae0db58015842452a7ad8bca0b36fbd8ec158678a306158579a2f695904", pages: 2, effectiveFrom: "2024-08-29", edition: "2024-08-29" },
  "gjensidige-barn-uforepensjon": { url: "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-barn-alminnelige-vilkar.pdf", sha256: "770cba5b0150d639292d05cd97dd93df346b21ebe81e036401c977a075dac263", pages: 7, effectiveFrom: "" },
  "tryg-barn-behandling": { url: "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Behandlingsforsikring&vilkNr=05UUL41702", sha256: "7785c8e91e4219c4f8fcd37514f2ecc1c7f8aa873ef469aa6a4798448a534c8b", pages: 8, effectiveFrom: "2025-01-01", edition: "UUL41702" },
  "tryg-barn-produktvilkar": { url: "https://www.tryg.no/odpdf?vilk=Barn&vilkNr=05UUL41700", sha256: "9ec3dd644f600b3c8fbc0936eb2061b0cc46b508eeb25d88994f08bd4d9c2324", pages: 2, effectiveFrom: "2023-01-01", edition: "UUL41700" },
  "tryg-barn-uforekapital": { url: "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Arbeidsufoerhet&vilkNr=05UUL41703", sha256: "8838c9b2932d9ff4adc3cf1a34603e2bb527ccb89ea57ae80289a1039ba84344", pages: 1, effectiveFrom: "2022-01-01", edition: "UUL41703" },
  "tryg-barn-uforepensjon": { url: "https://www.tryg.no/odpdf?vilk=Ufoerepensjon&vilkNr=05UUL41705", sha256: "d66e7cca69a80fd93cf27b2b86276d632f6a07e0b3e936e96c85ab73964f3b15", pages: 2, effectiveFrom: "2021-11-01", edition: "UUL41705" },
  "tryg-barn-utvalgte-sykdommer": { url: "https://www.tryg.no/odpdf?vilk=Utvalgte-sykdommer&vilkNr=05UUL41707", sha256: "fe53db446a255c710c01e088d808eadbef87cd8401d38069d210ef7471f79158", pages: 4, effectiveFrom: "2023-01-01", edition: "UUL41707" },
  "tryg-ulykke-dodsfall": { url: "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Doedsfall&vilkNr=05UUL41502", sha256: "36c331f7eede867adae092a6a155fea90a32bc5c139dc5de3185177f7de18109", pages: 1, effectiveFrom: "2025-01-01", edition: "UUL41502" },
  "tryg-ulykke-faginvaliditet": { url: "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Invaliditet&vilkNr=05UUL41503", sha256: "0868ad274e919252f341e6cc3d95880a3e3a223fa6182662385c87029e951e5d", pages: 1, effectiveFrom: "2021-11-01", edition: "UUL41503" },
  "tryg-ulykke-produktvilkar": { url: "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Produktvilkaar&vilkNr=05UUL41500", sha256: "2e2e8cd7f1b28f0edb5e433adb2881d90b35d0fb45dfc043a69d6387c273d604", pages: 2, effectiveFrom: "", edition: "UUL41500" },
  "tryg-ulykke-progressiv": { url: "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Progressiv-Erstatning&vilkNr=05UUL41504", sha256: "44b43618a8332f792d4549b076ae93597dccbfbe11442b8d87127b74dc483e7f", pages: 1, effectiveFrom: "2021-11-01", edition: "UUL41504" },
};

const ifChildHelpBenefit = "Engangsutbetaling når barnet i forsikringstiden før fylte 18 år får innvilget og utbetalt hjelpestønad fra NAV for en dekket tilstand. Sats 1–4 gir henholdsvis 50 000, 75 000, 275 000 og 912 500 kr. Utbetalingen samordnes med økonomisk førstehjelp.";

export const additionalPersonFacts: Readonly<Record<string, readonly PersonFactDefinition[]>> = {
  "fremtind-person-barn": [
    {
      kind: "barnOpphor", page: 1, section: "§ 2 og § 16 (s. 9)",
      value: "Til fylte 26 år. Da overføres barneforsikringen automatisk til ulykkesforsikring med egne vilkår.",
    },
    {
      kind: "barnGeografi", page: 1, section: "§ 3",
      value: "Norden og utenlandsopphold utenfor Norden i inntil 12 måneder. Vilkårene har unntak for lengre opphold for blant annet studenter, au pairer og ansatte i norsk firma eller utenrikstjenesten.",
    },
    {
      kind: "barnUtgifter", page: 5, section: "§ 8 og § 8.4 (s. 6)",
      value: "Rimelige og nødvendige behandlings- og reiseutgifter i to år etter ulykken, opptil 1 G per ulykkestilfelle. Egenandel 1 000 kr hvis annet ikke er avtalt.",
    },
    {
      kind: "barnSykehus", page: 6, section: "§ 9",
      value: "1 % av G per døgn fra første oppholdsdag ved mer enn 14 sammenhengende døgn på sykehus eller tilsvarende behandlingsinstitusjon. Inntil 365 dager for samme sykdom eller skade.",
    },
    {
      kind: "barnBoligtilpasning", page: 6, section: "§ 10 (s. 6–7)",
      value: "Nødvendig ombygging av bolig og tekniske hjelpemidler. Samlet inntil 3 G per sykdom eller ulykkesskade. Egenandel 1 000 kr hvis annet ikke er avtalt.",
    },
    {
      kind: "barnHjelpestonad", page: 7, section: "§ 11 (s. 7–8)",
      value: "Ved hjelpestønad fra NAV utbetales en andel av 2 G etter stønadssatsen. Inntil fem år, med toårsgrense for oppførte tilstander. Retten opphører ved fylte 18 år.",
    },
    {
      kind: "barnDodsfall", page: 8, section: "§ 12",
      value: "1 G ved dødsfall i forsikringstiden.",
    },
    {
      kind: "barnBetalingsfritak", page: 8, section: "§ 13",
      value: "Fritak for premie til barnet fyller 20 år når en foresatt med foreldreansvar dør og forsikringen har vært i kraft i minst 12 måneder.",
    },
    {
      kind: "barnPensjon", page: 1, section: "§ 3",
      value: "Månedlig ytelse ved minst 50 % sammenhengende arbeidsuførhet ut over karenstiden i forsikringsbeviset. Fra tidligst fylte 18 år til senest 67 år eller avtalt opphørsdato.",
      document: "barn-uforepensjon",
      addOn: "Uførepensjon II",
    },
    {
      kind: "barnKapital", page: 1, section: "§ 3",
      value: "Avtalt engangsbeløp ved minst 50 % sammenhengende arbeidsuførhet i minst to år når uførheten vurderes som varig. Tidligst ved fylte 18 år.",
      document: "barn-uforekapital",
      addOn: "Uførekapital II",
    },
  ],
  "fremtind-person-barn-ulykke": [
    {
      kind: "barnOpphor", page: 1, section: "§ 2",
      value: "Til fylte 20 år. Overføres deretter automatisk til ulykkesforsikring med egne vilkår.",
    },
    {
      kind: "barnGeografi", page: 1, section: "§ 3",
      value: "Norden og reiser utenfor Norden i inntil tre uker. Ved lengre opphold, normalt i inntil 12 måneder, gjelder bare erstatning ved død og varig medisinsk invaliditet.",
    },
    {
      kind: "barnBoligtilpasning", page: 4, section: "§ 8.1–8.4 (s. 3–4)",
      value: "Nødvendige, forhåndsgodkjente boligtilpasninger og hjelpemidler etter varig ulykkesskade. Samlet inntil 3 G og egenandel 5 % av G per ulykkestilfelle.",
    },
    {
      kind: "barnSykehus", page: 5, section: "§ 9",
      value: "0,5 % av G per døgn fra første oppholdsdag ved mer enn 14 sammenhengende døgn på sykehus eller tilsvarende behandlingsinstitusjon etter ulykkesskade. Inntil 180 dager. Opphold må starte før fylte 20 år.",
    },
  ],
  "fremtind-person-behandling": [
    {
      kind: "behandlingBilder", page: 2, section: "§ 4.1.1",
      value: "Røntgen, CT, MR, klinisk mammografi, bentetthetsmåling og ultralyd i forbindelse med utredning, diagnostisering og behandling hos lege. PET/CT ved første kreftdiagnostisering kan dekkes ved særskilte vilkår.",
    },
    {
      kind: "behandlingBildeFrist", page: 1, section: "§ 4.1, jf. § 5.5 (s. 4–5)",
      value: "10 virkedager til bildediagnostikk fra mottatt henvisning når den kreves, fullmakt og nødvendig medisinsk dokumentasjon. Vilkåret har unntak.",
      conditional: true,
    },
    {
      kind: "behandlingAndrevurdering", page: 2, section: "§ 4.1.3",
      value: "Ny vurdering hos annen spesialist ved livstruende sykdom eller skade eller særlig risikofylt behandling.",
    },
    {
      kind: "behandlingEtterkontroll", page: 2, section: "§ 4.1.4",
      value: "Etterkontroller på sykehuset eller behandlingsstedet inngår som del av operasjonen eller sykehusbehandlingen.",
    },
    {
      kind: "behandlingRehabilitering", page: 2, section: "§ 4.1.5",
      value: "Nødvendig rehabilitering i inntil tre måneder etter en operasjon som er bestilt og betalt av Fremtind.",
    },
    {
      kind: "behandlingReiseutgifter", page: 2, section: "§ 4.1.6",
      value: "Rimeligste reise ved dekket bildediagnostikk, spesialistbehandling, ny vurdering, operasjon eller sykehusbehandling. Reiseveien fra fast bostedsadresse i Skandinavia må være over 100 km én vei.",
    },
    {
      kind: "behandlingPsykolog", page: 3, section: "§ 4.1.7",
      value: "Inntil fem forhåndsgodkjente videokonsultasjoner med psykolog per kalenderår hos Fremtinds samarbeidspartner. Henvisning kreves ikke.",
    },
    {
      kind: "behandlingKrisehjelp", page: 3, section: "§ 4.1.8",
      value: "Psykologkontakt innen 24 timer og inntil tre påfølgende videokonsultasjoner ved psykisk reaksjon etter alvorlig, uforutsett hendelse. Henvisning kreves ikke.",
    },
    {
      kind: "behandlingKompensasjon", page: 5, section: "§ 5.5 (forts.)",
      value: "600 kr per dag fra garantitiden utløper til behandling kan tilbys, i inntil 30 dager. Krav må rettes til Fremtind.",
    },
    {
      kind: "behandlingEgenandel", page: 5, section: "§ 6",
      value: "Forsikringsbeviset viser om egenandel er avtalt.",
    },
  ],
  "fremtind-person-kritisk": [
    {
      kind: "sykdomKreft", page: 3, section: "Punkt 5.A",
      value: "Ondartet kreft i ICD-10 kodegruppe C, som hovedregel bekreftet med vevsprøve i spesialisthelsetjenesten. Blant unntakene er forstadier, prostatakreft under de angitte tersklene og føflekkreft på 0,5 mm eller mindre.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 3, section: "Punkt 5.C",
      value: "Endelig diagnose med varig skade i hjertemuskel. Krever tilstrekkelig endring i hjertemarkører og minst ett av vilkårets kriterier for svekket blodtilførsel.",
    },
    {
      kind: "sykdomHjerneslag", page: 4, section: "Punkt 5.G.1–5.G.2",
      value: "50 % av forsikringssummen ved dekket hjerneblødning eller hjerneinfarkt med objektive nevrologiske utfall etter 24 timer. De siste 50 % kan utbetales når objektive utfall varer i mer enn tre måneder og øvrige vilkår er oppfylt.",
    },
    {
      kind: "sykdomMs", page: 5, section: "Punkt 5.I",
      value: "Sikker diagnose fra spesialist i nevrologi.",
    },
    {
      kind: "sykdomOverlevelse", page: 2, section: "Punkt 4 (s. 1–2)",
      value: "Forsikrede må være i live 24 timer etter forsikringstilfellet. Starttidspunktet avhenger av om kravet gjelder diagnose, gjennomført operasjon eller venteliste for transplantasjon.",
    },
    {
      kind: "sykdomKarenstid", page: 6, section: "Punkt 6 a",
      value: "Sykdom påvist eller med tegn eller symptomer før tre måneder etter at forsikrede aksepterte avtalen, er unntatt. Ved flytting av tilsvarende forsikring som har løpt i minst 12 måneder, gjelder klausulen bare for utvidelser eller økt sum.",
    },
    {
      kind: "sykdomGjentakelse", page: 2, section: "Punkt 4",
      value: "Én utbetaling per bokstavgruppe. En sykdom, skade eller behandling som faller inn under flere grupper, gir bare én utbetaling.",
    },
    {
      kind: "sykdomKrisepsykolog", page: 1, section: "Punkt 3",
      value: "Fem videokonsultasjoner med psykolog ved psykisk reaksjon på dokumentert mistanke om, eller diagnose for, en dekket sykdom eller skade. Første samtale må skje innen seks måneder. Henvisning kreves ikke.",
    },
  ],
  "fremtind-person-liv": [
    {
      kind: "livMottaker", page: 1, section: "Punkt 2",
      value: "Hvis forsikringstakeren ikke har disponert over forsikringen, går beløpet til ektefellen hvis avdøde også var forsikringstaker, ellers til forsikringstakeren. Ved mangel på ektefelle med rett til utbetaling går beløpet til arvinger etter lov eller testament.",
    },
    {
      kind: "livSelvmord", page: 1, section: "Punkt 3 b",
      value: "Selvmord før forsikringen har vært i kraft i ett år gir erstatning bare dersom avtalen ble inngått uten tanke på selvmord.",
    },
  ],
  "fremtind-person-uforekapital": [
    {
      kind: "kapitalMinstegrad", page: 1, section: "Punkt 3.1.1",
      value: "Minst 50 % sammenhengende arbeidsuførhet som vurderes som varig.",
    },
    {
      kind: "kapitalVentetid", page: 1, section: "Punkt 3.1.1",
      value: "Minst to år fra første dag i den sammenhengende sykmeldingsperioden som går over til varig arbeidsuførhet. Perioden må ha startet innen opphørsdato. Utbetaling tidligst ved fylte 18 år.",
    },
  ],
  "fremtind-person-uforekapital-forskudd": [
    {
      kind: "kapitalMinstegrad", page: 1, section: "Punkt 3.1.1",
      value: "Minst 50 % sammenhengende arbeidsuførhet som vurderes som varig.",
    },
    {
      kind: "kapitalVentetid", page: 1, section: "Punkt 3.1.1",
      value: "Minst to år fra første dag i den sammenhengende sykmeldingsperioden som går over til varig arbeidsuførhet. Perioden må ha startet innen opphørsdato. Utbetaling tidligst ved fylte 18 år.",
    },
    {
      kind: "forskuddMinstegrad", page: 1, section: "Punkt 3.2.1",
      value: "Minst 50 % sammenhengende arbeidsuførhet.",
    },
    {
      kind: "forskuddKarenstid", page: 1, section: "Punkt 3.2.1",
      value: "Mer enn tolv måneder sammenhengende uførhet ved avtalt forskuttering. Første utbetaling tidligst ved fylte 18 år.",
    },
    {
      kind: "forskuddVarighet", page: 2, section: "Punkt 3.2.3",
      value: "Forskudd så lenge uføregraden er minst 50 % og sammenhengende, senest til måneden forsikrede fyller 67 år. Etter totalt 60 måneders forskudd med minst 50 % arbeidsuførhet utbetales restbeløpet etter vilkårene.",
    },
  ],
  "fremtind-person-uforepensjon": [
    {
      kind: "pensjonMinstegrad", page: 1, section: "Definisjoner og Erstatningsregler punkt 2–2.2 (s. 1–2)",
      value: "Minst 50 % arbeidsuførhet. Forsikringen gir avtalt årlig sum i omstillingsperioden, med inntil 48 månedsutbetalinger. Etter perioden graderes pensjonen etter uføregraden.",
    },
    {
      kind: "pensjonKarenstid", page: 1, section: "Erstatningsregler punkt 2–3 (s. 1–2)",
      value: "Mer enn 12 måneder sammenhengende arbeidsuførhet. Retten inntrer tidligst ved fylte 18 år. Ny uførhet av samme årsak innen seks måneder etter friskmelding kan gi utbetaling uten ny ventetid.",
    },
    {
      kind: "pensjonOpphor", page: 2, section: "Erstatningsregler punkt 2",
      value: "Så lenge uføregraden er minst 50 %, innenfor avtalt varighet i forsikringsbeviset.",
    },
    {
      kind: "pensjonPremiefritak", page: 2, section: "Erstatningsregler punkt 2.1–2.2",
      value: "Selskapet betaler premien i omstillingsperioden. Etterpå beregnes prisen etter uføregraden.",
    },
    {
      kind: "uforeSymptom", page: 2, section: "Erstatningsregler punkt 4 a",
      value: "Tre måneder fra forsikringstakeren aksepterer avtalen. Tolv måneder for psykiske lidelser, utmattelsestilstander og muskel- eller skjelettlidelser. Ved kvalifiserende flytting av tilsvarende forsikring som har løpt minst tolv måneder, gjelder klausulen bare ved utvidelser og økt sum.",
    },
  ],
  "fremtind-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 3, section: "§ 6.2",
      value: "Nødvendige behandlings- og reiseutgifter i Norden i inntil to år etter ulykken. Opptil 5 % av invaliditetssummen og 1 000 kr i egenandel. Varig invaliditet er ikke et krav for refusjon.",
    },
    {
      kind: "ulykkeGeografi", page: 1, section: "§ 3",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder, med unntak for blant annet utenriksansatte og studenter. Ved permanent utreise fra Norden opphører forsikringen ved utreise.",
    },
    {
      kind: "ulykkeArbeid", page: 1, section: "§ 4",
      value: "Gjelder hele døgnet.",
    },
  ],
  "frende-person-barn-best": [
    {
      kind: "barnUtgifter", page: 8, section: "§ 4.8 (s. 8–9)",
      value: "Nødvendige behandlings- og reiseutgifter i inntil tre år. Egenandel 1 000 kr og sum som oppgitt i forsikringsbeviset. Egne vilkår for utsatt permanent tannbehandling.",
    },
    {
      kind: "barnDiagnose", page: 6, section: "§ 4.7 (s. 6–8)",
      value: "Erstatning ved en oppført sykdom eller tilstand når diagnosekravene og øvrige vilkår for den aktuelle dekningen er oppfylt.",
    },
    {
      kind: "barnPensjon", page: 5, section: "§ 4.4",
      value: "Full avtalt månedlig ytelse ved minst 50 % sammenhengende arbeidsuførhet i minst 12 måneder, tidligst fra fylte 18 år. Arbeidsavklaringspenger eller uføretrygd må være krevd og antas innvilget, og må mottas for videre utbetaling. Ytelsen opphører senest ved fylte 67 år.",
    },
    {
      kind: "barnSykehus", page: 9, section: "§ 4.9",
      value: "1 % av G per dag fra første dag ved mer enn 14 sammenhengende dager på sykehus. Høyst 365 dager og frem til fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 5, section: "§ 4.6 (s. 5–6)",
      value: "Engangsbidrag ved nødvendig og rimelig ombygging av bolig eller tekniske hjelpemidler etter sykdom eller ulykke. Ombyggingen må forhåndsgodkjennes og behov og kostnader dokumenteres.",
    },
    {
      kind: "barnDodsfall", page: 5, section: "§ 4.5",
      value: "1 G ved dødsfall i forsikringstiden, beregnet etter grunnbeløpet i forsikringsbeviset.",
    },
    {
      kind: "barnOpphor", page: 2, section: "§§ 3.1–3.3",
      value: "Dagpenger ved sykehusopphold opphører ved fylte 18 år. Barneforsikringen opphører ved hovedforfall etter fylte 26 år. Uførepensjon og livsforsikring videreføres som egne dekninger hvis forsikringen ikke sies opp.",
    },
    {
      kind: "barnGeografi", page: 2, section: "§ 2",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Lengre opphold kan dekkes for blant annet studenter, au pairer og personer med arbeid i norsk foretak eller utenrikstjenesten.",
    },
  ],
  "frende-person-barn-bra": [
    {
      kind: "barnUtgifter", page: 8, section: "§ 4.8 (s. 8–9)",
      value: "Nødvendige behandlings- og reiseutgifter i inntil tre år. Egenandel 1 000 kr og sum som oppgitt i forsikringsbeviset. Egne vilkår for utsatt permanent tannbehandling.",
    },
    {
      kind: "barnDiagnose", page: 6, section: "§ 4.7 (s. 6–8)",
      value: "Erstatning ved en oppført sykdom eller tilstand når diagnosekravene og øvrige vilkår for den aktuelle dekningen er oppfylt.",
    },
    {
      kind: "barnPensjon", page: 5, section: "§ 4.4",
      value: "Full avtalt månedlig ytelse ved minst 50 % sammenhengende arbeidsuførhet i minst 12 måneder, tidligst fra fylte 18 år. Arbeidsavklaringspenger eller uføretrygd må være krevd og antas innvilget, og må mottas for videre utbetaling. Ytelsen opphører senest ved fylte 67 år.",
    },
    {
      kind: "barnSykehus", page: 9, section: "§ 4.9",
      value: "1 % av G per dag fra første dag ved mer enn 14 sammenhengende dager på sykehus. Høyst 365 dager og frem til fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 5, section: "§ 4.6 (s. 5–6)",
      value: "Engangsbidrag ved nødvendig og rimelig ombygging av bolig eller tekniske hjelpemidler etter sykdom eller ulykke. Ombyggingen må forhåndsgodkjennes og behov og kostnader dokumenteres.",
    },
    {
      kind: "barnDodsfall", page: 5, section: "§ 4.5",
      value: "1 G ved dødsfall i forsikringstiden, beregnet etter grunnbeløpet i forsikringsbeviset.",
    },
    {
      kind: "barnOpphor", page: 2, section: "§§ 3.1–3.3",
      value: "Dagpenger ved sykehusopphold opphører ved fylte 18 år. Barneforsikringen opphører ved hovedforfall etter fylte 26 år. Uførepensjon og livsforsikring videreføres som egne dekninger hvis forsikringen ikke sies opp.",
    },
    {
      kind: "barnGeografi", page: 2, section: "§ 2",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Lengre opphold kan dekkes for blant annet studenter, au pairer og personer med arbeid i norsk foretak eller utenrikstjenesten.",
    },
  ],
  "frende-person-kritisk": [
    {
      kind: "sykdomKreft", page: 2, section: "Punkt 2 – Kreft",
      value: "Kreft dokumentert ved vevs- eller celleundersøkelse. Vilkåret omfatter blant annet lymfekreft i stadium II–IV og føflekkreft tykkere enn 0,5 mm. Forstadier, lymfekreft i stadium I og kronisk lymfatisk leukemi er blant unntakene.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 2, section: "Punkt 2 – Hjerteinfarkt",
      value: "Akutt skade i hjertemuskelen med nedsatt pumpefunksjon tilsvarende NYHA klasse II eller høyere, eller ejeksjonsfraksjon under 45 %.",
    },
    {
      kind: "sykdomHjerneslag", page: 2, section: "Punkt 2 – Hjerneslag",
      value: "Plutselig tap av kroppsfunksjon som varer over 30 dager, forårsaket av forstyrrelse i hjernens blodsirkulasjon. Diagnosen skal som hovedregel støttes av radiologiske funn. Blødning fra ytre skade og forbigående symptomer (TIA) er unntatt.",
    },
    {
      kind: "sykdomMs", page: 2, section: "Punkt 2 – Multippel sklerose (s. 2–3)",
      value: "Symptomer utover seks måneder eller igangsatt medikamentell sykdomsmodifiserende behandling.",
    },
    {
      kind: "sykdomOverlevelse", page: 4, section: "Punkt 5.1",
      value: "Forsikrede må være i live 30 dager etter diagnose, gjennomført behandling eller operasjon, eller registrering på venteliste når venteliste er tilstrekkelig.",
    },
    {
      kind: "sykdomKarenstid", page: 4, section: "Punkt 5.2",
      value: "Sykdom påvist eller med tegn eller symptomer innen tre måneder etter levert fullstendig helseerklæring, er unntatt. Vilkårene har unntak for tilsvarende dekninger som har løpt i minst 12 måneder og flyttes etter bransjeavtalen. Økning eller utvidelse omfattes fortsatt av klausulen.",
    },
    {
      kind: "sykdomOpphor", page: 4, section: "Punkt 4",
      value: "Ved hovedforfall etter fylte 67 år.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 4, section: "Punkt 4",
      value: "Én utbetaling. Forsikringen opphører etter utbetalingen.",
    },
  ],
  "frende-person-liv": [
    {
      kind: "livMottaker", page: 2, section: "Punkt 2",
      value: "En oppnevnt begunstiget kan få beløpet. Ellers går utbetalingen til ektefelle eller arvinger etter lov eller testament når avdøde også var forsikringseier, og til forsikringseieren når dette er en annen person.",
    },
    {
      kind: "livSelvmord", page: 2, section: "Punkt 4.2",
      value: "Selvmord før forsikringen har vært i kraft i ett år gir erstatning bare dersom avtalen ble inngått uten tanke på selvmord.",
    },
    {
      kind: "livOpphor", page: 2, section: "Punkt 3",
      value: "Ved hovedforfall etter at forsikrede fyller 80 år.",
    },
  ],
  "frende-person-uforekapital": [
    {
      kind: "kapitalMinstegrad", page: 4, section: "Punkt 5.1",
      value: "Minst 50 % sammenhengende arbeidsuførhet, vurdert som minst 50 % varig uførhet.",
    },
    {
      kind: "kapitalVentetid", page: 4, section: "Punkt 5.1",
      value: "Minst to år med sammenhengende arbeidsuførhet. Utbetaling tidligst ved fylte 18 år.",
    },
    {
      kind: "kapitalOpphor", page: 2, section: "Punkt 3.1 og 5.3 (s. 2 og 4)",
      value: "Dekningen opphører ved hovedforfall etter fylte 60 år. Etter opphør gjelder særregelen om at ventetiden må ha startet innen utgangen av året forsikrede fyller 60, og uførheten må være vurdert som varig før fylte 67 år.",
    },
    {
      kind: "forskuddMinstegrad", page: 2, section: "Punkt 4.1",
      value: "Minst 50 % sammenhengende arbeidsuførhet.",
    },
    {
      kind: "forskuddKarenstid", page: 2, section: "Punkt 4.1",
      value: "Minst ett år med sammenhengende arbeidsuførhet. Forsikringstilfellet kan tidligst inntreffe ved fylte 18 år.",
    },
    {
      kind: "forskuddNav", page: 2, section: "Punkt 4.1 og 4.4 (s. 2–3)",
      value: "Forsikrede må ha søkt om arbeidsavklaringspenger eller uføretrygd, og det må antas at kravet blir innvilget. Fortsatt forskudd krever at ytelsen fortsatt mottas.",
    },
    {
      kind: "forskuddVarighet", page: 3, section: "Punkt 4.4",
      value: "Forskudd stanser blant annet når total utbetaling tilsvarer avtalt sum, ved innvilget varig kapital eller to år etter opphørsdatoen. Vilkåret angir ti års utbetaling for samme forsikringstilfelle som grunnlag for opphør og restutbetaling.",
    },
    {
      kind: "uforeSymptom", page: 4, section: "Punkt 6.2",
      value: "Tre måneder fra fullstendig helseerklæring ble levert. Tolv måneder for psykiske lidelser, utmattelsestilstander, muskel- eller skjelettlidelser og rusmiddelavhengighet. Ved kvalifiserende flytting gjelder klausulen bare ny dekning eller økt sum.",
    },
  ],
  "frende-person-uforepensjon": [
    {
      kind: "pensjonMinstegrad", page: 2, section: "Punkt 3",
      value: "Minst 50 % sammenhengende arbeidsuførhet.",
    },
    {
      kind: "pensjonKarenstid", page: 2, section: "Punkt 3 (s. 2–3)",
      value: "Minst 12 måneder sammenhengende arbeidsuførhet. Ny uførhet av samme årsak innen seks måneder etter at utbetalingene opphørte kan gi ny pensjon uten ny ventetid.",
    },
    {
      kind: "pensjonOpphor", page: 2, section: "Punkt 3",
      value: "Månedsutbetaling så lenge uføregraden er minst 50 %, senest ut måneden forsikrede fyller 67 år.",
    },
    {
      kind: "pensjonPremiefritak", page: 3, section: "Punkt 3",
      value: "Premiefritak under utbetaling, tidligst fra måneden etter at Frende mottok melding om forsikringstilfellet.",
    },
    {
      kind: "pensjonNav", page: 2, section: "Punkt 3",
      value: "Forsikrede må ha søkt om arbeidsavklaringspenger eller uføretrygd, og det må antas at kravet blir innvilget.",
    },
    {
      kind: "uforeSymptom", page: 3, section: "Punkt 4.2",
      value: "Tre måneder fra fullstendig helseerklæring ble levert. Tolv måneder for psykiske lidelser, utmattelsestilstander, muskel- eller skjelettlidelser og rusmiddelavhengighet. Ved kvalifiserende flytting gjelder klausulen bare ny dekning eller økt sum.",
    },
  ],
  "frende-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 4, section: "§§ 6.6 og 7.6 (s. 6)",
      value: "Når invaliditetsdekning er avtalt, refunderes nødvendige utgifter i Norge i inntil tre år. Maksimalt 5 % av invaliditetssummen og 1 000 kr i egenandel. Utgiftene må ikke kunne dekkes av NAV eller andre.",
      conditional: true,
    },
    {
      kind: "ulykkeFaginvaliditet", page: 4, section: "§ 6.3 og § 7.4 (s. 5–6)",
      value: "Ved livsvarig skade på arm, hånd eller fingre etter en fritidsulykke brukes den særskilte invaliditetstabellen for faginvaliditet.",
      addOn: "Faginvaliditet fritid",
    },
    {
      kind: "ulykkeFaginvaliditet", page: 4, section: "§ 6.4 og § 7.4 (s. 5–6)",
      value: "Ved livsvarig skade på arm, hånd eller fingre etter en ulykke på jobb, skole eller studiested brukes den særskilte invaliditetstabellen for faginvaliditet.",
      addOn: "Faginvaliditet arbeid",
    },
    {
      kind: "ulykkeGeografi", page: 2, section: "§ 2",
      value: "Norge og utenlandsopphold i inntil ett år. Ved fortsatt medlemskap i folketrygden kan studenter, au pairer og ansatte i norsk firma eller utenrikstjenesten være dekket lenger.",
    },
    {
      kind: "ulykkeOpphor", page: 2, section: "§ 2",
      value: "Ved første hovedforfall etter fylte 75 år.",
    },
    {
      kind: "ulykkeArbeid", page: 2, section: "§ 2",
      value: "Barn under 16 år dekkes hele døgnet. Barn 16–18 år dekkes i fritid og skoletid, med mulig utvidelse til jobb. For voksne er fritid utgangspunktet, med mulig utvidelse til jobb, skole og studiested.",
    },
  ],
  "gjensidige-person-alvorlig-sykdom": [
    {
      kind: "sykdomKreft", page: 7, section: "Erstatningsregler punkt 1.1 a",
      value: "Ondartede svulster og blant annet føflekkreft, blodkreft, lymfekreft og benmargskreft ved histologisk bekreftelse. Forstadier, cancer in situ, leppekreft og annen hudkreft enn føflekkreft er unntatt.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 7, section: "Erstatningsregler punkt 1.1 c",
      value: "Akutt hjerteinfarkt med signifikant økning i hjertemarkører og EKG-forandringer. Diagnosen må stilles på hjerteavdeling eller indremedisinsk sykehusavdeling.",
    },
    {
      kind: "sykdomHjerneslag", page: 7, section: "Erstatningsregler punkt 1.1 f",
      value: "Akutt hjerneblødning eller hjerneinfarkt, ICD-10 I61 eller I63. Diagnosen må stilles av nevrolog eller på sykehusavdeling som behandler hjerneslag.",
    },
    {
      kind: "sykdomMs", page: 7, section: "Erstatningsregler punkt 1.1 l",
      value: "Diagnose fra nevrolog basert på symptomer, nevrologisk undersøkelse og MR av hjerne eller ryggmarg.",
    },
    {
      kind: "sykdomOverlevelse", page: 8, section: "Erstatningsregler punkt 1.2",
      value: "Forsikrede må være i live 24 timer etter endelig diagnose, gjennomført operasjon eller registrering på venteliste for transplantasjon.",
    },
    {
      kind: "sykdomKarenstid", page: 2, section: "Forsikringsbevis – Alvorlig sykdom",
      value: "Sykdom påvist eller med tegn eller symptomer innen tre måneder etter at Gjensidige mottok utfylt og signert helseerklæring, er unntatt. Ved flytting av tilsvarende forsikring som har løpt minst 12 måneder, gjelder klausulen bare for utvidelser eller økt sum.",
    },
    {
      kind: "sykdomOpphor", page: 1, section: "Forsikringsoversikt – Alvorlig sykdom",
      value: "Senest ved fylte 67 år ifølge forsikringsoversikten.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 2, section: "Forsikringsbevis – Alvorlig sykdom",
      value: "Forsikringsbeviset oppgir at diagnoselisten dekker ett forsikringstilfelle.",
    },
    {
      kind: "sykdomSykehus", page: 8, section: "Erstatningsregler punkt 1.3",
      value: "100 000 kr én gang etter minst 60 sammenhengende dager uten permisjon på norsk sykehus. Innleggelser for diagnosene på sykdomslisten, rus eller psykiske lidelser er unntatt. Rehabilitering og helsehus omfattes heller ikke.",
    },
  ],
  "gjensidige-person-barn-basis": [
    {
      kind: "barnUtgifter", page: 12, section: "Erstatningsregler § 8",
      value: "Behandling og reise i inntil to år etter ulykken. Samlet grense står i forsikringsbeviset. Inntil 15 000 kr for privat behandling og reise dit, og 500 kr i egenandel per ulykkesskade.",
    },
    {
      kind: "barnSykehus", page: 11, section: "Erstatningsregler § 6 og publisert forsikringsbevis (s. 1)",
      value: "Minst ti sammenhengende dager ved offentlig godkjent sykehus i Norden. I det publiserte forsikringsbeviset er satsen 1 % av G per dag. For samme hendelse kan ytelsen gis fra første dag i inntil 365 dager.",
    },
    {
      kind: "barnHjelpestonad", page: 9, section: "Erstatningsregler § 4 og publisert forsikringsbevis (s. 1)",
      value: "Engangsutbetaling ved økt pleie- og omsorgsbehov når NAV innvilger hjelpestønad. Avhenger av NAV-satsen, inntil 8 G i det publiserte forsikringsbeviset. Opphører ved fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 11, section: "Erstatningsregler § 7 og publisert forsikringsbevis (s. 1)",
      value: "Nødvendig ombygging av bolig etter sykdom eller skade. Forhåndsgodkjenning kreves. I det publiserte forsikringsbeviset er grensen 4 G og egenandelen 10 000 kr per tilfelle.",
    },
    {
      kind: "barnDodsfall", page: 12, section: "Erstatningsregler § 9 og publisert forsikringsbevis (s. 1)",
      value: "Ved dødsfall i forsikringstiden betales avtalt sum. Det publiserte forsikringsbeviset oppgir 1 G.",
    },
    {
      kind: "barnPensjon", page: 2, section: "Uførepensjon Barn – forsikringsbevis og erstatningsregler",
      value: "Månedlig etterskuddsvis utbetaling fra tidligst fylte 18 år ved minst 50 % arbeidsuførhet og innvilgede arbeidsavklaringspenger eller uføretrygd. Summen og utbetalingsperioden står i forsikringsbeviset.",
      document: "barn-uforepensjon",
    },
    {
      kind: "barnOpphor", page: 4, section: "Forsikringsbevis – opphørstidspunkt",
      value: "Opphørsalder varierer mellom dekningene. Økt pleie- og omsorgsbehov opphører ved 18 år. Ulykkes- og dødsfallsdekning kan videreføres ved første hovedforfall etter fylte 26 år.",
    },
    {
      kind: "barnGeografi", page: 2, section: "Forsikringsbevis – hvor gjelder forsikringen?",
      value: "Hele verden. Norsk folketrygd kreves for invaliditet og behandlingsutgifter ved ulykke og for økt pleie- og omsorgsbehov. Behandlingsutgifter dekkes i Norden.",
    },
  ],
  "gjensidige-person-barn-medium": [
    {
      kind: "barnUtgifter", page: 12, section: "Erstatningsregler § 8",
      value: "Behandling og reise i inntil to år etter ulykken. Samlet grense står i forsikringsbeviset. Inntil 15 000 kr for privat behandling og reise dit, og 500 kr i egenandel per ulykkesskade.",
    },
    {
      kind: "barnSykehus", page: 11, section: "Erstatningsregler § 6 og publisert forsikringsbevis (s. 1)",
      value: "Minst ti sammenhengende dager ved offentlig godkjent sykehus i Norden. I det publiserte forsikringsbeviset er satsen 1 % av G per dag. For samme hendelse kan ytelsen gis fra første dag i inntil 365 dager.",
    },
    {
      kind: "barnHjelpestonad", page: 9, section: "Erstatningsregler § 4 og publisert forsikringsbevis (s. 1)",
      value: "Engangsutbetaling ved økt pleie- og omsorgsbehov når NAV innvilger hjelpestønad. Avhenger av NAV-satsen, inntil 8 G i det publiserte forsikringsbeviset. Opphører ved fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 11, section: "Erstatningsregler § 7 og publisert forsikringsbevis (s. 1)",
      value: "Nødvendig ombygging av bolig etter sykdom eller skade. Forhåndsgodkjenning kreves. I det publiserte forsikringsbeviset er grensen 4 G og egenandelen 10 000 kr per tilfelle.",
    },
    {
      kind: "barnDodsfall", page: 12, section: "Erstatningsregler § 9 og publisert forsikringsbevis (s. 1)",
      value: "Ved dødsfall i forsikringstiden betales avtalt sum. Det publiserte forsikringsbeviset oppgir 1 G.",
    },
    {
      kind: "barnPensjon", page: 2, section: "Uførepensjon Barn – forsikringsbevis og erstatningsregler",
      value: "Månedlig etterskuddsvis utbetaling fra tidligst fylte 18 år ved minst 50 % arbeidsuførhet og innvilgede arbeidsavklaringspenger eller uføretrygd. Summen og utbetalingsperioden står i forsikringsbeviset.",
      document: "barn-uforepensjon",
    },
    {
      kind: "barnOpphor", page: 4, section: "Forsikringsbevis – opphørstidspunkt",
      value: "Opphørsalder varierer mellom dekningene. Økt pleie- og omsorgsbehov opphører ved 18 år. Ulykkes- og dødsfallsdekning kan videreføres ved første hovedforfall etter fylte 26 år.",
    },
    {
      kind: "barnGeografi", page: 2, section: "Forsikringsbevis – hvor gjelder forsikringen?",
      value: "Hele verden. Norsk folketrygd kreves for invaliditet og behandlingsutgifter ved ulykke og for økt pleie- og omsorgsbehov. Behandlingsutgifter dekkes i Norden.",
    },
  ],
  "gjensidige-person-barn-pluss": [
    {
      kind: "barnUtgifter", page: 12, section: "Erstatningsregler § 8",
      value: "Behandling og reise i inntil to år etter ulykken. Samlet grense står i forsikringsbeviset. Inntil 15 000 kr for privat behandling og reise dit, og 500 kr i egenandel per ulykkesskade.",
    },
    {
      kind: "barnSykehus", page: 11, section: "Erstatningsregler § 6 og publisert forsikringsbevis (s. 1)",
      value: "Minst ti sammenhengende dager ved offentlig godkjent sykehus i Norden. I det publiserte forsikringsbeviset er satsen 1 % av G per dag. For samme hendelse kan ytelsen gis fra første dag i inntil 365 dager.",
    },
    {
      kind: "barnHjelpestonad", page: 9, section: "Erstatningsregler § 4 og publisert forsikringsbevis (s. 1)",
      value: "Engangsutbetaling ved økt pleie- og omsorgsbehov når NAV innvilger hjelpestønad. Avhenger av NAV-satsen, inntil 8 G i det publiserte forsikringsbeviset. Opphører ved fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 11, section: "Erstatningsregler § 7 og publisert forsikringsbevis (s. 1)",
      value: "Nødvendig ombygging av bolig etter sykdom eller skade. Forhåndsgodkjenning kreves. I det publiserte forsikringsbeviset er grensen 4 G og egenandelen 10 000 kr per tilfelle.",
    },
    {
      kind: "barnDodsfall", page: 12, section: "Erstatningsregler § 9 og publisert forsikringsbevis (s. 1)",
      value: "Ved dødsfall i forsikringstiden betales avtalt sum. Det publiserte forsikringsbeviset oppgir 1 G.",
    },
    {
      kind: "barnPensjon", page: 2, section: "Uførepensjon Barn – forsikringsbevis og erstatningsregler",
      value: "Månedlig etterskuddsvis utbetaling fra tidligst fylte 18 år ved minst 50 % arbeidsuførhet og innvilgede arbeidsavklaringspenger eller uføretrygd. Summen og utbetalingsperioden står i forsikringsbeviset.",
      document: "barn-uforepensjon",
    },
    {
      kind: "barnOpphor", page: 4, section: "Forsikringsbevis – opphørstidspunkt",
      value: "Opphørsalder varierer mellom dekningene. Økt pleie- og omsorgsbehov opphører ved 18 år. Ulykkes- og dødsfallsdekning kan videreføres ved første hovedforfall etter fylte 26 år.",
    },
    {
      kind: "barnGeografi", page: 2, section: "Forsikringsbevis – hvor gjelder forsikringen?",
      value: "Hele verden. Norsk folketrygd kreves for invaliditet og behandlingsutgifter ved ulykke og for økt pleie- og omsorgsbehov. Behandlingsutgifter dekkes i Norden.",
    },
  ],
  "gjensidige-person-behandling": [
    {
      kind: "operasjonsfrist", page: 9, section: "Erstatningsregler § 3.2",
      value: "10 virkedager til sykehusbehandling fra Gjensidige har mottatt fullstendig og nødvendig dokumentasjon for medisinsk behandling. Fristen gjelder også dagkirurgi og annen legebehandling uten innleggelse.",
      conditional: true,
    },
    {
      kind: "behandlingBilder", page: 2, section: "Hva dekkes · Bildediagnostikk",
      value: "Dekket bildediagnostikk ved utredning eller behandling. I publisert forsikringsbevis er egenandelen 250 kr per undersøkelse.",
    },
    {
      kind: "behandlingRehabilitering", page: 8, section: "Erstatningsregler § 1.6",
      value: "Nødvendig rehabilitering i inntil tre måneder etter behandling dekket og betalt av Gjensidige, etter det offentliges faglige retningslinjer.",
    },
    {
      kind: "behandlingEtterkontroll", page: 8, section: "Erstatningsregler § 1.3",
      value: "Nødvendige etterkontroller i inntil seks måneder etter dekket behandling.",
    },
    {
      kind: "behandlingReiseutgifter", page: 8, section: "Erstatningsregler § 1.7",
      value: "Reise ved operasjon, bildediagnostikk og spesialistbehandling etter statens pasientreisesatser når vilkårenes avstands- og godkjenningskrav er oppfylt.",
    },
    {
      kind: "behandlingKrisehjelp", page: 8, section: "Erstatningsregler § 1.8",
      value: "Inntil ti behandlinger per tolvmånedersperiode ved akutt psykisk krise etter oppført plutselig hendelse. Legehenvisning kreves ikke.",
    },
    {
      kind: "behandlingAndrevurdering", page: 8, section: "Erstatningsregler § 1.9",
      value: "Ny medisinsk vurdering hos en annen legespesialist etter godkjenning fra Gjensidige, ved livstruende sykdom eller skade eller særlig risikofylt behandling.",
    },
    {
      kind: "behandlingPsykolog", page: 2, section: "Hva dekkes · Behandling hos psykolog, jf. erstatningsregler § 2 (s. 8)",
      value: "Inntil ti behandlinger per tolvmånedersperiode etter henvisning. Publisert forsikringsbevis oppgir 250 kr i egenandel per behandling.",
    },
    {
      kind: "behandlingFysikalsk", page: 2, section: "Hva dekkes · Fysikalsk behandling (s. 2–3)",
      value: "Inntil tolv behandlinger per tolvmånedersperiode hos en av de oppførte fysikalske behandlerne. Publisert forsikringsbevis oppgir 250 kr i egenandel per behandling.",
    },
    {
      kind: "behandlingKompensasjon", page: 9, section: "Erstatningsregler § 3.3",
      value: "500 kr per påbegynt døgn fra garantitiden utløper til første spesialisttime eller tilgang til sykehus eller klinikk for behandling, i inntil 30 dager.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 8, section: "Erstatningsregler § 2",
      value: "Undersøkelser, behandlinger og operasjoner skal forhåndsgodkjennes av Gjensidige. Vilkåret oppgir hvilke ytelser som krever henvisning.",
    },
  ],
  "gjensidige-person-helse-55": [
    {
      kind: "behandlingBilder", page: 2, section: "Hva dekkes · Utredning og behandling hos legespesialist",
      value: "Blant annet røntgen, CT, MR, mammografi, ultralyd og bentetthetsmåling ved dekket utredning. Publisert forsikringsbevis oppgir 250 kr i egenandel per konsultasjon.",
    },
    {
      kind: "behandlingDagkirurgi", page: 8, section: "Erstatningsregler § 1.3",
      value: "Dekket dagkirurgi ved privat sykehus, med innskriving og utskriving samme dag. Før inngrepet kreves henvisning fra legespesialist.",
    },
    {
      kind: "behandlingDagkirurgiFrist", page: 8, section: "Erstatningsregler § 1.3",
      value: "10 virkedager fra Gjensidige har mottatt fullstendig og nødvendig medisinsk dokumentasjon for dagkirurgi.",
      conditional: true,
    },
    {
      kind: "behandlingEtterkontroll", page: 8, section: "Erstatningsregler § 1.5",
      value: "Én nødvendig etterkontroll innen seks måneder etter en dekket behandling eller operasjon.",
    },
    {
      kind: "behandlingReiseutgifter", page: 8, section: "Erstatningsregler § 1.6",
      value: "Dekket reise ved operasjon, bildediagnostikk og spesialistbehandling etter statens pasientreisesatser når vilkårenes avstands- og godkjenningskrav er oppfylt.",
    },
    {
      kind: "behandlingPsykolog", page: 8, section: "Erstatningsregler § 1.8",
      value: "Inntil ti behandlinger per tolvmånedersperiode hos psykolog etter henvisning fra allmennlege.",
    },
    {
      kind: "behandlingKrisehjelp", page: 8, section: "Erstatningsregler § 1.9",
      value: "Inntil ti behandlinger per tolvmånedersperiode ved akutt psykisk krise etter oppført plutselig hendelse. Legehenvisning kreves ikke.",
    },
    {
      kind: "behandlingFysikalsk", page: 8, section: "Erstatningsregler § 1.10",
      value: "Inntil tolv behandlinger per tolvmånedersperiode hos en av de oppførte fysikalske behandlerne. Legehenvisning kreves ikke.",
    },
    {
      kind: "behandlingRehabilitering", page: 8, section: "Erstatningsregler § 1.12 (s. 8–9)",
      value: "Nødvendig rehabilitering i inntil fire uker etter behandling dekket og betalt av Gjensidige, etter det offentliges faglige retningslinjer.",
    },
    {
      kind: "behandlingKompensasjon", page: 9, section: "Erstatningsregler § 4",
      value: "500 kr per påbegynt døgn fra garantitiden utløper til første spesialisttime eller tilgang til sykehus eller klinikk for behandling, i inntil 30 dager.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 9, section: "Erstatningsregler § 2",
      value: "Undersøkelser, behandlinger og operasjoner skal forhåndsgodkjennes av Gjensidige.",
    },
  ],
  "gjensidige-person-liv": [
    {
      kind: "livMottaker", page: 7, section: "Erstatningsregler punkt 2.1–2.2",
      value: "En begunstiget eller panthaver som står i forsikringsbeviset kan ha rett til beløpet. Ellers går utbetalingen til ektefelle eller arvinger etter lov eller testament når avdøde også var forsikringstaker, og til forsikringstakeren når dette er en annen person.",
    },
    {
      kind: "livSelvmord", page: 2, section: "Forsikringsbevis – Livsforsikring",
      value: "Selvmord dekkes hvis det har gått mer enn ett år siden Gjensidiges ansvar begynte, eller hvis det må antas at forsikringen ble tegnet uten tanke på selvmord.",
    },
    {
      kind: "livOpphor", page: 1, section: "Forsikringsoversikt – Livsforsikring",
      value: "Opphørsalder 80 år ifølge forsikringsoversikten.",
    },
    {
      kind: "livSum", page: 7, section: "Erstatningsregler punkt 3",
      value: "Forsikringssummen i beviset på dødsfallstidspunktet legges til grunn. Hvis G-regulering er avtalt, justeres summen hvert år ved hovedforfall i forhold til folketrygdens grunnbeløp.",
    },
    {
      kind: "livHelserad", page: 1, section: "Forsikringsoversikt – Livsforsikring",
      value: "Forsikringsoversikten oppgir Helsehjelp 24/7.",
    },
  ],
  "gjensidige-person-uforekapital": [
    {
      kind: "kapitalMinstegrad", page: 7, section: "Erstatningsregler punkt 2.1–2.2",
      value: "Minst 50 % sammenhengende arbeidsuførhet, vurdert som minst 50 % varig uførhet i ethvert yrke.",
    },
    {
      kind: "kapitalVentetid", page: 7, section: "Erstatningsregler punkt 2.1 og 3.5 (s. 7–8)",
      value: "Minst to år med sammenhengende arbeidsuførhet, med forbehold om reglene for uførhet som fortsetter etter opphør.",
    },
    {
      kind: "kapitalOpphor", page: 1, section: "Forsikringsoversikt og Erstatningsregler punkt 3.5 (s. 1 og 8)",
      value: "Senest 55 år ifølge forsikringsoversikten. Engangsbeløpet kan utbetales dersom forsikrede var minst 50 % arbeidsufør mens avtalen løp, og vilkårene oppfylles av samme årsak innen to år etter opphør.",
    },
    {
      kind: "forskuddMinstegrad", page: 7, section: "Erstatningsregler punkt 1.1",
      value: "Minst 50 % arbeidsuførhet.",
    },
    {
      kind: "forskuddNav", page: 7, section: "Erstatningsregler punkt 1.1 og 1.4",
      value: "Forsikrede må være innvilget arbeidsavklaringspenger eller uføretrygd. Forskudd utbetales så lenge forsikrede mottar en av disse ytelsene og oppfyller uføregraden, innenfor øvrige grenser.",
    },
    {
      kind: "forskuddVarighet", page: 7, section: "Erstatningsregler punkt 1.4",
      value: "Forskudd kan stanse blant annet etter totalt 60 månedsutbetalinger med minst 50 % uførhet. Avtalt sum etter fradrag for utbetalte månedsbeløp utbetales da etter vilkårene.",
    },
    {
      kind: "uforeSymptom", page: 2, section: "Forsikringsbevis – Uførekapital med forskudd",
      value: "Tre måneder fra Gjensidige mottok utfylt og signert helseerklæring. Tilsvarende forsikring som har løpt minst tolv måneder, kan flyttes uten ny symptomklausul for uendret dekning og sum.",
    },
  ],
  "gjensidige-person-uforepensjon": [
    {
      kind: "pensjonMinstegrad", page: 7, section: "Erstatningsregler punkt 1.1–1.3",
      value: "Minst 40 % arbeidsuførhet. Utbetalingen graderes etter uføregraden.",
    },
    {
      kind: "pensjonOpphor", page: 7, section: "Erstatningsregler punkt 1.4",
      value: "Utbetalingene opphører senest ved fylte 67 år.",
    },
    {
      kind: "pensjonPremiefritak", page: 7, section: "Erstatningsregler punkt 2.2",
      value: "Premien betales frem til uførepensjon innvilges. Ved under 100 % uføregrad betales premie for den delen som ikke omfattes av uførheten.",
    },
    {
      kind: "pensjonNav", page: 7, section: "Erstatningsregler punkt 1.1",
      value: "Forsikrede må være innvilget arbeidsavklaringspenger eller uføretrygd, mens forsikringen er i kraft.",
    },
    {
      kind: "uforeSymptom", page: 2, section: "Forsikringsbevis – Uførepensjon",
      value: "Tre måneder fra Gjensidige mottok utfylt og signert helseerklæring. Tilsvarende forsikring som har løpt minst tolv måneder, kan flyttes uten ny symptomklausul for uendret dekning og sum.",
    },
  ],
  "gjensidige-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 2, section: "Forsikringsbevis – behandlingsutgifter",
      value: "Inntil 50 000 kr til tannbehandling eller 15 000 kr til annen behandling i Norden, med 500 kr egenandel. Utgiftene kan dekkes i inntil to år etter skadedagen.",
    },
    {
      kind: "dodsulykke", page: 8, section: "Erstatningsregler § 4.2–4.3",
      value: "5 % av forsikringssummen for invaliditetsdekningen ved dødsfall innen ett år etter ulykkesskaden. Forskudd på invaliditetserstatning for samme skade trekkes fra.",
    },
    {
      kind: "ulykkeGeografi", page: 2, section: "Forsikringsbevis – hvor gjelder forsikringen?",
      value: "Hele verden, normalt i inntil 12 måneder ved utenlandsopphold. Opphold kan vare lenger for studenter, au pairer og ansatte i norske foretak med virksomhet i utlandet.",
    },
    {
      kind: "ulykkeOpphor", page: 1, section: "Forsikringsbevis – opphør",
      value: "Senest ved fylte 80 år.",
    },
  ],
  "if-person-barn-standard": [
    {
      kind: "barnDiagnose", page: 5, section: "§ 5.1 (s. 5–7)",
      value: "Økonomisk førstehjelp ved en oppført diagnose, skade eller gjennomført behandling. Barnet må være i live 24 timer etter forsikringstilfellet. Utbetalingen kan trekkes fra eventuell invaliditetserstatning.",
      document: "barn",
    },
    {
      kind: "barnSykehus", page: 7, section: "§ 5.2",
      value: "1 000 kr per dag ved minst syv sammenhengende dager på sykehus, inntil 365 dager per sykdoms- eller ulykkestilfelle.",
      document: "barn",
    },
    {
      kind: "barnUtgifter", page: 8, section: "§ 5.3",
      value: "Rimelige og nødvendige behandlings- og reiseutgifter i Norden de to første årene etter ulykkesskaden, når de ikke kan dekkes fra annet hold. Utsatt permanent tannbehandling for barn har egne vilkår.",
      document: "barn",
    },
    {
      kind: "barnBoligtilpasning", page: 8, section: "§ 5.5 (s. 8–9)",
      value: "Rimelige og nødvendige bygningsendringer i fast privat bolig ved varig sykdom eller skade. Behov og kostnader må dokumenteres, og utgifter som kan dekkes fra annet hold erstattes ikke.",
      document: "barn",
    },
    {
      kind: "barnDodsfall", page: 10, section: "§ 5.8",
      value: "1 G dersom barnet dør i forsikringstiden.",
      document: "barn",
    },
    {
      kind: "barnSkolerobot", page: 11, section: "§ 5.9.3",
      value: "Leie av AV1 i inntil ett år ved minst 30 dagers skolefravær på grunn av sykdom eller skade. If må godkjenne og bestille leien.",
      document: "barn",
    },
    {
      kind: "barnOpphor", page: 4, section: "§ 4",
      value: "Kan beholdes til fylte 26 år. Tilbud om overgang til voksenforsikringer uten ny helsevurdering ved utgangen av forsikringsåret barnet fyller 26.",
      document: "barn",
    },
    {
      kind: "barnGeografi", page: 4, section: "§§ 2–3",
      value: "Hele verden ved tilknytning til Norge eller Norden og medlemskap i norsk folketrygd. Midlertidig opphold utenfor Norden i inntil 12 måneder, eller lenger for blant annet studenter og enkelte utsendte.",
      document: "barn",
    },
    {
      kind: "barnHjelpestonad", page: 8, section: "§ 5.4",
      value: `${ifChildHelpBenefit} Unntaket for blant annet psykiske lidelser, atferds- og utviklingsforstyrrelser i BAF § 6.1.1 gjelder.`,
      qualification: { document: "barn", page: 11, section: "§ 6.1.1" },
    },
  ],
  "if-person-barn-super": [
    {
      kind: "barnHjelpestonad", page: 8, section: "§ 5.4",
      value: `${ifChildHelpBenefit} For hjelpestønad opphever Super unntaket for blant annet psykiske lidelser, atferds- og utviklingsforstyrrelser i BAF § 6.1.1. Individuelle reservasjoner i forsikringsbeviset gjelder.`,
      document: "barn",
      qualification: { document: "barn-super", page: 4, section: "§ 4.3" },
    },
    {
      kind: "barnDiagnose", page: 5, section: "§ 5.1 (s. 5–7)",
      value: "Økonomisk førstehjelp ved en oppført diagnose, skade eller gjennomført behandling. Barnet må være i live 24 timer etter forsikringstilfellet. Utbetalingen kan trekkes fra eventuell invaliditetserstatning.",
      document: "barn",
    },
    {
      kind: "barnSykehus", page: 7, section: "§ 5.2",
      value: "1 000 kr per dag ved minst syv sammenhengende dager på sykehus, inntil 365 dager per sykdoms- eller ulykkestilfelle.",
      document: "barn",
    },
    {
      kind: "barnUtgifter", page: 8, section: "§ 5.3",
      value: "Rimelige og nødvendige behandlings- og reiseutgifter i Norden de to første årene etter ulykkesskaden, når de ikke kan dekkes fra annet hold. Utsatt permanent tannbehandling for barn har egne vilkår.",
      document: "barn",
    },
    {
      kind: "barnBoligtilpasning", page: 8, section: "§ 5.5 (s. 8–9)",
      value: "Rimelige og nødvendige bygningsendringer i fast privat bolig ved varig sykdom eller skade. Behov og kostnader må dokumenteres, og utgifter som kan dekkes fra annet hold erstattes ikke.",
      document: "barn",
    },
    {
      kind: "barnDodsfall", page: 10, section: "§ 5.8",
      value: "1 G dersom barnet dør i forsikringstiden.",
      document: "barn",
    },
    {
      kind: "barnSkolerobot", page: 11, section: "§ 5.9.3",
      value: "Leie av AV1 i inntil ett år ved minst 30 dagers skolefravær på grunn av sykdom eller skade. If må godkjenne og bestille leien.",
      document: "barn",
    },
    {
      kind: "barnOpphor", page: 4, section: "§ 4",
      value: "Kan beholdes til fylte 26 år. Tilbud om overgang til voksenforsikringer uten ny helsevurdering ved utgangen av forsikringsåret barnet fyller 26.",
      document: "barn",
    },
    {
      kind: "barnGeografi", page: 4, section: "§§ 2–3",
      value: "Hele verden ved tilknytning til Norge eller Norden og medlemskap i norsk folketrygd. Midlertidig opphold utenfor Norden i inntil 12 måneder, eller lenger for blant annet studenter og enkelte utsendte.",
      document: "barn",
    },
  ],
  "if-person-godt-voksen": [
    {
      kind: "seniorBrudd", page: 4, section: "§ 4.2",
      value: "30 000 kr ved brudd som krever operasjon eller minst 24 timers sykehusinnleggelse i forsikringstiden, hvis forsikrede overlever i minst 24 timer etter hendelsen. Inntil tre skadetilfeller i hele avtaleperioden.",
    },
    {
      kind: "seniorSykehus", page: 4, section: "§ 4.3",
      value: "350 kr per døgn fra første døgn, inntil 90 døgn, ved minst tre sammenhengende døgn på offentlig godkjent sykehus i Norden, uansett årsak. Ny innleggelse for samme tilfelle innen 12 måneder regnes som forlengelse.",
    },
  ],
  "if-person-gravid-basis": [
    {
      kind: "gravidDodsfall", page: 4, section: "§ 4.3",
      value: "25 000 kr ved dødsfall hos mor eller barn i forsikringstiden. Dødsfall hos det ventede barnet før svangerskapsuke 26 + 0 gir ingen utbetaling.",
    },
  ],
  "if-person-gravid-super": [
    {
      kind: "gravidUlykke", page: 6, section: "§§ 4.4–4.5",
      value: "Forsikringssum på 2 millioner kr for hver av mor og barn ved varig medisinsk invaliditet etter en dekket ulykke. Dobbel erstatning fra 51 % invaliditet. I svangerskapet må ulykken medføre akutt behov for forløsning for at barnets dekning skal gjelde.",
    },
    {
      kind: "gravidSykehus", page: 6, section: "§§ 4.3–4.3.2",
      value: "1 000 kr per dag i inntil 30 dager ved minst sju sammenhengende dager på offentlig godkjent sykehus i Norden. For mor gjelder det innleggelser i svangerskapet frem til fødselsdagen, for barnet innleggelser før fylte tre måneder.",
    },
    {
      kind: "gravidDodsfall", page: 7, section: "§ 4.6",
      value: "100 000 kr ved dødsfall hos mor eller barn i forsikringstiden. Dødsfall hos det ventede barnet før svangerskapsuke 26 + 0 gir ingen utbetaling.",
    },
    {
      kind: "gravidKrisehjelp", page: 7, section: "§ 4.7.2",
      value: "Inntil ti timer for mor eller barnefar ved akutt psykisk krise som følge av en oppført hendelse i forsikringstiden. Behandlingen skjer i Vertikal Helses psykolognettverk.",
    },
    {
      kind: "gravidHelserad", page: 7, section: "§ 4.7.1",
      value: "Døgnåpen telefonrådgivning fra autorisert helsepersonell om mors og barnets helse, skader og svangerskap.",
    },
  ],
  "if-person-helse": [
    {
      kind: "forsteHelsehjelp", page: 6, section: "§ 6",
      value: "Fristen for første undersøkelse eller behandling står i forsikringsbeviset. Den løper fra Vertikal Helse har mottatt melding, signert fullmakt og nødvendig medisinsk dokumentasjon. Vilkåret har unntak.",
      conditional: true,
    },
    {
      kind: "behandlingAndrevurdering", page: 4, section: "§ 5.7",
      value: "Én ny vurdering etter henvisning. Kan gjelde diagnose stilt av legespesialist eller behandling foreslått eller påbegynt i forsikringstiden.",
    },
    {
      kind: "behandlingRehabilitering", page: 4, section: "§ 5.9",
      value: "Ett rehabiliteringsopphold i inntil fire uker eller dagrehabilitering i inntil 20 virkedager. Det må være direkte følge av behandling som godkjennes etter vilkårene og foreskrevet av legespesialist.",
    },
    {
      kind: "behandlingPsykolog", page: 6, section: "§ 5.16",
      value: "Inntil ti behandlinger i løpet av 12 måneder fra første behandling hos autorisert psykolog i Vertikal Helses nettverk etter henvisning fra lege. Det må gå 12 måneder fra siste dekkede behandling før nye timer kan kreves.",
    },
    {
      kind: "behandlingKrisehjelp", page: 5, section: "§ 5.14",
      value: "Inntil ti timer psykologisk førstehjelp ved oppført plutselig hendelse eller egen alvorlig sykdom som angitt. Behandlingen skal starte i direkte tilknytning til hendelsen, i Vertikal Helses psykolognettverk.",
    },
    {
      kind: "behandlingFysikalsk", page: 5, section: "§ 5.15 (s. 5–6)",
      value: "Fysikalsk behandling kan dekkes når den står i forsikringsbeviset og er medisinsk nødvendig for varig bedring av funksjonsevnen etter sykdom eller skade.",
      conditional: true,
    },
    {
      kind: "behandlingReiseutgifter", page: 4, section: "§ 5.12 (s. 4–5)",
      value: "Rimeligste reisealternativ etter statens pasientreisesatser når reisevei er over 100 km én vei. Reise til fysikalsk behandling eller psykolog er unntatt.",
    },
    {
      kind: "behandlingEtterkontroll", page: 3, section: "§ 5.6 (s. 3–4)",
      value: "Nødvendige etterkontroller og behandling for samme diagnose inngår i inntil ni måneder fra dekket primærbehandling starter.",
    },
    {
      kind: "behandlingKompensasjon", page: 6, section: "§ 6",
      value: "600 kr per virkedag fra garantifristens utløp til undersøkelse eller behandling starter, inntil 30 virkedager.",
    },
    {
      kind: "behandlingEgenandel", page: 9, section: "§ 9",
      value: "Forsikringsbeviset viser om egenandel er avtalt.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 3, section: "§ 5.3",
      value: "Alle kostnader til utredning og behandling skal være skriftlig forhåndsgodkjent av Vertikal Helse.",
    },
  ],
  "if-person-kritisk": [
    {
      kind: "sykdomKreft", page: 5, section: "Punkt 5 a",
      value: "Kreft i ICD-10 kodegruppe C med unntakene i vilkåret. Forstadier og hud- eller leppekreft er unntatt. Ondartet føflekkreft omfattes.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 6, section: "Punkt 5 f – Hjerteinfarkt",
      value: "Typisk økning i hjertemarkører og EKG-forandringer som ved ferskt infarkt. Diagnosen må stilles på kardiologisk eller indremedisinsk sykehusavdeling.",
    },
    {
      kind: "sykdomHjerneslag", page: 5, section: "Punkt 5 c",
      value: "CT- eller MR-bekreftet hjerneblødning eller hjerneinfarkt med nevrologiske utfall som fortsatt er til stede ved utskrivning. Ved langvarig opphold kan erstatningen utbetales etter 14 dager hvis nødvendig dokumentasjon foreligger.",
    },
    {
      kind: "sykdomMs", page: 6, section: "Punkt 5 j",
      value: "Sikker diagnose etter retningslinjene i Norsk elektronisk legehåndbok, tilsvarende ICD-10 G35. Nevrolog må fastslå diagnosen og behandlingsbehovet.",
    },
    {
      kind: "sykdomOverlevelse", page: 3, section: "Punkt 4.1",
      value: "Forsikrede må være i live 24 timer etter forsikringstilfellet.",
    },
    {
      kind: "sykdomKarenstid", page: 8, section: "Punkt 6.1",
      value: "Sykdom påvist eller med tegn eller symptomer i de første 90 dagene etter at If mottok fullstendig helseerklæring, er unntatt. For godkjent, tilsvarende forsikring med utløpt karenstid ved flytting gjelder begrensningen bare eventuell økning av forsikringssummen. Utvidelser eller forhøyelser kan utløse ny karenstid for den nye delen.",
    },
    {
      kind: "sykdomOpphor", page: 3, section: "Punkt 3",
      value: "Ut forsikringsåret der forsikrede fyller 67 år. En eventuell uføredekning opphører ved utgangen av forsikringsåret der forsikrede fyller 60 år.",
    },
    {
      kind: "sykdomGjentakelse", page: 4, section: "Punkt 4.1",
      value: "Én utbetaling per bokstavgruppe. En sykdom eller hendelse som faller inn under flere grupper, gir bare én utbetaling.",
    },
    {
      kind: "sykdomKrisepsykolog", page: 4, section: "Punkt 4.3.1",
      value: "Inntil 10 timer psykologisk førstehjelp blant annet ved egen alvorlig sykdom eller skade som står i vilkårene. Hjelpen må starte i direkte tilknytning til hendelsen.",
    },
    {
      kind: "sykdomUfore", page: 4, section: "Punkt 4.2",
      value: "Hvis uføredekning er avtalt, kan en dekket kritisk sykdom gi en engangsutbetaling ved minst 40 % sammenhengende arbeidsuførhet i to år, når uførheten vurderes som varig. Utbetalingen graderes etter vilkårene.",
      addOn: "Uførhet som følge av kritisk sykdom",
      conditional: true,
    },
  ],
  "if-person-liv": [
    {
      kind: "livMottaker", page: 4, section: "Punkt 6.3 (s. 4–5)",
      value: "Forsikringstaker kan avtale begunstigelse med If, også for samboer. Uten slikt valg går beløpet som hovedregel til forsikringstakeren, eller til ektefelle, registrert partner eller arvinger etter lov eller testament hvis avdøde var forsikringstakeren.",
    },
    {
      kind: "livSelvmord", page: 4, section: "Punkt 5.1",
      value: "Forsikringen dekker ikke selvmord innen ett år fra ikrafttredelsen dersom det må antas at den ble tegnet med tanke på selvmord.",
    },
    {
      kind: "livOpphor", page: 3, section: "Punkt 3",
      value: "Ut forsikringsåret der forsikrede fyller 80 år.",
    },
    {
      kind: "livSum", page: 3, section: "Punkt 4.1",
      value: "Ved fornyelse G-reguleres summen til og med forsikringsåret der forsikrede fyller 50 år. Ved hver fornyelse etter fylte 60 år reduseres summen med 10 % av forrige forsikringsårs sum.",
    },
    {
      kind: "livHelserad", page: 3, section: "Punkt 4.2",
      value: "Husstanden har tilgang til døgnåpen medisinsk telefonrådgivning med autorisert helsepersonell.",
    },
    {
      kind: "livPsykolog", page: 3, section: "Punkt 4.3 (s. 3–4)",
      value: "Inntil 10 timer akutthjelp ved psykisk reaksjon hos ektefelle, samboer eller barn etter forsikredes dødsfall. Behandlingen må starte i direkte tilknytning til dødsfallet.",
    },
  ],
  "if-person-uforepensjon": [
    {
      kind: "pensjonMinstegrad", page: 3, section: "Punkt 4.1",
      value: "Minst 40 % sammenhengende arbeidsuførhet. Uførepensjonen opprettholdes så lenge uføregraden er minst 40 % av en dekket årsak.",
    },
    {
      kind: "pensjonKarenstid", page: 5, section: "Punkt 6.4",
      value: "Tolv måneder sammenhengende arbeidsuførhet etter fylte 18 år. Samme årsak innen seks måneder etter siste friskmelding kan gi ny pensjon uten ny ventetid.",
    },
    {
      kind: "pensjonOpphor", page: 5, section: "Punkt 6.4",
      value: "Senest ved fylte 67 år eller tidligere dødsfall.",
    },
    {
      kind: "uforeSymptom", page: 4, section: "Punkt 5.1",
      value: "90 dager fra If mottar fullstendig helseerklæring. Tolv måneder for psykiske lidelser, rusmiddelavhengighet, utmattelsestilstander, muskel- eller skjelettlidelser, migrene og hodesmertelidelser. For godkjent, tilsvarende forsikring med utløpt karenstid ved flytting gjelder begrensningen bare eventuell økning av forsikringssummen.",
    },
  ],
  "if-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 5, section: "§ 5.2",
      value: "Rimelige og nødvendige behandlings- og reiseutgifter i Norden de to første årene. Refusjon for utgifter som ikke dekkes fra andre. Utsatt permanent tannbehandling for barn kan refunderes etter forhåndsgodkjenning.",
      conditional: true,
    },
    {
      kind: "dodsulykke", page: 5, section: "Dekningsoversikt (s. 2), § 5.3 og § 7.2.3 (s. 8)",
      value: "Ulykkesskade som fører til dødsfall innen to år. Ved avtalt invaliditetsdekning er dødsfallssummen minst 100 000 kr. Særskilt avtalt dødsfallsdekning følger summen i forsikringsbeviset.",
      conditional: true,
    },
    {
      kind: "ulykkeProgressiv", page: 5, section: "§ 5.1, Dobbel erstatning",
      value: "Tilvalg til invaliditetsdekningen. Dobbel erstatning ved minst 51 % medisinsk invaliditet frem til utløpet av forsikringsåret forsikrede fyller 70 år.",
      addOn: "Dobbel erstatning",
    },
    {
      kind: "ulykkeKrisehjelp", page: 5, section: "Dekningsoversikt (s. 2) og § 5.4",
      value: "Ved avtalt invaliditetsdekning gis inntil ti behandlinger per hendelse ved en akutt psykisk krise etter alvorlig ulykke eller annen plutselig og uforutsett hendelse. Hjelpen formidles gjennom Psykologvakten. Behovet må meldes innen 12 måneder.",
      conditional: true,
    },
    {
      kind: "ulykkeGeografi", page: 3, section: "§§ 2–3",
      value: "Hele verden. Bosted i utlandet tillates i inntil tre år når medlemskapet i norsk folketrygd opprettholdes.",
    },
    {
      kind: "ulykkeOpphor", page: 3, section: "§ 4",
      value: "Kan fornyes hvert år så lenge forsikrede lever.",
    },
    {
      kind: "ulykkeArbeid", page: 3, section: "§ 4 og § 4.2 (s. 4)",
      value: "Hele døgnet for personer uten yrkesaktivitet og for lavrisikoyrker. Ved forhøyet yrkesrisiko gjelder den som hovedregel i fritiden. Enkelte yrkesaktiviteter er unntatt.",
    },
  ],
  "klp-person-alvorlige-sykdommer": [
    {
      kind: "sykdomKreft", page: 4, section: "Erstatningsbestemmelser – Kreft",
      value: "Ondartede svulster, blant annet leukemi og ondartet lymfekreft, bekreftet med vevsprøve. Hud- og leppekreft er unntatt, med unntak for ondartet føflekkreft. Vilkåret har også egne unntak for forstadier og andre svulster.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 5, section: "Erstatningsbestemmelser – Hjerteinfarkt",
      value: "Skade på hjertemuskelen som følge av svikt i blodtilførselen, bekreftet med ferske EKG-forandringer og økning i hjertemarkører. Typiske brystsmerter kan være tilleggskriterium.",
    },
    {
      kind: "sykdomHjerneslag", page: 5, section: "Erstatningsbestemmelser – Hjerneslag",
      value: "Rask utvikling innen 72 timer og tegn på permanent skade bekreftet av lege tidligst seks uker etter hendelsen. Hjerneblødning, blødning mellom hjernehinnene eller hjerneinfarkt må bekreftes med CT eller MR.",
    },
    {
      kind: "sykdomMs", page: 4, section: "Erstatningsbestemmelser – Multippel sklerose (s. 4–5)",
      value: "Diagnose fra nevrolog med nevrologiske utfall i mer enn seks måneder eller minst ett tilbakefall. Øvrige diagnosevilkår følger av oppgjørsreglene.",
    },
    {
      kind: "sykdomOverlevelse", page: 4, section: "Erstatningsbestemmelser – Alvorlige sykdommer",
      value: "Forsikrede må være i live 30 dager etter endelig diagnose, gjennomført operasjon eller registrering på venteliste når vilkåret åpner for det.",
    },
    {
      kind: "sykdomKarenstid", page: 8, section: "Generelle begrensninger – Symptomklausul",
      value: "Sykdom påvist eller med symptomer i de første tre månedene etter at helseerklæringen ble signert og sendt, er unntatt. Tilsvarende dekning og sum kan unntas fra klausulen ved flytting hvis den tidligere forsikringen var betalt og hadde løpt minst 12 måneder.",
    },
    {
      kind: "sykdomOpphor", page: 6, section: "Aldersreduksjon og opphør av forsikringen",
      value: "Senest 31. desember det året forsikrede fyller 67 år.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 6, section: "Aldersreduksjon og opphør av forsikringen",
      value: "Én utbetaling. Forsikringen opphører etter utbetalingen.",
    },
  ],
  "klp-person-barn": [
    {
      kind: "barnOpphor", page: 1, section: "Hvem forsikringen gjelder for",
      value: "Til og med 31. desember i året barnet fyller 26.",
    },
    {
      kind: "barnGeografi", page: 1, section: "Hvor forsikringen gjelder",
      value: "Norden og utenlandsopphold utenfor Norden i inntil 12 måneder. Vilkårene har unntak for lengre opphold for blant annet studenter, au pairer og ansatte i norsk firma eller utenrikstjenesten.",
    },
  ],
  "klp-person-barn-maks": [
    {
      kind: "barnOpphor", page: 1, section: "Hvem forsikringen gjelder for",
      value: "Til og med 31. desember i året barnet fyller 26.",
    },
    {
      kind: "barnGeografi", page: 1, section: "Hvor forsikringen gjelder",
      value: "Norden og utenlandsopphold utenfor Norden i inntil 12 måneder. Vilkårene har unntak for lengre opphold for blant annet studenter, au pairer og ansatte i norsk firma eller utenrikstjenesten.",
    },
  ],
  "klp-person-liv": [
    {
      kind: "livMottaker", page: 1, section: "Hva dekkes – Dødsfall",
      value: "En oppnevnt begunstiget mottar erstatningen. Ellers gjelder reglene om ektefelle og arvinger etter lov eller testament.",
    },
    {
      kind: "livSelvmord", page: 8, section: "Generelle begrensninger – Selvmord",
      value: "Selvmord eller forsøk i det første året etter avtaleinngåelsen dekkes hvis det må antas at forsikringen ble kjøpt uten tanke på hendelsen.",
    },
    {
      kind: "livOpphor", page: 4, section: "Dødsfall – Aldersreduksjon og opphør",
      value: "Senest 31. desember det året forsikrede fyller 80 år.",
    },
    {
      kind: "livSum", page: 4, section: "Indeksregulering og Dødsfall – Aldersreduksjon",
      value: "Årlig regulering etter økning i folketrygdens grunnbeløp opphører ved fylte 55 år. Summen reduseres med 10 % per år fra året forsikrede fyller 60 år.",
    },
  ],
  "klp-person-spedbarn": [
    {
      kind: "barnOpphor", page: 1, section: "Hvor og når forsikringen gjelder",
      value: "Seks måneder etter avtaleinngåelse og senest når barnet er ni måneder.",
    },
    {
      kind: "barnGeografi", page: 1, section: "Hvor og når forsikringen gjelder",
      value: "Norge og midlertidig utenlandsopphold i avtaleperioden.",
    },
  ],
  "klp-person-ufore": [
    {
      kind: "pensjonMinstegrad", page: 2, section: "Hva dekkes – Uførepensjon",
      value: "Minst 50 % sammenhengende arbeidsuførhet.",
    },
    {
      kind: "pensjonKarenstid", page: 2, section: "Uførepensjon (s. 2 og 7)",
      value: "Mer enn tolv måneder med sammenhengende arbeidsuførhet. Ny uførhet av samme årsak innen seks måneder kan gi utbetaling uten ny ventetid.",
    },
    {
      kind: "pensjonOpphor", page: 7, section: "Uførepensjon – Opphør av forsikringen",
      value: "Ved avtalt dato, senest ved fylte 67 år.",
    },
    {
      kind: "pensjonPremiefritak", page: 2, section: "Hva dekkes – Uførepensjon",
      value: "Premiefritak mens uførepensjonen mottas, fra den første i måneden etter at ventetiden er utløpt.",
    },
    {
      kind: "uforeSymptom", page: 8, section: "Generelle begrensninger – Symptomklausul",
      value: "Tre måneder fra helseerklæringen ble signert og sendt. Tilsvarende dekning og sum kan unntas ved flytting hvis den tidligere forsikringen var betalt og løp i minst tolv måneder.",
    },
  ],
  "klp-person-ulykke": [
    {
      kind: "ulykkeGeografi", page: 1, section: "Fritidsulykke",
      value: "Norge og utenlandsopphold i inntil 12 måneder. Norske statsborgere kan være dekket ved lengre utenlandsopphold når medlemskapet i norsk folketrygd opprettholdes.",
    },
    {
      kind: "ulykkeArbeid", page: 2, section: "Hva dekkes og hva dekkes ikke?",
      value: "Dekker fritidsulykker. Ulykker under yrkesaktivitet eller på arbeid er unntatt, men skade ved bygging og vedlikehold av egen bolig eller fritidsbolig dekkes.",
    },
    {
      kind: "ulykkeOpphor", page: 5, section: "Opphør av forsikringen – Fritidsulykke",
      value: "Ved utløpet av det året forsikrede fyller 75 år.",
    },
  ],
  "klp-person-ulykke-maks": [
    {
      kind: "ulykkeGeografi", page: 1, section: "Fritidsulykke",
      value: "Norge og utenlandsopphold i inntil 12 måneder. Norske statsborgere kan være dekket ved lengre utenlandsopphold når medlemskapet i norsk folketrygd opprettholdes.",
    },
    {
      kind: "ulykkeArbeid", page: 2, section: "Hva dekkes og hva dekkes ikke?",
      value: "Dekker fritidsulykker. Ulykker under yrkesaktivitet eller på arbeid er unntatt, men skade ved bygging og vedlikehold av egen bolig eller fritidsbolig dekkes.",
    },
    {
      kind: "ulykkeOpphor", page: 5, section: "Opphør av forsikringen – Fritidsulykke",
      value: "Ved utløpet av det året forsikrede fyller 75 år.",
    },
  ],
  "landkreditt-person-barn": [
    {
      kind: "barnOpphor", page: 13, section: "§ 15",
      value: "Første hovedforfall etter fylte 26 år. Dagpenger ved sykehusopphold og utvidet hjelpestønad opphører ved første hovedforfall etter fylte 20 år.",
    },
    {
      kind: "barnGeografi", page: 3, section: "§ 2",
      value: "Norden og utenlandsopphold utenfor Norden i inntil 12 måneder. Vilkårene har unntak for lengre opphold for blant annet studenter, au pairer og ansatte i norsk firma eller utenrikstjenesten.",
    },
  ],
  "landkreditt-person-barn-ulykke": [
    {
      kind: "barnOpphor", page: 8, section: "§ 8",
      value: "Senest ved første hovedforfall etter fylte 20 år.",
    },
    {
      kind: "barnGeografi", page: 3, section: "§ 2",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Vilkårene har unntak for lengre opphold, men ikke over fire år for studenter og au pairer.",
    },
  ],
  "landkreditt-person-behandling": [
    {
      kind: "behandlingBilder", page: 5, section: "§ 7.1",
      value: "Rimelige og nødvendige utgifter til røntgen og bildediagnostikk i privat spesialisthelsetjeneste, med forhåndsgodkjenning fra Falck.",
    },
    {
      kind: "behandlingAndrevurdering", page: 5, section: "§ 7.2",
      value: "Én ny spesialistvurdering per diagnose ved livstruende sykdom eller skade eller særlig risikofylt behandling. Krever henvisning fra lege.",
    },
    {
      kind: "behandlingRehabilitering", page: 5, section: "§ 7.3",
      value: "Inntil fire uker hos fysikalsk behandler eller institusjonsopphold i inntil 14 dager etter dekket operasjon. Det kreves medisinsk behov, forskrivning fra behandlende spesialist og forhåndsgodkjenning fra Falck.",
    },
    {
      kind: "behandlingFysikalsk", page: 5, section: "§ 7.4",
      value: "Det avtalte antallet behandlinger fremgår av forsikringsbeviset og gjelder perioden på 12 måneder fra saken meldes. Behandler må være autorisert. Legehenvisning kreves ikke.",
    },
    {
      kind: "behandlingReiseutgifter", page: 5, section: "§ 7.6 (s. 5–6)",
      value: "Forhåndsgodkjent reise over 150 km én vei til nærmeste tilbudte behandlingssted, etter pasientreisesatsene. Reise til fysikalsk behandling eller psykolog dekkes ikke.",
    },
    {
      kind: "behandlingPsykolog", page: 6, section: "§ 7.8",
      value: "Når dekningen fremgår av forsikringsbeviset, gis inntil ti behandlinger i løpet av 12 måneder fra saken meldes, hos autorisert psykolog etter henvisning fra lege.",
      conditional: true,
    },
    {
      kind: "behandlingKrisehjelp", page: 6, section: "§ 7.9",
      value: "Inntil ti timer hos autorisert psykolog for akutt psykisk reaksjon etter en oppført plutselig og uforutsett hendelse.",
    },
    {
      kind: "behandlingKompensasjon", page: 4, section: "§ 6.3",
      value: "500 kr per virkedag fra garantifristen utløper til konsultasjon, undersøkelse eller behandling starter, i inntil 30 virkedager. Falck må varsles innen 20 virkedager dersom fristen ikke holdes.",
    },
    {
      kind: "behandlingEgenandel", page: 7, section: "§ 10",
      value: "Forsikringsbeviset viser om egenandel er avtalt og hvor stor den er.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 4, section: "§ 6.2 (forts.)",
      value: "Falck skal skriftlig forhåndsgodkjenne alle konsultasjoner, undersøkelser og behandlinger.",
    },
  ],
  "landkreditt-person-kritisk": [
    {
      kind: "sykdomKreft", page: 3, section: "Punkt 6.1 (s. 3–4)",
      value: "Ondartede svulster, inkludert leukemi, lymfekreft og ondartet føflekkreft. Som hovedregel kreves bekreftelse ved vevsundersøkelse. Vilkåret har egne unntak for blant annet forstadier.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 4, section: "Punkt 6.6 – Hjerteinfarkt",
      value: "Diagnose på grunnlag av typisk økning i hjertemarkører og EKG-forandringer som ved ferskt hjerteinfarkt.",
    },
    {
      kind: "sykdomHjerneslag", page: 5, section: "Punkt 6.8",
      value: "Hjerneblødning eller hjerneinfarkt som følge av sykdom, med varige nevrologiske utfall, bekreftende CT- eller MR-funn og spesialistbekreftelse.",
    },
    {
      kind: "sykdomMs", page: 4, section: "Punkt 6.3",
      value: "Typiske symptomer og sikre funn ved klinisk undersøkelse. Symptomene må vare over seks måneder eller sykdomsmodifiserende behandling må være igangsatt.",
    },
    {
      kind: "sykdomOverlevelse", page: 3, section: "Punkt 4",
      value: "Forsikringstaker må være i live 30 dager etter endelig diagnose eller gjennomført operasjon.",
    },
    {
      kind: "sykdomKarenstid", page: 3, section: "Punkt 5.5",
      value: "Sykdom som er påvist eller har vist tegn eller symptomer i de første tre månedene etter at en fullstendig helseerklæring ble signert og sendt, er unntatt. Ved senere utvidelse gjelder klausulen tilsvarende for ny dekning.",
    },
    {
      kind: "sykdomOpphor", page: 9, section: "Punkt 14",
      value: "Senest ved første hovedforfall etter at forsikringstaker fyller 67 år.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 9, section: "Punkt 14",
      value: "Én utbetaling. Forsikringen opphører etter utbetalingen.",
    },
  ],
  "landkreditt-person-liv": [
    {
      kind: "livMottaker", page: 4, section: "Punkt 6.5",
      value: "En begunstiget går foran ektefelle. Uten ektefelle eller begunstiget går beløpet til arvinger etter lov eller testament. Samboeren må være begunstiget for å motta beløpet som samboer.",
    },
    {
      kind: "livSelvmord", page: 3, section: "Punkt 5.1",
      value: "Ved selvmord eller forsøk ytes erstatning dersom ansvaret har løpt i mer enn ett år, eller det må antas at forsikringen ble tegnet eller utvidet uten tanke på selvmord.",
    },
    {
      kind: "livOpphor", page: 5, section: "Punkt 9",
      value: "Alderen står i forsikringsbeviset. Seneste opphør er første hovedforfall etter fylte 80 år.",
    },
  ],
  "landkreditt-person-ufore": [
    {
      kind: "kapitalMinstegrad", page: 5, section: "Punkt 7.2",
      value: "Minst 50 % sammenhengende arbeidsuførhet som vurderes som minst 50 % varig. Vilkåret sier at arbeidsevnen ikke anses varig nedsatt ved innvilgede arbeidsavklaringspenger, og har en særregel om fem års sammenhengende arbeidsuførhet.",
    },
    {
      kind: "kapitalVentetid", page: 5, section: "Punkt 7.2",
      value: "Minst to år fra første dag i siste sammenhengende sykmeldingsperiode som fører til varig arbeidsuførhet.",
    },
    {
      kind: "kapitalOpphor", page: 5, section: "Punkt 9, jf. punkt 5.3 (s. 3 og 5)",
      value: "Alder står i forsikringsbeviset, senest første hovedforfall etter fylte 62 år. Minst 50 % sammenhengende uførhet ved opphør kan gi utbetaling hvis den vurderes som varig av samme årsak innen to år.",
    },
    {
      kind: "uforeSymptom", page: 3, section: "Punkt 4 a",
      value: "Uførhet som skyldes skade eller sykdom som har vist symptomer før tre måneder etter at forsikringen ble satt i kraft, dekkes ikke.",
    },
  ],
  "landkreditt-person-ulykke": [
    {
      kind: "ulykkeGeografi", page: 3, section: "§ 2",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Ved bestemte utenlandsopphold kan dekningen vare lenger. For studenter og au pairer er grensen fire år.",
    },
    {
      kind: "ulykkeOpphor", page: 9, section: "§ 8",
      value: "Ved første hovedforfall etter fylte 75 år.",
    },
  ],
  "storebrand-person-barn-standard": [
    {
      kind: "barnUtgifter", page: 16, section: "§ H.3.1–H.3.2",
      value: "Behandlingsutgifter i inntil to år etter en ulykkesskade. Erstatningsgrensen står i forsikringsbeviset og egenandelen er 1 000 kr per ulykkestilfelle. Første permanente tannbehandling kan dekkes senere etter særregler.",
    },
    {
      kind: "barnDiagnose", page: 10, section: "§ F.1",
      value: "Utbetaling én gang per oppført sykdom eller tilstand. Ved første fornyelse etter fylte 18 år erstattes dekningen av gjeldende vilkår for kritisk sykdom.",
    },
    {
      kind: "barnKapital", page: 17, section: "§ I.3.1–I.3.2",
      value: "Engangsutbetaling ved minst 40 % sammenhengende arbeidsuførhet i minst fire år, vurdert varig, og innvilget uføretrygd fra NAV. Tidligst ved fylte 25 år.",
    },
    {
      kind: "barnSykehus", page: 6, section: "§ C.1 og C.3 (s. 6–7)",
      value: "Avtalt dagbeløp fra første døgn ved minst syv sammenhengende døgn ved offentlig godkjent sykehus i Norden. Inntil 365 netter for samme sykdom eller ulykke. Opphører ved første fornyelse etter fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 7, section: "§ D.1–D.3 (s. 7–8)",
      value: "Nødvendig ombygging av fast bosted ved sykdom eller ulykke etter vilkårene. Dekningen opphører ved første fornyelse etter fylte 18 år.",
    },
    {
      kind: "barnDodsfall", page: 19, section: "§ L.1–L.2",
      value: "Avtalt erstatning ved dødsfall. Dekningen opphører ved første fornyelse etter fylte 89 år.",
    },
    {
      kind: "barnOpphor", page: 2, section: "§ A.1 (dekningstabell)",
      value: "Opphør varierer med dekningen. Sykehusdagpenger, ombygging av bolig og medisinsk invaliditet ved sykdom opphører ved 18 år. Ulykkesytelser og uførekapital har opphørsalder 60 år, livsforsikring 89 år.",
    },
    {
      kind: "barnHjelpestonad", page: 2, section: "§ A.1 (dekningstabell)",
      value: "Utvidet hjelpestønad inngår ikke i Standard.",
      unavailable: true,
    },
    {
      kind: "barnPensjon", page: 2, section: "§ A.1 (dekningstabell)",
      value: "Uførepensjon inngår ikke i Standard.",
      unavailable: true,
    },
  ],
  "storebrand-person-barn-super": [
    {
      kind: "barnUtgifter", page: 16, section: "§ H.3.1–H.3.2",
      value: "Behandlingsutgifter i inntil to år etter en ulykkesskade. Erstatningsgrensen står i forsikringsbeviset og egenandelen er 1 000 kr per ulykkestilfelle. Første permanente tannbehandling kan dekkes senere etter særregler.",
    },
    {
      kind: "barnDiagnose", page: 10, section: "§ F.1",
      value: "Utbetaling én gang per oppført sykdom eller tilstand. Ved første fornyelse etter fylte 18 år erstattes dekningen av gjeldende vilkår for kritisk sykdom.",
    },
    {
      kind: "barnKapital", page: 17, section: "§ I.3.1–I.3.2",
      value: "Engangsutbetaling ved minst 40 % sammenhengende arbeidsuførhet i minst fire år, vurdert varig, og innvilget uføretrygd fra NAV. Tidligst ved fylte 25 år.",
    },
    {
      kind: "barnSykehus", page: 6, section: "§ C.1 og C.3 (s. 6–7)",
      value: "Avtalt dagbeløp fra første døgn ved minst syv sammenhengende døgn ved offentlig godkjent sykehus i Norden. Inntil 365 netter for samme sykdom eller ulykke. Opphører ved første fornyelse etter fylte 18 år.",
    },
    {
      kind: "barnBoligtilpasning", page: 7, section: "§ D.1–D.3 (s. 7–8)",
      value: "Nødvendig ombygging av fast bosted ved sykdom eller ulykke etter vilkårene. Dekningen opphører ved første fornyelse etter fylte 18 år.",
    },
    {
      kind: "barnDodsfall", page: 19, section: "§ L.1–L.2",
      value: "Avtalt erstatning ved dødsfall. Dekningen opphører ved første fornyelse etter fylte 89 år.",
    },
    {
      kind: "barnOpphor", page: 2, section: "§ A.1 (dekningstabell)",
      value: "Opphør varierer med dekningen. Sykehusdagpenger, ombygging av bolig og medisinsk invaliditet ved sykdom opphører ved 18 år. Ulykkesytelser og uførekapital har opphørsalder 60 år, livsforsikring 89 år.",
    },
    {
      kind: "barnHjelpestonad", page: 9, section: "§ E.1–E.3",
      value: "Utbetaling etter vedtak om hjelpestønad fra NAV, avhengig av sats og avtalt beløp. Inntil fem år, med toårsgrense for oppførte tilstander, og opphør ved første fornyelse etter fylte 18 år.",
    },
  ],
  "storebrand-person-gravid": [
    {
      kind: "gravidUlykke", page: 6, section: "§ E (s. 6–8)",
      value: "Gradert erstatning ved varig medisinsk invaliditet hos barnet fra 1 % etter en dekket ulykkesskade. Forsikringssummen er inntil 500 000 kr.",
    },
    {
      kind: "gravidDodsfall", page: 6, section: "§ D.2 og § A.2 (s. 3), jf. dekningsoversikten (s. 1)",
      value: "50 000 kr ved barnets dødsfall etter dekket ulykke. Ved kjøp under graviditeten kan det gis 25 000 kr ved dødfødsel eller barnets dødsfall som skyldes fødselskomplikasjon eller sykdom innen fire uker etter fødsel. Ytelsene kan ikke kombineres.",
    },
    {
      kind: "gravidUlykkesutgifter", page: 9, section: "§§ F.2–F.5",
      value: "Barnets nødvendige behandlingsutgifter etter en dekket ulykke kan refunderes innenfor vilkårets grenser, mot originalkvitteringer. Egenandel 1 000 kr per ulykkestilfelle.",
    },
    {
      kind: "gravidKrisehjelp", page: 4, section: "§§ B.2–B.3",
      value: "Inntil 10 000 kr samlet til psykologisk førstehjelp for foreldrene dersom barnet dør av sykdom eller ulykke. Behandling hos psykolog i Norge, mot originalkvitteringer. Behandlingsutgiftene må meldes innen 12 måneder etter siste konsultasjon.",
    },
  ],
  "storebrand-person-helse": [
    {
      kind: "behandlingAndrevurdering", page: 3, section: "§ 1.5.2",
      value: "Én ny vurdering hos legespesialist per forsikringstilfelle ved livstruende sykdom eller skade, eller særlig risikofylt behandling.",
    },
    {
      kind: "behandlingKrisehjelp", page: 3, section: "§ 1.5.1",
      value: "Inntil ti behandlinger per hendelse ved oppført akutt hendelse. Må forhåndsgodkjennes. Dekningen omfatter også ektefelle, registrert partner og barn under 26 år.",
    },
    {
      kind: "behandlingReiseutgifter", page: 4, section: "§ 1.5.3",
      value: "Forhåndsgodkjente nødvendige reiser ved sykehusinnleggelse, operasjon, kreftbehandling eller rehabilitering. Spesialistbehandling krever over 150 km reisevei én vei. Fysikalsk behandling er unntatt.",
    },
    {
      kind: "behandlingRehabilitering", page: 2, section: "Dekningsoversikten · Rehabilitering",
      value: "Inntil 14 døgn på rehabiliteringsinstitusjon i Norden som nødvendig og direkte følge av operasjon eller innleggelse. Lege må henvise og ERGO forhåndsgodkjenne.",
    },
    {
      kind: "behandlingFysikalsk", page: 15, section: "Spesielle vilkår 03.06.01 § 2, jf. dekningsoversikten (s. 2)",
      value: "Når fysikalsk behandling står i forsikringsbeviset, dekkes medisinsk nødvendig, forhåndsgodkjent behandling hos en av de oppførte behandlerne. Antall timer og eventuell egenandel står i beviset.",
      conditional: true,
    },
    {
      kind: "behandlingPsykolog", page: 2, section: "Dekningsoversikten · Utgifter til behandling hos psykolog",
      value: "Når psykologdekning fremgår av forsikringsbeviset, kan det dekkes inntil tolv konsultasjoner per tilfelle for lettere psykiske lidelser. Legehenvisning og forhåndsgodkjenning kan kreves.",
      conditional: true,
    },
    {
      kind: "behandlingKompensasjon", page: 7, section: "§ 10.5",
      value: "500 kr per dag fra garantitiden utløper til behandling tilbys, i inntil 30 dager.",
    },
  ],
  "storebrand-person-kritisk": [
    {
      kind: "sykdomKreft", page: 3, section: "Punkt A.1.3",
      value: "Ondartet svulst, leukemi eller ondartet lymfekreft med histologisk bekreftelse. Unntakene følger av kreftpunktet i vilkåret.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 3, section: "Punkt A.1.1 – Hjerteinfarkt",
      value: "Skade i hjertemuskelen på grunn av sviktende blodtilførsel. Ferske EKG-forandringer og økning i hjertemarkører er påkrevd. Typiske brystsmerter kan være tilleggskriterium.",
    },
    {
      kind: "sykdomHjerneslag", page: 3, section: "Punkt A.1.2",
      value: "Akutt hjerneblødning eller hjerneinfarkt med nevrologiske utfall etter 24 timer. Også akutt blødning eller infarkt i ryggmargen kan omfattes etter samme punkt. Kortvarige utfall og blødning fra ytre skade er unntatt.",
    },
    {
      kind: "sykdomMs", page: 4, section: "Punkt A.1.5",
      value: "Diagnose fra nevrolog, med undersøkelser som utelukker andre sykdommer. Typiske symptomer og karakteristiske MR-funn kreves.",
    },
    {
      kind: "sykdomOverlevelse", page: 7, section: "Punkt A.2",
      value: "Forsikrede må være i live 24 timer etter endelig diagnose, gjennomført operasjon eller registrering på norsk venteliste for transplantasjon.",
    },
    {
      kind: "sykdomKarenstid", page: 7, section: "Punkt A.2 a",
      value: "Sykdom påvist eller med tegn eller symptomer innen tre måneder etter signert forsikringssøknad er unntatt. Ved flytting av tilsvarende forsikring som løp minst 12 måneder, gjelder klausulen bare utvidelser eller økt sum.",
    },
    {
      kind: "sykdomOpphor", page: 7, section: "Punkt A.3",
      value: "Senest 31. desember det året forsikrede fyller 67 år.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 7, section: "Punkt A.3",
      value: "Forsikringen opphører etter utbetaling for en diagnose på sykdomslisten. Utbetaling bare for langvarig sykehusopphold avslutter i seg selv ikke forsikringen.",
    },
    {
      kind: "sykdomSykehus", page: 7, section: "Punkt A.1.27",
      value: "Engangsbeløp på 50 000 kr ved minst 60 sammenhengende døgn på offentlig godkjent sykehus i Norden etter sykdom eller ulykke. Utbetales én gang og bare dersom det ikke alt er innvilget erstatning for en sykdom under A.1.1–A.1.25.",
    },
  ],
  "storebrand-person-liv": [
    {
      kind: "livMottaker", page: 2, section: "Punkt A.2",
      value: "En særskilt oppnevnt begunstiget mottar forsikringssummen. Uten slik oppnevning fordeles summen etter forsikringsavtaleloven § 15-1.",
    },
    {
      kind: "livSelvmord", page: 2, section: "Punkt A.1.2",
      value: "Selvmord dekkes etter mer enn ett år fra ansvaret begynte å løpe, eller hvis forsikringen antas tegnet uten tanke på selvmord. Ettårsfristen regnes fra første tegning av dekningen.",
    },
    {
      kind: "livOpphor", page: 2, section: "Punkt A.1.3",
      value: "Ifølge dødsfallsvilkåret DØD03 opphører forsikringen senest 31. desember året forsikrede fyller 89 år.",
    },
  ],
  "storebrand-person-ufore": [
    {
      kind: "pensjonMinstegrad", page: 2, section: "Punkt A.1.1",
      value: "Minst 40 % sammenhengende arbeidsuførhet.",
    },
    {
      kind: "pensjonKarenstid", page: 2, section: "Punkt A.1.1 og A.2.2 (s. 2 og 4)",
      value: "Tolv måneder, med mindre forsikringsbeviset angir en annen ventetid. Ved avtalt tre måneders ventetid gjelder et eget vilkår for offentlig ytelse.",
    },
    {
      kind: "pensjonOpphor", page: 3, section: "Punkt A.1.3",
      value: "Uførepensjonen opphører når forsikrede fyller 67 år.",
    },
    {
      kind: "pensjonPremiefritak", page: 5, section: "Punkt A.2.6",
      value: "Fullt premiefritak ved innvilget uførepensjon uansett uføregrad, fra den første i måneden etter utløpt ventetid og så lenge pensjonen utbetales.",
    },
    {
      kind: "pensjonNav", page: 4, section: "Punkt A.2.2",
      value: "Arbeidsavklaringspenger eller uføretrygd fra NAV må være innvilget. Ved avtalt tre måneders ventetid kan innvilgede sykepenger også oppfylle kravet.",
    },
    {
      kind: "kapital", page: 5, section: "Punkt B.1.1, jf. forsiden",
      value: "Valgfri engangsutbetaling ved varig uførhet for kunder som også kjøper uførepensjon. Vilkårene krever innvilget uføretrygd fra NAV og minst 40 % sammenhengende arbeidsuførhet i minst fire år.",
      addOn: "Engangsutbetaling",
      conditional: true,
    },
    {
      kind: "kapitalMinstegrad", page: 6, section: "Punkt B.2.2",
      value: "Ved avtalt engangsutbetaling kreves minst 40 % sammenhengende arbeidsuførhet og innvilget uføretrygd på minst 40 %.",
      addOn: "Engangsutbetaling",
      conditional: true,
    },
    {
      kind: "kapitalVentetid", page: 5, section: "Punkt B.1.1",
      value: "Ved avtalt engangsutbetaling kreves minst fire år med sammenhengende arbeidsuførhet.",
      addOn: "Engangsutbetaling",
      conditional: true,
    },
    {
      kind: "kapitalOpphor", page: 6, section: "Punkt B.1.3 og B.2 (s. 6–7)",
      value: "Engangsdekningen opphører ved fylte 62 år eller etter utbetaling. Vilkåret har en særregel for arbeidsuførhet som inntraff før opphørsalderen.",
      addOn: "Engangsutbetaling",
      conditional: true,
    },
    {
      kind: "uforeSymptom", page: 2, section: "Punkt A.1.2 (s. 2–3)",
      value: "Tolv måneder som hovedregel fra fullstendig forsikringssøknad. Enkelte diagnoser som er listet i vilkårene har i stedet tre måneder. Vilkårene beskriver unntak ved flytting av tilsvarende forsikring.",
    },
  ],
  "storebrand-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 3, section: "§ 5.2 (s. 3–4)",
      value: "Nødvendige behandlings- og reiseutgifter i Norden de to første årene. Opptil 5 % av forsikringssummen for medisinsk invaliditet og 1 000 kr i egenandel per skade.",
      conditional: true,
    },
    {
      kind: "ulykkeGeografi", page: 2, section: "§ 3",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Vilkårene åpner for lengre opphold for blant annet norske utenriksansatte, studenter og au pairer. For studenter og au pairer er grensen fire år.",
    },
    {
      kind: "ulykkeOpphor", page: 3, section: "§ 4",
      value: "Kan fornyes hvert år så lenge forsikrede lever.",
    },
    {
      kind: "ulykkeArbeid", page: 2, section: "§§ 4–4.2 (s. 2–3)",
      value: "Hele døgnet for personer uten yrkesaktivitet og for lavrisikoyrker. Ved forhøyet yrkesrisiko gjelder den som hovedregel i fritiden. Enkelte yrkesaktiviteter er unntatt.",
    },
  ],
  "tryg-person-barn-ekstra": [
    {
      kind: "barnOpphor", page: 1, section: "§ 1",
      value: "Senest ved første hovedforfall etter fylte 26 år. Medlemskap i norsk folketrygd kreves, med egne regler for behandlingsdekningen.",
      document: "barn-produktvilkar",
    },
    {
      kind: "barnGeografi", page: 1, section: "§ 3",
      value: "Norge og utenlandsopphold i inntil 12 måneder, med unntak for blant annet studenter, au pairer og norsk utenrikstjeneste. Behandlingsdekningen har egne geografiske regler.",
      document: "barn-produktvilkar",
    },
    {
      kind: "barnUtgifter", page: 4, section: "§ 7 (s. 4–5)",
      value: "Nødvendig medisinsk behandling og reise i inntil tre år etter ulykken, opptil 100 000 kr. Utgifter som kan dekkes fra annet hold trekkes fra. Utsatt permanent tannbehandling har egne regler.",
    },
    {
      kind: "barnSykehus", page: 3, section: "§ 5.1–5.2 (s. 3–4)",
      value: "1 000 kr per dag fra første dag ved mer enn ni sammenhengende døgn på sykehus i Norden. Frem til fylte 20 år og høyst 365 dager samlet med dagpenger ved langvarig sykdom for samme tilfelle.",
    },
    {
      kind: "barnHjelpestonad", page: 3, section: "§ 4.1–4.2",
      value: "Merutgifter ved nødvendig pleie og tilsyn når NAV innvilger hjelpestønad. Årlig erstatning fra 20 000 til 200 000 kr avhengig av sats, i maksimalt fem år og frem til fylte 20 år. Ved type 1-diabetes er grensen to år.",
    },
    {
      kind: "barnBoligtilpasning", page: 4, section: "§ 6.1–6.2",
      value: "Nødvendig ombygging av én bolig og tekniske hjelpemidler etter sykdom eller ulykke. Samlet inntil 300 000 kr, minste utgift 12 000 kr. Forhåndsgodkjenning kreves.",
    },
    {
      kind: "barnDodsfall", page: 5, section: "§ 8",
      value: "100 000 kr ved forsikredes død.",
    },
    {
      kind: "barnDiagnose", page: 5, section: "§ 9.1 og § 9.2 (s. 7)",
      value: "400 000 kr ved oppført alvorlig tilstand diagnostisert i forsikringstiden, dersom barnet lever 30 dager etter endelig diagnose. Beløpet trekkes fra eventuell invaliditetserstatning for samme sykdom eller skade.",
    },
    {
      kind: "barnPensjon", page: 1, section: "§§ 2–3",
      value: "Månedlig ytelse etter minst 50 % sammenhengende arbeidsuførhet i minst 12 måneder etter fylte 18 år. Utbetaling avhenger av uføregraden og opphører senest måneden barnet fyller 67 år.",
      document: "barn-uforepensjon",
      addOn: "Uførepensjon",
    },
    {
      kind: "barnKapital", page: 1, section: "§§ 2–3",
      value: "900 000 kr ved minst 50 % sammenhengende arbeidsuførhet i minst to år, vurdert varig. Tidligst fra fylte 18 år.",
      document: "barn-uforekapital",
      addOn: "Uførekapital",
    },
    {
      kind: "barnSkolerobot", page: 7, section: "§ 10.1–10.2 (s. 7–8)",
      value: "Forhåndsgodkjent privat leie av AV1 ved minst 30 sammenhengende dager med legeattestert fravær fra skole eller studier. Gjeldende tilbud fra annet hold går foran.",
    },
    {
      kind: "barnBehandling", page: 1, section: "§ 1",
      value: "Forhåndsgodkjent medisinsk nødvendig utredning og behandling etter sykdom eller ulykke. Vilkårene beskriver blant annet spesialist-, sykehus- og kreftbehandling og krav til henvisning.",
      document: "barn-behandling",
      addOn: "Behandling",
    },
  ],
  "tryg-person-barn-ulykke": [
    {
      kind: "barnOpphor", page: 1, section: "§ 1",
      value: "Senest ved første hovedforfall etter fylte 26 år. Medlemskap i norsk folketrygd kreves, med egne regler for behandlingsdekningen.",
      document: "barn-produktvilkar",
    },
    {
      kind: "barnGeografi", page: 1, section: "§ 3",
      value: "Norge og utenlandsopphold i inntil 12 måneder, med unntak for blant annet studenter, au pairer og norsk utenrikstjeneste. Behandlingsdekningen har egne geografiske regler.",
      document: "barn-produktvilkar",
    },
    {
      kind: "barnUtgifter", page: 2, section: "§ 3.2 (s. 2–3)",
      value: "Nødvendige behandlings- og reiseutgifter i inntil tre år etter ulykken. Opptil 5 % av forsikringssummen og 1 000 kr i egenandel. Egne regler for utsatt permanent tannbehandling.",
    },
    {
      kind: "barnDodsulykke", page: 3, section: "§ 3.3",
      value: "100 000 kr ved dødsfall innen ett år etter ulykkesskaden, med fradrag for utbetalt invaliditetserstatning.",
    },
    {
      kind: "barnDiagnose", page: 1, section: "§ 2 og § 4",
      value: "Engangsutbetaling ved de alvorlige tilstandene som er angitt i tillegget. Diagnosen må stilles i forsikringstiden av legespesialist ved norsk sykehus eller poliklinikk.",
      document: "barn-utvalgte-sykdommer",
      addOn: "Utvalgte sykdommer",
    },
    {
      kind: "barnBoligtilpasning", page: 3, section: "§ 5",
      value: "Nødvendig ombygging av én bolig og tekniske hjelpemidler ved alvorlig sykdom omfattet av tillegget eller ulykkesskade. Samlet inntil 200 000 kr per sykdom eller ulykkesskade.",
      document: "barn-utvalgte-sykdommer",
      addOn: "Utvalgte sykdommer",
    },
    {
      kind: "barnSykehus", page: 3, section: "§ 6.1 (s. 3–4)",
      value: "Dagpenger ved minst ni sammenhengende døgn på sykehus i Norden etter dekket sykdom eller ulykke. Inntil 365 dager og frem til fylte 20 år.",
      document: "barn-utvalgte-sykdommer",
      addOn: "Utvalgte sykdommer",
    },
    {
      kind: "barnBehandling", page: 1, section: "§ 1",
      value: "Forhåndsgodkjent medisinsk nødvendig utredning og behandling etter sykdom eller ulykke. Vilkårene beskriver blant annet spesialist-, sykehus- og kreftbehandling og krav til henvisning.",
      document: "barn-behandling",
      addOn: "Behandling",
    },
  ],
  "tryg-person-behandling": [
    {
      kind: "forsteHelsehjelp", page: 6, section: "§ 12",
      value: "10 virkedager til første undersøkelse, innleggelse, behandling eller operasjon for samme skade eller sykdom, fra dagen etter at Tryg har mottatt nødvendig dokumentasjon, tidligst dagen etter mottatt henvisning. Vilkåret har unntak.",
      conditional: true,
    },
    {
      kind: "behandlingBilder", page: 3, section: "§ 4",
      value: "Bildediagnostikk ved dekket innleggelse eller poliklinisk utredning og behandling, blant annet CT, MR, mammografi, bentetthetsmåling og ultralyd.",
    },
    {
      kind: "behandlingEtterkontroll", page: 3, section: "§ 4",
      value: "Én kontroll etter avsluttet primærbehandling.",
    },
    {
      kind: "behandlingFysikalsk", page: 4, section: "§ 6",
      value: "Inntil åtte timer per kalenderår hos autorisert behandler, med inntil 600 kr og 250 kr egenandel per time.",
    },
    {
      kind: "behandlingPsykolog", page: 4, section: "§ 7.1",
      value: "Inntil ti timer per kalenderår hos psykolog etter henvisning fra behandler med henvisningsfullmakt.",
    },
    {
      kind: "behandlingReiseutgifter", page: 4, section: "§ 8.3 (s. 4–5)",
      value: "Rimeligste nødvendige reise ved dekket behandling, ved operasjon eller mer enn 100 km reisevei hver vei. Ved likeverdige tilbud dekkes reisen til nærmeste behandlingssted.",
    },
    {
      kind: "behandlingAndrevurdering", page: 5, section: "§ 8.6",
      value: "Én ny vurdering hos legespesialist per forsikringstilfelle ved livstruende sykdom eller skade, eller ved særlig risikofylt behandling.",
    },
    {
      kind: "behandlingRehabilitering", page: 5, section: "§ 8.7",
      value: "Nødvendig gjenopptrening i inntil tre måneder etter operasjon betalt av Tryg. Behandlende spesialist må dokumentere behovet og henvise. Oppstart senest én måned etter utskriving.",
    },
    {
      kind: "behandlingKompensasjon", page: 6, section: "§ 12",
      value: "500 kr per dag ved brudd på garantien frem til undersøkelse eller behandling kan tilbys, inntil 10 000 kr samlet.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 1, section: "§ 1.1, jf. § 1.4",
      value: "Tryg skal godkjenne all utredning og behandling på forhånd. Krav til henvisning avhenger av behandlingen.",
    },
  ],
  "tryg-person-behandling-55": [
    {
      kind: "forsteHelsehjelp", page: 3, section: "§ 3",
      value: "10 virkedager til første tilbudte undersøkelse, innleggelse, behandling eller operasjon for samme skade eller sykdom fra dagen etter at Tryg har mottatt nødvendig dokumentasjon, tidligst dagen etter mottatt henvisning.",
      conditional: true,
    },
    {
      kind: "behandlingBilder", page: 2, section: "Legespesialist",
      value: "Bildediagnostikk ved dekket utredning eller behandling, blant annet CT, MR, mammografi, bentetthetsmåling og ultralyd.",
    },
    {
      kind: "behandlingDagkirurgi", page: 2, section: "Dagkirurgi",
      value: "Dagkirurgi på privat sykehus, med innskriving og utskriving samme dag.",
    },
    {
      kind: "behandlingEtterkontroll", page: 2, section: "Legespesialist",
      value: "Én kontroll etter avsluttet primærbehandling.",
    },
    {
      kind: "behandlingFysikalsk", page: 2, section: "Fysikalske behandlinger",
      value: "Inntil åtte timer per kalenderår hos autorisert behandler, med inntil 600 kr og 250 kr egenandel per time.",
    },
    {
      kind: "behandlingPsykolog", page: 2, section: "Psykolog",
      value: "Inntil ti timer per kalenderår hos psykolog etter henvisning fra behandler med henvisningsfullmakt.",
    },
    {
      kind: "behandlingReiseutgifter", page: 2, section: "Reiseutgifter",
      value: "Rimeligste nødvendige reise ved dekket behandling, ved operasjon eller mer enn 100 km reisevei hver vei. Ved likeverdige tilbud dekkes reisen til nærmeste behandlingssted.",
    },
    {
      kind: "behandlingKompensasjon", page: 3, section: "§ 3",
      value: "500 kr per dag ved brudd på garantien frem til undersøkelse eller behandling kan tilbys, inntil 10 000 kr samlet.",
    },
  ],
  "tryg-person-behandling-enkel": [
    {
      kind: "forsteHelsehjelp", page: 4, section: "§ 5",
      value: "10 virkedager til første tilbudte undersøkelse, utredning hos legespesialist eller dagkirurgi for samme sykdom eller skade, fra dagen etter at fullstendig dokumentasjon er mottatt, tidligst dagen etter mottatt henvisning. Vilkåret har unntak.",
      conditional: true,
    },
    {
      kind: "behandlingBilder", page: 3, section: "§ 3.1",
      value: "CT, MR, mammografi, bentetthetsmåling, røntgen og ultralyd ved dekket poliklinisk utredning eller behandling.",
    },
    {
      kind: "behandlingDagkirurgi", page: 3, section: "§ 3.3",
      value: "Dagkirurgi på privat sykehus eller klinikk, inntil 20 000 kr per operasjon uten egenandel. Forsikrede skrives inn og ut samme dag.",
    },
    {
      kind: "behandlingFysikalsk", page: 3, section: "§ 3.4",
      value: "Inntil åtte timer per kalenderår i Trygs nettverk, med inntil 600 kr og 250 kr egenandel per time.",
    },
    {
      kind: "behandlingReiseutgifter", page: 3, section: "§ 3.5",
      value: "Rimelige og nødvendige reiseutgifter ved operasjon eller mer enn 100 km reisevei hver vei, inntil 4 000 kr. Ved likeverdige tilbud dekkes reisen til nærmeste behandlingssted.",
    },
    {
      kind: "behandlingKompensasjon", page: 4, section: "§ 5",
      value: "500 kr per dag ved brudd på garantien frem til undersøkelse eller behandling kan tilbys, inntil 10 000 kr samlet.",
    },
    {
      kind: "behandlingForhandsgodkjenning", page: 1, section: "§ 2.1, jf. § 2.4",
      value: "Tryg skal godkjenne all utredning og behandling på forhånd. Krav til henvisning avhenger av behandlingen.",
    },
  ],
  "tryg-person-familieulykke": [
    {
      kind: "ulykkeUtgifter", page: 2, section: "§ 3.2 (s. 2–3)",
      value: "Inntil 25 000 kr for nødvendige behandlings- og reiseutgifter per forsikret i tre år etter ulykken. Egenandel 1 000 kr. Vilkårene har egne regler for utsatt permanent tannbehandling for barn.",
    },
    {
      kind: "dodsulykke", page: 3, section: "§ 3.3",
      value: "Ved dødsfall som skyldes ulykkesskaden innen ett år, er summen 500 000 kr for forsikrede over 21 år og 50 000 kr for forsikrede barn. Utbetalt invaliditetserstatning trekkes fra.",
    },
  ],
  "tryg-person-gravid-ekstra": [
    {
      kind: "gravidUlykke", page: 1, section: "§ 2.1 og beregningen på s. 2",
      value: "Varig medisinsk invaliditet etter dekket ulykke hos mor eller barn, med forsikringssum 1 million kr for hver. I svangerskapet må ulykken medføre akutt behov for forløsning for at barnets dekning skal gjelde.",
    },
    {
      kind: "gravidDodsfall", page: 2, section: "§ 2.2 (s. 2–3)",
      value: "50 000 kr ved dødsfall hos mor eller barn som følge av ulykkesskade, svangerskaps- eller fødselskomplikasjoner. For det ventede barnet gjelder dekningen fra svangerskapsuke 26 + 0.",
    },
    {
      kind: "gravidUlykkesutgifter", page: 3, section: "§ 2.3",
      value: "Rimelige og nødvendige behandlingsutgifter innen tre år etter en dekket ulykke, inntil 5 % av forsikringssummen. Utgifter dekket fra annet hold trekkes fra.",
    },
    {
      kind: "gravidSykehus", page: 5, section: "§ 2.7",
      value: "300 kr per døgn fra første døgn, inntil 30 dager. Mor må være innlagt i mer enn fem sammenhengende dager i forbindelse med graviditet eller fødsel, eller barnet i mer enn ti sammenhengende døgn. Samtidig opphold gir bare én utbetaling.",
    },
    {
      kind: "gravidKrisehjelp", page: 5, section: "§ 2.6",
      value: "Inntil ti behandlinger i løpet av 12 måneder for hver av foreldrene ved akutt psykisk krise etter en oppført hendelse, hos behandler anvist av Tryg i Norge. Meldes innen 12 måneder etter hendelsen. Ingen egenandel.",
    },
    {
      kind: "gravidHelserad", page: 5, section: "§ 2.5",
      value: "Tilgang til Tryg Legehjelp 365 dager i året, med sykepleiere og allmennleger som kan hjelpe med helsespørsmål, resepter og henvisning til spesialist.",
    },
  ],
  "tryg-person-gravid-gratis": [
    {
      kind: "gravidDodsfall", page: 2, section: "§§ 2.2 og 3.2 (s. 2–3)",
      value: "50 000 kr ved dødsfall hos mor eller barn som følge av ulykkesskade, svangerskaps- eller fødselskomplikasjoner. For det ventede barnet gjelder dekningen fra svangerskapsuke 26 + 0.",
    },
  ],
  "tryg-person-gravid-premium": [
    {
      kind: "gravidUlykke", page: 1, section: "§ 2.1 og beregningen på s. 2",
      value: "Varig medisinsk invaliditet etter dekket ulykke hos mor eller barn, med forsikringssum 2 millioner kr for hver. I svangerskapet må ulykken medføre akutt behov for forløsning for at barnets dekning skal gjelde.",
    },
    {
      kind: "gravidDodsfall", page: 2, section: "§ 2.2 (s. 2–3)",
      value: "50 000 kr ved dødsfall hos mor eller barn som følge av ulykkesskade, svangerskaps- eller fødselskomplikasjoner. For det ventede barnet gjelder dekningen fra svangerskapsuke 26 + 0.",
    },
    {
      kind: "gravidUlykkesutgifter", page: 3, section: "§ 2.3",
      value: "Rimelige og nødvendige behandlingsutgifter innen tre år etter en dekket ulykke, inntil 5 % av forsikringssummen. Utgifter dekket fra annet hold trekkes fra.",
    },
    {
      kind: "gravidSykehus", page: 5, section: "§ 2.7",
      value: "300 kr per døgn fra første døgn, inntil 30 dager. Mor må være innlagt i mer enn fem sammenhengende dager i forbindelse med graviditet eller fødsel, eller barnet i mer enn ti sammenhengende døgn. Samtidig opphold gir bare én utbetaling.",
    },
    {
      kind: "gravidKrisehjelp", page: 5, section: "§ 2.6",
      value: "Inntil ti behandlinger i løpet av 12 måneder for hver av foreldrene ved akutt psykisk krise etter en oppført hendelse, hos behandler anvist av Tryg i Norge. Meldes innen 12 måneder etter hendelsen. Ingen egenandel.",
    },
    {
      kind: "gravidHelserad", page: 5, section: "§ 2.5",
      value: "Tilgang til Tryg Legehjelp 365 dager i året, med sykepleiere og allmennleger som kan hjelpe med helsespørsmål, resepter og henvisning til spesialist.",
    },
  ],
  "tryg-person-kritisk": [
    {
      kind: "sykdomKreft", page: 1, section: "Punkt 2.1",
      value: "Kreftdiagnose fra analyse av vevsprøver på spesiallaboratorium. Blant unntakene er hud- og leppekreft, føflekkreft under 0,5 mm, forstadier og svulster på eller under den angitte TNM-grensen.",
    },
    {
      kind: "sykdomHjerteinfarkt", page: 1, section: "Punkt 2.2",
      value: "Skade på hjertemuskelen på grunn av manglende blodtilførsel, diagnostisert etter standard kriterier i spesialavdeling og dokumentert som ferskt infarkt.",
    },
    {
      kind: "sykdomHjerneslag", page: 1, section: "Punkt 2.5",
      value: "Funksjonsutfall som starter innen seks timer etter symptomstart, varer over 48 timer og er av permanent karakter. Hjerneblødning eller hjerneinfarkt må dokumenteres.",
    },
    {
      kind: "sykdomMs", page: 1, section: "Punkt 2.7",
      value: "Entydig diagnose fra nevrolog med symptomer som varer mer enn seks måneder og MR som underbygger diagnosen.",
    },
    {
      kind: "sykdomUtbetalingsgrense", page: 3, section: "Punkt 3",
      value: "Én utbetaling for en dekket diagnose. Forsikringen opphører etter utbetalingen.",
    },
  ],
  "tryg-person-ulykke": [
    {
      kind: "ulykkeUtgifter", page: 2, section: "§ 3.2 (s. 2–3)",
      value: "Nødvendig behandling og reise etter ulykken i inntil tre år. Maksimalt 5 % av forsikringssummen og 1 000 kr i egenandel. Vilkårene har egne regler for utsatt permanent tannbehandling for barn.",
    },
    {
      kind: "dodsulykke", page: 1, section: "§§ 2–3",
      value: "Ved avtalt dødsfallsdekning kan dødsfall som skyldes ulykkesskaden innen ett år gi erstatning etter avtalt sum. Forsikringsbeviset kan fastsette andre vilkår.",
      document: "ulykke-dodsfall",
      conditional: true,
    },
    {
      kind: "ulykkeFaginvaliditet", page: 1, section: "§§ 1–2",
      value: "Egen invaliditetstabell med satser for tap av syn på ett øye, hørsel, arm, hånd eller fingre. For flere hånd- og fingerskader avhenger satsen av om skaden rammer skrivehånden.",
      document: "ulykke-faginvaliditet",
      addOn: "Faginvaliditet",
    },
    {
      kind: "ulykkeProgressiv", page: 1, section: "§§ 1–2",
      value: "For hvert prosentpoeng invaliditetsgraden er over 50 %, utbetales ytterligere 2 % av forsikringssummen. Ved 100 % invaliditet blir tillegget 100 % av forsikringssummen.",
      document: "ulykke-progressiv",
      addOn: "Progressiv erstatning",
    },
    {
      kind: "ulykkeGeografi", page: 2, section: "§ 3",
      value: "Norge og utenlandsopphold i inntil 12 måneder. Blant annet studenter, au pairer, norske utenriksansatte og ansatte i norske firmaer med virksomhet i utlandet kan beholde dekning ved lengre opphold.",
      document: "ulykke-produktvilkar",
    },
    {
      kind: "ulykkeOpphor", page: 1, section: "§ 1",
      value: "Ved første hovedforfall etter fylte 80 år. Forsikringen opphører tidligere hvis medlemskapet i norsk folketrygd opphører.",
      document: "ulykke-produktvilkar",
    },
    {
      kind: "ulykkeArbeid", page: 2, section: "§ 4",
      value: "Fritid eller hele døgnet, inkludert arbeid. Forsikringsbeviset angir hva som er avtalt.",
      document: "ulykke-produktvilkar",
    },
  ],
  "watercircles-person-ulykke": [
    {
      kind: "ulykkeGeografi", page: 4, section: "§ 3",
      value: "Norden og opphold utenfor Norden i inntil 12 måneder. Vilkårene åpner for lengre opphold for blant annet norske utenriksansatte, studenter og au pairer. For studenter og au pairer er grensen fire år.",
    },
    {
      kind: "ulykkeOpphor", page: 4, section: "§ 4",
      value: "Kan fornyes hvert år så lenge forsikrede lever.",
    },
    {
      kind: "ulykkeArbeid", page: 4, section: "§§ 4–4.2",
      value: "Hele døgnet for personer uten yrkesaktivitet og for lavrisikoyrker. Ved forhøyet yrkesrisiko gjelder den som hovedregel i fritiden. Enkelte yrkesaktiviteter er unntatt.",
    },
  ],
};
