import fs from 'node:fs';
import {normalizeInsuranceType, relatedCoveragesForInsuranceType} from '/Users/morten/Documents/forsikringsapp/lib/insurance-normalization.ts';
import {boatPetFactKeysForType} from '/Users/morten/Documents/forsikringsapp/lib/boat-pet-registry.ts';
import {mcBobilFactKeysForType} from '/Users/morten/Documents/forsikringsapp/lib/mc-bobil-registry.ts';
import {vehicleObjectFactKeys} from '/Users/morten/Documents/forsikringsapp/lib/vehicle-object-registry.ts';
const types=['Bil','Hus','Innbo','Reise','Snøscooter','Campingvogn','Tilhenger','MC','Bobil','Båt','Hund','Katt'];
const result={};
for(const label of types){const type=normalizeInsuranceType(label);const related=relatedCoveragesForInsuranceType(type);result[label]={type,related,keys:[...new Set([...related.flatMap(c=>[c.parentKey,...c.details.map(d=>d.key)]),...boatPetFactKeysForType(type),...mcBobilFactKeysForType(type),...vehicleObjectFactKeys.filter(k=>k.startsWith(type.replace('ø','o')+'.'))])]};}
fs.writeFileSync('/tmp/source-catalog-remediation-triage/existing-type-registries.json',JSON.stringify(result,null,2));
console.log('Read-only registry inspection',Object.fromEntries(Object.entries(result).map(([k,v])=>[k,v.keys.length])));
