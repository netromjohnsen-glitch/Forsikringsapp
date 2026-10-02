from continue_audit import *
A=Audit();I=load('tryg-hus-independent-inventory.json');B='catalog/sources/tryg/hus/'
A.root('SCRC-049','Tryg Hus er en detaljrik positiv kontroll. Få gjenværende oppgjørsdetaljer er ikke materialisert: eldste del/hele kostnaden, arbeidsvederlag og enkelte spesialvilkår; ingen udokumentert innføring av bygg-under-oppføring.','65 uavhengige regler fra alle16originaler; hele aktivebase/Ekstra+2tillegg kontrollert, bygg-under-oppføring registrert uten å kreve ny produktutvidelse.',['Hus'],['tryg'],'RB-45')
K={1:['hus.forsikringsform','hus.forsikringssum'],2:['hus.bygninger.utsmykning'],3:['hus.ror.utvendig'],4:['hus.hage.grense','hus.hage.objekter'],5:['hus.hage.brygge'],6:['hus.andrebygninger.endring'],7:['hus.rydding.dekning'],8:['hus.pabud.grense'],9:['hus.pabud.vilkar'],10:['hus.brukstap.dekning','hus.leietap.skade'],11:['hus.gjenoppforing.prisstigning'],12:['hus.gjenoppforing.klimatiltak'],13:['hus.tilpasning.grense'],14:['hus.brann.dekning','hus.elektrisk.dekning'],15:['hus.alarm.egenandel.reduksjon'],16:['hus.vann.utstromming','hus.vann.terreng'],17:['hus.takvegg.folgeskade','hus.vatrom.folgeskade','hus.vatrom.selverommet'],18:['hus.vann.egenandel.fritak'],19:['hus.vann.egenandel.gjentatt_vann'],20:['hus.vann.egenandel.terreng_grunnvann'],21:['hus.takvegg.folgeskade','hus.takvegg.skadearsak'],22:['hus.vatrom.selverommet'],23:['hus.ror.brudd','hus.ror.egenandel'],24:['hus.ror.frost'],25:['hus.ror.egenandel'],26:['hus.tyveri.dekning'],27:['hus.plutselig.dekning','hus.plutselig.unntak','hus.skadedyr.bygningsskade'],28:['hus.plutselig.dekning','hus.plutselig.unntak','hus.hage.vaer','hus.vaer.begrensning'],29:['hus.vaer.egenandel','hus.sprengning.egenandel'],30:['hus.gjenoppforing.hovedregel'],31:['hus.gjenoppforing.annetsted','hus.gjenoppforing.markedsverdi'],32:['hus.gjenoppforing.markedsverdi'],33:['hus.gjenoppforing.fullverdigaranti'],34:[],35:[],36:['hus.aldersfradrag.isolerglass','hus.glass.isolerglass_punktering'],37:['hus.hage.oppgjor'],38:['hus.gjenoppforing.oppgjorsmate'],39:['hus.sikkerhet.vedlikehold','hus.sikkerhet.brann','hus.sikkerhet.vann','hus.sikkerhet.sno','hus.sikkerhet.tyveri'],40:['hus.sikkerhet.risiko'],41:['hus.ansvar.dekning'],42:['hus.rettshjelp.dekning','hus.rettshjelp.grense','hus.rettshjelp.egenandel'],43:['hus.naturskade.dekning','hus.naturskade.egenandel','hus.naturskade.hage','hus.naturskade.relokalisering'],44:['hus.utleie.skadeverk','hus.utleie.tyveri','hus.utleie.mislighold','hus.utleie.utkastelse','hus.utleie.egenandel','hus.utleie.mislighold.egenandel'],45:['hus.sikkerhet.utleie'],46:['hus.utleie.oppgjor'],47:['hus.rate_skadedyr.avtale','hus.rate_skadedyr.objekter','hus.rate_skadedyr.grense','hus.rate.dekning','hus.skadedyr.bygningsskade','hus.skadedyr.bekjempelse','hus.rate_skadedyr.vann'],48:['hus.rate.dekning','hus.skadedyr.bygningsskade','hus.rate_skadedyr.vann','hus.rate_skadedyr.leverandor'],49:['hus.rate_skadedyr.tid','hus.rate_skadedyr.leverandor'],50:['hus.rate_skadedyr.egenandel','hus.skadedyr.egenandel'],51:['hus.rate_skadedyr.brukstap'],52:[],53:[],54:['hus.rate_skadedyr.vann.grense'],55:['hus.rate_skadedyr.prisstigning','hus.rate_skadedyr.tid'],65:['hus.ror.frost','hus.glass.isolerglass_punktering','hus.skadedyr.bygningsskade']}
for pid in ['tryg-hus','tryg-hus-ekstra']:
 p=A.p[pid];ex=pid.endswith('ekstra');fs=p['facts']+sum(p['addonFacts'].values(),[]);prior=[f for f in A.f if f['product']==pid];rows=[]
 for n,q in enumerate(I['rules'],1):
  if q['scope']=='extra'and not ex or q['scope']=='base'and ex:continue
  # No live construction product/add-on: keep source-only boundary once, not invent missing product requirement.
  if q['scope']=='construction'and ex:continue
  comp='tryg-hus-utleie'if q['scope']=='rental'else'tryg-hus-rate-skadedyr'if q['scope']=='rot'else''
  keys=K.get(n,[]);val=q['value'];doc=q['doc'];loc=q['location'];cls=PRESENT;pri='';reason='Materiell betydning bevart av de oppførte parent/child-fakta; eksakt kildeverdi og produktnivå kontrollert.'
  if ex and doc=='05PPK11501.pdf':doc='05PPK11502.pdf';loc+='; Ekstra eget fullvilkår brukes'
  if n in [17,22,36]or(n==31 and ex):
   olds=[f for f in prior if (n in [17,22]and f['semantic_subject']=='Våtrom')or(n==36 and f['semantic_subject']=='Isolerglass')or(n==31 and f['semantic_subject']=='Gjenoppføring')]
   for f in olds:f['continuation_inventory_links']=[q['id']];rows.append(f)
   if n in [17,22,36]:continue
  if n==1:val='Fullverdi og særgrenser før sum; bevis forrang.'if ex else val
  if n==2:val='Kunstnerisk utsmykning omfattet.'if ex else'Kunstnerisk utsmykning ikke omfattet.'
  if n==4:val='Ingen egen sumgrense; basseng fasttilknyttet medregnes, brygger ikke; natur5dekar.'if ex else'Hage500 000, ikke samme grense brann/natur; basseng fasttilknyttet medregnes, brygger ikke.'
  if n==7 and ex:val='Riving/ryddingtillegg til sum; fullverdi. Førsterisikosetning i kilden er betinget og skal ikke gi nytt produktvalg.'
  if n==8:val='Ingen generell særgrense; fredede bygg1mill.'if ex else'2mill per skade, førsterisiko20%max2mill.'
  if n==12:val=('50 000'if ex else'25 000')+' ved gjenoppføring og>75%skade; overlovkrav/førgodkjent/dokumentert. Klimanytte er implisitt, ikke nytt gap.'
  if n==13:cls=COARSE;pri='P2';val='Rullestol må være nødvendig;250 000samlet for alle sikrede. 50%/5år/0egenandel allerede korrekt.';reason='Den uttrykkelige samlede grensen er utelatt.'
  if n==19:val='+20 000 ved tilsvarende36mndterreng/innvendigerør'+(';ogflattak/balkong/terrasse'if ex else'')
  if n==27:cls=COARSE;pri='P2';val='Utett isolerglass uttrykkelig unntatt i Basis; fundament/setning/dyrunntak gjelder ikke glassbrudd.';reason='Hovedunntak finnes, men ingen uttrykkelig negativ isolerglassregel eller fundament-unntakets glassunntak.'
  if n==29 and ex:val='Vind/snø/takrasminimum8 000; ingen sprengning10 000 fra Basis importert.'
  if n==31:cls=COARSE;pri='P2';val='Bygg for riving eller midlertidigbygg uten gjenoppføring begrenset til materialenes salgsverdi minus rive/renoverings/transportkostnad.';reason='Øvrige alternativregler korrekt; rivningsspesialregel mangler.'
  if n==34:keys=[f['key']for f in p['facts']if f['key'].startswith('hus.aldersfradrag.')];reason='Alle ni tabellrader manuelt kryssjekket, inklusive prosenttak100vs80. Ekstra isolerglass separat.'
  if n==35:keys=[f['key']for f in p['facts']if f['key'].startswith('hus.aldersfradrag.')];cls=COARSE;pri='P2';val='Fradrag gjelder hele reparasjonskostnaden og eldste skadede del; fritak og rekkefølge allerede riktig.'
  if n==38:cls=COARSE;pri='P2';val='Eget skadebegrensnings-/ryddearbeid300kr/time; øvrig oppgjørsvalg/MVA korrekt.'
  if n==41:cls=REVIEW;reason='Legitim unknown ved frosset29.09:lokal ansvarskilde først01.10. Ingen mangelfunn for fremtidige5mill/4k.'
  if n==46:cls=COARSE;pri='P2';val='Innbofradragvedmin1/3verdifall; brukt/arv/gavemarkedsverdi;300/time. Bare generell referanse i katalog.'
  if n==48:cls=COARSE;pri='P2';val='Råte/vann-tillegg unntar utvendige/bunnledninger og ledninger under gulv motgrunn; andre store unntak korrekt.'
  if n==52:keys=[f['key']for f in fs if f['key'].startswith('hus.aldersfradrag.rate_skadedyr.')and'.terskel.'not in f['key']];cls=COARSE;pri='P2';val='5/10frieår,10%/påbegyntårmax80 korrekt; eldste del og totalkostnad ved elektrisk utstyr ikke med.'
  if n==53:keys=[f['key']for f in fs if f['key'].startswith('hus.aldersfradrag.rate_skadedyr.terskel.')]
  if n==55:cls=COARSE;pri='P2';val='VISgodkjent egeninnsats250/time;24mndpris/fraflytting allerede riktig.'
  if q['scope']=='construction':cls='SOURCE_ONLY_ACCEPTABLE';reason='Lokalt kildevedlegg for separat byggefase; ingen slik aktiv catalog product/add-on. Ikke krev ny produktfamilie eller import til ordinære Hus uten avtale.'
  if n==65:cls=REVIEW;reason='IPID2022 er kvalifisert av full2026 i katalog; tining/isolerglass uten egen sum behandles konservativt, ikke falsk positiv.'
  rows.append(A.fact(pid,q['subject'],q['dimension'],val,B+doc,loc,cls,keys,pri,reason,'SCRC-049',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'tryg-hus-independent-inventory.json'}))
 # Add source-only administrative/accountability scope, not extra P findings.
 for cf in fs:
  src=cf.get('source',{})
  if not src:continue
 A.reverse(pid,{cf['key']:{'locations':[{'artifact':B+cf['source']['filename'],'location':str(cf['source'].get('page'))+' '+str(cf['source'].get('section'))}],'note':'Full exact claim validated; main11501/11502 alternative, optional40502/11506 separate; missing details separately recorded.'}for cf in fs})
 A.product_review(pid,[x for x in A.art if x.startswith(B)],True,'65source-firstrules. Detail-rich positive control: all numerical core claims, fulllevel alternative composition, twooptionaladdons, age tables and source date gates checked. 11503 construction annex accounted source-only; not a missing active catalog product. Recorded fewP2 omissions only; no newverifiedunknown.')
for ad in A.a['addon_coverage']:
 if ad['addon_id']in['tryg-hus-rate-skadedyr','tryg-hus-utleie']:ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='All material availability/scope/status/limits/conditions/provenance checked across both house levels. Numerical boundary controls positive; minorP2settlementdetails flagged.')
A.checkpoint('Tryg Hus two levels and two add-ons closed as detailed positive controls; construction annex kept outside ordinary product','Reise','tryg','tryg-reise')
