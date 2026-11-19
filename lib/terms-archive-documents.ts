import { frendeDogMarketArchives } from "./frende-dog-market.ts";
import { fremtindBobilMarketArchives } from "./fremtind-bobil-market.ts";
import { sparebank1FremtindBilMarketArchives } from "./sparebank1-fremtind-bil-market.ts";
import { storebrandInnboMarketArchives } from "./storebrand-innbo-market.ts";
import { storebrandMotorMarketArchives } from "./storebrand-motor-market.ts";
import { trygBoatMarketArchives } from "./tryg-boat-market.ts";
import { trygHomeMarketArchives } from "./tryg-home-market-evidence.ts";
import { trygSnowMarketArchives } from "./tryg-snow-market.ts";

type ArchiveSource = readonly [documentId: string, effectiveFrom: string, originalUrl: string, previousUrl?: string];

type MemberArchiveSource = readonly [scope: string, productId: string, originalUrl: string, documentNumber: string, date: string, sha256: string];

type TermsArchiveDocument = {
  provider: string;
  slug: string;
  archivePath: string;
  sources: readonly ArchiveSource[];
  memberSources?: readonly MemberArchiveSource[];
};

export const termsArchiveDocuments: readonly TermsArchiveDocument[] = [
  ...trygBoatMarketArchives,
  ...trygHomeMarketArchives,
  ...trygSnowMarketArchives,
  ...storebrandInnboMarketArchives,
  ...storebrandMotorMarketArchives,
  ...fremtindBobilMarketArchives,
  ...frendeDogMarketArchives,
  ...sparebank1FremtindBilMarketArchives,
  {
    provider: "fremtind",
    slug: "bat",
    archivePath: "catalog/sources/boat-pet/fremtind-boat-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:båt", "2024-06-10", "https://www.sparebank1.no/nb/bank/privat/forsikring/batforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "hund-behandling",
    archivePath: "catalog/sources/boat-pet/fremtind-dog-vet-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:hund", "2025-08-07", "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "hund-bruk",
    archivePath: "catalog/sources/boat-pet/fremtind-dog-use-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:hund:use", "2025-08-07", "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "hund-liv",
    archivePath: "catalog/sources/boat-pet/fremtind-dog-life-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:hund:life", "2025-08-07", "https://www.sparebank1.no/nb/bank/privat/forsikring/hundeforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "kasko-bil",
    archivePath: "catalog/sources/sparebank1-fremtind/Vilkar_Kasko_Bil.pdf",
    sources: [
      ["mcb-ff-fremtind-bobil-kasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Bil.pdf"],
      ["sp1Kasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Kasko_Bil.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "katt-behandling",
    archivePath: "catalog/sources/boat-pet/fremtind-cat-vet-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:katt", "2025-08-07", "https://www.sparebank1.no/nb/bank/privat/forsikring/katteforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "katt-liv",
    archivePath: "catalog/sources/boat-pet/fremtind-cat-life-terms.pdf",
    sources: [
      ["boat-pet:sparebank1-fremtind:katt:life", "2025-08-07", "https://www.sparebank1.no/nb/bank/privat/forsikring/katteforsikring.html"],
    ],
  },
  {
    provider: "fremtind",
    slug: "leiebil",
    archivePath: "catalog/sources/sparebank1-fremtind/Vilkar_leiebil.pdf",
    sources: [
      ["mcb-ff-fremtind-bobil-leiebil", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_leiebil.pdf"],
      ["sp1Leiebil", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_leiebil.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "maskinskade",
    archivePath: "catalog/sources/sparebank1-fremtind/Vilkar_maskinskade.pdf",
    sources: [
      ["mcb-ff-fremtind-bobil-maskinskade", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_maskinskade.pdf"],
      ["sp1Maskinskade", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_maskinskade.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "minikasko-bil",
    archivePath: "catalog/sources/sparebank1-fremtind/Vilkar_Minikasko_Bil.pdf",
    sources: [
      ["mcb-ff-fremtind-bobil-minikasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Minikasko_Bil.pdf"],
      ["sp1Delkasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Minikasko_Bil.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "toppkasko-bil",
    archivePath: "catalog/sources/sparebank1-fremtind/Vilkar_Toppkasko_Bil.pdf",
    sources: [
      ["sp1Toppkasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bil.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "toppkasko-bobil",
    archivePath: "catalog/sources/mc-bobil/fremtind-bobil-topp.pdf",
    sources: [
      ["mcb-ff-fremtind-bobil-topp", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
      ["mcb-ff-fremtind-bobil-topp-ansvar", "2023-10-29", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
      ["mcb-ff-fremtind-bobil-topp-kasko", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
      ["mcb-ff-fremtind-bobil-topp-mini", "2025-09-18", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
      ["mcb-ff-fremtind-bobil-topp-rettshjelp", "2025-01-01", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
      ["mcb-ff-fremtind-bobil-topp-ulykke", "2019-04-01", "https://dokument.fremtind.no/vilkar/fremtind/pm/mobilitet/Vilkar_Toppkasko_Bobil.pdf"],
    ],
  },
  {
    provider: "frende",
    slug: "bat",
    archivePath: "catalog/sources/boat-pet/frende-boat-terms.pdf",
    sources: [
      ["boat-pet:frende:båt", "2026-01-01", "https://www.frende.no/forsikringer/batforsikring/"],
    ],
  },
  {
    provider: "frende",
    slug: "hund",
    archivePath: "catalog/sources/boat-pet/frende-dog-terms.pdf",
    sources: [
      ["boat-pet:frende:hund", "2026-01-01", "https://www.frende.no/forsikringer/hundeforsikring/"],
    ],
  },
  {
    provider: "frende",
    slug: "hus",
    archivePath: "catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf",
    sources: [
      ["frendeHusConstruction", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/HomeInsurance"],
      ["frendeHusExtended", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/HomeInsurance"],
      ["frendeHusRental", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/HomeInsurance"],
      ["frendeHusRot", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/HomeInsurance"],
      ["frendeHusStandard", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/HomeInsurance"],
    ],
  },
  {
    provider: "frende",
    slug: "hytte",
    archivePath: "catalog/sources/frende/hus/canonical/Vilkar-husforsikring.pdf",
    sources: [
      ["cabin:frende:building", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/VacationHomeInsurance"],
    ],
  },
  {
    provider: "frende",
    slug: "innbo",
    archivePath: "catalog/sources/frende/innbo/Vilkar_innboforsikring_01092026.pdf",
    sources: [
      ["frendeInnboStandard", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/ContentInsurance"],
      ["frendeInnboUhell", "2026-09-01", "https://api.frende.no/documents/terms/public/pnc/ContentInsurance"],
    ],
  },
  {
    provider: "frende",
    slug: "katt",
    archivePath: "catalog/sources/boat-pet/frende-cat-terms.pdf",
    sources: [
      ["boat-pet:frende:katt", "2026-01-01", "https://www.frende.no/forsikringer/katteforsikring/"],
    ],
  },
  {
    provider: "frende",
    slug: "ulykke",
    archivePath: "catalog/sources/person/frende-person-ulykke.pdf",
    sources: [
      ["person:frende-person-ulykke", "2026-01-01", "https://api.frende.no/documents/terms/public/pnc/AccidentInsurance"],
      ["person:frende-person-ulykke:tillegg:faginvaliditet-arbeid", "2026-01-01", "https://api.frende.no/documents/terms/public/pnc/AccidentInsurance"],
      ["person:frende-person-ulykke:tillegg:faginvaliditet-fritid", "2026-01-01", "https://api.frende.no/documents/terms/public/pnc/AccidentInsurance"],
    ],
  },
  {
    provider: "frende",
    slug: "verdisak",
    archivePath: "catalog/sources/private-valuables/frende-verdisak.pdf",
    sources: [
      ["private-valuables:frende", "2026-01-01", "https://api.frende.no/documents/terms/public/pnc/ValuablesInsurance"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "bat-kasko",
    archivePath: "catalog/sources/boat-pet/gjensidige-boat-kasko-terms.pdf",
    sources: [
      ["boat-pet:gjensidige:båt:kasko", "", "https://www.gjensidige.no/forsikring/batforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "bat-pluss",
    archivePath: "catalog/sources/boat-pet/gjensidige-boat-plus-terms.pdf",
    sources: [
      ["boat-pet:gjensidige:båt:pluss", "", "https://www.gjensidige.no/forsikring/batforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "hund-behandling",
    archivePath: "catalog/sources/boat-pet/gjensidige-dog-treatment-terms.pdf",
    sources: [
      ["boat-pet:gjensidige:hund:treatment", "", "https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "hund-liv-og-bruk",
    archivePath: "catalog/sources/boat-pet/gjensidige-dog-life-use-terms.pdf",
    sources: [
      ["boat-pet:gjensidige:hund:life-use", "", "https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "ipid-bat",
    archivePath: "catalog/sources/boat-pet/gjensidige-boat-ipid.pdf",
    sources: [
      ["boat-pet:gjensidige:båt", "", "https://www.gjensidige.no/forsikring/batforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "ipid-hund",
    archivePath: "catalog/sources/boat-pet/gjensidige-dog-ipid.pdf",
    sources: [
      ["boat-pet:gjensidige:hund", "", "https://www.gjensidige.no/forsikring/dyreforsikring/hundeforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "ipid-katt",
    archivePath: "catalog/sources/boat-pet/gjensidige-cat-ipid.pdf",
    sources: [
      ["boat-pet:gjensidige:katt", "", "https://www.gjensidige.no/forsikring/dyreforsikring/katteforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "katt-liv-og-bruk",
    archivePath: "catalog/sources/boat-pet/gjensidige-cat-life-use-terms.pdf",
    sources: [
      ["boat-pet:gjensidige:katt:life-use", "", "https://www.gjensidige.no/forsikring/dyreforsikring/katteforsikring"],
    ],
  },
  {
    provider: "storebrand",
    slug: "bat",
    archivePath: "catalog/sources/boat-pet/storebrand-boat-terms.pdf",
    sources: [
      ["boat-pet:storebrand:båt", "2024-09-01", "https://www.storebrand.no/privat/forsikring/batforsikring"],
    ],
  },
  {
    provider: "storebrand",
    slug: "dyr",
    archivePath: "catalog/sources/boat-pet/storebrand-pet-terms.pdf",
    sources: [
      ["boat-pet:storebrand:hund", "2025-02-01", "https://www.storebrand.no/privat/forsikring/hundeforsikring"],
      ["boat-pet:storebrand:katt", "2025-02-01", "https://www.storebrand.no/privat/forsikring/katteforsikring"],
    ],
  },
  {
    provider: "storebrand",
    slug: "innbo-innbo09",
    archivePath: "catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf",
    sources: [
      ["sbInnboStandard", "2024-07-02", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/9b3b5c27-3e81-4201-b0aa-a27ea63add19:9655c7f64a7b98c7016c3130c592dbacdc1d312c/vilkar-innboforsikring.pdf"],
      ["sbInnboSuper", "2024-07-02", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/9b3b5c27-3e81-4201-b0aa-a27ea63add19:9655c7f64a7b98c7016c3130c592dbacdc1d312c/vilkar-innboforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "bat-maskinskade",
    archivePath: "catalog/sources/boat-pet/tryg-boat-machinery-terms.pdf",
    sources: [
      ["boat-pet:tryg:båt:machinery", "2026-01-01", "https://www.tryg.no/forsikringer/kjoretoy/batforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "bat-ulykke",
    archivePath: "catalog/sources/boat-pet/tryg-boat-accident-terms.pdf",
    sources: [
      ["boat-pet:tryg:båt:accident", "2022-02-01", "https://www.tryg.no/forsikringer/kjoretoy/batforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "bobil-ipid",
    archivePath: "catalog/sources/mc-bobil/tryg-bobil-ipid.pdf",
    sources: [
      ["mcb:tryg:bobil:tryg-bobil-ipid.pdf", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Bobilforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "dyr-produktvilkar",
    archivePath: "catalog/sources/boat-pet/tryg-dog-product-terms.pdf",
    sources: [
      ["boat-pet:tryg:hund:product", "2026-05-10", "https://www.tryg.no/forsikringer/dyreforsikring/hundeforsikring"],
      ["boat-pet:tryg:katt:product", "2026-05-10", "https://www.tryg.no/forsikringer/dyreforsikring/hundeforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "hund-behandling",
    archivePath: "catalog/sources/boat-pet/tryg-dog-treatment-terms.pdf",
    sources: [
      ["boat-pet:tryg:hund:treatment", "2026-01-01", "https://www.tryg.no/forsikringer/dyreforsikring/hundeforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "hund-ekstra",
    archivePath: "catalog/sources/boat-pet/tryg-dog-extra-terms.pdf",
    sources: [
      ["boat-pet:tryg:hund:extra", "2025-07-01", "https://www.tryg.no/forsikringer/hundeforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "hund-liv",
    archivePath: "catalog/sources/boat-pet/tryg-dog-life-terms.pdf",
    sources: [
      ["boat-pet:tryg:hund:life", "2026-01-01", "https://www.tryg.no/forsikringer/hundeforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "bat-kasko-innenbord-2024-07",
    archivePath: "catalog/sources/boat-pet/tryg-boat-kasko-inboard-2024-07-terms.pdf",
    sources: [
      ["boat-pet:tryg:båt:kasko-innenbord-2024-07", "2024-07-01", "https://www.tryg.no/odpdf?vilkNr=05PFB33100&vilk=Baatforsikring-innenbords-Kasko-Ansvar"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-bat",
    archivePath: "catalog/sources/boat-pet/tryg-boat-ipid.pdf",
    sources: [
      ["boat-pet:tryg:båt", "2024-07-01", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Batforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-campingvogn-og-tilhenger",
    archivePath: "catalog/sources/vehicle-extensions/tryg-IPID-Campingvogn-og-tilhenger.pdf",
    sources: [
      ["vehicle:tryg-IPID-Campingvogn-og-tilhenger.pdf", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Campingvogn-og-tilhenger.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-hus",
    archivePath: "catalog/sources/tryg/hus/IPID-Hus.pdf",
    sources: [
      ["trygHusIpid", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Hus.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-innbo",
    archivePath: "catalog/sources/tryg/innbo/IPID_Innbo.pdf",
    sources: [
      ["trygInnboIpid", "2022-07-01", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Innbo.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-reiseforsikring",
    archivePath: "catalog/sources/tryg/reise/canonical/IPID-Reiseforsikring.pdf",
    sources: [
      ["trygReiseIpid", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Reiseforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ipid-snoscooter",
    archivePath: "catalog/sources/vehicle-extensions/tryg-IPID-Snoscooter.pdf",
    sources: [
      ["vehicle:tryg-IPID-Snoscooter.pdf", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Snoscooter.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "katt-behandling",
    archivePath: "catalog/sources/boat-pet/tryg-cat-treatment-terms.pdf",
    sources: [
      ["boat-pet:tryg:katt:treatment", "2026-07-01", "https://www.tryg.no/forsikringer/dyreforsikring/katteforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "katt-ekstra",
    archivePath: "catalog/sources/boat-pet/tryg-cat-extra-terms.pdf",
    sources: [
      ["boat-pet:tryg:katt:extra", "2025-07-01", "https://www.tryg.no/forsikringer/katteforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "katt-liv",
    archivePath: "catalog/sources/boat-pet/tryg-cat-life-terms.pdf",
    sources: [
      ["boat-pet:tryg:katt:life", "2026-01-01", "https://www.tryg.no/forsikringer/katteforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "mc-ipid",
    archivePath: "catalog/sources/mc-bobil/tryg-mc-ipid.pdf",
    sources: [
      ["mcb:tryg:mc:tryg-mc-ipid.pdf", "", "https://www.tryg.no/system/files/download/pdf/ipid/IPID-Motorsykkelforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-innbo",
    archivePath: "catalog/sources/tryg/member-agreements/nito-innbo.pdf",
    sources: [
      ["tryg-nito-innbo-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "innbo", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring---forsikringsbevis-og-vilkar-2026.pdf", "", "2026-01-01", "c88d60872ee9ed6147774073559feaddfe2901a64cb6ffe1b3b8b1e5daed26e8"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-innbo-fritidsbolig",
    archivePath: "catalog/sources/tryg/member-agreements/nito-innbo-fritidsbolig.pdf",
    sources: [
      ["tryg-nito-innbo-fritidsbolig-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring-fritidsbolig---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "innbo-fritidsbolig", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring-fritidsbolig---forsikringsbevis-og-vilkar-2026.pdf", "", "2026-01-01", "c5e0eba96b2a40f67fcacf2ce497ebd5cb93927365a7f6f1187869dfbf58dc3a"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-innbo-student",
    archivePath: "catalog/sources/tryg/member-agreements/nito-innbo-student.pdf",
    sources: [
      ["tryg-nito-innbo-student-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring-student---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "innbo-student", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-innboforsikring-student---forsikringsbevis-og-vilkar-2026.pdf", "", "2026-01-01", "38d8a832db4da8a104521e5e9f5ae165210ddad0209e9f1d5080499fc5ff536b"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-reise-enkeltperson",
    archivePath: "catalog/sources/tryg/member-agreements/nito-reise-enkeltperson.pdf",
    sources: [
      ["tryg-nito-reise-enkeltperson-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-reiseforsikring-enkeltperson---forsikringsbevis-og-vilkar-2026.pdf", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/nito-reiseforsikring-enkeltperson---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "reise-enkeltperson", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-reiseforsikring-enkeltperson---forsikringsbevis-og-vilkar-2026.pdf", "54709", "2026-01-01", ""],
      ["nito", "reise-enkeltperson", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/nito-reiseforsikring-enkeltperson---forsikringsbevis-og-vilkar-2026.pdf", "54709", "2026-01-01", "28ea69381919a6102214026c7b07820bc52c2e7067784040b67e16758627f8b5"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-reise-familie",
    archivePath: "catalog/sources/tryg/member-agreements/nito-reise-familie.pdf",
    sources: [
      ["tryg-nito-reise-familie-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-reiseforsikring-familie--forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "reise-familie", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-reiseforsikring-familie--forsikringsbevis-og-vilkar-2026.pdf", "54705", "2026-01-01", "a94ca59ede62ea3eb1752e407cfec26374f9585f52aca4880b46cca4c7b3f590"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-student-meg",
    archivePath: "catalog/sources/tryg/member-agreements/nito-student-meg.pdf",
    sources: [
      ["tryg-nito-student-meg-legacy-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-studentforsikring-meg---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "student-meg", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-studentforsikring-meg---forsikringsbevis-og-vilkar-2026.pdf", "54711", "2026-01-01", "780661c6af9eb6791cb7d661d75681f50aed8a7448d8bc5449f61b085afe3ecd"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-student-mitt",
    archivePath: "catalog/sources/tryg/member-agreements/nito-student-mitt.pdf",
    sources: [
      ["tryg-nito-student-mitt-legacy-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-studentforsikring-mitt---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "student-mitt", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-studentforsikring-mitt---forsikringsbevis-og-vilkar-2026.pdf", "", "2026-01-01", "43ebbd3384cf31fd67d9ba8e87d394853d333c9affc90fe62b7a42841db51d68"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-ufore-etter-studiet",
    archivePath: "catalog/sources/tryg/member-agreements/nito-ufore-etter-studiet.pdf",
    sources: [
      ["tryg-nito-ufore-etter-studiet-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-uforeforsikring---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "ufore-etter-studiet", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-uforeforsikring---forsikringsbevis-og-vilkar-2026.pdf", "54712", "2026-01-01", "4f4fb740ce0035596c1e8998760f6eedd75a6fbcdaab275b82c8e566d1153cfc"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-ulykke-grunn",
    archivePath: "catalog/sources/tryg/member-agreements/nito-ulykke-grunn.pdf",
    sources: [
      ["tryg-nito-ulykke-grunn-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-ulykke-grunnforsikring---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "ulykke-grunn", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-ulykke-grunnforsikring---forsikringsbevis-og-vilkar-2026.pdf", "54702", "2026-01-01", "ea6f47e305fb86a8c7fa371b50a98493a9404f91302ba8bca1937011e9b7e75d"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-ulykke-utvidet",
    archivePath: "catalog/sources/tryg/member-agreements/nito-ulykke-utvidet.pdf",
    sources: [
      ["tryg-nito-ulykke-utvidet-terms", "2026-01-01", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-utvidet-ulykkesforsikring---forsikringsbevis-og-vilkar-2026.pdf"],
    ],
    memberSources: [
      ["nito", "ulykke-utvidet", "https://www.nito.no/siteassets/dokumenter/forsikringsdokumenter/forsikringsvilkar/2026/nito-utvidet-ulykkesforsikring---forsikringsbevis-og-vilkar-2026.pdf", "54703", "2026-01-01", "94aaf02b8aae8c146340626bb3fe0da7d922fe3478e0807d4db273ad99b9bbe2"],
    ],
  },
  {
    provider: "fremtind",
    slug: "kritisk-sykdom-produktark",
    archivePath: "catalog/sources/person/fremtind-person-kritisk-ipid.pdf",
    sources: [
      ["person:fremtind-person-kritisk:kritisk-ipid", "", "https://content.dnb.no/docs/8679113/ipid-kritisk-sykdom-ks03.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "livsforsikring-produktark",
    archivePath: "catalog/sources/person/fremtind-person-liv-ipid.pdf",
    sources: [
      ["person:fremtind-person-liv:liv-ipid", "", "https://dokument.fremtind.no/ipid/IPID_Livsforsikring.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "ulykkesforsikring-produktark",
    archivePath: "catalog/sources/person/fremtind-person-ulykke-ipid.pdf",
    sources: [
      ["person:fremtind-person-ulykke:ulykke-ipid", "", "https://dokument.fremtind.no/ipid/IPID_UlykkesforsikringII.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-behandling-enkel-produktark",
    archivePath: "catalog/sources/tryg/member-agreements/nito-behandling-enkel-ipid.pdf",
    sources: [
      ["tryg-nito-behandling-enkel-terms", "2026-09-01", "https://www.tryg.no/system/files/download/pdf/ipid/NITO-IPID-Behandling-Enkel.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/tryg-person-kritisk.pdf",
    sources: [
      ["person:tryg-person-kritisk", "2026-01-01", "https://www.tryg.no/odpdf?vilk=kritisk-sykdom-Dekningsvilkaar&vilkNr=05UUL41901"],
    ],
  },
  {
    provider: "tryg",
    slug: "person-produktvilkar",
    archivePath: "catalog/sources/person/tryg-person-ulykke-produktvilkar.pdf",
    sources: [
      ["person:tryg-person-kritisk:ulykke-produktvilkar", "", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Produktvilkaar&vilkNr=05UUL41500"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-person-produkt",
    archivePath: "catalog/sources/tryg/member-agreements/nito-05uul41847.pdf",
    sources: [
      ["tryg-nito-liv-product-terms", "2022-01-01", "https://www.tryg.no/odpdf?vilk=nito-person-produkt&vilkNr=05UUL41847"],
      ["tryg-nito-ufore-ekstra-product-terms", "2022-01-01", "https://www.tryg.no/odpdf?vilk=nito-person-produkt&vilkNr=05UUL41847"],
    ],
    memberSources: [
      ["nito", "liv", "https://www.tryg.no/odpdf?vilk=nito-person-produkt&vilkNr=05UUL41847", "UUL41847", "2022-01-01", "0c1178486dc148bdd4a86e533bf5119ba0cf428742e5cd362c797038e036ba42"],
      ["nito", "ufore-ekstra", "https://www.tryg.no/odpdf?vilk=nito-person-produkt&vilkNr=05UUL41847", "UUL41847", "2022-01-01", "0c1178486dc148bdd4a86e533bf5119ba0cf428742e5cd362c797038e036ba42"],
    ],
  },
];
