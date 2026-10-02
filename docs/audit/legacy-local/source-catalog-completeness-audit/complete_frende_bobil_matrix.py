from continue_audit import *
import ast
A=Audit();I=load('frende-vehicle-independent-inventory.json');path=I['source'];ipid='catalog/sources/mc-bobil/frende-bobil-ipid.pdf';web='catalog/sources/mc-bobil/frende-bobil-page.html';general='catalog/sources/frende/Generelle_vilkar-01012026.pdf'
d={}
for x in ast.parse((O/'review_frende_bil.py').read_text()).body:
 if isinstance(x,ast.Assign) and len(x.targets)==1 and isinstance(x.targets[0],ast.Name) and x.targets[0].id in ['K','why']:d[x.targets[0].id]=ast.literal_eval(x.value)
K=d['K'];why=d['why'];K.update({2:['avtale.geografi','rettshjelp.geografi'],6:['utstyr.grense'],7:['bobil.losore.grense'],13:['veihjelp.dekning'],14:['veihjelp.dekning'],16:['nokkel.dekning','nokkel.grense','nokkel.egenandel'],18:['nyverdi.alder','nyverdi.km','nyverdi.skadegrad','nyverdi.begrensning'],19:['kasko.begrensning'],20:['leiebil.dekning','leiebil.bilklasse'],22:['leiebil.dager'],23:['leiebil.begrensning'],24:['bobil.feriegaranti.dekning','bobil.feriegaranti.dagsbelop','bobil.feriegaranti.dager'],27:['bobil.fukt.dekning','bobil.fukt.kontroll','bobil.fukt.begrensning'],33:['maskinskade.egenandel.kilometer'],40:['glass.egenandel','glass.reparasjon.egenandel'],49:['ulykke.dekning']})
# Already inventoried exact targeted rules are not counted again.
already={6,7,25,26,27,29,30,31,42}
for pid in ['frende-bobil-ansvar','frende-bobil-delkasko','frende-bobil-kasko','frende-bobil-utvidet']:
 p=A.p[pid];lvl=['ansvar','delkasko','kasko','utvidet'].index(pid.split('-')[-1]);full=p['facts']+sum(p['addonFacts'].values(),[]);actual={f['key'] for f in full}
 for q in I['rules']:
  n=int(q['inventory_id'].split('-')[-1]);scope=q['scope']
  if n in already or scope=='snow':continue
  if scope in ['physical','delkasko'] and lvl<1:continue
  if scope in ['kasko','rental','machine','motorhome'] and lvl<2:continue
  if scope=='utvidet' and lvl<3:continue
  if n==17 and lvl==3:continue
  keys=K.get(n,[]);matched=[k for k in keys if k in actual];cls=COARSE if matched else MISSING;pr='P2' if n in [1,35,36,37,39,45,46,47,59,60] else 'P1';reason=why.get(n,'Exactsource rule checked against scopedBobilbase+availableoptional');val=q['value'];comp='frende-bobil-leiebil' if scope=='rental' or n==24 else 'frende-bobil-maskinskade' if scope=='machine' else ''
  if n in [2,11,15,18,20,21,22,24,33,40,41,50,57]:cls=PRESENT;pr='';reason='ExactBobilrule alreadyrepresented; adjacentmissingdimensions assessed separately.'
  if n==16:
   cls=PRESENT if lvl==3 else MISSING;pr='' if lvl==3 else 'P1';reason='Utvidetallkeydetailscorrect.' if lvl==3 else 'Shared6.1.4Kaskokeydamage/loss absentonBobilKasko; fulltermsgeneralKaskoscope checked. No missing20000limitclaim onKasko.'
  if n==17:reason='Kasko1year/15000/80%correct; leasingexclusion in11.7 andcashsettlement absent onKasko.'
  if n==19:reason='BobilKaskofuktscopeproperlyisolated; other6.2exclusions+coveredconsequentialdamage/rejectedguarantee exception missing.'
  if n==23:cls=REVIEW;pr='';reason='Terms250/daymax31 preserved;HTMLnormalreptimecashwording not harmonized.'
  if n==28:cls=PRESENT;pr='';reason='Optionalcoverageanddrivingstoppage plusservice/chipconditionsrepresentedacross2facts.';keys=['maskinskade.dekning','maskinskade.begrensning']
  if n==34:cls=CUSTOM;pr='';reason='Bevisvalgtpanthaverproductseparatefromstartleie; no invented customer selection.'
  if n==48:reason='NoBobilbonusfacts; shared11.13explicitlylistsBil/Bobil/MCandprecisefritak. Do notimportBilincorrectunder6policecondition.'
  if n==49:reason='StandardstatusconfirmedbyBobilHTML; preciseaccidentdefinition/nonillnesscondition missing.'
  if n==51:reason='Amount+proportionalcorrect; precedingfunctiondeduction/3yearsettlement absent.'
  if n==61:cls=ADMIN;pr='';reason='Administrative skademelding.'
  A.fact(pid,q['subject'],q['dimension'],val,path,f'PDFside{q["pages"]}punkt{q["section"]}',cls,keys,pr,reason,'SCRC-019',comp,q['inventory_id'],extra={'shared_source_inventory':'frende-vehicle-independent-inventory.json','separate_type_scope_check':'BobilIPID and fullterms consulted; no blind Bilcopy'})
 # Reverse verify exact values supported by fullterms; document conflicts separately, no unsupported assertion merely because website differs.
 A.reverse(pid,{f['key']:dict(artifact=path,pdf_page=f['source'].get('page'),section=f['source'].get('section'),note='Exact fact supported by fullterms; material web/IPIDconflicts are SC-014, preserved as unresolved package scope. Customer choice not inferred.') for f in full})
 A.product_review(pid,[path,ipid,web,general],False,'Completed scoped61rulematrix followingtargetedcheckpoint. All exactcatalogbase+addons reverse checked; SC014remains: machineavailablelevel/contentcaps/accessorycaps/rentalcash. General4p read but generalrule-to-product matrix notfullyenumerated. No sourcefreshnessclaim.')
for aid in ['frende-bobil-leiebil','frende-bobil-maskinskade']:
 ad=next(x for x in A.a['addon_coverage'] if x['addon_id']==aid);ad.update(status='PARTIAL',fully_audited=False,semantic_audit_status='PARTIAL',notes='All maintermsdimensions reviewed; sourceconflict packageclosure outstanding: rentalcashduration or machinelevelavailability/agewording. No guessedprecedence.')
A.checkpoint('Frende Bobil shared-rule matrix completed; material gaps and exact positive controls recorded; source conflicts keep package partial','Snøscooter','frende','frende-snoscooter-ansvar')
r=load('resume.json');r.update(next_exact_action='Verify exact next Frende Snøscooter productID in catalog.json; reuse vehicle sourcefirst61rules and15pfullterms alreadyread. Read snow productpage before catalogvalues and independently check applicability. Bobilmatrix done; sourceconflictsstillopen.');save('resume.json',r)
