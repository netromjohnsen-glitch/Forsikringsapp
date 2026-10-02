import type { CatalogSource } from "./product-catalog.ts";
import { buildMcBobilCatalog, type McBobilRow, type McBobilProductDefinition, type McBobilAddOnDefinition } from "./mc-bobil-catalog-builder.ts";
import type { McBobilType } from "./mc-bobil-registry.ts";

// Immutable originals and fact/page audit: catalog/sources/mc-bobil/gjensidige-storebrand-manifest.json
// and docs/mc-bobil-sources-gjensidige-storebrand.md. Retrieval dates are never policy versions.
const sources: Record<string, CatalogSource> = {
  "mc-bobil:gjensidige-mc-produkt.html:mc": {
    "id": "mc-bobil:gjensidige-mc-produkt.html:mc",
    "filename": "gjensidige-mc-produkt.html",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/forsikring/mc-forsikring",
    "sha256": "5fe4383ed92a538c0aea792c549d361202249149e1e5ff4eadf80be06d5a05f3",
    "documentName": "gjensidige-mc-produkt.html"
  },
  "mc-bobil:gjensidige-bobil-produkt.html:bobil": {
    "id": "mc-bobil:gjensidige-bobil-produkt.html:bobil",
    "filename": "gjensidige-bobil-produkt.html",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/forsikring/kjoretoy/bobilforsikring",
    "sha256": "fe5e9775c7fab9c8e05a3c7448b3f6b8106839964f169fa76bf910d21a60ed26",
    "documentName": "gjensidige-bobil-produkt.html"
  },
  "mc-bobil:storebrand-mc-forsikring.html:mc": {
    "id": "mc-bobil:storebrand-mc-forsikring.html:mc",
    "filename": "storebrand-mc-forsikring.html",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.storebrand.no/privat/forsikring/mc-forsikring",
    "sha256": "57eee721cf1591ca4728d32446d83df52872e84b21ae40fd9796fa3fddbd163d",
    "documentName": "storebrand-mc-forsikring.html",
    "productIds": [
      "storebrand-mc-ansvar",
      "storebrand-mc-delkasko",
      "storebrand-mc-kasko"
    ]
  },
  "mc-bobil:storebrand-bil-bobil-produkt.html:bobil": {
    "id": "mc-bobil:storebrand-bil-bobil-produkt.html:bobil",
    "filename": "storebrand-bil-bobil-produkt.html",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "product_page",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.storebrand.no/privat/forsikring/bilforsikring",
    "sha256": "3a1592196e9b7c6a3dad7df21c1745881661e8fe0cce0793ff455003fcde32c6",
    "documentName": "storebrand-bil-bobil-produkt.html",
    "productIds": [
      "storebrand-bobil-ansvar",
      "storebrand-bobil-delkasko",
      "storebrand-bobil-kasko",
      "storebrand-bobil-super"
    ]
  },
  "mc-bobil:gjensidige-mc-kasko-vilkar.pdf:mc": {
    "id": "mc-bobil:gjensidige-mc-kasko-vilkar.pdf:mc",
    "filename": "gjensidige-mc-kasko-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/MC-Kasko-alminnelige-vilkar.pdf",
    "sha256": "735f518bd45c6470965c1ea6be2f596b6504cee9a09c47718a629ed319db5e58",
    "documentName": "gjensidige-mc-kasko-vilkar.pdf",
    "productIds": [
      "gjensidige-mc-kasko"
    ]
  },
  "mc-bobil:gjensidige-mc-delkasko-vilkar.pdf:mc": {
    "id": "mc-bobil:gjensidige-mc-delkasko-vilkar.pdf:mc",
    "filename": "gjensidige-mc-delkasko-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/MC-Delkasko-alminnelige-vilkar.pdf",
    "sha256": "45952992dfe399ab2739be019307a485044639516cc7a75dfbbdd030437495e7",
    "documentName": "gjensidige-mc-delkasko-vilkar.pdf",
    "productIds": [
      "gjensidige-mc-delkasko"
    ]
  },
  "mc-bobil:gjensidige-mc-ansvar-vilkar.pdf:mc": {
    "id": "mc-bobil:gjensidige-mc-ansvar-vilkar.pdf:mc",
    "filename": "gjensidige-mc-ansvar-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/mc-ansvar-alminnelige-vilkar.pdf",
    "sha256": "eb31b56bb352906888cace2eb516b4dc336da06f3d3f8414fe4f47b10f4301b1",
    "documentName": "gjensidige-mc-ansvar-vilkar.pdf",
    "productIds": [
      "gjensidige-mc-ansvar"
    ]
  },
  "mc-bobil:gjensidige-bobil-pluss-vilkar.pdf:bobil": {
    "id": "mc-bobil:gjensidige-bobil-pluss-vilkar.pdf:bobil",
    "filename": "gjensidige-bobil-pluss-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Pluss-alminnelige-vilkar.pdf",
    "sha256": "64eff6544529afba60722892de07b2db9ee8c3d0b0123001cbb7dfedfcd7e7d7",
    "documentName": "gjensidige-bobil-pluss-vilkar.pdf",
    "productIds": [
      "gjensidige-bobil-pluss"
    ]
  },
  "mc-bobil:gjensidige-bobil-kasko-vilkar.pdf:bobil": {
    "id": "mc-bobil:gjensidige-bobil-kasko-vilkar.pdf:bobil",
    "filename": "gjensidige-bobil-kasko-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Kasko-alminnelige-vilkar.pdf",
    "sha256": "7971a0170cf272cacec8e9da23633fa630245631d04e99f455b174dd3a2fc734",
    "documentName": "gjensidige-bobil-kasko-vilkar.pdf",
    "productIds": [
      "gjensidige-bobil-kasko"
    ]
  },
  "mc-bobil:gjensidige-bobil-delkasko-vilkar.pdf:bobil": {
    "id": "mc-bobil:gjensidige-bobil-delkasko-vilkar.pdf:bobil",
    "filename": "gjensidige-bobil-delkasko-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/Bobil-Delkasko-alminnelige-vilkar.pdf",
    "sha256": "978ff27d1df6f978775356ec1a65c164a2d18d2912d1b13bb63b99a110e1f1fd",
    "documentName": "gjensidige-bobil-delkasko-vilkar.pdf",
    "productIds": [
      "gjensidige-bobil-delkasko"
    ]
  },
  "mc-bobil:gjensidige-bobil-ansvar-vilkar.pdf:bobil": {
    "id": "mc-bobil:gjensidige-bobil-ansvar-vilkar.pdf:bobil",
    "filename": "gjensidige-bobil-ansvar-vilkar.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/bobil-ansvar-alminnelige-vilkar.pdf",
    "sha256": "0b7e01951d751773f3d8afd1175ea2dcf137820a2d440d68f880370c2b369f03",
    "documentName": "gjensidige-bobil-ansvar-vilkar.pdf",
    "productIds": [
      "gjensidige-bobil-ansvar"
    ]
  },
  "mc-bobil:gjensidige-mc-MOT03-ipid.pdf:mc": {
    "id": "mc-bobil:gjensidige-mc-MOT03-ipid.pdf:mc",
    "filename": "gjensidige-mc-MOT03-ipid.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "MOT03",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/ipid/gfno/MOT03",
    "sha256": "4c5fca45ee41621e890580e0f3dead02c8bd57440bdac3913912b95a6faafdad",
    "documentName": "gjensidige-mc-MOT03-ipid.pdf"
  },
  "mc-bobil:gjensidige-bobil-MOT08-ipid.pdf:bobil": {
    "id": "mc-bobil:gjensidige-bobil-MOT08-ipid.pdf:bobil",
    "filename": "gjensidige-bobil-MOT08-ipid.pdf",
    "providerId": "gjensidige",
    "company": "gjensidige",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "ipid",
    "termsNumber": "MOT08",
    "effectiveFrom": "",
    "url": "https://www.gjensidige.no/ipid/gfno/MOT08",
    "sha256": "ca50c2bcf74bed138add832ec6f1605f13e29d3416721dbe57f0696145e50cd6",
    "documentName": "gjensidige-bobil-MOT08-ipid.pdf"
  },
  "mc-bobil:storebrand-motor09:mc": {
    "id": "mc-bobil:storebrand-motor09:mc",
    "filename": "storebrand-vilkar-motorvognforsikring.pdf",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "motor09",
    "effectiveFrom": "2025-04-01",
    "url": "https://www.storebrand.no/privat/forsikring/mc-forsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:e9289744b0f0bb00c7304e715377b4be9a0e85d8/vilkar-motorvognforsikring.pdf",
    "sha256": "7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb",
    "documentName": "storebrand-vilkar-motorvognforsikring.pdf",
    "version": "motor09",
    "productIds": [
      "storebrand-mc-ansvar",
      "storebrand-mc-delkasko",
      "storebrand-mc-kasko"
    ]
  },
  "mc-bobil:storebrand-motor09:bobil": {
    "id": "mc-bobil:storebrand-motor09:bobil",
    "filename": "storebrand-vilkar-motorvognforsikring.pdf",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "motor09",
    "effectiveFrom": "2025-04-01",
    "url": "https://www.storebrand.no/privat/forsikring/mc-forsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:e9289744b0f0bb00c7304e715377b4be9a0e85d8/vilkar-motorvognforsikring.pdf",
    "sha256": "7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb",
    "documentName": "storebrand-vilkar-motorvognforsikring.pdf",
    "version": "motor09",
    "productIds": [
      "storebrand-bobil-ansvar",
      "storebrand-bobil-delkasko",
      "storebrand-bobil-kasko",
      "storebrand-bobil-super"
    ]
  },
  "mc-bobil:storebrand-gener07:mc": {
    "id": "mc-bobil:storebrand-gener07:mc",
    "filename": "vilkar-generelle.pdf",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "MC",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "gener07",
    "effectiveFrom": "2026-09-01",
    "url": "https://www.storebrand.no/privat/forsikring/bilforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf",
    "sha256": "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",
    "documentName": "vilkar-generelle.pdf",
    "version": "gener07",
    "productIds": [
      "storebrand-mc-ansvar",
      "storebrand-mc-delkasko",
      "storebrand-mc-kasko"
    ]
  },
  "mc-bobil:storebrand-gener07:bobil": {
    "id": "mc-bobil:storebrand-gener07:bobil",
    "filename": "vilkar-generelle.pdf",
    "providerId": "storebrand",
    "company": "storebrand",
    "insuranceType": "Bobil",
    "agreementScope": "ordinary",
    "sourceType": "full_terms",
    "termsNumber": "gener07",
    "effectiveFrom": "2026-09-01",
    "url": "https://www.storebrand.no/privat/forsikring/bilforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf",
    "sha256": "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754",
    "documentName": "vilkar-generelle.pdf",
    "version": "gener07",
    "productIds": [
      "storebrand-bobil-ansvar",
      "storebrand-bobil-delkasko",
      "storebrand-bobil-kasko",
      "storebrand-bobil-super"
    ]
  }
};

const definitions: McBobilProductDefinition[] = [];
const additions: McBobilAddOnDefinition[] = [];
const gjSource = (type: McBobilType, tier: string) => `mc-bobil:gjensidige-${type}-${tier}-vilkar.pdf:${type}`;
const stSource = (type: McBobilType) => `mc-bobil:storebrand-motor09:${type}`;
function at(sourceId: string, page: number, section: string, entries: [string, string][]): McBobilRow[] {
  return entries.map(([key, value]) => ({ key, value, sourceId, page, section }));
}
function deductible(sourceId: string, page: number, section: string, key: string, value: string, classification: McBobilRow["deductibleClassification"] = "coverage"): McBobilRow {
  return { key, value, sourceId, page, section, deductibleClassification: classification };
}

// Each product is materialized from its own applicable terms. Shared factories
// express verified equal rules; they do not infer insurance-level inheritance.
for (const type of ["mc", "bobil"] as const) {
  for (const tier of type === "mc" ? ["ansvar", "delkasko", "kasko"] : ["ansvar", "delkasko", "kasko", "pluss"]) {
    const sourceId = gjSource(type, tier);
    const rows: McBobilRow[] = [
      ...at(sourceId, 1, "Forsikringen dekker – ansvar, rettshjelp og ulykke", [
        ["ansvar.dekning", "Inkludert"], ["ansvar.person.grense", "Ubegrenset"], ["ansvar.ting.grense", "100 millioner kr"],
        ["rettshjelp.dekning", "Inkludert"], ["rettshjelp.grense", "100 000 kr"],
        ["ulykke.dekning", "Inkludert for fører og passasjer"], ["ulykke.dod", "100 000 kr"], ["ulykke.invaliditet", "200 000 kr ved 100 % medisinsk invaliditet"],
      ]),
      ...at(sourceId, 3, "Hvor gjelder forsikringen", [["avtale.geografi", "Europa, unntatt Kosovo, Russland og Belarus; rettshjelp bare i Norden"], ["rettshjelp.geografi", "Norden"]]),
      deductible(sourceId, tier === "ansvar" || (type === "bobil" && tier === "delkasko") ? 8 : 9, "Rettshjelp – egenandel", "rettshjelp.egenandel", "4 000 kr + 20 % av utgiftene som dekkes; 0 kr ved utenrettslig mekling gjennom Mekle.no"),
    ];
    if (tier !== "ansvar") rows.push(
      ...at(sourceId, 3, "Hvilke skader", [["brann.dekning", "Brann med åpne flammer, lynnedslag og eksplosjon"], ["tyveri.dekning", "Tyveri og forsøk på tyveri"], ["glass.dekning", "Bruddskade på kjøretøyets glassruter"]]),
      deductible(sourceId, 1, "Forsikringen dekker", "brann.egenandel", "6 000 kr"),
      deductible(sourceId, 1, "Forsikringen dekker", "tyveri.egenandel", "6 000 kr"),
      deductible(sourceId, 1, "Glass", "glass.egenandel", "3 000 kr ved skifte av rute"),
      deductible(sourceId, 1, "Glass", "glass.reparasjon.egenandel", "Ingen egenandel ved reparasjon"),
      ...at(sourceId, type === "mc" ? 4 : 3, "Veihjelp", [["veihjelp.dekning", "Inkludert ved skade, tyveri eller driftsstans og ved førers/passasjerers sykdom, ulykke eller død"]]),
      deductible(sourceId, 1, "Veihjelp", "veihjelp.egenandel", "750 kr"),
      ...at(sourceId, 1, "Ekstrautstyr og løsøre", [["utstyr.dekning", "Inkludert ved en skadetype forsikringen dekker"], ["utstyr.grense", type === "mc" ? "10 000 kr" : "Ubegrenset for fastmontert ekstrautstyr"],
        [type === "mc" ? "mc.bagasje.dekning" : "bobil.losore.dekning", "Inkludert ved en skadetype forsikringen dekker"],
        [type === "mc" ? "mc.bagasje.grense" : "bobil.losore.grense", type === "mc" ? "5 000 kr" : tier === "pluss" ? "50 000 kr" : "10 000 kr"]]),
    );
    if (type === "mc" && tier !== "ansvar") rows.push(
      ...at(`mc-bobil:gjensidige-mc-produkt.html:mc`, 1, "Personlige ting", [["mc.bagasje.begrensning", "Ting i låst oppbevaringsrom på motorsykkelen; skaden må være av en type valgt forsikring dekker"]]),
    );
    if (type === "mc" && tier === "kasko") rows.push(
      ...at(sourceId, 4, "Veihjelp ved feriereiser utenfor Norden", [["mc.leiekjoretoy.dekning", "Leie av tilsvarende kjøretøy ved avbrutt feriereise utenfor Norden"], ["mc.leiekjoretoy.dager", "Inntil 15 dager"], ["mc.leiekjoretoy.begrensning", "Kjøretøyet kan ikke repareres innen 2 virkedager; for å fullføre planlagt ferie"]]),
    );
    if (type === "bobil" && tier !== "ansvar") rows.push(...at(sourceId, 3, "Hva er forsikret – fortelt", [["utstyr.begrensning", "Fortelt omfattes ikke av fastmontert ekstrautstyr; krever egen utvidelse"]]));
    if (["kasko", "pluss"].includes(tier)) rows.push(
      ...at(sourceId, 3, "Hvilke skader", [["kasko.dekning", "Skade på kjøretøyet som følge av plutselig ytre påvirkning"]]),
      deductible(`mc-bobil:gjensidige-${type}-produkt.html:${type}`, 1, "Egenandel", "kasko.egenandel", "Avtalt egenandel; valg mellom 6 000 og 12 000 kr", "reference"),
      ...at(`mc-bobil:gjensidige-${type}-produkt.html:${type}`, 1, "Feilfylling av drivstoff", [["feilfylling.dekning", "Skade på motor som skyldes feil type drivstoff"]]),
    );
    if (type === "bobil" && ["kasko", "pluss"].includes(tier)) rows.push(
      ...at(sourceId, 15, "Erstatningsregler – Totalskadegaranti i Kasko og Pluss", [
        ["nyverdi.dekning", "Inkludert"], ["nyverdi.alder", "Inntil 1 år fra første registreringsdato"], ["nyverdi.km", "Inntil 20 000 km"],
        ["nyverdi.skadegrad", "Kjøretøyet er tapt, eller reparasjonsutgiftene overstiger markedsverdien for tilsvarende kjøretøy på skadetidspunktet"],
        ["nyverdi.oppgjor", "Ny tilsvarende bobil eller kontantbeløpet Gjensidige ville betalt for tilsvarende ny bobil"],
        ["nyverdi.begrensning", "Gjelder ikke bedriftseid eller leaset kjøretøy; heller ikke brann eller tyveri når eieren kjøpte kjøretøyet brukt"],
      ]),
      ...at(sourceId, 4, "Veihjelp ved feriereiser utenfor Norden", [["leiebil.dekning", "Tilsvarende leiebil for å fullføre planlagt ferie utenfor Norden"], ["leiebil.dager", "Inntil 15 dager"], ["leiebil.begrensning", "Bobilen kan ikke repareres innen 3 virkedager"]]),
    );
    if (type === "bobil" && tier === "kasko") rows.push(
      ...at(sourceId, 3, "Hvilke skader – skadedyr", [["bobil.skadedyr.dekning", "Skader som skyldes gnagere, insekter og andre skadedyr"]]),
    );
    if (tier === "pluss") rows.push(
      ...at(sourceId, 3, "Hvilke skader – maskinskade", [
        ["maskinskade.dekning", "Inkludert"], ["maskinskade.alder", "Til første hovedforfall etter 15 år fra førstegangsregistrering"], ["maskinskade.km", "200 000 km; alder eller kilometergrense, det som inntreffer først"],
        ["maskinskade.komponenter", "Motor, girkasse, drivaksler til og med drivknuter, mellomaksler, differensialer, fordelingsgirkasse til firehjulstrekk, startmotor, dynamo, servopumpe/elektropumpe til styring, vann-/diesel-/bensin-/matepumpe, motorstyringsenhet, turbo, intercooler, EGR-ventil, lambdasonde, radiator, kjølevæskebeholdere, eksosmanifold, svinghjul, elektronikk til AdBlue og head-up-display; elektronikk til disse komponentene. El/hybrid: høyspentbatteri, ladeenhet og AC-kompressor ved nød-/krabbemodus"],
        ["maskinskade.begrensning", "Vedlikehold og service må dokumenteres. Clutch, eksosanlegg utenom manifold, katalysator/partikkelfilter og gradvis slitasje er blant unntakene"],
      ]),
      deductible(sourceId, 15, "Erstatningsregler – Egenandel maskinskade", "maskinskade.egenandel.kilometer", "0–119 999 km: 10 000 kr; 120 000–159 999 km: 14 000 kr; 160 000–200 000 km: 18 000 kr"),
      ...at(sourceId, 3, "Hvilke skader – fukt og skadedyr", [
        ["bobil.fukt.dekning", "Fuktskader i vegger, tak og gulv"], ["bobil.fukt.alder", "Ikke eldre enn 15 år fra produksjonsdato"],
        ["bobil.fukt.kontroll", "Fuktighetstest uten anmerkninger av forhandler eller bobilverksted mindre enn 1 år før skaden oppdages; skaden må konstateres i forsikringstiden"],
        ["bobil.skadedyr.dekning", "Skader som skyldes gnagere, insekter og andre skadedyr"],
      ]),
      ...at(sourceId, 4, "Feriegaranti", [["bobil.feriegaranti.dekning", "Dokumenterte utgifter til leie av bobil, hotell eller lignende"], ["bobil.feriegaranti.dagsbelop", "Inntil 1 500 kr per dag"], ["bobil.feriegaranti.dager", "Inntil 14 dager"], ["bobil.feriegaranti.begrensning", "Planlagt ferie over 6 dager som ikke kan gjennomføres etter dekket skade; avbrutt ferie under utlån eller utleie dekkes ikke"]]),
      ...at(sourceId, 1, "Bilnøkkel", [["nokkel.dekning", "Tapt, stjålet eller skadet nøkkel"], ["nokkel.grense", "15 000 kr"]]),
      ...at(sourceId, 3, "Hvilke skader – bilnøkkel", [["nokkel.begrensning", "1 skadetilfelle per forsikringsår"]]),
      deductible(sourceId, 1, "Bilnøkkel", "nokkel.egenandel", "1 500 kr"),
    );
    definitions.push({ providerId: "gjensidige", company: "Gjensidige", type, agreementScope: "ordinary", productId: `gjensidige-${type}-${tier}`, name: tier[0].toUpperCase() + tier.slice(1), version: null, sourceId, rows });
  }
}

// Availability only. No fixed customer-selected sum or false selection from
// the public sample's "Utleie er ikke valgt" is imported into the base products.
for (const [suffix, name, key, value, section] of [
  ["utleie", "Utleie", "bobil.utleie.dekning", "Utleiedekning avtalt særskilt", "Utleie"],
  ["fortelt", "Fortelt", "bobil.fortelt.dekning", "Fortelt med særskilt avtalt utvidelse", "Mulige utvidelser"],
] as const) {
  const sourceId = suffix === "utleie" ? "mc-bobil:gjensidige-bobil-produkt.html:bobil" : "mc-bobil:gjensidige-bobil-MOT08-ipid.pdf:bobil";
  additions.push({ providerId: "gjensidige", company: "Gjensidige", type: "bobil", agreementScope: "ordinary", id: `gjensidige-bobil-${suffix}`, name, requiresLevel: ["gjensidige-bobil-delkasko", "gjensidige-bobil-kasko", "gjensidige-bobil-pluss"], sourceId, rows: at(sourceId, 1, section, [[key, value]]) });
}

for (const type of ["mc", "bobil"] as const) {
  const sourceId = stSource(type);
  for (const tier of type === "mc" ? ["ansvar", "delkasko", "kasko"] : ["ansvar", "delkasko", "kasko", "super"]) {
    const rows: McBobilRow[] = [
      ...at(sourceId, 9, "6.1 Ansvarsforsikring", [["ansvar.dekning", "Inkludert når kjøretøyet er påregistrert"], ["ansvar.person.grense", "Ubegrenset"], ["ansvar.ting.grense", "100 millioner kr"]]),
      ...at(sourceId, 32, "13 Rettshjelp – forsikringssum og egenandel", [["rettshjelp.dekning", "Inkludert"], ["rettshjelp.grense", "100 000 kr per tvist"]]),
      deductible(sourceId, 32, "13 Rettshjelp – egenandel", "rettshjelp.egenandel", "4 000 kr + 20 % av det overskytende"),
      ...at(sourceId, 5, "Sammendrag – fører- og passasjerulykke", [["ulykke.dekning", "Inkludert for fører og passasjer"], ["ulykke.dod", "100 000 kr"], ["ulykke.invaliditet", "200 000 kr; 500 000 kr for barn under 18 år"]]),
      ...at(sourceId, 6, "4 Hvor forsikringen gjelder", [["avtale.geografi", "EØS og Sveits; inntil 3 måneder i øvrige europeiske Grønt kort-land. Ikke Tyrkia, Russland, Belarus eller Kosovo"], ["rettshjelp.geografi", "Norden"]]),
    ];
    if (tier !== "ansvar") rows.push(
      ...at(sourceId, 9, "6.2.1 Brann", [["brann.dekning", "Brann, lynnedslag og eksplosjon"]]),
      deductible(sourceId, 10, "6.2.1 Brann – egenandel", "brann.egenandel", "8 000 kr hvis ikke annet fremgår av forsikringsbeviset", "standard"),
      ...at(sourceId, 10, "6.2.2 Tyveri", [["tyveri.dekning", "Tyveri, forsøk på tyveri og hærverk ved tyveriforsøk eller innbrudd"]]),
      deductible(sourceId, 10, "6.2.2 Tyveri – egenandel", "tyveri.egenandel", "8 000 kr hvis ikke annet fremgår av forsikringsbeviset", "standard"),
      ...at(sourceId, 12, "6.2.4 Glass", [["glass.dekning", "Bruddskade ved tilfeldig, plutselig hendelse"], ["glass.begrensning", "Ved skifte erstattes høyst 50 % av kjøretøyets gjenanskaffelsesverdi"]]),
      deductible(sourceId, 12, "6.2.4 Glass – egenandel", "glass.egenandel", "3 000 kr ved skifte"),
      deductible(sourceId, 12, "6.2.4 Glass – egenandel", "glass.reparasjon.egenandel", "Ingen egenandel ved reparasjon"),
      ...at(sourceId, 12, "6.2.5 Naturskade", [["naturskade.dekning", "Skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden"]]),
      deductible(sourceId, 12, "6.2.5 Naturskade – egenandel", "naturskade.egenandel", "8 000 kr hvis ikke annet fremgår av forsikringsbeviset", "standard"),
      ...at(sourceId, 11, "6.2.3 Veihjelp", [["veihjelp.dekning", "Inkludert ved driftsstopp, sykdom eller ulykke"], ["veihjelp.geografi", tier === "delkasko" ? "Norden" : "EØS og Sveits; øvrige dekkede europeiske land på reiser inntil 3 måneder"]]),
      deductible(sourceId, 12, "6.2.3 Veihjelp – egenandel", "veihjelp.egenandel", "750 kr"),
      ...at(sourceId, 7, "5 Hva er forsikret", [["utstyr.dekning", "Fastmontert tilleggsutstyr, dekor og spesiell lakk"], ["utstyr.grense", tier === "super" ? "50 000 kr" : "20 000 kr"], ["utstyr.begrensning", "Høyst 50 % av kjøretøyets gjenanskaffelsesverdi umiddelbart før skaden"]]),
    );
    if (type === "mc" && tier !== "ansvar") rows.push(...at(sourceId, 7, "5 Sikkerhetsutstyr – MC", [["mc.kjoreutstyr.dekning", "Kjøredress, hjelm, hansker og støvler til forsikret motorsykkel"], ["mc.kjoreutstyr.grense", "Ingen fast øvre sum; gjenanskaffelsesverdi og rimelige, nødvendige utgifter etter vilkåret"], ["mc.kjoreutstyr.begrensning", "Skaden må omfattes av valgt delkasko eller kasko; oppgjørsregler og eventuell verdireduksjon gjelder"]]));
    if (type === "bobil" && tier !== "ansvar") rows.push(...at(sourceId, 7, "5 Bagasje i bobil/campingbil", [["bobil.losore.dekning", "Bagasje, løsøre og personlige eiendeler i bobilen"], ["bobil.losore.grense", tier === "super" ? "100 000 kr" : "30 000 kr"]]));
    if (["kasko", "super"].includes(tier)) rows.push(
      ...at(sourceId, 12, "6.3 Kasko", [["kasko.dekning", "Sammenstøt, utforkjøring, velting, hærverk, feilfylling eller annen tilfeldig, plutselig ytre påvirkning"], ["feilfylling.dekning", "Inkludert under kaskoforsikringen"]]),
      deductible(sourceId, 13, "6.3 Kasko – egenandel", "kasko.egenandel", "Fremgår av forsikringsbeviset", "reference"),
    );
    if (tier === "super") rows.push(
      ...at(sourceId, 13, "6.4.1 Totalskadegaranti", [["nyverdi.dekning", "Inkludert"], ["nyverdi.alder", "Innen 3 år fra registrering som fabrikkny på forsikringstakeren"], ["nyverdi.km", "Ikke kjørt over 60 000 km"], ["nyverdi.skadegrad", "Kjøretøyet er tapt eller reparasjonsutgiftene overstiger listepris for tilsvarende nytt kjøretøy med fabrikkmontert utstyr"], ["nyverdi.oppgjor", "Nytt tilsvarende kjøretøy når alle vilkår er oppfylt"], ["nyverdi.begrensning", "Ikke leaset; ingen tidligere skade over 10 % av nyanskaffelsesverdi; samtlige vilkår og dokumentasjonskrav må oppfylles"]]),
      ...at(sourceId, 14, "6.4.3 Motor, gir og kraftoverføring", [["maskinskade.dekning", "Plutselig og uforutsett mekanisk eller elektronisk skade som hindrer fremdrift"], ["maskinskade.alder", "Fram til 12 år fra førstegangsregistrering"], ["maskinskade.km", "Inntil 200 000 km; ingen erstatning etter passert alder eller kilometergrense"], ["maskinskade.komponenter", "De særskilt opplistede komponentene i motor, gir, kraftoverføring, elektronikk, styring, varme og kjøling"], ["maskinskade.begrensning", "Serviceintervaller og vedlikehold må være fulgt og dokumenterbare; blant annet slitasje, korrosjon, clutchlamell, understell og bremser er unntatt"]]),
      deductible(sourceId, 16, "6.4.3 Egenandel etter kilometerstand", "maskinskade.egenandel.kilometer", "0–99 999 km: 8 000 kr; 100 000–149 999 km: 15 000 kr; 150 000–200 000 km: 20 000 kr"),
      ...at(sourceId, 18, "6.4.8.1 Fukt- og vannskader", [["bobil.fukt.dekning", "Fuktskader med godkjent fuktkontroll"], ["bobil.fukt.alder", "Nyere enn 8 år fra produksjonsår"], ["bobil.fukt.kontroll", "Bestått fuktkontroll hos autorisert caravanforhandler; dekning inntil 1 år etter kontroll, deretter kreves ny kontroll"], ["bobil.fukt.begrensning", "Skade som skyldes frost, eller hvor frost medvirker, dekkes ikke"], ["bobil.vann.dekning", "Lekkasje fra bobilens røranlegg for ferskvann/avløp og varmesystem"], ["bobil.vann.begrensning", "Bobil nyere enn 8 år fra produksjonsår; frostskader dekkes ikke"]]),
      deductible(sourceId, 18, "6.4.8.1 Egenandel", "bobil.fukt.egenandel", "8 000 kr"),
      deductible(sourceId, 18, "6.4.8.1 Egenandel", "bobil.vann.egenandel", "8 000 kr"),
      ...at(sourceId, 18, "6.4.8.2 Feriegaranti", [["bobil.feriegaranti.dekning", "Dokumenterte utgifter til alternativ overnatting etter erstatningsmessig skade på påbegynt ferietur"], ["bobil.feriegaranti.dagsbelop", "Inntil 1 500 kr per dag"], ["bobil.feriegaranti.dager", "Resterende planlagte feriedager, inntil 15 dager"]]),
      ...at(sourceId, 16, "6.4.4 Nøkkel", [["nokkel.dekning", "Ny nøkkel, programmering og omkoding ved tap, tyveri eller skade fra ytre påvirkning"], ["nokkel.grense", "20 000 kr"]]),
      deductible(sourceId, 17, "6.4.4 Nøkkel – egenandel", "nokkel.egenandel", "1 000 kr"),
      ...at(sourceId, 17, "6.4.5 Parkeringsskade", [["parkering.dekning", "Kaskoskade fra annet ukjent kjøretøy når tid og sted er kjent"], ["parkering.grense", "25 000 kr"], ["parkering.bonus", "Uten bonustap innen beløpsgrensen"], ["parkering.begrensning", "Reparasjon hos avtaleverksted; ordinært bonustap over 25 000 kr"]]),
      deductible(sourceId, 17, "6.4.5 Parkeringsskade", "parkering.egenandel", "Valgt kaskoegenandel", "reference"),
    );
    definitions.push({ providerId: "storebrand", company: "Storebrand", type, agreementScope: "ordinary", productId: `storebrand-${type}-${tier}`, name: tier[0].toUpperCase() + tier.slice(1), version: "motor09", sourceId, rows });
  }
}
for (const [suffix, name, vehicleClass] of [["leiebil", "Leiebil", "Klasse C / Compact"], ["utvidet-leiebil", "Utvidet leiebil", "Klasse I / Intermediate, inntil stasjonsvogn"]] as const) {
  const sourceId = stSource("bobil");
  additions.push({ providerId: "storebrand", company: "Storebrand", type: "bobil", agreementScope: "ordinary", id: `storebrand-bobil-${suffix}`, name, requiresLevel: ["storebrand-bobil-kasko", "storebrand-bobil-super"], exclusiveGroup: "storebrand-bobil-leiebil", sourceId,
    rows: at(sourceId, 18, "7 Leiebilkostnader; 7.1–7.2 på side 19", [["leiebil.dekning", "Avtalt valgfri leiebildekning"], ["leiebil.dager", "Inntil 60 dager ved reparasjon"], ["leiebil.bilklasse", vehicleClass], ["leiebil.begrensning", "Må fremgå av forsikringsbeviset; ikke større bilgruppe enn skadet kjøretøy. Over 30 dager krever særskilt avtale; inntil 15 dager hos verksted uten avtale. Ikke glasskade alene"]]) });
}

export const gjensidigeStorebrandMcBobilCatalog = buildMcBobilCatalog(sources, definitions, additions);
