import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

// Offentlige, alminnelige vilkårseksempler. Forsikringsbeviset avgjør kundens
// faktiske sammensetning og egenandeler. PDF-ene oppgir ikke vilkårsnummer eller
// gyldighetsdato; MOT01 er identifikatoren for produktarket, ikke disse PDF-ene.
const root = "https://www.gjensidige.no/files/privat/vilkar/kjoretoy/";
const source = (id: string, filename: string, sha256: string): CatalogSource => ({
  id, company: "Gjensidige", filename, termsNumber: "Ikke oppgitt", effectiveFrom: "",
  url: root + filename, sha256,
});
export const gjensidigeSources: Record<string, CatalogSource> = {
  gjAnsvar: source("gjAnsvar", "bil-ansvar-alminnelige-vilkar.pdf", "bbfd85aaeb572102fb295f99d83d12963d7584266bc027e4ed01eda89211f2b2"),
  gjDelkasko: source("gjDelkasko", "Bil-Delkasko-alminnelige-vilkar.pdf", "90947312022821f8e6233b8d71d5eed13110f54640cf753b992d519809901c88"),
  gjKasko: source("gjKasko", "Bil-Kasko-alminnelige-vilkar.pdf", "4c9b088ab208453c6437e02c3962f38186c8e86d2f4c106658e634560b783aef"),
  gjPluss: source("gjPluss", "Bil-Pluss-alminnelige-vilkar.pdf", "c512ffc7dbcfc60737f018aae0d47e2883a300ede36f65ab51d8e50133a7189d"),
  gjPunktering: source("gjPunktering", "Bil-Kasko-alminnelige-vilkar.pdf", "4c9b088ab208453c6437e02c3962f38186c8e86d2f4c106658e634560b783aef"),
  gjIpid: { id: "gjIpid", company: "Gjensidige", filename: "Bilforsikring-Produktark-MOT01.pdf", termsNumber: "MOT01", effectiveFrom: "", url: "https://www.gjensidige.no/ipid/gfno/MOT01", sha256: "32f3428e0f758e7380d54b9aaaa9da994b5f854e1707142f744576d792af9642" },
  gjUtvidetUtstyr: { id: "gjUtvidetUtstyr", company: "Gjensidige", filename: "Bilforsikring-Produktark-MOT01.pdf", termsNumber: "MOT01", effectiveFrom: "", url: "https://www.gjensidige.no/ipid/gfno/MOT01" },
  gjSpesiallakk: { id: "gjSpesiallakk", company: "Gjensidige", filename: "Bilforsikring-Produktark-MOT01.pdf", termsNumber: "MOT01", effectiveFrom: "", url: "https://www.gjensidige.no/ipid/gfno/MOT01" },
  gjFunksjonsutstyr: { id: "gjFunksjonsutstyr", company: "Gjensidige", filename: "Bilforsikring-Produktark-MOT01.pdf", termsNumber: "MOT01", effectiveFrom: "", url: "https://www.gjensidige.no/ipid/gfno/MOT01" },
};

type Row = [key: string, label: string, value: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (id: string, rows: Row[]): CatalogFact[] => rows.map(
  ([key, label, value, section, page, replacesBase, deductibleClassification]) => ({
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: { documentId: id, section, page, filename: gjensidigeSources[id].filename,
      termsNumber: gjensidigeSources[id].termsNumber, effectiveFrom: "",
      company: "Gjensidige", url: gjensidigeSources[id].url,
      note: id === "gjUtvidetUtstyr" || id === "gjSpesiallakk" || id === "gjFunksjonsutstyr"
        ? "Produktark angir mulig utvidelse; faktisk avtale og omfang må bekreftes i forsikringsbevis"
        : "Offentlig alminnelig vilkårseksempel; faktisk avtale må bekreftes i kundens forsikringsbevis" },
  }),
);

export const gjensidigeFacts: Record<string, CatalogFact[]> = {
  gjAnsvar: facts("gjAnsvar", [
    ["ansvar.dekning", "Ansvar", "Person- og tingskade etter bilansvarsloven", "Forsikringsbevis – Hvilke skader", 3],
    ["ansvar.person.grense", "Ansvar – personskade", "Ubegrenset", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["ansvar.ting.grense", "Ansvar – tingskade", "100 000 000 kr", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["rettshjelp.dekning", "Rettshjelp", "Tvist knyttet til forsikret kjøretøy", "Fellesdekninger – Rettshjelp", 6],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "100 000 kr", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr + 20 % av dekningsmessige utgifter", "Fellesdekninger – Rettshjelp", 8, false, "coverage"],
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 200 000 kr", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr; dødsfall innen 1 år etter ulykken", "Fellesdekninger – Ulykke", 5],
    ["ulykke.omfang", "Fører/passasjer – ulykkessted", "I, på eller ved motorvognen når den eller tilkoblet utstyr er direkte skadeårsak", "Fellesdekninger – Ulykke", 4],
    ["geografi.dekning", "Geografisk område", "Europa, unntatt Kosovo, Russland og Belarus", "Forsikringsbevis – Hvor gjelder forsikringen", 3],
    ["geografi.rettshjelp", "Rettshjelp – geografisk område", "Norden", "Forsikringsbevis – Hvor gjelder forsikringen", 3],
  ]),
  gjDelkasko: facts("gjDelkasko", [
    ["brann.dekning", "Brann", "Åpen flamme, lynnedslag og eksplosjon", "Forsikringsbevis – Hvilke skader", 3],
    ["tyveri.dekning", "Tyveri", "Tyveri og forsøk på tyveri", "Forsikringsbevis – Hvilke skader", 3],
    ["brann.egenandel", "Brann – egenandel", "6 000 kr i offentlig vilkårseksempel; avtalt egenandel kan avvike", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["tyveri.egenandel", "Tyveri – egenandel", "6 000 kr i offentlig vilkårseksempel; avtalt egenandel kan avvike", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["glass.dekning", "Glass", "Bruddskade på bilens glassruter og glasstak", "Forsikringsbevis – Hvilke skader", 3],
    ["glass.egenandel.bytte", "Glass – egenandel ved skifte", "3 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "0 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["veihjelp.dekning", "Veihjelp", "Berging, tauing og hjemtransport ved skade, tyveri eller driftsstans etter vilkårene", "Forsikringsbevis – Hvilke utgifter", 3],
    ["veihjelp.egenandel", "Veihjelp – egenandel", "750 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["tilbehor.grense", "Fastmontert ekstrautstyr – forsikringssum", "10 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["losore.grense", "Løsøre – forsikringssum", "5 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["glass.unntak", "Glass – begrensning", "Solcellepanel dekkes ikke som glasskade, men som kaskoskade", "Forsikringsbevis – Dekkes ikke", 3],
  ]),
  gjKasko: facts("gjKasko", [
    ["kasko.dekning", "Kaskoskade", "Plutselig ytre påvirkning, blant annet kollisjon, utforkjøring og velt", "Forsikringsbevis – Hvilke skader", 3],
    ["kasko.egenandel", "Kasko – egenandel", "8 000 kr i offentlig vilkårseksempel; avtalt egenandel kan avvike", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["feilfylling.dekning", "Feilfylling", "Skade som følge av feilfylling av drivstoff", "Forsikringsbevis – Hvilke skader", 3],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Inntil 1 år fra første registreringsdato", "Erstatningsregler – Totalskadegaranti", 15],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Inntil 20 000 km", "Erstatningsregler – Totalskadegaranti", 15],
    ["nyverdi.skadegrad", "Totalskadegaranti – utløsende grense", "Bilen tapt eller reparasjonsutgiftene overstiger markedsverdi for tilsvarende bil", "Erstatningsregler – Totalskadegaranti", 15],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Gjelder ikke bil eid av bedrift, inkludert leasingbil; ved brann/tyveri ikke når eier kjøpte bilen brukt", "Erstatningsregler – Totalskadegaranti", 15],
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 30 dager ved normal reparasjonstid", "Forsikringsbevis – Hvilke utgifter", 3],
    ["leiebil.bilklasse", "Leiebil – bilklasse", "Inntil mellomklasse stasjonsvogn", "Forsikringsbevis – Hvilke utgifter", 3],
    ["leiebil.unntak", "Leiebil – begrensning", "Ikke ved bare glasskade eller punkteringsskade; faktisk leiebildekning må bekreftes i forsikringsbevis", "Forsikringsbevis – Dekkes ikke", 4],
    ["tilbehor.grense", "Fastmontert ekstrautstyr – forsikringssum", "50 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, true],
    ["losore.grense", "Løsøre – forsikringssum", "10 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, true],
    ["bilnokkel.dekning", "Bilnøkkel", "Tapt, stjålet eller skadet bilnøkkel", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["bilnokkel.grense", "Bilnøkkel – forsikringssum", "7 500 kr", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["bilnokkel.egenandel", "Bilnøkkel – egenandel", "1 500 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["ladekabel.dekning", "Ladekabel", "Tyveri eller ytre skade på ladekabel for hybrid-/elbil", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["ladekabel.egenandel", "Ladekabel – egenandel", "2 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["reparasjon.garanti", "Reparasjonsgaranti", "8 år ved dekket skade reparert på Gjensidiges avtaleverksted", "Erstatningsregler – reparasjonsgaranti", 15],
  ]),
  gjPluss: facts("gjPluss", [
    ["leiebil.dager", "Leiebil – normal reparasjonstid", "Inntil 60 dager ved normal reparasjonstid", "Forsikringsbevis – Hvilke utgifter", 3, true],
    ["leiebil.teknisk", "Leiebil – tekniske problemer", "Inntil 15 dager ved ikke kjørbar bil i Norden som ikke kan repareres på stedet; Gjensidige velger verksted", "Forsikringsbevis – Hvilke utgifter", 4],
    ["bilnokkel.grense", "Bilnøkkel – forsikringssum", "15 000 kr", "Forsikringsbevis – Forsikringsoversikt", 1, true],
    ["maskinskade.dekning", "Maskinskade – komponenter", "Plutselig og uforutsett skade på oppregnet motor, gir, drivverk og elektronikk; for el-/hybridbil også høyvoltbatteri og ladeenhet", "Forsikringsbevis – Hvilke skader", 3],
    ["maskinskade.fossil", "Maskinskade – diesel/bensin", "Motor, startmotor, dynamo, styringspumpe, vann-/diesel-/bensin-/matepumpe, motorstyring, turbo, intercooler, EGR, lambdasonde, radiator, kjølevæskebeholdere, eksosmanifold, svinghjul, AdBlue-elektronikk og head-up-display", "Forsikringsbevis – Hvilke skader", 3],
    ["maskinskade.el", "Maskinskade – elbil/hybrid", "Høyspentbatteri med kjøle-/varmeanlegg, bilens ladeenhet og AC-kompressor når den kjøler eller varmer høyspentbatteriet", "Forsikringsbevis – Hvilke skader", 3],
    ["maskinskade.drivverk", "Maskinskade – gir og kraftoverføring", "Girkasse, drivaksler til og med drivknutene, mellomaksler, differensialer og fordelingsgirkasse til firehjulstrekk", "Forsikringsbevis – Hvilke skader", 3],
    ["maskinskade.alder", "Maskinskade – alder", "Til første hovedforfall etter 12 år fra førstegangsregistrering", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["maskinskade.km", "Maskinskade – kilometer", "Til 200 000 km; det som inntreffer først", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["maskinskade.egenandel.0-119999", "Maskinskade – egenandel 0–119 999 km", "10 000 kr", "Erstatningsregler – Egenandel maskinskade", 16, false, "coverage"],
    ["maskinskade.egenandel.120000-159999", "Maskinskade – egenandel 120 000–159 999 km", "14 000 kr", "Erstatningsregler – Egenandel maskinskade", 16, false, "coverage"],
    ["maskinskade.egenandel.160000-200000", "Maskinskade – egenandel 160 000–200 000 km", "18 000 kr", "Erstatningsregler – Egenandel maskinskade", 16, false, "coverage"],
    ["maskinskade.unntak", "Maskinskade – unntak", "Clutch, eksosanlegg unntatt manifold og katalysator/partikkelfilter er blant unntakene", "Forsikringsbevis – Dekkes ikke", 3],
    ["parkering.dekning", "Parkeringsskade", "Ytre skade på parkert bil med ukjent skadevolder uten bonustap", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["parkering.alder", "Parkeringsskade – alder", "Til første hovedforfall etter 10 år fra førstegangsregistrering", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["parkering.grense", "Parkeringsskade – forsikringssum", "20 000 kr", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["bonus.parkert", "Parkeringsskade – bonustap", "Ingen bonustap når vilkårene for parkeringsskade er oppfylt", "Forsikringsbevis – Forsikringsoversikt", 1],
    ["leasing.startleie", "Leasing – startleie", "Forholdsmessig nedskrevet startleie ved kondemnasjon eller tyveri, maksimalt 150 000 kr", "Erstatningsregler – Startleiedekning", 15],
  ]),
  gjPunktering: facts("gjPunktering", [
    ["punktering.dekning", "Punkteringsskade uten bonustap", "Valgbar dekning ved dokumentert gyldig dekksjekk", "Erstatningsregler – Punkteringsskade", 16],
    ["punktering.grense", "Punktering – grense per dekk", "2 500 kr per dekk", "Erstatningsregler – Punkteringsskade", 16],
    ["punktering.egenandel", "Punktering – egenandel", "1 000 kr i offentlig vilkårseksempel", "Forsikringsbevis – Forsikringsoversikt", 1, false, "standard"],
    ["punktering.vilkar", "Punktering – dekksjekk", "Dekksjekk hos godkjent verksted under 1 år før skade; minst 3 mm sommerdekk eller 4 mm vinterdekk", "Erstatningsregler – Punkteringsskade", 16],
  ]),
  gjUtvidetUtstyr: facts("gjUtvidetUtstyr", [
    ["tilbehor.utvidelse", "Utvidet sum for ekstrautstyr", "Valgbar utvidelse; beløp må bekreftes i forsikringsbevis", "Mulige utvidelser", 1],
  ]),
  gjSpesiallakk: facts("gjSpesiallakk", [
    ["spesiallakk.dekning", "Spesiallakk", "Valgbar utvidelse; omfang må bekreftes i forsikringsbevis", "Mulige utvidelser", 1],
  ]),
  gjFunksjonsutstyr: facts("gjFunksjonsutstyr", [
    ["funksjonsutstyr.dekning", "Utstyr til funksjonshemmede", "Valgbar utvidelse; omfang må bekreftes i forsikringsbevis", "Mulige utvidelser", 1],
  ]),
};

// Produktarket MOT01 side 1 sier uttrykkelig «Alt nevnt i Ansvar»,
// «Alt nevnt i Delkasko» og «Alt nevnt i Kasko».
export const gjensidigeProducts: CatalogProduct[] = [
  { company: "Gjensidige", insuranceType: "Bil", name: "Ansvar", providerId: "gjensidige", productId: "gj-bil-ansvar", version: null, sourceId: "gjIpid", componentIds: ["gjAnsvar"] },
  { company: "Gjensidige", insuranceType: "Bil", name: "Delkasko", providerId: "gjensidige", productId: "gj-bil-delkasko", version: null, sourceId: "gjIpid", inheritsProductId: "gj-bil-ansvar", componentIds: ["gjDelkasko"] },
  { company: "Gjensidige", insuranceType: "Bil", name: "Kasko", providerId: "gjensidige", productId: "gj-bil-kasko", version: null, sourceId: "gjIpid", inheritsProductId: "gj-bil-delkasko", componentIds: ["gjKasko"] },
  { company: "Gjensidige", insuranceType: "Bil", name: "Pluss", providerId: "gjensidige", productId: "gj-bil-pluss", version: null, sourceId: "gjIpid", inheritsProductId: "gj-bil-kasko", componentIds: ["gjPluss"] },
];

export const gjensidigeAddOns: CatalogAddOn[] = [
  { id: "gj-punktering", name: "Punkteringsskade uten bonustap", providerId: "gjensidige", componentId: "gjPunktering", requiresLevel: ["gj-bil-kasko", "gj-bil-pluss"] },
  { id: "gj-utvidet-utstyr", name: "Utvidet sum for ekstrautstyr", providerId: "gjensidige", componentId: "gjUtvidetUtstyr", requiresLevel: null, insuranceTypes: ["Bil"] },
  { id: "gj-spesiallakk", name: "Spesiallakk", providerId: "gjensidige", componentId: "gjSpesiallakk", requiresLevel: null, insuranceTypes: ["Bil"] },
  { id: "gj-funksjonsutstyr", name: "Utstyr til funksjonshemmede", providerId: "gjensidige", componentId: "gjFunksjonsutstyr", requiresLevel: null, insuranceTypes: ["Bil"] },
];
