import fs from 'node:fs';
import path from 'node:path';

const dir='/private/tmp/forsikringsassistent-product-audit';
const audit=JSON.parse(fs.readFileSync(path.join(dir,'product-comparison-audit.json'),'utf8'));
const esc=(v='')=>String(v).replaceAll('|','\\|').replaceAll('\n',' ');
const n=(v)=>new Intl.NumberFormat('nb-NO').format(v);
const lines=[];
const h=(level,text)=>{lines.push(`${'#'.repeat(level)} ${text}`,'');};
const p=(text)=>lines.push(text,'');
const list=(items)=>{for(const item of items)lines.push(`- ${item}`);lines.push('');};
const table=(headers,rows)=>{lines.push(`| ${headers.join(' | ')} |`,`| ${headers.map(()=> '---').join(' | ')} |`);for(const row of rows)lines.push(`| ${row.map(esc).join(' | ')} |`);lines.push('');};

h(1,'Forsikringsassistenten Produktsammenligning Audit');
p(`Audit gjennomført ${audit.metadata.audit_timestamp} mot git HEAD \`${audit.metadata.git_head}\`. Arbeidskopien var ${audit.metadata.git_status_baseline === '(clean)' ? 'ren' : 'lokalt endret'} ved start.`);
h(2,'Executive summary');
p(`Auditen kjørte ${n(audit.aggregates.primary_comparisons)} primære sammenligninger og ${n(audit.aggregates.control_executions)} kontrollkjøringer på ${n(audit.catalog.directly_exercised_products)} av ${n(audit.catalog.eligible_products)} eligible katalogprodukter. Alle ${audit.catalog.eligible_families.length} produktfamilier og alle eligible providers i hver familie ble representert. Katalogen inneholder ${n(audit.catalog.total_products)} produkter; to historiske Eika Reise-produkter ble korrekt utelatt.`);
p(`Detektoren registrerte ${n(audit.aggregates.flag_occurrences)} forekomster fordelt på ${n(audit.aggregates.unique_issue_signatures)} dedupliserte issue signatures. De største mønstrene gjelder gjentatt visningshierarki, kundespesifikke referanser og produktspesifikke detaljer. ${n(audit.aggregates.pdf_customer_relevance.LIKELY_SHARED ?? 0)} forekomster er klassifisert som mulige delte problemstillinger for produkt- og PDF-/avtalesammenligning; dette er en arkitekturprioritering, ikke en bekreftet feil.`);
p(`Alle ti determinismekontroller og alle ni sidebytter var stabile. De ti representative UI-krysskontrollene brukte den faktiske React-komponenten via server-side rendering og samsvarte med runtime-dataene. Auditen utløste null AI-kall, PDF-operasjoner eller runtime-nettverkskall.`);
p('Auditflaggene er review candidates. Rapporten fastslår ikke hvilken forsikringsfortolkning som er riktig, og den rangerer ikke produkter eller selskaper.');

h(2,'Audit matrix');
table(['Familie','Eligible produkter','Providers testet','Primære','Kontroller','Flagg'],Object.entries(audit.matrix.by_family).map(([family,d])=>[family,d.eligible_products,`${d.tested_providers.length}/${d.eligible_providers.length}`,d.primary_comparisons,d.control_executions,d.flag_occurrences]));
p(`Planlagt: ${audit.aggregates.planned_executions}. Fullført: ${audit.aggregates.completed_executions}. Feilet: ${audit.aggregates.failed_executions}. Utvalget overrepresenterer innholdsrike produkter, kryssleverandørpar og kjente positive kontroller.`);

h(2,'Aggregate findings');
table(['Måling','Antall'],[
 ['Rendererte fakta',n(audit.aggregates.rendered_facts)],['Unknown-celler',n(audit.aggregates.unknown_cells)],['Unike side-lokale unknown-signaturer',n(audit.aggregates.unique_unknown_signatures)],['Produktspesifikke detaljer',n(audit.aggregates.provider_specific_details)],['Flaggforekomster',n(audit.aggregates.flag_occurrences)],['Dedupliserte issue signatures',n(audit.aggregates.unique_issue_signatures)]
]);

h(2,'Findings by reason code');
table(['Reason code','Forekomster'],Object.entries(audit.aggregates.reason_code_distribution).sort((a,b)=>b[1]-a[1]).map(([key,value])=>[key,n(value)]));

h(2,'Root cause cluster candidates');
p('Klyngene angir et sannsynlig teknisk undersøkelseslag. De beviser ikke root cause.');
table(['Lag','Unike signaturer','Forekomster','Familier','PDF-relevans'],audit.root_cause_clusters.sort((a,b)=>b.occurrences-a.occurrences).map(c=>[c.layer,c.unique_signatures,c.occurrences,c.families.join(', '),Object.entries(c.pdf_relevance).map(([k,v])=>`${k}: ${v}`).join('; ')]));

h(2,'Potential relevance for agreement and PDF comparison');
table(['Klassifisering','Forekomster'],Object.entries(audit.aggregates.pdf_customer_relevance).map(([key,value])=>[key,value]));
p('LIKELY_SHARED omfatter mønstre rundt statusoppløsning, canonical identitet, parent/child-relasjoner, tilleggstilstand og mulig konseptoverlapp. PRODUCT_MODE_ONLY omfatter særlig visningshierarki, interne etiketter, produktspesifikke detaljblokker og kundespesifikke referanser i ren produktmodus.');

h(2,'Ikke dokumentert analyse');
p(`Runtime viste ${n(audit.unknown_analysis.raw_occurrences)} unknown-forekomster og ${n(audit.unknown_analysis.unique_signatures)} unike side-lokale signaturer. Detektoren fyller aldri en manglende verdi fra en annen leverandør.`);
table(['Klassifisering','Antall'],Object.entries(audit.unknown_analysis.classification_distribution).sort((a,b)=>b[1]-a[1]).map(([key,value])=>[key,value]));
p('INSUFFICIENT_EVIDENCE betyr at dagens katalog ikke gir nok grunnlag for sikker auditklassifisering. LIKELY_TRUE_UNKNOWN er en katalog-/presentasjonsdiagnose, ikke en påstand om at dekningen mangler i forsikringen.');

h(2,'Known positive controls');
table(['Kontroll','Surfaced','Reason code'],audit.known_positive_controls.map(c=>[c.name,c.surfaced?'JA':'NEI',c.reason_code]));
p(`Detektorkvalitet etter manuell, stratifisert sample review: **${audit.metadata.manual_sample_review.detector_quality}**. Det ble kontrollert ${audit.metadata.manual_sample_review.flagged_findings_reviewed.length} flaggede funn, ${audit.metadata.manual_sample_review.unflagged_rows_reviewed.length} uflaggede rader, ${audit.metadata.manual_sample_review.unknown_classifications_reviewed.length} unknown-klassifiseringer, ${audit.metadata.manual_sample_review.provider_specific_candidates_reviewed.length} produktspesifikke kandidater og ${audit.metadata.manual_sample_review.provenance_chains_reviewed.length} provenance-kjeder.`);

h(2,'Source and provenance');
p(`${n(audit.source_provenance.facts_checked)} fact/source-koblinger ble kontrollert. Det ble ikke funnet kandidatavvik for provider, forsikringstype, agreement scope, product ID, version eller manglende source record.`);
table(['Kildetype','Fact-koblinger'],Object.entries(audit.source_provenance.source_type_distribution).map(([key,value])=>[key,value]));

h(2,'Customer-specific references');
p(`${n(audit.aggregates.reason_code_distribution.CUSTOMER_SPECIFIC_REFERENCE ?? 0)} forekomster viser fakta der hovedverdien er utsatt til forsikringsbeviset eller kundens avtalte verdi. Dette kan være nyttig i PDF-/avtalesammenligning, men er en review candidate i ren produktsammenligning.`);

h(2,'Presentation and navigation');
p(`${n(audit.aggregates.reason_code_distribution.DUPLICATE_DISPLAY_LABEL ?? 0)} forekomster viser tre like nivåer i seksjon, gruppe og rad. ${n(audit.aggregates.reason_code_distribution.INTERNAL_LABEL_LEAK ?? 0)} forekomster viser interne etiketter som «avtale – geografi» eller «avtale – sesong». Alle navigasjonsmål var unike og alle representative React-krysskontroller matchet runtimevisningen.`);

h(2,'Status and text requiring review');
for(const signature of audit.issue_signatures.filter(s=>['STATUS_TEXT_CONTRADICTION','POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION','OPTIONAL_INCLUDED_CONFLICT'].includes(s.reason_code)).sort((a,b)=>b.occurrence_count-a.occurrence_count)){
  h(3,`${signature.reason_code} ${signature.issue_signature}`);
  p(`Forekomster: ${signature.occurrence_count}. Familier: ${signature.families.join(', ')}. Providers: ${signature.providers.join(', ')}. Mulig PDF-relevans: ${signature.potential_customer_pdf_relevance}.`);
  for(const e of signature.representative_evidence) list([`Comparison: \`${e.comparison_id}\``,`Seksjon og label: ${e.section} / ${e.visible_label}`,`Rå visning: ${e.raw_rendered_evidence}`,`Kilde: ${e.source_document_ref || 'ikke registrert i finding-raden'}`]);
}

h(2,'Possible overlapping concepts');
p('Disse funnene krever kontroll av canonical struktur og kildegrunnlag. Rapporten konkluderer ikke med at fakta er like.');
for(const signature of audit.issue_signatures.filter(s=>['POSSIBLE_DUPLICATE_CONCEPT','SAME_CONCEPT_DIFFERENT_STRUCTURE','PARENT_CONTAINS_CHILD_CANDIDATE'].includes(s.reason_code))) p(`- **${signature.reason_code}** ${signature.issue_signature}: ${signature.occurrence_count} forekomster; ${signature.providers.join(', ')}; ${signature.representative_evidence.map(e=>e.visible_label).join(' / ')}.`);

h(2,'Product-specific details');
p(`${n(audit.aggregates.reason_code_distribution.PROVIDER_SPECIFIC_NOT_COMPARABLE ?? 0)} forekomster ble beholdt som én-sidige produktspesifikke detaljer. Dette er en presentasjonshypotese: detaljene kan være rådgivernyttige uten at systemet tvinger frem en misvisende tom motpart.`);

for(const family of audit.catalog.eligible_families){
  h(2,family);
  const d=audit.matrix.by_family[family];
  p(`Providers testet: ${d.tested_providers.join(', ')}. Produkter i eligible katalog: ${d.eligible_products}. Primære sammenligninger: ${d.primary_comparisons}. Kontrollkjøringer: ${d.control_executions}. Flaggforekomster: ${d.flag_occurrences}.`);
  table(['Reason code','Antall'],Object.entries(d.common_reason_codes).sort((a,b)=>b[1]-a[1]).map(([key,value])=>[key,value]));
  const familyComparisons=audit.comparisons.filter(c=>c.status==='COMPLETED'&&c.insurance_type===family&&c.primary);
  for(const c of familyComparisons){
    h(3,`${c.first.product.company} ${c.first.product.product_name} mot ${c.second.product.company} ${c.second.product.product_name}`);
    p(`Comparison ID: \`${c.comparison_id}\`. Valggrunn: ${c.selection_reasons.join(', ')}. Seksjoner: ${c.metrics.rendered_section_count}. Rendererte fakta: ${c.metrics.rendered_fact_count}. Direkte rader: ${c.metrics.directly_comparable_rows}. Én-sidige rader: ${c.metrics.one_sided_rows}. Unknown-celler: ${c.metrics.unknown_cells}. Flagg: ${c.metrics.flag_count}.`);
    const fsFor=audit.findings.filter(f=>f.comparison_id===c.comparison_id);
    if(!fsFor.length){p('Ingen auditflagg i denne sammenligningen.');continue;}
    table(['Flagg','Seksjon','Synlig label','Side','Rå evidens'],fsFor.slice(0,24).map(f=>[f.reason_code,f.section,f.visible_label,f.side,f.raw_rendered_evidence]));
    if(fsFor.length>24)p(`${fsFor.length-24} ytterligere flagg finnes i full JSON og findings CSV.`);
  }
}

h(2,'Cross-family patterns');
for(const cluster of audit.root_cause_clusters.sort((a,b)=>b.occurrences-a.occurrences)) p(`- **${cluster.layer}**: ${cluster.unique_signatures} unike signaturer, ${cluster.occurrences} forekomster, familier ${cluster.families.join(', ')}. HYPOTESE – IKKE VERIFISERT ROOT CAUSE.`);

h(2,'Representative comparisons');
const reps=audit.comparisons.filter(c=>c.status==='COMPLETED'&&c.primary).filter((c,i,a)=>a.findIndex(x=>x.insurance_type===c.insurance_type)===i);
for(const c of reps){
  h(3,`${c.insurance_type} ${c.first.product.company} ${c.first.product.product_name} mot ${c.second.product.company} ${c.second.product.product_name}`);
  p(`Seksjonsrekkefølge: ${c.rendered_sections.map(s=>s.label).join(' → ')}.`);
  for(const row of c.rendered_rows.slice(0,5)) list([`${row.section_label} / ${row.label}`,`Produkt A: ${row.first.text}`,`Produkt B: ${row.second.text}`,`Kildetyper: ${[...new Set([...row.first.sources,...row.second.sources].map(s=>s.sourceType==='ipid'?'IPID / produktark':s.sourceType==='product_page'?'Produktside':'Offentlig vilkår'))].join(', ') || 'ingen'} `]);
}

h(2,'Technical appendix');
h(3,'Issue signatures');
table(['Signature','Reason','Forekomster','Familier','Providers','Lag','PDF-relevans'],audit.issue_signatures.map(s=>[s.issue_signature,s.reason_code,s.occurrence_count,s.families.join(', '),s.providers.join(', '),s.likely_technical_layer,s.potential_customer_pdf_relevance]));
h(3,'Full comparison log');
table(['Comparison ID','Familie','Produkt A','Produkt B','Type','Status','Flagg'],audit.comparisons.map(c=>[c.comparison_id,c.insurance_type,c.first?`${c.first.product.company} ${c.first.product.product_name}`:'',c.second?`${c.second.product.company} ${c.second.product.product_name}`:'',c.primary?'PRIMARY':c.control_type,c.status,c.metrics?.flag_count??0]));

h(2,'Limitations');
list(audit.limitations);
p('Auditen vurderer programvarerepresentasjonen. Den sertifiserer ikke fullstendig juridisk dekningsfortolkning. De 162 eligible produktene er heller ikke alle mulige norske forsikringsprodukter.');

h(2,'Next analysis input');
p('Bruk `root-cause-input.json` sammen med denne rapporten i en separat GPT-6 root-cause- og correctness-oppgave. Neste oppgave bør først kontrollere dedupliserte signaturer mot kode og katalogkilder, og deretter avgjøre hvilke representative funn som trenger regresjonstester. Denne auditen gjør ingen rettelser.');

fs.writeFileSync(path.join(dir,'product-comparison-audit.md'),lines.join('\n'),'utf8');
console.log(JSON.stringify({status:'MARKDOWN_READY',lines:lines.length,bytes:fs.statSync(path.join(dir,'product-comparison-audit.md')).size}));
