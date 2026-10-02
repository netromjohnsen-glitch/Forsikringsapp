from continue_audit import *
A=Audit();I=load('storebrand-pet-independent-inventory.json')
# Corrections after exact-page and visual table validation; no source or catalog change.
for r in I['rules']:
 n=int(r['inventory_id'].split('-')[-1])
 if n==13:r.update(page=4,section='B.4.1 / 1 – Unntak')
 if n==18:r['value']=r['value'].replace('foreskrevet og utført','rekvirert eller utført')
 if n in [31,32]:r['page']=7
 if n in [38,39,40]:r['page']=8
 if n in [41,42]:r['section']='B.5.1 / 2 – Nedsatt bruksverdi'
 if n==43:r['section']='E – Bruksverdi'
 if n==34:r.update(kind='RULE',value='Hund: gane/luftveier unntatt for Boston terrier, engelsk/fransk bulldog, Griffon, mops, pekingeser, shih-tzu. Entropion/ektropion: basset, blodhund, boxer, bullmastiff, engelsk/fransk bulldog, mops, grand danois, napoletansk mastiff, shar pei. Hud: basset, blodhund, engelsk/fransk bulldog, bullmastiff, napoletansk mastiff, shar pei. Keisersnitt står separat. PDF side 8 visuelt kontrollert.')
I['phase']='CATALOG_MATCH_COMPLETE';I['general_conditions']={'source':'catalog/sources/storebrand/vilkar-generelle.pdf','sha256':'4873064a8597953be3832870734c41c15e5abe0cc9cfd77c01979878990cd754','version':'gener07/2026-09-01','read':'physical pages 1–11','scope':'General contract hierarchy expressly subordinate to specific pet terms; no general disease exclusion used to erase specific pet illness cover. New general-version applicability for an individual old contract remains customer-specific.'}
I['visual_checks']=['storebrand-pet-page8.png'];save('storebrand-pet-independent-inventory.json',I)
A.root('SCRC-007','Storebrand Hund/Katt er håndskrevet som veterinærbasens tre facts pluss opphørsalder og et kort dødsfallssett. Dyr04s detaljerte veterinær-, forsvinnings- og brukstapsregler er ikke ført inn. Kombinasjonsproduktet gjentar samme begrensede rader; runtime mister dem ikke.','lib/boat-pet-catalog.ts:117–121,132–139; lib/boat-pet-catalog-builder.ts:38–69; exact runtime snapshot; Dyr04 B.3–B.5 og E.',['Hund','Katt'],['storebrand'],'RB-06',complexity='SMALL_CODE')
K={6:['dyr.veterinar.egenandel.fast'],8:['dyr.veterinar.dekning'],9:['dyr.veterinar.sum.valgbar'],10:['dyr.medisin.dekning'],11:['dyr.tannskade.dekning'],12:['dyr.tannsykdom.dekning'],13:['dyr.tannsykdom.dekning'],16:['dyr.allergi.dekning'],17:['dyr.allergi.grense'],18:['dyr.rehabilitering.grense'],19:['dyr.diagnostikk.grense'],23:['dyr.karenstid.sykdom'],35:['dyr.liv.dekning'],36:['dyr.liv.forsvinning','dyr.liv.tyveri'],37:['dyr.liv.forsvinning','dyr.liv.tyveri'],38:['dyr.liv.reduksjon.start','dyr.liv.reduksjon.sats'],39:['dyr.liv.opphor'],40:['dyr.liv.sum.valgbar'],41:['hund.bruksverdi.grense','hund.bruksverdi.dekning'],42:['hund.bruksverdi.alder','hund.bruksverdi.grense'],43:['hund.bruksverdi.dekning'],45:['dyr.veterinaralder.opphor'],46:['dyr.veterinar.sum.valgbar']}
present={1,6,8,35,38,39,45};custom={9,40,46};coarse={41,42,43}
paths=['catalog/sources/boat-pet/'+s for s in ['storebrand-pet-terms.pdf','storebrand-pet-ipid.pdf','storebrand-pet-product.html']]+['catalog/sources/storebrand/vilkar-generelle.pdf']
products=[p for p in A.c['products'] if p['providerId']=='storebrand' and p['insuranceType'] in ['Hund','Katt']]
locations={
 'dyr.veterinar.dekning':{'pdf_page':4,'section':'B.4.1'},
 'dyr.veterinar.sum.valgbar':{'pdf_page':3,'section':'B.2; B.4.1 page4'},
 'dyr.veterinar.egenandel.fast':{'pdf_page':3,'section':'B.3'},
 'dyr.veterinaralder.opphor':{'pdf_page':3,'section':'B.1'},
 'dyr.liv.dekning':{'pdf_page':8,'section':'B.5.1'},
 'dyr.liv.sum.valgbar':{'pdf_page':3,'section':'B.2; B.5.1 pages8–9'},
 'dyr.liv.reduksjon.start':{'pdf_page':8,'section':'B.5.1 / 1'},
 'dyr.liv.reduksjon.sats':{'pdf_page':8,'section':'B.5.1 / 1'},
 'dyr.liv.opphor':{'pdf_page':3,'section':'B.1 and page8 B.5.1 / 1'},
 'hund.bruksverdi.dekning':{'pdf_page':9,'section':'B.5.1 / 2'},
 'hund.bruksverdi.grense':{'pdf_page':9,'section':'B.5.1 / 2'},
}
for v in locations.values():v.update(artifact=paths[0],location_correction=True,note='Catalog page1/2 is neither correct physical page nor correct printed page for these claims; semantic content itself supported at stated location.')
for p in products:
 pid=p['productId'];species=p['insuranceType'].lower();vet='veterin-r' in pid;life='d-dsfall' in pid
 for r in I['rules']:
  n=int(r['inventory_id'].split('-')[-1]);scope=r['component_scope']
  if scope=='vet' and not vet or scope=='life' and not life or r['species'] not in ['both',species]:continue
  classification=PRESENT if n in present else CUSTOM if n in custom else COARSE if n in coarse else MISSING
  keys=K.get(n,[]);priority='' if n in present|custom else r['priority_if_missing']
  reason='Kildeverdien finnes korrekt i eksakt katalogprodukt.' if n in present else 'Kundens faktiske sum forblir bevisstyrt. Produktets tilgjengelige beløpsvalg er kildeinformasjon, ikke dokumentasjon av kundens valg.' if n in custom else 'Katalogens eksisterende bruksverdiforelder/beløpstak mangler denne avgjørende avgrensningen; brukstap er ikke lik avls-/utstillingstap.' if n in coarse else f"Eksakt produkt har ingen semantisk representasjon av {r['subject'].lower()} / {r['dimension']}; alle {len(p['facts'])} basefacts og materialiserte facts kontrollert. Det finnes ingen valgfrie komponenter som skjuler regelen."
  A.fact(pid,r['subject'],r['dimension'],r['value'],'catalog/sources/boat-pet/'+r['source'],f"PDF side {r['page']}, {r['section']}" if r['source'].endswith('.pdf') else r['section'],classification,keys,priority,reason,'SCRC-007',inventory_id=r['inventory_id'])
 if life and not vet:
  A.fact(pid,'FirstVet','anvendelse på dødsfall alene','Produktsiden beskriver tjenesten generelt; IPID nevner den under veterinær. Ikke sikkert dokumentert for dødsfallsprodukt alene.',paths[1],'PDF side 1, veterinærdelen', 'SOURCE_AMBIGUOUS',reason='Ingen positiv/negativ dekning utledet fra uklar medlemskapstilknytning.')
 # Generic administration is consciously classified, not inflated into missing coverage.
 A.fact(pid,'Avtaleadministrasjon','generelle bestemmelser','Bevis foran vilkår; melding/obduksjon/avkortning/fornyelse, sanksjoner, klage og lovvalg gjennomlest. Ikke selvstendige rådgiversammenligningsrader.',paths[0],'PDF side 1 og 10–11, A/C/D/E; gener07 side 1–11',ADMIN,reason='SOURCE_ONLY_ACCEPTABLE; general07 version and hierarchy recorded separately.')
 A.reverse(pid,locations)
 A.product_review(pid,paths,True,'Dyr04 alle 11 sider + begge IPID-sider + full lagret produktside og gener07 alle 11 sider lest. 48 uavhengige kilderegler ble lagret før katalogverdier ble inspisert; rasebegrensninger visuelt kontrollert. Alle eksakte katalogclaims reverskontrollert. Veterinær/liv, hund/katt og kundevalg holdes atskilt. Alle mangler og usikker FirstVet-tilknytning på dødsfall alene registrert. Gener07 er nåværende lokalt arkiv, ikke bevis for gamle individuelle avtaler. Katalogens sidehenvisninger må korrigeres, men eksisterende 40 verdier har kildegrunnlag.')
A.a.setdefault('provenance_findings',[]).append({'id':'PROV-001','root_layer':'CATALOG_AUTHORING_SOURCE_LOCATOR','provider':'storebrand','families':['Hund','Katt'],'products':[p['identity'] for p in products],'affected_claim_occurrences':40,'catalog_state':'All claims point to PDF page1 or2; correct physical pages are3/4/8/9. Printed numbering does not explain the death references either.','semantic_support':'All 40 values supported elsewhere in same applicable document; NOT unsupported insurance claims.','evidence':locations,'priority':'P2','remediation_type':'CATALOG_DATA_ONLY','complexity':'DATA_ONLY','counted_in_gap_totals':False})
A.checkpoint('Storebrand Hund/Katt: six complete source-first product reviews','Innbo','frende','frende-innbo')
