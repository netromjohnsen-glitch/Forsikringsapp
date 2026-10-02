from continue_audit import *
rows='''Avtale|valg/sum|Bare bevisets dyr og valgte dekninger; veterinærsum kundespesifikk, IPIDvalg opptil50000/år.|2|3/4/IPID1|both|CUSTOMER_SPECIFIC
Geografi|verden|Hele verden, hendelseiforsikringstid.|2|2|both|P1
Veterinær|omfang|Nødvendig sykdom/skadeundersøkelse/behandling,bruktemedisiner/materiellogklinikkopphold.|2|4.1|both|P1
Allergi|sum/vilkår|Førstegangsdiagnostisering/behandlingatopi15000;ikkeørehudsymptomfør/20d,antistoffinnen3mndregnesførkjøp.|2,3|4.1/4.2|both|P1
Kastrering|diagnoser|Dekketvedfødselsskade/prolaps/diabetes/livmor/prostata/perineal/analadenom/testikkelbetennelse-torsjon/urethra/akromegali/reproduksjonskreft.|2|4.1|both|P1
Avliving|sum/vilkår|2000avlivning/kremeringtil10årvederstattetulykke/sykdom.|2|4.1|both|P1
Tannulykke|omfang|Basekun trekkingtennerknektvedulykke.|2,3|4.2|both|P1
Veterinær|unntak|Ikkeforebygging/rehab/reise/fôr/utlevertemedisiner/alternativ/adferd/komplikasjonikkedekkethendelse/etteropphør.|2,3|4.2|both|P1
Karenstid|tid/økning|Eksisterendesykdom/skadeogsykdom20dfraopprinneligforsikringunntatt;økningskarensbareøkningsdel.|2,3|4.2|both|P1
Medfødt|ledd|HDAD/OCD/patella/shortulna/Calve:forsikretfør4mndellerNKKfri;HDADdokumentertefrieforeldre.|2|4.1.2|dog|P1
Korsbånd|vilkår|Før4mndellerkontinuerligminettårførskade.|2|4.1.3|dog|P1
Keisersnitt|antall/raser|Ettilivet,ikkeEngelsk/FranskBulldog,BostonTerrier,Pomeranian,Chihuahua.|2|4.1.6|dog|P1
Rasesykdom|unntak|Navngittehud/øyeraseunntakogbrachycephalluftveiikkeomfattet.|3|4.2.7–9|dog|P1
Tannsykdom|tillegg/sum|Valgfritt20000perhendelse/år;tannkjøtt/melketann/medisinskfeilstilling,klinikkmedisininkl.|3|5.1|dental|P1
Tannsykdom|unntak/tid|Ikkeforebygging/rehab/reise/fôr/utleverte,eksisterende/20d;behandlingutoverettåretteropphørunntatt(distinktfraordinærvet).|3|5.2|dental|P1
Medisin|tillegg/sum|Valgfritt20000perhendelse/år,respetforomfattetlidelse;50%veterinærforeskrevetspecialfôr.|3|Hund6/Katt5|medicine|P1
Forsikringssum|samordning|Veterinær+medisinsamlestilbevisetsumperhendelseogsammeskadetilfelleoverflereår;ikkeautomatiskårligresetforpågåendehendelse.|3,4|Hund8.4/Katt7.4|both|P1
Egenandel|vet/tann/medisin|25%skade,min1000,enperhendelse;ikke1000pluss25%.|4,5|Hund8.6/Katt7.6|both|P1
Tap|hendelser|Hunddød/avliving/stjålet/forsvunnet/bruksverdi;Kattdød/avliving/tyverivedinnbruddbygning. IPIDkattogsåforsvunnet,konflikt.|3,4|Hund7/Katt6|loss|REVIEW
Tap|unntak|Eksisterende/20d,komplikasjonikkeomfattet;hundadferdsavlivingunntatt.|3,4|Hund7.2/Katt6.2|loss|P1
Tap|opphør|Førstehovedforfalletter10år,ikkeselve10årsdagen;HTMLåretetterkanværeupresist.|2|2|loss|P1
Tap|aldersfradrag|20%forhverheleåreldreen7;ingenøvreprosentoppgitt.|3,5|Hund8.5/Katt7.5|loss|P1
Tap|egenandel|Ingenegenandel.|4,5|Hund8.6/Katt7.6|loss|P1
Tap|oppgjør|Tilsvarenderaseverditakbevis;trekkalleredeutbetaltbruksverdiHund;forsvunnetHund/stjåletKattførst3mndetterpolitimelding;returnertdyrtilbakebetaling.|3,4|Hund8.4/Katt7.4|loss|P1
Brukshund|ytelse|50%tapssumvedfullttaptrentregelmessigbruksfunksjon;under8år,ikkeavl;medfødt/HDADvilkårsomkilden.|4|7.3/8.4|dogloss|P1
Sikkerhet|plikter|Straksveterinær/pleie/sikrettransport/ikkesolvarmbil;Hundvaksineårlighelsesjekk,Kattkattepest.|4,5|Hund10/Katt9|both|P2
Tegning|alder|HTML5uker–6år,8årvedflytting;hundlovligrase,annenFrendeskadeforsikringkreves.|0|HTMLFAQ|both|P1
IDmerking|krav|Kattalltid;Hundsumover15000.|0|HTMLFAQ|both|P1
Videovet|tjeneste|Videokonsultasjonutenegenandelvedsykdom/skadefraIPID;HTMLråd/behandling/henvisning.|0|HTML/IPID1|both|P2
Veterinær|opphørsalder|HundveterinærkanbeholdeshelelivetfraHTML,ikkeblandmedtap10år.|0|HTMLFAQ|dog|P1
Ansvar|ikkeomfattet|Hundeforsikringikkeskadepåandresperson/ting;innbohenvisningikkeegenhundedekning.|0|HTMLFAQ|dog|P1
Administrasjon|felles|Melding1år/politi/obduksjon/dokumentasjongenereltikkeselvstendigecoveragefacts.|3,4,5|Oppgjør/frister|both|ADMINISTRATIVE'''
rules=[]
for i,l in enumerate(rows.splitlines(),1):
 s,d,v,pg,sec,scope,kind=l.split('|');rules.append(dict(inventory_id=f'FR-PE-{i:03d}',subject=s,dimension=d,value=v,pages=[int(x) for x in pg.split(',')],section=sec,scope=scope,kind=kind))
save('frende-pet-independent-inventory.json',dict(source_first=True,catalog_fact_values_inspected=False,read_sources={'frende-dog-terms.pdf':5,'frende-cat-terms.pdf':4,'frende-dog-ipid.pdf':2,'frende-cat-ipid.pdf':2,'frende-dog-product.html':'full','frende-cat-product.html':'full'},rules=rules));print(len(rules))
