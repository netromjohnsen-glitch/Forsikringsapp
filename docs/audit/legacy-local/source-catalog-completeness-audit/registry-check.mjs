import fs from 'node:fs';
import {normalizeInsuranceType,relatedCoveragesForInsuranceType} from '/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts';
import {boatPetFactKeysForType} from '/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts';
const dir='/tmp/source-catalog-completeness-audit';const facts=JSON.parse(fs.readFileSync(dir+'/manual-source-facts.json','utf8'));
const result={};
for(const f of facts){const type=normalizeInsuranceType(f.insurance_type);const related=relatedCoveragesForInsuranceType(type);const keys=new Set([...related.flatMap(c=>[c.parentKey,...c.details.map(d=>d.key)]),...boatPetFactKeysForType(type)]);for(const key of f.proposed_keys)result[`${f.insurance_type}|${key}`]=keys.has(key);}
fs.writeFileSync(dir+'/registry-check.json',JSON.stringify(result,null,2));
console.log('Registered proposed-key/type pairs:',Object.values(result).filter(Boolean).length,'of',Object.keys(result).length);
