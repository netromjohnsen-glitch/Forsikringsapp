from continue_audit import *
A=Audit();I=load('tryg-mc-bobil-independent-inventory.json');B='catalog/sources/mc-bobil/';T='catalog/sources/tryg/'
# Corrections following exact focused table/wording verification, not catalog-derived semantics.
I['rules'][38]['value']='MC: fastmontert50k/foliering,ikkeavtagbart. Bobil: fastmontert+ekstrahjul/felger samlet50k/hendelse.'
I['rules'][36]['value']='500kr/dag10dnormalreparasjon; firmafaktura,ikkeandreleieutgifter. Nettside oppgir også gruppeB/100kmprdag; versjon/applicability må bevares.'
I['rules'][49]['location']='1 §1 Avbrutt ferie'
I['rules'][48]['location']='1 sikkerhetsforskrift;1 Ekstra Fuktskade'
I['rules'][47]['location']='1 §1 Fuktskade'
save('tryg-mc-bobil-independent-inventory.json',I)
A.root('SCRC-044','Tryg MC/Bobil har korrekt nivåseparasjon og de fleste sentrale tall, men sikkerhetsvilkår, noen ytelser og oppgjørsregler mangler. Kildekonflikter og overlappende aldersformuleringer skal ikke glatt normaliseres.','61uavhengigeregler;alle16dedikertelokaloriginaler+eksaktreferertefellesvilkår;fullreversecheckogtidligerepositivergjenbrukt.',['MC','Bobil'],['tryg'],'RB-40')
P={'mc':{'product':'tryg-05PAU20900.pdf','safety':'tryg-05000PA209.pdf','delkasko':'tryg-05PAU25935.pdf','kasko':'tryg-05PAU25405.pdf','extra':'tryg-05PAU27010.pdf'},'bobil':{'product':'tryg-05PAU18800.pdf','safety':'tryg-05000PA188.pdf','delkasko':'tryg-05PAU25335.pdf','kasko':'tryg-05PAU25305.pdf','extra':'tryg-05PAU27007.pdf'}}
K={1:[],2:['avtale.geografi','rettshjelp.geografi'],3:[],4:[],5:[],6:[],7:['bonus.dekning'],8:[],9:[],10:['kjoretoy.kjorelengde'],11:[],12:['utstyr.dekning','utstyr.grense'],13:['mc.bagasje.dekning','mc.bagasje.grense'],14:['bobil.losore.dekning','bobil.losore.grense','bobil.losore.gjenstand','bobil.losore.begrensning'],15:['bobil.fortelt.dekning'],16:['brann.dekning','brann.egenandel'],17:['tyveri.dekning','tyveri.egenandel'],18:['bobil.fortelt.begrensning'],19:['glass.dekning','glass.begrensning','glass.egenandel','glass.reparasjon.egenandel'],20:['glass.dekning','glass.begrensning','glass.egenandel','glass.reparasjon.egenandel'],21:['veihjelp.dekning'],22:['veihjelp.begrensning','veihjelp.egenandel'],23:['totalskade.oppgjor','reparasjon.kontant'],24:['reparasjon.garanti'],25:['utstyr.aldersfradrag'],26:['kasko.dekning','kasko.begrensning','kasko.egenandel'],27:['bobil.skadedyr.dekning'],28:['kasko.dyr','kasko.var'],29:['kasko.egenandel'],30:['nyverdi.dekning','nyverdi.alder','nyverdi.km','nyverdi.skadegrad'],31:['nyverdi.begrensning'],32:[],33:['maskinskade.dekning','maskinskade.alder'],34:['maskinskade.egenandel'],35:['maskinskade.begrensning'],36:['mc.parkert.dekning','mc.parkert.alder'],37:['mc.leiekjoretoy.dekning','mc.leiekjoretoy.dagsbelop','mc.leiekjoretoy.dager','mc.leiekjoretoy.begrensning'],38:['mc.bagasje.grense','mc.bagasje.begrensning'],39:['utstyr.grense'],40:[],41:[],42:['feilfylling.dekning','feilfylling.grense','feilfylling.egenandel'],43:['nokkel.dekning','nokkel.grense','nokkel.egenandel'],44:['ulykke.sykehus'],45:['ulykke.invaliditet'],46:['bobil.losore.dekning','bobil.losore.grense','bobil.losore.gjenstand','bobil.losore.egenandel','bobil.losore.begrensning'],47:['nokkel.dekning','nokkel.grense','nokkel.egenandel'],48:['bobil.fukt.dekning','bobil.fukt.alder','bobil.fukt.egenandel'],49:['bobil.fukt.begrensning'],50:['bobil.feriegaranti.dekning','bobil.feriegaranti.dagsbelop','bobil.feriegaranti.dager','bobil.feriegaranti.begrensning'],51:['avtale.geografi'],52:['tyveri.egenandel'],53:[],54:['bobil.fukt.begrensning'],55:['maskinskade.dekning','maskinskade.alder','maskinskade.km','maskinskade.egenandel.kilometer'],56:['maskinskade.dekning','maskinskade.begrensning'],57:['ulykke.dekning','ulykke.omfang','ulykke.invaliditet','ulykke.dod'],58:['ansvar.dekning','ansvar.person.grense','ansvar.ting.grense'],59:['rettshjelp.dekning','rettshjelp.grense','rettshjelp.egenandel'],60:['rettshjelp.dekning'],61:[]}
full={2,14,15,16,17,19,20,27,29,30,33,36,37,38,39,42,43,45,46,47,50,55,57,58}
reason={1:'Eier/bruker/panthaverkvalifikasjonutelatt.',3:'14dagersvilkårvedeiendomsoverdragelseutelatt.',4:'Avregistreringsdekningkanpåvirkelagringogikkevist.',5:'Kildekonfliktingenfastcanonicalkonklusjon.',6:'Sesongrisikoerikkeflatmånedspris;oppsigelsesvirkningutelatt.',7:'Bonusopptjeningogskadetriggerunntakmangler.',8:'Servicesikkerhetmaterialsomtilknyttetvilkår.',9:'Kunhovedfører/ektefelleutenvalgogbruk/begrensningovernattbagasjemangler.',10:'Valgtårligkjørelengdestruktur/bevisprioritet;spesifikkeunntakfrasanksjonikkemodellert.',11:'Fortelt/pest/rentalsikkerhetmangler.',12:'Standardekstrahjulsettutelattbak10kfasttilbehør.',13:'BagasjelimitkorrektmenbasisspesifikkeunntakogwebKasko5kitemutelatt.',18:'Forteltunntakkorrekte,menavtaltutleieunderslag3mnd/relasjonunntakmangler.',21:'Transportutløserekorrekte;passasjerreturvedførersykdomognærmesteverkstedutelatt.',22:'750/50%korrekt;rimetligstvidere-makshjemregelutelatt.',23:'70%kontant/markedsverdi/forbedringsfradragmangler.',24:'8årkarosseri3årbruktmotorgarantiikkevist.',25:'10%max50%fastmontertelektronikkmangler.',26:'Kaskofarerkorrekte,24tplutseligdefinisjonognoenegenandelsunntakutelatt.',28:'Dyr2k/innendørsvær0egenandelikkevist.',31:'Tyveri3uker/leasingbevart;utgåttmodellkontraktikkevist.',34:'Kildenharoverlapp3år/tomrom7–8år;catalogfør3normaliserertydeligereennordlydenbeviser.',35:'Garanti-reklamasjonførstkorrekt;fallbackmedregress/diagnosekostikkeeksplisitt.',40:'Transportferge/togutenbonustapmangler.',41:'Langturreservedeler3k/3timer/0egenandelmangler.',44:'5ksykehus48tmangler.',48:'10årsoverlappifullvilkår;catalogfør10velgergrenseutenavklaring.',49:'Årligfukttestogumiddelbarutbedringmangler.',51:'PDFTyrkiaeksklmotHTMLinklIsraelTyrkia;ikkevelgénutenavklaringsgrunnlag.',52:'Tyverialarmfritakfraegenandelpåoffisiellproduktsideikkevist.',53:'KildekonfliktPDF/IPIDalleopphørmotnettsiderestfortsetter.',54:'Avaraalternativtilårligtestmaterialtvilkårikkevist;markedsrabattikkeprioritert.',56:'100kkmdelgrenseogdekketkomponentlisteforsvinnerbakmotor/gir/drivverk/elektronikk.',59:'100k/250k/4k+20%korrekt;20kmotTrygogøkonomiskinteressetakutelatt.',60:'Rettshjelpettersalg/førerulykkerolleoghovedunntakutelatt.'}
# Preserve old individually validated evidence; link continuation rules rather than duplicate.
reuse={19:['Glass'],25:['Utstyr'],27:['Skadedyr'],29:['Kasko'],30:['Nyverdi'],37:['Leiekjøretøy'],41:['Reservedelstransport'],44:['Sykehuskompensasjon'],45:['Ulykke'],46:['Løsøre'],50:['Feriegaranti']}
for typ in ['mc','bobil']:
 for tier in ['ansvar','delkasko','kasko',typ+'-ekstra']:
  pid=f'tryg-{typ}-{tier}';p=A.p[pid];physical=tier!='ansvar';kasko=tier not in ['ansvar','delkasko'];extra=tier.endswith('ekstra');rows=[];prior=[f for f in A.f if f['product']==pid]
  paths={k:B+v for k,v in P[typ].items()};paths.update(web=B+f'tryg-{typ}-product.html',ipid=B+f'tryg-{typ}-ipid.pdf',index=B+f'tryg-{typ}-terms-index.html',ansvar=T+'Bilforsikring-Ansvar.pdf',accident=T+'Fører- og Passasjerulykke.pdf',motor=T+'Bilforsikring-Maskinskade.pdf',legal=T+'hus/05PGE91500.pdf',general=T+'hus/05PGE91000.pdf');used={paths[k] for k in ['product','safety','web','ipid','index','ansvar','legal','general','accident']}
  for n,q in enumerate(I['rules'],1):
   if q['type'] not in ['both',typ]:continue
   if q['scope']=='physical' and not physical or q['scope'] in ['kasko','motor'] and not kasko or q['scope']=='extra' and not extra:continue
   if extra and n in [12,13,14]:continue # source tier overridden by explicit extension facts below, not absence.
   src=q['source'];src=('kasko' if kasko else 'delkasko') if src=='physical' else src;path=paths[src];used.add(path);loc=q['location'];comp=''
   if n==57 or n==45:comp=f'tryg-{typ}-ulykke'+('-ekstra' if typ=='mc' and extra else '')
   if n in [55,56]:comp='tryg-bobil-maskinskade'
   if loc.startswith('Delkasko'):l,r=loc.split(';Kasko');loc=r if kasko else l.replace('Delkasko','')
   if loc=='mc2/bobil1 §1':loc=('2' if typ=='mc' else '1')+' §1'
   old=[f for f in prior if f['semantic_subject'] in reuse.get(n,[]) and (n!=29 or f['semantic_dimension']=='ung fører')]
   if n==28:old=[f for f in prior if f['semantic_subject'] in ['Dyrepåkjørsel','Værskade']]
   if old:
    for f in old:f['continuation_inventory_links']=list(set(f.get('continuation_inventory_links',[])+[q['id']]))
    rows.extend(old);continue
   cls=PRESENT if n in full else COARSE if any(f['key'] in K[n] for f in p['facts']+sum(p['addonFacts'].values(),[])) else MISSING;pri='' if cls==PRESENT else 'P2'
   if n in [4,9,18,21,23,24,25,28,40,41,44,49,52,54,56,59,60]:pri='P1'
   if n in [5,51,53]:cls='SOURCE_CONFLICT_REVIEW_REQUIRED';pri='P1'
   if n in [34,48]:cls='SOURCE_AMBIGUOUS';pri='P2'
   if n==32:cls='SOURCE_ONLY_ACCEPTABLE';pri='' # absence is not unavailable, no claim inferred.
   if n in [8,61]:cls='SOURCE_ONLY_ACCEPTABLE';pri=''
   if n==10:cls=CUSTOM;pri=''
   rows.append(A.fact(pid,q['subject'],q['dimension'],q['value'],path,loc,cls,K[n],pri,reason.get(n,'Kilde og faktisk label/value kontrollert; korrekt positiv kontroll.'),'SCRC-044',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'tryg-mc-bobil-independent-inventory.json'}))
  # Optional accident detailed limitations reused from exact shared original, never selected by catalog availability.
  for q in load('tryg-bil-independent-inventory.json')['rules']:
   if q['id'] not in ['TR-BIL-046','TR-BIL-047']:continue
   comp=f'tryg-{typ}-ulykke'+('-ekstra' if typ=='mc' and extra else '')
   rows.append(A.fact(pid,q['subject'],q['dimension'],q['value'],paths['accident'],q['location'],COARSE,['ulykke.omfang','ulykke.invaliditet','ulykke.dod'],'P2','Basisulykkesummerkorrekte,menPTSD/tann/infeksjon/eksisterendefunksjon/1årdødsoppgjørbegrensningutelatt.','SCRC-044',component=comp,inventory_id=q['id'],extra={'reused_exact_applicable_shared_source':True}))
  rev={}
  for cf in p['facts']+sum(p['addonFacts'].values(),[]):
   ee=[f for f in rows if cf['key'] in f['proposed_keys']]
   if ee:rev[cf['key']]={'locations':[{'artifact':f['source_artifact'],'location':f['source_location']} for f in ee],'note':'Exact positive claim checked; surrounding omissions/conflicts separate.'}
  A.reverse(pid,rev)
  for s in A.support:
   if s['product_identity']!=p['identity']:continue
   if typ=='mc' and s['key']=='avtale.geografi':s.update(support_status='SOURCE_CONFLICT_REVIEW_REQUIRED',full_claim_validated=False,manual_reverse_evidence='PAU20900 excludesTurkey;officialMCpageincludesTurkeyIsrael;SC046')
   if (typ=='mc' and s['key']=='maskinskade.egenandel') or (typ=='bobil' and s['key']=='bobil.fukt.egenandel'):s.update(support_status='REVIEW_REQUIRED',full_claim_validated=False,manual_reverse_evidence='Exactsourceinntil3/from3or inntil10/from10overlap;catalogbeforethresholdnotfullyproved')
  A.product_review(pid,sorted(used),True,'61source-firstrulesplussharedaccident/legal. Full16dedicatedsourcesread;priorpartialruleIDsreused. StrongpositivecontrolsMC1yr10kkm/Bobilnoinventednyverdi;MCconditional500konlyifoptionalaccident;Bobilholiday2k14dnotordinaryrental. LocalconflictsMCgeography/Bobilderegistration/eligibilityandagewordingrecorded;nofreshnessclaim.')
for ad in A.a['addon_coverage']:
 if ad['addon_id'] in ['tryg-mc-ulykke','tryg-mc-ulykke-ekstra','tryg-bobil-ulykke','tryg-bobil-maskinskade']:ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='Fulloriginalscopedtoexacttype/level;optionalnotselected;Bobilmotor100kkmcomponentgapandentrywordingconflictrecorded.')
for num,fam,prod,files,claim,obs in [
 (46,'MC','tryg-mc-*',['tryg-05PAU20900.pdf','tryg-mc-product.html'],'Geografiskområde','PAU20900Jul2026EuropaeksklTyrkia;HTMLinklTyrkiaIsrael,SCOPEREVIEW'),
 (47,'Bobil','tryg-bobil-*',['tryg-05PAU18800.pdf','tryg-bobil-ipid.pdf','tryg-bobil-product.html'],'Avregistrering','PAU18800Jul2026/IPIDApr2025sieralledekningeropphører;HTMLkunansvar/ulykke'),
 (48,'Bobil','tryg-bobil-kasko/ekstra',['tryg-bobil-product.html'],'Maskinskadeinngang','Ingressunder10ANDunder180kkm;dekningstabellunder10ORunder180kkm;ikkeopphør200kregelkonflikt'),
]:
 A.a['source_conflicts'].append(dict(id=f'SC-{num:03d}',provider='tryg',family=fam,product=prod,sources=[B+x for x in files],claim=claim,observed=obs,status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Bevar kildene/versjoner; ingen vilkårsverdi endres i audit. Avklar nøyaktig anvendelig regel.'))
A.a.setdefault('source_research_queue',[]).append(dict(queue_id='SR-tryg-mcb-ambiguity',product=['tryg-mc-mc-ekstra','tryg-bobil-bobil-ekstra'],reason='EksaktMC3årsgrense/egenandel7–8år;Bobil10årsgrense;geografi/deregistrering/MaskinentryHTMLANDORkonflikter.',external_source_needed_if_unresolved='Autoritativavklaringavversjon/nivå/anvendeligegrenser;ikkenettundersøktnå.',downloaded=False))
A.checkpoint('Tryg MC/Bobil eight levels and four addons closed; source conflicts and exact age-boundary ambiguities preserved','Snøscooter','tryg','tryg-snoscooter-ansvar')
