import type { CatalogSource } from "./product-catalog.ts";

const root = "https://dokument.fremtind.no";
const channels = ["Eika", "SpareBank 1", "DNB"];
const common = { company: "Fremtind", insuranceType: "Hus", distributionChannels: channels };

export const fremtindHusSources: Record<string, CatalogSource> = {
  fremtindHusStandard: {
    id: "fremtindHusStandard", filename: "Vilkar_Topp_Hus.pdf", documentName: "Standard bygningsforsikring",
    termsNumber: "PBK-200.100-015", productCode: "PBK-200.100", version: "015",
    effectiveFrom: "2024-01-01", appliesTo: ["Standard"], ...common,
    url: `${root}/vilkar/fremtind/pm/eiendom/Vilkar_Topp_Hus.pdf`,
    sha256: "6c77bd57259d8d01390bccaf415f14f6b245e45345b597b6f651574ebaeebec3",
  },
  fremtindHusTopp: {
    id: "fremtindHusTopp", filename: "Vilkar_Topp_Hus.pdf", documentName: "Topp bygningsforsikring",
    termsNumber: "PBK-200.200-010", productCode: "PBK-200.200", version: "010",
    effectiveFrom: "2023-03-15", appliesTo: ["Topp"], ...common,
    url: `${root}/vilkar/fremtind/pm/eiendom/Vilkar_Topp_Hus.pdf`,
    sha256: "6c77bd57259d8d01390bccaf415f14f6b245e45345b597b6f651574ebaeebec3",
  },
  fremtindHusIpid: {
    id: "fremtindHusIpid", filename: "IPID_Hus.pdf", documentName: "IPID Husforsikring",
    termsNumber: "V.103", productCode: "Husforsikring", version: "V.103", effectiveFrom: "",
    appliesTo: ["Standard", "Topp", "Tilleggsdekninger"], ...common,
    url: `${root}/ipid/IPID_Hus.pdf`,
    sha256: "62be21f187b55d5d7f5697c74cbf7669167465d96a50ee6c25d326dd6b5facc4",
  },
  fremtindHusRot: {
    id: "fremtindHusRot", filename: "Vilkar_Sopp_og_Rate_valgbar.pdf",
    documentName: "Sopp-, råte- og insektsforsikring", termsNumber: "PBK-200.301-009",
    productCode: "PBK-200.301", version: "009", effectiveFrom: "2024-01-01",
    appliesTo: ["Valgfritt tillegg til Standard og Topp"], ...common,
    url: `${root}/vilkar/fremtind/pm/eiendom/Vilkar_Sopp_og_Rate_valgbar.pdf`,
    sha256: "036537b5fba6c097cb3ecc93e269a84ed89bd044227b1224cc11aeb29556b245",
  },
  fremtindHusRental: {
    id: "fremtindHusRental", filename: "Vilkar_Utleie_valgbar.pdf", documentName: "Utleieforsikring",
    termsNumber: "PBK-200.302-007", productCode: "PBK-200.302", version: "007",
    effectiveFrom: "2023-03-15", appliesTo: ["Valgfritt tillegg til Standard og Topp"], ...common,
    url: `${root}/vilkar/fremtind/pm/eiendom/Vilkar_Utleie_valgbar.pdf`,
    sha256: "29cb2e02ba5cdaaf7595832a5cb56c01e167b12937acd4c0872b2d68ad970971",
  },
  fremtindHusEikaChannel: {
    id: "fremtindHusEikaChannel", filename: "Eika-vilkarsoversikt.html",
    documentName: "Eika – vilkår for nye produkter", termsNumber: "Kanaloversikt Eika",
    version: "Kontrollert 20.09.2026", effectiveFrom: "2025-10-13", updatedAt: "2026-09-20",
    appliesTo: ["Eika-distribusjon"], company: "Fremtind", insuranceType: "Hus",
    distributionChannels: ["Eika"], url: "https://www.eikaforsikring.no/alle-forsikringer/vilkar",
    sha256: "338a5dad1f41d828853a59d231489df4c3e69a5b87e256664e53bdc4a71f002f",
  },
  fremtindHusSpareBank1Channel: {
    id: "fremtindHusSpareBank1Channel", filename: "SpareBank1-husforsikring.html",
    documentName: "SpareBank 1 – husforsikring", termsNumber: "Kanaloversikt SpareBank 1",
    version: "Kontrollert 20.09.2026", effectiveFrom: "", updatedAt: "2026-09-20",
    appliesTo: ["SpareBank 1-distribusjon"], company: "Fremtind", insuranceType: "Hus",
    distributionChannels: ["SpareBank 1"], url: "https://www.sparebank1.no/nb/smn/privat/forsikring/husforsikring.html",
    sha256: "eca5cd4c869448d7387b61ba95f87d9758f8e82869a4641788da415a1b82a1a1",
  },
  fremtindHusDnbChannel: {
    id: "fremtindHusDnbChannel", filename: "DNB-husforsikring.html",
    documentName: "DNB – husforsikring", termsNumber: "Kanaloversikt DNB",
    version: "Kontrollert 20.09.2026", effectiveFrom: "", updatedAt: "2026-09-20",
    appliesTo: ["DNB-distribusjon"], company: "Fremtind", insuranceType: "Hus",
    distributionChannels: ["DNB"], url: "https://www.dnb.no/forsikring/husforsikring",
    sha256: "99e67d03814eaeb74b2c7cfa2d26d6099c36bf9bf841b080de8d0fdbae92976b",
  },
};
