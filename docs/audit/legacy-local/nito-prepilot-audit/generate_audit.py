import csv, json, os
from datetime import datetime, timezone

OUT='/tmp/nito-prepilot-audit'
os.makedirs(OUT, exist_ok=True)
HEAD='d3a37985fce4ada65fa2f7a88462d8834e4677af'
NOW=datetime.now(timezone.utc).isoformat()

security=[
 dict(finding_id='SEC-001',signature='shared-pilot-identity',severity='IMPORTANT',category='AUTHENTICATION',component='pilot access/session',evidence='lib/pilot-access.ts:3-66 and app/api/pilot-access/route.ts:15-39: one shared code creates an unsigned-user HMAC session for 12 hours; no logout or individual subject exists.',verified_or_inferred='TECHNICALLY_VERIFIED',scenario='A code or unlocked shared workstation gives indistinguishable access; one advisor cannot be revoked or attributed separately.',impact='Reduced accountability and offboarding; residual unauthorized-access risk.',remediation_direction='Before real data, adopt named identities or document a tightly controlled four-advisor model with dedicated devices, code distribution, whole-pilot revocation and browser-close procedure; add logout.',effort='LARGE',gpt6_review_recommended='true',pilot_blocking='false',validation_needed='Retest login, individual revocation, logout, session expiry, shared-workstation clearing and API authorization.'),
 dict(finding_id='SEC-002',signature='auth-rate-limit-unverified',severity='IMPORTANT',category='AUTHENTICATION',component='POST /api/pilot-access and POST /api/analyze',evidence='No application rate limiter is present. docs/pilot-security.md explicitly requires host/edge rate limiting; Railway configuration evidence was not available. Analysis admission only limits one active analysis per process.',verified_or_inferred='TECHNICALLY_VERIFIED_CODE; PRODUCTION_CONFIGURATION_UNKNOWN',scenario='Repeated code guesses or authenticated cost abuse are not throttled by application code; multi-replica limits would not be shared.',impact='Credential guessing, service exhaustion or AI cost exposure.',remediation_direction='Verify and document Railway/edge rate limits for login and analysis plus OpenAI budget alerts before real data.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Read-only configuration evidence and low-volume functional verification of limit headers/status.'),
 dict(finding_id='SEC-003',signature='security-headers-missing',severity='IMPORTANT',category='NETWORK',component='production HTTP responses',evidence='Safe production HEAD/GET on 2026-09-29 showed no Content-Security-Policy, frame-ancestors/X-Frame-Options, X-Content-Type-Options, Referrer-Policy or HSTS; next.config.ts only configures no-store for /api/analyze.',verified_or_inferred='PRODUCTION_VERIFIED',scenario='Authenticated pages can be framed and browser hardening relies on defaults; outbound source-link referrers are not explicitly minimized.',impact='Increased clickjacking/content-injection blast radius and metadata leakage.',remediation_direction='Add and production-verify CSP/frame protection, nosniff, strict referrer policy and appropriate HSTS/permissions policy.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Repeat safe production header inspection and framing/referrer tests.'),
 dict(finding_id='SEC-004',signature='external-retention-unverified',severity='IMPORTANT',category='DATA_LIFECYCLE',component='Railway/OpenAI/logging',evidence='Application uses memory-only request processing and store:false, but docs/pilot-security.md:42-49 states host log/temp retention, OpenAI data sharing/abuse retention/ZDR/MAM, region and DPA must be verified.',verified_or_inferred='TECHNICALLY_VERIFIED_LOCAL; VENDOR_STATE_UNKNOWN',scenario='Customer text or metadata may remain in vendor safety/access logs longer or in a region not approved for the pilot.',impact='Unknown deletion/retention and data-subject response obligations.',remediation_direction='Record vendor configuration, retention, regions, subprocessors and deletion/escalation paths before real data.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Manual vendor-console/contract review without exposing secrets.'),
 dict(finding_id='SEC-005',signature='privacy-governance-pack-missing',severity='IMPORTANT',category='PRIVACY_DOCUMENTATION',component='pilot governance',evidence='Repo contains technical security notes but no dedicated privacy notice, approved retention/deletion policy, processing record, incident procedure, DPA evidence or DPIA screening approval.',verified_or_inferred='TECHNICALLY_VERIFIED_REPOSITORY; LEGAL_REVIEW_REQUIRED',scenario='Advisors process real documents without a documented controller/processor model, notice, incident route or deletion responsibility.',impact='Uncontrolled organizational handling even if request processing is technically ephemeral.',remediation_direction='Complete the pre-pilot document pack and legal/organizational approvals listed in legal-organizational-review.md.',effort='MEDIUM',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Named owner sign-off and document review before first real customer.'),
 dict(finding_id='SEC-006',signature='ai-minimization-best-effort',severity='IMPORTANT',category='AI_BOUNDARY',component='document redaction/model input',evidence='lib/document-redaction.ts applies deterministic regex redaction, then lib/analysis-batching.ts sends the full bounded extracted text for each accepted document to OpenAI. Tests cover common identifiers, not arbitrary names, prose or special-category content.',verified_or_inferred='TECHNICALLY_VERIFIED',scenario='Unlabelled personal or sensitive prose not matched by the redactor is transmitted to the AI provider.',impact='More personal data may reach a processor than the UI wording "relevant, maskert tekst" may suggest.',remediation_direction='Use strict pilot input scope, accurate notice, vendor controls and a redaction/minimization review; exclude person-insurance documents.',effort='MEDIUM',gpt6_review_recommended='true',pilot_blocking='false',validation_needed='Synthetic redaction corpus, outbound-marker test and legal/vendor review.'),
 dict(finding_id='SEC-007',signature='temporary-trace-code-retained',severity='POLISH',category='LOGGING',component='production trace endpoint/instrumentation',evidence='app/api/analysis-trace/route.ts and production trace modules remain deployed; Railway PILOT_TRACE_ENABLED was read-only verified false and the endpoint returns 404 while off.',verified_or_inferred='PRODUCTION_VERIFIED_OFF',scenario='A future configuration change can activate extensive structural diagnostics.',impact='Low while off; operational drift can expand logging.',remediation_direction='Remove temporary instrumentation when diagnostics are finished or add explicit change-control/expiry ownership.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Verify route remains 404/off or code is removed after controlled validation.'),
 dict(finding_id='SEC-008',signature='framework-disclosure-header',severity='POLISH',category='NETWORK',component='production responses',evidence='Production responses include X-Powered-By: Next.js.',verified_or_inferred='PRODUCTION_VERIFIED',scenario='Framework identity marginally improves attacker reconnaissance.',impact='Low standalone impact.',remediation_direction='Disable powered-by header when security headers are added.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Production header check.'),
 dict(finding_id='SEC-009',signature='dependency-process-undocumented',severity='POLISH',category='DEPENDENCIES',component='dependency governance',evidence='npm audit --omit=dev on 2026-09-29 reported 0 vulnerabilities across 476 total packages, but no documented recurring advisory/update process exists.',verified_or_inferred='TECHNICALLY_VERIFIED_POINT_IN_TIME',scenario='New advisories may remain unnoticed after this audit.',impact='Security posture can decay over time.',remediation_direction='Assign a lightweight recurring dependency/advisory review and record the audit date.',effort='SMALL',gpt6_review_recommended='false',pilot_blocking='false',validation_needed='Evidence of scheduled review and triage ownership.'),
]

product=[
 dict(finding_id='PROD-001',severity='IMPORTANT',workflow='pilot access / cross-customer',screen_component='global session and main page',evidence='No logout control exists; session lasts 12 hours and is shared-identity. React customer state remains until inputs change, reload or tab close.',advisor_impact='Shared workstations can retain access and the prior result; advisors lack an explicit end-of-case action.',reproduction='Login locally, complete/inspect state, observe no logout or dedicated Clear all/End customer case control.',remediation_direction='Add explicit logout and one-step clear/new-customer action; document browser-close procedure until delivered.',effort='MEDIUM',pilot_blocking='false',signature='shared-pilot-identity'),
 dict(finding_id='PROD-002',severity='IMPORTANT',workflow='onboarding/privacy',screen_component='login and app shell',evidence='Upload UI gives concise AI/data text, but login/main pages have no privacy notice link, controller/contact, retention link or incident contact.',advisor_impact='Advisor cannot answer a customer or internal question about ownership, rights, retention or escalation from the product.',reproduction='Open /pilot-access and authenticated empty state; inspect visible links/text.',remediation_direction='Provide reviewed pilot privacy information and named support/privacy route.',effort='SMALL',pilot_blocking='false',signature='privacy-governance-pack-missing'),
 dict(finding_id='PROD-003',severity='IMPORTANT',workflow='pilot operations',screen_component='documentation/onboarding',evidence='No advisor quick-start, known-limitations handout, incident-versus-feedback guide or pilot stop process was found.',advisor_impact='A capable advisor can understand the core UI, but safe independent handling of errors/incidents depends on developer knowledge.',reproduction='Review docs inventory and UI navigation.',remediation_direction='Create a 10–20 minute quick guide and operating guide with stop conditions and support owner.',effort='SMALL',pilot_blocking='false',signature='pilot-operating-guide-missing'),
 dict(finding_id='PROD-004',severity='IMPORTANT',workflow='feedback/support',screen_component='application-wide',evidence='No feedback widget, submission endpoint or feedback storage exists in app/lib; no documented external feedback process exists.',advisor_impact='Advisors cannot consistently distinguish ordinary feedback, correctness bugs and privacy/security incidents.',reproduction='Search routes/components for feedback and walk local UI.',remediation_direction='Define a privacy-minimizing external or in-product feedback path and separate incident escalation.',effort='SMALL',pilot_blocking='false',signature='feedback-workflow-missing'),
 dict(finding_id='PROD-005',severity='IMPORTANT',workflow='browser compatibility',screen_component='Safari',evidence='Chrome/local semantic smoke and responsive automated checks exist; this audit did not perform a real Safari end-to-end smoke.',advisor_impact='Safari-specific upload, details/summary or streaming issues could surprise an advisor.',reproduction='Manual Safari run is outstanding.',remediation_direction='Complete the checklist Safari smoke with synthetic data before assigning Safari users.',effort='SMALL',pilot_blocking='false',signature='safari-not-verified'),
 dict(finding_id='PROD-006',severity='IMPORTANT',workflow='result interpretation',screen_component='coverage status/detailed comparison',evidence='UI repeatedly displays "Ikke dokumentert" but no global in-product explanation says this is not the same as "ikke dekket"; source-origin labels are otherwise strong.',advisor_impact='Advisor may overinterpret uncertainty as absence of cover.',reproduction='Inspect empty/result copy and exact phrase search in app components.',remediation_direction='Add concise result-level explanation and include it in advisor guide without changing comparison semantics.',effort='SMALL',pilot_blocking='false',signature='undocumented-status-explanation'),
 dict(finding_id='PROD-007',severity='IMPORTANT',workflow='new customer / recovery',screen_component='comparison workspace',evidence='Changing files/modes clears results and aborts work, but there is no single explicit reset of files, manual objects, result, source panels and errors.',advisor_impact='End-of-case hygiene is less obvious and previous-customer state can remain visible.',reproduction='Use agreement workspace; observe input mutations clear result but no Clear all control.',remediation_direction='Add an explicit new-customer/reset action and verify tab/back/refresh behavior.',effort='SMALL',pilot_blocking='false',signature='full-customer-reset-not-explicit'),
 dict(finding_id='PROD-008',severity='POLISH',workflow='error handling',screen_component='404 page',evidence='Production /robots.txt returns the generic English Next.js 404 page; it leaks no customer data.',advisor_impact='Unbranded English fallback is less professional but does not block workflow.',reproduction='Safe GET /robots.txt.',remediation_direction='Add branded localized not-found handling if useful.',effort='SMALL',pilot_blocking='false',signature='generic-404-polish'),
 dict(finding_id='PROD-009',severity='POLISH',workflow='pilot login',screen_component='/pilot-access',evidence='Login is clear and keyboard-native, but it does not display session duration, logout expectation or support contact.',advisor_impact='Minor uncertainty about access lifecycle and help route.',reproduction='Open fresh /pilot-access.',remediation_direction='Add concise operational copy after authentication model is decided.',effort='SMALL',pilot_blocking='false',signature='login-lifecycle-copy'),
]

data_inventory=[
 ['Uploaded customer PDF','CUSTOMER_PERSONAL','advisor browser','insurance comparison','browser then Node server memory/worker','memory only; no repository/database write found','none for original PDF','request/tab lifetime; vendor proxy buffering UNKNOWN','advisor session; hosting operator access UNKNOWN','release on request completion/error; browser clears on input/reload/tab close','app/page.tsx:137-153; preparePdf/readPdf','gateway buffering/log policy unknown'],
 ['Extracted PDF text','CUSTOMER_PERSONAL','PDF parser worker','AI extraction','Node memory','request-local memory','OpenAI after deterministic masking','request lifetime locally; OpenAI retention UNKNOWN','server process and OpenAI','references released after request; provider deletion UNKNOWN','pdf-analysis-pipeline.ts; analysis-batching.ts','unlabelled sensitive prose may survive masking'],
 ['Redacted model input','CUSTOMER_PERSONAL','document redactor','structured extraction','Node memory','request-local memory','OpenAI','request lifetime; provider retention UNKNOWN','server/OpenAI','local release; provider deletion UNKNOWN','document-redaction.ts; store:false','best-effort redaction, full bounded text'],
 ['Model output','CUSTOMER_PERSONAL','OpenAI','normalize/compare','Node memory then browser','browser memory/result DOM','OpenAI generated/returned','request plus current browser state; provider safety retention UNKNOWN','current browser session/server during request','input changes/reload/tab close; no server persistence found','analysis-output.ts validation/sanitize','no explicit user clear-all'],
 ['Normalized facts and comparison result','CUSTOMER_PERSONAL','model/manual input','advisor decision support','Node request and React state','browser memory only','none after response','until state change/reload/tab close','current advisor browser','implicit state reset only','app/page.tsx:53-170','no download/database found'],
 ['Manual agreement fields','CUSTOMER_PERSONAL','advisor','comparison','browser and POST body/server memory','browser React state','none unless hybrid triggers AI only for PDF side','tab/request lifetime','current browser/session','input change/reload/tab close','app/page.tsx:57-60,137-153','same reset limitation'],
 ['Secure object identifiers','CUSTOMER_PERSONAL','customer PDF/model output','object matching','request/browser result','memory only','OpenAI may receive masked/extracted context; parsed IDs returned to browser','request/tab lifetime; provider retention UNKNOWN','current advisor/browser; provider','implicit release/reset','analysis-output schema; object matching tests','raw identifiers not telemetry-logged'],
 ['Session cookie','SECRET','server login','pilot authentication','browser cookie/server verification','HttpOnly Secure SameSite=Strict cookie','none','12 hours','browser holder/server','expiry or session-secret rotation; no logout','pilot-access.ts','no per-user revocation'],
 ['Analysis metrics','INTERNAL','server','performance/operations','Railway stdout logs','deployment logs','Railway','Railway retention UNKNOWN','operators UNKNOWN','vendor/configuration UNKNOWN','analysis-telemetry.ts','retention/access policy missing'],
 ['Production trace events','INTERNAL','server/browser structural projections','temporary diagnostics','Railway stdout logs when enabled','deployment logs','Railway','currently OFF; historical retention UNKNOWN','operators UNKNOWN','vendor/configuration UNKNOWN','production-trace*.ts; Railway false','code remains deployable'],
 ['Public catalog/source artifacts','PUBLIC','official insurers','catalog evidence','repo/build/client bundle or external links','Git/repo/build','GitHub; provider sites on explicit source click','version controlled','developers/advisors/public providers','Git history/change control','catalog/sources; source manifests','not customer data'],
 ['Secrets/API keys','SECRET','Railway variables','auth/AI','server environment','Railway secret store','Railway/OpenAI','until rotated','Railway-authorized operators UNKNOWN','rotation/manual','process.env use; 4 hidden variables observed','least-privilege/owner verification required'],
 ['Feedback text/screenshots','CUSTOMER_SENSITIVE','not implemented','pilot feedback','NOT_APPLICABLE','none found','none found','NOT_APPLICABLE','NOT_APPLICABLE','NOT_APPLICABLE','route/component search','external process must be defined'],
]

endpoints=[
 ['/', 'GET','main application','yes','shared signed session','yes in browser result only','no','n/a GET; proxy auth','public static page behind proxy; response header behavior depends route','sensitive after auth','SEC-001;PROD-001'],
 ['/pilot-access','GET','pilot login','no','n/a','no','no','n/a','public static cache','low','SEC-003;PROD-002'],
 ['/api/pilot-access','POST','exchange shared code for session','no prior session','same-origin + shared code','secret candidate only','no','JSON/type/maxLength via verifier; no confirmed rate limit','private no-store','authentication','SEC-001;SEC-002'],
 ['/api/analyze','POST','manual/PDF analysis','yes','shared signed session + same-origin','yes','OpenAI for PDF/semantic','strict form fields, 25 MiB aggregate, file/page/text/product/time/concurrency/schema limits; no confirmed edge rate limit','private no-store; streaming no-store','high','SEC-002;SEC-004;SEC-006'],
 ['/api/analysis-trace','POST','temporary structural client receipt','yes and runtime flag','session + same-origin + signed ticket','structural metadata only by schema','no','256 KiB/256 events/5s/closed schema/replay map','private no-store','internal diagnostics','SEC-007'],
]

external_services=[
 ['Railway','hosting/runtime, TLS, deployment and logs','YES transiently in runtime; log content designed structural only','server','yes','production UI shows service Online/ACTIVE; runtime headers railway-hikari','REVIEW_REQUIRED','REVIEW_REQUIRED','Access, buffering, backups, log/temp retention and region require organizational/vendor verification.'],
 ['OpenAI API','PDF text extraction and bounded semantic fallback','YES: masked extracted text and candidate labels/values','server','yes','openai SDK; Responses API; model gpt-5.6-luna; store:false; maxRetries:0','REVIEW_REQUIRED','REVIEW_REQUIRED','DPA, data sharing, abuse retention/ZDR/MAM, region and subprocessors not provable from code.'],
 ['GitHub','source control and Railway deployment trigger','NO customer data intended','server/operator','yes/unknown','origin remote and Railway deployment via GitHub','REVIEW_REQUIRED','NOT_APPLICABLE for customer path','Repository access rights require organizational verification.'],
 ['Official insurer websites','opened by advisor through explicit source links','NO customer payload intended; browser may send referrer origin','client','no','static catalog URLs; target=_blank rel=noopener noreferrer','NOT_APPLICABLE','NOT_APPLICABLE','No runtime server fetch; missing global Referrer-Policy is still a header finding.'],
 ['Analytics/feedback/monitoring vendor','not found','NO','not used','no','no SDK/routes/config found','NOT_APPLICABLE','NOT_APPLICABLE','Railway platform logs remain separate.'],
]

access_rows=[
 ['Unauthenticated internet user','NO (login page only)','NO','NO','NO','NO','NO','NO','NO','NO'],
 ['Pilot advisor with shared code','YES','YES','YES','YES','NO persistent cross-user store found','NOT_APPLICABLE','NO','NO','NO'],
 ['Other pilot advisor','YES with same shared code','YES','YES','Own browser state; no server result store','No direct route; shared workstation/session risk','NOT_APPLICABLE','NO','NO','NO'],
 ['Developer/operator','UNKNOWN organizationally','UNKNOWN','UNKNOWN','No application database; logs may contain structural metadata','NOT_APPLICABLE','UNKNOWN','YES/UNKNOWN','YES/UNKNOWN','YES/UNKNOWN'],
 ['Railway platform/operator','Infrastructure-level UNKNOWN','Infrastructure-level UNKNOWN','Infrastructure-level UNKNOWN','Transient runtime access UNKNOWN','NOT_APPLICABLE','YES/UNKNOWN','YES','YES/UNKNOWN','YES/UNKNOWN'],
 ['OpenAI provider','NO app UI','NO','Receives server request only','Receives masked extracted text/candidates','NO browser/result store access','NO Railway logs','NO','NO','API processing credentials only'],
]

positive_controls=[
 'Authenticated analysis route checks session before body parsing', 'Same-origin enforced on login, analysis and trace receipt',
 'HttpOnly Secure SameSite=Strict signed cookie with 12-hour expiry', 'PDF count/size/signature/page/text/job/product limits and worker timeout',
 'Original PDF and original filename are not sent to OpenAI', 'OpenAI store:false, maxRetries:0 and SDK logging off',
 'Strict model schemas plus trusted runtime validation', 'Prompt/document separation and tested prompt-injection instructions',
 'No customer database/object store/static write found', 'No localStorage/sessionStorage/indexedDB use found',
 'No-store analysis responses and unauthenticated 401 verified in production', 'Telemetry/trace use closed structural allowlists and trace is production OFF',
 'Request-local references/concurrency tests prevent cross-request fact leakage', 'React rendering avoids dangerous raw HTML; source links use noopener/noreferrer',
 '1996 tests, TypeScript, ESLint, webpack build and synthetic HTTP/PDF runtime passed', 'npm production dependency audit reported zero known advisories at audit time',
 'Customer facts take precedence over catalog and catalog/source artifacts are versioned/hash-tested', 'UI explains masked OpenAI transfer, no database, minimization and human verification',
 'Product mode is local and explicitly excludes customer documents, price and individual choices', 'Production Railway deployment is ACTIVE, app online, trace false'
]

flows={
 'pdf_comparison':['Browser holds selected PDF File objects','Authenticated multipart POST /api/analyze','Server validates request/form/file limits and PDF signature','Worker parses PDF bytes in memory','Deterministic redactor masks common identifiers and batches extracted text','OpenAI Responses API receives masked bounded text with store:false','Strict schema/runtime validation, normalization, supporting attachment, consolidation and catalog enrichment','Optional bounded semantic fallback via same OpenAI model','Sanitized result and privacy-safe progress returned no-store','React holds result until input change/reload/tab close; structural metrics go to Railway logs'],
 'manual_comparison':['Browser React state validates canonical/manual fields','Authenticated multipart POST carries JSON manual agreement','Server validates/normalizes and catalog-enriches exact identities','Comparison returned no-store; no OpenAI call for manual-only'],
 'hybrid_comparison':['One side follows PDF path; other follows manual path','Both normalized results enter shared matching/comparison','Only PDF text crosses AI boundary'],
 'product_comparison':['Static client catalog selection','Local deterministic catalog comparison/presentation','No customer input, PDF, AI or provider runtime fetch'],
 'feedback':['No implemented widget, endpoint or storage discovered'],
 'authentication':['Public login page','Same-origin POST with shared code','Constant-time digest comparison','HMAC-signed HttpOnly cookie','Protected root/API checks cookie; no individual identity/logout']
}

go_no_go=[
 ['Security','PASS_WITH_ACTIONS','No','Verify rate limits and add headers','Technical owner','SEC-002/003'],
 ['Authentication','CONTROLLED_ONLY','No','Accept shared-code controls or implement named identities/logout','Security/product owner','SEC-001'],
 ['Authorization','PARTIAL','No','Document shared identity and access/offboarding','Security owner','SEC-001'],
 ['Data lifecycle','PARTIALLY_UNDERSTOOD','No','Verify vendor/log/temp retention and deletion','Privacy/technical owner','SEC-004'],
 ['Logging','SAFE_TESTED_PATHS','No','Document Railway retention/access; keep trace off','Operations/privacy','SEC-004/007'],
 ['AI boundary','PASS_WITH_ACTIONS','No','Vendor/DPA/region and minimization review','Privacy/legal/technical','SEC-004/006'],
 ['File upload','ADEQUATE_FOR_PILOT','No','Confirm gateway body limit','Operations','positive controls'],
 ['Feedback','PROCESS_REQUIRED','No','Define privacy-safe feedback and incident channel','Pilot owner','PROD-004'],
 ['Infrastructure','PASS_WITH_ACTIONS','No','Confirm access, limits, backup/log behavior','Operations','SEC-002/004'],
 ['GDPR documentation','ACTION_REQUIRED','No','Complete reviewed document pack before real data','Privacy/legal','SEC-005'],
 ['DPA/vendors','MISSING_OR_UNVERIFIED','No','Review/record Railway and OpenAI agreements','Legal/procurement','SEC-004/005'],
 ['DPIA','RECOMMENDED','No','Have privacy/legal owner review screening','Privacy/legal','screening'],
 ['Product UX','READY_WITH_GUIDE','No','Quick guide, reset/logout, status explanation','Product owner','PROD-001/003/006/007'],
 ['Accessibility','ADEQUATE_FOR_PILOT','No','Manual screen-reader/Safari check','Product/QA','PROD-005'],
 ['Safari','MANUAL_SMOKE_REQUIRED','No','Synthetic Safari smoke','QA','PROD-005'],
 ['Operations','PROCESS_REQUIRED','No','Assign owners, incidents, stop conditions, change control','Pilot owner','SEC-005/PROD-003'],
 ['Person insurance','NOT_READY','Yes for person-insurance only','Separate health-data architecture/legal/privacy gate','Privacy/security/legal','SEC-006'],
]

audit={
 'metadata':{'audit':'NITO PRE-PILOT SECURITY, GDPR & PRODUCT READINESS AUDIT','timestamp_utc':NOW,'read_only':True,'real_customer_data_used':False,'formal_penetration_test':False,'legal_advice':False,'auditor_mode':'technical review and safe synthetic verification'},
 'version':{'branch':'main','head':HEAD,'commit_message':'Add source-backed boat and pet insurance pipelines','working_tree':'clean','local_equals_origin_main':True,'node':'v24.21.0','npm':'11.19.0','production_deployment':'ACTIVE / Deployment successful','production_online':True,'production_trace_enabled':False},
 'baseline':{'tests':'1996/1996 pass','typescript':'pass after production build regeneration','eslint':'pass','webpack_build':'pass','synthetic_http_pdf_runtime':'pass','product_comparison_runtime':'pass','catalog_products':204,'catalog_addons':84,'product_comparison_eligible':202,'insurance_families':12,'source_artifacts':329},
 'gate':{'nito_pilot_gate':'READY_WITH_ACTIONS','security_gate':'PASS_WITH_ACTIONS','gdpr_readiness':'READY_AFTER_DOCUMENTATION_ACTIONS','product_gate':'PILOT_READY','person_insurance_privacy_gate':'NOT_READY','real_data_condition':'Do not start real-customer processing until the mandatory checklist actions are signed off.'},
 'results':{'prompt_injection':'PARTIAL_DEFENSE','file_upload':'ADEQUATE_FOR_PILOT','auth':'ADEQUATE_ONLY_WITH_CONTROLS','user_isolation':'PARTIAL','data_lifecycle':'PARTIALLY_UNDERSTOOD','logging':'PRIVACY_SAFE_FOR_TESTED_PATHS','feedback_privacy':'NOT_APPLICABLE','dependency':'NO_MATERIAL_KNOWN_FINDING','product_independence':'ADVISOR_CAN_USE_WITH_QUICK_GUIDE','safari':'MANUAL_SMOKE_REQUIRED','accessibility':'ADEQUATE_FOR_PILOT','incident_readiness':'PROCESS_REQUIRED','privacy_documentation':'ACTION_REQUIRED','dpa':'MISSING_OR_UNVERIFIED','dpia_screening':'RECOMMENDED'},
 'threat_model':{'assets':['customer PDFs','extracted facts/model input/output','comparison results','session','API credentials','public catalog/source data','application configuration'],'actors':['authorized advisor','unauthorized internet user','another pilot advisor','malicious uploaded document','compromised browser/session','accidental internal disclosure'],'trust_boundaries':['browser ↔ Railway/Next.js','Next.js ↔ PDF worker','Next.js ↔ OpenAI','runtime ↔ Railway logs/config','advisor ↔ official provider source sites']},
 'data_flows':flows,'data_inventory':data_inventory,'endpoint_inventory':endpoints,'external_services':external_services,'access_matrix':access_rows,
 'storage':{'database':'none found','object_storage':'none found','temporary_files':'none used for customer PDFs in application code','server_memory':'request-local PDF/text/facts','browser_memory':'File objects/manual data/results in React state','logs':'privacy-safe metrics always; trace structural and currently off','external_ai':'masked text/candidates; retention contract/config unknown'},
 'logging':{'metrics':'ANALYSIS_METRICS fixed/numeric metadata','errors':'ANALYSE_FEIL allowlisted IDs/status/category','trace':'ANALYSIS_TRACE strict schemas; production flag false','raw_body_or_filename_logging_found':False,'host_retention':'UNKNOWN'},
 'authentication':{'model':'shared pilot code; no persistent user identity','session':'HMAC cookie, HttpOnly, Secure in production, SameSite Strict, 12h','logout':False,'individual_revocation':False,'secret_rotation':'session secret rotation invalidates all; access-code change alone does not invalidate existing sessions'},
 'file_upload':{'files_per_side':10,'file_bytes':10485760,'request_bytes':26214400,'pages_per_file':150,'pages_per_side':250,'job_pages':400,'text_chars_per_file':500000,'text_chars_per_side':750000,'mime_signature':'extension/MIME plus %PDF- signature','parser':'isolated worker, 45s timeout','malformed_encrypted_textless':'controlled 422'},
 'ai_boundary':{'provider':'OpenAI','model':'gpt-5.6-luna','original_pdf_sent':False,'input':'bounded extracted text after deterministic masking; semantic candidates if unresolved','store':False,'retries':0,'extraction_timeout_ms':90000,'semantic_timeout_ms':45000,'schema':'strict JSON schema plus runtime validation'},
 'findings':{'security':security,'product':product,'total_rows':len(security)+len(product),'severity_counts':{'BLOCKER':0,'IMPORTANT':sum(x['severity']=='IMPORTANT' for x in security+product),'POLISH':sum(x['severity']=='POLISH' for x in security+product)},'deduplicated_signatures':sorted(set(x['signature'] for x in security+product))},
 'positive_controls':positive_controls,'go_no_go':go_no_go,
 'gdpr_readiness':{'technical':'Memory-only application processing is well bounded and tested; external/service retention is not fully known.','legal_basis':'LEGAL REVIEW REQUIRED for PDF/manual processing, AI transfer, operational logs and any feedback process.','controller_processor_roles':'ORGANIZATIONAL/LEGAL DECISION REQUIRED','rights':'Ephemeral app data limits local retrieval; logs/vendor data and deletion path require documentation.','privacy_notice':'Missing reviewed notice/link.','processing_record':'Partial technical material only.','international_transfers':'Vendor review required.'},
 'dpia_screening':{'classification':'RECOMMENDED','reason':'New AI-assisted processing of financial/insurance documents, possible sensitive incidental content and potential customer impact; small controlled skadeforsikring pilot reduces scale but does not remove screening need. Legal/privacy owner must decide.'},
 'person_insurance':{'gate':'NOT_READY','reasons':['health/special-category text can enter current generic parser','redaction is not a health-data filter','individual accountability and vendor/legal controls are not complete','separate DPIA/legal basis/notice/access/retention design required']},
 'manual_review_counts':{'security_findings':len(security),'product_findings':len(product),'positive_controls':len(positive_controls),'blockers_reviewed':0,'important_findings_reviewed':sum(x['severity']=='IMPORTANT' for x in security+product),'no_finding_areas_reviewed':12},
 'limitations':['Not a formal penetration test','Not legal advice or GDPR certification','No real customer data used','No destructive production testing','Organizational access and permissions require manual verification','Vendor contractual terms/retention require manual verification','Safari and screen-reader end-to-end smoke remain manual','Security advisories change over time','Independent advisor usability was simulated technically, not observed with four actual advisors'],
}

# Keep the machine-readable report aligned with the complete audit contract. These
# sections repeat selected conclusions intentionally so downstream reviewers do not
# have to infer them from prose or from neighbouring objects.
audit.update({
 'authorization':{
   'model':'Any holder of the shared pilot code receives the same advisor capability.',
   'per_user_roles':False,
   'cross_request_state':'No shared customer store found; request-local isolation is regression-tested.',
   'assessment':'PARTIAL'
 },
 'prompt_injection':{
   'assessment':'PARTIAL_DEFENSE',
   'controls':['document text is explicitly untrusted','no model tools','strict schema','runtime validation','bounded input'],
   'residual_risk':'Prompt-like PDF content still reaches the model as data; deterministic masking and schema validation reduce but do not eliminate model-manipulation risk.'
 },
 'client_security':{
   'react_escaping':True,
   'dangerously_set_inner_html_found':False,
   'customer_browser_persistence_found':False,
   'source_link_protection':'noopener/noreferrer',
   'assessment':'ADEQUATE_FOR_CONTROLLED_PILOT'
 },
 'network_security_headers':{
   'https_verified':True,
   'analysis_no_store_verified':True,
   'missing_in_observed_response':['Content-Security-Policy/frame-ancestors','X-Content-Type-Options','Referrer-Policy','Strict-Transport-Security'],
   'framework_disclosure':'X-Powered-By: Next.js observed',
   'assessment':'ACTION_REQUIRED'
 },
 'dependencies':{
   'production_audit':'0 known vulnerabilities at audit time',
   'counts':{'production':23,'development':383,'optional':121,'total':476},
   'assessment':'NO_MATERIAL_KNOWN_FINDING',
   'caveat':'Point-in-time result; establish recurring ownership and review.'
 },
 'feedback':{
   'in_app_collection_found':False,
   'endpoint_or_store_found':False,
   'assessment':'NOT_APPLICABLE',
   'action':'Create a privacy-safe organizational feedback and incident route before pilot.'
 },
 'retention_deletion':{
   'application_database':'none found',
   'browser':'until input replacement, reload or tab close',
   'server':'request-local memory',
   'railway_logs':'UNKNOWN',
   'openai':'UNKNOWN pending contract/config review',
   'assessment':'PARTIALLY_UNDERSTOOD'
 },
 'product_readiness':{
   'gate':'PILOT_READY',
   'scope':'Controlled advisor pilot for supported skadeforsikring products only.',
   'catalog':{'products':204,'addons':84,'eligible_products':202,'families':12},
   'actions':['advisor quick guide','explain Ikke dokumentert','feedback/escalation route','explicit new-customer/reset procedure']
 },
 'accessibility':{
   'assessment':'ADEQUATE_FOR_PILOT',
   'evidence':['native controls and labels inspected','keyboard flows tested in existing suite','390 px layout checked'],
   'remaining':'Manual screen-reader smoke with target advisor setup.'
 },
 'safari_manual_requirements':{
   'assessment':'MANUAL_SMOKE_REQUIRED',
   'requirements':['login/session cookie','PDF chooser','manual flow','product comparison','details/source controls','reload/reset','390 px or target device']
 },
 'legal_review_queue':[
   'controller/processor roles and legal basis',
   'privacy notice and rights handling',
   'Railway/OpenAI DPA, subprocessors, retention, region and transfers',
   'DPIA screening decision',
   'separate person-insurance special-category assessment'
 ],
 'organizational_review_queue':[
   'named pilot, security, privacy and support owners',
   'shared-code distribution, offboarding and workstation procedure',
   'edge rate/body limits and platform log access/retention',
   'incident, vendor-incident and stop-process ownership',
   'feedback triage and advisor change communication'
 ],
 'pilot_gate_decision':{
   'decision':'READY_WITH_ACTIONS',
   'mandatory_condition':'Complete and sign off the mandatory checklist before processing real customer data.',
   'excluded':'Person insurance, public consumer use, automated advice/sale and unsupported products.'
 }
})

with open(f'{OUT}/nito-prepilot-audit.json','w',encoding='utf-8') as f: json.dump(audit,f,ensure_ascii=False,indent=2)

def write_csv(name,fields,rows):
    with open(f'{OUT}/{name}','w',encoding='utf-8',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(rows)
write_csv('security-findings.csv',['finding_id','signature','severity','category','component','evidence','verified_or_inferred','scenario','impact','remediation_direction','effort','gpt6_review_recommended','pilot_blocking','validation_needed'],security)
write_csv('product-readiness-findings.csv',['finding_id','severity','workflow','screen/component','evidence','advisor_impact','reproduction','remediation_direction','effort','pilot_blocking'],[{**{k:v for k,v in x.items() if k not in ('signature','screen_component')},'screen/component':x['screen_component']} for x in product])

def rows_csv(name,fields,rows):
    with open(f'{OUT}/{name}','w',encoding='utf-8',newline='') as f:
        w=csv.writer(f);w.writerow(fields);w.writerows(rows)
rows_csv('data-inventory.csv',['data_category','classification','source','purpose','processing_location','storage','external_recipient','retention','access','deletion','evidence','gap'],data_inventory)
rows_csv('endpoint-inventory.csv',['route','method','purpose','auth_required','authorization','customer_data','external_calls','input_validation','rate_limit','cache_behavior','response_sensitivity','finding_refs'],[[*r[:8],'unverified/none' if r[0] in ['/api/pilot-access','/api/analyze'] else 'not applicable',*r[8:]] for r in endpoints])
rows_csv('external-services.csv',['service','purpose','customer_data_sent','server_or_client','secret_required','technical_evidence','dpa_review','transfer_review','notes'],external_services)
rows_csv('access-matrix.csv',['actor','can_access_app','can_upload','can_analyze','can_see_own_result','can_see_other_users_result','can_see_feedback','can_see_logs','can_deploy','can_read_secrets'],access_rows)

sev=audit['findings']['severity_counts']
md=f'''# NITO pre-pilot security, GDPR & product readiness audit

## EXECUTIVE SUMMARY

**Versjon:** `{HEAD}` (`main`, clean, identisk med `origin/main`). **Produksjon:** Railway ACTIVE / Deployment successful, app online, tracing OFF.

Fire rådgivere kan teknisk bruke appen samtidig fordi kundeanalyse og objektreferanser er request-lokale, det finnes ingen kundedatabase og concurrency-/isolasjonsregresjonene består. Dagens delte pilotkode gir likevel ingen individuell identitet, revokering eller hendelsesattribusjon. Løsningen er derfor egnet bare som en stramt kontrollert fire-rådgiverpilot med eksplisitte operasjonelle kontroller.

Skadeforsikringsdokumenter kan behandles først etter at obligatoriske før-pilot-tiltak er godkjent: edge-rate-limit, vendor/DPA/retention/region, personverninformasjon, hendelses-/sletteprosess, tilgangseiere og Safari-smoke. Den lokale dataflyten er forstått og hovedsakelig ephemeral; Railway/OpenAI-retention er ikke teknisk bevist. Ingen teknisk kundedatalekkasje ble funnet i testede baner. Personforsikring er **ikke klar**.

## VERSION / SCOPE

- Audit: read-only, 2026-09-29; ingen ekte kundedata, ingen repo-/Railway-endring.
- Commit: `{HEAD}` – Add source-backed boat and pet insurance pipelines.
- Node v24.21.0, npm 11.19.0.
- Faktisk katalog: 204 produkter, 84 tillegg, 202 produktmodus-eligible, 12 familier, 329 source artifacts.
- Verifikasjon: 1996/1996 tester, TypeScript, ESLint, webpack build, syntetisk HTTP/PDF-runtime og produktmodus-runtime PASS.

## OVERALL PILOT GATE

| Gate | Resultat |
|---|---|
| NITO_PILOT_GATE | **READY_WITH_ACTIONS** |
| SECURITY_GATE | **PASS_WITH_ACTIONS** |
| GDPR_READINESS | **READY_AFTER_DOCUMENTATION_ACTIONS** |
| PRODUCT_GATE | **PILOT_READY** |
| PERSON_INSURANCE_PRIVACY_GATE | **NOT_READY** |

**Vilkår:** Ikke start behandling av ekte kundedata før alle obligatoriske bokser i `pilot-manual-checklist.md` er godkjent av navngitte tekniske, organisatoriske og juridiske/personvernansvarlige.

## BLOCKERS

Ingen teknisk skadeforsikrings-blocker ble bevist i de testede banene. Personforsikring har egen blokkert gate. Manglende før-pilot-avklaringer er bindende actions, ikke påståtte juridiske konklusjoner.

## IMPORTANT FINDINGS

{chr(10).join(f'- **{x["finding_id"]} · {x["category"] if "category" in x else x["workflow"]}:** {x["impact"] if "impact" in x else x["advisor_impact"]}' for x in security+product if x['severity']=='IMPORTANT')}

## POLISH

{chr(10).join(f'- **{x["finding_id"]}:** {x["impact"] if "impact" in x else x["advisor_impact"]}' for x in security+product if x['severity']=='POLISH')}

## THREAT MODEL

Assets: customer PDFs/facts/results, session, secrets, catalog/source data and configuration. Actors: authorized advisor, unauthorized internet user, another advisor, malicious document, compromised browser and accidental internal disclosure.

```mermaid
flowchart LR
  A[Advisor browser] -->|PDF/manual multipart + session| B[Railway / Next.js]
  B --> C[Isolated PDF worker]
  C --> D[Masking + bounded batching]
  D -->|masked extracted text, store:false| E[OpenAI boundary]
  E --> F[Strict validation / normalization / catalog]
  F -->|no-store result| A
  B -->|structural metrics/errors| G[Railway logs]
  A -->|explicit source click only| H[Official insurer website]
```

Trust boundaries are browser↔Railway, server↔worker, server↔OpenAI, runtime↔Railway logs/config and browser↔provider source site.

## DATA FLOW

**PDF:** Browser File → authenticated bounded POST → signature/size validation → memory/worker parsing → deterministic masking → OpenAI Responses API → strict runtime validation → normalization/catalog/matching → no-store browser result. Original PDF and original filename are not sent to OpenAI.

**Manual:** React state → authenticated POST → server normalization/catalog → comparison; manual-only has no AI call. **Hybrid:** only PDF side crosses AI boundary. **Product mode:** static catalog, local deterministic comparison, no AI/PDF/provider fetch. **Feedback:** no implementation found. **Auth:** shared code → signed 12-hour HttpOnly/Secure/SameSite cookie.

## DATA LIFECYCLE

`DATA LIFECYCLE RESULT = PARTIALLY_UNDERSTOOD`. Customer PDF, extracted text and facts are request-memory only on server; results/manual fields remain in React/DOM memory until input change, reload or tab close. No database, object store, customer temp-file write, public upload, localStorage, sessionStorage, analytics or export feature was found. OpenAI and Railway log/temp retention, region, backup and deletion remain vendor/organizational review items.

## AUTHENTICATION / AUTHORIZATION

`AUTH RESULT = ADEQUATE_ONLY_WITH_CONTROLS`; `USER ISOLATION RESULT = PARTIAL`. API auth is server-enforced before reading upload bodies; production unauthorized POST returned 401/no-store. Same-origin and signed-cookie controls are good. All advisors share one identity; no logout, per-user revocation or attribution exists. Changing access code does not invalidate existing sessions; rotating session secret invalidates all.

## FILE / PDF SECURITY

`FILE UPLOAD RESULT = ADEQUATE_FOR_PILOT`. Server enforces 10 files/side, 10 MiB/file, 25 MiB/request, PDF signature, 150 pages/file, 250 pages/side, 400 pages/job, bounded text/batches/products, worker/AI timeout, max two extraction calls concurrently and one active analysis/process. Corrupt, encrypted, textless, duplicate and malformed cases fail safely. Gateway body limit remains to verify.

## AI / PROMPT INJECTION

`PROMPT INJECTION RESULT = PARTIAL_DEFENSE`. Instructions explicitly treat document/model fields as untrusted; model has no tools or secrets; strict schemas and runtime candidate/ID validation reject unexpected output. Synthetic command/HTML/script cases and private-marker denial pass. This cannot guarantee model correctness, and best-effort regex masking does not remove arbitrary prose or health information.

## LOGGING / TRACE

`LOGGING RESULT = PRIVACY_SAFE_FOR_TESTED_PATHS`. Metrics contain bounded counts/timing/tokens and request-local UUID; errors contain allowlisted category/status/request IDs. Raw PDF/text/name/filename/value logging was not found. Trace has strict schemas and Railway was verified `false`; its historical/platform retention is unknown.

## FEEDBACK

`FEEDBACK PRIVACY RESULT = NOT_APPLICABLE`: no widget/endpoint/storage exists. A privacy-minimizing feedback route and a separate security/privacy incident route are operational prerequisites.

## INFRASTRUCTURE / NETWORK

HTTPS and online status are production-verified. `/api/analyze` returns private no-store. Security hardening headers are missing in production. Login is public/static and cached; that page contains no customer data. `/robots.txt` is absent, while page metadata is `noindex`. Railway shows one replica; organizational access, edge rate limits, log/body buffering and backup behavior require verification.

## DEPENDENCIES

`DEPENDENCY RESULT = NO_MATERIAL_KNOWN_FINDING`. `npm audit --omit=dev --json` returned zero vulnerabilities on 2026-09-29 (23 prod, 383 dev, 121 optional, 476 total). This is point-in-time evidence; a recurring process is missing.

## GDPR READINESS

Technically verified: ephemeral local processing, minimization controls, no customer persistence, server-side secrets, no-store responses and structural logging. Legal/organizational review required: controller/processor roles, legal basis, privacy notice, OpenAI/Railway DPAs/subprocessors/transfer/region, approved retention/deletion, data-subject handling, incident assessment and access owners.

`PRIVACY DOCUMENTATION RESULT = ACTION_REQUIRED`. `DPA RESULT = MISSING_OR_UNVERIFIED`.

## DPIA SCREENING

`DPIA_SCREENING = RECOMMENDED`. The combination of new AI processing, insurance/financial context, potentially sensitive incidental content and consequences of wrong disclosure warrants documented screening. Small internal scope reduces scale. This is not a completed DPIA or legal conclusion.

## PERSON INSURANCE PRIVACY GATE

`PERSON_INSURANCE_PRIVACY_GATE = NOT_READY`. Generic extracted text can include health/special-category data; the current redactor is not a health-data filter; individual accountability, vendor/legal controls and DPIA/legal-basis work are incomplete. Do not accept barne-, liv-, uføre- or kritisk-sykdom documents.

## PRODUCT READINESS

`PRODUCT INDEPENDENCE RESULT = ADVISOR_CAN_USE_WITH_QUICK_GUIDE`. Core modes, empty state, manual progression, catalog dropdowns and product-mode disclaimers are clear. Product runtime verified all 12 families, 202 eligible products, no network/AI/PDF calls. Advisor independence still needs quick guide, explicit reset/logout, uncertainty explanation, feedback/incident route and Safari smoke.

## ADVISOR WORKFLOW

Local synthetic semantic smoke verified login, agreement/product mode distinction, PDF privacy copy, limits, manual guided fields and Båt product selectors. The full synthetic HTTP pipeline validates upload, progress, partial failure, multiple objects, price, sources and safe results. No actual four-advisor human usability session was conducted.

## ERROR / RECOVERY

Errors are bounded Norwegian messages without raw upstream bodies; partial failures surface as incomplete. Cancel aborts active work. Changing input clears the result. Refresh/tab close loses state, which is privacy-favorable but needs explanation. There is no explicit end-customer reset/logout.

## ACCESSIBILITY / MOBILE / SAFARI

`ACCESSIBILITY RESULT = ADEQUATE_FOR_PILOT` based on native form controls/details, labels, roles, focus styles, keyboard semantics, responsive tests and lint. This is not WCAG certification or full screen-reader testing. `SAFARI RESULT = MANUAL_SMOKE_REQUIRED`; Chrome cannot prove Safari.

## PILOT OPERATING MODEL

Minimum safe scope: four named internal advisors on controlled devices; supported skadeforsikring only; authenticated URL; no public/B2C sharing; no person insurance; upload only necessary pages/documents; no customer data in feedback; trace off; incident owner and stop conditions active. Use source/original customer documents and human review before advice.

Stop immediately on previous-customer/cross-user data, unauthorized access, suspected leakage, uncontrolled persistence or source corruption. A comparison correctness mismatch enters correctness triage; it is not automatically a privacy incident.

## LEGAL REVIEW QUEUE

See `legal-organizational-review.md`: roles, legal basis, privacy wording, DPAs/subprocessors/transfers/regions, retention approval, DPIA decision, rights/deletion process and insurance-distribution boundary.

## ORGANIZATIONAL REVIEW QUEUE

Assign pilot, security, privacy, advisor-support and feedback owners; verify Railway/GitHub/OpenAI access; establish onboarding/offboarding, incident/breach/vendor escalation, change/deploy/smoke notification and deletion-request procedures.

## REMEDIATION ORDER

1. Approve vendor/DPA/retention/region and data-flow record.
2. Verify edge login/analysis rate limits and access owners.
3. Publish reviewed privacy/pilot operating information and incident route.
4. Decide shared-code controls versus named auth; add logout/reset.
5. Add security headers.
6. Run Safari/screen-reader synthetic smoke and four-advisor onboarding.
7. Remove/expire temporary trace instrumentation.

## MANUAL CHECKLIST

See `pilot-manual-checklist.md`. The pilot version should be frozen at `{HEAD}` after actions pass; later changes need test, deployment smoke and advisor notification. Git/Railway support deployment rollback; this is separate from customer-data backup, which is neither present nor desirable for ephemeral inputs.

## GO/NO-GO TABLE

| Area | Status | Blocker? | Required action | Owner type | Evidence |
|---|---|---:|---|---|---|
{chr(10).join('| ' + ' | '.join(r) + ' |' for r in go_no_go)}

## FINDING COUNTS

- Total finding rows: {len(security)+len(product)}
- BLOCKER: {sev['BLOCKER']}
- IMPORTANT: {sev['IMPORTANT']}
- POLISH: {sev['POLISH']}
- Deduplicated signatures: {len(audit['findings']['deduplicated_signatures'])}
- Manually inspected: {len(security)} security findings, {len(product)} product findings, {len(positive_controls)} positive controls, 12 no-finding areas.

## POSITIVE CONTROLS

{chr(10).join('- ' + x for x in positive_controls)}

## MANUAL CHECKLIST

See `/tmp/nito-prepilot-audit/pilot-manual-checklist.md`.

## FINAL DECISION

`NITO_PILOT_GATE = READY_WITH_ACTIONS`. The current commit is technically suitable for a tightly controlled skadeforsikring pilot after the mandatory documentation/configuration/operational actions are signed off. It is not approved for person insurance, public consumer use, automated advice/sale or unsupported products.

## OUTPUT FILES

The complete structured package is in `/tmp/nito-prepilot-audit/`: JSON, the main Markdown report, two finding CSV files, data/endpoint/external-service/access inventories, the pilot checklist and the legal/organizational queue.

## REPO INTEGRITY

The audit was read-only. No repository, environment, source, catalog, Railway variable, commit or remote state was changed. The final integrity check must still confirm clean `main`, `git diff --check`, and equality with `origin/main`.

## NEXT STEP

Assign owners and complete the mandatory pre-real-data checklist. Then perform the remaining Safari/screen-reader/advisor smoke with synthetic data and record formal go/no-go approval. Do not enable person-insurance documents under this gate.

## LIMITATIONS

{chr(10).join('- ' + x for x in audit['limitations'])}
'''
open(f'{OUT}/nito-prepilot-audit.md','w',encoding='utf-8').write(md)

checklist=f'''# NITO pilot – manuell sjekkliste før første ekte kunde

Målversjon: `{HEAD}`

## Obligatorisk før ekte kundedata

- [ ] Målcommit er deployet og Railway viser ACTIVE / Deployment successful.
- [ ] Produksjons-HTTPS, 401-beskyttelse og no-store er smoke-testet.
- [ ] Edge-rate-limit for pilotinnlogging og analyse er dokumentert og testet lavvolum.
- [ ] Gateway body limit er maksimalt 25 MiB.
- [ ] Kun navngitte rådgivere har pilotkoden; distribusjon og offboarding er dokumentert.
- [ ] Beslutning om delt kode kontra individuelle brukere er godkjent; delte arbeidsstasjoner har logout/close-prosedyre.
- [ ] Railway/GitHub/OpenAI-tilgang og minste privilegium er gjennomgått.
- [ ] Railway logg/body/temp/backup-retention og tilgang er dokumentert.
- [ ] OpenAI data sharing, retention/ZDR/MAM, region, subprocessors og DPA er gjennomgått.
- [ ] Behandlingsansvarlig/databehandlerroller og behandlingsgrunnlag er juridisk vurdert.
- [ ] Pilotens personverninformasjon er juridisk gjennomgått og tilgjengelig.
- [ ] Retention/deletion-policy, data inventory og behandlingsprotokoll er godkjent.
- [ ] DPIA-screening er vurdert av personvern/juridisk ansvarlig.
- [ ] Incident-, vendor-incident-, avviks- og data-subject-request-prosess har navngitte eiere.
- [ ] Pilotens stop conditions og supportkontakt er kjent for alle rådgivere.
- [ ] Rådgiverens quick guide og kjent-begrensninger er tilgjengelig.
- [ ] Safari-smoke med syntetisk data er gjennomført dersom Safari skal brukes.
- [ ] Syntetisk demo av PDF, manual, hybrid, produktmodus, kilde og ny kunde er gjennomført.
- [ ] Production tracing er OFF.
- [ ] Ingen personforsikrings-/helseopplysningsdokumenter tillates.

## Per kundesak

- [ ] Last opp bare nødvendige dokumenter/sider; fjern irrelevante vedlegg.
- [ ] Kontroller «Ikke dokumentert», konflikt, manglende objekt og ufullstendig pris mot originalen.
- [ ] Kontroller viktige fakta og kilder før rådgivning.
- [ ] Ikke lim kundedata inn i ordinær feedback.
- [ ] Avslutt saken ved å tømme/oppdatere alle inputs og lukke/reloade fanen; bruk privat arbeidsstasjon.
- [ ] Ved tidligere kundedata eller mulig kryssbrukerlekkasje: stopp piloten og kontakt sikkerhets-/personvernansvarlig straks.

## Pilotstyring

- [ ] Definert start, review point, eier og stop condition.
- [ ] Privacy-safe metrics: antall forsøk/fullført, feilklasse, responstid og feedbackkategori – aldri navn, dokumenttekst, identifikatorer eller priser.
- [ ] Endringer følger change → test → deploy → smoke → rådgivervarsel.
- [ ] Kjent god commit og rollback-prosedyre er registrert.
'''
open(f'{OUT}/pilot-manual-checklist.md','w',encoding='utf-8').write(checklist)

legal='''# Legal / organizational review queue

Dette dokumentet inneholder bare spørsmål kode ikke kan avgjøre. Det er ikke juridisk rådgivning eller ferdig GDPR-dokumentasjon.

## Juridisk/personvern

1. Fastsett behandlingsansvarlig, databehandler og eventuelle felles roller for NITO-piloten.
2. Dokumenter behandlingsgrunnlag per aktivitet: dokumentanalyse, AI-overføring, driftslogger og fremtidig feedback.
3. Gjennomgå personverninformasjon: formål, datakategorier, mottakere, AI, lagring, rettigheter og kontakt.
4. Verifiser DPA/databehandleravtaler, subprocessors, behandlingsregion og overføringsmekanismer for Railway og OpenAI.
5. Godkjenn retention/deletion for requestdata, vendor safety/access logs og eventuelt feedback.
6. Vurder denne DPIA-screeningen og avgjør om full DPIA er nødvendig.
7. Avklar prosess for innsyn, retting, sletting, begrensning og hvor data kan finnes når appen er ephemeral.
8. Avklar forsikringsdistribusjons-/rådgivningsgrensen; verktøyet er beslutningsstøtte og krever menneskelig kildekontroll.
9. Personforsikring krever separat vurdering av særlige kategorier, tilgang, minimization, retention og DPIA før dokumenter aksepteres.

## Organisasjon/drift

1. Navngi pilot owner, technical incident owner, privacy contact, advisor support og feedback triage owner.
2. Kartlegg hvem som kan lese Railway/GitHub/OpenAI config, secrets, logs og deploye; fjern overflødig tilgang.
3. Bestem rådgiver-onboarding/offboarding, kodehåndtering, hele-pilot-revokering og shared-workstation-regler.
4. Verifiser Railway edge rate limit, body limit, log/body capture, log/temp retention, backups and rollback.
5. Etabler hendelsesvurdering og vendor-incident-escalation. Kryssbrukerdata er umiddelbar pilotstopp.
6. Skill vanlig feedback, correctness bug og security/privacy incident i rådgiverinstruksen.
7. Definer pilotens start, review point, stop conditions, scope og endringskommunikasjon.
8. Bekreft at pilot scope er supported skadeforsikring; ingen personforsikring, offentlig B2C eller automatisert salg.
'''
open(f'{OUT}/legal-organizational-review.md','w',encoding='utf-8').write(legal)

print(json.dumps({'files':sorted(os.listdir(OUT)),'counts':audit['findings']['severity_counts'],'rows':len(security)+len(product),'signatures':len(audit['findings']['deduplicated_signatures'])},ensure_ascii=False,indent=2))
