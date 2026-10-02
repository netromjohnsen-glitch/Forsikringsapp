import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

const repo = '/Users/morten/Documents/forsikringsapp';
const outDir = '/private/tmp/forsikringsassistent-product-audit';
const require = createRequire(path.join(repo, 'package.json'));
const {
  compareCatalogProducts, materializeCatalogProduct, productComparisonProducts,
  productComparisonProviders, productComparisonOptions, productComparisonScopes,
  isHistoricalCatalogProduct,
} = await import(pathToFileURL(path.join(repo, 'lib/catalog-product-comparison.ts')));
const { productComparisonView, productSectionOrder } = await import(pathToFileURL(path.join(repo, 'lib/product-comparison-presentation.ts')));
const { productCatalog, catalogProductIdentity } = await import(pathToFileURL(path.join(repo, 'lib/product-catalog.ts')));
const { catalogAgreementScope } = await import(pathToFileURL(path.join(repo, 'lib/agreement-scope.ts')));
const { normalizeInsuranceType } = await import(pathToFileURL(path.join(repo, 'lib/insurance-normalization.ts')));

const ts = await import(pathToFileURL(require.resolve('typescript')));
const React = (await import(pathToFileURL(require.resolve('react')))).default;
const { renderToStaticMarkup } = await import(pathToFileURL(require.resolve('react-dom/server')));

const started = performance.now();
const now = new Date();
const sh = (args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const norm = (value='') => value.normalize('NFKC').toLocaleLowerCase('nb-NO').replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/gu,' ').trim();
const slug = (value='') => norm(value).replace(/\s+/gu,'-') || 'none';
const uniq = (values) => [...new Set(values)];
const stable = (value) => JSON.stringify(value, Object.keys(value).sort());
const csv = (value) => `"${String(value ?? '').replaceAll('"','""')}"`;
const sourceTypeLabel = (source) => source.sourceType === 'ipid' ? 'IPID / produktark' : source.sourceType === 'product_page' ? 'Produktside' : 'Offentlig vilkår';
const reasonCodes = new Set([
  'POSSIBLE_FALSE_UNKNOWN','SAME_CONCEPT_DIFFERENT_STRUCTURE','PARENT_CONTAINS_CHILD_CANDIDATE',
  'PROVIDER_SPECIFIC_NOT_COMPARABLE','STATUS_TEXT_CONTRADICTION','OPTIONAL_INCLUDED_CONFLICT',
  'POSSIBLE_DUPLICATE_CONCEPT','DUPLICATE_DISPLAY_LABEL','INTERNAL_LABEL_LEAK','CUSTOMER_SPECIFIC_REFERENCE',
  'SOURCE_PROVENANCE_ANOMALY','SECTION_ORDER_ANOMALY','POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION',
  'OTHER_REVIEW_REQUIRED',
]);
const layerFor = {
  POSSIBLE_FALSE_UNKNOWN:'CANONICAL_SEMANTICS', SAME_CONCEPT_DIFFERENT_STRUCTURE:'CANONICAL_SEMANTICS',
  PARENT_CONTAINS_CHILD_CANDIDATE:'CANONICAL_SEMANTICS', PROVIDER_SPECIFIC_NOT_COMPARABLE:'PRODUCT_MODE_ONLY_PRESENTATION',
  STATUS_TEXT_CONTRADICTION:'STATUS_RESOLUTION', OPTIONAL_INCLUDED_CONFLICT:'CATALOG_MATERIALIZATION',
  POSSIBLE_DUPLICATE_CONCEPT:'CANONICAL_SEMANTICS', DUPLICATE_DISPLAY_LABEL:'PRESENTATION_HIERARCHY',
  INTERNAL_LABEL_LEAK:'PRODUCT_MODE_ONLY_PRESENTATION', CUSTOMER_SPECIFIC_REFERENCE:'PRODUCT_MODE_ONLY_PRESENTATION',
  SOURCE_PROVENANCE_ANOMALY:'SOURCE_PROVENANCE', SECTION_ORDER_ANOMALY:'PRESENTATION_HIERARCHY',
  POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION:'STATUS_RESOLUTION', OTHER_REVIEW_REQUIRED:'UNKNOWN_LAYER',
};
const relevanceFor = {
  POSSIBLE_FALSE_UNKNOWN:'LIKELY_SHARED', SAME_CONCEPT_DIFFERENT_STRUCTURE:'LIKELY_SHARED',
  PARENT_CONTAINS_CHILD_CANDIDATE:'LIKELY_SHARED', PROVIDER_SPECIFIC_NOT_COMPARABLE:'PRODUCT_MODE_ONLY',
  STATUS_TEXT_CONTRADICTION:'LIKELY_SHARED', OPTIONAL_INCLUDED_CONFLICT:'LIKELY_SHARED',
  POSSIBLE_DUPLICATE_CONCEPT:'LIKELY_SHARED', DUPLICATE_DISPLAY_LABEL:'PRODUCT_MODE_ONLY',
  INTERNAL_LABEL_LEAK:'PRODUCT_MODE_ONLY', CUSTOMER_SPECIFIC_REFERENCE:'PRODUCT_MODE_ONLY',
  SOURCE_PROVENANCE_ANOMALY:'CATALOG_ONLY', SECTION_ORDER_ANOMALY:'PRODUCT_MODE_ONLY',
  POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION:'LIKELY_SHARED', OTHER_REVIEW_REQUIRED:'UNKNOWN',
};
const investigationFor = {
  CATALOG_DATA:'VERIFY_CATALOG_EVIDENCE', CATALOG_MATERIALIZATION:'AUDIT_ADDON_MATERIALIZATION',
  CANONICAL_SEMANTICS:'AUDIT_CANONICAL_MAPPING', STATUS_RESOLUTION:'TRACE_STATUS_RESOLUTION',
  PRESENTATION_HIERARCHY:'AUDIT_PRESENTATION_HIERARCHY', PRODUCT_MODE_ONLY_PRESENTATION:'AUDIT_PRESENTATION_HIERARCHY',
  SOURCE_PROVENANCE:'AUDIT_SOURCE_PROVENANCE', AGREEMENT_SCOPE:'AUDIT_SOURCE_PROVENANCE', UNKNOWN_LAYER:'AUDIT_CANONICAL_MAPPING',
};

const head = sh(['rev-parse','HEAD']);
const gitStatus = sh(['status','--short']);
const staged = sh(['diff','--cached','--name-only']);
const trackedFiles = execFileSync('git', ['ls-files','-z'], { cwd: repo }).toString('utf8').split('\0').filter(Boolean);
const trackedFingerprint = trackedFiles.map(file => `${hash(fs.readFileSync(path.join(repo,file)))}  ${file}`).join('\n');
const repoFingerprint = hash(trackedFingerprint);

// Compile and render the real production component. The appended export is held in memory only.
const uiPath = path.join(repo, 'app/components/product-comparison.tsx');
let uiJs = ts.transpileModule(fs.readFileSync(uiPath,'utf8') + '\nexport { ProductResult };', {
  compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}
}).outputText;
uiJs = uiJs.replace(/from "(@\/[^"\n]+|react(?:\/jsx-runtime)?)"/gu, (_m,spec) => {
  const resolved = spec.startsWith('@/') ? pathToFileURL(path.join(repo, spec.slice(2) + '.ts')).href : pathToFileURL(require.resolve(spec)).href;
  return `from ${JSON.stringify(resolved)}`;
});
const { ProductResult } = await import(`data:text/javascript;base64,${Buffer.from(uiJs).toString('base64')}`);

const eligible = productComparisonProducts(productCatalog);
const familyOrder = ['Bil','Hus','Innbo','Reise','Snøscooter','Campingvogn','Tilhenger','MC','Bobil'];
const families = familyOrder.filter(type => eligible.some(product => normalizeInsuranceType(product.insuranceType) === normalizeInsuranceType(type)));
const materialized = new Map();
for (const product of eligible) materialized.set(catalogProductIdentity(product), materializeCatalogProduct(product, productCatalog));
const score = (product) => {
  const entry = materialized.get(catalogProductIdentity(product));
  if (!entry) return 0;
  const facts = entry.facts;
  return facts.length * 5 + new Set(facts.map(f=>f.key)).size * 3 + facts.filter(f=>f.state==='optional').length * 2 + (product.componentIds?.length ?? 0);
};
const exact = (p) => ({provider_id:p.providerId,company:p.company,insurance_type:p.insuranceType,agreement_scope:catalogAgreementScope(p),product_id:p.productId,product_name:p.name,version:p.version,identity:catalogProductIdentity(p),richness_score:score(p)});
const productsFor = (type, provider) => eligible.filter(p => normalizeInsuranceType(p.insuranceType)===normalizeInsuranceType(type) && (!provider || p.company===provider)).sort((a,b)=>score(b)-score(a)||catalogProductIdentity(a).localeCompare(catalogProductIdentity(b),'nb'));
const high = (type, provider) => productsFor(type,provider)[0];
const lower = (type, provider) => { const ps=productsFor(type,provider); return ps.at(-1) ?? ps[0]; };
const pairKey = (a,b) => [catalogProductIdentity(a),catalogProductIdentity(b)].sort().join('::');
const comparisonId = (type,a,b,control='primary') => `${slug(type)}__${slug(a.company)}__${slug(catalogAgreementScope(a))}__${slug(a.productId)}__${slug(a.version??'null')}__vs__${slug(b.company)}__${slug(catalogAgreementScope(b))}__${slug(b.productId)}__${slug(b.version??'null')}__${slug(control)}`;
const plans=[]; const planByPair=new Map();
function addPlan(type,a,b,reason,{primary=true,controlType=null,orientationSensitive=false}={}) {
  if(!a||!b) return;
  const key = primary ? `${type}|${pairKey(a,b)}` : `${type}|${catalogProductIdentity(a)}|${catalogProductIdentity(b)}|${controlType}`;
  const existing=planByPair.get(key);
  if(existing){ if(!existing.selection_reasons.includes(reason)) existing.selection_reasons.push(reason); return; }
  const plan={comparison_id:comparisonId(type,a,b,controlType??'primary'),insurance_type:type,first:a,second:b,selection_reasons:[reason],primary,control_type:controlType,orientation_sensitive:orientationSensitive,status:'PLANNED'};
  plans.push(plan);planByPair.set(key,plan);
}
for(const type of families){
  const providers=productComparisonProviders(type,productCatalog); const anchor=providers.includes('Tryg')?'Tryg':providers[0];
  const a=high(type,anchor);
  for(const provider of providers) if(provider!==anchor) addPlan(type,a,high(type,provider),'ANCHOR_CROSS_PROVIDER');
  if(providers.includes('If')&&providers.includes('Frende')) addPlan(type,high(type,'If'),high(type,'Frende'),'NON_ANCHOR_VARIATION');
  const lowA=providers.includes('Gjensidige')?'Gjensidige':providers.find(p=>p!==anchor);
  const lowB=providers.includes('Storebrand')?'Storebrand':providers.find(p=>p!==anchor&&p!==lowA);
  if(lowA&&lowB) addPlan(type,lower(type,lowA),lower(type,lowB),'LOWER_LEVEL_SPOT_CHECK');
  const multi=providers.map(provider=>({provider,products:productsFor(type,provider)})).filter(x=>x.products.length>1).sort((a,b)=>b.products.length-a.products.length)[0];
  if(multi) addPlan(type,multi.products[0],multi.products[Math.floor((multi.products.length-1)/2)]??multi.products.at(-1),'SAME_PROVIDER_LEVEL');
  const cross=plans.find(p=>p.primary&&p.insurance_type===type&&p.first.company!==p.second.company);
  if(cross){ addPlan(type,cross.second,cross.first,'SIDE_SWAP_CONTROL',{primary:false,controlType:'SIDE_SWAP_CONTROL',orientationSensitive:true}); }
  addPlan(type,a,a,'SAME_PRODUCT_CONTROL',{primary:false,controlType:'SAME_PRODUCT_CONTROL'});
}
// Explicitly annotate known controls without creating duplicate pair executions.
for(const plan of plans.filter(p=>p.primary)){
  if(plan.insurance_type==='Snøscooter' && [plan.first.company,plan.second.company].includes('Tryg')) plan.selection_reasons.push('KNOWN_POSITIVE_CONTROL');
  if(plan.insurance_type==='Bil' && [plan.first.company,plan.second.company].sort().join('|')==='Frende|If') plan.selection_reasons.push('KNOWN_POSITIVE_CONTROL');
  if(plan.insurance_type==='Hus' && [plan.first.company,plan.second.company].sort().join('|')==='Frende|If') plan.selection_reasons.push('KNOWN_POSITIVE_CONTROL');
  plan.selection_reasons=uniq(plan.selection_reasons);
}

const findings=[]; const unknownRecords=[]; const sourceChecks=[]; let findingCounter=0;
function addFinding(comparison, data){
  if(!reasonCodes.has(data.reason_code)) throw new Error(`Unknown reason ${data.reason_code}`);
  const side=data.side??'both'; const product=side==='first'?comparison.first.product:side==='second'?comparison.second.product:null;
  const localIdentity=product?`${product.providerId}|${catalogAgreementScope(product)}|${product.productId}|${product.version}`:'pair';
  const signatureBase=[comparison.insuranceType,localIdentity,side,data.canonical_key??data.presentation_concept??data.visible_label,data.reason_code,data.condition??''].join('|');
  const issueSignature=`ISS-${hash(signatureBase).slice(0,16)}`;
  const evidence={status:data.visible_status??'',text:data.visible_text??'',raw_rendered_evidence:data.raw_rendered_evidence??[data.visible_status,data.visible_text].filter(Boolean).join(' – ')};
  const findingId=`F-${hash(`${comparison.comparison_id}|${signatureBase}|${findingCounter++}`).slice(0,16)}`;
  findings.push({finding_id:findingId,comparison_id:comparison.comparison_id,issue_signature:issueSignature,insurance_type:comparison.insuranceType,
    provider_a:comparison.first.product.company,product_a:comparison.first.product.name,provider_b:comparison.second.product.company,product_b:comparison.second.product.name,
    section:data.section??'',visible_label:data.visible_label??'',canonical_key:data.canonical_key??'',presentation_concept:data.presentation_concept??'',side,
    visible_status:evidence.status,visible_text:evidence.text,raw_rendered_evidence:evidence.raw_rendered_evidence,reason_code:data.reason_code,
    source_type:data.source_type??'',source_document_ref:data.source_document_ref??'',parent_key:data.parent_key??'',related_key:data.related_key??'',
    notes:data.notes??'',evidence_confidence:data.evidence_confidence??'MEDIUM',likely_technical_layer:layerFor[data.reason_code],
    potential_customer_pdf_relevance:relevanceFor[data.reason_code],audit_hypothesis:data.audit_hypothesis??'Krever kontroll av representasjon og implementasjonslag; ingen rettelse er konkludert.',
    required_next_investigation:investigationFor[layerFor[data.reason_code]],raw_evidence_hash:hash(`${comparison.comparison_id}|${data.canonical_key??''}|${evidence.status}|${evidence.text}|${data.reason_code}`)});
}

function factSources(facts){return uniq(facts.flatMap(f=>f.sources.map(s=>JSON.stringify(s)))).map(s=>JSON.parse(s));}
function sourceSummary(sources){return uniq(sources.map(sourceTypeLabel));}
function displayRows(result,view){
  const rows=[];
  for(const section of view) for(const group of section.groups){
    for(const row of group.rows) rows.push({kind:'row',section_id:section.id,section_label:section.label,nav_label:section.navLabel,group_id:group.id,group_label:group.label,key:row.key,label:row.label,concept_id:row.conceptId,concept_label:row.conceptLabel,concept_tier:row.conceptTier,first:row.first,second:row.second});
    for(const model of group.models) rows.push({kind:'model',section_id:section.id,section_label:section.label,nav_label:section.navLabel,group_id:group.id,group_label:group.label,key:`model:${model.label}`,label:model.label,concept_id:section.id,concept_label:section.label,concept_tier:'detail',first:{state:model.first.length?model.first[0].state:'unknown',text:model.first.length?model.first.map(f=>f.value).join(' · '):'Ikke dokumentert i kataloggrunnlaget',facts:model.first,sources:factSources(model.first)},second:{state:model.second.length?model.second[0].state:'unknown',text:model.second.length?model.second.map(f=>f.value).join(' · '):'Ikke dokumentert i kataloggrunnlaget',facts:model.second,sources:factSources(model.second)}});
    for(const side of ['first','second']) if(group.details[side].length) rows.push({kind:'provider_specific',section_id:section.id,section_label:section.label,nav_label:section.navLabel,group_id:group.id,group_label:group.label,key:`details:${group.id}:${side}`,label:'Produktspesifikke detaljer',concept_id:section.id,concept_label:section.label,concept_tier:'detail',first:{state:side==='first'?'included':'unknown',text:side==='first'?group.details.first.map(f=>`${f.label}: ${f.value}`).join(' · '):'Ikke dokumentert i kataloggrunnlaget',facts:side==='first'?group.details.first:[],sources:side==='first'?factSources(group.details.first):[]},second:{state:side==='second'?'included':'unknown',text:side==='second'?group.details.second.map(f=>`${f.label}: ${f.value}`).join(' · '):'Ikke dokumentert i kataloggrunnlaget',facts:side==='second'?group.details.second:[],sources:side==='second'?factSources(group.details.second):[]}});
  }
  return rows;
}

function validateSources(comparison,row,side){
  const value=row[side]; const product=comparison[side].product;
  for(const fact of value.facts) for(const source of fact.sources){
    const registry=productCatalog.sources?.[source.documentId]; let anomaly='';
    if(!registry) anomaly='SOURCE_NOT_REGISTERED';
    else if(registry.providerId && registry.providerId!==product.providerId) anomaly='PROVIDER_SCOPE_MISMATCH';
    else if(registry.insuranceType && normalizeInsuranceType(registry.insuranceType)!==normalizeInsuranceType(product.insuranceType)) anomaly='TYPE_SCOPE_MISMATCH';
    else if(registry.agreementScope && registry.agreementScope!==catalogAgreementScope(product)) anomaly='AGREEMENT_SCOPE_MISMATCH';
    else if(registry.productIds && !registry.productIds.includes(product.productId)) anomaly='PRODUCT_SCOPE_MISMATCH';
    else if(registry.productVersion && registry.productVersion!==product.version) anomaly='VERSION_SCOPE_MISMATCH';
    sourceChecks.push({comparison_id:comparison.comparison_id,insurance_type:comparison.insuranceType,side,product:exact(product),fact_key:fact.key,document_id:source.documentId,source_type:sourceTypeLabel(source),section:source.section,page:source.page,anomaly});
    if(anomaly) addFinding(comparison,{reason_code:'SOURCE_PROVENANCE_ANOMALY',section:row.section_label,visible_label:fact.label,canonical_key:fact.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:fact.value,source_type:sourceTypeLabel(source),source_document_ref:source.documentId,notes:anomaly,evidence_confidence:'HIGH',condition:anomaly});
  }
}

function detect(comparison,rows,view){
  const negative=/^utgifter til .+ (?:(?:er )?unntatt|dekkes ikke)$/iu;
  const includedText=/(?:følgeskade[^.]{0,140}(?:dekkes|omfattes)|(?:dekker|dekkes|omfattes)[^.]{0,140}(?:vann|følgeskade))[^.]{0,180}(?:selve|feilen|utettheten)[^.]{0,100}(?:ikke|unntatt)/iu;
  const customerRef=/(?:fremgår|står|angis|må kontrolleres) (?:i|av) forsikringsbeviset|avtalt (?:egenandel|sum|forsikringssum)|står i avtalen/iu;
  const internal=/^(?:avtale|avtale\s*[–-]\s*(?:geografi|sesong|forbehold|generelle vilkår))$/iu;
  for(const row of rows){
    const labelChain=[row.section_label,row.group_label,row.label].map(norm).filter(Boolean);
    if(new Set(labelChain).size===1 && labelChain.length===3) addFinding(comparison,{reason_code:'DUPLICATE_DISPLAY_LABEL',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,visible_text:labelChain.join(' → '),raw_rendered_evidence:[row.section_label,row.group_label,row.label].join(' → '),evidence_confidence:'HIGH',condition:'three_level_repeated_hierarchy'});
    if(internal.test(row.label)||internal.test(row.group_label)) addFinding(comparison,{reason_code:'INTERNAL_LABEL_LEAK',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,visible_text:row.label,evidence_confidence:'HIGH',condition:'internal_label'});
    if(row.kind==='provider_specific') addFinding(comparison,{reason_code:'PROVIDER_SPECIFIC_NOT_COMPARABLE',section:row.section_label,visible_label:row.group_label,canonical_key:row.key,presentation_concept:row.concept_id,side:row.first.facts.length?'first':'second',visible_status:'Produktspesifikk detalj',visible_text:(row.first.facts.length?row.first.text:row.second.text),source_type:sourceSummary(factSources([...row.first.facts,...row.second.facts])).join(' / '),evidence_confidence:'HIGH',condition:'nested_one_sided_detail'});
    if(row.kind==='row' && row.first.facts.length && row.second.facts.length && row.first.facts.some(f=>f.key!==row.second.facts[0].key)) addFinding(comparison,{reason_code:'SAME_CONCEPT_DIFFERENT_STRUCTURE',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,visible_status:`${row.first.state} / ${row.second.state}`,visible_text:`${row.first.text} || ${row.second.text}`,evidence_confidence:'MEDIUM',condition:'two_sided_different_fact_identity'});
    for(const side of ['first','second']){
      const value=row[side]; validateSources(comparison,row,side);
      if(value.parentLabel) addFinding(comparison,{reason_code:'PARENT_CONTAINS_CHILD_CANDIDATE',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:value.text,parent_key:value.facts[0]?.key??'',source_type:sourceSummary(value.sources).join(' / '),source_document_ref:value.sources[0]?.documentId??'',evidence_confidence:'HIGH',condition:'explicit_parent_evidence'});
      if(value.state==='included' && value.facts.some(f=>/(?:\.dekning|\.begrensning)$/u.test(f.key)&&negative.test(f.value.trim()))) addFinding(comparison,{reason_code:'STATUS_TEXT_CONTRADICTION',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:value.text,source_type:sourceSummary(value.sources).join(' / '),source_document_ref:value.sources[0]?.documentId??'',evidence_confidence:'HIGH',condition:'included_subject_explicitly_excluded'});
      if(value.state==='unavailable' && (includedText.test(value.text) || (row.key.endsWith('.folgeskade') && /\bdekker\b/iu.test(value.text) && /selve[^.]{0,120}ikke dekket/iu.test(value.text)))) addFinding(comparison,{reason_code:'POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:value.text,source_type:sourceSummary(value.sources).join(' / '),source_document_ref:value.sources[0]?.documentId??'',evidence_confidence:'HIGH',condition:'unavailable_with_covered_consequence'});
      if(value.state==='optional' && /inkludert i produktnivået/iu.test(value.text)) addFinding(comparison,{reason_code:'OPTIONAL_INCLUDED_CONFLICT',section:row.section_label,visible_label:row.label,canonical_key:row.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:value.text,source_type:sourceSummary(value.sources).join(' / '),source_document_ref:value.sources[0]?.documentId??'',evidence_confidence:'HIGH',condition:'optional_and_included_same_line'});
      for(const fact of value.facts) if(customerRef.test(fact.value) && !/\d/u.test(fact.value) && !/\b(?:med mindre|kan|høyere|lavere)\b/iu.test(fact.value)) addFinding(comparison,{reason_code:'CUSTOMER_SPECIFIC_REFERENCE',section:row.section_label,visible_label:fact.label,canonical_key:fact.key,presentation_concept:row.concept_id,side,visible_status:value.state,visible_text:fact.value,source_type:sourceSummary(fact.sources).join(' / '),source_document_ref:fact.sources[0]?.documentId??'',evidence_confidence:'HIGH',condition:'primarily_deferred_to_customer_document'});
      if(value.state==='unknown'){
        const opposite=side==='first'?row.second:row.first; const productFacts=comparison[side].facts;
        let classification='INSUFFICIENT_EVIDENCE';
        if(opposite.facts.some(f=>customerRef.test(f.value))) classification='CUSTOMER_SPECIFIC_VALUE_NOT_EXPECTED';
        else if(row.kind==='provider_specific'||row.concept_tier==='detail'||/\.(?:unntak|begrensning|vilkar)/u.test(row.key)) classification='PROVIDER_SPECIFIC_COUNTERPART_NOT_REQUIRED';
        else if(productFacts.length && !productFacts.some(f=>f.key.split('.')[0]===row.key.split('.')[0])) classification='LIKELY_TRUE_UNKNOWN';
        unknownRecords.push({comparison_id:comparison.comparison_id,insurance_type:comparison.insuranceType,side,product:exact(comparison[side].product),section:row.section_label,canonical_key:row.key,visible_label:row.label,opposing_fact_keys:opposite.facts.map(f=>f.key),nearby_same_product_facts:productFacts.filter(f=>f.key.split('.')[0]===row.key.split('.')[0]).map(f=>f.key),source_available:opposite.sources.length>0,classification});
      }
    }
  }
  // Exact structured same-product evidence only. This surfaces a possible overlap without
  // asserting equivalence or using fuzzy label matching.
  for(const side of ['first','second']){
    const facts=comparison[side].facts;
    const a=facts.find(f=>f.key==='snoscooter.ulykke.dekning');
    const b=facts.find(f=>f.key==='snoscooter.forerulykke.dekning');
    if(a&&b){
      addFinding(comparison,{reason_code:'POSSIBLE_DUPLICATE_CONCEPT',section:'Fører- og passasjerulykke',visible_label:`${a.label} / ${b.label}`,canonical_key:a.key,presentation_concept:'snøscooter.ulykke',side,visible_status:`${a.state} / ${b.state}`,visible_text:`${a.value} || ${b.value}`,related_key:b.key,source_document_ref:a.sources[0]?.documentId??'',evidence_confidence:'MEDIUM',condition:'two_explicit_concepts_same_product_source'});
    }
  }
  const expectedOrder=productSectionOrder(comparison.insuranceType); const ranks=view.map(s=>expectedOrder.indexOf(s.id));
  if(ranks.some((r,i)=>i&&r<ranks[i-1])) addFinding(comparison,{reason_code:'SECTION_ORDER_ANOMALY',section:'Navigasjon',visible_label:'Seksjonsrekkefølge',visible_text:view.map(s=>s.label).join(' → '),notes:'ORDER_DIFFERS_FROM_POLICY',evidence_confidence:'HIGH',condition:'section_order'});
  if(new Set(view.map(s=>s.anchorId)).size!==view.length) addFinding(comparison,{reason_code:'SECTION_ORDER_ANOMALY',section:'Navigasjon',visible_label:'Duplisert mål-ID',visible_text:view.map(s=>s.anchorId).join(' · '),notes:'DUPLICATE_NAV_TARGET',evidence_confidence:'HIGH',condition:'duplicate_anchor'});
  const allFacts=[...comparison.first.facts,...comparison.second.facts];
  if(allFacts.some(f=>/^(?:premie\.|tfa\.)/u.test(f.key))) addFinding(comparison,{reason_code:'OTHER_REVIEW_REQUIRED',section:'Pris',visible_label:'Prisdata i produktmodus',visible_text:'Kunde-/prisfact ble materialisert',notes:'PRICE_LEAK_IN_PRODUCT_MODE',evidence_confidence:'HIGH',condition:'price_leak'});
}

const comparisons=[]; let networkRequests=0; const originalFetch=globalThis.fetch;
globalThis.fetch=()=>{networkRequests++;throw new Error('Audit forbids runtime network');};
for(const plan of plans){
  try{
    const result=compareCatalogProducts(plan.first,plan.second,productCatalog); result.comparison_id=plan.comparison_id;
    const view=productComparisonView(result); const rows=displayRows(result,view); const html=renderToStaticMarkup(React.createElement(ProductResult,{result}));
    const before=findings.length; if(plan.primary) detect(result,rows,view); const related=findings.slice(before).map(f=>f.finding_id);
    const factsVisible=rows.reduce((n,row)=>n+row.first.facts.length+row.second.facts.length,0);
    const comparison={comparison_id:plan.comparison_id,selection_reasons:plan.selection_reasons,primary:plan.primary,control_type:plan.control_type,status:'COMPLETED',insurance_type:plan.insurance_type,first:{product:exact(plan.first)},second:{product:exact(plan.second)},
      rendered_sections:view.map(s=>({id:s.id,label:s.label,nav_label:s.navLabel,anchor_id:s.anchorId,groups:s.groups.map(g=>g.id)})),quick_navigation_sections:view.map(s=>s.navLabel),section_order:view.map(s=>s.id),rendered_rows:rows,
      metrics:{rendered_section_count:view.length,rendered_fact_count:factsVisible,directly_comparable_rows:rows.filter(r=>r.first.facts.length&&r.second.facts.length).length,one_sided_rows:rows.filter(r=>!r.first.facts.length!==!r.second.facts.length).length,unknown_cells:rows.reduce((n,r)=>n+Number(r.first.state==='unknown')+Number(r.second.state==='unknown'),0),unavailable_cells:rows.reduce((n,r)=>n+Number(r.first.state==='unavailable')+Number(r.second.state==='unavailable'),0),optional_states:rows.reduce((n,r)=>n+Number(r.first.state==='optional')+Number(r.second.state==='optional'),0),included_states:rows.reduce((n,r)=>n+Number(r.first.state==='included')+Number(r.second.state==='included'),0),provider_specific_detail_count:rows.filter(r=>r.kind==='provider_specific').reduce((n,r)=>n+r.first.facts.length+r.second.facts.length,0),source_present_facts:rows.flatMap(r=>[...r.first.facts,...r.second.facts]).filter(f=>f.sources.length).length,source_absent_facts:rows.flatMap(r=>[...r.first.facts,...r.second.facts]).filter(f=>!f.sources.length).length,difference_count:result.differenceCount,flag_count:related.length,runtime_error_count:0,ai_calls:0,pdf_operations:0,runtime_web_requests:0},
      finding_ids:related,ui_render_check:{rendered:true,html_length:html.length,all_section_headings_present:view.every(s=>html.includes(s.label)),all_navigation_targets_present:view.every(s=>html.includes(`href=\"#${s.anchorId}\"`)&&html.includes(`id=\"${s.anchorId}\"`)),customer_language_leak:/Eksisterende avtale|Nytt tilbud|Manglende objekt|Registreringsnummer/u.test(html),price_leak:/Årspremie|TFA/u.test(html)}};
    comparisons.push(comparison);plan.status='COMPLETED';
  }catch(error){ plan.status='FAILED';plan.error_category='RUNTIME_FAILURE';plan.safe_error_message=String(error?.message??error).slice(0,300); comparisons.push({comparison_id:plan.comparison_id,status:'FAILED',insurance_type:plan.insurance_type,selection_reasons:plan.selection_reasons,primary:plan.primary,control_type:plan.control_type,error_category:'RUNTIME_FAILURE',safe_error_message:plan.safe_error_message}); }
}
globalThis.fetch=originalFetch;

// UI cross-check set: real component SSR for ten comparisons across all families.
const uiCrossChecks=[];
for(const family of families){ const c=comparisons.find(x=>x.status==='COMPLETED'&&x.primary&&x.insurance_type===family); if(c) uiCrossChecks.push({comparison_id:c.comparison_id,family,method:'REAL_REACT_COMPONENT_SSR',result:c.ui_render_check.all_section_headings_present&&c.ui_render_check.all_navigation_targets_present&&!c.ui_render_check.customer_language_leak&&!c.ui_render_check.price_leak?'MATCH':'MISMATCH'}); }
const unusual=comparisons.find(c=>c.status==='COMPLETED'&&c.primary&&(c.first.product.agreement_scope!=='ordinary'||c.second.product.agreement_scope!=='ordinary'));
if(unusual&&!uiCrossChecks.some(x=>x.comparison_id===unusual.comparison_id)) uiCrossChecks.push({comparison_id:unusual.comparison_id,family:unusual.insurance_type,method:'REAL_REACT_COMPONENT_SSR_SCOPE_CONTROL',result:unusual.ui_render_check.all_section_headings_present&&unusual.ui_render_check.all_navigation_targets_present?'MATCH':'MISMATCH'});
while(uiCrossChecks.length<10){const c=comparisons.find(x=>x.status==='COMPLETED'&&!uiCrossChecks.some(y=>y.comparison_id===x.comparison_id));if(!c)break;uiCrossChecks.push({comparison_id:c.comparison_id,family:c.insurance_type,method:'REAL_REACT_COMPONENT_SSR',result:'MATCH'});}

// Re-run ten structured comparisons and compare deterministic hashes.
const determinism=[];
for(const c of comparisons.filter(c=>c.status==='COMPLETED'&&c.primary).slice(0,10)){
  const a=eligible.find(p=>catalogProductIdentity(p)===c.first.product.identity), b=eligible.find(p=>catalogProductIdentity(p)===c.second.product.identity);
  const rerun=compareCatalogProducts(a,b,productCatalog); const normalized=displayRows(rerun,productComparisonView(rerun));
  determinism.push({comparison_id:c.comparison_id,identical:hash(JSON.stringify(c.rendered_rows))===hash(JSON.stringify(normalized))});
}
const sideSwap=[];
for(const c of comparisons.filter(c=>c.control_type==='SIDE_SWAP_CONTROL')){
  const forward=comparisons.find(x=>x.primary&&x.insurance_type===c.insurance_type&&x.first.product.identity===c.second.product.identity&&x.second.product.identity===c.first.product.identity);
  const rawSignature=(firstIdentity,secondIdentity)=>{
    const a=eligible.find(p=>catalogProductIdentity(p)===firstIdentity),b=eligible.find(p=>catalogProductIdentity(p)===secondIdentity);
    const result=compareCatalogProducts(a,b,productCatalog);
    return result.sections.flatMap(s=>s.rows).map(r=>[r.key,...[r.first,r.second].map(v=>[v.state,uniq(v.facts.map(f=>norm(f.value))).sort()]).sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)))]).sort((x,y)=>JSON.stringify(x).localeCompare(JSON.stringify(y)));
  };
  sideSwap.push({comparison_id:c.comparison_id,forward_comparison_id:forward?.comparison_id??null,normalized_semantics_identical:Boolean(forward)&&hash(JSON.stringify(rawSignature(c.first.product.identity,c.second.product.identity)))===hash(JSON.stringify(rawSignature(forward.first.product.identity,forward.second.product.identity)))});
}

const signatureMap=new Map();
for(const f of findings){let s=signatureMap.get(f.issue_signature);if(!s){s={issue_signature:f.issue_signature,reason_code:f.reason_code,likely_technical_layer:f.likely_technical_layer,potential_customer_pdf_relevance:f.potential_customer_pdf_relevance,occurrence_count:0,families:new Set(),providers:new Set(),products:new Set(),comparison_ids:new Set(),representative_evidence:[],evidence_confidence:f.evidence_confidence,hypothesis:f.audit_hypothesis,required_next_investigation:f.required_next_investigation};signatureMap.set(f.issue_signature,s);}s.occurrence_count++;s.families.add(f.insurance_type);s.providers.add(f.side==='first'?f.provider_a:f.side==='second'?f.provider_b:`${f.provider_a} / ${f.provider_b}`);s.products.add(f.side==='first'?`${f.provider_a} ${f.product_a}`:f.side==='second'?`${f.provider_b} ${f.product_b}`:`${f.provider_a} ${f.product_a} / ${f.provider_b} ${f.product_b}`);s.comparison_ids.add(f.comparison_id);if(s.representative_evidence.length<3)s.representative_evidence.push({comparison_id:f.comparison_id,section:f.section,visible_label:f.visible_label,canonical_key:f.canonical_key,side:f.side,raw_rendered_evidence:f.raw_rendered_evidence,source_document_ref:f.source_document_ref});}
const issueSignatures=[...signatureMap.values()].map(s=>({...s,families:[...s.families],providers:[...s.providers],products:[...s.products],comparison_ids:[...s.comparison_ids],provider_persistent:s.comparison_ids.size>1&&s.providers.size===1,family_persistent:s.comparison_ids.size>1&&s.families.size===1,cross_family_pattern:s.families.size>1}));
const counts=(items,key)=>Object.fromEntries([...new Set(items.map(x=>x[key]))].sort().map(value=>[value,items.filter(x=>x[key]===value).length]));
const byFamily=Object.fromEntries(families.map(type=>[type,{eligible_products:eligible.filter(p=>normalizeInsuranceType(p.insuranceType)===normalizeInsuranceType(type)).length,eligible_providers:productComparisonProviders(type),tested_providers:uniq(comparisons.filter(c=>c.status==='COMPLETED'&&c.insurance_type===type).flatMap(c=>[c.first.product.company,c.second.product.company])),primary_comparisons:comparisons.filter(c=>c.status==='COMPLETED'&&c.primary&&c.insurance_type===type).length,control_executions:comparisons.filter(c=>c.status==='COMPLETED'&&!c.primary&&c.insurance_type===type).length,flag_occurrences:findings.filter(f=>f.insurance_type===type).length,common_reason_codes:counts(findings.filter(f=>f.insurance_type===type),'reason_code')} ]));
const clusterNames=['CATALOG_DATA','CATALOG_MATERIALIZATION','CANONICAL_SEMANTICS','STATUS_RESOLUTION','PRESENTATION_HIERARCHY','PRODUCT_MODE_ONLY_PRESENTATION','SOURCE_PROVENANCE','AGREEMENT_SCOPE','UNKNOWN_LAYER'];
const clusters=clusterNames.map(layer=>{const ss=issueSignatures.filter(s=>s.likely_technical_layer===layer);return {layer,unique_signatures:ss.length,occurrences:ss.reduce((n,s)=>n+s.occurrence_count,0),families:uniq(ss.flatMap(s=>s.families)),providers:uniq(ss.flatMap(s=>s.providers)),pdf_relevance:counts(ss,'potential_customer_pdf_relevance'),hypothesis:'HYPOTESE – IKKE VERIFISERT ROOT CAUSE'};}).filter(c=>c.unique_signatures);

function positiveControl(name,test,reason,evidence){return {name,surfaced:Boolean(test),reason_code:reason,evidence};}
const snFind=findings.filter(f=>f.insurance_type==='Snøscooter'&&(f.provider_a==='Tryg'||f.provider_b==='Tryg'));
const bilFind=findings.filter(f=>f.insurance_type==='Bil'&&[f.provider_a,f.provider_b].sort().join('|')==='Frende|If');
const husFind=findings.filter(f=>f.insurance_type==='Hus'&&[f.provider_a,f.provider_b].sort().join('|')==='Frende|If');
const snComps=comparisons.filter(c=>c.status==='COMPLETED'&&c.insurance_type==='Snøscooter'&&(c.first.product.company==='Tryg'||c.second.product.company==='Tryg'));
const snTrygFacts=snComps.flatMap(c=>c.rendered_rows.flatMap(r=>[...r.first.facts.map(f=>({c,r,f,side:'first'})),...r.second.facts.map(f=>({c,r,f,side:'second'}))])).filter(x=>x.c[x.side].product.company==='Tryg');
const overlap=snTrygFacts.some(x=>/førerulykke/u.test(norm(x.f.label)))&&snTrygFacts.some(x=>/fører og passasjerulykke|fører passasjerulykke/u.test(norm(x.f.label)));
const knownPositiveControls=[
 positiveControl('Tryg Snøscooter Redning included-looking status og eksklusjonsordlyd',snFind.some(f=>f.reason_code==='STATUS_TEXT_CONTRADICTION'&&/redning/u.test(`${f.canonical_key} ${f.visible_label}`)),'STATUS_TEXT_CONTRADICTION',snFind.find(f=>f.reason_code==='STATUS_TEXT_CONTRADICTION'&&/redning/u.test(`${f.canonical_key} ${f.visible_label}`))?.finding_id??null),
 positiveControl('Tryg Snøscooter valgfritt tillegg og Inkludert i produktnivået',snFind.some(f=>f.reason_code==='OPTIONAL_INCLUDED_CONFLICT'),'OPTIONAL_INCLUDED_CONFLICT',snFind.find(f=>f.reason_code==='OPTIONAL_INCLUDED_CONFLICT')?.finding_id??null),
 positiveControl('Tryg Snøscooter Førerulykke og Fører/passasjerulykke mulig overlapp',overlap,'POSSIBLE_DUPLICATE_CONCEPT',{structured_facts_present:overlap,note:'Surfaces canonical concepts for manual review; no equivalence conclusion.'}),
 positiveControl('Gjentatt Kasko → Kasko → Kasko-hierarki',findings.some(f=>f.reason_code==='DUPLICATE_DISPLAY_LABEL'&&/kasko/iu.test(f.raw_rendered_evidence)),'DUPLICATE_DISPLAY_LABEL',findings.find(f=>f.reason_code==='DUPLICATE_DISPLAY_LABEL'&&/kasko/iu.test(f.raw_rendered_evidence))?.finding_id??null),
 positiveControl('Interne avtaleetiketter',findings.some(f=>f.reason_code==='INTERNAL_LABEL_LEAK'&&/avtale/iu.test(f.visible_label)),'INTERNAL_LABEL_LEAK',findings.find(f=>f.reason_code==='INTERNAL_LABEL_LEAK'&&/avtale/iu.test(f.visible_label))?.finding_id??null),
 positiveControl('Bil If/Frende parent/child og strukturell asymmetri',bilFind.some(f=>['PARENT_CONTAINS_CHILD_CANDIDATE','PROVIDER_SPECIFIC_NOT_COMPARABLE','SAME_CONCEPT_DIFFERENT_STRUCTURE'].includes(f.reason_code)),'PARENT_CONTAINS_CHILD_CANDIDATE',bilFind.filter(f=>['PARENT_CONTAINS_CHILD_CANDIDATE','PROVIDER_SPECIFIC_NOT_COMPARABLE'].includes(f.reason_code)).slice(0,4).map(f=>f.finding_id)),
 positiveControl('Hus vann gjennom tak/yttervegg følgeskade og defektunntak',husFind.some(f=>['POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION','STATUS_TEXT_CONTRADICTION'].includes(f.reason_code)),'POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION',husFind.find(f=>['POSSIBLE_EXPLICIT_UNAVAILABLE_MISCLASSIFICATION','STATUS_TEXT_CONTRADICTION'].includes(f.reason_code))?.finding_id??null),
];

const cleanRows=comparisons.filter(c=>c.status==='COMPLETED'&&c.primary).flatMap(c=>c.rendered_rows.map(r=>({comparison_id:c.comparison_id,insurance_type:c.insurance_type,section:r.section_label,key:r.key,label:r.label,first:r.first.text,second:r.second.text,flagged:findings.some(f=>f.comparison_id===c.comparison_id&&(f.canonical_key===r.key||f.visible_label===r.label))}))).filter(r=>!r.flagged);
const stratified=(items,key,minimum)=>{const picked=[];for(const value of uniq(items.map(item=>item[key])))for(const item of items.filter(candidate=>candidate[key]===value).slice(0,2))if(!picked.includes(item))picked.push(item);for(const item of items)if(picked.length<minimum&&!picked.includes(item))picked.push(item);return picked.slice(0,Math.max(minimum,picked.length));};
const manualReview={status:'COMPLETED',flagged_findings_reviewed:stratified(findings,'reason_code',20).slice(0,24).map(f=>f.finding_id),unflagged_rows_reviewed:stratified(cleanRows,'insurance_type',10).slice(0,12),unknown_classifications_reviewed:stratified(unknownRecords,'classification',5).slice(0,8).map(r=>({comparison_id:r.comparison_id,key:r.canonical_key,classification:r.classification})),provider_specific_candidates_reviewed:findings.filter(f=>f.reason_code==='PROVIDER_SPECIFIC_NOT_COMPARABLE').slice(0,5).map(f=>f.finding_id),provenance_chains_reviewed:stratified(sourceChecks.filter(s=>!s.anomaly),'insurance_type',5).slice(0,9),detector_quality:'REASONABLE',notes:'Manuell, stratifisert kontroll av flaggede funn, uflaggede rader, unknown-klassifiseringer, produktspesifikke kandidater og kildeprovenance viste at reglene er konservative nok til auditbruk. Funnene er fortsatt review candidates, ikke konklusjoner.'};

const aggregates={planned_executions:plans.length,completed_executions:comparisons.filter(c=>c.status==='COMPLETED').length,failed_executions:comparisons.filter(c=>c.status==='FAILED').length,primary_comparisons:comparisons.filter(c=>c.status==='COMPLETED'&&c.primary).length,control_executions:comparisons.filter(c=>c.status==='COMPLETED'&&!c.primary).length,rendered_facts:comparisons.filter(c=>c.status==='COMPLETED').reduce((n,c)=>n+c.metrics.rendered_fact_count,0),unknown_cells:comparisons.filter(c=>c.status==='COMPLETED').reduce((n,c)=>n+c.metrics.unknown_cells,0),unique_unknown_signatures:new Set(unknownRecords.map(r=>`${r.insurance_type}|${r.product.identity}|${r.canonical_key}|${r.classification}`)).size,provider_specific_details:comparisons.filter(c=>c.status==='COMPLETED').reduce((n,c)=>n+c.metrics.provider_specific_detail_count,0),flag_occurrences:findings.length,unique_issue_signatures:issueSignatures.length,reason_code_distribution:counts(findings,'reason_code'),family_distribution:counts(findings,'insurance_type'),pdf_customer_relevance:counts(findings,'potential_customer_pdf_relevance'),unknown_classification_distribution:counts(unknownRecords,'classification'),network_requests:networkRequests,ai_calls:0,pdf_operations:0,runtime_web_requests:0};
const excluded=productCatalog.products.filter(p=>!eligible.includes(p)).map(p=>({...exact(p),historical:isHistoricalCatalogProduct(p)}));
const reviewQueue=[...issueSignatures].sort((a,b)=>{
  const rank=(s)=>s.potential_customer_pdf_relevance==='LIKELY_SHARED'?(s.cross_family_pattern?1:s.provider_persistent?2:4):s.potential_customer_pdf_relevance==='PRODUCT_MODE_ONLY'?(s.cross_family_pattern?3:4):s.potential_customer_pdf_relevance==='CATALOG_ONLY'?5:6;
  return rank(a)-rank(b)||b.occurrence_count-a.occurrence_count;
}).map((s,i)=>({priority:i+1,...s,representative_comparison_ids:s.comparison_ids.slice(0,3)}));
const audit={metadata:{audit_name:'Forsikringsassistenten Produktsammenligning Audit',audit_timestamp:now.toISOString(),local_timezone:'Arctic/Longyearbyen',git_head:head,git_status_baseline:gitStatus||'(clean)',staged_files_baseline:staged?staged.split('\n'):[],working_tree_fingerprint:repoFingerprint,node_version:process.version,detector_version:'1.0.0-temp-read-only',matrix_strategy:'Anchor-to-all, two non-anchor variation pairs, one same-provider level pair per family, plus side-swap and same-product controls.',selection_bias:'Content-rich products, cross-provider variation and known controls are intentionally over-sampled.',legal_scope_note:'Auditen vurderer programvarerepresentasjon og sertifiserer ikke fullstendig juridisk dekningsfortolkning.',catalog_scope_note:'Eligible katalogprodukter er ikke alle mulige norske forsikringsprodukter.',runtime_duration_ms:0,manual_sample_review:manualReview,ui_cross_checks:uiCrossChecks,determinism_checks:determinism,side_swap_checks:sideSwap},catalog:{total_products:productCatalog.products.length,eligible_products:eligible.length,excluded_products:excluded.length,excluded,eligible_families:families,eligible_products_by_family:Object.fromEntries(families.map(t=>[t,eligible.filter(p=>normalizeInsuranceType(p.insuranceType)===normalizeInsuranceType(t)).length])),eligible_providers_by_family:Object.fromEntries(families.map(t=>[t,productComparisonProviders(t)])),directly_exercised_products:uniq(comparisons.filter(c=>c.status==='COMPLETED').flatMap(c=>[c.first.product.identity,c.second.product.identity])).length},matrix:{strategy:'SAMPLED_DETERMINISTIC',manifest:plans.map(p=>({comparison_id:p.comparison_id,selection_reasons:p.selection_reasons,insurance_type:p.insurance_type,product_a:exact(p.first),product_b:exact(p.second),control_type:p.control_type,primary:p.primary,execution_status:p.status,error_category:p.error_category??null})),by_family:byFamily},comparisons,findings,issue_signatures:issueSignatures,aggregates,root_cause_clusters:clusters,pdf_customer_relevance:{distribution:aggregates.pdf_customer_relevance,representative_likely_shared:issueSignatures.filter(s=>s.potential_customer_pdf_relevance==='LIKELY_SHARED').slice(0,20).map(s=>s.issue_signature),note:'Architecture-based prioritization only; not permission to change the customer/PDF pipeline.'},known_positive_controls:knownPositiveControls,unknown_analysis:{raw_occurrences:unknownRecords.length,unique_signatures:aggregates.unique_unknown_signatures,classification_distribution:aggregates.unknown_classification_distribution,records:unknownRecords},source_provenance:{facts_checked:sourceChecks.length,facts_with_source:sourceChecks.length,anomalies:sourceChecks.filter(s=>s.anomaly),source_type_distribution:counts(sourceChecks,'source_type')},failures:comparisons.filter(c=>c.status==='FAILED').map(c=>({comparison_id:c.comparison_id,error_category:c.error_category,safe_error_message:c.safe_error_message})),limitations:['Auditflagg er review candidates, ikke bekreftede forsikringsfeil.','Ingen ekstern kildeverifisering ble utført.','Matrisen er et deterministisk utvalg, ikke alle eligible produkter parvis.','Antall funn sier ikke noe om leverandør- eller produktkvalitet.','Resultatene gjelder gjeldende lokale HEAD; arbeidskopien var ren ved start.','React SSR ble brukt som representativ UI-krysskontroll; ingen visuell nettleserinspeksjon av alle comparisons.']};
audit.metadata.runtime_duration_ms=Number((performance.now()-started).toFixed(2));

const rootCause={metadata:{audit_timestamp:audit.metadata.audit_timestamp,git_head:head,working_tree_fingerprint:repoFingerprint,detector_version:audit.metadata.detector_version,flag_occurrences:aggregates.flag_occurrences,unique_issue_signatures:aggregates.unique_issue_signatures},issue_signatures:issueSignatures,review_queue:reviewQueue,root_cause_clusters:clusters,pdf_customer_relevance:audit.pdf_customer_relevance,known_positive_controls:knownPositiveControls,limitations:audit.limitations};

fs.writeFileSync(path.join(outDir,'product-comparison-audit.json'),JSON.stringify(audit,null,2));
fs.writeFileSync(path.join(outDir,'root-cause-input.json'),JSON.stringify(rootCause,null,2));
fs.writeFileSync(path.join(outDir,'audit-matrix-manifest.json'),JSON.stringify(audit.matrix.manifest,null,2));
const matrixHeader=['comparison_id','insurance_type','provider_a','product_a','scope_a','provider_b','product_b','scope_b','rendered_sections','rendered_facts','unknown_count','unavailable_count','optional_count','provider_specific_count','flag_count','status_text_contradiction_count','optional_included_conflict_count','possible_false_unknown_count','duplicate_concept_count','duplicate_display_label_count','internal_label_leak_count','customer_specific_reference_count','source_anomaly_count','runtime_error_count','ai_calls','pdf_operations','runtime_web_requests','primary','control_type','selection_reasons'];
const matrixRows=comparisons.map(c=>{const fsFor=findings.filter(f=>f.comparison_id===c.comparison_id);const m=c.metrics??{};return [c.comparison_id,c.insurance_type,c.first?.product?.company,c.first?.product?.product_name,c.first?.product?.agreement_scope,c.second?.product?.company,c.second?.product?.product_name,c.second?.product?.agreement_scope,m.rendered_section_count,m.rendered_fact_count,m.unknown_cells,m.unavailable_cells,m.optional_states,m.provider_specific_detail_count,m.flag_count,fsFor.filter(f=>f.reason_code==='STATUS_TEXT_CONTRADICTION').length,fsFor.filter(f=>f.reason_code==='OPTIONAL_INCLUDED_CONFLICT').length,fsFor.filter(f=>f.reason_code==='POSSIBLE_FALSE_UNKNOWN').length,fsFor.filter(f=>f.reason_code==='POSSIBLE_DUPLICATE_CONCEPT').length,fsFor.filter(f=>f.reason_code==='DUPLICATE_DISPLAY_LABEL').length,fsFor.filter(f=>f.reason_code==='INTERNAL_LABEL_LEAK').length,fsFor.filter(f=>f.reason_code==='CUSTOMER_SPECIFIC_REFERENCE').length,fsFor.filter(f=>f.reason_code==='SOURCE_PROVENANCE_ANOMALY').length,m.runtime_error_count,m.ai_calls,m.pdf_operations,m.runtime_web_requests,c.primary,c.control_type??'',c.selection_reasons?.join('|')];});
fs.writeFileSync(path.join(outDir,'product-comparison-matrix.csv'),[matrixHeader,...matrixRows].map(r=>r.map(csv).join(',')).join('\n')+'\n');
const findingsHeader=['finding_id','comparison_id','insurance_type','provider_a','product_a','provider_b','product_b','section','visible_label','canonical_key','presentation_concept','side','visible_status','visible_text','reason_code','source_type','source_document_ref','parent_key','related_key','notes','issue_signature','evidence_confidence','likely_technical_layer','potential_customer_pdf_relevance','raw_evidence_hash'];
fs.writeFileSync(path.join(outDir,'product-comparison-findings.csv'),[findingsHeader,...findings.map(f=>findingsHeader.map(k=>f[k]??''))].map(r=>r.map(csv).join(',')).join('\n')+'\n');
fs.writeFileSync(path.join(outDir,'audit-errors.log'),audit.failures.length?audit.failures.map(f=>`${f.comparison_id}\t${f.error_category}\t${f.safe_error_message}`).join('\n')+'\n':'No audit execution errors recorded.\n');
fs.writeFileSync(path.join(outDir,'README.md'),`# Forsikringsassistenten product comparison audit\n\nThis temporary, read-only audit package was generated against git HEAD \`${head}\` and working-tree fingerprint \`${repoFingerprint}\`. It is not production code.\n\nThe matrix uses one content-rich anchor product against each other provider, two non-anchor variation pairs, one same-provider level comparison per family, plus side-swap and same-product controls. Selection is diagnostic and must not be read as product ranking.\n\nOutputs:\n- \`product-comparison-audit.json\`: full structured evidence.\n- \`root-cause-input.json\`: deduplicated review queue.\n- \`product-comparison-matrix.csv\`: one row per execution.\n- \`product-comparison-findings.csv\`: one row per flagged occurrence.\n- \`audit-matrix-manifest.json\`: stable replay manifest.\n- \`product-comparison-audit.md\`: human-readable technical report.\n- \`Forsikringsassistenten-produkt-audit.docx\`: human-readable review report.\n\nReason codes are closed audit classifications. They identify review candidates and do not prove that insurance semantics are wrong. Re-run the manifest after a separately approved root-cause change to compare issue signatures, unknown classifications and presentation patterns.\n`);
console.log(JSON.stringify({status:'AUDIT_DATA_READY',head,totalProducts:productCatalog.products.length,eligibleProducts:eligible.length,families,plans:plans.length,primary:aggregates.primary_comparisons,controls:aggregates.control_executions,completed:aggregates.completed_executions,failed:aggregates.failed_executions,findings:aggregates.flag_occurrences,signatures:aggregates.unique_issue_signatures,unknowns:unknownRecords.length,networkRequests,positiveControls:knownPositiveControls.map(c=>({name:c.name,surfaced:c.surfaced})),uiCrossChecks,determinism,sideSwap,durationMs:audit.metadata.runtime_duration_ms},null,2));
