import pathlib,json,gzip,hashlib,subprocess,datetime
root=pathlib.Path(__file__).resolve().parents[4];d=pathlib.Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest();load=lambda p:json.loads(p.read_text());base='1b5b5aaa7d2e56845146be0a935ddc0e5a697f4f';identity=load(d/'candidate-identity.json')
for p,h in identity['application_files'].items():assert sha((root/p).read_bytes())==h
results={}
for name in ['targeted-final','fullsuite-final','eslint-scoped']:
 j=load(d/(name+'.json'));assert j['exit_code']==0
 if 'tap' in j:assert j['tap']['fail']==j['tap']['cancelled']==j['tap']['skipped']==0 and j['tap']['tests']==j['tap']['pass']
 assert sha((d/j['log']).read_bytes())==j['log_sha256'];j['application_identity_sha256']=identity['application_identity_sha256'];results[name]=j
cp=load(root/'docs/audit/checkpoints/b130-person-scope-cfada9a/checkpoint.json');prior=load(root/'docs/audit/checkpoints/house-foundation-revalidation-1b5b5aa/receipt-house-foundation.json')
assert prior['fresh_main_after']==base
protected_keys=['holds_unchanged','additional_B051_holds_unchanged','current_B051_completed_signatures','B051_partition_counts','current_B130_completed_signatures','remaining_B130_review_signatures','global_resolved_open','P2_credit','CATALOG_PILOT_GATE','NITO','Sentralbord','documented_campaign_signatures','documented_campaign_count','historical_only','historical_DEFER_SAFE_signatures','HARNESS_AUTONOMY_V1']
protected={k:cp[k] for k in protected_keys}
summary={'status':'PASS_VALIDATED_LOCAL','base_revision':base,'tested_HEAD_is_base_not_candidate_commit':True,'application_identity_sha256':identity['application_identity_sha256'],'results':results,'new_contract_tests':19,'before_control_counts':load(d/'baseline-identity.json'),'not_repeated':'TypeScript/typegen/build/server/HTTP-PDF gates: no API/type/render/engine change, exact one-byte catalog metadata delta only. Fullsuite and scoped lint run because historical test adapters changed. No install/deploy.'};(d/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
checkpoint={**protected,'classification':'CURRENT_VALIDATED_HOUSE_BUILDINGS_SOURCE_PAGE_CORRECTION','status':'PASS_VALIDATED_LOCAL','base_revision':base,'application_identity_sha256':identity['application_identity_sha256'],'corrected_key':'hus.bygninger.dekning','correction':'Only shared Standard primary source.page2 to3, inherited by Pluss','current_receipt':'receipt-house-buildings-source.json','prior_checkpoint':'../b130-person-scope-cfada9a/checkpoint.json','prior_revalidation':'../house-foundation-revalidation-1b5b5aa/receipt-house-foundation.json','published_documented_campaign_count_at_base_verified':67,'new_signature_closure_credit':0,'specific_remainder':'HOUSE_BUILDINGS_PRIMARY_SOURCE_PAGE_FIXED_LOCALLY_VALIDATED','all_HOLD_unchanged':True,'additional_explicit_HOLD':['8a89196fecd29ddb'],'catalog_foundation':'No combined clearance; this task fixes only the named source-page remainder. Remaining P2/source inventory and HOLD unchanged. Revalidate combined foundation on published main after separately authorized publication.','remaining_pre_pilot_points':['HTU and all other protected HOLD','8a89196fecd29ddb insect common-exclusion scope HOLD','SC-020/SR-032 physical insect damage deductible HOLD','Ordinary house catalog foundation requires combined revalidation; no broad source-page cleanup or P2 closure','Security/GDPR and P3-A05 identity/merge status unknown','Person insurance / pilot scope','Critical UX','Feedback','Operational adviser acceptance'],'publication_status':'LOCAL_UNCOMMITTED','commit_push_authorized':False,'deploy_authorized':False,'install':'NOT_PERFORMED','new_workstreams_started':False};(d/'checkpoint.json').write_text(json.dumps(checkpoint,ensure_ascii=False,indent=2)+'\n')
receipt={'classification':'CURRENT_VALIDATED_SINGLE_SHARED_HOUSE_BUILDINGS_PRIMARY_SOURCE_PAGE_CORRECTION','status':'PASS_VALIDATED_LOCAL','authorization':'authorization.json','decision':'hus.bygninger.dekning primary page2 to3 corrected in the shared Standard row. Both Hus Standard and inherited Hus Pluss verified. Only this named remainder is addressed; no combined foundation/pilot clearance.','base_revision':base,'tested_HEAD_is_base_not_candidate_commit':True,'application_identity_sha256':identity['application_identity_sha256'],'candidate_identity':'candidate-identity.json','scope':{'key':'hus.bygninger.dekning','products':['gjensidige-hus','gjensidige-hus-pluss'],'provider':'gjensidige','type':'Hus','agreement_scope':'ordinary','version':'Alminnelige vilkår','primary_source_owner':'gjensidigeHusStandard','before_page':2,'after_page':3,'raw_catalog_rows_changed':1,'source_owner_and_Pluss_inheritance':'UNCHANGED','wording_key_selection_coverage_mapping_priority_and_all_other_fields':'UNCHANGED'},'source_basis':{'oracle':'source-oracle.json','registered_originals':'Both original SHA256 values unchanged; page3 exact raw text verified by tests; prior complete-page visual review retained in oracle','prior_read_only_receipt':'../house-foundation-revalidation-1b5b5aa/receipt-house-foundation.json','prior_remainder':'HOUSE_BUILDINGS_PRIMARY_SOURCE_PAGE','historical_SF_context':['SF-3063','SF-3150'],'does_not_close_entire_SF_findings':True},'source_and_reverse_audit':'source-and-reverse-audit.json','validation':{'targeted':results['targeted-final']['tap'],'targeted_files':41,'fullsuite':results['fullsuite-final']['tap'],'fullsuite_files':170,'new_contract_tests':19,'scoped_eslint':'0 errors,0 warnings','all12_addon_combinations':'Both products; exact full resolved/evidence/manual/threeJSON-reenrichment/display outputs except page-only delta','214_manual_inputs':'Full first outputs and exact captured repeat invocation preserved; true per-company repeated flows additionally verified by existing regression suites','144_document_controls':'Complete prior outputs preserved except page-only delta','52_catalog_comparisons':'Both directions/full prior outputs preserved except page-only delta','isolation':'Wrong provider/type/scope/version rejected; all other products unchanged','summary':'validation-summary.json'},'mechanical_corrections':'autonomous-mechanical-corrections.json','historical_evidence':'Source originals, all old audit files including prior local revalidation, old frozen baseline snapshots and numeric policy history unchanged. Compatibility adapters project only independently approved page delta; new direct tests require actual page3 and full-catalog one-field equality.','unchanged_status':{'documented_campaign_published_at_base':67,'B051_partition_counts':cp['B051_partition_counts'],'new_signature_closure_credit':0,'P2_credit':0,'global_resolved_open':'UNKNOWN','CATALOG_PILOT_GATE':'REMEDIATION_REQUIRED','HOLD':cp['holds_unchanged'],'additional_explicit_HOLD':['8a89196fecd29ddb'],'NITO':'WAIT','Sentralbord':'WAIT_SEPARATE'},'project_status':'../../../development-agent/current-project-status.md','checkpoint':'checkpoint.json','publication_status':'LOCAL_UNCOMMITTED_NOT_ON_MAIN','commit_push':'NOT_PERFORMED_NOT_AUTHORIZED_THIS_TURN','deploy':'NOT_PERFORMED','install':'NOT_PERFORMED','new_workstreams_started':False,'next_bounded_step':'Separate publication authorization if desired, then combined ordinary-house foundation revalidation on the containing fresh main; do not expand this source-only correction.'};(d/'receipt-house-buildings-source.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
status=root/'docs/development-agent/current-project-status.md';old=subprocess.check_output(['git','show',base+':docs/development-agent/current-project-status.md']).decode();assert status.read_text()==old
section='''## Forsikrede bygninger – kildehenvisning rettet og validert lokalt 23. oktober 2026

Fersk GitHub-main, HEAD og origin/main er kontrollert til
`1b5b5aaa7d2e56845146be0a935ddc0e5a697f4f`. Personkretsrettelsen og de tre
forutgående B-130-bolkene er faktisk publisert på denne revisjonen; 67 dokumenterte
kampanjesignaturer er på main. Den nye sidetallsrettelsen er **lokal og validert**,
uten commit/push, installasjon eller deploy.

Bare `hus.bygninger.dekning` sin primære kildehenvisning er rettet fra Standard
PDF-side 2 til 3. Hus Pluss arver samme felles rad og kildeidentitet. Produksjonsdiffen
er ett tegn i én katalograd; øvrig ordlyd, verdi, nøkkel, kildeeier, avsnitt, versjon,
arv, dekning, mapping, kundevalg og dokumentprioritet er uendret. Ingen bredere
sidetallsopprydding er gjort. Begge original-PDF-er og historiske receipts er bevart.

[Receipt](../audit/checkpoints/house-buildings-source-1b5b5aa/receipt-house-buildings-source.json),
[validering](../audit/checkpoints/house-buildings-source-1b5b5aa/validation-summary.json),
[checkpoint](../audit/checkpoints/house-buildings-source-1b5b5aa/checkpoint.json) og
[kilde-/reverse-audit](../audit/checkpoints/house-buildings-source-1b5b5aa/source-and-reverse-audit.json).
Den [forutgående lesende revalideringen](../audit/checkpoints/house-foundation-revalidation-1b5b5aa/receipt-house-foundation.json)
beholdes uendret som før-bevis; den navngitte restmangelen er rettet i denne lokale
kandidaten. Historiske testbaseliner beholdes; beviste tilpasninger av testhjelpere
projiserer bare det godkjente sidetallsbyttet. Egne tester krever faktisk side 3 og
komplett likhet med uavhengig før-katalog bortsett fra denne ene endringen.

2552/2552 målrettede tester i 41 filer og 6244/6244 tester i 170 filer består uten
skip; 19 nye kilde-/kontraktkontroller. Kvalitetskontroll av de åtte berørte kode-/
testfilene: 0 feil og 0 warnings. Alle 12 tilleggskombinasjoner, 214 manuelle input,
144 syntetiske dokumentkontroller, gjentatt JSON-beriking, materialisering, visning
og 52 katalogsammenligninger i begge retninger er kontrollert mot før-grunnlaget.
Ingen ny type-/API-/engine- eller visningsendring; build/server/deploy er ikke kjørt.

Dette lukker bare den presise sidetallsrestmangelen i lokal kandidat. Samlet
katalogfundament er ikke frigitt; resterende kilde-/P2-inventar og alle HOLD er
uendret. B-051 37/0/1/1, kampanje 67, ny signaturkreditt 0, P2-kreditt 0, globalt
resolved/open UKJENT og CATALOG_PILOT_GATE = REMEDIATION_REQUIRED beholdes.
Eventuell publisering og påfølgende samlet revalidering på inneholdende main er
separate oppgaver, ikke startet her.

HTU `157c7afed18eb0fe` / SC-019/SR-033, `8a89196fecd29ddb`, SC-020/SR-032,
SC-035/SR-031, B-071-holdet og alle øvrige beskyttede HOLD beholdes eksakt.
Sikkerhet/GDPR og uavklart P3-A05-identitet/mergestatus, personforsikring/pilotscope,
kritisk UX, feedback og operativ rådgiveraksept forblir synlige. NITO venter;
Sentralbord venter separat. Ingen ny arbeidsstrøm er startet.


'''
heading='# Aktuell dokumentert prosjektstatus\n\n';assert old.startswith(heading);status.write_text(heading+section+old[len(heading):])
(d/'main-verification.json').write_text(json.dumps({'remote_main_before':base,'remote_main_after':base,'method':'GitHub branch API, local HEAD and origin/main; no fetch/merge/reset','checked_UTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'candidate_not_on_main':True},indent=2)+'\n')
(d/'README.md').write_text('''# Hus: avgrenset retting av primær kildehenvisning

Lokal validert kandidat på main-basis 1b5b5aa. Bare `hus.bygninger.dekning`
sin Standard-side 2 er endret til 3; Pluss arver rettelsen.
Se receipt-house-buildings-source.json, validation-summary.json og checkpoint.json.
Fullmakt: authorization.json. Ingen commit/push, installasjon eller deploy.

baseline.v8.gz og source-oracle.json ble fryst før produksjonsendringen.
Historiske auditfiler og den forutgående lokale revalideringen er uendret.
To diagnostiske testkjøringer er bevart; målrettet sluttgate og fullsuite består.
SHA256SUMS forsegler denne pakkens filer, uten å inkludere seg selv.
Alle HOLD, kampanjesett og pilotport beholdes; NITO og Sentralbord venter.
''')
print(json.dumps({'receipt':str(d/'receipt-house-buildings-source.json'),'targeted':results['targeted-final']['tap'],'fullsuite':results['fullsuite-final']['tap'],'status':'LOCAL_VALIDATED'}))
