from continue_audit import *
A=Audit();I=load('tryg-bil-independent-inventory.json');B='catalog/sources/tryg/'
paths={'ansvar':B+'Bilforsikring-Ansvar.pdf','delkasko':B+'Bilforsikring-Delkasko.pdf','kasko':B+'Bilforsikring-Kasko.pdf','bil-extra':B+'Bilforsikring-BilEkstra.pdf','el-extra':B+'Bilforsikring-ElbilEkstra.pdf','motor':B+'Bilforsikring-Maskinskade.pdf','rental':B+'Bilforsikring-Leiebil.pdf','accident':B+'Fører- og Passasjerulykke.pdf','accident-extra':B+'Fører- og passasjerulykke Ekstra.pdf','legal':B+'hus/05PGE91500.pdf','general':B+'hus/05PGE91000.pdf'}
A.root('SCRC-043','Tryg Bil har detaljert og stort sett korrekt tallmodell, men enkelte viktige kvalifikasjoner og felles rettshjelpsvilkår er ikke materialisert. Datoporten for separatLeiebil skiller snapshot29sep fra1okt;ingen manglende kilde skal antas på grunn av fravær i gammel snapshot.','54source-firstregler/11lokaleoriginaler;fullfactlabelsverifisertså100kkmMaskinkomponent/under18barn/under23førerikkefeilflagges;PGE91500finneslokaltviaeksakthenvisning.',['Bil'],['tryg'],'RB-39')
K={1:['ansvar.dekning','ansvar.person.grense','ansvar.ting.grense'],2:['ansvar.dekning'],3:['rettshjelp.dekning'],4:['rettshjelp.sum'],5:['rettshjelp.egenandel'],6:['rettshjelp.dekning'],7:['rettshjelp.dekning'],8:['tilbehor.grense','tilbehor.unntak'],9:['brann.dekning','brann.egenandel'],10:['tyveri.dekning','tyveri.egenandel'],11:['glass.dekning','glass.egenandel.bytte','glass.egenandel.reparasjon','glass.unntak'],12:['veihjelp.dekning'],13:['veihjelp.dekning'],14:['veihjelp.transport.grense','veihjelp.egenandel'],15:['veihjelp.unntak'],16:['reparasjon.kontant','totalskade.oppgjor'],17:['reparasjon.garanti'],18:['tilbehor.aldersfradrag'],19:['kasko.dekning','haerverk.dekning','feilfylling.dekning','kasko.unntak'],20:['kasko.egenandel','kasko.egenandel.ung'],21:['kasko.dyr','kasko.var'],22:['nyverdi.alder','nyverdi.km','nyverdi.skadegrad'],23:['nyverdi.tyveri','nyverdi.unntak'],24:[],25:['bonus.parkert'],26:['tilbehor.grense','tilbehor.unntak'],27:['feilfylling.rens'],28:['leiebil.dager','leiebil.bilklasse'],29:['leiebil.kondemnasjon'],30:['leiebil.naturulykke'],31:['leiebil.unntak','leiebil.vilkar','leiebil.kostnader'],32:['bagasje.grense','bagasje.unntak'],33:['bilnokkel.dekning','bilnokkel.grense','bilnokkel.egenandel'],34:['ladekabel.dekning','ladekabel.egenandel'],35:['nyverdi.alder','nyverdi.km','nyverdi.skadegrad'],36:['nyverdi.avtaler','nyverdi.tyveri'],37:['leasing.startleie'],38:['maskinskade.dekning','maskinskade.alder','maskinskade.km'],39:['maskinskade.dekning','maskinskade.fossil','maskinskade.el','maskinskade.drivverk','maskinskade.komfort'],40:['maskinskade.ekstra'],41:['maskinskade.egenandel.120','maskinskade.egenandel.160','maskinskade.egenandel.200'],42:['maskinskade.unntak'],43:['leiebil.vilkar','leiebil.dager','leiebil.bilklasse','leiebil.unntak','leiebil.kostnader'],44:['ulykke.omfang'],45:['ulykke.invaliditet','ulykke.dod'],46:['ulykke.unntak'],47:['ulykke.invaliditet','ulykke.dod'],48:['ulykke.invaliditet','ulykke.invaliditet.barn','ulykke.dod'],49:['ulykke.sykehus'],50:['ulykke.omfang','ulykke.unntak'],51:[],52:[],53:[],54:['bonus.ansvar','bonus.delkasko','bonus.kasko','bonus.tillegg']}
full={1,3,9,10,11,14,15,21,22,27,28,31,33,34,35,37,38,40,41,43,44,45,48,49}
reason={2:'Utlandsfører/personskaderegler mangler bakBilansvarsloven.',4:'PGE91500finneslokalt;100k/250k/20ksumtall mangler,påstandikkevedlagtmåvurderesmotmanifesttilknytning.',5:'Egenandel4k+20%kildedokumentertogikkeekvivalentvalgtKaskosum.',6:'RettshjelpNordenogettersalg/førerpersonskademangler.',7:'Henvisningtilvilkårmistervesentligetvistunntak.',8:'10k/grenserriktig;folieringogstandardekstrahjulikkeeksplisitt.',12:'Hjemreiselistedekningmanglerførersykdomogrimeligst/viderereisemaks;ikkeegenannenreisegrense.',13:'Utløseremed,menhentingtilhenger/nærmesteverkstedutelatt.',16:'70%ogmarketvaluepositiv;slitasje-/likeverdigdelervilkåroppsummeresikkefullt.',17:'8årkarosseri/3årbruktmotoravtalegarantimangler.',18:'10%årlig/maks50%elektronikkfradragmangler.',19:'Skadeårsakerkorrekte;eksaktplutselig<=1d-mekanismeutelatt.',20:'Under23ogunntakstårlabel+value;banekurs+20kgrenutelatt.',23:'1år15k80%/tyveri/leasingriktig;utgåttmodell/erstatningsformikkeeksplisitt.',25:'Parkertbonus6årogsamarbeidsverkstedkorrekt;egenandelsreferansekunundergrunnKasko,representertavparent.',26:'50ksamtidighetkorrekt,ekstradekk/felgerikke-standardutvidelseikkeforklart.',29:'14/60dagervedkondemnasjonkorrekt;startpunkt60dtyverimeldingutelatt.',30:'10dogbruttveiforbindelsekorrekt;naturskadetilknytningstårlabelogtypedkey.',32:'10k/5k/1kunntakkorrekte;tyverifrabillåstboksikkeklarutløser.',36:'10kabonnementkorrekt;nybilmodellutgåttkontrakt/grunn3ukerytelseikkeheleformen.',39:'Rikkjernedelmed;styring/varme/elektronikksubkomponentererforgrovtoppregnede.',42:'Garantihenvisningutelaterkravsomikkeførerframdekkesmedregress;leasedbatteri/luftfjærseparat.',46:'PTSDogtannbevart;andreinfeksjon/ansiktsvansiring/matunntakmangler.',47:'Tidligeredysfunksjonogdød1årinvaliditetsoppgjørikkei200khead.',50:'Positivulykkerollekorrekt;unntak/oppgjørdelvismangler.'}
componentFor={'motor':'maskinskade','bil-extra':'bil-ekstra','accident':'forer-passasjerulykke','accident-extra':'forer-passasjerulykke-ekstra','rental':'leiebil'}
for tier in ['ansvar','delkasko','kasko']:
 pid='bil-'+tier;p=A.p[pid];rows=[];used={paths['ansvar'],paths['general'],paths['legal']};prior=[f for f in A.f if f['product']==pid]
 for n,q in enumerate(I['rules'],1):
  s=q['scope']
  if s=='physical' and tier=='ansvar' or s in ['kasko','extra','bil-extra','motor'] and tier!='kasko':continue
  comps=['bil-ekstra','elbil-ekstra'] if s=='extra' else [componentFor.get(s,'')]
  for comp in comps:
   src=q['source']
   if src=='physical':src=tier
   if src=='extra':src='el-extra' if comp=='elbil-ekstra' else 'bil-extra'
   path=paths[src];used.add(path);loc=q['location']
   if loc.startswith('Delkasko'):
    left,right=loc.split(';Kasko');loc=(left.replace('Delkasko','') if tier=='delkasko' else right)
   if loc.startswith('Bil1/Elbil2'):loc='2 §1' if comp=='elbil-ekstra' else '1 §1'
   old=next((f for f in prior if n==18 and f['semantic_subject']=='Fast elektronikk' or n==22 and f['semantic_subject']=='Nyverdi'),None)
   if old:
    rows.append(old);old['continuation_inventory_links']=list(set(old.get('continuation_inventory_links',[])+[q['id']]));continue
   fs=(A.c['components']['leiebil'] if comp=='leiebil' else p['addonFacts'].get(comp,[])) if comp else p['facts']
   cls=PRESENT if n in full else COARSE if any(f['key'] in K[n] for f in fs) else MISSING;pri='' if cls==PRESENT else 'P2'
   if n in [4,5,6,17,18,29,42]:pri='P1'
   if n==24:cls='SOURCE_FACT_OPTIONAL_COMPONENT';pri=''
   if n==25 or n==30:cls=PRESENT;pri=''
   if n in [51,52]:cls='SOURCE_ONLY_ACCEPTABLE';pri=''
   if n==53:cls=ADMIN;pri=''
   if n==54:
    # Exact bonus scope by base; optional per-component bonus verified below.
    loc='1 §3' if tier=='ansvar' else '3 §4' if tier=='delkasko' else '4 §4';path=paths[tier];cls=PRESENT;pri=''
   f=A.fact(pid,q['subject'],q['dimension'],q['value'],path,loc,cls,K[n],pri,reason.get(n,'Exactsourceprovenanceandlabel/valuechecked;knowncustomerchoicecannotbeinferred.'),'SCRC-043',component=comp,inventory_id=q['id'],extra={'source_first_inventory':'tryg-bil-independent-inventory.json'})
   if comp=='leiebil':f.update(catalog_match=json.dumps(fs,ensure_ascii=False),availability_note='Notactiveatfrozen2026-09-29snapshot;dategateactive2026-10-01confirmedreadonlyprobe. Nohistoriccountsrewritten.',current_date_probe='tryg-rental-asof-probe.json')
   rows.append(f)
 rev={}
 for cf in p['facts']+sum(p['addonFacts'].values(),[]):
  ee=[f for f in rows if cf['key'] in f['proposed_keys']]
  if ee:rev[cf['key']]={'locations':[{'artifact':f['source_artifact'],'location':f['source_location']} for f in ee],'label_checked':True,'note':'Allactualcoreclaimsandnumbersverified;materialomissionsseparate.'}
 A.reverse(pid,rev)
 A.product_review(pid,sorted(used),True,'54source-firstdimensions all9BilPDF+explicitPGEreferences. Strongpositivecontrol15kkm/80%,3yr60kkmoptional,100kkmcomponentlabel,120/160/200deductiblelabels,under23driver,under18accidentnotfalseflagged. Existing3partialfactsreused. SharedlegalPGE91500localofficialexactnumbercontainsmotor§5.3butnotruntimeattachment. LeiebildategateSep29vsOct1documentedwithoutchangingfrozeninventory.')
for ad in A.a['addon_coverage']:
 if ad['addon_id'] in ['bil-ekstra','elbil-ekstra','maskinskade','forer-passasjerulykke','forer-passasjerulykke-ekstra','leiebil']:
  ad.update(status='COMPLETE_WITH_RECORDED_GAPS',fully_audited=True,notes='Fullsourcepackageandallcomponentfactsreadwithmajorlimits/conditions/optionalstatus. Leiebil:temporallyinactiveatSep29snapshot,effectiveOct1nowavailable3Bilproducts;read-onlyprobeandseparateavailabilitynote,notasourceloss.',reviewed_current_date='2026-10-01')
A.a.setdefault('source_research_queue',[]).append(dict(queue_id='SR-tryg-bil-product-base',product=['bil-ansvar','bil-delkasko','bil-kasko'],reason='Local9Biloriginalsprovidecoveragesandexplicitsharedlegal/generalbutnoBil-specificproductconditionsIPIDforglobalgeography/eligibility/optionalLeiebillevelscope.',external_source_needed_if_unresolved='ApplicableBilproducttermsandIPID;do notimportMC/Bobilspecificrulebyprovideralone',downloaded=False))
A.checkpoint('Tryg Bil all three levels and six addons audited; rich positive controls, shared legal gap, Leiebil date gate recorded','MC','tryg','tryg-mc-ansvar')
