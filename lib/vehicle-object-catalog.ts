import type { CatalogAddOn, CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { vehicleObjectSources } from "./vehicle-object-sources.ts";
import { vehicleObjectCoverages } from "./vehicle-object-registry.ts";
export { vehicleObjectSources } from "./vehicle-object-sources.ts";

// The already archived SV707 original also explicitly covers Campingvogn.
// This binding is restricted to Super; the Bobil binding remains independent.
vehicleObjectSources["vehicle:if-SV707.pdf"] = {
  id: "vehicle:if-SV707.pdf", filename: "if-SV707.pdf", company: "If", providerId: "if",
  insuranceType: "Campingvogn", agreementScope: "ordinary", productIds: ["if-campingvogn-super"],
  sourceType: "full_terms", termsNumber: "SV707", effectiveFrom: "2022-06", version: "2022-06",
  url: "https://if.no/apps/vilkarsbasendokument/Vilkaar?vilkaar=SV707",
  sha256: "a4e2c6ecafc88fafbb5a0e194a373c4e2953b920d2947582352bdf845a03154e",
  documentName: "Særvilkår for Campingvogn og bobil",
};

type ObjectType = "snoscooter" | "campingvogn" | "tilhenger";
type Row = [key: string, value: string, page: number, section: string, sourceFile?: string];
const labels = { snoscooter: "Snøscooter", campingvogn: "Campingvogn", tilhenger: "Tilhenger" };
const typeId = (type: ObjectType) => type === "snoscooter" ? "snøscooter" : type;
export const vehicleObjectProducts: CatalogProduct[] = [];
export const vehicleObjectFacts: Record<string, CatalogFact[]> = {};
export const vehicleObjectAddOns: CatalogAddOn[] = [];
export const vehicleObjectCoverageMatrix: Record<string, Record<string, "standard" | "optional" | "not_included" | "unknown">> = {};

function facts(type: ObjectType, file: string, rows: Row[]): CatalogFact[] {
  const definitions = vehicleObjectCoverages(typeId(type));
  const withParents = [...rows];
  for (const [key, , page, section, override] of rows) {
    const family = key.split(".")[0];
    if (["utstyr.grense", "losore.grense"].includes(key) && !withParents.some(([k]) => k === `${family}.dekning`)) {
      withParents.push([`${family}.dekning`, "Omfattes ved skade som dekkes av valgt produktnivå", page, section, override]);
    }
  }
  return withParents.map(([key, value, page, section, override]) => {
    const source = vehicleObjectSources[`vehicle:${override ?? file}`];
    if (!source) throw new Error("Missing vehicle catalog source");
    if (source.effectiveFrom > "2026-09-23") throw new Error("Future terms cannot establish current vehicle facts");
    const fullKey = `${type}.${key}`;
    const coverage = definitions.find((definition) => definition.parentKey === fullKey || definition.details.some((detail) => detail.key === fullKey));
    const detail = coverage?.details.find((entry) => entry.key === fullKey);
    return { key: fullKey, label: coverage ? `${coverage.label}${detail ? ` – ${detail.summaryLabel}` : ""}` : key.replaceAll(".", " – "), value,
      ...(key.endsWith("egenandel") ? { deductibleClassification: "standard" as const } : {}),
      source: { documentId: source.id, filename: source.filename, url: source.url,
        termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom, ...(source.version ? { version: source.version } : {}), page, section,
        note: "Offentlig produktgrunnlag; kundens forsikringsbevis går foran. Ukjent dokumentdato er ikke en bekreftet gyldighetsdato." } };
  });
}
function product(providerId: string, company: string, type: ObjectType, name: string, file: string, rows: Row[], excluded: string[] = []) {
  const slug = name.toLocaleLowerCase("nb-NO").replaceAll(" ", "-");
  const productId = `${providerId}-${type}-${slug}`;
  const source = vehicleObjectSources[`vehicle:${file}`];
  vehicleObjectProducts.push({ providerId, company, insuranceType: labels[type], name, productId,
    version: source.effectiveFrom || null, sourceId: source.id, componentIds: [productId] });
  vehicleObjectFacts[productId] = facts(type, file, rows);
  vehicleObjectCoverageMatrix[productId] = Object.fromEntries(vehicleObjectCoverages(typeId(type)).map(({ parentKey }) =>
    [parentKey, vehicleObjectFacts[productId].some(({ key }) => key === parentKey) ? "standard" : excluded.some((key) => `${type}.${key}.dekning` === parentKey) ? "not_included" : "unknown"]));
  return productId;
}
const row = (key: string, value: string, page: number, section: string, file?: string): Row => [key, value, page, section, file];
const included = (keys: string[], page: number, section: string, file?: string): Row[] => keys.map((key) => row(`${key}.dekning`, "Inkludert i produktnivået", page, section, file));

// Tryg: October 2026 snøscooter terms are archived but not used. IPID and
// active product/ansvar terms establish only the limited current base below.
const trygSnow = "tryg-IPID-Snoscooter.pdf";
for (const name of ["Ansvar", "Brann og tyveri", "Kasko"]) {
  product("tryg", "Tryg", "snoscooter", name, trygSnow, [
    ...included(["ansvar", "rettshjelp"], 1, "Ansvar"),
    row("ansvar.grense", "Ubegrenset personskade; inntil 100 000 000 kr for annen skade per hendelse", 1, "1.1 Ansvar", "tryg-odpdf-060a2170.pdf"),
    row("avtale.geografi", "Europa unntatt Russland, Belarus og Tyrkia; rettshjelp i Norden", 1, "3", "tryg-odpdf-dbf5be98.pdf"),
    row("avtale.sesong", "Sesongfordelt pris ved opphør; ikke jevn fordeling av årsprisen", 1, "5", "tryg-odpdf-dbf5be98.pdf"),
    ...(name !== "Ansvar" ? included(["brann", "tyveri"], 1, "Brann og tyveri") : []),
    ...(name === "Kasko" ? included(["kasko"], 1, "Kasko") : []),
    ...(name === "Kasko" ? [row("redning.begrensning", "Utgifter til redning/veihjelp er unntatt", 1, "Begrensninger – Kasko")] : []),
  ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Kasko" ? [] : ["kasko"]);
}
for (const type of ["campingvogn", "tilhenger"] as const) {
  for (const name of ["Brann", "Brann og tyveri", "Kasko", ...(type === "campingvogn" ? ["Campingvogn Ekstra"] : [])]) {
    const file = name === "Brann" ? "tryg-odpdf-543856fa.pdf" : name === "Brann og tyveri" ? "tryg-odpdf-05b2538c.pdf" : "tryg-odpdf-f862c645.pdf";
    const extra = name === "Campingvogn Ekstra";
    const rows: Row[] = [
      ...included(["brann", "rettshjelp"], 1, "1 og 2"),
      row("avtale.geografi", "Europa unntatt Russland, Belarus og Tyrkia; rettshjelp i Norden", 1, "3", "tryg-odpdf-f52d5798.pdf"),
      ...(type === "tilhenger" ? [
        ...included(["naturskade"], 1, "2.2", "tryg-odpdf-543856fa.pdf"),
        row("naturskade.egenandel", "8 000 kr", 2, "2.2", "tryg-odpdf-543856fa.pdf"),
      ] : []),
      row("avtale.forsikringssum", "Avtalt forsikringssum; ved totalskade begrenset til markedsverdien", 1, "Forsikringssum"),
      row("utstyr.grense", extra ? "50 000 kr" : "10 000 kr", 1, "Fastmontert tilbehør", extra ? "tryg-odpdf-d09fac80.pdf" : file),
      ...(name !== "Brann" ? included(["tyveri"], 1, "2") : []),
      ...(["Kasko", "Campingvogn Ekstra"].includes(name) ? [
        ...included(["kasko", "glass"].filter((key) => type === "campingvogn" || key !== "glass"), 2, "2.1 og 2.4"),
        row("kasko.begrensning", extra ? "Frost, strømbrudd og konstruksjonssprekker er unntatt" : "Frost, strømbrudd, konstruksjonssprekker og insekter/gnagere er unntatt", 1, "2.1"),
        row("brann.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt", 2, "2.2"),
        row("tyveri.egenandel", "6 000 kr hvis ikke lavere egenandel er avtalt", 2, "2.3"),
      ] : []),
      ...(type === "campingvogn" ? [
        row("losore.grense", extra ? "50 000 kr samlet; 10 000 kr per gjenstand; 15 000 kr i tekstilfortelt" : "15 000 kr samlet; 5 000 kr per gjenstand", 1, "Løst utstyr", extra ? "tryg-odpdf-d09fac80.pdf" : file),
        row("fortelt.dekning", extra ? "Fortelt og terrasse konstruert for campingvognen omfattes; løsøre i tekstilfortelt har egen særgrense" : "Fortelt og terrasse konstruert for campingvognen omfattes; tyveri fra tekstilfortelt er unntatt", 1, "1.1 og 2.3"),
      ] : []),
      ...(extra ? [
        ...included(["fukt", "skadedyr", "ferie"], 1, "Utvidelser", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.alder", "Innen 10 år etter første registrering som fabrikkny", 1, "Fuktskade", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.egenandel", "8 000 kr inntil 5 år; deretter 25 %, minst 8 000 kr", 1, "Fuktskade", "tryg-odpdf-d09fac80.pdf"),
        row("fukt.begrensning", "Rørlekkasje, frost, fortelt, terrasse og teltvogn er unntatt", 1, "Unntak", "tryg-odpdf-d09fac80.pdf"),
        row("ferie.grense", "1 500 kr per dag i resterende planlagt ferie, maksimalt 14 dager", 1, "Avbrutt ferie", "tryg-odpdf-d09fac80.pdf"),
        row("ferie.begrensning", "Ikke ved helt eller delvis utleie", 1, "Avbrutt ferie", "tryg-odpdf-d09fac80.pdf"),
      ] : []),
    ];
    product("tryg", "Tryg", type, name, file, rows, name === "Brann" ? ["tyveri", "kasko"] : name === "Brann og tyveri" ? ["kasko"] : []);
  }
}
for (const [name, family, file, scope] of [
  ["Førerulykke", "forerulykke", "tryg-odpdf-2001c3a6.pdf", "Skade på fører; også passasjer dersom kjøretøyet er registrert for flere personer"],
  ["Fører- og passasjerulykke", "ulykke", "tryg-odpdf-56716918.pdf", "Skade på fører og passasjer"],
]) {
  const id = `tryg-snoscooter-${family}`;
  vehicleObjectFacts[id] = facts("snoscooter", file, [
    row(`${family}.dekning`, scope, 1, "1"),
    row(`${family}.grense`, "Medisinsk invaliditet inntil 200 000 kr; dødsfall 100 000 kr", 2, "3.1 og 3.2"),
  ]);
  vehicleObjectAddOns.push({ id, name, componentId: id, providerId: "tryg", insuranceTypes: ["Snøscooter"], requiresLevel: ["tryg-snoscooter-ansvar", "tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-kasko"], exclusiveGroup: "tryg-snoscooter-ulykke" });
  for (const productId of ["tryg-snoscooter-ansvar", "tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-kasko"]) vehicleObjectCoverageMatrix[productId][`snoscooter.${family}.dekning`] = "optional";
}

// Gjensidige: public specimen policies, not evidence of any customer's choices.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const levels = type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Delkasko", "Kasko", "Pluss"] : ["Delkasko", "Kasko"];
  for (const name of levels) {
    const file = type === "snoscooter" ? (name === "Ansvar" ? "gjensidige-snoscooter-ansvar-alminnelige-vilkar.pdf" : `gjensidige-Snoscooter-${name}-alminnelige-vilkar.pdf`) : type === "campingvogn" ? `gjensidige-Campingvogn-${name}-alminnelige-vilkar.pdf` : `gjensidige-tilhenger-${name.toLowerCase()}-alminnelige-vilkar.pdf`;
    const rows: Row[] = [
      ...(type === "snoscooter" ? [
        row("ansvar.dekning", "Ansvar etter Bilansvarsloven. Ordinær egenandel 0 kr; særregler om forhøyet egenandel og kundens forsikringsbevis går foran", 1, `Dekningsoversikt; Hvilke skader side ${name === "Ansvar" ? 2 : 3}`),
        row("ansvar.grense", "Ubegrenset personskade; 100 millioner kr tingskade. Ordinær egenandel 0 kr; særregler om forhøyet egenandel og kundens forsikringsbevis går foran", 1, "Dekningsoversikt – Ansvar"),
        row("ulykke.dekning", "Ulykkesskade for rettmessig fører og passasjerer som rettmessig oppholder seg i/på/ved motorvognen når motorvognen eller tilkoplet utstyr er den direkte årsak til skaden. Plutselig og uforutsett ytre fysisk hendelse i forsikringstiden; også fall som ikke er forårsaket av sykdom, vridning av kne eller ankel og brudd i skulder, arm, håndledd, lårbein, leggbein, skinnlegg, ankel eller hælbein etter hard eller feil landing etter hopp. Varig medisinsk invaliditet er fysisk eller psykisk funksjonsnedsettelse, uten hensyn til yrke, inntektsevne eller fritidsinteresser. Ordinær egenandel 0 kr. Unntatt skade som følge av deltakelse i slagsmål eller forbrytelser, sykdom, besvimelse eller sykelig tilstand/disposisjon, psykisk skade alene uten samtidig fysisk skade som gir erstatningsmessig varig medisinsk invaliditet, myalgier/uspesifikke smertetilstander, tendinitter, tendinoser og impingement selv om ulykke kan påvises, tannskade ved tygging og invaliditetserstatning for tannskade. Selvmord/forsøk er unntatt; likevel dekkes selvmord ved sannsynliggjort akutt sinnsforvirring med ytre årsak, ikke sinnslidelse", name === "Ansvar" ? 3 : 4, "Ulykke – hvem, hendelser og unntak; egenandel i dekningsoversikt side 1"),
        row("ulykke.grense", "Dødsfall 100 000 kr; medisinsk invaliditet 200 000 kr ved 100 % invaliditet, etter forsikringsbeviset. Dødsfall må følge av ulykkesskaden innen ett år; tidligere forskudd på invaliditetserstatning for samme skade trekkes fra. Dødsfallssummen begrenses til 50 000 kr dersom den omkomne på skadetidspunktet ikke hadde barn eller ektefelle/samboer i live eller forsørget sine foreldre. Delvis invaliditet erstattes forholdsmessig; ingen invaliditetserstatning ved død innen ett år. Tap/skade på tidligere helt funksjonsudyktig kroppsdel eller organ gir ikke invaliditetserstatning; tidligere delvis funksjonsudyktighet trekkes fra. Endelig erstatning fastsettes senest tre år etter skadedagen, etter antatt varig tilstand på treårsdagen dersom graden fortsatt kan endre seg. Samlet invaliditetsgrad for samme skade er høyst 100 %. Medvirkende sykdom, disposisjon eller mén reduserer dødsfalls-/invaliditetserstatningen forholdsmessig. Skades flere personer ved samme ulykkestilfelle under motorvogn-/arbeidsmaskindekningen, er samlet erstatning begrenset til 1 000 000 kr og fordeles forholdsmessig mellom de skadelidte; dette er ikke en individuell invaliditetssum", name === "Ansvar" ? 4 : 5, "Ulykke – dødsfall og invaliditet; referansesummer i dekningsoversikt side 1"),
        row("rettshjelp.dekning", "Rettshjelp i Norden som eier, rettmessig bruker eller fører av forsikret motorvogn. Tvist oppstått i forsikringstiden; også tvist som tidligere eier etter salg og opphørt forsikring, og tvist med selger ved neste kjøp før overtakelse/egen forsikring når tidligere tilsvarende kjøretøy var forsikret i Gjensidige på kjøpstidspunktet. Forsikringssum 100 000 kr per tvist etter forsikringsbeviset, alltid begrenset til den økonomiske verdien av sikredes interesse. Ved flere parter forsikret i Gjensidige på sikredes side er det én sum per tvist: 1–2 parter 100 000 kr, 3–10 parter 250 000 kr, 11–25 parter 500 000 kr, 26–49 parter 750 000 kr og 50 eller flere parter 1 000 000 kr. Særregel for gruppesøksmål: fremmet gruppesøksmål samlet inntil 500 000 kr; avvist saksanlegg inntil 20 000 kr per sikrede i Gjensidige, begge begrenset til antatt økonomisk interesse; utbetalt avvisningsdekning trekkes fra ved senere innvilget rettshjelp. Egenandel 4 000 kr pluss 20 % av utgiftene som dekkes av forsikringen; én egenandel per tvist også med flere parter på samme side. Utenrettslig mekling ved Mekle.no har egenandel 0 kr, forutsatt at økonomisk interesse overstiger fast egenandel; egen advokat under meklingen dekkes ikke. Ikke ankegebyr, idømte sakskostnader, voldgift eller utgifter før tvist, offentlig saksbehandling før vedtak eller advokatens reise til Forliksrådet. Tilkjente saksomkostninger trekkes fra, med unntak ved dokumentert manglende betalingsevne hos motpart. Unntatt straffesak, erstatningskrav eller tvist som har utspring i ulovlig handling fra sikredes side; øvrige unntatte tvister gjelder, ærekrenkelse/sjikane/trakassering, yrke/erverv, familie/arv/skifte, namsmyndigheter, ubestridt inkasso/gjeldsordning/konkurs/akkord når sikrede er skyldner, juridiske personer, advokat-/sakkyndigsalær eller merutgifter ved advokatbytte, sameiere med vilkårets særskilte unntak, uforsikret motorvogn/båt i Gjensidige, egen ansvarsforsikringsdekning, foreldede krav/manglende rettslig interesse og avslag på rettshjelp fra Gjensidige. Forvaltningsvedtak er unntatt før fullt utnyttet administrativ klageadgang; senere søksmål kan dekkes, men ikke utgifter under forvaltningsbehandlingen. Tvistegrunnlag før ikrafttreden er unntatt ved nytegning, ikke ved flytting fra annet selskap", name === "Ansvar" ? 5 : 6, `Rettshjelp – omfang og unntak side ${name === "Ansvar" ? "5–6" : "6–7"}; forsikringssum og egenandel side ${name === "Ansvar" ? 7 : 8}`),
        row("avtale.geografi", "Europa unntatt Kosovo, Russland og Belarus; rettshjelp bare i Norden", name === "Ansvar" ? 2 : 3, "Hvor gjelder forsikringen"),
      ] : []),
      ...(name !== "Ansvar" ? type === "campingvogn" ? [
        row("brann.dekning", "Brann med åpne flammer, lynnedslag og eksplosjon. Offentlig standardegenandel 6 000 kr; kundens forsikringsbevis går foran", 3, "Hvilke skader – Brann; egenandel i dekningsoversikt side 1"),
        row("tyveri.dekning", "Tyveri og forsøk på tyveri av campingvognen. Offentlig standardegenandel 6 000 kr; kundens forsikringsbevis går foran", 3, "Hvilke skader – Tyveri; egenandel i dekningsoversikt side 1"),
      ] : type === "snoscooter" ? [
        row("brann.dekning", "Brann, lynnedslag og eksplosjon; ordinær egenandel 6 000 kr etter offentlig dekningsoversikt. Kundens forsikringsbevis går foran", 3, "Hvilke skader – Brann; egenandel side 1"),
        row("tyveri.dekning", "Tyveri og forsøk på tyveri av snøscooteren; ordinær egenandel 6 000 kr etter offentlig dekningsoversikt. Kundens forsikringsbevis går foran", 3, "Hvilke skader – Tyveri; egenandel side 1"),
      ] : included(["brann", "tyveri"], 2, "Hvilke skader") : []),
      ...(["Kasko", "Pluss"].includes(name) ? type === "campingvogn" ? [
        row("kasko.dekning", "Skade på campingvognen som følge av plutselig ytre påvirkning; gjelder også fortelt/tilbygg dersom dette er medforsikret. Kasko og Pluss tilbyr egenandel fra 6 000 til 12 000 kr; kundens valg må fremgå av forsikringsbeviset", 3, "Hvilke skader – Kasko; egenandelvalg i produktnettsidens FAQ"),
      ] : type === "snoscooter" ? [
        row("kasko.dekning", "Skade på snøscooteren som følge av plutselig ytre påvirkning; produktnettsiden beskriver kollisjon, utforkjøring og velt som du selv er skyld i, samt motorskade ved feilfylling av drivstoff. Egenandel kan velges fra 4 000 til 8 000 kr; offentlig beviseksempel 8 000 kr er ikke kundens dokumenterte valg. Kundens forsikringsbevis går foran", 3, "Hvilke skader – Kasko; produktnettsidens hendelser og egenandelvalg"),
      ] : included(["kasko"], 2, "Hvilke skader") : []),

      ...(type === "snoscooter" && name !== "Ansvar" ? [
        row("utstyr.dekning", "Fastmontert ekstrautstyr på snøscooteren omfattes ved skade som dekkes av valgt produktnivå", 1, "Fastmontert ekstrautstyr; Hvilke skader side 3"),
        row("utstyr.grense", "10 000 kr for fastmontert ekstrautstyr i basisdekningen. Økt utstyrssum kan avtales som utvidelse; høyere sum krever kundens dokumenterte avtale. Henger er en separat mulig utvidelse, ikke valgt gjennom det offentlige beviseksemplet; fullstendige utvidelsesvilkår og en eventuell høyere sum er ikke dokumentert her", 1, "Fastmontert ekstrautstyr; MOT05 – Mulige utvidelser"),
        row("losore.dekning", "Skade på eller tyveri av personlige ting i et låst oppbevaringsrom på snøscooteren, ved skade som dekkes av valgt produktnivå", 1, "Personlige ting – Delkasko og Kasko", "gjensidige-snoscooterforsikring.html"),
        row("losore.grense", "Inntil 5 000 kr for ting i låst oppbevaringsrom på snøscooteren ved skade som dekkes av valgt produktnivå", 1, "Personlige ting – Delkasko og Kasko", "gjensidige-snoscooterforsikring.html"),
        row("redning.begrensning", "Transport til og fra verksted ved reparasjon er unntatt", 3, "Dekkes ikke"),
      ] : []),
      ...(type === "campingvogn" ? [
        ...(name === "Delkasko" ? included(["glass"], 3, "Hvilke skader/utgifter") : [
          row("glass.dekning", "Bruddskader på campingvognens ruter og takluker: reparasjon dekkes inntil 1 000 kr uten egenandel; skifte har 3 000 kr i egenandel. Solcellepanel dekkes som kaskoskade, ikke som glasskade", 1, "Glass – dekningsoversikt; Hvilke skader side 3"),
        ]),
        row("redning.dekning", "Inkludert i produktnivået. Utgifter til hjemtransport av campingvognen ved avbrutt reise som skyldes ulykke, sykdom eller død hos fører eller passasjerer i trekkvogna; også når campingvognen er funnet igjen etter tyveri eller ikke kan repareres innen to virkedager. Merutgifter begrenses til campingvognens verdi. Ikke utgifter som hadde påløpt ved hjemreise eller planlagt reise, reparasjon og deler, videresending av gods eller skade som importør, selger eller reparatør er ansvarlig for etter lov, forskrift, garanti eller reklamasjonsrett. Ikke hjemtransport dersom fører eller passasjer kan kjøre hjem, eller utgifter som kan kreves gjennom trekkvognas veihjelpsforsikring i annet selskap. Hastighetsløp eller lignende på avsperret område er unntatt, med unntak for opplæring til førerkort", name === "Kasko" ? 4 : 3, "Veihjelp – hjemtransport og begrensninger, side 3–4"),
        row("utstyr.dekning", "Fastmontert ekstrautstyr omfattes ved skade som dekkes av valgt produktnivå. Fortelt omfattes ikke som fastmontert ekstrautstyr, men krever egen utvidelse", 3, "Hva er forsikret; dekningsoversikt side 1"),
        row("utstyr.grense", "Ubegrenset sum for fastmontert ekstrautstyr; fortelt/tilbygg har separat avtalt sum og krever egen utvidelse", 1, "Fastmontert ekstrautstyr; Hva er forsikret side 3"),
        row("losore.dekning", "Personlige ting i campingvognen omfattes ved hendelser som dekkes av valgt produktnivå; også ting i fortelt/tilbygg når dette er medforsikret", 1, "Personlige ting; FAQ – ting inne i campingvognen", "gjensidige-campingvognforsikring.html"),
        row("losore.grense", `${name === "Pluss" ? "50 000" : "10 000"} kr i basisdekningen. Høyere sum kan avtales ved kontakt med Gjensidige mot tillegg i prisen; eventuell høyere sum må fremgå av kundens forsikringsbevis`, 1, "Personlige ting – basisgrense og avtalt høyere sum", "gjensidige-campingvognforsikring.html"),
        ...(name === "Delkasko" ? [
          row("naturskade.dekning", "Skader som følge av flom eller andre naturskader er unntatt fra Delkasko", 3, "Hvilke skader – Dekkes ikke"),
        ] : [
          row("naturskade.dekning", "Skader som følge av flom, storm eller skred omfattes av Kasko og Pluss", 1, "Naturskader – Kasko og Pluss", "gjensidige-campingvognforsikring.html"),
          row("naturskade.egenandel", "Egenandelen ved andre naturskader er summen kunden velger for Kasko/Pluss, med valg fra 6 000 til 12 000 kr; nettsidens offentlige standard er 8 000 kr. Ved flomskader er egenandelen 20 000 kr. Kundens forsikringsbevis går foran", 1, "Naturskader; FAQ – egenandel ved skader", "gjensidige-campingvognforsikring.html"),
        ]),
        row("avtale.geografi", "Mobil bruk: Europa. Fast sted: Norge, Sverige, Danmark og Finland", 3, "Hvor gjelder forsikringen"),
        row("fortelt.begrensning", "Fortelt/tilbygg krever egen avtalt utvidelse og sum; er ikke fastmontert ekstrautstyr", 3, "Hva er forsikret"),
        ...(["Kasko", "Pluss"].includes(name) ? included(["skadedyr"], 3, "Hvilke skader") : []),
        ...(name === "Pluss" ? [
          row("fukt.dekning", "Fuktskader i campingvognens vegger, tak og gulv omfattes på vilkårene for alder og fuktighetstest", 3, "Hvilke skader – Fuktskader"),
          row("ferie.dekning", "Feriegaranti når campingvognen etter en dekket skade ikke kan benyttes til planlagt ferie med varighet over 6 dager. Dekker dokumenterte utgifter til leie av campingvogn, hotell eller lignende; avbrutt ferie under utlån eller utleie erstattes ikke", 4, "Feriegaranti – kompensasjon for avbrutt ferie, side 3–4"),
          row("fukt.alder", "Ikke eldre enn 15 år fra produksjonsdato", 3, "Fuktskader"),
          row("fukt.begrensning", "Fuktighetstest uten anmerkninger skal være utført av forhandler eller campingvognverksted mindre enn ett år før skaden oppdages. Skaden må være konstatert i forsikringstiden", 3, "Fuktskader"),
          row("ferie.grense", "Inntil 1 500 kr per dag i inntil 14 dager", 4, "Feriegaranti"),
        ] : []),
      ] : []),
      ...(type === "tilhenger" ? [
        ...included(["redning"], 2, "Hvilke utgifter"),
        row("avtale.geografi", "Europa unntatt Kosovo, Russland og Belarus", 2, "Hvor gjelder forsikringen"),
      ] : []),
    ];
    const id = product("gjensidige", "Gjensidige", type, name, file, rows, name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Delkasko" ? ["kasko"] : []);
    if (type === "snoscooter") {
      for (const fact of vehicleObjectFacts[id]) {
        if (fact.key.endsWith(".dekning")) fact.coverageAvailability = "included";
        const supportingFile = fact.key === "snoscooter.utstyr.grense" ? "gjensidige-MOT05.pdf"
          : fact.key === "snoscooter.kasko.dekning" ? "gjensidige-snoscooterforsikring.html" : null;
        if (supportingFile) {
          const source = vehicleObjectSources[`vehicle:${supportingFile}`];
          fact.qualificationSource = { documentId: source.id, filename: source.filename, url: source.url,
            termsNumber: source.termsNumber, effectiveFrom: source.effectiveFrom, page: 1,
            section: supportingFile === "gjensidige-MOT05.pdf" ? "Mulige utvidelser – Utvide sum for ekstrautstyr; Henger"
              : "Kasko – Kollisjon, utforkjøring og velt; Feilfylling av drivstoff; FAQ – egenandel 4 000–8 000 kr" };
        }
      }
    }
    if (type === "campingvogn") {
      for (const fact of vehicleObjectFacts[id]) {
        if (["brann", "tyveri", "kasko", "redning", "utstyr", "losore", "naturskade", "fukt", "ferie", ...(name === "Delkasko" ? [] : ["glass"])].some((family) => fact.key === `campingvogn.${family}.dekning`)) {
          fact.coverageAvailability = fact.key === "campingvogn.naturskade.dekning" && name === "Delkasko" ? "unavailable" : "included";
        }
        if (fact.key === "campingvogn.kasko.dekning") {
          const website = vehicleObjectSources["vehicle:gjensidige-campingvognforsikring.html"];
          fact.qualificationSource = { documentId: website.id, filename: website.filename, url: website.url,
            termsNumber: website.termsNumber, effectiveFrom: website.effectiveFrom, page: 1,
            section: "FAQ – Hva er egenandelen ved skader på campingvognen? Kasko og Pluss: 6 000–12 000 kr" };
        }
      }
      if (name === "Delkasko") vehicleObjectCoverageMatrix[id]["campingvogn.naturskade.dekning"] = "not_included";
    }
  }
}

// Frende's three official endpoints currently serve the same terms. Sharing
// text does not imply sharing the vehicle's coverage selections or scope.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = `frende-${type === "snoscooter" ? "Snowmobile" : type === "campingvogn" ? "Caravan" : "Trailer"}Insurance.pdf`;
  for (const name of [...(type === "snoscooter" ? ["Ansvar"] : []), "Brann og tyveri", "Kasko"]) {
    product("frende", "Frende", type, name, file, [
      ...(type === "campingvogn" ? [
        row("rettshjelp.dekning", "Rettshjelp i Norden for privatkunder som personlig eier, rettmessig bruker eller fører. Omfatter tvist etter salg og opphørt forsikring, og kjøp av nytt kjøretøy før ny forsikring når nåværende kjøretøy var forsikret i Frende. Samme tvist blir ikke flere ved flere spørsmål/søksmål. Voldgift og særdomstol omfattes når tvisten ellers kunne vært ført for alminnelige domstoler", 11, "14.1 (fortsatt side 12), jf. 2"),
        row("rettshjelp.grense", "100 000 kr per tvist; 250 000 kr samlet ved minst tre parter på samme side, også på tvers av forsikringer/selskaper. Begrenset til den økonomiske interessen i saken. Uforsikrede parter bærer sin andel og holdes utenfor erstatningsberegningen", 12, "14.4 (fortsatt side 13)"),
        row("rettshjelp.egenandel", "4 000 kr pluss 20 % av øvrige kostnader; én egenandel per tvist også ved flere parter på samme side", 13, "14.4"),
        row("rettshjelp.begrensning", "Rimelige og nødvendige utgifter til egen advokat, registrert rettshjelper, retten, godkjent advokatmekler og sakkyndige; ved rettsbehandling også vitner og rettsgebyr til forliksrådet/tingretten. Ikke ankegebyr, idømte eller avtalte saksomkostninger. Tilkjente omkostninger trekkes fra, med unntak ved dokumentert betalingsudyktig motpart. Unntatt tvist mellom sameiere, yrke/virksomhet, familie/arv/skifte, namsmyndigheter, ubestridt inkasso, gjeldsforhandling/konkurs/akkord, straffesak, krenkelser/bøter/gebyrer, ulovlig handling, forvaltningsvedtak før fullt utnyttet klageadgang og søksmål, og advokat-/sakkyndigsalær. Ikke utgifter før tvist eller grunnlag som oppstod før forsikringen", 12, "14.2–14.3"),
      ] : type === "snoscooter" ? [
        row("rettshjelp.dekning", "Rettshjelp i Norden for privatkunder som personlig eier, rettmessig bruker eller fører av snøscooteren. Omfatter tvist etter salg og opphørt forsikring, og kjøp av nytt kjøretøy før ny forsikring når nåværende kjøretøy var forsikret i Frende. Samme tvist blir ikke flere ved flere spørsmål, søksmål eller parter. Voldgift og særdomstol omfattes når tvisten ellers kunne vært ført for alminnelige domstoler", 11, "14.1 (fortsatt side 12), jf. 2"),
        row("rettshjelp.grense", "100 000 kr per tvist; 250 000 kr samlet ved minst tre parter på samme side, også på tvers av forsikringer/selskaper. Begrenset til den økonomiske interessen i saken. Uforsikrede parter bærer sin andel og holdes utenfor erstatningsberegningen", 12, "14.4 (fortsatt side 13)"),
        row("rettshjelp.egenandel", "4 000 kr pluss 20 % av øvrige kostnader; én egenandel per tvist også ved flere parter på samme side", 13, "14.4"),
        row("rettshjelp.begrensning", "Rimelige og nødvendige utgifter til egen advokat, registrert rettshjelper, retten, godkjent advokatmekler og sakkyndige; ved rettsbehandling også vitner og rettsgebyr til forliksrådet/tingretten. Ikke ankegebyr, idømte eller avtalte saksomkostninger. Tilkjente omkostninger trekkes fra, med unntak ved dokumentert betalingsudyktig motpart. Unntatt tvist mellom sameiere, yrke/virksomhet, familie/arv/skifte, namsmyndigheter, ubestridt inkasso, gjeldsforhandling, konkurs-/akkordforhandling når du er konkurs- eller akkordskyldner, straffesak, krenkelser/bøter/gebyrer, ulovlig handling, forvaltningsvedtak før fullt utnyttet klageadgang og søksmål, og advokat-/sakkyndigsalær. Ikke utgifter før tvist eller grunnlag som oppstod før forsikringen", 12, "14.2–14.3"),
      ] : included(["rettshjelp"], 11, "14 (privatkunder)")),
      ...(type === "snoscooter" ? [row("ansvar.dekning", "Ansvar for person- og tingskade etter bilansvarslova. Også ulovfestet rettslig ansvar ved bruk av snøscooteren for skade konstatert i forsikringstiden: inntil 10 000 000 kr per skadetilfelle og samlet per år. Ansvar etter lov om vegfraktavtaler omfattes ikke", 11, "13.1")] : []),
      ...(name !== "Ansvar" ? type === "campingvogn" ? [
        row("brann.dekning", "Skade etter brann eller lynnedslag", 3, "4.1.1"),
        row("brann.begrensning", "Svimerker og skade på delen eller komponenten der brann eller kortslutning oppstod erstattes ikke; følgeskaden av brannen eller kortslutningen omfattes", 3, "4.2"),
        row("tyveri.dekning", "Tyveri av campingvognen og skade ved tyveri eller forsøk på tyveri etter straffeloven §321", 3, "4.1.2"),
        row("tyveri.begrensning", "Tyveri/underslag utført av husstandsmedlem eller ansatt omfattes ikke; heller ikke campingvogn som er lånt eller prøvd og ikke levert tilbake", 3, "4.2 a–b"),
      ] : type === "snoscooter" ? [
        row("brann.dekning", "Skade etter brann eller lynnedslag", 3, "4.1.1"),
        row("brann.begrensning", "Svimerker og skade på delen eller komponenten der brann eller kortslutning oppstod erstattes ikke; følgeskaden av brannen eller kortslutningen omfattes", 3, "4.2"),
        row("tyveri.dekning", "Tyveri av snøscooteren og skade ved tyveri eller forsøk på tyveri etter straffeloven §321", 3, "4.1.2"),
        row("tyveri.begrensning", "Tyveri utført av husstandsmedlem eller ansatt omfattes ikke; heller ikke snøscooter som er lånt eller prøvd og ikke levert tilbake", 3, "4.2 a–b"),
        row("brann.egenandel", "6 000 kr med mindre lavere egenandel står i kundens forsikringsbevis", 9, "11.11"),
        row("tyveri.egenandel", "6 000 kr med mindre lavere egenandel står i kundens forsikringsbevis; ingen egenandel hvis tyverialarmen fungerte på skadetidspunktet", 9, "11.11"),
      ] : included(["brann", "tyveri"], 3, "4") : []),
      ...(name === "Kasko" ? type === "campingvogn" ? [
        row("kasko.dekning", "Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt og hærverk; feilfylling av drivstoff der dette er relevant for det forsikrede objektet", 3, "6.1.1"),
        row("kasko.begrensning", "Motor, gir, drivverk og elektroniske styreenheter omfattes bare når årsaken er annen dekket skade. Unntatt frost, fukt, vann, råte, innvendige flekker, svimerker, søl, bruksslitasje, sprekker, gliper, utettheter/lekkasjer, rust/slitasje og underslag. Avvist fabrikant-/leverandør-/reparatøransvar kan omfattes med regress. Campingvognens særskilte fukt- og råteskadedekning i 6.1.2 holdes separat", 4, "6.2"),
      ] : type === "snoscooter" ? [
        row("kasko.dekning", "Plutselig og uforutsett skade etter sammenstøt, utforkjøring, velt og hærverk; feilfylling av drivstoff der dette er relevant for det forsikrede objektet", 3, "6.1.1"),
        row("kasko.begrensning", "Motor, gir, drivverk og elektroniske styreenheter omfattes bare når årsaken er annen dekket skade. Unntatt frost, fukt, vann, råte, innvendige flekker, svimerker, søl, bruksslitasje, rust/slitasje og underslag. Avvist fabrikant-/leverandør-/reparatøransvar kan omfattes når skaden ellers er dekket, med regress", 4, "6.2"),
      ] : included(["kasko"], 3, "6.1") : []),
      row("avtale.geografi", "Europa unntatt Russland, Tyrkia og Belarus; rettshjelp i Norden", 2, "2"),
      ...(name !== "Ansvar" ? [row("utstyr.grense", "20 000 kr fastmontert ekstrautstyr", 2, "3.7")] : []),
      ...(type === "campingvogn" ? [
        row("losore.dekning", "Tyveri av løse ting og bagasje fra campingvognen og tilkoblet fortelt av tre eller glassfiber, med inntil 20 000 kr", 3, "4.1.3"),
        row("losore.grense", "20 000 kr samlet eller avtalt sum; 10 000 kr per enkeltgjenstand. Produktsiden tilbyr utvidelse med inntil 100 000 eller 200 000 kr; høyere sum krever kundens dokumenterte valg i forsikringsbeviset", 1, "Dekningsmatrise Forsikringssum løsøre; FAQ innbo/løsøre", "frende-campingvognforsikring.html"),
        row("fortelt.dekning", "Fortelt, samt platting og terrasse knyttet til campingvognen", 2, "3.10–11"),
        ...(name === "Kasko" ? [
          ...included(["fukt"], 3, "6.1.2"),
          row("fukt.begrensning", "Godkjent fukttest må vise at skaden oppstod siste år; utbedring av lekkasjen og rørlekkasje er ikke omfattet. Årlig fukttest må være utført og godkjent av autorisert caravanforhandler. Ved anmerkninger eller påvist fukt må nødvendige tiltak gjennomføres for å hindre utvikling av fukt- og råteskade", 14, "18.1.11, jf. 6.1.2 side 3"),
          row("naturskade.dekning", "Naturskade på campingvogn og spikertelt/fortelt omfattes når Kasko er valgt", 1, "FAQ: Er campingvogn og spikertelt/fortelt dekket mot naturskader?", "frende-campingvognforsikring.html"),
        ] : []),
      ] : []),
      ...(type === "tilhenger" ? [row("kasko.begrensning", "Løse ting og bagasje på tilhenger er ikke omfattet", 2, "3.9")] : []),
    ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name !== "Kasko" ? ["kasko"] : []);
  }
}

// B-044: the matrix offers this option at every level; §12 requires the
// customer's certificate to select it. Keep its facts outside every base.
const frendeSnowAccident = "frende-snoscooter-ulykke";
vehicleObjectFacts[frendeSnowAccident] = facts("snoscooter", "frende-SnowmobileInsurance.pdf", [
  row("ulykke.dekning", "Fører- og passasjerulykke for fører, passasjerer og rettmessig bruker når snøscooteren brukes rettmessig. Tilvalg på Ansvar, Brann og tyveri og Kasko; valgt bare når dekningen står i kundens forsikringsbevis", 10, "12–12.1; dekningsmatrise på produktsiden"),
  row("ulykke.grense", "Dødsfall 100 000 kr hvis avdøde etterlater ektefelle, samboer eller barn, eller er under 21 år. 200 000 kr ved 100 % livsvarig medisinsk invaliditet; forholdsmessig ved delvis invaliditet, samlet høyst 100 % av summen per ulykkesskade", 10, "12.2–12.3 (fortsatt side 11)"),
]);
// The HTML matrix qualifies availability by product level; §12 remains the
// primary source for insured persons and the certificate-selection condition.
const frendeSnowAccidentMatrix = vehicleObjectSources["vehicle:frende-snoscooterforsikring.html"];
vehicleObjectFacts[frendeSnowAccident].find(({ key }) => key === "snoscooter.ulykke.dekning")!.qualificationSource = {
  documentId: frendeSnowAccidentMatrix.id, filename: frendeSnowAccidentMatrix.filename,
  url: frendeSnowAccidentMatrix.url, termsNumber: frendeSnowAccidentMatrix.termsNumber,
  effectiveFrom: frendeSnowAccidentMatrix.effectiveFrom, page: 1,
  section: "Dekningsmatrise: Fører- og passasjerulykke – Tilvalg på Ansvar, Brann og tyveri og Kasko",
  note: "Dokumenterer bare tilgjengelighet som tilvalg på de tre produktnivåene; kundens valg og ytelsesvilkår følger forsikringsbeviset og §12 i fullvilkårene. Dokumentdato ukjent.",
};
vehicleObjectAddOns.push({ id: frendeSnowAccident, name: "Fører- og passasjerulykke", componentId: frendeSnowAccident, providerId: "frende", insuranceTypes: ["Snøscooter"], requiresLevel: ["frende-snoscooter-ansvar", "frende-snoscooter-brann-og-tyveri", "frende-snoscooter-kasko"] });
for (const id of ["frende-snoscooter-ansvar", "frende-snoscooter-brann-og-tyveri", "frende-snoscooter-kasko"]) vehicleObjectCoverageMatrix[id]["snoscooter.ulykke.dekning"] = "optional";

// Storebrand explicitly includes snowmobiles in motor09. Do not inherit its
// passenger-car extensions. camp02's contradictory Super contents sum is omitted.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = type === "snoscooter" ? "storebrand-vilkar-motorvognforsikring.pdf" : "storebrand-vilkar-campingvogn-og-tilhenger.pdf";
  for (const name of (type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Brann og tyveri", "Kasko", "Super"] : ["Brann og tyveri", "Kasko"])) {
    const snow = type === "snoscooter";
    product("storebrand", "Storebrand", type, name, file, [
      ...included(["rettshjelp"], snow ? 30 : 12, "Rettshjelp"),
      ...(snow ? included(["ansvar"], 3, "1.1") : []),
      ...(snow && name !== "Ansvar" ? included(["ulykke"], 5, "Andre dekninger") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], snow ? 3 : 2, "Sammendrag av dekninger") : []),
      ...(["Kasko", "Super"].includes(name) ? included(["kasko"], snow ? 3 : 2, "Sammendrag av dekninger") : []),
      row("rettshjelp.grense", "100 000 kr per tvist", snow ? 32 : 14, "Rettshjelp – forsikringssum"),
      ...(!snow ? [
        row("brann.egenandel", "8 000 kr dersom annet ikke fremgår av forsikringsbeviset", 5, "6.1.1"),
        row("avtale.geografi", "EØS og Sveits; øvrige Grønt kort-land i Europa inntil 3 måneder, unntatt Tyrkia, Russland, Belarus og Kosovo", 3, "4"),
        ...included(["redning"], 2, "Sammendrag"),
      ] : []),
      ...(type === "campingvogn" ? [
        row("fortelt.begrensning", "Fortelt og bygningskonstruksjon som tilbygg må spesifiseres i forsikringsbeviset", 4, "5"),
        ...(name !== "Super" ? [row("losore.grense", "30 000 kr samlet; 5 000 kr per gjenstand", 4, "5")] : []),
        ...(name === "Super" ? [
          ...included(["fukt", "ferie", "nyverdi"], 7, "6.3"),
          row("nyverdi.alder", "Innen tre år etter registrering som fabrikkny på forsikringstakeren", 7, "6.3.1"),
          row("nyverdi.begrensning", "Tapt campingvogn eller reparasjon som overstiger listepris for tilsvarende ny campingvogn; krav om tilsvarende gjenkjøp/dokumentasjon", 7, "6.3.1"),
          row("fukt.alder", "Nyere enn 15 år fra produksjonsdato", 7, "6.3.2"),
          row("fukt.begrensning", "Fuktkontroll uten anmerkninger fra forhandler/verksted mindre enn ett år før skaden oppdages; ny årlig kontroll kreves. Frost og frost/snøtyngde som medvirkende årsak er unntatt", 7, "6.3.2, fortsetter side 8"),
          row("ferie.grense", "1 500 kr per dag i resterende planlagt ferie, inntil 15 dager", 8, "6.3.3"),
        ] : []),
      ] : []),
    ], ["Ansvar", "Delkasko", "Brann og tyveri"].includes(name) ? ["kasko"] : []);
  }
}

// If: MOT2-2 explicitly covers all three objects. S-709 is a trailer rider,
// not snowmobile terms despite the snowmobile page linking it as a særvilkår.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const file = "if-Vilkaar-4103ea25.pdf";
  const levels = type === "snoscooter" ? ["Ansvar", "Delkasko", "Kasko"] : type === "campingvogn" ? ["Delkasko", "Kasko", "Super"] : ["Delkasko", "Kasko"];
  for (const name of levels) {
    product("if", "If", type, name, file, [
      ...included(["rettshjelp"], 24, "12"),
      ...(type === "snoscooter" ? included(["ansvar", "ulykke"], 4, "4.1 og 11") : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], 4, "4.2–4.3") : []),
      ...(["Kasko", "Super"].includes(name) ? included(["kasko"], 6, "4.8") : []),
      ...(name !== "Ansvar" ? [row("brann.egenandel", "8 000 kr dersom annet ikke er avtalt i særvilkår/forsikringsbevis", 19, "8.5.3"), row("tyveri.egenandel", "8 000 kr dersom annet ikke er avtalt i særvilkår/forsikringsbevis", 19, "8.5.3")] : []),
      row("rettshjelp.egenandel", "4 000 kr + 20 % av det overskytende", 19, "8.5.2"),
      ...(type === "campingvogn" ? [
        ...included(["glass", "naturskade"], 5, "4.5–4.6"),
        row("glass.egenandel", "3 000 kr ved skifte; ingen egenandel ved reparasjon", 19, "8.5.4"),
        ...(name === "Super" ? [
          row("fukt.dekning", "Fukt/vannskader: lekkasje fra boenhetens røranlegg for ferskvann, avløp og varmesystem dekkes uten krav om fuktkontroll. Andre fuktskader krever godkjent og bestått fuktkontroll", 2, "3.3.1; andre fuktskader på side 3", "if-SV707.pdf"),
          row("fukt.alder", "Campingvognen må være nyere enn 15 år fra produksjonsår", 2, "3.3.1", "if-SV707.pdf"),
          row("fukt.begrensning", "Andre fuktskader dekkes i inntil 1 år etter godkjent og bestått kontroll hos autorisert caravanforhandler eller Viking kontroll; ny kontroll kreves for fortsatt dekning, som bortfaller når forsikringen opphører. Rapporten må vise alle måleresultater, skisse eller bilder av målepunkter og om kontrollen er godkjent. Frost og frost/snøtyngde som medvirkende skadeårsak er unntatt. Fabrikantens vedlikehold skal følges; frostvæske, avtapping og kontroll/etterfylling av væske ved vannbåren varme kreves", 3, "3.3.1", "if-SV707.pdf"),
          row("ferie.dekning", "Ved erstatningsmessig skade etter påbegynt ferietur erstattes dokumenterte utgifter til alternativ overnatting eller leiebil; sikrede må selv skaffe alternativet", 3, "3.3.2", "if-SV707.pdf"),
          row("ferie.grense", "Inntil 1 500 kr per dag i resterende planlagt ferie, inntil 15 dager; krav dokumenteres med faktura eller kvitteringer", 3, "3.3.2", "if-SV707.pdf"),
          row("losore.grense", "Totalt 100 000 kr samlet for tilleggsutstyr og bagasje i campingvognen", 3, "3.3.3", "if-SV707.pdf"),
          row("skadedyr.dekning", "Uforutsett skade forårsaket av insekter og gnagere på campingvognen", 3, "3.3.4", "if-SV707.pdf"),
          row("skadedyr.begrensning", "Tilleggsutstyr og bagasje dekkes bare når det skades samtidig som campingvognen. Dører, vinduer og luker skal være lukket når campingvognen er lagret", 3, "3.3.4", "if-SV707.pdf"),
          row("nyverdi.dekning", "Helt ny campingvogn ved totalskade når campingvognen er inntil tre år gammel", 1, "Dekningstabell – Ekstra erstatning ved store skader (Super)", "if-campingvognforsikring.html"),
          row("nyverdi.alder", "Campingvognen er inntil tre år gammel", 1, "Dekningstabell – Ekstra erstatning ved store skader (Super)", "if-campingvognforsikring.html"),
        ] : []),
      ] : []),
      ...(type === "tilhenger" ? [row("avtale.forsikringssum", "Gjenanskaffelsesverdi av angitt tilhenger med fastmontert utstyr", 1, "1", "if-Vilkaar-b7d19ed7.pdf")] : []),
    ], name === "Ansvar" ? ["brann", "tyveri", "kasko"] : name === "Delkasko" ? ["kasko"] : []);
  }
}

// Eika channel ONLY. No inference that SpareBank 1 or DNB sell these same
// rules; no historical M10/M10P data mixed with the current linked PMO terms.
for (const type of ["snoscooter", "campingvogn", "tilhenger"] as const) {
  const snow = type === "snoscooter";
  const file = snow ? "fremtind-Vilkar_Kasko_Snoscooter.pdf" : "fremtind-Vilkar_Kasko_Campingvogn_og_Tilhenger.pdf";
  for (const name of [...(snow ? ["Ansvar"] : []), ...(type !== "tilhenger" ? ["Minikasko"] : []), "Kasko"]) {
    product("eika-fremtind", "Eika / Fremtind", type, name, file, [
      ...(snow ? [
        ...included(["ansvar", "ulykke"], 1, "Ansvar", "fremtind-IPID_Snoscooter.pdf"),
        row("rettshjelp.dekning", "Rimelige og nødvendige rettshjelpsutgifter ved tvist som personlig eier eller rettmessig bruker/fører av forsikret snøscooter i Norden; omfatter også tidligere eier/rettighetshaver etter salg når forsikringen opphørte ved salget", 8, "Rettshjelp 1–4.1"),
        row("rettshjelp.grense", "Inntil sikredes økonomiske interesse, maksimalt 100 000 kr per tvist; kan utvides til 250 000 kr ved minst tre parter på sikredes side (ektefeller/samboere regnes som én part). Finansklagenemnda: inntil 15 000 kr; forliksråd/jordskifterett: inntil 25 000 kr. Sakkyndige som ikke er oppnevnt av retten: inntil 20 % av forsikringssummen", 9, "Rettshjelp 4.2 og 5.1; sakkyndige i 4.1 side 8"),
        row("rettshjelp.egenandel", "Egenandel fremgår av forsikringsbeviset; i tillegg 20 % av utgifter til advokat og sakkyndig bistand. Én egenandel per tvist selv om flere parter er på samme side", 10, "Rettshjelp 5.2"),
        ...(name !== "Ansvar" ? [
          row("utstyr.dekning", "Snøscooteren i seriemessig utførelse med ekstra dekk og felger tilsvarende seriemessig antall hjul; fastmontert tilleggsutstyr, brannslokningsapparat, førstehjelpsutstyr og kjøreutstyr for snøscooter omfattes", 4, "Minikasko 1.1–1.2"),
          row("utstyr.grense", "Fastmontert tilleggsutstyr: inntil 10 000 kr; egen sum for kjøreutstyr er ikke oppgitt i vilkåret", 4, "Minikasko 1.2"),
        ] : []),
        ...(name === "Kasko" ? [row("kasko.egenandel", "Egenandel fremgår av forsikringsbeviset; økes med 12 000 kr når fører er under 23 år ved skaden og bruk av fører under 23 år ikke er opplyst", 7, "Kasko 3.1")] : []),
      ] : []),
      ...(name !== "Ansvar" ? included(["brann", "tyveri"], snow ? 4 : 1, "Minikaskoforsikring") : []),
      ...(name === "Kasko" ? included(["kasko"], snow ? 7 : 4, "Kaskoforsikring") : []),
      row("avtale.geografi", snow ? "Norden; lovpliktig ansvar gjelder også hele EØS" : "Europa, Tyrkia og Israel", 1, "2"),
      row("avtale.egenandel", "Avtalt egenandel fremgår av forsikringsbeviset eller vilkåret", 1, "4"),
      ...(snow ? [row("avtale.sesong", "Sesongvariert pris ved opphør/lagring; kasko/minikasko omgjøres til lagring ved midlertidig avregistrering", 1, "5 og prisberegning")] : type === "tilhenger" ? [
        row("redning.dekning", "Nødvendig transport av tilhenger til nærmeste verksted etter erstatningsmessig skade og/eller driftsstans på normalt fremkommelig vei eller sted uten adkomstrestriksjoner", 2, "Minikasko 2.4"),
        row("redning.begrensning", "Reparasjon på stedet skal velges når den er billigere enn redning; transport gjelder bare hendelser som forsikringen omfatter, ikke ordinær service eller vedlikehold", 2, "Minikasko 2.4"),
        row("redning.egenandel", "500 kr", 4, "Minikasko 4.3"),
      ] : []),
      ...(type === "campingvogn" ? [
        row("glass.dekning", "Bruddskade på vindusruter, inkludert takluke; erstatning gis bare når nye ruter innsettes eller skaden repareres", 2, "Minikasko 2.3"),
        row("glass.grense", "Reparasjon erstattes med inntil 600 kr; ved skifte av ruter erstattes inntil 50 % av campingvognens markedsverdi", 3, "Minikasko 3.5.1; reparasjon i 2.3 side 2 og 4.2 side 4"),
        row("glass.egenandel", "Ingen egenandel ved reparasjon (erstatning inntil 600 kr); 2 500 kr ved skifte", 4, "Minikasko 4.2"),
        row("redning.dekning", "Nødvendig transport til nærmeste verksted etter erstatningsmessig skade og/eller driftsstans på normalt fremkommelig vei eller sted uten adkomstrestriksjoner", 2, "Minikasko 2.4"),
        row("redning.begrensning", "Reparasjon på stedet skal velges når den er billigere enn redning; transport/flytting ved service, vedlikehold eller andre hendelser enn forsikringen omfatter dekkes ikke", 2, "Minikasko 2.4"),
        row("redning.egenandel", "500 kr", 4, "Minikasko 4.3"),
        row("losore.grense", "10 000 kr per gjenstand; samlet sum fremgår av forsikringsbeviset", 1, "1.2"),
        row("tyveri.begrensning", "Tyveri fra fortelt er unntatt", 2, "2.2"),
        row("fortelt.begrensning", "Fortelt/tilbygg må inngå i avtalt forsikringssum", 2, "3.1"),
        ...(name === "Kasko" ? [
          row("fukt.dekning", "Skader som følge av fukt i tak, vegger og gulv etter godkjent og bestått fuktkontroll hos autorisert caravanforhandler", 5, "Kasko 1.3"),
          row("fukt.alder", "Skader etter 15 år etter registrering som fabrikkny dekkes ikke", 5, "Kasko 1.3"),
          row("fukt.begrensning", "Dekningen gjelder i inntil 1 år etter godkjent og bestått fuktkontroll; ny kontroll kreves for fortsatt dekning. Skader utenfor forsikringsperioden dekkes ikke", 5, "Kasko 1.3"),
        ] : []),
      ] : []),
    ], name !== "Kasko" ? ["kasko"] : []);
  }
}

// Only explicitly documented level relationships. Repeated rows retain the
// exact child document as evidence; the established replacesBase rule selects
// one effective value. Conflicting Storebrand Super contents are deliberately
// not inherited from Kasko.
const documentedParents: readonly [string, string][] = [
  ["tryg-snoscooter-brann-og-tyveri", "tryg-snoscooter-ansvar"],
  ["tryg-snoscooter-kasko", "tryg-snoscooter-brann-og-tyveri"],
  ["tryg-campingvogn-campingvogn-ekstra", "tryg-campingvogn-kasko"],
  ["if-snoscooter-delkasko", "if-snoscooter-ansvar"],
  ["if-snoscooter-kasko", "if-snoscooter-delkasko"],
  ["if-campingvogn-kasko", "if-campingvogn-delkasko"],
  ["if-campingvogn-super", "if-campingvogn-kasko"],
  ["if-tilhenger-kasko", "if-tilhenger-delkasko"],
  ["eika-fremtind-snoscooter-minikasko", "eika-fremtind-snoscooter-ansvar"],
  ["eika-fremtind-snoscooter-kasko", "eika-fremtind-snoscooter-minikasko"],
  ["eika-fremtind-campingvogn-kasko", "eika-fremtind-campingvogn-minikasko"],
];
for (const [childId, parentId] of documentedParents) {
  const child = vehicleObjectProducts.find((entry) => entry.productId === childId)!;
  const parent = vehicleObjectProducts.find((entry) => entry.productId === parentId)!;
  if (child.providerId !== parent.providerId || child.insuranceType !== parent.insuranceType || child.version !== parent.version) throw new Error("Invalid documented vehicle inheritance");
  child.inheritsProductId = parentId;
  const parentKeys = new Set(vehicleObjectFacts[parentId].map(({ key }) => key));
  vehicleObjectFacts[childId] = vehicleObjectFacts[childId].map((fact) => parentKeys.has(fact.key) ? { ...fact, replacesBase: true } : fact);
}
