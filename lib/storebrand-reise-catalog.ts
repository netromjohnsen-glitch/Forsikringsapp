import type { CatalogFact, CatalogProduct } from "./product-catalog.ts";
import { storebrandReiseSources } from "./storebrand-reise-sources.ts";
export { storebrandReiseSources } from "./storebrand-reise-sources.ts";
type Row=[string,string,string,string,number,CatalogFact["deductibleClassification"]?,boolean?];
function facts(sourceId:string, rows:Row[]):CatalogFact[]{const s=storebrandReiseSources[sourceId];return rows.map(([key,label,value,section,page,deductibleClassification,replacesBase])=>({key:`reise.${key}`,label,value,...(deductibleClassification?{deductibleClassification}:{}),...(replacesBase?{replacesBase:true}:{}),source:{documentId:s.id,section,page,filename:s.filename,termsNumber:s.termsNumber,effectiveFrom:s.effectiveFrom,company:s.company,url:s.url,productCode:s.productCode,version:s.version,note:"Forsikringsbeviset går foran og angir nivå, sikrede, reisedager, summer, egenandeler og særvilkår."}}));}

const common=facts("storebrandReiseTerms",[
 ["avtale.forbehold","Forsikringsbevisets forrang","Forsikringsbeviset avgjør Standard/Super, enkeltperson/familie, sikrede, antall reisedager, summer, egenandeler og særvilkår.","A og B.1",2],
 ["personer.omfang","Enkeltperson eller familie","Familie omfatter ektefelle/samboer og barn under 21 år med samme folkeregistrerte adresse. Super omfatter også barnebarn/oldebarn under 21 år på reise med forsikringstaker når de ikke har annen reiseforsikring.","B.1 og C.1.1",4],
 ["omrade.verden","Geografisk område","Reiser i hele verden fra du forlater hjemmet, men ikke hjemme, på arbeidssted eller undervisningssted. Dagstur er omfattet. Ansvar og rettshjelp gjelder bare utenfor Norden.","B.1",4],
 ["varighet.valg","Avtalt reisevarighet","IPID dokumenterer valgene 45 (bare Standard), 75, 90 eller 120 dager per reise. Forsikringsbeviset er autoritativt.","IPID",1],
 ["medisinsk.behandling","Reisesyke – medisinske utgifter","Nødvendig behandling ved uventet akutt sykdom/personskade uten generell øvre sum. Fortløpende behandling av samme sykdom/personskade er begrenset til 30 døgn etter første legebesøk.","B.5.1",14],
 ["medisinsk.tann","Tannbehandling","Tannskade etter personskade inntil 5 000 kr; akutt tannsykdom eller tannskade ved spising inntil 1 000 kr per skadetilfelle.","B.5.1 punkt 2",15],
 ["hjemtransport","Hjemtransport","Forhåndsgodkjent syketransport til behandlingssted eller hjemsted uten generell øvre sum. Kiste/urne dekkes; begravelse på stedet inntil 40 000 kr.","B.5.1 punkt 4",15],
 ["hjemkallelse","Hjemkallelse","Nødvendige reise-/oppholdsutgifter ved alvorlig sykdom, personskade eller dødsfall i nærmeste familie i EØS, eller alvorlig brann, innbrudd, natur- eller vannskade i bolig/virksomhet. Én hjemreise, uten generell øvre sum.","B.5.1 punkt 5",15],
 ["sykeledsagelse","Sykeledsagelse og tilkallelse","Nødvendige reise- og oppholdsutgifter uten generell øvre sum for inntil to personer; tilkallelse krever forhåndsgodkjenning.","B.5.1 punkt 6–7",16],
 ["medisinsk.kjent","Kjent sykdom","Forverring av kjent sykdom under behandling før avreise regnes ikke som uventet akutt. Planlagt undersøkelse/behandling og behandlingsreise er unntatt; medisinsk rådgivning tilbys før reisen.","B.5.1–B.5.2",14],
 ["evakuering","Evakuering","Nødvendige merutgifter til hjemreise og overnatting etter UD-råd ved krig, terror, alvorlig uro, pandemi/epidemi eller naturkatastrofe, uten generell øvre sum.","B.7",22],
 ["ansvar.dekning","Privatansvar","Rettslig ansvar for person-, ting- eller elektronisk informasjonsskade utenfor Norden.","D",28],
 ["rettshjelp.dekning","Rettshjelp","Juridisk bistand ved privat tvist på reise utenfor Norden.","E",30],
 ["rettshjelp.sum","Rettshjelp – sum","100 000 kr per tvist.","E.1",30],
 ["rettshjelp.egenandel","Rettshjelp – egenandel","4 000 kr pluss 20 % av resterende erstatningsbeløp.","E.1.2",31,"standard"],
 ["sikkerhet.reisegods","Sikkerhetsforskrifter","Tilsyn, forsvarlig oppbevaring, låsing, emballering og innsjekking; verdigjenstander skal ikke sendes i innsjekket bagasje. Brudd kan redusere erstatningen.","B.4",11],
 ["aktivitet.unntak","Sport og aktivitet","Ulykkesdelen har særskilte begrensninger for yrke med forhøyet risiko, motorsport, luftfart og andre dokumenterte risikoforhold. Ekspedisjon og søk/redning er ikke omfattet.","B.6.3",20],
 ["omrade.ud","UD, krig og terror","Reise til område med UD-advarsel er unntatt etter vilkåret. Avbestilling før avreise og evakuering under reisen behandles separat.","B.2 og B.7",6],
]);
const standard=facts("storebrandReiseTerms",[
 ["varighet.maks","Maksimal standard reisevarighet","45 dager per reise; avtalt antall dager i forsikringsbeviset styrer.","A sammendrag",2],
 ["bagasje.dekning","Reisegods","Tyveri, ran, hærverk, brann, vann, naturskade, trafikkskade og transportørbekreftet tap/skade etter vilkåret.","B.4",10],
 ["bagasje.total","Reisegods – samlet sum","50 000 kr enkeltperson og 100 000 kr familie per hendelse.","B.4",10],
 ["bagasje.per_gjenstand","Enkeltgjenstand/verdigjenstand","15 000 kr per enkeltgjenstand/verdigjenstand.","B.4",10],
 ["bagasje.verdisaker","Verdisaker samlet","15 000 kr enkeltperson og 30 000 kr familie.","B.4",10],
 ["bagasje.pass_billetter","Pass/reisedokumenter","5 000 kr per person.","B.4",10],
 ["bagasje.nokler","Nøkler","3 000 kr.","B.4",10],
 ["bagasje.kontanter","Kontanter","3 000 kr per person.","B.4",10],
 ["bagasje.mobil","Mobiltelefon/nettbrett","4 000 kr per gjenstand.","B.4",10],
 ["bagasje.sykkel","Sykkel","10 000 kr per gjenstand.","B.4",10],
 ["bagasje.egenandel","Reisegods – egenandel","1 000 kr.","B.4.1",11,"standard"],
 ["bagasje.uhell","Uhell på reisegods","Ikke omfattet i Standard.","C.1.2",26],
 ["reiseavbrudd","Reiseavbrudd","Kompensasjon ved dokumenterte tapte reisedager: inntil 20 000 kr enkeltperson og 50 000 kr familie per skadetilfelle.","B.5",14],
 ["avbestilling.dekning","Avbestilling","Dokumenterte ikke-refunderbare kostnader ved vilkårsbestemte hendelser.","B.2",6],
 ["avbestilling.sum","Avbestilling – sum","50 000 kr enkeltperson og 100 000 kr familie per hendelse.","B.2.1",6],
 ["avbestilling.aktivitet","Forhåndsbetalt utflukt/arrangement","Inntil 1 000 kr per person når aktiviteten er del av reisen.","B.2.1",6],
 ["forsinkelse.rute","Forsinket fremmøte/avgang","Overnatting inntil 3 000 kr per person og videretransport inntil 20 000 kr per person ved dokumenterte årsaker.","B.3",8],
 ["bagasje.forsinket","Forsinket bagasje","Nødvendige innkjøp på utreise inntil 3 000 kr per person; utilgjengelig bagasje ved flytransitt med overnatting 500 kr per person.","B.3.2",9],
 ["ulykke.dekning","Integrert ulykkesforsikring","Dødsfall, varig medisinsk invaliditet og behandlingsutgifter når ulykkesforsikring fremgår av forsikringsbeviset; gjelder til fylte 80 år.","B.6",19],
 ["ulykke.invaliditet","Ulykke – medisinsk invaliditet","Barn 500 000 kr; voksen 300 000 kr.","B.6",19],
 ["ulykke.dodsfall","Ulykke – dødsfall","Barn 100 000 kr; voksen 150 000 kr.","B.6",19],
 ["ulykke.behandling","Ulykke – behandlingsutgifter","Vanlige og nødvendige utgifter i Norge de første to årene, inntil 5 % av invaliditetssummen.","B.6.2",19],
 ["ansvar.sum","Privatansvar – sum","7 000 000 kr per skadetilfelle.","D",28],
 ["leiebil.egenandel","Egenandel leid kjøretøy","Ikke omfattet i Standard.","C.1.2",25],
]);
const superFacts=facts("storebrandReiseTerms",[
 ["varighet.maks","Maksimal standard reisevarighet","Produktsiden oppgir 75 dager; reise10 viser «se forsikringsbevis», som er autoritativt for avtalt 75/90/120 dager.","A sammendrag og produktside",2,undefined,true],
 ["bagasje.total","Reisegods – samlet sum","Ingen generell samlet øvre sum; kategori- og gjenstandsgrenser gjelder.","B.4",10,undefined,true],
 ["bagasje.per_gjenstand","Enkeltgjenstand/verdigjenstand","40 000 kr per enkeltgjenstand/verdigjenstand.","B.4",10,undefined,true],
 ["bagasje.verdisaker","Verdisaker samlet","150 000 kr enkeltperson og 300 000 kr familie.","B.4",10,undefined,true],
 ["bagasje.pass_billetter","Pass/reisedokumenter","10 000 kr per person.","B.4",10,undefined,true],
 ["bagasje.nokler","Nøkler","5 000 kr.","B.4",10,undefined,true],
 ["bagasje.kontanter","Kontanter","10 000 kr per person.","B.4",10,undefined,true],
 ["bagasje.mobil","Mobiltelefon/nettbrett","40 000 kr per gjenstand.","B.4",10,undefined,true],
 ["bagasje.sykkel","Sykkel","40 000 kr per gjenstand.","B.4",10,undefined,true],
 ["bagasje.egenandel","Reisegods – egenandel","Ingen egenandel.","B.4.1",11,"override",true],
 ["bagasje.uhell","Uhell på reisegods","Plutselig og uforutsett fysisk skade med kjent ytre årsak/tidspunkt, inntil 5 000 kr per skadetilfelle. Mistet/bortkommet er ikke fysisk skade.","C.1.2 punkt 3",26,undefined,true],
 ["bagasje.uhell_sum","Uhell – sum","5 000 kr per skadetilfelle.","C.1.2",26],
 ["bagasje.mobil_egenandel.gjentatt","Uhell mobil/nettbrett – gjentatt skade","Fra andre skade innen to kalenderår: 2 000 kr egenandel.","C.1.2",26,"override"],
 ["reiseavbrudd","Reiseavbrudd","Inntil reisens dokumenterte pris.","B.5",14,undefined,true],
 ["avbestilling.sum","Avbestilling – sum","Ingen generell øvre sum; dokumenterte ikke-refunderbare kostnader og vilkåret styrer.","B.2.1",6,undefined,true],
 ["avbestilling.aktivitet","Forhåndsbetalt utflukt/arrangement","Inkludert når aktiviteten er del av reisen, innen avbestillingsrammen.","B.2.1",6,undefined,true],
 ["forsinkelse.rute","Forsinket fremmøte/avgang","Ingen generell øvre sum for dokumentert nødvendig overnatting og videretransport.","B.3",8,undefined,true],
 ["bagasje.forsinket","Forsinket bagasje","Inntil 6 000 kr per person; transitt med overnatting 500 kr per person.","B.3.2",9,undefined,true],
 ["leiebil.egenandel","Egenandel leid kjøretøy","Ubegrenset dokumentert egenandel ved skade/tyveri på leid bil eller motorsykkel og nøkkel på feriereise med minst én overnatting og kaskoforsikring.","C.1.2 punkt 1",25,undefined,true],
 ["forsinkelse.hotell_arrangement","Tapt hotell og arrangement","5 000 kr per person ved kvalifiserende forsinkelse.","C.1.2 punkt 5",27],
 ["forsinkelse.leiebilavtale","Tapt leiebilavtale","10 000 kr per hendelse.","C.1.2 punkt 5",27],
 ["ulykke.invaliditet","Ulykke – medisinsk invaliditet","Barn 800 000 kr; voksen 600 000 kr.","B.6",19,undefined,true],
 ["ulykke.dodsfall","Ulykke – dødsfall","Barn 150 000 kr; voksen 500 000 kr.","B.6",19,undefined,true],
 ["ansvar.sum","Privatansvar – sum","15 000 000 kr per skadetilfelle.","D",28,undefined,true],
]);
const services=facts("storebrandReiseProductPage",[
 ["tjeneste.alarm","Falck Global Assistance","Døgnåpen alarmsentral med medisinsk assistanse og internasjonalt nettverk av leger, klinikker og sykehus.","Sykdom/ulykke",1],
 ["tjeneste.legehjelp","Kry digital helsehjelp","Døgnåpen telefonrådgivning med sykepleier og videokonsultasjon med lege på utenlandsreise. Tjeneste, ikke forsikringssum.","Digital helsehjelp",1],
 ["tjeneste.lounge","SmartDelay+","Fly registreres senest 24 timer før avgang. Ved minst én times forsinkelse får sikrede og inntil fire medreisende lounge eller 40 euro per person. Tjeneste utenfor vilkårene.","Lounge",1],
]);
export const storebrandReiseFacts:Record<string,CatalogFact[]>={storebrandReiseCommon:common,storebrandReiseStandard:standard,storebrandReiseSuper:superFacts,storebrandReiseServices:services};
export const storebrandReiseProducts:CatalogProduct[]=[
 {company:"Storebrand",insuranceType:"Reise",name:"Standard",providerId:"storebrand",productId:"storebrand-reise-standard",version:"2026-09-20-canonical",sourceId:"storebrandReiseTerms",componentIds:["storebrandReiseCommon","storebrandReiseStandard","storebrandReiseServices"]},
 {company:"Storebrand",insuranceType:"Reise",name:"Super",providerId:"storebrand",productId:"storebrand-reise-super",version:"2026-09-20-canonical",sourceId:"storebrandReiseTerms",componentIds:["storebrandReiseSuper"],inheritsProductId:"storebrand-reise-standard"},
];
export const storebrandReiseAddOns=[];
