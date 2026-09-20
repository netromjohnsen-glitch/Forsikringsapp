import type { CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { frendeReiseSources } from "./frende-reise-sources.ts";
export { frendeReiseSources } from "./frende-reise-sources.ts";

type Row = [string, string, string, string, number, CatalogFact["deductibleClassification"]?];
function facts(sourceId: string, rows: Row[]): CatalogFact[] {
  const s = frendeReiseSources[sourceId];
  return rows.map(([key, label, value, section, page, deductibleClassification]) => ({
    key: `reise.${key}`, label, value,
    ...(deductibleClassification ? { deductibleClassification } : {}),
    source: { documentId: s.id, section, page, filename: s.filename, termsNumber: s.termsNumber,
      effectiveFrom: s.effectiveFrom, company: s.company, url: s.url, productCode: s.productCode,
      version: s.version, note: "Forsikringsbeviset går foran for sikrede, enkeltperson/familie, varighet og fortsettelsesforsikring, geografisk område, summer, egenandeler, reservasjoner og særvilkår." },
  }));
}

const coverage = facts("frendeReiseTerms", [
  ["avtale.forbehold", "Forsikringsbevisets forrang", "Forsikringsbeviset avgjør om avtalen gjelder enkeltperson eller familie, hvem som er forsikret, faktisk reisevarighet og fortsettelsesforsikringens periode/geografi, dekninger, summer, egenandeler, reservasjoner og særvilkår.", "Innledning", 1],
  ["personer.omfang", "Enkeltperson eller familie", "Forsikringstaker må være medlem av folketrygden og folkeregistrert i Norge. Familie i forsikringsbeviset omfatter ektefelle, samboer i ekteskapslignende forhold, barn, fosterbarn i husstanden, adoptivbarn og barn født av surrogat til fylte 21 år, samt barnebarn/oldebarn under 21 år på felles reise når de ikke har egen reiseforsikring.", "1 Hvem som er forsikret", 2],
  ["omrade.verden", "Geografisk område", "Fritid, ferie- og tjenestereise i hele verden i inntil 75 dager, fra bostedsadressen i Norge til retur til samme adresse. Gjelder ikke hjemme, på jobb, hybel/brakke/midlertidig bosted, undervisningssted, SFO/barnehage eller rutinemessige arbeidsreiser.", "2 Hvor og når forsikringen gjelder", 2],
  ["varighet.maks", "Maksimal standard reisevarighet", "75 dager per reise i hele verden.", "2.1", 2],
  ["varighet.utvidelse", "Fortsettelsesforsikring", "Kundespesifikk fortsettelsesforsikring for reiser utover 75 dager må bestilles og betales før avreise, gjelder én reise og må tegnes på nytt for hver lang reise. Forsikringsbeviset angir perioden og om geografien er Norden, Europa eller hele verden. Dette er ikke et eget hovedprodukt.", "2.1–2.2", 2],
  ["omrade.ud", "UD, krig og risikoområder", "Gjelder ikke bretur i Arktis (Svalbard er uttrykkelig unntatt fra dette bretur-unntaket), Antarktis eller Grønland, eller reise til område UD fraråder eller med overhengende fare ved krig, opprør, terror, naturkatastrofe eller epidemi/pandemi. Avbestilling for reise bestilt og betalt før nytt reiseråd har egen dekning.", "2.1", 2],
  ["avbestilling.dekning", "Avbestilling", "Ingen generell øvre sum for dokumenterte, ikke-refunderbare transport-, overnattings-, arrangements- og utfluktsutgifter ved vilkårsbestemt akutt sykdom/ulykke/død, inntil seks i reisefølget, nøkkelperson, rettsinnkalling, nødvendig tilstedeværelse etter boligskade eller ny UD-/krigs-/terror-/natur-/epidemihendelse. Konkurs, bonuspoeng, skole/kurs og planlagt behandling er blant unntakene.", "3 Avbestilling", 3],
  ["forsinkelse.rute", "Forsinket fremmøte og avgang", "Ved minst 1,5 times forsinket fremmøte på grunn av ekstraordinært vær, trafikkuhell eller teknisk feil, eller offentlig transport uten ny reise innen 24 timer ved vær/teknisk feil, dekkes nødvendige merutgifter til å innhente reiseruten uten generell øvre sum. Overnatting er begrenset til 6 000 kr per person; dokumentasjon og krav mot transportør kreves.", "4.1–4.2", 4],
  ["forsinkelse.hotell_arrangement", "Tapt overnatting, arrangement og utflukt", "Ved minst åtte timers sen ankomst til endelig reisemål dekkes forhåndsbetalt overnatting og billetter til arrangement/utflukt, inntil 6 000 kr per person. Reisen må ha minst én overnatting, og dette gjelder ikke tjenestereise.", "4.3", 4],
  ["forsinkelse.unntak", "Streik, konkurs og transportøransvar", "Ingen forsinkelsesdekning ved streik, lockout, annen arbeidskonflikt, personalmangel eller konkurs. Refunderbare utgifter og transportørens ansvar går foran.", "4.4 og 5.4", 5],
  ["bagasje.dekning", "Reisegods", "Tyveri, ran, skadeverk, trafikk-/båtuhell, brann, vannlednings-/naturskade og transportørens skade eller tap av innsjekket bagasje. Reiseuhell krever en plutselig, uforutsett ytre hendelse som du ser når den skjer; mistet, glemt eller bortkommet gods, slitasje, kosmetisk skade og angitte mekaniske/iboende forhold er unntatt.", "5.1–5.2", 5],
  ["bagasje.total", "Reisegods – samlet sum", "Ingen generell samlet øvre sum; kategori- og enkeltgjenstandsgrenser gjelder.", "5.3", 5],
  ["bagasje.per_gjenstand", "Enkeltgjenstand", "40 000 kr per enkeltgjenstand med tilbehør.", "5.3", 5],
  ["bagasje.verdisaker", "Verdigjenstander", "Ingen egen samlet kategorigrense, men 40 000 kr per enkeltgjenstand gjelder. Frende kan kreve særskilt kjøpsdokumentasjon for smykker, klokker, elektronikk og merkevarer.", "5.3 og 10.2", 5],
  ["bagasje.sportsutstyr", "Sportsutstyr", "Ingen egen samlet kategorigrense, men 40 000 kr per enkeltgjenstand gjelder. Luftsportsutstyr og droner i bruk er unntatt; kosmetisk sykkelskade er unntatt.", "5.2–5.3", 5],
  ["bagasje.sykkel", "Sykkel", "Sykkel og elsykkel omfattes innenfor enkeltgjenstandsgrensen 40 000 kr. Sykkel skal låses fast, og tilbehør skal sikres etter sikkerhetsforskriften.", "5.1–5.3 og 16", 5],
  ["bagasje.kontanter", "Penger og verdipapirer", "10 000 kr samlet per person.", "5.3", 5],
  ["bagasje.pass_billetter", "Pass og reisedokumenter", "20 000 kr samlet per person for pass, reisedokumenter og nødvendige utgifter ved tap.", "5.3", 5],
  ["bagasje.nokler", "Bolignøkler", "4 000 kr samlet per person.", "5.3", 5],
  ["bagasje.leid", "Leide ting på reisemålet", "20 000 kr samlet per person.", "5.3", 5],
  ["bagasje.uhell", "Uhell på reisegods", "Plutselig og uforutsett ytre fysisk skade som du ser idet den skjer, inntil 8 000 kr per forsikringsår. Mistet, glemt, bortkommet, kosmetisk skade, slitasje og mekaniske/iboende feil omfattes ikke.", "5.1–5.2", 5],
  ["bagasje.uhell_sum", "Uhell – sum", "8 000 kr per forsikringsår.", "5.1", 5],
  ["bagasje.forsinket", "Forsinket bagasje", "På utreise dekkes nødvendige klær/toalettsaker og leie av ski-, golf-, fiskeutstyr eller lignende inntil 6 000 kr per person mens innsjekket gods er savnet. PIR-rapport og kvitteringer kreves. Ufrivillig transitt med overnatting har 500 kr per person.", "5.4", 6],
  ["leiebil.egenandel", "Egenandel leid bil eller motorsykkel", "Ingen generell øvre sum for dokumentert egenandel ved tyveri eller ytre skade på forsikret personbil/motorsykkel leid fra utleiefirma på feriereise med minst én overnatting. Bobil, andre kjøretøy, privatleie, bildeling og leasing er unntatt; skaden må være dekket av kjøretøyets forsikring og kjent ved innlevering.", "5.5", 6],
  ["skadedyr.dekning", "Veggedyr og kakerlakker", "VIS Forsikring dekker forhåndsgodkjent bekjempelse av veggedyr/kakerlakker i reisegods etter hjemkomst og i fast bolig når skadeinsekter er tatt med fra reise, inntil 50 000 kr per tilfelle og to tilfeller per år. Forebygging, vedlikehold og aktivitet før kjøpet/etter opphør er unntatt.", "5.6 og 10.4", 6],
  ["skadedyr.egenandel", "Veggedyr/kakerlakker – egenandel", "2 000 kr ved bekjempelse i fast bolig og 500 kr ved behandling av reisegods.", "10.4", 10, "override"],
  ["medisinsk.behandling", "Akutt sykdom og personskade", "Ingen generell øvre sum for nødvendige lege-, sykehus-, reseptmedisin-, fysikalsk/kiropraktisk behandlings-, behandlingsreise- og legeordinert hotellutgifter ved plutselig akutt sykdom/ulykke. Varsling kreves ved forventet kostnad over 5 000 kr eller sykehus; fortsatt behandling etter hjemkomst inngår ikke her.", "6.1 og 6.4", 7],
  ["medisinsk.tann", "Tannbehandling", "Inntil 5 000 kr etter ulykkesskade og inntil 1 000 kr ved tannskade under spising.", "6.4", 7],
  ["medisinsk.kjent", "Kjent sykdom", "Kjent sykdom/lidelse omfattes bare når lege ved Falck Global Assistance vurderer forverringen som plutselig og uventet. Kontroll, rutinebehandling, planlagt behandling og ikke-akutte/sannsynlige forverringer er unntatt.", "6 og 6.3", 6],
  ["medisinsk.graviditet", "Graviditet og fødsel", "Akutt sykdom og uventede komplikasjoner kan omfattes før uke 36. Fødsel og svangerskapskomplikasjoner etter 36. svangerskapsuke er unntatt fra reisesyke og avbestilling.", "3.3 og 6.3", 3],
  ["hjemtransport", "Hjemtransport", "Ingen generell øvre sum for forhåndsgodkjent, medisinsk nødvendig hjemtransport og nødvendig ledsager. Ved dødsfall dekkes hjemtransport; begravelse på stedet inntil 40 000 kr. Retur til reisemålet kan dekkes innen 14 dager og innen planlagt reisetid.", "6.5", 7],
  ["hjemkallelse", "Hjemkalling", "Forhåndsgodkjent tidligere hjemreise uten generell øvre sum ved alvorlig akutt sykdom/død i nærmeste familie bosatt i EØS eller nødvendig tilstedeværelse etter skade på egen bolig eller bedrift.", "6.5", 7],
  ["sykeledsagelse", "Tilkalling", "Forhåndsgodkjente nødvendige reise- og overnattingsutgifter for inntil to personer fra Norden når sykdom/skade er svært alvorlig eller sikrede dør. Ikke tilkalling til landsdelen sikrede bor i.", "6.6", 8],
  ["medisinsk.kriseterapi", "Psykolog eller psykiater", "Inntil 20 000 kr for nødvendig behandling i Norge etter akutt psykisk krise fra ran, overfall, ulykkesskade, brann, trafikkulykke, naturkatastrofe, kapring eller terrorangrep.", "6.8", 8],
  ["reiseavbrudd", "Tapte feriedager", "Ingen generell øvre sum for forholdsmessig tap av transport og overnatting ved godkjent hjemtransport, sykehus/legeordinert sengeleie eller evakuering. I tillegg dekkes inntil to forhåndsbetalte arrangementer/utflukter og én medreisende. Gjelder ikke fortsettelsesforsikring.", "7", 8],
  ["evakuering", "Alvorlige hendelser og evakuering", "Ved krig, opprør, terror, naturkatastrofe eller epidemi/pandemi som oppstår mens du er i området gjelder dekningen inntil seks uker. Ved overhengende fare og klar UD-oppfordring dekkes forhåndsgodkjente nødvendige merutgifter til evakuering hjem uten generell øvre sum.", "8", 9],
  ["veterinar", "Veterinærutgifter", "Inntil 1 000 kr per skade for nødvendige veterinærutgifter ved akutt sykdom/ulykke for eget kjæledyr på reise utenfor Norden; ID-merking og vaksinering kreves. Konkurranse-, utstillings- og avlsreise er unntatt.", "9 og 16", 9],
  ["bagasje.egenandel", "Generell egenandel", "Ingen egenandel på reiseforsikringen med mindre forsikringsbeviset sier noe annet. Veggedyr/kakerlakker og rettshjelp har uttrykkelige særregler.", "10.6", 10, "reference"],
  ["bagasje.aldersfradrag", "Alder og slitasje", "Fradrag fastsettes konkret ut fra sannsynlig brukstid, slitasje, alder, nedsatt bruksmulighet og markedsverdi på tilsvarende brukte ting; eldste skadde del styrer når deler har ulik alder.", "10.5", 10],
  ["ulykke.dekning", "Integrert reiseulykke", "Gjelder ulykkesskade på reisen frem til fylte 80 år. Ulykken må være en plutselig, uventet ytre fysisk hendelse; sykdom, visse psykiske skader, forgiftning, insektsstikk, risikosport og øvrige dokumenterte unntak gjelder.", "11.1–11.2", 11],
  ["ulykke.invaliditet", "Reiseulykke – medisinsk invaliditet", "Ved 100 % varig medisinsk invaliditet: 500 000 kr for voksen og 700 000 kr for barn under 21 år. Etter fylte 75 år er summen 100 000 kr; dekningen opphører ved 80 år. Delvis invaliditet utbetales forholdsmessig uten progressiv overerstatning.", "11.4", 12],
  ["ulykke.dodsfall", "Reiseulykke – dødsfall", "500 000 kr for voksen og 150 000 kr for barn under 21 år. Etter fylte 75 år er summen 100 000 kr; dekningen opphører ved 80 år.", "11.3", 12],
  ["ulykke.behandling", "Reiseulykke – behandlingsutgifter", "Nødvendig behandling i Norge i inntil tre år, begrenset til 5 % av invaliditetssummen: offentlig refusjonsberettiget lege/tannlege/fysioterapi, foreskrevne medisiner/protese og offentlig transport som ikke refunderes. Ingen egenandel; tyggeskade, hjelpemidler og rehabilitering/opptrening er unntatt.", "11.5–11.6", 12],
  ["ansvar.dekning", "Privatansvar", "Rettslig erstatningsansvar som privatperson for person- eller tingskade på reise utenfor Norden. Yrke/næring, motorvogn/båt/luftfartøy, familie, leide/lånte/brukte ting og avtaleansvar er blant unntakene.", "12", 13],
  ["ansvar.sum", "Privatansvar – sum", "15 000 000 kr per skadetilfelle og samlet per år.", "12.4", 14],
  ["ansvar.egenandel", "Privatansvar – egenandel", "Ingen egenandel.", "12.4", 14, "override"],
  ["rettshjelp.dekning", "Rettshjelp", "Rimelige og nødvendige advokat-, retts-, sakkyndig- og vitneutgifter ved privat tvist som oppstår på reise utenfor Norden. Tvist knyttet til blant annet yrke, næring, fast eiendom, familie/skifte, straffesak og kjøretøy er unntatt.", "13.1–13.3", 14],
  ["rettshjelp.sum", "Rettshjelp – sum", "100 000 kr per tvist, også når flere parter står på samme side, begrenset til sikredes økonomiske interesse.", "13.4", 15],
  ["rettshjelp.egenandel", "Rettshjelp – egenandel", "4 000 kr pluss 20 % av øvrige kostnader per tvist.", "13.4", 15, "override"],
  ["aktivitet.unntak", "Sport og aktiviteter", "Sykdom/skade og reiseulykke unntar blant annet inntekts-/sponsoridrett over 1 G, motorsport, full-/semikontakt kampsport, forbunds-/kretsserie og cup, basehopp, fallskjermhopp og dykking dypere enn 40 meter. Dykking krever sertifikat for aktuell dybde. Opphold over 6 000 moh. og de særskilte polar-/Grønland-reglene gjelder som egne begrensninger.", "6.2, 11.2 og 16", 7],
  ["sikkerhet.reisegods", "Sikkerhetsforskrifter", "Reisegods skal holdes under tilsyn eller låses/sikres forsvarlig. Kontanter, pass, klokker, smykker og elektronikk skal bæres eller ligge i safe og aldri sendes som innsjekket bagasje; sykkel skal låses fast. Transportskade/tap må meldes på stedet.", "16", 16],
]);

const services = [
  ...facts("frendeReiseTerms", [["tjeneste.alarm", "Falck Global Assistance", "Døgnåpen alarmsentral for sykdom, ulykke, medisinsk assistanse, forhåndsgodkjenning, hjemtransport, tilkalling og evakuering. Medisinsk rådgivning før reise er en informasjonstjeneste, ikke en forsikringssum.", "6.9 og skadehjelp", 8]]),
  ...facts("frendeReiseDoctor", [["tjeneste.legehjelp", "Legetime på mobilen via Eyr", "Gratis videokonsultasjon med norsk lege for personer med gyldig Frende reiseforsikring når de blir syke eller skadet på fritidsreise i Norge eller utlandet. Tjeneste, ikke forsikringssum; alvorlige tilfeller skal håndteres via alarmsentral/akutthjelp.", "Legetime på mobilen", 1]]),
];

export const frendeReiseFacts: Record<string, CatalogFact[]> = {
  frendeReiseCoverage: coverage,
  frendeReiseServices: services,
  frendeReiseIpid: facts("frendeReiseIpid", [["avtale.ipid", "IPID – produktoversikt", "Produktarket, sist oppdatert 01.06.2026, bekrefter ett produkt for enkeltperson eller familie, sentrale dekninger og begrensninger. Forsikringsbevis og fullvilkår styrer.", "Produktoversikt", 1]]),
  frendeReiseGeneral: facts("frendeReiseGeneral", [["avtale.generellevilkar", "Generelle vilkår", "Generelle regler om blant annet oppsigelse, skadeoppgjør, samlet ansvar ved krig/terror og datakriminalitet gjelder sammen med reisevilkåret.", "Generelle vilkår", 1]]),
};

export const frendeReiseProducts: CatalogProduct[] = [{
  company: "Frende", insuranceType: "Reise", name: "Reiseforsikring", providerId: "frende",
  productId: "frende-reiseforsikring", version: "2026-03-01", sourceId: "frendeReiseTerms",
  componentIds: ["frendeReiseIpid", "frendeReiseGeneral", "frendeReiseCoverage", "frendeReiseServices"],
}];
export const frendeReiseAddOns = [];
