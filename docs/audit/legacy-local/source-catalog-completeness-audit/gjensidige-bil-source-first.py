from continue_audit import *
rows='''all|Grunndekninger|status|Ansvar, fører/passasjerulykke og rettshjelp inngår på alle fire nivåer.|1/IPID1
all|Ansvar|summer|Personskade ubegrenset, tingskade 100 millioner kr; ingen ordinær egenandel.|1
all|Rettshjelp|grunnsum|100 000 kr per tvist, innen økonomisk interesse.|1/9
all|Ulykke|grunnsummer|100 000 kr død og 200 000 kr invaliditet; ingen egenandel.|1
all|Geografi|områder|Europa unntatt Kosovo, Russland og Belarus; rettshjelp i Norden.|3/IPID2
all|Forsikret krets|omfang|Forsikringstaker og lovlig bruker; fysisk forsikring også registrert eier og andre med tinglyst eiendomsrett.|3
all|Registrering|opphør|Gyldig mens registrert; automatisk opphør ved salg, vraking, tyveri, avregistrering og endret leasingtaker.|1–2/11
all|Egenandel|ung fører|Hvis avtalt rabatt for alle førere over23 brytes: 15 000 kr ekstra kasko eller 15 000 ansvar; unntak for fullført Gjensidige øvelseskjøringsprogram.|1–2
all|Egenandel|triller uten fører|Privat 5 000 kr, næring15 000, også når skaden ellers ikke utløser egenandel.|1–2
all|Bruk|pliktig melding|Privatbil til næringstransport og teknisk endring må meldes; ellers mulig avkortning/bortfall.|2
all|Årlig kjørelengde|avkortning|Feil stand/overskredet årlig kjørelengde gir prisforholdsmessig reduksjon; gjennomsnitt korrigeres fra forrige hovedforfall.|2
physical|Sikkerhet|lås/utstyr|Lukket/låst, nøkkel separat/utilgjengelig, ekstrahjul innelåst utenom fellesrom eller fastlåst, tyveriutsatte ting skjult innelåst; henger sikret mot påkobling.|1–2
all|Sikkerhet|dekk|Lovlig mønster og dekk tilpasset forhold.|1–2
physical|Objekt|ekstrahjul|Ett sett ekstra dekk og felger følger kjøretøyet.|3
physical|Objekt|unntak|Kontanter og verdipapirer ikke forsikret; ulovlig innførte varer/tjenester unntatt.|3
physical|Brann|hendelser|Åpne flammer, lyn og eksplosjon.|3
physical|Tyveri|hendelser|Tyveri og forsøk på tyveri.|3
physical|Glass|omfang|Brudd på ruter og glasstak; solcellepanel ikke glass, eventuelt kasko.|3
physical|Glass|sum og egenandel|Reparasjon sum1 000 kr / skifte ubegrenset; egenandel0/3 000 kr. Sum og egenandel må være ulike dimensjoner.|1
physical|Brann/tyveri|egenandel|6 000 kr i offentlig standardeksempel; individuelt bevis går foran.|1
physical|Utstyr|sum|Fastmontert ekstrautstyr Delkasko10 000; Kasko/Pluss50 000.|1
physical|Løsøre|sum|Delkasko5 000; Kasko/Pluss10 000.|1
physical|Veihjelp|egenandel|750 kr.|1
physical|Veihjelp|hendelser/transport|Skade, tyveri, driftsstans, sykdom/ulykke/død; bil og henger til nærmeste verksted, også utelåsing.|3–4
physical|Veihjelp|hjemtransport/hotell|Hjemtransport ved personhendelse eller bil stjålet/ikke reparert innen2virkedager; bil etter reparasjon/funn. Rimelig hotell alternativt og nødvendig lokaltransport.|3–4
physical|Veihjelp|unntak|Ikke over bil/hengerverdi; ingen reparasjonsdeler, godsvideresending, ordinære reiseutgifter eller dyrere enn rimeligste transport. Ikke hjemtransport hvis noen kan kjøre.|3–4
physical|Fysisk skade|begrensninger|Ugodkjent trim/tuning/software, slitasje/gradvis skade, garanti/reklamasjon, banekjøring med føreropplæring/NAF-unntak og verdiforringelse etter reparasjon.|3
lowerphysical|Fysisk skade|batteri/unntak|Delkasko/Kasko unntar batteriskade alene; Kasko også varmgang/korrosjon/rust/irr/tæring.|3
kasko|Kasko|hendelser|Plutselig ytre skade og feilfylling.|3
kasko|Nøkkel|hendelser/frekvens|Tapt, stjålet eller skadet bilnøkkel, én skade per forsikringsår.|3
kasko|Nøkkel|sum/egenandel|Kasko7 500/Pluss15 000 kr; egenandel1 500 kr.|1
kasko|Ladekabel|omfang/egenandel|Hybrid/elbil tyveri eller ytre skade; egenandel2 000 kr.|1/3
kasko|Leiebil|reparasjon|Samme størrelse som forsikret bil, maks mellomklasse stasjonsvogn; Kasko30 dager, Pluss60 dager mens bilen er på verksted i normal reparasjonstid.|3
kasko|Leiebil|totalskade/tyveri|Til oppgjør mottatt, maks30 dager, også oppgjør etter totalskadegaranti.|3
kasko|Leiebil|unntak|Ingen betalt reparasjon eller valgt kontantoppgjør; mer enn2virkedager etter ferdig rep; bareglass/punktering; leverandørkrav og ikke drivstoff/bom/parkering.|3–4
kasko|Leiebil|utlandet|Feriereise utenfor Norden, ikke reparerbar innen3virkedager: lignende bil maks15d for å fullføre ferie.|4
kasko|Leiebil|kontantalternativ|Kontanterstatning i stedet kan avtales når leiebil er dekket under reparasjon; ingen fastsum.|15
kasko|Reparasjonsgaranti|åtteår|Dekket skade reparert hos avtaleverksted: utbedring, veihjelp, leiebil/kontant etter vilkårene; rustgaranti minst8år med vedlikehold, også etter selskapsbytte.|15
kasko|Totalskadegaranti|alder/km|Kasko og Pluss: inntil1år fra første registrering og inntil20 000 km i lokale offentlige fullvilkår.|15
kasko|Totalskadegaranti|utløsende/erstatning|Tapt bil eller reparasjon over markedsverdi; tilsvarende ny bil eller selskapets nybilkostnad kontant. Person/varebil inntil3,5t og bobil.|15
kasko|Totalskadegaranti|unntak|Bedriftseid/lease unntatt; brann/tyveri også unntatt hvis eieren kjøpte bilen brukt.|15
physical|Oppgjør|reparasjon/kontant|Likeverdige deler, forbedringsfradrag; kontant arbeid50%, avgifter etter betalt; manglende deler gir kontantoppgjør.|15
physical|Oppgjør|tap|Gjenanskaffelse samme stand/fabrikat/type/årgang; selskapet overtar rester.|15
physical|Utstyr|aldersfradrag|Ettermontert elektronikk: etter første år10% per påbegynt år maks50%.|15
physical|Egenandel|dyr|Avtalt egenandel reduseres2 000 kr ved påkjørsel dyr for kjøretøy til og med3,5t.|16
pluss|Maskinskade|alder/km|Inntil første hovedforfall etter12år eller200 000 km, første inntrufne grense.|1
pluss|Maskinskade|komponenter|Plutselig/uforutsett skade på spesifiserte fremdrifts-/styrings-/kjølesystemer og tilhørende elektronikk; el/hybrid høyspentbatteri/varme-kjøling/lader og relevant AC.|3
pluss|Maskinskade|unntak|Clutch inklhydraulikk, oljeoverforbruk uten bruddskade, eksos unntatt manifold, katalysator/partikkelfilter; ikke gradvis skade/garanti.|3
pluss|Maskinskade|vedlikehold|Produsentforbedring/service og tidligere eieres service må dokumenteres; egne arbeider med kvitteringer; effekt må ikke endres.|2
pluss|Maskinskade|egenandel|0–119999km10 000;120000–159999km14 000;160000–200000km18 000.|16
pluss|Parkering|uten bonustap|Ytre skade av ukjent skadevolder,20 000 kr, samme egenandel som Pluss; til første hovedforfall etter10år.|1
pluss|Leiebil|teknisk Norden|Ikke kjørbar og ikke reparerbar på stedet: inntil15dager mellomklassestasjonsvogn; selskapet velger verksted/tid.|4
pluss|Startleie|sum/vilkår|150 000 kr maks, forholdsmessig etter gjenstående måneder ved dekket kondemnasjon eller tyveri uten gjenfunn.|15
optional|Punktering|valgfri|Valgfri på Kasko/Pluss;1 000 kr egenandel uten bonustap;2 500 kr per dekk.|1/16/IPID1
optional|Punktering|kontroll|Dekksjekk mindre enn1år hos godkjent verksted; egnet dekk min3mm sommer/4mmvinter; riktig sesong/kjøreforhold; reparasjon hvis forsvarlig.|16
optional|Punktering|følgeskade|Felg/understell håndteres ordinær kasko; barepunktering gir ikke leiebil.|3–4
optional|Økt utstyr/spesiallakk/funksjonsutstyr|avtalemulighet|IPID dokumenterer mulige utvidelser, men angir ikke sum eller presis nivåtilgjengelighet; aldri kundens valg.|IPID1
all|Ulykke|hendelser|Rettmessig fører/passasjer i/på/ved motorvogn når motorvogn/tilkobletutstyr direkte årsak; ytre hendelse, fall uten sykdom, kne/ankelvridning, navngitte brudd ved hopp.|5
all|Ulykke|dødsfall vilkår|Død innen1år; tidligere forskudd trekkes fra;50 000 kr dersom ingen barn/ektefelle/samboer eller forsørgede foreldre.|6
all|Ulykke|invaliditet|Proporsjonal medisinsk invaliditet, forfunksjon trekkes fra, ingen hvis død innen1år; senest3årsfastsettelse, samlet1million ved flere skadde motorvognpassasjerer.|6
all|Ulykke|vesentlige unntak|Sykdom/besvimelse/disposisjon, psykisk skade alene, navngitte muskeltilstander, tann tygging og tanninvaliditet; selvmord med snevert akutt sinnsforvirringsunntak.|5
all|Rettshjelp|omfang|Eier/bruker/fører i Norden; også etter salg og ved neste kjøp hvis tilsvarende objekt forsikret før kjøpet.|7
all|Rettshjelp|kostnader|Advokat/gebyr/vitner; ikke-rettsoppnevnt sakkyndig maks40% av sum/interesse; gruppesøksmål særgrenser20 000/500 000.|7–8
all|Rettshjelp|mekling|Mekle.no alternativ,0egenandel, ingen egenadvokatutgift, kan avslutte uten å miste videre rettshjelp.|7/9
all|Rettshjelp|begrensninger|Ikke ankegebyr/idømte kostnader/voldgift/før tvist; yrke, familie, straff, ikke forsikret kjøretøy, tidligere grunnlag ved nytegning unntatt; flytting unntak.|7–8
all|Rettshjelp|flerpart/sum|1–2parter100 000;3–10 250 000;11–25 500 000;26–49 750 000;50+1million; ikke over økonomisk interesse.|9
all|Rettshjelp|egenandel|4 000 kr pluss20% av dekkede utgifter; én per tvist. Mekle.no0 separat.|9
all|Bonus|opptjening/tap|Tabell0–80%;75merenn3år faller til75førsteår;75første3år til70;70 til60;10–60 tap10;80historisk til70førsteår.|10
physical|Bonus|skadefritak|Brann/tyveri/glass/veihjelp,dyr,natur,ladekabel,nøkkel innen sum og maskinskade gir ikke bonustap; bare faktisk valgt relevant dekning.|10
all|Ettervern|eierskifte|14d etter eierskifte til ny eier tegner egen forsikring; automatisk opphør kjøretøy samordnes.|11
all|Generelle unntak|krig|Motorvogn unntatt UD-reiseadvarselsområde;6uker hvis allerede der når advarsel gis.|11–12
all|Generelle unntak|terror/atom|Terror selskapstak1milliard/48timershendelse og Nordenbegrensning med personskadeansvarunntak; atom/kjemisk unntak egne personskademekanismer.|12
all|Administrasjon|lov/frister/klage|Avtalehierarki, årsfornyelse, melding, tvistprosedyre, personvern og klage er kildeinformasjon; ingen ordinære coveragefacts.|11–14'''
out=[]
for n,line in enumerate(rows.splitlines(),1):
 scope,sub,dim,value,location=line.split('|');out.append(dict(id=f'GJ-BIL-{n:03}',scope=scope,subject=sub,dimension=dim,value=value,location=location))
save('gjensidige-bil-independent-inventory.json',dict(source_first=True,catalog_values_inspected=False,sources=['catalog/sources/gjensidige/'+n for n in ['bil-ansvar-alminnelige-vilkar.pdf','Bil-Delkasko-alminnelige-vilkar.pdf','Bil-Kasko-alminnelige-vilkar.pdf','Bil-Pluss-alminnelige-vilkar.pdf','Bilforsikring-Produktark-MOT01.pdf']],complete_contents_read=True,page_reuse='gjensidige-bil-page-identity.json; whitespace-normalized exact text matches, not inferred similarity',rules=out,scope_notes=['Location pages assume physical variants; Ansvar common accident/legal/bonus/general chapters are one page earlier.','Generic settlement chapter mentioning Kasko/Pluss is not inclusion on Ansvar/Delkasko.','Sample PDF label Forsikringsbevis does not imply private customer artifact: authoritative public downloaded templates.','IPID Pluss unlimited repair rental vs fullterms60days conflict; preserve both.','Actual customer values including historical newvalue/mileage remain outside this audit and retain precedence.','Optional equipment/IPID not enough for unconditional Ansvaravailability claim.']))
print(len(out),'independent rules persisted before catalog values')
