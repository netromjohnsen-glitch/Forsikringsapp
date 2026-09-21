import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

export const FREMTIND_STANDARD_INNBO_URL = "https://dokument.fremtind.no/vilkar/fremtind/pm/eiendom/Vilkar_Standard_Innbo.pdf";
export const FREMTIND_TOPP_INNBO_URL = "https://dokument.fremtind.no/vilkar/fremtind/pm/eiendom/Vilkar_Topp_Innbo.pdf";
export const FREMTIND_INNBO_IPID_URL = "https://dokument.fremtind.no/ipid/IPID_Innbo.pdf";

const channels = ["Eika", "SpareBank 1", "DNB"];
export const fremtindInnboSources: Record<string, CatalogSource> = {
  fremtindInnboStandard: {
    id: "fremtindInnboStandard", company: "Fremtind", filename: "Vilkar_Standard_Innbo.pdf",
    termsNumber: "PBK-210.100-014", productCode: "PBK-210.100", version: "014",
    effectiveFrom: "2025-01-01", url: FREMTIND_STANDARD_INNBO_URL,
    sha256: "eddc6ba67d46495fce5925679fc75a92bfdb3af7aa4f7ed5ebb0d0592032fced",
    distributionChannels: channels,
  },
  fremtindInnboTopp: {
    id: "fremtindInnboTopp", company: "Fremtind", filename: "Vilkar_Topp_Innbo.pdf",
    termsNumber: "PBK-210.200-013", productCode: "PBK-210.200", version: "013",
    effectiveFrom: "2025-01-01", url: FREMTIND_TOPP_INNBO_URL,
    sha256: "d051745eb18921707f85bf42c130b780af4c65a0427207390bff6eea17257547",
    distributionChannels: channels,
  },
  fremtindInnboIpid: {
    id: "fremtindInnboIpid", company: "Fremtind", filename: "IPID_Innbo.pdf",
    termsNumber: "V.104", productCode: "Ikke oppgitt", version: "V.104",
    effectiveFrom: "Ikke oppgitt", url: FREMTIND_INNBO_IPID_URL,
    sha256: "5df50f82167bd89c97e7b9d4e8a3de6280878fd288e1ea01c993d42057cf55dd",
    distributionChannels: channels,
  },
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (rows: Row[]): CatalogFact[] => rows.map(([key, label, value, sourceId, section, page,
  replacesBase, deductibleClassification]) => {
  const source = fremtindInnboSources[sourceId];
  return {
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: sourceId, section, page, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: "Fremtind", url: source.url,
      productCode: source.productCode, version: source.version,
      note: "Kanonisk Fremtind-kilde publisert for Eika, SpareBank 1 og DNB; forsikringsbeviset går foran der vilkåret viser til avtalt verdi",
    },
  };
});

export const fremtindInnboFacts: Record<string, CatalogFact[]> = {
  fremtindInnboStandard: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Avtalt forsikringssum står i forsikringsbeviset", "fremtindInnboStandard", "3.1", 1, false, "reference"],
    ["innbo.geografi", "Innbo – geografisk område", "Forsikringsstedet; midlertidig inntil 3 år i Norden og på nytt bosted etter flytting", "fremtindInnboStandard", "2", 1],
    ["innbo.lagring.tid", "Midlertidig oppbevaring – tidsgrense", "Inntil 3 år i Norden", "fremtindInnboStandard", "2.2", 1],
    ["innbo.lagring.grense", "Eksternt lager – grense", "100 000 kr", "fremtindInnboStandard", "3.1 og 4.6.3", 1],
    ["sykkel.tyveri.grense", "Sykkel og elsykkel – grense", "20 000 kr", "fremtindInnboStandard", "3.1", 1],
    ["innbo.verdigjenstander.smykker_edelmetall.grense", "Smykker, gull og annet edelt metall – grense", "350 000 kr; høyere sum kan avtales og må fremgå av forsikringsbeviset", "fremtindInnboStandard", "3.1", 1],
    ["innbo.kunst.grense", "Kunst – grense", "500 000 kr; høyere sum kan avtales og må fremgå av forsikringsbeviset", "fremtindInnboStandard", "3.1", 1],
    ["innbo.samling.grense", "Enkeltgjenstander og samlinger – grense", "350 000 kr; høyere sum kan avtales og må fremgå av forsikringsbeviset", "fremtindInnboStandard", "3.1", 1],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "15 000 kr", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.hobbyveksthus.grense", "Hobbyveksthus, lagringstelt og plasthall – grense", "20 000 kr", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.kjoretoytilbehor.grense", "Løse deler og tilbehør til privat kjøretøy – grense", "20 000 kr i bygning eller container", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.fritidsbattilbehor.grense", "Løse deler og tilbehør til fritidsbåt – grense", "20 000 kr i bygning eller container", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.tilhenger.grense", "Bil-, vare- og båttilhenger – grense", "20 000 kr", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "50 000 kr på forsikringsstedet; 25 000 kr på arbeidsplass i bygning/container og 5 000 kr i låsbart garderobeskap", "fremtindInnboStandard", "3.1.1", 2],
    ["innbo.tilleggsinnredning.grense", "Tilleggsinnredning i leid/sameiet bolig – grense", "100 000 kr", "fremtindInnboStandard", "3.1.2", 2],
    ["innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "100 000 kr i nødvendig merutgift, begrenset til normal reparasjonstid", "fremtindInnboStandard", "3.2", 2],
    ["innbo.datalager.grense", "Rekonstruksjon av notater, fotografier og data – grense", "25 000 kr", "fremtindInnboStandard", "3.2", 2],
    ["innbo.vaesketap.grense", "Tap av vann, gass eller annen væske – grense", "20 000 kr", "fremtindInnboStandard", "3.2", 2],
    ["brann.dekning", "Brann", "Brann, lynnedslag og spenningsfeil, eksplosjon og nedsoting", "fremtindInnboStandard", "4.1", 3],
    ["vann.dekning", "Vannskade", "Utstrømming ved brudd, lekkasje eller oversvømmelse fra rør og akvarium; vann gjennom grunn eller avløp når vann står over gulvet", "fremtindInnboStandard", "4.2", 3],
    ["naturskade.dekning", "Naturskade", "Naturskade etter eget lovvilkår; antenner og markiser omfattes når fastmontert", "fremtindInnboStandard", "3.6", 3],
    ["tyveri.dekning", "Tyveri, innbrudd og skadeverk", "Tyveri fra bygning og hærverk ved tyveri eller ulovlig inntrengning på forsikringsstedet", "fremtindInnboStandard", "4.6.1", 4],
    ["tyveri.fellesbod.grense", "Tyveri fra egen bod med adgang fra fellesareal – grense", "100 000 kr", "fremtindInnboStandard", "4.6.1", 4],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "50 000 kr; fellesareal og bestemte verdigjenstander er unntatt", "fremtindInnboStandard", "4.6.1", 4],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "20 000 kr fra arbeidsplass eller rom med alminnelig adgang; 200 000 kr under opphold på sykehjem/sykehus", "fremtindInnboStandard", "4.6.2", 4],
    ["ran.dekning", "Ran og overfall", "Ran og overfall; napping av eller fra veske inntil 20 000 kr", "fremtindInnboStandard", "4.7", 4],
    ["innbo.fryserinnhold.grense", "Matvarer i fryser og kjøleskap – grense", "20 000 kr ved utilsiktet temperaturendring", "fremtindInnboStandard", "4.8", 4],
    ["innbo.egenandel", "Generell egenandel", "Egenandelen står i forsikringsbeviset", "fremtindInnboStandard", "6", 5, false, "reference"],
    ["sykkel.egenandel", "Sykkel – egenandel", "4 000 kr; 2 000 kr ved tyveri når sykkelen er registrert i FG-godkjent sykkelregister", "fremtindInnboStandard", "6.2", 6, false, "override"],
    ["glass.sanitaer.egenandel", "Bygningsglass og sanitærporselen – egenandel", "2 000 kr", "fremtindInnboStandard", "6.2", 6, false, "override"],
    ["naturskade.egenandel", "Naturskade – egenandel", "Lovbestemt egenandel; vilkåret oppgir 8 000 kr", "fremtindInnboStandard", "6.2", 6, false, "override"],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for personskade, tingskade og økonomisk tap som følge av fysisk skade", "fremtindInnboStandard", "FFE-002.001-008 punkt 3", 7],
    ["ansvar.grense", "Privatansvar – forsikringssum", "Forsikringssummen står i forsikringsbeviset", "fremtindInnboStandard", "FFE-002.001-008 punkt 3.1", 7, false, "reference"],
    ["ansvar.geografi", "Privatansvar – geografisk område", "Norden for innboforsikringen", "fremtindInnboStandard", "2.3 og FFE-002.001-008 punkt 2", 1],
    ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr", "fremtindInnboStandard", "6.2", 6, false, "override"],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter til juridisk bistand ved tvist som privatperson", "fremtindInnboStandard", "FFE-003.001-003 punkt 4", 9],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist; 250 000 kr når minst tre parter står på samme side", "fremtindInnboStandard", "FFE-003.001-003 punkt 5.1", 10],
    ["rettshjelp.geografi", "Rettshjelp – geografisk område", "Avtalt forsikringssted; tvist om fast eiendom utenfor Norden er unntatt", "fremtindInnboStandard", "FFE-003.001-003 punkt 2 og 4.2", 8],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av overskytende utgifter", "fremtindInnboStandard", "6.2 og FFE-003.001-003 punkt 5.2", 6, false, "override"],
    ["sikkerhet.brann", "Sikkerhetsforskrift – brann", "Skadeforebyggende krav fremgår av forsikringsbeviset; FG-godkjente tiltak kan redusere avtalt egenandel", "fremtindInnboStandard", "6.1", 5],
    ["sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "FG-godkjent sykkelregistrering gir dokumentert lavere egenandel ved tyveri", "fremtindInnboStandard", "6.2", 6],
  ]),
  fremtindInnboTopp: facts([
    ["innbo.lagring.grense", "Eksternt lager – grense", "350 000 kr", "fremtindInnboTopp", "3.1 og 4.3.3", 1, true],
    ["sykkel.tyveri.grense", "Sykkel og elsykkel – grense", "40 000 kr", "fremtindInnboTopp", "3.1", 1, true],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "30 000 kr", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.hobbyveksthus.grense", "Hobbyveksthus, lagringstelt og plasthall – grense", "40 000 kr", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.kjoretoytilbehor.grense", "Løse deler og tilbehør til privat kjøretøy – grense", "40 000 kr i bygning eller container", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.fritidsbattilbehor.grense", "Løse deler og tilbehør til fritidsbåt – grense", "40 000 kr i bygning eller container", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.tilhenger.grense", "Bil-, vare- og båttilhenger – grense", "40 000 kr", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "100 000 kr på forsikringsstedet; 50 000 kr på arbeidsplass i bygning/container og 10 000 kr i låsbart garderobeskap", "fremtindInnboTopp", "3.1.1", 2, true],
    ["innbo.tilleggsinnredning.grense", "Tilleggsinnredning i leid/sameiet bolig – grense", "Ingen særskilt beløpsgrense er oppgitt i punktet", "fremtindInnboTopp", "3.1.2", 2, true],
    ["innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige merutgifter begrenset til normal reparasjonstid; ingen særskilt beløpsgrense oppgitt", "fremtindInnboTopp", "3.2", 2, true],
    ["innbo.datalager.grense", "Rekonstruksjon av notater, fotografier og data – grense", "50 000 kr", "fremtindInnboTopp", "3.2", 2, true],
    ["innbo.vaesketap.grense", "Tap av vann, gass eller annen væske – grense", "40 000 kr", "fremtindInnboTopp", "3.2", 2, true],
    ["tyveri.fellesbod.grense", "Tyveri fra egen bod med adgang fra fellesareal – grense", "350 000 kr", "fremtindInnboTopp", "4.3.1", 3, true],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr; fellesareal og bestemte verdigjenstander er unntatt", "fremtindInnboTopp", "4.3.1", 3, true],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "40 000 kr fra arbeidsplass, rom med alminnelig adgang eller privat kjøretøy/fritidsbåt; 200 000 kr under opphold på sykehjem/sykehus", "fremtindInnboTopp", "4.3.2–4.3.4", 3, true],
    ["ran.dekning", "Ran og overfall", "Ran og overfall; napping av eller fra veske inntil 40 000 kr", "fremtindInnboTopp", "4.4", 4, true],
    ["innbo.fryserinnhold.grense", "Matvarer i fryser og kjøleskap – grense", "50 000 kr ved utilsiktet temperaturendring", "fremtindInnboTopp", "4.5", 4, true],
    ["flytting.transport.grense", "Flytteforsikring", "Tilfeldig og plutselig skade under transport og bæring i Norden; tyveri under transport inntil 100 000 kr og enkeltgjenstand/samling inntil 100 000 kr", "fremtindInnboTopp", "4.6", 4],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av veggedyr og kakerlakker samt inntil tre befaringer for skjeggkre; skade på innbo forårsaket av mus og rotter omfattes når aktiviteten startet etter at avtalen begynte å løpe", "fremtindInnboTopp", "4.7 og 4.9", 4],
    ["skadedyr.insekter.begrensning", "Skadedyr – insektbegrensninger", "Øvrige insekter bekjempes ikke. Aktivitet som startet før innflytting eller fortsetter etter utflytting er unntatt, også når aktiviteten startet mens sikrede bodde i boligen.", "fremtindInnboTopp", "4.7", 4],
    ["skadedyr.mus_rotter.begrensning", "Skadedyr – mus og rotter", "Skade på ting i bygninger uten boligformål, som garasje, utebod og låve, er unntatt.", "fremtindInnboTopp", "4.9", 5],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr samlet for dokumenterte insekter", "fremtindInnboTopp", "4.7", 4],
    ["mobil.reparasjon.dekning", "Reparasjon av mobiltelefon", "Reparasjon ved tilfeldig og plutselig ytre fysisk skade hos avtalt leverandør", "fremtindInnboTopp", "4.8", 4],
    ["uhell.dekning", "Uhell", "Tilfeldig og plutselig ytre fysisk skade med kjent årsak og tidspunkt", "fremtindInnboTopp", "4.10", 5],
    ["uhell.geografi", "Uhell – geografisk område", "Forsikringsstedet; utenfor forsikringsstedet inntil 50 000 kr innenfor vilkårets generelle Norden-område", "fremtindInnboTopp", "2.2 og 4.10", 1],
    ["uhell.grense", "Uhell utenfor hjemmet – grense", "50 000 kr", "fremtindInnboTopp", "4.10", 5],
    ["ulykke.boligtilpasning.grense", "Tilpasning av bolig for rullestolbruker – grense", "300 000 kr; varig invaliditet etter ulykke eller dokumentert medfødt behov, utgifter innen 10 år", "fremtindInnboTopp", "4.11", 5],
    ["idtyveri.dekning", "ID-tyveri", "Assistanse for å begrense misbruk og juridisk bistand ved domstolstvist; økonomisk tap utover juridisk bistand er unntatt", "fremtindInnboTopp", "4.12", 6],
    ["idtyveri.grense", "ID-tyveri – juridisk bistand", "1 000 000 kr", "fremtindInnboTopp", "4.12.2", 6],
    ["idtyveri.egenandel", "ID-tyveri – egenandel", "0 kr for assistanse; juridisk bistand 4 000 kr pluss 20 % av overskytende utgifter", "fremtindInnboTopp", "4.12 og 6.2", 6, false, "override"],
    ["mobil.egenandel", "Mobiltelefon – egenandel", "2 000 kr", "fremtindInnboTopp", "6.2", 8, false, "override"],
  ]),
};

// Eika omtaler nivåene som Innbo/Innbo Pluss. De felles Fremtind-kildene
// bruker Standard/Topp; source metadata bevarer de dokumenterte navnene.
export const fremtindInnboProducts: CatalogProduct[] = [
  { company: "Fremtind", insuranceType: "Innbo", name: "Innbo", providerId: "fremtind",
    productId: "fremtind-innbo-standard", version: "2025-01-01", sourceId: "fremtindInnboStandard",
    componentIds: ["fremtindInnboStandard"] },
  { company: "Fremtind", insuranceType: "Innbo", name: "Innbo Pluss", providerId: "fremtind",
    productId: "fremtind-innbo-topp", version: "2025-01-01", sourceId: "fremtindInnboTopp",
    inheritsProductId: "fremtind-innbo-standard", componentIds: ["fremtindInnboTopp"] },
];
