from pathlib import Path
import json,gzip,hashlib,subprocess,datetime,re
r=Path.cwd();d=r/'docs/audit/checkpoints/house-spread-2028c16';base='2028c16398b78f645eab2e42d1800c6598022470';h=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text());o=load(d/'source-oracle.json');before=json.loads(gzip.decompress((d/'before-integrity.json.gz').read_bytes()));prior=o['protected_checkpoint']['content'];gates={n:load(d/(n+'.json')) for n in ['targeted-final','fullsuite-final','eslint-scoped']};target=gates['targeted-final'];identity=target['application_identity_sha256'];app=target['application_files']
for g in gates.values():
 assert g['exit_code']==0 and g['application_identity_sha256']==identity and g['application_files']==app
 if 'tap'in g:assert g['tap']['tests']==g['tap']['pass'] and all(g['tap'][k]==0 for k in ['fail','cancelled','skipped'])
 assert h((d/g['log']).read_bytes())==g['log_sha256']
assert target['test_files']==48 and gates['fullsuite-final']['test_files']==177 and gates['eslint-scoped']['file_count']==10
assert target['tap']['pass']==3108 and gates['fullsuite-final']['tap']['pass']==6800
assert len(before)==8236 and len(app)==10 and all(h((r/p).read_bytes())==v for p,v in app.items())
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==subprocess.check_output(['git','rev-parse','origin/main'],text=True).strip()==base
assert not subprocess.check_output(['git','diff','--cached','--name-only'])
status_path='docs/development-agent/current-project-status.md';allowed=set(app)|{status_path};assert all(h((r/p).read_bytes())==sha for p,sha in before.items() if p not in allowed)
for p in o['source_pages']:
 b=p['binding'];assert h((r/b['source_artifact']).read_bytes())==b['source_sha256'];assert subprocess.check_output(['git','show',base+':'+b['source_artifact']])==(r/b['source_artifact']).read_bytes()
# Require exact approved source rows and no other production-byte delta.
lines=[]
for n,owner in enumerate(['gjensidigeHusStandard','gjensidigeHusPluss']):
 f=next(x['fact'] for x in o['facts'] if x['owner']==owner);row=[f['key'][4:],f['label'],f['value'],f['source']['section'],f['source']['page']];literal=json.dumps(row,ensure_ascii=False)
 if n:literal=literal[:-1]+', undefined, true]'
 lines.append(('standard' if n==0 else 'pluss')+'.push(...facts('+json.dumps(owner)+', ['+literal+']));')
prod='lib/gjensidige-hus-catalog.ts';oldprod=subprocess.check_output(['git','show',base+':'+prod],text=True);insert='// General point 19 keeps all type boundaries and its ordinary-insurance exclusion together.\n'+'\n'.join(lines)+'\n\n';assert (r/prod).read_text()==oldprod.replace('export const gjensidigeHusFacts:',insert+'export const gjensidigeHusFacts:')
proof=json.loads(gzip.decompress((d/'runtime-proof.json.gz').read_bytes()));assert proof['status']=='PASS' and len(proof['configurations'])==12 and len(proof['comparisons'])==52
assert o['subscope']=='Generelle vilkår punkt19 Farlig spredning av biologiske eller kjemiske substanser m.m. only' and o['whole_signature_closure'] is False
candidate={'base_revision':base,'candidate_is_uncommitted':True,'application_identity_sha256':identity,'algorithm':'SHA256(canonical compact sorted JSON path->SHA256 mapping)','application_files':app,'only_changed_production_file':prod,'production_delta':'Exactly2own-source hus.farlig_spredning.begrensning facts,one per product,complete point19. All other production bytes equal fresh main.','source_oracle_sha256':h((d/'source-oracle.json').read_bytes()),'baseline_sha256':h((d/'baseline.v8.gz').read_bytes())};(d/'candidate-identity.json').write_text(json.dumps(candidate,indent=2)+'\n')
audit={'status':'PASS_POINT19_ONLY','base_revision':base,'signature':o['signature'],'subscope':o['subscope'],'whole_signature_closure':False,'source_oracle_sha256':candidate['source_oracle_sha256'],'original_bindings':o['original_bindings'],'two_own_source_facts':o['facts'],'checks':['Both original Standard13/Pluss14complete raw/layout pages equal independent oracle,registeredSHA256 and exact main source blobs','All3point19paragraphs retained:type-limited positives/full hazards,500millionaggregate only for travel/person atom/radioactivity,event chain,ordinary-other-insurance exclusion','Whole catalog before plus exactly2own-source facts;exact production insertion only;strict complete source/value/metadata/generated notes/overriddenBase guards before projection','All12manual choices/3JSONrepeats preserve every old field and canonical coverage status','Actual existing/offer document priority,unknown fallback,conflicting specifics retained;general terms create0insurance/choices;generic labels gain no aliases','16independent point18/19document cases across products/sides/repeats;point18full value/provenance preserved,no new canonical coverage or sum','214manual/144document/52comparison controls and scope negatives pass;all prior source-page/named corrections retained'],'focused_tests':86,'runtime_proof':'runtime-proof.json.gz'};(d/'source-and-reverse-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
summary={'status':'PASS_VALIDATED_LOCAL_POINT19_ONLY','base_revision':base,'tested_HEAD_is_base_not_candidate_commit':True,'application_identity_sha256':identity,'results':gates,'focused_contract_tests':86,'controls':{'configurations':12,'manual_inputs':214,'document_flows':144,'comparisons_both_directions':52,'independent_point18_point19_document_cases':16},'initial_diagnostics':'focused-initial.log.gz86/86pass;no new-test correction or production retry. Final gates0failures/cancel/skip.','mechanical_corrections':'autonomous-mechanical-corrections.json','runtime_proof':'runtime-proof.json.gz','source_reverse_audit':'source-and-reverse-audit.json','not_run':'Typegen/TypeScript/build/server/HTTPPDFgeneration:existing typed row factory only;no engine,type/API,UI,dependency or status/calculation changes. Fullsuite/scoped lint covers shared test compatibility. No install/deploy.'};(d/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
receipt={
 'classification':'CURRENT_VALIDATED_ORDINARY_HOUSE_DANGEROUS_SPREAD_POINT19','status':'PASS_VALIDATED_LOCAL_POINT19_ONLY_AWAITING_PUBLICATION','created_at_UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'base_revision':base,'fresh_main_before':base,'fresh_main_after':base,'fresh_main_method':'Connected GitHub branch API start/end;HEAD/origin/main exactSHA. No reset/pull/stash.',
 'application_identity_sha256':identity,'tested_candidate':'Uncommitted application_files in candidate-identity.json;HEAD identifies base,not an implementation commit.',
 'signature':o['signature'],'subscope':o['subscope'],'validated_subscope_only':'Generelle vilkår punkt19 Farlig spredning av biologiske eller kjemiske substanser m.m.','whole_signature_review_complete':False,'whole_signature_closure':False,'remaining_signature_dimensions':'OUTSIDE_SCOPE_UNASSESSED_NOT_CLOSED','published_points12and18':'CONFIRMED_ON_BASE_MAIN_NOT_REOPENED','original_bindings':o['original_bindings'],'original_priority':'P2','original_disposition':'DEFER_POST_PILOT retained in immutable registry;explicit point19implementation tracked separately',
 'decision':'../house-spread-contract-2028c16/receipt-house-spread-contract.json','authorization':'authorization.json',
 'implemented':{'production_file':prod,'raw_rows_added':2,'effective_rows_per_product':1,'key':o['keys'][0],'label':o['rows'][0]['label'],'value':o['rows'][0]['value'],'Standard_source_pages':[13],'Pluss_source_pages':[14],'own_Pluss_replaces_base':True,'original_bindings_resolution':'Only point19within both original bindings validated;not full SF/signature closure. Published status requires containing commit verification on main.',
 'source_to_catalog_and_reverse':'Complete catalog equals before plus exactly2source-approved facts. Strict guards validate full atomic value,registered metadata,source notes and inherited provenance. All previous fields retained.',
 'contract':'One atomic full point19:positive first paragraph limited to statutory personal injury/travel/person;all biological/chemical spread,rocket,nuclear and radiation hazards;500millionaggregate and same-event/connected-chain rule only in stated travel/person atom/radiation scope;final ordinary-other-insurance exclusion. No house sum or added terrorism-intent condition;point18remains separate and unchanged.',
 'coverage_contract':'Restriction term under hus.ovrig;isNonAssertingCoverageDetail=true. No.dekning suffix,availability/structured sum/deductible/selection metadata or related coverage parent. Term alone infers no canonical coverage;no claim,event,aggregate,cap-allocation calculation or customer-choice/status changes.',
 'unchanged':['Every other production byte','Remaining general provisions/broader d123dimensions and published points12/18','All prior source-page corrections and object/additionalcost/settlement/garden rules','Positive building/fixture/sidebuilding and all optional Smart/rental/rot choices','Other providers,ordinary product/type/version/scope boundaries','Source registry/sourceType/effective dates/admission','Engine,global aliases,extractor enum,presentation/UI','Original PDFs,all historical inventories/receipts/snapshots/fingerprints and prior8local readonly files']},
 'validation':{'summary':'validation-summary.json','targeted':target['tap'],'targeted_files':48,'fullsuite':gates['fullsuite-final']['tap'],'fullsuite_files':177,'focused_contract_tests':86,'scoped_lint_files':10,'scoped_lint_output':gates['eslint-scoped']['output'],'same_candidate_identity_for_all_final_gates':True,'source_reverse_audit':'source-and-reverse-audit.json','runtime_proof':'runtime-proof.json.gz','mechanical_corrections':'autonomous-mechanical-corrections.json'},
 'unchanged_status':{'B051_partition_counts':prior['B051_partition_counts'],'B130_completed_signatures':prior['current_B130_completed_signatures'],'documented_campaign_count':67,'new_signature_closure_credit':0,'P2_credit':0,'global_resolved_open':'UNKNOWN','CATALOG_PILOT_GATE':'REMEDIATION_REQUIRED','all_HOLD':prior['holds_unchanged'],'additional_explicit_HOLD':prior['additional_explicit_HOLD'],'NITO':'WAIT','Sentralbord':'WAIT_SEPARATE'},
 'remaining_pre_pilot_points':prior['remaining_pre_pilot_points'],
 'catalog_foundation':'Only point19locally validated;points12and18already on base main. Other d123dimensions unassessed/notclosed;no exhaustive ordinary foundation/globalP2closure/pilotclearance. Combined revalidation on containing published main remains separate.',
 'publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'publication_authorization':None,'publication_preflight':None,'commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,
 'next_step':'Publication of this point19only packet requires explicit user authorization and fresh-main/integrity check;no deploy. Local PASS is not merged.'
};(d/'completion-receipt-d1230f13e6b445d7-point19.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
cp=dict(prior);cp.update({'classification':'CURRENT_VALIDATED_HOUSE_DANGEROUS_SPREAD_POINT19','status':receipt['status'],'base_revision':base,'application_identity_sha256':identity,'current_receipt':'completion-receipt-d1230f13e6b445d7-point19.json','prior_checkpoint':'../house-terror-c93c33d/checkpoint.json','prior_revalidation':'../house-foundation-revalidation-2028c16/receipt-house-foundation.json','mapping_decision':'../house-spread-contract-2028c16/receipt-house-spread-contract.json','signature':o['signature'],'subscope':o['subscope'],'whole_signature_closure':False,'whole_signature_review_complete':False,'remaining_signature_dimensions':'OUTSIDE_SCOPE_UNASSESSED_NOT_CLOSED','specific_remainder':'HOUSE_DANGEROUS_SPREAD_POINT19_IMPLEMENTED_LOCALLY_AWAITING_PUBLICATION','original_P2_disposition':'DEFER_POST_PILOT unchanged;point19only implementation,no whole-signature closure','published_points12and18':'CONFIRMED_ON_BASE_MAIN_NOT_REOPENED','new_signature_closure_credit':0,'catalog_foundation':receipt['catalog_foundation'],'publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'publication_authorization':None,'publication_preflight':None,'commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,'next_step':receipt['next_step']})
protected=['documented_campaign_signatures','documented_campaign_count','B051_partition_counts','current_B051_completed_signatures','current_B130_completed_signatures','holds_unchanged','additional_B051_holds_unchanged','additional_explicit_HOLD','P2_credit','global_resolved_open','CATALOG_PILOT_GATE','historical_only','historical_DEFER_SAFE_signatures','HARNESS_AUTONOMY_V1','NITO','Sentralbord','remaining_pre_pilot_points']
for k in protected:assert cp[k]==prior[k]
(d/'checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2)+'\n')
note=f'''## Punkt 19: Farlig spredning – validert lokalt 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til `{base}`.
Punkt 12, punkt 18 og tidligere bolker er publisert der. Punkt 19 under
`d1230f13e6b445d7` er **validert lokalt og ikke publisert**. Testet main-basis
og eksakt kandidatidentitet er adskilt. Commit/push krever egen eksplisitt
publiseringsfullmakt. Ingen installasjon eller deploy.

To rå rader under `hus.farlig_spredning.begrensning` gir én effektiv
begrensende vilkårsrad på hvert husnivå. Hele punkt 19 er bevart samlet med
alle tre ledd: de navngitte positive personskade-/reise-/personreglene,
hele farelisten med biologisk/kjemisk spredning, raketter, atomvåpen og
radioaktiv stråling, og avslutningen om at slike skader eller tap ikke dekkes
for øvrige forsikringer. Grensen på 500 millioner kroner gjelder samlet
for alle kunder og kravstillere bare innen den uttrykkelige reise-/personregelen
ved atomvåpen eller radioaktiv stråling. Regelen om samme hendelse eller en
sammenhengende hendelseskjede beholdes innen dette scopet. Beløpet er ikke
registrert som husforsikringssum, og det er ikke utledet positiv husdekning.

Standard har egen kilde på PDF-side 13, Pluss egen kilde på side 14 med
`replacesBase` og overstyrt Standard-provenance. Punkt 18 beholdes byte-identisk
som egen bestemmelse; reglene om 1 milliard/48 timer og 500 millioner/hendelseskjede
blandes ikke. Det legges ikke til noe terrorhensiktsvilkår i punkt 19.
Raden er et ikke-assertivt begrensningsvilkår: ingen automatisk dekning,
kundevalg, individuell sum, status eller hendelses-/ansvarsberegning.
Ingen engine, globale aliaser, extractor-enum, presentasjon eller kilderegister
er endret. Alle øvrige produksjonsbytes er identiske med testet main-basis.

[Delreceipt for punkt 19](../audit/checkpoints/house-spread-2028c16/completion-receipt-d1230f13e6b445d7-point19.json),
[validering](../audit/checkpoints/house-spread-2028c16/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-spread-2028c16/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-spread-2028c16/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-2028c16/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-spread-contract-2028c16/receipt-house-spread-contract.json)
beholdes byte-identisk. GAP-2110/SF-3024 og GAP-2169/SF-3111 er validert
**bare for punkt 19** i denne bolken. Publisert punkt 12 og 18 gjenåpnes ikke.
Øvrige dimensjoner i de bredere originalbindingene og signaturen er ikke
ferdig vurdert eller lukket. P2/DEFER_POST_PILOT beholdes, uten global
signatur-, P2- eller kampanjekreditt.

3108/3108 målrettede tester i 48 filer og 6800/6800 tester i 177 filer består
uten feil eller skip. 86 nye kontraktkontroller dekker komplette kildesider,
alle 12 valgkombinasjoner, tre JSON-berikinger, individuell dokumentprioritet
og typeavgrensningene for beløp og hendelser. 16 kombinerte dokumenttilfeller
bevarer uavhengige regler for punkt 18 og 19. 214 manuelle kontroller,
144 dokumentflyter og 52 sammenligninger bevarer øvrige felt og dekningsstatuser.
Støttevilkår alene oppretter ingen forsikring; generiske etiketter gir ingen
nye koblinger eller kundevalg. Kvalitetskontroll av 10 kode-/testfiler:
0 feil og 0 warnings. Dokumenterte testtilpasninger gjelder bare de to
kildeverifiserte rå radene; historiske snapshots, originaler og fingeravtrykk
beholdes uendret. Første nye fokuserte testkjøring bestod alle 86 kontroller.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet
revalidering på inneholdende publisert main er en separat oppgave.
NITO venter; Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.

'''
status=r/status_path;old=status.read_text();title='# Aktuell dokumentert prosjektstatus\n\n';assert old.startswith(title);assert '## Punkt 19: Farlig spredning – validert lokalt' not in old;status.write_text(title+note+old[len(title):])
changed={p for p,sha in before.items() if h((r/p).read_bytes())!=sha};assert changed==set(app).intersection(before)|{status_path}
assert {p for p in changed if p.startswith(('lib/','app/','catalog/'))}=={prod}
for name in ['house-foundation-revalidation-2028c16','house-spread-contract-2028c16']:
 for p,sha in before.items():
  if p.startswith('docs/audit/checkpoints/'+name+'/'):assert h((r/p).read_bytes())==sha
for c in [['git','diff','--check'],['git','diff','--cached','--check']]:subprocess.run(c,check=True)
for link in re.findall(r'\]\(([^)]+)\)',note):assert (r/'docs/development-agent'/link).resolve().is_file(),link
(d/'candidate-tracked.diff.gz').write_bytes(gzip.compress(subprocess.check_output(['git','diff','--',*sorted(changed)]),mtime=0))
integ={'base_HEAD':base,'existing_file_count':len(before),'tracked_files_before':8228,'unchanged_existing_files':len(before)-len(changed),'changed_existing_files':sorted(changed),'new_application_files':sorted(set(app)-set(before)),'prior8_local_readonly_files_unchanged':True,'all_other_production_and_existing_files_unchanged':True,'staged_files':0,'fresh_main_at_end':base,'no_commit_push_deploy_install':True,'project_status_links':'PASS','diff_check':'PASS','protected_checkpoint_fields':'UNCHANGED','whole_signature_closure':False};(d/'integrity.json').write_text(json.dumps(integ,indent=2)+'\n')
(d/'review-files.json').write_text(json.dumps({'application_files':sorted(app),'project_status':status_path,'audit_packet':str(d.relative_to(r)),'subscope':o['subscope'],'prior_local_readonly_packets':['docs/audit/checkpoints/house-foundation-revalidation-2028c16','docs/audit/checkpoints/house-spread-contract-2028c16'],'publication':'NOT_AUTHORIZED;do not stage or publish here'},indent=2)+'\n')
(d/'SHA256SUMS').write_text(''.join(f'{h(p.read_bytes())}  {p.name}\n' for p in sorted(d.iterdir()) if p.name!='SHA256SUMS'))
for line in (d/'SHA256SUMS').read_text().splitlines():
 sha,name=line.split(maxsplit=1);assert h((d/name).read_bytes())==sha
assert all(h((r/p).read_bytes())==sha for p,sha in app.items())
actual=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines());expected={p for p in before if p.startswith(('docs/audit/checkpoints/house-foundation-revalidation-2028c16/','docs/audit/checkpoints/house-spread-contract-2028c16/'))}|set(app)-set(before)|{str(p.relative_to(r)) for p in d.iterdir()};assert actual==expected,actual^expected
print(json.dumps({'receipt':str(d/'completion-receipt-d1230f13e6b445d7-point19.json'),'targeted':3108,'fullsuite':6800,'lint_files':10,'application_identity':identity,'audit_files':len(list(d.iterdir())),'status':receipt['status'],'whole_signature_closure':False}))
