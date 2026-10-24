from pathlib import Path
import json,gzip,hashlib,subprocess,datetime,re
r=Path.cwd();d=r/'docs/audit/checkpoints/house-additional-costs-de087fc';base='de087fccb92706dbf8d2bf6a697aa6cf6a27081a';h=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text());before=json.loads(gzip.decompress((d/'before-integrity.json.gz').read_bytes()));o=load(d/'source-oracle.json');prior=o['protected_checkpoint']['content'];gates={name:load(d/(name+'.json')) for name in ['targeted-final','fullsuite-final','eslint-scoped']};identity=gates['targeted-final']['application_identity_sha256'];application=gates['targeted-final']['application_files']
for gate in gates.values():
 assert gate['exit_code']==0
 assert gate['application_identity_sha256']==identity
 assert gate['application_files']==application
 if 'tap'in gate:assert gate['tap']['tests']==gate['tap']['pass'] and all(gate['tap'][k]==0 for k in ['fail','cancelled','skipped'])
 assert h((d/gate['log']).read_bytes())==gate['log_sha256']
assert gates['targeted-final']['test_files']==44 and gates['fullsuite-final']['test_files']==173
assert all(h((r/p).read_bytes())==sha for p,sha in application.items())
status_path='docs/development-agent/current-project-status.md';allowed=set(application)|{status_path};changed={p for p,sha in before.items() if h((r/p).read_bytes())!=sha};assert changed<=allowed
assert not subprocess.check_output(['git','diff','--cached','--name-only'])
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==subprocess.check_output(['git','rev-parse','origin/main'],text=True).strip()==base
for p in o['source_pages']:assert h((r/p['path']).read_bytes())==p['sha256']
proof=json.loads(gzip.decompress((d/'runtime-proof.json.gz').read_bytes()));assert proof['status']=='PASS' and len(proof['configurations'])==12 and len(proof['comparisons'])==52
(d/'candidate-identity.json').write_text(json.dumps({'base_revision':base,'candidate_is_uncommitted':True,'application_identity_sha256':identity,'algorithm':'SHA256(canonical compact sorted JSON path->SHA256 mapping)','application_files':application,'only_changed_production_file':'lib/gjensidige-hus-catalog.ts','production_delta':'Exactly six approved own-source facts,three per product;all other production bytes identical to fresh main.','source_oracle_sha256':h((d/'source-oracle.json').read_bytes()),'baseline_sha256':h((d/'baseline.v8.gz').read_bytes())},indent=2)+'\n')
summary={'status':'PASS_VALIDATED_LOCAL','base_revision':base,'tested_HEAD_is_base_not_candidate_commit':True,'application_identity_sha256':identity,'results':gates,'focused_contract_tests':105,'controls':{'configurations':12,'manual_inputs':214,'document_flows':144,'comparisons_both_directions':52},'initial_failure_diagnostics':'focused-initial.log.gz and targeted-initial.json/log.gz retained;source-proven mechanical expectation corrections only;final gates contain0failures and0skip.','mechanical_corrections':'autonomous-mechanical-corrections.json','runtime_proof':'runtime-proof.json.gz','not_run':'Typegen/TypeScript/build/server/deploy: this scope adds typed catalog facts and qualifications only; no engine,type/API,UI or dependency change. Full suite/scoped lint covers shared test compatibility. No install.'}
(d/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
receipt={'classification':'CURRENT_VALIDATED_ORDINARY_HOUSE_ADDITIONAL_COSTS','status':'PASS_VALIDATED_LOCAL_AWAITING_PUBLICATION','created_at_UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_revision':base,'fresh_main_before':base,'fresh_main_after':base,'fresh_main_method':'Connected GitHub branch API at start/end;HEAD/origin/main exactSHA. No pull/reset/stash.','application_identity_sha256':identity,'tested_candidate':'Uncommitted application_files in candidate-identity.json;HEAD identifies base,not an implementation commit.','signature':o['signature'],'original_bindings':o['original_bindings'],'original_priority':'P2','original_disposition':'DEFER_POST_PILOT retained in immutable registry;explicit implementation authorized and validated separately','decision':'../house-additional-costs-contract-de087fc/receipt-house-additional-costs-contract.json','authorization':'authorization.json','implemented':{'production_file':'lib/gjensidige-hus-catalog.ts','raw_rows_added':6,'effective_rows_per_product':3,'keys':o['keys'],'values':[{k:row[k] for k in ['key','label','value']} for row in o['rows']],'Standard_source_pages':[5,18],'Pluss_source_pages':[5,6,19],'own_Pluss_replaces_base':True,'all_full_source_pages_and_hashes':'source-oracle.json','original_bindings_resolution':'Both original bindings validated for all three missing additional-cost dimensions;effective on published main only after containing commit verified.','source_to_catalog_and_reverse':'Whole productCatalog equals fresh-main baseline plus exactly six independently approved facts;projection guards all wording,metadata,primary/qualifying references,source notes and inheritance. Every preexisting field preserved across controls.','contract':'Covered damage and beyond insured sum preserved in each row;all4removal operations for worthless building remnants;average inflation by building-cost index within normal repair/rebuilding time;waterfee caused by damage. No adjacent loss-of-use cap transferred.','coverage_contract':'Removal uses existing coverage key/role;known selected product can assert it,unconfirmed bare catalog evidence remains unknown. Inflation and waterfee are terms and alone assert no coverage. General terms alone creates0insurances;paired identified individual agreement remains equal to no-general control. No optional customer choices added.','unchanged':['All other production bytes','Public-authority/loss-of-use/settlement/rental clauses','All other providers and shared removal/inflation facts','Ordinary product/type/version/scope boundaries','Source registry,sourceType,effective dates,source admission','Engine,global aliases,extractor enum,presentation/UI','Original source files,historical audits/receipts/snapshots and prior local decision/revalidation']},'validation':{'summary':'validation-summary.json','targeted':gates['targeted-final']['tap'],'targeted_files':44,'fullsuite':gates['fullsuite-final']['tap'],'fullsuite_files':173,'focused_contract_tests':105,'scoped_lint_files':gates['eslint-scoped']['file_count'],'scoped_lint_output':gates['eslint-scoped']['output'],'same_candidate_identity_for_all_final_gates':True,'runtime_proof':'runtime-proof.json.gz','mechanical_corrections':'autonomous-mechanical-corrections.json'},'unchanged_status':{'B051_partition_counts':prior['B051_partition_counts'],'B130_completed_signatures':prior['current_B130_completed_signatures'],'documented_campaign_count':67,'new_signature_closure_credit':0,'P2_credit':0,'global_resolved_open':'UNKNOWN','CATALOG_PILOT_GATE':'REMEDIATION_REQUIRED','all_HOLD':prior['holds_unchanged'],'additional_explicit_HOLD':prior['additional_explicit_HOLD'],'NITO':'WAIT','Sentralbord':'WAIT_SEPARATE'},'remaining_pre_pilot_points':prior['remaining_pre_pilot_points'],'catalog_foundation':'Named additional-cost remainder implemented and locally validated; no claim of exhaustive catalog completeness,aggregate P2closure or pilot release. Combined revalidation on containing published fresh main remains a separate task.','publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,'next_step':'Publication only after explicit user authorization and fresh main/integrity check;no deploy. Do not treat local PASS as merged.'}
(d/'completion-receipt-e103e7cb532fb8d4.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
cp=dict(prior);cp.update({'classification':'CURRENT_VALIDATED_HOUSE_ADDITIONAL_COSTS','status':'PASS_VALIDATED_LOCAL_AWAITING_PUBLICATION','base_revision':base,'application_identity_sha256':identity,'current_receipt':'completion-receipt-e103e7cb532fb8d4.json','prior_checkpoint':'../house-garden-import-83c8fee/checkpoint.json','prior_revalidation':'../house-foundation-revalidation-de087fc/receipt-house-foundation.json','mapping_decision':'../house-additional-costs-contract-de087fc/receipt-house-additional-costs-contract.json','signature':o['signature'],'specific_remainder':'HOUSE_SHARED_POST_DAMAGE_ADDITIONAL_COSTS_IMPLEMENTED_LOCALLY_AWAITING_PUBLICATION','original_P2_disposition':'DEFER_POST_PILOT unchanged;explicit implementation tracked separately','new_signature_closure_credit':0,'catalog_foundation':receipt['catalog_foundation'],'publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'publication_authorization':None,'publication_preflight':None,'commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,'next_step':receipt['next_step']})
for k in ['documented_campaign_signatures','documented_campaign_count','B051_partition_counts','current_B051_completed_signatures','current_B130_completed_signatures','holds_unchanged','additional_explicit_HOLD','P2_credit','global_resolved_open','CATALOG_PILOT_GATE','historical_only','historical_DEFER_SAFE_signatures','HARNESS_AUTONOMY_V1','NITO','Sentralbord','remaining_pre_pilot_points']:assert cp[k]==prior[k]
(d/'checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2)+'\n')
t=gates['targeted-final']['tap']['pass'];f=gates['fullsuite-final']['tap']['pass'];note=f'''## Tilleggsutgifter etter skade – validert lokalt 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`{base}`. Hage/importverdsetting og tidligere bolker er publisert der.
Tilleggsutgiftsbolken for `e103e7cb532fb8d4` er implementert og validert lokalt
på denne basisen. Den er ikke committet, pushet eller dokumentert merget.
Ingen installasjon eller deploy. Testet basis og eksakt kandidatidentitet er adskilt.

Seks rå rader gir tre effektive regler på hvert husnivå:
`hus.rydding.dekning`, `hus.gjenoppforing.prisstigning` og `hus.vann.vannavgift`.
Etter erstatningsmessig skade dekkes tilleggene utover forsikringssummen.
Rydderegelen bevarer riving, rydding, bortkjøring og deponering av verdiløse
bygningsrester. Prisstigning følger gjennomsnittlig endring etter
byggekostnadsindeksen innen normal reparasjons-/gjenoppføringstid. Vannavgiften
må være økt som følge av skaden. Standard har egen kilde på side 5 og
prisstigningsavgrensning på side 18. Pluss bruker egen liste på side 6,
overskriften på side 5 og prisstigningsavgrensningen på side 19, med
`replacesBase` og overstyrt Standard-provenance. Påbud, brukstap og oppgjørsform
beholdes; brukstapets grense på 10 millioner overføres ikke til de tre tilleggene.
Ingen engine, alias, extractor-enum, presentasjon eller kilderegister er endret.
Alle øvrige produksjonsbytes er identiske med main-basis.

[Receipt](../audit/checkpoints/house-additional-costs-de087fc/completion-receipt-e103e7cb532fb8d4.json),
[validering](../audit/checkpoints/house-additional-costs-de087fc/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-additional-costs-de087fc/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-additional-costs-de087fc/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-de087fc/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-additional-costs-contract-de087fc/receipt-house-additional-costs-contract.json)
beholdes byte-identisk. GAP-2099/SF-3008 og GAP-2158/SF-3095 er validert for alle
tre dimensjoner. Originalregisterets P2/DEFER_POST_PILOT beholdes; den eksplisitt
autoriserte lokale implementeringen føres separat uten global telleendring.

{t}/{t} målrettede tester i 44 filer og {f}/{f} tester i 173 filer består uten
feil eller skip. 105 nye kontraktkontroller dekker komplette kildesider, alle
12 valgkombinasjoner, tre JSON-berikinger og individuell dokumentprioritet.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger bevarer
øvrige felt. Ryddeytelsen bruker eksisterende dekningsrolle; de to øvrige er
vilkårsdetaljer. Katalog alene uten bekreftet produktvalg oppretter ikke valgt
dekning; støttevilkår alene oppretter ingen forsikring. Sammen med en identifisert
individuell avtale endrer støttevilkår ikke kundevalgene. Kvalitetskontroll av
14 kode-/testfiler: 0 feil og 0 warnings. Testtilpasninger er dokumentert med
før-bevis; historiske snapshots og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende publisert main er en separat oppgave. NITO venter; Sentralbord
venter separat. Ingen ny arbeidsstrøm er startet.

'''
old=(r/status_path).read_text();title='# Aktuell dokumentert prosjektstatus\n\n';assert old.startswith(title);assert '## Tilleggsutgifter etter skade – validert lokalt' not in old;(r/status_path).write_text(title+note+old[len(title):])
# Strict review/integrity: only one production file, exact tests plus project status.
changed={p for p,sha in before.items() if h((r/p).read_bytes())!=sha};assert changed==set(application).intersection(before)|{status_path}
assert [p for p in changed if p.startswith(('lib/','app/','catalog/'))]==['lib/gjensidige-hus-catalog.ts']
for dirname in ['house-foundation-revalidation-de087fc','house-additional-costs-contract-de087fc']:
 for p,sha in before.items():
  if p.startswith('docs/audit/checkpoints/'+dirname+'/'):assert h((r/p).read_bytes())==sha
for cmd in [['git','diff','--check'],['git','diff','--cached','--check']]:subprocess.run(cmd,check=True)
# Check every newly added project-status link resolves.
for link in re.findall(r'\]\(([^)]+)\)',note):assert (r/'docs/development-agent'/link).resolve().is_file(),link
tracked_patch=subprocess.check_output(['git','diff','--',*sorted(changed)]);(d/'candidate-tracked.diff.gz').write_bytes(gzip.compress(tracked_patch,mtime=0))
integrity={'base_HEAD':base,'existing_file_count':len(before),'tracked_files_before':8058,'unchanged_existing_files':len(before)-len(changed),'changed_existing_files':sorted(changed),'new_application_files':sorted(set(application)-set(before)),'prior8_local_readonly_audit_files_unchanged':True,'all_other_production_and_existing_files_unchanged':True,'staged_files':0,'fresh_main_at_end':base,'no_commit_push_deploy_install':True,'project_status_links':'PASS','diff_check':'PASS','protected_checkpoint_fields':'UNCHANGED'};(d/'integrity.json').write_text(json.dumps(integrity,indent=2)+'\n')
(d/'review-files.json').write_text(json.dumps({'application_files':sorted(application),'project_status':status_path,'audit_packet':str(d.relative_to(r)),'prior_local_readonly_packets':['docs/audit/checkpoints/house-foundation-revalidation-de087fc','docs/audit/checkpoints/house-additional-costs-contract-de087fc'],'publication':'NOT_AUTHORIZED; do not stage or publish here'},indent=2)+'\n')
(d/'SHA256SUMS').write_text(''.join(f'{h(p.read_bytes())}  {p.name}\n' for p in sorted(d.iterdir()) if p.name!='SHA256SUMS'))
for line in (d/'SHA256SUMS').read_text().splitlines():
 sha,name=line.split(maxsplit=1);assert h((d/name).read_bytes())==sha
assert all(h((r/p).read_bytes())==sha for p,sha in application.items())
actual=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines());expected={p for p in before if p.startswith(('docs/audit/checkpoints/house-foundation-revalidation-de087fc/','docs/audit/checkpoints/house-additional-costs-contract-de087fc/'))}|set(application)-set(before)|{str(p.relative_to(r)) for p in d.iterdir()};assert actual==expected,(actual^expected)
print(json.dumps({'receipt':str(d/'completion-receipt-e103e7cb532fb8d4.json'),'targeted':t,'fullsuite':f,'lint_files':14,'application_identity':identity,'audit_files':len(list(d.iterdir())),'changed_existing_files':len(changed),'prior_audit_files_unchanged':8,'status':'PASS_VALIDATED_LOCAL_AWAITING_PUBLICATION'}))
