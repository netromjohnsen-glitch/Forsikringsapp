from continue_audit import save
# Inventory made from every page of innbo09, before exact catalog claim inspection.
text='''
Avtale|nivå/sum|Kunden velger Standard/Super og samlet førsterisikosum i beviset; bevis går foran vilkår.|1,13|Innledning/B.5|both|CUSTOMER_SPECIFIC
Sikrede|husstand|Forsikringstaker, ektefelle/samboer med samme folkeregistrerte adresse, hjemmeboende barn, borteboende studiebarn/verneplikt uten meldt adresseendring, barn med delt foreldreansvar; ikke leietaker/bokollektiv.|4|B.1|both|P1
Andres ting|sum/rolle|100000 ved skriftlig overtatt forsikringsplikt eller risiko etter lov/avtale; ikke penger/verdipapirer eller lagring/oppbevaring.|4|B.1|both|P1
Geografi|midlertidig|Forsikringssted og midlertidige ting i bygning i Norden med planlagt retur innen3år; studiebarn/verneplikt i Norden.|4|B.2|both|P1
Basseng|sum|Frittstående basseng på stedet40000.|5|B.3|both|P2
Småbåt|sum/omfang|Inntil15fot/10HK, kano/kajakk/seilbrett/SUP på forsikringsstedet eller låst fast på tilknyttet land;Standard40000/Super60000.|5|B.3|both|P1
Yrkesutstyr|sum/sted|Varer/løse ting brukt i yrke på forsikringssted:Standard50000/Super200000.|5|B.3|both|P1
Penger|sum|Standard20000/Super30000; ikke hytte/fritidsbolig.|5,6|B.3|both|P1
Tilhenger|sum/sted|Person-/varebiltilhenger på forsikringsstedet40000.|5|B.3|both|P2
Hobbyveksthus|sum/årsaker|Standard100000/Superforsikringssum; barebrann/natur/vann/tyveri.|5,6|B.3|both|P2
Små bygg|sum/areal|Bygg inntil10m2 på stedet:Standard50000/Super200000.|5|B.3|both|P2
Kjøretøydeler|sum|Løse deler/tilbehør privat motorkjøretøy på stedet40000; ikke dekk/felger/campingvogndeler.|5,6|B.3|both|P2
Småmaskiner|grenser|Gressklipper/rullestol/snøfreser m.m. inntil10km/t og750kg, avtalt sum; luftsportsutstyr/droner/modellfly omfattes som løsøre.|5|B.3|both|P2
Frysevarer|omfang|Utilsiktet temperaturøkning i fryser; også følgeskade fryser/kjøleskap ved dekket matskade.|5|B.3|both|P2
Glass/sanitær|brudd|Brudd sanitærporselen, fastplatetopp og bygningsglass i eid leilighet/leidbolig; ikke næring,utettisolerglass,dusjkabinett/glassvegg.|5,6|B.3|both|P1
Små elektriske kjøretøy|løsøre/ansvar|B.3 definerer inntil25km/t,70kg,85cm/120cm; lovpålagt motoransvar omfattes ikke. B.4.5 sykkeltyveri har egne20km/t-el-sparkesykkelregler.|5,9|B.3/B.4.5|both|P1
Generelle gjenstandsunntak|omfang|Ikke registreringspliktig motorvogn, campingvogn, dyr, digital valuta/kunst, arbeidsgivers eiendeler uten overført eierskap, ikke-deklarert import; vedlikehold og overflateriper unntatt.|6|B.3|both|P1
Brann|omfang|Brann/eksplosjon, slukkeutstrømming og plutselig nedsoting; ikke svi/gnist uten brann eller kjemisk heksesot.|6|B.4.1|both|P1
Brann|alarmegenandel|Ingen egenandel ved aktiv brannalarm til FG-godkjent sentral.|6|B.4.1|both|P1
Lyn/elektrisk|omfang|Lyn, kortslutning, lysbue, overslag og overspenning.|7|B.4.2|both|P1
Natur|omfang/unntak|Lovfestet skred/storm/flom/stormflo/jordskjelv/flodbølger/meteoritt/vulkan; ikke bare antenne/markise/skilt eller forebygging uten direkte skade.|7|B.4.3|both|P1
Natur|egenandel|8000 oppgitt per01.01.2024; tilenhvertid departementsbestemt. Ikke verifisert som dagens sats utenfor lokal kilde.|7|B.4.3|both|P1
Vann|omfang|Rør/væske/gass/tilknyttetutstyr/akvarium; terrengvann krever plutselig vannspeil utover gulv, ikke bare oppforet gulv; ingen sopp/råte/mugg/bakterieskade.|7,8|B.4.4|both|P1
Vann|tap/avgift|Forhøyet vannavgift eller tap av vann/gass/annen væske ved lekkasje40000.|8|B.4.4|both|P1
Vann|egenandelfritak|Ingen egenandel ved innvendig rørbrudd med heleboligvannstopp, aktiv FG-alarm, eller installerte overvannsforebyggende tiltak ved overvannsskade.|8|B.4.4|both|P1
Tyveri|hjem/innbrudd|Innbo ved tyveri/skadeverk påstedet tilsum; bygningsskade ved innbrudd i leid/sameietbolig40000.|8,9|B.4.5|both|P1
Fellesbod|sum/verdiforskrift|Privatbod ifellesrom:Standard100000/Superforsikringssum; dyrebare ting over20000 eller øvrige enkeltgjenstander/samlinger over50000 skal ikke lagres der.|9,10|B.4.5|both|P1
Fellesskap|skap|Eget låst skap i fellesgarasje/fellesrom40000; ellers fellesromtyveri ikke med mindre låst bil/skap.|9|B.4.5|both|P1
Arbeidsplass|tyveri|Norge40000; ikke bygg-/anleggsplass.|9|B.4.5|both|P1
Uteareal|tyveri|Privatboligs egetuteareal Standard40000/Super100000; ikke fellesareal eller sykkel.|9|B.4.5|both|P1
Barnevogn|tyveri|Hele verden tilavtaltsum.|9|B.4.5|both|P2
Sykkel|tyverigrense|Norge låstsykkel inkl el/fastutstyr/sykkeltilhenger;Standard40000/Super50000 per sykkel; grensen gjelder ikke inne ifastbebodd beboelsesrom.|9|B.4.5|both|P1
Sykkel|teknisk/lås|Elsykkelmotorutkobling25km/t,elsparkesykkel20km/t;fastlåst/montert tilhenger;lettavtakbart utstyr må tasmed.|9,10|B.4.5|both|P1
Ran/napping|sum/geografi|Ran/overfall tilsum;veskenapping40000;Norge.|9|B.4.5|both|P1
Tyveri|person/unntak|Ikke underslag/bedrageri,øvrighærverk,husstandsmedlem/gjest,leieboer/husstand/gjest eller person gitt adgang.|9|B.4.5|both|P1
Tyveri|egenandel|2000 pergjenstand opp til bevisets egenandel; registrertsykkel1000 vedbetaltgyldigregister;FGinnbruddsalarm0.|10|B.4.5|both|P1
Bygningsfølgeskade|omfang|Innbo skadet somdirektefølge av dekket bygningsskade; annenbygningforsikrer må bekrefte dekningen.|10|B.4.6|both|P1
Psykolog|timer/vilkår|10timer etteralvorligbrann/ran/overfall/voldtekt vedhjem;avtalt psykolog/politianmeldt;reiserefusjon folketrygd,ikke utenlandsreise eller terapi etter12måneder.|11|B.4.7|both|P1
Lagring|varighet/årsaker|Inntil3år;brann,vann,tyveri;vedbrann/vannmåbygningværedekket;verdifullegjenstander samlet100000.|11|B.4.8|both|P1
Lagring|unntak|Ikke penger/verdipapirtyveri,fellesrom/byggeplass,tingmistet/tapt,båt/kjøretøy/campingvogn/tilhenger/deler/dekk.|12|B.4.8|both|P1
Rydding|sum/egetarbeid|Ubegrenset dekket rydding/fjerning;egenførstehjelp/vask/rydding250pertime høystselskapetsnormalkost.|12|B.4.9|both|P2
Midlertidig bolig|sum/vilkår|Ubegrenset nødvendige merbokostnader reparasjonsperioden;hotell100000;dekketbygningsskade,forhåndsavtale utoverenuke,husleietap/sparteutgiftertrekkesfra.|12|B.4.9|both|P1
Fritidsboligerstatning|sum/vilkår|Innbohytte:tilsvarendeleieiNorge Standard40000/Super80000,måforhåndsavtales.|12,13|B.4.9|both|P2
Prisstigning|oppgjør|Prisstigningsmerutgifter ubegrenset tilnormalreparasjons-/gjenkjøpstid/utbetaling;renterfratrekk.|12,13|B.4.9|both|P2
Rekonstruksjon|sum/omfang|Manuskript/yrkestegning/arkiv/foto/video/data/programmer:Standard50000/Super100000;ikkereise/opphold.|12,13|B.4.9|both|P2
Tilleggsinnredning|sum/vilkår|Leidbolig innredning betaltavsikrede100000 vedbygningstap ogopphørtleie/ikkeutbedretinnredning.|12,13|B.4.9|both|P1
Flytteutgifter etter skade|sum|Nødvendig flytting/lagring etter skade ubegrenset.|12|B.4.9|both|P2
Trygghetsgaranti|nyanskaffelser|Nye ting ettersistefornyelse dekkes framtilnestefornyelse selvomsummenoverskrides.|13|B.5|both|P1
Oppgjør|valg/kontant|Selskapetkanvelgereparasjon/tilsvarende/kontant;kontantbegrensettilselskapetskostnad;ikkeMVAarbeidvedselvreparasjon.|13|B.6.1|both|P2
Aldersfradrag|tabell|Klær1år/10%,elektrisk5/10%,mobildata1/20%,sykkel3/10%,annet5/5%;maks80%. Kunetterfrieår,tilforskjellframotor/campvilkårseksempel.|14|B.6.2|both|P1
Aldersfradrag|verdi/brukt|Liteverdiforringedegjenstander intetfradragvedminst75%avnyverdi;bruktkjøp/arv/gave bruktgjenanskaffelse;utingibruk/utdatert omsetningsverdi.|14,15|B.6.2|both|P1
Egenandel|avtale|Bevisetsavtalte egenandel hvisikke spesialsats;enperhendelse hvisikkeannet.|15|B.6.3|both|CUSTOMER_SPECIFIC
Utleie|forhåndsavtale|Utleiehel/delboligmåforhåndsavtales/bevisføres;familieopp tilto generasjoner unntatt definisjonen.|16|B.7.2|both|P1
Fraflyttet|reduksjon|Hvisikke brukt som bolig:barebrann/natur;unntarhytte/fritidsbolig.|16|B.7.2|both|P1
Ute Norden|tyveri|Super50000;ikkepenger/verdipapirerellersendt/ekspedertreisebagasje.|17|C.1.1|super|P1
Uflaks|årsak|Annenfysiskskade plutseligtilfeldigytreårsak,kjenttidspunkt,gjenstandkanfremvises;B-unntakogkravgjelder.|18|C.1.2|super|P1
Uflaks|sum/nedfall|Avtaltsumpåstedet;utenforbolig ELLERtingmistes/faller/velter100000perhendelse iNorden,ogsåflytting.|18|C.1.2|super|P1
Uflaks|unntak|Ikkeutstyribruk(jfegenC1.3),dyr/skadedyr/fukt/slitasje,overflateskade,egensvakhet,utleie,luftsport/droneribruk,tap,yrkesutstyr,tingivann,båt/tilhenger/veksthus/dyr,integrertehvitevarer/platetopp.|18|C.1.2|super|P1
Uflaks|egenandel|2000prting,1500fortingnyereenn2år,høyestbevisegenandel;mobil/sykkel/brillerbevisegenandel.|19|C.1.2|super|P1
Sportsutstyr|bruk|Egensykkel/sportsutstyribruk40000;ikkelufsport/småelektriskekjøretøy;2000prgjenstandhøyestbevisegenandel.|19|C.1.3|super|P1
Rullestol|sum|300000samletmedvilla;ikkefritidsbolig;ulykkeellerfødseliforsikringstid;minst50%medisinsk invaliditet.|19,20|C.1.4|super|P1
Rullestol|frister|Medfødt invaliditetfastslåsinnen2år;utgifterinnen5år;dekker dokumenterttilleggutoveroffentligstøtte.|20|C.1.4|super|P1
Flytting|omfang|Plutseliguforutsettytrehendelse undertransport/bæringtilnybolig/lageriNorge;inngåravtaltsum.|20|C.1.5|super|P1
Flytting|unntak|Ikke penger/papirer/kunst/antikviteter/smykker/sølv/gull/piano/flygel/tap;C1.2unntak gjelderogså,inkl100000nedfallsgrense.|18,20|C.1.5|super|P1
Skadedyr|bekjempelse|150000gnagere/veggedyr/kakerlakker/skjeggkreibolig/fritidsboligiNorge,aktivitetiforsikringstid;leverandørstyrt,forhåndskontakt;skjeggkre3befaringerførsteår.|20|C.1.6|super|P1
Skadedyr|unntak|Ikkeandrebygg/fellesbod,etterlatenskaper,åpning/sikring,tingenskade,næringstypiskeangrep,førkjøp/etteropphør;utenbilvei ekstratransport betaleskunden.|21|C.1.6|super|P1
Skadedyr|egenandel|2000.|21|C.1.6|super|P1
ID-tyveri|summer|100000bistand/juridiskførstehjelp og1000000kreditortvist;ikkefritidsbolig;privatperson ogforhåndsgodkjenning.|21,22|C.1.7|super|P1
ID-tyveri|avgrensning|Ikke økonomisktap,yrke,nærfamiliehandling;tvistbarenoskrett/norskdomstol;egne/idømtekostnaderinkludertmenikkerettsgebyr;førstehjelpingenegenandel.|22|C.1.7|super|P1
Ansvar|sum/geografi|5000000privatansvarNorden;ikkeinnbohytte/fritidsbolig;person/tingskadeogfølgetap.|23|D.1–3|both|P1
Droneansvar|sum/virkeområde|750000SDR Europa,åpenkategori/hobby/sport/rekreasjon utenoperatørtillatelse;saksomkostningitillegg.|23,24|D.3.1|both|P1
Droneansvar|unntak|Ikkeandreluftfartøy/passasjer/godstransport/familieting/yrkesskade/kontrakt/straff/bøter/ikkeplutseligforurensning.|24|D.3.1|both|P1
Ansvar|unntak|Ikkeleie/lån/brukteoppbevarteting,nærfamilie,næring,eiendom,motor/båt/luft,hest,forsett,gradvisforurensning,smitte/sopp/asbest;småarbeidsmaskin10km750kgpåegenstedunntak.|24,25|D.4|both|P1
Ansvar|egenandel|4000.|25|D.5|both|P1
Rettshjelp|sum|100000pertvist/økonomiskinteresse;flerparter3–10=250000,11–25=500000,26–49=750000,50+=1000000.|26|E|both|P1
Rettshjelp|rolle/geografi|Privatperson/husstandNorden;ikkefritidsbolig;advokat/rett/sakkyndig/vitner;ingenjuridiskepersoner.|26,27|E.1–3|both|P1
Rettshjelp|boligskifte|Tidligereeiervedsolgtforsikretbolig og kjøpnyførinnflytting/nåværendeforsikretiStorebrand;bygningframforinnbohvisbegge.|27,28|E.3|both|P1
Rettshjelp|unntak|Yrke/annenfastbolig/familie/arv/inkassoubestridt/motor/luft/båt(jf unntak)/straff/preeksisterendetvistgrunnlag/finansover1million/idømtekostnader/ankegebyr/voldgift.|28,29|E.4|both|P1
Rettshjelp|egenandel|4000+20%avresterende;enegenandelpertvistuansettparter.|29|E.5|both|P1
Yrkesskade|omfang/egenandel|Privatperson somarbeidsgiver lovpålagtyrkesskadeubegrenset;ingenegenandel;ikkehytteinnbo.|30|F|both|P2
Administrasjon|generelle regler|Meldeskade/politi,skjønn,oppgjørsprosedyre,regress/generellevilkår;ikkeenkeltstående sammenligningsfakta.|1,15,16,29,30|B.7/E.6|both|ADMINISTRATIVE
'''
rows=[]
for l in text.strip().splitlines():
 s,d,v,p,sec,lev,kind=l.split('|');rows.append(dict(inventory_id=f'SB-IN-{len(rows)+1:03}',subject=s,dimension=d,value=v,pages=[int(i) for i in p.split(',')],section=sec,levels=lev,kind=kind))
save('storebrand-innbo-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,source='catalog/sources/storebrand/innbo/Storebrand_Innbo_innbo09.pdf',pages_read=30,rules=rows,notes=['Do not import different motor/camp age deduction example.','Innbo hytte clauses must be conditional; no new Hytte product assumed.','Local dated natural damage rate not independently updated.']))
print(len(rows),'source-first rules persisted')
