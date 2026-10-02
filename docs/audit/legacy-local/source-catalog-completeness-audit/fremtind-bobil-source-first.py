from continue_audit import *
R=[]
def r(s,d,v,l,scope='all',doc='topp'):
 R.append(dict(id=f'FBO-{len(R)+1:02d}',subject=s,dimension=d,value=v,location=l,scope=scope,doc=doc))
for q in load('fremtind-bil-independent-inventory.json')['rules'][:34]:
 if q['id']=='FBI-16':q['value']='Fastmontert50kellerbevis;Bobilfortelt/tilbygg50k,ikketyverinårbobilfjernet.'
 if q['id']=='FBI-17':q['value']='Bobil40kmax10kperting;ikkecash/gavekort/papir/smykke/klokke/tyverifratilbyggnårbobilborte.'
 if q['id']=='FBI-27':q['value']='8årreparasjonsgarantiordlydprivatbil≤3500kg;ingen sikker ubetingetallebobilregel;trengerklassifikasjon/vekt.'
 r(q['subject'],q['dimension'],q['value'],q['location'],q['scope'],q['doc'])
r('Topp løsøre','sum','100000total/10000perting;øvrigMini gjelder.','Topp§1.1s8','topp')
r('Topp nøkkel','limits','15000autorisertny/programmeringomkodingmistet/stjålet/plutseligytre;1000egenandel.','Topp§2.1.1s8–9/4.1s10','topp')
r('Topp ladekabel','limits','10000tyveri/plutseligytre;ikke fastibygg;1000egenandel.','Topp§2.1.2s9/4.2s10','topp')
r('Topp rens','limits','10000plutseligsølutenbonus/1000egenandel;ikkefølgeelektronikk/rift;over10kordinærkasko.','Topp§2.1.3s9/4.3s10','topp')
r('Topp parkering','conditions','Ukjentvolder/kjenttidsted;tilførstehovedforfalletter6år;ellersordinærkasko.','Topp§2.1.4s9','topp')
r('Topp feilfylling','deductible','1000egenandel menbonustap.','Topp§2.1.5s9/4.4s10','topp')
r('Topp ferieavbrudd','limits','Alternativovernatting1500/dag15drestplanlagtferie,etterpåbegyntferie/dekketskade,dokumentertkvittering.','Topp§2.1.6s9/3.1s10','topp')
r('Topp fukt','conditions','Tak/vegger/gulv;beståttautorisertcaravantestgyldig1år;ikkeutenforperiode/eldre15årfraregistrertny.','Topp§2.1.7s9','topp')
r('Topp nyverdi','conditions','3år/100000km/>80%nypris;ikkelesing;utgåttmodellkontantsisteliste.','Topp§3.1s9–10','topp')
r('Topp leasing','conditions','3år/100000km/>80%nypris startleiemedforholdsmessigrestmåneder.','Topp§3.1s10','topp')
for q in load('fremtind-bil-independent-inventory.json')['rules'][41:49]:r(q['subject'],q['dimension'],q['value'],q['location'],q['scope'],q['doc'])
r('Utleie','channel_rule','DNB inkludererprivatutleie2mnd/årgratis;sammesideforbudutleie;fullkaskokreverbevis.','DNB Leieut og Hvaikkedekket;Kasko§1.1','kasko','web')
r('Kanal-versjon','conflict','DNBmatrix80ktoppbagasje motfull100k;webFAQ10kutstyrmotPDF50k;webNordenmotPDFEuropaekskl4land;webferie2ukermotPDF15d;webinkludertmaskin/leieToppmotIPIDvalgfri og ingenkomponentiToppPDF.','DNBpage/fullPMO2025/IPIDV106','all','web')
r('Minikasko nyverdi','level_conflict','FullMini har1år15kkmregel;DNBmatrixnybilbareKasko. Ikkevelg nivåtilfeldig.','Mini§3.2s5/DNBmatrix','physical','web')
r('Sikkerhet','customer_rule','Forsikringsbevis valgte komponenter/årligkjørelengde/sikkerhetsforskrifter;kundedata harforrang.','Full§3s1/IPIDV106s2','all','ipid')
r('Generelle vilkår','scope','Felles vilkår/lovvalg/krig/terror/atom;tidligerehashkontrollert;ikkevilkårligproduktvalg.','Generelle§1–15','all','general')
save('fremtind-bobil-independent-inventory.json',dict(source_first=True,rules=R,shared_inventory_reuse='FBI01–34 current 2025 common clauses; exactbobil additions reviewed13p, DNBHTML complete, IPID/rental/machine samehash earlier reviewed; Bobil top exact not Bil top.',source_conflicts_preserved=True));print(len(R))
