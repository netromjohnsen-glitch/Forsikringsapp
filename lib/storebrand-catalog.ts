import type { CatalogAddOn, CatalogFact, CatalogProduct, CatalogSource } from "./product-catalog.ts";

// Snapshot av dokumentene som var lenket fra Storebrands bilside 18.09.2026.
// Motor09 er felles for flere kjøretøytyper; bare bilrelevante bestemmelser
// registreres her. Forsikringsbeviset bestemmer kundens faktiske dekninger.
export const STOREBRAND_TERMS_URL = "https://www.storebrand.no/privat/forsikring/bilforsikring/_/attachment/inline/7b20f38c-208d-48ca-97f9-f82fab02216f:e9289744b0f0bb00c7304e715377b4be9a0e85d8/vilkar-motorvognforsikring.pdf";
export const STOREBRAND_GENERAL_URL = "https://www.storebrand.no/privat/forsikring/bilforsikring/_/attachment/inline/f8340c1a-d0b6-43c8-963c-eff345a03c22:b2b6be411de9b425d73fa91b7c7e42ade28fdee8/vilkar-generelle.pdf";
const motor = (id: string): CatalogSource => ({ id, company: "Storebrand", filename: "vilkar-motorvognforsikring-motor09.pdf",
  termsNumber: "motor09", effectiveFrom: "2025-04-01", url: STOREBRAND_TERMS_URL,
  sha256: "7673b8ee8fd5329d9e87c0a128a0a5cd4eeefb0721c8c5d8a1dedeb246c041fb" });
export const storebrandSources: Record<string, CatalogSource> = {
  sbAnsvar: motor("sbAnsvar"), sbDelkasko: motor("sbDelkasko"), sbKasko: motor("sbKasko"),
  sbSuper: motor("sbSuper"), sbLeiebil: motor("sbLeiebil"), sbLeiebilUtvidet: motor("sbLeiebilUtvidet"),
  sbGenerelle: { id: "sbGenerelle", company: "Storebrand", filename: "vilkar-generelle.pdf", termsNumber: "gener07",
    effectiveFrom: "2026-09-01", url: STOREBRAND_GENERAL_URL,
    sha256: "4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754" },
};

type Row = [key: string, label: string, value: string, section: string, page: number,
  replacesBase?: boolean, deductibleClassification?: CatalogFact["deductibleClassification"]];
const facts = (id: string, rows: Row[]): CatalogFact[] => rows.map(
  ([key, label, value, section, page, replacesBase, deductibleClassification]) => ({
    key, label, value, ...(replacesBase ? { replacesBase } : {}),
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: { documentId: id, section, page, filename: storebrandSources[id].filename,
      termsNumber: "motor09", effectiveFrom: "2025-04-01", company: "Storebrand", url: STOREBRAND_TERMS_URL,
      note: "Kundens forsikringsbevis og særvilkår avgjør valgt dekning og kan gå foran vilkåret" },
  }),
);

export const storebrandFacts: Record<string, CatalogFact[]> = {
  sbAnsvar: facts("sbAnsvar", [
    ["ansvar.dekning", "Ansvar", "Erstatningsansvar etter bilansvarsloven for påregistrert kjøretøy; person- og tingskade", "1.1, 6.1", 9],
    ["ansvar.person.grense", "Ansvar – personskade", "Ubegrenset", "6.1", 9],
    ["ansvar.ting.grense", "Ansvar – tingskade", "Inntil 100 000 000 kr", "6.1", 9],
    ["ansvar.geografi", "Ansvar – lovvalg utenfor Norge", "Skadestedets bilansvarslov; innen EØS norske regler hvis disse gir høyere erstatning", "6.1", 9],
    ["ansvar.egenandel", "Ansvar – egenandel", "Ingen egenandel ved ansvarsskade", "6.1", 9, false, "coverage"],
    ["geografi.dekning", "Geografisk område", "EØS og Sveits; øvrige Grønt kort-land i Europa på reiser inntil 3 måneder; ikke Tyrkia, Russland, Belarus eller Kosovo", "4", 6],
    ["geografi.rettshjelp", "Rettshjelp – geografisk område", "Norden", "4, 13.2", 30],
    ["ulykke.invaliditet", "Fører/passasjer – medisinsk invaliditet", "Inntil 200 000 kr per forsikret", "12.3", 27],
    ["ulykke.invaliditet.barn", "Fører/passasjer – invaliditet barn under 18 år", "Inntil 500 000 kr per barn", "12.3", 27],
    ["ulykke.dod", "Fører/passasjer – dødsfall", "100 000 kr; dødsfall innen 2 år etter ulykken", "12.3, 12.5.2", 29],
    ["ulykke.avtalevilkar", "Fører/passasjer – avtalevilkår", "Valgt ulykkesdekning må fremgå av forsikringsbeviset", "12.1", 27],
    ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige utgifter ved tvist som eier, rettmessig bruker eller fører av forsikret kjøretøy", "13.3.1", 30],
    ["rettshjelp.grense", "Rettshjelp – forsikringssum", "Inntil 100 000 kr per tvist; høyere samlet sum ved minst 3 parter", "13.5", 32],
    ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr + 20 % av resterende erstatningsbeløp", "13.6", 32, false, "coverage"],
  ]),
  sbDelkasko: facts("sbDelkasko", [
    ["brann.dekning", "Brann", "Åpen flamme, lynnedslag og eksplosjon", "6.2.1", 9],
    ["brann.unntak", "Brann – begrensning", "Skade i batterier alene, kortslutning eller oppheting uten åpen ild omfattes ikke", "6.2.1", 9],
    ["brann.egenandel", "Brann – standardegenandel", "8 000 kr hvis ikke annet fremgår av forsikringsbeviset", "6.2.1", 10, false, "standard"],
    ["tyveri.dekning", "Tyveri", "Tyveri, tyveriforsøk og innbrudd; hærverk når det åpenbart samtidig er tyveriforsøk eller innbrudd", "6.2.2", 10],
    ["tyveri.egenandel", "Tyveri – standardegenandel", "8 000 kr hvis ikke annet fremgår av forsikringsbeviset", "6.2.2", 10, false, "standard"],
    ["tyveri.alarm", "Tyveri – alarmrabatt på egenandel", "4 000 kr lavere egenandel ved dokumentert FG-godkjent alarm i drift ved innbruddstyveri", "6.2.2", 10],
    ["glass.dekning", "Glass", "Brudd på kjøretøyets ruter ved tilfeldig, plutselig hendelse; reparasjon eller skifte", "6.2.4", 12],
    ["glass.grense.bytte", "Glass – grense ved skifte", "Inntil 50 % av bilens gjenanskaffelsesverdi", "6.2.4", 12],
    ["glass.egenandel.bytte", "Glass – egenandel ved skifte", "3 000 kr", "6.2.4", 12, false, "coverage"],
    ["glass.egenandel.reparasjon", "Glass – egenandel ved reparasjon", "0 kr", "6.2.4", 12, false, "coverage"],
    ["veihjelp.dekning", "Veihjelp", "Transport til nærmeste verksted eller reparasjon på stedet; hjemtransport og hjemreise etter vilkårene", "6.2.3", 11],
    ["veihjelp.geografi", "Veihjelp – geografisk område", "Norden", "4, 6.2.3", 11],
    ["veihjelp.egenandel", "Veihjelp – egenandel", "750 kr", "6.2.3", 12, false, "coverage"],
    ["veihjelp.transport.grense", "Veihjelp – hjemtransportgrense", "Inntil 50 % av kjøretøyets verdi ved hjemsendelse", "6.2.3", 11],
    ["natur.dekning", "Naturskade", "Skred, storm, flom, stormflo, jordskjelv eller vulkanutbrudd i Norden", "6.2.5", 12],
    ["tilbehor.grense", "Fastmontert tilleggsutstyr – forsikringssum", "Inntil 20 000 kr, høyst 50 % av kjøretøyets gjenanskaffelsesverdi", "5", 7],
    ["bagasje.grense", "Bagasje – forsikringssum", "Inntil 10 000 kr ved brann eller tyveri", "1, 5", 7],
    ["bonus.delkasko", "Bonustap ved delkaskoskade", "Ingen bonustap ved brann, tyveri, glass eller veihjelp", "11.2", 26],
  ]),
  sbKasko: facts("sbKasko", [
    ["kasko.dekning", "Kaskoskade", "Sammenstøt, utforkjøring, velting, hærverk, feilfylling eller annen tilfeldig, plutselig ytre påvirkning", "6.3", 12],
    ["haerverk.dekning", "Hærverk", "Hærverk på eget kjøretøy under kaskoforsikringen", "6.3", 12],
    ["feilfylling.dekning", "Feilfylling", "Skade på eget kjøretøy ved feilfylling av drivstoff", "6.3", 12],
    ["kasko.egenandel", "Kasko – avtalt egenandel", "Fremgår av forsikringsbeviset", "6.3", 13, false, "reference"],
    ["veihjelp.geografi", "Veihjelp – geografisk område", "EØS og Sveits; øvrige dekkede europeiske land ved reiser inntil 3 måneder", "4, 6.2.3", 6, true],
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 1 år etter registrering som fabrikkny", "10.3", 24],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Høyst 15 000 km", "10.3", 24],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Reparasjon over 80 % av listepris for tilsvarende ny bil", "10.3", 24],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Blant annet leasingbil, drosje, skolebil, utleiebil og tidligere skade over 10 % av nyanskaffelsesverdi", "10.3", 24],
    ["bonus.kasko", "Bonustap ved kaskoskade", "Kaskoskade kan gi bonustap; unntakene står i punkt 11.2", "11.2–11.4", 26],
  ]),
  sbSuper: facts("sbSuper", [
    ["nyverdi.alder", "Totalskadegaranti – alder", "Innen 3 år etter registrering som fabrikkny", "6.4.1", 13, true],
    ["nyverdi.km", "Totalskadegaranti – kilometer", "Høyst 60 000 km", "6.4.1", 13, true],
    ["nyverdi.skadegrad", "Totalskadegaranti – skadegrad", "Bilen tapt eller reparasjonsutgifter over listepris for tilsvarende ny bil", "6.4.1", 13, true],
    ["nyverdi.unntak", "Totalskadegaranti – unntak", "Leasingbil eller tidligere skade over 10 % av nyanskaffelsesverdi omfattes ikke", "6.4.1", 14, true],
    ["leasing.startleie", "Leasing – startleie", "Forholdsmessig nedskrevet startleie ved totalskade eller tyveri; konkret beløp i forsikringsbeviset", "6.4.2", 14],
    ["tilbehor.grense", "Fastmontert tilleggsutstyr – forsikringssum", "Inntil 50 000 kr, høyst 50 % av kjøretøyets gjenanskaffelsesverdi", "6.4.7", 17, true],
    ["bagasje.grense", "Bagasje – forsikringssum", "Inntil 20 000 kr ved brann, tyveri eller dekket kaskoskade", "6.4.6", 17, true],
    ["maskinskade.dekning", "Motor/gir/kraftoverføring – komponenter", "Plutselig og uforutsett mekanisk eller elektronisk skade på oppregnet motor, girkasse, motorstyreenhet og kraftoverføring som hindrer fremdrift", "6.4.3", 14],
    ["maskinskade.alder", "Motor/gir/kraftoverføring – alder", "Før bilen er 12 år fra førstegangsregistrering", "6.4.3", 14],
    ["maskinskade.km", "Motor/gir/kraftoverføring – kilometer", "Til og med 200 000 km; ingen erstatning etter passert grense", "6.4.3", 14],
    ["maskinskade.el", "Motor/gir/kraftoverføring – elbil/hybrid", "Høyvoltbatteri, høyspentkabel og ladekontakt i bilen, batterikjøling/-overvåking, omformer og fabrikkmontert lader", "6.4.3", 15],
    ["maskinskade.batteri.unntak", "Høyvoltbatteri – begrensning", "Kapasitetstap på høyvoltbatteri dekkes ikke", "6.4.3", 16],
    ["maskinskade.drivverk", "Motor/gir/kraftoverføring – gir og drivverk", "Girkassens innvendige deler, fordelingskasse, vinkeldrev og oppregnede aksler; clutchdeler til 100 000 km", "6.4.3", 15],
    ["maskinskade.egenandel.0-99999", "Motor/gir/kraftoverføring – egenandel 0–99 999 km", "8 000 kr", "6.4.3", 16, false, "coverage"],
    ["maskinskade.egenandel.100000-149999", "Motor/gir/kraftoverføring – egenandel 100 000–149 999 km", "15 000 kr", "6.4.3", 16, false, "coverage"],
    ["maskinskade.egenandel.150000-200000", "Motor/gir/kraftoverføring – egenandel 150 000–200 000 km", "20 000 kr", "6.4.3", 16, false, "coverage"],
    ["maskinskade.unntak", "Motor/gir/kraftoverføring – unntak", "Blant annet slitasje/korrosjon, clutchlamell, bremser/understell, ordinær kasko og garantiskade; servicekrav", "6.4.3", 15],
    ["bonus.maskinskade", "Motor/gir/kraftoverføring – bonustap", "Ingen bonustap ved skade dekket under Super punkt 6.4.3", "11.2", 26],
    ["bilnokkel.grense", "Bilnøkkel – forsikringssum", "Inntil 20 000 kr for ny nøkkel, programmering og omkoding", "6.4.4", 16],
    ["bilnokkel.egenandel", "Bilnøkkel – egenandel", "1 000 kr", "6.4.4", 17, false, "coverage"],
    ["parkering.dekning", "Parkeringsskade", "Dekket kaskoskade på parkert bil fra annet ukjent kjøretøy; kjent sted/tid og avtaleverksted", "6.4.5", 17],
    ["parkering.grense", "Parkeringsskade – grense uten bonustap", "Inntil 25 000 kr", "6.4.5", 17],
    ["parkering.egenandel", "Parkeringsskade – egenandel", "Valgt kaskoegenandel", "6.4.5", 17, false, "reference"],
    ["bonus.parkert", "Parkeringsskade – bonustap", "Ingen bonustap innen 25 000 kr når øvrige vilkår er oppfylt", "6.4.5", 17],
  ]),
  sbLeiebil: facts("sbLeiebil", [
    ["leiebil.dager", "Leiebil – reparasjonstid", "Inntil 60 dager ved normal reparasjonstid", "7.2", 19],
    ["leiebil.vilkar.etter30", "Leiebil – periode over 30 dager", "Perioden utover 30 dager må avtales særskilt med Storebrand", "7.2", 19],
    ["leiebil.bilklasse", "Leiebil – bilklasse", "Inntil klasse C/Compact, ikke større enn egen bil", "7.1", 19],
    ["leiebil.verksted", "Leiebil – verkstedbegrensning", "Inntil 15 dager ved verksted uten Storebrand-avtale", "7.2", 19],
    ["leiebil.kontant", "Leiebil – kontantkompensasjon", "250 kr per dag uten leiebil, inntil 21 dager ved reparasjon", "7.1–7.2", 19],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon", "Fra meldt skade til 15 dager etter avgjørelse av erstatningsspørsmålet", "7.2", 19],
    ["leiebil.unntak", "Leiebil – begrensning", "Bare når leiebildekning er avtalt i forsikringsbeviset; ikke ved glasskade alene", "7", 18],
  ]),
  sbLeiebilUtvidet: facts("sbLeiebilUtvidet", [
    ["leiebil.dager", "Leiebil – reparasjonstid", "Inntil 60 dager ved normal reparasjonstid", "7.2", 19],
    ["leiebil.vilkar.etter30", "Leiebil – periode over 30 dager", "Perioden utover 30 dager må avtales særskilt med Storebrand", "7.2", 19],
    ["leiebil.bilklasse", "Leiebil – bilklasse", "Inntil klasse I/Intermediate stasjonsvogn, ikke større enn egen bil", "7.1", 19],
    ["leiebil.verksted", "Leiebil – verkstedbegrensning", "Inntil 15 dager ved verksted uten Storebrand-avtale", "7.2", 19],
    ["leiebil.kontant", "Leiebil – kontantkompensasjon", "250 kr per dag uten leiebil, inntil 21 dager ved reparasjon", "7.1–7.2", 19],
    ["leiebil.kondemnasjon", "Leiebil – kondemnasjon", "Fra meldt skade til 15 dager etter avgjørelse av erstatningsspørsmålet", "7.2", 19],
    ["leiebil.unntak", "Leiebil – begrensning", "Bare når utvidet leiebildekning er avtalt i forsikringsbeviset; ikke ved glasskade alene", "7", 18],
  ]),
};

// Motor09 pkt. 1.1–1.2 og tabellen viser ansvar på alle registrerte biler.
// Pkt. 6.3 sier Kasko i tillegg til Delkasko. Pkt. 6.4 sier Super i tillegg
// til både Delkasko og Kasko (henvisningen «3.3» er trykkfeil i PDF-en).
export const storebrandProducts: CatalogProduct[] = [
  { company: "Storebrand", insuranceType: "Bil", name: "Ansvar", providerId: "storebrand", productId: "sb-bil-ansvar", version: "motor09", componentIds: ["sbAnsvar"] },
  { company: "Storebrand", insuranceType: "Bil", name: "Delkasko", providerId: "storebrand", productId: "sb-bil-delkasko", version: "motor09", inheritsProductId: "sb-bil-ansvar", componentIds: ["sbDelkasko"] },
  { company: "Storebrand", insuranceType: "Bil", name: "Kasko", providerId: "storebrand", productId: "sb-bil-kasko", version: "motor09", inheritsProductId: "sb-bil-delkasko", componentIds: ["sbKasko"] },
  { company: "Storebrand", insuranceType: "Bil", name: "Super", providerId: "storebrand", productId: "sb-bil-super", version: "motor09", inheritsProductId: "sb-bil-kasko", componentIds: ["sbSuper"] },
];
export const storebrandAddOns: CatalogAddOn[] = [
  { id: "sb-leiebil", name: "Leiebil klasse C", componentId: "sbLeiebil", providerId: "storebrand",
    requiresLevel: ["sb-bil-kasko", "sb-bil-super"], exclusiveGroup: "sb-leiebilvariant" },
  { id: "sb-leiebil-utvidet", name: "Utvidet leiebil klasse I", componentId: "sbLeiebilUtvidet", providerId: "storebrand",
    requiresLevel: ["sb-bil-kasko", "sb-bil-super"], exclusiveGroup: "sb-leiebilvariant" },
];
