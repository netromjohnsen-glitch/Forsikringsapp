import { frendeReferenceChanges } from "./frende-market-edition-references.ts";
import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const editionDate = "2026-11-20";
const documentRoot = "https://api.frende.no/documents/terms/public/pnc/";

const vehicleEditions = [
  ["bil", "CarInsurance", ["frendeTerms", "frendeAnsvar", "frendeDelkasko", "frendeKasko",
    "frendeUtvidet", "frendeLeiebil", "frendeMaskinskade"]],
  ["mc", "MotorcycleInsurance", ["mcb-ff-frende-mc-terms"]],
  ["bobil", "MotorHomeInsurance", ["mcb-ff-frende-bobil-terms"]],
  ["campingvogn", "CaravanInsurance", ["vehicle:frende-CaravanInsurance.pdf"]],
  ["snoscooter", "SnowmobileInsurance", ["vehicle:frende-SnowmobileInsurance.pdf"]],
  ["tilhenger", "TrailerInsurance", ["vehicle:frende-TrailerInsurance.pdf"]],
] as const;

const vehicleDocuments = vehicleEditions.map(([variant, endpoint, ids]) => ({
  group: "vehicle" as const, slug: variant + "-2026-11-20", endpoint, ids,
  archive: "frende/2026-11-20/Vilkar_kjoretoyforsikring_20112026.pdf",
  pages: 14, sha256: "952f1c99f91e457ade95a7279f16c1c73e2f2575f92197f16a9d6b398985a9e7",
}));

const documents = [
  ...vehicleDocuments,
  {
    group: "boat", slug: "bat-2026-11-20", endpoint: "LeisureBoatInsurance",
    archive: "frende/2026-11-20/frende-boat-terms-20112026.pdf",
    pages: 12, sha256: "ac87efb9e5c43b27b8b16b3eb955ef0476730e6b779a54afc47d8679df737c5c",
    ids: ["boat-pet:frende:båt"],
  },
  {
    group: "home", slug: "hus-2026-11-20", endpoint: "HomeInsurance",
    archive: "frende/2026-11-20/Vilkar-husforsikring-20112026.pdf",
    pages: 15, sha256: "e07aad93b1702ad0e9cadce89bd6b3d9237431c2510dff6a930e5abd4b5d3358",
    ids: ["frendeHusStandard", "frendeHusExtended", "frendeHusRot", "frendeHusRental", "frendeHusConstruction"],
  },
  {
    group: "home", slug: "hytte-2026-11-20", endpoint: "VacationHomeInsurance",
    archive: "frende/2026-11-20/Vilkar-husforsikring-20112026.pdf",
    pages: 15, sha256: "e07aad93b1702ad0e9cadce89bd6b3d9237431c2510dff6a930e5abd4b5d3358",
    ids: ["cabin:frende:building"],
  },
  {
    group: "contents", slug: "innbo-2026-11-20", endpoint: "ContentInsurance",
    archive: "frende/2026-11-20/Vilkar_innboforsikring_20112026.pdf",
    pages: 13, sha256: "5709ed20d7be2beb696ea61106adbbfac19016bc04bc19eb0c434f9c134aa5bb",
    ids: ["frendeInnboStandard", "frendeInnboUhell"],
  },
  {
    group: "accident", slug: "ulykke-2026-11-20", endpoint: "AccidentInsurance",
    archive: "frende/2026-11-20/frende-person-ulykke-20112026.pdf",
    pages: 7, sha256: "6466ca49584f898822e1c42e7d1892d641ad84be4fdc5849eb01909025fab628",
    ids: ["person:frende-person-ulykke", "person:frende-person-ulykke:tillegg:faginvaliditet-arbeid",
      "person:frende-person-ulykke:tillegg:faginvaliditet-fritid"],
  },
  {
    group: "valuables", slug: "verdisak-2026-11-20", endpoint: "ValuablesInsurance",
    archive: "frende/2026-11-20/frende-verdisak-20112026.pdf",
    pages: 4, sha256: "638f9e3e8b57413993b19b6894814275cdbbbae902a3191fa77b6e8c17f57d9a",
    ids: ["private-valuables:frende"],
  },
] as const;

const editionId = (id: string) => id + ":" + editionDate;
const sourceDocuments = new Map<string, (typeof documents)[number]>(
  documents.flatMap(document => document.ids.map(id => [id, document] as const)),
);

export const frendeMarketEditionArchives = [
  ...documents.map(document => ({
    provider: "frende",
    slug: document.slug,
    archivePath: "catalog/sources/" + document.archive,
    sources: document.ids.map(id => [editionId(id), editionDate, documentRoot + document.endpoint] as const),
  })),
  {
    provider: "frende",
    slug: "kjoretoy-2026-01-01",
    archivePath: "catalog/sources/frende/Vilkar_kjoretoyforsikring.pdf",
    sources: vehicleEditions.flatMap(([, endpoint, ids]) =>
      ids.map(id => [id, "2026-01-01", documentRoot + endpoint] as const)),
  },
];

// Only the current public comparison receives the new edition. Saved customer
// catalogue references and the archived editions they cite keep their identities.
const changedValues: Readonly<Record<string, string>> = {
  "hus.bygninger.dekning": "Bygninger i forsikringsbeviset med vanlig fastmontert utstyr og midlertidig nedmonterte eller kommende bygningsdeler. Frittliggende bygg inntil 10 m² uten egen forsikring er dekket for hendelsene i punkt 4.1 nr. 1–10.",
  "hus.elektrisk.dekning": "Plutselig og uforutsett skade ved lynnedslag eller elektrisk fenomen omfattes. Gnistskader som ikke skyldes brann er unntatt.",
  "hus.eksplosjon.dekning": "Plutselig og uforutsett skade ved eksplosjon eller sprengning omfattes, med de ordinære unntakene i punkt 4.6.",
  "hus.vann.utstromming": "Brudd på rør eller ledning med tilknyttet utstyr, vann fra lekkasje på innvendig ledning og oversvømmelse fra tilknyttet utstyr omfattes.",
  "hus.tilpasning.grense": "Inntil 250 000 kr til nødvendige bygningsutgifter i fast bolig innen fem år når en forsikret blir varig rullestolbruker etter en ulykkesskade i forsikringstiden, eller et barn med medfødt fysisk funksjonsnedsettelse blir varig rullestolbruker. Bare utgifter ut over støtte fra NAV eller ansvarlig skadevolder erstattes.",
  "uhell.unntak": "Penger, luft- og vannsportutstyr, kjøretøy og tilbehør, droner, sykkel og elsykkel, yrkesløsøre, utlånte eller utleide ting og sendte ting er unntatt. Det samme gjelder mistede eller gjenglemte ting, skader som dekkes etter punkt 4.1, sopp, råte, bakterier, insekter, riper, rifter, hakk, hull, avskallinger, skade fra kjæledyr og slitasje eller andre forhold ved tingen selv.",
  "sikkerhet.vann": "Vann-, snø- og frostsikringskravene i punkt 13 skal følges.",
  "ansvar.dekning": "Rettslig erstatningsansvar i Norden for person- eller tingskade som privatperson. Yrke, næring, styreoppdrag og ansvar som eier eller fester av fast eiendom er unntatt. Næring på landbrukseiendom med inntekt under 100 000 kr er omfattet. Det gjelder også unntak blant annet for forsett, motorvogn, båt, luftfartøy, ansvar overfor familie og skade på ting eller eiendom man låner, leier eller bruker. Ved angitt brann-, eksplosjons- eller rørskade på boligen der innboforsikringen gjelder, kan ansvar for den leide boligen erstattes med inntil 1 mill. kr per skadetilfelle.",
  "person.ulykke.arbeid": "Barn under 16 år dekkes hele døgnet. Fra 16 til 18 år gjelder fritid og skoletid, med mulig utvidelse til jobb. For voksne er fritid utgangspunktet. Valgt arbeidsdekning kan omfatte jobb, skole eller studiested, også arbeid som selvstendig næringsdrivende.",
  "verdisak.egenandel": "10 % av erstatningsgrunnlaget, minst 500 kr.",
  "verdisak.aldersfradrag": "For datautstyr og mobiltelefon trekkes 20 % per år etter første år, maksimalt 80 %. Ellers vurderes blant annet alder, slitasje, bruksmulighet og markedsverdien for tilsvarende brukte ting.",
  "verdisak.oppgjor.metode": "Frende velger reparasjon, gjenanskaffelse eller kontantoppgjør og velger reparatør eller leverandør. Kontantoppgjøret settes til det laveste av Frendes reparasjons- eller gjenanskaffelseskostnad og markedsverdien. Reglene erstatter forsikringsavtaleloven § 6-1.",
  "verdisak.oppgjor.beregning": "Reparasjon eller gjenanskaffelse av en vesentlig tilsvarende gjenstand beregnes etter pris på skadedagen. Kan en tilsvarende gjenstand ikke skaffes, brukes markedsverdi basert på takst.",
};

function updatedValue(fact: CatalogFact, document: (typeof documents)[number]): string {
  if (document.group === "boat") {
    if (fact.key === "bat.kasko.begrensning") return fact.value.replace(
      "Motorskade krever de særskilte årsakene i 5.2 c.",
      "Motorskade krever en årsak nevnt i punkt 5.2 bokstav a, som grunnstøting, sammenstøt eller brann.",
    );
    if (fact.key === "bat.ulykke.dekning") return fact.value.replace(
      "fører, passasjerer og rettmessig bruker når båten brukes lovlig",
      "sikrede, passasjerer og andre som har lov til å bruke båten",
    );
  }
  if (document.group === "home") {
    const houseKey = fact.key.replace(/^hytte\./u, "hus.");
    return changedValues[houseKey] ?? fact.value
      .replace("underlagt punkt 5.6", "underlagt punkt 4.6")
      .replace("Utvidet punkt 9.1–9.4", "Utvidet punkt 8.1–8.4")
      .replace("med mindre punkt 5.1 nr. 1–9", "med mindre punkt 4.1 nr. 1–9");
  }
  return changedValues[fact.key] ?? fact.value;
}

const vehicleKaskoExclusions = "Kasko omfatter ikke skade på motor, gir, drivverk eller elektroniske styreenheter med mindre den skyldes en annen dekket skade. Frost, fukt, vann, råte, innvendige flekker, svimerker, søl, bruksslitasje, rust, underslag, skade eller feil på varmesystemer, tannstang, hjuloppheng og bærearmer med tilhørende deler er unntatt. Skade som fabrikant, leverandør eller reparatør er ansvarlig for er unntatt. Hvis kravet ikke fører frem, kan Frende erstatte en ellers dekket skade og overta kravet. Ombygging, trimming eller chipping må opplyses om og godkjennes av Frende.";

function updatedVehicleFact(row: CatalogFact): CatalogFact {
  const { key, source } = row;
  const { section } = source;
  let { value } = row;
  if (key.endsWith("kasko.begrensning") && /^(?:6\.2|6\.1–6\.2)$/u.test(section)) {
    value = vehicleKaskoExclusions;
    if (source.documentId.startsWith("mcb-ff-frende-bobil-") || key.startsWith("campingvogn.")) {
      value += " Sprekker, gliper, utettheter og lekkasjer er også unntatt. Den særskilte fukt- og råtedekningen har egne vilkår.";
    }
    if (key.startsWith("tilhenger.")) value += " Løse ting og bagasje på tilhengeren omfattes ikke.";
  } else if (key === "leiebil.bilklasse") {
    value = "Klasse C, D eller I når leiebildekningen står i forsikringsbeviset. Gjelder ved dekket brann-, tyveri-, kasko- eller maskinskade.";
  } else if (key === "nyverdi.unntak" && section === "11.7") {
    value = "Leasingbil og mopedbil er unntatt. Frende kan velge kontantoppgjør etter kostnaden for en tilsvarende ny bil.";
  } else if (key.endsWith("brann.begrensning") && section === "4.2") {
    value = "Svimerker og skade på delen der brann eller kortslutning oppstod er unntatt. Brann som skyldes kortslutning omfattes.";
  } else if (key === "brann.dekning" && section === "4.1–4.2") {
    value = "Skade etter brann eller lynnedslag. Svimerker og skade på delen der brann eller kortslutning oppstod er unntatt. Brann som skyldes kortslutning omfattes.";
  } else if (key === "campingvogn.fukt.begrensning") {
    value = "Godkjent fukttest må vise at skaden oppstod de siste 12 månedene. Reparasjon av lekkasjen og skade som skyldes rørbrudd eller lekkasje fra rør eller ledninger er unntatt. Det skal gå maksimalt 12 måneder mellom tester utført og godkjent av autorisert caravanforhandler. Ved anmerkning eller påvist fukt må nødvendige tiltak gjennomføres.";
  }

  if (section === "4.1.1") return { ...row, value, source: { ...source, page: 2 } };
  if (section === "4.1.1 og 4.2") return { ...row, value, source: { ...source, page: 2, section: "4.1 nr. 1 og 4.2 (PDF-side 3)" } };
  if (section === "4.1–4.2" && key === "brann.dekning") return { ...row, value, source: { ...source, page: 2, section: "4.1 nr. 1 og 4.2 (PDF-side 3)" } };
  if (section.includes("4.2 a–b")) return { ...row, value, source: { ...source, section: section.replace("4.2 a–b", "4.2 nr. 1–2") } };
  if (section === "6.1.4 side 4; 11.11 side 9") {
    return { ...row, value, source: { ...source, page: 3, section: "6.1 nr. 4 og 11.11 (PDF-side 9)" } };
  }
  if (section === "11.11" && /^(?:glass\.|veihjelp\.)/u.test(key)) return { ...row, value, source: { ...source, page: 8 } };
  if (section === "14.4" && key.endsWith("rettshjelp.egenandel")) return { ...row, value, source: { ...source, page: 12 } };
  return { ...row, value };
}

export function addFrendeMarketEdition(
  sources: Record<string, CatalogSource>,
  facts: Record<string, CatalogFact[]>,
  products: CatalogProduct[],
  addOns: CatalogAddOn[],
) {
  for (const [id, document] of sourceDocuments) {
    const previous = sources[id];
    const filename = document.archive.split("/").at(-1)!;
    sources[editionId(id)] = {
      ...previous,
      id: editionId(id), filename, effectiveFrom: editionDate, version: editionDate,
      url: documentRoot + document.endpoint, sha256: document.sha256,
      physicalPages: [1, document.pages],
      ...(previous.productVersion && { productVersion: editionDate }),
      ...(id === "frendeInnboUhell" && { documentName: "Vilkår for innboforsikring – Uhell punkt 10" }),
    };
  }

  const currentReference = (source: CatalogFact["source"]): CatalogFact["source"] => {
    const document = sourceDocuments.get(source.documentId);
    if (!document) return source;
    const registered = sources[editionId(source.documentId)];
    const [page, section] = frendeReferenceChanges[document.group][source.page + ":" + source.section] ??
      [source.page, source.section];
    return { ...source, documentId: registered.id, page, section, filename: registered.filename,
      effectiveFrom: registered.effectiveFrom, version: registered.version, url: registered.url };
  };

  const updatedComponents = new Set<string>();
  for (const [componentId, rows] of Object.entries(facts)) {
    if (!rows.some(row => sourceDocuments.has(row.source.documentId) ||
      (row.qualificationSource && sourceDocuments.has(row.qualificationSource.documentId)))) continue;
    updatedComponents.add(componentId);
    facts[editionId(componentId)] = rows.filter(row => !(
      row.source.documentId === "private-valuables:frende" &&
      (row.key === "verdisak.oppgjor.brukt" || row.key === "verdisak.oppgjor.utbetaling")
    )).map(row => {
      const document = sourceDocuments.get(row.source.documentId);
      const source = currentReference(row.source);
      if (document?.group === "vehicle") return updatedVehicleFact({
        ...row, source,
        ...(row.qualificationSource && { qualificationSource: currentReference(row.qualificationSource) }),
      });
      if (document?.group === "contents" && (row.key === "brann.dekning" || row.key === "vann.dekning")) {
        source.page = 3;
        source.section = row.key === "brann.dekning" ? "4.1 nr. 1–2" : "4.1 nr. 3–5 (side 3–4)";
      }
      if (document?.group === "valuables" && row.key === "verdisak.sikkerhet.sykkel_tilbehor") {
        source.page = 4;
        source.section = "9 punkt 5";
      }
      if (componentId.startsWith("frende-hytte-") && row.key === "hytte.avtale.meldefrist") {
        return {
          ...row, label: "Skademelding og politianmeldelse",
          value: "Meld skaden snarest. Brann, tyveri, innbrudd og hærverk skal også meldes til politiet.",
          source: { ...source, page: 5, section: "5.1 Skademelding" },
        };
      }
      return {
        ...row, source,
        value: document ? updatedValue(row, document) : row.value,
        ...(row.qualificationSource && { qualificationSource: currentReference(row.qualificationSource) }),
      };
    });
  }

  function addRow(componentId: string, documentId: string, row: Omit<CatalogFact, "source">, page: number, section: string) {
    const source = sources[editionId(documentId)];
    facts[editionId(componentId)].push({
      ...row, source: { documentId: source.id, filename: source.filename, company: source.company,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom, url: source.url,
        version: source.version, page, section },
    });
  }

  addRow("frendeInnboStandard", "frendeInnboStandard", {
    key: "innbo.fryserinnhold.dekning", label: "Matvarer ved temperaturstigning",
    value: "Utilsiktet temperaturstigning i fryser som skader matvarene, samt luktskade på fryseren.",
    coverageAvailability: "included",
  }, 4, "4.1 nr. 8");

  for (const [componentId, documentId, prefix] of [
    ["frendeHusStandard", "frendeHusStandard", "hus"],
    ["frende-hytte-standard", "cabin:frende:building", "hytte"],
    ["frende-hytte-utvidet", "cabin:frende:building", "hytte"],
  ] as const) {
    if (prefix === "hytte") {
      addRow(componentId, documentId, {
        key: "hytte.krav.meldefrist", label: "Frist for skademelding",
        value: "Krav må meldes innen ett år etter at sikrede fikk kunnskap om forholdene som begrunner kravet. Retten til erstatning faller bort hvis fristen oversittes.",
      }, 15, "14 Frist for å melde krav");
    }
    addRow(componentId, documentId, {
      key: prefix + ".skadedyr.verdibegrensning", label: "Skadedyr – erstatning ved manglende bruk",
      value: "For ubebodd eller fraflyttet bygning, eller bygning som ikke brukes regelmessig, er erstatningen under standard skadedyrforsikring begrenset til tap i markedsverdi.",
    }, 5, "5.3, jf. 4.2 (side 3)");
    addRow(componentId, documentId, {
      key: prefix + ".egenandel.sprengning", label: "Sprengningsskade – ekstra egenandel",
      value: "6 000 kr i tillegg til ordinær egenandel ved skade fra sprengningsarbeid på forsikringsstedet.",
      deductibleClassification: "coverage",
    }, 8, "5.14");
  }

  addRow("person:frende-person-ulykke", "person:frende-person-ulykke", {
    key: "person.ulykke.unntak.kampsport", label: "Kampsport – unntak",
    value: "Ulykker under boksing, bryting, judo, karate eller annen kampsport er unntatt.",
  }, 3, "4.2 punkt 3");
  addRow("person:frende-person-ulykke", "person:frende-person-ulykke", {
    key: "person.ulykke.meldefrist", label: "Frist for å melde krav",
    value: "Krav meldes snarest og senest ett år etter at sikrede fikk kunnskap om forholdene som begrunner kravet.",
  }, 7, "11");
  addRow("person:frende-person-ulykke", "person:frende-person-ulykke", {
    key: "person.ulykke.psykisk_invaliditet", label: "Medisinsk invaliditet ved psykisk skade",
    value: "Sjokk og andre psykiske skader er som hovedregel unntatt. PTSD kan dekkes når ICD-10 F43.1 er oppfylt og sjokkskaden følger av en fysisk skade som gir livsvarig medisinsk invaliditet Frende erstatter.",
    coverageAvailability: "included",
  }, 3, "4.1 punkt 3");
  addRow("person:frende-person-ulykke", "person:frende-person-ulykke", {
    key: "person.ulykke.invaliditet.ved_dodsfall", label: "Invaliditetserstatning ved dødsfall etter en ulykke",
    value: "Dør forsikrede av ulykken før invaliditetsgraden er fastsatt, utbetales forsikringssummen bare hvis dødsfallsdekning er avtalt. Tidligere invaliditetserstatning for samme skade trekkes fra dødsfallserstatningen.",
  }, 4, "5.3 og 6.5");

  for (const componentId of ["frende-snoscooter-brann-og-tyveri", "frende-snoscooter-kasko"]) {
    addRow(componentId, "vehicle:frende-SnowmobileInsurance.pdf", {
      key: "snoscooter.tyveri.oppgjor", label: "Tyveri av snøscooter – erstatningsoppgjør",
      value: "Markedsverdi hvis tilsvarende snøscooter kjøpes innen 60 dager etter tyveriet. Uten gjenanskaffelse erstattes 60 % av markedsverdien. Snøscooteren regnes tidligst som tapt etter 30 dager.",
    }, 7, "11.6 (fortsetter på PDF-side 8)");
  }

  addRow("frendeKasko", "frendeKasko", {
    key: "kasko.begrensning", label: "Kasko – unntak og begrensninger",
    value: vehicleKaskoExclusions,
  }, 4, "6.2, jf. 15 (PDF-side 13)");

  addRow("frende-bobil-utvidet", "mcb-ff-frende-bobil-terms", {
    key: "bobil.fukt.sikkerhet", label: "Fukt og råte – krav til fukttest",
    value: "Maksimalt 12 måneder mellom fukttester utført og godkjent av autorisert caravanforhandler. Ved anmerkninger eller funn skal nødvendige tiltak gjennomføres.",
  }, 14, "18.1 nr. 11");

  for (const level of ["brann-og-tyveri", "kasko", "utvidet"]) {
    addRow("frende-bat-" + level, "boat-pet:frende:båt", {
      key: "bat.konkurranse.begrensning", label: "Konkurranser og fartsprøver",
      value: "Konkurranser og fartsprøver er omfattet av en bruksbegrensning. Begrensningen gjelder ikke seilbåt eller båt uten motor. Vilkåret angir når erstatning kan falle bort ved brudd.",
    }, 11, "15 nr. 1");
  }

  const currentComponent = (id: string) => updatedComponents.has(id) ? editionId(id) : id;
  return {
    products: products.map(product => {
      const primary = product.sourceId === "frendeIpid" && product.productId.startsWith("frende-bil-")
        ? "frendeTerms" : product.sourceId;
      if (!primary || !sourceDocuments.has(primary)) return product;
      return { ...product, version: editionDate, sourceId: editionId(primary),
        componentIds: product.componentIds?.map(currentComponent) };
    }),
    addOns: addOns.map(addOn => {
      const componentId = currentComponent(addOn.componentId);
      return componentId === addOn.componentId ? addOn : { ...addOn, componentId };
    }),
  };
}
