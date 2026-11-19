import type { CatalogFact, CatalogSource } from "./product-catalog.ts";
import {
  SPAREBANK1_FREMTIND_URLS,
  sparebank1FremtindAddOns,
  sparebank1FremtindFacts,
  sparebank1FremtindProducts,
  sparebank1FremtindSources,
} from "./sparebank1-fremtind-catalog.ts";

const documents = {
  sp1Delkasko: {
    key: "delkasko", filename: "minikasko.pdf", number: "PMO-357.210-013", date: "2026-09-24",
    pages: [4, 7], sha256: "3ca7b4f39b08b4aba1003023f35c5b97a86b5d0776a2f5c5f89b9890933f4537",
  },
  sp1Kasko: {
    key: "kasko", filename: "kasko.pdf", number: "PMO-357.220-007", date: "2025-09-18",
    pages: [7, 8], sha256: "63a859a5de71d44f7a22bfd0a079107b0798e7c3af20990e7f9cebd829f51303",
  },
  sp1Toppkasko: {
    key: "toppkasko", filename: "toppkasko-bil.pdf", number: "PMO-350.200-016", date: "2025-09-18",
    pages: [8, 9], sha256: "d200a7f0afd8842661d952785d9c0b19ec69f7b13ae36f1d11139633c8023989",
  },
  sp1Leiebil: {
    key: "leiebil", filename: "leiebil.pdf", number: "PMO-350.402-004", date: "2026-09-24",
    pages: [1, 1], sha256: "6b5c71e898b670c5ef613946c1b6b77e19839bebfb30bd369190aadd1f227f14",
  },
  sp1Maskinskade: {
    key: "maskinskade", filename: "maskinskade.pdf", number: "PMO-350.201-002", date: "2026-09-24",
    pages: [1, 2], sha256: "58a5d4c44501599038fa64e8e90653378cbec0ad28049aa912fb7acfea8a70a3",
  },
} as const;

type RevisedComponent = keyof typeof documents;
const components = Object.keys(documents) as RevisedComponent[];
const currentSources = Object.fromEntries(components.map(component => {
  const { key, filename, number, date, pages, sha256 } = documents[component];
  return [component, {
    ...sparebank1FremtindSources[component],
    id: "sp1-market-bil-" + key, filename, termsNumber: number, effectiveFrom: date, sha256,
    url: SPAREBANK1_FREMTIND_URLS[key],
    insuranceType: "Bil", providerId: "sparebank1-fremtind", agreementScope: "ordinary",
    sourceType: "full_terms", physicalPages: pages,
  } satisfies CatalogSource];
}));

export const sparebank1FremtindBilMarketArchives = components.map(component => {
  const { key, filename } = documents[component];
  const { id, effectiveFrom, url } = currentSources[component];
  return {
    provider: "fremtind", slug: "bil-" + key + "-20260924",
    archivePath: "catalog/sources/fremtind/current-20260924/" + filename,
    sources: [[id, effectiveFrom, url] as const],
  };
});

type RevisedFact = {
  value?: string;
  page?: number;
  section?: string;
  qualification?: readonly [page: number, section: string];
};

const revisedFacts: Partial<Record<RevisedComponent, Record<string, RevisedFact>>> = {
  sp1Delkasko: {
    "glass.dekning": {
      value: "Reparasjon eller skifte av glass ved bruddskade på rute, glasstak eller takluke. Solcellepanel er unntatt. Ved skifte erstattes inntil 50 % av bilens markedsverdi.",
      section: "2.3 Glass", qualification: [6, "3.5 Erstatningsregler for glasskader"],
    },
    "tyveri.dekning": { section: "2.2 Tyveri", qualification: [6, "3.4 Erstatningsregler for tyveri og underslag"] },
    "veihjelp.dekning": {
      page: 4, section: "2.4.1 Persontransport", qualification: [5, "2.4.2 Transport av kjøretøy"],
    },
    "reparasjon.garanti": {
      value: "8 år for privatbil med totalvekt inntil 3 500 kg ved reparasjon på Fremtinds avtaleverksted. Glass og slitasjedeler er unntatt. Garantien gjelder utbedring av feil og mangler som følge av reparasjoner utført etter 01.01.2023, fra dagen bilen utleveres fra verkstedet. Leiebil ved garantireparasjon dekkes med inntil 600 kr per dag i inntil 45 dager. Veihjelp følger gjeldende vilkår. Reklamasjon til både verkstedet og Fremtind snarest og senest innen to måneder etter at en mulig mangel er oppdaget.",
    },
  },
  sp1Kasko: {
    "kasko.dekning": { page: 7, section: "1.1 Kaskoskade", qualification: [8, "1.1 Kaskoskade – fortsatt"] },
  },
  sp1Toppkasko: {
    "ladekabel.dekning": { page: 8 },
    "ladekabel.grense": { page: 8 },
    "interiorrens.grense": { page: 8 },
    "parkering.dekning": { page: 8 },
    "parkering.alder": { page: 8 },
    "bonus.parkert": { page: 8 },
  },
  sp1Maskinskade: {
    "maskinskade.el": {
      value: "Høyvoltsbatteri, spenningsomformer (DC/DC), strømveksler, fabrikkmontert batterilader, el-motor og dens girkasse, styreenhet for el-motor og høyvoltsbatteri, ladekontakten og dens stillmotor, PTC-varmer med varmefunksjon mot høyvoltsbatteriet og AC-klimakompressor med kjøle- og/eller varmefunksjon mot høyvoltsbatteriet.",
    },
    "maskinskade.batteri.fradrag": {
      value: "Ved reparasjon eller skifte av høyvoltsbatteri er fradraget 10 % av erstatningskostnadene når bilen er 5 år. Fradraget øker med 10 prosentpoeng per år til maksimalt 50 %. Egenandelen trekkes etter fradraget. Hvis likeverdige deler kan brukes, trekkes bare egenandelen.",
      qualification: [2, "2.1 Erstatningsregler for høyvoltsbatteri – fortsatt"],
    },
    "maskinskade.unntak": {
      value: "Blant annet skader som fører til eller skyldes forhøyet oljeforbruk, varmgang, frost, irr eller fukt, skader som skyldes slitasje og utvikles gradvis, skader andre er ansvarlige for ved garanti eller reklamasjon, ikke godkjent tuning eller ombygging og komponenter som ikke er uttrykkelig nevnt.",
    },
  },
};

function currentFacts(component: RevisedComponent): CatalogFact[] {
  const document = currentSources[component];
  return sparebank1FremtindFacts[component].map(fact => {
    const change = revisedFacts[component]?.[fact.key];
    const source = {
      ...fact.source, documentId: document.id, filename: document.filename, termsNumber: document.termsNumber,
      effectiveFrom: document.effectiveFrom, url: document.url, agreementScope: "ordinary" as const,
      page: change?.page ?? fact.source.page, section: change?.section ?? fact.source.section,
    };
    return {
      ...fact, value: change?.value ?? fact.value, source,
      ...(change?.qualification ? {
        qualificationSource: { ...source, page: change.qualification[0], section: change.qualification[1] },
      } : {}),
    };
  });
}

const products = sparebank1FremtindProducts
  .filter(product => product.componentIds?.some(component => component in currentSources))
  .map(product => ({
    ...product,
    componentIds: product.componentIds?.map(component => currentSources[component]?.id ?? component),
  }));

const addOns = sparebank1FremtindAddOns.map(addOn => ({
  ...addOn, componentId: currentSources[addOn.componentId].id,
}));

export const sparebank1FremtindBilMarket = {
  replacesProductIds: products.map(product => product.productId),
  replacesAddOnIds: addOns.map(addOn => addOn.id),
  products,
  sources: Object.fromEntries(components.map(component => [currentSources[component].id, currentSources[component]])),
  facts: Object.fromEntries(components.map(component => [currentSources[component].id, currentFacts(component)])),
  addOns,
};
