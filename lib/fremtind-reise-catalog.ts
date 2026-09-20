import type { CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { fremtindReiseSources } from "./fremtind-reise-sources.ts";
export { fremtindReiseSources } from "./fremtind-reise-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?, boolean?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const s = fremtindReiseSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification, replacesBase]) => ({
    key: `reise.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    ...(replacesBase ? { replacesBase: true } : {}),
    source: { documentId: s.id, section, page, filename: s.filename, termsNumber: s.termsNumber,
      effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, productCode: s.productCode,
      version: s.version, note: "Fremtind er provider; Eika er distribusjonskanal. Forsikringsbevis og særvilkår går foran." },
  }));
}

const common = facts("fremtindReiseTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset og valgte særvilkår styrer Reise/Reise Pluss, person/familie, sikrede, reisedøgn, utvidelser, summer, egenandeler og reservasjoner.", "Forsikringsavtalen", 2],
  ["personer.omfang", "Enkeltperson eller familie", "Familie omfatter ektefelle/samboer, registrert partner, egne barn, særkullsbarn, fosterbarn og barn under vergeansvar til 21 år. Barnebarn og oldebarn omfattes på reise alene sammen med sikrede. Personene skal ha folkeregistrert bostedsadresse i Norden og nordiske trygderettigheter etter vilkåret.", "1 Hvem forsikringen gjelder for", 4],
  ["omrade.verden", "Geografisk område", "Ferie-, fritids- og tjenestereiser i hele verden som starter og slutter ved fast bosted. Ingen krav til overnatting. Ikke hjemme, fast arbeids-/undervisningssted eller barnehage; ansvar og rettshjelp gjelder bare utenfor Norden.", "1.3 Hvor forsikringen gjelder", 5],
  ["varighet.maks", "Maksimal standard reisevarighet", "77 sammenhengende dager per reise for både Reise og Reise Pluss i Eika-kanalen. Forsikringsbeviset er autoritativt.", "Dekningsmatrise", 3],
  ["varighet.utvidelse", "Utvidet reisetid", "Kundespesifikt tilvalg som må fremgå av forsikringsbeviset; offentlig FAQ ber kunden kontakte selskapet for reiser over 77 dager. Ikke et eget hovedprodukt.", "IPID / Utvidet reisetid", 1],
  ["bagasje.dekning", "Reisegods", "Tyveri, ran, brann, vann-/naturskade, hærverk, trafikkuhell og transportskade etter vilkåret. Mistet, gjenglemt eller forlagt gods og ukjent skadeårsak er unntatt.", "2 Reisegods", 6],
  ["bagasje.verdisaker", "Verdigjenstander", "Kategori- og enkeltgjenstandsgrenser gjelder etter dekningsmatrisen; verdigjenstander skal ikke sendes som innsjekket bagasje.", "2.3 / sikkerhetsforskrifter", 7],
  ["bagasje.mobil", "Mobiltelefon", "Tyveri omfattes som reisegods. Fysisk mobilskade dekkes etter gjeldende kanalvilkår når skadeårsaken er tilfeldig, plutselig, ytre, kjent og knyttet til et bestemt tidspunkt; kosmetisk skade, fukt, innhold og arbeidsgivers telefon er unntatt.", "7.4 Mobiltelefon / 2 Reisegods", 8],
  ["bagasje.mobil_egenandel", "Mobiltelefon – egenandel", "2 000 kr særskilt egenandel etter det nye Fremtind-vilkåret; kundens forsikringsbevis og kanalvilkår styrer ved avvik.", "7.5.6 Spesielle egenandeler", 4, "override"],
  ["bagasje.forsinket", "Forsinket bagasje", "Ved minst fire timers transportørbekreftet forsinkelse på utreise dekkes nødvendige og dokumenterte klær/toalettsaker inntil 6 000 kr per person i Eika-kanalen. PIR kreves; hjemreise omfattes ikke.", "Dekningsmatrise / FAQ", 3],
  ["medisinsk.behandling", "Akutt sykdom og personskade", "Nødvendige utgifter ved ulykkesskade, akutt sykdom eller uventet akutt forverring av kronisk lidelse: sykehus, lege, medisiner, medisinsk utstyr, fysikalsk/kiropraktisk behandling, transport og legeforordnet opphold. Samme sykdom/skade med fortløpende behandling er begrenset til 60 dager etter første legebesøk.", "3 Reisesyke", 10],
  ["medisinsk.tann", "Tannbehandling", "Tannbehandling etter ulykkesskade inntil 10 000 kr; akutt tannsykdom eller tyggeskade i utlandet inntil 1 000 kr.", "3.4 Reisesyke", 10],
  ["medisinsk.kjent", "Kjent sykdom", "Kjent sykdom/lidelse med eksisterende behandlingsbehov, planlagt behandling eller stor sannsynlighet for komplikasjon/forverring er unntatt. Legeerklæring kan kreves om at reisen var forsvarlig.", "3.4 og 3.7", 10],
  ["medisinsk.graviditet", "Graviditet og fødsel", "Alvorlige uventede komplikasjoner før uke 36 kan omfattes. Vanlige svangerskapsplager, frivillig abort og fødsel fra og med uke 36 er unntatt.", "3.4 Reisesyke", 10],
  ["hjemtransport", "Hjemtransport", "Nødvendig hjemtransport ved akutt sykdom, ulykke eller død, inkludert nødvendig ledsager og hjemtransport av kiste/urne. Behandlende lege og Fremtind/SOS International skal godkjenne transporten.", "3.4 Hjemtransport", 11],
  ["hjemkallelse", "Hjemkalling", "Hjemreise ved plutselig alvorlig sykdom, ulykke eller dødsfall i nærmeste familie, eller brann, naturskade, innbrudd eller vannskade i bolig, forretning eller kontor som krever tilstedeværelse.", "3.4 Hjemtransport", 11],
  ["sykeledsagelse", "Tilkalling og sykeledsagelse", "Nødvendige reise- og oppholdsutgifter for inntil to familiemedlemmer/nærstående personer ved alvorlig sykdom, ulykkesskade eller død. Skal avtales med Fremtind eller SOS International på forhånd.", "3.4 Tilkallelse", 13],
  ["reiseavbrudd", "Avbrutt reise og tapte feriedager", "Forholdsmessig kompensasjon for ubenyttede dager ved hjemtransport, sykehus eller legeordinert sengeleie. Reise har inntil 1 600 kr per døgn per person og arrangementer inntil 10 000 kr; Pluss forbedrer dette.", "3.4", 11],
  ["forsinkelse.rute", "Forsinket reise", "Dokumenterte merutgifter til innhenting av betalt reise, reiserute og nødvendig overnatting ved vilkårsbestemt vær, teknisk feil, ulykke eller sykdom. Transportørens refusjonsansvar går foran.", "6 Forsinkelse", 18],
  ["avbestilling.dekning", "Avbestilling", "Ikke-refunderbare dokumenterte reise-, oppholds-, leie- og arrangementsutgifter ved akutt sykdom/ulykke/død, bolig-/virksomhetsskade, endret behandling, rettsinnkalling eller ny krig/terror/uro/epidemi/naturkatastrofe innen 72 timer før avreise.", "7 Avbestilling", 19],
  ["evakuering", "Evakuering", "Nødvendige dokumenterte merutgifter uten generell øvre sum ved myndighets-/UD-anbefalt evakuering etter krig, terror, uro, naturkatastrofe eller epidemi/pandemi; reise og opphold til nærmeste sikre sted.", "1.3 / dekningsmatrise", 5],
  ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for person- eller tingskade på reise utenfor Norden; leide/lånte ting, yrke og motorvogn er blant unntakene.", "4 Reiseansvar", 14],
  ["ansvar.sum", "Privatansvar – sum", "15 000 000 kr per skadetilfelle.", "4.3", 14],
  ["ansvar.egenandel", "Privatansvar – egenandel", "500 kr for Reise; Reise Pluss har egenandelsfritak når valgt nivå fremgår av forsikringsbeviset.", "4.5 / P15.19", 15, "standard"],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige kostnader til advokat, rett, sakkyndige og vitner ved privat tvist som oppstår på reise utenfor Norden.", "5 Rettshjelp", 16],
  ["rettshjelp.sum", "Rettshjelp – sum", "100 000 kr per tvist; 250 000 kr når tre eller flere parter står på sikredes side.", "5.3", 16],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "500 kr etter Eika-kanalvilkåret; forsikringsbeviset styrer.", "5.5", 17, "reference"],
  ["ulykke.dekning", "Helårs ulykkesforsikring", "Død, varig medisinsk invaliditet og behandlingsutgifter etter erstatningsmessig ulykkesskade. Gjelder hele døgnet også utenfor reise; forsikringsbeviset angir omfanget.", "8 Ulykke", 21],
  ["ulykke.behandling", "Ulykke – behandlingsutgifter", "Nødvendige behandlingsutgifter i inntil to år, begrenset til 5 % av invaliditetssummen. Egenandel 1 000 kr; tannskade for barn under 21 år 500 kr.", "8.5–8.7", 25],
  ["aktivitet.unntak", "Sport og aktiviteter", "Standard unntar blant annet profesjonell sport over 1 G, kamp-/luft-/motorsport, basehopp, dykking over 40 meter, fridykking over 10 meter og ekspedisjoner. Pluss åpner dokumenterte aktiviteter som fjellklatring, off-piste, kiting og downhill.", "3.4 / 8.4 / P15.16", 11],
  ["omrade.ud", "UD, krig og terror", "Reiser til område med offisielt reiseråd eller krigsrisiko er unntatt. Avbestilling før reisen og evakuering under reisen har egne utløsende vilkår.", "1.3 / 7 / evakuering", 5],
  ["sikkerhet.reisegods", "Sikkerhetsforskrifter", "Reisegods skal ha tilsyn eller være forsvarlig låst og sikret. Verdigjenstander, penger, elektronikk, mobil og skjøre ting skal ikke sendes som innsjekket bagasje; sykkel skal låses. Hendelser og utgifter må dokumenteres.", "2.7 / 9", 9],
]);

const standard = facts("fremtindReiseTerms", [
  ["bagasje.total", "Reisegods – samlet sum", "40 000 kr for enkeltperson og 120 000 kr for familie.", "Dekningsmatrise", 3],
  ["bagasje.per_gjenstand", "Enkeltgjenstand", "15 000 kr per annen enkeltgjenstand.", "Dekningsmatrise", 3],
  ["bagasje.pass_billetter", "Pass og reisedokumenter", "20 000 kr.", "Dekningsmatrise", 3],
  ["bagasje.kontanter", "Penger og verdipapirer", "6 000 kr.", "Dekningsmatrise", 3],
  ["bagasje.sykkel", "Sykkel og sykkeltilhenger", "10 000 kr.", "Dekningsmatrise", 3],
  ["bagasje.uhell", "Uhell på reisegods", "Ikke omfattet i Reise.", "P15 Reise Pluss", 27],
  ["bagasje.egenandel", "Generell egenandel", "500 kr, med dokumenterte unntak for reisesyke/hjemtransport og ulykkesdekningens egne regler.", "Ordinære vilkår / skadeoppgjør", 20, "standard"],
  ["avbestilling.sum", "Avbestilling – sum", "50 000 kr enkeltperson og 100 000 kr familie.", "Dekningsmatrise", 3],
  ["reiseavbrudd.sum", "Tapte feriedager – sum", "1 600 kr per døgn per person; ved familiereise kan inntil 3 200 kr per døgn følge matrisen.", "Dekningsmatrise", 3],
  ["ulykke.invaliditet", "Ulykke – medisinsk invaliditet", "Enslig voksen 400 000 kr; voksen i familie 300 000 kr; barn 500 000 kr. Fra 75 år gjelder dokumenterte reduserte summer.", "8.3 / dekningsmatrise", 21],
  ["ulykke.dodsfall", "Ulykke – dødsfall", "Voksen 300 000 kr; barn i familie 50 000 kr. Aldersregler følger vilkåret.", "8.3 / dekningsmatrise", 21],
]);

const plus = facts("fremtindReiseTerms", [
  ["bagasje.total", "Reisegods – samlet sum", "Ingen generell samlet øvre sum; kategori- og enkeltgjenstandsgrenser gjelder.", "P15.4", 27, undefined, true],
  ["bagasje.per_gjenstand", "Enkeltgjenstand", "40 000 kr per annen enkeltgjenstand.", "P15.3", 27, undefined, true],
  ["bagasje.pass_billetter", "Pass og reisedokumenter", "Ingen generell øvre sum etter P15; dokumenterte nødvendige utgifter og vilkåret styrer.", "P15.5", 27, undefined, true],
  ["bagasje.kontanter", "Penger og verdipapirer", "10 000 kr.", "P15.2", 27, undefined, true],
  ["bagasje.sykkel", "Sykkel og sykkeltilhenger", "40 000 kr.", "P15.1", 27, undefined, true],
  ["bagasje.uhell", "Uhell på reisegods", "Plutselig og uforutsett ytre fysisk skade med kjent årsak og tidspunkt, inntil 6 000 kr per forsikringsår. Skadet gjenstand må kunne fremvises.", "P15.6", 27, undefined, true],
  ["bagasje.uhell_sum", "Uhell – sum", "6 000 kr per forsikringsår.", "P15.6", 27],
  ["bagasje.egenandel", "Generell egenandel", "Ingen egenandel i ordinært vilkår når Reise Pluss fremgår av forsikringsbeviset; særregler kan fortsatt gjelde.", "P15.19", 28, "override", true],
  ["avbestilling.sum", "Avbestilling – sum", "Ingen generell øvre sum; dokumenterte, ikke-refunderbare kostnader og vilkåret styrer.", "P15.11–12", 27, undefined, true],
  ["reiseavbrudd.sum", "Tapte feriedager – sum", "Ingen generell øvre sum for dokumenterte tapte feriedager og ubenyttede arrangementer etter P15.", "P15.13", 27, undefined, true],
  ["forsinkelse.hotell_arrangement", "Flyforsinkelse – ekstrakompensasjon", "Ved mer enn åtte timer: 1 000 kr per påbegynt døgn, maks 5 000 kr per person og 10 000 kr per hendelse.", "P15.7", 27],
  ["leiebil.egenandel", "Egenandel leid bil", "Ubegrenset dokumentert egenandel ved skade eller tyveri av kaskoforsikret leiebil på ferie-/fritidsreise. Leasing, privatleie, bilpool, flytting og erstatningsbil er unntatt.", "P15.17", 28],
  ["ulykke.invaliditet", "Ulykke – medisinsk invaliditet", "700 000 kr for voksen og barn under 75 år.", "P15.15", 28, undefined, true],
  ["ulykke.dodsfall", "Ulykke – dødsfall", "Enslig voksen 300 000 kr; voksen i familie 500 000 kr; barn 150 000 kr.", "P15.15 / dekningsmatrise", 28, undefined, true],
  ["aktivitet.utvidet", "Utvidede aktiviteter", "Fjellklatring med sikringsutstyr, off-piste/big-jump/heliskiing, kiting og downhill på sykkel omfattes etter P15.", "P15.16", 28],
  ["veterinar", "Veterinærutgifter", "Nødvendige dokumenterte veterinærutgifter ved akutt sykdom eller ulykke utenfor Norden, inntil 2 500 kr.", "P15.18", 28],
]);

const services = facts("fremtindReiseTerms", [[
  "tjeneste.alarm", "SOS International", "Døgnåpen alarmsentral for medisinsk assistanse, sykehusopphold, hjemtransport og tilkalling. Tjeneste, ikke forsikringssum.", "3.5 / kontaktinformasjon", 13,
]]);

export const fremtindReiseFacts: Record<string, CatalogFact[]> = {
  fremtindReiseCommon: common, fremtindReiseStandard: standard,
  fremtindReisePlus: plus, fremtindReiseServices: services,
};
export const fremtindReiseProducts: CatalogProduct[] = [
  { company: "Fremtind", insuranceType: "Reise", name: "Reise", providerId: "fremtind",
    productId: "fremtind-reise", version: "2026-09-20-canonical", sourceId: "fremtindReiseTerms",
    componentIds: ["fremtindReiseCommon", "fremtindReiseStandard", "fremtindReiseServices"] },
  { company: "Fremtind", insuranceType: "Reise", name: "Reise Pluss", providerId: "fremtind",
    productId: "fremtind-reise-pluss", version: "2026-09-20-canonical", sourceId: "fremtindReiseTerms",
    componentIds: ["fremtindReisePlus"], inheritsProductId: "fremtind-reise" },
];
export const fremtindReiseAddOns = [];
