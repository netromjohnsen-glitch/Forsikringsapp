import type { CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";
import type { personInsuranceTypes } from "./person-insurance-registry.ts";

const factKinds = {
  liv: { key: "person.liv.utbetaling", label: "Utbetaling ved dødsfall" },
  ulykke: { key: "person.ulykke.invaliditet", label: "Varig medisinsk invaliditet etter ulykke" },
  dodsulykke: { key: "person.ulykke.dodsfall", label: "Utbetaling ved dødsfall etter ulykke" },
  sykdom: { key: "person.sykdom.utbetaling", label: "Engangsutbetaling ved kritisk sykdom" },
  pensjon: { key: "person.ufore.pensjon", label: "Månedlig utbetaling ved arbeidsuførhet" },
  forskudd: { key: "person.ufore.forskudd", label: "Månedlig forskudd ved arbeidsuførhet" },
  kapital: { key: "person.ufore.kapital", label: "Engangsutbetaling ved varig arbeidsuførhet" },
  behandling: { key: "person.behandling.tilgang", label: "Tilgang til privat utredning og behandling" },
  ventetid: { key: "person.behandling.ventetid", label: "Frist for time hos legespesialist" },
  behandlingsfrist: { key: "person.behandling.forste_behandling", label: "Frist for første behandling" },
  operasjonsfrist: { key: "person.behandling.operasjon", label: "Frist for operasjon eller sykehusbehandling" },
  barnUlykke: { key: "person.barn.invaliditet", label: "Varig medisinsk invaliditet etter ulykke" },
  barnUtgifter: { key: "person.barn.ulykkesutgifter", label: "Behandlings- og reiseutgifter etter ulykke" },
  barnDodsulykke: { key: "person.barn.ulykkesdodsfall", label: "Utbetaling ved dødsfall etter ulykke" },
  barnSykdom: { key: "person.barn.sykdom", label: "Varig medisinsk invaliditet etter sykdom" },
  barnDiagnose: { key: "person.barn.diagnose", label: "Engangsutbetaling ved utvalgte diagnoser" },
  barnPensjon: { key: "person.barn.uforepensjon", label: "Månedlig uførepensjon" },
  barnKapital: { key: "person.barn.uforekapital", label: "Engangsutbetaling ved varig uførhet" },
  gravidUlykke: { key: "person.gravid.ulykke", label: "Varig medisinsk invaliditet etter ulykke" },
  gravidKomplikasjon: { key: "person.gravid.komplikasjoner", label: "Utbetaling ved graviditets- eller fødselskomplikasjon" },
  gravidDiagnose: { key: "person.gravid.medfodt", label: "Engangsutbetaling ved medfødt diagnose" },
  gravidSykehus: { key: "person.gravid.sykehus", label: "Utbetaling ved sykehusinnleggelse" },
  senior: { key: "person.senior.utbetaling", label: "Økonomisk førstehjelp" },
} as const;

type PersonTerms = {
  url: string;
  sha256: string;
  pages: number;
  edition?: string;
  effectiveFrom: string;
};

const terms: Record<string, PersonTerms> = {
  "tryg-ulykke": {
    url: "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Skade&vilkNr=05UUL41501",
    sha256: "b0faf320a63f716d457db4e7df6d65cb1116dc737deec1a3c2d7d00a7be8a64f", pages: 3,
    edition: "UUL41501", effectiveFrom: "2026-01-01",
  },
  "tryg-familieulykke": {
    url: "https://www.tryg.no/odpdf?vilk=Familieulykke-Dekningsvilkaar&vilkNr=05UUL41516",
    sha256: "d1fc8af992854d4a2d117d4fdcff7a5fa52978962b8edb1f797646f16fd06bc0", pages: 3,
    edition: "UUL41516", effectiveFrom: "2026-01-01",
  },
  "tryg-barn-ekstra": {
    url: "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Grunndekning&vilkNr=05UUL41701",
    sha256: "5aa5a1a2af33eeb0f38362f622ab86a72adab162d2c8fc6307d493b56883fc1f", pages: 8,
    edition: "UUL41701", effectiveFrom: "2026-01-01",
  },
  "tryg-barn-ulykke": {
    url: "https://www.tryg.no/odpdf?vilk=Barneulykke-Skade&vilkNr=05UUL41706",
    sha256: "27437b40a949b68f9b8428d8ae86a9d01d82724d219fdf114094f4cc71cb0584", pages: 4,
    edition: "UUL41706", effectiveFrom: "2026-01-01",
  },
  "tryg-kritisk": {
    url: "https://www.tryg.no/odpdf?vilk=kritisk-sykdom-Dekningsvilkaar&vilkNr=05UUL41901",
    sha256: "f7a0564d03e7696fca71fc75e56c5fc13ba1d3053a46607f578cd6bbb19bf1dd", pages: 4,
    edition: "UUL41901", effectiveFrom: "2026-01-01",
  },
  "tryg-behandling": {
    url: "https://www.tryg.no/odpdf?vilk=Behandlingsforsikring-Dekningsvilkaar&vilkNr=05UUL41801",
    sha256: "361cfc2649688760a7f22c963b5a3e3ec619e1798c3f28e5bf9c5f33e9edd51e", pages: 8,
    edition: "UUL41801", effectiveFrom: "2025-01-01",
  },
  "tryg-behandling-enkel": {
    url: "https://www.tryg.no/odpdf?vilk=Behandling-enkel-Dekningsvilkaar&vilkNr=05UUL41808",
    sha256: "07b087434a221bbce2360e398c7f99d27e92030b9d041b58796d052f3cc72dff", pages: 6,
    edition: "UUL41808", effectiveFrom: "2026-01-01",
  },
  "tryg-behandling-55": {
    url: "https://www.tryg.no/odpdf?vilk=55pluss-Dekningsvilkaar&vilkNr=05UUL41803",
    sha256: "3e4e918d28e3943fddbd63891d02892786aae7768ec3e5be8603663506456b16", pages: 5,
    edition: "UUL41803", effectiveFrom: "2025-01-01",
  },
  "tryg-gravid-gratis": {
    url: "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Gratis&vilkNr=05UUL41812",
    sha256: "02334247425da3c989e20dd7ea6d0b7e6192666226e10d4a90af7feb779ac36f", pages: 3,
    edition: "UUL41812", effectiveFrom: "2026-01-01",
  },
  "tryg-gravid-ekstra": {
    url: "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Ekstra&vilkNr=05UUL41813",
    sha256: "437122f68004fed8946784da64e4f772f0f0523490b68e900b839abae115cd77", pages: 5,
    edition: "UUL41813", effectiveFrom: "2026-01-01",
  },
  "tryg-gravid-premium": {
    url: "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Premium&vilkNr=05UUL41814",
    sha256: "7ef0564690a01bc17f58205991b1369e951a8c4bd0a97ad3040c7aa588a564f3", pages: 5,
    edition: "UUL41814", effectiveFrom: "2026-01-01",
  },
  "if-ulykke": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Ulykkesforsikring",
    sha256: "57992df59b6a25e2dec0f172ff5ef9e42980f29c7b11833299f6f032e79211a7", pages: 10,
    edition: "ULY5-6", effectiveFrom: "2017-03",
  },
  "if-liv": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Livsforsikring",
    sha256: "1cddb740a0576c041e6365dc85d27ee55c225f0019136d9cedfa72242f683e91", pages: 6,
    edition: "LIV1-5", effectiveFrom: "2025-08-23",
  },
  "if-ufore": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Uf%C3%B8reforsikring",
    sha256: "20f165f256a3d0113e4090de209a8734990e882de392ac42a320f707f52fca76", pages: 7,
    edition: "REN1-4", effectiveFrom: "2025-08-23",
  },
  "if-kritisk": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kritisk_sykdom",
    sha256: "90d54001856930103422d732d0c74e5d8b4abbf8909d8b8ee9898bce6b09b8e7", pages: 11,
    edition: "KRS1-4", effectiveFrom: "2025-08-23",
  },
  "if-helse": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Helseforsikring",
    sha256: "f76e894f9a659290528939cd09eebd4d1d6ea8c0d86bc28992f987384408d6cd", pages: 12,
    edition: "HEL1-6", effectiveFrom: "2025-08-23",
  },
  "if-barn": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Barneforsikring",
    sha256: "ac5392c0a252caa6bb4d02f2d6578fc7a5e3a73dfe429a81b212652942407e52", pages: 17,
    edition: "BAF2-4", effectiveFrom: "2024-06-08",
  },
  "if-barn-super": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Super_Barneforsikring",
    sha256: "e66f94b10875d88bfbe86b12f8f1d40296c7809a8defd7aee1a36ffa40db1b8c", pages: 7,
    edition: "SUB1-5", effectiveFrom: "2024-06-08",
  },
  "if-gravid-basis": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Basis_Gravidforsikring",
    sha256: "2ec7d29522c415f2d591f156827cd874310ef7f03640e77578954fffdfd52dec", pages: 8,
    edition: "GRO1-3", effectiveFrom: "2024-11-09",
  },
  "if-gravid-super": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Super_Gravidforsikring",
    sha256: "08132b98f9354bd32fca89b3ea2341e65ab093ea85d89e7ded215ba769e3f4c3", pages: 11,
    edition: "GRA1-4", effectiveFrom: "2024-11-09",
  },
  "if-senior": {
    url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Godt_voksen",
    sha256: "25f6e817184e7b6cf8bbaaaa8fd6e8a9f1fed6edf4f3817893eb405f5734f095", pages: 7,
    edition: "GOV5-2", effectiveFrom: "2018-11-10",
  },
  "gjensidige-ulykke": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/ulykkesforsikring-alminnelige-vilkar.pdf",
    sha256: "58813e7eacd82fb7857b1492d13fe78f4bd2cbc20e508fad402e12a40b31a42e", pages: 8,
    effectiveFrom: "",
  },
  "gjensidige-liv": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/livsforsikring-alminnelige-vilkar.pdf",
    sha256: "f5953afca57b80a5e98ece615a75bcdfdc3e7a8c9e1998fb794dc17d56edb40f", pages: 7,
    effectiveFrom: "",
  },
  "gjensidige-uforepensjon": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-alminnelige-vilkar.pdf",
    sha256: "4206c5e90e8197a6e19307910d192eec6931565c080e5449526cfd96b0a47e83", pages: 7,
    effectiveFrom: "",
  },
  "gjensidige-uforekapital": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/uforekapital-med-forskudd-alminnelige-vilkar.pdf",
    sha256: "19a1f146dcbf93b179a11b48a75f3d0dc62aa1cf03360f869317e659cf99d18c", pages: 8,
    effectiveFrom: "",
  },
  "gjensidige-kritisk": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/alvorlig-sykdom-alminnelige-vilkar.pdf",
    sha256: "b80c51894fc9ad81a03196eced2b14e475068a7aa4c400635d118739b3b15e67", pages: 9,
    effectiveFrom: "",
  },
  "gjensidige-behandling": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/behandlingsforsikring-alminnelige-vilkar.pdf",
    sha256: "c78f969145b2c2710291c3379cf7131c8e037420f5a5b4eb635572b84e183bfd", pages: 9,
    effectiveFrom: "",
  },
  "gjensidige-behandling-55": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/helse-55-alminnelige-vilkar.pdf",
    sha256: "30a97452acef8bfd9aa1d48aaf1f5dbe4e3c64cd97845bc056c5c2f98ea104fb", pages: 9,
    effectiveFrom: "",
  },
  "gjensidige-barn": {
    url: "https://www.gjensidige.no/files/privat/vilkar/person/Barneforsikring-alminnelige-vilkar.pdf",
    sha256: "9ba954e7929a2e5b9f180569fcc2c4c3f733e79ca57a81b8bc85571c1e2d5f56", pages: 12,
    effectiveFrom: "",
  },
  "storebrand-ulykke": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/3e1b926e-0e58-4b15-a9c1-1637fc2b7b59:221b60901d52789a10293bd326573274a35a9e8b/vilkar-ulykkeforsikring.pdf",
    sha256: "f9ff9a3717b5751572c5cd364cedfea46c7dfa21724c691cd98da06a2fc16c70", pages: 7,
    edition: "Ulykk02", effectiveFrom: "2012-01",
  },
  "storebrand-liv": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f1f0b02e-264b-40b1-8214-2df277e620d7:edc64da33a6263e4c4dd4d3da515dc6c9c47bdc9/vilkar-livsforsikring.pdf",
    sha256: "1ac04fa0ad48402de8cf049128be3c585b370dc4fcdf780350aad16e636ab680", pages: 7,
    edition: "Liv01", effectiveFrom: "2011-12",
  },
  "storebrand-ufore": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/d00efe44-86ce-435d-ab74-690317a302af:a8fa2197254b6d873bb2cfc2e861c2d0c167d159/vilkar-uforeforsikring-uf03.pdf",
    sha256: "cb330d65e5a400e3baad2726ad793c1ed1c14662737174304ffb45ae2d7e4b7e", pages: 12,
    edition: "UF03 2026-03-01", effectiveFrom: "2026-03-01",
  },
  "storebrand-kritisk": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/be9f85de-96f6-4842-9979-990e26679cc7:782c93d799a653a2399367e5e2ba6de5b81b2429/vilkar-forsikring-kritisk-sykdom.pdf",
    sha256: "fbf9f83e3074ce20293500cbd118fe5f391732c335c9953f8781f0b96a51eace", pages: 14,
    edition: "KS02", effectiveFrom: "2023-03",
  },
  "storebrand-behandling": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/2ca10c62-bc30-4603-a032-a726aba53799:f03d21b73546b896bcf4cff1516d26dcf7e4809c/vilkar-helseforsikring-tegnet-etter-nov-2009.pdf",
    sha256: "98ebcb6118485f414b985ce42ceef07d169b4ef18994a88a541cf9385ba5c47b", pages: 21,
    edition: "HELSE01 2026-01-01", effectiveFrom: "2026-01-01",
  },
  "storebrand-barn": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f5b84faf-32b7-400c-bd99-0e4ac6019365:fd42690c132354bb4588994192094c3fecadb4e1/vilkar-barneforsikring01.pdf",
    sha256: "af40e1085d9fbfa44af73a4ec376e4d9fecb4886e0ef14aba9c87ee1b4c6e7a5", pages: 29,
    edition: "Barneforsikring01 2026-10-08", effectiveFrom: "2026-10-08",
  },
  "storebrand-gravid": {
    url: "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/e3ad945c-94b8-40be-a633-db696962d266:366459414df07675461d76f8d656c68c9aae4aeb/vilkar-gravid-og-spedbarnsforsikring.pdf",
    sha256: "92678997731c4025c5d6247197fea8661fafab155c97e98d4ec9e1b1bb0a75d6", pages: 14,
    edition: "SBarn01", effectiveFrom: "2021-09",
  },
  "frende-ulykke": {
    url: "https://api.frende.no/documents/terms/public/pnc/AccidentInsurance",
    sha256: "6432e4dbe699375a5fbd2f8abfd59fb59ecde115ac43d755e28922af7a29750f", pages: 6,
    edition: "2026-01-01", effectiveFrom: "2026-01-01",
  },
  "frende-liv": {
    url: "https://api.frende.no/documents/terms/public/life/Life",
    sha256: "32b07503b29640546366a2ebd103f98e53b54df73245dcc63f4381a1cd7d99f6", pages: 2,
    edition: "2025-01-01", effectiveFrom: "2025-01-01",
  },
  "frende-uforepensjon": {
    url: "https://api.frende.no/documents/terms/public/life/DisabilityRate",
    sha256: "827af65878edc9e4105cb791716a81f5fe2dc9fabd0d0da2575f88c4b747d1e3", pages: 3,
    edition: "2025-01-01", effectiveFrom: "2025-01-01",
  },
  "frende-uforekapital": {
    url: "https://api.frende.no/documents/terms/public/life/DisabilityPlus",
    sha256: "d73f7a655387f983f95e706324a0c23525692239463dbec4b5b7e39fc182b8d6", pages: 5,
    edition: "2026-09-01", effectiveFrom: "2026-09-01",
  },
  "frende-kritisk": {
    url: "https://api.frende.no/documents/terms/public/life/CriticalIllness",
    sha256: "e5a1ff42f9506c4dcf219825a084f0f976323a009dc4125493637ec6340d5a45", pages: 6,
    edition: "2026-09-01", effectiveFrom: "2026-09-01",
  },
  "frende-barn": {
    url: "https://api.frende.no/documents/terms/public/life/Child",
    sha256: "713007e7501ae84e60895e40e13dcbd9fa110f5ba7adb0a3c49115b2aae3884b", pages: 11,
    edition: "2026-06-20", effectiveFrom: "2026-06-20",
  },
  "fremtind-ulykke": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_ulykkesforsikring_ULMI.pdf",
    sha256: "9d0b1b67e10e9d0e273a272c90e619bc687f02f3460fc1a9e66ae4c03b92fe47", pages: 4,
    edition: "2022-04-01", effectiveFrom: "2022-04-01",
  },
  "fremtind-liv": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_liv.pdf",
    sha256: "b28ed0d362220e07ab58dd236cf9bebcf52c530a2cead12d5d85c4dc23f2ac18", pages: 1,
    edition: "2024-05-30", effectiveFrom: "2024-05-30",
  },
  "fremtind-uforepensjon": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_uforepensjon_UP05.pdf",
    sha256: "ea487607ec5081aff4053126beb6c0af8492b95934d85053dcaadb5503d95763", pages: 3,
    edition: "UP05 2024-03-01", effectiveFrom: "2024-03-01",
  },
  "fremtind-uforekapital": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_uforekapital_UK02.pdf",
    sha256: "8f182956fceddea787c03f751eb68a41981ca629e62b28d8c12ab0b420013ed0", pages: 3,
    edition: "UK02 2024-03-01", effectiveFrom: "2024-03-01",
  },
  "fremtind-kritisk": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_kritisk_Sykdom_KS03.pdf",
    sha256: "6ccadf173195a0674bcfb22246af1a86c139ce52ba5bc422e9c4017898212f37", pages: 7,
    edition: "KS03 2025-09-22", effectiveFrom: "2025-09-22",
  },
  "fremtind-behandling": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_behandlingsforsikringPM.pdf",
    sha256: "abf5544f7f01cab463214c11103780e1c74e67ce50a176df85134cb209e7895e", pages: 5,
    edition: "2025-12-04", effectiveFrom: "2025-12-04",
  },
  "fremtind-barn": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_barneforsikring_5.pdf",
    sha256: "47db5f2db3d9320f2ebbb7e8460fdd4295762429943ccad6d81f23d41c2b44b5", pages: 9,
    edition: "2025-08-14", effectiveFrom: "2025-08-14",
  },
  "fremtind-barn-ulykke": {
    url: "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_barneulykke.pdf",
    sha256: "07378f212e91a26e5644ceef4a7ba791b89157bdf48b263dbade863e2ad3f7e7", pages: 5,
    edition: "2023-05-11", effectiveFrom: "2023-05-11",
  },
};

type PersonFactDefinition = {
  kind: keyof typeof factKinds;
  value: string;
  page: number;
  section: string;
  document?: string;
  qualification?: { document: string; page: number; section: string };
  conditional?: true;
};

type PersonProductDefinition = {
  id: string;
  type: typeof personInsuranceTypes[number];
  name: string;
  document: string;
  facts: readonly PersonFactDefinition[];
};

const providers: readonly {
  company: string;
  providerId: string;
  products: readonly PersonProductDefinition[];
}[] = [
  {
    providerId: "tryg", company: "Tryg",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 1, section: "§§ 1 og 2.1",
            value: "Forsikringen gir erstatning ved varig medisinsk invaliditet som følge av en ulykkesskade.",
          },
        ],
      },
      {
        id: "familieulykke", type: "Ulykke", name: "Ulykkesforsikring familie", document: "familieulykke",
        facts: [
          {
            kind: "ulykke", page: 1, section: "§§ 1 og 2.1",
            value: "Varig medisinsk invaliditet som følge av en dekket ulykkesskade kan gi erstatning for den som er forsikret.",
          },
        ],
      },
      {
        id: "barn-ekstra", type: "Barn", name: "Barneforsikring (Barn Ekstra)", document: "barn-ekstra",
        facts: [
          {
            kind: "barnUlykke", page: 1, section: "§ 3.1",
            value: "Livsvarig medisinsk invaliditet etter en dekket ulykkesskade kan gi erstatning.",
          },
          {
            kind: "barnSykdom", page: 1, section: "§ 3.1",
            value: "Livsvarig medisinsk invaliditet etter en dekket sykdom kan gi erstatning.",
          },
        ],
      },
      {
        id: "barn-ulykke", type: "Barn", name: "Ulykkesforsikring for barn", document: "barn-ulykke",
        facts: [
          {
            kind: "barnUlykke", page: 1, section: "§§ 1 og 2.1",
            value: "Varig medisinsk invaliditet etter en dekket ulykkesskade kan gi erstatning.",
          },
        ],
      },
      {
        id: "kritisk", type: "Kritisk sykdom", name: "Kritisk sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 1, section: "§§ 1–2",
            value: "Utbetaling kan gis ved endelig diagnose for en oppført sykdom som inntreffer og diagnostiseres i forsikringstiden. Diagnosen må stilles av legespesialist ved norsk sykehus eller poliklinikk.",
          },
        ],
      },
      {
        id: "behandling", type: "Behandling", name: "Behandling", document: "behandling",
        facts: [
          {
            kind: "behandling", page: 1, section: "§ 1.1",
            value: "Medisinsk nødvendig behandling ved dekket sykdom eller ulykke kan dekkes. Behandlingen må godkjennes på forhånd, med henvisning der vilkårene krever det.",
          },
        ],
      },
      {
        id: "behandling-enkel", type: "Behandling", name: "Behandling Enkel", document: "behandling-enkel",
        facts: [
          {
            kind: "behandling", page: 1, section: "§§ 1 og 2.1",
            value: "Forsikringen dekker avtalte former for medisinsk nødvendig behandling ved sykdom eller ulykke. Tryg må godkjenne behandlingen på forhånd.",
          },
        ],
      },
      {
        id: "behandling-55", type: "Behandling", name: "Behandling 55+", document: "behandling-55",
        facts: [
          {
            kind: "behandling", page: 1, section: "§ 1",
            value: "Forsikringen omfatter blant annet utredning og behandling hos spesialist og dagkirurgi, med forhåndsgodkjenning.",
          },
        ],
      },
      {
        id: "gravid-gratis", type: "Gravid", name: "Gravidforsikring Gratis", document: "gravid-gratis",
        facts: [
          {
            kind: "gravidUlykke", page: 1, section: "§ 2.1",
            value: "Varig medisinsk invaliditet hos mor eller barn etter dekket ulykkesskade kan gi erstatning. I svangerskapet må ulykken medføre akutt behov for forløsning for at barnets dekning skal gjelde.",
          },
        ],
      },
      {
        id: "gravid-ekstra", type: "Gravid", name: "Gravidforsikring Ekstra", document: "gravid-ekstra",
        facts: [
          {
            kind: "gravidDiagnose", page: 3, section: "§ 2.4 (s. 3–4)",
            value: "Engangsutbetaling ved en av de ti angitte medfødte diagnosene. Barnet må være i live ved diagnosen og 14 dager etter fødselen.",
          },
        ],
      },
      {
        id: "gravid-premium", type: "Gravid", name: "Gravidforsikring Premium", document: "gravid-premium",
        facts: [
          {
            kind: "gravidDiagnose", page: 3, section: "§ 2.4 (s. 3–4)",
            value: "Engangsutbetaling ved en av de ti angitte medfødte diagnosene. Barnet må være i live ved diagnosen og 14 dager etter fødselen.",
          },
        ],
      },
    ],
  },
  {
    providerId: "if", company: "If",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 4, section: "§ 5.1 og oversikt (s. 2)", conditional: true,
            value: "Når invaliditetsdekning er avtalt, gir varig medisinsk invaliditet etter ulykkesskade erstatning i forhold til invaliditetsgraden og avtalt forsikringssum.",
          },
        ],
      },
      {
        id: "liv", type: "Liv", name: "Livsforsikring", document: "liv",
        facts: [
          {
            kind: "liv", page: 3, section: "§ 4.1",
            value: "Avtalt forsikringssum utbetales som et engangsbeløp ved dødsfall i forsikringstiden.",
          },
        ],
      },
      {
        id: "uforepensjon", type: "Uføre", name: "Uførepensjon", document: "ufore",
        facts: [
          {
            kind: "pensjon", page: 3, section: "§ 4.1",
            value: "Månedlig utbetaling kan gis etter minst 40 % sammenhengende arbeidsuførhet i 12 måneder etter fylte 18 år. Forsikringen må være i kraft når retten til erstatning oppstår.",
          },
        ],
      },
      {
        id: "kritisk", type: "Kritisk sykdom", name: "Kritisk sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 3, section: "§ 4.1",
            value: "Avtalt engangsutbetaling for oppført sykdom, skade eller behandling i forsikringstiden, dersom forsikrede er i live 24 timer etter forsikringstilfellet.",
          },
        ],
      },
      {
        id: "helse", type: "Behandling", name: "Helseforsikring", document: "helse",
        facts: [
          {
            kind: "behandling", page: 3, section: "§§ 5.5–5.6 (s. 3–4)",
            value: "Forsikringen omfatter utredning og behandling hos spesialist i privat spesialisthelsetjeneste. For samme diagnose dekkes behandling og nødvendige etterkontroller i inntil ni måneder fra oppstart av dekket primærbehandling.",
          },
        ],
      },
      {
        id: "barn-standard", type: "Barn", name: "Standard Barneforsikring", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 9, section: "§ 5.6",
            value: "Varig medisinsk invaliditet etter en dekket ulykke kan gi erstatning.",
          },
          {
            kind: "barnSykdom", page: 9, section: "§ 5.6",
            value: "Varig medisinsk invaliditet ved dekket sykdom kan gi erstatning når tilstanden er stabil og minst to år har gått siden sykdommen inntraff.",
          },
          {
            kind: "barnKapital", page: 9, section: "§ 5.7",
            value: "Engangsutbetaling ved minst 40 % sammenhengende arbeidsuførhet i minst to år etter fylte 18 år, når uførheten er vurdert som varig. Vilkårene har et unntak ved innvilget varig uføretrygd fra fylte 18 år.",
          },
        ],
      },
      {
        id: "barn-super", type: "Barn", name: "Super Barneforsikring", document: "barn-super",
        facts: [
          {
            kind: "barnUlykke", page: 9, section: "§ 5.6", document: "barn",
            value: "Varig medisinsk invaliditet etter en dekket ulykke kan gi erstatning.",
          },
          {
            kind: "barnSykdom", page: 9, section: "§ 5.6", document: "barn",
            value: "Varig medisinsk invaliditet ved dekket sykdom kan gi erstatning når tilstanden er stabil og minst to år har gått siden sykdommen inntraff.",
          },
          {
            kind: "barnPensjon", page: 4, section: "§ 4.1",
            value: "Månedlig utbetaling kan gis ved minst 40 % sammenhengende arbeidsuførhet i 12 måneder etter fylte 18 år. Vilkårene har et unntak ved innvilget varig uføretrygd fra fylte 18 år.",
          },
          {
            kind: "barnKapital", page: 9, section: "§ 5.7 (s. 9–10)", document: "barn",
            qualification: { document: "barn-super", page: 4, section: "§ 4.2" },
            value: "Engangsutbetaling ved minst 40 % sammenhengende arbeidsuførhet i minst to år etter fylte 18 år, når uførheten er vurdert som varig. Vilkårene har et unntak ved innvilget varig uføretrygd fra fylte 18 år. For avtaler tegnet etter 10. november 2018 gjelder unntakene i Super-vilkårene for arbeidsuførheten.",
          },
        ],
      },
      {
        id: "gravid-basis", type: "Gravid", name: "Basis Gravidforsikring", document: "gravid-basis",
        facts: [
          {
            kind: "gravidUlykke", page: 3, section: "§§ 4.1–4.2 (s. 3–4)",
            value: "Varig medisinsk invaliditet etter dekket ulykkesskade hos barnet eller mor kan gi erstatning.",
          },
        ],
      },
      {
        id: "gravid-super", type: "Gravid", name: "Super Gravidforsikring", document: "gravid-super",
        facts: [
          {
            kind: "gravidKomplikasjon", page: 4, section: "§ 4.1",
            value: "Engangsutbetaling ved nærmere angitte graviditets- eller fødselskomplikasjoner hos mor.",
          },
          {
            kind: "gravidDiagnose", page: 4, section: "§ 4.2",
            value: "500 000 kr ved en oppført alvorlig medfødt tilstand. Barnet må være i live ved diagnosen og 14 dager etter fødselen.",
          },
        ],
      },
      {
        id: "godt-voksen", type: "Senior", name: "Godt voksen", document: "senior",
        facts: [
          {
            kind: "senior", page: 3, section: "§ 4.1",
            value: "100 000 kr ved en oppført sykdom, skade eller behandling i forsikringstiden, dersom forsikrede er i live 24 timer etter forsikringstilfellet.",
          },
        ],
      },
    ],
  },
  {
    providerId: "gjensidige", company: "Gjensidige",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 8, section: "Erstatningsregler · Ulykke · Medisinsk invaliditet, punkt 2",
            value: "Varig medisinsk invaliditet etter dekket ulykkesskade gir normalt erstatning i forhold til graden. Ved 100 % utbetales hele forsikringssummen.",
          },
        ],
      },
      {
        id: "liv", type: "Liv", name: "Livsforsikring", document: "liv",
        facts: [
          {
            kind: "liv", page: 7, section: "Erstatningsregler § 1",
            value: "Avtalt forsikringssum utbetales som et engangsbeløp ved dødsfall i forsikringstiden.",
          },
        ],
      },
      {
        id: "uforepensjon", type: "Uføre", name: "Uførepensjon", document: "uforepensjon",
        facts: [
          {
            kind: "pensjon", page: 7, section: "Erstatningsregler § 1.1",
            value: "Månedlig utbetaling ved minst 40 % arbeidsuførhet grunnet sykdom eller skade, når NAV har innvilget arbeidsavklaringspenger eller uføretrygd og forsikringen er i kraft.",
          },
        ],
      },
      {
        id: "uforekapital", type: "Uføre", name: "Uførekapital med forskudd", document: "uforekapital",
        facts: [
          {
            kind: "forskudd", page: 7, section: "Erstatningsregler § 1.1",
            value: "Månedlig forskudd kan utbetales ved minst 50 % arbeidsuførhet og innvilgede arbeidsavklaringspenger eller uføretrygd.",
          },
          {
            kind: "kapital", page: 7, section: "Erstatningsregler § 2.1",
            value: "Engangsutbetaling ved minst 50 % sammenhengende arbeidsuførhet i to år, vurdert som varig i alle yrker.",
          },
        ],
      },
      {
        id: "alvorlig-sykdom", type: "Kritisk sykdom", name: "Alvorlig sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 7, section: "Erstatningsregler § 1 (s. 7–8)",
            value: "Engangsutbetaling for en oppført diagnose, et dekket inngrep eller nærmere angitt oppføring på venteliste til transplantasjon. Forsikrede må overleve forsikringstilfellet med 24 timer.",
          },
        ],
      },
      {
        id: "behandling", type: "Behandling", name: "Behandlingsforsikring", document: "behandling",
        facts: [
          {
            kind: "behandling", page: 2, section: "Publisert eksempel på forsikringsbevis · Hva dekkes",
            value: "Dekker blant annet utredning og behandling hos legespesialist når vilkårene er oppfylt.",
          },
          {
            kind: "ventetid", page: 9, section: "Erstatningsregler § 3.1", conditional: true,
            value: "Inntil 10 virkedager fra mottak av henvisning eller annen nødvendig dokumentasjon etter vilkårene.",
          },
        ],
      },
      {
        id: "helse-55", type: "Behandling", name: "Helse 55+", document: "behandling-55",
        facts: [
          {
            kind: "behandling", page: 8, section: "Erstatningsregler §§ 1.2–1.3",
            value: "Dekker spesialistutredning, behandling og dagkirurgi etter vilkårene, med krav til henvisning eller annen dokumentasjon.",
          },
          {
            kind: "ventetid", page: 8, section: "Erstatningsregler § 1.2", conditional: true,
            value: "Inntil 10 virkedager fra mottatt henvisning fra allmennlege eller annen dokumentasjon Gjensidige godtar.",
          },
        ],
      },
      {
        id: "barn-basis", type: "Barn", name: "Barneforsikring Basis", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 2, section: "Publisert eksempel på forsikringsbevis · Hva dekkes",
            value: "Varig medisinsk invaliditet som følge av en dekket ulykkesskade kan gi erstatning.",
          },
          {
            kind: "barnDiagnose", page: 10, section: "Erstatningsregler § 5.1",
            value: "Engangsutbetaling for utvalgte alvorlige sykdommer eller skader etter vilkårenes diagnosekrav.",
          },
        ],
      },
      {
        id: "barn-medium", type: "Barn", name: "Barneforsikring Medium", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 2, section: "Publisert eksempel på forsikringsbevis · Hva dekkes",
            value: "Varig medisinsk invaliditet som følge av en dekket ulykkesskade kan gi erstatning.",
          },
          {
            kind: "barnDiagnose", page: 10, section: "Erstatningsregler § 5.1",
            value: "Engangsutbetaling for utvalgte alvorlige sykdommer eller skader etter vilkårenes diagnosekrav.",
          },
        ],
      },
      {
        id: "barn-pluss", type: "Barn", name: "Barneforsikring Pluss", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 2, section: "Publisert eksempel på forsikringsbevis · Hva dekkes",
            value: "Varig medisinsk invaliditet som følge av en dekket ulykkesskade kan gi erstatning.",
          },
          {
            kind: "barnDiagnose", page: 10, section: "Erstatningsregler § 5.1",
            value: "Engangsutbetaling for utvalgte alvorlige sykdommer eller skader etter vilkårenes diagnosekrav.",
          },
        ],
      },
    ],
  },
  {
    providerId: "storebrand", company: "Storebrand",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 3, section: "§ 5.1", conditional: true,
            value: "Varig medisinsk invaliditet etter ulykkesskade kan gi erstatning dersom invaliditetsdekning er avtalt.",
          },
          {
            kind: "dodsulykke", page: 2, section: "§§ 1.1.1–1.1.2", conditional: true,
            value: "Ved dødsfall som følge av ulykkesskade kan avtalt dødsfallssum utbetales. Ved avtalt invaliditetsdekning uten egen dødsfallsdekning er dødsfallserstatningen 1 G.",
          },
        ],
      },
      {
        id: "liv", type: "Liv", name: "Livsforsikring", document: "liv",
        facts: [
          {
            kind: "liv", page: 2, section: "§ A.1.1",
            value: "Avtalt forsikringssum utbetales som et engangsbeløp ved dødsfall i forsikringstiden.",
          },
        ],
      },
      {
        id: "ufore", type: "Uføre", name: "Uføreforsikring", document: "ufore",
        facts: [
          {
            kind: "pensjon", page: 2, section: "§ A.1.1",
            value: "Månedlig uførepensjon ved minst 40 % sammenhengende arbeidsuførhet etter karenstiden og innvilgede arbeidsavklaringspenger eller uføretrygd. Karenstiden er 12 måneder med mindre annet står i forsikringsbeviset.",
          },
        ],
      },
      {
        id: "kritisk", type: "Kritisk sykdom", name: "Kritisk sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 7, section: "§ A.2",
            value: "Engangsutbetaling ved oppført diagnose, gjennomført operasjon eller oppføring på venteliste til transplantasjon i Norge. Forsikrede må overleve forsikringstilfellet med minst 24 timer.",
          },
        ],
      },
      {
        id: "helse", type: "Behandling", name: "Helseforsikring (ERGO)", document: "behandling",
        facts: [
          {
            kind: "behandling", page: 7, section: "§ 10.5",
            value: "Behandlingsavtalen med ERGO gir tilgang til behandling som er dekket og godkjent etter vilkårene.",
          },
          {
            kind: "behandlingsfrist", page: 7, section: "§ 10.5", conditional: true,
            value: "Innen 10 virkedager fra ERGO mottar fullstendig og nødvendig medisinsk dokumentasjon for godkjent behandling. Fristen gjelder første behandling i et behandlingsforløp, med unntakene i vilkåret.",
          },
        ],
      },
      {
        id: "barn-standard", type: "Barn", name: "Barneforsikring Standard", document: "barn",
        facts: [
          {
            kind: "barnSykdom", page: 5, section: "§ B.1",
            value: "Erstatning ved minst 50 % varig medisinsk invaliditet etter dekket sykdom som inntreffer i forsikringstiden.",
          },
          {
            kind: "barnUlykke", page: 13, section: "§ G.1",
            value: "Varig medisinsk invaliditet etter dekket ulykkesskade i forsikringstiden kan gi erstatning.",
          },
        ],
      },
      {
        id: "barn-super", type: "Barn", name: "Barneforsikring Super", document: "barn",
        facts: [
          {
            kind: "barnSykdom", page: 5, section: "§ B.1",
            value: "Erstatning ved minst 50 % varig medisinsk invaliditet etter dekket sykdom som inntreffer i forsikringstiden.",
          },
          {
            kind: "barnUlykke", page: 13, section: "§ G.1",
            value: "Varig medisinsk invaliditet etter dekket ulykkesskade i forsikringstiden kan gi erstatning.",
          },
          {
            kind: "barnPensjon", page: 18, section: "§ J.3.1",
            value: "Månedlig uførepensjon ved minst 40 % sammenhengende arbeidsuførhet i minst 12 måneder fra sykdom eller skade og innvilgede arbeidsavklaringspenger eller uføretrygd fra fylte 18 år. Vilkårene må være oppfylt i forsikringstiden.",
          },
        ],
      },
      {
        id: "gravid", type: "Gravid", name: "Gravid- og spedbarnsforsikring", document: "gravid",
        facts: [
          {
            kind: "gravidSykehus", page: 4, section: "§ C.2.1 (s. 4–5)",
            value: "Utbetaling ved medisinsk nødvendig sykehusinnleggelse for mor knyttet til svangerskap eller fødsel, eller for barnet, i minst sju sammenhengende netter. Utbetalingen er begrenset til 14 netter.",
          },
        ],
      },
    ],
  },
  {
    providerId: "frende", company: "Frende",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 4, section: "§§ 6.1–6.2", conditional: true,
            value: "Livsvarig medisinsk invaliditet etter dekket ulykkesskade kan gi erstatning. Forsikringsbeviset viser om invaliditetsdekningen gjelder i arbeid, herunder skole eller studier, på fritiden eller begge deler.",
          },
          {
            kind: "dodsulykke", page: 3, section: "§§ 5.1–5.2", conditional: true,
            value: "Dødsfall etter ulykkesskade kan gi erstatning hvis relevant dekning for arbeid (herunder skole eller studier) eller fritid er valgt.",
          },
        ],
      },
      {
        id: "liv", type: "Liv", name: "Livsforsikring", document: "liv",
        facts: [
          {
            kind: "liv", page: 2, section: "§ 2",
            value: "Avtalt forsikringssum utbetales som et engangsbeløp ved dødsfall i forsikringstiden.",
          },
        ],
      },
      {
        id: "uforepensjon", type: "Uføre", name: "Uførepensjon", document: "uforepensjon",
        facts: [
          {
            kind: "pensjon", page: 2, section: "§ 3",
            value: "Månedlig utbetaling etter minst 50 % sammenhengende arbeidsuførhet i minst 12 måneder ved sykdom eller ulykke i forsikringstiden. Søknad om arbeidsavklaringspenger eller uføretrygd må være sendt og forventes innvilget.",
          },
        ],
      },
      {
        id: "uforekapital", type: "Uføre", name: "Uførekapital med forskudd", document: "uforekapital",
        facts: [
          {
            kind: "forskudd", page: 2, section: "§ 4.1",
            value: "Månedlig forskudd etter minst 50 % sammenhengende arbeidsuførhet i minst ett år. Søknad om arbeidsavklaringspenger eller uføretrygd må være sendt og forventes innvilget.",
          },
          {
            kind: "kapital", page: 4, section: "§ 5.1",
            value: "Avtalt engangsbeløp, med fradrag for utbetalte forskudd, etter minst 50 % sammenhengende arbeidsuførhet i minst to år fra sykdom eller ulykke i forsikringstiden, dersom forsikrede vurderes å være minst 50 % varig arbeidsufør.",
          },
        ],
      },
      {
        id: "kritisk", type: "Kritisk sykdom", name: "Kritisk sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 4, section: "§§ 4 og 5.1",
            value: "Engangsutbetaling ved en oppført endelig diagnose, behandling, operasjon eller kvalifiserende oppføring på venteliste i forsikringstiden. Forsikrede må overleve i 30 dager.",
          },
        ],
      },
      {
        id: "barn-bra", type: "Barn", name: "Barneforsikring Bra", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 3, section: "§ 4.2.2",
            value: "Livsvarig medisinsk invaliditet etter dekket ulykkesskade kan gi erstatning. Forsikringstilfellet inntreffer ett år etter ulykken.",
          },
          {
            kind: "barnSykdom", page: 3, section: "§ 4.2.1",
            value: "Livsvarig medisinsk invaliditet som følge av konstatert dekket sykdom kan gi erstatning. Forsikringstilfellet inntreffer to år etter at sykdommen ble konstatert.",
          },
        ],
      },
      {
        id: "barn-best", type: "Barn", name: "Barneforsikring Best", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 3, section: "§ 4.2.2",
            value: "Livsvarig medisinsk invaliditet etter dekket ulykkesskade kan gi erstatning. Forsikringstilfellet inntreffer ett år etter ulykken.",
          },
          {
            kind: "barnSykdom", page: 3, section: "§ 4.2.1",
            value: "Livsvarig medisinsk invaliditet som følge av konstatert dekket sykdom kan gi erstatning. Forsikringstilfellet inntreffer to år etter at sykdommen ble konstatert.",
          },
        ],
      },
    ],
  },
  {
    providerId: "fremtind", company: "Fremtind",
    products: [
      {
        id: "ulykke", type: "Ulykke", name: "Ulykkesforsikring", document: "ulykke",
        facts: [
          {
            kind: "ulykke", page: 1, section: "§§ 4 og 4.1",
            value: "Varig medisinsk invaliditet etter dekket ulykkesskade i forsikringstiden gir rett til erstatning.",
          },
          {
            kind: "dodsulykke", page: 1, section: "§ 4",
            value: "Forsikringen omfatter dødsfall som følge av ulykkesskade i forsikringstiden.",
          },
        ],
      },
      {
        id: "liv", type: "Liv", name: "Livsforsikring", document: "liv",
        facts: [
          {
            kind: "liv", page: 1, section: "§ 2",
            value: "Avtalt forsikringssum utbetales som et engangsbeløp ved dødsfall i forsikringstiden.",
          },
        ],
      },
      {
        id: "uforepensjon", type: "Uføre", name: "Uførepensjon", document: "uforepensjon",
        facts: [
          {
            kind: "pensjon", page: 1, section: "Dekning I § 2 og definisjoner § 2",
            value: "Månedlig utbetaling etter mer enn 12 måneder med minst 50 % sammenhengende arbeidsuførhet ved sykdom eller ulykke som har inntruffet i forsikringstiden.",
          },
        ],
      },
      {
        id: "uforekapital", type: "Uføre", name: "Uførekapital", document: "uforekapital",
        facts: [
          {
            kind: "kapital", page: 1, section: "§ 3.1.1",
            value: "Engangsutbetaling etter minst 50 % sammenhengende arbeidsuførhet i minst to år som følge av sykdom eller ulykke i forsikringstiden, når arbeidsuførheten vurderes som varig.",
          },
        ],
      },
      {
        id: "uforekapital-forskudd", type: "Uføre", name: "Uførekapital med forskuttering", document: "uforekapital",
        facts: [
          {
            kind: "kapital", page: 1, section: "§§ 3.1.1–3.1.2",
            value: "Engangsutbetaling etter minst 50 % sammenhengende arbeidsuførhet i minst to år som følge av sykdom eller ulykke i forsikringstiden, når arbeidsuførheten vurderes som varig. Utbetalte forskudd trekkes fra.",
          },
          {
            kind: "forskudd", page: 1, section: "§ 3.2.1",
            value: "Når forskuttering er avtalt, gis månedlig utbetaling etter mer enn 12 måneder med minst 50 % sammenhengende arbeidsuførhet etter vilkårene.",
          },
        ],
      },
      {
        id: "kritisk", type: "Kritisk sykdom", name: "Kritisk sykdom", document: "kritisk",
        facts: [
          {
            kind: "sykdom", page: 1, section: "§ 4 (s. 1–2)",
            value: "Engangsutbetaling ved en oppført sykdom, skade eller behandling, med krav til endelig diagnose, gjennomført behandling eller venteliste i Norden der det er angitt. Det er krav om å overleve forsikringstilfellet med 24 timer.",
          },
        ],
      },
      {
        id: "behandling", type: "Behandling", name: "Behandlingsforsikring", document: "behandling",
        facts: [
          {
            kind: "behandling", page: 1, section: "§ 4.1",
            value: "Forhåndsgodkjent privat utredning eller behandling for sykdom eller ulykkesskade, etter henvisning fra lege som praktiserer i Skandinavia.",
          },
          {
            kind: "ventetid", page: 1, section: "§ 4.1", conditional: true,
            value: "Legespesialist innen 10 virkedager. Utredningen eller behandlingen må være forhåndsgodkjent.",
          },
          {
            kind: "operasjonsfrist", page: 1, section: "§ 4.1", conditional: true,
            value: "Operasjon eller sykehusbehandling innen 15 virkedager. Behandlingen må være forhåndsgodkjent.",
          },
        ],
      },
      {
        id: "barn", type: "Barn", name: "Barneforsikring", document: "barn",
        facts: [
          {
            kind: "barnUlykke", page: 1, section: "§ 4",
            value: "Forsikringen omfatter varig medisinsk invaliditet som følge av ulykkesskade etter at forsikringen trådte i kraft.",
          },
          {
            kind: "barnDiagnose", page: 1, section: "§ 4",
            value: "Vilkårene oppgir engangsutbetaling for oppførte sykdommer som er diagnostisert etter at forsikringen trådte i kraft.",
          },
        ],
      },
      {
        id: "barn-ulykke", type: "Barn", name: "Barneulykkesforsikring", document: "barn-ulykke",
        facts: [
          {
            kind: "barnUlykke", page: 1, section: "§ 4",
            value: "Forsikringen omfatter varig medisinsk invaliditet som følge av dekket ulykkesskade.",
          },
          {
            kind: "barnUtgifter", page: 2, section: "§§ 7.1–7.4 (s. 2–3)",
            value: "Nødvendige lege-, tannlege- og reiseutgifter etter ulykkesskade kan dekkes med inntil 1 G per ulykkestilfelle, med 500 kr i egenandel. Utgifter som kan kreves dekket fra annet hold, erstattes ikke.",
          },
          {
            kind: "barnDodsulykke", page: 5, section: "§ 10",
            value: "Ved dødsfall i forsikringstiden som følge av ulykke utbetales et engangsbeløp på 1 G.",
          },
        ],
      },
    ],
  },
];

export const personInsuranceProducts: CatalogProduct[] = [];
export const personInsuranceSources: Record<string, CatalogSource> = {};
export const personInsuranceFacts: Record<string, CatalogFact[]> = {};

for (const { providerId, company, products } of providers) {
  for (const entry of products) {
    const productId = `${providerId}-person-${entry.id}`;
    const anchorId = `person:${productId}`;
    const version = terms[`${providerId}-${entry.document}`].edition ?? null;
    const sourceIds = new Map<string, string>();
    const documents = new Set([entry.document, ...entry.facts.flatMap(fact =>
      [fact.document, fact.qualification?.document].filter((document): document is string => Boolean(document)))]);
    for (const document of documents) {
      const evidence = terms[`${providerId}-${document}`];
      const id = document === entry.document ? anchorId : `${anchorId}:${document}`;
      sourceIds.set(document, id);
      personInsuranceSources[id] = {
        id, providerId, company, insuranceType: entry.type, agreementScope: "ordinary",
        filename: `${providerId}-person-${document}.pdf`,
        documentName: `${company} – ${entry.name}`,
        sourceType: "full_terms", productIds: [productId],
        termsNumber: evidence.edition ?? "",
        effectiveFrom: evidence.effectiveFrom, url: evidence.url, sha256: evidence.sha256,
        physicalPages: [1, evidence.pages],
        ...(evidence.edition ? { version: evidence.edition } : {}),
        ...(version ? { productVersion: version } : {}),
      };
    }

    personInsuranceProducts.push({
      company, providerId, insuranceType: entry.type, name: entry.name,
      productId, version, sourceId: anchorId, componentIds: [anchorId],
      agreementScope: "ordinary",
    });

    const citation = (document: string, page: number, section: string): CatalogFact["source"] => {
      const source = personInsuranceSources[sourceIds.get(document)!];
      return {
        documentId: source.id, section, page, filename: source.filename,
        company, url: source.url, termsNumber: source.termsNumber,
        effectiveFrom: source.effectiveFrom, agreementScope: "ordinary",
        ...(source.version ? { version: source.version } : {}),
      };
    };
    personInsuranceFacts[anchorId] = entry.facts.map(fact => ({
      ...factKinds[fact.kind], value: fact.value,
      ...(fact.conditional ? {} : { coverageAvailability: "included" as const }),
      source: citation(fact.document ?? entry.document, fact.page, fact.section),
      ...(fact.qualification ? { qualificationSource: citation(
        fact.qualification.document, fact.qualification.page, fact.qualification.section,
      ) } : {}),
    }));
  }
}
