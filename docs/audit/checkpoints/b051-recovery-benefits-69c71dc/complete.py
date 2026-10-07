#!/usr/bin/env python3
"""Generate only authorized current receipts after every final gate has passed."""
from pathlib import Path
import gzip
import hashlib
import json

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
PRIOR=OUT.parent/'b051-settlement-age-0bcd250'
read=lambda name:json.loads((OUT/name).read_text())
write=lambda name,data:(OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
results=read('final-gate-results.json')['results']
assert results and all(r['status']=='PASS' and r['exit_code']==0 for r in results)
full=[r for r in results if r['label'].startswith('full-')]
target=[r for r in results if r['label'].startswith('targeted-closure-')]
assert len(full)==len(read('final-test-manifest.json'))==151 and len(target)==24
quality={r['label']:r for r in results if r['label'] in ['typegen','typescript','eslint','production-build','http-pdf-runtime','diff-check']}
assert len(quality)==6
identity=read('final-application-identity.json')
assert all(r['candidate_identity_sha256']==identity['identity_sha256'] for r in results)
assert all(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h for p,h in identity['application_files'].items())
roots=read('final-harness-roots.json');assert len(roots)==1 and roots[0]['root']=='PLUS_PUBLIC_ORDER_PAGE_CONTINUATION'
# Compare warnings by path/rule/message, retaining line numbers as supporting evidence.
reports=json.loads(gzip.decompress((OUT/quality['eslint']['log']).read_bytes()))
old=json.loads(gzip.decompress((PRIOR/'eslint.log.gz').read_bytes()))
def warnings(xs):
 return sorted((str(Path(x['filePath']).relative_to(ROOT)),m['ruleId'],m['message']) for x in xs for m in x['messages'] if m['severity']==1)
before,after=warnings(old),warnings(reports)
assert quality['eslint']['errors']==0
lint={'errors':0,'previous_warnings':len(before),'current_warnings':len(after),'new_warnings':[x for x in after if x not in before],'removed_warnings':[x for x in before if x not in after],'current_warning_locations':[{'file':str(Path(x['filePath']).relative_to(ROOT)),'rule':m['ruleId'],'message':m['message'],'line':m['line']} for x in reports for m in x['messages'] if m['severity']==1],'protectedCount_cleanup':'UNCHANGED_AND_OUTSIDE_SCOPE','corrections_performed':0}
write('final-lint-difference.json',lint)
def total(rs):return {'files':len(rs),**{k:sum(r['tap'][k] for r in rs) for k in ['tests','pass','fail','cancelled','skipped']}}
rem=read('final-remediation-manifest.json')
summary={'status':'PASS','tested_baseline':identity['tested_baseline'],'candidate_identity_sha256':identity['identity_sha256'],'targeted':total(target),'fullsuite':total(full),'remediation':total([r for r in full if r['command'][-1] in rem]),'new_gate':next(r['tap'] for r in target if r['label'].endswith('recovery-benefits')),'quality':{k:{'status':r['status'],'command':r['command'],'exit_code':r['exit_code']} for k,r in quality.items()},'eslint':lint,'HTTP_PDF_runtime_checks':len(quality['http-pdf-runtime']['runtime']['checks']),'HARNESS_AUTONOMY_V1':{'used':21,'ordinary_limit':12,'scope_used':1,'scope_limit':6,'explicit_exception':'PLUS_PUBLIC_ORDER_PAGE_CONTINUATION','future_correction_capacity':0},'global_resolved_open':'UNKNOWN','P2_credit':0,'initial_blocked_attempt_preserved':'initial-candidate-artifact-hashes.json'}
write('completion-validation-summary.json',summary)
auth=read('authorization.json');exact={r['signature_id'] for r in auth['signatures']};contracts={'292dacd4533926fd':'hus.naturskade.dekning','b3b964a9c6105360':'hus.tilpasning.grense','ed99577218e2302b':'hus.pabud.dekning'};assert exact==set(contracts)
source_pages={'292dacd4533926fd':{'Standard':[18],'Pluss':[19]},'b3b964a9c6105360':{'Standard':[5],'Pluss':[5]},'ed99577218e2302b':{'Standard':[18,5],'Pluss':[19,5,6]}}
for binding in auth['signatures']:
 sig=binding['signature_id'];entry=next(x for x in auth['preflight_entries'] if x['signature']==sig)
 write('receipt-'+sig+'.json',{'classification':'CURRENT_SOURCE_BACKED_COMPLETION_NOT_HISTORICAL_CLOSURE_RECONSTRUCTION','status':'PASS','signature':sig,'tested_baseline':identity['tested_baseline'],'candidate_identity_sha256':identity['identity_sha256'],'candidate_identity':'final-application-identity.json','original_binding':binding,'GAP_SF_bindings':[[x['finding_id'],x['source_fact_id']] for x in entry['original_source_evidence']],'source_evidence':entry['original_source_evidence'],'source_pages_verified':source_pages[sig],'authorized_key':contracts[sig],'contract_and_provenance':read('source-oracle.json')[contracts[sig]],'full_gate_evidence':'final-gate-results.json','validation_summary':'completion-validation-summary.json','isolation_evidence':'catalog-delta.json','planned_compatibility_work':'planned-test-updates.json','mechanical_root_ledger':'final-harness-roots.json','HARNESS_AUTONOMY_V1':summary['HARNESS_AUTONOMY_V1'],'global_resolved_open':'UNKNOWN','P2_credit':0,'prior_receipts':'prior-receipts.json','publication_revision':'Git records the atomic commit; the tested baseline plus final candidate identity are stated separately.'})
prior=json.loads((PRIOR/'checkpoint.json').read_text());cp=dict(prior)
cp.update({'prior_checkpoint':'../b051-settlement-age-0bcd250/checkpoint.json','implementation_revision':identity['tested_baseline'],'candidate_identity_sha256':identity['identity_sha256'],'documented_campaign_signatures':sorted(set(prior['documented_campaign_signatures'])|exact),'documented_campaign_count':51,'current_B051_completed_signatures':sorted(set(prior['current_B051_completed_signatures'])|exact),'B051_other_signatures_not_completed_in_this_scope':sorted(set(prior['B051_other_signatures_not_completed_in_this_scope'])-exact),'current_completion_receipts':['receipt-'+s+'.json' for s in sorted(exact)],'HARNESS_AUTONOMY_V1':{'used':21,'limit':12,'scope_used':1,'scope_limit':6,'prior_receipt_used':20,'ordinary_capacity_used':0,'explicit_exception_roots':1,'ledger':'final-harness-roots.json','no_future_correction_capacity':True},'B051_status':'25 exact current completion receipts/39;10 source-clear historical preflight candidates,2 revalidation candidates,2 holds. No global status inferred.','next_packet':'NOT_AUTHORIZED: next explicit B051 source-clear or revalidation scope requires user authorization.','next_minimum_decision':'Authorize a bounded read-only preflight or exact revalidation scope. No later production packet is authorized and no correction capacity remains.','nonblocking_lint_warning':'final-lint-difference.json','current_validation':'completion-validation-summary.json','initial_stoppoint':'blocker.json','initial_stoppoint_status':'RESOLVED_BY_EXPLICIT_PLUS_PUBLIC_ORDER_PAGE_CONTINUATION_AUTHORIZATION','global_resolved_open':'UNKNOWN','CATALOG_PILOT_GATE':'REMEDIATION_REQUIRED'})
write('completion-checkpoint.json',cp)
partition=json.loads((PRIOR/'b051-partition.json').read_text());partition['completed_current_receipts']=sorted(set(partition['completed_current_receipts'])|exact);partition['source_clear_no_current_receipt']=sorted(set(partition['source_clear_no_current_receipt'])-exact);write('completion-b051-partition.json',partition)
# Former blocker and failed-attempt evidence stay byte-identical and explicitly historical.
write('blocker-resolution.json',{'root':'PLUS_PUBLIC_ORDER_PAGE_CONTINUATION','prior_blocker':'blocker.json','status':'RESOLVED_BY_AUTHORIZED_HARNESS_CORRECTION_AND_FRESH_COMPLETE_PASS','authorization':'resume-authorization.json','source_proof':'source-continuation-blocker-proof.json','root_ledger':'final-harness-roots.json','final_gate_results':'final-gate-results.json','final_summary':'completion-validation-summary.json','initial_failed_logs_preserved':True,'production_changes_for_root':False})
(OUT/'COMPLETION.md').write_text(f'''# B-051 Naturskadeoppgjør, offentlige påbud og rullestoltilpasning — COMPLETE

Dette er aktuell completion. [README fra det tidligere stoppunktet](README.md), [gammel blocker](blocker.json), gamle checkpoint-/validation-summary-filer og opprinnelige feillogger er bevart som historisk kandidatbevis, ikke gjeldende status. [Felt- og filidentitet før retting](initial-candidate-artifact-hashes.json) verifiserer dem.

Tre individuelle receipts:
- [292dacd4533926fd](receipt-292dacd4533926fd.json): totalskade ved gjenoppføringsnekt, bolig-/fritidshustomt inntil fem dekar, ustabil grunn, samtykke og selskapets sikring/ettersyn/vedlikehold.
- [b3b964a9c6105360](receipt-b3b964a9c6105360.json): nødvendig tilpasning inntil250000kr, separate tiårsstartpunkter, tjueårsfrist kun for medfødt gren og alle dokumenterte unntak.
- [ed99577218e2302b](receipt-ed99577218e2302b.json): nødvendige lovhjemlede merutgifter etter dekningsmessig skade, dokumentert finansiering, gulvarealforhold, dispensasjon og alle avgrensninger, inkludert utvendig-ledning/lekkasjeunntak.

[Opprinnelig fullmakt](authorization.md), [bindinger](authorization.json), [kildeorakel](source-oracle.json), [uavhengige forventninger](expected-catalog.mjs). Begge frosne vilkår er hashverifisert; Standard PDF5/18 og Pluss PDF5–6/19 er kontrollert. Ukjent ikrafttredelse og eksisterende kildemetadata er bevart. Ingen sourceType tilføyes registrert metadata. Pluss arver Standard-fakta.

[Navngitt tilleggsfullmakt](resume-authorization.json) og [rotregnskap](final-harness-roots.json): PLUS_PUBLIC_ORDER_PAGE_CONTINUATION var eneste rettede mekaniske rot. Kildeassertionen kontrollerer innledningen ved slutten av PDF5 og fortsettelsen på PDF6 frem til Råte og skadeinsekter; alle opprinnelige krav og originalhash bevares. [Sidebevis](source-continuation-blocker-proof.json) og [lukket blocker](blocker-resolution.json). Produksjon og øvrige kandidatfiler var uendret ved harnessrettingen.

[Ferske sluttgater](completion-validation-summary.json): {summary['new_gate']['pass']}/{summary['new_gate']['tests']} ny gate; {summary['targeted']['pass']}/{summary['targeted']['tests']} målrettede tester i24filer; {summary['fullsuite']['pass']}/{summary['fullsuite']['tests']} fullsuite i151filer; {summary['remediation']['pass']}/{summary['remediation']['tests']} komplett remediering i53filer. Typegen/TypeScript, ESLint0feil, webpack build og HTTP/PDF-runtime{summary['HTTP_PDF_runtime_checks']}/{summary['HTTP_PDF_runtime_checks']} PASS. [Eksakte kommandoer og loggidentiteter](final-gate-results.json), [fullmanifest](final-test-manifest.json), [remedieringsmanifest](final-remediation-manifest.json), [lintdifferanse](final-lint-difference.json):{lint['current_warnings']}warnings;{len(lint['new_warnings'])}nye/{len(lint['removed_warnings'])}fjernede. protectedCount-oppryddingen er urørt. Ingen Cloud-build-exception brukt.

Testet baseline `{identity['tested_baseline']}` med [final kandidatidentitet](final-application-identity.json); publiseringsrevisjonen følger av Git. Bare tre eksisterende Standard-rader er endret i produksjon. [Reverse-audit](catalog-delta.json) beviser317 andre komponenter,4155 andre råfakta,202 andre produkters effektive fakta og metadata uendret. B020-skadedyr og tidligere B051-rader er bevart. Dokumentprioritet, valg/avslag/konflikt, supporting terms, begge manuelle modi, gjentatt enrichment og begge sammenligningsretninger består.

[48 tidligere receipts](prior-receipts.json) og historiske auditpakker er byteidentiske. [Checkpoint](completion-checkpoint.json):51 unike dokumenterte signaturer; B05016, B071 ti CURRENT_REVALIDATION, B05125completions. [Eksakt B051-partisjon](completion-b051-partition.json):25/10/2/2. Globalt resolved/open UKJENT; ingen P2-kreditt. Historiske tellere, DEFER_SAFE og holds er uendret.

HARNESS_AUTONOMY_V1 er21/12 med ordinær grense12; scope1/6. Ingen fremtidig korreksjonskapasitet. [Planlagt kompatibilitetsarbeid](planned-test-updates.json) er forhåndsgodkjent og er ikke nye korrigeringsrøtter.

`python docs/audit/checkpoints/b051-recovery-benefits-69c71dc/verify.py` kontrollerer receipts, eksakte bindinger, kilder, historiske/initiale bytes, aktuelle logs/manifester, kandidatidentitet, checksums, dokumentlenker, filsett og begge diffkontroller. Publisering bruker etablert sikret publish.py. Ingen deploy eller senere produksjonsbolk.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
''')
(ROOT/'docs/development-agent/current-project-status.md').write_text(f'''# Aktuell dokumentert prosjektstatus

Aktuell bevispakke: [B-051 Naturskadeoppgjør, påbud og rullestoltilpasning — COMPLETE](../audit/checkpoints/b051-recovery-benefits-69c71dc/COMPLETION.md).
[Checkpoint](../audit/checkpoints/b051-recovery-benefits-69c71dc/completion-checkpoint.json), [kandidatidentitet](../audit/checkpoints/b051-recovery-benefits-69c71dc/final-application-identity.json), [ferske sluttgater](../audit/checkpoints/b051-recovery-benefits-69c71dc/completion-validation-summary.json).
Testet baseline `{identity['tested_baseline']}` med hash-identifisert autorisert kandidat. Publiseringsrevisjonen fremgår av Git; historisk closure-kjede er ikke rekonstruert.

**51 unike dokumenterte signaturer:** B05016, B071 ti CURRENT_REVALIDATION, B05125 individuelle completions. Alle48 tidligere receipts er byteidentiske. Globalt resolved/open **UKJENT**; historisk rapporterte414/1589 er ikke aktuelle verifiserte tall.
[B051s eksakte39-partisjon](../audit/checkpoints/b051-recovery-benefits-69c71dc/completion-b051-partition.json):25fullført,10kildeklare historiske preflightkandidater uten aktuelle receipts,2revalideringskandidater,2holds. Manglende receipt betyr ikke automatisk produksjonsfeil.

Fersk ny gate115/115; målrettede tester{summary['targeted']['pass']}/{summary['targeted']['tests']} i24filer; fullsuite{summary['fullsuite']['pass']}/{summary['fullsuite']['tests']} i151filer; komplett remediering{summary['remediation']['pass']}/{summary['remediation']['tests']} i53filer. Typegen/TypeScript PASS; ESLint0feil/{lint['current_warnings']}warnings; webpack build PASS; HTTP/PDF-runtime{summary['HTTP_PDF_runtime_checks']}/{summary['HTTP_PDF_runtime_checks']} PASS.
[Lintdifferanse](../audit/checkpoints/b051-recovery-benefits-69c71dc/final-lint-difference.json):{len(lint['new_warnings'])}nye/{len(lint['removed_warnings'])}fjernede warnings. protectedCount-oppryddingen er urørt. Ingen Cloud-build-unntak brukt.
317 øvrige komponenter,4155 øvrige råfakta, metadata og202 øvrige produkters effektive fakta er uendret. Pluss-arv, B020-skadedyr, dokumentprioritet, selection-status og tidligere B051-rader er bevart.

HARNESS_AUTONOMY_V1 **21/12**, denne bolken **1/6**. Én navngitt mekanisk rot PLUS_PUBLIC_ORDER_PAGE_CONTINUATION er ført under eksplisitt unntak. Ordinær grense12, historiske tellere og diagnostikkampanjens19/12 er uendret. Ingen fremtidig kapasitet. Planlagte testoppdateringer var uttrykkelig godkjent scopearbeid og belastes0.
[Forrige fullføring](../audit/checkpoints/b051-settlement-age-0bcd250/README.md) og [opprinnelig stoppunkt](../audit/checkpoints/b051-recovery-benefits-69c71dc/blocker.json) er bevart. Stoppunktet er [løst med ny fullmakt og fersk PASS](../audit/checkpoints/b051-recovery-benefits-69c71dc/blocker-resolution.json); gamle kandidatstatusfiler er historisk bevis.

Ingen videre produksjonsbolk er autorisert. Neste sikre steg er avgrenset read-only preflight av neste sammenhengende B051-bolk eller et eksplisitt revalideringsscope.
Bevar SC019/SR033/157c7afed18eb0fe, vannmapping25004bc4d7dd2c03, SC020/SR032, SC035/SR031, B0715f31ff4946a666b5 og øvrige checkpoint-holds. Ingen P2-kreditt eller deploy.

CATALOG_PILOT_GATE = REMEDIATION_REQUIRED
''')
print('Created three authorized current completions and51-signature checkpoint; global UNKNOWN; budget21/12 scope1/6.')
