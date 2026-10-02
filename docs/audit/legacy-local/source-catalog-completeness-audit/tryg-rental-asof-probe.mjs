import fs from 'node:fs';
import {productCatalog,availableAddOns,catalogProductIdentity} from '/Users/morten/Documents/forsikringsapp/lib/product-catalog.ts';
const out=productCatalog.products.filter(p=>p.providerId==='tryg'&&p.insuranceType==='Bil').map(p=>({product:catalogProductIdentity(p),snapshotDateAvailable:availableAddOns(p,new Date('2026-09-29T10:52:14.812Z')).some(a=>a.id==='leiebil'),currentDateAvailable:availableAddOns(p,new Date('2026-10-01T12:00:00Z')).some(a=>a.id==='leiebil')}));
fs.writeFileSync('/tmp/source-catalog-completeness-audit/tryg-rental-asof-probe.json',JSON.stringify(out,null,2));console.log(JSON.stringify(out));
