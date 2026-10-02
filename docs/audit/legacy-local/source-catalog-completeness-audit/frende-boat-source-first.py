from continue_audit import *
rows='''Sikrede|personkrets|Forsikringstaker/medeier,rettmessigfører foransvar,ulykke/passasjer ettervalgtdekning.|2|1|all|P2
Fartsområde|grunn/utvidelse|Norge/Sverige/Danmark/Finland12nm,KattegatSkagerrakØstersjø;mai1–sept30Europa200nm/overfartIslandUKSvalbardMadeiraAzoreneKanari;helårutvidelsebevis.|2|2|all|P1
Forsikretobjekt|sum|Førsterisikobåt+fastutstyrinntilbevisetsum;motoraleneegengrenikkehelebåt.|2,6|3/10.3|all|CUSTOMER_SPECIFIC
Jolle|sum/dimensjon|Egenjolle10fot/motor10hkbruktmedbåt20000totalt.|2|3.2|all|P1
Løsøre|sum/applicability|Grunnvilkår10000medbevisvalg,Utvidet50000;HTMLbranntyveriikkemedmensgrunn3inkl;IPIDtyveripersonligunntatt.|2,5|3.3/7.3|all|REVIEW
Utstyrsavgrensning|unntak|Ikkekontant/verdipapir/opplagsmateriellutenUtvidet;fastmontert måikkeenkeltfjernes.|2|3|all|P1
Brann|omfang|Brann/lyn/eksplosjon;ikkevarmgangmotor/drivverkellerstartkomponentbrannkortslutning,menfølgeskadedekkes.|3|4.1–2|all|P1
Tyveri|omfang/unntak|Tyveriforsøkbåt/fra/landutstyrlåstkunegentilgang;ikkehusstand/ansatt/utlånikkereturnert.|3|4|all|P1
Bergelønn|branntyveri|Sjølov16ansvarbergelønninkl4.1;ikkenødvendigvishele5.3redning.|3|4.1.4|all|P1
Kasko|omfang|Ytreskadehærverk/kollisjon/grunnstrandingkantringsynkingmastbom,transport,betaltopplagboblehavnsfeil.|3|5.1|kasko|P1
Kasko|unntak|Seilvindalene/isberøring/frostnedbør/snøtakunntattbetaltopplag/varmgang/feildrivstoff/gammeltufikset;motorspesifikkeårsaker;feilslitasjefølgedekketomsjødyktig.|3|5.2|kasko|P1
Redning|utløser|Dekketskadeellerførerpassasjerakuttsykeulykkedød;ikkevannscooter/kano/kajakk.|3,4|5.1/5.3|kasko|P1
Redning|tiltak|Sleptrygghavn/verkstedforhåndsavtalt/bergelønn/lokallegehotell/hjemreiseperson/avtalthotell;vrak10%sumvedoffentligpålegg.|4|5.3|kasko|P1
Hjemtransportbåt|område/sum|GrunnNorgeSverigeogtakbåtverdi;Utvidetøvrigfartsområde50000.|2,4,5|2/5.3/7.4|kasko|P1
Redning|egenandel|750.|4|5.3|kasko|P1
Maskin|valg/omfang|Valgfrittvedbevis;varmgangkjølesystemtilstoppet,dieseldyr,bruddmotor/gir/aksling/styring/ror/drivstoff;undersøkelse/demonteringinkl.|4|6.1|machine|P1
Maskin|unntak|Garanti først menavslagkanoverta;vedlikehold/frost/korrosjon/feilbruk/slitasjeutmattelse/lettbåtsekstramotorunntatt.|4|6.2|machine|P1
Maskin|oppgjør|Takmotor/drivverkmarkedsverdi,ukjenthendelsesdato=meldedato.|7|10.5|machine|P1
Maskin|egenandelalder|Tom5år6000;6år10%min7000;7år20%min8000;8år30%min9000;9år40%min10000;10år50%min11000;11år60%min12000;12+70%min13000. Ingenmaksforsikringsalderoppgitt.|7,8|10.7|machine|P1
Opplagsutstyr|sum/unntak|Utvidet30000plutseligskade/tyveribukkerpresenningdokk;ikkehenger. HTMLsier10000,fullvilkår30000.|4,5|7.1|utvidet|REVIEW
Ferieavbrudd|sum/vilkår|Utvidetmai1–aug31,dekketskadeplanlagtmin7dagersferie;leiebåt/bil/hotell1500døgn14d.|5|7.2|utvidet|P1
Totalskade|terskel/vilkår|Utvidet80%nykjøpesum/3åretterfabrikknyforhandler,nybåtinklfastoriginaltaksum;ikkenæring/utleie/frostnedbør/snøunntattbetaltopplag. HTML60%.|5|7.5|utvidet|REVIEW
Branntyverimotor|separatprodukt|Egenmotorbevis,pkt8dekkerbrann/tyveriframontertellerlåstbygg. Ikkeautomatiskfullbåtprodukt.|5|8|all|REVIEW
Panthaverleasing|valg|Tilleggsbevis/skriftligbekreftelse;kaskoutvidelseøkonomiskinteressemarkedsverdi,manglendekundesolvens/regressmotkunde;ikkemisligholdavdrag/renter.|5,6|9|all|CUSTOMER_SPECIFIC
Oppgjør|kontant|Førsterisikotak,reparerlikestand,verdiøkningfradrag,ikkeetterverditap;kontantikkekrav,mvaetterfakturaog50%arbeidtakst.|6|10.3–4|all|P1
Oppgjør|totaltap|Markedsverdiellersløsørenymedaldersfradrag,defektmarkedsverdi;tyveri30dørfortapt.|7|10.5|all|P1
Aldersfradrag|tabell|HusholdTVradio3frie10%max80;data1fri20%80;kalesjeseil1fri10%80;rigg4frie10%60;hekkaggregat4frie10%60;øvrigfast1fri10%80.|7|10.6|all|P1
Egenandel|bevis|Valgtperhendelsebevis.|7|10.7|all|CUSTOMER_SPECIFIC
Egenandel|ung/vinter|+8000omunder23førerstridmedbevis; +4000synkingfortøydnov1–mars15.|7|10.7|all|P1
Egenandel|tyverifritak|0tyveriFGgjenfinningkombinertFGinnbruddsalarm.|7|10.7|all|P1
Ulykke|valg/omfang|Valgfrittbevis,førerpassasjerrettmessigbåtbruk,ytreuventetfysiskhendelseikkesykdom.|8|11.1|accident|P1
Ulykke|død|100000hvisetterlatterektefellesamboerbarnellerunder21;begunstigetregler.|8|11.2|accident|P1
Ulykke|invalid|200000full/proposjonalt,oppgjør3år,tidligerefunksjon/sykdomfradrag,dødførfastsettelseerstatterinvalid.|8|11.3|accident|P1
Ulykke|unntak|Ryggnakkeutenbrudd/selvmord/psykiskutenPTSDmedfysiskvarigskade/rus/motorsport.|8,9|11.4|accident|P1
Ansvar|rolle/sum|Eierfører,3.02mSDRperson/1.51mSDRting;0egenandel,allebåterikkeegemotor.|9,10|12|all|P1
Ansvar|unntak|Forsett/yrke/familie/egetselskap50%/egenandelavfelleseie/låntbrukt/kontrakt/gradvisforurensning;forlistforurensningalltidunntatt,vrakover10%.|9|12.2|all|P1
Rettshjelp|område/rolle|Nordenpersonligeierrettmessigbrukerfører,tvistvedsalg/nykjøp,fellesgrunnlagén;voldgiftkanomfattes.|2,10|13.1|all|P1
Rettshjelp|sum/egenandel|100000,3+parter250000,økonomiskinteressetak;4000+20%restenénpertvist.|11|13.4|all|P1
Rettshjelp|utgifter/unntak|Egenadvokat/rett/vitne/sakkyndig,ikkeanke/idømtkost/gamlettvistgrunnlag/yrke/familie/arv/straff/sameier/ubestridtinkasso/egenavslag.|10,11|13.2–3|all|P1
Bruk|utleiekonkurranse|Ingenkonkurranse/fartsprøve,utleiebeviskanavtales;HTMLstandardikkeutleie.|12|15|all|P1
Sikkerhet|vinter/fortøyning|Sjødyktig/lens/tilsyn,opplagsstøtteikkepersonligløsøreombord;sjøventilstengtikkeibruknov1–mars31.|12|16.1–4|all|P1
Sikkerhet|lås/vedlikehold|10fot/jolle/vannscootersikres,hengertilfastpunkt+hjullås,låstlukketbåt,nøkkeladskilt,motorboltet,fastutstyrverktøy,fuel-filterårlig/råteårlig/bolterårlig.|12,13|16.5–15|all|P2
Sikkerhet|fører|Sertifikat15m+,under16ikkemotor10HK+eller8m+,lanterner/navigasjon.|13|16.16–20|all|P2
Tegning|HTML|Fritidsbåtunder50fot/under50knop,ikkefastbolighusbåt.|0|FAQ|all|P1
Administrasjon|frister|Meldkrav1år/politi,dokumentasjon,fornyelse/regressikkehveregencomparisonrad.|6,11,13|10/13/17|all|ADMINISTRATIVE'''
out=[]
for i,l in enumerate(rows.splitlines(),1):
 s,d,v,pages,sec,levels,kind=l.split('|');out.append(dict(inventory_id=f'FR-BA-{i:03d}',subject=s,dimension=d,value=v,pages=[int(x) for x in pages.split(',')],section=sec,levels=levels,kind=kind))
save('frende-boat-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,source='catalog/sources/boat-pet/frende-boat-terms.pdf',pages_read=13,other_read=['IPID2','HTMLfull'],rules=out));print(len(out))
