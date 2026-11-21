import { boatMotorMarketArchives } from "./boat-motor-market-evidence.ts";
import { vehicleExtensionMarketArchives } from "./vehicle-extension-market-evidence.ts";
import { privateHolidayContentsArchives } from "./private-holiday-contents-gjensidige-watercircles.ts";
import { privateHomeTravelCoverageArchives } from "./private-home-travel-coverage-market.ts";
import { petCoverageMarketArchives } from "./pet-coverage-market-evidence.ts";
import { frendeDogMarketArchives } from "./frende-dog-market.ts";
import { frendeMarketEditionArchives } from "./frende-market-edition.ts";
import { additionalDamageMarketArchives } from "./additional-damage-market-evidence.ts";
import { fremtindBobilMarketArchives } from "./fremtind-bobil-market.ts";
import { sparebank1FremtindBilMarketArchives } from "./sparebank1-fremtind-bil-market.ts";
import { storebrandHolidayContentsArchives } from "./holiday-contents-storebrand-market.ts";
import { storebrandInnboMarketArchives } from "./storebrand-innbo-market.ts";
import { storebrandMotorMarketArchives } from "./storebrand-motor-market.ts";
import { trygBilMarketArchives } from "./tryg-bil-market.ts";
import { trygBoatMarketArchives } from "./tryg-boat-market.ts";
import { trygHolidayContentsArchives } from "./holiday-contents-tryg-market.ts";
import { trygHomeMarketArchives } from "./tryg-home-market-evidence.ts";
import { trygSnowMarketArchives } from "./tryg-snow-market.ts";
import { trygMemberPackageArchives } from "./tryg-member-package-comparison-evidence.ts";
import { trygMemberDamageArchives } from "./tryg-member-damage-comparison-evidence.ts";

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
  ...vehicleExtensionMarketArchives,
  ...trygMemberPackageArchives,
  ...trygMemberDamageArchives,
  ...additionalDamageMarketArchives,
  ...boatMotorMarketArchives,
  ...frendeMarketEditionArchives,
  {
    provider: "gjensidige",
    slug: "hus-produktark-eap01",
    archivePath: "catalog/sources/gjensidige/hus/IPID-Husforsikring-EAP01.pdf",
    sources: [["gjensidigeHusIpid", "", "https://www.gjensidige.no/ipid/gfno/EAP01"]],
  },
  {
    provider: "gjensidige",
    slug: "snoscooter-produktark-mot05",
    archivePath: "catalog/sources/vehicle-extensions/gjensidige-MOT05.pdf",
    sources: [["vehicle:gjensidige-MOT05.pdf", "", "https://www.gjensidige.no/ipid/gfno/MOT05"]],
  },
  {
    provider: "gjensidige",
    slug: "bobil-produktark-mot08",
    archivePath: "catalog/sources/mc-bobil/gjensidige-bobil-MOT08-ipid.pdf",
    sources: [["mc-bobil:gjensidige-bobil-MOT08-ipid.pdf:bobil", "", "https://www.gjensidige.no/ipid/gfno/MOT08"]],
  },
  {
    provider: "gjensidige",
    slug: "verdisak-produktark-eap16",
    archivePath: "catalog/sources/private-valuables/gjensidige-verdisak-ipid.pdf",
    sources: [
      ["private-valuables:gjensidige:standard:ipid", "", "https://www.gjensidige.no/ipid/gfno/EAP16"],
      ["private-valuables:gjensidige:ipid", "", "https://www.gjensidige.no/ipid/gfno/EAP16"],
    ],
  },
  {
    provider: "tryg",
    slug: "familieulykke",
    archivePath: "catalog/sources/person/tryg-person-familieulykke.pdf",
    sources: [
      ["person:tryg-person-familieulykke", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Familieulykke-Dekningsvilkaar&vilkNr=05UUL41516"],
    ],
  },
  {
    provider: "storebrand",
    slug: "livsforsikring",
    archivePath: "catalog/sources/person/storebrand-person-liv.pdf",
    sources: [
      ["person:storebrand-person-liv", "2011-12", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f1f0b02e-264b-40b1-8214-2df277e620d7:edc64da33a6263e4c4dd4d3da515dc6c9c47bdc9/vilkar-livsforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "udf-liv-medlem",
    archivePath: "catalog/sources/tryg/member-agreements/udf-liv-medlem.pdf",
    sources: [
      ["tryg-utdanningsforbundet-liv-medlem-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/livsforsikring_medlem-2026.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "udf-liv-ektefelle",
    archivePath: "catalog/sources/tryg/member-agreements/udf-liv-ektefelle.pdf",
    sources: [
      ["tryg-utdanningsforbundet-liv-ektefelle-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/livsforsikring_ektefelle-2026.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "udf-ufore-medlem",
    archivePath: "catalog/sources/tryg/member-agreements/udf-ufore-medlem.pdf",
    sources: [
      ["tryg-utdanningsforbundet-ufore-medlem-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/ufore_medlem-2026.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "udf-ufore-ektefelle",
    archivePath: "catalog/sources/tryg/member-agreements/udf-ufore-ektefelle.pdf",
    sources: [
      ["tryg-utdanningsforbundet-ufore-ektefelle-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/ufore_ektefelle-2026.pdf"],
    ],
  },
  {
    provider: "storebrand",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/storebrand-person-ulykke.pdf",
    sources: [
      ["person:storebrand-person-ulykke", "2012-01", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/3e1b926e-0e58-4b15-a9c1-1637fc2b7b59:221b60901d52789a10293bd326573274a35a9e8b/vilkar-ulykkeforsikring.pdf"],
    ],
  },
  {
    provider: "landkreditt",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/landkreditt-person-ulykke.pdf",
    sources: [
      ["person:landkreditt-person-ulykke", "2025-03-01", "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-ulykke.pdf"],
    ],
  },
  {
    provider: "watercircles",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/watercircles-person-ulykke.pdf",
    sources: [
      ["person:watercircles-person-ulykke", "2025-01-01", "https://www.watercircles.no/wp-content/uploads/2024/11/WaterCircles-Ulykke-vilkar-WtCULY-2.12-01.01.25.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "fritidsulykke",
    archivePath: "catalog/sources/person/klp-person-ulykke.pdf",
    sources: [
      ["person:klp-person-ulykke", "", "https://www.klp.no/media/forsikring/Fritidsulykke.pdf"],
      ["person:klp-person-ulykke-maks", "", "https://www.klp.no/media/forsikring/Fritidsulykke.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/fremtind-person-ulykke.pdf",
    sources: [
      ["person:fremtind-person-ulykke", "2022-04-01", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_ulykkesforsikring_ULMI.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "uforepensjon",
    archivePath: "catalog/sources/person/fremtind-person-uforepensjon.pdf",
    sources: [
      ["person:fremtind-person-uforepensjon", "2024-03-01", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_uforepensjon_UP05.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "behandlingsforsikring",
    archivePath: "catalog/sources/person/fremtind-person-behandling.pdf",
    sources: [
      ["person:fremtind-person-behandling", "2025-12-04", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_behandlingsforsikringPM.pdf"],
    ],
  },
  {
    provider: "landkreditt",
    slug: "behandlingsforsikring",
    archivePath: "catalog/sources/person/landkreditt-person-behandling.pdf",
    sources: [
      ["person:landkreditt-person-behandling", "2026-07-01", "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-helse-privat.pdf"],
    ],
  },
  {
    provider: "if",
    slug: "livsforsikring",
    archivePath: "catalog/sources/person/if-person-liv.pdf",
    sources: [
      ["person:if-person-liv", "2025-08-23", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Livsforsikring"],
    ],
  },
  {
    provider: "if",
    slug: "uforepensjon",
    archivePath: "catalog/sources/person/if-person-ufore.pdf",
    sources: [
      ["person:if-person-uforepensjon", "2025-08-23", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Uf%C3%B8reforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "uforepensjon",
    archivePath: "catalog/sources/person/gjensidige-person-uforepensjon.pdf",
    sources: [
      ["person:gjensidige-person-uforepensjon", "", "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "uforekapital-med-forskudd",
    archivePath: "catalog/sources/person/gjensidige-person-uforekapital.pdf",
    sources: [
      ["person:gjensidige-person-uforekapital", "", "https://www.gjensidige.no/files/privat/vilkar/person/uforekapital-med-forskudd-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "storebrand",
    slug: "uforeforsikring-uf03",
    archivePath: "catalog/sources/person/storebrand-person-ufore.pdf",
    sources: [
      ["person:storebrand-person-ufore", "2026-03-01", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/d00efe44-86ce-435d-ab74-690317a302af:a8fa2197254b6d873bb2cfc2e861c2d0c167d159/vilkar-uforeforsikring-uf03.pdf"],
    ],
  },
  {
    provider: "frende",
    slug: "uforepensjon",
    archivePath: "catalog/sources/person/frende-person-uforepensjon.pdf",
    sources: [
      ["person:frende-person-uforepensjon", "2025-01-01", "https://api.frende.no/documents/terms/public/life/DisabilityRate"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/gjensidige-person-barn.pdf",
    sources: [
      ["person:gjensidige-person-barn-basis", "", "https://www.gjensidige.no/files/privat/vilkar/person/Barneforsikring-alminnelige-vilkar.pdf"],
      ["person:gjensidige-person-barn-medium", "", "https://www.gjensidige.no/files/privat/vilkar/person/Barneforsikring-alminnelige-vilkar.pdf"],
      ["person:gjensidige-person-barn-pluss", "", "https://www.gjensidige.no/files/privat/vilkar/person/Barneforsikring-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "uforepensjon-barn",
    archivePath: "catalog/sources/person/gjensidige-person-barn-uforepensjon.pdf",
    sources: [
      ["person:gjensidige-person-barn-basis:barn-uforepensjon", "", "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-barn-alminnelige-vilkar.pdf"],
      ["person:gjensidige-person-barn-medium:barn-uforepensjon", "", "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-barn-alminnelige-vilkar.pdf"],
      ["person:gjensidige-person-barn-pluss:barn-uforepensjon", "", "https://www.gjensidige.no/files/privat/vilkar/person/uforepensjon-barn-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "gravid-produktvilkar",
    archivePath: "catalog/sources/person/tryg-person-gravid-produktvilkar.pdf",
    sources: [
      ["person:tryg-person-gravid-gratis:gravid-produktvilkar", "2025-06-01", "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Produktvilkaar&vilkNr=05UUL41840"],
      ["person:tryg-person-gravid-ekstra:gravid-produktvilkar", "2025-06-01", "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Produktvilkaar&vilkNr=05UUL41840"],
      ["person:tryg-person-gravid-premium:gravid-produktvilkar", "2025-06-01", "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Produktvilkaar&vilkNr=05UUL41840"],
    ],
  },
  {
    provider: "if",
    slug: "gravid-basis",
    archivePath: "catalog/sources/person/if-person-gravid-basis.pdf",
    sources: [
      ["person:if-person-gravid-basis", "2024-11-09", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Basis_Gravidforsikring"],
    ],
  },
  {
    provider: "if",
    slug: "gravid-super",
    archivePath: "catalog/sources/person/if-person-gravid-super.pdf",
    sources: [
      ["person:if-person-gravid-super", "2024-11-09", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Super_Gravidforsikring"],
    ],
  },
  {
    provider: "storebrand",
    slug: "gravid-spedbarn",
    archivePath: "catalog/sources/person/storebrand-person-gravid.pdf",
    sources: [
      ["person:storebrand-person-gravid", "2021-09", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/e3ad945c-94b8-40be-a633-db696962d266:366459414df07675461d76f8d656c68c9aae4aeb/vilkar-gravid-og-spedbarnsforsikring.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "reise-privatansvar-2026-10",
    archivePath: "catalog/sources/tryg/reise/canonical/PGE90020-Privat-ansvar.pdf",
    sources: [
      ["trygReiseLiability202610", "2026-10-01", "https://www.tryg.no/odpdf?vilk=Fellesvilkaar-Privat&vilkNr=05PGE90020"],
    ],
  },
  {
    provider: "tryg",
    slug: "barn-behandling",
    archivePath: "catalog/sources/person/tryg-person-barn-behandling.pdf",
    sources: [
      ["person:tryg-person-barn-ekstra:barn-behandling", "2025-01-01", "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Behandlingsforsikring&vilkNr=05UUL41702"],
      ["person:tryg-person-barn-ulykke:barn-behandling", "2025-01-01", "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Behandlingsforsikring&vilkNr=05UUL41702"],
    ],
  },
  {
    provider: "if",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/if-person-ulykke.pdf",
    sources: [
      ["person:if-person-ulykke", "2017-03", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Ulykkesforsikring"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "ulykkesforsikring",
    archivePath: "catalog/sources/person/gjensidige-person-ulykke.pdf",
    sources: [
      ["person:gjensidige-person-ulykke", "", "https://www.gjensidige.no/files/privat/vilkar/person/ulykkesforsikring-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "ulykkesforsikring-skade",
    archivePath: "catalog/sources/person/tryg-person-ulykke.pdf",
    sources: [
      ["person:tryg-person-ulykke", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Skade&vilkNr=05UUL41501"],
    ],
  },
  {
    provider: "tryg",
    slug: "ulykkesforsikring-dodsfall",
    archivePath: "catalog/sources/person/tryg-person-ulykke-dodsfall.pdf",
    sources: [
      ["person:tryg-person-ulykke:ulykke-dodsfall", "2025-01-01", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Doedsfall&vilkNr=05UUL41502"],
    ],
  },
  {
    provider: "frende",
    slug: "livsforsikring",
    archivePath: "catalog/sources/person/frende-person-liv.pdf",
    sources: [
      ["person:frende-person-liv", "2025-01-01", "https://api.frende.no/documents/terms/public/life/Life"],
    ],
  },
  {
    provider: "fremtind",
    slug: "livsforsikring",
    archivePath: "catalog/sources/person/fremtind-person-liv.pdf",
    sources: [
      ["person:fremtind-person-liv", "2024-05-30", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_liv.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "reise-smartdelay-2026",
    archivePath: "catalog/sources/tryg/reise/SmartDelay-Tryg-2026.pdf",
    sources: [
      ["tryg-reise-premium:smartdelay-2026", "2026-01-01", "https://norsk.smartdelay.com/assets/pdfs/nn_NO/Terms_Tryg_nn-NO.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-bil-produkt-pau14000",
    archivePath: "catalog/sources/tryg/market-bil-2026/PAU14000.pdf",
    sources: [
      ["tryg-nito-bil-delkasko:produktvilkar", "2026-07-01", "https://www.tryg.no/odpdf?vilk=nito-Bil-Produkt&vilkNr=05PAU14000"],
      ["tryg-nito-bil-market-produkt", "2026-07-01", "https://www.tryg.no/odpdf?vilk=nito-Bil-Produkt&vilkNr=05PAU14000"],
    ],
  },
  {
    provider: "tryg",
    slug: "nito-bil-rettshjelp-pge91500",
    archivePath: "catalog/sources/tryg/hus/05PGE91500.pdf",
    sources: [
      ["tryg-nito-bil-delkasko:rettshjelpsvilkar", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Rettshjelp&vilkNr=05PGE91500"],
      ["tryg-nito-bil-market-rettshjelp", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Rettshjelp&vilkNr=05PGE91500"],
    ],
  },
  {
    provider: "tryg",
    slug: "barn-ekstra",
    archivePath: "catalog/sources/person/tryg-person-barn-ekstra.pdf",
    sources: [
      ["person:tryg-person-barn-ekstra", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Barn-og-ungdom-Ekstra-Grunndekning&vilkNr=05UUL41701"],
    ],
  },
  {
    provider: "tryg",
    slug: "barn-utvalgte-sykdommer",
    archivePath: "catalog/sources/person/tryg-person-barn-utvalgte-sykdommer.pdf",
    sources: [
      ["person:tryg-person-barn-ulykke:barn-utvalgte-sykdommer", "2023-01-01", "https://www.tryg.no/odpdf?vilk=Utvalgte-sykdommer&vilkNr=05UUL41707"],
    ],
  },
  {
    provider: "tryg",
    slug: "barn-produktvilkar",
    archivePath: "catalog/sources/person/tryg-person-barn-produktvilkar.pdf",
    sources: [
      ["person:tryg-person-barn-ekstra:barn-produktvilkar", "2023-01-01", "https://www.tryg.no/odpdf?vilk=Barn&vilkNr=05UUL41700"],
      ["person:tryg-person-barn-ulykke:barn-produktvilkar", "2023-01-01", "https://www.tryg.no/odpdf?vilk=Barn&vilkNr=05UUL41700"],
    ],
  },
  {
    provider: "tryg",
    slug: "gravid-ekstra",
    archivePath: "catalog/sources/person/tryg-person-gravid-ekstra.pdf",
    sources: [
      ["person:tryg-person-gravid-ekstra", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Ekstra&vilkNr=05UUL41813"],
    ],
  },
  {
    provider: "tryg",
    slug: "gravid-premium",
    archivePath: "catalog/sources/person/tryg-person-gravid-premium.pdf",
    sources: [
      ["person:tryg-person-gravid-premium", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Gravidforsikring-Premium&vilkNr=05UUL41814"],
    ],
  },
  {
    provider: "if",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/if-person-barn.pdf",
    sources: [
      ["person:if-person-barn-standard", "2024-06-08", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Barneforsikring"],
      ["person:if-person-barn-super:barn", "2024-06-08", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Barneforsikring"],
    ],
  },
  {
    provider: "if",
    slug: "godt-voksen",
    archivePath: "catalog/sources/person/if-person-senior.pdf",
    sources: [
      ["person:if-person-godt-voksen", "2018-11-10", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Godt_voksen"],
    ],
  },
  {
    provider: "storebrand",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/storebrand-person-barn.pdf",
    sources: [
      ["person:storebrand-person-barn-standard", "2026-10-08", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f5b84faf-32b7-400c-bd99-0e4ac6019365:fd42690c132354bb4588994192094c3fecadb4e1/vilkar-barneforsikring01.pdf"],
      ["person:storebrand-person-barn-super", "2026-10-08", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/f5b84faf-32b7-400c-bd99-0e4ac6019365:fd42690c132354bb4588994192094c3fecadb4e1/vilkar-barneforsikring01.pdf"],
    ],
  },
  {
    provider: "frende",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/frende-person-barn.pdf",
    sources: [
      ["person:frende-person-barn-bra", "2026-06-20", "https://api.frende.no/documents/terms/public/life/Child"],
      ["person:frende-person-barn-best", "2026-06-20", "https://api.frende.no/documents/terms/public/life/Child"],
    ],
  },
  {
    provider: "fremtind",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/fremtind-person-barn.pdf",
    sources: [
      ["person:fremtind-person-barn", "2025-08-14", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_barneforsikring_5.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/klp-person-barn.pdf",
    sources: [
      ["person:klp-person-barn", "", "https://www.klp.no/media/forsikring/Vilkar-Barn.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "barn-maks",
    archivePath: "catalog/sources/person/klp-person-barn-maks.pdf",
    sources: [
      ["person:klp-person-barn-maks", "", "https://www.klp.no/media/forsikring/Barn.pdf"],
    ],
  },
  {
    provider: "landkreditt",
    slug: "barneforsikring",
    archivePath: "catalog/sources/person/landkreditt-person-barn.pdf",
    sources: [
      ["person:landkreditt-person-barn", "2022-10-01", "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-barn-og-ungdom.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "utdanningsforbundet-bil-delkasko-2026-07",
    archivePath: "catalog/sources/tryg/member-agreements/udf-bil-delkasko-2026-07.pdf",
    sources: [
      ["tryg-utdanningsforbundet-bil-delkasko-terms", "2026-07-01", "https://www.tryg.no/odpdf?vilk=udf-bil-delkasko&vilkNr=05PAU25945"],
    ],
  },
  {
    provider: "tryg",
    slug: "utdanningsforbundet-barneforsikring",
    archivePath: "catalog/sources/tryg/member-agreements/udf-barneforsikring.pdf",
    sources: [
      ["tryg-utdanningsforbundet-barneforsikring-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/barneforsikring-2026.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "uforepensjon-produktark",
    archivePath: "catalog/sources/person/klp-person-uforepensjon-ipid.pdf",
    sources: [
      ["person:klp-person-ufore:uforepensjon-ipid", "", "https://www.klp.no/media/forsikring/produktark-ipid/Uforeforsikring.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "personforsikring",
    archivePath: "catalog/sources/person/klp-person-person.pdf",
    sources: [
      ["person:klp-person-ufore", "", "https://www.klp.no/media/forsikring/Person.pdf"],
    ],
  },
  {
    provider: "storebrand",
    slug: "helseforsikring",
    archivePath: "catalog/sources/person/storebrand-person-behandling.pdf",
    sources: [
      ["person:storebrand-person-helse", "2026-01-01", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/2ca10c62-bc30-4603-a032-a726aba53799:f03d21b73546b896bcf4cff1516d26dcf7e4809c/vilkar-helseforsikring-tegnet-etter-nov-2009.pdf"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "helse-55",
    archivePath: "catalog/sources/person/gjensidige-person-behandling-55.pdf",
    sources: [
      ["person:gjensidige-person-helse-55", "", "https://www.gjensidige.no/files/privat/vilkar/person/helse-55-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "behandlingsforsikring",
    archivePath: "catalog/sources/person/gjensidige-person-behandling.pdf",
    sources: [
      ["person:gjensidige-person-behandling", "", "https://www.gjensidige.no/files/privat/vilkar/person/behandlingsforsikring-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "if",
    slug: "helseforsikring-produktark",
    archivePath: "catalog/sources/person/if-person-helse-ipid.pdf",
    sources: [
      ["person:if-person-helse:helse-ipid", "", "https://if.no/apps/vilkarsbasendokument/IPID?ipid=Helseforsikring"],
    ],
  },
  {
    provider: "if",
    slug: "helseforsikring",
    archivePath: "catalog/sources/person/if-person-helse.pdf",
    sources: [
      ["person:if-person-helse", "2025-08-23", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Helseforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "behandling-55",
    archivePath: "catalog/sources/person/tryg-person-behandling-55.pdf",
    sources: [
      ["person:tryg-person-behandling-55", "2025-01-01", "https://www.tryg.no/odpdf?vilk=55pluss-Dekningsvilkaar&vilkNr=05UUL41803"],
    ],
  },
  {
    provider: "tryg",
    slug: "behandling-enkel",
    archivePath: "catalog/sources/person/tryg-person-behandling-enkel.pdf",
    sources: [
      ["person:tryg-person-behandling-enkel", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Behandling-enkel-Dekningsvilkaar&vilkNr=05UUL41808"],
    ],
  },
  {
    provider: "tryg",
    slug: "behandling",
    archivePath: "catalog/sources/person/tryg-person-behandling.pdf",
    sources: [
      ["person:tryg-person-behandling", "2025-01-01", "https://www.tryg.no/odpdf?vilk=Behandlingsforsikring-Dekningsvilkaar&vilkNr=05UUL41801"],
    ],
  },
  ...trygBilMarketArchives,
  ...trygBoatMarketArchives,
  ...trygHolidayContentsArchives,
  ...trygHomeMarketArchives,
  ...trygSnowMarketArchives,
  ...storebrandHolidayContentsArchives,
  ...privateHolidayContentsArchives,
  ...privateHomeTravelCoverageArchives,
  ...petCoverageMarketArchives,
  ...storebrandInnboMarketArchives,
  ...storebrandMotorMarketArchives,
  ...fremtindBobilMarketArchives,
  ...frendeDogMarketArchives,
  ...sparebank1FremtindBilMarketArchives,
  {
    provider: "if",
    slug: "kjoretoy-mot2-2",
    archivePath: "catalog/sources/if/Kjoretoyforsikring-MOT2-2.pdf",
    sources: [
      ["ifAnsvar", "2024-03", "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=MOT2-2"],
      ["vehicle:if-Vilkaar-4103ea25.pdf", "2024-03", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring"],
      ["mcb:if:bobil:if-MOT2-2.pdf", "2024-03", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kj%C3%B8ret%C3%B8yforsikring"],
    ],
  },
  {
    provider: "if",
    slug: "campingvogn-bobil-sv707",
    archivePath: "catalog/sources/mc-bobil/if-SV707.pdf",
    sources: [
      ["vehicle:if-SV707.pdf", "2022-06", "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV707"],
      ["mcb:if:bobil:if-SV707.pdf", "2022-06", "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV707"],
    ],
  },
  {
    provider: "storebrand",
    slug: "campingvogn-tilhenger-camp02",
    archivePath: "catalog/sources/vehicle-extensions/storebrand-vilkar-campingvogn-og-tilhenger.pdf",
    sources: [
      ["vehicle:storebrand-vilkar-campingvogn-og-tilhenger.pdf", "2026-03-01", "https://www.storebrand.no/privat/forsikring/campingvognforsikring/_/attachment/inline/047a8396-0549-4f55-8afe-a20fe3cc42d6:af61e7bae3bcc2f6f5300195d35d576c461f0b33/vilkar-campingvogn-og-tilhenger.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "reise",
    archivePath: "catalog/sources/new-private-contents-travel/klp-reise.pdf",
    sources: [
      ["klp-reise", "", "https://www.klp.no/media/forsikring/Reise.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "reise-maks",
    archivePath: "catalog/sources/new-private-contents-travel/klp-reise-maks.pdf",
    sources: [
      ["klp-reise-maks", "", "https://www.klp.no/media/forsikring/Vilkar-Reise-Maks.pdf"],
    ],
  },
  {
    provider: "if",
    slug: "generelle-vilkar-gen2-9",
    archivePath: "catalog/sources/vehicle-extensions/if-Vilkaar-df7c20ba.pdf",
    sources: [
      ["vehicle:if-Vilkaar-df7c20ba.pdf", "2025-06", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Generelle_vilk%C3%A5r"],
    ],
  },
  {
    provider: "if",
    slug: "helars-reise-era3-4",
    archivePath: "catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf",
    sources: [
      ["ifReiseTerms", "2025-03-22", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Hel%C3%A5rs_reiseforsikring"],
    ],
  },
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
    slug: "dyr-produktark",
    archivePath: "catalog/sources/boat-pet/storebrand-pet-ipid.pdf",
    sources: [
      ["boat-pet:storebrand:hund:ipid", "", "https://www.storebrand.no/privat/forsikring/ipid/_/attachment/inline/ac04c858-4151-4348-b4b1-19f0a1139e3e%3A8504d91aa1b6dbbf64bcbefe39b585e49e3b5d6a/ipid-hund-og-katteforsikring.pdf"],
      ["boat-pet:storebrand:katt:ipid", "", "https://www.storebrand.no/privat/forsikring/ipid/_/attachment/inline/ac04c858-4151-4348-b4b1-19f0a1139e3e%3A8504d91aa1b6dbbf64bcbefe39b585e49e3b5d6a/ipid-hund-og-katteforsikring.pdf"],
    ],
  },
  {
    provider: "storebrand",
    slug: "dyr",
    archivePath: "catalog/sources/boat-pet/storebrand-pet-terms.pdf",
    sources: [
      ["boat-pet:storebrand:hund", "2025-02-01", "https://www.storebrand.no/privat/forsikring/hund-og-katteforsikring/_/attachment/inline/089d6bcf-d0cf-413a-9688-ed2ac0bd3e90%3A1b5272a40022708d8a0d66124228f6bb6fb636e3/vilkar-hund-og-katteforsikring.pdf", "https://www.storebrand.no/privat/forsikring/hundeforsikring"],
      ["boat-pet:storebrand:katt", "2025-02-01", "https://www.storebrand.no/privat/forsikring/hund-og-katteforsikring/_/attachment/inline/089d6bcf-d0cf-413a-9688-ed2ac0bd3e90%3A1b5272a40022708d8a0d66124228f6bb6fb636e3/vilkar-hund-og-katteforsikring.pdf", "https://www.storebrand.no/privat/forsikring/katteforsikring"],
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
      ["boat-pet:tryg:båt:machinery", "2026-01-01", "https://www.tryg.no/odpdf?vilk=B%C3%A5t-innebordsmotor-maskinskade&vilkNr=05PFB36910", "https://www.tryg.no/forsikringer/kjoretoy/batforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "bat-ulykke",
    archivePath: "catalog/sources/boat-pet/tryg-boat-accident-terms.pdf",
    sources: [
      ["boat-pet:tryg:båt:accident", "2022-02-01", "https://www.tryg.no/odpdf?vilkNr=05PFB38900&vilk=Forerogpassasjerulykke", "https://www.tryg.no/forsikringer/kjoretoy/batforsikring"],
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
      ["boat-pet:tryg:katt:treatment", "2026-07-01", "https://www.tryg.no/odpdf?vilk=Dyreforsikring-katt-behandling&vilkNr=05PLB52006", "https://www.tryg.no/forsikringer/dyreforsikring/katteforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "katt-ekstra",
    archivePath: "catalog/sources/boat-pet/tryg-cat-extra-terms.pdf",
    sources: [
      ["boat-pet:tryg:katt:extra", "2025-07-01", "https://www.tryg.no/odpdf?vilk=Dyreforsikring-katt-ekstra&vilkNr=05PLB52004", "https://www.tryg.no/forsikringer/katteforsikring"],
    ],
  },
  {
    provider: "tryg",
    slug: "katt-liv",
    archivePath: "catalog/sources/boat-pet/tryg-cat-life-terms.pdf",
    sources: [
      ["boat-pet:tryg:katt:life", "2026-01-01", "https://www.tryg.no/odpdf?vilk=Dyreforsikring-katt-d%C3%B8d&vilkNr=05PLB52005", "https://www.tryg.no/forsikringer/katteforsikring"],
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
      ["person:fremtind-person-kritisk:kritisk-ipid", "", "https://dokument.fremtind.no/ipid/IPID_Kritisk_sykdom_KS03.pdf", "https://content.dnb.no/docs/8679113/ipid-kritisk-sykdom-ks03.pdf"],
    ],
  },
  {
    provider: "fremtind",
    slug: "kritisk-sykdom-generelle-personvilkar",
    archivePath: "catalog/sources/person/fremtind-person-kritisk-generelle.pdf",
    sources: [
      ["person:fremtind-person-kritisk:kritisk-generelle", "2026-04-29", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/generelle_vilkar_personforsikring.pdf"],
    ],
  },
  {
    provider: "landkreditt",
    slug: "kritisk-sykdom-flytteavtale",
    archivePath: "catalog/sources/person/landkreditt-person-kritisk-flytteavtale.pdf",
    sources: [
      ["person:landkreditt-person-kritisk:kritisk-flytteavtale", "2023-09-01", "https://www.finansnorge.no/siteassets/dokumenter/avtaler/1.3.8-bransjeavtale-ved-flytting-av-individuelle-personforsikringer-med-helsevurdering-01.09.23-.pdf"],
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
    provider: "if",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/if-person-kritisk.pdf",
    sources: [
      ["person:if-person-kritisk", "2025-08-23", "https://if.no/apps/vilkarsbasendokument/Vilkaar?produkt=Kritisk_sykdom"],
    ],
  },
  {
    provider: "gjensidige",
    slug: "alvorlig-sykdom",
    archivePath: "catalog/sources/person/gjensidige-person-kritisk.pdf",
    sources: [
      ["person:gjensidige-person-alvorlig-sykdom", "", "https://www.gjensidige.no/files/privat/vilkar/person/alvorlig-sykdom-alminnelige-vilkar.pdf"],
    ],
  },
  {
    provider: "storebrand",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/storebrand-person-kritisk.pdf",
    sources: [
      ["person:storebrand-person-kritisk", "2023-03", "https://www.storebrand.no/privat/forsikring/forsikringsvilkar/_/attachment/inline/be9f85de-96f6-4842-9979-990e26679cc7:782c93d799a653a2399367e5e2ba6de5b81b2429/vilkar-forsikring-kritisk-sykdom.pdf"],
    ],
  },
  {
    provider: "frende",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/frende-person-kritisk.pdf",
    sources: [
      ["person:frende-person-kritisk", "2026-09-01", "https://api.frende.no/documents/terms/public/life/CriticalIllness"],
    ],
  },
  {
    provider: "fremtind",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/fremtind-person-kritisk.pdf",
    sources: [
      ["person:fremtind-person-kritisk", "2025-09-22", "https://dokument.fremtind.no/vilkar/fremtind/pm/liv_og_helse/vilkar_kritisk_Sykdom_KS03.pdf"],
    ],
  },
  {
    provider: "klp",
    slug: "alvorlige-sykdommer",
    archivePath: "catalog/sources/person/klp-person-person.pdf",
    sources: [
      ["person:klp-person-alvorlige-sykdommer", "", "https://www.klp.no/media/forsikring/Person.pdf"],
    ],
  },
  {
    provider: "landkreditt",
    slug: "kritisk-sykdom",
    archivePath: "catalog/sources/person/landkreditt-person-kritisk-sykdom.pdf",
    sources: [
      ["person:landkreditt-person-kritisk", "2022-10-01", "https://www.landkreditt.no/globalassets/forsikring/vilkar/vilkar-kritisk-sykdom.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "utdanningsforbundet-kritisk-sykdom-medlem",
    archivePath: "catalog/sources/tryg/member-agreements/udf-kritisk-sykdom-medlem.pdf",
    sources: [
      ["tryg-utdanningsforbundet-kritisk-sykdom-medlem-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/kritisk-sykdom_medlem-2026.pdf"],
    ],
  },
  {
    provider: "tryg",
    slug: "utdanningsforbundet-kritisk-sykdom-ektefelle",
    archivePath: "catalog/sources/tryg/member-agreements/udf-kritisk-sykdom-ektefelle.pdf",
    sources: [
      ["tryg-utdanningsforbundet-kritisk-sykdom-ektefelle-terms", "2026", "https://utdn02mstryy29gprod.dxcloud.episerver.net/globalassets/medlem/forsikring/dok-2026/bevis-og-vilkar-2026/kritisk-sykdom_ektefelle-2026.pdf"],
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
      ["person:tryg-person-behandling:ulykke-produktvilkar", "", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Produktvilkaar&vilkNr=05UUL41500"],
      ["person:tryg-person-behandling-enkel:ulykke-produktvilkar", "", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Produktvilkaar&vilkNr=05UUL41500"],
      ["person:tryg-person-behandling-55:ulykke-produktvilkar", "", "https://www.tryg.no/odpdf?vilk=Ulykkesforsikring-Produktvilkaar&vilkNr=05UUL41500"],
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
