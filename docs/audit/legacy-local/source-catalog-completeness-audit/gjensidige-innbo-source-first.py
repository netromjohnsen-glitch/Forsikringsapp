from continue_audit import *
rows='''all|Personkrets|husstand|Fast folkeregistrert husstand, studerende/vernepliktige barn uten adresseendring, delt bosted; ikke leietakere/bokollektiv.|3|3
all|Geografi|ting|Forsikringssted, barns studiehybel, midlertidig utenfor/salg/flytting i Norden; permanent annenbygning30 000.|3|3
all|Geografi|særting|Båt og tilhenger bare på forsikringssted; næringsting bare i bygning der.|3|3
standard|Innbosum|kundespesifikk|Avtalt innbosum, offentlig mal gir ingen fast sum.|1|1
pluss|Innbosum|ubegrenset med grenser|Ubegrenset når avtalt i bevis; alkohol, kunst, smykker/metall500 000 per kategori; øvrige ting/samlinger500 000 per ting/samling; høyere kan avtales.|3|1,3
all|Kontanter|sum|20 000 kr kontanter/verdipapirer; digitaleverdier/krypto er eksplisitt unntatt i fullvilkår.|3|3
all|Næringsløsøre|sum/sted|100 000 kr i bygning på forsikringssted.|3|3
all|Hobbyveksthus|sum/årsaker|300 000 kr bare brann/natur; glass alene og kollaps unntatt.|3–4|3–4
all|Bier|sum|Bikuber/honningutstyr100 000; ikke sykdom hos bier under Pluss uhell.|3|3–4
all|Kjøretøydeler|sum|Private kjøretøydeler/tilbehør30 000.|3|3
all|Tilhenger|sum/sted|30 000 kr på forsikringssted; registreringspliktig motorvogn unntatt.|3|3
all|Fritidsbåt|sum/sted/årsaker|60 000 kr på forsikringssted, bare brann/tyveri/natur.|3|3
all|Brann|hendelser|Brann, lyn, eksplosjon,nedsoting og elektrisk fenomen; ikke svimerke/gnist uten brann.|3|3
all|Vann|hendelser|Rør/installasjon/akvarium; vann fra terreng/grunn som danner vannspeil; inn via åpning etter dekket bygningsskade.|3|3
all|Generelle skadeunntak|årsaker|Ikke garanti som ansvarlig kan betale, langvarig søl/kondens, sopp/råte/bakterier/heksesot,kjæledyr/insekter; mistet/tapt/ukjentårsak, underslag/bedrageri.|3|3–4
all|Tyveri|hjem/bebodd|Tyveri fra bygning på forsikringssted eller bebodd bolig ellers.|3|4
all|Tyveri|fellesbod|Standard30 000; Pluss ingen særskilt sumgrense nevnt for boder i felleskjeller/loft. Fellesbod er ikke fellesrom.|3|4
all|Tyveri|uteareal|Hagemøbler/redskap/grill/robotklipper100 000; annetinnbo30 000 privat uteareal.|3|4
standard|Tyveri|andre steder|Annen ikke-bebodd bygning30 000,garderobeskap30 000,løsøre fra bil5 000,barnevogn.|3|4
standard|Tyveri|stedunntak|Fellesgarasje/fellesrom/alminnelig adgang og ikke-beboelsesrom på byggeplass unntatt.|3|4
pluss|Tyveri|Norden|Annet innbo/løsøre i hele Norden30 000; ikke uteareal på byggeplass.|3|4
all|Sykkel|tyverigrense|30 000 per sykkel/sykkeltilhenger utenfor bygning/bebodd bolig i offentlig mal; faktisk valgt sum i bevis.|1,3|1,4
all|Ran/veskenapping|omfang|Ran; napping av båret veske30 000.|4|4
all|Bygningsskade|leierrom|Skade etter tyveri/forsøk på rom man leier/bruker30 000.|4|4
all|Dyr|skade|Skade av mus,rotter og andre dyr, men kjæledyr/insekterunntak beholdes; bekjempelse egen dimensjon.|4|4
all|Fryser/kjøleskap|temperatur|Utilsiktet temperaturstigning: mat og lukt på fryser/kjøleskap.|4|4
all|Glass/sanitær|brudd|Bygningsglass inklinnglassetveranda/sanitær; ikke punktert isolerglass;3000 egenandel.|1,4|1,4
all|Andre skadeårsaker|kollaps/slokking|Kollaps som følger dekket bygningsskade, utstrømming fra slokkeapparat.|4|4
all|Naturskade|hendelser/egenandel|Lovbestemt skred/storm/flom/stormflo/flodbølge/meteor/jordskjelv/vulkan;8 000egenandel.|1,4|1,4
all|Rullestol|sum/tid|250 000 kr; ulykke innen10år, medfødt10år fra tildeling senest20år fødsel; ikke dobbeltsum hus+innbo/medisinskkomplikasjon.|4|5
all|Etter skade|rydding/flytting/rekonstruksjon|Rydding/deponering,nødvendig flytting/lagring utover sum; notater/tegninger/datalager50 000.|4|5
all|Opphold|periode|Avtalt nødvendige merkostnader ved dekket bygningsskade normal reparasjonstid; leidbolig oppsigelsestid; ingen gjenoppbygging maks3mnd.|4,15|6,17
all|Opphold|adkomst/natur|Blokkert alladkomst ved dekket hendelse eller redning/natur; inntil avtalt sum maks10millioner per kunde.|4|6
all|Leietakerinnredning|tap|Egenfinansiert innredning tapt ved opphørt leieforhold/skade eller ikke gjenopprettet i bygningsoppgjør.|4|6
all|Yrkesskade|privatansatt|Lovbestemt yrkesskade for arbeidstaker ansatt som privatperson.|4|6
pluss|Mobilskjerm|omfang|Bytte knust/sprukket skjerm/deksel viaElcareNordic,1000egenandel; annenreparatør3000.|1|1,4
pluss|Mobilskjerm|unntak/oppgjør|Ikke riper/slitasje/uteavbruk/telefoninnhold; annen fysisk skade vurderes uhell; erstatningstelefon/depositum5000 ved tidlig oppgjør,14d innsendingsfrist.|16|4,18
pluss|Uhell hjemme|hendelse|Alleandre skader fra plutselig uforutsett ytre hendelse i bolig/privatuteareal.|4|4
pluss|Uhell borte|sum/område|Hele verden30 000; tyveri utenfor Norden unntatt.|4|4–5
pluss|Uhell/flytting/utleie|unntak|Frost/fukt/sopp/råte,insekter/kjæledyr/ukjentårsak/cyber,bruksslitasje; veksthus,rittsykkel/sport,båt/kjøretøy/hengertilbehør, fjernstyrte ting under bruk unntatt.|4|4–5
pluss|Flytting|hendelse/område|Ny bolig innen Norge; ytre skade og tyveri fra transportmiddel; emballeringskrav.|1|1,4–5
pluss|Sykkel veihjelp|omfang|Norge offentligvei/biladkomst,stopp løses eller transport verksted/hjem/arbeid;viaGjensidige,ikke ritt/deler;500egenandel.|1|1,5
pluss|Skadeinsekter|arter/sum|Veggedyr/kakerlakk/skjeggkre/sølvkre,150 000 per skade påforsikringssted;3åteutlegg for kre.|4|6
pluss|Skadeinsekter|begrensninger|Ikke innboskade,aktivitet før/etter avtale,egenbestilt,forebygging/vedlikehold/fjerningdøde; samtykke kreves.|4|6
pluss|ID-tyveri|hjelp|Mehrwerk rådgivning,kartlegging,avviseurettmessigekrav/sletteanmerkninger,politianmeldelse.|9|6–7
pluss|ID-tyveri|advokat|100 000 før domstol hvis Mehrwerk ikke lykkes;1million i domstol;forhåndsgodkjent.|9|7
pluss|ID-tyveri|unntak|Ingen økonomisk tap/kortkost,næring,utenlandskkreditoruten norskinstans,egen/familiestraffbarhandling; egenadvokatutenforrettshjelpunntak.|9|6–7
optional|Utleie|valg/sum/hendelser|Kun angitt i Plussbevis:leietakersskadeverk/underslag,6mndmisligholdt leie éngangperleietaker,utkastelse20 000;egenandel10 000.|1,15|1,4
optional|Utleie|begrensninger|Ikke rettmessig tilbakeholdt leie,ikke utover6mnd ved hus+innbo;skriftligavtale depositum/bankgaranti;varsel14d/betaling14d/utkastelseinnen6uker.|1,15|1,4–5,17
optional|Sykkel høyere sum|valg|IPID dokumenterer høyere sum valgbar; beløp/bekreftet kjøp i bevis.|IPID2|IPID2
optional|Mobil utvidet|valg|IPID tilbyr Utvidet mobilforsikring men hovedvilkår kun knust skjerm+uhell; separatvilkår finnes ikke i lokalpakke.|IPID2|IPID2
all|Egenandel|grunn|Standard4 000/Pluss3 000 offentlig eksempel; individuelle valg gjelder foran.|1|1
all|Egenandel|sikkerhetsfritak|Alarm med sentral;vannstoppventilmedattest helebolig;elsjekk siste5år;skade bare på vern/alarm:0egenandel når vilkår oppfylt.|16|18
all|Sikkerhet|sykkel/verdier|Fastlåst/innelåst,FG-lås over15 000; batteri/GPS tattmed/sikret; visse verdier ikkeekspedertbagasje/synligibil/fellesbod.|1|1
all|Sikkerhet|bolig|Låsing,varme,stengtstoppekran ved merenn3dager ubeboddikke-fast-bolig,sluk2gangerårlig og synligefeil rettet.|1|1
all|Oppgjør|grunnlag|Reparasjon/gjenanskaffelse/kontant etter selskapetsvalg; importvare uten Norgealternativ kjøpesum+frakt/tolltak;arbeidutenfaktura75% eksmva,øvrigtime300.|15|17
all|Aldersfradrag|datamobil|PC/nettbrett/smartklokke10% etter1år; mobil20% etter1år;beggemaks80%.|15|17
all|Aldersfradrag|hvitevarelydbilde|10% per påbegyntår etter5, maks80%.|15|17
all|Aldersfradrag|kamera/øvrigelektronikk|10% etter3år,maks80%.|15|17
all|Aldersfradrag|sykkel|Sykkel/elsykkel/el-spark/ståhjuling10%etter3,maks80%.|15|17
all|Aldersfradrag|briller/dekk|10%etter1,maks80%.|15|17
all|Aldersfradrag|annetinnbo|15% når5år eller eldre, ikke15%hvertår;badekilde10%etter5maks80%.|15|17
all|Oppgjør|markedsverdi|Klokker/kunst/samlinger brukt og utrangert=markedsverdi; smykker/metallnypris. Reparasjonutenfradrag unntattbadekilde.|15|17
all|Ansvar|sum/område|Privatperson i Europa5millioner per hendelse/serieskade,4 000egenandel.|1,6–7|1,8–9
all|Ansvar|tillegg/unntak|Leiet eiendom og plutseligforurensning;innredningleie/egenfamilie/yrke/låntting/gradvisfukt/kontrakt og navngittkjøretøydroneansvar unntatt.|6|8
all|Rettshjelp|sum/egenandel|100 000 grunntvist,4 000+20%;flerpart250k/500k/750k/1m;økonomiskinteresse og sameieresærregel.|8–10|10–12
all|Rettshjelp|område/scope|Privat Norden,etter salg/nykjøp,bruker av uforsikretmotor/båt når ikke omfattet av annenpolicy;kundensandrepolicy viktig.|8–9|10–11
all|Rettshjelp|mekling|Mekle.no0egenandel,ingenegenadvokat i mekling;fortsattrett etter avsluttetmekling.|8,10|10,12
all|Rettshjelp|begrensning|Ikke anke/idømtekostnader/voldgift/familie/yrke/tidligeregrunnlag nytegning;40%sakkyndig og gruppesærgrenser.|8–10|10–12
all|Generelle vilkår|materielle|14dagereierskifteettervern;krig/terror/Nordenbegrensning/atom og naturskadesvak-konstruksjon;ingenmotorregelenarves.|11–12,16|13–14,18
all|Administrasjon|avtale/krav|Frist/klage/skjønn/personvern holdes uten ordinary sammenligningsfakta.|11–14|13–16'''
r=[]
for n,line in enumerate(rows.splitlines(),1):
 s,sub,dim,v,std,pl=line.split('|');r.append(dict(id=f'GJ-IN-{n:03}',scope=s,subject=sub,dimension=dim,value=v,standard_pages=std,pluss_pages=pl))
save('gjensidige-innbo-independent-inventory.json',dict(source_first=True,catalog_values_inspected=False,rules=r,source_read_complete=True,source_files=['Gjensidige_Innbo_Standard_alminnelige_vilkar.pdf','Gjensidige_Innbo_Pluss_alminnelige_vilkar.pdf','Gjensidige_IPID_Innbo_EAP02.pdf'],reuse='gjensidige-innbo-page-reuse.json; all nonidentical Innbo pages read in full; Pluss13–16 match already-read Bil general text after layout stripping',conflicts=['IPID includes cryptocurrency versus both fullterms explicitly excluding digital/crypto.','IPID Online Trygghet listed but no dedicated fullterms in package.','IPID extendedmobile option requires missing separate scope.','Pluss IDservice Mehrwerk versus old Standard generic Pluss clauseTenerity; use exactPluss not blind lowerinheritance.','Fullterms both legal tablecoverHTU15k and exceptionHTU generic conflict; not arbitrary yes/no.']))
print('independent rules',len(r))
