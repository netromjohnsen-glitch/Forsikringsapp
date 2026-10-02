from continue_audit import *
import ast
A=Audit();I=load('frende-vehicle-independent-inventory.json');path=I['source'];ipid='catalog/sources/mc-bobil/frende-mc-ipid.pdf';web='catalog/sources/mc-bobil/frende-mc-page.html';mileage='catalog/sources/mc-bobil/frende-mc-mileage.html';general='catalog/sources/frende/Generelle_vilkar-01012026.pdf'
assigns={}
for stmt in ast.parse((O/'review_frende_bil.py').read_text()).body:
 if isinstance(stmt,ast.Assign) and len(stmt.targets)==1 and isinstance(stmt.targets[0],ast.Name) and stmt.targets[0].id in ['K','why']:assigns[stmt.targets[0].id]=ast.literal_eval(stmt.value)
K=assigns['K'];why=assigns['why'];K.update({2:['avtale.geografi','rettshjelp.geografi'],6:['utstyr.dekning','utstyr.grense'],7:['mc.bagasje.dekning','mc.bagasje.grense'],13:['veihjelp.dekning'],14:['veihjelp.dekning'],19:['kasko.begrensning'],49:['ulykke.dekning']})
A.root('SCRC-018','Frende MC correct type-specific catalog avoids Bil newvalue and optional machine/rental leakage, but material shared-terms detail and source-documented mileage options remain absent/coarse. Independent package reviewed before matching; Bil parking error not inherited by MC.','lib/mc-bobil-catalog.ts Frende MC family;61 sharedsource-first rules filtered exactMC applicability +MCIPID+MCpage+mileagepage. All resolvedbase/optional rows read.',['MC'],['frende'],'RB-16')
for pid in ['frende-mc-ansvar','frende-mc-delkasko','frende-mc-kasko']:
 p=A.p[pid];lvl=['ansvar','delkasko','kasko'].index(pid.split('-')[-1]);full=p['facts']+sum(p['addonFacts'].values(),[]);actual={f['key'] for f in full}
 for q in I['rules']:
  n=int(q['inventory_id'].split('-')[-1]);scope=q['scope']
  if scope in ['snow','motorhome','utvidet','machine','rental'] or n in [4,5,16,17,34]:continue
  if scope in ['physical','delkasko'] and lvl<1:continue
  if scope=='kasko' and lvl<2:continue
  keys=K.get(n,[]);matched=[k for k in keys if k in actual];cls=COARSE if matched else MISSING;pr='P2' if n in [1,35,36,37,39,45,46,47,59,60] else 'P1';val=q['value'];reason=why.get(n,'ExactMCsource rule not equivalently represented by resolvedbase+optional facts.');comp='frende-mc-ulykke' if n in [49,50,51,52] else ''
  if n in [2,6,7,15,41,42,50,57]:cls=PRESENT;pr='';reason='Exact scoped rule represented; no copying Billevel treatment.'
  if n==7:val='MC Kasko løse ting/bagasjetyveri10000, ikkeDelkasko.'
  if n==6:val='Fastmontertekstrautstyr20000medlakk/foliescope, ingenUtvidetMC.'
  if n==19:reason='Kaskoexcludedcomponent damage summary exists but coveredconsequentialcause exception and rejectedguarantee mechanism missing.'
  if n==49:reason='Optional status and lawfuluse correct; exactaccidentdefinition/nonillness qualifier absent.'
  if n==51:reason='200000/100%andproportionalcorrect; pre-existingfunction deduction/3yearsettlement missing.'
  if n in [11,40]:cls=REVIEW;pr='';reason='Sharedtermsglassclause vsMCIPID/producttable doesnotlistglass; no automatic Bil glassinheritance or assertedmissing cover.'
  if n==61:cls=ADMIN;pr='';reason='Skademeldingadministrasjon.'
  A.fact(pid,q['subject'],q['dimension'],val,path,f'PDFside{q["pages"]}punkt{q["section"]}',cls,matched or keys,pr,reason,'SCRC-018',comp,q['inventory_id'],extra={'shared_source_inventory':'frende-vehicle-independent-inventory.json','type_applicability_checked_with':['MCIPID2026','MCproductHTML']})
 # MC-specific source rules and conservative availability controls.
 rules=[('Kjøreutstyr','omfang','Kjøredress,hansker,støvler,hjelmomfattetMC.',path,'PDF2punkt3.5',PRESENT if lvl>=1 else REVIEW,['mc.kjoreutstyr.dekning'],'','Onlyphysicalcoverlevels; Ansvarhasnoownpropertycoverage.'),('Ulykke','valgfritt','Tilvalgalletrenivåer;aldristandardkundeselected.',web,'HTMLtable',PRESENT,['ulykke.dekning'],'','Optional component correctlymodelled.'),('Leiesykkel','ikkeinkludert','Leiesykkelikkeendelforsikringen.',web,'HTMLFAQ',MISSING,[],'P1','Explicitno-cover rule missing fromcatalog; absenceofaddon alone isnotanexplicitanswer.'),('Maskinskade','ikkeinkludert','Kaskodekkerikkemaskinskade.',ipid,'IPID1',PRESENT if lvl==2 else REVIEW,['kasko.begrensning'] if lvl==2 else [],'','No inventedoptionalenginecoverage; alllevels maintainnotdocumented asappropriate.'),('Årligkjørelengde','produktvalg','6000/12000/ubegrenset;faktiskvalgiavtale.',mileage,'HTMLarticle',MISSING,[],'P2','Options documented independently of actualcustomer mileage; no source-based default should be selected.'),('Prisfordeler','kundespesifikk','Garasje/alder30/husstand/egenandel/kjørelengde/lojalitetrabattavhengerkunde.',web,'HTMLFAQ',CUSTOM,[],'','No inventedunconditionalpremiumorcustomerdiscount.')]
 for sub,dim,val,art,loc,cls,keys,pr,reason in rules:A.fact(pid,sub,dim,val,art,loc,cls,keys,pr,reason,'SCRC-018',component='frende-mc-ulykke' if sub=='Ulykke' else '',inventory_id='FR-MC-'+sub+'-'+dim)
 A.reverse(pid,{f['key']:dict(artifact=f['source'].get('filename',path),pdf_page=f['source'].get('page'),section=f['source'].get('section'),note='Full exactMC sourcepackage matched; boundaries/exception omissions recorded separately.') for f in full})
 A.product_review(pid,[path,ipid,web,mileage,general],False,'MCIPID2p+fullHTML+mileageHTML read with shared15pterms/4pgeneral. No MCnyverdi/rental/machine copied. Remainingglassapplicability and equipmentcoveragecauses prevent fullclosure. Allcurrentexactclaims supportchecked.')
ad=next(x for x in A.a['addon_coverage'] if x['addon_id']=='frende-mc-ulykke');ad.update(status='COMPLETE',fully_audited=True,semantic_audit_status='COMPLETE',notes='Optional all3MClevels explicitlyHTML; fullterms12sum/person/unntakreviewclosed withrecorded omissions. No customerselectioninferred.')
A.a['source_conflicts'].append(dict(id='SC-013',provider='frende',family='MC',sources=[path,ipid,web],claim='Glass applicability',observed='Sharedvehicleterms5.1includesglass;MCIPIDandtableomitglass. No positiveindependentMCglasssupport.',status='SOURCE_APPLICABILITY_REVIEW_REQUIRED',action='Do not importBilglass intoMC; resolveexactMCscopebeforeabsencefinding.'))
A.checkpoint('Frende MC three exact levels reviewed; optional accident closed; mileage options missing; no Bil leakage inferred','Bobil','frende','frende-bobil-ansvar')
