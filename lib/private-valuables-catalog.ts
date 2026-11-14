import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

const type = "Verdisak";
const checked = "2026-11-14";

const labels = {
  "verdisak.gjenstand": "Hva er forsikret?",
  "verdisak.omrade": "Hvor gjelder forsikringen?",
  "verdisak.uhell": "Plutselig skade og uhell",
  "verdisak.tyveri": "Tyveri",
  "verdisak.tap": "Tap av gjenstand",
  "verdisak.forsikringssum": "Forsikringssum",
  "verdisak.egenandel": "Ordinær egenandel",
  "verdisak.sykkel.egenandel": "Egenandel for sykkel",
  "verdisak.sykkel.aldersfradrag": "Aldersfradrag for sykkel",
  "verdisak.aldersfradrag": "Verdiforringelse og aldersfradrag",
  "verdisak.grense.biltyveri": "Tyveri fra bil",
  "verdisak.vilkar.utleie": "Utleie av gjenstanden",
  "verdisak.sikkerhet": "Sikkerhetsforskrifter",
} as const;

type FactInput = {
  key: keyof typeof labels;
  page: number;
  section: string;
  value: string;
  document?: string;
  coverageAvailability?: CatalogFact["coverageAvailability"];
  deductibleClassification?: CatalogFact["deductibleClassification"];
};

type DocumentInput = Pick<CatalogSource, "filename" | "documentName" | "termsNumber" | "effectiveFrom" |
  "url" | "sha256" | "physicalPages" | "productCode"> & {
  certificatePages?: readonly [firstPage: number, lastPage: number];
  sourceType?: CatalogSource["sourceType"];
  version?: string;
};

type ProviderInput = {
  company: string;
  providerId: string;
  name: string;
  version: string | null;
  documents: Record<string, DocumentInput>;
  facts: FactInput[];
};

const providers: ProviderInput[] = [
  {
    company: "Tryg",
    providerId: "tryg",
    name: "Verdigjenstand",
    version: "2026-07-01",
    documents: {
      terms: {
        filename: "tryg-verdisak-dekning.pdf",
        documentName: "Verdigjenstand – dekningsvilkår",
        termsNumber: "PPK41001",
        effectiveFrom: "2026-07-01",
        version: "2026-07-01",
        url: "https://www.tryg.no/odpdf?vilk=Verdigjenstandforsikring-Dekningsvilkaar&vilkNr=05PPK41001",
        sha256: "779dea13130c94982bcea454f21b40ad138d24811feda0b351aca7c5e5b0d55b",
        physicalPages: [1, 2],
      },
      product: {
        filename: "tryg-verdisak-produkt.pdf",
        documentName: "Verdigjenstand – produktvilkår",
        termsNumber: "PPK41000",
        effectiveFrom: "2026-01-01",
        version: "2026-01-01",
        url: "https://www.tryg.no/odpdf?vilk=Verdigjenstandforsikring-Produkt&vilkNr=05PPK41000",
        sha256: "b5131e6419f300b549b6584ea3d48a5dcf5d23ebcd77619412b00a2242c06914",
        physicalPages: [1, 1],
      },
      safety: {
        filename: "tryg-verdisak-sikkerhet.pdf",
        documentName: "Verdigjenstand – sikkerhetsforskrifter",
        termsNumber: "",
        effectiveFrom: "",
        url: "https://www.tryg.no/odpdf?vilk=Verdigjenstandforsikring-Sikkerhetsforskrift&vilkNr=05000PF410",
        sha256: "00a62b9bc4932f1424b321f65c1ac94216c9d3795ecc56d513578247f854b892",
        physicalPages: [1, 2],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 1, section: "1", value: "Gjenstandene oppført i forsikringsbeviset." },
      { key: "verdisak.omrade", page: 1, section: "3", document: "product",
        value: "Hele verden dersom forsikringsbeviset ikke avgrenser området." },
      { key: "verdisak.uhell", page: 1, section: "2.1", coverageAvailability: "included",
        value: "Dekker plutselig skade. Blant unntakene er komponentsvikt, slitasje og avskalling eller riper som bare rammer glass eller plast." },
      { key: "verdisak.forsikringssum", page: 1, section: "1",
        value: "Forsikringstaker velger summen. Beløpet i forsikringsbeviset er øvre grense." },
      { key: "verdisak.egenandel", page: 1, section: "3.2", deductibleClassification: "standard",
        value: "10 % av skaden, minst 1 000 kr." },
      { key: "verdisak.sykkel.egenandel", page: 1, section: "3.2", deductibleClassification: "coverage",
        value: "10 % av skaden, minst 2 000 kr. Ved tyveri uten egenandel hvis sykkelen har integrert GPS-sporing med alarm." },
      { key: "verdisak.aldersfradrag", page: 2, section: "3.3 – Verditap",
        value: "Fradrag for alder, bruk og nedsatt anvendelighet dersom verditapet er minst en tredjedel av reparasjons- eller gjenanskaffelsesprisen." },
      { key: "verdisak.vilkar.utleie", page: 2, section: "2.1 – Utleie og utlån", document: "safety",
        value: "Vilkårene forbyr utleie og utlån, med unntak for utlån til nærmere angitte familiemedlemmer og sikredes ansatte." },
      { key: "verdisak.sikkerhet", page: 1, section: "1.2", document: "safety",
        value: "Hold gjenstanden under oppsyn eller lås den inne. Sykkel og elsykkel må låses når de forlates uten tilsyn." },
    ],
  },
  {
    company: "If",
    providerId: "if",
    name: "Verdisakforsikring",
    version: "VSK1-8",
    documents: {
      terms: {
        filename: "if-verdisak.pdf",
        documentName: "Verdisakforsikring",
        termsNumber: "VSK1-8",
        effectiveFrom: "2023-06",
        version: "VSK1-8",
        url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Verdisaksforsikring",
        sha256: "3eebd6c473bd5488e9834c89afd224c38501f9dfd33cf3c10a768ddeb3bdb746",
        physicalPages: [1, 6],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 2, section: "3",
        value: "Gjenstander i kategorien som er oppført i forsikringsbeviset. Gjenstander med gjenanskaffelsespris under 1 000 kr på skadedagen erstattes ikke." },
      { key: "verdisak.omrade", page: 2, section: "2",
        value: "Hele verden dersom forsikringsbeviset ikke avgrenser området." },
      { key: "verdisak.uhell", page: 3, section: "4", coverageAvailability: "included",
        value: "Fysisk skade fra en plutselig ytre årsak. Vilkårene unntar blant annet slitasje og feil ved gjenstanden." },
      { key: "verdisak.tap", page: 3, section: "4", coverageAvailability: "included",
        value: "Tap kan dekkes når årsaken er kjent og tapet kan knyttes til et bestemt tidspunkt." },
      { key: "verdisak.forsikringssum", page: 3, section: "5.1",
        value: "Erstatningen begrenses til summen i forsikringsbeviset for kategorien." },
      { key: "verdisak.egenandel", page: 4, section: "5.4", deductibleClassification: "standard",
        value: "500 kr per skadetilfelle, med mindre et annet beløp er avtalt eller fastsatt i vilkårene." },
      { key: "verdisak.aldersfradrag", page: 3, section: "5",
        value: "Fradrag for alder, bruk og nedsatt anvendelighet vurderes ut fra gjenstandens forventede brukstid." },
      { key: "verdisak.vilkar.utleie", page: 3, section: "4", coverageAvailability: "unavailable",
        value: "Skade som oppstår mens gjenstanden er leid ut, er unntatt." },
      { key: "verdisak.sikkerhet", page: 5, section: "6.4.1",
        value: "Sykkelen må låses når den står ubrukt. Tilbehør som enkelt kan tas av, må tas med når sykkelen forlates." },
    ],
  },
  {
    company: "Gjensidige",
    providerId: "gjensidige",
    name: "Verdigjenstander Pluss",
    version: null,
    documents: {
      terms: {
        filename: "gjensidige-verdisak-pluss.pdf",
        documentName: "Verdigjenstand Pluss – alminnelige vilkår og eksempel på forsikringsbevis",
        termsNumber: "",
        effectiveFrom: "",
        url: "https://www.gjensidige.no/files/privat/vilkar/bolig-innbo-og-verdier/Verdigjenstand-Pluss-alminnelige-vilkar.pdf",
        sha256: "5539d7fed69485b306b28da9fa09fc783209770289e96cc42bb6f4d143f78701",
        physicalPages: [1, 7],
        certificatePages: [1, 2],
      },
      ipid: {
        filename: "gjensidige-verdisak-ipid.pdf",
        documentName: "Produktark Verdigjenstandsforsikring",
        termsNumber: "",
        effectiveFrom: "",
        productCode: "EAP16",
        sourceType: "ipid",
        url: "https://www.gjensidige.no/ipid/gfno/EAP16",
        sha256: "a43f19bad025594ab91e32f47e134816b5ade99a1f396128f33e5bca0eb23312",
        physicalPages: [1, 2],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 2, section: "Hva er forsikret?",
        value: "Gjenstander som står i forsikringsbeviset. Registreringspliktige motorvogner eller motorvogner konstruert for over 25 km/t er unntatt." },
      { key: "verdisak.omrade", page: 2, section: "Hvor gjelder forsikringen?", document: "ipid",
        value: "Produktarket oppgir at gjenstandsforsikringen gjelder i hele verden." },
      { key: "verdisak.uhell", page: 2, section: "Hvilke skader?", coverageAvailability: "included",
        value: "Plutselige og uforutsette skader. Årsak og skadetidspunkt må være kjent." },
      { key: "verdisak.tap", page: 2, section: "Hvilke skader?",
        value: "Gjenglemte og bortrotede gjenstander er unntatt. Det samme gjelder skade med ukjent årsak eller tidspunkt." },
      { key: "verdisak.forsikringssum", page: 7, section: "Hvordan erstatningen blir beregnet",
        value: "Erstatningen kan ikke overstige forsikringssummen." },
      { key: "verdisak.egenandel", page: 7, section: "Egenandel", deductibleClassification: "standard",
        value: "1 000 kr per skadeoppgjør." },
      { key: "verdisak.sykkel.aldersfradrag", page: 7, section: "Erstatningsgrunnlag",
        value: "For nyanskaffet sykkel og elsykkel trekkes 10 % per påbegynt år fra den er tre år, maksimalt 80 %. Ved reparasjon gjøres det ikke fradrag." },
      { key: "verdisak.aldersfradrag", page: 7, section: "Erstatningsgrunnlag",
        value: "PC, nettbrett, smartklokker, datautstyr og briller har 10 % aldersfradrag fra ett år. For blant annet kamera og øvrig elektronikk starter fradraget ved tre år. Maks 80 %." },
      { key: "verdisak.vilkar.utleie", page: 2, section: "Hvilke skader?", coverageAvailability: "unavailable",
        value: "Skade under utleie, messe eller utstilling er unntatt." },
      { key: "verdisak.sikkerhet", page: 1, section: "Sikkerhetsforskrifter",
        value: "Sykkel og elsykkel må låses fast eller låses inne. Sykkel, sykkeltilhenger og elsparkesykkel over 15 000 kr må sikres med FG-godkjent lås." },
    ],
  },
  {
    company: "Storebrand",
    providerId: "storebrand",
    name: "Verdisakforsikring",
    version: "verdi04",
    documents: {
      terms: {
        filename: "storebrand-verdisak.pdf",
        documentName: "Vilkår for verdisak",
        termsNumber: "verdi04",
        effectiveFrom: "2024-10-15",
        version: "verdi04",
        url: "https://www.storebrand.no/privat/forsikring/verdisakforsikring/_/attachment/inline/37c262f4-8511-4b45-b571-2a3677fb622e:1d84110907d9b75e5cff2039abb8462f40e22446/vilkar-verdisakforsikring.pdf",
        sha256: "f931b6459295d4417ecd296a81340a4d39916ffee90e5cbf8e270273d10e4809",
        physicalPages: [1, 9],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 3, section: "B.3",
        value: "Gjenstander som er spesifisert i forsikringsbeviset. Flere gjenstander i samme kategori kan dele forsikringssum." },
      { key: "verdisak.omrade", page: 2, section: "B.2",
        value: "Hele verden dersom forsikringsbeviset ikke avgrenser området." },
      { key: "verdisak.uhell", page: 3, section: "B.4.1", coverageAvailability: "included",
        value: "Plutselige og uforutsette skader med kjent årsak og et bestemt skadetidspunkt. Gjenstanden må kunne vises fram." },
      { key: "verdisak.tyveri", page: 4, section: "B.4.2", coverageAvailability: "included",
        value: "Tyveri omfattes når det er kjent hvordan og når det skjedde." },
      { key: "verdisak.tap", page: 4, section: "B.4.2", coverageAvailability: "included",
        value: "Tap omfattes når hendelsen har kjent årsak og tidspunkt. Egne sikkerhetsforskrifter gjelder." },
      { key: "verdisak.forsikringssum", page: 5, section: "B.5.1",
        value: "Forsikringssummen er maksimal erstatning per hendelse." },
      { key: "verdisak.egenandel", page: 6, section: "B.5.3", deductibleClassification: "standard",
        value: "1 000 kr med mindre forsikringsbeviset eller vilkårene fastsetter noe annet." },
      { key: "verdisak.sykkel.egenandel", page: 6, section: "B.5.3", deductibleClassification: "coverage",
        value: "0 kr ved tyveri når sykkelen har integrert GPS-sporing med alarm." },
      { key: "verdisak.sykkel.aldersfradrag", page: 5, section: "B.5.2",
        value: "Fem fradragsfrie år, deretter 20 % per påbegynt år, maksimalt 80 % etter tabellen." },
      { key: "verdisak.aldersfradrag", page: 5, section: "B.5.2",
        value: "Datautstyr og nettbrett får 20 % fradrag per påbegynt år etter ett fradragsfritt år. Kamera og øvrig elektronikk får 10 % etter tre fradragsfrie år. Maks 80 %." },
      { key: "verdisak.grense.biltyveri", page: 4, section: "B.4.2",
        value: "Inntil 10 000 kr ved tyveri fra bilens kupé om natten eller fra bil som har stått parkert mer enn ett døgn." },
      { key: "verdisak.vilkar.utleie", page: 4, section: "B.4.2", coverageAvailability: "unavailable",
        value: "Tyveri og tap under utleie, messe eller utstilling er unntatt." },
      { key: "verdisak.sikkerhet", page: 8, section: "B.6",
        value: "Sykkelen må låses, nøkkelen oppbevares separat og lett avtakbart utstyr tas med når sykkelen står utenfor låst bygning." },
    ],
  },
  {
    company: "Fremtind",
    providerId: "fremtind",
    name: "Verdisakforsikring",
    version: "PBK-230.100-007",
    documents: {
      terms: {
        filename: "fremtind-verdisak.pdf",
        documentName: "Verdisakforsikring",
        termsNumber: "PBK-230.100-007",
        effectiveFrom: "2025-01-01",
        version: "PBK-230.100-007",
        url: "https://dokument.fremtind.no/vilkar/fremtind/pm/eiendom/Vilkar_Verdisak.pdf",
        sha256: "4318f0856972300347a2e3a67714c3be544b4e2c1130c266815c9130a4a75375",
        physicalPages: [1, 3],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 1, section: "3.1",
        value: "Gjenstandene som er angitt i forsikringsbeviset. Gjenstander som er innført i strid med toll- og avgiftsreglene er unntatt." },
      { key: "verdisak.omrade", page: 1, section: "2", value: "Hele verden." },
      { key: "verdisak.uhell", page: 1, section: "4.1", coverageAvailability: "included",
        value: "Tilfeldig og plutselig ytre skade. Vilkårene unntar blant annet kosmetiske merker, feil og slitasje." },
      { key: "verdisak.tap", page: 1, section: "4.1", coverageAvailability: "included",
        value: "Tap av den forsikrede gjenstanden omfattes når årsaken er kjent og hendelsen kan tidfestes." },
      { key: "verdisak.forsikringssum", page: 1, section: "3.1",
        value: "Gjenstandene er forsikret med summene som fremgår av forsikringsbeviset." },
      { key: "verdisak.egenandel", page: 2, section: "6–6.1", deductibleClassification: "standard",
        value: "1 000 kr etter standardvilkåret. Høyeste egenandel trekkes hvis flere bestemmelser gjelder samme skade." },
      { key: "verdisak.sykkel.aldersfradrag", page: 2, section: "5.3",
        value: "Sykkel og elsykkel har tre fradragsfrie år. Deretter trekkes 10 % per påbegynt år, maksimalt 80 %." },
      { key: "verdisak.aldersfradrag", page: 2, section: "5.3",
        value: "Blant annet høreapparat, bærbar datamaskin og briller har 10 % fradrag etter ett fradragsfritt år. Mobil og nettbrett har 20 %. Maks 80 %." },
      { key: "verdisak.grense.biltyveri", page: 1, section: "4.1",
        value: "Inntil 10 000 kr ved tyveri fra bilens kupé om natten eller fra et kjøretøy som har stått mer enn ett døgn." },
      { key: "verdisak.vilkar.utleie", page: 1, section: "4.1", coverageAvailability: "unavailable",
        value: "Skader i forbindelse med utleie er unntatt." },
    ],
  },
  {
    company: "Frende",
    providerId: "frende",
    name: "Verdigjenstandsforsikring",
    version: "2026-01-01",
    documents: {
      terms: {
        filename: "frende-verdisak.pdf",
        documentName: "Vilkår for verdigjenstandsforsikring",
        termsNumber: "",
        effectiveFrom: "2026-01-01",
        version: "2026-01-01",
        url: "https://api.frende.no/documents/terms/public/pnc/ValuablesInsurance",
        sha256: "8d4fa8381e2897b7638805d0d7856eeef64288b56db8851f3b5f8f4ff8bb1f62",
        physicalPages: [1, 4],
      },
    },
    facts: [
      { key: "verdisak.gjenstand", page: 2, section: "3",
        value: "Gjenstandene i forsikringsbeviset. For sykkel omfattes også påmontert tilbehør og sykkelhjelm." },
      { key: "verdisak.omrade", page: 2, section: "2", value: "Hele verden." },
      { key: "verdisak.uhell", page: 2, section: "4", coverageAvailability: "included",
        value: "Plutselig og uventet skade med kjent årsak og tidspunkt. Skade på motor og drivverk på elsykkel må også ha en ytre årsak." },
      { key: "verdisak.tyveri", page: 2, section: "4", coverageAvailability: "included",
        value: "Tyveri av gjenstanden omfattes." },
      { key: "verdisak.forsikringssum", page: 2, section: "6.3",
        value: "Erstatningen kan ikke overstige forsikringssummen i forsikringsbeviset." },
      { key: "verdisak.egenandel", page: 3, section: "6.6", deductibleClassification: "standard",
        value: "10 % av skaden, minst 500 kr." },
      { key: "verdisak.sykkel.egenandel", page: 3, section: "6.6", deductibleClassification: "coverage",
        value: "2 000 kr." },
      { key: "verdisak.aldersfradrag", page: 3, section: "6.4",
        value: "For datautstyr og mobiltelefon trekkes 20 % per år gjenstanden er eldre enn ett år, maksimalt 80 %. Ellers vurderes blant annet alder, brukstid og slitasje." },
      { key: "verdisak.vilkar.utleie", page: 3, section: "8", coverageAvailability: "unavailable",
        value: "Vilkårene unntar skade når gjenstanden er leid eller lånt ut." },
      { key: "verdisak.sikkerhet", page: 4, section: "9 punkt 5",
        value: "Sykkel skal låses, nøkkelen oppbevares separat og lett avtakbart tilbehør fjernes når sykkelen forlates utenfor en låst bygning." },
    ],
  },
];

export const valuablesProducts: CatalogProduct[] = [];
export const valuablesFacts: Record<string, CatalogFact[]> = {};
export const valuablesSources: Record<string, CatalogSource> = {};

for (const { company, providerId, name, version, documents, facts } of providers) {
  const productId = providerId === "gjensidige" ? "gjensidige-verdisak-pluss" : providerId + "-verdisak";
  const componentId = "private-valuables:" + providerId;
  valuablesProducts.push({
    company, providerId, insuranceType: type, name, productId, version,
    agreementScope: "ordinary", sourceId: componentId, componentIds: [componentId],
  });

  const sources: Record<string, CatalogSource> = {};
  for (const [document, metadata] of Object.entries(documents)) {
    const id = document === "terms" ? componentId : componentId + ":" + document;
    const source: CatalogSource = {
      id, company, providerId, insuranceType: type, productIds: [productId],
      agreementScope: "ordinary", updatedAt: checked,
      filename: metadata.filename, documentName: metadata.documentName,
      termsNumber: metadata.termsNumber, effectiveFrom: metadata.effectiveFrom,
      url: metadata.url, sha256: metadata.sha256, physicalPages: metadata.physicalPages,
      version: metadata.version, productCode: metadata.productCode,
      sourceType: metadata.sourceType ?? "full_terms",
      ...(version ? { productVersion: version } : {}),
    };
    sources[document] = source;
    valuablesSources[id] = source;
  }

  valuablesFacts[componentId] = facts.map(({ document = "terms", key, page, section, ...fact }) => {
    const source = sources[document];
    const certificatePages = documents[document].certificatePages;
    return {
      ...fact, key, label: labels[key],
      source: {
        documentId: source.id, company, page, section, filename: source.filename, url: source.url,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom, agreementScope: "ordinary",
        ...(source.productCode ? { productCode: source.productCode } : {}),
        ...(source.version ? { version: source.version } : {}),
        ...(certificatePages && page >= certificatePages[0] && page <= certificatePages[1]
          ? { note: "Opplysningen gjelder det offentlig publiserte eksempelbeviset." } : {}),
      },
    };
  });
}
