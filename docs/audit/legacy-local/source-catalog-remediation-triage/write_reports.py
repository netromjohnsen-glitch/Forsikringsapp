from triage_model import *
x=json.load((OUT/'triage.json').open());bs=x['batches'];bb={b['batch_id']:b for b in bs};c=x['counts']
def table(headers,rows):
    return '| '+' | '.join(headers)+' |\n| '+' | '.join(['---']*len(headers))+' |\n'+''.join('| '+' | '.join(str(v).replace('|',' / ').replace('\n',' ') for v in row)+' |\n' for row in rows)
def linkfile(p):return f'[{p}]({REPO/p})'
def uniq(v):return sorted(set(v))
def md(name,s):(OUT/name).write_text(s,encoding='utf-8')

disps=['FIX_BEFORE_NITO','SOURCE_RESEARCH_FIRST','CANONICAL_REVIEW_FIRST','MAPPING_REVIEW_FIRST','HUMAN_DOMAIN_REVIEW','DEFER_SAFE','DUPLICATE / COVERED_BY_OTHER_BATCH','FALSE_POSITIVE_AFTER_RECHECK']
for d in disps:c['P1_dispositions'].setdefault(d,0)
waves=[]
wave_desc={
1:('Fjern bekreftede feilaktige positive/innsnevrende påstander','Alle åtte strict unsupported claims revidert mot egne kilder; nivånegative kontroller bestått; ingen ny udokumentert negativ dekning.'),
2:('Korriger avgrenset arv, scope og kjente semantiske koblinger','Godkjente nøkkel-/tilleggsbeslutninger foreligger; gnagere/insekter, Bruk/Liv, dagstur og forsinkelseshendelser holdes adskilt. Dokumentvalg består.'),
3:('Materialiser dokumentert P1-kunnskap med eksisterende dimensjoner','71 provider/type/scope-pakker + 2 tydelige utvidelser kontrollert mot egne fullvilkår. Ingen uløst dimensjon tas med av bekvemmelighet.'),
4:('Avklar og implementer de resterende typebestemte semantiske dimensjonene','Alle tilordnede CR-beslutninger signert; eksisterende nøkkel eller avgrenset detalj foretrukket; nye nøkler begrunnet. Ingen schema-rewrite uten nytt bevis.'),
5:('Lukk berørte kilde-/domeneavhengigheter og implementer sikre konklusjoner','65 aktive kildeoppgaver har kildeverdict eller eksplisitt godkjent og bevist konservativ representasjon; ingen P1-utelatelse med tilgjengelig kilde kan unntas.'),
6:('Full re-audit, menneskelig pilotgate og historisk avgrensning','Alle aktive P1-signaturer lukket eller gyldig unntak godkjent; 29 false-unknown controls + dagstur; alle positive kontroller; full source→catalog- og bulk-sammenligningsaudit. Historisk B-205 utføres ikke automatisk.')}
for n in range(1,7):
    rows=[b for b in bs if b['wave']==n]
    waves.append(dict(wave=n,objective=wave_desc[n][0],batch_ids=[b['batch_id'] for b in rows],batch_count=len(rows),P1_signatures=sum(b['P1_signature_count'] for b in rows),
      products_affected=uniq(p for b in rows for p in b['products_affected']),dependencies=uniq(z for b in rows for z in b['dependencies']),
      expected_risk='LOW/MEDIUM' if n==1 else 'MEDIUM' if n==3 else 'MEDIUM/HIGH',
      parallelization='Disjoint writer files only with designated owner; collision table is authoritative. Read-only research can run from Wave 1. No parallel agents executed here.',
      gate_before_next=wave_desc[n][1]))
# Quantities are signature-level; one historical batch is an explicit backlog item.
md('remediation-waves.md','# Seks gjennomføringsbølger – forslag, ikke autorisasjon\n\n'
 'Bølger er rekkefølge for godkjent implementasjon. Kildeinnhenting kan starte som separat read-only spor samtidig med bølge 1. Hver batch har egne forutsetninger; én uløst kilde stopper ikke en uavhengig dimensjon. Ingen bølge er gjennomført her.\n\n'+
 table(['Bølge','Formål','Batcher','P1-signaturer'],[(w['wave'],w['objective'],w['batch_count'],w['P1_signatures']) for w in waves])+ '\n'+
 '\n'.join(f"## Bølge {w['wave']}\n\n{w['objective']}\n\nBatcher: {', '.join(w['batch_ids'])}. Produkter berørt: {len(w['products_affected'])}. Risiko: {w['expected_risk']}.\n\nAvhengigheter: se batchens eksplisitte ID-liste i remediation-plan.csv; CR/SR/HR må godkjennes før den aktuelle batchen. {w['parallelization']}\n\nGate: {w['gate_before_next']}\n" for w in waves)+
 '\nBølge 6 teller 21 historiske P1-signaturer for avstemming, men de inngår ikke i aktivt pilotminimum. Den fullstendige re-auditen er en gate, ikke en påstått ekstra katalogrettelse.\n')

parts=['# Endelige remediation-batcher\n\n205 avgrensede operasjoner, ikke 205 påviste motorfeil. De 56 tidligere forslagene blandet provider/type/scope, bekreftede feil, usikre kilder og uavklart nøkkelvalg. Planen beholder én forfatterpakke per provider/type/scope og separat readiness-gate; den splitter ikke etter hvert enkelt produktnivå eller hver forekomst. 113 operasjonelle rotårsaksområder gjenbrukes på tvers av de 205 batchene.\n\nEn IMPLEMENTATION_READY-batch har tilstrekkelig kildegrunnlag for sine oppførte dimensjoner. Den er ikke allerede implementert, testet eller autorisert. En CANONICAL_REVIEW_FIRST-batch betyr at nøkkelplasseringen ikke er besluttet; den beviser ikke behov for en ny schema-dimensjon.\n\nEksakt produkt-/komponent-/versjon-/kildemetadata og alle signaturer finnes per batch i triage.json. Henvisninger til auditdata er uforanderlige.\n']
for b in bs:
    evid=b['evidence'];sample=[];seen=set()
    for e in evid:
        k=(e['artifact'],e['location'],e['source_fact_id'])
        if k not in seen:seen.add(k);sample.append(e)
    parts.append(f"## {b['batch_id']} · {b['title']}\n\n**PURPOSE:** {b['what_must_change']}\n\n**EVIDENCE:** "+'; '.join(f"{e['finding_id']} / {e['source_fact_id']}: {e['artifact']} — {e['location']}" for e in sample[:5])+
      f". Alle {len(evid)} produkt-/kildebindinger med SHA-256, URL, side og katalogbevis: `triage.json → batches[{b['batch_id']}].evidence`.\n\n**AFFECTED SCOPE:** Providers {', '.join(b['providers'])}; typer {', '.join(b['families_affected'])}; scope {', '.join(b['scopes'])}. {len(b['products_affected'])} eksakte produktidentiteter: "+'; '.join(b['products_affected'])+'. Tilleggskomponenter: '+('; '.join(b['addon_components']) or 'ingen selvstendig komponent-ID oppført i funnene; optional-status kontrolleres fortsatt')+'.\n\n'+
      f"**ROOT CAUSE:** {', '.join(b['root_cause_ids'])}, fra {', '.join(b['original_root_cause_ids'])}. Lag: {b['layer']}.\n\n**WHAT MUST CHANGE:** {b['what_must_change']}\n\n**WHAT MUST NOT CHANGE:** "+'; '.join(b['what_must_not_change'])+
      '\n\n**FILES:** '+', '.join(linkfile(f) for f in b['expected_production_files'])+'. Betinget, bare etter eksplisitt behov: '+(', '.join(linkfile(f) for f in b['conditional_shared_files']) or 'ingen')+'.\n\n'+
      f"**SOURCE READINESS:** {b['source_readiness']}. Frosset kildepakke 29.09.2026. Eventuelle andre konflikter i samme familie er ikke automatisk en sperre for disse dimensjonene.\n\n**IMPLEMENTATION RISK:** {b['risk']}; {b['complexity']}; {b['parallelization_status']}. Delte filer: se file-collisions.csv.\n\n**TEST REQUIREMENTS:** "+'; '.join(b['test_plan'])+
      '\n\n**POST-FIX AUDIT:** '+'; '.join(b['post_fix_audit'])+'.\n\n'+
      '**DEPENDENCIES:** '+(', '.join(b['dependencies']) or 'Ingen tekniske forgjengere; menneskelig godkjenning av batchen kreves')+'.\n\n'+
      f"**EXPECTED LEVERAGE:** {b['P1_signature_count']} P1-signaturer / {b['P1_occurrence_count']} forekomster; {b['P2_piggyback_count']} tilknyttede P2-forekomster. Tall er mål for lukking etter audit, ikke garantert resultat.\n\n**CUSTOMER/PDF IMPACT:** {b['customer_mode_impact']}. Ingen extraction-endring er bevist nødvendig.\n\n**MODEL RECOMMENDATION:** {b['recommended_model']}.\n")
md('remediation-batches.md','\n'.join(parts))

# Root reconciliation and previous group audit are human-readable as well.
rr=list(csv.DictReader((OUT/'root-cause-triage.csv').open()));oldreview=list(csv.DictReader((OUT/'original-batch-review.csv').open()))
md('root-cause-reconciliation.md','# Rotårsaksavstemming\n\n60 opprinnelige poster er gjennomgått. De er ikke 60 uavhengige programfeil. Det er 113 avgrensede implementeringsområder etter at blandede provider-/type-/scopepakker og særskilte feil er splittet; 11 endelige områder samler flere gamle poster. 33 gamle poster splittes. 93 områder har minst én uløst implementeringsgate. RC-114 / SCRC-049 (Tryg Hus) er i tillegg beholdt som P2-backlog uten kunstig pilotbatch; rotregisteret har derfor 114 rader.\n\nDette er en økning i operasjonell presisjon, ikke en påstand om 113 forskjellige feil i motoren. Samme utelatelsessymptom på tvers av selskaper beviser ikke felles kodeårsak. Direkte forfatterrader/generatorgren er observert; hvorfor en tidligere utvikler utelot dem er ikke bevist.\n\n'+
 table(['Gammel post','Status','Endelige områder','Endelige batcher'],[(r['existing_root_cause_id'],r['status'],r['final_root_cause_id'],r['final_batch_ids']) for r in rr])+
 '\nEksempler på legitim sammenslåing: If dyr SCRC-002/042; Frende lette kjøretøy SCRC-004/021; Fremtind MC SCRC-006/056; Storebrand Båt SCRC-003/060. De må fortsatt splittes der faktakorreksjon, type/scope eller kildeberedskap krever det.\n\nAlle 56 gamle batchforslag er gjennomgått i original-batch-review.csv. Full P2-backlog bevares i p2-piggyback.csv; P2 er ikke borte når en gammel batch splittes.\n')

# Source boundaries: preserve partial scope instead of treating whole-family as blocked.
md('source-and-semantic-policy.md', '''# Kilde- og semantiske beslutningsregler

Dette er en plan basert på fullført audit, ikke en ny kildeaudit. Ingen nettsøk eller kildeinnhenting er gjort. Alle endelige katalogverdier må valideres mot egne offentlige kilder i den godkjente batchen.

## Kilder og blokkering

110 åpne køposter blir 70 koordinerte avklaringsoppgaver. De 3 lukkede og 2 alias-postene er bevart i avstemmingen av alle 115. Av 70 konfliktposter er SC-005 allerede avklart, SC-003 gjelder eldre IPID, og 68 er fortsatt åpne. Samme anskaffelsesoppgave kan inneholde flere eksakte spørsmål, men ett svar eller felles forsikringsgiver er aldri bevis for lik regel på tvers av type/kanal.

65 oppgaver må ha et eksplisitt verdict før full aktiv pilotgate. Dette betyr ikke 65 nødvendige nedlastinger eller 65 katalogfeil: en oppgave kan lukkes med bevist konservativ representasjon og særskilt godkjent begrensning. De øvrige 5 gjelder historisk Eika, eldre Frende-IPID, lav/uklar HTU-anvendelse, boligsituasjon for Storebrand Innbo og ekstra If Supergaranti. Ingen automatisk godkjenning gis her.

Konfliktlisten og source-research-plan.csv inneholder de eksakte spørsmålene og originalkildene. Kildearbeid skal hente aktivt datert offentlig fullvilkår, IPID/kanaltillegg og eventuell skriftlig produktavklaring. Private forsikringsbevis skal ikke etterspørres for å fylle generelle katalogmangler.

## Korriger bare avklart deldimensjon

Frende Bil GAP-1370: leasing-/kontantoppgjør kan presiseres fra egen kilde. Aldersoperatoren i CC-01253/01291 hører til SC-012 og skal ikke velges i samme dataedit. Fremtind Hund GAP-5601 kan gjenopprette niårsgruppen; SC-068s «i året» versus «etter fylte år» er separat. Gjensidige Hus bekjempelsesegenandel er ikke automatisk egenandel for fysisk insektskade (SC-020). Gjensidige Hund rehabilitering flyttes ikke før SC-035s behandlingsmodaliteter er avklart. Supergaranti er holdt utenfor If Campingvogns kildeklare Super-utvidelse.

## Modell og nøkkelvalg

Gjeldende CatalogFact kan bære presis tekst med faktaspesifikk kilde. Manglende auditforslag til nøkkel beviser derfor ikke schema-gap. 317 P1-signaturer trenger canonical review; 166 trenger mapping review. De 469 koordinerte CR-radene er eksplisitte konsept/dimensjon/type-spørsmål, ikke 469 nye features eller nye nøkler. Hver kan godkjenne eksisterende nøkkel, provider-detalj eller en liten typeavgrenset registrering. Først ved dokumentert informasjonstap eller falsk ekvivalens vurderes ny nøkkel.

Gjensidige Bruk → Liv er det konkrete avhengighetsgapet: requiresLevel gjelder hovedprodukt, ikke valgt annet tillegg. Avklar minste representasjon, ikke global omskriving. Gnager/insekt-tapet skyldes same-key/replacesBase-forfatting; resolveren følger de gitte dataene. Storebrand dagstur finnes i geografitekst, men ikke egen generell overnattingsdimensjon; eksakt key-comparison skal ikke gjette fra fritekst.

Hold alltid atskilt:
- tegning, dekning, reduksjon og opphør; dyr-, motor-, kjøretøy- og bygningsalder
- årlig kjørelengde, aktuell kilometerstand, maskinskade- og nyverdigrense
- fast/prosent/kombinert egenandel, minimum, maksimum og fradrag
- samlet sum, per gjenstand/person/hendelse/år/livstid og valgt kundesum
- dekning, utløsende hendelse, oppgjørsform, nødvendig betingelse og uttrykkelig unntak
- ordinær geografi, assistansegeografi, valgfri utvidelse og kundens reise
- standard inkludert, valgfritt tilgjengelig, dokumentert valgt, ikke valgt og ukjent.

Ikke lag symmetriske rader når kildene beskriver forskjellige konsepter. Ikke fyll hull med konkurrents opplysninger. Et annet selskap brukes bare som view-kontroll; egne kilder er fasit. Negative fakta krever uttrykkelig kilde; fravær alene er ukjent. Presise provider-spesifikke detaljer kan være riktig løsning.

## P2 og historikk

To uavhengige P2-signaturer (tre forekomster) følger eksplisitt samme korrigering: Storebrand Hus badeinnretningens material-/objektscope og If Reise Basis sikkerhetsregel. I tillegg følger tre P2-forekomster automatisk en signatur som allerede er P1 et annet sted. Disse telles ikke som tre ekstra P2-signaturer. Øvrig P2 utsettes med begrunnelse; ingen P3 finnes.

21 P1-signaturer / 37 forekomster gjelder to historiske Eika-produkter. Defer gjelder bare aktiv produktpilot med disse avgrenset bort. Historiske kunde-PDF-er er ikke sertifisert. Fremtidig bruk av P10/P15 krever den historiske batchen og kildeavklaring, ikke en generell «Fremtind»-fallback.
''')

# Explicit safe observations, pending pilot signoff; no blanket waiver.
limitations=list(csv.DictReader((OUT/'pilot-known-limitations.csv').open()))
safes=[
 ('SC-036','if','Bobil','if-bobil-super','Nyverdi kilometer','Eksakt fullvilkår MOT4.11.1 støtter katalogens 60 000, nettsidens ingress 100 000 er registrert separat.','Behold fullvilkårets regel og synliggjør kildeavvik; ikke endre til nettsidens tall.'),
 ('SC-038','if','MC','if-mc-kasko','Maskinskade typeeligibility','Katalogens avgrensning til mellomtung/tung støttes av fullvilkår/IPID; nettsidens alle motorsykler er bredere.','Ingen utvidelse til lett MC basert på nettsideordlyd.'),
 ('SC-042','if','Hus','if-hus-basis / if-hus-utvidet / if-hus-super','Produktnivånavn','Fullvilkår og HTML støtter Basis/Utvidet/Super; udaterte IPID Standard/Super kan ikke overstyre dette.','Behold eksplisitte dokumenterte nivåer, ingen usikker Standard-alias.'),
 ('SC-020','gjensidige','Hus','gjensidige-hus-pluss','Bekjempelse versus fysisk skade','Katalogen avgrenser 2 000 til bekjempelse; nettsidens bredere insektordlyd etablerer ikke fysisk-skade-egenandel.','Ikke spre bekjempelsesegenandelen til skade på bygningsdeler.'),
]
for cid,p,f,prd,concept,reason,safe in safes:
    limitations.append(dict(limitation_id='L-SAFE-'+cid,provider=p,family=f,product=prd,concept=concept,reason_unresolved=reason,current_safe_behavior=safe,
      advisor_impact='Den avgrensede eksisterende kildebruken er konservativ ifølge fullført audit; nærliggende spørsmål er fortsatt åpne.',pilot_communication_needed='Navngi dette konkrete kildeavviket dersom pilotunntak godkjennes.',approval_status='EXPLICIT_PILOT_APPROVAL_PENDING',pilot_exception_accepted=False,pilot_blocking='CONDITIONAL_UNTIL_APPROVED',release_condition='Menneskelig godkjenning av eksakt avgrensning; ikke fritak for andre mangler i produktet.'))
csvout('pilot-known-limitations.csv',limitations)

ci=[
 ('CI-01','source hash + metadata','Manifest/source binding and sha256, unknown versions explicit','Deterministic; cannot prove policy meaning alone'),
 ('CI-02','scope identity','Provider/type/agreementScope/product/version and addon restrictions','Use exact identities, not a single insurer group'),
 ('CI-03','source-led facts','Reviewed semantic tuple with own-source oracle','Independent inventory must precede new catalog; copying implementation as expected is insufficient'),
 ('CI-04','reverse claims','Changed material claims have their own exact source and applicability','No whole-document citation as substitute for exact clause'),
 ('CI-05','negative controls','No wrong-tier optional or peer-type leakage','Unknown is not negative coverage'),
 ('CI-06','effective precedence','Document X wins over catalog Y; selected/not_selected/unknown','Synthetic only; no customer artifacts'),
 ('CI-07','loss through composition','Inherited still-applicable qualifiers survive addon resolves','Do not replace resolver globally to fix local data'),
 ('CI-08','comparison UI','Same product, side-swap, false unknown controls, sources/detail','No inference from long-form text'),
 ('CI-09','boundary units','Exact under/through/first renewal/period and currency/unit','No regex number collapse'),
 ('CI-10','temporal freeze','Explicit catalog as-of date and future effective source gates','No hidden date-dependent audit drift'),
 ('CI-11','freshness changes','Official source hash/date diff triggers targeted re-audit','No new automatic crawling added now'),
 ('CI-12','all-family bulk gate','Active products + optional scopes + historical exclusions','Counts alone never prove semantic completeness'),
]
csvout('future-ci-candidates.csv',[dict(candidate_id=i,category=k,assertion=a,limitation=l,status='PROPOSED_NOT_IMPLEMENTED') for i,k,a,l in ci])
md('regression-and-reaudit-plan.md','''# Regresjon og ny audit etter fremtidig implementasjon

Ingen applikasjonstester ble skrevet eller kjørt i denne triagen. Kontrollene her er krav til fremtidig arbeid.

## Per batch

1. Egen, kildeledet oracle: eksakt produktidentitet, hendelse, objekt, sum/enhet, periode, betingelser og kildepunkt. Testen skal ikke bare kopiere katalograden.
2. Base/arv/tilvalg: berørte nivåer, nærmeste nivå som ikke skal endres, valgfri dekning tilgjengelig men ikke valgt, eksplisitt valgt/ikke valgt.
3. Kundedokument X over katalog Y, stille dokument beholder ukjent valg, separate objekter beholder egne facts.
4. Begge sammenligningsretninger, samme produkt, provider-spesifikke fakta, source-knapp og parent/detail uten oppfunnet motstykke.
5. Egen source-hash og eksakt type/scope/version; ingen peer-lekkasje.
6. Full eksisterende suite, TypeScript, ESLint, webpack production build, syntetisk HTTP/PDF-runtime og diff-check etter implementering. Ingen nye AI-kall er planlagt.

## Navngitte kontroller

regression-control-registry.csv bevarer alle 29 observerte false-unknown-kontroller og separat Storebrand dagstur (OVERNIGHT-01). De 2 227 eksisterende positive kontrollene er bevart med source_fact_id; 182 gjelder kundespesifikke verdier. Ingen av dem konverteres til katalogmangel fordi valgt kundesum mangler.

Kontroller særskilt Tryg MCs egne nyverdikriterier; Fremtind MC kontra Snøscooter; If Campingvogn Super kontra Kasko; Frende Hus structuredValue/label-scope; Storebrand Båt objektunntak for verdi over terskel kontra erstatningstak; Frende Reise SC-005s allerede avklarte fullvilkår; Fjernede feilaktige positive claims blir ikke automatisk eksplisitt ikke-dekket. Produkt-/versjonskontroller må bevare den frosne 29.09-basis og skille fremtidige kilder.

## Etter hver bølge

Uavhengig kontrollør sammenholder endret katalog med originalt source-first inventory, ikke bare green tests. Reverse-check alle nye/endret material claims; kontroller nivåscope, negative controls og kildeproveniens; kjør berørte familie-/produktpar begge veier. Oppdater separat remediation-ledger med hver signatur lukket, beholdt, omklassifisert eller gjenåpnet. Ny kilde eller semantisk kontradiksjon stopper berørt batch.

## Endelig full gate

Gjenta source → independent fact inventory → authored/resolved catalog → product comparison, for alle aktive produkter og 84 addons i riktig scope. Oppdater kildeinventory og hashes dersom en senere godkjent research har utvidet korpuset. Gjenta full reverse support check, full bulk product comparison, de 29 false-unknown-kontrollene, dagsturkontrollen, egne positive kontroller og relevante syntetiske PDF/customer flows. Reconcile aktive P1 og historiske avgrensninger på både signatur- og forekomstnivå.

READY krever ingen uløste materielle, kildeklare P1-mangler, ingen udokumenterte material claims og ingen ukorrekt falsk unknown fra kjent kilde. Eventuelle uløste kildekonflikter må ha bevist ikke-villedende representasjon, konkret begrensningsregister og uttrykkelig menneskelig godkjenning. Tester alene, redusert funnantall eller denne triagen gir ikke pilotgodkjenning.

Menneskelig fagkontroll av motstridende fullvilkår, selektive grenseverdier og optional-status inngår før publisering. Ingen juridisk godkjenning er implisert.
''')
md('future-process-notes.md','''# Fremtidige hensyn – ikke implementert eller lagt til minimumssettet

## PDF/customer sammenligning

Vurder en separat, deterministisk oversikt over dokumenterte pris-/risikoforutsetninger øverst: avtalt årlig kjørelengde, fører-/bruksvilkår, egenandel, valgt sum, objekt og andre vesentlige forutsetninger når kundedokumentene faktisk dokumenterer dem. Det må skilles fra dekningenes kilometergrenser, katalogens standardmaks og individuelle priser. Manglende forutsetning er ikke et antatt standardvalg. Ingen ny PDF-arkitektur, prompt, ekstraksjon eller AI-kall er autorisert av triagen.

205 batcher kan påvirke katalogkunnskap i kundemodus når enrichment er berettiget; derfor LIKELY_SHARED_WITH_CUSTOMER_MODE. Ingen påvist PDF_EXTRACTION_IMPACT: rå kunde-PDF-er ble ikke brukt, og audit av offentlig katalog kan ikke bevise uttrekksfeil. PRODUCT_MODE_ONLY, CATALOG_ENRICHMENT_ONLY, PDF_EXTRACTION_IMPACT og UNKNOWN har derfor 0 tildelte batcher; dette er konservativ potensiell påvirkning, ikke målt kundeforbedring.

## Personforsikring

Kilder → uavhengig rådgiverrelevant faktainventory → canonical semantikk → produktkatalog → sammenligning → source→catalog-gate → menneskelig validering → publisering. Ikke start implementasjonen først og oppdag fullstendighet etterpå.

Første versjon kan behandle standard offentlige produktvilkår og dokumenterte summer i vanlige avtaledokumenter. Individuelle helsereservasjoner krever separat personvern-/sikkerhetsarkitektur. Fravær av et reservasjonsdokument betyr aldri «ingen reservasjon»; mulig sikker beskjed er at individuelle reservasjoner ikke er vurdert. Ingen personforsikring bygges nå.

## Drift av kildegrunnlag

Versjons-/gyldighetsdato og hashes må videreføres, ukjent dato må forbli ukjent, og ny kildeutgave bør utløse målrettet ny audit. SHA-likhet beviser filidentitet, ikke at samme kanalregel gjelder. NITO/avtalescope er separat fra forsikringsgiver; ingen medlemsprodukter oppfinnes her.
''')

# Top leverage prioritizes safety/materiality, not company ranking or occurrence size.
topids=['B-001','B-005','B-006','B-007','B-004','B-003','B-002','B-024','B-023','B-016','B-008','B-019','B-020','B-022']
csvout('top-leverage.csv',[{k:bb[i][k] for k in ['batch_id','title','P1_signature_count','P1_occurrence_count','products_affected','families_affected','complexity','risk','source_readiness','pilot_priority','recommended_model']} for i in topids])
first=bb['B-001']
md('first-recommended-batch.md',f'''# Første anbefalte implementeringsbatch: B-001

**Avgrens Gjensidige MC ferie-leie til dokumenterte nivåer.** Dette er et forslag for senere godkjenning; ingen rettelse er utført.

- Bølge: 1. Rotårsak: {', '.join(first['root_cause_ids'])}, tidligere SCRC-031 / RB-27.
- Funn: GAP-2361, signatur {first['signature_ids'][0]}; 1 P1-signatur / 1 forekomst.
- Positiv feil: tre `mc.leiekjoretoy.*`-påstander på Gjensidige MC Delkasko (CC-04481, CC-04482, CC-04483).
- Produkt: {first['products_affected'][0]}. Ingen tilleggsmodul. Familie MC, scope ordinary; ukjent kildeversjon/dato forblir ukjent.
- Eksakt lag: katalogforfatting/nivåpredicate, ikke sammenligningsmotoren.
- Fil: `lib/mc-bobil-gjensidige-storebrand-catalog.ts`, grenen på linje 343–346. `type === "mc" && tier !== "ansvar"` legger både bagasjeforbehold og Kaskos leie-MC-regel på Delkasko. Den legitime bagasjeraden må beholdes; bare leie-MC-radene skal avgrenses. Det finnes ingen Gjensidige MC Pluss i denne katalogen.
- Kilde: `catalog/sources/mc-bobil/gjensidige-mc-delkasko-vilkar.pdf`, full pakke/PDF 3–4, SHA-256 `{first['evidence'][0]['sha256']}`. Egen Kasko-kilde side 4 dokumenterer ferie-leie; fullført audit gjennomgikk Delkasko/IPID/produktside uten støtte for denne utvidelsen.
- Behold ordinær veihjelp, bagasje, Kaskos leie-MC og øvrige MC/Bobil-nivåer. Ingen omskriving av kildefravær til eksplisitt «ikke dekket».
- Risiko: lav; liten kataloggren. Kompleksitet TRIVIAL_DATA; modellen **GPT-6 SOL MEDIUM** er tilstrekkelig for godkjent avgrenset edit med kilde-/reviewkontroll.
- Kundepåvirkning: feil katalogpositiv kan ellers supplere kundemodus. Dokumentdata og valgt tilvalg skal fortsatt ha forrang. Ingen extraction-endring.

Hvorfor først: bekreftet positiv feil, ett eksakt nivå, tre uriktige reverse claims og eksisterende own-source negativ/positiv nivåkontroll. Ingen uavklart kildekonflikt eller canonical nykonstruksjon blokkerer. Dette velges foran automatisk gjenbruk av gammel RB-11: Storebrand flytting er også kildeklar, men krever større varsomhet rundt avtalt sum versus hendelsesbetinget særgrense. Raw occurrence count er ikke prioriteringsgrunnlaget.

Krav til regresjon: Delkasko får ikke Kasko-utvidelsen; Kasko beholder 15-dagersregelen og to-virkedagersvilkåret; bagasje/veihjelp beholdes; Ansvar og Bobil uendret; begge sammenligningsretninger; kildebindinger riktig; dokument X over katalog Y og optional-status. Test forventet kildebetydning, ikke bare at tre rader ble fjernet.

Post-fix: exact-level source→catalog + reverse-check av alle tre claims, held-out Kasko/bagasje/veihjelp, targeted MC bulk comparison, full suite/type/lint/build/synthetic runtime/diff. Fellesfilen er også brukt av Storebrand og Bobil: én fil-eier, ingen samtidige writes fra andre batcher.
''')

# The output JSON has all requested named sections plus detail used by CSVs.
x.update(metadata=dict(task='NITO_CATALOG_REMEDIATION_TRIAGE',mode='READ_ONLY',generated_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),status='PENDING_QA'),
 audit_baseline=dict(head=x['baseline'],branch='main',catalog_as_of=x['catalog_snapshot'],products=204,active_products=202,historical_products=2,addons=84,source_artifacts=322,audit_quality='73/73 existing audit checks; not rerun'),
 input_counts=dict(P1_signatures=1589,P1_occurrences=3281,P2_signatures_exclusive=1019,P2_occurrences=2433,total_findings=5714,roots=60,proposed_groups=56,open_source_queue=110),
 p1_dispositions=c['P1_dispositions'],final_batches=[b['batch_id'] for b in bs],waves=waves,source_research_tasks=[t['research_task_id'] for t in x['source_research']],human_review=[t['review_id'] for t in x['human_reviews']],canonical_review=[t['review_id'] for t in x['canonical_mapping_reviews']],
 p2_piggyback={'file':'p2-piggyback.csv','independent_signatures':2,'occurrences':3,'within_P1_signature_P2_occurrences':3},customer_mode_impact=c['customer_impact'],parallelization=c['parallelization'],
 model_recommendations={'TRIVIAL_DATA':'GPT-6 SOL MEDIUM','DATA_BATCH':'GPT-6 SOL HIGH','SMALL_CODE':'GPT-6 ASTRA EXTRA HIGH','SOURCE_RESEARCH':'GPT-6 ASTRA EXTRA HIGH'},
 recommendation={'first_batch':'B-001','reason':'Confirmed unsupported MC Delkasko coverage; exact bounded authoring condition with own-source controls'},
 next_step='Human review of this triage, then explicitly authorize B-001; do not implement now.',quality_checks={'status':'PENDING'},repo_integrity={'status':'PENDING'})
dump('triage.json',x)
print('Written detail, wave, policy, regression, first-batch and future-process documents.')
