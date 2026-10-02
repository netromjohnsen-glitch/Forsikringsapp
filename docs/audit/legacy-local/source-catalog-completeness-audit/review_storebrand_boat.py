from continue_audit import *
A=Audit();root='SCRC-060';T='catalog/sources/boat-pet/storebrand-boat-terms.pdf';W='catalog/sources/boat-pet/storebrand-boat-product.html';I='catalog/sources/boat-pet/storebrand-boat-ipid.pdf'
A.root(root,'Storebrand Båt has sparse base rules and incomplete level inheritance; full båt03 terms contain material qualifications and benefits absent from resolved catalog. Source conflicts are retained separately.',['Source-first SBT-01–39; all22p+IPID+HTML; existing GAP0058–0090 revalidated rather than duplicated.'],['Båt'],['storebrand'],'RB-56')
R=load('storebrand-boat-independent-inventory.json')['rules']
# Initial targeted review already recorded these exact material dimensions.
covered={2,5,9,11,12,13,14,15,17,18,20,21,22,30,33,35,37}
for pid in ['storebrand-bat-delkasko','storebrand-bat-kasko','storebrand-bat-super']:
 p=A.p[pid];super_=pid.endswith('super');kasko=not pid.endswith('delkasko');fs=p['facts'];keys={x['key'] for x in fs}
 for n,r in enumerate(R,1):
  if n in covered or (r['scope']=='super' and not super_) or (r['scope']=='kasko' and not kasko):continue
  cl=MISSING;sev='P2';ks=[]
  if n==4:cl=CUSTOM;sev=''
  if n in [6,10,19,23,24,25,29,36]:sev='P1'
  if n==3:cl='SOURCE_CONFLICT_REVIEW_REQUIRED';sev='P2'
  if n==7:cl=PRESENT;sev='';ks=['bat.brann.dekning']
  if n==8:cl=COARSE;ks=['bat.tyveri.dekning']
  if n==10 and kasko:cl=COARSE;ks=['bat.transport.dekning']
  if n==28:cl='SOURCE_ONLY_ACCEPTABLE';sev=''
  if n==31:cl=COARSE;ks=['bat.ansvar.dekning']
  if n==34:cl=COARSE;ks=['bat.rettshjelp.dekning']
  if n==38:cl='SOURCE_CONFLICT_REVIEW_REQUIRED';sev='P2'
  if n==39:cl=ADMIN;sev=''
  if n==24:ks=['bat.maskinskade.dekning']
  A.fact(pid,r['subject'],r['dimension'],r['value'],{'terms':T,'web':W,'ipid':I}[r['doc']],r['location'],cl,ks,sev,'Rådgiver mister dokumentert vilkår/avgrensning eller ydelse; ikke utlede en generell dekning fra katalogens taushet.' if sev else 'Korrekt/administrativt eller kundespesifikt kontrollpunkt.',root,inventory_id=r['id'])
 # Additional qualifiers separate from initial total-limit / therapy-count / accident-sum controls.
 extras=[('Sikkerhetsutstyr','egen sum','Ubegrenset i tillegg til forsikringssum, alle nivåer.','§4 fysisk s5',MISSING,[], 'P2'),('Bagasje','per gjenstand og unntak','15000 per gjenstand; ikke smykker/klokker/kunst/penger/papirer/forbruksvarer; bestemte navngitte skadeårsaker.','§6.8–10/20 fysisk s11',MISSING,['bat.losore.grense'],'P1'),('Kriseterapi','utløser og kostnadsgrenser','Avtalt psykolog, oppgitte alvorlige hendelser, norske satser ved utenlandsbehandling; ikke reise i utlandet.','§5.1.3.6 fysisk s8',MISSING,[],'P2'),('Tyverisikring','egenandelsreduksjon','4000 ved godkjent motorboltlås; båttyveri med FG søke/gjenfinningssystem eller Securmarkmerking.','§5.1 egenandeler fysisk s8',MISSING,[],'P2'),('Ulykke','samlet tak og behandling','Samlet 1000000 per skadetilfelle; behandlingsutgifter dekkes ikke.','§11 fysisk s20–22',MISSING,[],'P1')]
 for s,d,v,l,cl,ks,sev in extras:A.fact(pid,s,d,v,T,l,cl,ks,sev,'Materiell selvstendig begrensning finnes ikke i base, parent/children eller tillegg.',root)
 for f in A.f:
  if f['product']==pid and f['semantic_subject']=='Maskinskade' and f['classification']==REVIEW:
   f.update(classification='SOURCE_FACT_ALREADY_REPRESENTED_BY_CHILDREN',reason='Audit candidate closed by SBT-24: source explicitly excludes standalone motor damage but names insured-cause exceptions. Separate new inventory occurrence carries missing-catalog finding; no inference from silence.',confidence='HIGH')
 A.reverse(pid,{x['key']:{'locations':[T+' '+({'bat.geografi.omrade':'§3s5','bat.geografi.dekning':'§3s5','bat.ansvar.dekning':'§9s16–17','bat.rettshjelp.dekning':'§10s17–19','bat.brann.dekning':'§5.1s7','bat.tyveri.dekning':'§5.1s7','bat.redning.dekning':'§5.1.3s7–8','bat.transport.dekning':'§5.1.3s8','bat.opplagsutstyr.dekning':'§5.2s9','bat.kasko.dekning':'§5.2s9','bat.ferieavbrudd.dekning':'§5.3s9–10','bat.ferieavbrudd.dager':'§5.3s10','bat.ferieavbrudd.grense':'§5.3s10','bat.totalskade.dekning':'§5.3s10','bat.totalskade.alder':'§5.3s10'}[x['key']])]} for x in fs})
 A.product_review(pid,[T,I,W],True,'Independent SBT39-rule inventory completes initial11/15/18facts. All22p+2pIPID+HTML and previously read Storebrand general considered. Existing GAP0058–0090 revalidated. Material claims reverse checked; optional standalone machine damage not invented. SC069 registration/total-loss documentary conflict and SC070 alarm wording retained, not resolved by precedence. Super loss of opplagsutstyr recognized in original GAP0085. No online freshness claim.')
A.a['source_conflicts']+= [dict(id='SC-069',provider='storebrand',family='Båt',product='storebrand-bat-*',sources=[T,I,W],claim='Registration eligibility and documentary proof for total disappearance',observed='Full§4 ≥10hk/≥4.5m and Småbåt/Securmark; web >10hk/>4.5m and Småbåt only. Full§6.21 permits registry evidence or purchase contract; IPID excludes disappeared boat not Småbåt registered. No unqualified common negative imported.',status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Obtain dated product clarification; current local wording preserved.'),dict(id='SC-070',provider='storebrand',family='Båt',product='storebrand-bat-*',sources=[T,W],claim='Theft deductible reduction safety device',observed='Full§5.1 requires operating FG search/recovery system or whole-boat Securmark; web FAQ calls it FG alarm. Alarm alone not proven equivalent to recovery system.',status='SOURCE_CONFLICT_REVIEW_REQUIRED',action='Clarify device scope; do not expand full rule by UI paraphrase.')]
A.a['source_research_queue'].append(dict(queue_id='storebrand-boat-registration-and-alarm',product='storebrand-bat-*',reason='SC069–070 material boundary/proof/device differences remain in reviewed local sources.',external_source_needed_if_unresolved='Dated Storebrand clarification/current exact-product full package; no retrieval in this audit.',downloaded=False))
A.checkpoint('Storebrand Båt completed: 39-rule source-first inventory, initial findings preserved and exact reverse claims checked','PARTIAL_REVIEW_QUEUE','storebrand','sb-bil-delkasko')
