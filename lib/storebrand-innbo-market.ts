import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const effectiveFrom = "2026-09-20";
const version = "innbo10";
const fileName = "Storebrand_Innbo_innbo10.pdf";
const url = "https://www.storebrand.no/privat/forsikring/innboforsikring/_/attachment/inline/9b3b5c27-3e81-4201-b0aa-a27ea63add19:bc9ded709c0c568e911dae5f8ebf9e1155de14ff/vilkar-innboforsikring.pdf";
const documentId = "storebrand:market:innbo:innbo10";
const standardId = "sb-innbo-standard-innbo10";
const superId = "sb-innbo-super-innbo10";

const terms: CatalogSource = {
  id: documentId, company: "Storebrand", providerId: "storebrand", insuranceType: "Innbo",
  agreementScope: "ordinary", sourceType: "full_terms", filename: fileName,
  termsNumber: version, version, effectiveFrom, url, productCode: "17035J",
  productIds: [standardId, superId], physicalPages: [1, 31],
  sha256: "b0e518d636a1350de08d5f9783ce65165d6b25b137382f089365344f5d836256",
};

const source = (page: number, section: string): CatalogFact["source"] => ({
  documentId, page, section, filename: fileName, termsNumber: version, version, effectiveFrom, url,
  company: "Storebrand", productCode: "17035J", agreementScope: "ordinary",
  note: "Forsikringsbeviset angir valgt nivå og forsikringssum og gjelder foran vilkåret.",
});

const row = (
  key: string,
  label: string,
  value: string,
  page: number,
  section: string,
  options?: Pick<CatalogFact, "replacesBase" | "deductibleClassification" | "qualificationSource">,
): CatalogFact => ({ key, label, value, source: source(page, section), ...options });

const facts: Record<string, CatalogFact[]> = {
  [standardId]: [
    row("innbo.forsikringssum", "Samlet forsikringssum", "Forsikringssummen velges av forsikringstakeren og står i forsikringsbeviset", 13, "B.5", { deductibleClassification: "reference" }),
    row("innbo.geografi", "Innbo – geografisk område og midlertidig oppbevaring", "Forsikringsstedet. I Norden omfattes også ting som skal tilbakeføres innen 3 år, og barn som omfattes og bor borte på grunn av utdanning eller førstegangstjeneste.", 4, "B.2"),
    row("innbo.lagring.tid", "Midlertidig oppbevaring – tidsgrense", "Inntil 3 år på lager ved brann, vann eller tyveri. Se også geografiske regler for midlertidig oppbevaring.", 11, "B.4.8", { qualificationSource: source(4, "B.2") }),
    row("innbo.lagring.grense", "Midlertidig oppbevaring – grense", "Avtalt forsikringssum; samlet 100 000 kr for angitte dyrebare gjenstander eller samlinger", 11, "B.4.8"),
    row("innbo.basseng.grense", "Frittstående basseng – grense", "40 000 kr på forsikringsstedet", 5, "B.3"),
    row("innbo.fritidsbat.grense", "Fritidsbåt og angitt tilbehør – grense", "60 000 kr for båt inntil 15 fot, påhengsmotor inntil 10 hk, kano, kajakk, seilbrett og SUP på forsikringsstedet eller låst fast på land ved forsikringsstedet.", 5, "B.3"),
    row("innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "100 000 kr for eiendeler og varer i sikredes foretak som oppbevares i bygning på forsikringsstedet.", 5, "B.3"),
    row("innbo.penger.grense", "Penger og verdipapirer – grense", "20 000 kr", 5, "B.3"),
    row("innbo.tilhenger.grense", "Tilhenger til person- og varebil – grense", "40 000 kr på forsikringsstedet", 5, "B.3"),
    row("innbo.hobbyveksthus.grense", "Hobbyveksthus – grense", "300 000 kr på forsikringsstedet", 5, "B.3"),
    row("innbo.smabygg.grense", "Små bygg inntil 10 m² – grense", "50 000 kr på forsikringsstedet", 5, "B.3"),
    row("innbo.kjoretoytilbehor.grense", "Deler og tilbehør til privat kjøretøy – grense", "40 000 kr på forsikringsstedet", 5, "B.3"),
    row("innbo.fryserinnhold.dekning", "Innhold i fryser", "Matvarer skadet av utilsiktet temperaturstigning ved strømbrudd eller angitt elektrisk fenomen. Fryser eller kjøleskap omfattes ved erstatningsmessig matskade. Skaden meldes straks, og maten oppbevares for besiktigelse.", 5, "B.3"),
    row("glass.sanitaer.dekning", "Glass og sanitærporselen", "Plutselig og uforutsett brudd på sanitærporselen, fastmontert platetopp og glass i dører og vinduer i leid leilighet, sameie eller borettslag. Årsak og tidspunkt må være kjent, og du må se hendelsen.", 12, "B.4.10"),
    row("brann.dekning", "Brann", "Brann og eksplosjon, plutselig og uventet nedsoting og utstrømming fra brannslokkingsutstyr", 6, "B.4.1"),
    row("elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag og overspenning", 7, "B.4.2"),
    row("naturskade.dekning", "Naturskade", "Skred, storm, flom, stormflo, jordskjelv, flodbølge, meteorittnedslag og vulkanutbrudd etter naturskadeforsikringsloven", 7, "B.4.3"),
    row("naturskade.geografi", "Naturskade – geografisk område", "Norge", 4, "B.2"),
    row("naturskade.egenandel", "Naturskade – egenandel", "Egenandelen som til enhver tid fastsettes av Justisdepartementet; vilkåret oppgir 8 000 kr per 01.01.2024", 7, "B.4.3", { deductibleClassification: "override" }),
    row("vann.dekning", "Vannskade", "Utstrømming fra rør, tilknyttet utstyr eller brannslukkingsutstyr, vann fra terreng og oversvømmelse eller lekkasje fra akvarium.", 7, "B.4.4"),
    row("innbo.vaesketap.grense", "Tap av vann, gass eller annen væske – grense", "40 000 kr ved lekkasje som gir forhøyet vannavgift eller tap av væske", 7, "B.4.4"),
    row("tyveri.dekning", "Tyveri, innbrudd og skadeverk", "Tyveri og forsettlig skadeverk på innbo i bygning på forsikringsstedet. Romskade ved tyveri og skadeverk har egen dekning i vilkåret for leilighet.", 9, "B.4.5", { qualificationSource: source(12, "B.4.10") }),
    row("tyveri.innbrudd.bygg.grense", "Bygningsskade ved innbrudd – grense", "40 000 kr ved romskade ved tyveri eller skadeverk i leid leilighet, sameie eller borettslag.", 12, "B.4.10"),
    row("tyveri.fellesbod.grense", "Tyveri fra privat bod i fellesrom – grense", "100 000 kr; særlig tyveriutsatte og verdifulle gjenstander har oppbevaringsbegrensninger", 8, "B.4.5", { qualificationSource: source(9, "B.4.5") }),
    row("tyveri.fellesgarasje.grense", "Tyveri fra låst skap i fellesgarasje eller fellesrom – grense", "40 000 kr ved tyveri fra eget låst skap i fellesgarasje eller andre fellesrom.", 8, "B.4.5"),
    row("tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr for hagemøbler, hageredskap, grill og robotgressklipper. 40 000 kr for annet innbo. Gjelder privat uteareal, med egne vilkår for sykkel.", 8, "B.4.5"),
    row("sykkel.tyveri.grense", "Sykkel, elsykkel, elsparkesykkel og sykkeltilhenger – tyverigrense", "40 000 kr per låst sykkel i Norge; grensen gjelder ikke inne i fast bebodd bolig", 8, "B.4.5", { qualificationSource: source(9, "B.4.5") }),
    row("tyveri.egenandel", "Tyveri, ran og skadeverk – egenandel", "2 000 kr per stjålet eller skadet gjenstand, høyst avtalt egenandel i forsikringsbeviset", 9, "B.4.5", { deductibleClassification: "override" }),
    row("sykkel.egenandel", "Sykkeltyveri – egenandel ved godkjent registrering", "1 000 kr når gyldig abonnement i godkjent sykkelregister foreligger", 9, "B.4.5", { deductibleClassification: "override" }),
    row("krise.psykolog.timer", "Psykologhjelp ved alvorlige hendelser – grense", "Inntil 10 behandlingstimer ved alvorlig brann eller ran, overfall eller voldtekt ved hjemmet; terapi senest 12 måneder etter skaden", 10, "B.4.7"),
    row("innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige ekstra bokostnader uten beløpsgrense i reparasjonsperioden, med 100 000 kr i hotellgrense. Ekstra kostnader utover én uke må avtales på forhånd.", 2, "A; B.4.11 nr. 2", { qualificationSource: source(13, "B.4.11 nr. 2") }),
    row("innbo.datalager.grense", "Rekonstruksjon av manuskripter og datalagre – grense", "50 000 kr", 13, "B.4.11"),
    row("innbo.tilleggsinnredning.grense", "Egen tilleggsinnredning i leiet bolig – grense", "100 000 kr", 12, "B.4.10"),
    row("innbo.egenandel", "Generell egenandel", "Egenandelen står i forsikringsbeviset og gjelder når vilkåret ikke angir en annen egenandel", 15, "B.6.3", { deductibleClassification: "reference" }),
    row("ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar for person- og tingskade voldt som privatperson", 24, "D.3"),
    row("ansvar.geografi", "Privatansvar – geografisk område", "Norden; droneansvar gjelder i Europa", 24, "D.2"),
    row("ansvar.grense", "Privatansvar – forsikringssum", "5 000 000 kr per skadetilfelle; droneansvar inntil 750 000 SDR", 24, "D"),
    row("ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr per skadetilfelle", 26, "D.5", { deductibleClassification: "override" }),
    row("rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter til advokat, retten, sakkyndige og vitner ved tvist som privatperson", 28, "E.3"),
    row("rettshjelp.geografi", "Rettshjelp – geografisk område", "Norden", 28, "E.2"),
    row("rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist, begrenset til sikredes økonomiske interesse. Samlet grense på 250 000 kr når tre eller flere parter på sikredes side i det vesentlige har samme faktiske og juridiske problemstillinger, også på tvers av forsikringsselskaper.", 27, "E"),
    row("rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av resterende erstatningsbeløp", 30, "E.5", { deductibleClassification: "override" }),
    row("yrkesskade.privat.dekning", "Yrkesskade som privat arbeidsgiver", "Lovbestemt yrkesskadeansvar når sikrede som privatperson er arbeidsgiver; ingen egenandel", 31, "F"),
    row("sikkerhet.brann", "Sikkerhetsforskrift – brann", "Myndighetskrav til røykvarsler, slokkeutstyr, piper, ildsteder og elektrisk anlegg skal følges", 6, "B.4.1"),
    row("sikkerhet.vann", "Sikkerhetsforskrift – frost og vann", "Bygningen skal holdes tilstrekkelig varm eller vannrør tappes; rabattgivende utstyr skal brukes og vedlikeholdes", 8, "B.4.4"),
    row("sikkerhet.tyveri", "Sikkerhetsforskrift – låsing og oppbevaring", "Dører, vinduer og åpninger skal lukkes, låses eller sikres. Det gjelder også boder. Nøkler skal oppbevares utilgjengelig for uvedkommende.", 9, "B.4.5"),
    row("sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "Sykkel og elsparkesykkel skal låses; sykkeltilhenger skal låses fast eller være fastmontert", 10, "B.4.5"),
    row("mobil.skjerm.dekning", "Knust skjerm på mobil og nettbrett", "Bytte av knust eller sprukket skjerm eller deksel på mobiltelefon eller nettbrett. Skaden meldes hos Storebrand.", 11, "B.4.9"),
    row("mobil.skjerm.egenandel", "Knust mobil- eller nettbrettskjerm – egenandel", "1 000 kr hos Storebrands samarbeidspartner, 3 000 kr hos andre.", 12, "B.4.9", { deductibleClassification: "override" }),
  ],
  [superId]: [
    row("innbo.fritidsbat.grense", "Fritidsbåt og angitt tilbehør – grense", "60 000 kr for båt inntil 15 fot, påhengsmotor inntil 10 hk, kano, kajakk, seilbrett og SUP på forsikringsstedet eller låst fast på land ved forsikringsstedet.", 5, "B.3", { replacesBase: true }),
    row("innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "200 000 kr for eiendeler og varer i sikredes foretak som oppbevares i bygning på forsikringsstedet.", 5, "B.3", { replacesBase: true }),
    row("innbo.penger.grense", "Penger og verdipapirer – grense", "30 000 kr", 5, "B.3", { replacesBase: true }),
    row("innbo.hobbyveksthus.grense", "Hobbyveksthus – grense", "Avtalt forsikringssum", 5, "B.3", { replacesBase: true }),
    row("innbo.smabygg.grense", "Små bygg inntil 10 m² – grense", "200 000 kr på forsikringsstedet", 5, "B.3", { replacesBase: true }),
    row("tyveri.fellesbod.grense", "Tyveri fra privat bod i fellesrom – grense", "Avtalt forsikringssum; særlig tyveriutsatte og verdifulle gjenstander har oppbevaringsbegrensninger", 8, "B.4.5", { replacesBase: true, qualificationSource: source(9, "B.4.5") }),
    row("tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr ved tyveri av innbo fra privat uteareal. Egne vilkår gjelder for sykkel.", 8, "B.4.5", { replacesBase: true }),
    row("sykkel.tyveri.grense", "Sykkel, elsykkel, elsparkesykkel og sykkeltilhenger – tyverigrense", "50 000 kr per låst sykkel i Norden; grensen gjelder ikke inne i fast bebodd bolig", 8, "B.4.5", { replacesBase: true, qualificationSource: source(9, "B.4.5") }),
    row("innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige ekstra bokostnader uten beløpsgrense i reparasjonsperioden, også hotell. Ekstra kostnader utover én uke må avtales på forhånd.", 12, "B.4.11", { replacesBase: true, qualificationSource: source(13, "B.4.11 nr. 2") }),
    row("innbo.datalager.grense", "Rekonstruksjon av manuskripter og datalagre – grense", "100 000 kr", 13, "B.4.11", { replacesBase: true }),
    row("tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "50 000 kr for tyveri av ting i Norden. Penger, verdipapirer og tyveri fra sendt bagasje er unntatt. Tyveri ved flytting følger egne vilkår.", 17, "C.1.1"),
    row("uhell.dekning", "Uhell", "Plutselig og tilfeldig ytre fysisk skade. Avtalt sum på forsikringsstedet, inntil 100 000 kr når skaden skjer utenfor boligen eller ved fall eller velt i Norden, og inntil 40 000 kr ved fall eller velt i resten av verden.", 18, "C.1.2"),
    row("uhell.geografi", "Uhell – geografisk område", "Norden, og i øvrige deler av verden ved skade som oppstår ved at ting mistes, faller eller velter.", 18, "C.1.2"),
    row("uhell.egenandel", "Uhell – egenandel", "2 000 kr per skadet gjenstand, 1 500 kr for enkeltgjenstander under 2 år, høyst avtalt egenandel; mobil, sykkel og briller følger avtalt egenandel", 19, "C.1.2", { deductibleClassification: "override" }),
    row("sykkel.uhell.grense", "Sykkel og sportsutstyr under bruk – grense", "40 000 kr ved skade under bruk. Elsparkesykkel, luftsportsutstyr og skader under ritt, løp eller konkurranse er unntatt.", 19, "C.1.3"),
    row("sykkel.uhell.egenandel", "Sykkel og sportsutstyr under bruk – egenandel", "2 000 kr per skadet gjenstand, høyst avtalt egenandel", 19, "C.1.3", { deductibleClassification: "override" }),
    row("ulykke.boligtilpasning.grense", "Tilpasning av bolig etter ulykke – grense", "300 000 kr ved minst 50 % medisinsk invaliditet; utgiftene må påløpe innen 5 år", 20, "C.1.4"),
    row("flytting.transport.grense", "Skade ved privat flytting", "Avtalt forsikringssum ved plutselig og uforutsett ytre skade under transport eller bæring ved flytting til ny bolig eller lagringsplass i Norden. Tyveri fra transportmiddel dekkes inntil 100 000 kr.", 20, "C.1.5"),
    row("skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av gnagere og skadeinsekter i oppgitt fast bolig eller fritidsbolig i Norge, utført av Storebrands samarbeidspartner", 21, "C.1.6"),
    row("skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr", 21, "C.1.6"),
    row("skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr", 22, "C.1.6", { deductibleClassification: "override" }),
    row("idtyveri.dekning", "ID-tyveri", "Rimelig og nødvendig bistand for å begrense videre misbruk og juridisk bistand ved tvist mot angivelige kreditorer; økonomisk tap er unntatt", 22, "C.1.8", { qualificationSource: source(23, "C.1.8") }),
    row("idtyveri.grense", "ID-tyveri – grense", "100 000 kr til forebygging og begrensning; 1 000 000 kr til tvist mot angivelige kreditorer", 22, "C.1.8"),
    row("idtyveri.egenandel", "ID-tyveri – egenandel", "0 kr for bistand til forebygging og begrensning", 23, "C.1.8", { deductibleClassification: "override" }),
    row("sikkerhet.idtyveri", "Sikkerhetsforskrift – ID-tyveri", "Forholdet skal anmeldes, relevante banker og kortutstedere varsles, Storebrand kontaktes og skadebegrensende tiltak gjennomføres", 23, "C.1.8"),
    row("innbo.basseng.grense", "Frittstående basseng – grense", "100 000 kr på forsikringsstedet", 5, "B.3", { replacesBase: true }),
    row("tyveri.fellesgarasje.grense", "Tyveri fra fellesgarasje – grense", "100 000 kr ved tyveri fra eget låst skap i fellesgarasje eller andre fellesrom.", 8, "B.4.5", { replacesBase: true }),
    row("innbo.tilleggsinnredning.grense", "Egen tilleggsinnredning i leiet bolig – grense", "500 000 kr", 12, "B.4.10", { replacesBase: true }),
    row("innbo.gnagerskade.dekning", "Skade på innbo fra rotter og mus", "Avtalt forsikringssum ved skade fra aktivitet som startet etter at forsikringen begynte. Gjenstander oppbevart i bygg som ikke brukes til bolig, som garasje, utebod eller låve, er unntatt.", 22, "C.1.7"),
  ],
};

const products: CatalogProduct[] = [
  { company: "Storebrand", providerId: "storebrand", insuranceType: "Innbo", agreementScope: "ordinary",
    productId: standardId, version, name: "Standard", sourceId: documentId, componentIds: [standardId] },
  { company: "Storebrand", providerId: "storebrand", insuranceType: "Innbo", agreementScope: "ordinary",
    productId: superId, version, name: "Super", sourceId: documentId, inheritsProductId: standardId, componentIds: [superId] },
];

const addOns: CatalogAddOn[] = [];

export const storebrandInnboMarket = {
  replacesProductIds: ["sb-innbo-standard", "sb-innbo-super"],
  products,
  sources: { [documentId]: terms },
  facts,
  addOns,
};

export const storebrandInnboMarketArchives = [{
  provider: "storebrand",
  slug: "innbo-innbo10",
  archivePath: "catalog/sources/storebrand/innbo/" + fileName,
  sources: [[documentId, effectiveFrom, url] as const],
}];
