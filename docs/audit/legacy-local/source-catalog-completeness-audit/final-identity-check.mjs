import fs from 'node:fs';import crypto from 'node:crypto';
import {productCatalog} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
const O='/tmp/source-catalog-completeness-audit';const expected=fs.readFileSync(O+'/catalog-fingerprint.txt','utf8').trim();const actual=crypto.createHash('sha256').update(JSON.stringify(productCatalog)).digest('hex');
if(actual!==expected)throw Error('CATALOG_FINGERPRINT_CHANGED');
console.log('CATALOG_FINGERPRINT_UNCHANGED',actual);
