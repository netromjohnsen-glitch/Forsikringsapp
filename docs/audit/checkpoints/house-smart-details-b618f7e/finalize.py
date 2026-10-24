from pathlib import Path
import json,gzip,hashlib,subprocess,datetime,re
r=Path.cwd();d=r/'docs/audit/checkpoints/house-smart-details-b618f7e';base='b618f7ecdb9fb99ea74ba0581b37ead8a406fd78';h=lambda b:hashlib.sha256(b).hexdigest();load=lambda n:json.loads((d/n).read_text());o=load('source-oracle.json');before=json.loads(gzip.decompress((d/'before-integrity.json.gz').read_bytes()));prior=o['protected_checkpoint']['content'];gates={n:load(n+'.json') for n in ['targeted-final','fullsuite-final','eslint-scoped']};target=gates['targeted-final'];app=target['application_files'];identity=target['application_identity_sha256'];status_path='docs/development-agent/current-project-status.md'
for g in gates.values():
 assert g['exit_code']==0 and g['application_files']==app and g['application_identity_sha256']==identity;assert h((d/g['log']).read_bytes())==g['log_sha256']
 if 'tap'in g:assert g['tap']['tests']==g['tap']['pass'] and all(g['tap'][k]==0 for k in ['fail','cancelled','skipped'])
assert target['test_files']==50 and target['tap']['pass']==3364 and gates['fullsuite-final']['test_files']==179 and gates['fullsuite-final']['tap']['pass']==7056 and gates['eslint-scoped']['file_count']==10 and gates['eslint-scoped']['output']==''
assert len(app)==10 and len(before)==8323 and all(h((r/p).read_bytes())==v for p,v in app.items());assert all(h((r/p).read_bytes())==v for p,v in before.items() if p not in set(app)|{status_path});assert subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()==subprocess.check_output(['git','rev-parse','origin/main'],text=True).strip()==base;assert not subprocess.check_output(['git','diff','--cached','--name-only'])
insert=load('production-insertion.json');prod='lib/gjensidige-hus-catalog.ts';oldprod=subprocess.check_output(['git','show',base+':'+prod],text=True);assert (r/prod).read_text()==oldprod.replace(insert['anchor'],insert['exact_insertion']+insert['anchor'])
for source in o['sources']['sources']:assert h((r/source['path']).read_bytes())==source['sha256']
proof=json.loads(gzip.decompress((d/'runtime-proof.json.gz').read_bytes()));assert proof['status']=='PASS' and len(proof['configurations'])==12 and len(proof['comparisons'])==52
candidate={'base_revision':base,'candidate_is_uncommitted':True,'application_identity_sha256':identity,'algorithm':'SHA256(canonical compact sorted JSON path->SHA256 mapping)','application_files':app,'only_changed_production_file':prod,'production_delta':'Exactly6optional Smart-service detail facts on existing gjensidigeHusSmart component. No engine,selection,premium,aliases,source registry or other production bytes changed.','source_oracle_sha256':h((d/'source-oracle.json').read_bytes()),'baseline_sha256':h((d/'baseline.v8.gz').read_bytes())};(d/'candidate-identity.json').write_text(json.dumps(candidate,indent=2)+'\n')
audit={'status':'PASS_SIX_SMART_DETAILS','base_revision':base,'source_oracle_sha256':candidate['source_oracle_sha256'],'signatures':o['signatures'],'keys':o['keys'],'checks':['Both original HTML byte hashes,full extracted text and complete relevant source sections independently verified','Six immutable registry signatures and twelve exact sourcefact/gap bindings retained;P2/DEFER_POST_PILOT historical records unchanged','Actual customer agreement controls service price;no one-month notice invented for company switch;complete original8/10clause retained','Whole catalog is frozen before plus exactly6approved facts;source-qualified projection rejects altered source/value/metadata/notes','12manual choices/3JSONrepeats preserve every old field,premium,choice and canonical coverage;6new rows only when Smart selected','140actual individual document cases;child rules never select optional Smart;customer label/value kept without selection and canonical mapping only when component available','214manual/144actualdocument/52comparison controls,scope boundaries and optional materialization all pass'],'focused_tests':169,'runtime_proof':'runtime-proof.json.gz'};(d/'source-and-reverse-audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n')
summary={'status':'PASS_VALIDATED_SIX_SMART_DETAILS','base_revision':base,'application_identity_sha256':identity,'results':gates,'focused_contract_tests':169,'controls':{'configurations':12,'manual_inputs':214,'document_flows':144,'comparisons':52,'individual_document_matrix':140},'mechanical_corrections':'autonomous-mechanical-corrections.json','source_reverse_audit':'source-and-reverse-audit.json','runtime_proof':'runtime-proof.json.gz','not_run':'Typegen/TypeScript/build/server/HTTPPDFgeneration:existing typed data only,no engine,type/API/UI/dependency/status/price-calculation changes. No install/deploy.'};(d/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
receipt_names=[]
for definition in o['rows']:
 sig=definition['signature'];name='completion-receipt-'+sig+'.json';receipt_names.append(name)
 receipt={'classification':'CURRENT_VALIDATED_ORDINARY_HOUSE_SMART_DETAIL','status':'PASS_VALIDATED_AWAITING_SECURED_PUBLICATION','created_at_UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_revision':base,'signature':sig,'key':definition['key'],'original_bindings':definition['original_bindings'],'original_priority':'P2','original_disposition':'DEFER_POST_PILOT historical registry retained;current explicit implementation tracked separately','source_and_mapping_decision':'../house-smart-contract-b618f7e/receipt-house-smart-contract.json','source_oracle':'source-oracle.json','application_identity_sha256':identity,'tested_candidate':'Uncommitted application_files,not the base HEAD implementation commit','implemented':{'owner':'gjensidigeHusSmart','products':['gjensidige-hus','gjensidige-hus-pluss'],'raw_fact':next(f['fact'] for f in o['facts'] if f['fact']['key']==definition['key']),'condition':'Existing explicit Smart selection required;standalone detail never selects Smart;actual customer agreement overrides template service price','production_scope':'Single existing catalog file only;no new addon,alias,enum,engine,source admission,premium or coverage calculations'},'validation':'validation-summary.json','controls':summary['controls'],'all_HOLD_unchanged':prior['holds_unchanged'],'additional_explicit_HOLD_unchanged':prior['additional_explicit_HOLD'],'global_campaign_and_P2_credit_changed':False,'catalog_foundation':'Requires combined revalidation on published containing main;no broad pilot readiness claim','remaining_pre_pilot_points':prior['remaining_pre_pilot_points'],'publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','commit_push_authorized':True,'deploy_authorized':False,'NITO':'WAIT','Sentralbord':'WAIT_SEPARATE'}
 (d/name).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
cp=dict(prior);cp.update({'classification':'CURRENT_VALIDATED_SIX_SMART_SERVICE_DETAILS','status':'PASS_VALIDATED_AWAITING_SECURED_PUBLICATION','base_revision':base,'application_identity_sha256':identity,'prior_checkpoint':'../house-war-5d38b87/checkpoint.json','current_receipts':receipt_names,'current_receipt':receipt_names[0],'mapping_decision':'../house-smart-contract-b618f7e/receipt-house-smart-contract.json','validated_Smart_detail_signatures':o['signatures'],'specific_remainder':'SIX_SMART_DETAILS_IMPLEMENTED_AWAITING_PUBLICATION','catalog_foundation':'Six Smart roots validated separately;aggregate foundation review still required,no global pilot release','publication_status':'LOCAL_UNCOMMITTED_NOT_PUSHED','publication_revision':None,'commit_push_authorized':True,'deploy_authorized':False,'next_step':'Secure publish under standing authorization,then original-inventory aggregate revalidation;all HOLD and other scope unchanged.'})
for key in ['documented_campaign_signatures','documented_campaign_count','B051_partition_counts','current_B051_completed_signatures','current_B130_completed_signatures','holds_unchanged','additional_B051_holds_unchanged','additional_explicit_HOLD','P2_credit','global_resolved_open','CATALOG_PILOT_GATE','historical_only','historical_DEFER_SAFE_signatures','HARNESS_AUTONOMY_V1','NITO','Sentralbord','remaining_pre_pilot_points']:assert cp[key]==prior[key]
(d/'checkpoint.json').write_text(json.dumps(cp,ensure_ascii=False,indent=2)+'\n')
note=f'''## Seks ordinære Smart-detaljer – validert lokalt 24. oktober 2026

Fersk main-basis er `{base}`. Seks avgrensede røtter er validert lokalt:
pris, installasjon/leverandørbytte, aktivering/kundeplikter, utstyr/retur/skylagring,
flytting/oppsigelse og ordinært pakkeinnhold. De gir seks nye detaljrader i den
eksisterende valgfrie Smart-komponenten for Hus Standard og Hus Pluss.
Ingen nye kundevalg, premie-/sum-/dekningsberegninger eller globale aliaser.
Veiledende tjenestepris holdes separat fra forsikringspremien; kundens gjeldende
avtale styrer faktisk pris. Originalvilkårets punkt 8 og 10 beholdes ordrett,
inkludert skillet mellom flytting og bytte av selskap. Kjøpt ringeklokke og
leieutstyr skilles; skylagringens tolv måneder og etterfølgende avtale bevares.
Egne medlemsfordeler legges ikke til ordinærpakker. Begge registrerte HTML-kilder
og alle tolv opprinnelige GAP-/SF-bindinger er kontrollert.

{target['tap']['pass']}/{target['tap']['tests']} målrettede tester i 50 filer og
{gates['fullsuite-final']['tap']['pass']}/{gates['fullsuite-final']['tap']['tests']} tester i 179 filer består uten feil eller skip.
169 nye kontraktkontroller dekker 12 valgkombinasjoner, 140 individuelle dokumenttilfeller,
tre gjentatte JSON-berikinger, kildehenvisninger og kundeprioritet. 214 manuelle
kontroller, 144 dokumentflyter og 52 sammenligninger bevarer alle øvrige felt.
Kvalitetskontroll av ti kode-/testfiler: 0 feil og 0 warnings.

[Validering](../audit/checkpoints/house-smart-details-b618f7e/validation-summary.json),
[checkpoint med seks separate receipts](../audit/checkpoints/house-smart-details-b618f7e/checkpoint.json),
[kilde-/mappingbeslutning](../audit/checkpoints/house-smart-contract-b618f7e/receipt-house-smart-contract.json),
[forutgående samlet revalidering](../audit/checkpoints/house-foundation-revalidation-b618f7e/receipt-house-foundation.json).
Publisering følger stående fullmakt etter eksakt kandidat-/fersk-main-kontroll.
Original P2/DEFER_POST_PILOT beholdes historisk; ingen global signatur-, P2- eller
kampanjekreditt utledes av denne bolken. Samlet ordinært katalogfundament krever
fortsatt egen revalidering på publisert main. Alle HOLD, B-051 37/0/1/1,
kampanje 67, globalt resolved/open UKJENT og REMEDIATION_REQUIRED beholdes.
Sikkerhet/GDPR og P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige.
Ingen installasjon eller deploy. NITO venter; Sentralbord venter separat.

'''
status=r/status_path;old=status.read_text();title='# Aktuell dokumentert prosjektstatus\n\n';assert old==subprocess.check_output(['git','show',base+':'+status_path],text=True);status.write_text(title+note+old[len(title):])
for link in re.findall(r'\]\(([^)]+)\)',note):assert (r/'docs/development-agent'/link).resolve().is_file()
changed={p for p,v in before.items() if h((r/p).read_bytes())!=v};assert changed==set(app).intersection(before)|{status_path};assert {p for p in changed if p.startswith(('lib/','app/','catalog/'))}=={prod}
(d/'candidate-tracked.diff.gz').write_bytes(gzip.compress(subprocess.check_output(['git','diff','--',*sorted(changed)]),mtime=0))
(d/'review-files.json').write_text(json.dumps({'application_files':sorted(app),'project_status':status_path,'audit_packet':str(d.relative_to(r)),'prior_local_readonly_packets':['docs/audit/checkpoints/house-foundation-revalidation-b618f7e','docs/audit/checkpoints/house-smart-contract-b618f7e'],'publication':'AUTHORIZED_AFTER_GATES'},indent=2)+'\n')
(d/'integrity.json').write_text(json.dumps({'status':'PASS','existing_files_before':len(before),'changed_existing_files':sorted(changed),'all_other_existing_bytes_unchanged':True,'all_HOLD_campaign_and_global_fields_unchanged':True,'source_oracle_and_before_snapshots_unchanged':True,'staged_files':0,'older_status_sections_unchanged':True},indent=2)+'\n')
subprocess.run(['git','diff','--check'],check=True);subprocess.run(['git','diff','--cached','--check'],check=True)
(d/'SHA256SUMS').write_text(''.join(f'{h(p.read_bytes())}  {p.name}\n' for p in sorted(d.iterdir()) if p.name!='SHA256SUMS'))
assert all(h((r/p).read_bytes())==v for p,v in app.items());print({'status':'PASS_SIX_SMART_DETAILS','targeted':target['tap'],'fullsuite':gates['fullsuite-final']['tap'],'identity':identity,'receipts':len(receipt_names)})
