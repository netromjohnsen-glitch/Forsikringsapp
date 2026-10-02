from continue_audit import *
rows='''Avtale|prioritet|Beviset går foran; valgt person/familie/Standard/Super og varighet.|1,4|Innledning/B.1|both|CUSTOMER_SPECIFIC
Varighet|standard/valg|Standard45; Super75 fra produktside, beviset avgjør; IPID valgbare75/90/120 og45kunStandard; ikke endre etter avreise.|2,4|A/B.1+HTML+IPID1|both|P1
Varighet|hendelsesutvidelse|Opptil2ekstradager ved uventet forlengelse; kjøpt mens påreise gjelderikke denreisen. IPID unntar direkteselskapsflytting, B1 nevnerikkeunntaket.|4|B.1|both|REVIEW
Personkrets|familie|Norskfolketrygd,folkeregistrertNorge,retur;ektefellesammeadresse,barn21medforelderadresse,foster/adopsjon/surrogat har særkrav.|4|B.1.1|both|P1
Geografi|hverdagsreise|Heleverdenfrautavtomttilretur;ikkehjem/skole/jobb/militærtjeneste(permisjon/reisedeKKES);reisesykeikkehjemstedskommune.|4,5|B.1.2–3|both|P1
Geografi|risikoreiser|Ikkeekspedisjon/utilgjengeligområde/fjell5000m,UDadvarselvedreise ugyldighele selvopphevet,liv/helsekrigsrisiko;eiendelerpåstedenehellerikke.|5|B.1.3|both|P1
Sykkeltyveri|lokalområde|Tyverisykkel/småel/sykkeltilhenger ikkehjem/arbeid/undervisningskommune.|5|B.1.3.6|both|P1
Generelleunntak|tap|Streik/lockout/konkurs og taptarbeidsfortjeneste ikkeomfattet.|5|B.1.4–5|both|P1
Avbestilling|ventetid|Kjøptførreise,legeføravbestilling,aktiv14d;direkteflyttinggyldigvedkjøpunntattventetid;ikkepåbegynt.|5|B.2|both|P1
Avbestilling|sum|Standard50kperson/100kfamilie;Superubegrenset;kunegenandelavreiseogikkerefunderbart.|6|B.2.1|both|P1
Avbestilling|arrangement|Standard1000/person,Superinkludert;delavreiseovernatting+transport,ikkelokaleenkeltarrangement.|6|B.2.1|both|P1
Avbestilling|sykdomspersonkrets|Akuttsykdom/ulykke/død deg/nærfamilie/enestereiseledsager/hansfamilie/vert/enavmaks6somkjøptsammen.|6|B.2.1.1|both|P1
Avbestilling|andreutløsere|Bolig/kontorbranninnbruddnaturvann;nøkkelperson14d;nyUDadvarsel72t;flyttetbehandling/meddommervitneinnkalling14d;naturkatastrofevurdering;samlivsbruddfellesferie.|6,7|B.2.1.2–8|both|P1
Avbestilling|utgiftsunntak|Ikkeavgift/bonus/voucher/videresalg/timeshare/årsleie/arrangørkansellering/refunderbart/spandertandre/sesongkort/jobbreiseutenbevis/skolekurs.|7,8|B.2.2/B.2.4|both|P1
Avbestilling|årsaksunntak|Forventetkroniskforverring,planlagt/ventetbehandling,lengreopphold,gravid36+0,frykt/bortfalthensikt/flyskrekk/karantene;avbestillstraks.|7,34|B.2.2–3/F.1.2|both|P1
Forsinkelse|mistettransport|Minst1.5t;Standardhotell3000/person,transport20000/person;Superubegrenset;egenbil3.50/km.|8,9|B.3.1.1|both|P1
Forsinkelse|avgang|OvernattingStandard3000/person,nytransport1500/personførstnårtransportørikkekaninnhente24t;Superubegrenset.|8,9|B.3.1.2|both|P1
Forsinkelse|vilkår/unntak|Vær/teknisk/trafikkuhell,privatbilbergingskrav;forhåndsavtaleover7000;ikkeoffshore/bemanning/EUplikt/bonus/mat/drikke/streik/konkurs.|9,10|B.3.1|both|P1
Bagasjeforsinkelse|sum/utløser|Klær/toalettpåutreise medPIR;Standard3000/person,Super6000/person;ikkehjemreise,ingenminstetimetidoppgitt.|8,10|B.3.2|both|P1
Utilgjengeligbagasje|overnatting|500/person vedflyforsinkelsemedtransittovernatting,klær/toalett/PIR.|8,10|B.3.3|both|P1
Reisegods|omfang|Egetpersonligreisegods,leidmedskriftligansvar,innsjekketsammetransport.|10|B.4.1|both|P1
Reisegods|summer|Standard50k/100kfamilie,Superubegrenset;verdisaker15k/30k versus150k/300k;enkelt15k/40kinkltilbehør.|10,12|B.4.1/B.4.3|both|P1
Reisegods|særgrenser|Pass5000/10000perperson,nøkler3000/5000,kontant3000/10000perperson,mobil4000/40000,sykkel10000/40000.|10,11|B.4.1|both|P1
Reisegods|årsaker|Tyveri/ran/hærverk/trafikk/brann/vann/natur/innsjekketPIR/klippetklær;passIDgjenanskaffelse+innhenting;ikketapgjorttiltyveri.|11|B.4.1|both|P1
Reisegods|skadeunntak|Bruk/slitasje/egensvikt/familie/innsjekketemballasje/lekkasje/bedrageri/brukavluftvannsportdrone/kosmetikk/kjæledyr/mistet.|11|B.4.2|both|P1
Reisegods|gjenstandsunntak|Yrke/skole,registrertkjøretøytilbehør/kjøreutstyribruk/basehopp/flyttegods/verktøy/papir/samling/mat/dyr/leidutenansvar/nylås/udeklarert;småeleldeKKES.|12,34|B.4.2/F.1.2|both|P1
Reisegods|sikkerhet|Tilsyn/lås/safe;verdifulltikkeibil,fellesrom;ikkeubevoktetkjøretøy/telt00–06;ikkeverdierinnsjekket;sykkellås/fjernutstyr;kanoemballasjevanntettflytende.|12,13|B.4.4|both|P1
Reisegods|aldersfradrag|Klær1år10%,elektronikk1år20%,sykkel3år10%,maks80%;andrelevetid80%;eksempel2årsklær20%fraalderikkebareoverskytende.|13,14|B.4.5|both|P1
Reisegods|oppgjør|Brukt/arv/antikvitetbruktverdi;kontanttakreellkostnad,kvitteringkanvesentligavgjørerett;politi/PIRstraks.|13,14|B.4.5|both|P2
Reisegods|egenandel|Standard1000;Super0.|11|B.4.1|both|P1
Reisesyke|sum/tid|Ubegrensetakuttnødvendigbehandling;sammesykdom30døgnfralege,kanfravikesomuforsvarlighjemreise,innenavtaltreisetid.|14,15,18|B.5.1/B.5.3|both|P1
Tannreise|summer|Personskadetann5000,akuttsykdom/spising1000perhendelse.|15|B.5.1.2|both|P1
Reisesyke|reiseutsettelse|Legebeordretreise/oppholdellerakuttfamiliehendelsepåreisemål;bil3.50/km.|15,19|B.5.1.3/B.5.3|both|P1
Hjemtransport|vilkår|Forhåndsavtaltmedisinsktransport;returinn14detterbehandlingoginnenplanlagtreise;dødtransportellerbegravelse40000.|15|B.5.1.4|both|P1
Hjemkallelse|vilkår|NærfamilieEØS alvorligakutt/dødellerbolig/kontorbranninnbruddnaturvannNorge;énreise,hjemstedspristak;retur14d.|15|B.5.1.5|both|P1
Tilkallelse|krets/utløser|Inntil2EØSnærfamilieforhåndsavtalt;ikkehjemtransportstrakselleralleredeNorgesykehus.|16|B.5.1.6|both|P1
Ledsagelse|omfang|Lege/sykepleier/nærståendetilreiseoppholdmedisinskbehov,forhåndsavtalt.|16|B.5.1.7|both|P1
Enestereiseledsager|sum|Reise/oppholdvedledsagerssykdomdødhjemreise60000.|16|B.5.1.8|both|P1
Reiseavbrudd|sum/vilkår|Standard20kperson/50kfamilie,Superreisenspris;2000/persondøgn;sykehus/skriftliglokallegesengeleie/hjemtransport;bil3.50/km;bonusskoleårskost/refusjonunntatt.|14,16|B.5.1.9|both|P1
Utflukt|sykdom|Ubenyttetforhåndsbetaltarrangement6000perhendelsevedsykehus/hjemreise/legeforbud.|17|B.5.1.10|both|P1
Telefon|assistanse|Nødvendigetelefonutgiftertilassistanse1000.|17|B.5.1.11|both|P2
Krisehjelp|timer/tid|20timerperårmaks2år,akutthendelseikkegradvis,oppstartinnen12mndforhåndsavtalt,énforsikring.|17|B.5.1.12|both|P1
Rådgivning|førreise|Falckmedisinskførreisekjentlidelse,informasjonstjeneste.|17|B.5.1.13|both|P2
Reisesyke|utgiftsunntak|Etterhjemkomst,søkredning,kuropphold,kjentsykdom/planlagtbehandling,rus,nektehjemreise/kanvente,kosmetikk/bonus/smittetiltak/privatflyutenlege/mat.|17,18|B.5.2|both|P1
Reisesyke|aktivitetsunntak|Kampsport/basehangpara/mikrofly,privatklinikkNorden,gravid36+0,sluttstadie,feilbehandling,dykk40m,motorkonkurranse,lagserieunntattbedrift,inntekt/sponsorover1G.|18,34|B.5.2/F.1.2|both|P1
Reisesyke|godkjenning|Transportevakueringledsager/tilkallelseforhånd;sykehuseller7000utgiftervarsle.|18|B.5.3|both|P1
Ulykke|gyldighet|Heledøgnetborthjemme,dersombevisinkluderer,opphør80år;fysiskytrehendelseikkebarepsykisk.|19|B.6.1|both|P1
Ulykke|summer|Standardbarninvalid500k/død100k,voksen300k/150k;Superbarn800k/150k,voksen600k/500k.|19|B.6|both|P1
Ulykke|behandling|5%invalidsum,Norgeførste2år;barntann<18sluttbehandlingmaks10årforhåndsavtalt,ikkeannenrefusjon.|19,20|B.6.2|both|P1
Ulykke|unntak|Høyrisikoyrker,psykisk/sykdom/forgiftning/behandling,arrunder15%,risikosport/kriminalitet/søkredning;ikketyggtann/privatklinikkutenvref/hjelpemiddel/transportfraåsted/tanninvaliditet.|20,21|B.6.3–4|both|P1
Ulykke|oppgjør|Medvirkendesykdomfradrag,medisinskinvaliditetikkearbeidsuførhet,tidligerefunksjonfradrag;dødinnen2årminusinvalidforskudd;begunstigelse.|22|B.6.5|both|P1
Evakuering|omfang|Ubegrensetmyndighetsoppfordringkrig/terror/pandemi/naturutlandet,forhåndsavtalt,fredeligvedankomst;umuligreiseutmax30dmerutgifter.|22,23|B.7|both|P1
Evakuering|avbrudd/unntak|Reisenspris2000døgn/person,bonus/skole/årskostunntatt;ikkevarsletrisikoellerrefunderbart.|23|B.7|both|P1
Skadeinsekter|sum/egenandel|150000og2000egenandel,vegge/kaker/skjeggfrautlandfastbolig;dokumentertromveggefrysavkoffert.|24|B.8|both|P1
Skadeinsekter|vilkår/unntak|Rekvirertleverandør,skjegg3befaringerførsteår;ikkeandrebygg/fellesareal,døderester/tilkomst/innboskade/næring/tidsavvik;bilekstrakostkunde.|24|B.8|both|P1
Barnebarn|familie|Superbarne/olde<21påreisemedforsikringstaker,ikkenårannendekning.|25|C.1.1|super|P1
Leiebilegenandel|omfang|Ubegrensetbil/MCtyveri/ytreskade/nøkkel,turmin1natt,CDWTP,betaltsatsileiekontrakt.|25,26|C.1.2.1|super|P1
Leiebilegenandel|unntak|Ikkeflytting/varer,moped/scooterMC125ATVsnø/jobbreise/andresbruk/privatutleie/delebil/leasing/servicebil/motorsport/ikkeunderliggendekasko.|25,26|C.1.2.1|super|P1
Utstyrsleie|sum/vilkår|Forsinketmedflybarnevogn/musikk/sport10000person;kjøphvisikkekanleie5000,tot10000;bareforsinkelsestid,ikkehjemreise.|26|C.1.2.2|super|P1
Uhell|sum/utløser|5000samlet,plutseligytrekjentårsak/tid,fysiskikkeborte,fremvisning,B4unntak.|26,27|C.1.2.3|super|P1
Uhell|egenandel|Mobil/nettbrett2000fraandreulykkeskadeinnen2kalenderår.|27|C.1.2.3|super|P1
Kjæledyr|sum/vilkår|1000EU/EØSutenforNorden,eidID/vaksineakuttsykulykke,ikkeshow/konkurranse/kunavl.|27|C.1.2.4|super|P1
Taptreise|hotellarrangement|5000/personénhotellnattogettarrangementvedmin8tforsinkelse,værteknisktrafikk;ikkearbeid/refusjon/overdratt.|27,28|C.1.2.5|super|P1
Taptreise|leiebil|10000bil/MCvedmin1.5tsenhenting+kansellertforhåndsbetalt;ikkeprivatleie/yrke/andretyper/andrebruk.|28|C.1.2.5|super|P1
Ansvar|sum/geografi|PrivatutenforNordenStandard7m/Super15m;egne/godkjentekostkommeritillegg.|28,30|D.1.1/4|both|P1
Ansvar|unntak|Kontrakt/leid-brukt/familie/næring/motor/båt/luft/fastbolig/forsett/smitte/råte;leidboligbranneksplosjonvannlikevel.|29|D.1.2|both|P1
Rettshjelp|sum/geografi|PrivatutenforNorden100000;3–10=250k,11–25=500k,26–49=750k,50+=1m;økonomiskinteressetakutenforhåndsgodkjenning.|30|E.1.1|both|P1
Rettshjelp|utløser/unntak|Tvistførreisensslutt;ikkenæring/fastbolig/familie/arv/kjøretøy/gamlettvistegrunnlag/straff/egenforsikringsoppgjør/idømtekost.|30,31,32|E.1.2–3|both|P1
Rettshjelp|egenandel|4000+20%avresten,énpertvist;meldinginnen1åretteradvokat.|31,32|E.1.4|both|P1
Lounge|tjeneste|CollinsonSmartDelayutenforvilkår,min1tforsinkelse+4reisefølge,40EURutenlounge,registrer24tfør;ikkekredittkort.|0|HTML|both|P2
Kry|tjeneste|Døgnsykepleier/videoiutland,20%rabattreisevaksineringmenikkeselvevaksinen.|0|HTML/IPID|both|P2
Salg|forutsetning|Nettsalgforutsetterbil/innbo/hus/hytte;pakke/nett/pensjonsrabattkundeavhengig,ingenpremiestandard.|0|HTML|both|CUSTOMER_SPECIFIC
Administrasjon|felles|Aktsomhet,fornyelse,valuta,regress,dokumentasjonikkehveregendekningsrad;definisjonbruktmedtilhørendefact.|1,32,33,34,35|F/GENER07|both|ADMINISTRATIVE'''
out=[]
for i,line in enumerate(rows.splitlines(),1):
 s,d,v,pages,sec,levels,kind=line.split('|');out.append(dict(inventory_id=f'SB-RE-{i:03d}',subject=s,dimension=d,value=v,pages=[int(x) for x in pages.split(',')],section=sec,levels=levels,kind=kind))
save('storebrand-reise-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,source='catalog/sources/storebrand/reise/canonical/reise10-vilkar-reiseforsikring.pdf',pages_read=35,other_read=['IPID2','HTMLfull','GENER07shared11'],rules=out));print(len(out))
