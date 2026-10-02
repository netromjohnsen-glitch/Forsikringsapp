"""Manual semantic review entries. No automated source-to-catalog assertions.
Every row is anchored in pages actually read by the auditor; no pending product is marked complete.
"""
import json,hashlib
from pathlib import Path
O=Path('/tmp/source-catalog-completeness-audit');R=Path('/Users/morten/Documents/forsikringsapp')
C=json.loads((O/'catalog.json').read_text());P={p['productId']:p for p in C['products']}
rows=[];reviews=[];observations=[]
PRESENT='SOURCE_FACT_PRESENT_AND_CATALOGUED';MISSING='SOURCE_FACT_PRESENT_BUT_MISSING_FROM_CATALOG';COARSE='CATALOG_FACT_TOO_COARSE';CUSTOM='SOURCE_FACT_CUSTOMER_SPECIFIC';ADMIN='NOT_COMPARISON_RELEVANT';REVIEW='REVIEW_REQUIRED';MISMATCH='CATALOG_FACT_SEMANTICALLY_MISMAPPED'
def fact(products,file,page,section,subject,dimension,value,classification,keys=(),priority=None,component='',note='',status='POSITIVE_COVERAGE_ASSERTION',confidence='HIGH'):
 for pid in products:
  p=P[pid];path=next((R/'catalog').rglob(file));h=hashlib.sha256(path.read_bytes()).hexdigest()
  facts=p['addonFacts'].get(component,[]) if component else p['facts']
  allfacts=p['facts']+sum(p['addonFacts'].values(),[])
  matching=[f for f in facts if f['key'] in keys]
  rows.append({'provider':p['providerId'],'insurance_type':p['insuranceType'],'scope':p['agreementScope'],'product':pid,'version':p['version'],'component':component,'source_artifact':str(path.relative_to(R)),'source_sha256':h,'source_location':f'PDF side {page}, {section}' if page else section,'semantic_subject':subject,'semantic_dimension':dimension,'structured_value':value,'fact_status':status,'advisor_relevance':'ADMINISTRATIVE' if classification==ADMIN else 'CORE' if priority=='P1' else 'IMPORTANT_DETAIL','catalog_match':json.dumps(matching,ensure_ascii=False),'classification':classification,'confidence':confidence,'priority':priority or '', 'manual_validation':True,'catalog_full_fact_count_checked':len(allfacts),'reason':note,'proposed_keys':list(keys),'source_excerpt':'','root_cause_id':'SCRC-001' if p['providerId']=='tryg' else 'SCRC-002','audit_review_status':'MANUALLY_CHECKED'})
def review(pids,files,reason,depth='SOURCE_PACKAGE_DEEP_REVIEW'):
 for pid in pids: reviews.append({'product_identity':P[pid]['identity'],'product_id':pid,'family':P[pid]['insuranceType'],'provider':P[pid]['providerId'],'scope':P[pid]['agreementScope'],'source_artifacts':files,'depth':depth,'source_content_beyond_catalog':True,'source_first':P[pid]['providerId']=='if','reasoning':reason,'full_product_inventory_complete':False})
for species,filename,period in [('hund','tryg-dog-treatment-terms.pdf','01.01.2026'),('katt','tryg-cat-treatment-terms.pdf','01.07.2026')]:
 ps=[f'tryg-{species}-behandling']; extra=f'tryg-{species}-ekstra'; ef=f'tryg-{"dog" if species=="hund" else "cat"}-extra-terms.pdf'; lf=f'tryg-{"dog" if species=="hund" else "cat"}-life-terms.pdf';life=f'tryg-{species}-dod'
 fact(ps,filename,1,'3 Egenandel','Veterinær','egenandel per sykdom/ulykke','2 500 kr per sykdom og per ulykkestilfelle',COARSE,['dyr.veterinar.egenandel.fast'],'P1',note='Katalogen har bare Fremgår av forsikringsbeviset. Fullvilkår og lagret produktside oppgir konkret standard; kundens bevis skal fortsatt ha forrang.',status='LIMITATION')
 fact(ps,filename,2,'4 Erstatningsberegning','Veterinær','sumperioder','Valgt sum per sykdom/ulykke OG samlet per forsikringsår',COARSE,['dyr.veterinar.sum.valgbar'],'P1',note='Valgt beløp er kundevalg; både per-skade- og årsbegrensning er produktfakta som mangler.',status='LIMITATION')
 fact(ps,filename,1,'1 Omfang','Veterinær','kundens valgte beløp','Forsikringssum fremgår av forsikringsbeviset',CUSTOM,['dyr.veterinar.sum.valgbar'],note='Ingen katalogmangel i at faktisk valgt kundesum mangler.',status='CUSTOMER_SPECIFIC_REFERENCE')
 fact(ps,filename,1,'3 Utgifter','Diagnostikk','CT og MR','Veterinærrekvirert CT/MR dekkes',MISSING,['dyr.diagnostikk.dekning'],'P1',note='Finnes ikke som verdi eller alternativ nøkkel i materialisert base/tillegg.')
 fact(ps,filename,1,'3 Utgifter','Legemidler','dekning','Medisin og legemidler ordinert av veterinær',PRESENT,['dyr.medisin.dekning'])
 fact(ps,filename,1,'3 Utgifter','Spesialfôr og sjampo','andel','50 % av veterinærordinerte utgifter',MISSING,[],'P2',note='Viktig produktsærskilt kostnadsandel; anbefales som underdetalj, ikke universell symmetrisk dekning.')
 fact(ps,filename,1,'3 Unntak','Karenstid','sykdom','20 dager; flytting med samme dekning unntatt',COARSE,['dyr.karenstid.sykdom'],'P2',note='20 dager korrekt; flytteunntaket mangler.',status='LIMITATION')
 fact(ps,'tryg-dog-product-terms.pdf',1,'4 Varighet','Veterinær','opphør','Behandling og Ekstra kan beholdes hele livet',MISSING,['dyr.veterinaralder.opphor'],'P1',note='Dyr-produktvilkår eksplisitt Hund og Katt; ingen antatt artsarv.')
 fact(ps,'tryg-dog-product-terms.pdf',1,'3 Geografi','Geografi','område','Europa',MISSING,[],'P2',note='Produktvilkår og IPID dokumenterer samme område.')
 fact(ps,ef,1,'Rehabilitering','Rehabilitering','grense','10 000 kr per sykdom/ulykke',PRESENT,['dyr.rehabilitering.grense'],component=extra,status='OPTIONAL_AVAILABILITY')
 fact(ps,ef,1,'Tann- og tannkjøttsykdommer','Tannsykdom','kombinert grense','30 000 kr per sykdom/ulykke og per forsikringsår',PRESENT,['dyr.tannsykdom.grense'],component=extra,status='OPTIONAL_AVAILABILITY')
 fact(ps,ef,1,'Egenandeler','Ekstra','egenandel','2 500 kr rehabilitering/tann; ingen egenandel livreddende valp/kattunge',MISSING,[],'P1',component=extra,note='Tilleggets kostnadsregler er utelatt; skal fortsatt være valgfrie.',status='LIMITATION')
 fact(ps,lf,1,'1 Omfang','Liv','valgt sum','Valgt sum i bevis, begrenset til gjenanskaffelsespris',CUSTOM,['dyr.liv.sum.valgbar'],component=life,note='Kundens faktiske beløp skal ikke fylles inn fra standardkatalog.',status='CUSTOMER_SPECIFIC_REFERENCE')
 fact(ps,lf,2 if species=='hund' else 1,'3 Erstatning','Liv','aldersreduksjon',('Hund: 20 % årlig reduksjon; start etter rasegruppe; gulv 50 % minst 5 000 kr' if species=='hund' else 'Katt: 20 % årlig fra 7 år; gulv 40 %'),MISSING,['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats'],'P1',component=life,note='Materiale utbetalingsregler mangler. Hunde-startalderen 9/10 år er holdt utenfor dette sikre funnet og loggført separat som kildekonflikt.',confidence='HIGH',status='LIMITATION')
 fact(ps,'tryg-pet-ipid.pdf',2,'Hvordan sier jeg opp','Administrasjon','kontakt','Oppsigelse via telefon/e-post',ADMIN,note='Ingen egen canonical sammenligningsrad nødvendig.',status='ADMINISTRATIVE_RULE')
 review(ps,[filename,ef,lf,'tryg-pet-ipid.pdf','tryg-dog-product-terms.pdf',f'tryg-{"dog" if species=="hund" else "cat"}-product.html'],'Korte fullvilkår, IPID og produktside gjennomlest. Markedsmatriser har duplisert responsivt innhold; ikke brukt til å overstyre presise vilkår. Klinisk begrensning, sumperioder og livsmodell bevart som separate kandidater.')
fact(['tryg-katt-behandling'],'tryg-cat-extra-terms.pdf',1,'Tann- og tannkjøttsykdommer','Tannresorpsjon','årlig undergrense','TR 5 000 kr per forsikringsår innen tannrammen',COARSE,['dyr.tannsykdom.grense'],'P1',component='tryg-katt-ekstra',note='Generell 30 000-grense er bevart, særgrensen for TR er ikke representert.',status='LIMITATION')
fact(['tryg-hund-behandling'],'tryg-dog-extra-terms.pdf',1,'Huggormforsikring','Huggormbitt','egenandel','Ingen egenandel',MISSING,[],'P2',component='tryg-hund-ekstra',note='Egen særfordel utover generell behandling; ikke en separat hovedforsikring.',status='OPTIONAL_AVAILABILITY')
for species in ['hund','katt']:
 f=f'if-{"dog" if species=="hund" else "cat"}-terms.pdf'; ipid=f'if-{"dog" if species=="hund" else "cat"}-ipid.pdf';ps=[f'if-{species}-{level}' for level in ['basis','standard','super']]
 fact(ps,f,4,'5.1 Veterinær','Veterinær','årsperiode','Valgt forsikringssum per forsikringsår',COARSE,['dyr.veterinar.sum.valgbar'],'P2',note='Katalogen sier valgbar sum, men ikke årlig periode.',status='LIMITATION')
 fact(ps,f,4,'5.1 Veterinær','Veterinær','valgt egenandel','Avtalt egenandel per skade/sykdom i bevis',CUSTOM,['dyr.veterinar.egenandel.fast'],note='Faktisk valgt egenandel er korrekt kundespesifikk.',status='CUSTOMER_SPECIFIC_REFERENCE')
 fact(ps,f,4,'5.1.2','Tannulykke','dekning','Tannbehandling ved ulykke inkl. rotspissabcess ved avskalling/fraktur',MISSING,['dyr.tannskade.dekning'],'P1',note='Eksplisitt inkludert på alle tre nivåer; tannsykdom er separat og ikke ekvivalent.')
 fact([ps[0]],f,4,'5.1.1','Medisin','behandlingssted','Medisin/bandasjer brukt hos veterinær inkludert; hjemmekjøpt utvidelse Standard/Super',MISSING,['dyr.medisin.dekning'],'P1',note='Basis mangler hele medisin-dimensjonen; kan ikke kopiere Standard sin bredere dekning.')
 fact([ps[1]],f,4,'5.1.3','Tannsykdom','livstidsgrense',('15 000' if species=='hund' else '5 000')+' kr i løpet av dyrets liv',COARSE,['dyr.tannsykdom.grense'],'P1',note='Katalogens beløp er korrekt men mangler livstidsperioden; årlig sum er ikke ekvivalent.',status='LIMITATION')
 fact([ps[1]],f,4,'5.1.4','Allergibehandling','livstidsgrense','15 000 kr i løpet av dyrets liv',MISSING,['dyr.allergi.dekning','dyr.allergi.grense'],'P1',note='Standard har ingen allergifaktum. Super-faktum inngår ikke i Standard; produktmatrise og brødtekst samsvarer.')
 fact([ps[2]],f,5,'5.1.9','Rollover','kvalifiserende vilkår','10 000 kr overføres bare ved skadefritt forsikringsår',COARSE,['dyr.veterinar.rollover'],'P1',note='Katalog sier ubrukt sum overføres automatisk, uten det skadefrie kravet. Ubrukt og skadefritt er ikke samme vilkår.',status='LIMITATION')
 fact(ps,f,8 if species=='hund' else 7,'6.2.1','Karenstid','sykdom','20 dager; ikke ved direkte flytting/annen If-eier; ny periode for utvidelse',MISSING,['dyr.karenstid.sykdom'],'P1',note='Gjelder Basis, Standard og Super; ingen relevant nøkkel i base eller Liv.',status='LIMITATION')
 fact(ps,f,4,'4 Varighet','Veterinær','opphør','Kan beholdes hele livet',MISSING,['dyr.veterinaralder.opphor'],'P1')
 fact([ps[2]],f,5,'5.1.5','Rehabilitering','frist','Innen ett år etter skaden, rekvirert/utført av veterinær, innen veterinærsum',COARSE,['dyr.rehabilitering.dekning'],'P2',note='Forelderdekning finnes; kvalifikasjon, varighet og ramme mangler.',status='LIMITATION')
 fact([ps[1]],f,4,'5.1.1','Medisin','utvidelse','Medisin også kjøpt separat etter behandling',COARSE,['dyr.medisin.dekning'],'P2',note='Inkludert er sant; omfanget bør forklare forskjellen fra Basis.')
 fact(ps,f,9 if species=='hund' else 8,'7.1','Administrasjon','skademelding','Melding og tilgjengelig dokumentasjon til selskapet',ADMIN,status='ADMINISTRATIVE_RULE',note='Vanlig skadeadministrasjon, ikke materialt produktfaktum.')
 fact(ps,f,5,'5.2 Liv','Liv','valgfrihet','Liv bare hvis avtalt i beviset',PRESENT,['dyr.liv.dekning'],component=f'if-{species}-liv',status='OPTIONAL_AVAILABILITY')
 fact(ps,f,6 if species=='hund' else 5,'5.2 Liv','Liv','aldersmodell','Hund raseavhengig 20 % reduksjon; Katt fra året 10 til fornyelse året 13',PRESENT,['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats','dyr.liv.opphor'],component=f'if-{species}-liv',note='Basisforløpet er representert. Ingen universell Hundealder skal oppfinnes; rasegruppen er dokumentert i kilden.')
 review(ps,[f,ipid],'Kildens nivåmatrise, definisjoner, behandlingsbestemmelser, unntak, liv og oppgjør lest før eksakt nøkkelkontroll. Avgrenset Valpekull/Kattunge er eget produkt utenfor aktiv katalog. Aktiv veterinær/liv-pakke fulltekstgjennomgått; kandidatlisten er ikke uttømmende.')
fact(['if-katt-super'],'if-cat-terms.pdf',4,'5.1.3','Tannresorpsjon','årlig undergrense','TR inntil 5 000 kr årlig',COARSE,['dyr.tannsykdom.dekning'],'P1',note='Katalogens innen valgt veterinærsum mangler uttrykkelig TR-undergrense; Hund brukes ikke som Katt-kilde.',status='LIMITATION')
# This checkpoint is deliberately partial; further family entries append here.
exec((O/'more_reviews.py').read_text())
(O/'manual-source-facts.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
(O/'manual-products.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2))
print('manual fact occurrences',len(rows),'products with package-deep review',len(reviews))
