"""Produces planning documents only in the approved tmp directory."""
from research_model import *

# A correction batch has one source-readiness gate and one provider/type/scope
# authoring operation. Unresolved semantic choices do not ride on ready edits.
groups=collections.defaultdict(list)
for s,d in decisions.items():
    if s in p1sigs:groups[d['group']].append(s)

def batchwave(gr):
    if len(gr)==1:return specby[gr[0]]['wave'] or 5
    return {'DATA':3,'MAP-REGISTER':4,'MODEL':4,'SOURCE':5,'HISTORICAL':6}[gr[-1]]
order=sorted(groups,key=lambda gr:(batchwave(gr), 0 if gr==('FIX-MC-RENTAL',) else 1, gr))
ids={gr:f'B-{i:03}' for i,gr in enumerate(order,1)}
for s,d in decisions.items(): d['batch_id']=ids.get(d['group'])
# P2 only where explicitly reviewed as the same corrective operation.
piggy={}
for fid,key in [('GAP-5699','FIX-HOUSE-DEDUCTION'),('GAP-5714','FIX-IF-MEDICAL')]:
    piggy[gap[fid]['signature']]=ids[(key,)]
for s,d in decisions.items():
    if s not in p1sigs and s in special and (special[s],) in ids:piggy[s]=ids[(special[s],)]

protect=['document > catalog','optional availability != customer selected','unknown != not covered',
 'provider/type/scope/version isolation','product level and add-on boundaries','side-swap symmetry without invented equivalents',
 'age start/reduction/expiry and object age kept distinct','annual/accumulated/coverage mileage kept distinct',
 'per event/year/lifetime/selected sum kept distinct','source page/hash and fact-specific provenance',
 'same object identity and pricing/TFA are not catalog eligibility']
base_tests=['Own-source exact subject/value/unit/period/conditions with page/hash',
 'Exact base, inherited, optional and unavailable product-level combinations',
 'Same-product and both comparison directions; provider-specific facts stay asymmetric where appropriate',
 'Document X versus catalog Y: X wins; silent optional remains unknown; explicit not_selected remains not_selected',
 'Cross-provider/type/scope/version negatives; no customer object/pricing changes']
post_audit=['Compare before/after exact scoped products against independent source-fact inventory',
 'Reverse-check changed claims for support and wrong-level leakage',
 'Re-run linked false-unknown controls with own-source oracle; inspect sources and details',
 'Record closed/reopened signature IDs; targeted family bulk comparison; held-out positive controls',
 'Full existing suite, TypeScript, ESLint, webpack production build, synthetic HTTP/PDF runtime, git diff --check after future implementation']
models={'TRIVIAL_DATA':'GPT-6 SOL MEDIUM','DATA_BATCH':'GPT-6 SOL HIGH','SMALL_CODE':'GPT-6 ASTRA EXTRA HIGH','SOURCE_RESEARCH':'GPT-6 ASTRA EXTRA HIGH','DEFERRED':'GPT-6 SOL MEDIUM'}

def evidence(rows):
    grouped=collections.defaultdict(list)
    for r in rows:grouped[(r['signature'],r['source_artifact'],r['source_location'],r['component'])].append(r)
    out=[]
    for rs in grouped.values():
        r=rs[0]
        out.append(dict(finding_id=r['finding_id'],finding_ids=[v['finding_id'] for v in rs],source_fact_id=r['source_fact_id'],source_fact_ids=[v['source_fact_id'] for v in rs],
          product_identity=r['product_identity'],product_identities=sorted({v['product_identity'] for v in rs}),component=r['component'],
          artifact=r['source_artifact'],sha256=r['source_hash'],location=r['source_location'],urls=parsed(r['source_urls']),source_evidence=r['source_evidence'],
          catalog_evidence_ref='gap-findings.csv / finding_ids / catalog_evidence; frozen catalog.json',
          proposed_existing_keys=parsed(r['proposed_existing_keys']),advisor_impact=r['advisor_impact'],audit_scope_notes=sf[r['source_fact_id']].get('reason',''),
          source_metadata_ref='source-fact-inventory.csv / source_fact_ids / source_metadata'))
    return out

def registry_file(fam):
    if fam in ['Hund','Katt','Båt']:return 'lib/boat-pet-registry.ts'
    if fam in ['Snøscooter','Campingvogn','Tilhenger']:return 'lib/vehicle-object-registry.ts'
    if fam in ['MC','Bobil']:return 'lib/mc-bobil-registry.ts'
    return 'lib/insurance-normalization.ts'

batches=[]
for gr in order:
    sigs=groups[gr];rows=[r for s in sigs for r in sigrows[s]];reps=[decisions[s]['rows'][0] for s in sigs]
    families=sorted({r['insurance_type'] for r in rows});providers=sorted({r['provider'] for r in rows});scopes=sorted({r['scope'] for r in rows})
    kind=gr[-1];bid=ids[gr];is_special=len(gr)==1
    if is_special:
        z=specby[kind];title,layer,complexity,risk,change,reg=z['title'],z['layer'],z['complexity'],z['risk'],z['change'],z['protect']
        readiness={'SOURCE_RESEARCH_FIRST':'SOURCE_RESEARCH_FIRST','MAPPING_REVIEW_FIRST':'MAPPING_REVIEW_FIRST','CANONICAL_REVIEW_FIRST':'CANONICAL_REVIEW_FIRST'}.get(z['disposition'],'IMPLEMENTATION_READY')
    else:
        what={'DATA':'Materialiser dokumenterte P1-dimensjoner på eksisterende nøkler','MODEL':'Avklar semantisk plassering før P1-dimensjoner materialiseres','MAP-REGISTER':'Avklar typegyldige nøkler og detaljkobling','SOURCE':'Avklar konflikt eller kildepakke før berørte påstander endres','HISTORICAL':'Historisk Eika: behold separat utbedringsplan'}[kind]
        title=f'{gr[0]} · {gr[1]} · {gr[2]}: {what}'
        layer={'DATA':'CATALOG_DATA','MODEL':'CANONICAL_MODEL_REVIEW','MAP-REGISTER':'CANONICAL_MAPPING','SOURCE':'SOURCE_AUTHORITY','HISTORICAL':'HISTORICAL_SCOPE'}[kind]
        complexity={'DATA':'DATA_BATCH','MODEL':'SMALL_CODE','MAP-REGISTER':'SMALL_CODE','SOURCE':'SOURCE_RESEARCH','HISTORICAL':'DEFERRED'}[kind]
        risk='MEDIUM' if kind=='DATA' else 'HIGH' if kind in ['MODEL','MAP-REGISTER','SOURCE'] else 'LOW'
        readiness={'DATA':'IMPLEMENTATION_READY','MODEL':'CANONICAL_REVIEW_FIRST','MAP-REGISTER':'MAPPING_REVIEW_FIRST','SOURCE':'SOURCE_RESEARCH_FIRST','HISTORICAL':'DEFERRED'}[kind]
        change={'DATA':'Utfør bare de kildebundne dimensjonsendringene listet i evidence. Gjenbruk eksisterende nøkler og behold kvalifikasjoner; del eventuell lang tekst etter faktisk semantisk dimensjon, aldri heuristisk UI-tolkning.',
         'MODEL':'Ta beslutning per oppført konsept/dimensjon i canonical-review-queue. Prøv eksisterende eksakt nøkkel eller tydelig provider-detalj først. Ny nøkkel bare etter dokumentert tap/falsk ekvivalens ved gjenbruk. Deretter implementeres bare godkjent scoped forfatteroperasjon. Ingen generell schema-ombygging er bevist nødvendig.',
         'MAP-REGISTER':'Kontroller eksisterende nøkkel, type-register og parent/detail-kobling per oppført dimensjon. Rebruk trygg identitet eller legg til eksplisitt typeavgrenset registrering. Ikke utled fra etikett/tall i UI, og ikke utvid ekstraksjon uten separat bevist behov.',
         'SOURCE':'Besvar de navngitte kildeoppgavene. Dokumenter hvilken produkt-/versjonsregel som gjelder før redigering; ingen flertallsavgjørelse mellom kilder eller kopiering fra en peer.',
         'HISTORICAL':'Ingen endring i aktiv pilotbatch. P10/P15 må avklares/rettes før disse historiske kundeproduktene sammenlignes; avgrensningen er ikke en friskmelding av historisk PDF-flyt.'}[kind]
        reg='; '.join(f"{r['semantic_concept']} / {r['semantic_dimension']} ({r['finding_id']})" for r in reps)
    p2s=[s for s,b in piggy.items() if b==bid]
    p2rows=[r for s in p2s for r in sigrows[s]]
    allrows=rows+p2rows
    affected=sorted({r['product_identity'] for r in allrows})
    authoring=sorted({f for r in allrows for f in production_files(scope_provider(r),r['insurance_type'])})
    conditional=sorted({registry_file(f) for f in families}) if readiness in ['CANONICAL_REVIEW_FIRST','MAPPING_REVIEW_FIRST'] else []
    if kind=='MODEL-BRUK-LIV':conditional+=['lib/product-catalog.ts','lib/manual-product-selection.ts','lib/catalog-enrichment.ts','lib/catalog-product-comparison.ts']
    source_tasks=sorted({taskby[source_sig[s]]['research_task_id'] for s in sigs if s in source_sig})
    batch=dict(batch_id=bid,wave=batchwave(gr),title=title,group_key=list(gr),root_cause_ids=[],
      original_root_cause_ids=sorted({r['root_cause_id'] for r in allrows}),original_batch_ids=sorted({r['remediation_batch'] for r in allrows}),
      signature_ids=sorted(sigs),P2_piggyback_signatures=p2s,
      finding_signature_count=len(sigs)+len(p2s),finding_occurrence_count=len(allrows),
      P1_signature_count=len(sigs),P1_occurrence_count=sum(r['severity']=='P1' for r in rows),
      P2_piggyback_count=sum(r['severity']=='P2' for r in allrows),
      products_affected=affected,families_affected=families,providers=providers,scopes=scopes,
      addon_components=sorted({r['component'] for r in allrows if r['component']}),
      layer=layer,complexity=complexity,risk=risk,source_readiness=readiness,
      pilot_priority='DEFER_UNTIL_HISTORICAL_SUPPORTED' if readiness=='DEFERRED' else 'MUST_BEFORE_NITO',
      customer_mode_impact='LIKELY_SHARED_WITH_CUSTOMER_MODE',
      extraction_extension_required='NOT_PROVEN_REQUIRED',
      runtime_assumption='Catalog knowledge improvement is shared where enrichment is eligible; no real customer PDF or extraction conclusion is claimed.',
      expected_production_files=authoring,conditional_shared_files=conditional,
      proposed_regression_file=f'tests/remediation-{bid.lower()}.test.mjs (future; consolidate with relevant existing suite if clearer)',
      dependencies=source_tasks,source_task_ids=source_tasks,canonical_review_ids=[],
      test_plan=base_tests+[reg],post_fix_audit=post_audit,recommended_model=models[complexity],
      what_must_change=change,what_must_not_change=protect,
      evidence=evidence(allrows),ready_means='Source/scope gate satisfied for listed dimensions only; separate user authorization and regression still required.',
      source_freshness='Frozen corpus 2026-09-29, not live current-source verification',
      optional_choice_policy='Known catalog availability never selects a customer add-on',
      finding_status='PLANNED_NOT_IMPLEMENTED')
    batches.append(batch)
bybid={b['batch_id']:b for b in batches}
# Exact dependency graph: narrow corrections precede larger writes to the same
# family/provider; sources only gate the conflicted signatures, never whole families.
for b in batches:
    if len(b['group_key'])>1 and b['group_key'][-1] in ['DATA','MODEL','MAP-REGISTER']:
        for a in batches:
            if len(a['group_key'])==1 and a['wave']<=b['wave'] and set(a['families_affected'])&set(b['families_affected']) and set(a['providers'])&set(b['providers']):b['dependencies'].append(a['batch_id'])
    b['dependencies']=sorted(set(b['dependencies']))
# Source queue linkage.
for t in tasks:
    t['blocks_batch_ids']=[b['batch_id'] for b in batches if t['research_task_id'] in b['dependencies']]
    t['pilot_blocking_reason']='A source/eligibility adjudication is required before a non-misleading active-pilot gate can be signed; this does not assert every topic requires a code change.' if t['pilot_blocking'] else 'No active P1 dimension is blocked by this task; historical, stale, lower-applicability or extra guarantee question retained for full quality.'

# Reconcile final implementation mechanisms, not company-independent symptoms.
rootkeys={}
for b in batches:
    gr=b['group_key']
    if len(gr)==1:rk=('SPECIFIC',gr[0])
    elif gr[-1] in ['DATA','MODEL','MAP-REGISTER']:rk=('AUTHORING',*gr[:3])
    elif gr[-1]=='SOURCE':rk=('SOURCE',*b['source_task_ids'])
    else:rk=('HISTORICAL',*gr[:3])
    rootkeys.setdefault(rk,[]).append(b['batch_id'])
finalroots=[]
for i,(rk,bids) in enumerate(sorted(rootkeys.items()),1):
    rid=f'RC-{i:03}';bs=[bybid[x] for x in bids];old=sorted({r for b in bs for r in b['original_root_cause_ids']})
    sigs=sorted({s for b in bs for s in b['signature_ids']});is_author=rk[0]=='AUTHORING'
    finalroots.append(dict(final_root_cause_id=rid,mechanism_scope=list(rk),batch_ids=bids,original_root_cause_ids=old,
      evidence_strength='Observed source → authored/resolved catalog discrepancy; original developer intent unknown',
      description=('Én provider-/type-/scope-avgrenset kilde-til-forfatterpakke mangler dokumenterte dimensjoner. Data, nøkkelvalg og type-register avgjøres i separate gate-batches.' if is_author else bs[0]['what_must_change']),
      evidence=[{'existing_root':r,'description':next(x['description'] for x in oldroots if x['root_cause_id']==r),'code_evidence':next(x['evidence'] for x in oldroots if x['root_cause_id']==r)} for r in old],
      signature_ids=sigs,products=sorted({p for b in bs for p in b['products_affected']}),
      unresolved_implementation_gate=any(b['source_readiness'] not in ['IMPLEMENTATION_READY','DEFERRED'] for b in bs),
      systemic_cause_proven=False,systemic_note='Omission/incorrect authoring is observed; no unproven common generator or engine failure inferred.'))
    for b in bs:b['root_cause_ids']=[rid]
# SCRC-049 (Tryg Hus) has only P2 findings. Retain its root explicitly in
# backlog; do not fabricate a pilot remediation batch just to fill a table.
for o in oldroots:
    if not any(o['root_cause_id'] in r['original_root_cause_ids'] for r in finalroots):
        rows=[g for g in gaps if g['root_cause_id']==o['root_cause_id']]
        assert all(g['severity']=='P2' for g in rows)
        finalroots.append(dict(final_root_cause_id=f'RC-{len(finalroots)+1:03}',mechanism_scope=['DEFERRED_P2_ONLY',o['root_cause_id']],batch_ids=[],
          original_root_cause_ids=[o['root_cause_id']],evidence_strength=o['confidence'],description=o['description'],evidence=o['evidence'],
          signature_ids=sorted({g['signature'] for g in rows}),products=sorted({g['product_identity'] for g in rows}),unresolved_implementation_gate=False,
          systemic_cause_proven=False,status='DEFER_POST_PILOT',reason='No P1 in this root; every P2 signature is retained in p2-piggyback.csv. No new active batch justified.'))
rootreview=[]
for o in oldroots:
    rs=[r for r in finalroots if o['root_cause_id'] in r['original_root_cause_ids']]
    rootreview.append(dict(existing_root_cause_id=o['root_cause_id'],final_root_cause_id=[r['final_root_cause_id'] for r in rs],
     status='DEFERRED_P2_ONLY' if rs and not any(r['batch_ids'] for r in rs) else 'SPLIT' if len(rs)>1 else 'MERGED' if any(len(r['original_root_cause_ids'])>1 for r in rs) else 'RETAINED',
     merge_target=[r['final_root_cause_id'] for r in rs if len(r['original_root_cause_ids'])>1],split_targets=[r['final_root_cause_id'] for r in rs] if len(rs)>1 else [],
     evidence_strength=o['confidence'],affected_signatures=sorted({g['signature'] for g in gaps if g['root_cause_id']==o['root_cause_id']}),
     affected_products=sorted({g['product_identity'] for g in gaps if g['root_cause_id']==o['root_cause_id']}),final_batch_ids=sorted({b for r in rs for b in r['batch_ids']}),
     rationale='Split by actual product authoring boundary, incorrect claim, inheritance and readiness. Repeated early/late reviews coalesce only for the same scoped operation; similar symptoms alone do not merge providers.',original_evidence=o['evidence']))

# Canonical questions are explicit semantic signatures, not schema-change orders.
reviews=[]
reviewgroups=collections.defaultdict(list)
for s,d in decisions.items():
    if s in p1sigs and d['disposition'] in ['CANONICAL_REVIEW_FIRST','MAPPING_REVIEW_FIRST']:
        r=d['rows'][0];reviewgroups[(r['insurance_type'],r['semantic_concept'],r['semantic_dimension'],d['disposition'],tuple(parsed(r['proposed_existing_keys'])))].append(s)
for i,(rg,sigs) in enumerate(sorted(reviewgroups.items()),1):
    rid=f'CR-{i:03}';rows=[r for s in sigs for r in sigrows[s]];bids=sorted({decisions[s]['batch_id'] for s in sigs})
    candidates=sorted(keys_by_family[rg[0]])
    review=dict(review_id=rid,concept=rg[1]+' / '+rg[2],current_keys=list(rg[4]),problem='No exact mapping approved in the audit' if not rg[4] else 'Proposed key/type/detail relationship needs explicit validation',
     disposition=rg[3],affected_products=sorted({r['product_identity'] for r in rows}),affected_families=[rg[0]],
     candidate_approach='First test exact reuse or source-bound provider-specific detail within an existing parent. A new key is allowed only if subject, trigger, unit, period or optionality would otherwise be lost or falsely equated.',
     false_equivalence_risk='Do not merge different event/subject/period/level merely to fill both sides. Existing type keys are candidates, not approved synonym mappings.',
     blocks_batches=bids,signature_ids=sigs,representative_finding_ids=[decisions[s]['representative_finding_id'] for s in sigs],
     existing_type_key_inventory_ref=f'existing-type-registries.json#{rg[0]}',
     required_semantic_tuple=['subject','trigger','unit','period','limit_basis','conditions','level','optionality','provider/type/scope/version','source'],
     source_evidence=[dict(finding_id=r['finding_id'],source_fact_id=r['source_fact_id'],artifact=r['source_artifact'],location=r['source_location']) for r in rows[:1]],full_evidence_ref='Listed signature IDs → p1-triage.csv → frozen gap/source-fact inventory; batch evidence in triage.json',decision='PENDING_REVIEW',human_signoff='REQUIRED_BEFORE_IMPLEMENTATION')
    if any(decisions[s]['kind']=='MODEL-BRUK-LIV' for s in sigs):
        review['problem']='CatalogAddOn.requiresLevel addresses main level, not selected Liv add-on; Katt Bruk additionally lacks its own component.'
        review['candidate_approach']='Review narrow explicit add-on dependency versus source-correct package composition; never silently select Liv. Only proven current structural gap here, not a general schema rewrite.'
    reviews.append(review)
    for bid in bids:bybid[bid]['canonical_review_ids'].append(rid);bybid[bid]['dependencies'].append(rid)

# Domain adjudication is separated from acquisition and automatic model matching.
human_specs=[
 ('HR-001','frende-trailer-deductible','Frende Tilhenger §11.11: avklar prioritetsforhold mellom typebestemt egenandel og generell brann/tyveri.','Specificity alone has not safely resolved precedence; source may need insurer clarification.'),
 ('HR-002','frende-boat-applicability','Frende Båt: avgjør om eksplisitt transport også dokumenterer sjøsetting/opptak; behold forskjellen til det er begrunnet.','Combined current label is broader than independently documented event; no semantic guess.'),
 ('HR-003','gj-dog-treatment','Gjensidige Hund: avgrens basis akupunktur/fysikalsk behandling fra valgfri rehabilitering.','Treatment modalities and optional boundary conflict across official sources.'),
 ('HR-004','storebrand-motor-applicability','Storebrand: separat typevurdering av MC bagasje og Bobil Kasko nyverdi.','General motor wording cannot override exact type applicability; separate written verdicts required.'),
 ('HR-005','storebrand-travel-transfer','Storebrand Reise: vurder overføring av eksisterende norsk forsikring versus kjøp på påbegynt reise.','An exception cannot be merged into general travel eligibility without applicability proof.'),
]
humans=[]
for hid,key,question,why in human_specs:
    t=taskby[key]
    humans.append(dict(review_id=hid,finding_root_cause=t['conflict_ids'],provider=t['provider'],family=t['family'],product=t['products'],question=question,
      source_evidence=[c for c in conflicts if c['id'] in t['conflict_ids']],catalog_state='Exact audited statements retained; unresolved eligibility not approved as universal coverage.',
      why_model_cannot_safely_decide=why,pilot_impact='MUST_BEFORE_NITO for affected active scope; may accept a proven conservative limit only with explicit documented approval.',
      research_task_ids=[t['research_task_id']],blocks_batch_ids=t['blocks_batch_ids'],status='PENDING'))
    for bid in t['blocks_batch_ids']:bybid[bid]['dependencies'].append(hid)

# Scheduling by real file ownership; no simultaneous writers to a shared file.
fileowners=collections.defaultdict(list)
for b in batches:
    for f in b['expected_production_files']+b['conditional_shared_files']:fileowners[f].append(b['batch_id'])
for b in batches:
    b['shared_state_conflicts']=sorted({x for f in b['expected_production_files']+b['conditional_shared_files'] for x in fileowners[f] if x!=b['batch_id']})
    b['parallelization_status']='NOT_SAFE_FOR_PARALLEL_EXECUTION' if b['conditional_shared_files'] or b['layer'] in ['INHERITANCE','ADDON'] else 'MAIN_AGENT_REVIEW_REQUIRED' if b['shared_state_conflicts'] or b['source_readiness']!='IMPLEMENTATION_READY' else 'SAFE_FOR_SUBAGENT'
    b['parallel_condition']='One named file owner; source research may be parallel read-only. Disjoint files only after all dependencies pass. No agents launched in this triage.'
    b['dependencies']=sorted(set(b['dependencies']))

p1rows=[]
for s in sorted(p1sigs):
    d=decisions[s];b=bybid[d['batch_id']];rows=sigrows[s];r=gap[d['representative_finding_id']]
    reason=(specby[d['kind']]['change'] if d['kind'] in specby else b['what_must_change'])
    p1rows.append(dict(signature_id=s,representative_finding_id=d['representative_finding_id'],provider_family_scope=sorted({(x['provider'],x['insurance_type'],x['scope']) for x in rows}),
      root_cause_id=b['root_cause_ids'],final_batch_id=b['batch_id'],disposition=d['disposition'],pilot_priority=b['pilot_priority'],source_status=b['source_readiness'],
      P1_occurrences=sum(x['severity']=='P1' for x in rows),P2_occurrences=sum(x['severity']=='P2' for x in rows),finding_ids=ids_for_sig(s),
      products=sorted({x['product_identity'] for x in rows}),source_fact_ids=sorted({x['source_fact_id'] for x in rows}),proposed_existing_keys=parsed(r['proposed_existing_keys']),
      semantic_concept=r['semantic_concept'],semantic_dimension=r['semantic_dimension'],notes=reason,
      covered_by_signature=duplicate_sig.get(s,''),
      mapping_evidence_basis='Audit exact semantic review + current read-only type/key inventory. Existing key presence does not approve cross-provider semantics.',
      remediation_authorized=False))
p2rows=[]
for s,rs in sigrows.items():
    if s in p1sigs:continue
    d=decisions[s];pg=piggy.get(s)
    p2rows.append(dict(signature_id=s,finding_ids=ids_for_sig(s),occurrence_count=len(rs),provider=sorted({r['provider'] for r in rs}),family=sorted({r['insurance_type'] for r in rs}),
      disposition='P2_PIGGYBACK_SAFE' if pg else 'DEFER_UNTIL_RELEVANT' if historical(rs) else 'DEFER_POST_PILOT',batch_id=pg or '',
      rationale='Explicitly reviewed same source table/qualifier correction; no new research or dependency.' if pg else 'No independent evidence of negligible marginal risk in the SAME approved edit. Preserve finding for later scoped follow-up; P2 is not dismissed.',
      source_fact_ids=[r['source_fact_id'] for r in rs],candidate_authoring_files=sorted({f for r in rs for f in production_files(scope_provider(r),r['insurance_type'])})))

# Exact original group review and reverse-claim routing.
oldbatchreview=[]
for ob in oldbatches:
    rs=[r for r in gaps if r['remediation_batch']==ob['batch_id']];bids=sorted({decisions[r['signature']]['batch_id'] for r in rs if decisions[r['signature']]['batch_id']})
    oldbatchreview.append(dict(original_batch_id=ob['batch_id'],final_batch_ids=bids,root_ids=sorted({r['root_cause_id'] for r in rs}),review_status='DEFERRED_P2_ONLY_NO_ACTIVE_BATCH' if not bids else 'SPLIT_BY_SCOPE_MECHANISM_READINESS' if len(bids)>1 else 'RETAINED_SCOPED',
      P1_signature_count=len({r['signature'] for r in rs if r['severity']=='P1'}),P2_only_signatures=sorted({r['signature'] for r in rs if r['signature'] not in p1sigs}),
      mixed_gate_reason='Keep documented data independent from source-conflicted dimensions and unapproved semantic mapping. Split same root into atomic operations; serialize common files.',
      original_work=ob['work'],original_complexity=ob['complexity'],reviewed=True))
reverse=[]
for typ in ['unsupported-catalog-facts','catalog-semantic-mismatches']:
    for row in readcsv(typ):
        fids=parsed(row.get('finding_ids'));sigs=sorted({gap[f]['signature'] for f in fids});bids=sorted({(decisions[s]['batch_id'] or piggy.get(s)) for s in sigs if (decisions[s]['batch_id'] or piggy.get(s))})
        reverse.append(dict(registry=typ,claim_id=row['catalog_claim_id'],support_status=row['support_status'],product_identity=row['product_identity'],key=row['key'],finding_ids=fids,signature_ids=sigs,final_batch_ids=bids,
          research_conflicts=(['SC-012'] if row['catalog_claim_id'] in ['CC-01253','CC-01291'] else [c['id'] for c in conflicts if c['id'] in str(row)]),evidence=row['manual_reverse_evidence'],no_automatic_rewrite=True))

# Named false-unknown controls, overnight control and all audited positives.
regcontrols=[]
for i,c in enumerate(controls,1):
    regcontrols.append(dict(control_id=f'FU-{i:02}',kind='VERIFIED_FALSE_UNKNOWN',name=c['product_identity']+' / '+c['key'],
      finding_ids=c['finding_ids'],source_fact_ids=c['source_fact_ids'],batch_ids=sorted({decisions[gap[f]['signature']]['batch_id'] for f in c['finding_ids']}),
      expected='After approved remediation: own-source supported dimension renders with exact scope; no inference from peer. Side-swap consistent.',
      evidence=c,privacy='public catalog only'))
regcontrols.append(dict(control_id='OVERNIGHT-01',kind='EXPLICIT_MAPPING_CONTROL',name='Storebrand Reise day-trip versus Tryg generic overnight scope',finding_ids=['GAP-1642'],source_fact_ids=[gap['GAP-1642']['source_fact_id']],batch_ids=[ids[('MAP-OVERNIGHT',)]],
 expected='Explicit general reise.overnatting key; retain separate avbestilling/leiebil overnight qualifiers and Tryg work-purpose. No free-text UI extraction.',evidence='reise-overnatting-control.json; lib/storebrand-reise-catalog.ts; type-key comparison',privacy='public catalog only'))
for i,c in enumerate(audit['positive_controls'],1):
    regcontrols.append(dict(control_id=f'PC-{i:04}',kind='AUDITED_POSITIVE',name=c['provider']+' '+c['insurance_type']+' '+c['semantic_subject']+' / '+c['semantic_dimension'],
      finding_ids=[],source_fact_ids=[c['source_fact_id']],batch_ids=[b['batch_id'] for b in batches if c['product_identity'] in b['products_affected']],
      expected='Preserve source meaning and customer-specific unknown status; do not lock incidental wording.',
      evidence={k:c[k] for k in ['product_identity','source_artifact','source_location','classification','structured_value','reason']},privacy='public catalog only'))

# Unresolved claims are NOT automatically granted a pilot exemption.
limitations=[]
for t in tasks:
    limitations.append(dict(limitation_id='L-'+t['research_task_id'],provider=t['provider'],family=t['family'],product=t['products'],concept=t['question'],reason_unresolved=t['missing_evidence'],
      current_safe_behavior='NOT_CERTIFIED_FOR_EXCEPTION. Recheck exact current claim against conflict; some catalog positives/boundaries may be misleading.',
      advisor_impact='Cannot safely conclude a disputed limit, level, eligibility or scope.',pilot_communication_needed='If exception later approved: name exact affected product/fact and unresolved source issue; never blanket disclaimer.',
      approval_status='NOT_APPROVED',pilot_exception_accepted=False,research_task_id=t['research_task_id'],pilot_blocking=t['pilot_blocking'],
      release_condition='Resolve official source, OR prove current conservative representation AND gain explicit domain/pilot approval; P1 source-backed omissions cannot use this escape.'))
limitations.append(dict(limitation_id='L-HISTORICAL',provider=['fremtind'],family=['Reise'],product=[p['product_identity'] for p in products if p['historical']=='True'],concept='Eika P10/P15 historical customer comparisons',reason_unresolved='Active NITO scope excludes both historical products; defects remain for historical PDFs.',current_safe_behavior='Excluded from active product selection/materialization; historical customer mode is NOT certified.',advisor_impact='No assurance for historical policy comparison.',pilot_communication_needed='Explicit exclusion/review of these historical agreements before pilot use.',approval_status='SCOPE_RESTRICTION_REQUIRES_PILOT_SIGNOFF',pilot_exception_accepted=False,pilot_blocking=False))

conflictreview=[]
for c in conflicts:
    k=conflict_to_group.get(c['id']);t=taskby.get(k)
    conflictreview.append(dict(conflict_id=c['id'],input_status=c['status'],triage_status='RESOLVED_PRESERVE_POSITIVE' if c['id']=='SC-005' else 'STALE_VERSION_NEW_IPID_REQUIRED' if c['id']=='SC-003' else 'OPEN_RETAINED',
      research_task_id=t['research_task_id'] if t else '',provider=c['provider'],family=c['family'],claim=c['claim'],evidence=c['observed'],
      sources=parsed(c['source_identities']),resolution='No new conflict resolution performed; SC-005 already resolved in original audit.' if c['id']=='SC-005' else 'Do not pick a value or inclusive boundary; preserve exact uncertainty until dated applicability is established.'))

# Artifacts contain references, not a duplicated copy of every original finding.
outputs={
 'p1-triage.csv':p1rows,'root-cause-triage.csv':rootreview,'original-batch-review.csv':oldbatchreview,
 'source-research-plan.csv':tasks,'source-research-reconciliation.csv':reconciliation,
 'human-review-queue.csv':humans,'canonical-review-queue.csv':reviews,'p2-piggyback.csv':p2rows,
 'pilot-known-limitations.csv':limitations,'regression-control-registry.csv':regcontrols,
 'source-conflict-triage.csv':conflictreview,'reverse-claim-triage.csv':reverse,
 'remediation-plan.csv':[{k:v for k,v in b.items() if k!='evidence'} for b in batches],
 'file-collisions.csv':[dict(file=f,batch_ids=bs,rule='SEQUENTIAL_ONE_FILE_OWNER') for f,bs in fileowners.items() if len(bs)>1],
 'parallel-safe.csv':[b for b in batches if b['parallelization_status']=='SAFE_FOR_SUBAGENT'],
 'sequential-review.csv':[{k:b[k] for k in ['batch_id','title','parallelization_status','dependencies','expected_production_files','conditional_shared_files','shared_state_conflicts']} for b in batches if b['parallelization_status']!='SAFE_FOR_SUBAGENT'],
}
for name,rows in outputs.items():csvout(name,rows,fields=None if rows else ['batch_id','reason'])

counts=dict(P1_input_signatures=1589,P1_dispositions=dict(collections.Counter(r['disposition'] for r in p1rows)),P1_occurrences=sum(r['P1_occurrences'] for r in p1rows),
 final_batches=len(batches),batch_readiness=dict(collections.Counter(b['source_readiness'] for b in batches)),
 original_root_posts=60,final_implementation_root_causes=sum(bool(r['batch_ids']) for r in finalroots),final_root_registry_count=len(finalroots),deferred_P2_only_roots=sum(not r['batch_ids'] for r in finalroots),root_posts_split=sum(r['status']=='SPLIT' for r in rootreview),
 final_roots_merging_multiple_old_posts=sum(len(r['original_root_cause_ids'])>1 for r in finalroots),
 unresolved_root_implementation_gates=sum(r['unresolved_implementation_gate'] for r in finalroots),
 raw_open_research=110,unique_research_tasks=len(tasks),pilot_blocking_research=sum(t['pilot_blocking'] for t in tasks),
 human_reviews=len(humans),canonical_mapping_reviews=len(reviews),
 P2_only_signatures=len(p2rows),P2_piggyback_signatures=sum(bool(r['batch_id']) for r in p2rows),P2_piggyback_occurrences=sum(r['occurrence_count'] for r in p2rows if r['batch_id']),
 parallelization=dict(collections.Counter(b['parallelization_status'] for b in batches)),customer_impact=dict(collections.Counter(b['customer_mode_impact'] for b in batches)),
 false_unknown_controls=len(controls),positive_controls=len(audit['positive_controls']),regression_registry_rows=len(regcontrols),strict_unsupported_claims=8)
pilot=[dict(kind='batch',id=b['batch_id'],gate=b['source_readiness']) for b in batches if b['pilot_priority']=='MUST_BEFORE_NITO']
pilot += [dict(kind='source_research',id=t['research_task_id'],gate='Resolve OR approved demonstrated conservative representation') for t in tasks if t['pilot_blocking']]
pilot += [dict(kind='human_review',id=r['review_id'],gate='Domain signed verdict') for r in humans]
pilot += [dict(kind='canonical_mapping_review',id=r['review_id'],gate='Exact semantic tuple mapping approved') for r in reviews]
full=list(pilot)+[dict(kind='source_research',id=t['research_task_id'],gate='Additional prepilot quality') for t in tasks if not t['pilot_blocking']]+[dict(kind='P2_piggyback',id=s,gate='Same approved correction') for s in piggy]
csvout('pilot-minimum-set.csv',pilot);csvout('full-prepilot-quality-set.csv',full)
counts['pilot_minimum_set']=dict(collections.Counter(r['kind'] for r in pilot));counts['full_prepilot_quality_set']=dict(collections.Counter(r['kind'] for r in full))
triage=dict(status='PENDING_INTEGRITY_AND_QA',scope='READ_ONLY_TRIAGE_NOT_REMEDIATION',baseline=json.load((OUT/'baseline.json').open())['head'],catalog_snapshot=catalog['now'],
 counts=counts,final_root_causes=finalroots,batches=batches,source_research=tasks,human_reviews=humans,canonical_mapping_reviews=reviews,
 pilot_minimum_set=pilot,full_prepilot_quality_set=full,first_recommended_batch=ids[('FIX-MC-RENTAL',)],
 no_application_tests_run=True,no_new_sources=True,no_agents_spawned=True,remediation_authorized=False,
 audit_dependency=str(AUDIT),repo_read_only=True)
dump('triage.json',triage)
print(json.dumps(counts,ensure_ascii=False,indent=2))
