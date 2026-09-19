import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

export const STOREBRAND_INNBO_URL = "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/9b3b5c27-3e81-4201-b0aa-a27ea63add19:9655c7f64a7b98c7016c3130c592dbacdc1d312c/vilkar-innboforsikring.pdf";
export const STOREBRAND_INNBO_IPID_URL = "https://www.storebrand.no/privat/forsikring/ipid/_/attachment/inline/85c61c2c-3553-4b31-8a01-ffb459056082:8b2cc0375b86a60c76e3880eecdf71bb2f71f68d/ipid-innboforsikring.pdf";
export const STOREBRAND_INNBO_GENERAL_URL = "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf";

const terms = (id: string): CatalogSource => ({
  id, company: "Storebrand", filename: "Storebrand_Innbo_innbo09.pdf", termsNumber: "innbo09",
  productCode: "17035l", version: "innbo09", effectiveFrom: "2024-07-02", url: STOREBRAND_INNBO_URL,
  sha256: "926c4b93a76b49868bc596784fac9133613f80dc2487d96ab608eb73cfa90776",
});

export const storebrandInnboSources: Record<string, CatalogSource> = {
  sbInnboStandard: terms("sbInnboStandard"),
  sbInnboSuper: terms("sbInnboSuper"),
  sbInnboIpid: {
    id: "sbInnboIpid", company: "Storebrand", filename: "Storebrand_IPID_Innboforsikring.pdf",
    termsNumber: "Ikke oppgitt", productCode: "17102b", version: "01/2024", effectiveFrom: "Ikke oppgitt",
    url: STOREBRAND_INNBO_IPID_URL,
    sha256: "d79f80e2f81dfe7590adeee132c3f5b2a0a75848078d93b5e9563aded7d0ba96",
  },
  sbInnboGeneral: {
    id: "sbInnboGeneral", company: "Storebrand", filename: "Storebrand_Generelle_gener07.pdf",
    termsNumber: "gener07", productCode: "17034k", version: "gener07", effectiveFrom: "2026-09-01",
    url: STOREBRAND_INNBO_GENERAL_URL,
    sha256: "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",
  },
};

type Row = [key: string, label: string, value: string, sourceId: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (rows: Row[]): CatalogFact[] => rows.map(([key, label, value, sourceId, section, page,
  replacesBase, deductibleClassification]) => {
  const source = storebrandInnboSources[sourceId];
  return {
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: {
      documentId: sourceId, section, page, filename: source.filename, termsNumber: source.termsNumber,
      effectiveFrom: source.effectiveFrom, company: "Storebrand", url: source.url,
      productCode: source.productCode, version: source.version,
      note: "Forsikringsbeviset angir valgt nivå og forsikringssum og gjelder foran vilkåret",
    },
  };
});

export const storebrandInnboFacts: Record<string, CatalogFact[]> = {
  sbInnboStandard: facts([
    ["innbo.forsikringssum", "Samlet forsikringssum", "Forsikringssummen velges av forsikringstakeren og står i forsikringsbeviset", "sbInnboStandard", "A og B.5", 2, false, "reference"],
    ["innbo.geografi", "Innbo – geografisk område og midlertidig oppbevaring", "Forsikringsstedet; i Norden for ting tiltenkt tilbakeført innen 3 år, ting for salg og ting på nytt bosted etter flytting", "sbInnboStandard", "B.2", 4],
    ["innbo.lagring.tid", "Midlertidig oppbevaring – tidsgrense", "Inntil 3 år i bygning i Norden når tingene er tiltenkt tilbakeført", "sbInnboStandard", "B.2 og B.4.8", 4],
    ["innbo.lagring.grense", "Midlertidig oppbevaring – grense", "Avtalt forsikringssum; samlet 100 000 kr for angitte dyrebare gjenstander eller samlinger", "sbInnboStandard", "B.4.8", 11],
    ["innbo.basseng.grense", "Frittstående basseng – grense", "40 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.fritidsbat.grense", "Fritidsbåt, kano, kajakk og SUP – grense", "40 000 kr på eller låst til areal ved forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "50 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "20 000 kr", "sbInnboStandard", "B.3", 5],
    ["innbo.tilhenger.grense", "Tilhenger til person- og varebil – grense", "40 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.hobbyveksthus.grense", "Hobbyveksthus – grense", "100 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.smabygg.grense", "Små bygg under 10 m² – grense", "50 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.kjoretoytilbehor.grense", "Deler og tilbehør til privat kjøretøy – grense", "40 000 kr på forsikringsstedet", "sbInnboStandard", "B.3", 5],
    ["innbo.fryserinnhold.dekning", "Innhold i fryser", "Utilsiktet temperaturstigning; ved erstatningsmessig matskade omfattes også fryser eller kjøleskap", "sbInnboStandard", "B.3", 5],
    ["glass.sanitaer.dekning", "Glass og sanitærporselen", "Brudd på sanitærporselen, fastmontert platetopp og bygningsglass i eid leilighet eller leid bolig", "sbInnboStandard", "B.3", 5],
    ["brann.dekning", "Brann", "Brann og eksplosjon, plutselig og uventet nedsoting og utstrømming fra brannslokkingsutstyr", "sbInnboStandard", "B.4.1", 6],
    ["elektrisk.dekning", "Lynnedslag og elektrisk fenomen", "Lynnedslag, kortslutning, lysbue, overslag og overspenning", "sbInnboStandard", "B.4.2", 7],
    ["naturskade.dekning", "Naturskade", "Skred, storm, flom, stormflo, jordskjelv, flodbølge, meteorittnedslag og vulkanutbrudd etter naturskadeforsikringsloven", "sbInnboStandard", "B.4.3", 7],
    ["naturskade.geografi", "Naturskade – geografisk område", "Norge", "sbInnboStandard", "B.2 og B.4.3", 4],
    ["naturskade.egenandel", "Naturskade – egenandel", "Egenandelen som til enhver tid fastsettes av Justisdepartementet; vilkåret oppgir 8 000 kr per 01.01.2024", "sbInnboStandard", "B.4.3", 7, false, "override"],
    ["vann.dekning", "Vannskade", "Utstrømming fra rør og tilknyttet utstyr, vann fra terreng og oversvømmelse eller lekkasje fra akvarium", "sbInnboStandard", "B.4.4", 8],
    ["innbo.vaesketap.grense", "Tap av vann, gass eller annen væske – grense", "40 000 kr ved lekkasje som gir forhøyet vannavgift eller tap av væske", "sbInnboStandard", "B.4.4", 8],
    ["tyveri.dekning", "Tyveri, innbrudd og skadeverk", "Tyveri og forsettlig skadeverk i bygning på forsikringsstedet samt dokumentert bygningsskade ved innbrudd", "sbInnboStandard", "B.4.5", 9],
    ["tyveri.innbrudd.bygg.grense", "Bygningsskade ved innbrudd – grense", "40 000 kr i eid leilighet eller leid bolig", "sbInnboStandard", "B.4.5", 9],
    ["tyveri.fellesbod.grense", "Tyveri fra privat bod i fellesrom – grense", "100 000 kr; særlig tyveriutsatte og verdifulle gjenstander har oppbevaringsbegrensninger", "sbInnboStandard", "B.4.5", 9],
    ["tyveri.fellesgarasje.grense", "Tyveri fra låst skap i fellesgarasje eller fellesrom – grense", "40 000 kr", "sbInnboStandard", "B.4.5", 9],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "40 000 kr; gjelder ikke fellesareal eller sykkel", "sbInnboStandard", "B.4.5", 9],
    ["sykkel.tyveri.grense", "Sykkel, elsykkel, elsparkesykkel og sykkeltilhenger – tyverigrense", "40 000 kr per låst sykkel i Norge; grensen gjelder ikke inne i fast bebodd bolig", "sbInnboStandard", "B.4.5", 9],
    ["tyveri.egenandel", "Tyveri, ran og skadeverk – egenandel", "2 000 kr per stjålet eller skadet gjenstand, høyst avtalt egenandel i forsikringsbeviset", "sbInnboStandard", "B.4.5", 10, false, "override"],
    ["sykkel.egenandel", "Sykkeltyveri – egenandel ved godkjent registrering", "1 000 kr når gyldig abonnement i godkjent sykkelregister foreligger", "sbInnboStandard", "B.4.5", 10, false, "override"],
    ["krise.psykolog.timer", "Psykologhjelp ved alvorlige hendelser – grense", "Inntil 10 behandlingstimer ved alvorlig brann eller ran, overfall eller voldtekt ved hjemmet; terapi senest 12 måneder etter skaden", "sbInnboStandard", "B.4.7", 11],
    ["innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige ekstra bokostnader uten beløpsgrense i reparasjonsperioden; hotell begrenset til 100 000 kr", "sbInnboStandard", "B.4.9", 12],
    ["innbo.datalager.grense", "Rekonstruksjon av manuskripter og datalagre – grense", "50 000 kr", "sbInnboStandard", "B.4.9", 12],
    ["innbo.tilleggsinnredning.grense", "Egen tilleggsinnredning i leiet bolig – grense", "100 000 kr", "sbInnboStandard", "B.4.9", 12],
    ["innbo.egenandel", "Generell egenandel", "Egenandelen står i forsikringsbeviset og gjelder når vilkåret ikke angir en annen egenandel", "sbInnboStandard", "B.6.3", 15, false, "reference"],
    ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar for person- og tingskade voldt som privatperson", "sbInnboStandard", "D.3", 23],
    ["ansvar.geografi", "Privatansvar – geografisk område", "Norden; droneansvar gjelder i Europa", "sbInnboStandard", "D.2", 23],
    ["ansvar.grense", "Privatansvar – forsikringssum", "5 000 000 kr per skadetilfelle; droneansvar inntil 750 000 SDR", "sbInnboStandard", "D", 23],
    ["ansvar.egenandel", "Privatansvar – egenandel", "4 000 kr per skadetilfelle", "sbInnboStandard", "D.5", 25, false, "override"],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter til advokat, retten, sakkyndige og vitner ved tvist som privatperson", "sbInnboStandard", "E.3", 27],
    ["rettshjelp.geografi", "Rettshjelp – geografisk område", "Norden", "sbInnboStandard", "E.2", 27],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr per tvist; 250 000 kr for 3–10, 500 000 kr for 11–25, 750 000 kr for 26–49 og 1 000 000 kr for minst 50 Storebrand-forsikrede parter", "sbInnboStandard", "E", 26],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av resterende erstatningsbeløp", "sbInnboStandard", "E.5", 29, false, "override"],
    ["yrkesskade.privat.dekning", "Yrkesskade som privat arbeidsgiver", "Lovbestemt yrkesskadeansvar når sikrede som privatperson er arbeidsgiver; ingen egenandel", "sbInnboStandard", "F", 30],
    ["sikkerhet.brann", "Sikkerhetsforskrift – brann", "Myndighetskrav til røykvarsler, slokkeutstyr, piper, ildsteder og elektrisk anlegg skal følges", "sbInnboStandard", "B.4.1", 6],
    ["sikkerhet.vann", "Sikkerhetsforskrift – frost og vann", "Bygningen skal holdes tilstrekkelig varm eller vannrør tappes; rabattgivende utstyr skal brukes og vedlikeholdes", "sbInnboStandard", "B.4.4", 8],
    ["sikkerhet.tyveri", "Sikkerhetsforskrift – låsing og oppbevaring", "Dører, vinduer, boder og oppbevaringssteder skal sikres og låses; nøkler skal være utilgjengelige for uvedkommende", "sbInnboStandard", "B.4.5", 10],
    ["sikkerhet.sykkel", "Sikkerhetsforskrift – sykkel", "Sykkel og elsparkesykkel skal låses; sykkeltilhenger skal låses fast eller være fastmontert", "sbInnboStandard", "B.4.5", 10],
  ]),
  sbInnboSuper: facts([
    ["innbo.fritidsbat.grense", "Fritidsbåt, kano, kajakk og SUP – grense", "60 000 kr på eller låst til areal ved forsikringsstedet", "sbInnboSuper", "B.3", 5, true],
    ["innbo.yrkeslosore.grense", "Yrkesløsøre og varer – grense", "200 000 kr på forsikringsstedet", "sbInnboSuper", "B.3", 5, true],
    ["innbo.penger.grense", "Penger og verdipapirer – grense", "30 000 kr", "sbInnboSuper", "B.3", 5, true],
    ["innbo.hobbyveksthus.grense", "Hobbyveksthus – grense", "Avtalt forsikringssum", "sbInnboSuper", "B.3", 5, true],
    ["innbo.smabygg.grense", "Små bygg under 10 m² – grense", "200 000 kr på forsikringsstedet", "sbInnboSuper", "B.3", 5, true],
    ["tyveri.fellesbod.grense", "Tyveri fra privat bod i fellesrom – grense", "Avtalt forsikringssum; særlig tyveriutsatte og verdifulle gjenstander har oppbevaringsbegrensninger", "sbInnboSuper", "B.4.5", 9, true],
    ["tyveri.uteareal.grense", "Tyveri fra privat uteareal – grense", "100 000 kr; gjelder ikke fellesareal eller sykkel", "sbInnboSuper", "B.4.5", 9, true],
    ["sykkel.tyveri.grense", "Sykkel, elsykkel, elsparkesykkel og sykkeltilhenger – tyverigrense", "50 000 kr per låst sykkel i Norden; grensen gjelder ikke inne i fast bebodd bolig", "sbInnboSuper", "B.4.5 og C.1.1", 9, true],
    ["innbo.opphold.grense", "Midlertidig bolig etter skade – grense", "Nødvendige ekstra bokostnader uten beløpsgrense i reparasjonsperioden, også hotell", "sbInnboSuper", "B.4.9", 12, true],
    ["innbo.datalager.grense", "Rekonstruksjon av manuskripter og datalagre – grense", "100 000 kr", "sbInnboSuper", "B.4.9", 12, true],
    ["tyveri.utenforhjem.grense", "Tyveri utenfor hjemmet – grense", "50 000 kr for ting i Norden; penger og sendt bagasje er unntatt", "sbInnboSuper", "C.1.1", 17],
    ["uhell.dekning", "Uhell", "Plutselig og tilfeldig ytre fysisk skade; avtalt sum hjemme og inntil 100 000 kr utenfor bolig eller når ting mistes eller velter i Norden", "sbInnboSuper", "C.1.2", 18],
    ["uhell.geografi", "Uhell – geografisk område", "Norden", "sbInnboSuper", "B.2 og C.1.2", 4],
    ["uhell.egenandel", "Uhell – egenandel", "2 000 kr per skadet gjenstand, 1 500 kr for enkeltgjenstander under 2 år, høyst avtalt egenandel; mobil, sykkel og briller følger avtalt egenandel", "sbInnboSuper", "C.1.2", 19, false, "override"],
    ["sykkel.uhell.grense", "Sykkel og sportsutstyr under bruk – grense", "40 000 kr i Norden; elsparkesykkel og luftsportsutstyr er unntatt", "sbInnboSuper", "C.1.3", 19],
    ["sykkel.uhell.egenandel", "Sykkel og sportsutstyr under bruk – egenandel", "2 000 kr per skadet gjenstand, høyst avtalt egenandel", "sbInnboSuper", "C.1.3", 19, false, "override"],
    ["ulykke.boligtilpasning.grense", "Tilpasning av bolig etter ulykke – grense", "300 000 kr ved minst 50 % medisinsk invaliditet; utgiftene må påløpe innen 5 år", "sbInnboSuper", "C.1.4", 20],
    ["flytting.transport.grense", "Skade ved privat flytting", "Avtalt forsikringssum, maksimalt 50 000 kr per gjenstand, ved plutselig ytre skade under transport eller bæring i Norge", "sbInnboSuper", "C.1.5", 20],
    ["skadedyr.dekning", "Bekjempelse av skadedyr", "Bekjempelse av gnagere og skadeinsekter i oppgitt fast bolig eller fritidsbolig i Norge, utført av Storebrands samarbeidspartner", "sbInnboSuper", "C.1.6", 20],
    ["skadedyr.grense", "Skadedyrbekjempelse – grense", "150 000 kr per skadetilfelle", "sbInnboSuper", "C.1.6", 20],
    ["skadedyr.egenandel", "Skadedyrbekjempelse – egenandel", "2 000 kr", "sbInnboSuper", "C.1.6", 21, false, "override"],
    ["idtyveri.dekning", "ID-tyveri", "Rimelig og nødvendig bistand for å begrense videre misbruk og juridisk bistand ved tvist mot angivelige kreditorer; økonomisk tap er unntatt", "sbInnboSuper", "C.1.7", 21],
    ["idtyveri.grense", "ID-tyveri – grense", "100 000 kr til forebygging og begrensning; 1 000 000 kr til tvist mot angivelige kreditorer", "sbInnboSuper", "C.1.7", 21],
    ["idtyveri.egenandel", "ID-tyveri – egenandel", "0 kr for bistand til forebygging og begrensning", "sbInnboSuper", "C.1.7", 22, false, "override"],
    ["sikkerhet.idtyveri", "Sikkerhetsforskrift – ID-tyveri", "Forholdet skal anmeldes, relevante banker og kortutstedere varsles, Storebrand kontaktes og skadebegrensende tiltak gjennomføres", "sbInnboSuper", "C.1.7", 22],
  ]),
};

export const storebrandInnboProducts: CatalogProduct[] = [
  { company: "Storebrand", insuranceType: "Innbo", name: "Standard", providerId: "storebrand",
    productId: "sb-innbo-standard", version: "innbo09", sourceId: "sbInnboStandard", componentIds: ["sbInnboStandard"] },
  { company: "Storebrand", insuranceType: "Innbo", name: "Super", providerId: "storebrand",
    productId: "sb-innbo-super", version: "innbo09", sourceId: "sbInnboStandard",
    inheritsProductId: "sb-innbo-standard", componentIds: ["sbInnboSuper"] },
];
