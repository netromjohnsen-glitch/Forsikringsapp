from continue_audit import *
A=Audit()
# Review register closure only. All source originals/catalog values remain untouched.
frende_ids={'CC-01853','CC-01875','CC-02709','CC-02718','CC-02719','CC-02771','CC-02780','CC-02781'}
for c in A.support:
 if c['catalog_claim_id'] in frende_ids:
  fs=[f for f in A.f if f['product_identity']==c['product_identity'] and c['key'] in f['proposed_keys']]
  c.update(support_status='SOURCE_APPLICABILITY_REVIEW_REQUIRED',full_claim_validated=False,reviewed_source_fact_ids=[f['source_fact_id'] for f in fs],manual_reverse_evidence={'review_disposition':'Local review closed; legal/geographic or internal cross-reference scope not safely decidable. Do not present as proven unsupported or certify the full composite claim.','evidence':[{'path':f['source_artifact'],'location':f['source_location'],'rule':f['structured_value']} for f in fs]},support_scope='Known base inclusion may be correct; exact unresolved qualifier retained for official clarification.')
# Explicit Basis exclusion, not a missing affirmative coverage.
x=A.fact('if-hus-basis','Våtrom','Basis explicit exclusion','Skader i tilstøtende eller underliggende rom som følge av utett våtrom er uttrykkelig unntatt på Basis.','catalog/sources/if/hus/Bygningsforsikring.pdf','8 §4.4',PRESENT,['hus.vatrom.folgeskade'],inventory_id='IF-HU-023-BASIS-NEGATIVE')
A.reverse(x['product'],{'hus.vatrom.folgeskade':{'path':x['source_artifact'],'page':8,'section':'4.4','note':'Exact explicit negative clause, not inference from silence.'}})
# Safety clauses of chapters 3/4 do not establish coverage on Basis; exact tier is material.
x=A.fact('if-reise-basis','Reisegods/forsinkelse sikkerhetsforskrift','product applicability','Kapittel 3 og 4 gjelder Standard/Super. Basis har ikke forsinkelser eller personlige eiendeler i nivåtabellen; sikkerhetsforskrift for disse kapitlene er ikke dokumentasjon på en Basis-dekning.','catalog/sources/if/reise/canonical/Helars-reiseforsikring-vilkar.pdf','2 nivåtabell;8 §3;11 §4.4','CATALOG_FACT_SEMANTICALLY_MISMAPPED',['reise.sikkerhet.reisegods'],'P2','Basis får en vilkårsregel fra to dekninger som det eksakte nivået ikke inkluderer. Dette må scopes til de aktuelle dekningene, uten å endre Basis andre ytelser.','SCRC-040',inventory_id='IF-RE-REVERSE-BASIS-SAFETY')
for c in A.support:
 if c['catalog_claim_id']=='CC-03043':c.update(support_status='CATALOG_FACT_SEMANTICALLY_MISMAPPED',full_claim_validated=False,reviewed_source_fact_ids=[x['source_fact_id']],finding_ids=[x['finding_id']],manual_reverse_evidence={'path':x['source_artifact'],'location':x['source_location'],'note':x['structured_value']})
for pid,keys,ref,note in [
 ('tryg-campingvogn-campingvogn-ekstra',['campingvogn.utstyr.dekning','campingvogn.losore.dekning'],'SF-6019','PAU27016 s1 extends underlying Kasko sum. Generic covered event language supported; explicit rental/fortelt/item conditions separately inventoried.'),
 ('tryg-mc-kasko',['nyverdi.dekning'],'SF-0138','PAU25405 s3–4 §3.4 gives new MC after qualifying total loss/theft. Age/km/damage threshold and ownership separately represented; omitted contract variant separately found.'),
 ('tryg-mc-mc-ekstra',['nyverdi.dekning'],'SF-0143','Exact same inherited PAU25405 §3.4; no invented three-year Extra extension.'),
 ('tryg-mc-mc-ekstra',['utstyr.dekning','mc.bagasje.dekning'],'SF-5748','PAU25935 s1 definitions inherited; Extra s1 raises sums but retains lawful permanent attachment/bag in lockable box. Existing source rules TR-MB-038/039.'),
 ('tryg-bobil-bobil-ekstra',['utstyr.dekning','bobil.losore.dekning'],'SF-0161','PAU25335 s1 defines permanent equipment, belongings in motorhome/awning; Extra s1 increases sums and keeps explicit exclusions. TR-MB-039/046.')]:
 f=next(f for f in A.f if f['source_fact_id']==ref)
 A.reverse(pid,{k:{'source_fact_id':ref,'path':f['source_artifact'],'location':f['source_location'],'note':note} for k in keys})
for pid in ['if-bat-delkasko','if-bat-kasko','if-bat-super']:
 A.reverse(pid,{'bat.geografi.dekning':{'path':'catalog/sources/boat-pet/if-boat-terms.pdf','location_correction':True,'location':'2 §2 (not cover page1)','note':'Generic Included is supported by geographic clause; companion bat.geografi.omrade carries the extent; no separate missing coverage inferred.'}})
assert not [c for c in A.support if c['support_status']=='UNREVIEWED']
# Historical candidate resolved by source-first exact Extra theft table, keep its stable source-fact ID.
f=next(f for f in A.f if f['source_fact_id']=='SF-0227');f.update(classification='AUDIT_CANDIDATE_SUPERSEDED',advisor_relevance='ADMINISTRATIVE',reason='Candidate resolved by exact Extra fullterm; see SF-6299 / GAP-4431. Not an additional occurrence.',superseded_by_source_fact_id='SF-6299')
A.a['unsupported_catalog_claims']['candidates']=[]
A.a['unsupported_catalog_claims']['candidate_resolution_history']=[{'catalog_claim_id':'CC-01372','resolved_by':'GAP-4431','source_fact_id':'SF-6299','disposition':'UNSUPPORTED_APPLICABILITY_OR_SEMANTICS'}]
A.checkpoint('Reverse ledger closed; exact unresolved source scope retained; no UNREVIEWED catalog claims','OUTPUT_QUALITY_AND_ROOT_CAUSE_RECONCILIATION','all','FINAL_INTEGRITY_AND_REPORT')
print('Reverse ledger closed; source-backed facts:',len(A.f))
