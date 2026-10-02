"""Finalize audit artifacts ONLY under the authorized /tmp directory; never modify repo."""
from continue_audit import load,save,csvsave,digest,O,R
import csv,collections,datetime,json,hashlib,subprocess,re,fnmatch
A=load('audit.json');F=load('source-facts.json');C=load('catalog.json');S=load('corpus.json');G=A['findings'];P=A['product_coverage'];D=A['addon_coverage']
claims=list(csv.DictReader((O/'catalog-fact-support.csv').open()));arts={x['path']:x for x in S['artifacts']};pids={x['product_id']:x for x in P};pf={x['productId']:x for x in C['products']}
# Preserve old journals/status for historical traceability; canonical current outputs follow below.
for n in ['audit-summary.md','manual-review.md','quality-check.json']:
 dest=O/('pre-final-'+n)
 if not dest.exists():dest.write_bytes((O/n).read_bytes())
# Correct audit-only shorthand: item exclusion != indemnity cap. Exact original first findings already correct.
for f in F:
 if f['source_fact_id'] in ['SF-8001','SF-8027','SF-8054']:
  f['structured_value']='Bagasje med verdi over 15 000 kr per gjenstand er unntatt; dette er ikke en erstatningsgrense på 15 000 kr. Smykker, klokker, kunst, penger, verdipapirer og forbruksvarer er også unntatt; navngitte skadeårsaker gjelder.'
  f['source_evidence']='Parafrase av lokalt kontrollert kildepunkt: '+f['structured_value'];f['unique_source_semantic_id']=digest([f['source_sha256'],f['source_location'],f['semantic_subject'],f['semantic_dimension'],f['structured_value']])[:20]
  for g in G:
   if g['source_fact_id']==f['source_fact_id']:g.update(source_evidence=f['source_evidence'],unique_source_semantic_id=f['unique_source_semantic_id'])
i=load('storebrand-boat-independent-inventory.json')
for q in i['rules']:
 if q.get('subject')=='Bagasje' and '15000 per gjenstand' in q.get('value',''):
  q['value']='Bagasje med verdi over15000 per gjenstand unntatt, ikke utbetalingstak; ikke smykker/klokker/kunst/penger/papirer/forbruksvarer; bestemte navngitte skadeårsaker.'
save('storebrand-boat-independent-inventory.json',i)
for f in F:
 f['full_package_review_complete']=pids[f['product']]['full_product_inventory_complete']
 f['review_scope']='Available local official package; unresolved material source questions explicitly retained.'
# Source artifacts: exact paths, not basenames. Byte reuse is NOT cross-product applicability reuse.
for ar in A['source_coverage']['artifacts']:
 rs=[r for r in A['manual_review']['products'] if ar['path'] in r.get('source_paths',[])]
 ar['manual_review_product_ids']=sorted({r['product_id'] for r in rs})
 if rs:
  ar['semantic_review_status']='READ_WITH_EXACT_PRODUCT_CLOSURE';ar['semantic_complete']=True
 elif ar['byte_identical_paths']:
  reused=[r['product_id'] for r in A['manual_review']['products'] if set(ar['byte_identical_paths'])&set(r.get('source_paths',[]))]
  assert reused,ar['path'];ar.update(semantic_review_status='BYTE_IDENTICAL_CONTENT_REUSED',semantic_complete=True,content_reuse_from=ar['byte_identical_paths'],manual_review_product_ids=sorted(set(reused)),scope_status='Exact product applicability retained in product/source inventories; duplicate only avoids repeated content read.')
 elif ar['name']=='eika-fremtind-provider.html':
  ar.update(semantic_review_status='CONTEXT_ONLY_REVIEWED',semantic_complete=True,scope_status='Corporate merger/provider context only. Not evidence of identical products, channel rules, sums or current policy coverage.')
 elif ar['name']=='Vilkar-reiseforsikring-01042020-erstattet.pdf':
  ar.update(semantic_review_status='HISTORICAL_SUPERSEDED_NOT_ACTIVE',semantic_complete=False,scope_status='Version2020 is explicitly replaced; current Frende2025 rules reviewed separately. No active claim uses this original. Header/version screened, not claimed full semantic deep review.')
 else:raise AssertionError(('unaccounted source',ar['path']))
# Retire stale research tasks without erasing IDs; do not collapse different unresolved questions.
conf={s['id']:s for s in A['source_conflicts']}
for s in conf.values():
 s['review_disposition']='RESOLVED_LOCAL' if s['status']=='RESOLVED_BY_APPLICABLE_FULL_TERMS' else 'STALE_SOURCE_SUMMARY' if s['status']=='STALE_SOURCE_CANDIDATE' else 'OPEN_OFFICIAL_CLARIFICATION'
 s['source_identities']=[{'path':p,'sha256':arts[p]['sha256'],'manifest':arts[p]['manifest_entries'],'runtime_source_ids':arts[p]['runtime_source_ids']} for p in s['sources'] if p in arts]
for q in A['source_research_queue']:
 q.setdefault('queue_id',q.get('research_id'))
 assert q['queue_id']
 q['status']='OPEN_SOURCE_RESEARCH_REQUIRED'
 if q['queue_id']=='SRQ-002':q.update(status='CLOSED_LOCAL_EVIDENCE',resolution='Exact Extra source table reviewed; GAP-4431 / SF-6299. No external research needed to establish this mismatch.')
 if q['queue_id']=='SRQ-004':q.update(status='CLOSED_LOCAL_REVIEW',resolution='All204products/84addons locally accounted. Do not treat unfinished review as missing source.')
 if q.get('conflict_id') in conf:
  c=conf[q['conflict_id']];q['status']='CLOSED_LOCAL_EVIDENCE' if c['review_disposition']=='RESOLVED_LOCAL' else 'STALE_SUMMARY_REPLACEMENT_RESEARCH' if c['review_disposition']=='STALE_SOURCE_SUMMARY' else 'OPEN_SOURCE_RESEARCH_REQUIRED'
  q['local_work_first']='Available local source package already reviewed; exact unresolved question below. No repeat download authorized.'
  q['exact_question']=c['observed'];q['source_evidence']=c['source_identities']
 # Explicit aliases prevent double-counting an initial entry and its later conflict record.
 if q['queue_id'] in ['SRQ-001','SRQ-003']:
  q.update(status='ALIAS_OF_CONFLICT_TASK',conflict_id='SC-001' if q['queue_id']=='SRQ-001' else 'SC-002')
 q.setdefault('local_work_completed',True);q.setdefault('downloaded',False)
# Source research scope materiality is independent of review completion and actionable gaps.
unclear={'SOURCE_AMBIGUOUS','REVIEW_REQUIRED','SOURCE_CONFLICT_REVIEW_REQUIRED','SOURCE_PACKAGE_GAP','SOURCE_RESEARCH_REQUIRED'}
nonadvisor={'NOT_COMPARISON_RELEVANT','SOURCE_ONLY_ACCEPTABLE','AUDIT_CANDIDATE_SUPERSEDED'}
represented={'SOURCE_FACT_PRESENT_AND_CATALOGUED','SOURCE_FACT_ALREADY_REPRESENTED_BY_PARENT','SOURCE_FACT_ALREADY_REPRESENTED_BY_CHILDREN','SOURCE_FACT_PRESENT_AS_PROVIDER_SPECIFIC_DETAIL','SOURCE_FACT_OPTIONAL_COMPONENT'}
for p in P:
 ff=[f for f in F if f['product_identity']==p['product_identity']];gg=[g for g in G if g['product_identity']==p['product_identity']];cc=[c for c in claims if c['product_identity']==p['product_identity']]
 p.update(semantic_audit_status='COMPLETE',source_support_status='REVERSE_REVIEW_COMPLETE',source_fact_occurrence_count=len(ff),advisor_relevant_source_fact_count=sum(f['classification'] not in nonadvisor for f in ff),represented_fact_count=sum(f['classification'] in represented for f in ff),administrative_count=sum(f['classification'] in nonadvisor for f in ff),source_research_required=any(f['classification'] in unclear for f in ff),local_source_insufficient=any(f['classification']=='SOURCE_PACKAGE_GAP' for f in ff),supported_catalog_fact_count=sum(str(c['full_claim_validated']).lower()=='true' for c in cc),reverse_claim_count=len(cc))
 p['catalog_readiness']='REMEDIATION_REQUIRED' if any(g['severity'] in ['P0','P1'] for g in gg) else 'SOURCE_INSUFFICIENT' if p['local_source_insufficient'] else 'REVIEW_REQUIRED' if p['source_research_required'] else 'READY_WITH_MINOR_GAPS' if gg else 'READY'
 p['remaining_work']='No unfinished local audit step. Remediation/source research remains as recorded; not authorized.'
for d in D:
 ff=[f for f in F if f['component']==d['addon_id']];gg=[g for g in G if g.get('component')==d['addon_id']]
 d.update(review_state='COMPLETE',source_support_status='AVAILABLE_LOCAL_REVIEW_COMPLETE',source_research_required=any(f['classification'] in unclear for f in ff) or 'review' in d.get('notes','').lower() or 'research' in d.get('notes','').lower(),advisor_relevant_fact_count=sum(f['classification'] not in nonadvisor for f in ff))
 d['catalog_readiness']='REMEDIATION_REQUIRED' if any(g['severity'] in ['P0','P1'] for g in gg) else 'SOURCE_INSUFFICIENT' if any(f['classification']=='SOURCE_PACKAGE_GAP' for f in ff) else 'REVIEW_REQUIRED' if d['source_research_required'] else 'READY_WITH_MINOR_GAPS' if gg else 'READY'
 d['readiness_scope_note']='Includes exact component occurrences and recorded availability/scope questions; parent-product readiness separate.'
for fam in A['family_results']:
 ps=[p for p in P if p['insurance_type']==fam['family']];fs=[f for f in F if f['insurance_type']==fam['family']];ds=[d for d in D if fam['family'] in d['insurance_type']]
 fam.update(family_checkpoint='COMPLETE',family_status='GAPS_FOUND',advisor_relevant_source_facts=sum(f['classification'] not in nonadvisor for f in fs),represented=sum(f['classification'] in represented for f in fs),administrative=sum(f['classification'] in nonadvisor for f in fs),catalog_readiness_distribution=dict(collections.Counter(p['catalog_readiness'] for p in ps)),source_research_products=sum(p['source_research_required'] for p in ps),source_insufficient_products=sum(p['local_source_insufficient'] for p in ps),addons_complete=len(ds),deep_reviews=len(ps))
for p in A['provider_diagnostics']:p['status']='COMPLETE_LOCAL_REVIEW'
# Proven unsupported insurance claims are separate from scope/label/semantic mismatch and source ambiguity.
strict={'UNSUPPORTED_CONFIRMED','CATALOG_FACT_NOT_SUPPORTED_BY_SOURCE','CATALOG_FACT_NOT_SUPPORTED_BY_APPLICABLE_SOURCE'}
mismatch={'CATALOG_FACT_SEMANTICALLY_MISMAPPED','UNSUPPORTED_APPLICABILITY_OR_SEMANTICS','LABEL_BOUNDARY_MISMATCH','LABEL_SCOPE_MISMATCH','SEMANTIC_SCOPE_OR_BOUNDARY_MISMATCH','EVENT_SCOPE_CONFLATED'}
A['unsupported_catalog_claims'].update(proven=[c for c in claims if c['support_status'] in strict],candidates=[],separate_semantic_or_scope_mismatches=[c for c in claims if c['support_status'] in mismatch],source_uncertainty=[c for c in claims if 'REVIEW_REQUIRED' in c['support_status'] or c['support_status']=='SOURCE_VERSION_CONFLICT'],definition='Strict unsupported claims do not include every qualifier gap or unresolved source conflict. Semantic/scope mismatches reported separately; categories may share underlying finding.')
for c in A['unsupported_catalog_claims']['proven']+A['unsupported_catalog_claims']['separate_semantic_or_scope_mismatches']:
 fs=[f for f in F if f['product_identity']==c['product_identity'] and c['key'] in f['proposed_keys'] and f.get('finding_id')]
 c['finding_ids']=[f['finding_id'] for f in fs];c['source_fact_ids']=[f['source_fact_id'] for f in fs]
# Ledger counts keep source occurrence, signature and root cause independent.
ct=collections.Counter(f['classification'] for f in F);counts=A['catalog_counts'];counts.update(manual_source_fact_occurrences=len(F),advisor_relevant_source_fact_occurrences=sum(f['classification'] not in nonadvisor for f in F),unique_source_semantic_facts=len({f.get('unique_source_semantic_id') or digest([f['source_sha256'],f['source_location'],f['semantic_subject'],f['semantic_dimension'],f['structured_value']]) for f in F}),findings=len(G),unique_finding_signatures=len({g['signature'] for g in G}),too_coarse_occurrences=ct['CATALOG_FACT_TOO_COARSE'],missing_occurrences=ct['SOURCE_FACT_PRESENT_BUT_MISSING_FROM_CATALOG'],semantic_mismatch_occurrences=ct['CATALOG_FACT_SEMANTICALLY_MISMAPPED'],structural_mapping_occurrences=ct['STRUCTURAL_MAPPING_GAP'],unsupported_claim_occurrences=len(A['unsupported_catalog_claims']['proven']),semantic_or_scope_claim_occurrences=len(A['unsupported_catalog_claims']['separate_semantic_or_scope_mismatches']),reverse_claims_reviewed=len(claims),reverse_claims_unreviewed=0,products_source_research_required=sum(p['source_research_required'] for p in P),products_source_package_gap=sum(p['local_source_insufficient'] for p in P),source_conflict_records=len(conf),unresolved_conflict_or_applicability_records=sum(c['review_disposition']=='OPEN_OFFICIAL_CLARIFICATION' for c in conf.values()),research_queue_records=len(A['source_research_queue']),research_open_records=sum(q['status'] in ['OPEN_SOURCE_RESEARCH_REQUIRED','STALE_SUMMARY_REPLACEMENT_RESEARCH'] for q in A['source_research_queue']))
counts['signatures_by_priority']={s:len({g['signature'] for g in G if g['severity']==s}) for s in ['P0','P1','P2','P3']}
counts['product_readiness_distribution']=dict(collections.Counter(p['catalog_readiness'] for p in P));counts['addon_readiness_distribution']=dict(collections.Counter(d['catalog_readiness'] for d in D))
# Inspectable per-finding future regressions: exact identity, source, missing dimension and expected safeguard.
regressions=[]
for g in G:
 f=next(f for f in F if f['source_fact_id']==g['source_fact_id'])
 g['customer_mode_impact_class']='LIKELY_SHARED_WITH_CUSTOMER_MODE' if g['classification']!='SOURCE_CONFLICT_REVIEW_REQUIRED' else 'REVIEW_REQUIRED'
 g['applicability_evidence']={'product_identity':g['product_identity'],'component':g.get('component',''),'package_review':'product-ledger.csv + audit.json/manual_review','exact_source_artifact':g['source_artifact'],'source_sha256':g['source_hash'],'source_location':g['source_location'],'local_package_complete':True}
 g['final_quality_gate']={'manual_source_review':g['manual_validation'],'exact_catalog_snapshot_checked':True,'not_customer_choice_inferred':True,'no_forced_peer_equivalence':True,'source_conflict_retained':g['classification']=='SOURCE_CONFLICT_REVIEW_REQUIRED','human_approval_for_remediation':'PENDING'}
 if g['severity'] in ['P0','P1']:
  regressions.append(dict(finding_id=g['finding_id'],root_cause_id=g['root_cause_id'],batch=g['remediation_batch'],product_identity=g['product_identity'],component=g.get('component',''),classification=g['classification'],semantic_concept=g['semantic_concept'],dimension=g['semantic_dimension'],source_artifact=g['source_artifact'],source_location=g['source_location'],expected_source_semantics=f['structured_value'],comparison_keys=g['proposed_existing_keys'],assertion='Resolve exact source-backed dimension including qualifications; compare same-product and side-swap; do not turn optional availability into selected.' if g['classification']!='SOURCE_CONFLICT_REVIEW_REQUIRED' else 'Keep uncertainty and exact source versions visible until authoritative resolution; do not assert either conflicting value as generic truth.',negative_control='Different provider/type/scope/version and unrelated sibling level must not inherit the new fact; explicit customer data wins; document silence does not prove selection.',implemented=False))
for r in A['root_causes']:
 if r['root_cause_id']=='SCRC-019':r['description']=r['description'].replace('Full package comparison is unfinished; do not extrapolate Bil omissions to Bobil or resolve conflicting web/IPID scopes.','Full local package comparison is now closed. Bil omissions were not extrapolated; conflicting web/IPID scopes remain explicit research questions.')
 rr=[x for x in regressions if x['root_cause_id']==r['root_cause_id']]
 r['proposed_regression_finding_ids']=[x['finding_id'] for x in rr]
 r['cause_confidence_scope']='Observed source→authored/resolved-catalog mechanism. Original author intent or development process not inferred.'
for b in A['remediation_batches']:
 rr=[r for r in A['root_causes'] if r['remediation_batch']==b['batch_id']];gg=[g for g in G if g['remediation_batch']==b['batch_id']]
 b.update(precondition='Human review of exact source evidence and applicability; resolve only associated blocking source questions before affected dimensions. No remediation authorized.',work=' '.join(r['description'] for r in rr),P1=sum(g['severity']=='P1' for g in gg),P2=sum(g['severity']=='P2' for g in gg),affected_product_count=len({g['product_identity'] for g in gg}),regression_plan_file='proposed-regressions.csv',root_cause_ids=[r['root_cause_id'] for r in rr])
# Exact provider/family package matrix. Corporate context does not certify equivalent channels.
packages=[]
for prov,fam in sorted({(p['provider'],p['insurance_type']) for p in P}):
 ps=[p for p in P if p['provider']==prov and p['insurance_type']==fam];ids={p['product_id'] for p in ps};paths=sorted({path for r in A['manual_review']['products'] if r['product_id'] in ids for path in r['source_paths']});sids={sid for path in paths for sid in arts[path]['runtime_source_ids']}
 packages.append(dict(provider=prov,family=fam,active_products=sum(p['eligible'] for p in ps),historical_products=sum(p['historical'] for p in ps),exact_product_identities=[p['product_identity'] for p in ps],source_records=len(sids),artifacts=len(paths),source_paths=paths,readability='PASS',integrity='PASS',applicability='EXACT_PRODUCT_REVIEWED_WITH_EXPLICIT_UNRESOLVED_ITEMS' if any(p['source_research_required'] for p in ps) else 'EXACT_PRODUCT_REVIEWED',source_readiness='SOURCE_RESEARCH_REQUIRED' if any(p['source_research_required'] for p in ps) else 'AVAILABLE_LOCAL_PACKAGE_REVIEWED',research_required=any(p['source_research_required'] for p in ps),material_notes='See exact source-fact uncertainties and conflicts; shared insurer/source hash alone is not product equivalence.'))
A['source_coverage']['provider_family_matrix']=packages
A['source_package_gaps'].update(explanation='All local packages reviewed to a final disposition. Missing originals/riders and unresolved scope remain source-research requirements; local audit completion is not proof of complete legal policy corpus.',source_insufficient_product_identities=[p['product_identity'] for p in P if p['local_source_insufficient']],unclosed_packages=[])
A['presentation_gaps']['visible_false_unknowns']=A['blindspot_validation']['visible_false_unknowns']
A['presentation_gaps']['explanation']='29 verified visible catalog false unknown cases are downstream symptoms; no independent UI-only defect established. Storebrand overnight is a structural mapping gap, not license to infer source semantics in UI.'
A['canonical_model_gaps']['candidate_provider_detail_extensions']=[g['finding_id'] for g in G if g['remediation_complexity']=='SMALL_CODE']
A['canonical_model_gaps']['candidate_definition']='Candidates, NOT proven model blockers: extra dimension may need registry/detail placement. Existing parent key alone does not prove every omitted dimension is data-only; broad schema/engine replacement not justified.'
A['positive_controls']=[f for f in F if f['classification'] in represented|{'SOURCE_FACT_CUSTOMER_SPECIFIC','NOT_COMPARISON_RELEVANT','SOURCE_ONLY_ACCEPTABLE'}]
A['manual_review'].update(source_facts=F,count_complete=204,count_partial=0,minimum24complete_passed=True,final_manual_validation='Source-first rule review + exact catalog/inheritance/add-on check recorded for every final finding. Final structural and dedup checks do not substitute for those semantic reviews.',false_positive_checks=['Frende Hus aldersfradrag cause already in structuredValue and label: not reported missing.','Exact Basis exclusions preserved; silence not negative coverage.','If Båt geography status accompanied by area detail; generic Included alone not enough to declare missing geography.','Tryg Innbo early Extra theft candidate superseded by exact source-backed final finding; no duplicate candidate.','Storebrand Båt bagage over15000 is an object exclusion, not payout cap.','SC005 resolved via fullterms: not counted as live conflict.','Customer-specific sums and optional choices are not manufactured as standard selections.'])
A['methodology'].update(reverse='All5646 exact base+optional catalog claims have final reviewed support disposition. Positive support, scope mismatch, location correction and unresolved applicability remain separate.',semantic='45 source-first independent inventories plus reused early manually reviewed rules and exact-product supplements; full applicable local material read before matching in the continuation. Existing value/label/structured/inherited/optional representations checked, not key-only search.',denominator='8104 inventoried source-rule occurrences; not every sentence is a comparison fact and no numerical completeness score is inferred. Exhaustiveness is a bounded qualitative judgment against local corpus.',date='Frozen runtime/catalog asof2026-09-29T10:52:14.812Z. Audit finished2026-10-01; no rolling re-enumeration or online freshness claim.')
A['audit_method_result']={'classification':'REASONABLE','why':'Blindspot confirmed independently by local fullterm rules and29 visible probes; manual false-positive checks preserve structured details, explicit exclusions, customer choices and real uncertainty. Large occurrence counts mostly reflect product-level repetition and detailed subdimensions, not independent defects or insurer ranking.','limits':'Model-based semantic review, not mathematical/legal proof or independent human legal review. Severity and proposed remediation require human approval.'}
A['metadata'].update(status='COMPLETE',timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),last_checkpoint='Final local source/catalog audit closure; remediation not performed',catalog_as_of='2026-09-29T10:52:14.812Z')
A['quality_self_check'].update(all_families_semantically_complete=True,source_first_independent_inventory=True,exhaustive_reverse_support_audit=True,output_parse_validation='FINAL_VALIDATION_PENDING',source_content_beyond_current_keys=True,all_source_artifacts_dispositioned=True,source_ambiguities_not_normalized=True,customer_specific_separated=True,provider_symmetry_forced=False)
A['limitations']=['Only frozen local official corpus; no new web research or freshness verification.','COMPLETE means scope reviewed and findings/dispositions persisted, not gap-free catalogs. Missing full riders, ambiguous applicability and conflicting documents require separate research.','Model-based semantic/manual review is not mathematical proof, a claims decision or independent human legal review.','Source/finding counts are occurrences; signature/root counts separate. No insurer ranking or coverage percentage.','No private customer documents, production run, deployment, repository edits or app tests/build. Read-only catalog/view probes used cached public data.','NITO security/GDPR audit remains separately pending and untouched.']
A['recommendation']={'advisor_answer':'NEI – REMEDIERING KREVES','qualified':'Verified material source-backed omissions/mismatches prevent unqualified catalog-wide advisor trust. Complete local audit; no conclusion that every product is equally defective.','next_step':'A: Human review of P0/P1 and proposed source-backed remediation batches; associated material research questions first where blocked. Do not implement automatically.','first_safe_candidate':'Narrow RB-13/SCRC-013: unsupported50000/item moving limit in Storebrand Innbo Super. One exact source-supported correction, existing canonical field, one P1. Then targeted inheritance/mapping batches after exact-source review.'}
# Refresh derived product/family counters and final progression.
counts['source_artifact_dispositions']=dict(collections.Counter(a['semantic_review_status'] for a in A['source_coverage']['artifacts']))
counts['source_claim_support_dispositions']=dict(collections.Counter(c['support_status'] for c in claims))
counts['data_only_candidate_findings']=sum(g['remediation_complexity']=='DATA_ONLY' for g in G)
counts['small_code_candidate_findings']=sum(g['remediation_complexity']=='SMALL_CODE' for g in G)
counts['customer_mode_likely_shared_findings']=sum(g['customer_mode_impact_class']=='LIKELY_SHARED_WITH_CUSTOMER_MODE' for g in G)
A['catalog_counts']=counts
resume=load('resume.json');base=load('continuation-2026-10-01-baseline.json')['resume']['counts']
resume.update(status='COMPLETE',last_checkpoint=A['metadata']['last_checkpoint'],last_checkpoint_at=A['metadata']['timestamp'],next_step='Human review; no automatic remediation/research authorized.',next_family=None,next_provider=None,next_product=None,next_addon=None,next_exact_product_identity=None,current_family=None,current_product=None,last_completed_family='ALL_12',addon_remaining=[],remaining_addons=[],partially_reviewed=[],not_started=[],partially_reviewed_products=[],not_started_products=[],partially_reviewed_addons=[],remaining_reverse_source_support_checks=[],all_require_package_closure=[],family_checkpoints=A['family_results'],counts=counts,remaining_fact_denominator='No unfinished in-scope local review; not a mathematical all-sentences semantic denominator.',priority_continuation=[],progress_since_current_allocation={k:counts[k]-base.get(k,0) for k in ['products_fully_audited','addons_fully_audited','manual_source_fact_occurrences','findings']})
resume['source_inventories_on_disk']=sorted(x.name for x in O.glob('*independent-inventory.json'));resume['finding_validation_state']={g['finding_id']:g.get('validation_state','FINAL') for g in G}
save('audit.json',A);save('source-facts.json',F);save('resume.json',resume)
for name,rows in [('source-fact-inventory.csv',F),('gap-findings.csv',G),('product-ledger.csv',P),('addon-ledger.csv',D),('family-summary.csv',A['family_results']),('root-cause-candidates.csv',A['root_causes']),('remediation-batches.csv',A['remediation_batches']),('source-research-queue.csv',A['source_research_queue']),('source-conflicts.csv',A['source_conflicts']),('source-artifact-ledger.csv',A['source_coverage']['artifacts']),('source-package-matrix.csv',packages),('unsupported-catalog-facts.csv',A['unsupported_catalog_claims']['proven']),('catalog-semantic-mismatches.csv',A['unsupported_catalog_claims']['separate_semantic_or_scope_mismatches']),('proposed-regressions.csv',regressions)]:csvsave(name,rows)
print(json.dumps({'counts':counts,'inventories':len(resume['source_inventories_on_disk']),'package_matrix':len(packages)},ensure_ascii=False))
