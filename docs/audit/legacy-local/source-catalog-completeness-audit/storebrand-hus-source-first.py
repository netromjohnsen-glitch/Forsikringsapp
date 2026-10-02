from continue_audit import save
text='''
Avtale|bevis|Valgt Standard/Super, bygninger, fullverdi/førsterisiko og egenandel er bevisstyrt; bevis går foran.|1,2,20,30|Innledning/B.6/B.7|both|CUSTOMER_SPECIFIC
Sikrede|eiere|Tinglyst eier/panthaver/sikkerhetsrett; dødsbo; ny eier14d eller tidligere nyforsikring, ikke mangelskrav.|5|B.1|both|P2
Geografi|sted|Bevisadressen; naturNorge,ansvar/rettshjelpNorden. Generell B.2 droneEuropa versus D-eieransvar uten droneavsnitt krever scopesjekk.|5|B.2|both|REVIEW
Bygning|omfang|Bevisførte bygg,grunnmur/fundament/fastutstyr,midlertidignedmontertmontering/reparasjon;ikkeutstyrfornæring/landbruk,drivhus/plasthall/antikvariskeløsninger.|5,6|B.3.1|both|P1
Småbygg|nivå/areal|Frittstående opptil10m² uoppført i bevis omfattes medStandard. Superkolonnen sierikkeomfattet; ikke anta manglende grunnStandard for småbygg når hovedhuset harSuper.|5,6|B.3.1|both|REVIEW
Rør/solceller|omfang|Tilknyttede rør/kabler framtiloffentlignett/brønn/tank/kum;privatforbrukssolceller;ikkebrønn/borehull/drens/spredning/infiltrasjon,bortsettfrabrann/naturpådrens.|6|B.3.2|both|P1
Hage|areal/omfang|5dekar,hage/gjerde/flaggstang,fasttilknyttetbasseng/boblebad/badestamp;ikke drivhus.|6|B.3.3|both|P1
Brygge|sum/årsaker|Privatflytebrygge/trebrygge/friterrasse100000 vedbrann/natur;ikke fellesandel/stein/betong/molo/gangbro. B.3p6har setningomannenskade som p7 utelukker; ikkeutvidutenavklaring.|5,6,7,13,14|B.3/B.4.9|both|REVIEW
Utsmykning|sum|Kunstnerisk utsmykning på bygning500000.|5|B.3|both|P2
Trygghetsgaranti|nybygg|Nye uthus/naust/garasje/tilbygg/påbygg sidenhovedforfall dekkesmidlertidig;meldførnestefornyelse.|7|B.3.5|both|P1
Brann|omfang|Brann/eksplosjon/slukkeutstrømming/nedsoting;plutseliggnist/svi10000;ikkeheksesot,sprengningsrystelse gårB4.7.|7,8|B.4.1|both|P1
Brann|egenandel|FGsentralalarmaktivgir0.|8|B.4.1|both|P1
Elektrisk|omfang|Lyn/elektriskfenomen/kabelbrudd;varmepumpe/basseng bareoverspenning pånett dokumentertavnettselskap.|8|B.4.2|both|P1
Snø|omfang|Snø/ispress,takras;ikkesvakkonstruksjon/råte/montasje,drivhus/pergola/paviljong,hage/basseng/brygge/kunutstyr.|9|B.4.3|both|P1
Snø|eldrebygg/rydding|Ikkeikkeboligtakeldreenn50år;svakkonstruksjonogslikteldretak kanlikevel få200000 dokumentertrydding.|9|B.4.3|both|P1
Rørbrudd|omfang|Innvendig/utvendigrør,tilknyttetbereder/tank/pumpe/kum;rimeligtiningutvendigvann/avløp ogoppstopping/spyling.|9|B.4.4|both|P1
Rørbrudd|unntak|Ikkesvank/motfall/deformasjon,takrenne/nedløp/sluk,drens/infiltrasjon/spredning(barebrann/natur),konstruksjon/montasje/råtesamvirkning.|10|B.4.4|both|P1
Vann|omfang|Rørlekkasje/overløp/tilbakeslag,akvarium/slukkeapparat;plutselig terreng/grunnvannvannspeil utovergulv,ikkeoppforetgulv;flomlignendeplutselighageskade.|10|B.4.5|both|P1
Vann|unntak|Ikkeannetinntrengningsmåte,søl/sopp/råte/mugg/kondens,dampskade,utettvåtrom/sluk,takrenne/nedløp/taksluk,tapavvæske/gass;SuperseC.|10,11|B.4.5|both|P1
Vann|egenandelfritak|Heleboligvannstopper vedinnvendigbrudd,aktivFGvannalarm,overvannsforebyggendetiltak.|11|B.4.5|both|P1
Tyveri|omfang/unntak|Fastbygningsdel/hage/bassengtilknyttet;ikkehusstand,leieboer/gjesterutenutleietillegg,kosmetiskemerker.|11|B.4.6|both|P1
Plutselig|hovedomfang|Andreplutseligeuforutsetteskader inklvindunderstorm,glassbrudd/nedfeltplatetopp.|12|B.4.7|both|P1
Plutselig|unntak|Ingenmaskinalene/utvendigrør/bareutstyr/hage,svakgrunn/konstruksjon/rust/slitasje/egensvikt/kosmetikk;vann/råte/dyr/håndverkerfeilfølger egneB/C-regler.|12|B.4.7|both|P1
Psykolog|timer/vilkår|10timeretteralvorligbrann/ran/overfall/voldtektvedhjem;avtaltbehandler,politi,reisefolketrygd,noreiseutland,terapiinnen12mnd.|13|B.4.8|both|P1
Natur|omfang/tomt|Lovnaturinkl ustabilgrunn;gjenoppføringsforbudnyfaregir totalskade ogtomtomsetningsverdi opp til5dekar.|13,14|B.4.9|both|P1
Natur|unntak/egenandel|Kunantenne/markise/skiltogikke-direkteforebygging unntatt;8000 datert2024/2025,tilenhvertidlovbestemt.|14,30|B.4.9/B.7|both|P1
Oppføring|omfang|Bygning/materialer,entreprenør medforsikretmenikkehansløsøre;egetverktøy100000,leie/lånbrakkermedskriftligansvar50000.|14,15|B.4.10|both|P1
Oppføring|utløser/unntak|Tyverilåstbrakke/lukketbygg,montertglassundertransport/montering;ikkeute-tyveri,åpentbyggsnø/is/vindunderstorm/terreng-rørvann,råte/skadedyr/håndverkerfeil.|15|B.4.10|both|P1
Oppføring|ansvar|Graving/sprengning300000ting og3000000person.|15|B.4.10|both|P1
Skadedyr|bekjempelse|Insekter/rotter/mus inne;forhåndskontakt/rekvirertleverandør,aktivitetstarteriforsikringstid;kartleggingoginntil2behandlinger hvisførsteforsøksvikter.|15,16|B.4.11|both|P1
Gnagere|skade/lukt|Bygningsskaderotter/musogdødgnager vedvarendelukt;svekkingisolasjonmåpåvises.|16|B.4.11|both|P1
Skadedyr|unntak|Ikkegassing/varme/frys,forebygging,innbo/varer/planter/utendørs/næringsrelatert,aktivitetfør/etterforsikring,ikkeavtalttiltak,kosmetikk.|16|B.4.11|both|P1
Rullestol|sum/krav|500000beggenivå,ikkefritidsbolig;ulykke/fødseliforsikringstid,minst50%invaliditet,medfødtfastslått2år,utgifter5år,offentligstøttefratrekk,samletmedinnbo.|16,17|B.4.12|both|P1
Rydding|sum|Riving/rydding/deponering veddekketskade;førsterisikotillegg20%avsum.|18|B.5.1|both|P1
Bokostnader|beregning|Dokumentertenødvendigemerutgifter opptilmarkedsleie;udokumentert50%;umøblertgodkjentrom,12mndmarkedsleiebasis,sparteutgifterogegenforbedringsforsinkelseunntatt.|18|B.5.2.1|both|P1
Husleietap|skade|Bevisavtaltutleie,tapteinntekter fraskadetilnormalferdigstillelse;markedsleie/høyesttidligereleie;ikkeøktreparasjontidforegneforbedringer.|18|B.5.2.1.1|both|P1
Prisstigning|mekanisme|SSBbyggekostindeks franormalreparasjonsperiode;utbetalesetterreparasjon;samordnetmedbokost/leietap ellerFALrenter(høyeste).|19,23,24|B.5.3/B.6.4.4|both|P2
Klima|sum/terskel|150000vedfullverdi ogreparasjonover75%avgjenoppbygging;tiltakutoverlovkravvedgjenoppføring.|19|B.5.4|both|P1
Fullverdi|krav|Fastfolkeregistrertbolig,gjenoppbyggingsammeeiendom/sammekommunevedoffentligforbud,sammeformål,5år,sikrede/ektefelle/samboerbyggherre;ellerssærregler.|20,21|B.6.1/B.6.2.1.1|both|P1
Førsterisiko/andrebygg|verdiøkning|Førsterisikobegrensetsum;andrebygginklgarasje/utleieboligfradragforverdiøkningover40%.|20,21|B.6.1.2/B.6.2.1.2|both|P1
Oppgjør|selvarbeid|Utenhåndverkerfaktura75%normaltimeeksmva;annetegetarbeid300/time,høyestselskapetskostnad.|20|B.6.2|both|P2
Gjenoppføringavvik|oppgjør|Annetsted/formål/eiergirallverdiøkningsfradrag;ikkegjenoppført5årtakomsetning/bruksverdi.|21,22|B.6.3.1–2|both|P1
Kjøpannenbolig|oppgjør|Totalskade,boligiNorgesammeformål;taklavesteavgjenoppføringspriseKSMVAogtidligereomsetning+100%;oppussingmaks1mill/2år;alt5år;ikkepåbud/prisstigning,leietaptilovertakelse.|22|B.6.3.3|both|P1
Hageoppgjør|ungeplanter|Gjenopprettingellerslavesteavkostnad/verditap,planterunggartnerivekst;ikkeforebygging.|23|B.6.4.3|both|P2
Påbud|sum/vilkår|Direkteskadedeltekniskpåbud,grunn/fundament;fredet1mill;5år,forholdsmessigareal,hvisikkeannetoffentligdekket;ikketidligerekrav/antikvarisk/metode/forebygging.|25|B.6.4.9|both|P1
Sikkerhet|krav|Vedlikehold/takrenne2årlig,varme/snømåking/låsing,fagfolkVVS/el,krypkjeller2årlig,oljetankkontroll15årderetter5;stoppkranfravær3uker(hus),ladingoriginalogtilsyn.|26,27,28,29,40|B.6.4.10/D.4|both|P2
Aldersfradrag|tabell|Bereder/fyr/pumpe5år5%,varme/kjøling/vent/strøm10år10%,hvitevare5år10%,utvendigikkeplastrør/tank/kum/bunnledning20år5%,basseng/badeinnretning2år10%;allemaks80%.|29|B.6.4.11|both|P1
Aldersfradrag|grunnlag|Fradragreparasjon/graving/istandsettelse;eldstedelvedulikaldre;kunetterfrieår.|29|B.6.4.11|both|P1
Egenandel|samordning|Bevisetsvalgteegenandel,kunhøyestevedsammehendelseflereStorebrandforsikringer.|30|B.7|both|P1
Egenandel|tillegg8000|Enøkning8000frostinnrør,innrør>50år/plastute>30,takinntrengning>30,våtrom>30,maskinfølgevann>20utenlekkasjestopp;ikkeleggflereøkninger.|30|B.7.2|both|P1
Egenandel|bekjempelse|Skadedyrbekjempelse2000.|30|B.7.3|both|P1
Egenandel|fritak|AlarmFGbrann/innbrudd/vann,heleboligvannstopp,overvannstiltak,rullestol0.|30,31|B.7.4|both|P1
Utleiebruk|bevis/næring|Avtalthele/delutleie;familierettlinjeikkeutleie;næringunntatt,korrektbosted/godkjentareal.|33|B.8.2.6|both|P1
Ubebodd|reduksjon|Barebrann/natur/ansvar ogtakverditap;ubeboddetter12mndellerikkehovedbolig/innbofjernet;bevisførtutleie/fritidsbrukunntatt.|33|B.8.2.8|both|P1
Takvann|omfang/alder|Superfølgeskadeinntrengningoverterreng,takunder50år;ikkeutbedreutetthet/allelagførbærendesjikt/vedlikehold/konstruksjon/kondens.|34|C.1.1|super|P1
Dyr/insekter|skade/unntak|Fysiskbygning ogdødgnagerlukt;ikkekjæledyr/kosmetikk/indirektetap/næring/innbo/åpningpåvisning;isolasjonmåværesvekket,biltilkomstekstrakostkunde.|34,35|C.1.2|super|P1
Sopp/råte|omfang/tid|Ektehussopp/treødeleggenderåteutvikletiforsikringstid;ikkeandelutvikletfør/etter.|35|C.1.3|super|P1
Sopp/råte|bygningsdelunntak|Ikkefastinnredning/dør/vindu/lekter/tak/laft/utvendigtreverk utenforreisverk,soppkosmetikk,innendørsbassengrom,laftyttervegg,ikkeboligbyggeldre50.|35|C.1.3|super|P1
Sopp/råte|kostunntak|Ikkeikke-dekkettilkomst/forutgåendevann,forebygging/kosmetikk/indirektetap;isolasjonfunksjon,biltilkomstreisebetaleskunde.|35|C.1.3|super|P1
Våtrom|følgeskade|Superdekkerfølgeskade,ikkeselvevåtrom/sjiktinnenbjelkelag/stenderverk.|36|C.1.4|super|P1
Håndverker|vilkår|Superdirektefølgeskadeellerlekkasjevåtrom,autorisertarbeid<10åriereidtid/faktura/tekniskforskrift;skadeoppdagetiforsikringstid.|36,37|C.1.5|super|P1
Håndverker|reklamasjon/feil|Innenreklamasjonmåskriftligavslag/konkurs;lekkasjevåtrominklfeilen,ikkebarefeiluten skade.|36,37|C.1.5|super|P1
Håndverker|unntak|Ikkeegne/medeide/arbeidsgiverfirmaarbeid,kosmetikk,kondens,maskinalene,utvendigrør/hage/basseng,kjentfeil,sopp/råte.|37|C.1.5|super|P1
Vannstopper|tilskudd|6000veddekketinnvendigrørbrudd,forhåndsavtaltogdokumentertmontert.|37|C.1.6|super|P1
Ansvar|rolle/sum|EiendommenseierpersonansvarNorden5000000+saksomkostnader;4000egenandel.|38,40|D.1–6|both|P1
Ansvar|unntak|Kontrakt,leie/lån/bruk,familie,næring,annenfastbolig,motor/båt/luft/sprengning(oppføringegenregel),forsett/gradvisforurensning/sopp/smitte.|39,40|D.4|both|P1
Rettshjelp|sum|100000;3–10parter250000,11–25=500000,26–49=750000,50+=1mill;egenhusstandikkeflereparter;økonomiskinteressetak.|41|E|both|P1
Rettshjelp|omfang|Eier/festerNorden,advokat/rett/vitne/godkjentsakkyndig;ettertotalskadeogboligskifte;rettsmegling7500.|42,43|E.1–3|both|P1
Rettshjelp|unntak|Yrke/annenfastbolig/familie/arv/ubestridtinkasso/motor/båt/luft/straff/gammeltgrunnlag/juridiskperson/sameiere/finans>1mill/idømtekost/anke/voldgift;identifisertmotpartførvidereadvokatetterbedrageriforsøk.|43,44,45|E.4|both|P1
Rettshjelp|egenandel|4000+20%resterende;enpertvist.|45|E.5|both|P1
Tegning|Superkrav|Produktsidefastbebodd/godtvedlikeholdt/bygget1924ellersenere/ikkesopp-råte-insektskadeellerutleiesiste5år;egnekravover70år.|0|Produktside FAQ|super|P1
Vilkårsgaranti|periode/unntak|Produktside2åretterbytte;innholdikkeegenandel/samarbeidspartnerdekning.|0|Produktside FAQ|both|P1
Egenandel|produktsidekonflikt|Nettsidealarmminus4000vsfullvilkår0;nettsideflom/snø8000vsfullvilkåravtaltsatsmednaturspesial. Ikkevelgregeltenkelt.|0|Produktside FAQ/B.7|both|REVIEW
Rullestol|IPIDkonflikt|IPIDlisterombyggingunderSuper;nyer/fullHUS10 B.4.12 sierbeggenivå. Primærvilkårbevares,kildedatoavklares.|0|IPIDp1/B.4.12|both|REVIEW
Utleie|aktivering|Bevisførtavtaltførnyttforholdmedflytteunntak,privat/nonnæring/godkjentfastbolig;HUS10F siermaks3forhold,UTLEI03ingenmaks3påstand.|46|F/UTLEI03A|addon|REVIEW
Utleie|leietap|6måneder,hendelsenstartbegjæringnamsmann,slutttilbakelevering+2mnd,enkeltgangperleietaker;UTLEI03takmånedsleiebevis.|47|F.1/UTLEI03A.3.1|addon|P1
Utleie|utkastelse|Nødvendigerimeligekost20000 vednektingutflytting/bruddavtale.|47|F.2/UTLEI03A.3.2|addon|P1
Utleie|skadeverk|Forsettligskadeleietaker/gjestpåboliginnboute;ikkedyr/slitasje/hardbruk/kosmetikk/rydding/søl.|47|F.3/UTLEI03A.3.3|addon|P1
Utleie|tyveri|500000tyveri/underslagleietaker/husstandpåsted.|46,47|F.4/UTLEI03A.3.4|addon|P1
Utleie|depositum/egenandel|Minst2mnddepositumførinnflytting;3mndegenandel,høyeregaranti/depositumhelefradrag;korttidfritidsboligegenregel.|46,47|F/F.5/UTLEI03A.4|addon|P1
Utleie|frister|Skriftligutkastelsesvarselinnen14dmed14dbetalingsfrist;begjæringinnen1mndfra varsel,Storebrandinnen6ukerfraforfall.|28|B.6.4.10/UTLEI03A.6.8|addon|P1
Utleie|oppgjør|UTLEI03byggtakomsetningsverdifall,altverdiøkningsfradrag;innbobrukt/alder;75%håndverkertimeutenfaktura,300annetegetarbeid;ikkemervekstreparasjon.|48,49|F.6–7/UTLEI03A.6|addon|P1
Administrasjon|generelle|Fornyelse,politi,skjønn,regress,avgift/oppgjørsprosedyre ikke hverenegen sammenligningsrad.|1,24,31,45,49|Generelle/B.8/E.6|both|ADMINISTRATIVE
'''
rows=[]
for l in text.strip().splitlines():
 s,d,v,p,sec,lev,kind=l.split('|');rows.append(dict(inventory_id=f'SB-HU-{len(rows)+1:03}',subject=s,dimension=d,value=v,pages=[int(x) for x in p.split(',')],section=sec,levels=lev,kind=kind))
save('storebrand-hus-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,source='catalog/sources/storebrand/hus/Vilkar-hus-og-hytte-HUS10.pdf',pages_read=49,other_read=['Full9pageUTLEI03','Full2pageIPID','FullHTML','general11sharedhashalreadyreviewed'],rules=rows,notes=['Hytte-onlybranchesnotactivatedforHus;readtoavoidleakage.','IPIDrullestol,webalarmegenandelandbryggetextsourceconflictqueued.','UTLEI03exactapplicabilitynotassumedmerelybecausenewer.']))
print(len(rows),'source-first rules persisted')
