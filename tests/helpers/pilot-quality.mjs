import {parseExtractionResponse,sanitizeAnalysisDocumentForClient} from '../../lib/analysis-output.ts';
import {planExtractionBatches} from '../../lib/analysis-batching.ts';
import {enrichBatch,mergeBatchResults} from '../../lib/analysis-merge.ts';
import {createAnalysisTelemetry} from '../../lib/analysis-telemetry.ts';
export const term=(name,value,canonicalKey=null)=>({name,value,canonicalKey,documentIndices:[1]});
export const car=(product='Kasko',anchor='førstegangsregistrering',formatted=false)=>({
 type:'Bil',company:'Gjensidige',productName:product,canonicalProductName:product,annualPremium:null,deductible:null,coverageSummary:null,
 documentRole:'individual_agreement',agreementPeriod:null,documentIndices:[1],objectIdentifiers:[{type:'registration',value:product==='Kasko'?'ZZ10001':'ZZ10002',documentIndices:[1]}],addOns:[],
 importantTerms:[term(`Totalskadegaranti – ${product}`,`Gjelder inntil ${product==='Kasko'?'1 år':'3 år'} fra ${anchor} og inntil ${product==='Kasko'?'15 000':'60 000'} km.`),
 term('Årlig kjørelengde','20 000 km per forsikringsår','kjoretoy.kjorelengde'),term('Kilometerstand','164 000 km'),
 term('Leiebil',product==='Kasko'?'Ikke valgt':'Valgt'),term('Veihjelp','Valgt'),
 term('Bilnøkkel','Tapt, stjålet eller skadet bilnøkkel; forsikringssum 7 500 kr; egenandel 1 500 kr; maks ett skadetilfelle'),
 term('Bilnøkkel – forsikringssum','7 500 kr'),term('Bilnøkkel – egenandel','1 500 kr'),term('Bilnøkkel – skadetilfeller','maks ett skadetilfelle'),
 ...(product==='Pluss'?[term('Maskinskade','Til første hovedforfall etter 10 år eller 200 000 km')]:[]),
 ...['premie.ekskl_tfa','premie.tfa','premie.total'].map((key,i)=>term(['Forsikringspris','Trafikkforsikringsavgift','Totalpris'][i],`${(product==='Kasko'?[12457,2329,14786]:[9518,3270,12788])[i]} kr`,key)),
 ...(formatted?[term('Totalpris',product==='Kasko'?'14 786 kr':'12 788 kr','premie.total')]:[])]
});
export const parsed=records=>parseExtractionResponse({output_text:JSON.stringify({company:'Gjensidige',totalAnnualPremium:null,totalAnnualPremiumScope:'partial_or_unclear',insurances:records})});
export function batches(records,side){return planExtractionBatches(records.map((_,documentIndex)=>({side,documentIndex,text:'Synthetic '.repeat(9000),pages:1}))).map(batch=>({batch,agreement:enrichBatch(parsed(batch.documents.map(d=>records[d.documentIndex])),batch,createAnalysisTelemetry('00000000-0000-0000-0000-000000000000'))}));}
export function pipeline(records,side='existing',reverseCompletion=false){const results=batches(records,side);return sanitizeAnalysisDocumentForClient(mergeBatchResults(reverseCompletion?results.toReversed():results,side,false));}
export const facts=(r,key)=>r.importantTerms.filter(t=>t.key===key);
