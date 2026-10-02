from continue_audit import *
A=Audit();I=load('tryg-innbo-independent-inventory.json');B='catalog/sources/tryg/innbo/'
A.root('SCRC-048','Tryg Innbo har kontrollerte hovedbeløp, men mangler materielle utløsere, gjenstandsgrenser og oppgjørsregler; Ekstra arver en fellesbodgrense fra feil fullvilkår og flytte-tyveri benevnes transportskade.','48 uavhengige regler fra 10 lokale originaler; full reverse-check av begge nivåer og utleietillegg.',['Innbo'],['tryg'],'RB-44')
K={1:['innbo.personkrets'],2:['innbo.geografi'],3:['innbo.forsikringssum'],4:['innbo.yrkeslosore.grense'],5:['innbo.datalager.grense'],6:['innbo.vaesketap.grense'],7:['innbo.smaabygg.grense'],8:[],9:['innbo.kontanter.grense','innbo.programvare.grense'],10:['innbo.merutgifter.dekning'],11:['innbo.opphold.grense'],12:['innbo.tilleggsinnredning.grense'],13:['brann.dekning'],14:['brann.egenandel','vann.egenandel','tyveri.egenandel'],15:['brann.dekning'],16:['vann.dekning'],17:['vann.dekning'],18:['vann.egenandel'],19:['tyveri.fellesbod.grense','tyveri.privatbod.grense','tyveri.fellesgarasje.grense'],20:['tyveri.uteareal.grense','tyveri.utenforhjem.grense'],21:['sykkel.tyveri.grense'],22:['sykkel.egenandel.rabatt'],23:['tyveri.veskenapping.grense'],24:['tyveri.bygningsskade.grense'],25:['tyveri.dekning'],26:['flytting.transport.grense'],27:['innbo.hvitevarer.dekning','innbo.frysevarer.grense'],28:['innbo.hvitevarer.dekning','uhell.begrensning'],29:['innbo.egenandel'],30:['uhell.dekning','uhell.begrensning'],31:['uhell.egenandel'],32:['skadedyr.dekning','skadedyr.grense','skadedyr.egenandel'],33:['innbo.bygningsdeler.dekning'],34:['innbo.aldersfradrag'],35:['innbo.oppgjor.begrensning'],36:['innbo.oppgjor'],37:['naturskade.dekning','naturskade.egenandel'],38:['ansvar.dekning','ansvar.grense','ansvar.egenandel'],39:['ansvar.dekning'],40:['rettshjelp.grense','rettshjelp.egenandel'],41:['rettshjelp.dekning','rettshjelp.geografi'],42:['sikkerhet.tyveri','sikkerhet.sykkel'],43:['utleie.dekning'],44:['utleie.skadeverk.grense','utleie.tyveri.grense'],45:['utleie.husleietap.grense','utleie.husleietap.egenandel'],46:['utleie.utkastelse.grense','utleie.egenandel'],47:['utleie.egenandel'],48:[]}
for pid in ['tryg-innbo','tryg-innbo-ekstra']:
 extra=pid.endswith('ekstra');p=A.p[pid];prior=[f for f in A.f if f['product']==pid];rows=[]
 for n,q in enumerate(I['rules'],1):
  if q['level']=='extra' and not extra or q['level']=='base'and extra:continue
  doc=q['doc'];loc=q['location'];val=q['value'];comp='tryg-innbo-utleie'if q['level']=='addon'else''
  if extra and doc=='Innbo_og_losore_PPK13301.pdf':doc='Innbo_og_losore_Ekstra_PPK13302.pdf';loc+='; exact Ekstra clause controls'
  existing=[f for f in p['facts']+sum(p['addonFacts'].values(),[]) if f['key']in K[n]]
  cls=COARSE if existing else MISSING;pri='P1';why='Materiell kildeopplysning mangler helt eller bak eksisterende hovedpåstand; full produkt/tillegg kontrollert.'
  if n in [2,8,18]:
   match=[f for f in prior if (n==2 and f['semantic_subject']=='Flytting')or(n==8 and f['semantic_subject']=='Småbåt/tilhenger i innbo')or(n==18 and f['semantic_subject']=='Vann')]
   for f in match:f['continuation_inventory_links']=[q['id']];rows.append(f)
   if n!=8:continue
   val='Løst biltilbehør/kano-kajakk '+('40 000'if extra else'20 000')+'; bare brann/tyveri på stedet. Rullestol 15 km/t; øvrige motorvogn/elsparkesykkel/campingvogn unntatt.';pri='P2'
  if n in [5,6,21,22,45,46]:cls=PRESENT;pri='';why='Eksakt beløp/enhet og hovedavgrensning støttet.'
  if n in [1,4,9,13,14,15,20,23,24,25,28,34,35,36,39,40,41,42,43,44,47]:pri='P2'
  if n==3:val='Nyanskaffelser dekkes over valgt sum frem til hovedforfall; melding kreves; særgrenser gjelder før sum.';pri='P2'
  if n==4:val=('100 000'if extra else'50 000')+' eget yrkesløsøre/varer kun i bygning på forsikringsstedet; ikke andres varer.'
  if n==11:val=('Normal reparasjonstid'if extra else'120 000')+'; etter én uke forhåndsgodkjenning; sparte utgifter motregnes; ikke arbeidssted.'
  if n==12:val=('500 000'if extra else'150 000')+'; leieforhold må opphøre pga bygningsskade; borettslag regnes ikke leid.'
  if n==17:val='Også vann gjennom annen åpning eller utetthet over bakkeplan; ikke sopp/råte.'if extra else'Åpning må skyldes annen dekket bygningsskade; andre tak-/nedbør-/kondensskader ikke omfattet.'
  if n==19:
   if extra:
    cls='CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE';pri='P1';val='Ekstra eget fullvilkår §2.4: privat bod fellesadkomst 350 000, ekstern privatbod 60 000 og andre steder 30 000. Ingen egen 15 000 fellesbod-/garasjegrense. Denne arves likevel fra PPK13301.';why='Forrige SF-0227 mistanke nå kontrollert mot komplett pakke: ukorrekt arv av særgrense fra grunnnivå.'
   else:cls=PRESENT;pri='';val='Privat bod med fellesadkomst 50 000, privat utenfor 30 000, fellesbod/garasje 15 000. Distinksjon korrekt.'
  if n==20:
   val='Privat uteareal 40 000 / annet sted 30 000; kontanter/verdipapir bare veskenapping.'if extra else'Privat uteareal 20 000.'
   if not extra:cls=PRESENT;pri=''
  if n==23 and extra:continue # Recorded under other-location cash condition, not double counted.
  if n==26:cls='CATALOG_FACT_SEMANTICALLY_MISMAPPED';val='30 000 ved profesjonell/foreningsflytting står under tyveri/skadeverk §2.4. Katalogens Transportskade-benevnelse er videre enn kilderegelen; privat flytting omfattes uten denne 30 000-grensen.';why='Ikke bruk en tyveriundergrense som universell transportskadegrense.'
  if n==27:val='Frysevarer 15 000 ved plutselig kjøle-/strømsvikt; kollaps fra vind/snø samt sot/eksplosjon dekket. Hvitevarer-forelder alene representerer ikke dette.'
  if n==28 and extra:continue # Existing SF-0226 is positive control.
  if n==30:val='Brann/elektrisk/vann/tyveri/natur behandles uttømmende i egne avsnitt; uhell er ikke utvidelse av disse. Hovedunntak allerede korrekt i SF-0226; drivhus/teltkollaps og glass alene mangler.'
  if n==31:val='Vind svakere enn storm/snøtyngde/takras minimum 8 000, ikke den ordinære 2 000 uhell-egenandelen.'
  if n==32:val='150 000 samlet bekjempelse + forhåndsgodkjent bosted; VIS avgjør metode/tilkomst; ikke aktivitet før avtale eller bekjempelse etter opphør. 2 000 egenandel korrekt.'
  if n==37:cls=PRESENT;pri='';why='Katalogens naturulykker og 8 000 korrekt. Ytterligere administrative lovregler beholdes i kilde.'
  if n==38:cls=REVIEW;pri='';why='PGE90020 lokalt gjelder først 01.10.2026, snapshot 29.09.2026. Manglende fremtidige tall er ikke feil ved frosset auditdato. Datogate beholdes, fremtidig kilde oppfølgingspunkt.'
  if n==39:cls=REVIEW;pri='';why='Samme fremtidige PGE90020-datogate, ikke påstå aktive unntak per 29.09.'
  if n==40:val='100 000/250 000 og 4 000+20% korrekt; 20 000 ved Tryg-tvist og økonomisk-interesse-tak mangler.'
  if n==44:val='500 000-rammer korrekt; utført av leietaker/gjester på forsikringsstedet og kosmetikk/vedlikehold unntatt.'
  if n==47:pri='P2';cls=MISSING
  if n==48:cls='SOURCE_CONFLICT_REVIEW_REQUIRED';pri='P1' if extra else'';why='IPID 2022 og fullvilkår 2026 har ulik ordlyd/produktplassering. Bevar konflikt; ikke innfør positiv dyreskade.'
  rows.append(A.fact(pid,q['subject'],q['dimension'],val,B+doc,loc,cls,K[n],pri,why,'SCRC-048',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'tryg-innbo-independent-inventory.json'}))
 rev={}
 for cf in p['facts']+sum(p['addonFacts'].values(),[]):
  ev=[f for f in rows+prior if cf['key']in f['proposed_keys']]
  # Each actual claim read above; source locations direct from authoritative catalog references, corrected only where necessary.
  rev[cf['key']]={'locations':[{'artifact':B+cf['source']['filename'],'location':str(cf['source'].get('page'))+' / '+str(cf['source'].get('section'))}],'source_first_evidence':[f['source_fact_id']for f in ev],'note':'Core claim/value supported; omissions separate. Extra same-scope rules checked in PPK13302 even where inherited provenance names PPK13301.'}
 A.reverse(pid,rev)
 if extra:
  for key in ['tyveri.fellesgarasje.grense','flytting.transport.grense']:
   for c in A.support:
    if c['product_identity']==p['identity'] and c['key']==key:
     c.update(support_status='UNSUPPORTED_APPLICABILITY_OR_SEMANTICS',full_claim_validated=False,manual_reverse_evidence={'source':B+'Innbo_og_losore_Ekstra_PPK13302.pdf','location':'s4 §2.4','reason':'Wrong-level inherited sublimit' if key.startswith('tyveri')else'Theft limit labeled as transport damage'})
     A.a['unsupported_catalog_claims']['proven'].append(dict(c))
 A.product_review(pid,[s for s in A.art if s.startswith(B)],True,'48 independent source-first rules + SF0218–0227 reused. Ten-source local package closed; future PGE90020 date not misclassified. Exact Extra full terms prevent inherited 15k limit and theft→transport broadening. Optional utleie remains optional. IPID conflict recorded.')
for ad in A.a['addon_coverage']:
 if ad['addon_id']=='tryg-innbo-utleie':ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='Both applicable products; six numerical facts supported; optional status, household scope, trigger/exclusions and settlement reviewed.')
A.a['source_conflicts'].append(dict(id='SC-052',provider='tryg',family='Innbo',product='tryg-innbo-ekstra',sources=[B+'IPID_Innbo.pdf',B+'Innbo_og_losore_Ekstra_PPK13302.pdf',B+'Utleie_PPK13306.pdf'],claim='Dyreskade og tapt husleie-produktplassering',observed='IPID 01.07.2022 nevner skade fra dyr under Ekstra og husleietap samlet. Jul2026 fullvilkår har kjæledyrunntak; bekjempelse separat, ubetalt leie er valgfritt utleietillegg.',status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Avklar hvilken versjon/produktplassering IPID oppsummerer; ikke utled ubetinget dekning.' ))
A.a['source_research_queue'].append(dict(queue_id='SR-tryg-innbo-dates-ipid',product=['tryg-innbo','tryg-innbo-ekstra'],reason='SC052 eldre IPID/fullvilkår; ansvar 01.10 er fremtidig ved frosset snapshot 29.09.',external_source_needed_if_unresolved='Versjonskorrekt IPID og PGE90020 som faktisk gjaldt 29.09.2026; ingen henting nå.',downloaded=False))
A.checkpoint('Tryg Innbo two levels and rental add-on source-first closed; inherited shared-storage cap and transport scope issues proven','Hus','tryg','tryg-hus')
