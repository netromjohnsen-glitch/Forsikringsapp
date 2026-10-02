import {createRequire} from 'node:module';import fs from 'node:fs';
const require=createRequire('/Users/morten/Documents/forsikringsapp/package.json');const {PDFParse}=require('pdf-parse');
const p=new PDFParse({data:fs.readFileSync('/Users/morten/Documents/forsikringsapp/catalog/sources/if/innbo/If_Innboforsikring_IBO2-1.pdf')});
const r=await p.getScreenshot({partial:[13],desiredWidth:1100});fs.writeFileSync('/tmp/source-catalog-completeness-audit/if-innbo-page13.png',r.pages[0].data);await p.destroy();
