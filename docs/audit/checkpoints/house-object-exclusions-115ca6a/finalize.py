from pathlib import Path
import json,gzip,hashlib,subprocess,datetime,re
r=Path.cwd();d=r/'docs/audit/checkpoints/house-object-exclusions-115ca6a';base='115ca6aba5d547e5059294bcce6dad6d0a19d59a';h=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text());o=load(d/'source-oracle.json');before=json.loads(gzip.decompress((d/'before-integrity.json.gz').read_bytes()));prior=o['protected_checkpoint']['content'];gates={name:load(d/(name+'.json')) for name in ['targeted-final','fullsuite-final','eslint-scoped']};identity=gates['targeted-final']['application_identity_sha256'];app=gates['targeted-final']['application_files']
for gate in gates.values():
 assert gate['exit_code']==0 and gate['application_identity_sha256']==identity and gate['application_files']==app
 if 'tap'in gate:assert gate['tap']['tests']==gate['tap']['pass'] and all(gate['tap'][k]==0 for k in ['fail','cancelled','skipped'])
 assert h((d/gate['log']).read_bytes())==gate['log_sha256']
assert gates['targeted-final']['test_files']==45 and gates['fullsuite-final']['test_files']==174 and gates['eslint-scoped']['file_count']==10
assert all(h((r/p).read_bytes())==sha for p,sha in app.items());assert len(before)==8109
assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==subprocess.check_output(['git','rev-parse','origin/main'],text=True).strip()==base;assert not subprocess.check_output(['git','diff','--cached','--name-only'])
status_path='docs/development-agent/current-project-status.md';allowed=set(app)|{status_path};assert all(h((r/p).read_bytes())==sha for p,sha in before.items() if p not in allowed)
for p in o['source_pages']:assert h((r/p['binding']['source_artifact']).read_bytes())==p['binding']['source_sha256']
proof=json.loads(gzip.decompress((d/'runtime-proof.json.gz').read_bytes()));assert proof['status']=='PASS' and len(proof['configurations'])==12 and len(proof['comparisons'])==52
candidate={'base_revision':base,'candidate_is_uncommitted':True,'application_identity_sha256':identity,'algorithm':'SHA256(canonical compact sorted JSON path->SHA256 mapping)','application_files':app,'only_changed_production_file':'lib/gjensidige-hus-catalog.ts','production_delta':'Exactly four approved object-exclusion facts,two per product. All other production bytes equal fresh main.','source_oracle_sha256':h((d/'source-oracle.json').read_bytes()),'baseline_sha256':h((d/'baseline.v8.gz').read_bytes())};(d/'candidate-identity.json').write_text(json.dumps(candidate,indent=2)+'\n')
source_audit={'status':'PASS','base_revision':base,'source_oracle_sha256':candidate['source_oracle_sha256'],'original_bindings':o['original_bindings'],'four_own_source_facts':o['facts'],'checks':['Both complete original PDF3 raw/layout pages equal sealed before-oracle;registeredPDF SHA256 matches original main bytes','Both clauses under What is insured / Excluded column;no broader object or energy-source exclusion','Full current catalog equals before plus four exact raw facts;reverse helper validates full values/sources/metadata/notes/overriddenBase before projection','All12manual selections and3JSONrepeats retain exact preexisting terms/coverages/choices/source metadata','Actual document pipeline exact label precedence,unknown fallback,multiple specific conflicts retained,generic labels unbound,supporting terms create no insurance','Both new .unntak keys remain nonasserting term roles,infer no coverage alone,and do not negate building parent','Positive customer building/fixture fields and all other providers/source-page rules retained','Same-product comparison0differences;52bidirectional comparisons preserve old rows,missing peer new fact remains unknown'], 'runtime_proof':'runtime-proof.json.gz','focused_tests':85};(d/'source-and-reverse-audit.json').write_text(json.dumps(source_audit,ensure_ascii=False,indent=2)+'\n')
summary={'status':'PASS_VALIDATED_LOCAL','base_revision':base,'tested_HEAD_is_base_not_candidate_commit':True,'application_identity_sha256':identity,'results':gates,'focused_contract_tests':85,'controls':{'configurations':12,'manual_inputs':214,'document_flows':144,'comparisons_both_directions':52},'first_focused_and_final_targeted_fullsuite_runs':'PASS;no semantic or failing-test repair needed','mechanical_corrections':'autonomous-mechanical-corrections.json','runtime_proof':'runtime-proof.json.gz','source_reverse_audit':'source-and-reverse-audit.json','not_run':'Typegen/TypeScript/build/server/HTTP-PDF generation:existing typed row factory only,no engine/type/API/UI/dependency change. Fullsuite and scoped lint cover shared test compatibility. No install/deploy.'};(d/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
receipt={'classification':'CURRENT_VALIDATED_ORDINARY_HOUSE_OBJECT_EXCLUSIONS','status':'PASS_VALIDATED_LOCAL_AWAITING_PUBLICATION','created_at_UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_revision':base,'fresh_main_before':base,'fresh_main_after':base,'fresh_main_method':'Connected GitHub branch API at start/end;HEAD/origin/main exactSHA. No reset/pull/stash.','application_identity_sha256':identity,'tested_candidate':'Uncommitted application_files in candidate-identity.json. HEAD identifies base,not an implementation commit.','signature':o['signature'],'original_bindings':o['original_bindings'],'original_priority':'P2','original_disposition':'DEFER_POST_PILOT retained in immutable registry;explicit local implementation tracked separately','decision':'../house-object-exclusions-contract-115ca6a/receipt-house-object-exclusions-contract.json','authorization':'authorization.json','implemented':{'production_file':'lib/gjensidige-hus-catalog.ts','raw_rows_added':4,'effective_rows_per_product':2,'keys':o['keys'],'values':[{k:row[k] for k in ['key','label','value']} for row in o['rows']],'Standard_source_pages':[3],'Pluss_source_pages':[3],'own_Pluss_replaces_base':True,'original_bindings_resolution':'Both original bindings validated for both absent object exclusions;effective on published main only after containing commit verified.','source_to_catalog_and_reverse':'Whole catalog equals fresh-main before plus exactly four independently source-approved facts. Guarded reverse preserves all other fields,primary sources,manual notes and inheritance.','contract':'Hobby greenhouses excluded as insured objects;both tank and furnace excluded specifically for mineral oil. No extension to all greenhouses,garden rooms,tanks,heating systems,plumbing or other energy sources. Existing >10sqm detached-building registration requirement and positive building terms unchanged.','coverage_contract':'Both keys contain .unntak;materialized term roles and nonasserting semantics preserved. No building-parent availability negation,no coverage or optional customer choice created. Exact product-label document rule overrides only its own exclusion;generic headings are not new aliases.','unchanged':['Every other production byte','Positive building/fixtures/solar/side-building and plumbing/garden/brygge rules','Previously published three additional-cost/settlement/garden-import rules and7source-page fixes','All other providers,ordinary product/type/version/scope boundaries','Source registry/sourceType/effective dates/source admission','Engine,global aliases,extractor enum,presentation/UI','Original PDFs,historical audit/P2inventory/receipts/snapshots and prior local readonly packets']},'validation':{'summary':'validation-summary.json','targeted':gates['targeted-final']['tap'],'targeted_files':45,'fullsuite':gates['fullsuite-final']['tap'],'fullsuite_files':174,'focused_contract_tests':85,'scoped_lint_files':10,'scoped_lint_output':gates['eslint-scoped']['output'],'same_candidate_identity_for_all_final_gates':True,'source_reverse_audit':'source-and-reverse-audit.json','runtime_proof':'runtime-proof.json.gz','mechanical_corrections':'autonomous-mechanical-corrections.json'},'unchanged_status':{'B051_partition_counts':prior['B051_partition_counts'],'B130_completed_signatures':prior['current_B130_completed_signatures'],'documented_campaign_count':67,'new_signature_closure_credit':0,'P2_credit':0,'global_resolved_open':'UNKNOWN','CATALOG_PILOT_GATE':'REMEDIATION_REQUIRED','all_HOLD':prior['holds_unchanged'],'additional_explicit_HOLD':prior['additional_explicit_HOLD'],'NITO':'WAIT','Sentralbord':'WAIT_SEPARATE'},'remaining_pre_pilot_points':prior['remaining_pre_pilot_points'],'catalog_foundation':'Named object-exclusion remainder implemented and locally validated. No exhaustive ordinary-catalog completeness,global P2closure or pilot clearance. Combined revalidation on containing published fresh main remains separate.','publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'publication_authorization':None,'publication_preflight':None,'commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,'next_step':'Publication only after explicit user authorization and fresh main/integrity check;no deploy. Local PASS is not merged.'};(d/'completion-receipt-a6beec054bdae0df.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
cp=dict(prior);cp.update({'classification':'CURRENT_VALIDATED_HOUSE_OBJECT_EXCLUSIONS','status':receipt['status'],'base_revision':base,'application_identity_sha256':identity,'current_receipt':'completion-receipt-a6beec054bdae0df.json','prior_checkpoint':'../house-additional-costs-de087fc/checkpoint.json','prior_revalidation':'../house-foundation-revalidation-115ca6a/receipt-house-foundation.json','mapping_decision':'../house-object-exclusions-contract-115ca6a/receipt-house-object-exclusions-contract.json','signature':o['signature'],'specific_remainder':'HOUSE_SHARED_BUILDING_OBJECT_EXCLUSIONS_IMPLEMENTED_LOCALLY_AWAITING_PUBLICATION','original_P2_disposition':'DEFER_POST_PILOT unchanged;explicit implementation tracked separately','new_signature_closure_credit':0,'catalog_foundation':receipt['catalog_foundation'],'publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'publication_authorization':None,'publication_preflight':None,'commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False,'next_step':receipt['next_step']})
for k in ['documented_campaign_signatures','documented_campaign_count','B051_partition_counts','current_B051_completed_signatures','current_B130_completed_signatures','holds_unchanged','additional_explicit_HOLD','P2_credit','global_resolved_open','CATALOG_PILOT_GATE','historical_only','historical_DEFER_SAFE_signatures','HARNESS_AUTONOMY_V1','NITO','Sentralbord','remaining_pre_pilot_points']:assert cp[k]==prior[k]
(d/'checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2)+'\n')
t=gates['targeted-final']['tap']['pass'];f=gates['fullsuite-final']['tap']['pass'];note=f'''## Objektunntak for hobbyveksthus og mineralolje – validert lokalt 24. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`{base}`. Tilleggsutgifter og tidligere bolker er publisert der.
Objektunntaksbolken for `a6beec054bdae0df` er implementert og validert lokalt
på denne basisen. Den er ikke committet, pushet eller dokumentert merget.
Ingen installasjon eller deploy. Testet basis og eksakt kandidatidentitet er adskilt.

Fire rå rader gir to effektive detaljer på hvert husnivå:
`hus.bygninger.hobbyveksthus.unntak` og `hus.bygninger.mineralolje.unntak`.
Hobbyveksthus er ikke forsikret. Tank og fyrkjel for mineralolje er ikke forsikret.
Begge er objektunntak under «Hva er forsikret? / Dekkes ikke», med egne
Standard-/Pluss-kilder på PDF-side 3. Pluss har `replacesBase` og beholder
overstyrt Standard-provenance. Det er ikke utledet generelle unntak for alle
veksthus, glassrom, tanker, varmeanlegg, rør eller andre energikilder.
Eksisterende bygningsdekning, fast inventar og krav om registrering av større
sidebygg er bevart. Begge nøklene er unntaksdetaljer som ikke oppretter dekning,
slår av bygningsdekningen eller oppretter kundevalg. En konkret dokumentregel
kan overstyre ett unntak uten å skjule det andre. Ingen engine, globale aliaser,
extractor-enum, presentasjon eller kilderegister er endret. Alle øvrige
produksjonsbytes er identiske med testet main-basis.

[Receipt](../audit/checkpoints/house-object-exclusions-115ca6a/completion-receipt-a6beec054bdae0df.json),
[validering](../audit/checkpoints/house-object-exclusions-115ca6a/validation-summary.json),
[kandidatidentitet](../audit/checkpoints/house-object-exclusions-115ca6a/candidate-identity.json) og
[checkpoint](../audit/checkpoints/house-object-exclusions-115ca6a/checkpoint.json).
Den [lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-115ca6a/receipt-house-foundation.json)
og [mappingbeslutningen](../audit/checkpoints/house-object-exclusions-contract-115ca6a/receipt-house-object-exclusions-contract.json)
beholdes byte-identisk. GAP-2084/SF-2987 og GAP-2138/SF-3071 er validert for
begge objektunntakene. Originalregisterets P2/DEFER_POST_PILOT beholdes;
den uttrykkelig autoriserte lokale implementeringen føres separat uten global
telle- eller prioriteringsendring.

{t}/{t} målrettede tester i 45 filer og {f}/{f} tester i 174 filer består uten
feil eller skip. 85 nye kontraktkontroller dekker komplette kildesider, alle
12 valgkombinasjoner, tre JSON-berikinger og individuell dokumentprioritet.
214 manuelle kontroller, 144 dokumentflyter og 52 sammenligninger bevarer
øvrige felt og dekningsstatuser. Støttevilkår alene oppretter ingen forsikring,
og generiske etiketter gir ingen ny mapping eller kundevalg. Kvalitetskontroll
av 10 kode-/testfiler: 0 feil og 0 warnings. Eldre testforventninger er tilpasset
kun den kildeverifiserte fire-radersendringen; historiske snapshots, originaler
og fingeravtrykk er bevart.

Samlet katalogfundament er ikke frigitt. B-051 37/0/1/1, kampanje 67, ny
signaturkreditt 0, P2-kreditt 0, globalt resolved/open UKJENT og
CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes. Alle HOLD er uendret,
inkludert HTU, `8a89196fecd29ddb`, SC-020/SR-032, SC-035/SR-031 og B-071-holdet.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. Samlet revalidering
på inneholdende publisert main er en separat oppgave. NITO venter; Sentralbord
venter separat. Ingen ny arbeidsstrøm er startet.

'''
status=r/status_path;old=status.read_text();title='# Aktuell dokumentert prosjektstatus\n\n';assert old.startswith(title);assert '## Objektunntak for hobbyveksthus og mineralolje – validert lokalt' not in old;status.write_text(title+note+old[len(title):])
changed={p for p,sha in before.items() if h((r/p).read_bytes())!=sha};assert changed==set(app).intersection(before)|{status_path};assert [p for p in changed if p.startswith(('lib/','app/','catalog/'))]==['lib/gjensidige-hus-catalog.ts']
for name in ['house-foundation-revalidation-115ca6a','house-object-exclusions-contract-115ca6a']:
 for p,sha in before.items():
  if p.startswith('docs/audit/checkpoints/'+name+'/'):assert h((r/p).read_bytes())==sha
for c in [['git','diff','--check'],['git','diff','--cached','--check']]:subprocess.run(c,check=True)
for link in re.findall(r'\]\(([^)]+)\)',note):assert (r/'docs/development-agent'/link).resolve().is_file(),link
(d/'candidate-tracked.diff.gz').write_bytes(gzip.compress(subprocess.check_output(['git','diff','--',*sorted(changed)]),mtime=0))
integ={'base_HEAD':base,'existing_file_count':len(before),'tracked_files_before':8101,'unchanged_existing_files':len(before)-len(changed),'changed_existing_files':sorted(changed),'new_application_files':sorted(set(app)-set(before)),'prior8_local_readonly_files_unchanged':True,'all_other_production_and_existing_files_unchanged':True,'staged_files':0,'fresh_main_at_end':base,'no_commit_push_deploy_install':True,'project_status_links':'PASS','diff_check':'PASS','protected_checkpoint_fields':'UNCHANGED'};(d/'integrity.json').write_text(json.dumps(integ,indent=2)+'\n')
(d/'review-files.json').write_text(json.dumps({'application_files':sorted(app),'project_status':status_path,'audit_packet':str(d.relative_to(r)),'prior_local_readonly_packets':['docs/audit/checkpoints/house-foundation-revalidation-115ca6a','docs/audit/checkpoints/house-object-exclusions-contract-115ca6a'],'publication':'NOT_AUTHORIZED;do not stage or publish here'},indent=2)+'\n')
(d/'SHA256SUMS').write_text(''.join(f'{h(p.read_bytes())}  {p.name}\n' for p in sorted(d.iterdir()) if p.name!='SHA256SUMS'))
for line in (d/'SHA256SUMS').read_text().splitlines():
 sha,name=line.split(maxsplit=1);assert h((d/name).read_bytes())==sha
assert all(h((r/p).read_bytes())==sha for p,sha in app.items())
actual=set(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],text=True).splitlines());expected={p for p in before if p.startswith(('docs/audit/checkpoints/house-foundation-revalidation-115ca6a/','docs/audit/checkpoints/house-object-exclusions-contract-115ca6a/'))}|set(app)-set(before)|{str(p.relative_to(r)) for p in d.iterdir()};assert actual==expected,actual^expected
print(json.dumps({'receipt':str(d/'completion-receipt-a6beec054bdae0df.json'),'targeted':t,'fullsuite':f,'lint_files':10,'application_identity':identity,'audit_files':len(list(d.iterdir())),'status':receipt['status']}))
